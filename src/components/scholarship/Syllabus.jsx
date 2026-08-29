import React, { useState, useEffect } from 'react';
import { 
  HiBookOpen, 
  HiAcademicCap, 
  HiDocumentText,
  HiChevronDown,
  HiSparkles,
  HiCheckCircle,
  HiExclamationTriangle,
  HiCalculator,
  HiLanguage,
  HiGlobeAlt,
  HiBeaker,
  HiLightBulb,
  HiClock,
} from 'react-icons/hi2';
import { FaBook } from 'react-icons/fa';
import { getSyllabus } from '../../services/firestore';

const toBengaliNumber = (num) =>
  num?.toString().replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[d]) || "০";

const DEFAULT_SYLLABUS_DATA = [
  {
    id: 1,
    class: 'দশম শ্রেণি',
    subTitle: 'স্কুল ও মাদ্রাসা উভয় মাধ্যম',
    color: 'rose',
    totalMarks: '১০০',
    duration: '২ ঘণ্টা',
    subjects: [
      { 
        name: 'বাংলা',
        marks: '২৫',
        topics: [
          'গদ্য: ১. শিক্ষা ও মনুষ্যত্ব, ২. মানুষ মুহাম্মদ (সা.), ৩. প্রবাস বন্ধু',
          'পদ্য: ১. আমি কোনো আগন্তুক নই, ২. সেই দিন এই মাঠ, ৩. সাহসী জননী বাংলা',
          'ব্যাকরণ: বাক্যের অংশ ও শ্রেণিবিভাগ, বাগধারা, কারক, সমাস, বাক্য পরিবর্তন'
        ]
      },
      { 
        name: 'English',
        marks: '২৫',
        topics: [
          'Text: Unit 7-8, 11, 13, 16',
          'Grammar: Tag Question, Narration, Changing Sentence, Sentence Connectors, Suffix and Prefix'
        ]
      },
      { 
        name: 'গণিত',
        marks: '২৫',
        topics: [
          '১. বীজগণিতীয় রাশি ও সেট: অধ্যায় ২, ৩, ১১',
          '২. ব্যবহারিক জ্যামিতি ও বৃত্ত: অধ্যায় ৭, ৮',
          '৩. ত্রিকোণমিতিক অনুপাত: অধ্যায় ৯',
          '৪. পরিসংখ্যান: অধ্যায় ১৭'
        ]
      },
      { 
        name: 'সাধারণ জ্ঞান ও অন্বেষণ',
        marks: '২৫',
        topics: [
          'সাধারণ জ্ঞানের জন্য সমসাময়িক বিষয়াবলি, জাতীয় ও আন্তর্জাতিক এবং মাসিক কিশোরকণ্ঠ ও বিশেষ সংখ্যা অন্বেষণ।'
        ]
      }
    ]
  },
  {
    id: 2,
    class: 'নবম শ্রেণি',
    subTitle: 'স্কুল ও মাদ্রাসা উভয় মাধ্যম',
    color: 'violet',
    totalMarks: '১০০',
    duration: '২ ঘণ্টা',
    subjects: [
      { 
        name: 'বাংলা',
        marks: '২৫',
        topics: [
          'গদ্য: ১. বই পড়া, ২. মানুষ মুহাম্মদ (সাঃ), ৩. নিমগাছ',
          'পদ্য: ১. কপোতাক্ষ নদ, ২. জীবন-সঙ্গীত, ৩. জুতা আবিষ্কার',
          'ব্যাকরণ: ধ্বনিতত্ত্ব, শব্দগঠন, সন্ধি ও পদাশ্রিত নির্দেশক'
        ]
      },
      { 
        name: 'English',
        marks: '২৫',
        topics: [
          'Text: Unit 1-6',
          'Grammar: Parts of Speech, Right Form of Verbs, Transformation of Sentences, Punctuation'
        ]
      },
      { 
        name: 'গণিত',
        marks: '২৫',
        topics: [
          '১. বাস্তব সংখ্যা ও সেট: অধ্যায় ১, ২',
          '২. বীজগণিতীয় রাশি: অধ্যায় ৩',
          '৩. জ্যামিতি ও রেখা কোণ ত্রিভুজ: অধ্যায় ৬',
          '৪. পরিসংখ্যান: অধ্যায় ১৭'
        ]
      },
      { 
        name: 'সাধারণ জ্ঞান ও অন্বেষণ',
        marks: '২৫',
        topics: [
          'সমসাময়িক বিষয়াবলি, বিজ্ঞান ও তথ্যপ্রযুক্তি এবং মাসিক কিশোরকণ্ঠ।'
        ]
      }
    ]
  },
  {
    id: 3,
    class: 'অষ্টম শ্রেণি',
    subTitle: 'স্কুল ও মাদ্রাসা উভয় মাধ্যম',
    color: 'blue',
    totalMarks: '১০০',
    duration: '২ ঘণ্টা',
    subjects: [
      { 
        name: 'বাংলা',
        marks: '২৫',
        topics: [
          'গদ্য: অতিথির স্মৃতি, ভাব ও কাজ, পড়ে পাওয়া',
          'পদ্য: মানবধর্ম, দুই বিঘা জমি, পাছে লোকে কিছু বলে',
          'ব্যাকরণ: ভাষা, সন্ধি, শব্দ ও পদ, লিঙ্গান্তর'
        ]
      },
      { 
        name: 'English',
        marks: '২৫',
        topics: [
          'Grammar: Articles, Tense, Voice, Preposition, Transformation'
        ]
      },
      { 
        name: 'গণিত',
        marks: '২৫',
        topics: [
          '১. প্যাটার্ন ও মুনাফা',
          '২. পরিমাপ ও ক্ষেত্রফল',
          '৩. বীজগণিতীয় সূত্রাবলি ও প্রয়োগ'
        ]
      },
      { 
        name: 'সাধারণ জ্ঞান',
        marks: '২৫',
        topics: [
          'বাংলাদেশ ও বিশ্ব পরিচিতি, মাসিক কিশোরকণ্ঠ বিশেষ সংখ্যা।'
        ]
      }
    ]
  },
  {
    id: 4,
    class: 'সপ্তম শ্রেণি',
    subTitle: 'স্কুল ও মাদ্রাসা উভয় মাধ্যম',
    color: 'emerald',
    totalMarks: '১০০',
    duration: '২ ঘণ্টা',
    subjects: [
      { 
        name: 'বাংলা',
        marks: '২৫',
        topics: [
          'গদ্য: কাবুলিওয়ালা, লখার একুশে, মরু-ভাস্কর',
          'পদ্য: নতুন দেশ, কুলি-মজুর, শোন একটি মুজিবরের থেকে',
          'ব্যাকরণ: ধ্বনি ও বর্ণ, শব্দ ও পদ'
        ]
      },
      { 
        name: 'English',
        marks: '২৫',
        topics: [
          'Grammar: Noun, Pronoun, Verb, Adverb, Sentence construction'
        ]
      },
      { 
        name: 'গণিত',
        marks: '২৫',
        topics: [
          '১. মূলদ ও অমূলদ সংখ্যা',
          '২. সমানুপাত ও লাভ-ক্ষতি',
          '৩. বীজগণিতীয় রাশি ও ভগ্নাংশ'
        ]
      },
      { 
        name: 'সাধারণ জ্ঞান',
        marks: '২৫',
        topics: [
          'জাতীয় ও আন্তর্জাতিক তথ্য ও মাসিক কিশোরকণ্ঠ।'
        ]
      }
    ]
  },
  {
    id: 5,
    class: 'ষষ্ঠ শ্রেণি',
    subTitle: 'স্কুল ও মাদ্রাসা উভয় মাধ্যম',
    color: 'amber',
    totalMarks: '১০০',
    duration: '২ ঘণ্টা',
    subjects: [
      { 
        name: 'বাংলা',
        marks: '২৫',
        topics: [
          'গদ্য: সততার পুরস্কার, মিনু, নীলনদ আর পিরামিডের দেশ',
          'পদ্য: জন্মভূমি, সুখ, মানুষ জাতি',
          'ব্যাকরণ: ভাষা ও বাংলা ভাষা, রূপতত্ত্ব'
        ]
      },
      { 
        name: 'English',
        marks: '২৫',
        topics: [
          'Basic Grammar, Parts of Speech, Punctuation and translation'
        ]
      },
      { 
        name: 'গণিত',
        marks: '২৫',
        topics: [
          'স্বাভাবিক সংখ্যা ও ভগ্নাংশ, অনুপাত ও শতকরা, জ্যামিতির মৌলিক ধারণা'
        ]
      },
      { 
        name: 'সাধারণ জ্ঞান',
        marks: '২৫',
        topics: [
          'সাধারণ জ্ঞান ও মাসিক কিশোরকণ্ঠ।'
        ]
      }
    ]
  },
  {
    id: 6,
    class: 'পঞ্চম শ্রেণি',
    subTitle: 'প্রাথমিক ও ইবতেদায়ী সমাপনী',
    color: 'teal',
    totalMarks: '১০০',
    duration: '২ ঘণ্টা',
    subjects: [
      { 
        name: 'বাংলা',
        marks: '২৫',
        topics: [
          'পাঠ্যবইয়ের নির্বাচিত গল্প ও কবিতা, সমার্থক শব্দ, বিপরীত শব্দ ও এককথায় প্রকাশ।'
        ]
      },
      { 
        name: 'English',
        marks: '২৫',
        topics: [
          'Textbook Chapters, WH Questions, Rearrange, Sentence Making.'
        ]
      },
      { 
        name: 'গণিত',
        marks: '২৫',
        topics: [
          'চার প্রক্রিয়া সম্পর্কিত সমস্যাবলী, গ.সা.গু ও ল.সা.গু, ভগ্নাংশ ও জ্যামিতি।'
        ]
      },
      { 
        name: 'সাধারণ জ্ঞান ও কুরআন',
        marks: '২৫',
        topics: [
          'প্রাথমিক বিজ্ঞান, সাধারণ জ্ঞান ও মাসিক কিশোরকণ্ঠ।'
        ]
      }
    ]
  },
  {
    id: 7,
    class: 'চতুর্থ শ্রেণি',
    subTitle: 'প্রাথমিক ও ইবতেদায়ী মাধ্যম',
    color: 'indigo',
    totalMarks: '১০০',
    duration: '২ ঘণ্টা',
    subjects: [
      { 
        name: 'বাংলা',
        marks: '২৫',
        topics: [
          'পাঠ্যবইয়ের গল্প-কবিতা, যুক্তবর্ণ ও বাক্য গঠন।'
        ]
      },
      { 
        name: 'English',
        marks: '২৫',
        topics: [
          'Basic Vocabulary, Simple sentences, Translation.'
        ]
      },
      { 
        name: 'গণিত',
        marks: '২৫',
        topics: [
          'যোগ, বিয়োগ, গুণ, ভাগ ও মৌলিক জ্যামিতিক চিত্র।'
        ]
      },
      { 
        name: 'সাধারণ জ্ঞান',
        marks: '২৫',
        topics: [
          'ইসলাম ও সাধারণ জ্ঞান প্রাথমিক প্রশ্নোত্তর এবং কিশোরকণ্ঠ।'
        ]
      }
    ]
  }
];

const getSubjectIcon = (name = "") => {
  const lower = name.toLowerCase();
  if (lower.includes("বাংলা") || lower.includes("bangla")) return HiLanguage;
  if (lower.includes("english") || lower.includes("ইংরেজি")) return HiGlobeAlt;
  if (lower.includes("গণিত") || lower.includes("math")) return HiCalculator;
  if (lower.includes("বিজ্ঞান") || lower.includes("science")) return HiBeaker;
  if (lower.includes("জ্ঞান") || lower.includes("gk") || lower.includes("সাধারণ")) return HiLightBulb;
  return HiBookOpen;
};

const Syllabus = () => {
  const [syllabusList, setSyllabusList] = useState(DEFAULT_SYLLABUS_DATA);
  const [openAccordion, setOpenAccordion] = useState(1); // Default open 10th class

  useEffect(() => {
    getSyllabus().then((data) => {
      if (data && data.length > 0) {
        setSyllabusList(data);
      }
    });
  }, []);

  const toggleAccordion = (id) => {
    setOpenAccordion(openAccordion === id ? null : id);
  };

  return (
    <section className="relative w-full px-3 sm:px-6 py-12 sm:py-16 bg-[#0f1124] text-white border-b border-white/[0.08] font-sans">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Special Notice Box */}
        <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-amber-950/30 via-[#14162b] to-[#14162b] border-2 border-amber-400/40 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center text-2xl shrink-0 shadow-md">
            <HiExclamationTriangle />
          </div>
          <div className="space-y-0.5">
            <h3 className="text-sm sm:text-base font-black text-amber-300">
              বিশেষ নির্দেশিকা ও সিলেবাস গাইডবুক
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              সাধারণ জ্ঞান ও সমসাময়িক বিষয়ের জন্য মাসিক কিশোরকণ্ঠ এবং বিশেষ সংখ্যা <span className="text-amber-400 font-bold">"অন্বেষণ"</span> অধ্যয়ন করা অত্যন্ত ফলপ্রসূ হবে।
            </p>
          </div>
        </div>

        {/* Main Syllabus Card Container */}
        <div className="p-5 sm:p-8 rounded-3xl bg-[#14162b] border border-white/10 shadow-2xl space-y-6">
          
          {/* Card Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/[0.08]">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 flex items-center justify-center text-2xl shadow-md">
                <HiDocumentText />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  শ্রেণিভিত্তিক <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400">সিলেবাস ও মান বণ্টন</span>
                </h2>
                <p className="text-xs text-slate-400">৪র্থ থেকে ১০ম শ্রেণি পর্যন্ত বিষয়ভিত্তিক পূর্ণমান ও অধ্যায়সমূহ</p>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-bold self-start sm:self-auto">
              <HiAcademicCap className="text-sm" />
              <span>{toBengaliNumber(syllabusList.length)} টি শ্রেণি অন্তর্ভুক্ত</span>
            </div>
          </div>

          {/* Accordion List */}
          <div className="space-y-3.5">
            {syllabusList.map((item, index) => {
              const itemId = item.id || index;
              const isOpen = openAccordion === itemId;
              const subjects = Array.isArray(item.subjects) ? item.subjects : [];

              return (
                <div
                  key={itemId}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isOpen
                      ? 'bg-[#090a16] border-indigo-400/50 shadow-xl'
                      : 'bg-[#090a16]/60 border-white/10 hover:border-white/20'
                  }`}
                >
                  {/* Accordion Header Button */}
                  <button
                    type="button"
                    onClick={() => toggleAccordion(itemId)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 transition-transform group-hover:scale-105 ${
                        isOpen
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'bg-white/[0.08] text-slate-300'
                      }`}>
                        <FaBook />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                            {item.class}
                          </h3>
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 text-[10px] sm:text-[11px] font-bold font-mono">
                            পূর্ণমান: {item.totalMarks || "১০০"}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400 font-normal truncate block mt-0.5">
                          {item.subTitle || 'স্কুল ও মাদ্রাসা উভয় মাধ্যম'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                      {item.duration && (
                        <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-slate-400 bg-white/[0.05] px-2.5 py-1 rounded-full border border-white/5">
                          <HiClock className="text-sky-400" />
                          {item.duration}
                        </span>
                      )}
                      <span className="text-xs font-bold text-slate-300 bg-white/[0.06] px-2.5 py-1 rounded-full border border-white/10">
                        {toBengaliNumber(subjects.length)} টি বিষয়
                      </span>
                      <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center bg-white/[0.06] text-white transition-transform duration-300 ease-standard ${
                        isOpen ? 'rotate-180 bg-indigo-600' : ''
                      }`}>
                        <HiChevronDown className="text-sm" />
                      </div>
                    </div>
                  </button>

                  {/* Accordion Body */}
                  <div className={`grid-collapse ${isOpen ? 'is-open' : ''}`}>
                    <div>
                    <div className="p-4 sm:p-6 bg-[#0f1124] border-t border-white/[0.08] space-y-4">
                      
                      {/* Summary Strip (Marks Distribution Quick Bar) */}
                      <div className="p-3 sm:p-4 rounded-xl bg-[#090a16] border border-white/10 flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                          📌 মান বণ্টন ও বিষয় কাঠামো:
                        </span>
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          {subjects.map((sub, sIdx) => (
                            <span
                              key={sIdx}
                              className="px-2.5 py-1 rounded-lg bg-[#14162b] border border-white/10 text-slate-300 font-semibold flex items-center gap-1.5"
                            >
                              <span className="text-white">{sub.name}</span>
                              <span className="text-emerald-400 font-mono font-bold">({sub.marks || "২৫"})</span>
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Subjects Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {subjects.map((sub, sIdx) => {
                          const IconComponent = getSubjectIcon(sub.name);
                          const topics = Array.isArray(sub.topics) ? sub.topics : [];
                          return (
                            <div
                              key={sIdx}
                              className="p-4 rounded-2xl bg-[#14162b] border border-white/10 space-y-3 shadow-md hover:border-indigo-400/30 transition-all"
                            >
                              <div className="flex items-center justify-between text-indigo-300 font-black text-sm border-b border-white/[0.08] pb-2.5">
                                <div className="flex items-center gap-2">
                                  <IconComponent className="text-base text-emerald-400" />
                                  <span>{sub.name}</span>
                                </div>
                                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-mono font-black border border-emerald-500/30">
                                  {sub.marks ? `${sub.marks} নম্বর` : "২৫ নম্বর"}
                                </span>
                              </div>
                              <ul className="space-y-1.5 text-xs text-slate-300">
                                {topics.map((t, tIdx) => (
                                  <li key={tIdx} className="flex items-start gap-2">
                                    <HiCheckCircle className="text-emerald-400 text-sm shrink-0 mt-0.5" />
                                    <span className="leading-relaxed">{t}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
};

export default Syllabus;