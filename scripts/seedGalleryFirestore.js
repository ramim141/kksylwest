import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  serverTimestamp 
} from "firebase/firestore";

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

const GALLERY_HERO = {
  badge: "স্মৃতির গ্যালারি",
  headingLine1: "আমাদের গর্বের",
  headingLine2: "মুহূর্তগুলো",
  subheading: "কিশোরকণ্ঠ মেধাবৃত্তির আয়োজন, শিক্ষার্থীদের সাফল্য এবং অনুপ্রেরণার বিশেষ মুহূর্তগুলো এক জায়গায় দেখুন।",
  sinceYear: "১৯৯৪",
  stat1Value: "১০০+",
  stat1Label: "ছবি ও মুহূর্ত",
  stat2Value: "২০+",
  stat2Label: "বার্ষিক আয়োজন",
  stat3Value: "৩৬,০০০+",
  stat3Label: "অংশগ্রহণকারী",
  image1Url: "/src/assets/images/gallery/1000288989.jpg.jpeg",
  image2Url: "/src/assets/images/gallery/1000288990.jpg.jpeg",
  image3Url: "/src/assets/images/gallery/1000288991.jpg.jpeg",
  image4Url: "/src/assets/images/gallery/1000288992.jpg.jpeg",
};

const GALLERY_ITEMS = [
  // 1. RECENT ALBUMS (8 items)
  {
    id: "recent_1",
    title: 'স্কলারশিপ বিতরণ ২০২৫',
    description: 'মেধাবৃত্তি প্রোগ্রাম উদযাপন',
    date: '১৯ মার্চ ২০২৬',
    imageUrl: '/src/assets/images/gallery/1000288989.jpg.jpeg',
    category: 'recent',
    location: 'কাজী নজরুল অডিটোরিয়াম, রিকাবীবাজার, সিলেট',
    attendees: '৫০০+ শিক্ষার্থী ও অভিভাবক',
    orderIndex: 1
  },
  {
    id: "recent_2",
    title: 'বার্ষিক পুরস্কার বিতরণ',
    description: 'অসাধারণ শিক্ষার্থীদের সম্মাননা',
    date: '১০ মার্চ ২০২৬',
    imageUrl: '/src/assets/images/gallery/1000288990.jpg.jpeg',
    category: 'recent',
    location: 'সিলেট জেলা পরিষদ মিলনায়তন',
    attendees: '৪০০+ উপস্থিতি',
    orderIndex: 2
  },
  {
    id: "recent_3",
    title: 'একাডেমিক উৎকর্ষতা সেমিনার',
    description: 'শিক্ষার্থীদের জন্য প্রশিক্ষণ কর্মশালা',
    date: '০৫ মার্চ ২০২৬',
    imageUrl: '/src/assets/images/gallery/1000288991.jpg.jpeg',
    category: 'recent',
    location: 'শাহজালাল জামেয়া অডিটোরিয়াম',
    attendees: '৩৫০+ শিক্ষার্থী',
    orderIndex: 3
  },
  {
    id: "recent_4",
    title: 'কমিউনিটি আউটরিচ প্রোগ্রাম',
    description: 'সমাজসেবামূলক কার্যক্রম',
    date: '২৮ ফেব্রুয়ারি ২০২৬',
    imageUrl: '/src/assets/images/gallery/1000288992.jpg.jpeg',
    category: 'recent',
    location: 'দক্ষিণ সুরমা উপজেলা',
    attendees: '২০০+ অংশগ্রহণকারী',
    orderIndex: 4
  },
  {
    id: "recent_5",
    title: 'মেধা উন্নয়ন ওয়ার্কশপ',
    description: 'দক্ষতা বৃদ্ধির প্রশিক্ষণ সেশন',
    date: '২০ ফেব্রুয়ারি ২০২৬',
    imageUrl: '/src/assets/images/gallery/1000288993.jpg.jpeg',
    category: 'recent',
    location: 'বিশ্বনাথ উপজেলা কেন্দ্র',
    attendees: '২৫০+ শিক্ষার্থী',
    orderIndex: 5
  },
  {
    id: "recent_6",
    title: 'বার্ষিকী উদযাপন অনুষ্ঠান',
    description: 'প্রতিষ্ঠানের প্রতিষ্ঠাবার্ষিকী উৎসব',
    date: '১৫ ফেব্রুয়ারি ২০২৬',
    imageUrl: '/src/assets/images/gallery/1000289013.jpg.jpeg',
    category: 'recent',
    location: 'সিলেট কেন্দ্রীয় মুসলিম সাহিত্য সংসদ',
    attendees: '৬০০+ সুধী ও শুভাকাঙ্ক্ষী',
    orderIndex: 6
  },
  {
    id: "recent_7",
    title: 'ডিজিটাল সাক্ষরতা কর্মসূচি',
    description: 'তরুণদের জন্য প্রযুক্তি প্রশিক্ষণ',
    date: '০৮ ফেব্রুয়ারি ২০২৬',
    imageUrl: '/src/assets/images/gallery/1000289015.jpg.jpeg',
    category: 'recent',
    location: 'ওসমানীনগর আইসিটি ল্যাব',
    attendees: '১৮০+ শিক্ষার্থী',
    orderIndex: 7
  },
  {
    id: "recent_8",
    title: 'পরিবেশ সচেতনতা প্রচারাভিযান',
    description: 'টেকসই উন্নয়নের দিকে সচেতনতা সৃষ্টি ও বৃক্ষরোপণ',
    date: '০১ ফেব্রুয়ারি ২০২৬',
    imageUrl: '/src/assets/images/gallery/1000289019.jpg.jpeg',
    category: 'recent',
    location: 'বালাগঞ্জ উপজেলা চত্বর',
    attendees: '৩০০+ সদস্য',
    orderIndex: 8
  },

  // 2. ARCHIVE ALBUMS (8 items)
  {
    id: "archive_1",
    title: 'স্কলারশিপ বিতরণ ২০২৪',
    description: 'গত বছরের মেধাবৃত্তি কর্মসূচির স্মরণীয় আয়োজন',
    date: '১৯ মার্চ ২০২৫',
    imageUrl: '/src/assets/images/gallery/1000289021.jpg.jpeg',
    category: 'archive',
    location: 'কাজী নজরুল অডিটোরিয়াম, সিলেট',
    attendees: '৪৫০+ অংশগ্রহণকারী',
    orderIndex: 1
  },
  {
    id: "archive_2",
    title: 'একাডেমিক সম্মেলন ২০২৪',
    description: 'শিক্ষাবিদ ও গবেষকদের অংশগ্রহণে জ্ঞানভিত্তিক সমাবেশ',
    date: '১২ ফেব্রুয়ারি ২০২৫',
    imageUrl: '/src/assets/images/gallery/1000289022.jpg.jpeg',
    category: 'archive',
    location: 'জাতীয় অডিটোরিয়াম',
    attendees: '৩০০+ অংশগ্রহণকারী',
    orderIndex: 2
  },
  {
    id: "archive_3",
    title: 'দাতব্য ও শীতবস্ত্র বিতরণ কর্মসূচি',
    description: 'সমাজের প্রতি দায়বদ্ধতার মানবিক আয়োজন',
    date: '০৫ জানুয়ারি ২০২৫',
    imageUrl: '/src/assets/images/gallery/1000289029.jpg.jpeg',
    category: 'archive',
    location: 'স্থানীয় কমিউনিটি সেন্টার',
    attendees: '২৫০+ উপকারভোগী',
    orderIndex: 3
  },
  {
    id: "archive_4",
    title: 'নেতৃত্ব বিকাশ ও মেধা অন্বেষণ প্রোগ্রাম',
    description: 'ভবিষ্যৎ যুব নেতৃত্ব তৈরির বিশেষ কর্মশালা',
    date: '২৮ ডিসেম্বর ২০২৪',
    imageUrl: '/src/assets/images/gallery/1000289030.jpg.jpeg',
    category: 'archive',
    location: 'সিলেট শিল্পকলা একাডেমি',
    attendees: '২০০+ তরুণ শিক্ষার্থী',
    orderIndex: 4
  },
  {
    id: "archive_5",
    title: 'সাংস্কৃতিক সন্ধ্যা ও পুরস্কার প্রদান',
    description: 'ঐতিহ্য, হামদ-নাত এবং সুস্থ সংস্কৃতির মহতী উদযাপন',
    date: '১৫ অক্টোবর ২০২৪',
    imageUrl: '/src/assets/images/gallery/1000289031.jpg.jpeg',
    category: 'archive',
    location: 'মুসলিম সাহিত্য সংসদ',
    attendees: '৫০০+ দর্শক',
    orderIndex: 5
  },
  {
    id: "archive_6",
    title: 'দক্ষতা উন্নয়ন ও ক্যারিয়ার ক্যাম্প',
    description: 'উচ্চশিক্ষা ও ক্যারিয়ার নির্মাণে দিকনির্দেশনা কর্মসূচি',
    date: '০১ সেপ্টেম্বর ২০২৪',
    imageUrl: '/src/assets/images/gallery/1000289032.jpg.jpeg',
    category: 'archive',
    location: 'ফেঞ্চুগঞ্জ উপজেলা হল',
    attendees: '৩২০+ শিক্ষার্থী',
    orderIndex: 6
  },
  {
    id: "archive_7",
    title: 'যুব প্রশিক্ষণ ও অলিম্পিয়াড সম্মেলন',
    description: 'বিজ্ঞান ও গণিত অলিম্পিয়াডের বিজয়ীদের সংবর্ধনা',
    date: '২৪ আগস্ট ২০২৪',
    imageUrl: '/src/assets/images/gallery/1000289033.jpg.jpeg',
    category: 'archive',
    location: 'শাহজালাল বিশ্ববিদ্যালয় কনফারেন্স রুম',
    attendees: '২৮০+ অংশগ্রহণকারী',
    orderIndex: 7
  },
  {
    id: "archive_8",
    title: 'সামাজিক দায়বদ্ধতা ও সেবা প্রকল্প',
    description: 'স্থানীয় সম্প্রদায়ের পাশে দাঁড়ানোর মানবিক উদ্যোগ',
    date: '০১ জুলাই ২০২৪',
    imageUrl: '/src/assets/images/gallery/1000289021.jpg.jpeg',
    category: 'archive',
    location: 'মোগলাবাজার ইউনিয়ন',
    attendees: '২০০+ পরিবার',
    orderIndex: 8
  },

  // 3. DOCUMENTARY & VIDEOS (3 items)
  {
    id: "documentary_1",
    title: 'মেধাবৃত্তি গৌরবময় পথচলা - অফিসিয়াল ডকুমেন্টারি',
    description: 'কিশোরকণ্ঠ মেধাবৃত্তির তিন দশকের সোনালী ইতিহাস ও সাফল্যের গল্প',
    date: '১২ মার্চ ২০২৬',
    imageUrl: '/src/assets/images/gallery/1000289029.jpg.jpeg',
    videoUrl: 'https://www.facebook.com/61550084636519/videos/1560922935088975/',
    category: 'documentary',
    location: 'সিলেট জেলা পশ্চিম',
    orderIndex: 1
  },
  {
    id: "documentary_2",
    title: 'প্রতিষ্ঠানের উন্নয়ন ও সমাজসেবা যাত্রা',
    description: 'বছরের বিভিন্ন মাইলফলক, মেধা মূল্যায়ন ও সমাজকল্যাণমূলক কর্মকাণ্ড',
    date: '৩০ মার্চ ২০২৬',
    imageUrl: '/src/assets/images/gallery/1000289030.jpg.jpeg',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    category: 'documentary',
    location: 'সিলেট',
    orderIndex: 2
  },
  {
    id: "documentary_3",
    title: 'কৃতী শিক্ষার্থী সাক্ষাৎকার ও অভিজ্ঞতা সিরিজ',
    description: 'ট্যালেন্টপুল বৃত্তিপ্রাপ্ত মেধাবী শিক্ষার্থীদের অনুপ্রেরণামূলক সাক্ষাৎকার',
    date: '৩০ মার্চ ২০২৬',
    imageUrl: '/src/assets/images/gallery/1000289033.jpg.jpeg',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    category: 'documentary',
    location: 'সিলেট',
    orderIndex: 3
  }
];

async function seedGallery() {
  try {
    console.log("📸 Seeding Gallery & Hero Settings to Firestore...\n");

    // 1. Gallery Hero
    const heroRef = doc(db, "site_settings", "gallery_hero");
    await setDoc(heroRef, { ...GALLERY_HERO, updatedAt: serverTimestamp() }, { merge: true });
    console.log("  ✓ site_settings/gallery_hero saved");

    // 2. Gallery Items
    console.log(`\n📌 Uploading ${GALLERY_ITEMS.length} gallery items...`);
    for (const item of GALLERY_ITEMS) {
      const docRef = doc(db, "gallery", item.id);
      await setDoc(docRef, { ...item, createdAt: serverTimestamp(), updatedAt: serverTimestamp() }, { merge: true });
      console.log(`  ✓ gallery/${item.id} [${item.category}] - ${item.title}`);
    }

    console.log("\n🎉 ALL GALLERY DATA SUCCESSFULLY UPLOADED TO FIRESTORE!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error uploading gallery items:", err);
    process.exit(1);
  }
}

seedGallery();
