import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { galleryDetailsData } from './galleryDetailsData';
import { getGalleryItems } from '../../services/firestore';
import GalleryGridDetailsHero from './GalleryGridDetailsHero';
import {
  HiCalendarDays,
  HiMapPin,
  HiPhoto,
  HiTag,
  HiSparkles,
  HiDocumentText,
  HiOutlineShare,
  HiOutlineArrowLeft,
  HiCheckCircle,
} from 'react-icons/hi2';

const GalleryGridDetails = ({ detailsData = galleryDetailsData }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [item, setItem] = useState(() => detailsData[parseInt(id)] || detailsData[id]);

  useEffect(() => {
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
            images: [found.imageUrl || found.thumbUrl],
            highlights: [
              'কিশোরকণ্ঠ মেধাবৃত্তি অনুষ্ঠান',
              'শিক্ষার্থীদের সক্রিয় উপস্থিতি',
              'স্মরণীয় মুহূর্তসমূহ',
            ],
            relatedPrograms: [],
          });
        }
      });
    }
  }, [id, item]);

  if (!item) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b1326] text-white">
        <div className="space-y-6 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-3xl">
            <HiPhoto />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white">অ্যালবাম খুঁজে পাওয়া যায়নি</h1>
          <button
            onClick={() => navigate('/gallery')}
            className="rounded-full bg-indigo-600 hover:bg-indigo-500 px-8 py-3 font-bold text-white transition-all duration-200 shadow-lg shadow-indigo-500/25 cursor-pointer"
          >
            গ্যালারিতে ফিরুন
          </button>
        </div>
      </div>
    );
  }

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? item.images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === item.images.length - 1 ? 0 : prev + 1
    );
  };

  const handleShare = async () => {
    const shareData = {
      title: item.title,
      text: item.shortDescription,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // User may cancel
      }
    }

    try {
      await navigator.clipboard.writeText(window.location.href);
      window.alert('লিংক কপি হয়েছে');
    } catch {
      window.alert('শেয়ার করা যায়নি, অনুগ্রহ করে ম্যানুয়ালি লিংক কপি করুন');
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1326] text-white pb-16">
      <GalleryGridDetailsHero item={item} />

      <div className="w-full px-3 sm:px-6 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto grid items-start gap-8 lg:grid-cols-12 lg:gap-10">
          
          {/* Main Gallery Showcase (8 cols) */}
          <div className="space-y-6 sm:space-y-8 lg:col-span-8">
            
            {/* Big Image Viewer Card */}
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0f1124] p-3 sm:p-4 shadow-2xl">
              <div className="absolute left-6 top-6 z-10 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/60 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-md">
                <HiPhoto className="text-emerald-400" />
                <span>{currentImageIndex + 1} / {item.images.length}</span>
              </div>

              <div className="group relative aspect-[16/10] overflow-hidden rounded-2xl bg-black/60">
                <img
                  src={item.images[currentImageIndex]}
                  alt={`${item.title} - ${currentImageIndex + 1}`}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />

                {item.images.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      aria-label="Previous image"
                      className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/50 p-2.5 text-white backdrop-blur-md transition hover:bg-indigo-600 cursor-pointer"
                    >
                      <HiOutlineArrowLeft className="h-5 w-5" />
                    </button>

                    <button
                      onClick={handleNextImage}
                      aria-label="Next image"
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/50 p-2.5 text-white backdrop-blur-md transition hover:bg-indigo-600 cursor-pointer"
                    >
                      <HiOutlineArrowLeft className="h-5 w-5 rotate-180" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails Row */}
              {item.images.length > 1 && (
                <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {item.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                        idx === currentImageIndex
                          ? 'border-indigo-400 ring-2 ring-indigo-400/50 scale-105'
                          : 'border-white/15 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`Thumbnail ${idx + 1}`} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Description Card */}
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0f1124] p-6 sm:p-8 shadow-2xl space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/15 px-3.5 py-1 text-xs font-bold text-indigo-300">
                <HiDocumentText className="text-sm" />
                <span>ইভেন্ট সম্পর্কে বিস্তারিত বিবরণ</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white">
                {item.title}
              </h2>

              <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed font-normal pt-2 border-t border-white/[0.08]">
                {item.fullDescription?.split('\n').map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </div>

          </div>

          {/* Sidebar Info (4 cols) */}
          <div className="space-y-6 lg:sticky lg:top-24 lg:col-span-4">
            
            {/* Highlights Card */}
            {item.highlights && item.highlights.length > 0 && (
              <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0f1124] shadow-2xl p-6 space-y-4">
                <h3 className="flex items-center gap-2 text-base font-black text-white border-b border-white/[0.08] pb-3">
                  <HiSparkles className="text-amber-400" />
                  <span>আয়োজনের মূল আকর্ষণ</span>
                </h3>

                <ul className="space-y-2.5">
                  {item.highlights.map((highlight, index) => (
                    <li key={index} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                      <HiCheckCircle className="text-emerald-400 text-base shrink-0 mt-0.5" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Share & Actions */}
            <div className="p-6 rounded-3xl border border-white/10 bg-[#0f1124] shadow-2xl space-y-3">
              <button
                onClick={handleShare}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 transition cursor-pointer"
              >
                <HiOutlineShare className="text-base" />
                <span>অ্যালবাম শেয়ার করুন</span>
              </button>

              <button
                onClick={() => navigate('/gallery')}
                className="w-full py-3 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/10 text-white font-bold text-xs sm:text-sm transition cursor-pointer text-center"
              >
                সব অ্যালবাম দেখুন
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default GalleryGridDetails;
