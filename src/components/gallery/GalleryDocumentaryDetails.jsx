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
} from 'react-icons/hi2';
import { galleryData } from './galleryData';
import { documentaryDetailsData } from './documentaryDetailsData';
import { getGalleryItems } from '../../services/firestore';

const getDocumentaryCard = (id) =>
  galleryData.documentary?.find((documentary) => String(documentary.id) === String(id));

const getRelatedDocumentaries = (id) =>
  galleryData.documentary?.filter((documentary) => String(documentary.id) !== String(id)) ?? [];

const getAutoplayVideoUrl = (videoUrl = '') => {
  if (!videoUrl) {
    return '';
  }

  const separator = videoUrl.includes('?') ? '&' : '?';

  return `${videoUrl}${separator}autoplay=1&rel=0`;
};

const infoItems = (item) => [
  {
    id: 'date',
    icon: HiCalendarDays,
    label: 'প্রকাশের তারিখ',
    value: item.date,
    className: 'bg-secondary/10 text-secondary',
  },
  {
    id: 'location',
    icon: HiMapPin,
    label: 'অবস্থান',
    value: item.location,
    className: 'bg-tertiary/10 text-tertiary',
  },
  {
    id: 'attendees',
    icon: HiUsers,
    label: 'দর্শক',
    value: item.attendees,
    className: 'bg-primary/10 text-primary',
  },
];

const GalleryDocumentaryDetailsHero = ({ item, posterImage, autoplayVideoUrl, onBack, onShare }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const playVideo = () => {
    setIsPlaying(true);
  };

  return (
    <section
      className="relative overflow-hidden text-white"
      style={{ backgroundColor: '#071f1b' }}
    >
      <div className="absolute inset-0" style={{ backgroundColor: '#071f1b' }} />
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(135deg, rgba(13,116,99,0.52) 0%, rgba(7,31,27,0.98) 48%, rgba(8,145,178,0.38) 100%)',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 18% 18%, rgba(245,158,11,0.18), transparent 30%), radial-gradient(circle at 84% 22%, rgba(6,182,212,0.16), transparent 32%)',
        }}
      />
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-surface-card to-transparent" />

      <div className="container relative z-10 mx-auto max-w-7xl px-4 pb-12 pt-24 sm:px-6 sm:pb-16 sm:pt-28 lg:px-8 lg:pb-20 lg:pt-32">
        <button
          onClick={onBack}
          className="group mb-7 inline-flex max-w-full items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-white backdrop-blur-md transition-all duration-300 hover:bg-surface-card hover:text-primary"
        >
          <HiArrowLeft className="h-5 w-5 flex-shrink-0 transition-transform group-hover:-translate-x-1" />
          <span className="truncate text-sm font-semibold">গ্যালারিতে ফিরুন</span>
        </button>

        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="mx-auto max-w-3xl text-center lg:mx-0 lg:text-left">
            <div className="mb-5 inline-flex max-w-full items-center gap-2 rounded-full border border-secondary/30 bg-secondary/15 px-4 py-2 text-xs font-bold uppercase tracking-wider text-secondary-100 backdrop-blur-md">
              <HiPlayCircle className="h-4 w-4 flex-shrink-0" />
              Documentary Feature
            </div>

            <div className="mb-4 flex min-w-0 items-center justify-center gap-2 text-sm font-medium text-primary-100/80 lg:justify-start">
              <span>গ্যালারি</span>
              <span className="text-primary-300/60">/</span>
              <span>ডকুমেন্টারি</span>
              <span className="text-primary-300/60">/</span>
              <span className="truncate font-semibold text-white">{item.title}</span>
            </div>

            <h1 className="break-words text-3xl font-extrabold leading-tight min-[380px]:text-4xl sm:text-5xl lg:text-6xl">
              {item.title}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl break-words text-sm leading-relaxed text-primary-50/85 min-[380px]:text-base sm:text-lg lg:mx-0">
              {item.shortDescription}
            </p>

            <div className="mx-auto mt-6 flex max-w-3xl flex-wrap justify-center gap-2.5 lg:mx-0 lg:justify-start">
              {infoItems(item).map((info) => (
                <div
                  key={info.id}
                  className="inline-flex min-h-12 max-w-full items-center gap-3 rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-left backdrop-blur-md"
                >
                  <span className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded ${info.className}`}>
                    <info.icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-primary-50/60">
                      {info.label}
                    </span>
                    <span className="block truncate text-sm font-bold text-white sm:max-w-[14rem]">
                      {info.value}
                    </span>
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-7 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center lg:justify-start">
              <button
                type="button"
                onClick={playVideo}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-secondary/15 px-5 py-3.5 text-sm font-bold text-primary shadow-[0_18px_40px_-24px_rgba(245,158,11,0.85)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-secondary/15 sm:w-auto sm:px-6 sm:text-base"
              >
                <HiPlayCircle className="h-5 w-5" />
                ভিডিও দেখুন
              </button>
              <button
                type="button"
                onClick={onShare}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-3.5 text-sm font-bold text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/15 sm:w-auto sm:px-6 sm:text-base"
              >
                <HiOutlineShare className="h-5 w-5" />
                শেয়ার করুন
              </button>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[560px] lg:mx-0 lg:ml-auto">
            <div className="absolute -inset-2 rounded-[1.75rem] border border-white/10 bg-white/5 shadow-overlay sm:-inset-3 sm:rounded-[2rem]" />
            <div className="relative overflow-hidden rounded-[1.35rem] border border-white/15 bg-surface-lowest shadow-[0_30px_90px_-45px_rgba(0,0,0,0.9)] sm:rounded-[1.75rem]">
              {isPlaying ? (
                <iframe
                  className="aspect-video h-full w-full"
                  src={autoplayVideoUrl}
                  title={item.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <>
                  {posterImage ? (
                    <img
                      src={posterImage}
                      alt={item.title}
                      className="aspect-video h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex aspect-video items-center justify-center bg-primary-900">
                      <HiVideoCamera className="h-24 w-24 text-white/25" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                  <button
                    type="button"
                    onClick={playVideo}
                    className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/45 bg-white/25 text-white shadow-overlay backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-surface-card hover:text-primary sm:h-20 sm:w-20"
                    aria-label="ভিডিও দেখুন"
                  >
                    <HiPlayCircle className="h-11 w-11 sm:h-12 sm:w-12" />
                  </button>
                  <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/45 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-md">
                    <HiVideoCamera className="h-4 w-4 text-secondary" />
                    Watch Documentary
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 text-white sm:bottom-5 sm:left-5 sm:right-5">
                    <p className="text-xs font-bold uppercase tracking-wider text-secondary-100/85">Now Showing</p>
                    <p className="mt-1 line-clamp-2 break-words text-lg font-extrabold leading-snug sm:text-2xl">
                      {item.title}
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="relative mt-4 rounded-lg border border-white/15 bg-white/10 p-4 backdrop-blur-md">
              <p className="flex items-center gap-2 text-sm font-bold text-primary-50">
                <HiSparkles className="h-5 w-5 text-secondary" />
                ডকুমেন্টারি ভিডিও, সারাংশ ও সংশ্লিষ্ট তথ্য এক জায়গায়।
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const GalleryDocumentaryDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(() => documentaryDetailsData[Number(id)] || documentaryDetailsData[id]);
  const documentaryCard = getDocumentaryCard(id);
  const relatedDocumentaries = getRelatedDocumentaries(id);

  useEffect(() => {
    window.scrollTo(0, 0);
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
            images: [found.imageUrl || found.thumbUrl],
            highlights: ['অনুষ্ঠানের দৃশ্যমালা', 'শিক্ষার্থীদের অনুভূতি'],
            relatedDocumentaries: [],
          });
        }
      });
    }
  }, [id, item]);

  if (!item) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-surface-card to-surface-card">
        <div className="space-y-6 text-center">
          <h1 className="text-3xl font-bold text-ink-strong">ডকুমেন্টারি লোড হচ্ছে...</h1>
          <button
            onClick={() => navigate('/gallery')}
            className="rounded bg-gradient-to-r from-primary-container to-tertiary-container px-8 py-3 font-semibold text-white cursor-pointer"
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
      text: item.shortDescription,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // User may cancel share; fallback handled below.
      }
    }

    try {
      await navigator.clipboard.writeText(window.location.href);
      window.alert('লিংক কপি হয়েছে');
    } catch {
      window.alert('শেয়ার করা যায়নি, অনুগ্রহ করে ম্যানুয়ালি লিংক কপি করুন');
    }
  };

  if (!item) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-surface-card to-surface-card px-4">
        <div className="max-w-md space-y-5 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-lg bg-error-container text-error">
            <HiVideoCamera className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-ink-strong">তথ্য পাওয়া যায়নি!</h2>
          <button
            onClick={() => navigate('/gallery')}
            className="rounded-full bg-primary-700 px-6 py-3 font-bold text-white transition-colors hover:bg-primary-800"
          >
            গ্যালারিতে ফিরে যান
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#ffffff_0%,#effbf7_40%,#ffffff_100%)] pb-14 selection:bg-primary/15 selection:text-primary sm:pb-20">
      <GalleryDocumentaryDetailsHero
        item={item}
        posterImage={posterImage}
        autoplayVideoUrl={autoplayVideoUrl}
        onBack={() => navigate('/gallery')}
        onShare={handleShare}
      />

      <div className="container mx-auto max-w-7xl px-3 py-8 sm:px-6 sm:py-10 md:py-16 lg:px-8">
        <div className="grid items-start gap-6 lg:grid-cols-12 lg:gap-12">
          <main className="space-y-6 sm:space-y-8 lg:col-span-8">
            <section className="relative overflow-hidden rounded-xl border border-primary/25 bg-surface-card p-5 shadow-[0_24px_70px_-48px_rgba(6,95,70,0.5)] sm:rounded-[2rem] sm:p-10">
              <div className="absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-primary-container via-tertiary to-tertiary" />
              <div className="mb-5 inline-flex max-w-full items-center gap-2 rounded-full border border-line-soft bg-surface-card px-3 py-2 text-sm font-bold text-primary sm:mb-6 sm:px-4">
                <HiDocumentText className="h-5 w-5 flex-shrink-0" />
                ডকুমেন্টারি সারাংশ
              </div>

              <h2 className="mb-5 break-words text-lg font-bold leading-snug text-primary sm:text-2xl">
                {item.shortDescription}
              </h2>
              <div className="mb-8 h-1 w-16 rounded-full bg-surface-card/20" />

              <div className="space-y-5 break-words text-[15px] leading-loose text-ink-muted sm:text-base">
                {item.fullDescription?.split('\n').map((paragraph, index) => (
                  paragraph.trim() ? <p key={index}>{paragraph}</p> : null
                ))}
              </div>
            </section>
          </main>

          <aside className="space-y-5 sm:space-y-6 lg:sticky lg:top-24 lg:col-span-4">
            <section className="overflow-hidden rounded-xl border border-primary/25 bg-surface-card shadow-[0_24px_70px_-48px_rgba(6,95,70,0.45)] sm:rounded-[2rem]">
              <div className="bg-surface-card px-5 py-5 text-white sm:px-8 sm:py-6">
                <h3 className="flex items-center gap-2 text-lg font-bold">
                  <HiSparkles className="h-5 w-5 text-secondary" />
                  ভিডিও তথ্য
                </h3>
              </div>
              <div className="space-y-5 p-5 sm:p-8">
                {infoItems(item).map((info) => (
                  <div key={info.id} className="flex items-start gap-3">
                    <div className={`mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded ${info.className}`}>
                      <info.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-ink-muted">{info.label}</p>
                      <p className="break-words font-semibold text-ink-strong">{info.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {item.tags && item.tags.length > 0 && (
              <section className="rounded-xl border border-line-soft bg-surface-card p-5 shadow-[0_24px_70px_-48px_rgba(6,95,70,0.45)] sm:rounded-[2rem] sm:p-8">
                <h3 className="mb-5 flex items-center gap-2 text-lg font-bold text-ink-strong">
                  <HiTag className="h-5 w-5 text-primary" />
                  ট্যাগসমূহ
                </h3>
                <div className="flex flex-wrap gap-2.5">
                  {item.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="break-words rounded-full border border-line-soft bg-surface-card px-3 py-2 text-sm font-medium text-ink-muted transition-colors hover:border-line-soft/30 hover:bg-primary/10 hover:text-primary sm:px-4"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {relatedDocumentaries.length > 0 && (
              <section className="rounded-xl border border-primary/25 bg-surface-card p-5 shadow-[0_24px_70px_-48px_rgba(6,95,70,0.45)] sm:rounded-[2rem] sm:p-8">
                <h3 className="mb-5 flex items-center gap-2 text-lg font-bold text-ink-strong">
                  <HiPhoto className="h-5 w-5 text-primary" />
                  আরও ডকুমেন্টারি
                </h3>
                <div className="space-y-3">
                  {relatedDocumentaries.map((documentary) => (
                    <button
                      key={documentary.id}
                      type="button"
                      onClick={() => navigate(`/gallery/documentary/${documentary.id}`)}
                      className="group flex w-full items-center gap-3 rounded-lg border border-line-soft bg-surface-card p-2 text-left transition-all duration-300 hover:border-primary/25 hover:bg-primary/10"
                    >
                      <img
                        src={documentary.image}
                        alt={documentary.title}
                        className="h-16 w-20 flex-shrink-0 rounded object-cover"
                      />
                      <span className="min-w-0">
                        <span className="line-clamp-2 break-words text-sm font-bold leading-snug text-ink-strong group-hover:text-primary">
                          {documentary.title}
                        </span>
                        <span className="mt-1 block truncate text-xs font-medium text-ink-muted">
                          {documentary.date}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            )}

            <div className="flex flex-col gap-3 pt-2">
              <button
                onClick={handleShare}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-line-soft bg-surface-card px-4 py-3.5 font-bold text-white shadow-[0_18px_40px_-24px_rgba(6,95,70,0.8)] transition-colors hover:bg-surface-card sm:py-4"
              >
                <HiOutlineShare className="h-5 w-5 stroke-2" />
                শেয়ার করুন
              </button>
              <button
                onClick={() => navigate('/gallery')}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-line-soft bg-surface-card px-4 py-3.5 font-bold text-primary shadow-[0_4px_20px_-8px_rgba(13,116,99,0.08)] transition-colors hover:bg-surface-card hover:shadow-[0_4px_20px_-6px_rgba(13,116,99,0.15)] sm:py-4"
              >
                <HiArrowLeft className="h-5 w-5 stroke-2" />
                গ্যালারিতে ফিরুন
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default GalleryDocumentaryDetails;
