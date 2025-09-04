import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

function ScrollingText({ chapter_text, texts }) {
  const containerRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        // Progress starts from 0 when the element enters the screen
        let progress = (windowHeight - rect.top) / (windowHeight + rect.height);
        progress = Math.max(0, Math.min(1, progress)); // Clamp value between 0 and 1

        setScrollProgress(progress);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={`scrolling-text-container count_${texts.length}`} ref={containerRef}>
      {(scrollProgress > 0 && scrollProgress < 1) && <div className="header">{chapter_text}</div>}
      {(scrollProgress > 0 && scrollProgress < 1) && <div className="background" />}
      {texts.map((text, index) => {
        const baseOffset = 100 * (index + 1) + 100;
        const translateX = baseOffset - scrollProgress * 450;
        let opacity = 1;
        if (translateX > 30) {
          opacity = (1 - (translateX * 1.1 - 30) / 100);
        } else if (translateX < 0) {
          opacity = (1 + (translateX * 1.2) / 100);
        }
        return (
          (scrollProgress > 0 && scrollProgress < 1) && (
            <div key={text} className="scrolling-text" style={{ transform: `translateX(${translateX}%)`, opacity }}>
              <p>
                {text}
              </p>
            </div>
          )
        );
      })}
    </div>
  );
}

ScrollingText.propTypes = {
  chapter_text: PropTypes.string.isRequired,
  texts: PropTypes.arrayOf(PropTypes.string).isRequired
};

export default ScrollingText;
