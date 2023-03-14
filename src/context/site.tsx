import { GetInstanceContextQuery } from 'common/__generated__/graphql';
import React, { useContext } from 'react';

export type SiteContextScenario = GetInstanceContextQuery['scenarios'][0];

export type SiteContextType = {
  title: string,
  apolloConfig: {
    instanceHostname: string,
    instanceIdentifier: string,
  },

  iconBase: string,
  ogImage: string,
  baselineName: string | null | undefined,
  minYear: number,
  maxYear: number,
  baseYear: number | null,
  targetYear: number,
  latestMetricYear: number,

  scenarios: SiteContextScenario[],
  availableNormalizations: GetInstanceContextQuery['availableNormalizations'],
  parameters: GetInstanceContextQuery['parameters'],
  menuPages: GetInstanceContextQuery['menuPages'],
};


const SiteContext = React.createContext<SiteContextType>(null!);

export const useSite = () => {
  return useContext(SiteContext);
}

export default SiteContext;