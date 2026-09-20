# How the 3D token graph clusters, and how the sort filter changes it

Traced from:
- `src/components/Graph.jsx` — force simulation setup + `ForceGraph3D` render
- `src/model/glassDataClass.js` — node/link construction
- `src/components/SelectSort.jsx` — sort dropdown UI
- `src/context/mainContext.js` — sort state

Engine: `react-force-graph-3d` → `3d-force-graph` → `d3-force-3d` (accessed only via the `graphRef.current.d3Force(...)` kapsule API — no direct `d3-force` import anywhere).

**Headline finding:** there is only one clustering implementation. Every sort mode (From, To, Creator, Media, Event, Location, Year) runs through the *exact same* force code. What differs between "From" and "Media" is not the physics — it's (a) which metadata attribute gets copied into the generic `node.group` field, and (b) one extra set of links that only exist when the sort is `"From"`.

---

## 1. The data model: where `group` comes from

`glassDataClass.js:16-30`, inside `constructor(tokenArr, attribute, filtersArr)`:

```js
this.nodes = this.filteredTokens?.map((token) => {
  const resolvedImage =
    token.token.imageSmall || token.token.image || token.token.imageLarge;
  return {
    id: token.token.tokenId,
    name: token.token.name,
    image: resolvedImage,
    group:
      attribute !== 'none'
        ? token.token.attributes.find((att) => att.key === attribute)?.value
        : 'none',
    from: token.token.attributes.find((att) => att.key === 'From')?.value,
    to: token.token.attributes.find((att) => att.key === 'To')?.value,
  };
});
```

The constructor's second argument is named `attribute` internally, but it's literally the current sort value — called as `new GraphDataClass(allTokens, sort, filter)` at `Graph.jsx:86` and `:89`.

- When `sort === "Media"`, every node's `group` = that token's `Media` attribute value.
- When `sort === "From"`, every node's `group` = that token's `From` attribute value.

Same code, different attribute key looked up. `node.from` / `node.to` are populated **unconditionally** regardless of sort, but only get used when `attribute === 'From'` (section 2).

Everything downstream — force strength, cluster position, node color — only ever reads `node.group`. It has no idea which sort produced that value.

---

## 2. Two kinds of links

### Grouping links — built for every sort mode except `"none"`

`glassDataClass.js:36-48`:

```js
this.nodes.forEach((node, i, allNodes) => {
  allNodes.forEach((n) => {
    if (n.group === node.group && n.id !== node.id) {
      this.links.push({
        source: node.id,
        target: n.id,
        isDestination: false,
      });
    }
  });
});
```

Brute-force O(n²): every node links to every *other* node sharing its exact `group` value. A group of size *k* becomes a complete graph, roughly *k×(k−1)* link entries. This link density — not any positional rule — is what pulls same-group nodes together.

### Destination links — only when `sort === "From"`

`glassDataClass.js:49-62`:

```js
if (attribute === 'From') {
  this.nodes.forEach((node, i, allNodes) => {
    allNodes
      .filter((n) => n.from === node.to)
      .forEach((targetNode) => {
        const link = {
          source: node.id,
          target: targetNode.id,
          isDestination: true,
        };
        this.links.push(link);
      });
  });
}
```

For every node, finds any other node whose `from` matches *this* node's `to`, and adds a directed `isDestination: true` link — chaining fragments into a narrative sequence (A's destination is B's origin). This block runs **only** in From mode.

---

## 3. The force pipeline

`Graph.jsx:104-190`, a `useEffect` keyed on `[sort, graphData]`. This is the only place forces are configured. `forceManyBody`, `forceCenter`, `forceCollide` are never touched anywhere in the codebase — 3d-force-graph's defaults for those stand. Only two force keys are ever set: the built-in `'link'` force, and a fully custom force registered under the key `'cluster'`.

Sequence on every run:
1. `graph.d3Force('cluster', null)` — clear any cluster force from the previous sort.
2. If `sort === 'none'`: flat link strength, no clustering (section 5).
3. Build `groupSizeMap` — count of nodes per group value.
4. Re-weight the link force by group size.
5. Compute one centroid per unique group on a Fibonacci sphere.
6. Register the custom `'cluster'` force pulling nodes toward their group's centroid.
7. Reheat the simulation (deferred) so the new forces actually apply.

### Link-strength normalization — `Graph.jsx:125-143`

```js
// Nodes in a large group create N*(N-1) links vs a small group's few links.
// Dividing by (groupSize - 1) equalises total pull across all groups.
const groupSizeMap = {};
graphData.nodes.forEach((node) => {
  if (node.group) {
    groupSizeMap[node.group] = (groupSizeMap[node.group] || 0) + 1;
  }
});

const linkForce = graph.d3Force('link');
if (linkForce) {
  linkForce.strength((link) => {
    if (link.isDestination) return 0.0001;
    const grp = link.source?.group;
    const size = grp && groupSizeMap[grp] ? groupSizeMap[grp] : 1;
    return size > 1 ? 0.003 / (size - 1) : 0.003;
  });
}
```

Why: a 40-node group produces ~1,560 grouping links (40×39); a 3-node group produces 6. Without normalizing, the big group would crush into a tight ball from sheer cumulative pull while small groups stay loose. Dividing the base strength `0.003` by `(size − 1)` keeps the *total* pull a node feels from its groupmates roughly constant regardless of group size.

`isDestination` links are pinned to `0.0001` — effectively inert for positioning. They exist to drive the particle-flow visual (section 4), not to move nodes; if they carried real strength, From mode would pull every fragment toward its narrative successor's position and fight the group clustering.

### The Fibonacci-sphere cluster force — `Graph.jsx:145-189`

Link re-weighting alone gives loose clustering but no fixed "home" per group — clusters could drift through each other over time. So the code computes one fixed anchor point per unique group value, spread evenly over a sphere, and adds a soft spring pulling each node toward its group's anchor:

```js
const SPHERE_RADIUS = 300;
const SPRING_STRENGTH = 0.08;

const centroidMap = {};
groups.forEach((group, i) => {
  const phi = Math.acos(1 - (2 * i) / (N - 1));
  const theta = Math.PI * (1 + Math.sqrt(5)) * i;
  centroidMap[group] = {
    x: SPHERE_RADIUS * Math.sin(phi) * Math.cos(theta),
    y: SPHERE_RADIUS * Math.sin(phi) * Math.sin(theta),
    z: SPHERE_RADIUS * Math.cos(phi),
  };
});

// Custom force function — D3 custom forces are plain functions (alpha) => void
// that directly nudge node velocities. No external import needed.
const clusterForce = (alpha) => {
  graphData.nodes.forEach((node) => {
    const target = centroidMap[node.group];
    if (!target) return;
    node.vx = (node.vx || 0) + (target.x - (node.x || 0)) * SPRING_STRENGTH * alpha;
    node.vy = (node.vy || 0) + (target.y - (node.y || 0)) * SPRING_STRENGTH * alpha;
    node.vz = (node.vz || 0) + (target.z - (node.z || 0)) * SPRING_STRENGTH * alpha;
  });
};

graph.d3Force('cluster', clusterForce);
```

The `phi`/`theta` pair is the standard golden-angle Fibonacci-sphere formula: it spreads *N* points evenly over a sphere's surface (radius 300) with none clumping, for any *N*. Every frame, every node gets a velocity nudge toward its group's anchor, scaled by `0.08 × alpha` (`alpha` is d3-force's built-in cooling factor, decaying from 1 to 0 as the sim settles).

This is **not** `forceX`/`forceY`/`forceZ` from d3-force — it's a hand-written function matching d3-force's custom-force contract (any `(alpha) => void` that mutates velocities is valid), registered under the arbitrary key `'cluster'` via the kapsule API.

---

## 4. From vs. Media: the actual difference

Both run the identical pipeline above. The difference comes from exactly two places:

**`node.group` source data.** For Media, `group` = the token's `Media` value (e.g. "Video", "Photograph", "Audio") — typically low-cardinality, so few clusters, each potentially large, anchors far apart → a small number of large, tight, well-separated globes. For From, `group` = the token's `From` value (an origin/place) — typically higher-cardinality, smaller average group size → many smaller clusters.

**Extra links + their strength.** Media mode: only grouping links exist (`isDestination:false`), since `glassDataClass.js`'s `attribute === 'From'` block never fires. From mode: grouping links plus the near-inert (`0.0001` strength) destination links chaining narrative sequence across clusters.

**Visual-only difference**, `Graph.jsx:448-460`, gated on `sort === 'From'`:

```js
linkColor={(link) =>
  link?.isDestination && sort === 'From'
    ? 'rgba(160, 160, 255, 0.025)'
    : 'rgba(0,0,0,0)'
}
linkWidth={sort === 'From' ? 20 : 0}
linkDirectionalParticles={(link) =>
  link?.isDestination && sort === 'From' ? 2 : 0
}
linkDirectionalParticleWidth={1}
linkDirectionalParticleSpeed={0.001}
linkDirectionalParticleResolution={8}
```

In every mode, grouping links are invisible (0-width, transparent) — only their *force* exists. In From mode specifically, destination links are additionally drawn as faint wide translucent lines carrying two moving particles each, visualizing the narrative chain on top of the (invisible) spatial clustering.

**In short:** "different clustering by sort mode" is not different force rules — it's the same force rules operating on a different partition of nodes (different attribute → different `group` values), plus one bonus link type and its visualization exclusive to From.

---

## 5. Edge cases: `"none"` and single-group

`glassDataClass.js:33-35`:
```js
if (attribute === 'none') {
  return;
}
```
No links are built at all when sort is `"none"`.

`Graph.jsx:112-123`:
```js
if (sort === 'none') {
  const linkForce = graph.d3Force('link');
  if (linkForce) linkForce.strength(0.003);
  const timer = setTimeout(() => graphRef.current?.d3ReheatSimulation(), 10);
  return () => clearTimeout(timer);
}
```
Flat link strength `0.003`, no cluster force registered at all.

`Graph.jsx:150-156` — if fewer than 2 unique groups exist (e.g. everything shares one value), the centroid/cluster-force setup is skipped entirely, since one sphere anchor for the whole graph would be meaningless.

Every branch ends by scheduling `graphRef.current?.d3ReheatSimulation()` inside `setTimeout(..., 10)`. The 10ms delay works around a documented race in the kapsule wrapper: calling reheat synchronously can set `engineRunning = true` before `state.layout` exists, crashing the animation loop (comment at `Graph.jsx:115-117`).

---

## 6. Dropdown → simulation: the full propagation chain

1. **State owner** — `src/context/mainContext.js`. React Context + `useReducer`. Initial state `sort: 'From'`. `CHANGE_SORT` action updates it; `changeSort(sort)` dispatches it.
2. **UI control** — `src/components/SelectSort.jsx`. `<select onChange={(e) => changeSort(e.target.value)}>` with options None / From / To / Creator / Media / Event / Location / Year.
3. **Prop drilling** — `index.tsx` → `Layout.jsx` → `Navbar.jsx`. `sort`/`changeSort` pass through into `<SelectSort>`; `sort` also passes separately into `<GraphWrapper>`.
4. **Data rebuild** — `Graph.jsx:84-94`. A `useEffect` keyed on `sort` (among others) reconstructs `graphData` via `new GraphDataClass(allTokens, sort, filter)` — new `group` values, new link set.
5. **Force reconfiguration** — `Graph.jsx:104-190`. The force `useEffect` re-fires on the new `sort`/`graphData`, rebuilding `groupSizeMap`, re-weighting the link force, recomputing sphere centroids, re-registering the cluster force.
6. **Reheat** — `d3ReheatSimulation()` restarts the simulation's alpha so nodes animate into new cluster positions instead of sitting frozen.

---

## 7. Constant reference

| Constant | Value | Location | Effect |
|---|---|---|---|
| base link strength | `0.003` | `Graph.jsx:114`, `:141` | Baseline pull for a 2-node group; numerator normalized by group size |
| isDestination link strength | `0.0001` | `Graph.jsx:138` | Near-zero — From-mode narrative links barely affect position |
| group-size normalization | `size > 1 ? 0.003/(size−1) : 0.003` | `Graph.jsx:141` | Equalizes total pull regardless of group population |
| `SPHERE_RADIUS` | `300` | `Graph.jsx:158` | Distance of every group centroid from the origin |
| `SPRING_STRENGTH` | `0.08` | `Graph.jsx:159` | Per-frame velocity nudge toward a node's group centroid, × alpha |
| reheat defer | `10ms setTimeout` | `Graph.jsx:118-121`, `:151-154`, `:188` | Works around a kapsule state-init race |
| `cooldownTime` | `12000` / `6000` | `Graph.jsx:443` | 12s on initial load, 6s afterward, before sim auto-stops |
| `cooldownTicks` | `300` | `Graph.jsx:444` | Max simulation ticks per reheat |
| `warmupTicks` | `0` | `Graph.jsx:445` | No pre-render physics-only ticks; layout animates visibly from the start |
| `nodeAutoColorBy` | `'group'` | `Graph.jsx:467` | Node color also keys off the same field driving position |
| `linkWidth` (From) | `20` | `Graph.jsx:453` | `0` in every other mode — grouping links stay invisible everywhere |

**Untouched, everywhere:** `forceManyBody` (charge/repulsion), `forceCenter`, `forceCollide`. All clustering behavior comes from exactly two levers — link strength and the custom sphere-centroid spring — layered on top of 3d-force-graph's default repulsion and centering.
