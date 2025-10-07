import React, {
  useEffect, useRef, useState, useCallback, forwardRef
} from 'react';
import * as d3 from 'd3';
import PropTypes from 'prop-types';
import 'intersection-observer';
import { useIsVisible } from 'react-is-visible';

const FigureIntro = forwardRef(({ highlight_bool, node_count }, ref) => {
  const svgRef = useRef();
  const svgContainerRef = useRef();
  const simulationRef = useRef(null);
  const chartRef = useRef();
  const isVisible = useIsVisible(chartRef, { once: true });

  const [dimensions, setDimensions] = useState({
    height: window.innerHeight,
    radius: Math.min(window.innerWidth, window.innerHeight) / 2 - 50,
    width: window.innerWidth
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        height: window.innerHeight,
        radius: Math.min(window.innerWidth, window.innerHeight) / 2 - 50,
        width: window.innerWidth
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const chart = useCallback((count, highlight) => {
    const { width, height, radius } = dimensions;
    const nodes = d3.range(count).map((d, i) => ({ id: i, radius: 5, name: '$' }));

    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const circles = svg.selectAll('circle').data(nodes, d => d.id); // or text
    const r = (dimensions.width > 578) ? 10 : 5;
    circles.exit()
      .transition()
      .delay((d, i) => Math.random() * i * 1)
      .attr('r', 0)
      .style('font-size', 0)
      .remove();

    const enter = circles.enter().append('circle') // or text
      .text('$')
      .attr('r', 0)
      .style('font-size', 0)
      .attr('text-anchor', 'middle')
      .attr('fill', (d, i) => (d.id === 5 && highlight ? '#ffc800' : i > 19 ? '#009edb' : '#c5dfef'));

    enter
      .transition()
      .delay((d, i) => Math.random() * i * 5)
      .attr('r', r)
      .style('font-size', '30px');

    enter.merge(circles)
      .transition()
      .delay((d, i) => Math.random() * i * 5)
      .attr('r', r);

    circles.attr('fill', (d, i) => (d.id === 5 && highlight ? '#ffc800' : i > 19 ? '#009edb' : '#c5dfef'));

    const collide = dimensions.width > 578
      ? d3.forceCollide().radius(d => (count === 19 ? (d.id === 5 && highlight) ? 40 : d.radius + 8 + Math.random() * 10 : (d.id === 5 && highlight) ? d.radius + 8 : d.radius + 8 + Math.random() * 10)).iterations(1)
      : d3.forceCollide().radius(d => (count === 19 ? (d.id === 5 && highlight) ? 40 : d.radius - 2 + Math.random() * 10 : (d.id === 5 && highlight) ? d.radius - 2 : d.radius - 2 + Math.random() * 10)).iterations(1);

    const radial = dimensions.width > 578
      ? d3.forceRadial(radius).strength((count === 19 ? 0.05 : 0.0005))
      : d3.forceRadial(radius).strength((count === 19 ? 0.05 : 0.01));

    simulationRef.current = d3.forceSimulation()
      .nodes(nodes)
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', collide)
      .force('radial', radial)
      .on('tick', () => {
        svg.selectAll('circle')
          .attr('cx', d => d.x)
          .attr('cy', d => d.y);
        svg.selectAll('text')
          .attr('x', d => d.x)
          .attr('y', d => d.y);
      });

    if (simulationRef.current) {
      simulationRef.current.alpha(1).restart();
    }
  }, [dimensions]);

  useEffect(() => {
    const { width, height } = dimensions;
    if (isVisible) {
      if (!svgRef.current) {
        const svg = d3.select(svgContainerRef.current)
          .append('svg')
          .attr('height', height)
          .attr('width', width);

        svgRef.current = svg.node();
        setTimeout(() => {
          chart(node_count, highlight_bool);
        }, 1000);
      } else {
        chart(node_count, highlight_bool);
      }
    }
    return () => {
      if (simulationRef.current) {
        simulationRef.current.stop();
      }
      // if (svgRef.current) {
      // d3.select(svgRef.current).selectAll('*').remove();
      // }
    };
  }, [chart, highlight_bool, isVisible, node_count, dimensions]);

  return (
    <div ref={chartRef}>
      <div className="app" ref={ref}>
        {isVisible && (<div className="svg_container" ref={svgContainerRef} />)}
      </div>
    </div>
  );
});

FigureIntro.propTypes = {
  highlight_bool: PropTypes.bool.isRequired,
  node_count: PropTypes.number.isRequired
};

export default FigureIntro;
