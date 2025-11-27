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
  scaleLinear,
  scaleTime,
  select
} from 'd3';
import 'intersection-observer';
import { useIsVisible } from 'react-is-visible';
import rawData from './data/figure6_data.json';

const highlightRanges = [
  { start: new Date('1994/01/01'), end: new Date('1995/12/31'), label: 'Mexican Peso Crisis' },
  { start: new Date('1998/01/01'), end: new Date('1999/12/31'), label: 'Asian Financial Crisis' },
  { start: new Date('2007/01/01'), end: new Date('2009/12/31'), label: 'Global Financial Crisis' },
  { start: new Date('2020/01/01'), end: new Date('2022/12/31'), label: 'COVID-19 Pandemic' },
];

const TwoLineChart = forwardRef(({ value, dimensions }, ref) => {
  const svgRef = useRef();
  const svgContainerRef = useRef();
  const chartRef = useRef();
  const highlightGroupRef = useRef();
  const isVisible = useIsVisible(chartRef, { once: true });

  const chart = useCallback(() => {
    if (!svgRef.current) return;

    // --- Prepare data (same as you had) ---
    const dataRaw = rawData.map(d => ({
      date: new Date(d.date),
      y1: +d['Gross domestic product (GDP)'],
      y2: +d['Global financial market']
    }));

    const { width } = dimensions;
    let { height } = dimensions;
    height /= 2;
    const margin = {
      top: 40, right: 40, bottom: 40, left: 60
    };
    const svg = select(svgRef.current)
      .attr('height', height)
      .attr('width', width)
      .attr('viewBox', [0, 0, width, height]);

    const legendG = svg.selectAll('.legend').data([null]);
    const legendEnter = legendG.enter()
      .append('g')
      .attr('class', 'legend')
      .attr('transform', 'translate(60, 100)');

    const legend = legendEnter.merge(legendG);

    // Bind items
    const items = legend.selectAll('.legend-item')
      .data([{ color: '#009edb', label: 'Gross domestic product (GDP)' }, { color: '#ffcb05', label: 'Global financial market' }], d => d.label); // use label as key

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

    const my_extent = extent(
      dataRaw.flatMap(d => [d.y1, d.y2])
    );

    const [minValue, maxValue] = my_extent;

    const yScale = scaleLinear()
      .domain([minValue, maxValue])
      .nice()
      .range([height - margin.top, margin.bottom]);

    // Axes
    svg.selectAll('.axis-group').data([null]).join('g').attr('class', 'axis-group');

    const axesG = svg.select('.axis-group');
    axesG.selectAll('*').remove(); // simple: clear and re-draw axes each render
    // X-Axis
    axesG.append('g').attr('class', 'x-axis')
      .attr('transform', `translate(0, ${height - margin.top})`)
      .call(axisBottom(xScale).ticks(6));
    // Y-Axis
    axesG.append('g').attr('class', 'y-axis')
      .attr('transform', `translate(${margin.left},0)`)
      .call(axisLeft(yScale).ticks(5));

    axesG.select('.y-axis')
      .selectAll('.tick line')
      .attr('x2', width);

    // Y-Axis label
    axesG.append('text')
      .attr('class', 'y-axis-label')
      .attr('transform', 'rotate(-90)') // rotate text vertically
      .attr('x', -(height / 2)) // move to vertical center
      .attr('y', margin.left - 40) // left of the axis, adjust padding
      .attr('text-anchor', 'middle')
      .attr('fill', '#fff') // adjust color
      .style('font-size', '12px')
      .text('Trillions of dollars'); // replace with your desired label

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

    const targetDate = new Date(2000, 0, 1);

    // Inside chart():
    if (!highlightGroupRef.current) {
      highlightGroupRef.current = svg.append('g')
        .attr('class', 'highlight-ranges');
    }

    const highlightGroup = highlightGroupRef.current;

    function updateHighlightRanges(ranges) {
      const groups = highlightGroup.selectAll('.highlight-range')
        .data(ranges, d => d.label);

      // ENTER
      const enter = groups.enter()
        .append('g')
        .attr('class', 'highlight-range');

      enter.append('rect')
        .attr('class', 'highlight-rect');

      enter.append('text')
        .attr('class', 'highlight-label');

      // ENTER + UPDATE
      groups.merge(enter).each((d, i, nodes) => {
        const g = select(nodes[i]);
        g.attr('class', `highlight-range highlight-range-${i}`);
        const xStart = xScale(d.start);
        const xEnd = xScale(d.end);
        const group_width = xEnd - xStart;

        g.select('.highlight-rect')
          .attr('x', xStart)
          .attr('width', group_width)
          .attr('y', 0)
          .attr('height', height - 40);

        // place label in center of rectangle vertically
        const labelX = xStart + group_width / 2 - 1;
        const labelY = 50;

        g.select('.highlight-label')
          .attr('x', labelX)
          .attr('y', labelY)
          .attr('text-anchor', 'start')
          .attr('dominant-baseline', 'middle') // vertically center text
          .attr('transform', `rotate(90, ${labelX}, ${labelY})`)
          .text(d.label);
      });

      // EXIT
      groups.exit().remove();
    }

    // Call once
    updateHighlightRanges(highlightRanges);

    // compute desired end limits (counts of points)
    let desiredLimit;
    const onLineFinished = () => {
    };
    if (value === '1') {
      desiredLimit = 0;
    } else if (value === '2') {
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
          const sliceLimit = Math.max(1, Math.round(el.currentLimit)); // avoid empty slice
          const slice = d.slice(0, sliceLimit).filter(p => p.y2 != null && !Number.isNaN(p.y2));
          if (slice.length > 0) {
            select(el).attr('d', line2(slice));
          }
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
            const sliceLimit = Math.max(1, Math.round(el.currentLimit));
            select(el).attr('d', line1(d.slice(0, sliceLimit)));
          };
        })
        .transition()
        .duration(400)
        .attr('opacity', 0);
    }

    if (value === '1') {
      highlightGroup.select('.highlight-range-0').style('opacity', 0);
      highlightGroup.select('.highlight-range-1').style('opacity', 0);
      highlightGroup.select('.highlight-range-2').style('opacity', 0);
      highlightGroup.select('.highlight-range-3').style('opacity', 0);
    } else if (value === '2') {
      highlightGroup.select('.highlight-range-0').style('opacity', 1);
      highlightGroup.select('.highlight-range-1').style('opacity', 1);
      highlightGroup.select('.highlight-range-2').style('opacity', 0);
      highlightGroup.select('.highlight-range-3').style('opacity', 0);
    } else if (value === '3') {
      highlightGroup.select('.highlight-range-0').style('opacity', 1);
      highlightGroup.select('.highlight-range-1').style('opacity', 1);
      highlightGroup.select('.highlight-range-2').style('opacity', 1);
      highlightGroup.select('.highlight-range-3').style('opacity', 1);
    }
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
        {isVisible && <div className="svg_container figure6" ref={svgContainerRef} />}
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
