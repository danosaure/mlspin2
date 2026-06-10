import { extractIDXFile } from '../extract-idx-file';
import type { IDXAgentType } from '../idx-agent-type';

export type AgentsLookupType = Record<string, IDXAgentType>;

export const getAgentsLookup = async (): Promise<AgentsLookupType> => {
  const agentsData: IDXAgentType[] = await extractIDXFile<IDXAgentType>('tmp/idx/agents.txt');
  return agentsData.reduce((agentsLookup, agentData) => {
    agentsLookup[agentData.ID] = agentData;
    return agentsLookup;
  }, {} as AgentsLookupType);
};
