import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

// https://www.npmjs.com/package/react-is-visible
import 'intersection-observer';
import { useIsVisible } from 'react-is-visible';

function DwChartContainer(props) {
  const { chart_id } = props;
  const chartRef = useRef(null);

  const isVisible = useIsVisible(chartRef, { once: true });

  useEffect(() => {
    const container = document.querySelector(`.chart_container_${chart_id} .chart`);
    const script = document.createElement('script');

    script.setAttribute('src', `https://datawrapper.dwcdn.net/${chart_id}/embed.js`);
    container.appendChild(script);
    return () => {
      container.removeChild(script);
    };
  }, [chart_id]);

  return (
    <div className={`chart_container chart_container_${chart_id}`}>
      <div className="parallax-container" style={{ opacity: (isVisible) ? '1' : '0', top: (isVisible) ? '0px' : '50px' }}>
        <div className="chart" ref={chartRef} />
      </div>
      <noscript><img src={`https://datawrapper.dwcdn.net/${chart_id}/full.png`} alt="" /></noscript>
    </div>
  );
}

DwChartContainer.propTypes = {
  chart_id: PropTypes.string.isRequired
};

export default DwChartContainer;
