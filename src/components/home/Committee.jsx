import React, { useState, useEffect, useRef } from 'react';
import { FaFacebookF } from 'react-icons/fa';
import { HiSparkles, HiChevronLeft, HiChevronRight } from 'react-icons/hi2';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';

import AbuJubayer_chairman from '../../assets/images/jubayer.jpg';
import Tofayel_vicechairman from '../../assets/images/tofayel.jpg';
import MahmudurRahman_assistant_poricalok from '../../assets/images/mahmudurrahman.jpg';
import M_ahmedamim_assistant_poricalok from '../../assets/images/m_Ahmedamim.jpg';
import mufakkir_assistant_poricalok from '../../assets/images/mufakkhir.jpg';
import riyaz_assistant_poricalok from '../../assets/images/riyazuddin.jpg';
import sultan_assistant_poricalok from '../../assets/images/sultanmahmud.jpg';
import yeasin_assistant_poricalok from '../../assets/images/yasinahmed.jpg';
import taher_assistant_poricalok from '../../assets/images/taher.jpg';
import abu_taher_nirbahi from '../../assets/images/abutaherchowdhury.jpg';
import moynulIslam_assistant_poricalok from '../../assets/images/moynulislam.jpg';
import { getCommitteeMembers } from '../../services/firestore';
import { SmartImage } from '../common';

const DEFAULT_MEMBERS = [
  { 
    name: "আবু জুবায়ের", 
    role: "চেয়ারম্যান", 
    img: AbuJubayer_chairman,
    roleColor: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    facebook: '#'
  },
  { 
    name: "তোফায়েল আহমদ", 
    role: "ভাইস চেয়ারম্যান", 
    img: Tofayel_vicechairman,
    roleColor: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    facebook: 'https://www.facebook.com/tufael.ahmed.54922'
  },
  { 
    name: "আবু তাহের চৌধুরী", 
    role: "নির্বাহী সম্পাদক", 
    img: abu_taher_nirbahi,
    roleColor: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
    facebook: 'https://www.facebook.com/abutaher.chowdhury.144'
  },
  { 
    name: "মাহমুদুর রহমান", 
    role: "পৃষ্ঠপোষক", 
    img: MahmudurRahman_assistant_poricalok,
    roleColor: "bg-sky-500/15 text-sky-300 border-sky-500/30",
    facebook: 'https://www.facebook.com/Mahmudhasan9996'
  },
  { 
    name: "এম আহমদ আমীম",   
    role: "পৃষ্ঠপোষক", 
    img: M_ahmedamim_assistant_poricalok,
    roleColor: "bg-sky-500/15 text-sky-300 border-sky-500/30",
    facebook: 'https://www.facebook.com/ahmed.amim.1'
  },
  { 
    name: "শেখ মুফাক্কির হোসাইন", 
    role: "পৃষ্ঠপোষক",  
    img: mufakkir_assistant_poricalok,
    roleColor: "bg-sky-500/15 text-sky-300 border-sky-500/30",
    facebook: 'https://www.facebook.com/sheikh.mufakkir'
  },
  { 
    name: "সুলতান মাহমুদ", 
    role: "পৃষ্ঠপোষক",  
    img: sultan_assistant_poricalok,
    roleColor: "bg-sky-500/15 text-sky-300 border-sky-500/30",
    facebook: 'https://www.facebook.com/sultanmahmud.sumon.58'
  },
  { 
    name: "রিয়াজ উদ্দিন", 
    role: "পৃষ্ঠপোষক", 
    img: riyaz_assistant_poricalok,
    roleColor: "bg-sky-500/15 text-sky-300 border-sky-500/30",
    facebook: 'https://www.facebook.com/riyaz.uddin.92798'
  },
  { 
    name: "ইয়াসিন আহমেদ", 
    role: "পৃষ্ঠপোষক", 
    img: yeasin_assistant_poricalok,
    roleColor: "bg-sky-500/15 text-sky-300 border-sky-500/30",
    facebook: 'https://www.facebook.com/yasinahmed2022'
  },
  { 
    name: "ময়নুল ইসলাম", 
    role: "পৃষ্ঠপোষক", 
    img: moynulIslam_assistant_poricalok,
    roleColor: "bg-sky-500/15 text-sky-300 border-sky-500/30",
    facebook: 'https://www.facebook.com/mdmoynulislam.mayon.3'
  },
  { 
    name: "আবু তাহের", 
    role: "পৃষ্ঠপোষক",  
    img: taher_assistant_poricalok,
    roleColor: "bg-sky-500/15 text-sky-300 border-sky-500/30",
    facebook: 'https://www.facebook.com/taher200135'
  }
];

const Committee = () => {
  const [members, setMembers] = useState(DEFAULT_MEMBERS);
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef(null);

  useEffect(() => {
    getCommitteeMembers().then((data) => {
      if (data && data.length > 0) {
        setMembers(data.map(m => ({
          name: m.name,
          role: m.designation || m.role,
          img: m.photoUrl || m.img,
          roleColor: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
          facebook: m.facebookUrl || m.facebook || '#'
        })));
      }
    });
  }, []);

  const handleDotClick = (index) => {
    if (swiperRef.current) {
      swiperRef.current.slideTo(index);
    }
  };

  return (
    <section className="relative w-full px-3 sm:px-6 py-12 sm:py-16 md:py-20 bg-[#0b1326] text-white border-b border-white/[0.08] overflow-hidden">
      {/* Background Soft Glow */}
      <div className="pointer-events-none absolute -right-20 top-1/2 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute -left-20 bottom-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto space-y-8 sm:space-y-10 relative z-10">
        
        {/* Section Header */}
        <div className="text-center space-y-2 sm:space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-xs font-bold uppercase tracking-wider">
            <HiSparkles className="text-sm text-amber-400" />
            <span>পরিচালনা পর্ষদ</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            কিশোরকণ্ঠ মেধাবৃত্তি <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400">
              পরিচালনা ও উপদেষ্টা কমিটি
            </span>
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
            অভিজ্ঞ শিক্ষাবিদ ও সমাজসেবীদের সার্বিক তত্ত্বাবধানে পরিচালিত মেধা মূল্যায়ন কার্যক্রম।
          </p>
        </div>

        {/* Swiper Carousel */}
        <div className="relative">
          <Swiper
            modules={[Autoplay]}
            onSwiper={(swiper) => (swiperRef.current = swiper)}
            onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
            autoplay={{
              delay: 3500,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            loop={members.length > 4}
            slidesPerView={1.35}
            spaceBetween={12}
            breakpoints={{
              480: {
                slidesPerView: 1.8,
                spaceBetween: 14,
              },
              640: {
                slidesPerView: 2.5,
                spaceBetween: 16,
              },
              768: {
                slidesPerView: 3.2,
                spaceBetween: 18,
              },
              1024: {
                slidesPerView: 4,
                spaceBetween: 20,
              }
            }}
            className="pb-4"
          >
            {members.map((member, index) => (
              <SwiperSlide key={`member-${index}`} className="h-auto">
                <div
                  className="group relative h-full min-h-[230px] sm:min-h-[260px] p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-[#14162b] border border-white/10 hover:border-indigo-400/40 flex flex-col items-center text-center justify-between overflow-hidden shadow-xl lift"
                >
                  {/* Subtle Ambient Top Glow */}
                  <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none" />

                  {/* Circular Avatar */}
                  <div className="relative mb-2 sm:mb-3 shrink-0">
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 aspect-square rounded-full p-1 bg-[#090a16] border border-white/15 shrink-0 flex items-center justify-center shadow-lg">
                      <SmartImage
                        src={member.img}
                        alt={member.name}
                        rounded="rounded-full"
                        className="w-full h-full aspect-square shrink-0"
                        imgClassName="object-top"
                      />
                      
                      {/* Facebook Icon Overlay */}
                      {member.facebook && member.facebook !== '#' && (
                        <a
                          href={member.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute bottom-0 right-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#1877f2] text-white flex items-center justify-center text-[10px] sm:text-xs hover:scale-110 transition-transform cursor-pointer z-10 shadow-md"
                          title="Facebook Profile"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <FaFacebookF />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Member Details */}
                  <div className="space-y-1 w-full flex-1 flex flex-col items-center justify-center">
                    <h3 className="text-xs sm:text-base font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-2 min-h-[32px] flex items-center justify-center">
                      {member.name}
                    </h3>

                    <div>
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] sm:text-[11px] font-bold border uppercase tracking-wider ${member.roleColor}`}
                      >
                        {member.role}
                      </span>
                    </div>
                  </div>

                  {/* Bottom Indicator */}
                  <div className="w-8 h-0.5 rounded-full bg-indigo-500/30 group-hover:w-16 group-hover:bg-indigo-500 transition-all duration-300 mt-2 sm:mt-3 shrink-0" />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Desktop Left / Right Arrow Buttons */}
          <button
            type="button"
            onClick={() => swiperRef.current?.slidePrev()}
            className="hidden lg:flex absolute -left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[#14162b] border border-white/20 items-center justify-center text-white hover:bg-indigo-600 transition-all cursor-pointer shadow-lg"
            aria-label="Previous Slide"
          >
            <HiChevronLeft className="text-lg" />
          </button>
          <button
            type="button"
            onClick={() => swiperRef.current?.slideNext()}
            className="hidden lg:flex absolute -right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[#14162b] border border-white/20 items-center justify-center text-white hover:bg-indigo-600 transition-all cursor-pointer shadow-lg"
            aria-label="Next Slide"
          >
            <HiChevronRight className="text-lg" />
          </button>
        </div>

        {/* Centered Dot Pagination */}
        <div className="flex items-center justify-center pt-2">
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 p-1.5 rounded-full bg-[#14162b] border border-white/10">
            {members.map((_, index) => {
              const isActive = activeIndex === index;
              return (
                <button
                  key={`dot-${index}`}
                  type="button"
                  onClick={() => handleDotClick(index)}
                  className={`h-2 sm:h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'w-6 sm:w-7 bg-indigo-500'
                      : 'w-2 sm:w-2.5 bg-white/20 hover:bg-white/40'
                  }`}
                  aria-label={`Go to member ${index + 1}`}
                />
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};

export default Committee;