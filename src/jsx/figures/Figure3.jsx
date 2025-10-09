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
    const previous = el.currentArcState || { startAngle: 0, endAngle: 0 };
    const interpolator = d3.interpolate(previous, { ...d }); // clone to avoid recursion
    el.currentArcState = interpolator(0);
    return t => arc(interpolator(t));
  };

  const chart = useCallback(() => {
    if (!svgRef.current) return;

    const { width, height } = dimensions;
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height]);

    const radius = Math.min(width, height) / 3;

    const g = svg.selectAll('.chart-group')
      .data([null])
      .join('g')
      .attr('class', 'chart-group')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    const dataStages = {
      1: [
        { currency: 'USD', value: 40 },
        { currency: 'EUR', value: 30 },
        { currency: 'CNY', value: 10 },
        { currency: 'JPY', value: 10 },
        { currency: 'Other', value: 10 },
      ],
      2: [
        { currency: 'USD', value: 35 },
        { currency: 'EUR', value: 32 },
        { currency: 'CNY', value: 15 },
        { currency: 'JPY', value: 10 },
        { currency: 'Other', value: 8 },
      ],
      3: [
        { currency: 'USD', value: 30 },
        { currency: 'EUR', value: 33 },
        { currency: 'CNY', value: 20 },
        { currency: 'JPY', value: 10 },
        { currency: 'Other', value: 7 },
      ],
    };

    const data = dataStages[value] || dataStages[1];

    const color = d3.scaleOrdinal()
      .domain(data.map(d => d.currency))
      .range(['#009edb', '#ffcb05', '#6c757d', '#28a745', '#6610f2']);

    const pie = d3.pie()
      .sort(null)
      .value(d => d.value);

    const arc = d3.arc()
      .innerRadius(0)
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
      .duration(500)
      .attr('opacity', 0)
      .remove();

    // --- Labels with percent values ---
    const labels = g.selectAll('text')
      .data(pie(data), d => d.data.currency);

    labels.enter()
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .style('fill', '#fff')
      .attr('font-size', 14)
      .each((d, i, nodes) => setArcState(nodes[i], d))
      .merge(labels)
      .transition()
      .duration(750)
      .attr('transform', d => `translate(${arc.centroid(d)})`)
      .text(d => `${d.data.currency} (${d.data.value}%)`);

    labels.exit()
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

FigurePie.propTypes = {
  value: PropTypes.string.isRequired,
};

export default FigurePie;
