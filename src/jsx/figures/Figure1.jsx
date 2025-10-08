import React, {
  useEffect, useRef, useState, useCallback, forwardRef
} from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import { interpolatePath } from 'd3-interpolate-path';
import 'intersection-observer';
import { useIsVisible } from 'react-is-visible';

const LineGraph = forwardRef(({ value }, ref) => {
  const svgRef = useRef();
  const svgContainerRef = useRef();
  const chartRef = useRef();
  const isVisible = useIsVisible(chartRef, { once: true });

  const [dimensions, setDimensions] = useState({
    height: window.innerHeight,
    width: window.innerWidth,
  });

  // Update dimensions on window resize
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        height: window.innerHeight,
        width: window.innerWidth,
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const chart = useCallback(() => {
    const svg = d3.select(svgRef.current);
    if (!svg.node()) return;

    const container = svg.node().parentNode;
    if (!container) return;
    const height = container.getBoundingClientRect().height / 2;
    const width = Math.max(200, container.getBoundingClientRect().width);
    const margin = {
      top: 0, right: 20, bottom: 0, left: 20
    };

    svg.attr('viewBox', [0, 0, width, height]);
    svg.attr('height', window.innerHeight);
    svg.attr('width', window.innerWidth);

    // Example datasets
    const data1 = [
      { x: 0, y: 0 }, { x: 1, y: 30 }, { x: 2, y: 40 },
      { x: 3, y: 50 }, { x: 4, y: 60 },
    ];
    const data2 = [
      { x: 0, y: 50 }, { x: 1, y: 40 }, { x: 2, y: 60 },
      { x: 3, y: 20 }, { x: 4, y: 30 },
    ];
    const data3 = [
      { x: 0, y: 15 }, { x: 1, y: 28 }, { x: 2, y: 42 },
      { x: 3, y: 48 }, { x: 4, y: 62 },
    ];

    // Scales
    const x = d3.scaleLinear()
      .domain(d3.extent(data1, d => d.x))
      .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
      .domain([0, d3.max([...data1, ...data2, ...data3], d => d.y)])
      .nice()
      .range([height - margin.bottom, margin.top]);

    const lineGen = d3.line()
      .x(d => x(d.x))
      .y(d => y(d.y));
      // .curve(d3.curveMonotoneX);

    // Base group
    const gSel = svg.selectAll('.chart-group').data([null]);
    const gEnter = gSel.enter().append('g').attr('class', 'chart-group');
    const g = gEnter.merge(gSel);

    // --- Line 1 (always visible) ---
    const line1Sel = g.selectAll('.line1').data([data1]);
    line1Sel.enter()
      .append('path')
      .attr('class', 'line1')
      .attr('fill', 'none')
      .attr('stroke', '#009edb')
      .attr('stroke-width', 4)
      .merge(line1Sel)
      .interrupt()
      .transition()
      .duration(500)
      .attrTween('d', () => {
        const previous = line1Sel.empty() ? lineGen(data1) : line1Sel.node().getAttribute('d');
        const interpolator = interpolatePath(previous, lineGen(data1));
        return t => interpolator(t);
      });
    line1Sel.exit().remove();

    // --- Line 2 (stages 2 & 3) ---
    const currentData = value === '2' ? data2 : value === '3' ? data3 : null;
    const line2Sel = g.selectAll('.line2');

    if (currentData) {
      // Join data
      const join = line2Sel.data([currentData]);
      const enterLine2 = join.enter()
        .append('path')
        .attr('class', 'line2')
        .attr('fill', 'none')
        .attr('stroke-width', 4)
        .attr('stroke', '#ffcb05')
        .attr('opacity', 0)
        .attr('d', lineGen);

      const mergedLine2 = enterLine2.merge(join);

      mergedLine2
        .interrupt()
        .attr('stroke', '#ffcb05')
        .transition()
        .duration(500)
        .attr('opacity', 1)
        .attrTween('d', () => {
          const previous = line2Sel.empty() ? lineGen(currentData) : mergedLine2.node().getAttribute('d');
          const interpolator = interpolatePath(previous, lineGen(currentData));
          return t => interpolator(t);
        });

      join.exit().remove();
    } else if (!currentData && !line2Sel.empty()) {
      // Stage 2 -> 1: fade out smoothly
      line2Sel
        .interrupt()
        .transition()
        .duration(500)
        .attr('opacity', 0)
        .on('end', event => d3.select(event.target).remove());
    }
  }, [value]);

  useEffect(() => {
    const { width, height } = dimensions;
    if (isVisible) {
      if (!svgRef.current) {
        const svg = d3.select(svgContainerRef.current)
          .append('svg')
          .attr('height', height)
          .attr('width', width);

        svgRef.current = svg.node();
        chart();
      } else {
        chart();
      }
    }
  }, [chart, isVisible, dimensions]);

  return (
    <div ref={chartRef}>
      <div className="app" ref={ref}>
        {isVisible && (<div className="svg_container" ref={svgContainerRef} />)}
      </div>
    </div>
  );
});

LineGraph.propTypes = {
  value: PropTypes.string.isRequired,
};

export default LineGraph;
