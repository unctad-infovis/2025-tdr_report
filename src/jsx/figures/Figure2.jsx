import React, {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react';
import PropTypes from 'prop-types';
import {
  drag,
  extent,
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceRadial,
  forceSimulation,
  scaleSqrt,
  scaleSymlog,
  select
} from 'd3';
import 'intersection-observer';
import { useIsVisible } from 'react-is-visible';

import edges_2007 from './data/figure2_data_2007_edges.json';
import nodes_2007 from './data/figure2_data_2007_nodes.json';
import edges_2023 from './data/figure2_data_2023_edges.json';
import nodes_2023 from './data/figure2_data_2023_nodes.json';

function animateNumber(from, to, duration, stepCallback, doneCallback) {
  const start = performance.now();

  function frame(now) {
    const progress = Math.min((now - start) / duration, 1);
    const current = Math.floor(from + (to - from) * progress);
    stepCallback(current);

    if (progress < 1) {
      requestAnimationFrame(frame);
    } else if (doneCallback) {
      doneCallback();
    }
  }
  requestAnimationFrame(frame);
}

const ForceNetwork = forwardRef(({ value, dimensions }, ref) => {
  const svgRef = useRef();
  const svgContainerRef = useRef();
  const chartRef = useRef();
  const isVisible = useIsVisible(chartRef, { once: true });
  const [visibleGroups, setVisibleGroups] = useState({
    north: true,
    south: true
  });

  const [displayYear, setDisplayYear] = useState(2007);

  const toggle = (id) => {
    setVisibleGroups(v => ({ ...v, [id]: !v[id] }));
  };

  const simulationRef = useRef(null);
  const nodesMapRef = useRef({}); // keep nodes by id to preserve positions

  // Update node, link & legend visibility when React state changes
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = select(svgRef.current);

    // recompute the opacityScale same as in chart()
    const allEdgeValues = [
      ...edges_2007.map(d => d.value),
      ...edges_2023.map(d => d.value)
    ];
    const opacityScale = scaleSymlog()
      .constant(2)
      .domain(extent(allEdgeValues))
      .range([0, 0.7]);

    const allValues = [
      ...nodes_2007.map(d => d.value),
      ...nodes_2023.map(d => d.value)
    ];

    const radiusScale = scaleSymlog()
      .constant(2)
      .domain(extent(allValues)) // min → max across both datasets
      .range([0, 40]); // tweak to your liking

    // run on next tick so the chart has created the nodes/links
    setTimeout(() => {
      // NODE visibility (use attr so it isn't overridden by style)
      svg.selectAll('.node_north')
        .transition().duration(300)
        .attr('r', d => radiusScale(d.value))
        .attr('opacity', visibleGroups.north ? 0.95 : 0.05);

      svg.selectAll('.node_south')
        .transition().duration(300)
        .attr('r', d => radiusScale(d.value))
        .attr('opacity', visibleGroups.south ? 0.95 : 0.05);

      // LINK visibility: use a normal function so `this` is the element
      svg.selectAll('.link').each((d, i, nodes) => {
        // d.source / d.target might be objects (after forceLink) or ids (before),
        // so prefer object.status if present, else the precomputed sourceStatus/targetStatus
        const sStatus = d && d.source && d.source.status ? d.source.status : d.sourceStatus;
        const tStatus = d && d.target && d.target.status ? d.target.status : d.targetStatus;

        const showSource = sStatus ? !!visibleGroups[sStatus] : true;
        const showTarget = tStatus ? !!visibleGroups[tStatus] : true;

        const visible = showSource && showTarget;

        const targetOpacity = visible ? Math.max(0.03, opacityScale(d.value)) : 0.02;

        select(nodes[i])
          .transition()
          .duration(300)
          .attr('opacity', targetOpacity);
      });
    }, 0);

    // Update legend visuals (no DOM wait needed)
    svg.selectAll('.legend-item')
      .transition().duration(200)
      .style('opacity', (d) => (visibleGroups[d.group] ? 1 : 0.4));
  }, [visibleGroups, value]);

  const chart = useCallback(() => {
    if (!svgContainerRef.current) return;
    const { height } = dimensions;
    const { width } = dimensions;
    const margin = {
      top: 200, right: 0, bottom: 0, left: 100
    };
    const svg = select(svgRef.current)
      .attr('height', height)
      .attr('width', width)
      .attr('viewBox', [0, 0, width, height]);

    const allNodes = [...nodes_2007, ...nodes_2023];
    const dragNodes = drag()
      .on('start', (event, d) => {
        if (!event.active) simulationRef.current.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event, d) => {
        if (!event.active) simulationRef.current.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    // --- Legend ---
    svg.selectAll('.legend').remove(); // clear old legend on update

    const legendData = [
      { label: 'Global north', color: '#009edb', group: 'north' },
      { label: 'Global south', color: '#ffcb05', group: 'south' }
    ];

    // Legend group
    const legend = svg.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${margin.top}, ${margin.left})`);

    // One row per item
    const items = legend.selectAll('.legend-item')
      .data(legendData)
      .enter()
      .append('g')
      .attr('class', 'legend-item')
      .attr('transform', (d, i) => `translate(0, ${i * 24})`)
      .style('cursor', 'pointer')
      .style('opacity', d => (visibleGroups[d.group] ? 1 : 0.4)) // initial dim
      .on('click', (event, d) => toggle(d.group));

    // Circle symbol
    items.append('circle')
      .attr('r', 7)
      .attr('cx', 7)
      .attr('cy', 7)
      .attr('fill', d => d.color);

    // Text label
    items.append('text')
      .attr('x', 22)
      .attr('y', 11)
      .attr('fill', '#fff')
      .style('font-size', '14px')
      .text(d => d.label);

    const nodesData = value === '1' ? nodes_2007 : nodes_2023;
    let linksData = value === '1' ? edges_2007 : edges_2023;

    // attach source/target status to link objects for easy lookup
    linksData = linksData.map(l => ({
      ...l,
      sourceStatus: nodesData.find(n => n.id === l.source)?.status,
      targetStatus: nodesData.find(n => n.id === l.target)?.status
    }));

    // --- Preserve previous positions ---
    allNodes.forEach(d => {
      if (nodesMapRef.current[d.id]) {
        d.x = nodesMapRef.current[d.id].x;
        d.y = nodesMapRef.current[d.id].y;
        d.vx = nodesMapRef.current[d.id].vx;
        d.vy = nodesMapRef.current[d.id].vy;
      }
    });
    nodesMapRef.current = Object.fromEntries(nodesData.map(d => [d.id, d]));

    // --- Simulation ---
    const centerForce = forceRadial(
      d => 10 / Math.sqrt(d.value),
      width / 2,
      height / 2
    ).strength(0.07); // stronger radial pull
    if (!simulationRef.current) {
      simulationRef.current = forceSimulation(nodesData)
        .force('link', forceLink(linksData).id(d => d.id).distance(500))
        .force('charge', forceManyBody().strength(d => -200 / Math.sqrt(d.value)))
        .force('center', forceCenter(width / 2, height / 2))
        .force('collide', forceCollide(d => d.r))
        .force('radial', centerForce);
    } else {
      simulationRef.current.nodes(nodesData);
      simulationRef.current.force('link').links(linksData);
      simulationRef.current.alpha(1).restart();
    }

    // --- Links ---
    const allEdgeValues = [
      ...edges_2007.map(d => d.value),
      ...edges_2023.map(d => d.value)
    ];

    const strokeScale = scaleSymlog()
      .constant(1)
      .domain(extent(allEdgeValues)) // min → max across both arrays
      .range([0, 30]); // tweak to your liking

    const opacityScale = scaleSymlog()
      .constant(1)
      .domain(extent(allEdgeValues)) // min → max across both arrays
      .range([0, 0.7]); // tweak to your liking

    const linkSel = svg.selectAll('.link').data(
      linksData.map(d => ({
        ...d,
        sid: typeof d.source === 'object' ? d.source.id : d.source,
        tid: typeof d.target === 'object' ? d.target.id : d.target
      })),
      d => `${d.sid}-${d.tid}`
    );

    // Compute target opacity for each link
    const linkUpdate = linkSel.enter()
      .append('path')
      .attr('class', d => `link link_${d.sourceStatus}_${d.targetStatus}`)
      .attr('fill', 'none')
      .attr('stroke', '#ccc')
      .merge(linkSel);

    linkUpdate
      .transition()
      .duration(300) // consistent with node transitions
      .attr('stroke-width', d => strokeScale(d.value))
      .attr('opacity', d => {
        const sStatus = d?.source?.status ?? d.sourceStatus;
        const tStatus = d?.target?.status ?? d.targetStatus;

        const showSource = sStatus ? !!visibleGroups[sStatus] : true;
        const showTarget = tStatus ? !!visibleGroups[tStatus] : true;

        return (showSource && showTarget) ? Math.max(0.03, opacityScale(d.value)) : 0.02;
      });

    linkSel.exit()
      .transition()
      .duration(300)
      .attr('opacity', 0)
      .remove();

    linkSel.exit().remove();

    // --- Nodes ---
    const nodeSel = svg.selectAll('.node').data(nodesData, d => d.id);

    const nodeEnter = nodeSel.enter()
      .append('circle')
      .attr('class', d => `node node_${d.status}`)
      .attr('r', 0)
      .attr('fill', d => (d.status === 'north' ? '#009edb' : '#ffcb05'))
      .attr('opacity', 0)
      .call(dragNodes);

    const allValues = [
      ...nodes_2007.map(d => d.value),
      ...nodes_2023.map(d => d.value)
    ];

    const radiusScale = scaleSymlog()
      .constant(2)
      .domain(extent(allValues)) // min → max across both datasets
      .range([2, 40]); // tweak to your liking

    const mergedNode = nodeEnter.merge(nodeSel);
    mergedNode
      .transition()
      .duration(500)
      .attr('r', d => radiusScale(d.value))
      .attr('opacity', 0.95)
      .each((d, i, elements) => select(elements[i]).raise());

    nodeSel.exit()
      .transition()
      .duration(500)
      .attr('r', 0)
      .attr('opacity', 0)
      .remove();

    // --- Labels ---
    const textScale = scaleSqrt()
      .domain(extent(allValues)) // smallest → largest across both datasets
      .range([7, 20]); // adjust these pixel sizes as needed
    const labelSel = svg.selectAll('.nodelabel').data(nodesData, d => d.id);
    const labelEnter = labelSel.enter()
      .append('text')
      .attr('fill', '#fff')
      .attr('class', d => `nodelabel node_${d.status}`)
      .attr('text-anchor', 'middle')
      .attr('dy', 0)
      .attr('opacity', 0)
      .style('font-size', (d) => textScale(d.value))
      .text(d => d.id);

    const mergedLabel = labelEnter.merge(labelSel);
    mergedLabel
      .transition()
      .duration(500)
      .attr('opacity', 1)
      .each((d, i, elements) => select(elements[i]).raise());

    labelSel.exit()
      .transition()
      .duration(500)
      .attr('opacity', 0)
      .remove();

    // --- Safe curved link generator ---
    const curvedPath = d => {
      const sx = d.source?.x;
      const sy = d.source?.y;
      const tx = d.target?.x;
      const ty = d.target?.y;

      // Coordinates not ready → skip rendering
      if (!Number.isFinite(sx) || !Number.isFinite(sy) || !Number.isFinite(tx) || !Number.isFinite(ty)) {
        return '';
      }

      const dx = tx - sx;
      const dy = ty - sy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Curvature decreases with distance → long links = less curve
      // Increase 0.25 if you want more curvature overall
      const curvature = dist * 0.15;

      // Midpoint
      const mx = (sx + tx) / 2;
      const my = (sy + ty) / 2;

      // Perpendicular offset scaled by curvature
      const norm = Math.sqrt(dx * dx + dy * dy) || 1; // avoid division by zero

      const offsetX = (dy / norm) * curvature;
      const offsetY = (-dx / norm) * curvature;

      // Control point
      const cx = mx + offsetX;
      const cy = my + offsetY;

      return `M${sx},${sy} Q${cx},${cy} ${tx},${ty}`;
    };

    // --- Tick ---
    simulationRef.current.on('tick', () => {
      svg.selectAll('.link')
        .attr('d', curvedPath);

      svg.selectAll('.node')
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);

      svg.selectAll('.nodelabel')
        .attr('x', d => d.x)
        .attr('y', d => d.y - radiusScale(d.value) - 2); // 2px breathing room
    });
  }, [value, dimensions, visibleGroups]);

  useEffect(() => {
    if (!svgRef.current && svgContainerRef.current) {
      const svg = select(svgContainerRef.current).append('svg');
      svgRef.current = svg.node();
    }
    if (isVisible) chart();
  }, [chart, isVisible]);

  useEffect(() => {
    const target = value === '1' ? 2007 : 2023;
    const duration = 300;

    animateNumber(displayYear, target, duration, setDisplayYear);
  }, [value, displayYear]);

  return (
    <div ref={chartRef}>
      <div className="app" ref={ref}>
        <h3>{displayYear}</h3>
        {isVisible && (<div className="svg_container" ref={svgContainerRef} />)}
      </div>
    </div>
  );
});

ForceNetwork.propTypes = {
  dimensions: PropTypes.shape({
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired
  }).isRequired,
  value: PropTypes.string.isRequired
};

export default ForceNetwork;
