import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Button, ButtonGroup } from 'reactstrap';
import { BarChartFill, InfoSquare } from 'react-bootstrap-icons';
import { lighten } from 'polished';
import styled from 'styled-components';

// Plotly doesn't work with SSR
const DynamicPlot = dynamic(() => import('react-plotly.js'),
    { ssr: false });

const TabButton = styled(Button)`
  padding-top: 0.2rem;
  padding-bottom: 0.4rem;
`;

const EmissionsGraph = (props) => {
  const { sector, subSectors, color, year } = props;
  const historicalValues = [];
  const forecastValues = [];
  const historicalDates = [];
  const forecastDates = [];
  const shapes = [];

  sector.metric.historicalValues.forEach((dataPoint) => {
    historicalValues.push(dataPoint.value);
    historicalDates.push(dataPoint.year);
  })

  forecastValues.push(historicalValues[historicalValues.length-1]);
  forecastDates.push(historicalDates[historicalDates.length-1]);

  sector.metric.forecastValues.forEach((dataPoint) => {
    forecastValues.push(dataPoint.value);
    forecastDates.push(dataPoint.year);
  })

  const plotData = [
    {
      x: historicalDates,
      y: historicalValues,
      name: sector.name,
      type: 'scatter',
      fill: 'tozeroy',
      mode: 'none',
      fillcolor: sector.color || color,
    },
    {
      x: forecastDates,
      y: forecastValues,
      name: `${sector.name} (pred)`,
      type: 'scatter',
      fill: 'tozeroy',
      mode: 'none',
      fillcolor: lighten(0.2, sector.color || color),
    },
  ];

  const todaymarker =
  {
    type: 'line',
    yref: 'paper',
    x0: year,
    y0: 0,
    x1: year,
    y1: 1,
    line: {
      color: '#999999',
      width: 2,
      dash: "dot",
    }
  };

  shapes.push(todaymarker);

  const layout = {
    height: 300,
    margin: {
      t: 24,
      r: 48,
      b: 48,
    },
    xaxis: {
    },
    yaxis: {
      title: {
        text: sector.metric.unit,
      },
    },
    yaxis2: {
      overlaying: 'y',
      side: 'right'
    },
    autosize: true,
    font: {
      family: 'Inter',
    },
    paper_bgcolor: 'rgba(0,0,0,0)',
    showlegend: false,
    shapes,
  }

  return (
    <DynamicPlot
      data={plotData}
      layout={layout}
      useResizeHandler
      style={{width: '100%'}}
      config={{displayModeBar: false}}
    />
  )
}

const EmissionSectorContent = (props) => {
  const { sector, subSectors, color, year } = props;
  const [activeTabId, setActiveTabId] = useState(undefined);

  return (
    <div>
      <ButtonGroup>
        <TabButton color="light" onClick={() => setActiveTabId('graph')} active={activeTabId === 'graph'}><BarChartFill /></TabButton>
        <TabButton color="light" onClick={() => setActiveTabId(undefined)} active={activeTabId === undefined}><InfoSquare /></TabButton>
      </ButtonGroup> 
      <div>
        { activeTabId === 'graph' && (
          <EmissionsGraph
            sector={sector}
            subSectors={subSectors}
            color={color}
            year={year}
          />
        )}
      </div>
    </div>
  );
};

export default EmissionSectorContent;