import csv from 'csv-parser';
import fs from 'node:fs';

import { CSV_OPTIONS } from './constants';

export const getIDXReadStream = (filepath: string) => fs.createReadStream(filepath).pipe(csv(CSV_OPTIONS));
