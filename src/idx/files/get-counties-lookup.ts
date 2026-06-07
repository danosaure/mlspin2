import { COUNTIES } from '../constants';
import { extractIDXFile } from '../extract-idx-file';
import type { IDXCountyType } from '../idx-county-type';
import type { IDXFileDataFilterType } from '../idx-file-data-filter-type';

export type CountiesLookupType = Set<string>;

export const getCountiesLookup = async (): Promise<CountiesLookupType> => {
  const countiesFilter: IDXFileDataFilterType<IDXCountyType> = (data: IDXCountyType) => COUNTIES.has(data.LONG);
  const countiesData: IDXCountyType[] = await extractIDXFile<IDXCountyType>('tmp/idx/counties.txt', countiesFilter);
  return countiesData.reduce((countyCodes, countyData) => {
    countyCodes.add(countyData.SHORT);
    return countyCodes;
  }, new Set()) as CountiesLookupType;
};
