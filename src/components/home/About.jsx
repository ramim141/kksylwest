import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiAcademicCap, HiBookOpen, HiSparkles, HiArrowRight, HiPlayCircle } from 'react-icons/hi2';
import { getHomepageContent } from '../../services/firestore';

const DEFAULT_ABOUT_DATA = {
  badge: 'আমাদের সম্পর্কে',
  title: 'মেধা ও মনন বিকাশে',
  highlightedTitle: 'চার দশকের পথচলা',
  description: 'কিশোরকণ্ঠ পাঠক ফোরাম, সিলেট জেলা পশ্চিম ১৯৮৪ সাল থেকে শিক্ষার্থীদের মেধা অন্বেষণ, নৈতিক চরিত্র গঠন এবং সুস্থ সংস্কৃতির বিকাশে নিরলসভাবে কাজ করে যাচ্ছে।',
  videoTitle: 'কিশোরকণ্ঠ মেধাবৃত্তি তথ্যচিত্র',
  videoUrl: 'https://www.facebook.com/61550084636519/videos/1560922935088975/'
};

const DEFAULT_FEATURES = [
  {
    icon: 'graduation',
    title: 'মেধাবৃত্তি পরীক্ষা ও পুরস্কার',
    description: 'শিক্ষার্থীদের সুপ্ত মেধা বিকাশে প্রতি বছর আয়োজিত হয় সিলেট অঞ্চলের বৃহত্তম মেধা বৃত্তি পরীক্ষা।',
    bgColor: 'bg-primary-container/15 text-primary',
  },
  {
    icon: 'book',
    title: 'নৈতিকতা ও মানবিক মূল্যবোধ',
    description: 'শুধু পাঠ্যবই নয়, দেশপ্রেম, সততা ও সুন্দর সমাজ গঠনে নৈতিক মূল্যবোধের পাঠ প্রদান।',
    bgColor: 'bg-primary-container/15 text-primary',
  }
];

const ICON_MAP = {
  graduation: HiAcademicCap,
  book: HiBookOpen
};

const About = () => {
  const navigate = useNavigate();
  const [aboutData, setAboutData] = useState(DEFAULT_ABOUT_DATA);
  const [features, setFeatures] = useState(DEFAULT_FEATURES);

  useEffect(() => {
    getHomepageContent().then((data) => {
      if (data && data.about) {
        setAboutData({
          badge: data.about.badge || DEFAULT_ABOUT_DATA.badge,
          title: data.about.title || DEFAULT_ABOUT_DATA.title,
          highlightedTitle: data.about.highlightedTitle || DEFAULT_ABOUT_DATA.highlightedTitle,
          description: data.about.description || DEFAULT_ABOUT_DATA.description,
          videoTitle: data.about.videoTitle || DEFAULT_ABOUT_DATA.videoTitle,
          videoUrl: data.about.videoUrl || DEFAULT_ABOUT_DATA.videoUrl,
        });

        if (data.about.feature1Title || data.about.feature2Title) {
          setFeatures([
            {
              icon: 'graduation',
              title: data.about.feature1Title || 'মেধাবৃত্তি পরীক্ষা',
              description: data.about.feature1Desc || 'শিক্ষার্থীদের সুপ্ত প্রতিভা অন্বেষণে প্রতি বছর আমরা আয়োজন করি বিশাল মেধাবৃত্তি পরীক্ষা।',
              bgColor: 'bg-primary-container/15 text-primary',
            },
            {
              icon: 'book',
              title: data.about.feature2Title || 'নৈতিক শিক্ষা',
              description: data.about.feature2Desc || 'পুথিগত বিদ্যার পাশাপাশি আমরা গুরুত্ব দেই সততা, দেশপ্রেম এবং নৈতিক মূল্যবোধের ওপর।',
              bgColor: 'bg-primary-container/15 text-primary',
            }
          ]);
        }
      }
    });
  }, []);

  return (
    <section className="section section-band w-full px-3 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-container/15 text-primary-300 border border-primary/30 text-xs font-bold uppercase tracking-wider">
            <HiSparkles className="text-sm text-primary" />
            <span>আমাদের পরিচয়</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            কিশোরকণ্ঠ পাঠক ফোরাম <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400">সম্পর্কে</span>
          </h2>
        </div>

        {/* Content & Video Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left: Facebook Video Embed with Glass Frame */}
          <div className="lg:col-span-6">
            <div className="relative p-2 sm:p-3 rounded-xl bg-surface-card border border-line-soft overflow-hidden group">
              <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-surface-lowest">
                <iframe
                  className="w-full h-full"
                  src={`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(aboutData.videoUrl)}&show_text=0&t=0`}
                  title={aboutData.videoTitle}
                  style={{ border: 'none', overflow: 'hidden' }}
                  scrolling="no"
                  frameBorder="0"
                  allowFullScreen={true}
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                />
              </div>

              <div className="pt-2 px-2 flex items-center justify-between text-xs text-ink-muted">
                <span className="flex items-center gap-1 font-bold">
                  <HiPlayCircle className="text-base text-primary" />
                  {aboutData.videoTitle}
                </span>
                <span className="text-[11px]">সিলেট জেলা পশ্চিম শাখা</span>
              </div>
            </div>
          </div>

          {/* Right: Description & Core Pillars */}
          <div className="lg:col-span-6 space-y-6">
            <p className="text-sm sm:text-base leading-relaxed text-ink-muted font-medium">
              {aboutData.description}
            </p>

            {/* Feature Pillar Cards */}
            <div className="space-y-3.5">
              {features.map((feature, idx) => {
                const IconComponent = ICON_MAP[feature.icon] || HiAcademicCap;
                return (
                  <div
                    key={idx}
                    className="flex items-start gap-3.5 p-4 rounded-lg bg-surface-card border border-line-soft"
                  >
                    <div className={`w-11 h-11 rounded flex items-center justify-center text-2xl shrink-0 ${feature.bgColor}`}>
                      <IconComponent />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-sm sm:text-base font-black text-ink-strong">
                        {feature.title}
                      </h4>
                      <p className="text-xs text-ink-muted leading-relaxed font-medium">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Learn More Action Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => navigate('/about')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary-container hover:bg-primary-container text-white font-black text-xs sm:text-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <span>আমাদের কার্যক্রম ও বিস্তারিত জানুন</span>
                <HiArrowRight className="text-sm" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default About;