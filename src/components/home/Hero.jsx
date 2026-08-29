import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import heroBanner from '../../assets/images/hero-banner.jpg';
import heroBanner1 from '../../assets/images/hero-banner-exam-students.jpg';
import heroBanner2 from '../../assets/images/hero-banner-exam-center.jpg';
import {
  HiPlay,
  HiXMark,
  HiPhoto,
} from 'react-icons/hi2';
import { getHeroSlides, getHomepageContent } from '../../services/firestore';
import { SmartImage } from '../common';
import { useExamYear } from '../../context/ExamYearContext';

const DEFAULT_HERO_TEXT = {
  overline: "সিলেট জেলা পশ্চিম • ১৯৯৪ থেকে",
  titleLine1: "মেধার পাশে",
  titleLine2: "মূল্যবোধের আলো",
  description: "কিশোরকণ্ঠ মেধাবৃত্তি — রেজিস্ট্রেশন, প্রবেশপত্র ও ফলাফল সব এক জায়গায়।",
};

const DEFAULT_SLIDES = [
  {
    id: 0,
    image: heroBanner,
    caption: 'পুরস্কার প্রদান অনুষ্ঠান, সিলেট',
    thumbName: 'থাম্ব ১'
  },
  {
    id: 1,
    image: heroBanner1,
    caption: 'মেধাবৃত্তি পরীক্ষায় শিক্ষার্থীদের উৎসবমুখর অংশগ্রহণ',
    thumbName: 'থাম্ব ২'
  },
  {
    id: 2,
    image: heroBanner2,
    caption: 'সুশৃঙ্খল পরীক্ষা কেন্দ্র ও অডিটোরিয়াম সমাবেশ',
    thumbName: 'থাম্ব ৩'
  }
];

const STEPS = [
  {
    step: "০১",
    title: "রেজিস্ট্রেশন করুন",
    subtitle: "অনলাইন ফর্ম • ৫ মিনিট",
    link: "/register",
  },
  {
    step: "০২",
    title: "প্রবেশপত্র নিন",
    subtitle: "রোল বা মোবাইল নম্বর দিয়ে",
    link: "/admit-card",
  },
  {
    step: "০৩",
    title: "পরীক্ষায় বসুন",
    subtitle: "৮টি কেন্দ্র • সময়সূচি",
    link: "/scholarship",
  },
  {
    step: "০৪",
    title: "ফলাফল ও মেধা তালিকা",
    subtitle: "শীর্ষ মেধা তালিকা",
    link: "/search",
  },
  {
    step: "০৫",
    title: "পুরস্কার গ্রহণ",
    subtitle: "সংবর্ধনা ও ক্রেস্ট বিতরণ",
    link: "/notice",
  },
];

const DEFAULT_VIDEO_URL = "https://www.youtube-nocookie.com/embed/5qap5aO4i9A?autoplay=1";

const formatYouTubeEmbedUrl = (input) => {
  if (!input || !input.trim()) return DEFAULT_VIDEO_URL;
  const clean = input.trim();
  if (clean.includes("youtube.com/embed/")) {
    const base = clean.split("?")[0];
    return `${base}?autoplay=1`;
  }
  const watchMatch = clean.match(/(?:youtube\.com\/watch\?v=|youtube\.com\/shorts\/)([a-zA-Z0-9_-]+)/);
  if (watchMatch && watchMatch[1]) {
    return `https://www.youtube-nocookie.com/embed/${watchMatch[1]}?autoplay=1`;
  }
  const shortMatch = clean.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (shortMatch && shortMatch[1]) {
    return `https://www.youtube-nocookie.com/embed/${shortMatch[1]}?autoplay=1`;
  }
  if (/^[a-zA-Z0-9_-]{6,20}$/.test(clean)) {
    return `https://www.youtube-nocookie.com/embed/${clean}?autoplay=1`;
  }
  return `https://www.youtube-nocookie.com/embed/${clean}?autoplay=1`;
};

const Hero = () => {
  const examYear = useExamYear();
  const [slides, setSlides] = useState(DEFAULT_SLIDES);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [heroText, setHeroText] = useState(DEFAULT_HERO_TEXT);
  const [videoUrl, setVideoUrl] = useState(DEFAULT_VIDEO_URL);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  useEffect(() => {
    getHeroSlides().then((data) => {
      if (data && data.length > 0) {
        const formatted = data.slice(0, 3).map((s, idx) => ({
          id: idx,
          image: s.imageUrl,
          caption: s.caption || DEFAULT_SLIDES[idx]?.caption || 'মেধাবৃত্তি আয়োজন',
          thumbName: `থাম্ব ${idx + 1}`
        }));
        setSlides(formatted);
      }
    });

    getHomepageContent().then((data) => {
      if (data && data.hero) {
        setHeroText((prev) => ({
          ...prev,
          description: data.hero.description || prev.description,
        }));
        if (data.hero.videoUrl) {
          setVideoUrl(formatYouTubeEmbedUrl(data.hero.videoUrl));
        }
      }
    });
  }, []);

  const currentSlide = slides[activeSlideIndex] || slides[0];

  return (
    <>
      {/* Video Modal Popup */}
      {isVideoModalOpen && (
        <div
          onClick={() => setIsVideoModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md backdrop-enter"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl bg-[#14162b] border border-white/15 rounded-3xl overflow-hidden shadow-2xl overlay-enter"
          >
            <button
              onClick={() => setIsVideoModalOpen(false)}
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/60 text-white hover:bg-rose-600 flex items-center justify-center transition cursor-pointer"
            >
              <HiXMark className="text-xl" />
            </button>
            <div className="relative w-full aspect-video">
              <iframe
                src={videoUrl}
                title="মেধাবৃত্তির ভিডিও"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          HERO SECTION (Matching Exact Diagram UI Layout)
          =================================================================== */}
      <section className="relative w-full px-3 sm:px-6 bg-[#131528] text-white overflow-hidden font-sans border-b border-white/[0.08]">
        
        {/* Ambient Glows */}
        <div className="pointer-events-none absolute top-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />

        {/* Main 2-Column Hero Area */}
        <div className="max-w-7xl mx-auto py-10 sm:py-14 lg:py-16 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            
            {/* Left Content Column (5.5 cols) */}
            <div className="lg:col-span-5 space-y-4 sm:space-y-6 text-left">
              
              {/* Overline Badge */}
              <div className="flex items-center gap-2 text-indigo-300/80 text-xs sm:text-sm font-semibold tracking-wide">
                <span>{heroText.overline}</span>
              </div>

              {/* Massive 2-Line Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-[52px] font-black text-white leading-[1.15] tracking-tight">
                {heroText.titleLine1} <br />
                <span className="text-white">{heroText.titleLine2}</span>
              </h1>

              {/* Subtitle Description */}
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl font-normal">
                {heroText.description.includes("কিশোরকণ্ঠ মেধাবৃত্তি")
                  ? heroText.description.replace(/কিশোরকণ্ঠ মেধাবৃত্তি\s*(?:২০২৫|২০২৬|\d+)?/, `কিশোরকণ্ঠ মেধাবৃত্তি ${examYear}`)
                  : heroText.description}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2 sm:pt-4">
                {/* Registration Button */}
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-indigo-400/60 bg-indigo-600/20 hover:bg-indigo-600/35 hover:border-indigo-400 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <span>অনলাইন রেজিস্ট্রেশন</span>
                </Link>

                {/* Video Play Button */}
                <button
                  type="button"
                  onClick={() => setIsVideoModalOpen(true)}
                  className="inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-full border border-white/25 bg-white/[0.08] hover:bg-white/[0.16] hover:border-white/40 text-white font-bold text-xs sm:text-sm transition-all shadow-md hover:scale-105 active:scale-95 cursor-pointer group"
                >
                  <span className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs shadow-sm group-hover:bg-indigo-400 group-hover:scale-110 transition-all">
                    <HiPlay className="translate-x-0.5" />
                  </span>
                  <span>মেধাবৃত্তির ভিডিও দেখুন</span>
                </button>
              </div>
            </div>

            {/* Right Column: Hero Image Frame with Right Vertical Thumbnails (Exact Diagram Match) */}
            <div className="lg:col-span-7 w-full space-y-2">
              
              {/* Image Frame Container */}
              <div className="relative rounded-2xl sm:rounded-3xl bg-[#0e1022] border border-white/15 p-2 sm:p-2.5 shadow-2xl overflow-hidden flex flex-col sm:flex-row gap-2 sm:gap-2.5">
                
                {/* Main Big Image Frame (১৬:১০) */}
                <div className="relative flex-1 rounded-xl sm:rounded-2xl overflow-hidden bg-black/40 aspect-[16/10] group">
                  {/* Top Left Badge (অনুষ্ঠান) */}
                  <div className="absolute top-3 left-3 z-20">
                    <span className="px-3 py-1 rounded-lg bg-indigo-600/90 backdrop-blur-md text-white text-[10px] sm:text-xs font-bold shadow-md border border-indigo-400/30">
                      অনুষ্ঠান {examYear}
                    </span>
                  </div>

                  {/* Re-keyed on the slide so each swap blurs up from its
                      own skeleton instead of holding the previous frame. */}
                  <SmartImage
                    key={activeSlideIndex}
                    src={currentSlide.image}
                    alt={currentSlide.caption}
                    loading="eager"
                    rounded="rounded-none"
                    className="w-full h-full"
                    imgClassName="transition-transform duration-700 ease-standard group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0e1022]/80 via-transparent to-transparent pointer-events-none" />
                </div>

                {/* Right Vertical 3-Card Stack (থাম্ব ১, থাম্ব ২, আরও ছবি) */}
                <div className="flex sm:flex-col justify-between gap-2 w-full sm:w-28 md:w-32 shrink-0">
                  {/* Thumb 1 */}
                  <button
                    type="button"
                    onClick={() => setActiveSlideIndex(0)}
                    className={`relative flex-1 aspect-[4/3] sm:aspect-auto sm:h-[31%] rounded-lg sm:rounded-xl overflow-hidden transition-all duration-200 cursor-pointer border ${
                      activeSlideIndex === 0
                        ? "ring-2 ring-indigo-400 border-white scale-100 shadow-md"
                        : "border-white/15 opacity-70 hover:opacity-100 hover:border-white/40"
                    }`}
                  >
                    <SmartImage
                      src={slides[0]?.image || heroBanner}
                      alt="থাম্ব ১"
                      rounded="rounded-none"
                      className="w-full h-full"
                    />
                    <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/75 text-[9px] text-slate-200 font-bold">
                      থাম্ব ১
                    </span>
                  </button>

                  {/* Thumb 2 */}
                  <button
                    type="button"
                    onClick={() => setActiveSlideIndex(1)}
                    className={`relative flex-1 aspect-[4/3] sm:aspect-auto sm:h-[31%] rounded-lg sm:rounded-xl overflow-hidden transition-all duration-200 cursor-pointer border ${
                      activeSlideIndex === 1
                        ? "ring-2 ring-indigo-400 border-white scale-100 shadow-md"
                        : "border-white/15 opacity-70 hover:opacity-100 hover:border-white/40"
                    }`}
                  >
                    <SmartImage
                      src={slides[1]?.image || heroBanner1}
                      alt="থাম্ব ২"
                      rounded="rounded-none"
                      className="w-full h-full"
                    />
                    <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/75 text-[9px] text-slate-200 font-bold">
                      থাম্ব ২
                    </span>
                  </button>

                  {/* Thumb 3: আরও ছবি */}
                  <Link
                    to="/gallery"
                    className="relative flex-1 aspect-[4/3] sm:aspect-auto sm:h-[31%] rounded-lg sm:rounded-xl overflow-hidden transition-all duration-200 cursor-pointer border border-white/15 bg-indigo-950/40 hover:bg-indigo-900/60 hover:border-indigo-400/50 flex flex-col items-center justify-center text-center p-1 group"
                  >
                    <HiPhoto className="text-base sm:text-lg text-indigo-400 group-hover:scale-110 transition-transform mb-0.5" />
                    <span className="text-[10px] sm:text-xs font-bold text-indigo-200 group-hover:text-white leading-tight">
                      আরও ছবি
                    </span>
                  </Link>
                </div>

              </div>

              {/* Bottom Left Caption (Matching Diagram) */}
              <div className="text-left pt-1 px-1">
                <span className="text-[11px] sm:text-xs font-medium text-slate-400">
                  {currentSlide.caption}
                </span>
              </div>

            </div>

          </div>
        </div>

        {/* =============================================================
            BOTTOM 5-STEP QUICK ACTION STRIP
            ============================================================= */}
        <div className="border-t border-white/[0.08] bg-[#0f1124]/90 backdrop-blur-md -mx-3 sm:-mx-6 px-3 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 divide-y sm:divide-y-0 divide-x-0 sm:divide-x divide-white/[0.08]">
              {STEPS.map((item, idx) => (
                <Link
                  key={idx}
                  to={item.link}
                  className="group py-4 sm:py-5 px-3 sm:px-4 lg:px-5 hover:bg-white/[0.04] transition-colors block text-left"
                >
                  <span className="text-xs sm:text-sm font-sans font-extrabold text-indigo-400 block mb-1 tracking-wider">
                    {item.step}
                  </span>
                  <h4 className="text-xs sm:text-[13px] lg:text-sm font-bold text-white group-hover:text-indigo-300 transition-colors truncate">
                    {item.title}
                  </h4>
                  <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 truncate">
                    {item.subtitle}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>

      </section>
    </>
  );
};

export default Hero;