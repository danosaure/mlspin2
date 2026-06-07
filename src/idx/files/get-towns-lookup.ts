import { extractIDXFile } from '../extract-idx-file';
import type { IDXFileDataFilterType } from '../idx-file-data-filter-type';
import type { IDXTownType } from '../idx-town-type';

export type TownsLookupType = Record<string, IDXTownType>;

export const getTownsLookup = async (countiesLookup: Set<string>): Promise<TownsLookupType> => {
  const townsFilter: IDXFileDataFilterType<IDXTownType> = (data: IDXTownType) =>
    data.STATE === 'MA' && countiesLookup.has(data.COUNTY);
  const townsData: IDXTownType[] = await extractIDXFile<IDXTownType>('tmp/idx/towns.txt', townsFilter);
  return townsData.reduce((townNums, townData) => {
    townNums[townData.TOWN_NUM] = townData;
    return townNums;
  }, {} as TownsLookupType);
};
