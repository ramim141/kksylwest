import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  writeBatch, 
  serverTimestamp 
} from "firebase/firestore";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyALx5IGaXfSbEX0_7BAjEuSUMZpg1Y2cKo",
  authDomain: "kksylhetwest-fc4d5.firebaseapp.com",
  projectId: "kksylhetwest-fc4d5",
  storageBucket: "kksylhetwest-fc4d5.firebasestorage.app",
  messagingSenderId: "228633042318",
  appId: "1:228633042318:web:4a890ea37efde2f929d8df",
  measurementId: "G-765Z5S8XZR",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log("🔥 Initialized Firebase connection to:", firebaseConfig.projectId);

// ==================== 1. SITE SETTINGS ====================
const SITE_SETTINGS = {
  contact_info: {
    organizationName: "কিশোরকণ্ঠ পাঠক ফোরাম",
    branchName: "সিলেট জেলা পশ্চিম",
    establishedYear: "১৯৯৪",
    bio: "নৈতিকতা ও মেধার সমন্বয়ে এক নতুন প্রজন্ম গড়ার প্রত্যয়ে আমাদের অবিরাম পথচলা। শিক্ষার্থীদের মেধা বিকাশ ও সুস্থ সংস্কৃতির বিস্তারে নিবেদিতপ্রাণ।",
    helplinePrimary: "০১৯৬২-৬৩৩৬৬২",
    helplineSecondary: "০১৭৯১-৬২৯৯৯৬",
    whatsappNumber: "০১৭৯১-৬২৯৯৯৬",
    email: "kishorkanthasylwest@gmail.com",
    officeAddress: "মেহনাজ টাওয়ার (৪র্থ তলা), রিকাবীবাজার, সিলেট-৩১০০",
    officeHours: "শনিবার - বৃহস্পতিবার: সকাল ৯:০০ - রাত ৮:০০",
    facebookUrl: "https://www.facebook.com/kkmb.sylhetwest",
    youtubeUrl: "https://youtube.com/@kishorkantho",
    copyrightText: "সর্বস্বত্ব সংরক্ষিত © ১৯৯৪ - ২০২৬ কিশোরকণ্ঠ পাঠক ফোরাম, সিলেট জেলা পশ্চিম শাখা।",
  },
  important_dates: {
    examYear: "২০২৬",
    registrationDeadline: "২০২৬-১০-১৫T23:59:59",
    registrationDeadlineBn: "১৫ অক্টোবর ২০২৬ (বুধবার)",
    admitCardReleaseDate: "২০২৬-১০-১৮T00:00:00",
    admitCardReleaseDateBn: "১৮ অক্টোবর ২০২৬ (শনিবার)",
    examDate: "২০২৬-১০-২৪T10:00:00",
    examDateBn: "২৪ অক্টোবর ২০২৬ (শুক্রবার)",
    examTimeBn: "সকাল ১০:০০ টা - ১১:৩০ টা",
    resultPublishDate: "২০২৬-১১-১০T15:00:00",
    resultPublishDateBn: "১০ নভেম্বর ২০২৬",
    prizeDistributionDate: "২০২৬-১১-২০",
    prizeDistributionDateBn: "২০ নভেম্বর ২০২৬",
    activeCountdownTarget: "examDate",
  },
  homepage_content: {
    hero: {
      badge: "কিশোরকণ্ঠ মেধাবৃত্তি - ২০২৬",
      title: "কিশোরকণ্ঠ পাঠক ফোরাম",
      subtitle: "সিলেট জেলা পশ্চিম",
      description: "কিশোরকণ্ঠ মেধাবৃত্তি ২০২৬ — রেজিস্ট্রেশন, প্রবেশপত্র ও ফলাফল সব এক জায়গায়।",
      videoUrl: "https://www.facebook.com/61550084636519/videos/1560922935088975/",
    },
    about: {
      badge: "আমাদের সম্পর্কে",
      title: "মেধা ও মনন বিকাশে",
      highlightedTitle: "আমাদের পথচলা",
      description: "কিশোরকণ্ঠ পাঠক ফোরাম, সিলেট জেলা পশ্চিম ১৯৯৪ সালে প্রতিষ্ঠিত একটি স্বেচ্ছাসেবী সংগঠন। শিক্ষার্থীদের মেধা অন্বেষণ, নৈতিক চরিত্র গঠন এবং সুস্থ সংস্কৃতির বিকাশে নিরলসভাবে কাজ করে যাচ্ছি।",
    }
  },
  impact_stats: {
    stats: [
      { id: "years", count: "৩০+", label: "গৌরবময় পথচলা", desc: "১৯৯৪ থেকে সিলেট অঞ্চলে মেধা ও মূল্যবোধের নিরবচ্ছিন্ন সেবা", icon: "calendar", color: "emerald" },
      { id: "participants", count: "১৫,০০০+", label: "অংশগ্রহণকারী শিক্ষার্থী", desc: "প্রতি বছর বিভিন্ন বিদ্যালয় ও মাদ্রাসার শিক্ষার্থীদের উৎসবমুখর অংশগ্রহণ", icon: "users", color: "sky" },
      { id: "centers", count: "০৮টি", label: "উপজেলা পরীক্ষা কেন্দ্র", desc: "সিলেট জেলা পশ্চিমের ৮টি উপজেলায় সুশৃঙ্খল ও আধুনিক পরীক্ষা কেন্দ্র", icon: "shield", color: "amber" },
      { id: "scholarships", count: "২,৫০০+", label: "বৃত্তি ও পুরস্কার প্রদান", desc: "ট্যালেন্টপুল ও সাধারণ গ্রেডে আকর্ষণীয় আর্থিক বৃত্তি, ক্রেস্ট ও সনদ", icon: "trophy", color: "indigo" },
    ]
  },
  admit_card_rules: {
    defaultCenter: "শাহজালাল জামেয়া ইসলামিয়া কামিল মাদ্রাসা, পাঠানটুলা, সিলেট",
    defaultExamDate: "২৪ অক্টোবর ২০২৬",
    defaultExamTime: "সকাল ১০:০০ টা - ১১:৩০ টা",
    rules: [
      "পরীক্ষার্থীকে অবশ্যই সকাল ৯:৩০ মিনিটের মধ্যে নিজ পরীক্ষা কেন্দ্রে উপস্থিত হতে হবে।",
      "প্রবেশপত্র (Admit Card) ছাড়া কোনো পরীক্ষার্থীকে পরীক্ষা কক্ষে প্রবেশ করতে দেওয়া হবে না।",
      "পরীক্ষা কক্ষে কোনো প্রকার মোবাইল ফোন, ক্যালকুলেটর বা ডিজিটাল ডিভাইস আনা সম্পূর্ণ নিষিদ্ধ।",
      "কালো কালির বলপেন দিয়ে ওএমআর শিটের বৃত্ত সুন্দরভাবে ভরাট করতে হবে। কোনো কাটাকাটি করা যাবে না।",
      "পরীক্ষার্থীর রোল ও রেজিস্ট্রেশন নম্বর ওএমআর শিটে নির্ভুলভাবে লিখতে ও ভরাট করতে হবে।"
    ]
  },
  announcement: {
    enabled: true,
    title: "জরুরি ঘোষণা",
    message: "কিশোরকণ্ঠ মেধাবৃত্তি ২০২৬-এর অনলাইন রেজিস্ট্রেশন চলছে! আপনার প্রবেশপত্র ডাউনলোড করতে প্রবেশপত্র মেনুতে ক্লিক করুন।",
    linkText: "প্রবেশপত্র ডাউনলোড →",
    linkUrl: "/admit-card",
    badgeType: "urgent",
  }
};

// ==================== 2. ACTIVITIES ====================
const ACTIVITIES = [
  { 
    id: "scholarship",
    title: "মেধাবৃত্তি কার্যক্রম", 
    content: "বার্ষিক মেধাবৃত্তি পরীক্ষা আয়োজন এবং কৃতী শিক্ষার্থীদের বিশেষ বৃত্তি, সনদ ও ক্রেস্ট প্রদান।",
    details: "শিক্ষার্থীদের সুপ্ত প্রতিভা অন্বেষণে প্রতি বছর সিলেট অঞ্চলে বিশাল পরিসরে আয়োজন করা হয় কিশোরকণ্ঠ মেধা বৃত্তি পরীক্ষা। পরীক্ষায় উত্তীর্ণ শিক্ষার্থীদের ট্যালেন্টপুল ও সাধারণ গ্রেডে বৃত্তি, সনদপত্র ও আকর্ষণীয় পুরস্কার প্রদান করা হয়।",
    badge: "মেধাবৃত্তি",
    theme: "emerald",
    orderIndex: 1
  },
  { 
    id: "olympiad",
    title: "শিক্ষা ও অলিম্পিয়াড", 
    content: "বিজ্ঞান মেলা, কুইজ প্রতিযোগিতা, বিতর্ক উৎসব এবং বিষয়ভিত্তিক সৃজনশীল শিক্ষা ক্যাম্প।",
    details: "শিক্ষার্থীদের পাঠ্যবইয়ের পাশাপাশি সৃজনশীল মেধা ও মননের বিকাশে আমরা নিয়মিত কুইজ প্রতিযোগিতা, উপস্থিত বক্তৃতা, বিতর্ক উৎসব এবং বিজ্ঞান অলিম্পিয়াডের আয়োজন করে থাকি।",
    badge: "শিক্ষা ও বিজ্ঞান",
    theme: "sky",
    orderIndex: 2
  },
  { 
    id: "cultural",
    title: "সাংস্কৃতিক কার্যক্রম", 
    content: "হামদ-নাত, ক্বিরাত প্রতিযোগিতা, আবৃত্তি, অভিনয় ও সুস্থ মানসিক সংস্কৃতির নিয়মিত আসর।",
    details: "সুস্থ সংস্কৃতি মানুষকে সুন্দর মনের অধিকারী করে। আমরা নিয়মিত হামদ-নাত, ক্বিরাত এবং দেশাত্মবোধক গানের প্রতিযোগিতার আয়োজন করি। অপসংস্কৃতির সয়লাব থেকে যুবসমাজকে রক্ষা করাই আমাদের উদ্দেশ্য।",
    badge: "সংস্কৃতি",
    theme: "purple",
    orderIndex: 3
  },
  { 
    id: "social",
    title: "সমাজকল্যাণ ও সেবা", 
    content: "শীতবস্ত্র বিতরণ, বিনামূল্যে রক্তদান কর্মসূচি ও প্রাকৃতিক দুর্যোগে মানুষের পাশে ত্রাণ সহায়তা।",
    details: "মানবতার সেবায় আমরা সদা সচেষ্ট। প্রতি শীতে গরিব ও অসহায়দের মাঝে শীতবস্ত্র বিতরণ, ব্লাড ডোনার গ্রুপের মাধ্যমে মুমূর্ষু রোগীদের রক্তদান এবং বন্যা ও প্রাকৃতিক দুর্যোগে মানুষের পাশে দাঁড়ানো আমাদের অন্যতম প্রধান কাজ।",
    badge: "সামাজিক সেবা",
    theme: "rose",
    orderIndex: 4
  },
  { 
    id: "sports",
    title: "ক্রীড়া ও শরীরচর্চা", 
    content: "বার্ষিক ক্রীড়া প্রতিযোগিতা, ফুটবল-ক্রিকেট টুর্নামেন্ট ও তরুণদের স্বাস্থ্য সচেতনতা বৃদ্ধি।",
    details: "একটি সুস্থ দেহের ভেতরেই সুস্থ মনের বাস। তাই পড়াশোনার পাশাপাশি শরীরচর্চা ও খেলাধুলার বিকল্প নেই। আমরা নিয়মিত কিশোর ও যুবকদের জন্য বার্ষিক ফুটবল ও ক্রিকেট টুর্নামেন্টের আয়োজন করি।",
    badge: "ক্রীড়াঙ্গন",
    theme: "amber",
    orderIndex: 5
  },
  { 
    id: "library",
    title: "পাঠাগার ও বইপড়া", 
    content: "বইপড়া প্রতিযোগিতা, কিশোরকণ্ঠ পাঠক আসর ও সমৃদ্ধ জ্ঞানভিত্তিক পাঠাগার পরিচালনা।",
    details: "বই পড়ার অভ্যাস গড়ে তোলার লক্ষ্যে আমরা পাঠক ফোরামের মাধ্যমে নিয়মিত বইপড়া উৎসব ও কিশোরকণ্ঠ ম্যাগাজিন বিতরণ কার্যক্রম পরিচালনা করি। জ্ঞানভিত্তিক প্রজন্ম গড়াই আমাদের ভিশন।",
    badge: "বইপড়া আন্দোলন",
    theme: "teal",
    orderIndex: 6
  }
];

// ==================== 3. FAQS ====================
const FAQS = [
  {
    category: 'eligibility',
    question: "মেধাবৃত্তি পরীক্ষায় অংশগ্রহণের যোগ্যতা কী?",
    answer: "৪র্থ থেকে ১০ম শ্রেণির যেকোনো শিক্ষার্থী যারা সিলেট অঞ্চলের যেকোনো শিক্ষাপ্রতিষ্ঠানে নিয়মিত অধ্যয়নরত তারা এই মেধা বৃত্তি পরীক্ষায় অংশ নিতে পারবে।",
    badge: "যোগ্যতা",
    orderIndex: 1
  },
  {
    category: 'registration',
    question: "অনলাইনে কীভাবে রেজিস্ট্রেশন সম্পন্ন করবো?",
    answer: "আমাদের ওয়েবসাইটের 'অনলাইন রেজিস্ট্রেশন' পেজে গিয়ে ৩টি সহজ ধাপে শিক্ষার্থীর তথ্য, ছবি এবং বিকাশ/নগদ ফি ট্রানজেকশন আইডি দিয়ে আবেদন জমা দিন। সাথে সাথেই ট্র্যাকিং নম্বর সহ ডিজিটাল স্লিপ পেয়ে যাবেন।",
    badge: "রেজিস্ট্রেশন",
    orderIndex: 2
  },
  {
    category: 'registration',
    question: "পরীক্ষার প্রবেশপত্র (Admit Card) কীভাবে ডাউনলোড করবো?",
    answer: "আবেদন অনুমোদিত হওয়ার পর অথবা পরীক্ষার পূর্বে আপনার রোল নম্বর, ট্র্যাকিং আইডি অথবা মোবাইল নম্বর দিয়ে 'প্রবেশপত্র' পেজ থেকে ১-ক্লিকেই রঙ্গিন এডমিট কার্ড ডাউনলোড ও প্রিন্ট করতে পারবেন।",
    badge: "এডমিট কার্ড",
    orderIndex: 3
  },
  {
    category: 'payment',
    question: "আবেদন ফি কত এবং কীভাবে প্রদান করতে হবে?",
    answer: "মেধাবৃত্তি পরীক্ষার নিবন্ধন ফি মাত্র ১০০ টাকা। নির্দিষ্ট বিকাশ/নগদ নম্বরে সেন্ড মানি বা পেমেন্ট করে TrxID ফর্মে উল্লেখ করতে হবে।",
    badge: "ফি ও পেমেন্ট",
    orderIndex: 4
  },
  {
    category: 'exam',
    question: "পরীক্ষার বিষয় ও মানবণ্টন কেমন হবে?",
    answer: "পরীক্ষা পূর্ণাঙ্গ MCQ পদ্ধতিতে ১০০ নম্বরে অনুষ্ঠিত হবে। ৪র্থ থেকে ১০ম শ্রেণির শিক্ষার্থীদের জন্য প্রতিটি সঠিক উত্তরের মান ১ নম্বর। সময় থাকবে ১ ঘণ্টা ১৫ মিনিট।",
    badge: "পরীক্ষা পদ্ধতি",
    orderIndex: 5
  },
  {
    category: 'exam',
    question: "পরীক্ষার ফলাফল কীভাবে জানতে পারবো?",
    answer: "পরীক্ষার ফলাফল আমাদের ওয়েবসাইটে 'ফলাফল' পেজে রোল নম্বর দিয়ে তাৎক্ষণিক দেখা যাবে। এছাড়াও উত্তীর্ণ শিক্ষার্থীদের এসএমএস ও হোয়াটসঅ্যাপের মাধ্যমে জানানো হবে।",
    badge: "ফলাফল",
    orderIndex: 6
  }
];

// ==================== 4. TEAM STRUCTURE ====================
const TEAMS = [
  {
    id: "executive",
    name: 'নির্বাহী পরিষদ',
    description: 'সংগঠনের নীতিনির্ধারণ, সার্বিক সিদ্ধান্ত গ্রহণ এবং কৌশলগত দিকনির্দেশনা প্রদান করে।',
    responsibilities: [
      'বার্ষিক পরিকল্পনা ও বাজেট প্রণয়ন',
      'কৌশলগত সিদ্ধান্ত ও পরিচালনা',
      'উপদেষ্টা পর্ষদের সাথে সমন্বয়',
      'সকল সাব-টিমকে তত্ত্বাবধান'
    ],
    members: '১১',
    orderIndex: 1
  },
  {
    id: "exam_control",
    name: 'পরীক্ষা নিয়ন্ত্রণ ও মূল্যায়ন টিম',
    description: 'মেধাবৃত্তি পরীক্ষার সম্পূর্ণ প্রক্রিয়া, প্রশ্ন প্রণয়ন ও স্বচ্ছ মূল্যায়ন নিশ্চিত করে।',
    responsibilities: [
      'গোপনীয় প্রশ্নপত্র প্রণয়ন ও মডারেশন',
      '৮টি পরীক্ষা কেন্দ্র ব্যবস্থাপনা',
      'উত্তরপত্র নির্ভুল মূল্যায়ন ও স্ক্রুটিনি',
      'মেধাতালিকা ও ফলাফল প্রস্তুতকরণ'
    ],
    members: '২৮',
    orderIndex: 2
  },
  {
    id: "media_pr",
    name: 'মিডিয়া ও জনসংযোগ টিম',
    description: 'প্রচার-প্রচারণা, অভিভাবক ও শিক্ষার্থীদের সাথে দ্রুত যোগাযোগ এবং সোশ্যাল মিডিয়া পরিচালনা করে।',
    responsibilities: [
      'বিজ্ঞপ্তি ও হেল্পলাইন সেবা প্রদান',
      'ডিজিটাল ক্যাম্পেইন ও প্রচার',
      'প্রেস বিজ্ঞপ্তি ও সংবাদ সমন্বয়',
      'ইউজার সাপোর্ট ও গাইডেন্স'
    ],
    members: '০৮',
    orderIndex: 3
  },
  {
    id: "it_production",
    name: 'আইটি, ডিজাইন ও মিডিয়া প্রোডাকশন',
    description: 'অনলাইন পোর্টাল রক্ষণাবেক্ষণ, অনুষ্ঠান কভারেজ এবং সকল গ্রাফিক্স ডিজাইন তৈরি করে।',
    responsibilities: [
      'অনলাইন রেজিস্ট্রেশন ও পোর্টাল ম্যানেজমেন্ট',
      'ইভেন্ট ফটোগ্রাফি ও ভিডিওগ্রাফি',
      'ডিজিটাল প্রকাশনা ও ডিজাইন',
      'সার্ভার ও ডেটাবেজ সিকিউরিটি'
    ],
    members: '০৭',
    orderIndex: 4
  }
];

// ==================== 5. SYLLABUS ====================
const SYLLABUS = [
  {
    id: "class_4",
    class: '৪র্থ শ্রেণি',
    subTitle: 'স্কুল ও মাদ্রাসা উভয় মাধ্যম',
    color: 'emerald',
    totalMarks: '১০০',
    duration: '১ ঘণ্টা ১৫ মিনিট',
    orderIndex: 1,
    subjects: [
      { name: 'বাংলা', marks: '২৫', topics: ['পাঠ্যবই: গদ্য ও পদ্য থেকে সাধারণ প্রশ্ন', 'ব্যাকরণ: পদ, বিপরীত শব্দ, যুক্তবর্ণ, এককথায় প্রকাশ'] },
      { name: 'English', marks: '২৫', topics: ['Textbook lessons', 'Grammar: Noun, Pronoun, Preposition, Sentence making, Fill in the blanks'] },
      { name: 'গণিত', marks: '২৫', topics: ['সংখ্যার ধারণা, চার প্রক্রিয়া (যোগ, বিয়োগ, গুণ, ভাগ)', 'ভগ্নাংশ, পরিমাপ ও সহজ জ্যামিতি'] },
      { name: 'সাধারণ জ্ঞান ও ইসলামিয়াত', marks: '২৫', topics: ['সাধারণ জ্ঞান: বাংলাদেশ ও সিলেট পরিচিতি', 'ধর্ম ও নৈতিক শিক্ষা / ইসলামিয়াত বেসিক'] }
    ]
  },
  {
    id: "class_5",
    class: '৫ম শ্রেণি',
    subTitle: 'স্কুল ও মাদ্রাসা উভয় মাধ্যম',
    color: 'sky',
    totalMarks: '১০০',
    duration: '১ ঘণ্টা ১৫ মিনিট',
    orderIndex: 2,
    subjects: [
      { name: 'বাংলা', marks: '২৫', topics: ['পাঠ্যবইয়ের নির্ধারিত গদ্য ও কবিতা', 'ব্যাকরণ: বিপরীত শব্দ, সমার্থক শব্দ, ক্রিয়ার রূপান্তর, অনুচ্ছেদ'] },
      { name: 'English', marks: '২৫', topics: ['EFT Textbook reading & comprehension', 'Grammar: Tense, Parts of Speech, WH-Questions, Punctuation'] },
      { name: 'গণিত', marks: '২৫', topics: ['গুণ ও ভাগ, চার প্রক্রিয়া সম্পর্কিত সমস্যা, লসাগু ও গসাগু, ভগ্নাংশ ও দশমিক'] },
      { name: 'বিজ্ঞান ও সাধারণ জ্ঞান', marks: '২৫', topics: ['প্রাথমিক বিজ্ঞান: পরিবেশ ও স্বাস্থ্য', 'সাধারণ জ্ঞান ও নৈতিক শিক্ষা'] }
    ]
  },
  {
    id: "class_6",
    class: '৬ষ্ঠ শ্রেণি',
    subTitle: 'স্কুল ও মাদ্রাসা উভয় মাধ্যম',
    color: 'teal',
    totalMarks: '১০০',
    duration: '১ ঘণ্টা ১৫ মিনিট',
    orderIndex: 3,
    subjects: [
      { name: 'বাংলা', marks: '২৫', topics: ['গদ্য ও কবিতা অংশ', 'ব্যাকরণ: ধ্বনি ও বর্ণ, শব্দ রূপান্তর, বাগধারা, বানান শুদ্ধি'] },
      { name: 'English', marks: '২৫', topics: ['English For Today lessons', 'Grammar: Articles, Prepositions, Subject-Verb Agreement, Right form of verbs'] },
      { name: 'গণিত', marks: '২৫', topics: ['পাটিগণিত: স্বাভাবিক সংখ্যা ও ভগ্নাংশ, অনুপাত ও শতকরা', 'বীজগণিত: মৌলিক রাশি ও সমীকরণ', 'জ্যামিতি: রেখা, কোণ ও ত্রিভুজ'] },
      { name: 'সাধারণ জ্ঞান ও বিজ্ঞান', marks: '২৫', topics: ['বিজ্ঞান ও তথ্যপ্রযুক্তি', 'বাংলাদেশ ও বিশ্ব পরিচিতি, নৈতিক মূল্যবোধ'] }
    ]
  },
  {
    id: "class_7",
    class: '৭ম শ্রেণি',
    subTitle: 'স্কুল ও মাদ্রাসা উভয় মাধ্যম',
    color: 'indigo',
    totalMarks: '১০০',
    duration: '১ ঘণ্টা ১৫ মিনিট',
    orderIndex: 4,
    subjects: [
      { name: 'বাংলা', marks: '২৫', topics: ['সাহিত্য কনটেন্ট ও ভাবার্থ', 'ব্যাকরণ: সন্ধি, কারক, প্রত্যয়, এককথায় প্রকাশ'] },
      { name: 'English', marks: '২৫', topics: ['EFT Reading & Vocabulary', 'Grammar: Voice, Narration, Modifiers, Transformation'] },
      { name: 'গণিত', marks: '২৫', topics: ['পাটিগণিত: লাভ-ক্ষতি, সরল মুনাফা', 'বীজগণিতীয় সূত্রাবলি ও উৎপাদক', 'জ্যামিতি: ত্রিভুজ ও চতুর্ভুজ সংক্রান্ত উপপাদ্য'] },
      { name: 'বিজ্ঞান ও সাধারণ জ্ঞান', marks: '২৫', topics: ['বিজ্ঞান ও পরিবেশবিদ্যা', 'সাধারণ জ্ঞান ও সাম্প্রতিক বিষয়াবলি'] }
    ]
  },
  {
    id: "class_8",
    class: '৮ম শ্রেণি',
    subTitle: 'স্কুল ও মাদ্রাসা উভয় মাধ্যম',
    color: 'purple',
    totalMarks: '১০০',
    duration: '১ ঘণ্টা ১৫ মিনিট',
    orderIndex: 5,
    subjects: [
      { name: 'বাংলা', marks: '২৫', topics: ['গদ্য ও পদ্যের সারাংশ ও সৃজনশীল ধারণা', 'ব্যাকরণ: ধ্বনি পরিবর্তন, সমাস, বাক্য প্রকরণ'] },
      { name: 'English', marks: '২৫', topics: ['Grammar in Context & Comprehension', 'Grammar: Changing Sentences, Suffix/Prefix, Connectors, Punctuation'] },
      { name: 'গণিত', marks: '২৫', topics: ['প্যাটার্ন, মুনাফা, পরিমাপ', 'বীজগণিতীয় সূত্রাবলি, ভগ্নাংশ ও সরল সহসমীকরণ', 'জ্যামিতি: পিথাগোরাসের উপপাদ্য, বৃত্ত ও চতুর্ভুজ'] },
      { name: 'বিজ্ঞান ও সাধারণ জ্ঞান', marks: '২৫', topics: ['সাধারণ বিজ্ঞান ও কম্পিউটার জ্ঞান', 'বাংলাদেশ ও আন্তর্জাতিক সাধারণ জ্ঞান'] }
    ]
  },
  {
    id: "class_9_10",
    class: '৯ম-১০ম শ্রেণি',
    subTitle: 'স্কুল ও মাদ্রাসা উভয় মাধ্যম',
    color: 'rose',
    totalMarks: '১০০',
    duration: '১ ঘণ্টা ১৫ মিনিট',
    orderIndex: 6,
    subjects: [
      { name: 'বাংলা', marks: '২৫', topics: ['বাংলা ১ম পত্র: নির্বাচিত গদ্য ও পদ্য', 'বাংলা ২য় পত্র: সমাস, কারক, ধ্বনিতত্ত্ব, বাক্য পরিবর্তন'] },
      { name: 'English', marks: '২৫', topics: ['English 1st Paper: Reading Comprehension', 'English 2nd Paper: Tag questions, Narration, Suffix-Prefix, Connectors'] },
      { name: 'গণিত', marks: '২৫', topics: ['সেট ও ফাংশন, বীজগণিতীয় রাশি, সূচক ও লগারিদম', 'ত্রিকোণমিতি ও পরিমিতি', 'জ্যামিতি: বৃত্ত ও ক্ষেত্রফল সম্পর্কিত উপপাদ্য'] },
      { name: 'বিজ্ঞান ও সাধারণ জ্ঞান', marks: '২৫', topics: ['পদার্থ, রসায়ন, জীববিজ্ঞান ও আইসিটি বেসিক', 'বাংলাদেশ, মুক্তিযুদ্ধ ও আন্তর্জাতিক সাম্প্রতিক ঘটনা'] }
    ]
  }
];

// ==================== 6. UPAZILA CENTERS ====================
const UPAZILA_CENTERS = [
  {
    id: "south_surma",
    upazila: 'দক্ষিণ সুরমা থানা',
    color: 'teal',
    orderIndex: 1,
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
    id: "fenchuganj",
    upazila: 'ফেঞ্চুগঞ্জ উপজেলা',
    color: 'blue',
    orderIndex: 2,
    locations: [
      { name: 'মেসার্স জসীম এন্ড ব্রাদার্স', address: 'বিআইডিসি বাজার, ফেঞ্চুগঞ্জ, সিলেট' },
      { name: 'পপি লাইব্রেরী', address: 'থানা রোড, ফেঞ্চুগঞ্জ বাজার, সিলেট' },
    ],
    contacts: [
      { name: 'আশরাফুল ইসলাম তোহা', phone: '০১৬৩০-০১৭২৪৮' },
      { name: 'জাকির হোসেন সামি', phone: '০১৮৭৫-৪৫২৫১৫' },
    ]
  },
  {
    id: "bishwanath",
    upazila: 'বিশ্বনাথ উপজেলা',
    color: 'cyan',
    orderIndex: 3,
    locations: [
      { name: 'রায়হান স্টুডিও', address: 'লামাকাজী পয়েন্ট, বিশ্বনাথ' },
      { name: 'আইডিয়াল শপ এন্ড কম্পিউটার', address: 'কলাগঞ্জ বাজার, বিশ্বনাথ' },
      { name: 'বিসমিল্লাহ এন্টারপ্রাইজ', address: 'হাবড়া বাজার, বিশ্বনাথ, সিলেট' },
      { name: 'আল হাফিজ লাইব্রেরী', address: 'নতুন বাজার, বিশ্বনাথ, সিলেট' },
      { name: 'আল ইসলাম ট্রেড সেন্টার', address: 'নতুন বাজার, বিশ্বনাথ, সিলেট' },
    ],
    contacts: [
      { name: 'মতিউর রহমান ইমন', phone: '০১৭০৫-৬৩১০৫৬' },
      { name: 'রেদওয়ান আহমদ', phone: '০১৬১৪-৫৬৯৯৬৮' },
    ]
  },
  {
    id: "moglabazar",
    upazila: 'মোগলাবাজার থানা',
    color: 'indigo',
    orderIndex: 4,
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
    id: "balaganj",
    upazila: 'বালাগঞ্জ উপজেলা',
    color: 'emerald',
    orderIndex: 5,
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
    id: "osmaninagar",
    upazila: 'ওসমানীনগর উপজেলা',
    color: 'amber',
    orderIndex: 6,
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

// ==================== 7. NOTICES ====================
const NOTICES = [
  {
    id: "notice_1",
    title: "কিশোরকণ্ঠ মেধাবৃত্তি - ২০২৫ এর ফলাফল প্রকাশ",
    description: "কিশোরকণ্ঠ মেধাবৃত্তি পরীক্ষা - ২০২৫, সিলেট জেলা পশ্চিম এর ফলাফল প্রকাশিত হয়েছে। সার্চ অপশন ব্যবহার করে আপনার রোল নম্বর দিয়ে ফলাফল দেখুন। সকল উত্তীর্ণ শিক্ষার্থীদের আন্তরিক অভিনন্দন ও মোবারকবাদ।",
    date: "১৩ ডিসেম্বর ২০২৫",
    time: "১২:৩০ AM",
    type: "result",
    isPinned: false,
    refNo: "KKMB/NOT/2025/08",
  },
  {
    id: "notice_2",
    title: "মেধাবৃত্তির পুরস্কার বিতরণী ও সংবর্ধনা অনুষ্ঠান প্রসঙ্গে",
    description: "২০২৬ সালের জানুয়ারী মাসের প্রথমার্ধে, কিশোরকণ্ঠ পাঠক ফোরাম সিলেট জেলা পশ্চিম-এর কিশোরকণ্ঠ মেধাবৃত্তি পরীক্ষা-২০২৫ এর পুরস্কার বিতরণী অনুষ্ঠান অনুষ্ঠিত হবে। সকল অভিভাবক ও শিক্ষার্থীদের উপস্থিত থাকার জন্য অনুরোধ করা হচ্ছে।",
    date: "১৫ ডিসেম্বর ২০২৫",
    time: "১০:০০ PM",
    type: "event",
    isPinned: false,
    refNo: "KKMB/NOT/2025/09",
  },
  {
    id: "notice_3",
    title: "জরুরি নোটিশ: কিশোরকণ্ঠ মেধাবৃত্তি পরীক্ষা - ২০২৬ এর পুরষ্কার বিতরণী অনুষ্ঠান প্রসঙ্গে",
    description: "২০২৬ সালের মার্চ-২৮, কিশোরকণ্ঠ পাঠক ফোরাম সিলেট জেলা পশ্চিম-এর কিশোরকণ্ঠ মেধাবৃত্তি পরীক্ষা-২০২৫ এর পুরস্কার বিতরণী অনুষ্ঠান সিলেট কাজী নজরুল অডিটরিয়াম, রিকাবীবাজার, সিলেট-এ সফলভাবে সম্পন্ন হয়েছে।",
    date: "২৮ মার্চ ২০২৬",
    time: "১০:০০ PM",
    type: "announcement",
    isPinned: true,
    refNo: "KKMB/NOT/2026/01",
  }
];

// ==================== 8. COMMITTEE ====================
const COMMITTEE = [
  { name: "আবু জুবায়ের", role: "চেয়ারম্যান", orderIndex: 1, facebook: "#", roleColor: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
  { name: "তোফায়েল আহমদ", role: "ভাইস চেয়ারম্যান", orderIndex: 2, facebook: "https://www.facebook.com/tufael.ahmed.54922", roleColor: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
  { name: "আবু তাহের চৌধুরী", role: "নির্বাহী সম্পাদক", orderIndex: 3, facebook: "https://www.facebook.com/abutaher.chowdhury.144", roleColor: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30" },
  { name: "মাহমুদুর রহমান", role: "পৃষ্ঠপোষক", orderIndex: 4, facebook: "https://www.facebook.com/Mahmudhasan9996", roleColor: "bg-sky-500/15 text-sky-300 border-sky-500/30" },
  { name: "এম আহমদ আমীম", role: "পৃষ্ঠপোষক", orderIndex: 5, facebook: "https://www.facebook.com/ahmed.amim.1", roleColor: "bg-sky-500/15 text-sky-300 border-sky-500/30" },
  { name: "শেখ মুফাক্কির হোসাইন", role: "পৃষ্ঠপোষক", orderIndex: 6, facebook: "https://www.facebook.com/sheikh.mufakkir", roleColor: "bg-sky-500/15 text-sky-300 border-sky-500/30" },
  { name: "সুলতান মাহমুদ", role: "পৃষ্ঠপোষক", orderIndex: 7, facebook: "https://www.facebook.com/sultanmahmud.sumon.58", roleColor: "bg-sky-500/15 text-sky-300 border-sky-500/30" },
  { name: "রিয়াজ উদ্দিন", role: "পৃষ্ঠপোষক", orderIndex: 8, facebook: "https://www.facebook.com/riyaz.uddin.92798", roleColor: "bg-sky-500/15 text-sky-300 border-sky-500/30" },
  { name: "ইয়াসিন আহমেদ", role: "পৃষ্ঠপোষক", orderIndex: 9, facebook: "https://www.facebook.com/yasinahmed2022", roleColor: "bg-sky-500/15 text-sky-300 border-sky-500/30" },
  { name: "ময়নুল ইসলাম", role: "পৃষ্ঠপোষক", orderIndex: 10, facebook: "https://www.facebook.com/mdmoynulislam.mayon.3", roleColor: "bg-sky-500/15 text-sky-300 border-sky-500/30" },
  { name: "আবু তাহের", role: "পৃষ্ঠপোষক", orderIndex: 11, facebook: "https://www.facebook.com/taher200135", roleColor: "bg-sky-500/15 text-sky-300 border-sky-500/30" }
];

async function seedAll() {
  try {
    console.log("🚀 Starting Firestore default data seeding...\n");

    // 1. Site Settings
    console.log("📌 Uploading Site Settings...");
    for (const [key, value] of Object.entries(SITE_SETTINGS)) {
      const docRef = doc(db, "site_settings", key);
      await setDoc(docRef, { ...value, updatedAt: serverTimestamp() }, { merge: true });
      console.log(`  ✓ site_settings/${key}`);
    }

    // 2. Activities
    console.log("\n📌 Uploading Activities...");
    for (const item of ACTIVITIES) {
      const docRef = doc(db, "activities", item.id);
      await setDoc(docRef, { ...item, updatedAt: serverTimestamp() }, { merge: true });
      console.log(`  ✓ activities/${item.id} (${item.title})`);
    }

    // 3. FAQs
    console.log("\n📌 Uploading FAQs...");
    for (let i = 0; i < FAQS.length; i++) {
      const item = FAQS[i];
      const docRef = doc(db, "faqs", `faq_${i + 1}`);
      await setDoc(docRef, { ...item, updatedAt: serverTimestamp() }, { merge: true });
      console.log(`  ✓ faqs/faq_${i + 1}`);
    }

    // 4. Team Structure
    console.log("\n📌 Uploading Team Structure...");
    for (const item of TEAMS) {
      const docRef = doc(db, "team_structure", item.id);
      await setDoc(docRef, { ...item, updatedAt: serverTimestamp() }, { merge: true });
      console.log(`  ✓ team_structure/${item.id} (${item.name})`);
    }

    // 5. Syllabus
    console.log("\n📌 Uploading Syllabus...");
    for (const item of SYLLABUS) {
      const docRef = doc(db, "syllabus", item.id);
      await setDoc(docRef, { ...item, updatedAt: serverTimestamp() }, { merge: true });
      console.log(`  ✓ syllabus/${item.id} (${item.class})`);
    }

    // 6. Upazila Centers
    console.log("\n📌 Uploading Upazila Centers...");
    for (const item of UPAZILA_CENTERS) {
      const docRef = doc(db, "upazila_centers", item.id);
      await setDoc(docRef, { ...item, updatedAt: serverTimestamp() }, { merge: true });
      console.log(`  ✓ upazila_centers/${item.id} (${item.upazila})`);
    }

    // 7. Notices
    console.log("\n📌 Uploading Notices...");
    for (const item of NOTICES) {
      const docRef = doc(db, "notices", item.id);
      await setDoc(docRef, { ...item, createdAt: serverTimestamp(), updatedAt: serverTimestamp() }, { merge: true });
      console.log(`  ✓ notices/${item.id} (${item.title})`);
    }

    // 8. Committee
    console.log("\n📌 Uploading Committee Members...");
    for (let i = 0; i < COMMITTEE.length; i++) {
      const item = COMMITTEE[i];
      const docRef = doc(db, "committee", `member_${i + 1}`);
      await setDoc(docRef, { ...item, createdAt: serverTimestamp(), updatedAt: serverTimestamp() }, { merge: true });
      console.log(`  ✓ committee/member_${i + 1} (${item.name} - ${item.role})`);
    }

    // 9. Results from public/results.json
    console.log("\n📌 Uploading Results from public/results.json...");
    const resultsFilePath = path.join(__dirname, "..", "public", "results.json");
    if (fs.existsSync(resultsFilePath)) {
      const rawResults = fs.readFileSync(resultsFilePath, "utf-8");
      const resultsData = JSON.parse(rawResults);
      console.log(`  Found ${resultsData.length} results to upload...`);

      // Write in batches of 400 (Firestore limit is 500 per batch)
      const chunkSize = 400;
      for (let i = 0; i < resultsData.length; i += chunkSize) {
        const chunk = resultsData.slice(i, i + chunkSize);
        const batch = writeBatch(db);
        
        for (const student of chunk) {
          if (!student.roll) continue;
          const cleanRoll = student.roll.toString().trim();
          const year = student.year || "২০২৪";
          const docId = `${cleanRoll}_${year}`;
          const docRef = doc(db, "results", docId);
          batch.set(docRef, {
            ...student,
            roll: cleanRoll,
            year: year,
            updatedAt: serverTimestamp(),
            createdAt: serverTimestamp(),
          }, { merge: true });
        }

        await batch.commit();
        console.log(`  ✓ Batch committed: ${i + chunk.length} / ${resultsData.length}`);
      }
    } else {
      console.log("  ⚠️ public/results.json not found, skipping results.");
    }

    console.log("\n🎉 ALL DEFAULT DATA SUCCESSFULLY UPLOADED TO FIRESTORE!");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error uploading default data:", error);
    process.exit(1);
  }
}

seedAll();
