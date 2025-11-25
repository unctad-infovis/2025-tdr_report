import React, {
  useEffect, useRef, useState, useCallback, forwardRef
} from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import 'intersection-observer';
import { useIsVisible } from 'react-is-visible';
import rawData from './data/figure4_data.json';

const TwoLineChart = forwardRef(({ value }, ref) => {
  const svgRef = useRef();
  const svgContainerRef = useRef();
  const chartRef = useRef();
  const isVisible = useIsVisible(chartRef, { once: true });

  const [dimensions, setDimensions] = useState({
    height: 320,
    width: window.innerWidth
  });

  useEffect(() => {
    const handleResize = () => setDimensions({ height: 320, width: window.innerWidth });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const chart = useCallback(() => {
    if (!svgRef.current) return;

    // Fixed datasets for hand-drawn effect
    const data1 = rawData.map(((d, i) => ({ id: i, x: new Date(d.date), y: +d['30-year United States Treasury yield'] })));
    const data2 = rawData.map(((d, i) => ({ id: i, x: new Date(d.date), y: +d['United States dollar index'] })));

    const { height, width } = dimensions;
    const svg = d3.select(svgRef.current)
      .attr('height', height)
      .attr('width', width)
      .attr('viewBox', [0, 0, width, height]);

    const xScale = d3.scaleTime()
      .domain(d3.extent(data1, d => d.x))
      .range([40, width - 40]);

    const yScale1 = d3.scaleLinear()
      .domain([[d3.min(data1, d => d.y), d3.max(data1, d => d.y)]])
      .range([height - 40, 40]);
    const yScale2 = d3.scaleLinear()
      .domain([[d3.min(data2, d => d.y), d3.max(data2, d => d.y)]])
      .range([height - 40, 40]);

    const lineGen1 = d3.line()
      .x((d, i) => xScale(i))
      .y(d => yScale1(d));
    const lineGen2 = d3.line()
      .x((d, i) => xScale(i))
      .y(d => yScale2(d));

    const g = svg.selectAll('.chart-group').data([null]).join('g').attr('class', 'chart-group');

    const lineSel1 = g.selectAll('.line1').data(data1, d => d.id);
    const lineSel2 = g.selectAll('.line2').data(data2, d => d.id);

    const lineEnter1 = lineSel1.enter()
      .append('path')
      .attr('class', 'line')
      .attr('fill', 'none')
      .attr('stroke-width', 3)
      .attr('stroke', '#009edb')
      .attr('opacity', 0)
      .attr('d', d => lineGen1(d.values.slice(0, 0)))
      .each((d, i, nodes) => { nodes[i].currentLimit = 0; });

    const lineEnter2 = lineSel2.enter()
      .append('path')
      .attr('class', 'line')
      .attr('fill', 'none')
      .attr('stroke-width', 3)
      .attr('stroke', '#ffcb05')
      .attr('opacity', 0)
      .attr('d', d => lineGen2(d.values.slice(0, 0)))
      .each((d, i, nodes) => { nodes[i].currentLimit = 0; });

    const mergedLine1 = lineEnter1.merge(lineSel1);
    const mergedLine2 = lineEnter2.merge(lineSel2);

    mergedLine1
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
          d3.select(el).attr('d', lineGen1(d.values.slice(0, sliceLimit)));
        };
      });

    mergedLine2
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
          d3.select(el).attr('d', lineGen2(d.values.slice(0, sliceLimit)));
        };
      });

    // Remove lines if reverting to stage1
    lineSel1.exit()
      .transition()
      .duration(500)
      .attr('opacity', 0)
      .remove();

    lineSel2.exit()
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
