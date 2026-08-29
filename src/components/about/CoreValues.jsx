import React from 'react';
import { 
  HiHeart, 
  HiLightBulb, 
  HiUserGroup, 
  HiShieldCheck,
  HiSparkles,
  HiAcademicCap
} from 'react-icons/hi2';

const CORE_VALUES = [
  {
    id: 1,
    title: 'সততা ও স্বচ্ছতা',
    description: 'পরীক্ষার প্রতিটি ধাপে শতভাগ নিরপেক্ষতা ও জবাবদিহিতা নিশ্চিতকরণ।',
    icon: HiShieldCheck,
    iconBg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
  },
  {
    id: 2,
    title: 'মেধার মূল্যায়ন',
    description: 'যোগ্য ও প্রতিভাবান শিক্ষার্থীদের মেধা অন্বেষণ ও তাদের উৎসাহ প্রদান।',
    icon: HiAcademicCap,
    iconBg: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30'
  },
  {
    id: 3,
    title: 'নৈতিক মূল্যবোধ',
    description: 'কেবল পুথিগত জ্ঞান নয়, বরং চরিত্র গঠন ও মানবিক মূল্যবোধ সৃষ্টি।',
    icon: HiHeart,
    iconBg: 'bg-rose-500/15 text-rose-400 border-rose-500/30'
  },
  {
    id: 4,
    title: 'উৎকর্ষতা ও সৃজনশীলতা',
    description: 'আধুনিক প্রযুক্তির সমন্বয়ে সেবার মান ক্রমাগত উন্নত করা।',
    icon: HiLightBulb,
    iconBg: 'bg-amber-500/15 text-amber-400 border-amber-500/30'
  },
  {
    id: 5,
    title: 'সমতা ও সহযোগিতা',
    description: 'সকল শিক্ষার্থীর জন্য উন্মুক্ত ও বৈষম্যহীন সমান সুযোগ তৈরি।',
    icon: HiUserGroup,
    iconBg: 'bg-teal-500/15 text-teal-400 border-teal-500/30'
  }
];

const CoreValues = () => {
  return (
    <section className="relative w-full px-3 sm:px-6 py-12 sm:py-16 bg-[#0f1124] text-white border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto space-y-10 sm:space-y-14">

        {/* Section Header */}
        <div className="text-center space-y-2 sm:space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-xs font-bold uppercase tracking-wider">
            <HiSparkles className="text-sm text-indigo-400" />
            <span>আমাদের মূলনীতি</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            কিশোরকণ্ঠের <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400">মৌলিক মূল্যবোধ</span>
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
            যে সুদৃঢ় আদর্শ ও মূল্যবোধের ওপর ভিত্তি করে আমাদের প্রতিটি কার্যক্রম পরিচালিত হয়।
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {CORE_VALUES.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-[#14162b] border border-white/10 hover:border-indigo-400/40 shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between space-y-3 group text-center"
              >
                <div className={`w-12 h-12 mx-auto rounded-2xl ${item.iconBg} border flex items-center justify-center text-2xl group-hover:scale-110 transition-transform`}>
                  <Icon />
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-black text-white group-hover:text-indigo-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default CoreValues;