import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  HiDocumentText,
  HiIdentification,
  HiMagnifyingGlass,
  HiShieldCheck,
  HiClipboardDocumentList,
  HiArrowRight,
  HiSparkles,
} from "react-icons/hi2";
import { FaCrown } from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

const FEATURES = [
  {
    id: "register",
    title: "অনলাইন রেজিস্ট্রেশন",
    subtitle: "সহজ ৩-ধাপে ঘরে বসেই আবেদন",
    badge: "সক্রিয়",
    badgeColor: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    icon: HiDocumentText,
    iconBg: "from-emerald-500 to-teal-600",
    link: "/register",
    buttonText: "আবেদন করুন",
  },
  {
    id: "admit",
    title: "প্রবেশপত্র ডাউনলোড",
    subtitle: "রোল ও কেন্দ্রসহ এডমিট কার্ড",
    badge: "প্রস্তুত",
    badgeColor: "bg-sky-500/15 text-sky-300 border-sky-500/30",
    icon: HiIdentification,
    iconBg: "from-sky-500 to-blue-600",
    link: "/admit-card",
    buttonText: "এডমিট নিন",
  },
  {
    id: "search",
    title: "ফলাফল ও মার্কশিট",
    subtitle: "রোল দিয়ে তাৎক্ষণিক রেজাল্ট",
    badge: "২০২৬",
    badgeColor: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    icon: HiMagnifyingGlass,
    iconBg: "from-amber-500 to-orange-600",
    link: "/search",
    buttonText: "ফলাফল দেখুন",
  },
  {
    id: "leaderboard",
    title: "শীর্ষ মেধা তালিকা",
    subtitle: "ট্যালেন্টপুল ও সাধারণ পডিয়াম",
    badge: "টপ র‍্যাংক",
    badgeColor: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
    icon: FaCrown,
    iconBg: "from-indigo-500 to-purple-600",
    link: "/leaderboard",
    buttonText: "লিডারবোর্ড",
  },
  {
    id: "certificate",
    title: "সনদপত্র যাচাই",
    subtitle: "QR কোড ডিজিটাল ভেরিফিকেশন",
    badge: "ভেরিফাইড",
    badgeColor: "bg-teal-500/15 text-teal-300 border-teal-500/30",
    icon: HiShieldCheck,
    iconBg: "from-teal-500 to-emerald-600",
    link: "/verify-certificate",
    buttonText: "যাচাই করুন",
  },
  {
    id: "rules",
    title: "পরীক্ষার নিয়মাবলি",
    subtitle: "অফিশিয়াল ৮টি জরুরি নির্দেশিকা",
    badge: "নিয়মাবলী",
    badgeColor: "bg-purple-500/15 text-purple-300 border-purple-500/30",
    icon: HiClipboardDocumentList,
    iconBg: "from-purple-500 to-indigo-600",
    link: "/scholarship",
    buttonText: "নিয়ম দেখুন",
  },
];

const FeatureHub = () => {
  const [mobileIndex, setMobileIndex] = useState(0);
  const swiperRef = useRef(null);

  return (
    <section className="relative w-full px-3 sm:px-6 py-10 sm:py-16 bg-[#0b1326] text-white border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-10">
        
        {/* Section Header */}
        <div className="text-center space-y-2 sm:space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-xs font-bold uppercase tracking-wider">
            <HiSparkles className="text-sm text-amber-400" />
            <span>ডিজিটাল সেবা হাব</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            মেধাবৃত্তির <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400">অনলাইন পোর্টাল ও সেবাসমূহ</span>
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
            পরীক্ষার্থী ও অভিভাবকদের জন্য সকল ডিজিটাল সেবা এক ক্লিকে সহজলভ্য।
          </p>
        </div>

        {/* Desktop Grid View */}
        <div className="hidden gap-5 md:grid md:grid-cols-2 lg:grid-cols-3 stagger-in">
          {FEATURES.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                to={item.link}
                className="group relative p-5 sm:p-6 rounded-3xl bg-[#14162b] border border-white/10 hover:border-indigo-400/40 shadow-xl flex flex-col justify-between overflow-hidden lift"
              >
                <div className="space-y-3.5">
                  {/* Top Icon & Badge */}
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.iconBg} text-white flex items-center justify-center text-2xl shadow-md group-hover:scale-110 transition-transform duration-200`}
                    >
                      <Icon />
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border uppercase tracking-wider ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-snug line-clamp-2">
                      {item.subtitle}
                    </p>
                  </div>
                </div>

                {/* Bottom Action Link */}
                <div className="pt-3.5 mt-3.5 border-t border-white/[0.08] flex items-center justify-between text-xs font-bold text-indigo-400 group-hover:text-white transition-colors">
                  <span>{item.buttonText}</span>
                  <div className="w-6 h-6 rounded-full bg-white/[0.08] group-hover:bg-indigo-600 flex items-center justify-center group-hover:translate-x-1 transition-all shrink-0">
                    <HiArrowRight className="text-xs" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Mobile Swiper Slider View */}
        <div className="md:hidden space-y-4">
          <Swiper
            modules={[Autoplay, Pagination]}
            onSwiper={(swiper) => { swiperRef.current = swiper; }}
            onSlideChange={(swiper) => setMobileIndex(swiper.realIndex)}
            slidesPerView={1.2}
            spaceBetween={12}
            centeredSlides={false}
            loop={true}
            autoplay={{
              delay: 3500,
              disableOnInteraction: false,
            }}
            className="w-full !px-1 !py-1"
          >
            {FEATURES.map((item) => {
              const Icon = item.icon;
              return (
                <SwiperSlide key={item.id} className="h-auto">
                  <Link
                    to={item.link}
                    className="h-full p-4 rounded-2xl bg-[#14162b] border border-white/10 shadow-lg flex flex-col justify-between min-h-[170px] active:scale-[0.98] transition-transform block"
                  >
                    <div className="space-y-3">
                      {/* Top Icon & Badge */}
                      <div className="flex items-center justify-between">
                        <div
                          className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.iconBg} text-white flex items-center justify-center text-xl shadow-md`}
                        >
                          <Icon />
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${item.badgeColor}`}
                        >
                          {item.badge}
                        </span>
                      </div>

                      {/* Title & Subtitle */}
                      <div className="space-y-0.5">
                        <h3 className="text-sm font-bold text-white line-clamp-1">
                          {item.title}
                        </h3>
                        <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Action Hint */}
                    <div className="pt-2.5 mt-2.5 border-t border-white/[0.08] flex items-center justify-between text-[11px] font-bold text-indigo-400">
                      <span>{item.buttonText}</span>
                      <HiArrowRight className="text-xs" />
                    </div>
                  </Link>
                </SwiperSlide>
              );
            })}
          </Swiper>

          {/* Mobile Dot Indicators */}
          <div className="flex items-center justify-center gap-1.5 pt-1">
            {FEATURES.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => swiperRef.current?.slideToLoop(index)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  mobileIndex === index ? "w-6 bg-indigo-500" : "w-1.5 bg-white/20"
                }`}
                aria-label={`Slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default FeatureHub;
