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
import Figure5 from './figures/Figure5.jsx';
import Figure6 from './figures/Figure6.jsx';
import Figure7 from './figures/Figure7.jsx';

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

  const [dimensions, setDimensions] = useState({
    height: window.innerHeight,
    width: window.innerWidth
  });

  useEffect(() => {
    let frame;
    const handleResize = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        setDimensions({
          height: window.innerHeight,
          width: window.innerWidth
        });
      });
    };

    window.addEventListener('resize', handleResize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

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
    fixedSectionRefFigure1.current.style.height = `${7 * 130 + 80}vh`;

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
    fixedSectionRefFigure2.current.style.height = `${4 * 130 + 80}vh`;

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
    fixedSectionRefFigure4.current.style.height = `${4 * 130 + 80}vh`;

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
      setFigure4Data('2');
    } else {
      fixedSectionRefFigure4.current.querySelector('.fixed-background .overlay').style.backgroundColor = 'rgba(0, 0, 0, 0)';
      fixedSectionRefFigure4.current.querySelector('.fixed-background .overlay').style.pointerEvents = 'none';
      fixedSectionRefFigure4.current.querySelector('.scroll-elements').style.pointerEvents = 'none';
      setFigure4Data('3');
    }
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScrollFigure04);
    return () => window.removeEventListener('scroll', handleScrollFigure04);
  }, [handleScrollFigure04]);

  const [figure5Data, setFigure5Data] = useState('1');
  const fixedSectionRefFigure5 = useRef();
  const chartFigure5 = useRef(null);
  const [positionFigure5, setPositionFigure5] = useState('');
  const handleScrollFigure05 = useCallback(() => {
    if (!fixedSectionRefFigure5.current) return;

    // 4 screens.
    fixedSectionRefFigure5.current.style.height = `${6 * 130 + 80}vh`;

    const { scrollY, innerHeight } = window;
    let { top } = fixedSectionRefFigure5.current.getBoundingClientRect();
    top += scrollY;
    const { height } = fixedSectionRefFigure5.current.getBoundingClientRect();
    const fixedBottom = top + height - innerHeight;
    const relativeScroll = scrollY - top;

    // Determine position state
    setPositionFigure5((scrollY < top) ? 'absolute_top' : (scrollY < fixedBottom) ? 'fixed' : 'absolute_bottom');

    if (!chartFigure5.current) return;

    // Define switch points
    const switchPoints = [innerHeight * 0.3 + innerHeight * 0.8, innerHeight * 1.6 + innerHeight * 0.8];

    const newState = {
      isAbove1: relativeScroll < switchPoints[0],
      isAbove2: relativeScroll < switchPoints[1]
    };
    if (newState.isAbove1) {
      fixedSectionRefFigure5.current.querySelector('.fixed-background .overlay').style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
      fixedSectionRefFigure5.current.querySelector('.fixed-background .overlay').style.pointerEvents = 'auto';
      fixedSectionRefFigure5.current.querySelector('.scroll-elements').style.pointerEvents = 'auto';
      setFigure5Data('1');
    } else if (newState.isAbove2) {
      fixedSectionRefFigure5.current.querySelector('.fixed-background .overlay').style.backgroundColor = 'rgba(0, 0, 0, 0)';
      fixedSectionRefFigure5.current.querySelector('.fixed-background .overlay').style.pointerEvents = 'none';
      fixedSectionRefFigure5.current.querySelector('.scroll-elements').style.pointerEvents = 'none';
      setFigure5Data('2');
    } else {
      fixedSectionRefFigure5.current.querySelector('.fixed-background .overlay').style.backgroundColor = 'rgba(0, 0, 0, 0)';
      fixedSectionRefFigure5.current.querySelector('.fixed-background .overlay').style.pointerEvents = 'none';
      fixedSectionRefFigure5.current.querySelector('.scroll-elements').style.pointerEvents = 'none';
      setFigure5Data('3');
    }
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScrollFigure05);
    return () => window.removeEventListener('scroll', handleScrollFigure05);
  }, [handleScrollFigure05]);

  const [figure6Data, setFigure6Data] = useState('1');
  const fixedSectionRefFigure6 = useRef();
  const chartFigure6 = useRef(null);
  const [positionFigure6, setPositionFigure6] = useState('');
  const handleScrollFigure06 = useCallback(() => {
    if (!fixedSectionRefFigure6.current) return;

    // 4 screens.
    fixedSectionRefFigure6.current.style.height = `${3 * 130 + 80}vh`;

    const { scrollY, innerHeight } = window;
    let { top } = fixedSectionRefFigure6.current.getBoundingClientRect();
    top += scrollY;
    const { height } = fixedSectionRefFigure6.current.getBoundingClientRect();
    const fixedBottom = top + height - innerHeight;
    const relativeScroll = scrollY - top;

    // Determine position state
    setPositionFigure6((scrollY < top) ? 'absolute_top' : (scrollY < fixedBottom) ? 'fixed' : 'absolute_bottom');

    if (!chartFigure6.current) return;

    // Define switch points
    const switchPoints = [innerHeight * 0.3 + innerHeight * 0.8, innerHeight * 1.6 + innerHeight * 0.8];

    const newState = {
      isAbove1: relativeScroll < switchPoints[0],
      isAbove2: relativeScroll < switchPoints[1]
    };
    if (newState.isAbove1) {
      fixedSectionRefFigure6.current.querySelector('.fixed-background .overlay').style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
      fixedSectionRefFigure6.current.querySelector('.fixed-background .overlay').style.pointerEvents = 'auto';
      fixedSectionRefFigure6.current.querySelector('.scroll-elements').style.pointerEvents = 'auto';
      setFigure6Data('1');
    } else if (newState.isAbove2) {
      fixedSectionRefFigure6.current.querySelector('.fixed-background .overlay').style.backgroundColor = 'rgba(0, 0, 0, 0)';
      fixedSectionRefFigure6.current.querySelector('.fixed-background .overlay').style.pointerEvents = 'none';
      fixedSectionRefFigure6.current.querySelector('.scroll-elements').style.pointerEvents = 'none';
      setFigure6Data('2');
    } else {
      fixedSectionRefFigure6.current.querySelector('.fixed-background .overlay').style.backgroundColor = 'rgba(0, 0, 0, 0)';
      fixedSectionRefFigure6.current.querySelector('.fixed-background .overlay').style.pointerEvents = 'none';
      fixedSectionRefFigure6.current.querySelector('.scroll-elements').style.pointerEvents = 'none';
      setFigure6Data('3');
    }
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScrollFigure06);
    return () => window.removeEventListener('scroll', handleScrollFigure06);
  }, [handleScrollFigure06]);

  const [figure7Data, setFigure7Data] = useState('1');
  const fixedSectionRefFigure7 = useRef();
  const chartFigure7 = useRef(null);
  const [positionFigure7, setPositionFigure7] = useState('');
  const handleScrollFigure07 = useCallback(() => {
    if (!fixedSectionRefFigure7.current) return;

    // 4 screens.
    fixedSectionRefFigure7.current.style.height = `${3 * 130 + 80}vh`;

    const { scrollY, innerHeight } = window;
    let { top } = fixedSectionRefFigure7.current.getBoundingClientRect();
    top += scrollY;
    const { height } = fixedSectionRefFigure7.current.getBoundingClientRect();
    const fixedBottom = top + height - innerHeight;
    const relativeScroll = scrollY - top;

    // Determine position state
    setPositionFigure7((scrollY < top) ? 'absolute_top' : (scrollY < fixedBottom) ? 'fixed' : 'absolute_bottom');

    if (!chartFigure7.current) return;

    // Define switch points
    const switchPoints = [innerHeight * 0.3 + innerHeight * 0.8, innerHeight * 1.6 + innerHeight * 0.8];

    const newState = {
      isAbove1: relativeScroll < switchPoints[0],
      isAbove2: relativeScroll < switchPoints[1]
    };
    if (newState.isAbove1) {
      fixedSectionRefFigure7.current.querySelector('.fixed-background .overlay').style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
      fixedSectionRefFigure7.current.querySelector('.fixed-background .overlay').style.pointerEvents = 'auto';
      fixedSectionRefFigure7.current.querySelector('.scroll-elements').style.pointerEvents = 'auto';
      setFigure7Data('1');
    } else if (newState.isAbove2) {
      fixedSectionRefFigure7.current.querySelector('.fixed-background .overlay').style.backgroundColor = 'rgba(0, 0, 0, 0)';
      fixedSectionRefFigure7.current.querySelector('.fixed-background .overlay').style.pointerEvents = 'none';
      fixedSectionRefFigure7.current.querySelector('.scroll-elements').style.pointerEvents = 'none';
      setFigure7Data('2');
    } else {
      fixedSectionRefFigure7.current.querySelector('.fixed-background .overlay').style.backgroundColor = 'rgba(0, 0, 0, 0)';
      fixedSectionRefFigure7.current.querySelector('.fixed-background .overlay').style.pointerEvents = 'none';
      fixedSectionRefFigure7.current.querySelector('.scroll-elements').style.pointerEvents = 'none';
      setFigure7Data('3');
    }
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScrollFigure07);
    return () => window.removeEventListener('scroll', handleScrollFigure07);
  }, [handleScrollFigure07]);

  return (
    <div className="app" ref={appRef}>
      <Header downloadDocument={downloadDocument} scrollTo={scrollTo} chapterTitles={chapterTitles} />
      { /* Overview */}
      <div className="content_container" ref={overviewRef}>
        <div className="text_container">
          <div className="text_content">
            <h3>On the surface, global trade looks resilient. Goods are moving, supply chains are adapting, and trade grew about 4% in early 2025 – even amid tariff hikes and geopolitical tensions.</h3>
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
        <ScrollingText texts={['What drove trade growth in early 2025', 'And why didn’t it last?']} chapter_text="Chapter 1" />
        <div ref={fixedSectionRefFigure5} className="fixed-section">
          <div className={`fixed-background ${positionFigure5}`}>
            <div className="overlay" />
            <div className="scroll-indicator"><div className="arrow" /></div>
            <div className="chart_container_full">
              <Figure5
                dimensions={dimensions}
                ref={chartFigure5}
                value={figure5Data}
              />
            </div>
          </div>
          <div className="scroll-elements">
            <div className="scroll-content">
              <div>
                <p>
                  Let’s look at world trade and US imports.
                </p>
              </div>
            </div>
            <div className="scroll-content">
              <div>
                <p>
                  Historically, they’ve moved together.
                </p>
              </div>
            </div>
            <div className="scroll-content">
              <div>
                <p>
                  But in late 2024, US imports skyrocketed.
                </p>
              </div>
            </div>
            <div className="scroll-content">
              <div>
                <p>
                  The spike continued into 2025 as companies shipped goods before new tariffs.
                </p>
              </div>
            </div>
            <div className="scroll-content">
              <div>
                <p>
                  This pulled world trade up.
                </p>
              </div>
            </div>
            <div className="scroll-content">
              <div>
                <p>
                  Then the surge receded. Now, a slowdown looms.
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
            </div>
            <div className="charts_container">
              <DwChartContainer title="Global gdp growth" chart_id="hL6CH" />
            </div>
            <div className="charts_container">
              <DwChartContainer title="Regional gdp growth" chart_id="jOuB1" />
            </div>
            <div className="text_content">
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
          </div>
        </div>
        <ScrollingText texts={['How does trade increasingly depend on finance?']} chapter_text="Chapter 2" />
        <div ref={fixedSectionRefFigure6} className="fixed-section">
          <div className={`fixed-background ${positionFigure6}`}>
            <div className="overlay" />
            <div className="scroll-indicator"><div className="arrow" /></div>
            <div className="chart_container_full">
              <Figure6
                dimensions={dimensions}
                ref={chartFigure6}
                value={figure6Data}
              />
            </div>
          </div>
          <div className="scroll-elements">
            <div className="scroll-content">
              <div>
                <p>Let’s first look at how finance has outgrown the real economy</p>
              </div>
            </div>
            <div className="scroll-content">
              <div>
                <p>
                  For decades, global production expanded faster than financial assets like stocks and bonds.
                </p>
              </div>
            </div>
            <div className="scroll-content">
              <div>
                <p>
                  But this changed after the Asian financial crisis in the late 1990s.
                </p>
              </div>
            </div>
            <div className="scroll-content">
              <div>
                <p>
                  Since then, the financial market has grown faster than production.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div ref={fixedSectionRefFigure1} className="fixed-section">
          <div className={`fixed-background ${positionFigure1}`}>
            <div className="overlay" />
            <div className="scroll-indicator"><div className="arrow" /></div>
            <div className="chart_container_full">
              <Figure1
                dimensions={dimensions}
                ref={chartFigure1}
                value={figure1Data}
              />
            </div>
          </div>
          <div className="scroll-elements">
            <div className="scroll-content">
              <div>
                <p>Now let’s look at trade and finance.</p>
              </div>
            </div>
            <div className="scroll-content">
              <div>
                <p>
                  This graph shows trade as an index.
                </p>
              </div>
            </div>
            <div className="scroll-content">
              <div>
                <p>
                  To see the correlation with finance we have to look at trends.
                </p>
              </div>
            </div>
            <div className="scroll-content">
              <div>
                <p>
                  We will take the long term trend and convert the data into deviations.
                </p>
              </div>
            </div>
            <div className="scroll-content">
              <div>
                <p>
                  This shows trade’s short-term swings more clearly.
                </p>
              </div>
            </div>
            <div className="scroll-content">
              <div>
                <p>
                  And when we add global financial cycle, we can see that the pattern is clear.
                </p>
              </div>
            </div>
            <div className="scroll-content">
              <div>
                <p>
                  As global finance moves up or down, trade follows.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="content_container chapter_header_2" ref={chapter2Ref}>
          <div className="text_container">
            {/* <ChapterHeader
              chapter_number="2"
              subtitle="Chapter 2 subtitle"
              title={chapterTitles[1]}
            /> */}
            <div className="download_buttons_container">
              <a href="https://unctad.org/system/files/official-document/tdr2025ch2_en.pdf" target="_blank" onClick={(event) => downloadDocument(event)} type="button" className="chapter_download" aria-label="Download Chapter 2" rel="noreferrer">Download</a>
            </div>
            <div className="media_container"><div className="image_container"><ParallaxImage src="assets/img/2025tdr-chapter2.jpg" /></div></div>
            <div className="text_content">
              <p>Trade today moves to the rhythm of global finance. When interest rates change in major economies or investor sentiment swings, trade flows shift almost instantly.</p>
            </div>
            <div className="charts_container">
              <DwChartContainer chart_id="7aQWo" title="Global financial market expansion" />
            </div>
            <div className="text_content">
              <p>Data show that world trade and global financial cycles now move in sync, rising and falling together.</p>
              <p>For developing countries, this creates vulnerabilities:</p>
              <ul>
                <li>Currency volatility can make imports and debt repayments more expensive.</li>
                <li>Shifts in global risk appetite can cut off credit for exporters.</li>
                <li>Financial volatility can hit their markets harder and more often.</li>
              </ul>
            </div>
            <div className="charts_container">
              <DwChartContainer chart_id="DL2Od" title="Financial volatility" />
            </div>
            <div className="text_content">
              <p>Financialization is reshaping entire sectors. In global food markets, for example, over 75% of the revenues of major food trading companies now come from financial operations, not from moving wheat, coffee, cocoa or other crops and grains.</p>
              <p>Prices increasingly reflect speculative strategies, not supply and demand. When finance sets the price of food, countries struggle more to secure affordable, reliable supplies.</p>
              <p>
                <strong>The takeaway:</strong>
                {' '}
                When markets move based on financial signals rather than real economic conditions, developing economies – especially their small producers – compete on a more uneven playing field. They face higher costs, greater uncertainty, and lower bargaining power – and shocks hit them hardest.
              </p>
            </div>
          </div>
        </div>
        <ScrollingText texts={['Has the dollar’s role changed in the global economy?']} chapter_text="Chapter 3" />
        <div ref={fixedSectionRefFigure4} className="fixed-section">
          <div className={`fixed-background ${positionFigure4}`}>
            <div className="overlay" />
            <div className="scroll-indicator"><div className="arrow" /></div>
            <div className="chart_container_full">
              <Figure4
                dimensions={dimensions}
                ref={chartFigure4}
                value={figure4Data}
              />
            </div>
          </div>
          <div className="scroll-elements">
            <div className="scroll-content">
              <div>
                <p>
                  Has the dollar’s role changed in the global economy?
                </p>
              </div>
            </div>
            <div className="scroll-content">
              <div>
                <p>
                  In 2025, something unusual happened.
                </p>
              </div>
            </div>
            <div className="scroll-content">
              <div>
                <p>
                  The dollar and US Treasury yields normally move together. But in April 2025, the pattern broke.
                </p>
              </div>
            </div>
            <div className="scroll-content">
              <div>
                <p>
                  The dollar weakened even as Treasury yields rose.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div ref={fixedSectionRefFigure7} className="fixed-section">
          <div className={`fixed-background ${positionFigure7}`}>
            <div className="overlay" />
            <div className="scroll-indicator"><div className="arrow" /></div>
            <div className="chart_container_full">
              <Figure7
                dimensions={dimensions}
                ref={chartFigure7}
                value={figure7Data}
              />
            </div>
          </div>
          <div className="scroll-elements">
            <div className="scroll-content">
              <div>
                <p>
                  This may hint at softer demand for US assets in the short term.
                </p>
              </div>
            </div>
            <div className="scroll-content">
              <div>
                <p>
                  But the bigger picture is clear: the dollar’s dominance endures.
                </p>
              </div>
            </div>
            <div className="scroll-content">
              <div>
                <p>
                  Here’s its share of global finance
                </p>
              </div>
            </div>
          </div>
        </div>
        <div ref={fixedSectionRefFigure3} className="fixed-section">
          <div className={`fixed-background ${positionFigure3}`}>
            <div className="overlay" />
            <div className="scroll-indicator"><div className="arrow" /></div>
            <div className="chart_container_full">
              <Figure3
                dimensions={dimensions}
                ref={chartFigure3}
                value={figure3Data}
              />
            </div>
          </div>
          <div className="scroll-elements">
            <div className="scroll-content">
              <div>
                <p>
                  Lets look at the US dollar centric world
                </p>
              </div>
            </div>
            <div className="scroll-content">
              <div>
                <p>
                  US dollar has been the dominating currency
                </p>
              </div>
            </div>
            <div className="scroll-content">
              <div>
                <p>
                  And despite recent decline
                </p>
              </div>
            </div>
            <div className="scroll-content">
              <div>
                <p>
                  No other single currency has taken its place
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
            </div>
            <div className="charts_container">
              <DwChartContainer chart_id="Z8ZTx" title="The enduring dollar" />
            </div>
            <div className="charts_container">
              <DwChartContainer chart_id="KQgvV" title="Allocated foreign currency reserves" />
            </div>
            <div className="text_content">
              <p>
                While the dollar’s share in global foreign exchange reserves has steadily declined since 2000, no other currency has risen to replace it. At the same time:
              </p>
              <ul>
                <li>The dollar’s share in SWIFT payments – the global messaging system banks use to move money across borders – climbed from 39% to 50% in just five years, reinforcing its role as the backbone of global transactions.</li>
                <li>The US still holds 50% of global equity market value – where companies raise capital – and 40% of the global bond market, which finances governments and major investments.</li>
              </ul>
            </div>
            <div className="charts_container">
              <DwChartContainer chart_id="DFyN9" title="SWIFT paymets" />
            </div>
            <div className="text_content">
              <p>The dollar’s influence reaches far beyond central bank reserves or how trade is priced. It affects who can get credit, where investment flows and how quickly financial shocks spread around the world.</p>
              <p>
                <strong>The takeaway:</strong>
                {' '}
                Even in a transforming global economy, the dollar remains the anchor, reaching deep into development paths. A dollar-centric global economy means developing countries’ financing costs rise or fall based on decisions taken elsewhere. It reinforces the asymmetry between their growing role in trade and their peripheral place in global finance.
              </p>
            </div>
          </div>
        </div>
        <ScrollingText texts={['Is the centre of global finance shifting south?']} chapter_text="Chapter 4" />
        <div ref={fixedSectionRefFigure2} className="fixed-section">
          <div className={`fixed-background ${positionFigure2}`}>
            <div className="overlay" />
            <div className="scroll-indicator"><div className="arrow" /></div>
            <div className="chart_container_full">
              <Figure2
                dimensions={dimensions}
                ref={chartFigure2}
                value={figure2Data}
              />
            </div>
          </div>
          <div className="scroll-elements">
            <div className="scroll-content">
              <div>
                <p>
                  Lets look at the flow of investments
                </p>
              </div>
            </div>
            <div className="scroll-content">
              <div>
                <p>
                  Before, all major foreign investment hubs were in the Global North.
                </p>
              </div>
            </div>
            <div className="scroll-content">
              <div>
                <p>
                  Now, the Global South plays a much larger role.
                </p>
              </div>
            </div>
            <div className="scroll-content">
              <div>
                <p>
                  But its role in global financial markets remains small.
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
            <div className="text_content">
              <p>The Global South has become central to world trade and production – accounting for over 40% of global output and world trade, and half of global foreign direct investment (FDI) inflows.</p>
              <p>But their presence in global financial markets remains far smaller – a mismatch that constrains development options. Excluding China, developing countries hold just 12% of global equity market value and 6% of the global bond market.</p>
            </div>
            <div className="charts_container">
              <DwChartContainer chart_id="Xr09T" title="Uneven growth" />
            </div>
            <div className="text_content">
              <p>While equity markets in the Global South have grown since the 2008–09 global financial crisis, they still trail in size and sophistication. This leaves many developing countries dependent on foreign banks and financial markets – often at high and volatile interest rates.</p>
            </div>
            <div className="charts_container">
              <DwChartContainer chart_id="MBUBg" title="Total credit" />
            </div>
            <div className="text_content">
              <p>Key points about developing countries:</p>
              <ul>
                <li>They have smaller, less liquid capital markets, making it harder for firms to raise capital or for investors to trade without difficulty.</li>
                <li>They pay significantly higher borrowing costs, with higher interest payments draining resources that could otherwise support jobs, infrastructure or public services.</li>
                <li>They face bigger swings in market sentiment – when global rates rise or investors become more risk-averse, capital can exit quickly, pushing up borrowing costs, weakening currencies and amplifying financial stress.</li>
              </ul>
            </div>
            <div className="charts_container">
              <DwChartContainer chart_id="2M752" title="Ten-year treasury yield" />
            </div>
            <div className="text_content">
              <p>The borrowing costs illustrate the gap clearly. While advanced economies often borrow at 1–3%, many emerging markets pay 6–12% or more for similar government bonds. </p>
              <p>This means a government in an emerging economy may pay three to five times more in interest – a stark difference that limits fiscal space and raises the cost of development.</p>
              <p>
                <strong>The takeway:</strong>
                {' '}
                This structural imbalance means developing economies contribute increasingly to global growth but are not empowered to shape global financial rules or secure affordable financing for long-term development. It limits their ability to invest in infrastructure, innovation and climate adaptation.
              </p>
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
