import { extractIDXFile } from '../extract-idx-file';
import type { IDXFileDataFilterType } from '../idx-file-data-filter-type';
import type { IDXListingType } from '../idx-listing-type';
import type { TownsLookupType } from './get-towns-lookup';

export const getListings = async (towns: TownsLookupType): Promise<IDXListingType[]> => {
  const listingsFilter: IDXFileDataFilterType<IDXListingType> = (data: IDXListingType) => towns[data.TOWN_NUM] !== undefined;

  const condos: IDXListingType[] = await extractIDXFile<IDXListingType>('tmp/idx/idx_cc_sld.txt', listingsFilter);
  const singleFamilies: IDXListingType[] = await extractIDXFile<IDXListingType>('tmp/idx/idx_sf_sld.txt', listingsFilter);
  const multiFamilies: IDXListingType[] = await extractIDXFile<IDXListingType>('tmp/idx/idx_mf_sld.txt', listingsFilter);
  return condos.concat(singleFamilies).concat(multiFamilies);
};
