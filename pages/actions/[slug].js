import { useContext } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'react-i18next';
import { useQuery, useReactiveVar } from '@apollo/client';
import * as Icon from 'react-bootstrap-icons';
import { Spinner, Container, Row, Col } from 'reactstrap';
import styled, { ThemeContext } from 'styled-components';
import { GET_ACTION_CONTENT } from 'common/queries/getActionContent';
import { yearRangeVar } from 'common/cache';
import { getMetricValue, beautifyValue } from 'common/preprocess';
import Layout from 'components/Layout';
import SettingsPanel from 'components/general/SettingsPanel';
import DashCard from 'components/general/DashCard';
import NodePlot from 'components/general/NodePlot';
import ParameterWidget from 'components/general/ParameterWidget';

const HeaderSection = styled.div`
  padding: 3rem 0 1rem;
  margin-bottom: 4rem;
  background-color: ${(props) => props.theme.graphColors.blue070};
`;

const HeaderCard = styled.div` 
  margin: 3rem 0 -8rem;
  padding: 2rem;
  border-radius: 1rem;
  background-color: ${(props) => props.theme.themeColors.white};
`;

const ActionDescription = styled.div`
  margin-bottom: 2rem;
  font-size: 1.15rem;
`;

const Parameters = styled.div` 
  margin: 1rem 0;
`;

const PageHeader = styled.div` 
  margin-bottom: 2rem;

  h1 {
    margin-bottom: 2rem;
    font-size: 1.5rem;
    color: ${(props) => props.theme.themeColors.dark};
  }
`;

const ActionLinks = styled.div`
  margin-bottom: 1rem;
`;

const NodeCard = styled.div`
  margin-bottom: 1rem;

  &.action .card {
    border:${(props) => props.theme.graphColors.grey030} 2px solid;
  }

  &.emissions .card {

  }
`;

const Causality = styled.div`
  text-align: center;
  margin: 1rem 0;
`;

const CausalCard = (props) => {
  const { node, index, startYear, endYear } = props;
  const theme = useContext(ThemeContext);

  return (
    <ActionLinks>
      { index !== 0 && (
      <Causality>
        <Icon.ArrowDown
          size={36}
          color={theme.graphColors.grey050}
        />
      </Causality>
      )}
      <NodeCard className={`${node.isAction && 'action'} ${node.quantity}`}>
        <DashCard>
          { node.isAction && <Icon.Journals size={24} className="mb-3" /> }
          { node.quantity === 'emission_factor' && <Icon.ClipboardX size={24} className="mb-3" /> }
          { node.quantity === 'emissions' && <Icon.CloudFog size={24} className="mb-3" /> }
          <Link href={`/node/${node.id}`}><a><h4>{node.name}</h4></a></Link>
          <div dangerouslySetInnerHTML={{ __html: node.description }} />
          <p>
            <strong>{beautifyValue(getMetricValue(node, 2030) || 0)}</strong>
            {' '}
            <span dangerouslySetInnerHTML={{ __html: node.unit?.htmlShort }} />
          </p>

          <NodePlot
            metric={node.metric}
            impactMetric={node.impactMetric}
            year="2021"
            startYear={startYear}
            endYear={endYear}
            color={node.color}
            isAction={node.isAction}
          />
        </DashCard>
      </NodeCard>
    </ActionLinks>
  );
};

export default function ActionPage() {
  const router = useRouter();
  const { slug } = router.query;
  const { t } = useTranslation();
  const yearRange = useReactiveVar(yearRangeVar);

  const { loading, error, data, refetch } = useQuery(GET_ACTION_CONTENT, {
    fetchPolicy: 'no-cache',
    variables: {
      node: slug,
    },
  });

  if (loading) {
    return <Layout><Spinner className="m-5" style={{ width: '3rem', height: '3rem' }} /></Layout>;
  }
  if (error) {
    return <Layout><div>{error}</div></Layout>;
  }

  const handleChange = () => {
    refetch();
  };

  const action = data.node;

  return (
    <Layout>
      <Head>
        <title>{action.name}</title>
      </Head>
      <HeaderSection>
        <Container>
          <PageHeader>
            <HeaderCard>
              <h1>
                <Link href="/actions">
                  <a href>
                    { t('actions') }
                  </a>
                </Link>
                {' '}
                /
                {' '}
                {action.name}
              </h1>
              <ActionDescription dangerouslySetInnerHTML={{ __html: action.description }} />
              <Parameters>
                { action.parameters?.map((parameter) => (
                  <ParameterWidget
                    key={parameter.id}
                    parameter={parameter}
                    parameterType={parameter.__typename}
                    unit={action.unit.htmlShort}
                    handleChange={handleChange}
                  />
                ))}
              </Parameters>
              <NodePlot
                metric={action.metric}
                impactMetric={action.impactMetric}
                year="2021"
                startYear={yearRange[0]}
                endYear={yearRange[1]}
                color={action.color}
                isAction={action.isAction}
              />
            </HeaderCard>
          </PageHeader>
        </Container>
      </HeaderSection>
      <Container>
        <Row>
          <Col md={{ size: 6, offset: 3 }} className="py-5">
            {action.descendantNodes?.map((node, index) => (
              <CausalCard
                key={node.id}
                node={node}
                index={index + 1}
                startYear={yearRange[0]}
                endYear={yearRange[1]}
              />
            ))}
          </Col>
        </Row>
      </Container>
      <SettingsPanel
        defaultYearRange={[2018, 2030]}
      />
    </Layout>
  );
}

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}
