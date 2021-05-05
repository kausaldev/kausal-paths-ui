import { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link'
import { Button, ButtonGroup } from 'reactstrap';
import { BarChartFill, InfoSquare, Journals } from 'react-bootstrap-icons';
import { lighten } from 'polished';
import styled from 'styled-components';

// Plotly doesn't work with SSR
const DynamicPlot = dynamic(() => import('react-plotly.js'),
    { ssr: false });

const TabButton = styled(Button)`
  padding-top: 0.2rem;
  padding-bottom: 0.4rem;
`;

const TabText = styled.div`
  max-width: 640px;
  margin-bottom: 2rem;
`;

const EmissionsGraph = (props) => {
  const { sector, subSectors, color, year } = props;

  const shapes = [];
  const plotData = [];

  const displaySectors = subSectors?.length > 1 ? subSectors : sector && [sector];

  displaySectors?.forEach((sector, index) => {
    const historicalValues = [];
    const forecastValues = [];
    const historicalDates = [];
    const forecastDates = [];
    sector.metric.historicalValues.forEach((dataPoint) => {
      historicalValues.push(dataPoint.value);
      historicalDates.push(dataPoint.year);
    });
    plotData.push(
      {
        x: historicalDates,
        y: historicalValues,
        name: sector.name,
        type: 'scatter',
        fill: 'tonexty',
        mode: 'none',
        fillcolor: sector.color || color,
        stackgroup: 'group1',
      }
    );
    sector.metric.forecastValues.forEach((dataPoint) => {
      forecastValues.push(dataPoint.value);
      forecastDates.push(dataPoint.year);
    });
    forecastValues.push(historicalValues[historicalValues.length-1]);
    forecastDates.push(historicalDates[historicalDates.length-1]);
    plotData.push(
      {
        x: forecastDates,
        y: forecastValues,
        name: `${sector.name} (pred)`,
        type: 'scatter',
        fill: 'tonexty',
        mode: 'none',
        fillcolor: lighten(0.2, sector.color || color),
        stackgroup: 'group2',
      }
    )
  });

  const todaymarker =
  {
    type: 'line',
    yref: 'paper',
    x0: year,
    y0: 0,
    x1: year,
    y1: 1,
    line: {
      color: '#D46262',
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
  const [activeTabId, setActiveTabId] = useState('graph');

  return (
    <div>
      <div>
        { activeTabId === 'graph' && (
          <EmissionsGraph
            sector={sector}
            subSectors={subSectors}
            color={color}
            year={year}
          />
        )}
        { activeTabId === 'info' && (
          <TabText>
            <h5>Kuvaus</h5>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
            <h6><Journals size={24} className="mr-2" /> Päästöihin vaikuttavat toimenpiteet</h6>
            <ul>
              <li><Link href="/actions/naistenlahti3"><a>Toimenpide 1</a></Link></li>
              <li><Link href="/actions/other_renewable_district_heating"><a>Toimenpide 2</a></Link></li>
            </ul>
          </TabText>
        )}
      </div>
      <ButtonGroup>
        <TabButton color="light" onClick={() => setActiveTabId(activeTabId === 'graph' ? undefined : 'graph')} active={activeTabId === 'graph'}><BarChartFill /></TabButton>
        <TabButton color="light" onClick={() => setActiveTabId(activeTabId === 'info' ? undefined : 'info')} active={activeTabId === 'info'}><InfoSquare /></TabButton>
      </ButtonGroup> 
    </div>
  );
};

export default EmissionSectorContent;
