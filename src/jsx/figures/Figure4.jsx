import React, {
  useEffect, useRef, useState, useCallback, forwardRef
} from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import 'intersection-observer';
import { useIsVisible } from 'react-is-visible';

const TwoLineChart = forwardRef(({ value }, ref) => {
  const svgRef = useRef();
  const svgContainerRef = useRef();
  const chartRef = useRef();
  const isVisible = useIsVisible(chartRef, { once: true });

  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: 320,
  });

  const nPoints = 100;

  useEffect(() => {
    const handleResize = () => setDimensions({ width: window.innerWidth, height: 320 });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const chart = useCallback(() => {
    if (!svgRef.current) return;

    // Fixed datasets for hand-drawn effect
    const line1Data = [
      51, 50, 52, 51, 50, 49, 52, 50, 51, 50, 51, 52, 50, 51, 49, 50, 51, 50, 52, 51,
      50, 51, 50, 52, 50, 51, 49, 50, 51, 50, 51, 50, 52, 51, 50, 51, 50, 51, 49, 50,
      51, 50, 51, 50, 52, 51, 50, 51, 50, 51, 49, 50, 51, 50, 51, 50, 52, 50, 51, 50,
      51, 49, 50, 51, 50, 51, 50, 52, 50, 51, 50, 51, 50, 51, 49, 50, 51, 50, 51, 50,
      70, 72, 75, 73, 74, 76, 77, 78, 80, 82, 81, 83, 85, 84, 86, 87, 88, 89, 90, 92
    ];

    const line2Data = [
      50, 51, 50, 52, 51, 50, 51, 50, 52, 50, 51, 50, 51, 50, 51, 50, 51, 50, 51, 50,
      51, 50, 51, 50, 51, 50, 51, 50, 51, 50, 51, 50, 51, 50, 51, 50, 51, 50, 51, 50,
      51, 50, 51, 50, 51, 50, 51, 50, 51, 50, 51, 50, 51, 50, 51, 50, 51, 50, 51, 50,
      45, 44, 42, 41, 43, 40, 39, 38, 37, 36, 35, 34, 32, 31, 33, 30, 29, 28, 27, 25,
      24, 23, 22, 21, 20, 19, 18, 17, 16, 15, 23, 22, 21, 20, 19, 18, 17, 16, 15, 16
    ];

    const { width, height } = dimensions;
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height]);

    const xScale = d3.scaleLinear().domain([0, nPoints - 1]).range([40, width - 40]);
    const yScale = d3.scaleLinear().domain([0, 100]).range([height - 40, 40]);

    const lineGen = d3.line()
      .x((d, i) => xScale(i))
      .y(d => yScale(d));

    const g = svg.selectAll('.chart-group').data([null]).join('g').attr('class', 'chart-group');

    const linesData = [
      {
        id: 'line1', values: line1Data, color: '#009edb', currentLimit: 0
      },
      {
        id: 'line2', values: line2Data, color: '#ffcb05', currentLimit: 0
      },
    ];

    const lineSel = g.selectAll('.line').data(linesData, d => d.id);

    const lineEnter = lineSel.enter()
      .append('path')
      .attr('class', 'line')
      .attr('fill', 'none')
      .attr('stroke-width', 3)
      .attr('stroke', d => d.color)
      .attr('opacity', 0)
      .attr('d', d => lineGen(d.values.slice(0, 0)))
      .each((d, i, nodes) => { nodes[i].currentLimit = 0; });

    const mergedLine = lineEnter.merge(lineSel);

    mergedLine
      .interrupt()
      .attr('opacity', 1)
      .transition()
      .duration(value === '1' ? 1200 : 1200) // tweak timing per stage
      .tween('draw', (d, i, nodes) => {
        const el = nodes[i];
        const startLimit = el.currentLimit;
        const endLimit = value === '1' ? 80 : 100;
        const interpolator = d3.interpolateNumber(startLimit, endLimit);

        return t => {
          el.currentLimit = interpolator(t);
          const sliceLimit = Math.round(el.currentLimit);
          d3.select(el).attr('d', lineGen(d.values.slice(0, sliceLimit)));
        };
      });

    // Remove lines if reverting to stage1
    lineSel.exit()
      .transition()
      .duration(500)
      .attr('opacity', 0)
      .remove();
  }, [value, dimensions]);

  useEffect(() => {
    if (!svgRef.current && svgContainerRef.current) {
      const svg = d3.select(svgContainerRef.current).append('svg');
      svgRef.current = svg.node();
    }
    if (isVisible) chart();
  }, [chart, isVisible, dimensions]);

  return (
    <div ref={chartRef}>
      <div className="app" ref={ref}>
        {isVisible && <div className="svg_container" ref={svgContainerRef} />}
      </div>
    </div>
  );
});

TwoLineChart.propTypes = {
  value: PropTypes.string.isRequired, // "1" or "2"
};

export default TwoLineChart;
