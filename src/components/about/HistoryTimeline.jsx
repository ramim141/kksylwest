import React from 'react';
import { 
  HiRocketLaunch,
  HiAcademicCap,
  HiGlobeAlt,
  HiComputerDesktop,
  HiFlag,
  HiHeart,
  HiSparkles
} from 'react-icons/hi2';

const HistoryTimeline = () => {
  const milestones = [
    {
      year: '১৯৯৪',
      title: 'কিশোরকণ্ঠ পাঠক ফোরামের যাত্রা শুরু',
      description: 'সিলেটে সাহিত্য, সংস্কৃতি ও নৈতিক মূল্যবোধ চর্চার মহতী উদ্দেশ্য নিয়ে কিশোরকণ্ঠ পাঠক ফোরামের আনুষ্ঠানিক যাত্রা শুরু হয়।',
      icon: HiRocketLaunch,
      iconColor: 'text-indigo-400',
      badgeBg: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
    },
    {
      year: '২০০৫',
      title: 'মেধাবৃত্তি পরীক্ষার সূচনা',
      description: 'শিক্ষার্থীদের মেধা যাচাই ও পড়াশোনায় উদ্বুদ্ধ করতে প্রথমবারের মতো কিশোরকণ্ঠ মেধাবৃত্তি পরীক্ষার প্রবর্তন করা হয়।',
      icon: HiAcademicCap,
      iconColor: 'text-emerald-400',
      badgeBg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
    },
    {
      year: '২০১৪',
      title: '৮টি উপজেলায় পূর্ণাঙ্গ সম্প্রসারণ',
      description: 'সিলেট জেলা পশ্চিমের ৮টি উপজেলা (দক্ষিণ সুরমা, ফেঞ্চুগঞ্জ, বালাগঞ্জ, ওসমানীনগর, বিশ্বনাথ, সদর, কোম্পানীগঞ্জ ও নন্দীরগাঁও) ব্যাপী কার্যক্রমের বিস্তার।',
      icon: HiGlobeAlt,
      iconColor: 'text-sky-400',
      badgeBg: 'bg-sky-500/15 text-sky-300 border-sky-500/30'
    },
    {
      year: '২০২৩',
      title: 'ডিজিটাল অটোমেশন ও অনলাইন পোর্টাল',
      description: 'অনলাইন রেজিস্ট্রেশন, ডিজিটাল প্রবেশপত্র ডাউনলোড এবং দ্রুত ফলাফল প্রকাশের জন্য আধুনিক ওয়েব পোর্টাল চালু করা হয়।',
      icon: HiComputerDesktop,
      iconColor: 'text-amber-400',
      badgeBg: 'bg-amber-500/15 text-amber-300 border-amber-500/30'
    },
    {
      year: 'লক্ষ্য',
      title: 'আদর্শ ও মূল্যবোধসম্পন্ন প্রজন্ম গড়ার প্রত্যয়',
      description: 'জ্ঞান, দক্ষতা, দেশপ্রেম ও নৈতিক মূল্যবোধে বলীয়ান হয়ে দেশের ভবিষ্যৎ নেতৃত্ব গড়ে তোলাই আমাদের প্রধান লক্ষ্য।',
      icon: HiFlag,
      iconColor: 'text-teal-400',
      badgeBg: 'bg-teal-500/15 text-teal-300 border-teal-500/30'
    },
    {
      year: 'সেবা',
      title: 'সামাজিক ও মানবিক কার্যক্রম',
      description: 'শীতবস্ত্র বিতরণ, ব্লাড ডোনার ক্লাব, বৃক্ষরোপণ এবং যেকোনো প্রাকৃতিক দুর্যোগে আর্তমানবতার সেবায় নিবেদিত অংশগ্রহণ।',
      icon: HiHeart,
      iconColor: 'text-rose-400',
      badgeBg: 'bg-rose-500/15 text-rose-300 border-rose-500/30'
    },
  ];

  return (
    <section className="relative w-full px-3 sm:px-6 py-12 sm:py-16 bg-[#0f1124] text-white border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto space-y-10 sm:space-y-14">
        
        {/* Section Header */}
        <div className="text-center space-y-2 sm:space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-xs font-bold uppercase tracking-wider">
            <HiSparkles className="text-sm text-indigo-400" />
            <span>ইতিহাস ও মাইলফলক</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            আমাদের গৌরবময় <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400">যাত্রাপথ</span>
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
            গত তিন দশকেরও বেশি সময় ধরে সিলেট অঞ্চলের শিক্ষার্থীদের পাশে আমাদের নিরবচ্ছিন্ন সেবা ও অগ্রযাত্রা।
          </p>
        </div>

        {/* Timeline Grid (2-Column Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {milestones.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-5 sm:p-6 rounded-2xl bg-[#14162b] border border-white/10 hover:border-indigo-400/40 shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  {/* Badge & Icon */}
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-black border uppercase tracking-wider ${item.badgeBg}`}>
                      {item.year}
                    </span>
                    <div className={`w-10 h-10 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-xl ${item.iconColor} group-hover:scale-110 transition-transform`}>
                      <Icon />
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-black text-white group-hover:text-indigo-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
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

export default HistoryTimeline;