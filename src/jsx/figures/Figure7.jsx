import React, {
  forwardRef,
  useCallback,
  useEffect,
  useRef
} from 'react';
import PropTypes from 'prop-types';
import {
  select, scaleLinear, scaleBand
} from 'd3';
import { useIsVisible } from 'react-is-visible';

import data from './data/figure7_data.json';

const HorizontalBarChart = forwardRef(({ value, dimensions }, ref) => {
  const svgRef = useRef();
  const svgContainerRef = useRef();
  const chartRef = useRef();
  const isVisible = useIsVisible(chartRef, { once: true });

  const chart = useCallback(() => {
    if (!svgRef.current) return;
    if (!value) return;

    let { height } = dimensions;
    const { width } = dimensions;
    height = Math.min(height - 400, 600);
    const margin = {
      top: 40, right: 40, bottom: 40, left: 40
    };
    const svg = select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height]);

    // --- scales ---
    const xScale = scaleLinear()
      .domain([0, Math.max(...data.map(d => d.value))])
      .range([0, width / 2 - margin.left]); // leave margin for labels

    const yScale = scaleBand()
      .domain(data.map((d, i) => i))
      .range([0, height])
      .padding(0.4);

    // --- axes ---
    const barsG = svg.selectAll('.bar-group')
      .data(data)
      .join('g')
      .attr('class', 'bar-group')
      .attr('transform', (d, i) => `translate(${width / 2 - 100}, ${yScale(i)})`);

    barsG.selectAll('rect')
      .data(d => [d])
      .join('rect')
      .attr('class', 'bar')
      .attr('height', yScale.bandwidth())
      .attr('width', d => xScale(d.value))
      .attr('fill', '#009edb');

    // --- value at end of bar ---
    barsG.selectAll('.bar-value')
      .data(d => [d])
      .join('text')
      .attr('class', 'bar-value')
      .attr('x', d => xScale(d.value) - 50)
      .attr('y', yScale.bandwidth() / 2 + 2)
      .attr('dominant-baseline', 'middle')
      .text(d => `${d.value}%`);

    // --- labels ---
    barsG.selectAll('.bar-label')
      .data(d => [d])
      .join('text')
      .attr('class', 'bar-label')
      .attr('x', -10)
      .attr('y', yScale.bandwidth() / 2 - 10)
      .attr('text-anchor', 'end')
      .attr('dominant-baseline', 'middle')
      .html(d => `<tspan class="title">${d.title}</tspan><tspan x="-10" dy="1.2em" class="subtitle">${d.subtitle}</tspan>`);
  }, [value, dimensions]);

  useEffect(() => {
    if (!svgRef.current && svgContainerRef.current) {
      const svg = select(svgContainerRef.current).append('svg');
      svgRef.current = svg.node();
    }
    if (isVisible) chart();
  }, [chart, isVisible]);

  return (
    <div ref={chartRef}>
      <div className="app" ref={ref}>
        {isVisible && <div className="svg_container figure" ref={svgContainerRef} />}
      </div>
    </div>
  );
});

HorizontalBarChart.propTypes = {
  dimensions: PropTypes.shape({
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired
  }).isRequired,
  value: PropTypes.string.isRequired
};

export default HorizontalBarChart;
