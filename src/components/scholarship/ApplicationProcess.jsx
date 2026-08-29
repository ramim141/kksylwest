import React from 'react';
import { 
  HiDocumentText, 
  HiClipboardDocumentList, 
  HiCreditCard, 
  HiTicket,
  HiSparkles,
  HiCheckCircle
} from 'react-icons/hi2';

const APPLICATION_PROCESS = [
  { 
    step: '০১', 
    label: 'অনলাইন রেজিস্ট্রেশন', 
    value: 'ওয়েবসাইটে ঢুকে শিক্ষার্থীর সঠিক তথ্য দিয়ে অনলাইন ফর্ম পূরণ করুন।',
    icon: HiDocumentText,
    iconBg: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
  },
  { 
    step: '০২', 
    label: 'ফি পরিশোধ ও নিশ্চিতকরণ', 
    value: 'মোবাইল ব্যাংকিং (বিকাশ/নগদ/রকেট)-এর মাধ্যমে নির্ধারিত ফি পরিশোধ করুন।',
    icon: HiCreditCard,
    iconBg: 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
  },
  { 
    step: '০৩', 
    label: 'প্রবেশপত্র ডাউনলোড', 
    value: 'আবেদন সফল হলে রোল বা মোবাইল নম্বর দিয়ে ডিজিটাল এডমিট কার্ড প্রিন্ট নিন।',
    icon: HiTicket,
    iconBg: 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
  },
  { 
    step: '০৪', 
    label: 'পরীক্ষায় অংশগ্রহণ', 
    value: 'এডমিট কার্ডে উল্লেখিত কেন্দ্রে সঠিক সময়ে উপস্থিত হয়ে পরীক্ষায় অংশগ্রহণ করুন।',
    icon: HiClipboardDocumentList,
    iconBg: 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
  }
];

const ApplicationProcess = () => {
  return (
    <section className="relative w-full px-3 sm:px-6 py-12 sm:py-16 bg-[#0b1326] text-white border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto space-y-10 sm:space-y-12">
        
        {/* Section Header */}
        <div className="text-center space-y-2 sm:space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-xs font-bold uppercase tracking-wider">
            <HiSparkles className="text-sm text-indigo-400" />
            <span>ধাপে ধাপে গাইড</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            সহজ ৪ ধাপে <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400">আবেদন প্রক্রিয়া</span>
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
            ঘরে বসেই অনলাইনের মাধ্যমে আপনার আবেদন ও প্রবেশপত্র সংগ্রহের সম্পূর্ণ প্রক্রিয়া।
          </p>
        </div>

        {/* 4 Process Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {APPLICATION_PROCESS.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="relative p-6 rounded-3xl bg-[#0f1124] border border-white/10 hover:border-indigo-400/40 shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between space-y-4 group"
              >
                {/* Step Pill */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black font-sans text-indigo-400 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30">
                    ধাপ {item.step}
                  </span>
                  <div className={`w-10 h-10 rounded-xl ${item.iconBg} flex items-center justify-center text-xl group-hover:scale-110 transition-transform shadow-md`}>
                    <Icon />
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {item.label}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {item.value}
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

export default ApplicationProcess;