import React from 'react';
import Hero from './home/Hero';
import ImportantDatesCountdown from './common/ImportantDatesCountdown';
import FeatureHub from './home/FeatureHub';
import ExamRulesCard from './scholarship/ExamRulesCard';
import About from './home/About';
import Activities from './home/Activities';
import Committee from './home/Committee';
import CallToAction from './home/CallToAction';
import FAQ from './home/FAQ';
import { Reveal } from './common';

const Home = () => {
  return (
    <div className="min-h-screen bg-[#0b1326] text-slate-300 font-sans transition-colors duration-200">
      {/* 1. HERO SECTION — above the fold, so it animates on mount rather
             than waiting for a scroll that may never happen. */}
      <div className="page-enter">
        <Hero />
      </div>

      {/* Everything below the fold fades and lifts as it is scrolled to.
          Each <Reveal> owns one band, so sections arrive one at a time
          instead of the whole page sliding at once. */}

      {/* 2. LIVE COUNTDOWN & IMPORTANT DATES TIMELINE */}
      <Reveal>
        <ImportantDatesCountdown />
      </Reveal>

      {/* 3. INTERACTIVE 6-CARD DIGITAL FEATURE HUB */}
      <Reveal>
        <FeatureHub />
      </Reveal>

      {/* 4. OFFICIAL EXAM RULES SPOTLIGHT ACCORDION CARD */}
      <Reveal as="section" className="max-w-5xl mx-auto section-tight">
        <ExamRulesCard defaultExpanded={false} />
      </Reveal>

      {/* 5. ABOUT & DOCUMENTARY VIDEO SECTION */}
      <Reveal>
        <About />
      </Reveal>

      {/* 6. CALL TO ACTION BANNER */}
      <Reveal direction="scale">
        <CallToAction />
      </Reveal>

      {/* 7. ACTIVITIES & PROGRAMS */}
      <Reveal>
        <Activities />
      </Reveal>

      {/* 8. COMMITTEE & LEADERSHIP */}
      <Reveal>
        <Committee />
      </Reveal>

      {/* 9. FAQ ACCORDION SECTION */}
      <Reveal>
        <FAQ />
      </Reveal>
    </div>
  );
};

export default Home;
