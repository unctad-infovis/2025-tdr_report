// LineGraph.jsx
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
  curveLinear,
  easeCubicOut,
  easeLinear,
  extent,
  line,
  max,
  min,
  scaleLinear,
  scaleTime,
  select
} from 'd3';
import { interpolatePath } from 'd3-interpolate-path';
import 'intersection-observer';
import { useIsVisible } from 'react-is-visible';

import rawData1 from './data/figure1_data1.json';
import rawData2 from './data/figure1_data2.json';
import rawData3 from './data/figure1_data3.json';
import rawData4 from './data/figure1_data4.json';

const data1 = rawData1.map(d => ({ x: new Date(d.x), y: +d.y }));
const data2 = rawData2.map(d => ({ x: new Date(d.x), y: +d.y }));
const data3 = rawData3.map(d => ({ x: new Date(d.x), y: +d.y }));
const data4 = rawData4.map(d => ({ x: new Date(d.x), y: +d.y }));

const LineGraph = forwardRef(({ value, dimensions }, ref) => {
  const svgRef = useRef(null);
  const svgContainerRef = useRef(null);
  const chartRef = useRef(null);
  const isVisible = useIsVisible(chartRef, { once: true });

  // path refs
  const line1Ref = useRef(null);
  const line2Ref = useRef(null);
  const line4Ref = useRef(null);
  const areaRef = useRef(null);

  const len1Ref = useRef(0);
  const len2Ref = useRef(0);
  const len4Ref = useRef(0);

  const line1DrawnRef = useRef(false);
  const line2DrawnRef = useRef(false);
  const line4DrawnRef = useRef(false);
  const areaDrawnRef = useRef(false);
  const prevPhaseRef = useRef(null);

  const safeGetOffset = useCallback((p, len) => {
    const raw = p.attr('stroke-dashoffset');
    if (raw == null) return len;
    const n = parseFloat(raw);
    return Number.isNaN(n) ? len : n;
  }, []);

  const prepareDash = useCallback((p, lenRef) => {
    const node = p.node();
    const l = node.getTotalLength();
    lenRef.current = l;
    p.attr('stroke-dasharray', `${l} ${l}`).attr('stroke-dashoffset', l);
  }, []);

  const updateLegend = useCallback((legendItems, margin) => {
    // Create or select legend group
    const svg = select(svgRef.current);
    const legendG = svg.selectAll('.legend').data([null]);
    const legendEnter = legendG.enter()
      .append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);
    const legend = legendEnter.merge(legendG);

    // Bind items
    const items = legend.selectAll('.legend-item')
      .data(legendItems, d => d.label); // use label as key

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
  }, []);

  const animateDraw = useCallback((p, lenRef, duration = 900, ease = easeCubicOut) => {
    const start = safeGetOffset(p, lenRef.current || p.node().getTotalLength());
    prepareDash(p, lenRef);
    p.interrupt().attr('opacity', 1)
      .transition()
      .duration(duration)
      .ease(ease)
      .attrTween('stroke-dashoffset', () => {
        const s = start;
        const e = 0;
        return t => s + (e - s) * t;
      })
      .on('end', () => {
        if (p === line1Ref.current) line1DrawnRef.current = true;
        if (p === line2Ref.current) line2DrawnRef.current = true;
        if (p === line4Ref.current) line4DrawnRef.current = true;
      });
  }, [prepareDash, safeGetOffset]);

  const animateUndraw = useCallback((p, lenRef, duration = 600, ease = easeCubicOut) => {
    const start = safeGetOffset(p, lenRef.current || p.node().getTotalLength());
    const end = lenRef.current || p.node().getTotalLength();
    prepareDash(p, lenRef);
    p.interrupt().attr('opacity', 0)
      .transition()
      .duration(duration)
      .ease(ease)
      .attrTween('stroke-dashoffset', () => {
        const s = start;
        const e = end;
        return t => s + (e - s) * t;
      })
      .on('end', () => {
        if (p === line1Ref.current) line1DrawnRef.current = false;
        if (p === line2Ref.current) line2DrawnRef.current = false;
        if (p === line4Ref.current) line4DrawnRef.current = false;
        p.attr('stroke-dashoffset', end);
      });
  }, [prepareDash, safeGetOffset]);

  const morphPath = useCallback((p, fromD, toD, onEnd, duration = 900, ease = easeCubicOut) => {
    const startD = fromD || p.attr('d') || toD;
    const endD = toD;

    p.interrupt()
      .transition()
      .duration(duration)
      .ease(ease)
      .attrTween('d', () => {
        const interp = interpolatePath(startD, endD);

        return (t) => {
          const d = interp(t);
          // update the path immediately
          p.attr('d', d);
          if (!p) return false;
          const length = p.node().getTotalLength();
          p.attr('stroke-dasharray', length);
          p.attr('stroke-dashoffset', 0);

          return d;
        };
      })
      .on('end', () => {
      // ensure final normalization
        const finalLength = p.node().getTotalLength();
        p.attr('stroke-dasharray', finalLength);
        p.attr('stroke-dashoffset', 0);

        if (typeof onEnd === 'function') onEnd();
      });
  }, []);

  const chart = useCallback(() => {
    if (!svgContainerRef.current) return;

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

    // Scales (use all x values for domain)
    const data_group1 = [...data1, ...data2];
    const data_group2 = [...data3, ...data4];
    const data_group = [...data1, ...data2, ...data3, ...data4];
    const xScale = scaleTime()
      .domain(extent(data_group, d => d.x))
      .range([margin.left, width - margin.right]);
    const y1Scale = scaleLinear()
      .domain([0, max(data_group1, d => d.y)])
      .nice()
      .range([height - margin.bottom, margin.top]);
    const y2Scale = scaleLinear()
      .domain([min(data_group2, d => d.y), max(data_group2, d => d.y)])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // Generators
    const lineGen1 = line().x(d => xScale(d.x)).y(d => y1Scale(d.y)).curve(curveLinear);
    // Generators
    const lineGen2 = line().x(d => xScale(d.x)).y(d => y2Scale(d.y)).curve(curveLinear);

    // Root group
    const gSel = svg.selectAll('.chart-group').data([null]);
    const g = gSel.enter().append('g').attr('class', 'chart-group').merge(gSel);

    // Axes & grid (phase >= 1)
    if (parseInt(value, 10) >= 1) {
      svg.selectAll('.axis-group').data([null]).join('g').attr('class', 'axis-group');

      const axesG = svg.select('.axis-group');
      axesG.selectAll('*').remove(); // simple: clear and re-draw axes each render

      axesG.append('g').attr('class', 'x-axis')
        .attr('transform', `translate(0, ${height - margin.top})`)
        .call(axisBottom(xScale).ticks(6));

      const tickValues = [0, 20, 40, 60, 80, 100, 120];
      axesG.append('g').attr('class', 'y-axis')
        .attr('transform', `translate(${margin.left},0)`)
        .call(axisLeft(y1Scale).tickValues(tickValues).tickSize(0).tickPadding(8))
        .call(sel => sel.select('.domain').remove());
      axesG.select('.y-axis')
        .selectAll('.tick line')
        .attr('x2', width - margin.left - margin.right);
      axesG.selectAll('.tick')
        .filter(d => d === 0)
        .select('line')
        .attr('class', 'line_0');
      // Y-Axis label
      axesG.append('text')
        .attr('class', 'y-axis-label')
        .attr('transform', 'rotate(-90)') // rotate text vertically
        .attr('x', -(height / 2)) // move to vertical center
        .attr('y', margin.left - 40) // left of the axis, adjust padding
        .attr('text-anchor', 'middle')
        .attr('fill', '#fff') // adjust color
        .style('font-size', '12px');
      if (parseInt(value, 10) > 4) {
        axesG.select('.y-axis-label').text('');
      } else {
        axesG.select('.y-axis-label').text('Index, 2021 = 100');
      }
    }

    // Line 1
    if (!line1Ref.current) {
      const p1 = g.append('path').attr('class', 'line1').attr('d', lineGen1(data1));
      line1Ref.current = p1;
    }
    // Line 2
    if (!line2Ref.current) {
      const p2 = g.append('path').attr('class', 'line2').attr('d', lineGen1(data2));
      line2Ref.current = p2;
    }
    // Line 4
    if (!line4Ref.current) {
      const p4 = g.append('path').attr('class', 'line4').attr('d', lineGen2(data4));
      line4Ref.current = p4;
    }
    // Area
    if (!areaRef.current) {
      const ap = g.append('path')
        .attr('class', 'area-fill')
        .attr('stroke', 'none')
        .attr('opacity', 0);
      areaRef.current = ap;
    }

    const p1 = line1Ref.current;
    const p2 = line2Ref.current;
    const p4 = line4Ref.current;
    const ap = areaRef.current;

    if (p1) {
      p1.attr('d', (prevPhaseRef.current === '5' || value === '5') ? lineGen2(data3) : lineGen1(data1));
    }
    if (p2) p2.attr('d', lineGen1(data2));
    if (p4) p4.attr('d', lineGen2(data4));

    // Phase 1
    if (value === '1') {
      updateLegend([], margin);
      // Hide all.
      animateUndraw(p1, len1Ref, 0);
      animateUndraw(p2, len2Ref, 0);
      animateUndraw(p4, len4Ref, 0);
      ap.interrupt().attr('opacity', 0).on('end', () => { areaDrawnRef.current = false; });
    } else if (value === '2') {
      updateLegend([
        { color: '#009edb', label: 'World Trade' }
      ], margin);
      // Hide others.
      animateUndraw(p2, len2Ref);
      animateUndraw(p4, len4Ref, 0);
      ap.interrupt().attr('opacity', 0).on('end', () => { areaDrawnRef.current = false; });

      // Insert line1.
      animateDraw(p1, len1Ref);
    } else if (value === '3') {
      updateLegend([
        { color: '#009edb', label: 'World Trade' },
        { color: '#fff', label: 'World Trade (trend line)' }
      ], margin);
      // Hide others
      animateUndraw(p4, len4Ref, 0);
      ap.interrupt().attr('opacity', 0).on('end', () => { areaDrawnRef.current = false; });

      // Make sure that line1 is in place.
      if (!line1DrawnRef.current) animateDraw(p1, len1Ref);
      // Insert line2
      animateDraw(p2, len2Ref);
    } else if (value === '4') {
      updateLegend([
        { color: '#009edb', label: 'World Trade' },
        { color: '#fff', label: 'World Trade (trend line)' },
      ], margin);
      // Hide others.
      animateUndraw(p4, len4Ref, 0);

      // Make sure that line2 is in place.
      if (!line2DrawnRef.current) animateDraw(p2, len2Ref);
      // Let's make sure line1 is in place
      if (prevPhaseRef.current === '5') {
        const currentD = p1.attr('d') || lineGen1(data3);
        const targetD = lineGen1(data1);
        morphPath(p1, currentD, targetD, () => {
          // onEnd
          p1.attr('opacity', 1);
          line1DrawnRef.current = true;
        }, 900, easeCubicOut);
      } else if (!line1DrawnRef.current) animateDraw(p1, len1Ref);

      // Build polygon
      const areaPoly = [
        ...data1.map(d => ({ x: d.x, y: d.y })),
        ...data2.slice().reverse().map(d => ({ x: d.x, y: d.y }))
      ];
      const newD = `${line().x(d => xScale(d.x)).y(d => y1Scale(d.y)).curve(curveLinear)(areaPoly)}Z`;

      ap.interrupt()
        .transition()
        .duration(900)
        .ease(easeCubicOut)
        .attrTween('d', () => {
          const interp = interpolatePath((ap.attr('d') && ap.attr('d') !== '') ? ap.attr('d') : newD, newD);
          return t => interp(t);
        })
        .attr('opacity', 1)
        .on('end', () => { areaDrawnRef.current = true; });
    } else if (value === '5') {
      updateLegend([
        { color: '#009edb', label: 'World Trade (cyclical, standardised)' }
      ], margin);
      // Hide line2
      animateUndraw(p2, len2Ref, 0);
      animateUndraw(p4, len4Ref);

      const ticks = y2Scale.ticks(1);
      svg.select('.y-axis')
        .transition()
        .duration(0)
        .call(axisLeft(y2Scale).tickValues(ticks).tickSize(0).tickPadding(8))
        .call(sel => sel.select('.domain').remove())
        .call(sel => sel.selectAll('.tick line').attr('x2', width - margin.right - margin.left));

      if (!line1DrawnRef.current) {
        animateDraw(p1, len1Ref);
        const currentD = lineGen2(data1);
        const targetD = lineGen2(data3);
        morphPath(p1, currentD, targetD, () => {
          p1.attr('opacity', 1);
          line1DrawnRef.current = true;
        }, 0);
      } else if (prevPhaseRef.current === '4') {
        const currentD = lineGen1(data1);
        const targetD = lineGen2(data3);
        morphPath(p1, currentD, targetD, () => {
          p1.attr('opacity', 1);
          line1DrawnRef.current = true;
        }, 900, easeCubicOut);
      }

      const areaPoly = [
        ...data3.map(d => ({ x: d.x, y: d.y })), // top = data3
        ...data3.slice().reverse().map(d => ({ x: d.x, y: 0 })) // bottom = 0
      ];
      const newAreaD = `${line().x(d => xScale(d.x)).y(d => y2Scale(d.y)).curve(curveLinear)(areaPoly)}Z`;
      const fromAreaD = (ap.attr('d') && ap.attr('d') !== '') ? ap.attr('d') : newAreaD;

      ap.interrupt()
        .transition()
        .duration(900)
        .ease(easeCubicOut)
        .attrTween('d', () => {
          const interp = interpolatePath(fromAreaD, newAreaD);
          return t => interp(t);
        })
        .attr('opacity', 1)
        .on('end', () => { areaDrawnRef.current = true; });
    } else if (value === '6') {
      updateLegend([
        { color: '#009edb', label: 'World Trade (cyclical, standardised)' },
        { color: '#ffcb05', label: 'Global financial cycle' }
      ], margin);
      // Hide area and line2
      animateUndraw(p2, len2Ref, 0);
      ap.interrupt().attr('opacity', 0).on('end', () => { areaDrawnRef.current = false; });

      const ticks = y2Scale.ticks(1);
      svg.select('.y-axis')
        .transition()
        .duration(0)
        .call(axisLeft(y2Scale)
          .tickValues(ticks)
          .tickSize(0)
          .tickPadding(8))
        .call(sel => sel.select('.domain').remove())
        .call(sel => sel.selectAll('.tick line')
          .attr('x2', width - margin.left - margin.right));

      animateDraw(p1, len1Ref);
      const currentD = p1.attr('d') || lineGen2(data1);
      const targetD = lineGen2(data3);
      morphPath(p1, currentD, targetD, () => {
        p1.attr('opacity', 1);
        line1DrawnRef.current = true;
      }, 0);
      if (!line4DrawnRef.current) {
        animateDraw(p4, len4Ref, 5000, easeLinear);
      }
    }
    prevPhaseRef.current = value;
  }, [animateDraw, animateUndraw, dimensions, morphPath, updateLegend, value]);

  useEffect(() => {
    if (!svgRef.current) {
      const svg = select(svgContainerRef.current).append('svg');
      svgRef.current = svg.node();
    }
    if (isVisible) chart();
  }, [chart, isVisible]);

  return (
    <div ref={chartRef}>
      <div className="app" ref={ref}>
        {isVisible && (<div className="svg_container figure1" ref={svgContainerRef} />)}
      </div>
    </div>
  );
});

LineGraph.propTypes = {
  dimensions: PropTypes.shape({
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired
  }).isRequired,
  value: PropTypes.string.isRequired
};

export default LineGraph;
