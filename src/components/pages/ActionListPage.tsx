import { useEffect, useMemo, useState } from 'react';

import { useQuery, useReactiveVar } from '@apollo/client';
import type {
  GetActionListQuery,
  GetActionListQueryVariables,
  GetPageQuery,
} from 'common/__generated__/graphql';
import { activeGoalVar, activeScenarioVar, yearRangeVar } from 'common/cache';
import { useInstance } from 'common/instance';
import { summarizeYearlyValuesBetween } from 'common/preprocess';
import ContentLoader from 'components/common/ContentLoader';
import GraphQLError from 'components/common/GraphQLError';
import Icon from 'components/common/icon';
import { PageHero } from 'components/common/PageHero';
import ScenarioBadge from 'components/common/ScenarioBadge';
import ActionsComparison from 'components/general/ActionsComparison';
import ActionsList from 'components/general/ActionsList';
import ActionsMac from 'components/general/ActionsMac';
import SettingsPanelFull from 'components/general/SettingsPanelFull';
import type { TFunction } from 'i18next';
import { useTranslation } from 'next-i18next';
import { GET_ACTION_LIST } from 'queries/getActionList';
import { Button, ButtonGroup, Col, Container, FormGroup, Input, Label, Row } from 'reactstrap';
import styled from 'styled-components';
import type { ActionWithEfficiency, SortActionsBy, SortActionsConfig } from 'types/actions.types';

import type { PageRefetchCallback } from './Page';

const SettingsForm = styled.form`
  display: block;
  margin: 1.5rem 0;
  padding: 0.5rem 0;
  border-top: 1px solid ${(props) => props.theme.graphColors.blue030};
  border-bottom: 1px solid ${(props) => props.theme.graphColors.blue030};
`;

const ActionCount = styled.div`
  padding: ${({ theme }) => theme.spaces.s100} 0;
  color: ${({ theme }) => theme.themeColors.white};

  span {
    margin-left: 1rem;
  }
`;

const StyledFormGroup = styled(FormGroup)`
  width: 100%;
`;

const SortButtons = styled(ButtonGroup)`
  button {
    padding-top: 0.4rem;
    padding-bottom: 0.4rem;
  }

  .icon {
    vertical-align: middle;
  }
`;

const ActionsViewTabs = styled.div`
  background-color: ${(props) => props.theme.brandDark};
  margin-bottom: ${(props) => props.theme.spaces.s400};
`;

const Tab = styled.button`
  background: ${(props) => props.theme.brandDark};
  color: ${(props) => props.theme.themeColors.white};
  display: inline-block;
  border: none;
  margin: 0;
  padding: ${(props) =>
    `${props.theme.spaces.s050} ${props.theme.spaces.s150} ${props.theme.spaces.s100}`};
  text-decoration: none;
  cursor: pointer;
  text-align: center;

  &:hover,
  &:focus {
    color: ${(props) => props.theme.brandLight};
  }
  &.active {
    color: ${(props) => props.theme.graphColors.blue070};
    background: ${(props) => props.theme.graphColors.grey030};
    &:hover {
      color: ${(props) => props.theme.themeColors.black};
    }
  }

  .icon {
    width: 1.5rem !important;
    height: 1.5rem !important;
    vertical-align: middle;
  }
`;

const getSortOptions = (
  t: TFunction,
  hasEfficiency: boolean,
  showAccumulatedEffects: boolean
): SortActionsConfig[] => [
  {
    key: 'STANDARD',
    label: t('actions-sort-default'),
  },
  {
    isHidden: !hasEfficiency,
    key: 'CUM_EFFICIENCY',
    label: t('actions-sort-efficiency'),
    sortKey: 'cumulativeEfficiency',
  },
  {
    isHidden: !showAccumulatedEffects,
    key: 'CUM_IMPACT',
    label: t('actions-sort-cumulative-impact'),
  },
  {
    key: 'IMPACT',
    label: t('actions-sort-impact'),
    sortKey: 'impactOnTargetYear',
  },
  {
    isHidden: !hasEfficiency,
    key: 'CUM_COST',
    label: t('actions-sort-cost'),
    sortKey: 'cumulativeCost',
  },
];

type ActionListPageProps = {
  page: NonNullable<GetPageQuery['page']> & {
    __typename: 'ActionListPage';
  };
  refetch: PageRefetchCallback;
};

function ActionListPage({ page }: ActionListPageProps) {
  const { t } = useTranslation();
  const instance = useInstance();
  const activeGoal = useReactiveVar(activeGoalVar);
  const queryResp = useQuery<GetActionListQuery, GetActionListQueryVariables>(GET_ACTION_LIST, {
    variables: {
      goal: activeGoal?.id ?? null,
    },
    fetchPolicy: 'cache-and-network',
  });
  const { error, loading, previousData } = queryResp;
  const activeScenario = useReactiveVar(activeScenarioVar);
  const yearRange = useReactiveVar(yearRangeVar);

  const data = queryResp.data ?? previousData;
  const hasEfficiency = data ? data.actionEfficiencyPairs.length > 0 : false;

  const sortOptions = getSortOptions(t, hasEfficiency, !!instance.features.showAccumulatedEffects);

  const [listType, setListType] = useState('list');
  const [ascending, setAscending] = useState(true);
  const [sortBy, setSortBy] = useState<SortActionsConfig>(
    sortOptions.find((sortOption) => sortOption.key === page.defaultSortOrder) ?? sortOptions[0]
  );
  const [activeEfficiency, setActiveEfficiency] = useState<number>(0);
  const [actionGroup, setActionGroup] = useState<'ALL_ACTIONS' | string>('ALL_ACTIONS');

  // Different default view if we have action efficiency pairs
  useEffect(() => {
    if (loading === false && data && hasEfficiency) {
      setListType('mac');
      setSortBy(sortOptions.find((option) => option.key === 'CUM_EFFICIENCY') ?? sortOptions[0]);
    }
  }, [loading, data, hasEfficiency]);

  const filteredActions = (data?.actions || []).filter(
    (action) =>
      !page.showOnlyMunicipalActions ||
      (page.showOnlyMunicipalActions && action.decisionLevel === 'MUNICIPALITY')
  );

  const usableActions: ActionWithEfficiency[] = useMemo(
    () =>
      filteredActions
        .map((act) => {
          // If we have action efficiency pairs, we augment the actions with the cumulative values
          const reductionText = `(${t('reduction')}, ${t(
            'accumulated-between'
          )} ${yearRange[0]}-${yearRange[1]})`;

          const out: ActionWithEfficiency = {
            ...act,
            impactOnTargetYear:
              [
                ...(act.impactMetric?.historicalValues ?? []),
                ...(act.impactMetric?.forecastValues ?? []),
              ].find((dataPoint) => dataPoint.year === yearRange[1])?.value ?? 0,
          };

          const efficiencyType = data?.actionEfficiencyPairs[activeEfficiency];
          const efficiencyAction = efficiencyType?.actions.find((a) => a.action.id === act.id);

          if (!efficiencyType || !efficiencyAction) return out;

          out.cumulativeImpact =
            (efficiencyType.invertImpact ? -1 : 1) *
            summarizeYearlyValuesBetween(efficiencyAction.impactValues, yearRange[0], yearRange[1]);
          out.cumulativeCost =
            (efficiencyType.invertCost ? -1 : 1) *
            summarizeYearlyValuesBetween(efficiencyAction.costValues, yearRange[0], yearRange[1]);
          out.efficiencyDivisor = efficiencyAction.efficiencyDivisor ?? undefined;
          if (out.efficiencyDivisor !== undefined)
            out.cumulativeEfficiency =
              out.cumulativeCost / Math.abs(out.cumulativeImpact) / out.efficiencyDivisor;

          const efficiencyProps: Partial<ActionWithEfficiency> = {
            cumulativeImpactUnit: efficiencyType?.impactUnit.htmlShort,
            cumulativeImpactName: `${efficiencyType?.impactNode?.name} ${
              data.actionEfficiencyPairs[activeEfficiency]?.invertImpact ? reductionText : ''
            }`,
            cumulativeCostUnit: efficiencyType?.costUnit.htmlShort,
            cumulativeCostName: efficiencyType?.costNode?.name,
            cumulativeEfficiencyUnit: efficiencyType?.efficiencyUnit.htmlShort,
            cumulativeEfficiencyName: efficiencyType?.label,
            efficiencyCap: efficiencyType?.plotLimitEfficiency ?? undefined,
          };
          Object.assign(out, efficiencyProps);
          return out;
        })
        .filter((action) => actionGroup === 'ALL_ACTIONS' || actionGroup === action.group?.id),
    [data, actionGroup, activeEfficiency, yearRange]
  );

  const actionGroups = filteredActions.reduce(
    (groups: NonNullable<ActionWithEfficiency['group']>[], action) =>
      !action.group || groups.find((group) => group.id === action.group?.id)
        ? groups
        : [...groups, action.group],
    []
  );

  const handleChangeSort = (sortBy: SortActionsBy) => {
    const selectedSorter = sortOptions.find((option) => option.key === sortBy);

    setSortBy(selectedSorter ?? sortOptions[0]);
  };

  if (error) {
    return (
      <Container className="pt-5">
        <GraphQLError error={error} />
      </Container>
    );
  }

  if (!data) {
    return <ContentLoader fullPage />;
  }

  return (
    <>
      <PageHero
        title={t('actions')}
        leadTitle={page.actionListLeadTitle ?? undefined}
        leadDescription={page.actionListLeadParagraph ?? undefined}
      >
        <SettingsForm className="text-light mt-4">
          <Row>
            {hasEfficiency && (
              <Col md={4} className="d-flex">
                <StyledFormGroup>
                  <Label for="impact">{t('actions-impact-on')}</Label>
                  <Input
                    id="impact"
                    name="select"
                    type="select"
                    onChange={(e) => setActiveEfficiency(Number(e.target.value))}
                  >
                    {data.actionEfficiencyPairs.map((impactGroup, indx) => (
                      <option value={indx} key={indx}>
                        {impactGroup.label}
                      </option>
                    ))}
                  </Input>
                </StyledFormGroup>
              </Col>
            )}
            {actionGroups.length > 1 && (
              <Col md={4} className="d-flex">
                <StyledFormGroup>
                  <Label for="type">{t('actions-group-type')}</Label>
                  <Input
                    id="type"
                    name="select"
                    type="select"
                    onChange={(e) => setActionGroup(e.target.value)}
                  >
                    <option value="ALL_ACTIONS">{t('action-groups-all')}</option>
                    {actionGroups.map((actionGroup) => (
                      <option value={actionGroup.id} key={actionGroup.id}>
                        {actionGroup.name}
                      </option>
                    ))}
                  </Input>
                </StyledFormGroup>
              </Col>
            )}
            <Col md={4} className="d-flex">
              <div className="d-flex align-items-end me-3">
                <FormGroup>
                  <Label for="sort">{t('actions-sort-by')}</Label>
                  <Input
                    id="sort"
                    name="select"
                    type="select"
                    onChange={(e) => handleChangeSort(e.target.value as SortActionsBy)}
                  >
                    {sortOptions.map(
                      (sortOption) =>
                        !sortOption.isHidden && (
                          <option
                            key={sortOption.key}
                            value={sortOption.key}
                            selected={sortBy.key === sortOption.key}
                          >
                            {sortOption.label}
                          </option>
                        )
                    )}
                  </Input>
                </FormGroup>
              </div>
              <div className="d-flex align-items-end">
                <FormGroup>
                  <SortButtons>
                    <Button
                      color="white"
                      outline
                      onClick={(e) => setAscending(true)}
                      active={ascending === true}
                      aria-label={t('sort-ascending')}
                    >
                      <Icon name="arrowUpWideShort" width="1.5rem" height="1.5rem" />
                    </Button>
                    <Button
                      color="white"
                      outline
                      onClick={(e) => setAscending(false)}
                      active={ascending === false}
                      aria-label={t('sort-descending')}
                    >
                      <Icon name="arrowDownShortWide" width="1.5rem" height="1.5rem" />
                    </Button>
                  </SortButtons>
                </FormGroup>
              </div>
            </Col>
          </Row>
        </SettingsForm>
        <ActionCount>
          <ScenarioBadge>
            {t('scenario')}: {activeScenario?.name}
          </ScenarioBadge>
          <div>{t('actions-count', { count: usableActions.length })}</div>
        </ActionCount>
      </PageHero>
      <ActionsViewTabs>
        <Container fluid="lg">
          <div role="tablist">
            <Tab
              className={`nav-link ${listType === 'list' ? 'active' : ''}`}
              onClick={() => setListType('list')}
              role="tab"
              tabIndex={0}
              aria-selected={listType === 'list'}
              aria-controls="list-view"
              id="list-tab"
            >
              <Icon name="grid" /> {t('actions-as-list')}
            </Tab>
            {hasEfficiency ? (
              <Tab
                className={`nav-link ${listType === 'mac' ? 'active' : ''}`}
                onClick={() => setListType('mac')}
                role="tab"
                tabIndex={0}
                aria-selected={listType === 'mac'}
                aria-controls="efficiency-view"
                id="list-tab"
              >
                <Icon name="chartColumn" /> {t('actions-as-efficiency')}
              </Tab>
            ) : (
              <Tab
                className={`nav-link ${listType === 'comparison' ? 'active' : ''}`}
                onClick={() => setListType('comparison')}
                role="tab"
                tabIndex={0}
                aria-selected={listType === 'comparison'}
                aria-controls="comparison-view"
                id="list-tab"
              >
                <Icon name="chartColumn" /> {t('actions-as-comparison')}
              </Tab>
            )}
          </div>
        </Container>
      </ActionsViewTabs>
      <Container fluid="lg" className="mb-5">
        <Row>
          <Col>
            {listType === 'list' && (
              <ActionsList
                id="list-view"
                actions={usableActions}
                displayType="displayTypeYearly"
                yearRange={yearRange}
                sortBy={sortBy}
                sortAscending={ascending}
                refetching={loading}
              />
            )}
            {listType === 'mac' && (
              <ActionsMac
                id="efficiency-view"
                actions={usableActions}
                actionEfficiencyPairs={data.actionEfficiencyPairs[activeEfficiency]}
                t={t}
                actionGroups={data.instance.actionGroups}
                sortBy={sortBy.sortKey}
                sortAscending={ascending}
                refetching={loading}
              />
            )}
            {listType === 'comparison' && (
              <ActionsComparison
                id="comparison-view"
                actions={usableActions}
                actionGroups={data.instance.actionGroups}
                sortBy={sortBy.sortKey}
                sortAscending={ascending}
                refetching={loading}
                displayYears={yearRange}
              />
            )}
          </Col>
        </Row>
      </Container>
      <SettingsPanelFull />
    </>
  );
}

export default ActionListPage;
