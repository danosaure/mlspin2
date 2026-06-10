import { TOP_AGENTS } from './constants';
import { getCountiesLookup } from './files/get-counties-lookup';
import { getListings } from './files/get-listings';
import { getScrappedAgentsLookup } from './files/get-scrapped-agents-lookup';
import { getTownsLookup } from './files/get-towns-lookup';
import { type IDXListingType } from './idx-listing-type';

type AgentListingAnalytics = {
  count: number;
  total: number;
};

type AgentListingRecords = Record<string, AgentListingAnalytics>;

const updateAgentListings = (records: AgentListingRecords, agentID: string, listing: IDXListingType): AgentListingRecords => {
  if (!agentID) {
    // Can happen when listing is under agreement STATUS=UAG.
    return records;
  }
  let agentListingAnalytics: AgentListingAnalytics = records[agentID.toUpperCase()];
  if (!agentListingAnalytics) {
    agentListingAnalytics = {
      count: 0,
      total: 0,
    };
  }

  agentListingAnalytics.count++;
  agentListingAnalytics.total += Number.parseInt(listing.SALE_PRICE || listing.LIST_PRICE);

  records[agentID.toUpperCase()] = agentListingAnalytics;
  return records;
};

type TopAgentEntry = [string, number, number];

export type TopAgentEntryType = [string, string, string, string, number, number];

export const findTopAgents = async (): Promise<TopAgentEntryType[]> => {
  const countiesLookup = await getCountiesLookup();
  const townsLookup = await getTownsLookup(countiesLookup);
  const listings = await getListings(townsLookup);

  const agentTransactions = listings.reduce((agentsLookup, listing) => {
    const updatedListing = updateAgentListings(agentsLookup, listing.LIST_AGENT, listing);
    if (listing.LIST_AGENT === listing.SALE_AGENT) {
      return updatedListing;
    }
    return updateAgentListings(updatedListing, listing.SALE_AGENT, listing);
  }, {} as AgentListingRecords);

  const topAgents = Object.entries(agentTransactions)
    .map<TopAgentEntry>(([agentID, agentRecord]) => [agentID, agentRecord.count, agentRecord.total])
    .toSorted((a, b) => b[2] - a[2])
    .slice(0, TOP_AGENTS);

  const agentsLookup = await getScrappedAgentsLookup();

  let errorId = 0;

  try {
    return topAgents
      .map<TopAgentEntryType>(([id, transactions, amount], topIndex) => {
        const agent = agentsLookup[id];
        if (!agent) {
          errorId += 1;

          if (errorId <= 25) {
            console.error(`${errorId} Invalid agent ID "${id}" (top ${topIndex + 1})`);
          }
          return [id, '', '', '', transactions, amount];
        }
        return [agent['agent.id'], agent['agent.name'], agent['agent.email'], agent['agent.phone'], transactions, amount];
      })
      .filter((data) => data !== null);
  } finally {
    if (errorId) {
      console.error(`Missing ${errorId} in the top agents.`);
    }
  }
};
