import { gql, ApolloProvider } from '@apollo/client';
import { useEffect } from 'react';
import App from "next/app";
import { useRouter } from 'next/router';
import { ThemeProvider } from 'styled-components';
import getConfig from 'next/config';
import { appWithTranslation } from 'next-i18next';

import { useApollo } from 'common/apollo';
import ThemedGlobalStyles from 'common/ThemedGlobalStyles';
import { yearRangeVar, settingsVar, activeScenarioVar } from 'common/cache';
import SiteContext from 'context/site';

const { publicRuntimeConfig } = getConfig();
const basePath = publicRuntimeConfig.basePath ? publicRuntimeConfig.basePath : '';

const defaultSiteContext = {
  kpr: {
    theme: 'kpr',
    showYearSelector: true,
    showScenarios: true,
    showTargetBar: true,
    split: false,
    loginLink: false,
    showBaseline: true,
    showTarget: true,
    useBaseYear: false,
    showNavTitle: false,
  },
  tampere: {
    theme: 'tampere-ilmasto',
    showYearSelector: true,
    showScenarios: true,
    showTargetBar: true,
    split: true,
    loginLink: false,
    showBaseline: true,
    showTarget: true,
    useBaseYear: true,
    showNavTitle: true,
  },
  ilmastoruoka: {
    theme: 'default',
    showYearSelector: true,
    showScenarios: true,
    showTargetBar: true,
    split: true,
    loginLink: false,
    showBaseline: true,
    showTarget: true,
    useBaseYear: false,
    showNavTitle: true,
  }
}

require('../styles/default/main.scss');

const GET_INSTANCE = gql`
query GetInstance {
    instance {
      id
      name
      owner
      defaultLanguage
      supportedLanguages
      targetYear
      referenceYear
      minimumHistoricalYear
      maximumHistoricalYear
    }
    scenarios {
      id
      isActive
      isDefault
      name
    }
}
`;

function PathsApp(props) {
  const {
    Component, pageProps, siteContext
  } = props;
  const { instance, scenarios } = siteContext;
  const router = useRouter();
  const apolloClient = useApollo(pageProps.data, siteContext);

  // Change active locale based on the instance front settings
  // causes some sort of loop, find an alternative solution
  // router.push(router.pathname, router.pathname, { locale: siteContext.defaultLanguage });

  useEffect(() => {
    yearRangeVar([instance.referenceYear || 1990, instance.targetYear]);
    settingsVar({
      baseYear: instance.referenceYear || 1990,
      minYear: instance.minimumHistoricalYear || 2010,
      maxYear: instance.targetYear,
      latestMetricYear: instance.maximumHistoricalYear || 2018,
      totalEmissions: 540,
      emissionsTarget: 266,
      baselineName: scenarios.find((scenario) => scenario.id === 'baseline').name,
      iconBase: `${basePath}/static/themes/default/images/favicon`,
      ogImage: `${basePath}/static/themes/default/images/og-image-default.png`,
    });
    activeScenarioVar(scenarios.find((scenario) => scenario.isActive));
  }, []);

  const component = <Component {...pageProps} />;

  return (
    <SiteContext.Provider value={siteContext}>
      <ApolloProvider client={apolloClient}>
        <ThemeProvider theme={siteContext.theme}>
          <ThemedGlobalStyles />
          { component }
        </ThemeProvider>
      </ApolloProvider>
    </SiteContext.Provider>
  );
}

async function getSiteContext(req, locale) {
  /**
   * Load the static, global data related to the instance and theme.
   */

  // First determine the hostname for the request which we might need
  // for loading the instance that is related to it.
  let host;
  if (req) {
    const { headers } = req;
    host = headers['host'].split(':')[0];
  } else {
    host = window.location.hostname;
  }

  // Instance is identified either by a hard-coded identifier or by the
  // request hostname.
  const siteContext = {
    instanceIdentifier: publicRuntimeConfig.instanceIdentifier,
    instanceHostname: host,
  };
  const apolloClient = useApollo(null, siteContext);

  // Load the instance configuration from backend
  const { data, error } = await apolloClient.query({
    query: GET_INSTANCE,
    context: {
      locale
    }
  });
  if (error) {
    throw new Error(`Error loading instance data: ${error}`);
  }
  Object.assign(siteContext, data);
  Object.assign(siteContext, defaultSiteContext[data.instance.id]);
  siteContext.title = data.instance.name;

  // Load the theme
  const theme = await import(`/public/static/themes/${siteContext.theme}/theme.json`);
  siteContext.theme = JSON.parse(JSON.stringify(theme));

  return siteContext;
}

PathsApp.getInitialProps = async (appContext) => {
  const appProps = await App.getInitialProps(appContext);
  const { ctx } = appContext; 
  const { req } = ctx;

  if (!process.browser) {
    const { serverSideTranslations } = require('next-i18next/serverSideTranslations');

    const conf = {
      i18n: {
        defaultLocale: ctx.defaultLocale,
        locales: ctx.locales,
      }
    }
    const i18nConfig = await serverSideTranslations(
      ctx.locale, ['common'], conf
    );
    Object.assign(appProps.pageProps, i18nConfig);
  } else {
    // Yank the i18next config from __NEXT_DATA__
    appProps.pageProps._nextI18Next = window.__NEXT_DATA__.props.pageProps._nextI18Next;
  }
  const siteContext = await getSiteContext(req, ctx.locale);

  return {
    ...appProps,
    siteContext,
  };
};

export default appWithTranslation(PathsApp);
