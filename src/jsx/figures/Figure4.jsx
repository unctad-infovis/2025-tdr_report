import React, {
  forwardRef,
  useCallback,
  useEffect,
  useRef
} from 'react';
import PropTypes from 'prop-types';
import {
  axisBottom,
  axisLeft,
  bisector,
  extent,
  interpolateNumber,
  line,
  max,
  min,
  scaleLinear,
  scaleTime,
  select,
  timeFormat
} from 'd3';
import 'intersection-observer';
import { useIsVisible } from 'react-is-visible';
import rawData from './data/figure4_data.json';

const TwoLineChart = forwardRef(({ value, dimensions }, ref) => {
  const svgRef = useRef();
  const svgContainerRef = useRef();
  const chartRef = useRef();
  const isVisible = useIsVisible(chartRef, { once: true });

  const chart = useCallback(() => {
    if (!svgRef.current) return;

    // --- Prepare data (same as you had) ---
    const dataRaw = rawData.map(d => ({
      date: new Date(d.date),
      y1: +d['30-year United States Treasury yield'],
      y2: +d['United States dollar index']
    }));
    // ensure sorted by x
    dataRaw.sort((a, b) => a.date - b.date);

    let { height } = dimensions;
    const { width } = dimensions;
    height /= 2;
    const margin = {
      top: 40, right: 40, bottom: 40, left: 40
    };
    const svg = select(svgRef.current)
      .attr('height', height)
      .attr('width', width)
      .attr('viewBox', [0, 0, width, height]);

    const legendG = svg.selectAll('.legend').data([null]);
    const legendEnter = legendG.enter()
      .append('g')
      .attr('class', 'legend')
      .attr('transform', 'translate(60, 20)');

    const legend = legendEnter.merge(legendG);

    // Bind items
    const items = legend.selectAll('.legend-item')
      .data([{ color: '#009edb', label: '30-year US treasury yield, percentage' }, { color: '#ffcb05', label: 'Dollar index, Jan 2006 = 100' }], d => d.label); // use label as key

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
      .range([margin.left, width - margin.right]);

    const yScale1 = scaleLinear()
      .domain([min(dataRaw, d => d.y1), max(dataRaw, d => d.y1)])
      .nice()
      .range([height - margin.top, margin.bottom]);

    const yScale2 = scaleLinear()
      .domain([min(dataRaw, d => d.y2), max(dataRaw, d => d.y2)])
      .nice()
      .range([height - margin.top, margin.bottom]);

    // --- Axes ---
    svg.selectAll('.axis-group').data([null]).join('g').attr('class', 'axis-group');

    const axesG = svg.select('.axis-group');
    axesG.selectAll('*').remove(); // simple: clear and re-draw axes each render
    // x axis
    axesG.append('g').attr('class', 'x-axis')
      .attr('transform', `translate(0, ${height - margin.top})`)
      .call(axisBottom(xScale).ticks(6));
    // left y axis (for y1)
    axesG.append('g').attr('class', 'y-axis')
      .attr('transform', `translate(${margin.left},0)`)
      .call(axisLeft(yScale2).ticks(5));
    axesG.select('.y-axis')
      .selectAll('.tick line')
      .attr('x2', width);

    // --- Line generators (use d.date and d.y1/d.y2) ---
    const line1 = line()
      .x(d => xScale(d.date))
      .y(d => yScale1(d.y1))
      .defined(d => d.y1 !== null);

    const line2 = line()
      .x(d => xScale(d.date))
      .y(d => yScale2(d.y2))
      .defined(d => d.y2 !== null);

    const getIndexForDate = (targetDate) => {
      if (!targetDate) return dataRaw.length;
      const idx = bisector(d => d.date).right(dataRaw, targetDate);
      return Math.max(0, Math.min(dataRaw.length, idx));
    };

    const targetDate = new Date(2025, 3, 2);

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
        .text(timeFormat('%-d %B %Y')(dateLabel));
    };

    // Compute desired end limits (counts of points)
    let desiredLimit;
    const onLineFinished = () => {
      if (value === '2') {
        updateMarker(targetDate);
        markerGroup
          .transition()
          .duration(400)
          .style('opacity', 1);
      }
    };
    if (value === '1') {
      desiredLimit = 0;
    } else if (value === '2') {
      // Draw up to targetDate
      desiredLimit = getIndexForDate(targetDate);
    } else {
      desiredLimit = dataRaw.length;
    }

    // Bind and create two path elements (one per series)
    const g = svg.selectAll('.chart-group').data([null]).join('g').attr('class', 'chart-group');

    // Single data-binding: pass full data array as datum for both paths
    const path1 = g.selectAll('.line1').data([dataRaw]);
    const path2 = g.selectAll('.line2').data([dataRaw]);

    // Enter
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
      .attr('opacity', value === '1' ? 0 : 1)
      .transition()
      .duration(900)
      .tween('draw', (d, i, nodes) => {
        const el = nodes[i];
        const start = el.currentLimit || 0;
        const end = desiredLimit;
        const idx = interpolateNumber(start, end);
        return t => {
          el.currentLimit = idx(t);
          const sliceLimit = Math.max(0, Math.round(el.currentLimit));
          select(el).attr('d', line1(d.slice(0, sliceLimit)));
        };
      })
      .on('end', onLineFinished);

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
      .attr('opacity', value === '1' ? 0 : 1)
      .transition()
      .duration(900)
      .tween('draw', (d, i, nodes) => {
        const el = nodes[i];
        const start = el.currentLimit || 0;
        const end = desiredLimit;
        const idx = interpolateNumber(start, end);
        return t => {
          el.currentLimit = idx(t);
          const sliceLimit = Math.max(0, Math.round(el.currentLimit));
          select(el).attr('d', line2(d.slice(0, sliceLimit)));
        };
      })
      .on('end', onLineFinished);

    // if going to phase 1, ensure we fade out paths (so axes-only)
    if (value === '1') {
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
            const sliceLimit = Math.max(0, Math.round(el.currentLimit));
            const generator = el.classList.contains('line1') ? line1 : line2;
            select(el).attr('d', generator(d.slice(0, sliceLimit)));
          };
        })
        .transition()
        .duration(400)
        .attr('opacity', 0);
    }
    if (value === '1') {
      markerGroup.style('opacity', 0);
    }
    if (value === '3') {
      markerGroup.style('opacity', 1); // immediate
    }
    updateMarker(targetDate);
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
        {isVisible && <div className="svg_container figure4" ref={svgContainerRef} />}
      </div>
    </div>
  );
});

TwoLineChart.propTypes = {
  dimensions: PropTypes.shape({
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired
  }).isRequired,
  value: PropTypes.string.isRequired
};

export default TwoLineChart;
