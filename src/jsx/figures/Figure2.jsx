import React, {
  useEffect, useRef, useState, useCallback, forwardRef
} from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import 'intersection-observer';
import { useIsVisible } from 'react-is-visible';

const ForceNetwork = forwardRef(({ value }, ref) => {
  const svgRef = useRef();
  const svgContainerRef = useRef();
  const chartRef = useRef();
  const isVisible = useIsVisible(chartRef, { once: true });

  const [dimensions, setDimensions] = useState({
    height: window.innerHeight,
    width: window.innerWidth,
  });

  const simulationRef = useRef(null);
  const nodesMapRef = useRef({}); // keep nodes by id to preserve positions

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
    if (!svgContainerRef.current) return;
    const svg = d3.select(svgRef.current);
    const { width, height } = dimensions;

    svg.attr('viewBox', [0, 0, width, height])
      .attr('width', width)
      .attr('height', height);

    // --- Data ---
    const nodes2020 = [
      { id: 'USA', value: 100 },
      { id: 'CHN', value: 90 },
      { id: 'DEU', value: 80 },
      { id: 'JPN', value: 70 },
      { id: 'GBR', value: 60 },
      { id: 'FRA', value: 55 },
      { id: 'IND', value: 50 },
      { id: 'CAN', value: 45 },
      { id: 'ITA', value: 40 },
      { id: 'BRA', value: 35 },
    ];

    const nodes2025 = [
      { id: 'USA', value: 400 },
      { id: 'CHN', value: 110 },
      { id: 'IND', value: 95 },
      { id: 'DEU', value: 85 },
      { id: 'JPN', value: 75 },
      { id: 'BRA', value: 65 },
      { id: 'GBR', value: 60 },
      { id: 'FRA', value: 55 },
      { id: 'CAN', value: 50 },
      { id: 'ITA', value: 45 },
    ];

    const links2020 = [
      { source: 'USA', target: 'CHN', value: 30 },
      { source: 'USA', target: 'DEU', value: 20 },
      { source: 'CHN', target: 'JPN', value: 25 },
      { source: 'DEU', target: 'FRA', value: 15 },
      { source: 'GBR', target: 'USA', value: 10 },
      { source: 'IND', target: 'CHN', value: 5 },
      { source: 'CAN', target: 'USA', value: 8 },
      { source: 'ITA', target: 'DEU', value: 12 },
      { source: 'BRA', target: 'USA', value: 7 },
      { source: 'FRA', target: 'GBR', value: 6 },
    ];

    const links2025 = [
      { source: 'USA', target: 'CHN', value: 35 },
      { source: 'USA', target: 'IND', value: 25 },
      { source: 'CHN', target: 'IND', value: 20 },
      { source: 'DEU', target: 'FRA', value: 18 },
      { source: 'IND', target: 'BRA', value: 15 },
      { source: 'GBR', target: 'USA', value: 12 },
      { source: 'FRA', target: 'GBR', value: 10 },
      { source: 'CAN', target: 'USA', value: 9 },
      { source: 'ITA', target: 'DEU', value: 8 },
      { source: 'JPN', target: 'CHN', value: 7 },
    ];

    const nodesData = value === '1' ? nodes2020 : nodes2025;
    const linksData = value === '1' ? links2020 : links2025;

    // --- Preserve previous positions ---
    nodesData.forEach(d => {
      if (nodesMapRef.current[d.id]) {
        d.x = nodesMapRef.current[d.id].x;
        d.y = nodesMapRef.current[d.id].y;
        d.vx = nodesMapRef.current[d.id].vx;
        d.vy = nodesMapRef.current[d.id].vy;
      }
    });
    nodesMapRef.current = Object.fromEntries(nodesData.map(d => [d.id, d]));

    // --- Simulation ---
    if (!simulationRef.current) {
      simulationRef.current = d3.forceSimulation(nodesData)
        .force('link', d3.forceLink(linksData).id(d => d.id).distance(100))
        .force('charge', d3.forceManyBody().strength(-200))
        .force('center', d3.forceCenter(width / 2, height / 2));
    } else {
      simulationRef.current.nodes(nodesData);
      simulationRef.current.force('link').links(linksData);
      simulationRef.current.alpha(1).restart();
    }

    // --- Links ---
    const linkSel = svg.selectAll('.link').data(linksData, d => `${d.source.id || d.source}-${d.target.id || d.target}`);
    linkSel.enter()
      .append('line')
      .attr('class', 'link')
      .attr('stroke', '#ffcb05')
      .attr('stroke-width', d => Math.sqrt(d.value))
      .attr('opacity', 0)
      .merge(linkSel)
      .transition()
      .duration(0)
      .attr('stroke-width', d => Math.sqrt(d.value))
      .attr('opacity', 0.7);

    linkSel.exit()
      // .transition()
      // .duration(0)
      // .attr('opacity', 0)
      .remove();

    // --- Nodes ---
    const nodeSel = svg.selectAll('.node').data(nodesData, d => d.id);
    const nodeEnter = nodeSel.enter()
      .append('circle')
      .attr('class', 'node')
      .attr('r', 0)
      .attr('fill', '#009edb')
      .attr('opacity', 0);

    const mergedNode = nodeEnter.merge(nodeSel);
    mergedNode
      .transition()
      .duration(500)
      .attr('r', d => Math.sqrt(d.value))
      .attr('opacity', 1)
      .each((d, i, elements) => d3.select(elements[i]).raise());

    nodeSel.exit()
      .transition()
      .duration(500)
      .attr('r', 0)
      .attr('opacity', 0)
      .remove();

    // --- Labels ---
    const labelSel = svg.selectAll('.nodelabel').data(nodesData, d => d.id);
    const labelEnter = labelSel.enter()
      .append('text')
      .attr('fill', '#fff')
      .attr('class', 'nodelabel')
      .attr('text-anchor', 'middle')
      .attr('dy', -10)
      .attr('opacity', 0)
      .text(d => d.id);

    const mergedLabel = labelEnter.merge(labelSel);
    mergedLabel
      .transition()
      .duration(500)
      .attr('opacity', 1)
      .each((d, i, elements) => d3.select(elements[i]).raise());

    labelSel.exit()
      .transition()
      .duration(500)
      .attr('opacity', 0)
      .remove();

    // --- Tick ---
    simulationRef.current.on('tick', () => {
      svg.selectAll('.link')
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      svg.selectAll('.node')
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .each((d, i, elements) => d3.select(elements[i]).raise());

      svg.selectAll('.nodelabel')
        .attr('x', d => d.x)
        .attr('y', d => d.y - 10)
        .each((d, i, elements) => d3.select(elements[i]).raise());
    });
  }, [value, dimensions]);

  useEffect(() => {
    if (!svgRef.current && svgContainerRef.current) {
      const svg = d3.select(svgContainerRef.current)
        .append('svg')
        .attr('width', dimensions.width)
        .attr('height', dimensions.height);
      svgRef.current = svg.node();
    }
    if (isVisible) chart();
  }, [chart, isVisible, dimensions]);

  return (
    <div ref={chartRef}>
      <div className="app" ref={ref}>
        {isVisible && (<div className="svg_container" ref={svgContainerRef} />)}
      </div>
    </div>
  );
});

ForceNetwork.propTypes = {
  value: PropTypes.string.isRequired, // "1" or "2"
};

export default ForceNetwork;
