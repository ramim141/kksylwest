import {
  HiSquares2X2,
  HiDocumentChartBar,
  HiBell,
  HiPhoto,
  HiUserGroup,
  HiEnvelope,
  HiUsers,
  HiDocumentText,
  HiViewColumns,
  HiAcademicCap,
  HiQuestionMarkCircle,
  HiGlobeAlt,
  HiMapPin,
  HiBookOpen,
  HiMegaphone,
} from "react-icons/hi2";
import { FaWhatsapp } from "react-icons/fa";

/* ============================================================
   ADMIN NAV REGISTRY
   One source of truth for the sidebar, the breadcrumb, the page
   header and the ⌘K jump-to palette. Adding a section means adding
   an entry here — nothing else has to be kept in sync.

   keywords: extra search terms (English + transliteration) so the
   palette finds a section however the admin thinks of it.
   ============================================================ */

export const NAV_GROUPS = [
  {
    group: "ড্যাশবোর্ড",
    items: [
      {
        id: "overview",
        label: "ওভারভিউ",
        title: "সিস্টেম ওভারভিউ",
        description:
          "আবেদন, ফলাফল ও যোগাযোগের সর্বশেষ অবস্থা এক নজরে দেখুন এবং যেকোনো সেকশনে দ্রুত যান।",
        icon: HiSquares2X2,
        keywords: "overview dashboard home hub",
      },
    ],
  },
  {
    group: "পরীক্ষা ও ফলাফল",
    items: [
      {
        id: "registrations",
        label: "অনলাইন রেজিস্ট্রেশন",
        title: "রেজিস্ট্রেশন ও রোল বরাদ্দ",
        description:
          "অনলাইন আবেদন যাচাই করুন, অফলাইন ফরম এন্ট্রি দিন এবং শিক্ষার্থীদের রোল ও কেন্দ্র বরাদ্দ করুন।",
        icon: HiAcademicCap,
        keywords: "registration admission form roll student আবেদন",
      },
      {
        id: "results",
        label: "রেজাল্ট ডেটাবেজ",
        title: "ফলাফল ও মেধা তালিকা",
        description:
          "এক্সেল শিট আপলোড করুন, ডেটাবেজ সার্চ করুন এবং যেকোনো শিক্ষার্থীর ফলাফল সংশোধন করুন।",
        icon: HiDocumentChartBar,
        keywords: "result marks merit excel upload ফলাফল",
      },
      {
        id: "syllabus",
        label: "সিলেবাস",
        title: "শ্রেণিভিত্তিক সিলেবাস ও মান বণ্টন",
        description:
          "প্রতিটি শ্রেণির বিষয়, অধ্যায়, পূর্ণমান ও পরীক্ষার সময়সূচি নির্ধারণ করুন।",
        icon: HiBookOpen,
        keywords: "syllabus subject marks distribution সিলেবাস",
      },
      {
        id: "upazilas",
        label: "উপজেলা ও ফরম সেন্টার",
        title: "ফরম সংগ্রহ ও জমাদানের কেন্দ্র",
        description:
          "উপজেলাভিত্তিক ফরম সংগ্রহের লাইব্রেরি, ঠিকানা ও দায়িত্বশীল প্রতিনিধিদের তালিকা হালনাগাদ করুন।",
        icon: HiMapPin,
        keywords: "upazila center location form collection উপজেলা",
      },
    ],
  },
  {
    group: "যোগাযোগ ও ব্রডকাস্ট",
    items: [
      {
        id: "broadcaster",
        label: "হোয়াটসঅ্যাপ ব্রডকাস্টার",
        title: "হোয়াটসঅ্যাপ বাল্ক ব্রডকাস্টার",
        description:
          "নিবন্ধিত শিক্ষার্থী ও অভিভাবকদের রোল, প্রবেশপত্র বা ফলাফলের নোটিফিকেশন এক ক্লিকে পাঠান।",
        icon: FaWhatsapp,
        keywords: "whatsapp broadcast sms bulk message notification",
      },
      {
        id: "messages",
        label: "ইনবক্স মেসেজ",
        title: "যোগাযোগ ও মেসেজ ইনবক্স",
        description:
          "কন্টাক্ট ফর্ম ও চ্যাটবট থেকে আসা সব প্রশ্ন ও অনুসন্ধান পড়ুন এবং উত্তর দিন।",
        icon: HiEnvelope,
        keywords: "message inbox contact query chat মেসেজ",
      },
      {
        id: "announcements",
        label: "ব্রেকিং নোটিশ বার",
        title: "টপ এনাউন্সমেন্ট বার",
        description:
          "ওয়েবসাইটের একদম উপরে চলমান জরুরি ঘোষণা ও অ্যাকশন বাটন নিয়ন্ত্রণ করুন।",
        icon: HiMegaphone,
        keywords: "announcement breaking news banner ticker ঘোষণা",
      },
      {
        id: "notices",
        label: "নোটিশ বোর্ড",
        title: "নোটিশ বোর্ড ও সার্কুলার",
        description:
          "জরুরি নোটিশ প্রকাশ করুন, সার্কুলার বা ছবি সংযুক্ত করুন এবং গুরুত্বপূর্ণ নোটিশ পিন করুন।",
        icon: HiBell,
        keywords: "notice board circular bulletin pin নোটিশ",
      },
    ],
  },
  {
    group: "ওয়েবসাইট কনটেন্ট",
    items: [
      {
        id: "content",
        label: "গ্লোবাল সাইট সেটিংস",
        title: "সাইট সেটিংস ও কনফিগারেশন",
        description:
          "ফুটার, যোগাযোগ, গুরুত্বপূর্ণ তারিখ, কাউন্টডাউন ও প্রবেশপত্রের নিয়মাবলি নিয়ন্ত্রণ করুন।",
        icon: HiGlobeAlt,
        keywords: "settings footer contact dates countdown admit config",
      },
      {
        id: "hero",
        label: "হিরো স্লাইডার",
        title: "হোমপেজ হিরো ব্যানার ও ভিডিও",
        description: "হোমপেজের ব্যানার ছবি, ক্যাপশন ও পরিচিতিমূলক ভিডিও লিংক হালনাগাদ করুন।",
        icon: HiViewColumns,
        keywords: "hero slider banner video youtube homepage",
      },
      {
        id: "activities",
        label: "আমাদের কার্যক্রম",
        title: "কার্যক্রম ম্যানেজমেন্ট",
        description:
          "হোমপেজের “যা আমরা করে থাকি” সেকশনের কার্ড, বিবরণ ও বিস্তারিত পপআপ নিয়ন্ত্রণ করুন।",
        icon: HiDocumentText,
        keywords: "activity work program কার্যক্রম",
      },
      {
        id: "teams",
        label: "টিম স্ট্রাকচার",
        title: "টিম স্ট্রাকচার",
        description:
          "এবাউট পেজের টিম বিভাগ, সদস্য সংখ্যা, বর্ণনা ও দায়িত্বসমূহ নির্ধারণ করুন।",
        icon: HiUserGroup,
        keywords: "team structure department responsibility টিম",
      },
      {
        id: "gallery",
        label: "ফটো গ্যালারি",
        title: "ফটো গ্যালারি ও হিরো কনটেন্ট",
        description:
          "গ্যালারির শোপিস ছবি, পরিসংখ্যান, শিরোনাম ও সব অ্যালবাম পরিচালনা করুন।",
        icon: HiPhoto,
        keywords: "gallery photo album image memory গ্যালারি",
      },
      {
        id: "committee",
        label: "পরিচালনা কমিটি",
        title: "পরিচালনা পর্ষদ",
        description:
          "কমিটির সদস্যদের ছবি, পদবি, ক্রম ও সামাজিক যোগাযোগের লিংক যুক্ত বা সম্পাদনা করুন।",
        icon: HiUsers,
        keywords: "committee member board profile কমিটি",
      },
      {
        id: "faqs",
        label: "প্রশ্নোত্তর (FAQ)",
        title: "প্রায়শই জিজ্ঞাসিত প্রশ্ন",
        description:
          "হোমপেজের FAQ সেকশনের প্রশ্ন, উত্তর ও ক্যাটাগরি তৈরি এবং সম্পাদনা করুন।",
        icon: HiQuestionMarkCircle,
        keywords: "faq question answer help প্রশ্ন",
      },
    ],
  },
];

/* Flat lookup: id → item (with its group name attached). */
export const NAV_INDEX = NAV_GROUPS.reduce((acc, { group, items }) => {
  items.forEach((item) => {
    acc[item.id] = { ...item, group };
  });
  return acc;
}, {});

export const NAV_ITEMS = Object.values(NAV_INDEX);
