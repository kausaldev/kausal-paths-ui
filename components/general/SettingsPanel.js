import { useContext, useState } from 'react';
import { gql, useMutation, useReactiveVar } from '@apollo/client';
import styled from 'styled-components';
import { Container, Row, Col,
  FormGroup, Label, Input, CustomInput, Button } from 'reactstrap';
import { Sliders } from 'react-bootstrap-icons';
import RangeSelector from 'components/general/RangeSelector';
import SiteContext from 'context/site';
import { GET_SCENARIOS } from 'common/queries/getScenarios';
import { yearRangeVar, settingsVar, activeScenarioVar } from 'common/cache';
import ScenarioSelector from './ScenarioSelector';
import TotalEmissionsBar from './TotalEmissionsBar';

const FixedPanel = styled.div`
  position: fixed;
  z-index: 255;
  left: 0;
  bottom: 0;
  width: 100%;
  background-color: ${(props) => props.theme.graphColors.grey000};
  color: ${(props) => props.theme.graphColors.grey090};
  box-shadow: 0 0 4px 4px rgba(20,20,20,0.05);
`;

const SettingsButton = styled(Button)`
  position: absolute;
  width: 3rem;
  height: 3rem;
  border-radius: 1.5rem;
  padding: 0;
  bottom: -12px;
  right: 50%;
  box-shadow: 3px 3px 12px rgba(33,33,33,0.15);
`;

const MainSettingsSection = styled.div`
  position: relative;
  padding: 1rem 0 1.5rem;
`;

const ExtraSettingsSection = styled.div`
  padding: 1rem 0 2rem;
  background-color: ${(props) => props.theme.graphColors.grey020};
  display: ${(props) => props.visible ? 'block' : 'none'};

  .form-group {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
  }
  label {
    font-size: ${(props) => props.theme.fontSizeSm};
    line-height: 1;
    overflow-wrap: break-word;
    max-width: 100%;
  }
`;

const SET_PARAMETER = gql`
  mutation SetParameter($parameterId: ID!, $boolValue: Boolean, $numberValue: Float, $stringValue: String) {
    setParameter(id: $parameterId, boolValue: $boolValue, numberValue: $numberValue, stringValue: $stringValue) {
      ok
      parameter {
        isCustomized
        ... on BoolParameterType {
        boolValue: value
        boolDefaultValue: defaultValue
      }
      }
    }
  }
`;

const ParameterWidget = (props) => {
  const { parameterContent: parameter } = props;
  const activeScenario = useReactiveVar(activeScenarioVar);

  const [SetParameter, { loading: mutationLoading, error: mutationError }] = useMutation(SET_PARAMETER, {
    refetchQueries: [
      { query: GET_SCENARIOS },
    ],
    onCompleted: () => {
      activeScenarioVar({ ...activeScenario, stamp: Date.now() });
    },
  });

  const handleUserSelection = (evt) => {
    SetParameter({ variables: evt });
  };

  switch(parameter.__typename) { 
    case 'NumberParameterType': return (
      <Col lg="2" md="3" sm="4" xs="6">
          <FormGroup>
          <Label for={parameter.id}>
            {parameter.label || parameter.id}
          </Label>
          <Input
            id={parameter.id}
            name={parameter.id}
            placeholder={mutationLoading ? 'loading' : parameter.numberValue}
            type="text"
            bsSize="sm"
            onChange={(e) => handleUserSelection({ parameterId: parameter.id, numberValue: e.target.value })}
          />
        </FormGroup>
      </Col>);
    case 'StringParameterType': return (
      <Col lg="2" md="3" sm="4" xs="6">
          <FormGroup>
          <Label for={parameter.id}>
            {parameter.label || parameter.id}
          </Label>
          <Input
            id={parameter.id}
            name={parameter.id}
            placeholder={mutationLoading ? 'loading' : parameter.stringValue}
            type="text"
            bsSize="sm"
            onChange={(e) => handleUserSelection({ parameterId: parameter.id, stringValue: e.target.value })}
          />
        </FormGroup>
      </Col>);
    case 'BoolParameterType': return (
      <Col lg="2" md="3" sm="4" xs="6">
      <FormGroup>
        <Label for={parameter.id}>
          {parameter.label || parameter.id}
        </Label>
        <CustomInput
          type="switch"
          id={parameter.id}
          name={parameter.id}
          checked={parameter.boolValue}
          onChange={(e) => handleUserSelection({ parameterId: parameter.id, boolValue: !parameter.boolValue })}
        />
        </FormGroup>
      </Col>);
    default: return null;
  };
}
const SettingsPanel = (props) => {
  const { defaultYearRange } = props;
  const settings = useReactiveVar(settingsVar);
  const site = useContext(SiteContext);
  const [showExtras, setShowExtras] = useState(false);

  const toggleExtras = (e) => {

  };

  return (
    <FixedPanel expanded>
      <MainSettingsSection>
      <Container>
        <Row>
          <Col md="4" sm="4" xs="8">
            { site.showScenarios && (
            <ScenarioSelector />
            )}
          </Col>
          <Col md="2" sm="3" xs="4">
            {site.showYearSelector && (
            <RangeSelector
              min={settings.minYear}
              max={settings.maxYear}
              initMin={defaultYearRange[0]}
              initMax={defaultYearRange[1]}
              baseYear={ site.useBaseYear && settings.baseYear}
              handleChange={yearRangeVar}
            />
            )}
          </Col>
          <SettingsButton
            onClick={(e) => setShowExtras(!showExtras)}
            color="white"
          >
            <Sliders />
          </SettingsButton>
          <Col md="6" sm="5" xs="12" className="mt-3 mt-sm-0">
            { site.showTargetBar
            && <TotalEmissionsBar /> }
          </Col>
        </Row>
        </Container>
        </MainSettingsSection>
        <ExtraSettingsSection
          visible={showExtras}
        >
          <Container>
            <Row>
              {settings?.parameters.map((param) => 
                <ParameterWidget parameterContent={param} key={param.id}/>
              )}
            </Row>
          </Container>
        </ExtraSettingsSection>
    </FixedPanel>
  );
};

export default SettingsPanel;
