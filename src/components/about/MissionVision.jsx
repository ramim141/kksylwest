import React from 'react';
import { HiRocketLaunch, HiEye, HiSparkles, HiCheckCircle } from 'react-icons/hi2';

const MissionVision = () => {
  return (
    <section className="relative w-full px-3 sm:px-6 py-12 sm:py-16 bg-[#0b1326] text-white border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto space-y-10 sm:space-y-14">

        {/* Section Header */}
        <div className="text-center space-y-2 sm:space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-xs font-bold uppercase tracking-wider">
            <HiSparkles className="text-sm text-indigo-400" />
            <span>আমাদের দর্শন</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            আমাদের <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400">মিশন ও ভিশন</span>
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
            শিক্ষা বিস্তার ও মেধা বিকাশের মাধ্যমে একটি সমৃদ্ধ ও আলোকিত সমাজ গড়ার অঙ্গীকার।
          </p>
        </div>

        {/* Mission & Vision Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          
          {/* Mission Card */}
          <div className="relative p-6 sm:p-8 rounded-3xl bg-[#0f1124] border border-emerald-500/30 hover:border-emerald-400/60 shadow-xl transition-all duration-300 space-y-5 overflow-hidden group">
            <div className="absolute -top-12 -right-12 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all pointer-events-none" />

            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-2xl shadow-md group-hover:scale-110 transition-transform">
              <HiRocketLaunch />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-black text-white">
                আমাদের মিশন (Mission)
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                সিলেট অঞ্চলের প্রতিটি মেধাবী শিক্ষার্থীকে তাদের প্রকৃত সম্ভাবনা উপলব্ধি করতে সাহায্য করা এবং নৈতিক শিক্ষার মাধ্যমে একটি আলোকিত সমাজ গড়ে তোলা।
              </p>
            </div>

            <ul className="space-y-2.5 pt-2 border-t border-white/[0.08]">
              {[
                "দেশের জন্য দক্ষ ও চরিত্রবান যোগ্য নাগরিক তৈরি করা।",
                "ছাত্র সমাজকে জ্ঞান, বিজ্ঞান ও নৈতিক মূল্যবোধে সমৃদ্ধ করা।",
                "শৃঙ্খলা, দেশপ্রেম ও সামাজিক কর্তব্যবোধে উজ্জীবিত করা।"
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                  <HiCheckCircle className="text-emerald-400 text-base shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Vision Card */}
          <div className="relative p-6 sm:p-8 rounded-3xl bg-[#0f1124] border border-sky-500/30 hover:border-sky-400/60 shadow-xl transition-all duration-300 space-y-5 overflow-hidden group">
            <div className="absolute -top-12 -right-12 w-44 h-44 bg-sky-500/10 rounded-full blur-3xl group-hover:bg-sky-500/20 transition-all pointer-events-none" />

            <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center text-2xl shadow-md group-hover:scale-110 transition-transform">
              <HiEye />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-black text-white">
                আমাদের ভিশন (Vision)
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                সিলেট অঞ্চলের সবচেয়ে বিশ্বস্ত ও কার্যকর শিক্ষাসেবা প্ল্যাটফর্ম হিসেবে প্রতিষ্ঠিত হওয়া এবং হাজার হাজার মেধাবী শিক্ষার্থীর ভবিষ্যৎ বিনির্মাণে অবদান রাখা।
              </p>
            </div>

            <ul className="space-y-2.5 pt-2 border-t border-white/[0.08]">
              {[
                "সুস্থ সংস্কৃতি ও শিক্ষা বিস্তারের শীর্ষ প্রতিষ্ঠান হিসেবে নেতৃত্ব দেওয়া।",
                "জাতীয় পর্যায়ে মানসম্মত একটি আদর্শ মেধাবৃত্তি মডেল প্রতিষ্ঠা করা।",
                "আর্থিকভাবে পিছিয়ে থাকা মেধাবী শিক্ষার্থীদের সার্বিক পৃষ্ঠপোষকতা প্রদান।"
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                  <HiCheckCircle className="text-sky-400 text-base shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

      </div>
    </section>
  );
};

export default MissionVision;
