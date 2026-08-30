import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  HiArrowLeft,
  HiCalendarDays,
  HiDocumentText,
  HiMapPin,
  HiOutlineShare,
  HiPhoto,
  HiPlayCircle,
  HiSparkles,
  HiTag,
  HiUsers,
  HiVideoCamera,
  HiCheckCircle,
} from 'react-icons/hi2';
import { galleryData } from './galleryData';
import { documentaryDetailsData } from './documentaryDetailsData';
import { getGalleryItems } from '../../services/firestore';

const getDocumentaryCard = (id) =>
  galleryData.documentary?.find((documentary) => String(documentary.id) === String(id));

const getRelatedDocumentaries = (id) =>
  galleryData.documentary?.filter((documentary) => String(documentary.id) !== String(id)) ?? [];

const getAutoplayVideoUrl = (videoUrl = '') => {
  if (!videoUrl) return '';
  const separator = videoUrl.includes('?') ? '&' : '?';
  return `${videoUrl}${separator}autoplay=1&rel=0`;
};

const GalleryDocumentaryDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(() => documentaryDetailsData[Number(id)] || documentaryDetailsData[id]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const documentaryCard = getDocumentaryCard(id);
  const relatedDocumentaries = getRelatedDocumentaries(id);

  useEffect(() => {
    window.scrollTo(0, 0);
    setIsPlaying(false);
    if (!item) {
      getGalleryItems('documentary').then((list) => {
        const found = list?.find((x) => String(x.id) === String(id));
        if (found) {
          setItem({
            id: found.id,
            title: found.title,
            date: found.date,
            location: 'সিলেট',
            tag: 'ডকুমেন্টারি',
            shortDescription: found.description,
            fullDescription: found.description,
            attendees: found.attendees || '৫০০+ শিক্ষার্থী',
            videoUrl: found.videoUrl || 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            images: [found.imageUrl || found.thumbUrl].filter(Boolean),
            highlights: ['অনুষ্ঠানের দৃশ্যমালা', 'শিক্ষার্থীদের অনুভূতি ও সাক্ষাৎকার'],
            tags: ['ডকুমেন্টারি', 'মেধাবৃত্তি', 'ভিডিও'],
            relatedDocumentaries: [],
          });
        }
      });
    }
  }, [id, item]);

  if (!item) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b1326] text-white px-4">
        <div className="space-y-6 text-center max-w-md">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-3xl">
            <HiVideoCamera />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">ডকুমেন্টারি পাওয়া যায়নি</h1>
          <p className="text-xs sm:text-sm text-slate-400">অনুরোধকৃত ডকুমেন্টারি ভিডিওটি খুঁজে পাওয়া যায়নি।</p>
          <button
            onClick={() => navigate('/gallery')}
            className="rounded-full bg-indigo-600 hover:bg-indigo-500 px-8 py-3 text-xs sm:text-sm font-bold text-white transition-all duration-200 shadow-lg shadow-indigo-500/25 cursor-pointer"
          >
            গ্যালারিতে ফিরুন
          </button>
        </div>
      </div>
    );
  }

  const posterImage = item?.image || item?.images?.[0] || documentaryCard?.image;
  const autoplayVideoUrl = getAutoplayVideoUrl(item?.videoUrl);

  const handleShare = async () => {
    const shareData = {
      title: item.title,
      text: item.shortDescription || item.title,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // User cancelled
      }
    }

    try {
      await navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch {
      window.alert('লিংক কপি করা যায়নি');
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1326] text-white pb-14 sm:pb-20">
      
      {/* Hero & Video Stage */}
      <section className="relative overflow-hidden bg-[#070913] text-white border-b border-white/[0.08]">
        {/* Soft Ambience Glow */}
        <div className="pointer-events-none absolute -left-20 top-1/3 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute -right-20 top-1/2 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 w-full px-4 pt-6 pb-10 sm:px-6 sm:pt-8 sm:pb-14 md:pt-10 md:pb-16 max-w-7xl mx-auto space-y-6">
          
          {/* Top Bar & Breadcrumbs */}
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
              <span>ডকুমেন্টারি</span>
              <span>/</span>
              <span className="text-emerald-400 font-semibold truncate max-w-[140px] sm:max-w-[220px]">{item.title}</span>
            </div>
          </div>

          {/* Grid Layout: Header Info & Video Player */}
          <div className="grid items-center gap-6 sm:gap-8 lg:grid-cols-12 lg:gap-10">
            
            {/* Left Content (6 cols) */}
            <div className="space-y-4 sm:space-y-6 lg:col-span-6">
              
              <div className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-xs font-bold text-rose-300 backdrop-blur-md">
                <HiPlayCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>ভিডিও ফিচার ও তথ্যচিত্র</span>
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
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPlaying(true)}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold text-xs sm:text-sm shadow-lg shadow-rose-600/30 transition cursor-pointer active:scale-95"
                >
                  <HiPlayCircle className="text-lg" />
                  <span>এখনই দেখুন</span>
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white font-bold text-xs sm:text-sm transition cursor-pointer"
                >
                  {isCopied ? (
                    <>
                      <HiCheckCircle className="text-base text-emerald-300" />
                      <span>লিংক কপি হয়েছে</span>
                    </>
                  ) : (
                    <>
                      <HiOutlineShare className="text-base" />
                      <span>শেয়ার করুন</span>
                    </>
                  )}
                </button>
              </div>

            </div>

            {/* Right Video Showcase (6 cols) */}
            <div className="lg:col-span-6">
              <div className="relative mx-auto w-full max-w-lg">
                <div className="absolute -inset-1.5 rounded-3xl bg-gradient-to-r from-rose-500/25 to-indigo-500/25 blur-lg opacity-70" />
                
                <div className="relative aspect-video rounded-2xl sm:rounded-3xl overflow-hidden border border-white/15 bg-[#090a16] shadow-2xl">
                  {isPlaying ? (
                    <iframe
                      className="w-full h-full"
                      src={autoplayVideoUrl || item.videoUrl}
                      title={item.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  ) : (
                    <div className="relative w-full h-full group">
                      {posterImage ? (
                        <img
                          src={posterImage}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#090a16] text-slate-600">
                          <HiVideoCamera className="w-16 h-16" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                      
                      {/* Play Button Overlay */}
                      <button
                        type="button"
                        onClick={() => setIsPlaying(true)}
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-rose-600/90 hover:bg-rose-500 text-white flex items-center justify-center shadow-2xl transition-transform hover:scale-110 active:scale-95 cursor-pointer border border-white/30 backdrop-blur-sm"
                        aria-label="ভিডিও চালু করুন"
                      >
                        <HiPlayCircle className="text-3xl sm:text-4xl" />
                      </button>

                      {/* Video Tag */}
                      <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[11px] font-bold text-white">
                        <HiVideoCamera className="text-rose-400" />
                        <span>Watch Video</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Main Body Details */}
      <div className="w-full px-3.5 sm:px-6 py-6 sm:py-10 max-w-7xl mx-auto">
        <div className="grid items-start gap-6 lg:grid-cols-12 lg:gap-10">
          
          {/* Main Description (8 cols) */}
          <div className="space-y-5 sm:space-y-6 lg:col-span-8">
            
            <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 bg-[#0f1124] p-4 sm:p-8 shadow-2xl space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/15 px-3.5 py-1 text-xs font-bold text-indigo-300">
                <HiDocumentText className="text-sm text-emerald-400" />
                <span>ডকুমেন্টারি সারাংশ ও প্রেক্ষাপট</span>
              </div>

              <h2 className="text-lg sm:text-2xl font-black text-white leading-snug">
                {item.title}
              </h2>

              <div className="space-y-3.5 text-xs sm:text-sm text-slate-300 leading-relaxed font-normal pt-2 border-t border-white/[0.08]">
                {item.fullDescription ? (
                  item.fullDescription.split('\n').map((paragraph, index) => (
                    paragraph.trim() ? <p key={index}>{paragraph}</p> : null
                  ))
                ) : (
                  <p>{item.shortDescription}</p>
                )}
              </div>
            </div>

          </div>

          {/* Sidebar (4 cols) */}
          <div className="space-y-5 sm:space-y-6 lg:sticky lg:top-24 lg:col-span-4">
            
            {/* Tags */}
            {item.tags && item.tags.length > 0 && (
              <div className="rounded-2xl sm:rounded-3xl border border-white/10 bg-[#0f1124] p-5 sm:p-6 shadow-2xl space-y-3">
                <h3 className="flex items-center gap-2 text-sm sm:text-base font-black text-white border-b border-white/[0.08] pb-2.5">
                  <HiTag className="text-indigo-400 text-base" />
                  <span>ট্যাগসমূহ</span>
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {item.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 rounded-lg bg-white/[0.05] border border-white/10 text-xs font-semibold text-slate-300"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Related Documentaries */}
            {relatedDocumentaries.length > 0 && (
              <div className="rounded-2xl sm:rounded-3xl border border-white/10 bg-[#0f1124] p-5 sm:p-6 shadow-2xl space-y-3.5">
                <h3 className="flex items-center gap-2 text-sm sm:text-base font-black text-white border-b border-white/[0.08] pb-2.5">
                  <HiPhoto className="text-emerald-400 text-base" />
                  <span>আরও ডকুমেন্টারি</span>
                </h3>

                <div className="space-y-2.5">
                  {relatedDocumentaries.map((doc) => (
                    <button
                      key={doc.id}
                      type="button"
                      onClick={() => navigate(`/gallery/documentary/${doc.id}`)}
                      className="group flex w-full items-center gap-3 rounded-xl border border-white/10 bg-[#14162b] p-2.5 text-left transition hover:border-indigo-400/40 hover:bg-white/[0.06] cursor-pointer"
                    >
                      <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-black">
                        <img
                          src={doc.image}
                          alt={doc.title}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <HiPlayCircle className="text-white text-lg" />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="line-clamp-1 text-xs sm:text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                          {doc.title}
                        </h4>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          {doc.date}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Share & Back Navigation */}
            <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/10 bg-[#0f1124] shadow-2xl space-y-3">
              <button
                type="button"
                onClick={handleShare}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 transition cursor-pointer active:scale-95"
              >
                <HiOutlineShare className="text-base" />
                <span>ডকুমেন্টারি শেয়ার করুন</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/gallery')}
                className="w-full py-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-slate-200 hover:text-white font-bold text-xs sm:text-sm transition cursor-pointer text-center flex items-center justify-center gap-2"
              >
                <HiArrowLeft className="text-base" />
                <span>সব গ্যালারি দেখুন</span>
              </button>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
};

export default GalleryDocumentaryDetails;
