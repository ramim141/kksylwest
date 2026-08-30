import React, { useState, useMemo, useEffect } from 'react';
import { 
  HiChevronDown, 
  HiChevronUp,
  HiQuestionMarkCircle,
  HiMagnifyingGlass,
  HiXMark,
  HiPhone,
  HiCheckBadge,
  HiLightBulb,
  HiAcademicCap,
  HiCurrencyDollar,
  HiDocumentText,
  HiShieldCheck,
  HiSparkles,
} from 'react-icons/hi2';
import { FaWhatsapp } from 'react-icons/fa';
import { getFaqs } from '../../services/firestore';

const CATEGORIES = [
  { id: 'all', name: 'সকল প্রশ্ন', icon: HiQuestionMarkCircle },
  { id: 'eligibility', name: 'যোগ্যতা', icon: HiAcademicCap },
  { id: 'registration', name: 'রেজিস্ট্রেশন', icon: HiDocumentText },
  { id: 'exam', name: 'পরীক্ষা পদ্ধতি', icon: HiCheckBadge },
  { id: 'payment', name: 'পেমেন্ট ও ফি', icon: HiCurrencyDollar },
];

const DEFAULT_FAQS = [
  {
    category: 'eligibility',
    question: "মেধাবৃত্তি পরীক্ষায় অংশগ্রহণের যোগ্যতা কী?",
    answer: "৪র্থ থেকে ১০ম শ্রেণির যেকোনো শিক্ষার্থী যারা সিলেট অঞ্চলের যেকোনো শিক্ষাপ্রতিষ্ঠানে নিয়মিত অধ্যয়নরত তারা এই মেধা বৃত্তি পরীক্ষায় অংশ নিতে পারবে।",
    icon: HiAcademicCap,
    badge: "যোগ্যতা",
  },
  {
    category: 'registration',
    question: "অনলাইনে কীভাবে রেজিস্ট্রেশন সম্পন্ন করবো?",
    answer: "আমাদের ওয়েবসাইটের 'অনলাইন রেজিস্ট্রেশন' পেজে গিয়ে ৩টি সহজ ধাপে শিক্ষার্থীর তথ্য, ছবি এবং বিকাশ/নগদ ফি ট্রানজেকশন আইডি দিয়ে আবেদন জমা দিন। সাথে সাথেই ট্র্যাকিং নম্বর সহ ডিজিটাল স্লিপ পেয়ে যাবেন।",
    icon: HiDocumentText,
    badge: "রেজিস্ট্রেশন",
  },
  {
    category: 'registration',
    question: "পরীক্ষার প্রবেশপত্র (Admit Card) কীভাবে ডাউনলোড করবো?",
    answer: "আবেদন অনুমোদিত হওয়ার পর অথবা পরীক্ষার পূর্বে আপনার রোল নম্বর, ট্র্যাকিং আইডি অথবা মোবাইল নম্বর দিয়ে 'প্রবেশপত্র' পেজ থেকে ১-ক্লিকেই রঙ্গিন এডমিট কার্ড ডাউনলোড ও প্রিন্ট করতে পারবেন।",
    icon: HiDocumentText,
    badge: "এডমিট কার্ড",
  },
  {
    category: 'payment',
    question: "আবেদন ফি কত এবং কীভাবে প্রদান করতে হবে?",
    answer: "মেধাবৃত্তি পরীক্ষার নিবন্ধন ফি মাত্র ১০০ টাকা। নির্দিষ্ট বিকাশ/নগদ নম্বরে সেন্ড মানি বা পেমেন্ট করে TrxID ফর্মে উল্লেখ করতে হবে।",
    icon: HiCurrencyDollar,
    badge: "ফি ও পেমেন্ট",
  },
  {
    category: 'exam',
    question: "পরীক্ষার বিষয় ও মানবণ্টন কেমন হবে?",
    answer: "পরীক্ষা পূর্ণাঙ্গ MCQ পদ্ধতিতে ১০০ নম্বরে অনুষ্ঠিত হবে। ৪র্থ থেকে ১০ম শ্রেণির শিক্ষার্থীদের জন্য প্রতিটি সঠিক উত্তরের মান ১ নম্বর। সময় থাকবে ১ ঘণ্টা ১৫ মিনিট।",
    icon: HiCheckBadge,
    badge: "মানবণ্টন",
  },
  {
    category: 'exam',
    question: "সাধারণ জ্ঞানের জন্য কোন কোন বিষয় পড়তে হবে?",
    answer: "সাধারণ জ্ঞান অংশের জন্য সমসাময়িক গুরুত্বপূর্ণ সাধারণ জ্ঞান ও বিজ্ঞান বিষয়ের পাশাপাশি মাসিক কিশোরকণ্ঠ ম্যাগাজিন এবং বিশেষ সংখ্যা 'অন্বেষণ' থেকে প্রশ্ন প্রণয়ন করা হবে।",
    icon: HiLightBulb,
    badge: "সিলেবাস",
  },
  {
    category: 'exam',
    question: "পরীক্ষায় উত্তীর্ণদের কী কী পুরস্কার ও সম্মাননা দেওয়া হয়?",
    answer: "ট্যালেন্টপুল ও সাধারণ গ্রেডে উত্তীর্ণ কৃতী শিক্ষার্থীদের নগদ প্রাইজমানি বৃত্তি, সম্মাননা ক্রেস্ট, ডিজিটাল সনদপত্র ও আকর্ষণীয় শিক্ষাসামগ্রী প্রদান করা হয়।",
    icon: HiCheckBadge,
    badge: "পুরস্কার",
  },
  {
    category: 'exam',
    question: "পরীক্ষার দিন কেন্দ্রে কী কী সাথে আনতে হবে?",
    answer: "প্রবেশপত্র (Admit Card) সাথে আনা বাধ্যতামূলক। এছাড়া প্রয়োজনীয় বলপেন কলম, পেন্সিল, জ্যামিতি বক্স ও ক্যালকুলেটর (প্রযোজ্য ক্ষেত্রে) সাথে আনতে হবে। মোবাইল ফোন সম্পূর্ণ নিষিদ্ধ।",
    icon: HiShieldCheck,
    badge: "নিয়মাবলী",
  },
];

const FAQ = () => {
  const [faqsList, setFaqsList] = useState(DEFAULT_FAQS);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openIndex, setOpenIndex] = useState(0);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const categoryScrollRef = React.useRef(null);

  useEffect(() => {
    getFaqs().then((data) => {
      if (data && data.length > 0) {
        const formatted = data.map((f, i) => {
          const def = DEFAULT_FAQS[i % DEFAULT_FAQS.length];
          return {
            category: f.category || def.category,
            question: f.question,
            answer: f.answer,
            icon: def.icon,
            badge: f.badge || def.badge,
          };
        });
        setFaqsList(formatted);
      }
    });
  }, []);

  const handleCategoryClick = (catId, index) => {
    setSelectedCategory(catId);
    setActiveCategoryIndex(index);
    if (categoryScrollRef.current) {
      const container = categoryScrollRef.current;
      const buttons = container.querySelectorAll('button');
      const targetBtn = buttons[index];
      if (targetBtn) {
        const btnLeft = targetBtn.offsetLeft;
        const btnWidth = targetBtn.offsetWidth;
        const containerWidth = container.offsetWidth;
        const targetScrollLeft = btnLeft - (containerWidth / 2) + (btnWidth / 2);
        
        container.scrollTo({
          left: Math.max(0, targetScrollLeft),
          behavior: 'smooth'
        });
      }
    }
  };

  const handleScroll = () => {
    if (!categoryScrollRef.current) return;
    const container = categoryScrollRef.current;
    const scrollLeft = container.scrollLeft;
    const maxScrollLeft = container.scrollWidth - container.clientWidth;
    
    if (maxScrollLeft > 0) {
      const scrollRatio = scrollLeft / maxScrollLeft;
      const index = Math.round(scrollRatio * (CATEGORIES.length - 1));
      setActiveCategoryIndex(index);
    }
  };

  const filteredFAQs = useMemo(() => {
    return faqsList.filter((faq) => {
      const matchCategory = selectedCategory === 'all' || faq.category === selectedCategory;
      const matchSearch =
        searchQuery.trim() === '' ||
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [faqsList, selectedCategory, searchQuery]);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <section className="relative w-full px-3 sm:px-6 py-12 sm:py-16 md:py-20 bg-[#0f1124] text-white border-b border-white/[0.08] overflow-x-clip">
      {/* Background Soft Glow */}
      <div className="pointer-events-none absolute -left-20 top-1/2 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto space-y-8 sm:space-y-10 relative z-10 w-full">
        
        {/* Section Header */}
        <div className="text-center space-y-2 sm:space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-xs font-bold uppercase tracking-wider">
            <HiSparkles className="text-sm text-amber-400" />
            <span>সচরাচর জিজ্ঞাসা • FAQ</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            মেধাবৃত্তি সংক্রান্ত <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400">
              সাধারণ প্রশ্নোত্তর
            </span>
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
            পরীক্ষা, রেজিস্ট্রেশন ও ফলাফল সম্পর্কিত আপনার প্রয়োজনীয় সকল প্রশ্নের সহজ উত্তর।
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-xl mx-auto">
          <div className="relative">
            <HiMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="আপনার প্রশ্নটি খুঁজুন (যেমন: প্রবেশপত্র, ফি)..."
              className="w-full pl-10 pr-9 py-2.5 bg-[#090a16] border border-white/15 rounded-xl text-xs sm:text-sm font-semibold text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-400 shadow-md"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <HiXMark />
              </button>
            )}
          </div>
        </div>

        {/* Category Chips & Mobile Dots Slider */}
        <div className="space-y-2.5 w-full max-w-full">
          <div 
            ref={categoryScrollRef}
            onScroll={handleScroll}
            className="flex items-center sm:justify-center overflow-x-auto pb-1.5 scrollbar-none px-3 sm:px-0 scroll-smooth w-full max-w-full"
          >
            <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#14162b] border border-white/10 shadow-lg shrink-0">
              {CATEGORIES.map((cat, index) => {
                const Icon = cat.icon;
                const active = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategoryClick(cat.id, index)}
                    className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                      active
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25 scale-102'
                        : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
                    }`}
                  >
                    <Icon className="text-sm shrink-0" />
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mobile Dot-Dot Indicator */}
          <div className="flex sm:hidden items-center justify-center gap-1.5 pt-0.5">
            {CATEGORIES.map((cat, idx) => {
              const isSelected = selectedCategory === cat.id;
              const isActive = activeCategoryIndex === idx || isSelected;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryClick(cat.id, idx)}
                  className={`transition-all duration-300 rounded-full cursor-pointer ${
                    isActive
                      ? 'w-5 h-1.5 bg-gradient-to-r from-indigo-500 to-emerald-400 shadow-sm shadow-indigo-500/50'
                      : 'w-1.5 h-1.5 bg-white/20 hover:bg-white/40'
                  }`}
                  aria-label={cat.name}
                />
              );
            })}
          </div>
        </div>

        {/* Accordion FAQ Cards List */}
        <div className="space-y-3 max-w-4xl mx-auto">
          {filteredFAQs.length > 0 ? (
            filteredFAQs.map((faq, index) => {
              const Icon = faq.icon || HiQuestionMarkCircle;
              const isOpen = openIndex === index;

              return (
                <div
                  key={index}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isOpen
                      ? 'bg-[#14162b] border-indigo-400/40 shadow-xl'
                      : 'bg-[#14162b]/70 border-white/10 hover:border-white/20'
                  }`}
                >
                  {/* Header Button */}
                  <button
                    type="button"
                    onClick={() => toggleFAQ(index)}
                    aria-expanded={isOpen}
                    className="flex items-center justify-between w-full gap-3 p-4 text-left cursor-pointer select-none sm:p-5 press"
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-base sm:text-lg shrink-0 transition-colors shadow-md ${
                          isOpen
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white/[0.08] text-indigo-400'
                        }`}
                      >
                        <Icon />
                      </div>

                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">
                          {faq.badge}
                        </span>
                        <h3 className="text-xs sm:text-base font-bold text-white leading-snug">
                          {faq.question}
                        </h3>
                      </div>
                    </div>

                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white shrink-0 transition-transform duration-300 ease-standard ${
                      isOpen ? 'rotate-180 bg-indigo-600' : 'bg-white/[0.08]'
                    }`}>
                      <HiChevronDown className="text-sm" />
                    </div>
                  </button>

                  {/* Expanded Answer Content — always mounted inside a
                      0fr/1fr grid so the panel animates its real height
                      instead of popping open. */}
                  <div className={`grid-collapse ${isOpen ? 'is-open' : ''}`}>
                    <div>
                      <div
                        className={`px-4 pb-4 sm:px-6 sm:pb-5 text-xs sm:text-sm text-slate-300 leading-relaxed font-normal border-t border-white/[0.08] mt-1 pt-3 transition-opacity duration-300 ease-standard ${
                          isOpen ? 'opacity-100' : 'opacity-0'
                        }`}
                      >
                        <p>{faq.answer}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center bg-[#14162b] rounded-2xl border border-dashed border-white/10 space-y-2">
              <HiQuestionMarkCircle className="text-3xl text-slate-500 mx-auto" />
              <p className="text-xs sm:text-sm font-bold text-slate-300">
                কোনো প্রশ্ন পাওয়া যায়নি।
              </p>
              <button
                type="button"
                onClick={() => { setSearchQuery(''); handleCategoryClick('all', 0); }}
                className="text-xs text-indigo-400 font-bold underline"
              >
                সব প্রশ্ন দেখুন
              </button>
            </div>
          )}
        </div>

        {/* Contact Helpline Banner */}
        <div className="p-6 sm:p-8 rounded-3xl border border-white/10 bg-gradient-to-r from-indigo-950/40 via-[#14162b] to-[#14162b] text-white flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-2xl max-w-4xl mx-auto">
          <div className="space-y-1">
            <h4 className="text-sm sm:text-base font-black text-white">
              আপনার প্রশ্নের উত্তর পাননি?
            </h4>
            <p className="text-xs text-slate-300">
              আমাদের হেল্পডেস্কে সরাসরি যোগাযোগ করে বিস্তারিত তথ্য জেনে নিন।
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <a
              href="https://wa.me/8801962633662"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-[#25d366] hover:bg-[#20ba59] text-white font-bold text-xs flex items-center gap-1.5 transition-transform hover:scale-105 shadow-md"
            >
              <FaWhatsapp className="text-sm" />
              <span>হোয়াটসঅ্যাপ</span>
            </a>

            <a
              href="tel:+8801962633662"
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition-transform hover:scale-105 shadow-md"
            >
              <HiPhone className="text-sm" />
              <span>হটলাইন</span>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};

export default FAQ;