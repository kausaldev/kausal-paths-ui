import { Table } from 'reactstrap';
import Styled from 'styled-components';
import { getMetricValue, getOutcomeTotal } from 'common/preprocess';

const TableWrapper = Styled.div`
  margin: 0 auto;
  max-width: 100%;
  overflow-x: auto;
  overflow-y: visible;
  width: calc(100% - 1rem);
  bottom: -1rem;
  max-height: 100%;
  z-index: 1;
  scroll-behavior: smooth;
  font-size: 70%;
`;

const DataTable = (props) => {
  const { node, subNodes, startYear, endYear } = props;

  const historicalValues = node.metric.historicalValues.filter((value) => value.year >= startYear && value.year <= endYear);
  const forecastValues = node.metric.forecastValues.filter((value) => value.year >= startYear && value.year <= endYear);

  return (
    <TableWrapper>
      <h5>{ node.name }</h5>
      <Table bordered size="sm" responsive>
        <thead>
          <tr>
            <th>Year</th>
            <th>Type</th>
            { subNodes?.map((subNode) => (
              <th key={subNode.id}>{subNode.name}</th>
            ))}
            <th>{node.metric.name}</th>
            <th>Unit</th>
          </tr>
        </thead>
        <tbody>
          { historicalValues.map((metric) => (
            <tr key={metric.year}>
              <td>{metric.year}</td>
              <td>Historical</td>
              { subNodes?.map((subNode) => (
                <td key={`${subNode.id}-${metric.year}`}>
                  { subNode.metric.historicalValues.find((value) => value.year === metric.year) ? subNode.metric.historicalValues.find((value) => value.year === metric.year).value : '-'}
                </td>
              ))}
              <td>{metric.value}</td>
              <td dangerouslySetInnerHTML={{ __html: node.metric?.unit?.htmlShort }} />
            </tr>
          ))}
          { forecastValues.map((metric) => (
            <tr key={metric.year}>
              <td>{metric.year}</td>
              <td>Forecast</td>
              { subNodes?.map((subNode) => (
                <td key={`${subNode.id}-${metric.year}`}>
                  { subNode.metric.forecastValues.find((value) => value.year === metric.year) ? subNode.metric.forecastValues.find((value) => value.year === metric.year).value : '-'}
                </td>
              ))}
              <td>{metric.value}</td>
              <td dangerouslySetInnerHTML={{ __html: node.metric?.unit?.htmlShort }} />
            </tr>
          ))}
        </tbody>
      </Table>
    </TableWrapper>
  );
};

export default DataTable;