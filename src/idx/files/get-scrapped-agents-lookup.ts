import fs from 'node:fs';
import { parse } from '@fast-csv/parse';
import type { ScrapeAgentType } from '../scrape-agent-type';

export type ScrapeAgentsLookupType = Record<string, ScrapeAgentType>;

export const getScrappedAgentsLookup = async (): Promise<ScrapeAgentsLookupType> =>
  new Promise((resolve) => {
    const agentsLookup: ScrapeAgentsLookupType = {};

    fs.createReadStream('tmp/idx/scrape.txt')
      .pipe(parse({ headers: true, delimiter: ';' }))
      .on('error', (error) => console.error(error))
      .on('data', (data: ScrapeAgentType) => {
        if (data['agent.id']) {
          agentsLookup[data['agent.id']] = data;
        }
      })
      .on('end', (rowCount: number) => {
        console.log(`scrape.txt: ${rowCount} lines`);
        resolve(agentsLookup);
      });
  });
