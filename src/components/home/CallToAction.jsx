import React from 'react';
import { Link } from 'react-router-dom';
import { HiPencilSquare, HiAcademicCap, HiSparkles } from 'react-icons/hi2';
import { useExamYear } from '../../context/ExamYearContext';

const CallToAction = () => {
  const examYear = useExamYear();
  return (
    <section className="section bg-surface py-12 sm:py-16 w-full px-3 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl border border-emerald-500/30 bg-gradient-to-br from-[#0c241c] via-[#0f3427] to-[#091a14] p-6 sm:p-12 text-center text-white">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />
          
          {/* Ambient Glow & Grid Background */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="cta-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M0 30L30 0H15L0 15M30 30V15L15 30" stroke="white" strokeWidth="1.5" fill="none"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#cta-grid)" />
            </svg>
          </div>

          <div className="relative z-10 max-w-3xl mx-auto space-y-4 sm:space-y-6">
            
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-400/30 text-xs font-bold uppercase tracking-wider text-emerald-200">
              <HiSparkles className="text-amber-400 text-sm" />
              <span>নিবন্ধন সেশন {examYear}</span>
            </div>

            {/* Main Headline */}
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              মেধাবৃত্তি {examYear} রেজিস্ট্রেশন
            </h2>

            {/* Description */}
            <p className="text-xs sm:text-base text-emerald-100/90 leading-relaxed font-medium max-w-2xl mx-auto px-2">
              আমাদের বার্ষিক মেধা বৃত্তি কার্যক্রম শুরু হয়েছে। আগ্রহী শিক্ষার্থীদের জন্য অনলাইন নিবন্ধন খোলা রয়েছে। 
              আজই আপনার সন্তানের উজ্জ্বল ভবিষ্যতের জন্য রেজিস্ট্রেশন করুন।
            </p>

            {/* Action Buttons with 100% Crisp Contrast */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link 
                to="/register"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-base hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2"
              >
                <HiPencilSquare className="text-base sm:text-lg text-slate-950" />
                <span className="text-slate-950 font-black">অনলাইন রেজিস্ট্রেশন করুন</span>
              </Link>
              
              <Link 
                to="/scholarship"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-base backdrop-blur-md hover:scale-105 active:scale-95 transition-all cursor-pointer border border-white/20 shadow-md flex items-center justify-center gap-2"
              >
                <HiAcademicCap className="text-base sm:text-lg text-emerald-300" />
                <span>বৃত্তি সম্পর্কে জানুন</span>
              </Link>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;