import React, { useState, useEffect } from 'react';
import {
  HiArrowDown,
  HiCalendarDays,
  HiPhoto,
  HiPlayCircle,
  HiSparkles,
  HiUsers,
} from 'react-icons/hi2';
import { getGalleryHeroContent } from '../../services/firestore';
import galleryImg1 from '../../assets/images/gallery/1000288989.jpg.jpeg';
import galleryImg2 from '../../assets/images/gallery/1000288990.jpg.jpeg';
import galleryImg3 from '../../assets/images/gallery/1000288991.jpg.jpeg';
import galleryImg4 from '../../assets/images/gallery/1000288992.jpg.jpeg';

export const DEFAULT_GALLERY_HERO_DATA = {
  badge: 'স্মৃতির গ্যালারি',
  headingLine1: 'আমাদের গর্বের',
  headingLine2: 'মুহূর্তগুলো',
  subheading:
    'কিশোরকণ্ঠ মেধাবৃত্তির আয়োজন, শিক্ষার্থীদের সাফল্য এবং অনুপ্রেরণার বিশেষ মুহূর্তগুলো এক জায়গায় দেখুন।',
  sinceYear: '১৯৯৪',
  stat1Value: '১০০+',
  stat1Label: 'ছবি ও মুহূর্ত',
  stat2Value: '২০+',
  stat2Label: 'বার্ষিক আয়োজন',
  stat3Value: '৩৬,০০০+',
  stat3Label: 'অংশগ্রহণকারী',
  image1Url: galleryImg1,
  image2Url: galleryImg2,
  image3Url: galleryImg3,
  image4Url: galleryImg4,
};

const GalleryHero = () => {
  const [heroData, setHeroData] = useState(DEFAULT_GALLERY_HERO_DATA);

  useEffect(() => {
    getGalleryHeroContent().then((data) => {
      if (data) {
        setHeroData((prev) => ({
          ...prev,
          ...data,
          image1Url: data.image1Url || prev.image1Url || galleryImg1,
          image2Url: data.image2Url || prev.image2Url || galleryImg2,
          image3Url: data.image3Url || prev.image3Url || galleryImg3,
          image4Url: data.image4Url || prev.image4Url || galleryImg4,
        }));
      }
    });
  }, []);

  const scrollToGallery = () => {
    const gallerySection = document.querySelector('[data-gallery-grid]');
    if (gallerySection) {
      gallerySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const openDocumentaryGallery = () => {
    window.dispatchEvent(new CustomEvent('gallery:set-tab', { detail: 'documentary' }));
    scrollToGallery();
  };

  const img1 = heroData.image1Url || galleryImg1;
  const img2 = heroData.image2Url || galleryImg2;
  const img3 = heroData.image3Url || galleryImg3;

  const heroStats = [
    {
      id: 1,
      icon: HiPhoto,
      value: heroData.stat1Value || '১০০+',
      label: heroData.stat1Label || 'ছবি ও মুহূর্ত',
      iconBg: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    },
    {
      id: 2,
      icon: HiCalendarDays,
      value: heroData.stat2Value || '২০+',
      label: heroData.stat2Label || 'বার্ষিক আয়োজন',
      iconBg: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
    },
    {
      id: 3,
      icon: HiUsers,
      value: heroData.stat3Value || '৩৬,০০০+',
      label: heroData.stat3Label || 'অংশগ্রহণকারী',
      iconBg: 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30',
    },
  ];

  return (
    <section className="relative w-full px-3 sm:px-6 pt-14 sm:pt-20 pb-12 sm:pb-16 bg-[#0b1326] text-white border-b border-white/[0.08] overflow-hidden">
      {/* Glowing Ambient Orbs */}
      <div className="pointer-events-none absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
          
          {/* Left Column: Content & Stats */}
          <div className="lg:col-span-7 space-y-5 sm:space-y-6 text-center lg:text-left">
            
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-sm">
              <HiSparkles className="text-amber-400 text-sm" />
              <span>{heroData.badge || 'স্মৃতির গ্যালারি'}</span>
            </div>

            {/* Massive Heading */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
              {heroData.headingLine1 || 'আমাদের গর্বের'}{' '}
              <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400">
                {heroData.headingLine2 || 'মুহূর্তগুলো'}
              </span>
            </h1>

            {/* Subheading */}
            <p className="mx-auto lg:mx-0 max-w-xl text-xs sm:text-base text-slate-300 leading-relaxed font-normal">
              {heroData.subheading ||
                'কিশোরকণ্ঠ মেধাবৃত্তির আয়োজন, শিক্ষার্থীদের সাফল্য এবং অনুপ্রেরণার বিশেষ মুহূর্তগুলো এক জায়গায় দেখুন।'}
            </p>

            {/* 3 Metric Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {heroStats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.id}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0f1124] p-3 sm:p-3.5 text-left backdrop-blur-md shadow-lg"
                  >
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${stat.iconBg} text-xl shadow-sm`}>
                      <Icon />
                    </div>
                    <div className="min-w-0">
                      <p className="text-base sm:text-lg font-black text-white leading-none font-mono">{stat.value}</p>
                      <p className="mt-1 text-[11px] font-semibold text-slate-400 truncate">{stat.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-3">
              <button
                type="button"
                onClick={scrollToGallery}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-indigo-600 hover:bg-indigo-500 px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
              >
                <span>ফটো গ্যালারি দেখুন</span>
                <HiArrowDown className="text-base" />
              </button>

              <button
                type="button"
                onClick={openDocumentaryGallery}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.08] hover:bg-white/[0.15] px-6 py-3 text-xs sm:text-sm font-bold text-white backdrop-blur-md transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
              >
                <HiPlayCircle className="text-lg text-emerald-400" />
                <span>ডকুমেন্টারি ও ভিডিও</span>
              </button>
            </div>

          </div>

          {/* Right Column: Multi-Photo Collage Frame */}
          <div className="lg:col-span-5 relative mx-auto h-[320px] sm:h-[400px] w-full max-w-[460px]">
            <div className="absolute inset-2 rounded-3xl border border-white/10 bg-[#0f1124]/60 backdrop-blur-md shadow-2xl" />

            {/* Main Top Right Photo */}
            <div className="absolute right-0 top-0 w-[68%] overflow-hidden rounded-2xl border-2 border-white/20 shadow-2xl z-10 group hover:scale-105 transition-transform duration-300">
              <img
                src={img1}
                alt="গ্যালারি দৃশ্য ১"
                className="aspect-[4/3] h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
            </div>

            {/* Left Staggered Photo */}
            <div className="absolute left-0 top-10 w-[56%] overflow-hidden rounded-2xl border-2 border-white/20 shadow-2xl z-20 group hover:scale-105 transition-transform duration-300">
              <img
                src={img2}
                alt="গ্যালারি দৃশ্য ২"
                className="aspect-[4/5] h-full w-full object-cover"
              />
            </div>

            {/* Bottom Right Photo */}
            <div className="absolute bottom-0 right-4 w-[52%] overflow-hidden rounded-2xl border-2 border-white/20 shadow-2xl z-20 group hover:scale-105 transition-transform duration-300">
              <img
                src={img3}
                alt="গ্যালারি দৃশ্য ৩"
                className="aspect-[4/3] h-full w-full object-cover"
              />
            </div>

            {/* Since Badge */}
            <div className="absolute right-2 top-28 sm:top-36 rounded-xl border border-indigo-400/40 bg-[#14162b]/95 px-3 py-2 text-white shadow-2xl backdrop-blur-md z-30">
              <p className="text-[9px] font-bold uppercase tracking-wider text-indigo-300">ঐতিহ্য</p>
              <p className="text-base sm:text-lg font-black text-white font-mono">{heroData.sinceYear || '১৯৯৪'}</p>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

export default GalleryHero;
