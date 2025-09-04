import React, { useEffect, useRef, useState } from 'react';

import PropTypes from 'prop-types';

function isNumeric(value) {
  return !Number.isNaN(value) && !Number.isNaN(parseFloat(value));
}

function ChapterHeader(props) {
  const { chapter_number, subtitle, title } = props;
  const headerRef = useRef(null);
  const [scrollPercentage, setScrollPercentage] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!headerRef.current) return;

      const rect = headerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      const triggerPoint = windowHeight * 0.5;

      const visibility = Math.min(Math.max((windowHeight - rect.top) / (windowHeight - triggerPoint), 0), 1);

      setScrollPercentage(visibility);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div ref={headerRef} className="chapter_header">
      <div className="" style={{ opacity: scrollPercentage, transform: `translateX(${-(1 - scrollPercentage) * 30}%)` }}>
        <h2>
          <div className="chapter">
            {isNumeric(chapter_number) && (
              <div>
                Chapter
                {' '}
                {chapter_number}
              </div>
            )}
            {!isNumeric(chapter_number) && (
              <div>
                {chapter_number}
              </div>
            )}
          </div>
          <div>
            {title}
          </div>
          {subtitle && (
            <div className="subtitle">
              {subtitle}
            </div>
          )}
        </h2>
      </div>
    </div>
  );
}

ChapterHeader.propTypes = {
  chapter_number: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired
};

export default ChapterHeader;
