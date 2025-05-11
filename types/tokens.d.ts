export interface TokenAttribute {
  key: string;
  value: string;
  kind?: string;
  rank?: number;
  tokenCount?: number;
  traitCount?: number;
}

export interface TokenOwner {
  owner: string;
  quantity: string;
}

export interface TokenMarket {
  floorAsk?: {
    id?: string;
    price?: {
      amount: {
        raw: string;
        decimal: number;
        usd: number;
      };
      currency: {
        contract: string;
        name: string;
        symbol: string;
        decimals: number;
      };
    };
    maker?: string;
    validFrom?: number;
    validUntil?: number;
    source?: {
      id: string;
      domain: string;
      name: string;
      icon: string;
      url: string;
    };
  };
}

export interface Token {
  contract: string;
  tokenId: string;
  name?: string;
  description?: string;
  image?: string;
  imageSmall?: string;
  imageLarge?: string;
  imageOriginal?: string;
  kind?: string;
  isFlagged?: boolean;
  lastFlagUpdate?: string;
  metadataDisabled?: boolean;
  attributes: TokenAttribute[];
  ownerCount?: number;
  owners?: TokenOwner[];
  market?: TokenMarket;
  supply?: string | number;
  remainingSupply?: string | number;
  tokenId: string;
  rarity?: string | number;
  rarityRank?: number | string;
  // Add more fields as needed from the API response
}

export interface ReservoirToken {
  token: Token;
  // Add other fields if present in the response (e.g., market, ownership, etc.)
}

export interface ReservoirTokensResponse {
  tokens: ReservoirToken[];
  continuation?: string;
  // Add other fields if present in the response
}
