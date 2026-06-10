#!/usr/bin/env -S npx tsx

import { format } from '@fast-csv/format';

import { findTopAgents } from '../src/idx/find-top-agents';

const main = async () => {
  console.log('Script running...');
  const topAgents = await findTopAgents();

  const csvStream = format({
    headers: ['id', 'name', 'email', 'phone', 'transactions', 'amount'],
    delimiter: ',',
    quote: true,
  });

  csvStream.pipe(process.stdout);
  topAgents.forEach((topAgent) => {
    csvStream.write(topAgent);
  });
  csvStream.end();
};

main();
