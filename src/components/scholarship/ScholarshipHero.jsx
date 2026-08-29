import React from 'react';
import { 
  HiSparkles, 
  HiAcademicCap, 
  HiBookOpen, 
  HiUserGroup, 
  HiTrophy,
  HiCheckBadge,
  HiClock,
  HiDocumentText,
  HiStar,
  HiGift,
} from 'react-icons/hi2';

const SCHOLARSHIP_INFO = {
  examDetails: [
    { label: 'পরীক্ষার ধরন', value: 'লিখিত পরীক্ষা (বহুনির্বাচনী ও সংক্ষিপ্ত)', icon: HiDocumentText },
    { label: 'বিষয়সমূহ', value: 'বাংলা, ইংরেজি, গণিত ও সাধারণ জ্ঞান', icon: HiBookOpen },
    { label: 'মোট নম্বর', value: '১০০ নম্বর (প্রতি বিষয়ে ২৫ নম্বর)', icon: HiStar },
    { label: 'পরীক্ষার সময়', value: '১ ঘণ্টা ৩০ মিনিট', icon: HiClock }
  ],
  eligibility: [
    { label: 'শ্রেণি স্তর', value: '৪র্থ থেকে ১০ম শ্রেণির সকল শিক্ষার্থী', icon: HiAcademicCap },
    { label: 'অঞ্চল', value: 'সিলেট জেলা পশ্চিম ও এর ৮টি উপজেলা', icon: HiUserGroup },
    { label: 'প্রতিষ্ঠান', value: 'যেকোনো স্বীকৃত স্কুল ও মাদ্রাসার শিক্ষার্থী', icon: HiCheckBadge },
    { label: 'প্রবেশপত্র', value: 'অনলাইন থেকে সংগৃহীত এডমিট কার্ড বাধ্যতামূলক', icon: HiDocumentText }
  ],
  rewards: [
    { label: 'ট্যালেন্টপুল বৃত্তি', value: 'এককালীন নগদ অর্থ, বিশেষ ক্রেস্ট ও সনদ', icon: HiTrophy },
    { label: 'সাধারণ বৃত্তি', value: 'নগদ শিক্ষাবৃত্তি, সম্মাননা ক্রেস্ট ও সনদপত্র', icon: HiCheckBadge },
    { label: 'শিক্ষা সামগ্রী', value: 'বই, ম্যাগাজিন ও আকর্ষণীয় উপহার সামগ্রী', icon: HiGift },
    { label: 'সংবর্ধনা অনুষ্ঠান', value: 'অভিভাবকসহ জমকালো পুরস্কার বিতরণী আয়োজন', icon: HiStar }
  ]
};

const CARD_CONFIGS = [
  {
    key: 'examDetails',
    icon: HiBookOpen,
    title: 'পরীক্ষার পূর্ণাঙ্গ তথ্য',
    borderColor: 'border-emerald-500/30 hover:border-emerald-400/60',
    iconBg: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  },
  {
    key: 'eligibility',
    icon: HiUserGroup,
    title: 'অংশগ্রহণের যোগ্যতা',
    borderColor: 'border-sky-500/30 hover:border-sky-400/60',
    iconBg: 'bg-sky-500/15 text-sky-400 border border-sky-500/30',
  },
  {
    key: 'rewards',
    icon: HiTrophy,
    title: 'পুরস্কার ও সম্মাননা',
    borderColor: 'border-amber-500/30 hover:border-amber-400/60',
    iconBg: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
  }
];

const ScholarshipHero = () => {
  return (
    <section className="relative w-full px-3 sm:px-6 pt-14 sm:pt-20 pb-12 sm:pb-16 bg-[#0f1124] text-white border-b border-white/[0.08] overflow-hidden">
      {/* Glowing Ambient Background */}
      <div className="pointer-events-none absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto space-y-10 sm:space-y-12 relative z-10">
        
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-xs font-extrabold backdrop-blur-md">
            <HiSparkles className="text-amber-400 text-sm" />
            <span>মেধাবৃত্তি গাইডলাইন • Exam Details</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            কিশোরকণ্ঠ মেধাবৃত্তি <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400">
              পরীক্ষার সার্বিক তথ্য
            </span>
          </h1>

          <p className="text-xs sm:text-base text-slate-300 leading-relaxed font-normal">
            মেধাবৃত্তি পরীক্ষার নিয়মাবলি, মান বণ্টন, প্রয়োজনীয় যোগ্যতা এবং আকর্ষণীয় পুরস্কার সংক্রান্ত সকল জরুরি তথ্য।
          </p>
        </div>

        {/* 3 Main Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CARD_CONFIGS.map((config) => {
            const Icon = config.icon;
            const items = SCHOLARSHIP_INFO[config.key];
            return (
              <div
                key={config.key}
                className={`p-6 sm:p-7 rounded-3xl bg-[#14162b] border ${config.borderColor} shadow-2xl transition-all duration-300 hover:-translate-y-1 space-y-5 flex flex-col justify-between group`}
              >
                <div className="space-y-4">
                  {/* Top Icon and Title */}
                  <div className="flex items-center gap-3 border-b border-white/[0.08] pb-4">
                    <div className={`w-12 h-12 rounded-2xl ${config.iconBg} flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-md`}>
                      <Icon />
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-white">
                      {config.title}
                    </h3>
                  </div>

                  {/* List of Details */}
                  <div className="space-y-3">
                    {items.map((item, idx) => {
                      const ItemIcon = item.icon;
                      return (
                        <div key={idx} className="flex items-start gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                          <ItemIcon className="text-base text-slate-400 shrink-0 mt-0.5" />
                          <div className="space-y-0.5 min-w-0">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                              {item.label}
                            </span>
                            <span className="text-xs sm:text-sm font-semibold text-slate-200 block">
                              {item.value}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default ScholarshipHero;