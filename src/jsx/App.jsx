import React, {
  useState, useEffect, useRef, useCallback
} from 'react';
import '../styles/styles.less';

// https://www.npmjs.com/package/react-is-visible
import 'intersection-observer';
import { useIsVisible } from 'react-is-visible';

import scrollIntoView from 'scroll-into-view';

import Header from './components/Header.jsx';
import DwChartContainer from './components/DwChartContainer.jsx';
import ChapterHeader from './components/ChapterHeader.jsx';
import ParallaxImage from './components/ParallaxImage.jsx';
import ScrollingText from './components/ScrollingText.jsx';
import Figure1 from './figures/Figure1.jsx';
import Figure2 from './figures/Figure2.jsx';
import Figure3 from './figures/Figure3.jsx';
import Figure4 from './figures/Figure4.jsx';

function App() {
  const appRef = useRef();
  const overviewRef = useRef();
  const isVisibleChapterOverview = useIsVisible(overviewRef);
  const chaptersContainerRef = useRef();
  const chapter1Ref = useRef();
  const isVisibleChapter1 = useIsVisible(chapter1Ref);
  const chapter2Ref = useRef();
  const isVisibleChapter2 = useIsVisible(chapter2Ref);
  const chapter3Ref = useRef();
  const isVisibleChapter3 = useIsVisible(chapter3Ref);
  const chapter4Ref = useRef();
  const isVisibleChapter4 = useIsVisible(chapter4Ref);
  const chapter5Ref = useRef();
  const isVisibleChapter5 = useIsVisible(chapter5Ref);
  const chapter6Ref = useRef();
  const isVisibleChapter6 = useIsVisible(chapter6Ref);

  const [offset, setOffset] = useState(false);

  const analytics = window.gtag || undefined;
  const track = useCallback((label_event = false, value_event = false) => {
    if (typeof analytics !== 'undefined' && label_event !== false && value_event !== false) {
      analytics('event', 'project_interaction', {
        label: label_event,
        project_name: '2025-tdr_report',
        transport_type: 'beacon',
        value: value_event
      });
    }
  }, [analytics]);

  const seenChapter = useCallback((chapter) => {
    track('Scroll', chapter);
  }, [track]);

  useEffect(() => {
    if (!overviewRef.current.classList.contains('seen') && isVisibleChapterOverview) {
      overviewRef.current.classList.add('seen');
      seenChapter('Overview');
    }
  }, [overviewRef, seenChapter, isVisibleChapterOverview]);

  useEffect(() => {
    if (!chapter1Ref.current.classList.contains('seen') && isVisibleChapter1) {
      chapter1Ref.current.classList.add('seen');
      seenChapter('Chapter 1');
    }
  }, [chapter1Ref, seenChapter, isVisibleChapter1]);

  useEffect(() => {
    if (!chapter2Ref.current.classList.contains('seen') && isVisibleChapter2) {
      chapter2Ref.current.classList.add('seen');
      seenChapter('Chapter 2');
    }
  }, [chapter2Ref, seenChapter, isVisibleChapter2]);

  useEffect(() => {
    if (!chapter3Ref.current.classList.contains('seen') && isVisibleChapter3) {
      chapter3Ref.current.classList.add('seen');
      seenChapter('Chapter 3');
    }
  }, [chapter3Ref, seenChapter, isVisibleChapter3]);

  useEffect(() => {
    if (!chapter4Ref.current.classList.contains('seen') && isVisibleChapter4) {
      chapter4Ref.current.classList.add('seen');
      seenChapter('Chapter 4');
    }
  }, [chapter4Ref, seenChapter, isVisibleChapter4]);

  useEffect(() => {
    if (!chapter5Ref.current.classList.contains('seen') && isVisibleChapter5) {
      chapter5Ref.current.classList.add('seen');
      seenChapter('Chapter 5');
    }
  }, [chapter5Ref, seenChapter, isVisibleChapter5]);

  useEffect(() => {
    if (!chapter6Ref.current.classList.contains('seen') && isVisibleChapter6) {
      chapter6Ref.current.classList.add('seen');
      seenChapter('Chapter 6');
    }
  }, [chapter6Ref, seenChapter, isVisibleChapter6]);

  useEffect(() => {
    const onScroll = () => setOffset(window.pageYOffset);
    window.removeEventListener('scroll', onScroll);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const [sectionProgress, setSectionProgress] = useState(0);

  useEffect(() => {
    const windowHeight = 0;
    setSectionProgress((offset > chaptersContainerRef.current.offsetTop - windowHeight) ? (Math.min(((offset - (chaptersContainerRef.current.offsetTop - windowHeight)) / chaptersContainerRef.current.offsetHeight) * 100, 100)) : 0);
  }, [offset]);

  useEffect(() => {
    const paragraphs = appRef.current.querySelectorAll('.text_content p, .text_content ul, .text_content ol, .text_content h3, .text_content blockquote');

    // Options for the observer (when the p tag is 50% in the viewport)
    const options = {
      threshold: 0.5, // Trigger when 50% of the paragraph is visible
    };

    // Callback function for when the intersection occurs
    const observerCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
        // Add the visible class when the element is in view
          entry.target.classList.add('visible');
        }
      });
    };

    // Create an IntersectionObserver instance with the callback and options
    const observer = new IntersectionObserver(observerCallback, options);

    // Observe each paragraph
    paragraphs.forEach(p => observer.observe(p));
    setTimeout(() => {
      window.dispatchEvent(new Event('scroll'));
    }, 500); // A short delay ensures the DOM is ready
  }, []);

  const downloadDocument = (event) => {
    track('Anchor', `${event.currentTarget.href}`);
    event.stopPropagation();
  };

  const scrollTo = useCallback((target, name) => {
    track('Button', name);
    if (target.includes('anchor_')) {
      setTimeout(() => {
        scrollIntoView(document.querySelector(target), {
          align: {
            left: 0, leftOffset: 0, lockX: false, lockY: false, top: 0, topOffset: 40
          },
          cancellable: false,
          ease(value) {
            return value;
          },
          time: 1000
        });
      }, 50);
    } else {
      setTimeout(() => {
        scrollIntoView(appRef.current.querySelector(target), {
          align: {
            left: 0, leftOffset: 0, lockX: false, lockY: false, top: 0, topOffset: 60
          },
          cancellable: false,
          ease(value) {
            return value;
          },
          time: 1000
        });
      }, 50);
    }
  }, [track]);

  const chapterTitles = ['Chapter 1 title', 'Chapter 2 title', 'Chapter 3 title', 'Chapter 4 title', 'Chapter 5 title', 'Chapter 6 title'];

  const [figure1Data, setFigure1Data] = useState('1');
  const fixedSectionRefFigure1 = useRef();
  const chartFigure1 = useRef(null);
  const [positionFigure1, setPositionFigure1] = useState('');
  const handleScrollFigure01 = useCallback(() => {
    if (!fixedSectionRefFigure1.current) return;

    // 5 screens.
    fixedSectionRefFigure1.current.style.height = `${6 * 130 + 80}vh`;

    const { scrollY, innerHeight } = window;
    let { top } = fixedSectionRefFigure1.current.getBoundingClientRect();
    top += scrollY;
    const { height } = fixedSectionRefFigure1.current.getBoundingClientRect();
    const fixedBottom = top + height - innerHeight;
    const relativeScroll = scrollY - top;

    // Determine position state
    setPositionFigure1((scrollY < top) ? 'absolute_top' : (scrollY < fixedBottom) ? 'fixed' : 'absolute_bottom');

    if (!chartFigure1.current) return;

    // Define switch points
    const switchPoints = [innerHeight * 0.3 + innerHeight * 0.8, innerHeight * 1.6 + innerHeight * 0.8, innerHeight * 2.9 + innerHeight * 0.8, innerHeight * 4.2 + innerHeight * 0.8, innerHeight * 5.5 + innerHeight * 0.8, innerHeight * 6.8 + innerHeight * 0.8];

    const newState = {
      isAbove1: relativeScroll < switchPoints[0],
      isAbove2: relativeScroll < switchPoints[1],
      isAbove3: relativeScroll < switchPoints[2],
      isAbove4: relativeScroll < switchPoints[3],
      isAbove5: relativeScroll < switchPoints[4],
      isAbove6: relativeScroll < switchPoints[5]
    };
    if (newState.isAbove1) {
      fixedSectionRefFigure1.current.querySelector('.fixed-background .overlay').style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
      fixedSectionRefFigure1.current.querySelector('.fixed-background .overlay').style.pointerEvents = 'auto';
      fixedSectionRefFigure1.current.querySelector('.scroll-elements').style.pointerEvents = 'auto';
      setFigure1Data('1');
    } else if (newState.isAbove2) {
      fixedSectionRefFigure1.current.querySelector('.fixed-background .overlay').style.backgroundColor = 'rgba(0, 0, 0, 0)';
      fixedSectionRefFigure1.current.querySelector('.fixed-background .overlay').style.pointerEvents = 'none';
      fixedSectionRefFigure1.current.querySelector('.scroll-elements').style.pointerEvents = 'none';
      setFigure1Data('2');
    } else if (newState.isAbove3) {
      fixedSectionRefFigure1.current.querySelector('.fixed-background .overlay').style.backgroundColor = 'rgba(0, 0, 0, 0)';
      fixedSectionRefFigure1.current.querySelector('.fixed-background .overlay').style.pointerEvents = 'none';
      fixedSectionRefFigure1.current.querySelector('.scroll-elements').style.pointerEvents = 'none';
      setFigure1Data('3');
    } else if (newState.isAbove4) {
      fixedSectionRefFigure1.current.querySelector('.fixed-background .overlay').style.backgroundColor = 'rgba(0, 0, 0, 0)';
      fixedSectionRefFigure1.current.querySelector('.fixed-background .overlay').style.pointerEvents = 'none';
      fixedSectionRefFigure1.current.querySelector('.scroll-elements').style.pointerEvents = 'none';
      setFigure1Data('4');
    } else if (newState.isAbove5) {
      fixedSectionRefFigure1.current.querySelector('.fixed-background .overlay').style.backgroundColor = 'rgba(0, 0, 0, 0)';
      fixedSectionRefFigure1.current.querySelector('.fixed-background .overlay').style.pointerEvents = 'none';
      fixedSectionRefFigure1.current.querySelector('.scroll-elements').style.pointerEvents = 'none';
      setFigure1Data('5');
    } else {
      fixedSectionRefFigure1.current.querySelector('.fixed-background .overlay').style.backgroundColor = 'rgba(0, 0, 0, 0)';
      fixedSectionRefFigure1.current.querySelector('.fixed-background .overlay').style.pointerEvents = 'none';
      fixedSectionRefFigure1.current.querySelector('.scroll-elements').style.pointerEvents = 'none';
      setFigure1Data('6');
    }
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScrollFigure01);
    return () => window.removeEventListener('scroll', handleScrollFigure01);
  }, [handleScrollFigure01]);

  const [figure2Data, setFigure2Data] = useState('1');
  const fixedSectionRefFigure2 = useRef();
  const chartFigure2 = useRef(null);
  const [positionFigure2, setPositionFigure2] = useState('');
  const handleScrollFigure02 = useCallback(() => {
    if (!fixedSectionRefFigure2.current) return;

    // 3 screens.
    fixedSectionRefFigure2.current.style.height = `${3 * 130 + 80}vh`;

    const { scrollY, innerHeight } = window;
    let { top } = fixedSectionRefFigure2.current.getBoundingClientRect();
    top += scrollY;
    const { height } = fixedSectionRefFigure2.current.getBoundingClientRect();
    const fixedBottom = top + height - innerHeight;
    const relativeScroll = scrollY - top;

    // Determine position state
    setPositionFigure2((scrollY < top) ? 'absolute_top' : (scrollY < fixedBottom) ? 'fixed' : 'absolute_bottom');

    if (!chartFigure2.current) return;

    // Define switch points
    const switchPoints = [innerHeight * 0.3 + innerHeight * 0.8, innerHeight * 1.6 + innerHeight * 0.8, innerHeight * 2.9 + innerHeight * 0.8];

    const newState = {
      isAbove1: relativeScroll < switchPoints[0],
      isAbove2: relativeScroll < switchPoints[1],
      isAbove3: relativeScroll < switchPoints[2]
    };
    if (newState.isAbove1) {
      fixedSectionRefFigure2.current.querySelector('.fixed-background .overlay').style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
      fixedSectionRefFigure2.current.querySelector('.fixed-background .overlay').style.pointerEvents = 'auto';
      fixedSectionRefFigure2.current.querySelector('.scroll-elements').style.pointerEvents = 'auto';
      setFigure2Data('1');
    } else if (newState.isAbove2) {
      fixedSectionRefFigure2.current.querySelector('.fixed-background .overlay').style.backgroundColor = 'rgba(0, 0, 0, 0)';
      fixedSectionRefFigure2.current.querySelector('.fixed-background .overlay').style.pointerEvents = 'none';
      fixedSectionRefFigure2.current.querySelector('.scroll-elements').style.pointerEvents = 'none';
      setFigure2Data('1');
    } else {
      fixedSectionRefFigure2.current.querySelector('.fixed-background .overlay').style.backgroundColor = 'rgba(0, 0, 0, 0)';
      fixedSectionRefFigure2.current.querySelector('.fixed-background .overlay').style.pointerEvents = 'none';
      fixedSectionRefFigure2.current.querySelector('.scroll-elements').style.pointerEvents = 'none';
      setFigure2Data('2');
    }
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScrollFigure02);
    return () => window.removeEventListener('scroll', handleScrollFigure02);
  }, [handleScrollFigure02]);

  const [figure3Data, setFigure3Data] = useState('1');
  const fixedSectionRefFigure3 = useRef();
  const chartFigure3 = useRef(null);
  const [positionFigure3, setPositionFigure3] = useState('');
  const handleScrollFigure03 = useCallback(() => {
    if (!fixedSectionRefFigure3.current) return;

    // 3 screens.
    fixedSectionRefFigure3.current.style.height = `${4 * 130 + 80}vh`;

    const { scrollY, innerHeight } = window;
    let { top } = fixedSectionRefFigure3.current.getBoundingClientRect();
    top += scrollY;
    const { height } = fixedSectionRefFigure3.current.getBoundingClientRect();
    const fixedBottom = top + height - innerHeight;
    const relativeScroll = scrollY - top;

    // Determine position state
    setPositionFigure3((scrollY < top) ? 'absolute_top' : (scrollY < fixedBottom) ? 'fixed' : 'absolute_bottom');

    if (!chartFigure3.current) return;

    // Define switch points
    const switchPoints = [innerHeight * 0.3 + innerHeight * 0.8, innerHeight * 1.6 + innerHeight * 0.8, innerHeight * 2.9 + innerHeight * 0.8, innerHeight * 4.2 + innerHeight * 0.8];

    const newState = {
      isAbove1: relativeScroll < switchPoints[0],
      isAbove2: relativeScroll < switchPoints[1],
      isAbove3: relativeScroll < switchPoints[2],
      isAbove4: relativeScroll < switchPoints[3]
    };
    if (newState.isAbove1) {
      fixedSectionRefFigure3.current.querySelector('.fixed-background .overlay').style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
      fixedSectionRefFigure3.current.querySelector('.fixed-background .overlay').style.pointerEvents = 'auto';
      fixedSectionRefFigure3.current.querySelector('.scroll-elements').style.pointerEvents = 'auto';
      setFigure3Data('1');
    } else if (newState.isAbove2) {
      fixedSectionRefFigure3.current.querySelector('.fixed-background .overlay').style.backgroundColor = 'rgba(0, 0, 0, 0)';
      fixedSectionRefFigure3.current.querySelector('.fixed-background .overlay').style.pointerEvents = 'none';
      fixedSectionRefFigure3.current.querySelector('.scroll-elements').style.pointerEvents = 'none';
      setFigure3Data('1');
    } else if (newState.isAbove3) {
      fixedSectionRefFigure3.current.querySelector('.fixed-background .overlay').style.backgroundColor = 'rgba(0, 0, 0, 0)';
      fixedSectionRefFigure3.current.querySelector('.fixed-background .overlay').style.pointerEvents = 'none';
      fixedSectionRefFigure3.current.querySelector('.scroll-elements').style.pointerEvents = 'none';
      setFigure3Data('2');
    } else {
      fixedSectionRefFigure3.current.querySelector('.fixed-background .overlay').style.backgroundColor = 'rgba(0, 0, 0, 0)';
      fixedSectionRefFigure3.current.querySelector('.fixed-background .overlay').style.pointerEvents = 'none';
      fixedSectionRefFigure3.current.querySelector('.scroll-elements').style.pointerEvents = 'none';
      setFigure3Data('3');
    }
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScrollFigure03);
    return () => window.removeEventListener('scroll', handleScrollFigure03);
  }, [handleScrollFigure03]);

  const [figure4Data, setFigure4Data] = useState('1');
  const fixedSectionRefFigure4 = useRef();
  const chartFigure4 = useRef(null);
  const [positionFigure4, setPositionFigure4] = useState('');
  const handleScrollFigure04 = useCallback(() => {
    if (!fixedSectionRefFigure4.current) return;

    // 3 screens.
    fixedSectionRefFigure4.current.style.height = `${3 * 130 + 80}vh`;

    const { scrollY, innerHeight } = window;
    let { top } = fixedSectionRefFigure4.current.getBoundingClientRect();
    top += scrollY;
    const { height } = fixedSectionRefFigure4.current.getBoundingClientRect();
    const fixedBottom = top + height - innerHeight;
    const relativeScroll = scrollY - top;

    // Determine position state
    setPositionFigure4((scrollY < top) ? 'absolute_top' : (scrollY < fixedBottom) ? 'fixed' : 'absolute_bottom');

    if (!chartFigure4.current) return;

    // Define switch points
    const switchPoints = [innerHeight * 0.3 + innerHeight * 0.8, innerHeight * 1.6 + innerHeight * 0.8, innerHeight * 2.9 + innerHeight * 0.8];

    const newState = {
      isAbove1: relativeScroll < switchPoints[0],
      isAbove2: relativeScroll < switchPoints[1],
      isAbove3: relativeScroll < switchPoints[2]
    };
    if (newState.isAbove1) {
      fixedSectionRefFigure4.current.querySelector('.fixed-background .overlay').style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
      fixedSectionRefFigure4.current.querySelector('.fixed-background .overlay').style.pointerEvents = 'auto';
      fixedSectionRefFigure4.current.querySelector('.scroll-elements').style.pointerEvents = 'auto';
      setFigure4Data('1');
    } else if (newState.isAbove2) {
      fixedSectionRefFigure4.current.querySelector('.fixed-background .overlay').style.backgroundColor = 'rgba(0, 0, 0, 0)';
      fixedSectionRefFigure4.current.querySelector('.fixed-background .overlay').style.pointerEvents = 'none';
      fixedSectionRefFigure4.current.querySelector('.scroll-elements').style.pointerEvents = 'none';
      setFigure4Data('1');
    } else {
      fixedSectionRefFigure4.current.querySelector('.fixed-background .overlay').style.backgroundColor = 'rgba(0, 0, 0, 0)';
      fixedSectionRefFigure4.current.querySelector('.fixed-background .overlay').style.pointerEvents = 'none';
      fixedSectionRefFigure4.current.querySelector('.scroll-elements').style.pointerEvents = 'none';
      setFigure4Data('2');
    }
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScrollFigure04);
    return () => window.removeEventListener('scroll', handleScrollFigure04);
  }, [handleScrollFigure04]);

  return (
    <div className="app" ref={appRef}>
      <Header downloadDocument={downloadDocument} scrollTo={scrollTo} chapterTitles={chapterTitles} />
      { /* Overview */}
      <div className="content_container" ref={overviewRef}>
        <div className="text_container">
          <div className="text_content">
            <h3>First paragraph</h3>
            <p>Text</p>
            <p>Text</p>
            <p>Text</p>
            <p>Text</p>
            <blockquote>
              <div className="quote">Quote.</div>
              <div className="author">
                <span className="name">Rebeca Grynspan</span>
                <span className="title">Secretary-General of UN Trade and Development (UNCTAD)</span>
              </div>
            </blockquote>
          </div>
        </div>
      </div>
      <div className="chapters_container" ref={chaptersContainerRef}>
        <div className="progress_indicator_container">
          <div className="section">
            <div className="progress_bar" style={{ width: `${sectionProgress}%` }} />
          </div>
        </div>
        <div className="backtotop_container">
          <div>
            <button type="button" onClick={() => scrollTo('.header_container', 'Top')}>Back to top</button>
          </div>
        </div>
        <ScrollingText texts={['What is the correlation with global financial cycle and world trade']} chapter_text="Chapter 1" />
        <div ref={fixedSectionRefFigure1} className="fixed-section">
          <div className={`fixed-background ${positionFigure1}`}>
            <div className="overlay" />
            <div className="scroll-indicator"><div className="arrow" /></div>
            <div className="chart_container_full">
              <Figure1 ref={chartFigure1} value={figure1Data} />
            </div>
          </div>
          <div className="scroll-elements">
            <div className="scroll-content">
              <div>
                <p>Lets investigate</p>
              </div>
            </div>
            <div className="scroll-content">
              <div>
                <p>
                  Lets first observe the World Trade…
                </p>
              </div>
            </div>
            <div className="scroll-content">
              <div>
                <p>
                  ...and how it has evolved in long term.
                </p>
              </div>
            </div>
            <div className="scroll-content">
              <div>
                <p>
                  What really interests us is the cyclical component. (Maybe the previous screen is not needed)
                </p>
              </div>
            </div>
            <div className="scroll-content">
              <div>
                <p>
                  And how that has evolved.
                </p>
              </div>
            </div>
            <div className="scroll-content">
              <div>
                <p>
                  Because we see that the global financial cycle drives the World Trade.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="content_container chapter_header_1" ref={chapter1Ref}>
          <div className="text_container">
            <ChapterHeader
              chapter_number="1"
              subtitle="Subtitle for chapter 1"
              title={chapterTitles[0]}
            />
            <div className="download_buttons_container">
              <a href="https://unctad.org/system/files/official-document/tdr2025ch1_en.pdf" target="_blank" onClick={(event) => downloadDocument(event)} type="button" className="chapter_download" aria-label="Download Chapter 1" rel="noreferrer">Download</a>
            </div>
            <div className="media_container"><div className="image_container"><ParallaxImage src="assets/img/2025tdr-chapter1.jpg" /></div></div>
            <div className="text_content">
              <p>Text</p>
            </div>
            <div className="charts_container">
              <DwChartContainer title="Seaborne trade growth" chart_id="iJGvP" />
            </div>
          </div>
        </div>
        <ScrollingText texts={['Chapter 2 sliding text']} chapter_text="Chapter 2" />
        <div ref={fixedSectionRefFigure2} className="fixed-section">
          <div className={`fixed-background ${positionFigure2}`}>
            <div className="overlay" />
            <div className="scroll-indicator"><div className="arrow" /></div>
            <div className="chart_container_full">
              <Figure2 ref={chartFigure2} value={figure2Data} />
            </div>
          </div>
          <div className="scroll-elements">
            <div className="scroll-content">
              <div>
                <p>
                  Lets focus
                </p>
              </div>
            </div>
            <div className="scroll-content">
              <div>
                <p>
                  This is data
                </p>
              </div>
            </div>
            <div className="scroll-content">
              <div>
                <p>
                  But see how it changes
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="content_container chapter_header_2" ref={chapter2Ref}>
          <div className="text_container">
            <ChapterHeader
              chapter_number="2"
              subtitle="Chapter 2 subtitle"
              title={chapterTitles[1]}
            />
            <div className="download_buttons_container">
              <a href="https://unctad.org/system/files/official-document/tdr2025ch2_en.pdf" target="_blank" onClick={(event) => downloadDocument(event)} type="button" className="chapter_download" aria-label="Download Chapter 2" rel="noreferrer">Download</a>
            </div>
            <div className="media_container"><div className="image_container"><ParallaxImage src="assets/img/2025tdr-chapter2.jpg" /></div></div>
            <div className="text_content">
              <p>Text</p>
            </div>
            <div className="charts_container">
              <DwChartContainer chart_id="wuNd6" title="Monthly ship transits through the Strait of Hormuz and the Suez Canal" />
            </div>
          </div>
        </div>
        <ScrollingText texts={['Sliding text for chapter 3']} chapter_text="Chapter 3" />
        <div ref={fixedSectionRefFigure3} className="fixed-section">
          <div className={`fixed-background ${positionFigure3}`}>
            <div className="overlay" />
            <div className="scroll-indicator"><div className="arrow" /></div>
            <div className="chart_container_full">
              <Figure3 ref={chartFigure3} value={figure3Data} />
            </div>
          </div>
          <div className="scroll-elements">
            <div className="scroll-content">
              <div>
                <p>
                  Lets focus
                </p>
              </div>
            </div>
            <div className="scroll-content">
              <div>
                <p>
                  This is 2020
                </p>
              </div>
            </div>
            <div className="scroll-content">
              <div>
                <p>
                  This is 2023
                </p>
              </div>
            </div>
            <div className="scroll-content">
              <div>
                <p>
                  This is 2025
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="content_container chapter_header_3" ref={chapter3Ref}>
          <div className="text_container">
            <ChapterHeader
              chapter_number="3"
              subtitle="Subtitle for chapter 3 goes here"
              title={chapterTitles[2]}
            />
            <div className="download_buttons_container">
              <a href="https://unctad.org/system/files/official-document/tdr2025ch3_en.pdf" target="_blank" onClick={(event) => downloadDocument(event)} type="button" className="chapter_download" aria-label="Download Chapter 3" rel="noreferrer">Download</a>
            </div>
            <div className="media_container"><div className="image_container"><ParallaxImage src="assets/img/2025tdr-chapter3.jpg" /></div></div>
            <div className="text_content">
              <p>Text</p>
            </div>
            <div className="charts_container">
              <DwChartContainer chart_id="66WBL" title="Shanghai Containerized Freight Index spot rates" />
            </div>
          </div>
        </div>
        <ScrollingText texts={['Sliding text 4']} chapter_text="Chapter 4" />
        <div ref={fixedSectionRefFigure4} className="fixed-section">
          <div className={`fixed-background ${positionFigure4}`}>
            <div className="overlay" />
            <div className="scroll-indicator"><div className="arrow" /></div>
            <div className="chart_container_full">
              <Figure4 ref={chartFigure4} value={figure4Data} />
            </div>
          </div>
          <div className="scroll-elements">
            <div className="scroll-content">
              <div>
                <p>
                  Lets focus
                </p>
              </div>
            </div>
            <div className="scroll-content">
              <div>
                <p>
                  See how they go together until
                </p>
              </div>
            </div>
            <div className="scroll-content">
              <div>
                <p>
                  They dont go together anymore
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="content_container chapter_header_4" ref={chapter4Ref}>
          <div className="text_container">
            <ChapterHeader
              chapter_number="4"
              subtitle="Subtitle for chapter 4 will be great again"
              title={chapterTitles[3]}
            />
            <div className="download_buttons_container">
              <a href="https://unctad.org/system/files/official-document/tdr2025ch4_en.pdf" target="_blank" onClick={(event) => downloadDocument(event)} type="button" className="chapter_download" aria-label="Download Chapter 4" rel="noreferrer">Download</a>
            </div>
            <div className="media_container"><div className="image_container"><ParallaxImage src="assets/img/2025tdr-chapter4.jpg" /></div></div>
            <div className="charts_container">
              <DwChartContainer chart_id="9nVSh" title="Average waiting times for container ships in port" />
            </div>
            <div className="text_content">
              <p>Text</p>
            </div>
            <div className="charts_container">
              <DwChartContainer chart_id="Sk6d3" title="Ports providing liquefied natural gas (LNG) bunkering services" />
            </div>
          </div>
        </div>
        <ScrollingText texts={['Sliding text for chapter 5 will slide']} chapter_text="Chapter 5" />
        <div className="content_container chapter_header_5" ref={chapter5Ref}>
          <div className="text_container">
            <ChapterHeader
              chapter_number="5"
              subtitle="Subtitle 5"
              title={chapterTitles[4]}
            />
            <div className="download_buttons_container">
              <a href="https://unctad.org/system/files/official-document/tdr2025ch5_en.pdf" target="_blank" onClick={(event) => downloadDocument(event)} type="button" className="chapter_download" aria-label="Download Chapter 4" rel="noreferrer">Download</a>
            </div>
            <div className="media_container"><div className="image_container"><ParallaxImage src="assets/img/2025tdr-chapter5.jpg" /></div></div>
            <div className="text_content">
              <p>Text</p>
            </div>
          </div>
        </div>
        <ScrollingText texts={['Will be even have chapter 6 sliding text']} chapter_text="The way forward" />
        <div className="content_container chapter_header_6" ref={chapter6Ref}>
          <div className="text_container">
            <ChapterHeader
              chapter_number="6"
              subtitle="This is the chapter 6 subtitle"
              title="This is the title if we have one"
            />
            <div className="media_container"><div className="image_container"><ParallaxImage src="assets/img/2025tdr-chapter6.jpg" /></div></div>
            <div className="text_content">
              <p>Text</p>
              <ol>
                <li>List</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
