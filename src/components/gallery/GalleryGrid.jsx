import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HiSparkles,
  HiArchiveBox,
  HiVideoCamera,
  HiCalendar,
  HiArrowDown,
  HiPhoto
} from 'react-icons/hi2';
import { galleryData } from './galleryData';
import { getGalleryItems } from '../../services/firestore';
import { SkeletonRegion, SkeletonGrid, SmartImage } from '../common';

const ITEMS_PER_PAGE = 6;

const TABS = [
  {
    key: 'recent',
    label: 'সাম্প্রতিক অ্যালবাম',
    icon: HiSparkles,
  },
  {
    key: 'archive',
    label: 'আর্কাইভ কালেকশন',
    icon: HiArchiveBox,
  },
  {
    key: 'documentary',
    label: 'ডকুমেন্টারি ও ভিডিও',
    icon: HiVideoCamera,
  },
];

const GalleryGrid = () => {
  const navigate = useNavigate();
  const gridRef = useRef(null);

  const [activeTab, setActiveTab] = useState(TABS[0].key);
  const [dataStore, setDataStore] = useState(galleryData);
  const [pageMap, setPageMap] = useState(
    () => Object.fromEntries(TABS.map(tab => [tab.key, 1]))
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getGalleryItems('all').then((firestoreItems) => {
      if (firestoreItems && firestoreItems.length > 0) {
        const merged = { ...galleryData };
        firestoreItems.forEach((item) => {
          const cat = item.category || 'recent';
          if (!merged[cat]) merged[cat] = [];
          merged[cat] = [
            {
              id: item.id,
              title: item.title,
              description: item.description,
              date: item.date,
              image: item.imageUrl || item.thumbUrl,
            },
            ...merged[cat],
          ];
        });
        setDataStore(merged);
      }
    }).finally(() => setLoading(false));
  }, []);

  const currentItems = dataStore[activeTab] ?? [];
  const currentPage = pageMap[activeTab] ?? 1;
  const endIndex = currentPage * ITEMS_PER_PAGE;

  const displayedItems = useMemo(
    () => currentItems.slice(0, endIndex),
    [currentItems, endIndex]
  );

  const hasMore = endIndex < currentItems.length;

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
  };

  useEffect(() => {
    const handleExternalTabChange = (event) => {
      if (TABS.some(tab => tab.key === event.detail)) {
        setActiveTab(event.detail);
      }
    };

    window.addEventListener('gallery:set-tab', handleExternalTabChange);

    return () => {
      window.removeEventListener('gallery:set-tab', handleExternalTabChange);
    };
  }, []);

  const handleLoadMore = () => {
    const previousEndIndex = currentPage * ITEMS_PER_PAGE;

    setPageMap(prev => ({
      ...prev,
      [activeTab]: prev[activeTab] + 1,
    }));

    setTimeout(() => {
      const newItems = gridRef.current?.querySelectorAll('[data-item-id]');
      if (newItems && newItems[previousEndIndex]) {
        newItems[previousEndIndex].scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    }, 100);
  };

  return (
    <section data-gallery-grid className="relative w-full px-3 sm:px-6 py-12 sm:py-16 lg:py-20 bg-[#0f1124] text-white">
      {/* Background Soft Blobs */}
      <div className="pointer-events-none absolute -left-16 -top-10 h-72 w-72 rounded-full bg-indigo-500/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-emerald-500/5 blur-3xl" />

      <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12 relative z-10">
        
        {/* FILTER TABS DOCK */}
        <div className="flex justify-center">
          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#14162b] border border-white/10 shadow-2xl backdrop-blur-xl">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const active = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold cursor-pointer press ${
                    active
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 scale-[1.02]'
                      : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
                  }`}
                >
                  <Icon className="text-base" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* GALLERY GRID */}
        {loading ? (
          <SkeletonRegion label="গ্যালারি লোড হচ্ছে">
            <SkeletonGrid
              count={6}
              columns="grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              className="gap-5 sm:gap-6"
            />
          </SkeletonRegion>
        ) : (
        <div
          key={activeTab}
          className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 stagger-in"
          ref={gridRef}
        >
          {displayedItems.map((item) => (
            <div
              key={item.id}
              data-item-id={item.id}
              onClick={() => {
                const targetPath = activeTab === 'documentary'
                  ? `/gallery/documentary/${item.id}`
                  : activeTab === 'archive'
                    ? `/gallery/archive/${item.id}`
                    : `/gallery/${item.id}`;

                navigate(targetPath);
              }}
              className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-[#14162b] backdrop-blur-md hover:border-indigo-400/40 hover:shadow-2xl flex flex-col justify-between lift"
            >
              {/* Image Preview Container */}
              <div className="relative aspect-[16/11] overflow-hidden bg-black/40">
                <SmartImage
                  src={item.image}
                  alt={item.title}
                  rounded="rounded-none"
                  className="w-full h-full"
                  imgClassName="transition-transform duration-700 ease-standard group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#14162b] via-black/20 to-transparent opacity-80" />

                {/* Floating Quick Action */}
                <div className="absolute inset-x-4 bottom-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <div className="w-full py-2.5 rounded-xl bg-indigo-600/90 text-white text-xs font-bold text-center backdrop-blur-md shadow-lg flex items-center justify-center gap-1.5">
                    <HiPhoto className="text-sm" />
                    <span>অ্যালবাম দেখুন</span>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 sm:p-6 space-y-2.5">
                <h3 className="line-clamp-2 text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                  {item.title}
                </h3>

                <p className="line-clamp-2 text-xs text-slate-300 leading-relaxed font-normal">
                  {item.description}
                </p>

                <div className="flex items-center gap-1.5 text-xs text-slate-400 pt-2 border-t border-white/[0.08]">
                  <HiCalendar className="text-emerald-400 text-sm" />
                  <span>{item.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        )}

        {/* LOAD MORE BUTTON */}
        {hasMore && (
          <div className="mt-10 flex justify-center sm:mt-12">
            <button
              onClick={handleLoadMore}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-indigo-600 hover:bg-indigo-500 px-8 py-3.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-indigo-500/25 cursor-pointer lift"
            >
              <HiArrowDown className="text-base" />
              <span>আরো অ্যালবাম দেখুন</span>
            </button>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && displayedItems.length === 0 && (
          <div className="py-16 text-center rounded-2xl bg-[#14162b] border border-dashed border-white/10 space-y-3">
            <HiPhoto className="mx-auto h-12 w-12 text-slate-500 animate-pulse" />
            <p className="text-sm font-bold text-white">এই বিভাগে বর্তমানে কোনো অ্যালবাম সংরক্ষিত নেই</p>
            <p className="text-xs text-slate-400">অন্য কোনো ট্যাব নির্বাচন করে অ্যালবামগুলো দেখুন।</p>
          </div>
        )}

      </div>
    </section>
  );
};

export default GalleryGrid;
