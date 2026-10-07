import { tokenMatchesConstellations } from '../utils/constellations';

const normalizeValue = (value) => value?.trim().toLowerCase() ?? '';

class GraphDataClass {
  constructor(tokenArr, attribute, filtersArr, constellationsArr) {
    this.filteredTokens = tokenArr?.filter((tk) => {
      if (filtersArr?.length) {
        let tagsAttribute = tk.token.attributes.find(
          (att) => att.key === 'Tags' || att.key === 'Content Tags',
        );
        if (!tagsAttribute) return false;
        let attributeValue = tagsAttribute.value.toLowerCase();

        if (!filtersArr.some((f) => attributeValue.includes(f.toLowerCase()))) {
          return false;
        }
      }

      return tokenMatchesConstellations(tk, constellationsArr);
    });
    this.nodes = this.filteredTokens?.map((token) => {
      let resolvedImage =
        token.token.imageSmall || token.token.image || token.token.imageLarge;

      // fragment 40 is an svg, here is a png locally served version (exception):
      if (token.token.tokenId == '40')
        resolvedImage = '/images/fragment-40.png';

      const group =
        attribute !== 'none'
          ? token.token.attributes.find((att) => att.key === attribute)?.value
          : 'none';
      const from = token.token.attributes.find((att) => att.key === 'From')?.value;
      const to = token.token.attributes.find((att) => att.key === 'To')?.value;

      return {
        id: token.token.tokenId,
        name: token.token.name,
        image: resolvedImage,
        group,
        from,
        to,
        groupKey: normalizeValue(group),
        fromKey: normalizeValue(from),
        toKey: normalizeValue(to),
      };
    });
    this.links = [];

    if (attribute === 'none') {
      return;
    }
    this.nodes.forEach((node, i, allNodes) => {
      allNodes.forEach((n) => {
        if (n.groupKey === node.groupKey && n.id !== node.id) {
          this.links.push({
            source: node.id,
            target: n.id,
            isDestination: false,
            // value: Math.floor(Math.random() * 9) + 1,
            // value: 2,
          });
        }
      });
    });
    this.nodes.forEach((node, i, allNodes) => {
      allNodes
        .filter((n) => n.fromKey === node.toKey)
        .forEach((targetNode) => {
          const link = {
            source: node.id,
            target: targetNode.id,
            isDestination: true,
          };
          this.links.push(link);
        });
    });
    // console.log('this.links', this.links);
  }

  changeAttribute(attribute) {}
}

export { GraphDataClass };
