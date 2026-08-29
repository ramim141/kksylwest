import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  HiChatBubbleLeftRight,
  HiXMark,
  HiPaperAirplane,
  HiSparkles,
  HiQuestionMarkCircle,
  HiAcademicCap,
  HiCheckCircle,
  HiPhone,
  HiEnvelope,
  HiUser,
  HiInformationCircle,
  HiArrowPath,
  HiTrophy,
  HiBookOpen,
  HiBuildingLibrary,
  HiIdentification,
  HiCurrencyBangladeshi,
  HiCalendarDays,
  HiMapPin,
  HiShieldExclamation,
} from "react-icons/hi2";
import { FaRobot, FaWhatsapp } from "react-icons/fa";
import { sendMessage, getFaqs } from "../../services/firestore";

// Comprehensive Pre-built Knowledge Base
const DEFAULT_FAQ_KNOWLEDGE = [
  {
    id: "reg-process",
    chip: "রেজিস্ট্রেশন কীভাবে করব?",
    keywords: [
      "রেজিস্ট্রেশন",
      "আবেদন",
      "ফরম",
      "ভর্তি",
      "online registration",
      "register",
      "apply",
      "কীভাবে আবেদন",
      "রেজিস্ট্রেশন করার নিয়ম",
    ],
    title: "অনলাইন রেজিস্ট্রেশন প্রক্রিয়া",
    answer:
      "🎓 অনলাইনে রেজিস্ট্রেশন করতে উপরের মেনু থেকে 'রেজিস্ট্রেশন' অপশনে যান অথবা /register লিংকে ক্লিক করুন। শিক্ষার্থীর ব্যক্তিগত তথ্য, ছবি এবং ফি পরিশোধের ট্রানজেকশন আইডি (TrxID) দিয়ে ফর্ম সাবমিট করলেই তাৎক্ষণিক ট্র্যাকিং আইডি ও প্রিন্টযোগ্য প্রবেশপত্র পাবেন।",
    link: "/register",
    linkText: "অনলাইন রেজিস্ট্রেশন করুন →",
  },
  {
    id: "fees-payment",
    chip: "আবেদন ফি কত ও কীভাবে দেব?",
    keywords: [
      "ফি",
      "টাকা",
      "পেমেন্ট",
      "বিকাশ",
      "নগদ",
      "fee",
      "payment",
      "charge",
      "cost",
      "কত টাকা",
      "বিকাশ নম্বর",
    ],
    title: "আবেদন ফি ও পেমেন্ট পদ্ধতি",
    answer:
      "💳 কিশোরকণ্ঠ মেধাবৃত্তি পরীক্ষার আবেদন ফি মাত্র ১৫০ টাকা। আমাদের বিকাশ/নগদ মার্চেন্ট অথবা পার্সোনাল নম্বরে (০১৭০০-০০০০০০) 'Send Money' বা 'Payment' করে ট্রানজেকশন আইডি দিয়ে আবেদন করতে হবে। সরাসরি অনুমোদিত লাইব্রেরিতেও নগদ ফি দেওয়া যায়।",
    link: "/register",
    linkText: "রেজিস্ট্রেশন ও পেমেন্ট তথ্য →",
  },
  {
    id: "eligibility",
    chip: "কারা পরীক্ষা দিতে পারবে?",
    keywords: [
      "যোগ্যতা",
      "কারা",
      "শ্রেণি",
      "ক্লাস",
      "eligibility",
      "class",
      "school",
      "madrasa",
      "মাদরাসা",
      "স্কুল",
    ],
    title: "অংশগ্রহণের যোগ্যতা ও শ্রেণি",
    answer:
      "🏫 ৪র্থ শ্রেণি থেকে ১০ম শ্রেণি পর্যন্ত সিলেট জেলা ও আশেপাশের সকল সরকারি, বেসরকারি স্কুল এবং মাদরাসার নিয়মিত শিক্ষার্থীরা এই পরীক্ষায় অংশগ্রহণ করতে পারবে। পূর্ববর্তী ক্লাসে ন্যূনতম ৬০% বা জিপিএ ৩.০০ থাকতে হবে।",
    link: "/about",
    linkText: "আমাদের সম্পর্কে বিস্তারিত →",
  },
  {
    id: "syllabus-marks",
    chip: "সিলেবাস ও মানবন্টন কী?",
    keywords: [
      "সিলেবাস",
      "মানবন্টন",
      "বিষয়",
      "নম্বর",
      "marks",
      "syllabus",
      "subject",
      "pattern",
      "প্রশ্ন পদ্ধতি",
    ],
    title: "পরীক্ষার বিষয় ও মানবন্টন",
    answer:
      "📚 প্রতিটি শ্রেণির জন্য ১০০ নম্বরের পরীক্ষা অনুষ্ঠিত হয়। সময় ২ ঘণ্টা। বিষয়সমূহ:\n• বাংলা: ২৫ নম্বর\n• ইংরেজি: ২৫ নম্বর\n• গণিত: ২৫ নম্বর\n• বিজ্ঞান ও সাধারণ জ্ঞান: ২৫ নম্বর\nপরীক্ষায় বহুনির্বাচনী (MCQ) এবং সংক্ষিপ্ত বর্ণনামূলক প্রশ্ন থাকবে।",
    link: "/scholarship",
    linkText: "শ্রেণিভিত্তিক পূর্ণাঙ্গ সিলেবাস →",
  },
  {
    id: "gk-magazines",
    chip: "সাধারণ জ্ঞানের জন্য কী পড়ব?",
    keywords: [
      "সাধারণ জ্ঞান",
      "ম্যাগাজিন",
      "কিশোরকণ্ঠ",
      "অন্বেষণ",
      "gk",
      "general knowledge",
      "magazine",
      "বই",
    ],
    title: "সাধারণ জ্ঞান ও সহায়ক বই",
    answer:
      "📖 সাধারণ জ্ঞানের প্রস্তুতির জন্য চলতি বছরের জানুয়ারি থেকে জুলাই পর্যন্ত প্রকাশিত 'মাসিক কিশোরকণ্ঠ' ম্যাগাজিন এবং বিশেষ সংখ্যা 'অন্বেষণ' থেকে প্রশ্ন থাকবে। সিলেটের অনুমোদিত সকল লাইব্রেরিতে এই বইগুলো পাওয়া যায়।",
    link: "/scholarship",
    linkText: "সিলেবাস ও বইয়ের তথ্য →",
  },
  {
    id: "result-photocard",
    chip: "রেজাল্ট কীভাবে দেখব?",
    keywords: [
      "রেজাল্ট",
      "ফলাফল",
      "রোল",
      "result",
      "search",
      "photo card",
      "ফটো কার্ড",
      "পাস",
      "কবে রেজাল্ট",
    ],
    title: "ফলাফল ও সোশ্যাল ফটো কার্ড",
    answer:
      "🏆 ফলাফল দেখতে উপরের মেনু থেকে 'রেজাল্ট' পেজে যান (/search)। আপনার রোল নম্বর প্রবেশ করিয়ে 'ফলাফল দেখুন' বাটনে ক্লিক করলেই রেজাল্ট দেখতে পাবেন। সেখান থেকে গর্জিয়াস সোশ্যাল ফটো কার্ড (HD PNG) ডাউনলোড ও সরাসরি Facebook/WhatsApp এ শেয়ার করতে পারবেন।",
    link: "/search",
    linkText: "ফলাফল চেক ও ফটো কার্ড →",
  },
  {
    id: "awards-money",
    chip: "বৃত্তির পুরষ্কার কী কী?",
    keywords: [
      "পুরষ্কার",
      "বৃত্তি",
      "ট্যালেন্টপুল",
      "টাকা",
      "ক্রেস্ট",
      "সার্টিফিকেট",
      "award",
      "prize",
      "scholarship prize",
    ],
    title: "মেধাবৃত্তি পুরষ্কার ও সুবিধাসমূহ",
    answer:
      "🎁 মেধাবৃত্তিতে উত্তীর্ণ শিক্ষার্থীদের জন্য রয়েছে:\n১. ট্যালেন্টপুল বৃত্তি: এককালীন আকর্ষণীয় নগদ অর্থ, বিশেষ মেডেল, ট্রফি ও সনদ।\n২. সাধারণ বৃত্তি: নগদ অর্থ, ক্রেস্ট ও সনদ।\n৩. বিশেষ গ্রেড: শিক্ষা উপকরণ (বই, ব্যাগ, ডায়রি) ও সনদ।\nউত্তীর্ণ সকল শিক্ষার্থীকে জমকালো অনুষ্ঠানের মাধ্যমে পুরস্কৃত করা হয়।",
    link: "/scholarship",
    linkText: "বৃত্তি স্কিম বিস্তারিত →",
  },
  {
    id: "upazila-centers",
    chip: "উপজেলা লাইব্রেরি ও কেন্দ্রসমূহ",
    keywords: [
      "উপজেলা",
      "লাইব্রেরি",
      "ফরম পাওয়ার স্থান",
      "কেন্দ্র",
      "শাখা",
      "সদর",
      "দক্ষিণ সুরমা",
      "বিশ্বনাথ",
      "ওসমানীনগর",
      "বালাগঞ্জ",
      "জগন্নাথপুর",
      "ছাতক",
      "দোয়ারাবাজার",
      "library",
      "upazila",
    ],
    title: "৮টি উপজেলার কেন্দ্র ও অনুমোদিত লাইব্রেরি",
    answer:
      "🏛️ সিলেট জেলা পশ্চিমের ৮টি উপজেলার কেন্দ্র ও লাইব্রেরিসমূহ:\n১. সিলেট সদর (আরিফ বুক হাউজ, রিকাবীবাজার)\n২. দক্ষিণ সুরমা (সুরমা লাইব্রেরি, স্টেশন রোড)\n৩. বিশ্বনাথ (আল-ফালাহ লাইব্রেরি)\n৪. ওসমানীনগর (তাজপুর লাইব্রেরি)\n৫. বালাগঞ্জ (বালাগঞ্জ বুক ডিপো)\n৬. জগন্নাথপুর (পৌর বুক সেন্টার)\n৭. ছাতক (সুরমা বুক স্টল)\n৮. দোয়ারাবাজার (দোয়ারাবাজার লাইব্রেরি)।",
    link: "/scholarship",
    linkText: "সকল উপজেলার ফোন নম্বর দেখুন →",
  },
  {
    id: "exam-rules",
    chip: "পরীক্ষার হলে কী কী আনা যাবে?",
    keywords: [
      "হল",
      "নিয়ম",
      "অনুমতি",
      "ক্যালকুলেটর",
      "মোবাইল",
      "rules",
      "hall",
      "exam rules",
      "forbidden",
      "নিষিদ্ধ",
    ],
    title: "পরীক্ষার হলের নিয়মাবলী ও নির্দেশিকা",
    answer:
      "📝 পরীক্ষার দিন সাথে আনতে হবে: রঙিন/সাদা-কালো প্রবেশপত্র (Admit Card), কালো বলপেন কলম, পেন্সিল ও স্কেল।\n❌ সম্পূর্ণ নিষিদ্ধ: ক্যালকুলেটর, মোবাইল ফোন, ডিজিটাল ঘড়ি বা যেকোনো ইলেকট্রনিক ডিভাইস।",
    link: "/notice",
    linkText: "পরীক্ষা সংক্রান্ত নিয়মাবলী →",
  },
  {
    id: "committee-about",
    chip: "পরিচালনা পর্ষদ ও উদ্দেশ্য",
    keywords: [
      "কিশোরকণ্ঠ ফোরাম",
      "কমিটি",
      "পরিচালনা পর্ষদ",
      "উদ্দেশ্য",
      "টিম",
      "about",
      "committee",
      "patron",
    ],
    title: "কিশোরকণ্ঠ পাঠক ফোরাম ও পরিচালনা পর্ষদ",
    answer:
      "🌟 কিশোরকণ্ঠ পাঠক ফোরাম একটি অরাজনৈতিক, সামাজিক ও সাংস্কৃতিক ছাত্র সংগঠন। তরুণ প্রজন্মকে নৈতিক, দক্ষ ও আদর্শ নাগরিক হিসেবে গড়ে তুলতে প্রতি বছর মেধাবৃত্তি পরীক্ষা ও নানামুখী শিক্ষামূলক কার্যক্রম পরিচালনা করে থাকে।",
    link: "/about",
    linkText: "পরিচালনা পর্ষদের তালিকা দেখুন →",
  },
  {
    id: "helpline-contact",
    chip: "জরুরি হেল্পলাইন ও অফিস",
    keywords: [
      "যোগাযোগ",
      "ফোন",
      "হেল্পলাইন",
      "ঠিকানা",
      "নাম্বার",
      "অফিস",
      "ম্যাপ",
      "contact",
      "helpline",
      "phone",
      "address",
    ],
    title: "অফিসের ঠিকানা ও হেল্পলাইন",
    answer:
      "📍 কেন্দ্রীয় অফিস: নিয়ামাহ্ টাওয়ার (২য় তলা), ভিআইপি রোড, লামাবাজার, সিলেট।\n📞 হেল্পলাইন: ০১৭০০-০০০০০০, ০১৮০০-০০০০০০\n⏰ অফিস সময়: সকাল ৯:০০ টা থেকে রাত ৮:০০ টা পর্যন্ত।",
    link: "/contact",
    linkText: "যোগাযোগ পেজে যান →",
  },
];

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text: "আসসালামু আলাইকুম! 👋 আমি কিশোরকণ্ঠ মেধাবৃত্তি ভার্চুয়াল সহকারী। মেধাবৃত্তি পরীক্ষা, রেজিস্ট্রেশন, সিলেবাস, উপজেলা কেন্দ্র বা রেজাল্ট সম্পর্কে যেকোনো প্রশ্ন জিজ্ঞেস করতে পারেন!",
      time: "এখন",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [leadFormMode, setLeadFormMode] = useState(false);
  const [leadData, setLeadData] = useState({ name: "", phone: "", message: "" });
  const [submittingLead, setSubmittingLead] = useState(false);
  const [dynamicFaqs, setDynamicFaqs] = useState([]);
  const messagesEndRef = useRef(null);

  // Load dynamic FAQs from Firestore to index admin questions
  useEffect(() => {
    getFaqs().then((data) => {
      if (data && data.length > 0) {
        setDynamicFaqs(data);
      }
    });
  }, []);

  // Combined Knowledge Base
  const allKnowledge = useMemo(() => {
    const list = [...DEFAULT_FAQ_KNOWLEDGE];

    dynamicFaqs.forEach((faq, idx) => {
      const words = (faq.question || "").toLowerCase().split(/\s+/).filter(Boolean);
      list.push({
        id: `dyn-${faq.id || idx}`,
        chip: faq.question?.slice(0, 24) + "...",
        keywords: [faq.question?.toLowerCase(), ...words],
        title: faq.question,
        answer: faq.answer,
        link: "/scholarship",
        linkText: "বিস্তারিত তথ্য →",
      });
    });

    return list;
  }, [dynamicFaqs]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  const handleSendMessage = async (textToSend = inputText) => {
    const query = textToSend.trim();
    if (!query) return;

    // Add user message
    const userMsg = {
      id: Date.now(),
      sender: "user",
      text: query,
      time: new Date().toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    // Bot matching response logic
    setTimeout(() => {
      const lowerQuery = query.toLowerCase();

      // Find matching knowledge item
      const matched = allKnowledge.find((item) =>
        item.keywords.some((kw) => kw && lowerQuery.includes(kw))
      );

      let botReply;
      if (matched) {
        botReply = {
          id: Date.now() + 1,
          sender: "bot",
          text: matched.answer,
          link: matched.link,
          linkText: matched.linkText,
          time: new Date().toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit" }),
        };
      } else {
        botReply = {
          id: Date.now() + 1,
          sender: "bot",
          text: "ধন্যবাদ আপনার বার্তার জন্য! 😊 আপনার সুনির্দিষ্ট প্রশ্নের উত্তর দিতে সরাসরি আমাদের দায়িত্বে নিয়োজিত প্রতিনিধির কাছে বার্তা পাঠাতে পারেন।",
          showFormAction: true,
          time: new Date().toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit" }),
        };
      }

      setMessages((prev) => [...prev, botReply]);
      setIsTyping(false);
    }, 500);
  };

  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    if (!leadData.name || !leadData.phone || !leadData.message) return;

    setSubmittingLead(true);
    try {
      await sendMessage({
        name: leadData.name.trim(),
        email: "chatbot-inquiry@kishorkantho.org",
        phone: leadData.phone.trim(),
        subject: "Chatbot Query: " + leadData.name,
        message: leadData.message.trim(),
        source: "chatbot",
      });

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          sender: "bot",
          text: `🎉 ধন্যবাদ ${leadData.name}! আপনার বার্তাটি সফলভাবে ইনবক্সে জমা হয়েছে। আমাদের প্রতিনিধি দ্রুত আপনার সাথে ফোনে (${leadData.phone}) যোগাযোগ করবেন।`,
          time: new Date().toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      setLeadFormMode(false);
      setLeadData({ name: "", phone: "", message: "" });
    } catch (err) {
      console.error(err);
      alert("বার্তা পাঠাতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।");
    } finally {
      setSubmittingLead(false);
    }
  };

  return (
    <div className="fixed bottom-20 right-3 sm:bottom-5 sm:right-5 z-50 font-sans print:hidden">
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 p-3.5 sm:px-4 sm:py-3.5 rounded-full bg-gradient-to-r from-primary-container via-tertiary-container to-tertiary-container hover:from-primary-700 hover:to-tertiary-700 text-white font-bold shadow-overlay hover:scale-105 transition-all duration-300 cursor-pointer border-2 border-primary/40"
          aria-label="সহায়তা চ্যাটবট"
        >
          <div className="relative">
            <FaRobot className="text-xl sm:text-2xl animate-bounce" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-secondary rounded-full border-2 border-primary/40 animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-secondary rounded-full border-2 border-primary/40" />
          </div>
          <span className="text-xs sm:text-sm tracking-wide hidden sm:inline-block">
            মেধাবৃত্তি হেল্পডেস্ক
          </span>
        </button>
      )}

      {/* Chat Window Dialog */}
      {isOpen && (
        <div className="w-[94vw] max-w-[410px] h-[520px] sm:h-[580px] max-h-[82vh] bg-surface text-white rounded-xl sm:rounded-[2.5rem] border-2 border-primary/30 shadow-overlay flex flex-col overflow-hidden animate-fadeIn backdrop-blur-xl">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-primary-800 via-tertiary-800 to-surface border-b border-primary/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-container/20 border border-primary/40 flex items-center justify-center text-primary-300 text-xl">
                <FaRobot />
              </div>
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                  মেধাবৃত্তি সহায়ক বট <HiSparkles className="text-secondary text-xs" />
                </h3>
                <span className="text-[10px] text-primary-300/90 font-medium flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-primary inline-block animate-pulse" />
                  সার্বক্ষণিক সক্রিয় • {DEFAULT_FAQ_KNOWLEDGE.length + dynamicFaqs.length} টি প্রশ্নের উত্তর
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded text-ink-body hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <HiXMark className="text-xl" />
            </button>
          </div>

          {/* Quick FAQ Chips - Smooth Scroll without visible scrollbar */}
          <div className="p-2.5 bg-surface-lowest/70 border-b border-line-soft overflow-x-auto flex items-center gap-1.5 scrollbar-none">
            <button
              onClick={() => setLeadFormMode(true)}
              className="px-2.5 py-1 rounded-full bg-gradient-to-r from-secondary-container/20 to-secondary-container/20 text-secondary border border-secondary/40 text-[11px] font-bold whitespace-nowrap transition cursor-pointer flex-shrink-0"
            >
              ✍️ সরাসরি বার্তা পাঠান
            </button>
            {DEFAULT_FAQ_KNOWLEDGE.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSendMessage(item.chip)}
                className="px-2.5 py-1 rounded-full bg-surface-card hover:bg-primary-container/30 text-ink-body hover:text-primary-300 border border-line-soft hover:border-primary/40 text-[11px] font-semibold whitespace-nowrap transition cursor-pointer flex-shrink-0"
              >
                {item.chip}
              </button>
            ))}
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-gradient-to-b from-surface/90 to-surface-lowest/90 scrollbar-slim">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[85%] p-3.5 rounded-lg text-xs leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-primary-container text-white rounded-br-none"
                      : "bg-surface-card/90 text-ink-body border border-line-soft/80 rounded-bl-none"
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>

                  {/* Optional Action Link */}
                  {msg.link && (
                    <div className="mt-2.5 pt-2 border-t border-line-soft/60">
                      <a
                        href={msg.link}
                        onClick={() => setIsOpen(false)}
                        className="inline-block px-3 py-1 bg-primary-container/20 text-primary-300 hover:bg-primary-container/30 border border-primary/40 rounded text-[11px] font-bold transition"
                      >
                        {msg.linkText}
                      </a>
                    </div>
                  )}

                  {/* Optional Trigger Direct Form */}
                  {msg.showFormAction && !leadFormMode && (
                    <div className="mt-2.5 pt-2 border-t border-line-soft/60">
                      <button
                        onClick={() => setLeadFormMode(true)}
                        className="inline-block px-3 py-1 bg-secondary-container/20 text-secondary hover:bg-secondary-container/30 border border-secondary/40 rounded text-[11px] font-bold transition cursor-pointer"
                      >
                        ✍️ অ্যাডমিনের কাছে বার্তা পাঠান
                      </button>
                    </div>
                  )}
                </div>
                <span className="text-[9px] text-ink-muted mt-1 px-1">{msg.time}</span>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-1.5 p-3 rounded-lg bg-surface-card/60 border border-line-soft/60 text-ink-muted text-xs w-20">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce delay-100" />
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce delay-200" />
              </div>
            )}

            {/* Direct Message Form Embedded */}
            {leadFormMode && (
              <div className="p-4 bg-surface-lowest border border-primary/40 rounded-lg space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between pb-1 border-b border-line-soft">
                  <span className="text-xs font-bold text-primary flex items-center gap-1">
                    <HiEnvelope /> অ্যাডমিনকে সরাসরি বার্তা
                  </span>
                  <button
                    type="button"
                    onClick={() => setLeadFormMode(false)}
                    className="text-ink-muted hover:text-white text-xs"
                  >
                    ✕
                  </button>
                </div>
                <form onSubmit={handleLeadSubmit} className="space-y-2.5">
                  <input
                    type="text"
                    placeholder="আপনার নাম *"
                    required
                    value={leadData.name}
                    onChange={(e) =>
                      setLeadData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full px-3 py-1.5 bg-surface border border-line-soft rounded text-white text-xs focus:outline-none focus:border-primary/40"
                  />
                  <input
                    type="tel"
                    placeholder="ফোন নম্বর *"
                    required
                    value={leadData.phone}
                    onChange={(e) =>
                      setLeadData((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    className="w-full px-3 py-1.5 bg-surface border border-line-soft rounded text-white text-xs focus:outline-none focus:border-primary/40"
                  />
                  <textarea
                    rows={2}
                    placeholder="আপনার বার্তা বা প্রশ্ন লিখুন *"
                    required
                    value={leadData.message}
                    onChange={(e) =>
                      setLeadData((prev) => ({ ...prev, message: e.target.value }))
                    }
                    className="w-full px-3 py-1.5 bg-surface border border-line-soft rounded text-white text-xs focus:outline-none focus:border-primary/40 resize-none"
                  />
                  <button
                    type="submit"
                    disabled={submittingLead}
                    className="w-full py-2 bg-gradient-to-r from-primary-container to-tertiary-container hover:from-primary-container hover:to-tertiary-container text-white font-bold rounded text-xs transition cursor-pointer disabled:opacity-50"
                  >
                    {submittingLead ? "পাঠানো হচ্ছে..." : "বার্তা পাঠান"}
                  </button>
                </form>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 bg-surface-lowest border-t border-line-soft">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="যেকোনো প্রশ্ন বাংলায় লিখুন..."
                className="flex-1 px-4 py-2.5 bg-surface border border-line-soft rounded text-white text-xs focus:outline-none focus:border-primary/40"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-2.5 bg-primary-container hover:bg-primary-container disabled:opacity-40 text-white rounded transition cursor-pointer flex-shrink-0"
              >
                <HiPaperAirplane className="text-sm" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatbotWidget;
