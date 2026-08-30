import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HiArrowLeft, 
  HiCalendarDays, 
  HiMapPin, 
  HiPhoto, 
  HiSparkles, 
  HiUsers,
  HiTag
} from 'react-icons/hi2';

const toBengaliNumber = (num) =>
  num?.toString().replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[d]) || "০";

const GalleryGridDetailsHero = ({ item }) => {
  const navigate = useNavigate();
  const images = Array.isArray(item.images) && item.images.length > 0 ? item.images : [item.image || ''];
  const coverImage = images[0] || item.image;
  const secondaryImage = images[1] || coverImage;
  const tertiaryImage = images[2] || coverImage;

  return (
    <section className="relative overflow-hidden bg-[#070913] text-white border-b border-white/[0.08]">
      {/* Background Ambience Cover Image */}
      {coverImage ? (
        <div className="absolute inset-0 z-0">
          <img
            src={coverImage}
            alt={item.title}
            className="w-full h-full object-cover opacity-20 blur-xl scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#070913]/90 via-[#0b1326]/95 to-[#0b1326]" />
        </div>
      ) : null}

      <div className="relative z-10 w-full px-4 pt-6 pb-10 sm:px-6 sm:pt-8 sm:pb-14 md:pt-10 md:pb-16 max-w-7xl mx-auto space-y-6">
        
        {/* Top Navigation & Breadcrumb */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate('/gallery')}
            className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-[#14162b]/80 px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-bold text-slate-200 backdrop-blur-md transition-all duration-300 hover:bg-indigo-600 hover:text-white hover:border-indigo-500 shadow-md cursor-pointer"
          >
            <HiArrowLeft className="h-4 w-4 shrink-0 transition-transform group-hover:-translate-x-1" />
            <span>গ্যালারিতে ফিরুন</span>
          </button>

          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <span className="cursor-pointer hover:text-indigo-300" onClick={() => navigate('/gallery')}>গ্যালারি</span>
            <span>/</span>
            <span className="text-emerald-400 font-semibold truncate max-w-[150px] sm:max-w-[240px]">{item.title}</span>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid items-center gap-6 sm:gap-8 lg:grid-cols-12 lg:gap-10">
          
          {/* Left Text & Info (7 cols on lg) */}
          <div className="space-y-4 sm:space-y-6 lg:col-span-7">
            
            <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-bold text-amber-300 backdrop-blur-md">
              <HiSparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>ইভেন্ট ফটো গ্যালারি</span>
            </div>

            <div className="space-y-2.5">
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                {item.title}
              </h1>
              {item.shortDescription && (
                <p className="text-xs sm:text-base text-slate-300 leading-relaxed max-w-2xl font-normal">
                  {item.shortDescription}
                </p>
              )}
            </div>

            {/* Quick Meta Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {item.date && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#14162b] border border-white/10 text-xs font-semibold text-slate-300 shadow-sm">
                  <HiCalendarDays className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{item.date}</span>
                </div>
              )}

              {item.location && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#14162b] border border-white/10 text-xs font-semibold text-slate-300 shadow-sm">
                  <HiMapPin className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{item.location}</span>
                </div>
              )}

              {item.attendees && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#14162b] border border-white/10 text-xs font-semibold text-slate-300 shadow-sm">
                  <HiUsers className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>{item.attendees}</span>
                </div>
              )}

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#14162b] border border-white/10 text-xs font-semibold text-slate-300 shadow-sm">
                <HiPhoto className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>{toBengaliNumber(images.length)} টি ছবি</span>
              </div>
            </div>

            {/* Tags on Desktop / Mobile */}
            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {item.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-lg bg-white/[0.05] border border-white/10 text-slate-300 hover:border-indigo-400/40 hover:text-white transition"
                  >
                    <HiTag className="w-3 h-3 text-indigo-400" />
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Right Preview Card / Collage (5 cols on lg) */}
          <div className="lg:col-span-5">
            {coverImage ? (
              <div className="relative mx-auto w-full max-w-md">
                {/* Visual Glow Layer */}
                <div className="absolute -inset-1.5 rounded-3xl bg-gradient-to-r from-indigo-500/30 to-emerald-500/20 blur-lg opacity-60" />
                
                {/* Main preview container */}
                <div className="relative aspect-[16/10] sm:aspect-[4/3] rounded-2xl sm:rounded-3xl overflow-hidden border border-white/15 bg-[#090a16] shadow-2xl group">
                  <img
                    src={coverImage}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  {/* Photo count pill */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs font-bold text-white px-3 py-2 rounded-xl bg-black/60 backdrop-blur-md border border-white/15">
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <HiPhoto className="text-base" />
                      <span>{toBengaliNumber(images.length)} টি ছবি অন্তর্ভুক্ত</span>
                    </span>
                    <span className="text-[11px] text-slate-300">অ্যালবাম ভিউয়ার</span>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

        </div>

      </div>
    </section>
  );
};

export default GalleryGridDetailsHero;
