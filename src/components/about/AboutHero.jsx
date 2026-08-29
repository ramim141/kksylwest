import React, { useState, useEffect } from 'react';
import { 
  HiSparkles, 
  HiTrophy, 
  HiUserGroup, 
  HiCalendarDays, 
  HiShieldCheck,
  HiAcademicCap,
  HiStar,
  HiHeart,
  HiLightBulb
} from 'react-icons/hi2';
import { getImpactStats, DEFAULT_IMPACT_STATS } from '../../services/firestore';

const ICON_MAP = {
  trophy: HiTrophy,
  users: HiUserGroup,
  calendar: HiCalendarDays,
  shield: HiShieldCheck,
  academic: HiAcademicCap,
  star: HiStar,
  heart: HiHeart,
  lightbulb: HiLightBulb,
};

const COLOR_MAP = {
  emerald: {
    iconBg: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    numColor: 'text-emerald-400',
  },
  sky: {
    iconBg: 'bg-sky-500/15 text-sky-400 border border-sky-500/30',
    numColor: 'text-sky-400',
  },
  amber: {
    iconBg: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
    numColor: 'text-amber-400',
  },
  indigo: {
    iconBg: 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30',
    numColor: 'text-indigo-400',
  },
  purple: {
    iconBg: 'bg-purple-500/15 text-purple-400 border border-purple-500/30',
    numColor: 'text-purple-400',
  },
  rose: {
    iconBg: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
    numColor: 'text-rose-400',
  },
  teal: {
    iconBg: 'bg-teal-500/15 text-teal-400 border border-teal-500/30',
    numColor: 'text-teal-400',
  }
};

const AboutHero = () => {
  const [stats, setStats] = useState(DEFAULT_IMPACT_STATS);

  useEffect(() => {
    getImpactStats().then((data) => {
      if (data && data.length > 0) {
        setStats(data);
      }
    });
  }, []);

  return (
    <section className="relative w-full px-3 sm:px-6 pt-16 sm:pt-24 pb-12 sm:pb-16 bg-[#0b1326] text-white overflow-hidden border-b border-white/[0.08]">
      {/* Decorative Background Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 -top-24 -left-24 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute w-96 h-96 -bottom-24 -right-24 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10 space-y-8 sm:space-y-12">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-xs font-bold uppercase tracking-wider shadow-sm">
            <HiSparkles className="text-sm text-indigo-400" />
            <span>আমাদের পরিচয় ও ঐতিহ্য</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight">
            কিশোরকণ্ঠ পাঠক ফোরাম <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400">
              সিলেট জেলা পশ্চিম
            </span>
          </h1>

          {/* Description */}
          <p className="text-sm sm:text-base lg:text-lg text-slate-300 leading-relaxed font-normal">
            সিলেট অঞ্চলের শিক্ষার্থীদের মেধা অন্বেষণ, চারিত্রিক উৎকর্ষ সাধন এবং সুস্থ সংস্কৃতির বিকাশে ১৯৯৪ সাল থেকে নিরলসভাবে পরিচালিত একটি আদর্শ ও ঐতিহ্যবাহী শিক্ষাসেবা সংগঠন।
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 pt-4">
          {stats.map((stat, idx) => {
            const Icon = ICON_MAP[stat.iconType] || HiTrophy;
            const colorTheme = COLOR_MAP[stat.color] || COLOR_MAP.emerald;

            return (
              <div
                key={stat.id || idx}
                className="p-4 sm:p-6 rounded-2xl bg-[#0f1124] border border-white/10 hover:border-indigo-400/40 shadow-xl hover:-translate-y-1 transition-all duration-300 text-center space-y-2 group"
              >
                <div className={`w-10 h-10 sm:w-12 sm:h-12 mx-auto rounded-xl ${colorTheme.iconBg} flex items-center justify-center text-xl sm:text-2xl group-hover:scale-110 transition-transform`}>
                  <Icon />
                </div>
                <div className={`text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight ${colorTheme.numColor}`}>
                  {stat.number}
                </div>
                <p className="text-xs sm:text-sm text-slate-400 font-medium">
                  {stat.label}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default AboutHero;