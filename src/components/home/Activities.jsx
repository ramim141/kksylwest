import React, { useState, useEffect, useRef } from 'react';
import { 
  HiSparkles, 
  HiAcademicCap, 
  HiBeaker, 
  HiMusicalNote, 
  HiHeart, 
  HiTrophy, 
  HiBookOpen,
  HiChevronLeft,
  HiChevronRight
} from 'react-icons/hi2';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import { getActivities } from '../../services/firestore';

const THEME_STYLES = {
  emerald: {
    gradient: "from-emerald-500 to-teal-600",
    badgeColor: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  },
  sky: {
    gradient: "from-sky-500 to-indigo-600",
    badgeColor: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  },
  purple: {
    gradient: "from-purple-500 to-indigo-600",
    badgeColor: "bg-purple-500/15 text-purple-300 border-purple-500/30",
  },
  rose: {
    gradient: "from-rose-500 to-pink-600",
    badgeColor: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  },
  amber: {
    gradient: "from-amber-500 to-orange-600",
    badgeColor: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  },
  teal: {
    gradient: "from-teal-500 to-emerald-600",
    badgeColor: "bg-teal-500/15 text-teal-300 border-teal-500/30",
  },
  indigo: {
    gradient: "from-indigo-500 to-purple-600",
    badgeColor: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
  },
};

const DEFAULT_ITEMS = [
  { 
    id: "scholarship",
    title: "মেধাবৃত্তি কার্যক্রম", 
    content: "বার্ষিক মেধাবৃত্তি পরীক্ষা আয়োজন এবং কৃতী শিক্ষার্থীদের বিশেষ বৃত্তি, সনদ ও ক্রেস্ট প্রদান।",
    icon: HiAcademicCap,
    gradient: "from-emerald-500 to-teal-600",
    badge: "মেধাবৃত্তি",
    badgeColor: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  },
  { 
    id: "olympiad",
    title: "শিক্ষা ও অলিম্পিয়াড", 
    content: "বিজ্ঞান মেলা, কুইজ প্রতিযোগিতা, বিতর্ক উৎসব এবং বিষয়ভিত্তিক সৃজনশীল শিক্ষা ক্যাম্প।",
    icon: HiBeaker,
    gradient: "from-sky-500 to-indigo-600",
    badge: "শিক্ষা ও বিজ্ঞান",
    badgeColor: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  },
  { 
    id: "cultural",
    title: "সাংস্কৃতিক কার্যক্রম", 
    content: "হামদ-নাত, ক্বিরাত প্রতিযোগিতা, আবৃত্তি, অভিনয় ও সুস্থ মানসিক সংস্কৃতির নিয়মিত আসর।",
    icon: HiMusicalNote,
    gradient: "from-purple-500 to-indigo-600",
    badge: "সংস্কৃতি",
    badgeColor: "bg-purple-500/15 text-purple-300 border-purple-500/30",
  },
  { 
    id: "social",
    title: "সমাজকল্যাণ ও সেবা", 
    content: "শীতবস্ত্র বিতরণ, বিনামূল্যে রক্তদান কর্মসূচি ও প্রাকৃতিক দুর্যোগে মানুষের পাশে ত্রাণ সহায়তা।",
    icon: HiHeart,
    gradient: "from-rose-500 to-pink-600",
    badge: "সামাজিক সেবা",
    badgeColor: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  },
  { 
    id: "sports",
    title: "ক্রীড়া ও শরীরচর্চা", 
    content: "বার্ষিক ক্রীড়া প্রতিযোগিতা, ফুটবল-ক্রিকেট টুর্নামেন্ট ও তরুণদের স্বাস্থ্য সচেতনতা বৃদ্ধি।",
    icon: HiTrophy,
    gradient: "from-amber-500 to-orange-600",
    badge: "ক্রীড়াঙ্গন",
    badgeColor: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  },
  { 
    id: "library",
    title: "পাঠাগার ও বইপড়া", 
    content: "বইপড়া প্রতিযোগিতা, কিশোরকণ্ঠ পাঠক আসর ও সমৃদ্ধ জ্ঞানভিত্তিক পাঠাগার পরিচালনা।",
    icon: HiBookOpen,
    gradient: "from-teal-500 to-emerald-600",
    badge: "বইপড়া আন্দোলন",
    badgeColor: "bg-teal-500/15 text-teal-300 border-teal-500/30",
  }
];

const Activities = () => {
  const [items, setItems] = useState(DEFAULT_ITEMS);
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef(null);

  useEffect(() => {
    getActivities().then((data) => {
      if (data && data.length > 0) {
        const themeKeys = Object.keys(THEME_STYLES);
        setItems(data.map((item, idx) => {
          const themeKey = item.theme || themeKeys[idx % themeKeys.length];
          const style = THEME_STYLES[themeKey] || THEME_STYLES.indigo;
          
          return {
            id: item.id || idx,
            title: item.title,
            content: item.content || item.details || item.description || '',
            badge: item.badge || 'কার্যক্রম',
            badgeColor: item.badgeColor || style.badgeColor,
            gradient: item.gradient || style.gradient,
            icon: item.icon || HiSparkles,
          };
        }));
      }
    });
  }, []);

  const handleDotClick = (index) => {
    if (swiperRef.current) {
      swiperRef.current.slideTo(index);
    }
  };

  return (
    <section className="relative w-full px-3 sm:px-6 py-12 sm:py-16 md:py-20 bg-[#0f1124] text-white border-b border-white/[0.08] overflow-hidden">
      {/* Glowing Ambient Blobs */}
      <div className="pointer-events-none absolute -left-20 top-1/3 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-1/3 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto space-y-8 sm:space-y-10 relative z-10">
        
        {/* Section Header */}
        <div className="text-center space-y-2 sm:space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-xs font-bold uppercase tracking-wider">
            <HiSparkles className="text-sm text-indigo-400" />
            <span>আমাদের উদ্যোগসমূহ</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            কিশোরকণ্ঠ পাঠক ফোরামের <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400">
              সার্বিক কার্যক্রম ও কর্মকাণ্ড
            </span>
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
            মেধা বিকাশ, নৈতিক শিক্ষা ও সুস্থ সংস্কৃতির প্রসারে পরিচালিত আমাদের বহুমুখী নিয়মিত কার্যক্রম।
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          <Swiper
            modules={[Autoplay]}
            onSwiper={(swiper) => (swiperRef.current = swiper)}
            onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
            autoplay={{
              delay: 4000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            loop={items.length > 3}
            slidesPerView={1.15}
            spaceBetween={12}
            breakpoints={{
              480: {
                slidesPerView: 1.35,
                spaceBetween: 14,
              },
              640: {
                slidesPerView: 2,
                spaceBetween: 18,
              },
              1024: {
                slidesPerView: 3,
                spaceBetween: 24,
              }
            }}
            className="pb-4"
          >
            {items.map((item) => {
              const Icon = item.icon || HiSparkles;
              return (
                <SwiperSlide key={item.id} className="h-auto">
                  <div
                    className="relative h-full min-h-[200px] sm:min-h-[220px] p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#14162b] border border-white/10 hover:border-indigo-400/40 flex flex-col justify-between overflow-hidden shadow-xl transition-all duration-300"
                  >
                    <div className="space-y-3.5">
                      {/* Top Bar: Icon + Badge */}
                      <div className="flex items-center justify-between">
                        <div
                          className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${item.gradient} text-white flex items-center justify-center text-xl sm:text-2xl shadow-md`}
                        >
                          <Icon />
                        </div>

                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold border uppercase tracking-wider ${item.badgeColor}`}
                        >
                          {item.badge}
                        </span>
                      </div>

                      {/* Title & Direct Description */}
                      <div className="space-y-2">
                        <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                          {item.title}
                        </h3>

                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                          {item.content}
                        </p>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>

          {/* Desktop Left / Right Arrow Buttons */}
          <button
            type="button"
            onClick={() => swiperRef.current?.slidePrev()}
            className="hidden lg:flex absolute -left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[#14162b] border border-white/20 items-center justify-center text-white hover:bg-indigo-600 transition-all cursor-pointer shadow-lg"
            aria-label="Previous Slide"
          >
            <HiChevronLeft className="text-lg" />
          </button>
          <button
            type="button"
            onClick={() => swiperRef.current?.slideNext()}
            className="hidden lg:flex absolute -right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[#14162b] border border-white/20 items-center justify-center text-white hover:bg-indigo-600 transition-all cursor-pointer shadow-lg"
            aria-label="Next Slide"
          >
            <HiChevronRight className="text-lg" />
          </button>
        </div>

        {/* Centered Dot Pagination */}
        <div className="flex items-center justify-center pt-2">
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 p-1.5 rounded-full bg-[#14162b] border border-white/10">
            {items.map((_, index) => {
              const isActive = activeIndex === index;
              return (
                <button
                  key={`dot-${index}`}
                  type="button"
                  onClick={() => handleDotClick(index)}
                  className={`h-2 sm:h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'w-6 sm:w-7 bg-indigo-500'
                      : 'w-2 sm:w-2.5 bg-white/20 hover:bg-white/40'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};

export default Activities;