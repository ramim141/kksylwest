import React, { useState, useEffect, useRef } from 'react';
import { 
  HiSparkles, 
  HiAcademicCap, 
  HiBeaker, 
  HiMusicalNote, 
  HiHeart, 
  HiTrophy, 
  HiBookOpen,
  HiXMark,
  HiInformationCircle,
  HiChevronLeft,
  HiChevronRight
} from 'react-icons/hi2';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import { getActivities } from '../../services/firestore';

const DEFAULT_ITEMS = [
  { 
    id: "scholarship",
    title: "মেধাবৃত্তি কার্যক্রম", 
    content: "বার্ষিক মেধাবৃত্তি পরীক্ষা আয়োজন এবং কৃতী শিক্ষার্থীদের বিশেষ বৃত্তি ও ক্রেস্ট প্রদান।",
    details: "শিক্ষার্থীদের সুপ্ত প্রতিভা অন্বেষণে প্রতি বছর সিলেট অঞ্চলে বিশাল পরিসরে আয়োজন করা হয় কিশোরকণ্ঠ মেধা বৃত্তি পরীক্ষা। পরীক্ষায় উত্তীর্ণ শিক্ষার্থীদের ট্যালেন্টপুল ও সাধারণ গ্রেডে বৃত্তি, সনদপত্র ও আকর্ষণীয় পুরস্কার প্রদান করা হয়।",
    icon: HiAcademicCap,
    gradient: "from-emerald-500 to-teal-600",
    badge: "মেধাবৃত্তি",
    badgeColor: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  },
  { 
    id: "olympiad",
    title: "শিক্ষা ও অলিম্পিয়াড", 
    content: "বিজ্ঞান মেলা, কুইজ প্রতিযোগিতা, বিতর্ক উৎসব এবং বিষয়ভিত্তিক শিক্ষা ক্যাম্প।",
    details: "শিক্ষার্থীদের পাঠ্যবইয়ের পাশাপাশি সৃজনশীল মেধা ও মননের বিকাশে আমরা নিয়মিত কুইজ প্রতিযোগিতা, উপস্থিত বক্তৃতা, বিতর্ক উৎসব এবং বিজ্ঞান অলিম্পিয়াডের আয়োজন করে থাকি।",
    icon: HiBeaker,
    gradient: "from-sky-500 to-indigo-600",
    badge: "শিক্ষা ও বিজ্ঞান",
    badgeColor: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  },
  { 
    id: "cultural",
    title: "সাংস্কৃতিক কার্যক্রম", 
    content: "হামদ-নাত, ক্বিরাত প্রতিযোগিতা, আবৃত্তি, অভিনয় ও সুস্থ সংস্কৃতির আসর।",
    details: "সুস্থ সংস্কৃতি মানুষকে সুন্দর মনের অধিকারী করে। আমরা নিয়মিত হামদ-নাত, ক্বিরাত এবং দেশাত্মবোধক গানের প্রতিযোগিতার আয়োজন করি। অপসংস্কৃতির সয়লাব থেকে যুবসমাজকে রক্ষা করাই আমাদের উদ্দেশ্য।",
    icon: HiMusicalNote,
    gradient: "from-purple-500 to-indigo-600",
    badge: "সংস্কৃতি",
    badgeColor: "bg-purple-500/15 text-purple-300 border-purple-500/30",
  },
  { 
    id: "social",
    title: "সমাজকল্যাণ ও সেবা", 
    content: "শীতবস্ত্র বিতরণ, বিনামূল্যে রক্তদান কর্মসূচি, ও দুর্যোগে ত্রাণ সহায়তা।",
    details: "মানবতার সেবায় আমরা সদা সচেষ্ট। প্রতি শীতে গরিব ও অসহায়দের মাঝে শীতবস্ত্র বিতরণ, ব্লাড ডোনার গ্রুপের মাধ্যমে মুমূর্ষু রোগীদের রক্তদান এবং বন্যা ও প্রাকৃতিক দুর্যোগে মানুষের পাশে দাঁড়ানো আমাদের অন্যতম প্রধান কাজ।",
    icon: HiHeart,
    gradient: "from-rose-500 to-pink-600",
    badge: "সামাজিক সেবা",
    badgeColor: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  },
  { 
    id: "sports",
    title: "ক্রীড়া ও শরীরচর্চা", 
    content: "বার্ষিক ক্রীড়া প্রতিযোগিতা, ফুটবল-ক্রিকেট টুর্নামেন্ট ও স্বাস্থ্য সচেতনতা।",
    details: "একটি সুস্থ দেহের ভেতরেই সুস্থ মনের বাস। তাই পড়াশোনার পাশাপাশি শরীরচর্চা ও খেলাধুলার বিকল্প নেই। আমরা নিয়মিত কিশোর ও যুবকদের জন্য বার্ষিক ফুটবল ও ক্রিকেট টুর্নামেন্টের আয়োজন করি।",
    icon: HiTrophy,
    gradient: "from-amber-500 to-orange-600",
    badge: "ক্রীড়াঙ্গন",
    badgeColor: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  },
  { 
    id: "library",
    title: "পাঠাগার ও বইপড়া", 
    content: "বইপড়া প্রতিযোগিতা, কিশোরকণ্ঠ পাঠক আসর ও সমৃদ্ধ পাঠাগার পরিচালনা।",
    details: "বই পড়ার অভ্যাস গড়ে তোলার লক্ষ্যে আমরা পাঠক ফোরামের মাধ্যমে নিয়মিত বইপড়া উৎসব ও কিশোরকণ্ঠ ম্যাগাজিন বিতরণ কার্যক্রম পরিচালনা করি। জ্ঞানভিত্তিক প্রজন্ম গড়াই আমাদের ভিশন।",
    icon: HiBookOpen,
    gradient: "from-teal-500 to-emerald-600",
    badge: "বইপড়া আন্দোলন",
    badgeColor: "bg-teal-500/15 text-teal-300 border-teal-500/30",
  }
];

const Activities = () => {
  const [items, setItems] = useState(DEFAULT_ITEMS);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef(null);

  useEffect(() => {
    getActivities().then((data) => {
      if (data && data.length > 0) {
        setItems(data.map((item) => ({
          id: item.id,
          title: item.title,
          content: item.description,
          details: item.details || item.description,
          badge: item.badge || 'কার্যক্রম',
          badgeColor: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
          gradient: 'from-indigo-500 to-purple-600',
          icon: HiSparkles
        })));
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
              const Icon = item.icon;
              return (
                <SwiperSlide key={item.id} className="h-auto">
                  <div
                    onClick={() => setSelectedActivity(item)}
                    className="group relative h-full min-h-[220px] sm:min-h-[250px] p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#14162b] border border-white/10 hover:border-indigo-400/40 cursor-pointer flex flex-col justify-between overflow-hidden shadow-xl lift"
                  >
                    <div className="space-y-3 sm:space-y-4">
                      {/* Top Bar: Icon + Badge */}
                      <div className="flex items-center justify-between">
                        <div
                          className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${item.gradient} text-white flex items-center justify-center text-xl sm:text-2xl group-hover:scale-110 transition-transform duration-200 shadow-md`}
                        >
                          <Icon />
                        </div>

                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold border uppercase tracking-wider ${item.badgeColor}`}
                        >
                          {item.badge}
                        </span>
                      </div>

                      {/* Title & Short Content */}
                      <div className="space-y-1.5">
                        <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                          {item.title}
                        </h3>

                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-3">
                          {item.content}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Action Hint */}
                    <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs font-bold text-indigo-400">
                      <span className="inline-flex items-center gap-1">
                        <HiInformationCircle className="text-sm" />
                        <span>বিস্তারিত জানুন</span>
                      </span>
                      <span className="transform group-hover:translate-x-1 transition-transform">→</span>
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

      {/* Activity Details Modal */}
      {selectedActivity && (
        <div
          onClick={() => setSelectedActivity(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 cursor-pointer bg-black/80 backdrop-blur-md backdrop-enter"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-lg w-full bg-[#14162b] rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/15 space-y-5 text-white overlay-enter"
          >
            <div className="flex items-start justify-between gap-4 pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${selectedActivity.gradient} text-white flex items-center justify-center text-2xl shadow-md`}>
                  {React.createElement(selectedActivity.icon)}
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-white">{selectedActivity.title}</h3>
                  <span className="text-xs text-indigo-300 font-bold">{selectedActivity.badge}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedActivity(null)}
                className="p-2 text-slate-400 hover:text-white rounded-full bg-white/[0.06] hover:bg-rose-600 transition cursor-pointer"
              >
                <HiXMark className="text-lg" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
              {selectedActivity.details}
            </p>

            <div className="pt-3 border-t border-white/[0.08] flex justify-end">
              <button
                onClick={() => setSelectedActivity(null)}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Activities;