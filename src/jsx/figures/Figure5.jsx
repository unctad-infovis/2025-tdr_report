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
  select,
  timeFormat
} from 'd3';
import 'intersection-observer';
import { useIsVisible } from 'react-is-visible';
import rawData from './data/figure5_data.json';

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
      y1: +d['World trade'],
      y2: +d['Imports of the United States']
    }));
    let { height, width } = dimensions;
    height /= 2;
    width = Math.min(width, 1000);
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
      .attr('transform', 'translate(60, 60)');

    const legend = legendEnter.merge(legendG);

    const items = legend.selectAll('.legend-item')
      .data([{ color: '#009edb', label: 'World Trade' }, { color: '#ffcb05', label: 'Imports of the United States' }], d => d.label); // use label as key

    const itemsEnter = items.enter()
      .append('g')
      .attr('class', 'legend-item')
      .attr('transform', (d, i) => `translate(0, ${i * 20})`);

    itemsEnter.append('rect')
      .attr('width', 12)
      .attr('height', 12)
      .attr('fill', d => d.color);

    itemsEnter.append('text')
      .attr('x', 16)
      .attr('y', 10)
      .text(d => d.label);

    items.merge(itemsEnter)
      .select('rect')
      .attr('fill', d => d.color);

    items.merge(itemsEnter)
      .select('text')
      .text(d => d.label);

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
    axesG.selectAll('*').remove();
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
      .attr('x2', width - margin.right - margin.left);

    // Y-Axis label
    axesG.append('text')
      .attr('class', 'y-axis-label')
      .attr('transform', 'rotate(-90)')
      .attr('x', -(height / 2))
      .attr('y', margin.left - 40)
      .attr('text-anchor', 'middle')
      .attr('fill', '#fff')
      .style('font-size', '12px')
      .text('Index');

    const line1 = line()
      .x(d => xScale(d.date))
      .y(d => yScale(d.y1))
      .defined(d => d.y1 != null && !Number.isNaN(d.y1));

    const line2 = line()
      .x(d => xScale(d.date))
      .y(d => yScale(d.y2))
      .defined(d => d.y2 != null && !Number.isNaN(d.y2));

    const getIndexForDate = (targetDate) => {
      if (!targetDate) return dataRaw.length;
      const idx = bisector(d => d.date).right(dataRaw, targetDate);
      return Math.max(0, Math.min(dataRaw.length, idx));
    };

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

    const targetDate1 = new Date(2024, 9, 1);
    const targetDate2 = new Date(2025, 2, 1);

    let desiredLimit;
    if (value === '1') {
      desiredLimit = 0;
    } else if (value === '2') {
      desiredLimit = getIndexForDate(targetDate1);
    } else if (parseInt(value, 10) < 6) {
      desiredLimit = getIndexForDate(targetDate2);
    } else {
      desiredLimit = dataRaw.length;
    }

    // Function to position the marker
    const updateMarker = (dateLabel) => {
      const xPos = xScale(dateLabel);

      markerGroup.select('.marker-line')
        .attr('x1', xPos)
        .attr('x2', xPos);

      markerGroup.select('.marker-label')
        .attr('x', xPos - 60)
        .text(timeFormat('%B %Y')(dateLabel));
    };
    const onLineFinished = () => {
      if (parseInt(value, 10) > 2) {
        updateMarker(targetDate1);

        markerGroup
          .transition()
          .duration(400)
          .style('opacity', 1);
      }
    };

    const g = svg.selectAll('.chart-group').data([null]).join('g').attr('class', 'chart-group');

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
      markerGroup.style('opacity', 0);
    }
    if (parseInt(value, 10) > 2) {
      markerGroup.style('opacity', 1);
    }
    updateMarker(targetDate1);
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
        {isVisible && <div className="svg_container figure5" ref={svgContainerRef} />}
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
