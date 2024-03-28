class GraphDataClass {
  constructor(tokenArr, attribute, filtersArr) {
    console.log('filtersArr', filtersArr);
    if (!filtersArr?.length) {
      this.filteredTokens = tokenArr;
    } else {
      this.filteredTokens = tokenArr?.filter((tk) =>
        filtersArr.every((f) =>
          tk.token.attributes
            .find((att) => att.key === 'Content Tags')
            .value.toLowerCase()
            .includes(f.toLowerCase())
        )
      );
    }
    console.log('this.filteredTokens', this.filteredTokens);
    this.nodes = this.filteredTokens?.map((token) => {
      return {
        id: token.token.tokenId,
        name: token.token.name,
        image: token.token.imageLarge,
        group:
          attribute !== 'none'
            ? token.token.attributes.find((att) => att.key === attribute)?.value
            : 'none',
        from: token.token.attributes.find((att) => att.key === 'From')?.value,
        to: token.token.attributes.find((att) => att.key === 'To')?.value,
      };
    });
    this.links = [];

    if (attribute === 'none') {
      return;
    }
    this.nodes.forEach((node, i, allNodes) => {
      allNodes.forEach((n) => {
        if (n.group === node.group && n.id !== node.id) {
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
    console.log('this.links', this.links);
  }

  changeAttribute(attribute) {}
}

export { GraphDataClass };
