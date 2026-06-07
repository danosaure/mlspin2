import { getIDXReadStream } from './get-idx-read-stream';
import type { IDXFileDataFilterType } from './idx-file-data-filter-type';

export const extractIDXFile = async <T>(filepath: string, filter?: IDXFileDataFilterType<T>): Promise<T[]> =>
  new Promise((resolve) => {
    const filteredData: T[] = [];

    getIDXReadStream(filepath)
      .on('data', (data) => {
        if (filter) {
          if (filter(data)) {
            filteredData.push(data);
          }
        } else {
          filteredData.push(data);
        }
      })
      .on('end', () => {
        resolve(filteredData);
      });
  });
