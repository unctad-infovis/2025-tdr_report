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

  const chapterTitles = ['The fleeting resilience of 2025', 'Trade in the age of financialization', 'The enduring dollar', 'Financialization and the global South', 'Building resilience while avoiding further fracture'];

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
            <p>On the surface, global trade looks resilient. Goods are moving, supply chains are adapting, and trade grew about 4% in early 2025 – even amid tariff hikes and geopolitical tensions.</p>
            <p>But under the surface lies a volatile system powering trade – built more on balance sheets and financial flows than on supply chains.</p>
            <ul>
              <li>Behind every shipment is a credit line.</li>
              <li>Behind every container, an exchange rate.</li>
              <li>Behind every trade route, a network of banks.</li>
            </ul>
            <p>Over 90% of world trade now depends on finance. This means the global financial architecture increasingly determines who can trade, on what terms and at what cost.</p>
            <p>Yet unlike trade, the financial infrastructure remains highly concentrated – leaving much of the Global South on the margins.</p>
            <p>The 2025 Trade and Development Report reveals how the tightening link between trade and finance is reshaping global opportunities – and why the stakes are greatest for developing countries.</p>
            <blockquote>
              <div className="quote">Trade is not just the concatenation of suppliers. It is the concatenation of credit lines, payment systems, currency markets, and capital flows.</div>
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
              <p>The year 2025 began with momentum and what looked like a rebound – boosted by companies rushing to ship goods before new tariffs and by rising AI-related investments.</p>
              <p>But remove these temporary factors and global trade growth falls from 4% to somewhere between 2.5% and 3.0%, with a slowdown on the horizon.</p>
              <p>Global economic growth tells a similar story:</p>
              <ul>
                <li>Global GDP is projected to fall to 2.6% in 2025, below the pre-pandemic trend.</li>
                <li>The United States and European economies are cooling. US economic growth expected to slow to 1.8% in 2025 and 1.5% in 2026, compared to X.</li>
                <li>China is stabilizing but decelerating. Its economic growth is projected to slow to 4.9% in 2025 and 4.5% in 2026, compared to X</li>
                <li>Across the global South, financial volatility and weaker external demand squeeze investment and jobs.</li>
              </ul>
              <p>Despite this difficult landscape, developing economies will drive almost 70% of global growth in 2025 – yet they face the harshest constraints on financing that growth.</p>
              <p>The climate crisis adds another layer. Some climate-vulnerable countries pay an extra $20 billion per year in interest simply because climate risk raises their borrowing costs — money that could have gone into schools, hospitals or climate resilience itself.</p>
              <p>
                <strong>The takeaway:</strong>
                {' '}
                The world is growing, but unevenly – and the resilience we see is thinner than it seems and masks structural weaknesses. Without coordinated action, developing countries risk being locked into slower growth, heavier debt and fewer options to steer their own economic futures.
              </p>
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
              <p>Trade today moves to the rhythm of global finance. When interest rates change in major economies or investor sentiment swings, trade flows shift almost instantly.</p>
              <p>Data show that world trade and global financial cycles now move in sync, rising and falling together.</p>
              <p>For developing countries, this creates vulnerabilities:</p>
              <ul>
                <li>Currency volatility can make imports and debt repayments more expensive.</li>
                <li>Shifts in global risk appetite can cut off credit for exporters.</li>
                <li>Financial volatility can hit their markets harder and more often.</li>
              </ul>
              <p>Financialization is reshaping entire sectors. In global food markets, for example, over 75% of the revenues of major food trading companies now come from financial operations, not from moving wheat, coffee, cocoa or other crops and grains.</p>
              <p>Prices increasingly reflect speculative strategies, not supply and demand. When finance sets the price of food, countries struggle more to secure affordable, reliable supplies.</p>
              <p>
                <strong>The takeaway:</strong>
                {' '}
                When markets move based on financial signals rather than real economic conditions, developing economies – especially their small producers – compete on a more uneven playing field. They face higher costs, greater uncertainty, and lower bargaining power – and shocks hit them hardest.
              </p>

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
              <p>In 2025, financial turbulence produced something unusual – the dollar weakened even as yields on United States Treasuries rose. But stepping back, the long-term picture becomes clearer – and the dollar’s dominance remains unchanged.</p>
              <p>
                While the dollar’s share in global foreign exchange reserves has steadily declined since 2000, no other currency has risen to replace it. At the same time:
              </p>
              <ul>
                <li>The dollar’s share in SWIFT payments – the global messaging system banks use to move money across borders – climbed from 39% to 50% in just five years, reinforcing its role as the backbone of global transactions.</li>
                <li>The US still holds 50% of global equity market value – where companies raise capital – and 40% of the global bond market, which finances governments and major investments.</li>

              </ul>
              <p>The dollar’s influence reaches far beyond central bank reserves or how trade is priced. It affects who can get credit, where investment flows and how quickly financial shocks spread around the world.</p>
              <p>
                <strong>The takeaway:</strong>
                {' '}
                Even in a transforming global economy, the dollar remains the anchor, reaching deep into development paths. A dollar-centric global economy means developing countries’ financing costs rise or fall based on decisions taken elsewhere. It reinforces the asymmetry between their growing role in trade and their peripheral place in global finance.
              </p>
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
              <p>The Global South has become central to world trade and production – accounting for over 40% of global output and world trade, and half of global foreign direct investment (FDI) inflows.</p>
              <p>But their presence in global financial markets remains far smaller – a mismatch that constrains development options. Excluding China, developing countries hold just 12% of global equity market value and 6% of the global bond market.</p>
              <p>While equity markets in the Global South have grown since the 2008–09 global financial crisis, they still trail in size and sophistication. This leaves many developing countries dependent on foreign banks and financial markets – often at high and volatile interest rates.</p>
              <p>Key points about developing countries:</p>
              <li>They have smaller, less liquid capital markets, making it harder for firms to raise capital or for investors to trade without difficulty.</li>
              <li>They pay significantly higher borrowing costs, with higher interest payments draining resources that could otherwise support jobs, infrastructure or public services.</li>
              <li>They face bigger swings in market sentiment – when global rates rise or investors become more risk-averse, capital can exit quickly, pushing up borrowing costs, weakening currencies and amplifying financial stress.</li>
              <p>The borrowing costs illustrate the gap clearly. While advanced economies often borrow at 1–3%, many emerging markets pay 6–12% or more for similar government bonds. </p>
              <p>This means a government in an emerging economy may pay three to five times more in interest – a stark difference that limits fiscal space and raises the cost of development.</p>
              <p>
                <strong>The takeway:</strong>
                {' '}
                This structural imbalance means developing economies contribute increasingly to global growth but are not empowered to shape global financial rules or secure affordable financing for long-term development. It limits their ability to invest in infrastructure, innovation and climate adaptation.
              </p>
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
              <p>Resilience today requires more than returning to “normal.” It means moving forward rather than bouncing back, building economies that can withstand shocks, adapt to transitions and grow sustainably even under uncertainty.</p>
              <p>The report calls for a strategy that integrates trade, finance and climate policy, with five priorities:</p>
              <ol>
                <li>Reform the global financial system to support climate-vulnerable countries. Debt and climate are now intertwined. Without major reforms, climate shocks will push more countries into debt distress. Climate-vulnerable countries need fair financing, not higher interest penalties.</li>
                <li>Expand regional financial cooperation. Regional bond markets, payment systems and development funds can lower borrowing costs and reduce reliance on volatile global markets.</li>
                <li>Strengthen domestic financial ecosystems. Countries need credible, modern payment and financial infrastructures – especially digital payments and capital markets – to mobilize resources and finance the green transition.</li>
                <li>Address emerging financial risks beyond the banking sector. Shadow banking and securitized food trading and high-leverage commodity markets create new systemic vulnerabilities and require new regulations.</li>
                <li>Promote “networked multilateralism”. A fragmented global system hightents uncertainty and cannot deliver predictable trade or stable finance. More inclusive governance is essential. Developing countries need a stronger voice in shaping trade and financial rules.</li>
              </ol>
              <p>
                <strong>The takeaway:</strong>
                {' '}
                Resilience is not automatic. It is built through coordinated strategies that align trade, finance and sustainability – and ensure developing countries can shape, not just absorb, global economic shifts.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
