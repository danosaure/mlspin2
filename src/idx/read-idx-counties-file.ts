import { COUNTIES } from './constants';
import { extractIDXFile } from './extract-idx-file';
import type { IDXCountyType } from './idx-county-type';

import type { IDXFileDataFilterType } from './idx-file-data-filter-type';

export const readIDXCountiesFile = async (): Promise<Set<string>> => {
  const filter: IDXFileDataFilterType<IDXCountyType> = (data: IDXCountyType) => COUNTIES.has(data.LONG);

  const data: IDXCountyType[] = await extractIDXFile<IDXCountyType>('tmp/idx/counties.txt', filter);

  return data.reduce((countyCodes, countyData) => {
    countyCodes.add(countyData.SHORT);
    return countyCodes;
  }, new Set<string>());
};
