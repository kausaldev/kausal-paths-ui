import { useState, useEffect, useContext } from 'react';
import { useQuery, useReactiveVar } from '@apollo/client';
import styled, { useTheme } from 'styled-components';

import { activeScenarioVar, yearRangeVar, settingsVar } from 'common/cache';
import { Container, Row, Col, ButtonGroup, Button } from 'reactstrap';
import { useTranslation } from 'next-i18next';
import { useSite } from 'context/site';
import { GET_ACTION_LIST } from 'common/queries/getActionList';

import Layout from 'components/Layout';
import SettingsPanel from 'components/general/SettingsPanel';
import MacGraph from 'components/graphs/MacGraph';
import ContentLoader from 'components/common/ContentLoader';

const MOCK_DATA = {
  actions: [
    'Low-energy lamps',
    'Pressure-controlled fans',
    'Adjustment ventilation system',
    'Sneak-flushing luminaires',
    'Presence controlled LED',
    'Replacement thermostats/valves + adjustment heating system',
    'Wind insulation 300mm',
    'Painting/sealing windows/doors',
    'New entrance/basement doors',
    'Heat exchanger wastewater',
    'IMD hot water',
    'FVP COP 3.0',
    'FTX 85 %',
    'Additional insulation windows',
    'Facade insulation 100mm',
    'Window replacement (U = 1.0)',
    ],  
  netcost:  [
    -30.8,
    -27.1,
    -21.1,
    -20.1,
    -17.8,
    -17.5,
    -17.1,
    -13.6,
    -13.5,
    -11.9,
    -11.9,
    -5,
    -1.9,
    -1.6,
    20.2,
    22.7,
    ],  
    energySaving: [
    10.400000,
    41.600000,
    52.000000,
    62.400000,
    10.400000,
    135.200000,
    36.400000,
    20.800000,
    26.000000,
    52.000000,
    52.000000,
    166.400000,
    78.000000,
    78.000000,
    43.680000,
    31.200000,
    ], 
};

const HeaderSection = styled.div`
  padding: 4rem 0 10rem; 
  background-color: ${(props) => props.theme.graphColors.blue070};
`;

const PageHeader = styled.div` 
  h1 {
    margin-bottom: 2rem;
    font-size: 2rem;
    color: ${(props) => props.theme.themeColors.white};
  }
`;

const GraphCard = styled.div` 
  margin: -8rem 0 3rem;
  padding: 2rem;
  border-radius:  ${(props) => props.theme.cardBorderRadius};
  background-color: ${(props) => props.theme.themeColors.white};
  box-shadow: 3px 3px 12px rgba(33,33,33,0.15);
`;

const ActiveScenario = styled.div`
  padding: .75rem;
  border-radius:  ${(props) => props.theme.cardBorderRadius};
  background-color: ${(props) => props.theme.brandDark};
  color: ${(props) => props.theme.themeColors.white};
  font-size: 1rem;
  font-weight: 700;
  vertical-align: middle;
`;

function MacPage(props) {
  const { page, activeScenario: queryActiveScenario } = props;
  const { t } = useTranslation();
  const theme = useTheme();
  const site = useSite();
  const { loading, error, data, refetch } = useQuery(GET_ACTION_LIST);
  const activeScenario = useReactiveVar(activeScenarioVar);
  const yearRange = useReactiveVar(yearRangeVar);

  useEffect(() => {
    refetch();
  }, [activeScenario]);

  if (loading) {
    return <Layout><ContentLoader /></Layout>;
  } if (error) {
    return <Layout><div>{ t('error-loading-data') }</div></Layout>;
  }

  console.log(data);
  return (
  <Layout>
    <HeaderSection>
      <Container>
        <PageHeader>
          <h1>
            Cost effectiveness
            {' '}
          </h1>
        </PageHeader>
      </Container>
    </HeaderSection>
    <Container className="mb-5">
      <Row>
        <Col>
          <GraphCard>
            <MacGraph
            data={MOCK_DATA}
            />
          </GraphCard>
        </Col>
      </Row>
    </Container>
    <SettingsPanel
      defaultYearRange={[settingsVar().latestMetricYear, settingsVar().maxYear]}
    />
  </Layout>
  )
}

export default MacPage