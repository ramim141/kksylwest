import React from 'react';
import { HiTrophy, HiUsers, HiAcademicCap, HiHeart, HiStar, HiSparkles } from 'react-icons/hi2';

const Achievements = () => {
  const stats = [
    {
      icon: HiUsers,
      number: '5000+',
      label: 'সম্মানিত শিক্ষার্থী',
      description: '৩২ বছরে মোট শিক্ষার্থী',
      color: 'from-primary-container to-tertiary-container',
      bgColor: 'from-primary/10 to-tertiary/10'
    },
    {
      icon: HiTrophy,
      number: '25+',
      label: 'বার্ষিক পরীক্ষা',
      description: 'বছরে মোট আয়োজন সংখ্যা',
      color: 'from-tertiary-container to-tertiary-container',
      bgColor: 'from-tertiary/10 to-tertiary/10'
    },
    {
      icon: HiAcademicCap,
      number: '১০০+',
      label: 'পরীক্ষা কেন্দ্র',
      description: 'সিলেটের বিভিন্ন এলাকায়',
      color: 'from-tertiary-container to-tertiary-container',
      bgColor: 'from-tertiary/10 to-tertiary/10'
    },
    {
      icon: HiHeart,
      number: '২০০+',
      label: 'স্বেচ্ছাসেবক',
      description: 'নিয়মিত কাজে সহায়তাকারী',
      color: 'from-tertiary-container to-tertiary-container',
      bgColor: 'from-tertiary/10 to-tertiary/10'
    }
  ];

  const successStories = [
    {
      name: 'আবদুল্লাহ আল মামুন',
      year: '২০১৫',
      achievement: 'ঢাকা বিশ্ববিদ্যালয়ে ১ম স্থান',
      description: 'কিশোরকণ্ঠ মেধাবৃত্তি ২০১৫-তে ১ম স্থান অধিকারী আবদুল্লাহ পরবর্তীতে ঢাকা বিশ্ববিদ্যালয়ে ভর্তি পরীক্ষায় ১ম স্থান অধিকার করেন। বর্তমানে তিনি একজন সফল সফটওয়্যার ইঞ্জিনিয়ার।',
      image: '👨‍🎓'
    },
    {
      name: 'ফাতিমা তাহেরা',
      year: '২০১৮',
      achievement: 'মেডিকেল কলেজে ১ম স্থান',
      description: 'মেধাবৃত্তি ২০১৮-তে ২য় স্থান অধিকারী ফাতিমা পরবর্তীতে সিলেট মেডিকেল কলেজে ভর্তি পরীক্ষায় ১ম হন। এখন তিনি MBBS শেষ বর্ষের ছাত্রী।',
      image: '👩‍⚕️'
    },
    {
      name: 'রাকিবুল হাসান',
      year: '২০২০',
      achievement: 'BUET তে চান্স পেয়েছেন',
      description: 'অনলাইন মেধাবৃত্তি ২০২০-তে ১ম হওয়া রাকিবুল বাংলাদেশ প্রকৌশল বিশ্ববিদ্যালয়ে (BUET) কম্পিউটার সায়েন্স বিভাগে অধ্যয়নরত। তার স্বপ্ন দেশের জন্য কাজ করা।',
      image: '👨‍💻'
    }
  ];

  const recognitions = [
    {
      title: 'সিলেট জেলা প্রশাসন পুরস্কার',
      year: '২০১৯',
      description: 'শিক্ষা বিস্তারে অবদানের জন্য',
      icon: '🏅'
    },
    {
      title: 'জাতীয় শিক্ষা সপ্তাহ সম্মাননা',
      year: '২০২১',
      description: 'মেধা অন্বেষণে উৎকর্ষতার জন্য',
      icon: '🎖️'
    },
    {
      title: 'শিক্ষা মন্ত্রণালয় সার্টিফিকেট',
      year: '২০২৩',
      description: 'ডিজিটাল শিক্ষা উদ্যোগের জন্য',
      icon: '📜'
    },
    {
      title: 'সেরা সামাজিক সংগঠন',
      year: '২০২৪',
      description: 'সিলেট চেম্বার অফ কমার্স পুরস্কার',
      icon: '🌟'
    }
  ];

  return (
    <section className="py-20 overflow-hidden bg-surface-card">
      <div className="container mx-auto max-w-7xl">
        
        {/* Section Header */}
        <div className="mb-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 text-sm font-semibold rounded-full bg-primary/10 text-primary">
            <HiSparkles className="w-5 h-5" />
            আমাদের অর্জন
          </div>
          <h2 className="mb-4 text-4xl font-bold text-ink-strong md:text-5xl">
            গর্ব করার মতো <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-container to-tertiary-container">সাফল্যগাথা</span>
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-ink-muted">
            সংখ্যা, পরিসংখ্যান এবং সফলতার গল্প যা আমাদের যাত্রাকে অর্থবহ করে তুলেছে
          </p>
          <div className="w-24 h-1.5 mx-auto mt-6 rounded-full bg-gradient-to-r from-primary-container to-tertiary-container"></div>
        </div>

        {/* Statistics Grid */}
        <div className="grid gap-6 mb-20 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`relative p-8 overflow-hidden transition-all transform rounded-xl bg-gradient-to-br ${stat.bgColor} hover:shadow-overlay hover:-translate-y-2 group`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 transition-transform transform rounded-full bg-white/30 blur-2xl group-hover:scale-150"></div>
              
              <div className="relative z-10">
                <div className={`inline-flex items-center justify-center w-14 h-14 mb-4 rounded-lg bg-gradient-to-br ${stat.color}`}>
                  <stat.icon className="text-white w-7 h-7" />
                </div>
                
                <div className={`text-5xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r ${stat.color}`}>
                  {stat.number}
                </div>
                
                <h3 className="mb-1 text-xl font-bold text-ink-strong">
                  {stat.label}
                </h3>
                
                <p className="text-sm text-ink-muted">
                  {stat.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Success Stories */}
        <div className="mb-20">
          <div className="mb-12 text-center">
            <h3 className="mb-3 text-3xl font-bold text-ink-strong">
              সফলতার <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-container to-tertiary-container">গল্পগুলো</span>
            </h3>
            <p className="text-ink-muted">যাদের জীবন বদলে দিয়েছে কিশোরকণ্ঠ মেধাবৃত্তি</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {successStories.map((story, index) => (
              <div
                key={index}
                className="p-6 transition-all transform bg-surface-card border-2 border-line-soft rounded-xl hover:shadow-overlay hover:-translate-y-2 group"
              >
                {/* Avatar */}
                <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 text-4xl rounded-full bg-gradient-to-br from-primary/10 to-tertiary/10">
                  {story.image}
                </div>

                {/* Name & Year */}
                <h4 className="mb-1 text-xl font-bold text-center text-ink-strong transition-colors group-hover:text-primary">
                  {story.name}
                </h4>
                <p className="mb-3 text-sm text-center text-ink-muted">
                  মেধাবৃত্তি {story.year}
                </p>

                {/* Achievement Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 text-sm font-semibold rounded-full bg-primary/10 text-primary">
                  <HiStar className="w-4 h-4" />
                  {story.achievement}
                </div>

                {/* Description */}
                <p className="leading-relaxed text-ink-muted">
                  {story.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Recognitions */}
        <div className="p-8 border-2 border-line-soft md:p-12 rounded-xl bg-gradient-to-br from-surface-card to-surface-card">
          <div className="mb-8 text-center">
            <h3 className="mb-3 text-3xl font-bold text-ink-strong">
              স্বীকৃতি ও <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-container to-tertiary-container">সম্মাননা</span>
            </h3>
            <p className="text-ink-muted">বিভিন্ন প্রতিষ্ঠান থেকে প্রাপ্ত পুরস্কার ও সম্মাননা</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {recognitions.map((recognition, index) => (
              <div
                key={index}
                className="p-6 text-center transition-all transform bg-surface-card border-2 border-line-soft rounded-lg hover:shadow-overlay hover:-translate-y-1 hover:border-primary/25"
              >
                <div className="mb-4 text-5xl">
                  {recognition.icon}
                </div>
                <h4 className="mb-2 text-lg font-bold text-ink-strong">
                  {recognition.title}
                </h4>
                <p className="mb-2 text-sm font-semibold text-primary">
                  {recognition.year}
                </p>
                <p className="text-sm text-ink-muted">
                  {recognition.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Achievements;
