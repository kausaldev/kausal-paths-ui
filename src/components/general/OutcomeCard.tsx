import { useRef, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import DashCard from 'components/general/DashCard';
import styled from 'styled-components';
import { beautifyValue, getMetricChange, getMetricValue } from 'common/preprocess';
import { OutcomeNodeFieldsFragment } from 'common/__generated__/graphql';
import PopoverTip from 'components/common/PopoverTip';

const CardContainer = styled.div`
  //position: relative;
  flex: 0 0 175px;
  margin: 0 .25rem 0;

  &:first-child {
    margin-left: 0;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;

  &.root h2 {
    font-size: 1.5rem;
  }
`;

const Title = styled.div`
  // border-left: 6px solid ${(props) => props.color};
  // padding-left: 6px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;  
  overflow: hidden;
`;

const CardAnchor = styled.a`
  &:hover {
    text-decoration: none;
  }
  &::after {
    content: '';
    position: absolute; 
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    cursor: pointer;
  }
`;

const Name = styled.h2`
  margin-bottom: 0;
  font-size: 1rem;
`;

const Status = styled.div`
  margin-top: .5rem;
  //text-align: right;
  white-space: nowrap;
  font-size: 1rem;
  font-weight: 700;
  color: ${(props) => props.theme.graphColors.grey050};
`;

const Body = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-top: .5rem;
`;

const MainValue = styled.div`
  text-align: left;
  font-size: 1.25rem;
  line-height: 1.2;
  font-weight: 700;
`;

const Label = styled.div`
  font-size: 0.7rem;
  font-weight: 700;
  color: ${(props) => props.theme.graphColors.grey050};
`;

const MainUnit = styled.span`
  margin-left: 0.25rem;
  font-size: 0.6rem;
`;

// bottom: ${(props) => props.$size > 0 ? props.offset * 100 : 0}%;
const ProportionBarBar = styled.div<{$size: number, $color: string}>`
  position: absolute;
  bottom: ${(props) => props.$size > 0 ? '0' : 'auto'}%;
  //bottom: 0;
  top: ${(props) => props.$size > 0 ? 'auto' : '0'}%;
  left: 0;
  height: ${(props) => Math.abs(props.$size) * 100}%;
  width: 14px;
  background-color: ${(props) => props.$color};
`;

const ProportionBarContainer = styled.div<{$active: boolean}>`
  position: absolute;
  height: 170px;
  bottom: ${(props) => props.$active ? '36px' : '0'};
  left: 0;
  width: 12px;
  // border-right: 1px solid ${(props) => props.theme.graphColors.grey010};
`;

const ProportionBar = ({ size, color, active, offset }: { size: number, color: string, active: boolean, offset?: number }) => {
  return (
    <ProportionBarContainer $active={active}>
      <ProportionBarBar $size={size} $color={color} />
    </ProportionBarContainer>
  );
};

type OutcomeCardProps = {
  node: OutcomeNodeFieldsFragment,
  startYear: number,
  endYear: number,
  //subNodes: OutcomeNodeFieldsFragment[],
  state: 'open' | 'closed',
  hovered: boolean,
  active: boolean,
  onHover: (evt) => void,
  handleClick: (segmentId: string) => void,
  color: string,
  total: number,
  positiveTotal: number,
  negativeTotal: number,
}

const OutcomeCard = (props: OutcomeCardProps) => {
  const {
    node,
    state, hovered, onHover, handleClick, active,
    color, startYear, endYear,
    total, positiveTotal, negativeTotal,
  } = props;

  const cardRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (active && cardRef.current) cardRef.current.scrollIntoView({ inline: "center", behavior: 'smooth', block: 'nearest' });
  }, [active]);

  //console.log(state);
  const { t } = useTranslation();
  const baseOutcomeValue = getMetricValue(node, startYear) || 0;
  const goalOutcomeValue = getMetricValue(node, endYear);
  const change = getMetricChange(baseOutcomeValue, goalOutcomeValue);
  const lastMeasuredYear = node?.metric.historicalValues[node.metric.historicalValues.length - 1].year;
  const firstForecastYear = node?.metric.forecastValues[0].year;
  const isForecast = endYear > lastMeasuredYear;

  // const unit = `kt CO<sub>2</sub>e${t('abbr-per-annum')}`;
  const unit = node.metric?.unit?.htmlShort;
  // If there is no outcome  value for active year, do not display card set
  if (goalOutcomeValue === undefined) return null;

  return (
    <CardContainer key={node.id}>
      <DashCard
        state={state}
        hovered={hovered}
        active={active}
        color={color}
        refProp={cardRef}
      >
        <ProportionBar
          size={goalOutcomeValue/total}
          color={color}
          active={active}
          offset={negativeTotal < 0 ? Math.abs(negativeTotal/total) : 0}
        />
        <Header className={state}>
          <Title color={color}>
            <CardAnchor
              onMouseEnter={() => onHover(node.id)}
              onMouseLeave={() => onHover(undefined)}
              onClick={() => handleClick(node.id)}
            >
              <Name>{node.shortName || node.name}</Name>
            </CardAnchor>
          </Title>
        </Header>
        { true && (
        <Body>
          <MainValue>
            <Label>
              { isForecast ? t('table-scenario-forecast') : t('table-historical')} {endYear}
            </Label>
            {beautifyValue(goalOutcomeValue)}
            <MainUnit dangerouslySetInnerHTML={{ __html: unit || '' }} />
            { change && (
              <Status>
                <Label>{t('change-over-time') } {startYear} - {endYear}</Label>
                {change > 0 && <span>+</span>}
                {change ? <span>{`${change}%`}</span> : <span>-</span>}
              </Status>
            )}
          </MainValue>
        </Body>
        )}
      </DashCard>
    </CardContainer>
  );
};

export default OutcomeCard;
