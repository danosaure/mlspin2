import fs from 'node:fs';
import path from 'node:path';
import { parse } from '@fast-csv/parse';
import type { ScrapeAgentType } from '../scrape-agent-type';

export type ScrapeAgentsLookupType = Record<string, ScrapeAgentType>;

const readSingleScrapeFile = async (filepath: string, agentsLookup: ScrapeAgentsLookupType): Promise<ScrapeAgentsLookupType> =>
  new Promise((resolve) => {
    fs.createReadStream(filepath)
      .pipe(parse({ headers: true, delimiter: ';' }))
      .on('error', (error) => console.error(error))
      .on('data', (data: ScrapeAgentType) => {
        if (data['agent.id'] && data['agent.id'] !== 'agent.id') {
          agentsLookup[data['agent.id']] = data;
        }
      })
      .on('end', (rowCount: number) => {
        console.log(`scrape "${filepath}": ${rowCount} lines`);
        resolve(agentsLookup);
      });
  });

export const getScrappedAgentsLookup = async (): Promise<ScrapeAgentsLookupType> => {
  const SCRAPE_PATH = 'tmp/idx/counties-scrape';
  const agentsLookup: ScrapeAgentsLookupType = {};

  try {
    const files = fs.readdirSync(SCRAPE_PATH);

    for (const file of files) {
      const fullPath = path.join(SCRAPE_PATH, file);
      const fileStats = fs.lstatSync(fullPath);
      if (fileStats.isFile()) {
        await readSingleScrapeFile(fullPath, agentsLookup);
      }
    }
    return agentsLookup;
  } catch (error) {
    console.error(`getScrappedAgentsLookup(): error=`, error);
    throw error;
  }
};
