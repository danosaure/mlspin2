import type { IDXPropType } from './idx-prop-type';

export interface IDXListingType {
  PROP_TYPE: IDXPropType;
  LIST_NO: string;
  LIST_AGENT: string;
  LIST_PRICE: string;
  TOWN_NUM: string;
  SALE_PRICE: string;
  SALE_AGENT: string;
}

export const idxListingToString = (listing: IDXListingType): string =>
  `Listing: ${listing.LIST_NO}/${listing.PROP_TYPE}` +
  `||` +
  `${listing.LIST_AGENT}|${listing.SALE_AGENT}` +
  `||` +
  `${listing.SALE_PRICE}|${listing.LIST_PRICE}`;
