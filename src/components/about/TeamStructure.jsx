import React, { useState, useEffect } from 'react';
import { 
  HiUserGroup, 
  HiCog, 
  HiChatBubbleLeftRight, 
  HiCamera, 
  HiSparkles,
  HiCheckCircle,
  HiShieldCheck
} from 'react-icons/hi2';
import { getTeamStructure } from '../../services/firestore';

const DEFAULT_TEAMS = [
  {
    name: 'নির্বাহী পরিষদ',
    icon: HiShieldCheck,
    iconBg: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    description: 'সংগঠনের নীতিনির্ধারণ, সার্বিক সিদ্ধান্ত গ্রহণ এবং কৌশলগত দিকনির্দেশনা প্রদান করে।',
    responsibilities: [
      'বার্ষিক পরিকল্পনা ও বাজেট প্রণয়ন',
      'কৌশলগত সিদ্ধান্ত ও পরিচালনা',
      'উপদেষ্টা পর্ষদের সাথে সমন্বয়',
      'সকল সাব-টিমকে তত্ত্বাবধান'
    ],
    members: '১১'
  },
  {
    name: 'পরীক্ষা নিয়ন্ত্রণ ও মূল্যায়ন টিম',
    icon: HiCog,
    iconBg: 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30',
    description: 'মেধাবৃত্তি পরীক্ষার সম্পূর্ণ প্রক্রিয়া, প্রশ্ন প্রণয়ন ও স্বচ্ছ মূল্যায়ন নিশ্চিত করে।',
    responsibilities: [
      'গোপনীয় প্রশ্নপত্র প্রণয়ন ও মডারেশন',
      '৮টি পরীক্ষা কেন্দ্র ব্যবস্থাপনা',
      'উত্তরপত্র নির্ভুল মূল্যায়ন ও স্ক্রুটিনি',
      'মেধাতালিকা ও ফলাফল প্রস্তুতকরণ'
    ],
    members: '২৮'
  },
  {
    name: 'মিডিয়া ও জনসংযোগ টিম',
    icon: HiChatBubbleLeftRight,
    iconBg: 'bg-sky-500/20 text-sky-400 border border-sky-500/30',
    description: 'প্রচার-প্রচারণা, অভিভাবক ও শিক্ষার্থীদের সাথে দ্রুত যোগাযোগ এবং সোশ্যাল মিডিয়া পরিচালনা করে।',
    responsibilities: [
      'বিজ্ঞপ্তি ও হেল্পলাইন সেবা প্রদান',
      'ডিজিটাল ক্যাম্পেইন ও প্রচার',
      'প্রেস বিজ্ঞপ্তি ও সংবাদ সমন্বয়',
      'ইউজার সাপোর্ট ও গাইডেন্স'
    ],
    members: '০৮'
  },
  {
    name: 'আইটি, ডিজাইন ও মিডিয়া প্রোডাকশন',
    icon: HiCamera,
    iconBg: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    description: 'অনলাইন পোর্টাল রক্ষণাবেক্ষণ, অনুষ্ঠান কভারেজ এবং সকল গ্রাফিক্স ডিজাইন তৈরি করে।',
    responsibilities: [
      'অনলাইন রেজিস্ট্রেশন ও পোর্টাল ম্যানেজমেন্ট',
      'ইভেন্ট ফটোগ্রাফি ও ভিডিওগ্রাফি',
      'সার্টিফিকেট, ক্রেস্ট ও ব্যানার ডিজাইন',
      'সাইবার নিরাপত্তা ও ডাটা ব্যাকআপ'
    ],
    members: '০৮'
  },
];

const TeamStructure = () => {
  const [teams, setTeams] = useState(DEFAULT_TEAMS);

  useEffect(() => {
    getTeamStructure().then((data) => {
      if (data && data.length > 0) {
        setTeams(data);
      }
    });
  }, []);

  return (
    <section className="relative w-full px-3 sm:px-6 py-12 sm:py-16 bg-[#0b1326] text-white">
      <div className="max-w-7xl mx-auto space-y-10 sm:space-y-14">

        {/* Section Header */}
        <div className="text-center space-y-2 sm:space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-xs font-bold uppercase tracking-wider">
            <HiSparkles className="text-sm text-indigo-400" />
            <span>সাংগঠনিক কাঠামো</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            আমাদের কর্মঠ ও দক্ষ <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400">টিমসমূহ</span>
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
            নিবেদিতপ্রাণ স্বেচ্ছাসেবক ও দক্ষ কর্মকর্তাদের সমন্বয়ে পরিচালিত আমাদের বিভিন্ন কর্মবিভাগ।
          </p>
        </div>

        {/* Team Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {teams.map((team, idx) => {
            const Icon = team.icon || HiUserGroup;
            return (
              <div
                key={idx}
                className="p-6 sm:p-7 rounded-3xl bg-[#0f1124] border border-white/10 hover:border-indigo-400/40 shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between space-y-5 group"
              >
                <div className="space-y-4">
                  {/* Top Bar with Icon and Member Badge */}
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-2xl ${team.iconBg || 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'} flex items-center justify-center text-2xl shadow-md group-hover:scale-110 transition-transform`}>
                      <Icon />
                    </div>

                    <span className="px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-xs font-bold text-slate-300">
                      সদস্য: {team.members} জন
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-1.5">
                    <h3 className="text-lg sm:text-xl font-black text-white group-hover:text-indigo-300 transition-colors">
                      {team.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {team.description}
                    </p>
                  </div>
                </div>

                {/* Responsibilities */}
                <div className="pt-4 border-t border-white/[0.08] space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    প্রধান দায়িত্বসমূহ:
                  </h4>
                  <ul className="space-y-1.5">
                    {team.responsibilities.map((resp, rIdx) => (
                      <li key={rIdx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-300">
                        <HiCheckCircle className="text-emerald-400 text-sm shrink-0 mt-0.5" />
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default TeamStructure;
