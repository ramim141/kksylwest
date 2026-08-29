import React, { lazy } from 'react';
import Hero from './home/Hero';
import ImportantDatesCountdown from './common/ImportantDatesCountdown';
import FeatureHub from './home/FeatureHub';
import { Reveal, DeferredSection, SectionSkeleton } from './common';

/* Above the fold, and eagerly imported: the hero, the countdown and the
   feature hub are what the first screen is made of.

   Everything below them is a separate chunk. The carousel alone pulls in
   Swiper, and the committee and FAQ bands are large — bundled into the
   entry chunk they were ~150KB the browser had to download and parse
   before it could paint a hero that does not use any of it. <DeferredSection>
   fetches them when they approach the viewport, or when the browser goes
   idle, whichever comes first. */
const ExamRulesCard = lazy(() => import('./scholarship/ExamRulesCard'));
const About = lazy(() => import('./home/About'));
const CallToAction = lazy(() => import('./home/CallToAction'));
const Activities = lazy(() => import('./home/Activities'));
const Committee = lazy(() => import('./home/Committee'));
const FAQ = lazy(() => import('./home/FAQ'));

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
      <DeferredSection
        placeholder={<SectionSkeleton tone="#0b1326" cards={1} columns="grid-cols-1" media={false} minHeight={260} />}
      >
        <Reveal as="section" className="max-w-5xl mx-auto section-tight">
          <ExamRulesCard defaultExpanded={false} />
        </Reveal>
      </DeferredSection>

      {/* 5. ABOUT & DOCUMENTARY VIDEO SECTION */}
      <DeferredSection
        placeholder={<SectionSkeleton tone="#0f1124" cards={2} columns="grid-cols-1 lg:grid-cols-2" minHeight={480} />}
      >
        <Reveal>
          <About />
        </Reveal>
      </DeferredSection>

      {/* 6. CALL TO ACTION BANNER */}
      <DeferredSection
        placeholder={<SectionSkeleton tone="#0b1326" cards={1} columns="grid-cols-1" media={false} minHeight={220} />}
      >
        <Reveal direction="scale">
          <CallToAction />
        </Reveal>
      </DeferredSection>

      {/* 7. ACTIVITIES & PROGRAMS — the Swiper carousel lives here */}
      <DeferredSection
        placeholder={<SectionSkeleton tone="#0f1124" cards={3} minHeight={520} />}
      >
        <Reveal>
          <Activities />
        </Reveal>
      </DeferredSection>

      {/* 8. COMMITTEE & LEADERSHIP */}
      <DeferredSection
        placeholder={<SectionSkeleton tone="#0b1326" cards={4} columns="grid-cols-2 lg:grid-cols-4" minHeight={520} />}
      >
        <Reveal>
          <Committee />
        </Reveal>
      </DeferredSection>

      {/* 9. FAQ ACCORDION SECTION */}
      <DeferredSection
        placeholder={<SectionSkeleton tone="#0f1124" cards={4} columns="grid-cols-1" media={false} minHeight={480} />}
      >
        <Reveal>
          <FAQ />
        </Reveal>
      </DeferredSection>
    </div>
  );
};

export default Home;
