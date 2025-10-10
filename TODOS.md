Version 0.1 is stable at commit 25e28a6 - before update MAY2025
Version beta v0.3 stable at commit e699735 - before update OCT2025

Reservoir being used:

- index.jsx (this is where tokens data are fetched -> just the api is used):
  const response = await fetch(
  `https://api-zora.reservoir.tools/users/${account.address}/tokens/v10?collection=${contract}&limit=200&includeAttributes=true`,
  options
  ); ---->> fetch user tokens

- LargeMedia.jsx (TokenMedia)
- TokenInfo.jsx (MintModal)

- Grid.tsx (type ReservoirToken)
- GridOpenToken (MintModal, type ReservoirToken)
- GridViewItemMobile (MintModal, type ReservoirToken)

- app.tsx (reservoirChains, ReservoirKitProvider, darkTheme)

-tokens.d.ts ()

Block explorer:
https://explorer.zora.energy/token/0xE5A192aAF911c35FB47DE1342e768EF01c84fa09?tab=read_write_proxy

Zora SDK docs:
https://nft-docs.zora.co/contracts/Minting1155
