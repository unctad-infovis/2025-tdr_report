import React, {
  useEffect, useRef, useState, useCallback, forwardRef
} from 'react';
import PropTypes from 'prop-types';
import {
  axisBottom,
  axisLeft,
  bisector,
  extent,
  interpolateNumber,
  line,
  scaleLinear,
  scaleTime,
  select,
  timeFormat
} from 'd3';
import 'intersection-observer';
import { useIsVisible } from 'react-is-visible';
import rawData from './data/figure5_data.json';

const TwoLineChart = forwardRef(({ value }, ref) => {
  const svgRef = useRef();
  const svgContainerRef = useRef();
  const chartRef = useRef();
  const isVisible = useIsVisible(chartRef, { once: true });

  const [dimensions, setDimensions] = useState({
    height: window.innerHeight / 2,
    width: window.innerWidth
  });

  useEffect(() => {
    const handleResize = () => setDimensions({ height: window.innerHeight / 2, width: window.innerWidth });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const chart = useCallback(() => {
    if (!svgRef.current) return;

    // --- Prepare data (same as you had) ---
    const dataRaw = rawData.map(d => ({
      date: new Date(d.date),
      y1: +d['World trade'],
      y2: +d['Imports of the United States']
    }));

    const { height, width } = dimensions;
    const svg = select(svgRef.current)
      .attr('height', height)
      .attr('width', width)
      .attr('viewBox', [0, 0, width, height]);

    const legendG = svg.selectAll('.legend').data([null]);
    const legendEnter = legendG.enter()
      .append('g')
      .attr('class', 'legend')
      .attr('transform', 'translate(60, 60)');

    const legend = legendEnter.merge(legendG);

    // Bind items
    const items = legend.selectAll('.legend-item')
      .data([{ color: '#009edb', label: 'World Trade' }, { color: '#ffcb05', label: 'Imports of the United States' }], d => d.label); // use label as key

    // Enter
    const itemsEnter = items.enter()
      .append('g')
      .attr('class', 'legend-item')
      .attr('transform', (d, i) => `translate(0, ${i * 20})`);

    // Rectangles
    itemsEnter.append('rect')
      .attr('width', 12)
      .attr('height', 12)
      .attr('fill', d => d.color);

    // Text
    itemsEnter.append('text')
      .attr('x', 16)
      .attr('y', 10)
      .text(d => d.label);

    // Merge for updates
    items.merge(itemsEnter)
      .select('rect')
      .attr('fill', d => d.color);

    items.merge(itemsEnter)
      .select('text')
      .text(d => d.label);

    // Remove old items
    items.exit().remove();

    const xScale = scaleTime()
      .domain(extent(dataRaw, d => d.date))
      .range([40, width - 40]);

    const my_extent = extent(
      dataRaw.flatMap(d => [d.y1, d.y2])
    );

    const [minValue, maxValue] = my_extent;

    const yScale = scaleLinear()
      .domain([minValue, maxValue])
      .nice()
      .range([height - 40, 40]);

    // Axes
    svg.selectAll('.axis-group').data([null]).join('g').attr('class', 'axis-group');

    const axesG = svg.select('.axis-group');
    axesG.selectAll('*').remove(); // simple: clear and re-draw axes each render
    // X-Axis
    axesG.append('g').attr('class', 'x-axis')
      .attr('transform', `translate(0, ${height - 40})`)
      .call(axisBottom(xScale).ticks(6));
    // Y-Axis
    axesG.append('g').attr('class', 'y-axis')
      .attr('transform', 'translate(40,0)')
      .call(axisLeft(yScale).ticks(5));

    axesG.select('.y-axis')
      .selectAll('.tick line')
      .attr('x2', width);

    // --- Line generators (use d.date and d.y1/d.y2) ---
    const line1 = line()
      .x(d => xScale(d.date))
      .y(d => yScale(d.y1))
      .defined(d => d.y1 != null && !Number.isNaN(d.y1));

    const line2 = line()
      .x(d => xScale(d.date))
      .y(d => yScale(d.y2))
      .defined(d => d.y2 != null && !Number.isNaN(d.y2));

    // --- Helper: compute index limit for a target date ---
    const getIndexForDate = (targetDate) => {
      if (!targetDate) return dataRaw.length;
      // index of first point after targetDate
      const idx = bisector(d => d.date).right(dataRaw, targetDate);
      // we want to draw up to idx (i.e., slice(0, idx))
      return Math.max(0, Math.min(dataRaw.length, idx));
    };

    const phase = value; // keep your prop name
    const targetDate = new Date(2024, 9, 1);

    // Create marker group (only once)
    const markerGroup = svg.selectAll('.target-marker')
      .data([null])
      .join(
        enterSel => {
          const g = enterSel.append('g')
            .attr('class', 'target-marker')
            .style('opacity', 0);
          g.append('line')
            .attr('class', 'marker-line')
            .attr('y1', 0)
            .attr('y2', height - 40);
          g.append('text')
            .attr('class', 'marker-label')
            .attr('text-anchor', 'middle')
            .attr('y', 20);
          return g;
        }
      );

    // Function to position the marker
    const updateMarker = (dateLabel) => {
      const xPos = xScale(dateLabel);

      markerGroup.select('.marker-line')
        .attr('x1', xPos)
        .attr('x2', xPos);

      markerGroup.select('.marker-label')
        .attr('x', xPos)
        .text(timeFormat('%B %Y')(dateLabel));
    };
    // compute desired end limits (counts of points)
    let desiredLimit;
    const onLineFinished = () => {
      if (phase === '2') {
        updateMarker(targetDate);

        markerGroup
          .transition()
          .duration(400)
          .style('opacity', 1);
      }
    };
    if (phase === '1') {
      desiredLimit = 0;
    } else if (phase === '2') {
    // draw up to targetDate
      desiredLimit = getIndexForDate(targetDate);
    } else { // phase === '3'
      desiredLimit = dataRaw.length;
    }

    // --- Bind and create two path elements (one per series) ---
    const g = svg.selectAll('.chart-group').data([null]).join('g').attr('class', 'chart-group');

    // single data-binding: pass full data array as datum for both paths
    const path1 = g.selectAll('.line1').data([dataRaw]);
    const path2 = g.selectAll('.line2').data([dataRaw]);

    // Line 1 tween
    path1.enter()
      .append('path')
      .attr('class', 'line1 line')
      .attr('fill', 'none')
      .attr('stroke-width', 3)
      .attr('stroke', '#009edb')
      .attr('opacity', 0)
      .each((d, i, nodes) => { nodes[i].currentLimit = nodes[i].currentLimit || 0; })
      .merge(path1)
      .call(sel => sel.interrupt())
      .attr('opacity', phase === '1' ? 0 : 1)
      .transition()
      .duration(900)
      .tween('draw', (d, i, nodes) => {
        const el = nodes[i];
        const start = el.currentLimit || 0;
        const end = desiredLimit;
        const idx = interpolateNumber(start, end);

        return t => {
          el.currentLimit = idx(t);
          const sliceLimit = Math.max(1, Math.round(el.currentLimit)); // avoid empty slice
          const slice = d.slice(0, sliceLimit).filter(p => p.y1 != null && !Number.isNaN(p.y1));
          if (slice.length > 0) {
            select(el).attr('d', line1(slice));
          }
        };
      })
      .on('end', onLineFinished);

    // Line 2 tween
    path2.enter()
      .append('path')
      .attr('class', 'line2 line')
      .attr('fill', 'none')
      .attr('stroke-width', 3)
      .attr('stroke', '#ffcb05')
      .attr('opacity', 0)
      .each((d, i, nodes) => { nodes[i].currentLimit = nodes[i].currentLimit || 0; })
      .merge(path2)
      .call(sel => sel.interrupt())
      .attr('opacity', phase === '1' ? 0 : 1)
      .transition()
      .duration(900)
      .tween('draw', (d, i, nodes) => {
        const el = nodes[i];
        const start = el.currentLimit || 0;
        const end = desiredLimit;
        const idx = interpolateNumber(start, end);

        return t => {
          el.currentLimit = idx(t);
          const sliceLimit = Math.max(1, Math.round(el.currentLimit)); // avoid empty slice
          const slice = d.slice(0, sliceLimit).filter(p => p.y2 != null && !Number.isNaN(p.y2));
          if (slice.length > 0) {
            select(el).attr('d', line2(slice));
          }
        };
      })
      .on('end', onLineFinished);

    // if going to phase 1, ensure we fade out paths (so axes-only)
    if (phase === '1') {
      g.selectAll('.line')
        .interrupt()
        .transition()
        .duration(900)
        .tween('undraw', (d, i, nodes) => {
          const el = nodes[i];
          const start = el.currentLimit || 0;
          const end = 0;
          const interp = interpolateNumber(start, end);
          return t => {
            el.currentLimit = interp(t);
            const sliceLimit = Math.max(1, Math.round(el.currentLimit));
            select(el).attr('d', line1(d.slice(0, sliceLimit)));
          };
        })
        .transition()
        .duration(400)
        .attr('opacity', 0);
    }
    if (phase === '1') {
      markerGroup.style('opacity', 0);
    }
    if (phase === '3') {
      updateMarker(targetDate);
      markerGroup.style('opacity', 1); // immediate
    }
  }, [value, dimensions]);

  useEffect(() => {
    if (!svgRef.current && svgContainerRef.current) {
      const svg = select(svgContainerRef.current).append('svg');
      svgRef.current = svg.node();
    }
    if (isVisible) chart();
  }, [chart, isVisible, dimensions]);

  return (
    <div ref={chartRef}>
      <div className="app" ref={ref}>
        {isVisible && <div className="svg_container figure5" ref={svgContainerRef} />}
      </div>
    </div>
  );
});

TwoLineChart.propTypes = {
  value: PropTypes.string.isRequired, // "1" or "2"
};

export default TwoLineChart;
