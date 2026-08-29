import React, { useState, useEffect, useMemo } from 'react';
import { HiMapPin, HiPhone, HiSparkles, HiBookOpen, HiXMark } from 'react-icons/hi2';
import { getUpazilaCenters } from '../../services/firestore';
import OnlineRegistration from './OnlineRegistration';

// বাংলা সংখ্যায় রূপান্তর
const toBengaliNumber = (num) => {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num.toString().replace(/[0-9]/g, (digit) => bengaliDigits[digit]);
};

// Organized by উপজেলা (Upazila)
const DEFAULT_LOCATION_DATA = [
  {
    upazila: 'ফেঞ্চুগঞ্জ উপজেলা',
    color: 'blue',
    locations: [
      { name: 'মেসার্স জসীম এন্ড ব্রাদার্স', address: 'বিআইডিসি বাজার, ফেঞ্চুগঞ্জ, সিলেট' },
      { name: 'পপি লাইব্রেরী', address: 'থানা রোড, ফেঞ্চুগঞ্জ বাজার, সিলেট' },
    ],
    contacts: [
      { name: 'আশরাফুল ইসলাম তোহা', phone: '০১৬৩০-০১৭২৪৮' },
      { name: 'জাকির হোসেন সামি', phone: '০১৮৭৫-৪৫২৫১৫' },
      { name: 'সুলতান মাহমুদ', phone: '০১৭২৩-১৪৭৯৪৬' },
      { name: 'শাহাব উদ্দীন', phone: '০১৭৬২-৪৯৪৮৭১' },
    ]
  },
  {
    upazila: 'বিশ্বনাথ উপজেলা',
    color: 'cyan',
    locations: [
      { name: 'রায়হান স্টুডিও', address: 'লামাকাজী পয়েন্ট, রাগীব রাবেয়া হাই স্কুল এন্ড কলেজের সামনে' },
      { name: 'আইডিয়াল শপ এন্ড কম্পিউটার', address: 'কলাগঞ্জ বাজার, বিশ্বনাথ' },
      { name: 'বিসমিল্লাহ এন্টারপ্রাইজ', address: 'হাবড়া বাজার, বিশ্বনাথ, সিলেট' },
      { name: 'আল হাফিজ লাইব্রেরী', address: 'নতুন বাজার, বিশ্বনাথ, সিলেট' },
      { name: 'আল ইসলাম ট্রেড সেন্টার', address: 'নতুন বাজার, বিশ্বনাথ, সিলেট' },
    ],
    contacts: [
      { name: 'মতিউর রহমান ইমন', phone: '০১৭০৫-৬৩১০৫৬' },
      { name: 'রেদওয়ান আহমদ', phone: '০১৬১৪-৫৬৯৯৬৮' },
      { name: 'শাহ হোসাইন উদ্দীন', phone: '০১৭২৩-২১২৯৭৯' },
    ]
  },
  {
    upazila: 'দক্ষিণ সুরমা থানা',
    color: 'teal',
    locations: [
      { name: 'আধুনিক লাইব্রেরী', address: 'লালাবাজার, সিলেট' },
      { name: 'তানহা টেলিকম', address: 'কামাল বাজার, সিলেট' },
      { name: 'হায়দুল এন্টারপ্রাইজ', address: 'মাসুক বাজার, জালালাবাদ, সিলেট' },
    ],
    contacts: [
      { name: 'সুলতান মাহমুদ', phone: '০১৭২৩-১৪৭৯৪৬' },
      { name: 'শাহাব উদ্দীন', phone: '০১৭৬২-৪৯৪৮৭১' },
    ]
  },
  {
    upazila: 'মোগলাবাজার থানা',
    color: 'indigo',
    locations: [
      { name: 'ইত্যাদি লাইব্রেরী', address: 'মোগলাবাজার রোড, সিলেট' },
      { name: 'আল মদিনা লাইব্রেরী', address: 'রেলওয়ে স্টেশন রোড, মোগলাবাজার' },
    ],
    contacts: [
      { name: 'মুহাম্মদ তাওহীদ', phone: '০১৭৫৫-৮৯২০১১' },
      { name: 'কামরুল ইসলাম', phone: '০১৮৩০-৯৯২১২২' },
    ]
  },
  {
    upazila: 'বালাগঞ্জ উপজেলা',
    color: 'emerald',
    locations: [
      { name: 'জনপ্রিয় লাইব্রেরী', address: 'বালাগঞ্জ বাজার, সিলেট' },
      { name: 'শিক্ষার্থী বুক ডিপো', address: 'কলেজ রোড, বালাগঞ্জ' },
    ],
    contacts: [
      { name: 'নাজমুল হাসান', phone: '০১৭২০-৩৩৪৪৫৫' },
      { name: 'আহসান হাবীব', phone: '০১৬৮৮-৭৭৬৬৫৫' },
    ]
  },
  {
    upazila: 'ওসমানীনগর উপজেলা',
    color: 'amber',
    locations: [
      { name: 'তাজপুর বুক সেন্টার', address: 'তাজপুর বাজার, ওসমানীনগর' },
      { name: 'গোয়ালাবাজার স্টেশনারি', address: 'গোয়ালাবাজার, ওসমানীনগর, সিলেট' },
    ],
    contacts: [
      { name: 'আব্দুল কাইয়ূম', phone: '০১৯১২-৩৩৪৫৫৬' },
      { name: 'মাহফুজুর রহমান', phone: '০১৭৭৭-৮৮৯৯০০' },
    ]
  }
];

// উপজেলা Card Component
const UpazilaCard = ({ upazila, locations, contacts }) => {
  const locList = Array.isArray(locations) ? locations : [];
  const conList = Array.isArray(contacts) ? contacts : [];
  
  return (
    <div className="rounded-3xl border border-white/10 bg-[#14162b] shadow-xl hover:border-indigo-400/40 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden group">
      {/* Header - Upazila Name */}
      <div className="bg-[#090a16] px-5 py-4 border-b border-white/[0.08] flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-base font-black text-white group-hover:text-indigo-300 transition-colors">
          <HiMapPin className="text-emerald-400 text-lg" />
          <span>{upazila}</span>
        </h3>
        <span className="text-[11px] font-bold text-slate-400 bg-white/[0.06] px-2.5 py-0.5 rounded-full border border-white/5">
          {toBengaliNumber(locList.length)} টি কেন্দ্র
        </span>
      </div>
      
      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        {/* Libraries/Shops */}
        <div className="space-y-3">
          {locList.map((loc, idx) => (
            <div key={idx} className="space-y-0.5 border-b border-white/5 pb-2.5 last:border-0 last:pb-0">
              <p className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                <HiBookOpen className="text-indigo-400 text-xs shrink-0" />
                <span>{loc.name}</span>
              </p>
              {loc.address && (
                <p className="text-[11px] text-slate-400 pl-4">{loc.address}</p>
              )}
            </div>
          ))}
        </div>
        
        {/* Contacts */}
        {conList.length > 0 && (
          <div className="pt-3 border-t border-white/[0.08] space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              উপজেলা প্রতিনিধি ও হেল্পলাইন
            </span>
            <div className="space-y-1.5">
              {conList.map((contact, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-semibold">{contact.name}</span>
                  <a 
                    href={`tel:${(contact.phone || '').replace(/-/g, '')}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 font-bold text-[11px] border border-emerald-500/30 transition cursor-pointer"
                  >
                    <HiPhone className="text-xs" />
                    <span>{contact.phone}</span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const FormSubmit = () => {
  const [locationData, setLocationData] = useState(DEFAULT_LOCATION_DATA);
  const [selectedUpazila, setSelectedUpazila] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    getUpazilaCenters().then((data) => {
      if (data && data.length > 0) {
        setLocationData(data);
      }
    });
  }, []);

  const upazilaCategories = useMemo(() => {
    return [
      { id: 'all', name: 'সকল উপজেলা', count: locationData.length },
      ...locationData.map(data => ({
        id: data.upazila,
        name: (data.upazila || '').replace(' উপজেলা', '').replace(' থানা', ''),
        count: Array.isArray(data.locations) ? data.locations.length : 0
      }))
    ];
  }, [locationData]);

  const filteredData = useMemo(() => {
    if (selectedUpazila === 'all') return locationData;
    return locationData.filter(d => d.upazila === selectedUpazila);
  }, [locationData, selectedUpazila]);

  return (
    <section className="relative w-full px-3 sm:px-6 py-12 sm:py-16 bg-[#0b1326] text-white border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto space-y-8 sm:space-y-10">
        
        {/* Section Header */}
        <div className="text-center space-y-2 sm:space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-xs font-bold uppercase tracking-wider">
            <HiMapPin className="text-sm text-emerald-400" />
            <span>উপজেলা ভিত্তিক বিতরণ কেন্দ্র</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            ফরম সংগ্রহ ও <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400">জমা দেওয়ার স্থানসমূহ</span>
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
            আপনার নিকটস্থ লাইব্রেরি বা যোগাযোগ কেন্দ্র থেকে সরাসরি অফলাইন ফর্ম সংগ্রহ ও জমা দিতে পারেন।
          </p>
        </div>

        {/* Upazila Filter Tabs */}
        <div className="flex items-center justify-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#14162b] border border-white/10 shadow-lg">
            {upazilaCategories.map((cat) => {
              const active = selectedUpazila === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedUpazila(cat.id)}
                  className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap cursor-pointer ${
                    active
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25 scale-102'
                      : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
                  }`}
                >
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Upazila Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filteredData.map((item, index) => (
            <UpazilaCard
              key={index}
              upazila={item.upazila}
              locations={item.locations}
              contacts={item.contacts}
            />
          ))}
        </div>

      </div>

      {/* Online Registration Modal */}
      {isModalOpen && (
        <OnlineRegistration onClose={() => setIsModalOpen(false)} />
      )}
    </section>
  );
};

export default FormSubmit;