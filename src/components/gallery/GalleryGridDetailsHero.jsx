import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HiArrowLeft, HiCalendarDays, HiMapPin, HiPhoto, HiSparkles, HiUsers } from 'react-icons/hi2';

// ----------------------------------------------------------------------
// CONFIGURATION (Update UI labels here anytime)
// ----------------------------------------------------------------------
const heroConfig = {
  backButtonText: "গ্যালারিতে ফিরুন",
  breadcrumbRoot: "গ্যালারি",
  labels: {
    date: "তারিখ",
    location: "অবস্থান",
    attendees: "অংশগ্রহণকারী"
  }
};
// ----------------------------------------------------------------------

const GalleryGridDetailsHero = ({ item }) => {
  const navigate = useNavigate();
  const coverImage = item.images?.[0] || item.image;
  const secondaryImage = item.images?.[1] || coverImage;
  const tertiaryImage = item.images?.[2] || coverImage;

  return (
    <section className="relative overflow-hidden bg-surface-card text-white">
      {coverImage ? (
        <img
          src={coverImage}
          alt={item.title}
          className="absolute inset-0 w-full h-full object-cover opacity-35"
        />
      ) : null}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,31,27,0.98)_0%,rgba(7,31,27,0.86)_45%,rgba(7,31,27,0.38)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-surface-card to-transparent" />

      {/* Content */}
      <div className="relative z-10 px-4 pt-6 pb-12 sm:px-6 sm:pt-8 sm:pb-16 md:pt-10 md:pb-20">
        <div className="container mx-auto max-w-7xl">
          {/* Back button */}
          <button
            onClick={() => navigate('/gallery')}
            className="group mb-6 inline-flex max-w-full items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-white backdrop-blur-md transition-all duration-300 hover:bg-surface-card hover:text-primary sm:mb-8 sm:px-5"
          >
            <HiArrowLeft className="h-5 w-5 flex-shrink-0 transition-transform group-hover:-translate-x-1" />
            <span className="truncate text-sm font-semibold">{heroConfig.backButtonText}</span>
          </button>

          {/* Main section */}
          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_470px] lg:gap-10">
            <div className="min-w-0 space-y-5 sm:space-y-6">
              {/* Breadcrumb */}
              <div className="flex min-w-0 items-center gap-2 text-sm font-medium text-primary-100/85">
                <span className="flex-shrink-0">{heroConfig.breadcrumbRoot}</span>
                <span className="text-primary-300/70">/</span>
                <span className="truncate font-semibold text-white">{item.title}</span>
              </div>

              {/* Title with Gradient */}
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/15 px-3 py-2 text-xs font-bold uppercase tracking-wider text-primary-50 sm:mb-5 sm:px-4">
                  <HiSparkles className="w-4 h-4 text-secondary" />
                  Featured Gallery
                </div>
                <h1 className="mb-4 max-w-4xl break-words text-3xl font-extrabold leading-tight sm:mb-5 sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
                  {item.title}
                </h1>
                <p className="max-w-2xl text-sm leading-relaxed text-primary-50/85 sm:text-base md:text-lg lg:text-xl">
                  {item.shortDescription}
                </p>
              </div>

              {/* Quick Info Cards */}
              <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2 lg:grid-cols-3">
                {/* Date Card */}
                <div className="rounded-lg border border-white/15 bg-white/10 p-3 backdrop-blur-md transition-all duration-300 hover:bg-white/15 sm:p-4">
                  <p className="mb-2 text-xs font-semibold tracking-wider text-primary-100/75 uppercase">{heroConfig.labels.date}</p>
                  <div className="flex items-center gap-2">
                    <HiCalendarDays className="w-5 h-5 text-secondary" />
                    <p className="text-base font-bold text-white">{item.date}</p>
                  </div>
                </div>

                {/* Location Card */}
                <div className="rounded-lg border border-white/15 bg-white/10 p-3 backdrop-blur-md transition-all duration-300 hover:bg-white/15 sm:p-4">
                  <p className="mb-2 text-xs font-semibold tracking-wider text-primary-100/75 uppercase">{heroConfig.labels.location}</p>
                  <div className="flex items-center gap-2">
                    <HiMapPin className="w-5 h-5 text-tertiary" />
                    <p className="text-base font-bold text-white truncate">{item.location}</p>
                  </div>
                </div>

                {/* Attendees Card */}
                <div className="rounded-lg border border-white/15 bg-white/10 p-3 backdrop-blur-md transition-all duration-300 hover:bg-white/15 sm:col-span-2 sm:p-4 lg:col-span-1">
                  <p className="mb-2 text-xs font-semibold tracking-wider text-primary-100/75 uppercase">{heroConfig.labels.attendees}</p>
                  <div className="flex items-center gap-2">
                    <HiUsers className="w-5 h-5 text-tertiary" />
                    <p className="text-base font-bold text-white">{item.attendees}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Image Collage */}
            <div className="hidden md:block">
              {coverImage ? (
                <div className="relative mx-auto aspect-[5/4] w-full max-w-[390px] lg:max-w-[470px] xl:ml-auto">
                  <div className="absolute inset-0 translate-x-5 translate-y-5 rounded-[2rem] border border-white/20 bg-white/10" />
                  <div className="absolute left-0 top-8 w-[54%] aspect-[4/5] overflow-hidden rounded-[1.5rem] border-4 border-white/90 shadow-overlay -rotate-3">
                    <img src={secondaryImage} alt={`${item.title} preview`} className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute right-0 top-0 w-[68%] aspect-[4/3] overflow-hidden rounded-[1.75rem] border-4 border-white shadow-overlay rotate-2">
                    <img src={coverImage} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute bottom-0 right-10 w-[50%] aspect-[4/3] overflow-hidden rounded-[1.5rem] border-4 border-white shadow-overlay">
                    <img src={tertiaryImage} alt={`${item.title} moment`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary-900/45 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs font-bold text-white">
                      <span>{item.images?.length || 1} Photos</span>
                      <HiPhoto className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative flex items-center justify-center w-full h-full min-h-[300px]">
                  <HiPhoto className="w-32 h-32 text-white/30" />
                </div>
              )}
            </div>
          </div>

          {/* Bottom Tags */}
          <div className="mt-8 flex flex-wrap gap-2 border-t border-white/10 pt-6 sm:mt-12 sm:pt-8">
            {item.tags && item.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-4 py-2 text-xs font-semibold transition-all duration-300 border rounded-full cursor-pointer bg-white/10 backdrop-blur-md border-white/15 text-white hover:bg-surface-card hover:text-primary"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default GalleryGridDetailsHero;
