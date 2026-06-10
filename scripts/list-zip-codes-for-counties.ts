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

    const existingZips = new Set<string>();

    fs.createReadStream('src/idx/geo-data.csv')
      .pipe(parse({ headers: true, delimiter: ',' }))
      .on('error', (error) => console.error(error))
      .on('data', (data: GeoDataType) => {
        if (data.state_abbr === 'MA' && digitOnlyZipCode(data.zipcode)) {
          if (existingZips.has(data.zipcode)) {
            console.warn(`Already used ${data.zipcode}`);
          }
          records.push(data);
          existingZips.add(data.zipcode);
        }
      })
      .on('end', (rowCount: number) => {
        console.log(`Parsed ${rowCount} lines`);
        resolve(records);
      });
  });

const chunk = (zipcodes: string[], size: number): string[][] => {
  const chunks: string[][] = [];

  for (let i = 0; i < zipcodes.length; i += size) {
    chunks.push(zipcodes.slice(i, i + size));
  }

  return chunks;
};

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

  console.log(`ZipCodes by Counties:`);
  Object.entries(recordsByCounty).forEach(([county, zipCodes]) => {
    console.log(`    ${county}`);
    const chunks = chunk(zipCodes, 8);
    chunks.forEach((zipCodesChunk) => {
      console.log(`        ${zipCodesChunk.join(',')}`);
    });
  });
};

main();
