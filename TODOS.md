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

PASSOS:

1. atualizar zoraprotocol para latest OK
2. pegar totalMints & maxSupply de zoraprotocol no index getStaticProps OK
3. limpar todos os imports de reservoir OK

4. desinstalar reservoir package OK
5. atualizar viem, wagmi, rainbowkit agora que nao tem mais a porcaria do reservoir package OK
6. instalar alchemy sdk e pegar os metadata via alchemy SDK (em index getStaticProps) OK

--> token.media, em LargeMedia.jsx pode não ter o final (.mp4, .mp3) -> ajustar para checar o token.mediaMimeType em vez disso. OK

--> ajustar as ocorrencias de token?.token?.supply para token.totalMinted (GridOpenToken por ex.) OK
--> continuar ajustando LargeMedia: http://localhost:3001/?fragment=45 é um VIDEO! OK
--> http://localhost:3000/?fragment=32 is a GIF, should play the GIF in grid mode; also should play the gif in LargeMedia too - currently just showing animated GIF in TokenInfo OK

8. refazer mints e tokenMedia com os dados e packages novas OK
   in process...
   --> colocar o preço a pagar no CollectModal OK

9. when the user clicks on the Collect (Mint component) in mobile, should have a behaviour similar to what happens when they click Connect (give the option to open the app in Metamask app mobile) OK

10. número de tokens mintados aparece desatualizado devido a subgraph do zora desatualizado. o token 63, por exemplo, teve 3 mints, mas continua retornando apenas 1.
    subgraph url: https://api.goldsky.com/api/public/project_clhk16b61ay9t49vm6ntn4mkz/subgraphs/zora-create-zora-mainnet/stable/gn
    working graphql query:
    `fragment SaleStrategy on SalesStrategyConfig {
  type
  fixedPrice {
    address
    pricePerToken
    saleEnd
    saleStart
    maxTokensPerAddress
  }
  erc20Minter {
    address
    pricePerToken
    currency
    saleEnd
    saleStart
    maxTokensPerAddress
  }
  presale {
    address
    presaleStart
    presaleEnd
    merkleRoot
  }
  zoraTimedMinter {
    address
    mintFee
    saleStart
    saleEnd
    erc20Z {
      id 
      pool
    }
    secondaryActivated
    marketCountdown
    minimumMarketEth
  }
}
fragment Token on ZoraCreateToken {
    creator
    tokenId
    uri
    totalMinted
    maxSupply
    tokenStandard
    salesStrategies(where: {type_in: ["FIXED_PRICE", "ERC_20_MINTER", "PRESALE", "ZORA_TIMED"]}) {
      ...SaleStrategy
    }
    contract {
      address
      mintFeePerQuantity
      contractVersion
      contractURI
      name
      salesStrategies(where: {type_in: ["FIXED_PRICE", "ERC_20_MINTER", "PRESALE", "ZORA_TIMED"]}) {
        ...SaleStrategy
      }
    }
}
query {
  zoraCreateTokens(
     where: {address: "0xe5a192aaf911c35fb47de1342e768ef01c84fa09"}
  ) {
     ...Token
  }
}`
    há uma função read no contrato: getTokenInfo: https://explorer.zora.energy/address/0xE5A192aAF911c35FB47DE1342e768EF01c84fa09?tab=read_proxy&source_address=0xA0CFBEA2fe941EaE373aEB3359b0171f3F194c35#0x8c7a63ae

01.11.2025 -> testar troca do getStaticProps por gerServersideProps, fazer merge se ok OK

11. info em mobile

12. Collect em GridOpenToken.tsx
