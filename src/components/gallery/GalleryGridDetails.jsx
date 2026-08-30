import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { galleryDetailsData } from './galleryDetailsData';
import { getGalleryItems } from '../../services/firestore';
import GalleryGridDetailsHero from './GalleryGridDetailsHero';
import {
  HiPhoto,
  HiSparkles,
  HiDocumentText,
  HiOutlineShare,
  HiOutlineArrowLeft,
  HiCheckCircle,
  HiChevronLeft,
  HiChevronRight,
  HiArrowsPointingOut,
  HiXMark,
  HiClipboard,
} from 'react-icons/hi2';

const toBengaliNumber = (num) =>
  num?.toString().replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[d]) || "০";

const GalleryGridDetails = ({ detailsData = galleryDetailsData }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [item, setItem] = useState(() => detailsData[parseInt(id)] || detailsData[id]);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!item) {
      getGalleryItems('all').then((list) => {
        const found = list?.find((x) => String(x.id) === String(id));
        if (found) {
          setItem({
            id: found.id,
            title: found.title,
            date: found.date,
            location: found.location || 'সিলেট',
            tag: found.category === 'archive' ? 'আর্কাইভ প্রোগ্রাম' : 'সাম্প্রতিক প্রোগ্রাম',
            shortDescription: found.description,
            fullDescription: found.description,
            images: [found.imageUrl || found.thumbUrl].filter(Boolean),
            highlights: [
              'কিশোরকণ্ঠ মেধাবৃত্তি অনুষ্ঠান',
              'শিক্ষার্থীদের সক্রিয় উপস্থিতি',
              'স্মরণীয় মুহূর্তসমূহ',
            ],
            tags: ['বৃত্তি', 'কিশোরকণ্ঠ'],
            relatedPrograms: [],
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
            <HiPhoto />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">অ্যালবাম খুঁজে পাওয়া যায়নি</h1>
          <p className="text-xs sm:text-sm text-slate-400">অনুরোধকৃত ছবির অ্যালবামটি মুছে ফেলা হতে পারে বা বিদ্যমান নেই।</p>
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

  const images = Array.isArray(item.images) && item.images.length > 0 ? item.images : [item.image || ''];

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

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
      window.alert('লিংক কপি করা যায়নি, অনুগ্রহ করে অ্যাড্রেস বার থেকে কপি করুন');
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1326] text-white pb-14 sm:pb-20">
      <GalleryGridDetailsHero item={{ ...item, images }} />

      <div className="w-full px-3.5 sm:px-6 py-6 sm:py-10 max-w-7xl mx-auto">
        <div className="grid items-start gap-6 lg:grid-cols-12 lg:gap-10">
          
          {/* Main Gallery Showcase (8 cols on desktop) */}
          <div className="space-y-5 sm:space-y-6 lg:col-span-8">
            
            {/* Big Interactive Image Viewer Card */}
            <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 bg-[#0f1124] p-2.5 sm:p-4 shadow-2xl space-y-3">
              
              {/* Top Bar with Counter & Fullscreen button */}
              <div className="flex items-center justify-between px-2 pt-1 pb-0.5">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-xs font-bold text-slate-200">
                  <HiPhoto className="text-emerald-400" />
                  <span>ছবি: {toBengaliNumber(currentImageIndex + 1)} / {toBengaliNumber(images.length)}</span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsLightboxOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] hover:bg-indigo-600 border border-white/10 text-xs font-bold text-white transition cursor-pointer"
                  title="ফুলস্ক্রিন দেখুন"
                >
                  <HiArrowsPointingOut className="text-sm" />
                  <span className="hidden sm:inline">ফুলস্ক্রিন</span>
                </button>
              </div>

              {/* Main Image Frame with Navigation Controls */}
              <div className="group relative aspect-[4/3] sm:aspect-[16/10] overflow-hidden rounded-xl sm:rounded-2xl bg-[#090a16]">
                <img
                  src={images[currentImageIndex]}
                  alt={`${item.title} - ${currentImageIndex + 1}`}
                  onClick={() => setIsLightboxOpen(true)}
                  className="h-full w-full object-cover sm:object-contain transition-transform duration-500 cursor-zoom-in"
                />
                
                {/* Navigation Arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrevImage}
                      aria-label="Previous image"
                      className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/60 p-2 sm:p-2.5 text-white backdrop-blur-md transition hover:bg-indigo-600 active:scale-90 cursor-pointer shadow-lg z-10"
                    >
                      <HiChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
                    </button>

                    <button
                      type="button"
                      onClick={handleNextImage}
                      aria-label="Next image"
                      className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/60 p-2 sm:p-2.5 text-white backdrop-blur-md transition hover:bg-indigo-600 active:scale-90 cursor-pointer shadow-lg z-10"
                    >
                      <HiChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails Carousel Strip */}
              {images.length > 1 && (
                <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto pb-1 pt-0.5 scrollbar-none px-1">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`relative h-14 w-20 sm:h-18 sm:w-26 shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                        idx === currentImageIndex
                          ? 'border-indigo-500 ring-2 ring-indigo-400/50 scale-105 shadow-md shadow-indigo-500/25'
                          : 'border-white/15 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`Thumbnail ${idx + 1}`} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Description Details Card */}
            <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 bg-[#0f1124] p-4 sm:p-8 shadow-2xl space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/15 px-3.5 py-1 text-xs font-bold text-indigo-300">
                <HiDocumentText className="text-sm text-emerald-400" />
                <span>ইভেন্টের বিস্তারিত তথ্য</span>
              </div>

              <h2 className="text-lg sm:text-2xl font-black text-white leading-snug">
                {item.title}
              </h2>

              <div className="space-y-3.5 text-xs sm:text-sm text-slate-300 leading-relaxed font-normal pt-2 border-t border-white/[0.08]">
                {item.fullDescription ? (
                  item.fullDescription.split('\n').map((paragraph, i) => (
                    paragraph.trim() ? <p key={i}>{paragraph}</p> : null
                  ))
                ) : (
                  <p>{item.shortDescription || 'কোনো বিবরণ যোগ করা হয়নি।'}</p>
                )}
              </div>
            </div>

          </div>

          {/* Sidebar Area (4 cols on desktop) */}
          <div className="space-y-5 sm:space-y-6 lg:sticky lg:top-24 lg:col-span-4">
            
            {/* Highlights Card */}
            {item.highlights && item.highlights.length > 0 && (
              <div className="overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 bg-[#0f1124] shadow-2xl p-5 sm:p-6 space-y-4">
                <h3 className="flex items-center gap-2 text-sm sm:text-base font-black text-white border-b border-white/[0.08] pb-3">
                  <HiSparkles className="text-amber-400 text-base shrink-0" />
                  <span>আয়োজনের মূল আকর্ষণ</span>
                </h3>

                <ul className="space-y-2.5">
                  {item.highlights.map((highlight, index) => (
                    <li key={index} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                      <HiCheckCircle className="text-emerald-400 text-base shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Quick Share & Navigation Box */}
            <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/10 bg-[#0f1124] shadow-2xl space-y-3">
              <button
                type="button"
                onClick={handleShare}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 transition cursor-pointer active:scale-95"
              >
                {isCopied ? (
                  <>
                    <HiCheckCircle className="text-base text-emerald-300" />
                    <span>লিংক কপি করা হয়েছে!</span>
                  </>
                ) : (
                  <>
                    <HiOutlineShare className="text-base" />
                    <span>অ্যালবাম শেয়ার করুন</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate('/gallery')}
                className="w-full py-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-slate-200 hover:text-white font-bold text-xs sm:text-sm transition cursor-pointer text-center flex items-center justify-center gap-2"
              >
                <HiOutlineArrowLeft className="text-base" />
                <span>সব অ্যালবাম দেখুন</span>
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* Fullscreen Image Lightbox Modal */}
      {isLightboxOpen && (
        <div
          onClick={() => setIsLightboxOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-3 sm:p-6 backdrop-blur-md backdrop-enter"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[90vh] max-w-5xl w-full flex flex-col items-center justify-center space-y-3"
          >
            {/* Modal Close Button */}
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="absolute -top-12 right-0 p-2.5 text-white bg-white/10 hover:bg-rose-600 rounded-full transition cursor-pointer"
            >
              <HiXMark className="text-xl" />
            </button>

            {/* Lightbox Image */}
            <div className="relative w-full max-h-[75vh] flex items-center justify-center overflow-hidden rounded-2xl">
              <img
                src={images[currentImageIndex]}
                alt={item.title}
                className="max-h-[75vh] w-auto object-contain rounded-2xl"
              />

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 text-white border border-white/20 hover:bg-indigo-600 transition cursor-pointer"
                  >
                    <HiChevronLeft className="text-xl" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 text-white border border-white/20 hover:bg-indigo-600 transition cursor-pointer"
                  >
                    <HiChevronRight className="text-xl" />
                  </button>
                </>
              )}
            </div>

            {/* Modal Bottom Counter */}
            <div className="px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-bold text-white">
              {item.title} • {toBengaliNumber(currentImageIndex + 1)} / {toBengaliNumber(images.length)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryGridDetails;
