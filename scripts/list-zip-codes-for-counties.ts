#!/usr/bin/env -S npx tsx

import fs from 'node:fs';

import { parse } from '@fast-csv/parse';
import { COUNTIES } from '../src/idx/constants';

type GeoDataType = {
  state_fips: number;
  state: string;
  state_abbr: string;
  zipcode: string;
  county: string;
  city: string;
};

const DIGIT_EXPR = /^\d{5}$/;
const digitOnlyZipCode = (str: string) => DIGIT_EXPR.test(str);

const extractMAzips = async (): Promise<GeoDataType[]> =>
  new Promise((resolve) => {
    const records: GeoDataType[] = [];

    fs.createReadStream('src/idx/geo-data.csv')
      .pipe(parse({ headers: true, delimiter: ',' }))
      .on('error', (error) => console.error(error))
      .on('data', (data: GeoDataType) => {
        if (data.state_abbr === 'MA' && digitOnlyZipCode(data.zipcode)) {
          records.push(data);
        }
      })
      .on('end', (rowCount: number) => {
        console.log(`Parsed ${rowCount} lines`);
        resolve(records);
      });
  });

const main = async () => {
  const records = await extractMAzips();
  console.log(`Found ${Object.keys(records).length} zip codes in MA.`);

  const recordsByCounty: Record<string, string[]> = records.reduce(
    (byCounties, record) => {
      if (COUNTIES.has(record.county)) {
        byCounties[record.county] = (byCounties[record.county] || []).concat([record.zipcode]);
      }
      return byCounties;
    },
    {} as Record<string, string[]>,
  );

  console.log(`ZipCodes by Counties:`, recordsByCounty);
};

main();
