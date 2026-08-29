import React from 'react';
import { 
  HiRocketLaunch,
  HiAcademicCap,
  HiGlobeAlt,
  HiComputerDesktop,
  HiFlag,
  HiHeart,
  HiSparkles,
  HiArrowDown
} from 'react-icons/hi2';

const milestones = [
  {
    step: '১',
    year: '১৯৯৪',
    title: 'কিশোরকণ্ঠ পাঠক ফোরামের যাত্রা শুরু',
    description: 'সিলেটে সাহিত্য, সংস্কৃতি ও নৈতিক মূল্যবোধ চর্চার মহতী উদ্দেশ্য নিয়ে কিশোরকণ্ঠ পাঠক ফোরামের আনুষ্ঠানিক যাত্রা শুরু হয়।',
    icon: HiRocketLaunch,
    iconColor: 'text-indigo-400',
    badgeBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    nodeColor: 'from-indigo-500 to-blue-600',
    glowColor: 'shadow-indigo-500/30'
  },
  {
    step: '২',
    year: '২০০৫',
    title: 'মেধাবৃত্তি পরীক্ষার সূচনা',
    description: 'শিক্ষার্থীদের মেধা যাচাই ও পড়াশোনায় উদ্বুদ্ধ করতে প্রথমবারের মতো কিশোরকণ্ঠ মেধাবৃত্তি পরীক্ষার প্রবর্তন করা হয়।',
    icon: HiAcademicCap,
    iconColor: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    nodeColor: 'from-emerald-500 to-teal-600',
    glowColor: 'shadow-emerald-500/30'
  },
  {
    step: '৩',
    year: '২০১৪',
    title: '৮টি উপজেলায় পূর্ণাঙ্গ সম্প্রসারণ',
    description: 'সিলেট জেলা পশ্চিমের ৮টি উপজেলা (দক্ষিণ সুরমা, ফেঞ্চুগঞ্জ, বালাগঞ্জ, ওসমানীনগর, বিশ্বনাথ, সদর, কোম্পানীগঞ্জ ও নন্দীরগাঁও) ব্যাপী কার্যক্রমের বিস্তার।',
    icon: HiGlobeAlt,
    iconColor: 'text-sky-400',
    badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    nodeColor: 'from-sky-500 to-indigo-600',
    glowColor: 'shadow-sky-500/30'
  },
  {
    step: '৪',
    year: '২০২৩',
    title: 'ডিজিটাল অটোমেশন ও অনলাইন পোর্টাল',
    description: 'অনলাইন রেজিস্ট্রেশন, ডিজিটাল প্রবেশপত্র ডাউনলোড এবং দ্রুত ফলাফল প্রকাশের জন্য আধুনিক ওয়েব পোর্টাল চালু করা হয়।',
    icon: HiComputerDesktop,
    iconColor: 'text-amber-400',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    nodeColor: 'from-amber-500 to-orange-600',
    glowColor: 'shadow-amber-500/30'
  },
  {
    step: '৫',
    year: 'লক্ষ্য',
    title: 'আদর্শ ও মূল্যবোধসম্পন্ন প্রজন্ম গড়ার প্রত্যয়',
    description: 'জ্ঞান, দক্ষতা, দেশপ্রেম ও নৈতিক মূল্যবোধে বলীয়ান হয়ে দেশের ভবিষ্যৎ নেতৃত্ব গড়ে তোলাই আমাদের প্রধান লক্ষ্য।',
    icon: HiFlag,
    iconColor: 'text-teal-400',
    badgeBg: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
    nodeColor: 'from-teal-500 to-emerald-600',
    glowColor: 'shadow-teal-500/30'
  },
  {
    step: '৬',
    year: 'সেবা',
    title: 'সামাজিক ও মানবিক কার্যক্রম',
    description: 'শীতবস্ত্র বিতরণ, ব্লাড ডোনার ক্লাব, বৃক্ষরোপণ এবং যেকোনো প্রাকৃতিক দুর্যোগে আর্তমানবতার সেবায় নিবেদিত অংশগ্রহণ।',
    icon: HiHeart,
    iconColor: 'text-rose-400',
    badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    nodeColor: 'from-rose-500 to-pink-600',
    glowColor: 'shadow-rose-500/30'
  },
];

const HistoryTimeline = () => {
  return (
    <section className="relative w-full px-3 sm:px-6 py-14 sm:py-20 bg-[#0c0e1e] text-white border-b border-white/[0.08] overflow-hidden">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute -left-40 top-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute -right-40 bottom-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl" />

      <div className="max-w-6xl mx-auto space-y-12 sm:space-y-16 relative z-10">
        
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-xs font-bold uppercase tracking-wider shadow-sm">
            <HiSparkles className="text-sm text-amber-400" />
            <span>ইতিহাস ও মাইলফলক</span>
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            আমাদের গৌরবময় <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400">যাত্রাপথ</span>
          </h2>

          <p className="text-xs sm:text-base text-slate-300 leading-relaxed font-medium">
            গত তিন দশকেরও বেশি সময় ধরে সিলেট অঞ্চলের শিক্ষার্থীদের পাশে আমাদের নিরবচ্ছিন্ন সেবা ও অগ্রযাত্রার ধারাবাহিক টাইমলাইন।
          </p>
        </div>

        {/* ===================================================================
            TIMELINE WRAPPER WITH CONNECTING GLOWING AXIS
            =================================================================== */}
        <div className="relative">
          
          {/* Central Vertical Connecting Track Line for Desktop / Left Line for Mobile */}
          <div className="absolute left-6 md:left-1/2 top-4 bottom-4 w-1 -translate-x-1/2 bg-gradient-to-b from-indigo-500 via-emerald-400 to-rose-500 rounded-full opacity-60 shadow-[0_0_15px_rgba(99,102,241,0.5)]" />

          <div className="space-y-8 sm:space-y-12">
            {milestones.map((item, idx) => {
              const Icon = item.icon;
              const isEven = idx % 2 === 0;

              return (
                <div
                  key={idx}
                  className={`relative flex items-center ${
                    isEven ? "md:flex-row-reverse" : "md:flex-row"
                  } flex-row`}
                >
                  
                  {/* =========================================================
                      CARD CONTAINER (Half width on desktop, full width on mobile)
                      ========================================================= */}
                  <div className="w-full md:w-1/2 pl-14 md:pl-0 md:px-8">
                    <div
                      className={`relative p-5 sm:p-7 rounded-2xl sm:rounded-3xl bg-[#14162b] border border-white/10 hover:border-indigo-400/40 shadow-2xl transition-all duration-300 hover:-translate-y-1 group overflow-hidden ${
                        isEven ? "md:text-left" : "md:text-left"
                      }`}
                    >
                      {/* Top Ambient Glow on Card */}
                      <div className="pointer-events-none absolute top-0 right-0 w-32 h-32 bg-white/[0.02] rounded-full blur-xl group-hover:bg-indigo-500/10 transition-colors" />

                      <div className="space-y-3 relative z-10">
                        {/* Header: Year Pill + Icon */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-0.5 rounded-full text-xs sm:text-sm font-black border tracking-wider font-bangla-number shadow-sm ${item.badgeBg}`}>
                              {item.year}
                            </span>
                            <span className="text-[11px] font-bold text-slate-400">
                              ধাপ {item.step}
                            </span>
                          </div>

                          <div className={`w-10 h-10 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-xl ${item.iconColor} group-hover:scale-110 group-hover:bg-white/[0.12] transition-all shadow-md`}>
                            <Icon />
                          </div>
                        </div>

                        {/* Title */}
                        <h3 className="text-base sm:text-xl font-bold text-white group-hover:text-indigo-300 transition-colors leading-snug">
                          {item.title}
                        </h3>

                        {/* Description */}
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                          {item.description}
                        </p>
                      </div>

                      {/* Desktop Triangular Pointer toward the Timeline Node */}
                      <div
                        className={`hidden md:block absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-[#14162b] border-t border-r border-white/10 rotate-45 ${
                          isEven
                            ? "-left-1.5 border-t-0 border-r-0 border-b border-l"
                            : "-right-1.5"
                        }`}
                      />
                    </div>
                  </div>

                  {/* =========================================================
                      CENTRAL TIMELINE CONNECTOR NODE (Pulsing Circle with Step)
                      ========================================================= */}
                  <div className="absolute left-6 md:left-1/2 -translate-x-1/2 flex flex-col items-center justify-center z-20">
                    <div
                      className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br ${item.nodeColor} text-white font-black text-xs sm:text-sm flex items-center justify-center border-4 border-[#0c0e1e] shadow-xl ${item.glowColor} font-bangla-number hover:scale-110 transition-transform`}
                    >
                      {item.step}
                    </div>
                  </div>

                  {/* Empty Spacer on opposite side for desktop symmetry */}
                  <div className="hidden md:block md:w-1/2" />
                </div>
              );
            })}
          </div>

          {/* Timeline Bottom Ending Arrow */}
          <div className="flex justify-center pt-8">
            <div className="w-10 h-10 rounded-full bg-gradient-to-b from-rose-500 to-pink-600 text-white flex items-center justify-center shadow-lg shadow-rose-500/20 animate-bounce">
              <HiArrowDown className="text-lg" />
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default HistoryTimeline;