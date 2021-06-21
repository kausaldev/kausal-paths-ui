import Link from 'next/link';
import _ from 'lodash';
import * as Icon from 'react-bootstrap-icons';
import styled from 'styled-components';
import { summarizeYearlyValuesBetween, beautifyValue, getImpactMetricValue } from 'common/preprocess';
import { settingsVar } from 'common/cache';
import DashCard from 'components/general/DashCard';
import NodePlot from 'components/general/NodePlot';
import HighlightValue from 'components/general/HighlightValue';
import { useTranslation } from 'react-i18next';

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

const ContentWrapper = styled.div`
  padding: 1rem;
  margin: .5rem 0;
  background-color: ${(props) => props.theme.graphColors.grey005};
  border-radius: 10px;

  .x2sstick text, .xtick text {
    text-anchor: end !important;
  }
`;

const ImpactFigures = styled.div`
  display: flex;
  width: 100%;
  justify-content: flex-end;

  .figure {
    margin-left: 2rem;
  }
`;

const CausalCard = (props) => {
  const { node, index, startYear, endYear } = props;
  const { t } = useTranslation();
  const { targetYearGoal } = node;
  const { maxYear } = settingsVar();

  const impactAtTargetYear = getImpactMetricValue(node, endYear);
  // TODO: use isACtivity when available, for now cumulate impact on emissions
  const cumulativeImpact = node.quantity === 'emissions'
    ? summarizeYearlyValuesBetween(node.impactMetric, startYear, endYear) : undefined;
    // _.concat(node.impactMetric.historicalValues, node.impactMetric.forecastValues)
  console.log(cumulativeImpact);
  return (
    <ActionLinks>
      <NodeCard className={`${node.isAction && 'action'} ${node.quantity}`}>
        <DashCard>
          { node.isAction && <Icon.Journals size={24} className="mb-3" /> }
          { node.quantity === 'emission_factor' && <Icon.ClipboardX size={24} className="mb-3" /> }
          { node.quantity === 'emissions' && <Icon.CloudFog size={24} className="mb-3" /> }
          <Link href={`/node/${node.id}`}><a><h4>{node.name}</h4></a></Link>
          <div dangerouslySetInnerHTML={{ __html: node.shortDescription }} />
          <ImpactFigures>
            { cumulativeImpact !== undefined && (
              <HighlightValue
                className="figure"
                displayValue={beautifyValue(cumulativeImpact)}
                header={`${t('total-impact')} ${startYear} - ${endYear}`}
                unit={node.unit?.htmlShort}
              />
            )}
            <HighlightValue
              className="figure"
              displayValue={beautifyValue(impactAtTargetYear)}
              header={`${t('impact-on-year')} ${endYear}`}
              unit={node.unit?.htmlShort}
            />
          </ImpactFigures>
          <ContentWrapper>
            <NodePlot
              metric={node.metric}
              impactMetric={node.impactMetric}
              startYear={startYear}
              endYear={endYear}
              color={node.color}
              isAction={node.isAction}
              targetYearGoal={targetYearGoal}
              targetYear={maxYear}
            />
          </ContentWrapper>
        </DashCard>
      </NodeCard>
    </ActionLinks>
  );
};

export default CausalCard;
