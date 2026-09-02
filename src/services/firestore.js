import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "../firebase/config";
import { NOTICE_FIELDS } from "../utils/whatsappNotify";

// Collections Names
export const COLLECTIONS = {
  RESULTS: "results",
  NOTICES: "notices",
  GALLERY: "gallery",
  COMMITTEE: "committee",
  MESSAGES: "messages",
  HERO_SLIDES: "hero_slides",
  ACTIVITIES: "activities",
  FAQS: "faqs",
  SITE_SETTINGS: "site_settings",
  TEAM_STRUCTURE: "team_structure",
  SYLLABUS: "syllabus",
  REGISTRATIONS: "registrations",
  UPAZILA_CENTERS: "upazila_centers",
  EXAM_CENTERS: "exam_centers",
};

// ==================== 1. RESULT SERVICES ====================

/**
 * Searches a student result by roll number
 */
export const searchResultByRoll = async (roll) => {
  if (!roll) return null;
  const cleanRoll = roll.toString().trim();

  // Convert Bengali numerals to English and vice versa
  const bengaliToEnglish = (str) =>
    str.replace(/[০-৯]/g, (d) => "০১২৩৪৫৬৭৮৯".indexOf(d).toString());
  const englishToBengali = (str) =>
    str.replace(/[0-9]/g, (d) => "০১২৩৪৫৬৭৮৯"[d]);

  const engRoll = bengaliToEnglish(cleanRoll);
  const bnRoll = englishToBengali(cleanRoll);
  const searchRolls = Array.from(new Set([cleanRoll, engRoll, bnRoll])).filter(Boolean);

  // 1. If Firebase is configured, search in Firestore
  if (isFirebaseConfigured()) {
    try {
      const q = query(
        collection(db, COLLECTIONS.RESULTS),
        where("roll", "in", searchRolls)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docData = querySnapshot.docs[0].data();
        return { id: querySnapshot.docs[0].id, ...docData };
      }
    } catch (error) {
      console.warn("Firestore search failed, proceeding to results.json fallback:", error);
    }
  }

  // 2. Fallback to results.json
  try {
    const baseUrl = import.meta.env.BASE_URL || "/";
    const res = await fetch(`${baseUrl.replace(/\/$/, "")}/results.json`);
    if (res.ok) {
      const data = await res.json();
      const student = data.find((s) => {
        if (!s || !s.roll) return false;
        const itemRoll = s.roll.toString().trim();
        const itemEngRoll = bengaliToEnglish(itemRoll);
        return (
          itemRoll === cleanRoll ||
          itemRoll === engRoll ||
          itemRoll === bnRoll ||
          itemEngRoll === engRoll
        );
      });
      if (student) return student;
    }
  } catch (err) {
    console.error("Fallback /results.json search error:", err);
  }

  return null;
};

/**
 * Gets all results (or paginated/all from results.json as fallback)
 */
const uncached_getAllResults = async () => {
  if (isFirebaseConfigured()) {
    try {
      const querySnapshot = await getDocs(collection(db, COLLECTIONS.RESULTS));
      if (!querySnapshot.empty) {
        return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      }
    } catch (error) {
      console.warn("Firestore getAllResults failed, using results.json:", error);
    }
  }

  // Fallback to results.json
  try {
    const baseUrl = import.meta.env.BASE_URL || "/";
    const res = await fetch(`${baseUrl.replace(/\/$/, "")}/results.json`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.error("results.json load error:", err);
  }
  return [];
};

/**
 * Batch uploads students results to Firestore in chunks of 400
 */
export const batchUploadResults = async (resultsList, year, onProgress) => {
  if (!isFirebaseConfigured()) {
    throw new Error("Firebase কনফিগারেশন সেট করা নেই! দয়া করে .env ফাইল কনফিগার করুন।");
  }

  const chunkSize = 400; // Under Firestore limit of 500
  const total = resultsList.length;
  let processed = 0;

  for (let i = 0; i < total; i += chunkSize) {
    const chunk = resultsList.slice(i, i + chunkSize);
    const batch = writeBatch(db);

    chunk.forEach((student) => {
      const rowYear =
        canonicalYear(student.year || year) ||
        canonicalYear(new Date().getFullYear());
      // Document ID: roll_year, so re-uploading a sheet overwrites instead
      // of doubling the session up under a second spelling of the year.
      const docId = `${student.roll}_${rowYear}`;
      const docRef = doc(db, COLLECTIONS.RESULTS, docId);

      batch.set(
        docRef,
        {
          ...student,
          year: rowYear,
          uploadedAt: serverTimestamp(),
        },
        { merge: true }
      );
    });

    await batch.commit();
    processed += chunk.length;
    if (onProgress) {
      onProgress(Math.min(100, Math.round((processed / total) * 100)), processed, total);
    }
  }

  return { success: true, count: total };
};

/**
 * Deletes all results of a specific year or all
 */
export const clearResultsByYear = async (year) => {
  if (!isFirebaseConfigured()) throw new Error("Firebase কনফিগার করা নেই!");

  /* Read the whole collection and match on the canonical year rather than
     querying one spelling: a delete that leaves half a session behind is
     worse than a slightly heavier read on a rare admin action. */
  const snapshot = await getDocs(collection(db, COLLECTIONS.RESULTS));
  const target = year && year !== "all" ? canonicalYear(year) : null;
  const docs = target
    ? snapshot.docs.filter((d) => canonicalYear(d.data().year) === target)
    : snapshot.docs;

  const total = docs.length;
  const chunkSize = 400;

  for (let i = 0; i < total; i += chunkSize) {
    const chunk = docs.slice(i, i + chunkSize);
    const batch = writeBatch(db);
    chunk.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }

  return { success: true, deleted: total };
};

/**
 * Adds a single result entry to Firestore
 */
export const addSingleResult = async (studentData) => {
  if (!isFirebaseConfigured()) throw new Error("Firebase কনফিগার করা নেই!");

  const cleanRoll = studentData.roll?.toString().trim();
  const year =
    canonicalYear(studentData.year) || canonicalYear(new Date().getFullYear());
  const docId = `${cleanRoll}_${year}`;
  const docRef = doc(db, COLLECTIONS.RESULTS, docId);

  const payload = {
    ...studentData,
    roll: cleanRoll,
    year: year,
    updatedAt: serverTimestamp(),
    createdAt: serverTimestamp(),
  };

  await setDoc(docRef, payload, { merge: true });
  return { id: docId, ...payload };
};

/**
 * Updates a single result entry in Firestore
 */
export const updateSingleResult = async (id, studentData) => {
  if (!isFirebaseConfigured()) throw new Error("Firebase কনফিগার করা নেই!");

  const docRef = doc(db, COLLECTIONS.RESULTS, id);
  const payload = {
    ...studentData,
    updatedAt: serverTimestamp(),
  };

  await updateDoc(docRef, payload);
  return { id, ...payload };
};

/**
 * Deletes a single result entry from Firestore
 */
export const deleteSingleResult = async (id) => {
  if (!isFirebaseConfigured()) throw new Error("Firebase কনফিগার করা নেই!");

  const docRef = doc(db, COLLECTIONS.RESULTS, id);
  await deleteDoc(docRef);
  return { id, success: true };
};

// ==================== 2. NOTICE SERVICES ====================

const uncached_getNotices = async () => {
  if (isFirebaseConfigured()) {
    try {
      const q = query(
        collection(db, COLLECTIONS.NOTICES),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      }
    } catch (error) {
      console.warn("Firestore getNotices fallback:", error);
    }
  }
  return null; // Signals component to use fallback/mock
};

export const addNotice = async (noticeData) => {
  if (!isFirebaseConfigured()) throw new Error("Firebase কনফিগার করা নেই!");
  const docRef = await addDoc(collection(db, COLLECTIONS.NOTICES), {
    ...noticeData,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateNotice = async (id, updatedData) => {
  if (!isFirebaseConfigured()) throw new Error("Firebase কনফিগার করা নেই!");
  const docRef = doc(db, COLLECTIONS.NOTICES, id);
  await updateDoc(docRef, {
    ...updatedData,
    updatedAt: serverTimestamp(),
  });
};

export const deleteNotice = async (id) => {
  if (!isFirebaseConfigured()) throw new Error("Firebase কনফিগার করা নেই!");
  await deleteDoc(doc(db, COLLECTIONS.NOTICES, id));
};

// ==================== 3. GALLERY SERVICES ====================

const uncached_getGalleryItems = async (category = null) => {
  if (isFirebaseConfigured()) {
    try {
      let q = collection(db, COLLECTIONS.GALLERY);
      if (category && category !== "all") {
        q = query(q, where("category", "==", category));
      }
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      }
    } catch (error) {
      console.warn("Firestore getGalleryItems fallback:", error);
    }
  }
  return null;
};

export const addGalleryItem = async (itemData) => {
  if (!isFirebaseConfigured()) throw new Error("Firebase কনফিগার করা নেই!");
  const docRef = await addDoc(collection(db, COLLECTIONS.GALLERY), {
    ...itemData,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateGalleryItem = async (id, itemData) => {
  if (!isFirebaseConfigured()) throw new Error("Firebase কনফিগার করা নেই!");
  const docRef = doc(db, COLLECTIONS.GALLERY, id);
  await updateDoc(docRef, {
    ...itemData,
    updatedAt: serverTimestamp(),
  });
};

export const deleteGalleryItem = async (id) => {
  if (!isFirebaseConfigured()) throw new Error("Firebase কনফিগার করা নেই!");
  await deleteDoc(doc(db, COLLECTIONS.GALLERY, id));
};

const uncached_getGalleryHeroContent = async () => {
  if (isFirebaseConfigured()) {
    try {
      const docRef = doc(db, COLLECTIONS.SITE_SETTINGS, "gallery_hero");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data();
      }
    } catch (error) {
      console.warn("Firestore getGalleryHeroContent fallback:", error);
    }
  }
  return null;
};

export const saveGalleryHeroContent = async (contentData) => {
  if (!isFirebaseConfigured()) throw new Error("Firebase কনফিগার করা নেই!");
  const docRef = doc(db, COLLECTIONS.SITE_SETTINGS, "gallery_hero");
  await setDoc(
    docRef,
    {
      ...contentData,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
};

export const seedGalleryDefaults = async () => {
  if (!isFirebaseConfigured()) throw new Error("Firebase কনফিগার করা নেই!");
  
  const defaultItems = [
    { id: "recent_1", title: 'স্কলারশিপ বিতরণ ২০২৫', description: 'মেধাবৃত্তি প্রোগ্রাম উদযাপন', date: '১৯ মার্চ ২০২৬', imageUrl: '/src/assets/images/gallery/1000288989.jpg.jpeg', category: 'recent', location: 'কাজী নজরুল অডিটোরিয়াম, রিকাবীবাজার, সিলেট', attendees: '৫০০+ শিক্ষার্থী ও অভিভাবক', orderIndex: 1 },
    { id: "recent_2", title: 'বার্ষিক পুরস্কার বিতরণ', description: 'অসাধারণ শিক্ষার্থীদের সম্মাননা', date: '১০ মার্চ ২০২৬', imageUrl: '/src/assets/images/gallery/1000288990.jpg.jpeg', category: 'recent', location: 'সিলেট জেলা পরিষদ মিলনায়তন', attendees: '৪০০+ উপস্থিতি', orderIndex: 2 },
    { id: "recent_3", title: 'একাডেমিক উৎকর্ষতা সেমিনার', description: 'শিক্ষার্থীদের জন্য প্রশিক্ষণ কর্মশালা', date: '০৫ মার্চ ২০২৬', imageUrl: '/src/assets/images/gallery/1000288991.jpg.jpeg', category: 'recent', location: 'শাহজালাল জামেয়া অডিটোরিয়াম', attendees: '৩৫০+ শিক্ষার্থী', orderIndex: 3 },
    { id: "recent_4", title: 'কমিউনিটি আউটরিচ প্রোগ্রাম', description: 'সমাজসেবামূলক কার্যক্রম', date: '২৮ ফেব্রুয়ারি ২০২৬', imageUrl: '/src/assets/images/gallery/1000288992.jpg.jpeg', category: 'recent', location: 'দক্ষিণ সুরমা উপজেলা', attendees: '২০০+ অংশগ্রহণকারী', orderIndex: 4 },
    { id: "recent_5", title: 'মেধা উন্নয়ন ওয়ার্কশপ', description: 'দক্ষতা বৃদ্ধির প্রশিক্ষণ সেশন', date: '২০ ফেব্রুয়ারি ২০২৬', imageUrl: '/src/assets/images/gallery/1000288993.jpg.jpeg', category: 'recent', location: 'বিশ্বনাথ উপজেলা কেন্দ্র', attendees: '২৫০+ শিক্ষার্থী', orderIndex: 5 },
    { id: "recent_6", title: 'বার্ষিকী উদযাপন অনুষ্ঠান', description: 'প্রতিষ্ঠানের প্রতিষ্ঠাবার্ষিকী উৎসব', date: '১৫ ফেব্রুয়ারি ২০২৬', imageUrl: '/src/assets/images/gallery/1000289013.jpg.jpeg', category: 'recent', location: 'সিলেট কেন্দ্রীয় মুসলিম সাহিত্য সংসদ', attendees: '৬০০+ সুধী ও শুভাকাঙ্ক্ষী', orderIndex: 6 },
    { id: "recent_7", title: 'ডিজিটাল সাক্ষরতা কর্মসূচি', description: 'তরুণদের জন্য প্রযুক্তি প্রশিক্ষণ', date: '০৮ ফেব্রুয়ারি ২০২৬', imageUrl: '/src/assets/images/gallery/1000289015.jpg.jpeg', category: 'recent', location: 'ওসমানীনগর আইসিটি ল্যাব', attendees: '১৮০+ শিক্ষার্থী', orderIndex: 7 },
    { id: "recent_8", title: 'পরিবেশ সচেতনতা প্রচারাভিযান', description: 'টেকসই উন্নয়নের দিকে সচেতনতা সৃষ্টি ও বৃক্ষরোপণ', date: '০১ ফেব্রুয়ারি ২০২৬', imageUrl: '/src/assets/images/gallery/1000289019.jpg.jpeg', category: 'recent', location: 'বালাগঞ্জ উপজেলা চত্বর', attendees: '৩০০+ সদস্য', orderIndex: 8 },
    { id: "archive_1", title: 'স্কলারশিপ বিতরণ ২০২৪', description: 'গত বছরের মেধাবৃত্তি কর্মসূচির স্মরণীয় আয়োজন', date: '১৯ মার্চ ২০২৫', imageUrl: '/src/assets/images/gallery/1000289021.jpg.jpeg', category: 'archive', location: 'কাজী নজরুল অডিটোরিয়াম, সিলেট', attendees: '৪৫০+ অংশগ্রহণকারী', orderIndex: 1 },
    { id: "archive_2", title: 'একাডেমিক সম্মেলন ২০২৪', description: 'শিক্ষাবিদ ও গবেষকদের অংশগ্রহণে জ্ঞানভিত্তিক সমাবেশ', date: '১২ ফেব্রুয়ারি ২০২৫', imageUrl: '/src/assets/images/gallery/1000289022.jpg.jpeg', category: 'archive', location: 'জাতীয় অডিটোরিয়াম', attendees: '৩০০+ অংশগ্রহণকারী', orderIndex: 2 },
    { id: "archive_3", title: 'দাতব্য ও শীতবস্ত্র বিতরণ কর্মসূচি', description: 'সমাজের প্রতি দায়বদ্ধতার মানবিক আয়োজন', date: '০৫ জানুয়ারি ২০২৫', imageUrl: '/src/assets/images/gallery/1000289029.jpg.jpeg', category: 'archive', location: 'স্থানীয় কমিউনিটি সেন্টার', attendees: '২৫০+ উপকারভোগী', orderIndex: 3 },
    { id: "archive_4", title: 'নেতৃত্ব বিকাশ ও মেধা অন্বেষণ প্রোগ্রাম', description: 'ভবিষ্যৎ যুব নেতৃত্ব তৈরির বিশেষ কর্মশালা', date: '২৮ ডিসেম্বর ২০২৪', imageUrl: '/src/assets/images/gallery/1000289030.jpg.jpeg', category: 'archive', location: 'সিলেট শিল্পকলা একাডেমি', attendees: '২০০+ তরুণ শিক্ষার্থী', orderIndex: 4 },
    { id: "archive_5", title: 'সাংস্কৃতিক সন্ধ্যা ও পুরস্কার প্রদান', description: 'ঐতিহ্য, হামদ-নাত এবং সুস্থ সংস্কৃতির মহতী উদযাপন', date: '১৫ অক্টোবর ২০২৪', imageUrl: '/src/assets/images/gallery/1000289031.jpg.jpeg', category: 'archive', location: 'মুসলিম সাহিত্য সংসদ', attendees: '৫০০+ দর্শক', orderIndex: 5 },
    { id: "archive_6", title: 'দক্ষতা উন্নয়ন ও ক্যারিয়ার ক্যাম্প', description: 'উচ্চশিক্ষা ও ক্যারিয়ার নির্মাণে দিকনির্দেশনা কর্মসূচি', date: '০১ সেপ্টেম্বর ২০২৪', imageUrl: '/src/assets/images/gallery/1000289032.jpg.jpeg', category: 'archive', location: 'ফেঞ্চুগঞ্জ উপজেলা হল', attendees: '৩২০+ শিক্ষার্থী', orderIndex: 6 },
    { id: "archive_7", title: 'যুব প্রশিক্ষণ ও অলিম্পিয়াড সম্মেলন', description: 'বিজ্ঞান ও গণিত অলিম্পিয়াডের বিজয়ীদের সংবর্ধনা', date: '২৪ আগস্ট ২০২৪', imageUrl: '/src/assets/images/gallery/1000289033.jpg.jpeg', category: 'archive', location: 'শাহজালাল বিশ্ববিদ্যালয় কনফারেন্স রুম', attendees: '২৮০+ অংশগ্রহণকারী', orderIndex: 7 },
    { id: "archive_8", title: 'সামাজিক দায়বদ্ধতা ও সেবা প্রকল্প', description: 'স্থানীয় সম্প্রদায়ের পাশে দাঁড়ানোর মানবিক উদ্যোগ', date: '০১ জুলাই ২০২৪', imageUrl: '/src/assets/images/gallery/1000289021.jpg.jpeg', category: 'archive', location: 'মোগলাবাজার ইউনিয়ন', attendees: '২০০+ পরিবার', orderIndex: 8 },
    { id: "documentary_1", title: 'মেধাবৃত্তি গৌরবময় পথচলা - অফিসিয়াল ডকুমেন্টারি', description: 'কিশোরকণ্ঠ মেধাবৃত্তির তিন দশকের সোনালী ইতিহাস ও সাফল্যের গল্প', date: '১২ মার্চ ২০২৬', imageUrl: '/src/assets/images/gallery/1000289029.jpg.jpeg', videoUrl: 'https://www.facebook.com/61550084636519/videos/1560922935088975/', category: 'documentary', location: 'সিলেট জেলা পশ্চিম', orderIndex: 1 },
    { id: "documentary_2", title: 'প্রতিষ্ঠানের উন্নয়ন ও সমাজসেবা যাত্রা', description: 'বছরের বিভিন্ন মাইলফলক, মেধা মূল্যায়ন ও সমাজকল্যাণমূলক কর্মকাণ্ড', date: '৩০ মার্চ ২০২৬', imageUrl: '/src/assets/images/gallery/1000289030.jpg.jpeg', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', category: 'documentary', location: 'সিলেট', orderIndex: 2 },
    { id: "documentary_3", title: 'কৃতী শিক্ষার্থী সাক্ষাৎকার ও অভিজ্ঞতা সিরিজ', description: 'ট্যালেন্টপুল বৃত্তিপ্রাপ্ত মেধাবী শিক্ষার্থীদের অনুপ্রেরণামূলক সাক্ষাৎকার', date: '৩০ মার্চ ২০২৬', imageUrl: '/src/assets/images/gallery/1000289033.jpg.jpeg', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', category: 'documentary', location: 'সিলেট', orderIndex: 3 }
  ];

  for (const item of defaultItems) {
    const docRef = doc(db, COLLECTIONS.GALLERY, item.id);
    await setDoc(docRef, { ...item, createdAt: serverTimestamp(), updatedAt: serverTimestamp() }, { merge: true });
  }
};

// ==================== 4. COMMITTEE SERVICES ====================

const uncached_getCommitteeMembers = async () => {
  if (isFirebaseConfigured()) {
    try {
      const q = query(
        collection(db, COLLECTIONS.COMMITTEE),
        orderBy("orderIndex", "asc")
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      }
    } catch (error) {
      console.warn("Firestore getCommitteeMembers fallback:", error);
    }
  }
  return null;
};

export const addCommitteeMember = async (memberData) => {
  if (!isFirebaseConfigured()) throw new Error("Firebase কনফিগার করা নেই!");
  const docRef = await addDoc(collection(db, COLLECTIONS.COMMITTEE), {
    ...memberData,
    orderIndex: Number(memberData.orderIndex) || 99,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateCommitteeMember = async (id, memberData) => {
  if (!isFirebaseConfigured()) throw new Error("Firebase কনফিগার করা নেই!");
  const docRef = doc(db, COLLECTIONS.COMMITTEE, id);
  await updateDoc(docRef, {
    ...memberData,
    orderIndex: Number(memberData.orderIndex) || 99,
    updatedAt: serverTimestamp(),
  });
};

export const deleteCommitteeMember = async (id) => {
  if (!isFirebaseConfigured()) throw new Error("Firebase কনফিগার করা নেই!");
  await deleteDoc(doc(db, COLLECTIONS.COMMITTEE, id));
};

// ==================== 5. MESSAGES & INBOX SERVICES ====================

const LOCAL_MESSAGES_KEY = "kkmb_local_messages";

export const getMessages = async () => {
  if (isFirebaseConfigured()) {
    try {
      const q = query(
        collection(db, COLLECTIONS.MESSAGES),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          createdAt: d.data().createdAt?.toDate ? d.data().createdAt.toDate() : d.data().createdAt,
        }));
      }
    } catch (error) {
      console.warn("Firestore getMessages fallback:", error);
    }
  }

  // Fallback to localStorage
  try {
    const saved = localStorage.getItem(LOCAL_MESSAGES_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.warn("localStorage getMessages error:", e);
  }
  return [];
};

export const sendMessage = async (messageData) => {
  const newMsg = {
    ...messageData,
    isRead: false,
    source: messageData.source || "contact_form", // 'chatbot' | 'contact_form'
    createdAt: new Date().toISOString(),
  };

  if (isFirebaseConfigured()) {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.MESSAGES), {
        ...newMsg,
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (err) {
      console.warn("Firestore sendMessage failed, saving to local fallback:", err);
    }
  }

  // Local storage fallback
  try {
    const existing = JSON.parse(localStorage.getItem(LOCAL_MESSAGES_KEY) || "[]");
    const localItem = {
      id: `local-msg-${Date.now()}`,
      ...newMsg,
    };
    existing.unshift(localItem);
    localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(existing));
    return localItem.id;
  } catch (e) {
    console.error("Failed to save local message:", e);
    throw new Error("মেসেজ পাঠাতে সমস্যা হয়েছে!");
  }
};

export const markMessageRead = async (id, isRead = true) => {
  if (isFirebaseConfigured() && typeof id === "string" && !id.startsWith("local-msg-")) {
    try {
      const docRef = doc(db, COLLECTIONS.MESSAGES, id);
      await updateDoc(docRef, { isRead });
      return;
    } catch (err) {
      console.warn("Firestore markMessageRead error:", err);
    }
  }

  // Update local storage
  try {
    const existing = JSON.parse(localStorage.getItem(LOCAL_MESSAGES_KEY) || "[]");
    const updated = existing.map((m) => (m.id === id ? { ...m, isRead } : m));
    localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn("Local storage markMessageRead error:", e);
  }
};

export const deleteMessage = async (id) => {
  if (isFirebaseConfigured() && typeof id === "string" && !id.startsWith("local-msg-")) {
    try {
      await deleteDoc(doc(db, COLLECTIONS.MESSAGES, id));
      return;
    } catch (err) {
      console.warn("Firestore deleteMessage error:", err);
    }
  }

  // Delete from local storage
  try {
    const existing = JSON.parse(localStorage.getItem(LOCAL_MESSAGES_KEY) || "[]");
    const updated = existing.filter((m) => m.id !== id);
    localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn("Local storage deleteMessage error:", e);
  }
};

// ==================== 6. HERO SLIDER SERVICES ====================

const uncached_getHeroSlides = async () => {
  if (isFirebaseConfigured()) {
    try {
      const q = query(
        collection(db, COLLECTIONS.HERO_SLIDES),
        orderBy("orderIndex", "asc")
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      }
    } catch (error) {
      console.warn("Firestore getHeroSlides fallback:", error);
    }
  }
  return null;
};

export const addHeroSlide = async (slideData) => {
  if (!isFirebaseConfigured()) throw new Error("Firebase কনফিগার করা নেই!");
  const docRef = await addDoc(collection(db, COLLECTIONS.HERO_SLIDES), {
    ...slideData,
    orderIndex: Number(slideData.orderIndex) || 1,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateHeroSlide = async (id, slideData) => {
  if (!isFirebaseConfigured()) throw new Error("Firebase কনফিগার করা নেই!");
  const docRef = doc(db, COLLECTIONS.HERO_SLIDES, id);
  await updateDoc(docRef, {
    ...slideData,
    orderIndex: Number(slideData.orderIndex) || 1,
    updatedAt: serverTimestamp(),
  });
};

export const deleteHeroSlide = async (id) => {
  if (!isFirebaseConfigured()) throw new Error("Firebase কনফিগার করা নেই!");
  await deleteDoc(doc(db, COLLECTIONS.HERO_SLIDES, id));
};

// ==================== 7. ACTIVITIES (যা আমরা করে থাকি) SERVICES ====================

const uncached_getActivities = async () => {
  if (isFirebaseConfigured()) {
    try {
      const q = query(
        collection(db, COLLECTIONS.ACTIVITIES),
        orderBy("orderIndex", "asc")
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      }
    } catch (error) {
      console.warn("Firestore getActivities fallback:", error);
    }
  }
  return null;
};

export const addActivity = async (activityData) => {
  if (!isFirebaseConfigured()) throw new Error("Firebase কনফিগার করা নেই!");
  const docRef = await addDoc(collection(db, COLLECTIONS.ACTIVITIES), {
    ...activityData,
    orderIndex: Number(activityData.orderIndex) || 1,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateActivity = async (id, activityData) => {
  if (!isFirebaseConfigured()) throw new Error("Firebase কনফিগার করা নেই!");
  const docRef = doc(db, COLLECTIONS.ACTIVITIES, id);
  await updateDoc(docRef, {
    ...activityData,
    orderIndex: Number(activityData.orderIndex) || 1,
    updatedAt: serverTimestamp(),
  });
};

export const deleteActivity = async (id) => {
  if (!isFirebaseConfigured()) throw new Error("Firebase কনফিগার করা নেই!");
  await deleteDoc(doc(db, COLLECTIONS.ACTIVITIES, id));
};

export const seedDefaultActivities = async () => {
  if (!isFirebaseConfigured()) throw new Error("Firebase কনফিগার করা নেই!");
  const defaultActivities = [
    {
      title: "মেধাবৃত্তি কার্যক্রম",
      badge: "মেধাবৃত্তি",
      content: "বার্ষিক মেধাবৃত্তি পরীক্ষা আয়োজন এবং কৃতী শিক্ষার্থীদের বিশেষ বৃত্তি ও ক্রেস্ট প্রদান।",
      details: "শিক্ষার্থীদের সুপ্ত প্রতিভা অন্বেষণে প্রতি বছর সিলেট অঞ্চলে বিশাল পরিসরে আয়োজন করা হয় কিশোরকণ্ঠ মেধা বৃত্তি পরীক্ষা। পরীক্ষায় উত্তীর্ণ শিক্ষার্থীদের ট্যালেন্টপুল ও সাধারণ গ্রেডে বৃত্তি, সনদপত্র ও আকর্ষণীয় পুরস্কার প্রদান করা হয়।",
      orderIndex: 1,
      theme: "emerald"
    },
    { 
      title: "শিক্ষা ও অলিম্পিয়াড", 
      badge: "শিক্ষা ও বিজ্ঞান",
      content: "বিজ্ঞান মেলা, কুইজ প্রতিযোগিতা, বিতর্ক উৎসব এবং বিষয়ভিত্তিক শিক্ষা ক্যাম্প।",
      details: "শিক্ষার্থীদের পাঠ্যবইয়ের পাশাপাশি সৃজনশীল মেধা ও মননের বিকাশে আমরা নিয়মিত কুইজ প্রতিযোগিতা, উপস্থিত বক্তৃতা, বিতর্ক উৎসব এবং বিজ্ঞান অলিম্পিয়াডের আয়োজন করে থাকি।",
      orderIndex: 2,
      theme: "blue"
    },
    { 
      title: "সাংস্কৃতিক কার্যক্রম", 
      badge: "সংস্কৃতি",
      content: "হামদ-নাত, ক্বিরাত প্রতিযোগিতা, আবৃত্তি, অভিনয় ও সুস্থ সংস্কৃতির আসর।",
      details: "সুস্থ সংস্কৃতি মানুষকে সুন্দর মনের অধিকারী করে। আমরা নিয়মিত হামদ-নাত, ক্বিরাত এবং দেশাত্মবোধক গানের প্রতিযোগিতার আয়োজন করি। অপসংস্কৃতির সয়লাব থেকে যুবসমাজকে রক্ষা করাই আমাদের উদ্দেশ্য।",
      orderIndex: 3,
      theme: "purple"
    },
    { 
      title: "সমাজকল্যাণ ও সেবা", 
      badge: "সামাজিক সেবা",
      content: "শীতবস্ত্র বিতরণ, বিনামূল্যে রক্তদান কর্মসূচি, ও দুর্যোগে ত্রাণ সহায়তা।",
      details: "মানবতার সেবায় আমরা সদা সচেষ্ট। প্রতি শীতে গরিব ও অসহায়দের মাঝে শীতবস্ত্র বিতরণ, ব্লাড ডোনার গ্রুপের মাধ্যমে মুমূর্ষু রোগীদের রক্তদান এবং বন্যা ও প্রাকৃতিক দুর্যোগে মানুষের পাশে দাঁড়ানো আমাদের অন্যতম প্রধান কাজ।",
      orderIndex: 4,
      theme: "teal"
    },
    { 
      title: "পুরস্কার বিতরণী ও সংবর্ধনা", 
      badge: "পুরস্কার",
      content: "কৃতী শিক্ষার্থীদের অভিভাবক ও বিশিষ্টজনদের উপস্থিতিতে জমকালো সংবর্ধনা অনুষ্ঠান।",
      details: "মেধাবীদের যথাযথ মূল্যায়ন করতে প্রতি বছর বর্ণাঢ্য আয়োজনে কৃতী শিক্ষার্থী সংবর্ধনা ও পুরস্কার বিতরণী অনুষ্ঠিত হয়। বিশিষ্ট শিক্ষাবিদ ও বুদ্ধিজীবীদের উপস্থিতিতে শিক্ষার্থীদের হাতে ক্রেস্ট ও নগদ অর্থ তুলে দেওয়া হয়।",
      orderIndex: 5,
      theme: "amber"
    },
    { 
      title: "পাঠাগার ও পাঠচক্র", 
      badge: "পাঠাগার",
      content: "জ্ঞানভিত্তিক সমাজ গঠনে নিয়মিত বই পড়া, পাঠচক্র ও সমৃদ্ধ উন্মুক্ত পাঠাগার।",
      details: "একটি আলোকিত জাতি গঠনে বই পড়ার কোনো বিকল্প নেই। আমাদের সমৃদ্ধ পাঠাগারে সাহিত্য, বিজ্ঞান, ধর্ম ও ক্যারিয়ার বিষয়ক সহস্রাধিক বই রয়েছে যা শিক্ষার্থীদের জ্ঞানের পরিধি প্রসারিত করে।",
      orderIndex: 6,
      theme: "rose"
    }
  ];

  for (const act of defaultActivities) {
    await addDoc(collection(db, COLLECTIONS.ACTIVITIES), {
      ...act,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
};

// ==================== 8. FAQ (প্রায়শই জিজ্ঞাসিত প্রশ্নাবলী) SERVICES ====================

const uncached_getFaqs = async () => {
  if (isFirebaseConfigured()) {
    try {
      const q = query(
        collection(db, COLLECTIONS.FAQS),
        orderBy("orderIndex", "asc")
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      }
    } catch (error) {
      console.warn("Firestore getFaqs fallback:", error);
    }
  }
  return null;
};

export const addFaq = async (faqData) => {
  if (!isFirebaseConfigured()) throw new Error("Firebase কনফিগার করা নেই!");
  const docRef = await addDoc(collection(db, COLLECTIONS.FAQS), {
    ...faqData,
    orderIndex: Number(faqData.orderIndex) || 1,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateFaq = async (id, faqData) => {
  if (!isFirebaseConfigured()) throw new Error("Firebase কনফিগার করা নেই!");
  const docRef = doc(db, COLLECTIONS.FAQS, id);
  await updateDoc(docRef, {
    ...faqData,
    orderIndex: Number(faqData.orderIndex) || 1,
    updatedAt: serverTimestamp(),
  });
};

export const deleteFaq = async (id) => {
  if (!isFirebaseConfigured()) throw new Error("Firebase কনফিগার করা নেই!");
  await deleteDoc(doc(db, COLLECTIONS.FAQS, id));
};

// ==================== 9. HOMEPAGE CONTENT & STATS (HERO & ABOUT) ====================

const uncached_getHomepageContent = async () => {
  if (isFirebaseConfigured()) {
    try {
      const docRef = doc(db, COLLECTIONS.SITE_SETTINGS, "homepage");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data();
      }
    } catch (error) {
      console.warn("Firestore getHomepageContent fallback:", error);
    }
  }
  return null;
};

export const saveHomepageContent = async (contentData) => {
  if (!isFirebaseConfigured()) throw new Error("Firebase কনফিগার করা নেই!");
  const docRef = doc(db, COLLECTIONS.SITE_SETTINGS, "homepage");
  await setDoc(
    docRef,
    {
      ...contentData,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
};

// ==================== 9.1 IMPACT & ABOUT STATS SERVICES ====================

export const DEFAULT_IMPACT_STATS = [
  {
    id: "stat_1",
    number: "৮০০+",
    label: "পুরস্কারপ্রাপ্ত শিক্ষার্থী",
    iconType: "trophy",
    color: "emerald",
  },
  {
    id: "stat_2",
    number: "৩৬,০০০+",
    label: "অংশগ্রহণকারী শিক্ষার্থী",
    iconType: "users",
    color: "sky",
  },
  {
    id: "stat_3",
    number: "৩২+",
    label: "বছরের গৌরবোজ্জ্বল ইতিহাস",
    iconType: "calendar",
    color: "amber",
  },
  {
    id: "stat_4",
    number: "১০০%",
    label: "স্বচ্ছতা ও নিরপেক্ষতা",
    iconType: "shield",
    color: "indigo",
  },
];

const uncached_getImpactStats = async () => {
  if (isFirebaseConfigured()) {
    try {
      const docRef = doc(db, COLLECTIONS.SITE_SETTINGS, "impact_stats");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists() && docSnap.data().stats && docSnap.data().stats.length > 0) {
        return docSnap.data().stats;
      }
    } catch (error) {
      console.warn("Firestore getImpactStats fallback:", error);
    }
  }
  return DEFAULT_IMPACT_STATS;
};

export const saveImpactStats = async (statsList) => {
  if (!isFirebaseConfigured()) throw new Error("Firebase কনফিগার করা নেই!");
  const docRef = doc(db, COLLECTIONS.SITE_SETTINGS, "impact_stats");
  await setDoc(
    docRef,
    {
      stats: statsList,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
};

// ==================== 9.1 ANNOUNCEMENT / TOP FLASH TICKER SERVICES ====================

const LOCAL_ANNOUNCEMENT_KEY = "kkmb_top_announcement_data";

const uncached_getAnnouncement = async () => {
  if (isFirebaseConfigured()) {
    try {
      const docRef = doc(db, COLLECTIONS.SITE_SETTINGS, "announcement");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data();
      }
    } catch (error) {
      console.warn("Firestore getAnnouncement fallback:", error);
    }
  }

  try {
    const saved = localStorage.getItem(LOCAL_ANNOUNCEMENT_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.warn("localStorage getAnnouncement error:", e);
  }

  return {
    enabled: true,
    title: "জরুরি ঘোষণা",
    message: "কিশোরকণ্ঠ মেধাবৃত্তি ২০২৫-এর অনলাইন রেজিস্ট্রেশন চলছে! আপনার প্রবেশপত্র ডাউনলোড করতে প্রবেশপত্র মেনুতে ক্লিক করুন।",
    linkText: "প্রবেশপত্র ডাউনলোড →",
    linkUrl: "/admit-card",
    badgeType: "urgent", // 'urgent' | 'info' | 'success' | 'amber'
  };
};

export const saveAnnouncement = async (announcementData) => {
  const payload = {
    ...announcementData,
    updatedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(LOCAL_ANNOUNCEMENT_KEY, JSON.stringify(payload));
  } catch (e) {
    console.warn("localStorage saveAnnouncement error:", e);
  }

  if (isFirebaseConfigured()) {
    try {
      const docRef = doc(db, COLLECTIONS.SITE_SETTINGS, "announcement");
      await setDoc(
        docRef,
        {
          ...payload,
          serverUpdatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (err) {
      console.warn("Firestore saveAnnouncement fallback:", err);
    }
  }

  return payload;
};

// ==================== 10. TEAM STRUCTURE (আমাদের টিম স্ট্রাকচার) SERVICES ====================

const uncached_getTeamStructure = async () => {
  if (isFirebaseConfigured()) {
    try {
      const q = query(
        collection(db, COLLECTIONS.TEAM_STRUCTURE),
        orderBy("orderIndex", "asc")
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      }
    } catch (error) {
      console.warn("Firestore getTeamStructure fallback:", error);
    }
  }
  return null;
};

export const addTeamStructure = async (teamData) => {
  if (!isFirebaseConfigured()) throw new Error("Firebase কনফিগার করা নেই!");
  const docRef = await addDoc(collection(db, COLLECTIONS.TEAM_STRUCTURE), {
    ...teamData,
    orderIndex: Number(teamData.orderIndex) || 1,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateTeamStructure = async (id, teamData) => {
  if (!isFirebaseConfigured()) throw new Error("Firebase কনফিগার করা নেই!");
  const docRef = doc(db, COLLECTIONS.TEAM_STRUCTURE, id);
  await updateDoc(docRef, {
    ...teamData,
    orderIndex: Number(teamData.orderIndex) || 1,
    updatedAt: serverTimestamp(),
  });
};

export const deleteTeamStructure = async (id) => {
  if (!isFirebaseConfigured()) throw new Error("Firebase কনফিগার করা নেই!");
  await deleteDoc(doc(db, COLLECTIONS.TEAM_STRUCTURE, id));
};

// ==================== 11. SCHOLARSHIP SYLLABUS SERVICES ====================

const uncached_getSyllabus = async () => {
  if (isFirebaseConfigured()) {
    try {
      const q = query(
        collection(db, COLLECTIONS.SYLLABUS),
        orderBy("orderIndex", "asc")
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      }
    } catch (error) {
      console.warn("Firestore getSyllabus fallback:", error);
    }
  }
  return null;
};

export const addSyllabus = async (syllabusData) => {
  if (!isFirebaseConfigured()) throw new Error("Firebase কনফিগার করা নেই!");
  const docRef = await addDoc(collection(db, COLLECTIONS.SYLLABUS), {
    ...syllabusData,
    orderIndex: Number(syllabusData.orderIndex) || 1,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateSyllabus = async (id, syllabusData) => {
  if (!isFirebaseConfigured()) throw new Error("Firebase কনফিগার করা নেই!");
  const docRef = doc(db, COLLECTIONS.SYLLABUS, id);
  await updateDoc(docRef, {
    ...syllabusData,
    orderIndex: Number(syllabusData.orderIndex) || 1,
    updatedAt: serverTimestamp(),
  });
};

export const deleteSyllabus = async (id) => {
  if (!isFirebaseConfigured()) throw new Error("Firebase কনফিগার করা নেই!");
  await deleteDoc(doc(db, COLLECTIONS.SYLLABUS, id));
};

// ==================== 12. ONLINE REGISTRATION SERVICES ====================

export const getRegistrations = async () => {
  if (isFirebaseConfigured()) {
    try {
      const q = query(
        collection(db, COLLECTIONS.REGISTRATIONS),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      }
    } catch (error) {
      console.warn("Firestore getRegistrations fallback:", error);
    }
  }
  return [];
};

export const getRegistrationById = async (id) => {
  if (!isFirebaseConfigured()) return null;
  const docRef = doc(db, COLLECTIONS.REGISTRATIONS, id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
};

export const addRegistration = async (registrationData) => {
  if (!isFirebaseConfigured()) throw new Error("Firebase কনফিগার করা নেই!");
  
  // Generate human-friendly Tracking ID
  const trackingNumber = Math.floor(100000 + Math.random() * 900000);
  const trackingId = `KKMB-2025-${trackingNumber}`;

  const docRef = await addDoc(collection(db, COLLECTIONS.REGISTRATIONS), {
    ...registrationData,
    trackingId,
    status: registrationData.status || "pending", // pending, approved, rejected
    createdAt: serverTimestamp(),
  });
  return { id: docRef.id, trackingId };
};

export const updateRegistrationStatus = async (
  id,
  status,
  adminNote = "",
  assignedRoll = "",
  examCenter = "",
  examDate = "",
  examTime = "",
  roomNo = ""
) => {
  if (!isFirebaseConfigured()) throw new Error("Firebase কনফিগার করা নেই!");
  const docRef = doc(db, COLLECTIONS.REGISTRATIONS, id);
  await updateDoc(docRef, {
    status,
    adminNote,
    assignedRoll: assignedRoll || "",
    examCenter: examCenter || "",
    examDate: examDate || "২৪ অক্টোবর ২০২৫ (শুক্রবার)",
    examTime: examTime || "সকাল ১০:০০ টা - ১১:৩০ টা",
    roomNo: roomNo || "",
    reviewedAt: serverTimestamp(),
  });
};

/**
 * Writes a roll number onto many registrations at once.
 * Only touches assignedRoll, so a bulk run can never wipe the exam
 * centre/date an admin already tuned on an individual record.
 */
export const bulkAssignRolls = async (assignments = []) => {
  if (!isFirebaseConfigured()) throw new Error("Firebase কনফিগার করা নেই!");
  if (!assignments.length) return 0;

  /* Firestore caps a batch at 500 writes; chunk so a big class still goes
     through in one click. */
  const CHUNK = 400;
  for (let i = 0; i < assignments.length; i += CHUNK) {
    const batch = writeBatch(db);
    assignments.slice(i, i + CHUNK).forEach(({ id, assignedRoll }) => {
      batch.update(doc(db, COLLECTIONS.REGISTRATIONS, id), {
        assignedRoll: String(assignedRoll),
        reviewedAt: serverTimestamp(),
      });
    });
    await batch.commit();
  }
  return assignments.length;
};

/**
 * Stamps a registration once one of its two WhatsApp notices has actually
 * gone out (see src/utils/whatsappNotify.js). The stamp is what stops the
 * same message being sent twice and what the list reads to show who is
 * still waiting on a notice.
 */
export const markRegistrationNotified = async (id, stage) => {
  if (!isFirebaseConfigured()) throw new Error("Firebase কনফিগার করা নেই!");
  const field = NOTICE_FIELDS[stage];
  if (!field) throw new Error(`Unknown notice stage: ${stage}`);
  await updateDoc(doc(db, COLLECTIONS.REGISTRATIONS, id), {
    [field]: serverTimestamp(),
  });
};

export const deleteRegistration = async (id) => {
  if (!isFirebaseConfigured()) throw new Error("Firebase কনফিগার করা নেই!");
  await deleteDoc(doc(db, COLLECTIONS.REGISTRATIONS, id));
};

/**
 * Searches for an Admit Card by Tracking ID, Roll Number, or Phone
 */
export const searchAdmitCard = async (queryTerm) => {
  const cleanTerm = (queryTerm || "").trim();
  if (!cleanTerm) return null;

  if (isFirebaseConfigured()) {
    try {
      // 1. Search in registrations
      const regRef = collection(db, COLLECTIONS.REGISTRATIONS);
      const snapshot = await getDocs(regRef);
      if (!snapshot.empty) {
        const found = snapshot.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .find(
            (r) =>
              (r.status === "approved" || r.assignedRoll) &&
              (r.assignedRoll === cleanTerm ||
                r.trackingId?.toLowerCase() === cleanTerm.toLowerCase() ||
                r.trackingId?.replace(/[^0-9]/g, "") === cleanTerm.replace(/[^0-9]/g, "") ||
                r.mobile?.replace(/[^0-9]/g, "") === cleanTerm.replace(/[^0-9]/g, "") ||
                r.whatsappNumber?.replace(/[^0-9]/g, "") === cleanTerm.replace(/[^0-9]/g, "") ||
                r.guardianPhone?.replace(/[^0-9]/g, "") === cleanTerm.replace(/[^0-9]/g, "") ||
                r.studentPhone?.replace(/[^0-9]/g, "") === cleanTerm.replace(/[^0-9]/g, ""))
          );

        if (found) return found;
      }

      // 2. Search in results as fallback
      const qResult = query(
        collection(db, COLLECTIONS.RESULTS),
        where("roll", "==", cleanTerm)
      );
      const resSnap = await getDocs(qResult);
      if (!resSnap.empty) {
        const resData = resSnap.docs[0].data();
        return {
          id: resSnap.docs[0].id,
          nameBn: resData.name,
          fatherName: resData.father,
          studentClass: resData.class,
          institution: resData.school,
          assignedRoll: resData.roll,
          trackingId: `KKMB-2025-${resData.roll}`,
          status: "approved",
          examCenter: resData.upazila || "সিলেট সরকারি আলিয়া মাদরাসা কেন্দ্র",
        };
      }
    } catch (err) {
      console.warn("Firestore searchAdmitCard error:", err);
    }
  }

  // 3. Fallback to results.json
  try {
    const res = await fetch("/results.json");
    const data = await res.json();
    const student = data.find((s) => s.roll === cleanTerm);
    if (student) {
      return {
        id: `mock-${student.roll}`,
        nameBn: student.name,
        fatherName: student.father,
        studentClass: student.class,
        institution: student.school,
        assignedRoll: student.roll,
        trackingId: `KKMB-2025-${student.roll}`,
        status: "approved",
        examCenter: "সিলেট সরকারি আলিয়া মাদরাসা কেন্দ্র",
      };
    }
  } catch (e) {
    console.warn("Fallback admit lookup failed:", e);
  }

  return null;
};

// ==================== 13. UPAZILA CENTERS & LIBRARIES SERVICES ====================

const uncached_getUpazilaCenters = async () => {
  if (isFirebaseConfigured()) {
    try {
      const q = query(
        collection(db, COLLECTIONS.UPAZILA_CENTERS),
        orderBy("orderIndex", "asc")
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      }
    } catch (error) {
      console.warn("Firestore getUpazilaCenters fallback:", error);
    }
  }
  return null;
};

export const addUpazilaCenter = async (upazilaData) => {
  if (!isFirebaseConfigured()) throw new Error("Firebase কনফিগার করা নেই!");
  const docRef = await addDoc(collection(db, COLLECTIONS.UPAZILA_CENTERS), {
    ...upazilaData,
    orderIndex: Number(upazilaData.orderIndex) || 1,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateUpazilaCenter = async (id, upazilaData) => {
  if (!isFirebaseConfigured()) throw new Error("Firebase কনফিগার করা নেই!");
  const docRef = doc(db, COLLECTIONS.UPAZILA_CENTERS, id);
  await updateDoc(docRef, {
    ...upazilaData,
    orderIndex: Number(upazilaData.orderIndex) || 1,
    updatedAt: serverTimestamp(),
  });
};

/* ==================== EXAM CENTRES ====================

   Where the exam is actually sat. Until now this was free text typed into
   the approval modal for every applicant, so one centre could be spelled
   four ways and no report could group by it. Registrations still store the
   centre's name (the admit card and every existing record read that field),
   but the name now comes from this list.
   ==================================================================== */

/* Seeded on first use so the dropdown is never empty. Only the centre the
   code already defaulted to is listed — the rest are the admin's to add. */
export const DEFAULT_EXAM_CENTERS = [
  {
    name: "সিলেট সরকারি আলিয়া মাদরাসা কেন্দ্র, সিলেট",
    isActive: true,
    orderIndex: 1,
  },
];

const uncached_getExamCenters = async () => {
  if (isFirebaseConfigured()) {
    try {
      const q = query(
        collection(db, COLLECTIONS.EXAM_CENTERS),
        orderBy("orderIndex", "asc")
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      }
    } catch (error) {
      console.warn("Firestore getExamCenters fallback:", error);
    }
  }
  return DEFAULT_EXAM_CENTERS.map((c, i) => ({ id: `default-${i + 1}`, ...c }));
};

export const addExamCenter = async (centerData) => {
  if (!isFirebaseConfigured()) throw new Error("Firebase কনফিগার করা নেই!");
  const docRef = await addDoc(collection(db, COLLECTIONS.EXAM_CENTERS), {
    ...centerData,
    name: String(centerData.name || "").trim(),
    isActive: centerData.isActive !== false,
    orderIndex: Number(centerData.orderIndex) || 1,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateExamCenter = async (id, centerData) => {
  if (!isFirebaseConfigured()) throw new Error("Firebase কনফিগার করা নেই!");
  await updateDoc(doc(db, COLLECTIONS.EXAM_CENTERS, id), {
    ...centerData,
    name: String(centerData.name || "").trim(),
    isActive: centerData.isActive !== false,
    orderIndex: Number(centerData.orderIndex) || 1,
    updatedAt: serverTimestamp(),
  });
};

export const deleteExamCenter = async (id) => {
  if (!isFirebaseConfigured()) throw new Error("Firebase কনফিগার করা নেই!");
  await deleteDoc(doc(db, COLLECTIONS.EXAM_CENTERS, id));
};

/** Writes the defaults, but only into an empty collection. */
export const seedDefaultExamCenters = async () => {
  if (!isFirebaseConfigured()) throw new Error("Firebase কনফিগার করা নেই!");
  const existing = await uncached_getExamCenters();
  if (existing.length > 0) return existing.length;

  const batch = writeBatch(db);
  DEFAULT_EXAM_CENTERS.forEach((center) => {
    batch.set(doc(collection(db, COLLECTIONS.EXAM_CENTERS)), {
      ...center,
      createdAt: serverTimestamp(),
    });
  });
  await batch.commit();
  return DEFAULT_EXAM_CENTERS.length;
};

export const deleteUpazilaCenter = async (id) => {
  if (!isFirebaseConfigured()) throw new Error("Firebase কনফিগার করা নেই!");
  await deleteDoc(doc(db, COLLECTIONS.UPAZILA_CENTERS, id));
};

// ==================== 15. GLOBAL CONTACT & FOOTER SETTINGS ====================

const LOCAL_CONTACT_SETTINGS_KEY = "kkmb_contact_settings_data";

export const DEFAULT_CONTACT_SETTINGS = {
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
  copyrightText: "সর্বস্বত্ব সংরক্ষিত © ১৯৯৪ - ২০২৫ কিশোরকণ্ঠ পাঠক ফোরাম, সিলেট জেলা পশ্চিম শাখা।",
};

const uncached_getContactSettings = async () => {
  if (isFirebaseConfigured()) {
    try {
      const docRef = doc(db, COLLECTIONS.SITE_SETTINGS, "contact_info");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { ...DEFAULT_CONTACT_SETTINGS, ...docSnap.data() };
      }
    } catch (e) {
      console.warn("Firestore getContactSettings fallback:", e);
    }
  }

  try {
    const saved = localStorage.getItem(LOCAL_CONTACT_SETTINGS_KEY);
    if (saved) return { ...DEFAULT_CONTACT_SETTINGS, ...JSON.parse(saved) };
  } catch (e) {
    console.warn("localStorage getContactSettings error:", e);
  }

  return DEFAULT_CONTACT_SETTINGS;
};

export const saveContactSettings = async (contactData) => {
  const payload = {
    ...contactData,
    updatedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(LOCAL_CONTACT_SETTINGS_KEY, JSON.stringify(payload));
  } catch (e) {
    console.warn("localStorage saveContactSettings error:", e);
  }

  if (isFirebaseConfigured()) {
    try {
      const docRef = doc(db, COLLECTIONS.SITE_SETTINGS, "contact_info");
      await setDoc(
        docRef,
        {
          ...payload,
          serverUpdatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (err) {
      console.warn("Firestore saveContactSettings fallback:", err);
    }
  }

  return payload;
};

// ==================== 16. IMPORTANT DATES & COUNTDOWN SETTINGS ====================

const LOCAL_IMPORTANT_DATES_KEY = "kkmb_important_dates_data";

export const DEFAULT_IMPORTANT_DATES = {
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
  activeCountdownTarget: "examDate", // 'registrationDeadline' | 'examDate' | 'resultPublishDate'

  /* Which session's merit list the public sees. Empty means none is ready —
     the leaderboard then shows a "not published yet" notice instead. This is
     deliberately separate from examYear: registration for 2026 can be open
     while the list on display is still 2024's, because the 2026 exam has not
     been sat yet. */
  meritListYear: "",

  /* Whether /search will look a roll number up at all. Off until the results
     for examYear are announced. Separate from meritListYear so the two can be
     published in either order. */
  resultsPublished: false,
};

/* Results carry their year as a string, and it reaches us in whichever
   numeral set it was uploaded with. Compare on the digits alone so "২০২৪"
   and "2024" are the same session. */
export const normalizeYear = (year) =>
  String(year ?? "")
    .trim()
    .replace(/[\u09e6-\u09ef]/g, (d) => d.charCodeAt(0) - 0x09e6);

const BENGALI_DIGITS = "\u09e6\u09e7\u09e8\u09e9\u09ea\u09eb\u09ec\u09ed\u09ee\u09ef";

/* The one spelling a session is stored under. Years are typed by hand in
   three different places, so "2026", " ২০২৬" and "২০২৬" all have to end up
   as the same session — otherwise an upload lands in a year the panel can
   neither list, filter nor delete. */
export const canonicalYear = (year) =>
  normalizeYear(year)
    .replace(/[^0-9]/g, "")
    .replace(/[0-9]/g, (d) => BENGALI_DIGITS[Number(d)]);

/* Both numeral sets for one session, for querying records written before
   years were canonicalized. */
export const yearSpellings = (year) => {
  const bn = canonicalYear(year);
  const en = normalizeYear(bn);
  return Array.from(new Set([bn, en].filter(Boolean)));
};

/**
 * Narrows a result set to one session.
 *
 * Records with no `year` at all are kept: results.json, the offline
 * fallback, is a single-year snapshot whose rows never carried the field,
 * and dropping them would empty the leaderboard whenever Firestore is
 * unreachable.
 */
export const filterResultsByYear = (results, year) => {
  const target = normalizeYear(year);
  if (!target) return [];
  return (results || []).filter((r) => {
    const rowYear = normalizeYear(r?.year);
    return !rowYear || rowYear === target;
  });
};

const uncached_getImportantDates = async () => {
  if (isFirebaseConfigured()) {
    try {
      const docRef = doc(db, COLLECTIONS.SITE_SETTINGS, "important_dates");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { ...DEFAULT_IMPORTANT_DATES, ...docSnap.data() };
      }
    } catch (e) {
      console.warn("Firestore getImportantDates fallback:", e);
    }
  }

  try {
    const saved = localStorage.getItem(LOCAL_IMPORTANT_DATES_KEY);
    if (saved) return { ...DEFAULT_IMPORTANT_DATES, ...JSON.parse(saved) };
  } catch (e) {
    console.warn("localStorage getImportantDates error:", e);
  }

  return DEFAULT_IMPORTANT_DATES;
};

/* Merges into whatever is cached rather than replacing it: the dates and
   the result-publication switch are saved by two separate buttons now, so a
   wholesale write would drop the fields the other one owns. */
const mergeLocalDates = (payload) => {
  try {
    const saved = localStorage.getItem(LOCAL_IMPORTANT_DATES_KEY);
    const previous = saved ? JSON.parse(saved) : {};
    localStorage.setItem(
      LOCAL_IMPORTANT_DATES_KEY,
      JSON.stringify({ ...previous, ...payload })
    );
  } catch (e) {
    console.warn("localStorage important dates write error:", e);
  }
};

export const saveImportantDates = async (datesData) => {
  const payload = {
    ...datesData,
    updatedAt: new Date().toISOString(),
  };

  mergeLocalDates(payload);

  if (isFirebaseConfigured()) {
    try {
      const docRef = doc(db, COLLECTIONS.SITE_SETTINGS, "important_dates");
      await setDoc(
        docRef,
        {
          ...payload,
          serverUpdatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (err) {
      console.warn("Firestore saveImportantDates fallback:", err);
    }
  }

  return payload;
};

/**
 * Saves only the result-publication switches.
 *
 * Publication is flipped on results night, often while the date fields on
 * the same screen are half-edited. Writing just these two keys means the
 * button can never publish a date the admin was still typing — or, worse,
 * carry an unsaved change to the switches into a plain date save.
 */
export const saveResultVisibility = async ({ resultsPublished, meritListYear }) => {
  const payload = {
    resultsPublished: !!resultsPublished,
    meritListYear: meritListYear || "",
    updatedAt: new Date().toISOString(),
  };

  mergeLocalDates(payload);

  if (isFirebaseConfigured()) {
    try {
      await setDoc(
        doc(db, COLLECTIONS.SITE_SETTINGS, "important_dates"),
        { ...payload, serverUpdatedAt: serverTimestamp() },
        { merge: true }
      );
    } catch (err) {
      console.warn("Firestore saveResultVisibility fallback:", err);
    }
  }

  return payload;
};

// ==================== 17. ADMIT CARD DEFAULTS & RULES SETTINGS ====================

const LOCAL_ADMIT_CARD_SETTINGS_KEY = "kkmb_admit_card_settings_data";

export const DEFAULT_ADMIT_CARD_SETTINGS = {
  defaultCenter: "সিলেট সরকারি আলিয়া মাদরাসা কেন্দ্র, সিলেট",
  defaultExamDate: "২৪ অক্টোবর ২০২৫ (শুক্রবার)",
  defaultExamTime: "সকাল ১০:০০টা থেকে ১১:৩০টা",
  defaultSubjects: "বাংলা, ইংরেজি, গণিত, বিজ্ঞান, সাধারণ জ্ঞান",
  sealText1: "SEAL",
  sealText2: "KKMB",
  sealText3: "SYLHET",
  controllerTitle: "পরীক্ষা নিয়ন্ত্রক",
  organizationTitle: "কিশোরকণ্ঠ পরিষদ",
  rules: [
    "প্রবেশপত্র ব্যতিত কোন পরীক্ষার্থী পরীক্ষায় অংশগ্রহণ করতে পারবে না।",
    "প্রবেশপত্র ব্যতিত কোন প্রকার অতিরিক্ত কাগজপত্র পরীক্ষা কেন্দ্রে বহন করা সম্পূর্ণ নিষেধ।",
    "প্রত্যেক পরীক্ষার্থী প্রয়োজনীয় কলম, পেন্সিল ও জ্যামিতি বক্স অবশ্যই সাথে আনতে হবে।",
    "প্রবেশপত্রে উল্লেখিত সময়ের ১৫ মিনিট পূর্বে পরীক্ষার্থীকে অবশ্যই পরীক্ষার হলে উপস্থিত হতে হবে।",
    "পরীক্ষা মানবণ্টন অনুযায়ী MCQ পদ্ধতিতে ১০০ নম্বরে সরাসরি অনুষ্ঠিত হবে।",
    "পরীক্ষার অন্তত তিন দিন পূর্বে প্রবেশপত্র সংগ্রহ করে চূড়ান্ত কেন্দ্র ও আসন বিন্যাস জেনে নিতে হবে।",
  ],
};

const uncached_getAdmitCardSettings = async () => {
  if (isFirebaseConfigured()) {
    try {
      const docRef = doc(db, COLLECTIONS.SITE_SETTINGS, "admit_card_defaults");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { ...DEFAULT_ADMIT_CARD_SETTINGS, ...docSnap.data() };
      }
    } catch (e) {
      console.warn("Firestore getAdmitCardSettings fallback:", e);
    }
  }

  try {
    const saved = localStorage.getItem(LOCAL_ADMIT_CARD_SETTINGS_KEY);
    if (saved) return { ...DEFAULT_ADMIT_CARD_SETTINGS, ...JSON.parse(saved) };
  } catch (e) {
    console.warn("localStorage getAdmitCardSettings error:", e);
  }

  return DEFAULT_ADMIT_CARD_SETTINGS;
};

export const saveAdmitCardSettings = async (settingsData) => {
  const payload = {
    ...settingsData,
    updatedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(LOCAL_ADMIT_CARD_SETTINGS_KEY, JSON.stringify(payload));
  } catch (e) {
    console.warn("localStorage saveAdmitCardSettings error:", e);
  }

  if (isFirebaseConfigured()) {
    try {
      const docRef = doc(db, COLLECTIONS.SITE_SETTINGS, "admit_card_defaults");
      await setDoc(
        docRef,
        {
          ...payload,
          serverUpdatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (err) {
      console.warn("Firestore saveAdmitCardSettings fallback:", err);
    }
  }

  return payload;
};

// ==================== 17.1 BRANDING & LOGO SERVICES ====================

export const DEFAULT_BRANDING_SETTINGS = {
  logos: [
    {
      id: "kkm_main_title",
      name: "নতুন কিশোরকণ্ঠ মেধাবৃত্তি ২০২৬ (মূল আর্টওয়ার্ক লোগো)",
      url: "", // Empty string instructs frontend to use bundled KKM LOGO.png
      type: "title_logo",
      description: "প্রবেশপত্র ও রেজাল্ট ফটো কার্ডের জন্য রঙিন আর্টওয়ার্ক",
      createdAt: new Date().toISOString(),
    },
    {
      id: "kkm_round_crest",
      name: "কিশোরকণ্ঠ গোল ক্রেস্ট লোগো (Classic Logo)",
      url: "", // Empty string instructs frontend to use bundled logo3.png
      type: "crest_logo",
      description: "ওয়েবসাইট নেভবার, ফুটার ও সনদের বৃত্তাকার লোগো",
      createdAt: new Date().toISOString(),
    },
  ],
  placements: {
    admitCard: "kkm_main_title",
    resultCard: "kkm_main_title",
    certificate: "kkm_round_crest",
    navbar: "kkm_round_crest",
    footer: "kkm_round_crest",
  },
};

const LOCAL_BRANDING_SETTINGS_KEY = "kkm_branding_settings_v1";

const uncached_getBrandingSettings = async () => {
  if (isFirebaseConfigured()) {
    try {
      const docRef = doc(db, COLLECTIONS.SITE_SETTINGS, "branding");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          ...DEFAULT_BRANDING_SETTINGS,
          ...data,
          logos: data.logos && data.logos.length > 0 ? data.logos : DEFAULT_BRANDING_SETTINGS.logos,
          placements: { ...DEFAULT_BRANDING_SETTINGS.placements, ...(data.placements || {}) },
        };
      }
    } catch (e) {
      console.warn("Firestore getBrandingSettings fallback:", e);
    }
  }

  try {
    const saved = localStorage.getItem(LOCAL_BRANDING_SETTINGS_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      return {
        ...DEFAULT_BRANDING_SETTINGS,
        ...data,
        logos: data.logos && data.logos.length > 0 ? data.logos : DEFAULT_BRANDING_SETTINGS.logos,
        placements: { ...DEFAULT_BRANDING_SETTINGS.placements, ...(data.placements || {}) },
      };
    }
  } catch (e) {
    console.warn("localStorage getBrandingSettings error:", e);
  }

  return DEFAULT_BRANDING_SETTINGS;
};

export const saveBrandingSettings = async (brandingData) => {
  const payload = {
    ...brandingData,
    updatedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(LOCAL_BRANDING_SETTINGS_KEY, JSON.stringify(payload));
  } catch (e) {
    console.warn("localStorage saveBrandingSettings error:", e);
  }

  if (isFirebaseConfigured()) {
    try {
      const docRef = doc(db, COLLECTIONS.SITE_SETTINGS, "branding");
      await setDoc(
        docRef,
        {
          ...payload,
          serverUpdatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (err) {
      console.warn("Firestore saveBrandingSettings fallback:", err);
    }
  }

  return payload;
};

// ==================== 18. MULTI-YEAR ARCHIVE SERVICES ====================

const uncached_getAvailableResultYears = async () => {
  const defaultYears = ["২০২৫", "২০২৪", "২০২৩"];
  if (isFirebaseConfigured()) {
    try {
      const [snapshot, settingsSnap] = await Promise.all([
        getDocs(collection(db, COLLECTIONS.RESULTS)),
        getDoc(doc(db, COLLECTIONS.SITE_SETTINGS, RESULT_YEARS_DOC)),
      ]);

      const foundMap = new Map();

      // Collect from results collection
      snapshot.docs.forEach((d) => {
        const y = d.data().year;
        if (y) {
          const str = String(y).trim();
          const eng = str.replace(/[০-৯]/g, (d) => "০১২৩৪৫৬৭৮৯".indexOf(d));
          if (eng && !foundMap.has(eng)) {
            // Convert to Bengali representation for standard display
            const bn = eng.replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[d]);
            foundMap.set(eng, bn);
          }
        }
      });

      // Collect from site settings (custom / archived years)
      if (settingsSnap.exists()) {
        const data = settingsSnap.data();
        const allConfigured = [
          ...(Array.isArray(data.custom) ? data.custom : []),
          ...(Array.isArray(data.archived) ? data.archived : []),
        ];
        allConfigured.forEach((y) => {
          const str = String(y).trim();
          const eng = str.replace(/[০-৯]/g, (d) => "০১২৩৪৫৬৭৮৯".indexOf(d));
          if (eng && !foundMap.has(eng)) {
            const bn = eng.replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[d]);
            foundMap.set(eng, bn);
          }
        });
      }

      // If nothing found in db, fallback to defaults
      if (foundMap.size === 0) {
        defaultYears.forEach((y) => {
          const eng = y.replace(/[০-৯]/g, (d) => "০১২৩৪৫৬৭৮৯".indexOf(d));
          foundMap.set(eng, y);
        });
      }

      return Array.from(foundMap.values()).sort((a, b) => {
        const numA = parseInt(a.replace(/[০-৯]/g, (d) => "০১২৩৪৫৬৭৮৯".indexOf(d))) || 0;
        const numB = parseInt(b.replace(/[০-৯]/g, (d) => "০১২৩৪৫৬৭৮৯".indexOf(d))) || 0;
        return numB - numA;
      });
    } catch (e) {
      console.warn("Firestore getAvailableResultYears error:", e);
    }
  }
  return defaultYears;
};

/* ---------------------------------------------------------------
   Year status.

   Which sessions are live and which are archived used to be a
   hardcoded string comparison on the public page, so nothing could
   actually be archived. It now lives in one settings document:
   every year is live unless it is listed in `archived`, which means
   a brand new upload is visible by default and archiving is the
   deliberate act.
   --------------------------------------------------------------- */

const RESULT_YEARS_DOC = "result_years";

const readYearSettings = async () => {
  if (!isFirebaseConfigured()) return { archived: [], custom: [] };
  try {
    const snap = await getDoc(doc(db, COLLECTIONS.SITE_SETTINGS, RESULT_YEARS_DOC));
    if (snap.exists()) {
      const data = snap.data();
      return {
        archived: Array.isArray(data.archived) ? data.archived.map(String) : [],
        custom: Array.isArray(data.custom) ? data.custom.map(String) : [],
      };
    }
  } catch (error) {
    console.warn("Firestore readYearSettings fallback:", error);
  }
  return { archived: [], custom: [] };
};

const uncached_getArchivedResultYears = async () => {
  if (isFirebaseConfigured()) {
    try {
      const docRef = doc(db, COLLECTIONS.SITE_SETTINGS, RESULT_YEARS_DOC);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const archived = docSnap.data().archived;
        if (Array.isArray(archived)) return archived.map(String);
      }
    } catch (error) {
      console.warn("Firestore getArchivedResultYears fallback:", error);
    }
  }
  return [];
};

/**
 * Archives or restores one session. Reads the current list and writes
 * the whole set back, normalized to prevent digit-encoding mismatches.
 */
export const setResultYearArchived = async (year, isArchived) => {
  if (!isFirebaseConfigured()) throw new Error("Firebase কনফিগার করা নেই!");

  const target = canonicalYear(year);
  const current = (await readYearSettings()).archived || [];

  // Drop any entry for the same session, whichever numerals it was saved in
  const filtered = current.filter((y) => canonicalYear(y) !== target);
  if (isArchived) filtered.push(target);

  const archived = filtered.sort(
    (a, b) => (Number(normalizeYear(b)) || 0) - (Number(normalizeYear(a)) || 0)
  );

  const docRef = doc(db, COLLECTIONS.SITE_SETTINGS, RESULT_YEARS_DOC);
  await setDoc(docRef, { archived, updatedAt: serverTimestamp() }, { merge: true });

  return archived;
};

/**
 * Every session year, with how many results each one holds.
 *
 * Years are otherwise only implied by the result documents, which means a
 * session cannot exist before its first upload and an empty one vanishes.
 * The settings doc carries a `custom` list so a year can be created up
 * front, and the counts let the panel warn before a destructive delete.
 */
const uncached_getResultYearStats = async () => {
  const counts = {};
  let custom = [];
  let archived = [];

  if (isFirebaseConfigured()) {
    try {
      const [snapshot, settingsSnap] = await Promise.all([
        getDocs(collection(db, COLLECTIONS.RESULTS)),
        getDoc(doc(db, COLLECTIONS.SITE_SETTINGS, RESULT_YEARS_DOC)),
      ]);

      snapshot.docs.forEach((d) => {
        const y = canonicalYear(d.data().year);
        if (y) counts[y] = (counts[y] || 0) + 1;
      });

      if (settingsSnap.exists()) {
        const data = settingsSnap.data();
        if (Array.isArray(data.custom)) custom = data.custom.map(canonicalYear).filter(Boolean);
        if (Array.isArray(data.archived))
          archived = data.archived.map(canonicalYear).filter(Boolean);
      }
    } catch (error) {
      console.warn("Firestore getResultYearStats fallback:", error);
    }
  }

  /* Newest session first, compared as numbers: a mix of numeral sets sorts
     by codepoint otherwise, which puts 2026 below 2025. */
  const years = Array.from(new Set([...Object.keys(counts), ...custom])).sort(
    (a, b) => (Number(normalizeYear(b)) || 0) - (Number(normalizeYear(a)) || 0)
  );

  return { years, counts, custom, archived };
};

/** Registers a session that has no results yet. */
export const addCustomResultYear = async (year) => {
  if (!isFirebaseConfigured()) throw new Error("Firebase কনফিগার করা নেই!");
  const clean = canonicalYear(year);
  if (!clean) throw new Error("শিক্ষাবর্ষ লিখুন!");

  const { years, custom } = await getResultYearStats();
  if (years.includes(clean)) throw new Error(`"${clean}" ইতিমধ্যেই আছে!`);

  const next = Array.from(new Set([...custom, clean])).sort((a, b) => b.localeCompare(a));
  await setDoc(
    doc(db, COLLECTIONS.SITE_SETTINGS, RESULT_YEARS_DOC),
    { custom: next, updatedAt: serverTimestamp() },
    { merge: true }
  );
  return next;
};

/**
 * Renames a session everywhere it appears: the `year` field on every result
 * document, plus the archived and custom lists. Written in batches because a
 * session can hold hundreds of results.
 */
export const renameResultYear = async (oldYear, newYear) => {
  if (!isFirebaseConfigured()) throw new Error("Firebase কনফিগার করা নেই!");
  const from = canonicalYear(oldYear);
  const to = canonicalYear(newYear);
  if (!to) throw new Error("নতুন শিক্ষাবর্ষ লিখুন!");
  if (from === to) return { updated: 0 };

  const { years } = await getResultYearStats();
  if (years.includes(to)) throw new Error(`"${to}" ইতিমধ্যেই আছে!`);

  const snapshot = await getDocs(
    query(collection(db, COLLECTIONS.RESULTS), where("year", "in", yearSpellings(from)))
  );
  const total = snapshot.docs.length;
  const chunkSize = 400;
  for (let i = 0; i < total; i += chunkSize) {
    const batch = writeBatch(db);
    snapshot.docs.slice(i, i + chunkSize).forEach((d) => batch.update(d.ref, { year: to }));
    await batch.commit();
  }

  const { custom, archived } = await readYearSettings();
  const swap = (list) => list.map((y) => (canonicalYear(y) === from ? to : y));
  await setDoc(
    doc(db, COLLECTIONS.SITE_SETTINGS, RESULT_YEARS_DOC),
    {
      custom: Array.from(new Set(swap(custom))),
      archived: Array.from(new Set(swap(archived))),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  return { updated: total };
};

/**
 * Removes a session. Its results go too — a year with results left behind
 * would simply reappear the next time the list is derived.
 */
export const deleteResultYear = async (year) => {
  if (!isFirebaseConfigured()) throw new Error("Firebase কনফিগার করা নেই!");
  const clean = canonicalYear(year);

  const { deleted } = await clearResultsByYear(clean);

  const { custom, archived } = await readYearSettings();
  await setDoc(
    doc(db, COLLECTIONS.SITE_SETTINGS, RESULT_YEARS_DOC),
    {
      custom: custom.filter((y) => canonicalYear(y) !== clean),
      archived: archived.filter((y) => canonicalYear(y) !== clean),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  return { deleted };
};

const uncached_getResultsByYear = async (selectedYear = "all") => {
  if (isFirebaseConfigured()) {
    try {
      let q = collection(db, COLLECTIONS.RESULTS);
      if (selectedYear && selectedYear !== "all") {
        const spellings = yearSpellings(selectedYear);
        if (!spellings.length) return [];
        q = query(q, where("year", "in", spellings));
      }
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      }
    } catch (e) {
      console.warn("Firestore getResultsByYear error:", e);
    }
  }

  // Fallback to results.json
  try {
    const baseUrl = import.meta.env.BASE_URL || "/";
    const res = await fetch(`${baseUrl.replace(/\/$/, "")}/results.json`);
    if (res.ok) {
      const all = await res.json();
      if (selectedYear && selectedYear !== "all" && selectedYear !== "২০২৫" && selectedYear !== "2025") {
        // If searching a past year fallback and not in json, return tagged
        return all.filter((s) => s.year === selectedYear);
      }
      return all;
    }
  } catch (e) {
    console.warn("Fallback results load error:", e);
  }
  return [];
};

/* ============================================================
   READ CACHE

   Public pages fetch their content on mount, so leaving a page and
   coming back used to repeat every query — a second of skeletons for
   data the browser already had. These wrappers keep the last read for
   a short window and, because the *promise* is what gets stored, two
   components mounting at once share one request instead of racing.

   Deliberately not applied on /admin: an editor has to see their own
   save reflected immediately, and their traffic is a rounding error.
   ============================================================ */

const READ_CACHE_TTL = 90_000; // ms
const readCache = new Map();

const isAdminSurface = () =>
  typeof window !== "undefined" &&
  window.location.pathname.toLowerCase().startsWith("/admin");

/** Drops cached reads. Pass a name to clear one entry, nothing to clear all. */
export const clearDataCache = (name) => {
  if (!name) {
    readCache.clear();
    return;
  }
  for (const key of Array.from(readCache.keys())) {
    if (key === name || key.startsWith(name + ":")) readCache.delete(key);
  }
};

const cached = (name, fn, ttl = READ_CACHE_TTL) => {
  const wrapped = async (...args) => {
    if (isAdminSurface()) return fn(...args);

    const key = args.length ? name + ":" + JSON.stringify(args) : name;
    const hit = readCache.get(key);
    if (hit && Date.now() - hit.at < ttl) return hit.promise;

    // A rejected read must not be remembered, or one flaky moment would
    // keep failing for the rest of the TTL.
    const promise = fn(...args).catch((err) => {
      readCache.delete(key);
      throw err;
    });
    readCache.set(key, { at: Date.now(), promise });
    return promise;
  };
  wrapped.uncached = fn;
  return wrapped;
};

export const getAllResults = cached("getAllResults", uncached_getAllResults);
export const getNotices = cached("getNotices", uncached_getNotices);
export const getGalleryItems = cached("getGalleryItems", uncached_getGalleryItems);
export const getGalleryHeroContent = cached("getGalleryHeroContent", uncached_getGalleryHeroContent);
export const getCommitteeMembers = cached("getCommitteeMembers", uncached_getCommitteeMembers);
export const getHeroSlides = cached("getHeroSlides", uncached_getHeroSlides);
export const getActivities = cached("getActivities", uncached_getActivities);
export const getFaqs = cached("getFaqs", uncached_getFaqs);
export const getHomepageContent = cached("getHomepageContent", uncached_getHomepageContent);
export const getImpactStats = cached("getImpactStats", uncached_getImpactStats);
export const getAnnouncement = cached("getAnnouncement", uncached_getAnnouncement);
export const getTeamStructure = cached("getTeamStructure", uncached_getTeamStructure);
export const getSyllabus = cached("getSyllabus", uncached_getSyllabus);
export const getUpazilaCenters = cached("getUpazilaCenters", uncached_getUpazilaCenters);
export const getExamCenters = cached("getExamCenters", uncached_getExamCenters);
export const getContactSettings = cached("getContactSettings", uncached_getContactSettings);
export const getImportantDates = cached("getImportantDates", uncached_getImportantDates);
export const getAdmitCardSettings = cached("getAdmitCardSettings", uncached_getAdmitCardSettings);
export const getBrandingSettings = cached("getBrandingSettings", uncached_getBrandingSettings);
export const getAvailableResultYears = cached("getAvailableResultYears", uncached_getAvailableResultYears);
export const getArchivedResultYears = cached("getArchivedResultYears", uncached_getArchivedResultYears);
export const getResultYearStats = cached("getResultYearStats", uncached_getResultYearStats);
export const getResultsByYear = cached("getResultsByYear", uncached_getResultsByYear);
