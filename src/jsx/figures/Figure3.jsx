import React, {
  useEffect, useRef, useState, useCallback, forwardRef
} from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import 'intersection-observer';
import { useIsVisible } from 'react-is-visible';

const FigurePie = forwardRef(({ value }, ref) => {
  const svgRef = useRef();
  const svgContainerRef = useRef();
  const chartRef = useRef();
  const isVisible = useIsVisible(chartRef, { once: true });

  const [dimensions, setDimensions] = useState({
    height: window.innerHeight * 0.6,
    width: window.innerWidth,
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        height: window.innerHeight * 0.6,
        width: window.innerWidth,
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const setArcState = (el, d) => { el.currentArcState = d; };

  const arcTween = (arc, el) => (d) => {
    const previous = el.current_d || d;
    const interpolate = d3.interpolate(previous, d);
    el.current_d = interpolate(0);
    return t => arc(interpolate(t));
  };

  const chart = useCallback(() => {
    if (!svgRef.current) return;

    const { width, height } = dimensions;
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height]);

    const radius = Math.min(width, height) / 3;

    const donutX = width / 2 - 120; // shift left by ~120px
    const donutY = height / 2;

    const g = svg.selectAll('.chart-group')
      .data([null])
      .join('g')
      .attr('class', 'chart-group');
    g.attr('transform', `translate(${donutX}, ${donutY})`);

    const dataLabels = {
      1: 2020,
      2: 2024,
      3: 2025
    };
    const dataStages = {
      1: [
        { currency: 'US Dollar ($)', value: 62.2 },
        { currency: 'Euro (€)', value: 27.1 },
        { currency: 'Pound sterling (£)', value: 4.3 },
        { currency: 'Japanese yen (¥)', value: 3.0 },
        { currency: 'Chinese renminbi (¥)', value: null },
        { currency: 'Other currencies', value: 3.5 },
      ],
      2: [
        { currency: 'US Dollar ($)', value: 61.9 },
        { currency: 'Euro (€)', value: 20.1 },
        { currency: 'Pound sterling (£)', value: 4.4 },
        { currency: 'Japanese yen (¥)', value: 5.9 },
        { currency: 'Chinese renminbi (¥)', value: 2.0 },
        { currency: 'Other currencies', value: 5.7 },
      ],
      3: [
        { currency: 'US Dollar ($)', value: 57.7 },
        { currency: 'Euro (€)', value: 20.1 },
        { currency: 'Pound sterling (£)', value: 5.2 },
        { currency: 'Japanese yen (¥)', value: 5.1 },
        { currency: 'Chinese renminbi (¥)', value: 2.1 },
        { currency: 'Other currencies', value: 9.8 },
      ],
    };

    const data = dataStages[value] || dataStages[1];

    const color = d3.scaleOrdinal()
      .domain(data.map(d => d.currency))
      .range(['#009edb', '#ffcb05', '#004987', '#B06E2A', '#A05FB4', '#AEA29A']);

    const pie = d3.pie()
      .sort(null)
      .value(d => d.value);

    const arc = d3.arc()
      .innerRadius(radius * 0.5)
      .outerRadius(radius);

    // --- Draw slices ---
    const arcs = g.selectAll('path')
      .data(pie(data), d => d.data.currency);

    arcs.enter()
      .append('path')
      .attr('fill', d => color(d.data.currency))
      .attr('opacity', 0.8)
      .each((d, i, nodes) => setArcState(nodes[i], d))
      .merge(arcs)
      .transition()
      .duration(750)
      .attrTween('d', (d, i, nodes) => arcTween(arc, nodes[i])(d));

    arcs.exit()
      .transition()
      .duration(300)
      .attrTween('d', (d) => {
        const end = { startAngle: d.endAngle, endAngle: d.endAngle };
        const interpolate = d3.interpolate(d, end);
        return t => arc(interpolate(t));
      })
      .remove();

    // --- Labels with percent values ---
    const labelArc = d3.arc()
      .innerRadius(radius * 0.8)
      .outerRadius(radius * 0.8);

    const labels = g.selectAll('.label')
      .data(pie(data), d => d.data.currency);

    labels.enter()
      .append('text')
      .attr('class', 'label')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('font-size', 14)
      .each((d, i, nodes) => setArcState(nodes[i], d))
      .merge(labels)
      .transition()
      .duration(750)
      .attr('transform', d => `translate(${labelArc.centroid(d)})`)
      .text(d => ((d.data.value !== null) ? `${d.data.value}%` : ''));

    labels.exit()
      .transition()
      .duration(500)
      .attr('opacity', 0)
      .remove();

    // ===== RIGHT SIDE LEGEND =====
    // --- compute donut/legend positions (replace your current g transform)

    // legend anchor on the right of the donut
    const legendX = donutX + radius + 60;
    const legendY = donutY - radius / 2 + 20;

    // Stable ordering — must match the exact strings in your data.currency
    const CURRENCY_ORDER = [
      'US Dollar ($)',
      'Euro (€)',
      'Pound sterling (£)',
      'Japanese yen (¥)',
      'Chinese renminbi (¥)',
      'Other currencies'
    ];

    // Build legend data in fixed order, then filter out missing/null values
    const legendData = CURRENCY_ORDER
      .map(key => data.find(d => d.currency === key)) // may produce undefined
      .filter(Boolean) // drop not-found entries
      .filter(d => d.value !== null); // keep only present values

    // Legend group (always present but may be empty)
    const legendGroup = svg.selectAll('.legend-group')
      .data([null])
      .join('g')
      .attr('class', 'legend-group')
      .attr('transform', `translate(${legendX}, ${legendY})`);

    // Bind items (only currencies with a real value for this year)
    // key function is currency (stable)
    const items = legendGroup.selectAll('.legend-item')
      .data(legendData, d => d.currency);

    // ENTER
    const itemsEnter = items.enter()
      .append('g')
      .attr('class', 'legend-item')
      .attr('opacity', 0);

    // color box
    itemsEnter.append('rect')
      .attr('width', 14)
      .attr('height', 14)
      .attr('rx', 2)
      .attr('y', 0)
      .attr('x', 0)
      .attr('fill', d => color(d.currency));

    // label text
    itemsEnter.append('text')
      .attr('x', 22)
      .attr('y', 11)
      .attr('font-size', 14)
      .attr('alignment-baseline', 'middle')
      .text(d => `${d.currency} – ${d.value}%`);

    // MERGE (enter + update)
    const itemsMerge = itemsEnter.merge(items);

    // Make sure rect/text update on data changes
    itemsMerge.select('rect')
      .attr('fill', d => color(d.currency));

    itemsMerge.select('text')
      .text(d => `${d.currency} – ${d.value}%`);

    // Transition to visible for enter/update
    itemsMerge.transition()
      .duration(350)
      .attr('opacity', 1);

    // EXIT
    items.exit()
      .transition()
      .duration(300)
      .attr('opacity', 0)
      .remove();

    // vertical stacking (recompute transform on the merged current selection)
    itemsMerge
      .attr('transform', (d, i) => `translate(0, ${i * 28})`);

    g.selectAll('.title')
      .data([dataLabels[value]])
      .join(
        enterSel => enterSel.append('text')
          .attr('class', 'title')
          .attr('text-anchor', 'middle')
          .attr('dy', '0.35em')
          .attr('opacity', 0)
          .text(d => d)
          .call(sel => sel.transition()
            .duration(500)
            .attr('opacity', 1)),

        updateSel => updateSel.call(sel => sel.transition()
          .duration(500)
          .tween('text', (d, i, nodes) => {
            const node = d3.select(nodes[i]);
            const current = +node.text();
            const interpolator = d3.interpolateNumber(current, d);
            return t => node.text(Math.round(interpolator(t)));
          }))
      );
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

FigurePie.propTypes = {
  value: PropTypes.string.isRequired,
};

export default FigurePie;
