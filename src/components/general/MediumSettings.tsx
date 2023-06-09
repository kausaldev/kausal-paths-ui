import { useCallback, useContext, useState } from 'react';
import { useReactiveVar } from '@apollo/client';
import { Range, getTrackBackground } from 'react-range';
import { Row, Col, ButtonToggle, Popover, PopoverBody } from 'reactstrap';
import * as Icon from 'react-bootstrap-icons';
import styled, { useTheme } from 'styled-components';
import { useTranslation } from 'next-i18next';
import { useSite } from 'context/site';
import { yearRangeVar } from 'common/cache';
import { useInstance } from 'common/instance';
import ScenarioSelector from 'components/general/ScenarioSelector';
import Button from 'components/common/Button';
import RangeSelector from 'components/general/RangeSelector';
import GoalSelector from 'components/general/GoalSelector';
import GoalOutcomeBar from 'components/general/GoalOutcomeBar';

const PopoverWrapper = styled.div`
  .btn {
    width: 100%;
    text-align: left;
    white-space: nowrap;
    overflow: hidden;
    font-weight: 400;
  }
`;

const ButtonLabel = styled.div`
  white-space: nowrap;
  font-size: 0.8rem;
`;


const MediumSettings = (props) => {
  if (!(process.browser)) {
    return null;
  }
  const site = useSite();
  const instance = useInstance();

  const [popoverOpen, setPopoverOpen] = useState(false);
  const toggle = () => setPopoverOpen(!popoverOpen);

  // State of display settings
  // Year range
  const defaultYearRange = props.defaultYearRange ?? [site.minYear, site.targetYear];
  const yearRange = useReactiveVar(yearRangeVar);
  const setYearRange = useCallback((newRange: [number, number]) => {
    yearRangeVar(newRange);
  }, [yearRangeVar]);
  const { t } = useTranslation();

  // Target
  const nrGoals = instance.goals.length;

  // Normalization
  const availableNormalizations = site.availableNormalizations;
  return (
<>
          <Row>
            <Col md="2" sm="4" xs="12">
              { true && (
              <ScenarioSelector />
              )}
            </Col>
            <Col md="2" sm="4" xs="6">
              {true && (
              <PopoverWrapper>
              <ButtonLabel>{t('comparing-years')}</ButtonLabel>
              <Button id="Popover1" type="button" color="light">
                {`${yearRangeVar[0]} – ${yearRangeVar[1]}`}
              </Button>
              <Popover
                placement="bottom"
                isOpen={popoverOpen}
                target="Popover1"
                toggle={toggle}
                trigger="legacy"
              >
                  <PopoverBody>
                  <RangeSelector
                    min={site.minYear}
                    max={site.maxYear}
                    initMin={defaultYearRange[0]}
                    initMax={defaultYearRange[1]}
                    baseYear={instance.referenceYear ?? site.baseYear}
                    handleChange={setYearRange}
                  />
                  </PopoverBody>
                </Popover>
              </PopoverWrapper>
              )}
            </Col>
            <Col md="2" sm="4" xs="6">
              { nrGoals > 1 && (
                <GoalSelector />
              )}
            </Col>
            <Col md="6" sm="12" className="mt-3 mt-sm-0">
              { true && 
                <GoalOutcomeBar />
              }
            </Col>
          </Row>
        </>
  );

}

export default MediumSettings;