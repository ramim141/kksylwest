/**
 * Admin OTP Verification & Email Dispatch Service
 * Handles generation, multi-gateway email dispatching to kishorkanthasylwest@gmail.com,
 * and robust multi-device synchronization via Firestore and safe storage.
 */
import { db, isFirebaseConfigured } from "../firebase/config";
import { safeSessionStorage, safeLocalStorage } from "../utils/safeStorage";

const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const OTP_STORAGE_KEY = "_kk_admin_otp_session";

// Target admin email and password credentials
export const ADMIN_CREDENTIALS = {
  email: "kishorkanthasylwest@gmail.com",
  password: "medhabritti2026",
};

/**
 * Emergency Master Passcode Fallback
 * Guaranteed backup code if third-party email APIs are blocked, throttled,
 * or delayed on specific mobile networks/devices.
 */
export const EMERGENCY_MASTER_OTP = "786202";

/**
 * Normalizes Bengali digits to standard ASCII English digits
 */
export const normalizeToEnglishDigits = (str) => {
  if (!str) return "";
  const bnToEn = {
    "০": "0",
    "১": "1",
    "২": "2",
    "৩": "3",
    "৪": "4",
    "৫": "5",
    "৬": "6",
    "৭": "7",
    "৮": "8",
    "৯": "9",
  };
  return String(str).replace(/[০-৯]/g, (d) => bnToEn[d] || d);
};

/**
 * Validates admin email and password
 */
export const validateAdminCredentials = (email, password) => {
  if (!email || !password) return false;
  const cleanEmail = String(email).trim().toLowerCase();
  const cleanPass = String(password).trim();
  return (
    cleanEmail === ADMIN_CREDENTIALS.email.toLowerCase() &&
    cleanPass === ADMIN_CREDENTIALS.password
  );
};

/**
 * Generates a random 6-digit numeric OTP code
 */
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Dispatches the OTP email to kishorkanthasylwest@gmail.com
 * using multi-gateway fallback & synchronizes to Firestore for multi-device concurrent authentication
 */
export const sendOTPEmail = async (email, otp) => {
  const targetEmail = (email && String(email).trim().toLowerCase()) || ADMIN_CREDENTIALS.email;
  const expiryMinutes = Math.round(OTP_EXPIRY_MS / 60000);
  const currentTimeStr = new Date().toLocaleTimeString("bn-BD", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const subject = `[কিশোরকণ্ঠ মেধাবৃত্তি] অ্যাডমিন লগইন ওটিপি কোড: ${otp}`;
  const messageBody = `কিশোরকণ্ঠ মেধাবৃত্তি পরীক্ষা কন্ট্রোল প্যানেল অ্যাডমিন লগইন ভেরিফিকেশন কোড।\n\nআপনার ওটিপি (OTP) কোড: ${otp}\n\nএই কোডটি আগামী ${expiryMinutes} মিনিট পর্যন্ত কার্যকর থাকবে। (সময়: ${currentTimeStr})\n\nজরুরি প্রয়োজনে ব্যাকআপ কোড: ${EMERGENCY_MASTER_OTP}\n\nআপনি যদি লগইন করার চেষ্টা না করে থাকেন, অনুগ্রহ করে এই মেসেজটি এড়িয়ে চলুন।`;

  const sessionData = {
    otp: btoa(otp), // obfuscated token
    email: targetEmail,
    createdAt: Date.now(),
    expiresAt: Date.now() + OTP_EXPIRY_MS,
  };

  // 1. Store in fail-safe storage (never throws even on restricted devices)
  try {
    safeSessionStorage.setItem(OTP_STORAGE_KEY, JSON.stringify(sessionData));
    safeLocalStorage.setItem(OTP_STORAGE_KEY, JSON.stringify(sessionData));
  } catch {
    // ignore
  }

  // 2. Synchronize to Firestore for multi-device concurrent verification
  try {
    if (isFirebaseConfigured()) {
      const { setDoc, getDoc, doc } = await import("firebase/firestore");
      const otpDocRef = doc(db, "admin_security", "login_otp");
      
      let activeList = [];
      try {
        const snap = await getDoc(otpDocRef);
        if (snap.exists() && Array.isArray(snap.data()?.activeOtps)) {
          const now = Date.now();
          activeList = snap.data().activeOtps.filter((item) => item.expiresAt > now);
        }
      } catch {}

      const newEntry = {
        otp: btoa(otp),
        email: targetEmail,
        createdAt: Date.now(),
        expiresAt: Date.now() + OTP_EXPIRY_MS,
      };

      activeList.push(newEntry);
      if (activeList.length > 8) activeList = activeList.slice(-8);

      await setDoc(otpDocRef, {
        otp: btoa(otp),
        email: targetEmail,
        createdAt: Date.now(),
        expiresAt: Date.now() + OTP_EXPIRY_MS,
        activeOtps: activeList,
      });
    }
  } catch (firestoreErr) {
    console.warn("Firestore cross-device OTP sync note:", firestoreErr);
  }

  let emailSentSuccessfully = false;

  // Helper with 7s timeout to prevent hanging or aborting prematurely on mobile data
  const fetchWithTimeout = (url, options, timeout = 7000) => {
    return Promise.race([
      fetch(url, options),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout")), timeout)
      ),
    ]);
  };

  // Gateway 1: EmailJS if environment variables exist
  const emailjsServiceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const emailjsTemplateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const emailjsPublicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  if (emailjsServiceId && emailjsTemplateId && emailjsPublicKey) {
    try {
      const response = await fetchWithTimeout(
        "https://api.emailjs.com/api/v1.0/email/send",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            service_id: emailjsServiceId,
            template_id: emailjsTemplateId,
            user_id: emailjsPublicKey,
            template_params: {
              to_email: targetEmail,
              otp_code: otp,
              message: messageBody,
              subject: subject,
            },
          }),
        },
        6000
      );
      if (response.ok) {
        emailSentSuccessfully = true;
      }
    } catch (err) {
      console.warn("EmailJS send fallback:", err);
    }
  }

  // Gateway 2: Web3Forms API dispatch (with primary & fallback keys)
  if (!emailSentSuccessfully) {
    const web3keys = [
      import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || "e3796d1d-0e44-4f01-9f93-547df32fcaee",
      "29141d00-474c-4c6e-8557-caecf9c67bc2",
    ];

    for (const key of web3keys) {
      try {
        const response = await fetchWithTimeout(
          "https://api.web3forms.com/submit",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              access_key: key,
              subject: subject,
              from_name: "কিশোরকণ্ঠ মেধাবৃত্তি অ্যাডমিন সুরক্ষা",
              email: targetEmail,
              message: messageBody,
              otp: otp,
              to: targetEmail,
            }),
          },
          6000
        );
        const data = await response.json();
        if (data.success) {
          emailSentSuccessfully = true;
          break;
        }
      } catch (err) {
        console.warn("Web3Forms API send notice:", err);
      }
    }
  }

  // Gateway 3: FormSubmit / Direct Webhook dispatch as fallback
  if (!emailSentSuccessfully) {
    try {
      await fetchWithTimeout(
        `https://formsubmit.co/ajax/${targetEmail}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            _subject: subject,
            _captcha: "false",
            _template: "table",
            "ভেরিফিকেশন ওটিপি কোড (OTP)": otp,
            "মেয়াদ": `${expiryMinutes} মিনিট`,
            "লগইন ইমেইল": targetEmail,
            "সময়": currentTimeStr,
          }),
        },
        6000
      ).catch(() => {});
    } catch (err) {
      console.warn("FormSubmit fallback notice:", err);
    }
  }

  // Log OTP for development visibility & quick debugging
  console.info(
    `%c[Admin Security OTP] Code: ${otp} | Backup: ${EMERGENCY_MASTER_OTP} (Sent to: ${targetEmail})`,
    "background: #065f46; color: #34d399; font-size: 14px; font-weight: bold; padding: 4px 8px; border-radius: 4px;"
  );

  return {
    success: true,
    otp,
    expiresAt: sessionData.expiresAt,
  };
};

/**
 * Synchronous local OTP check
 */
export const verifyAdminOTP = (enteredOtp) => {
  if (!enteredOtp) {
    return { valid: false, error: "অনুগ্রহ করে ওটিপি কোডটি লিখুন।" };
  }

  const cleanOtp = normalizeToEnglishDigits(enteredOtp)
    .replace(/\s+/g, "")
    .trim();

  // 1. Allow Emergency Master Passcode
  if (cleanOtp === EMERGENCY_MASTER_OTP) {
    clearOTPSession();
    return { valid: true, isEmergency: true };
  }

  let rawSession = null;
  try {
    rawSession =
      safeSessionStorage.getItem(OTP_STORAGE_KEY) ||
      safeLocalStorage.getItem(OTP_STORAGE_KEY);
  } catch {
    // ignore
  }

  if (!rawSession) {
    return {
      valid: false,
      error: "ওটিপি সেশনের মেয়াদ শেষ হয়েছে। পুনরায় ওটিপি পাঠান অথবা ব্যাকআপ কোড ব্যবহার করুন।",
    };
  }

  try {
    const session = JSON.parse(rawSession);
    if (Date.now() > session.expiresAt) {
      clearOTPSession();
      return {
        valid: false,
        error: "ওটিপি কোডের মেয়াদ (৫ মিনিট) শেষ হয়ে গেছে। পুনরায় নতুন কোড নিন।",
      };
    }

    const originalOtp = atob(session.otp);
    if (cleanOtp !== originalOtp) {
      return {
        valid: false,
        error: "ভুল ওটিপি কোড! অনুগ্রহ করে ইমেইলে পাঠানো সঠিক ৬ সংখ্যার কোডটি দিন।",
      };
    }

    clearOTPSession();
    return { valid: true };
  } catch {
    return { valid: false, error: "ওটিপি যাচাইকরণে ত্রুটি হয়েছে।" };
  }
};

/**
 * Asynchronous OTP check supporting both local session, Firestore multi-device list,
 * and Emergency Master Passcode
 */
export const verifyAdminOTPAsync = async (enteredOtp) => {
  if (!enteredOtp) {
    return { valid: false, error: "অনুগ্রহ করে ওটিপি কোডটি লিখুন।" };
  }

  const cleanOtp = normalizeToEnglishDigits(enteredOtp)
    .replace(/\s+/g, "")
    .trim();

  // 1. Emergency Master Passcode Check (instant multi-device recovery)
  if (cleanOtp === EMERGENCY_MASTER_OTP) {
    clearOTPSession();
    return { valid: true, isEmergency: true };
  }

  // 2. First check local session / local safe storage
  const localCheck = verifyAdminOTP(cleanOtp);
  if (localCheck.valid) {
    return localCheck;
  }

  // 3. Check Firestore multi-device synchronized OTPs
  try {
    if (isFirebaseConfigured()) {
      const { getDoc, doc, setDoc } = await import("firebase/firestore");
      const docRef = doc(db, "admin_security", "login_otp");
      const snap = await getDoc(docRef);

      if (snap.exists()) {
        const data = snap.data();
        const now = Date.now();

        // Check primary otp
        let isMatched = false;
        if (data.otp && atob(data.otp) === cleanOtp && now <= data.expiresAt) {
          isMatched = true;
        }

        // Check activeOtps list (for concurrent multi-device logins)
        if (!isMatched && Array.isArray(data.activeOtps)) {
          const found = data.activeOtps.find(
            (item) => atob(item.otp) === cleanOtp && now <= item.expiresAt
          );
          if (found) {
            isMatched = true;
          }
        }

        if (isMatched) {
          // Invalidate the matched OTP while preserving other active ones
          try {
            if (Array.isArray(data.activeOtps)) {
              const remaining = data.activeOtps.filter(
                (item) => atob(item.otp) !== cleanOtp && now <= item.expiresAt
              );
              await setDoc(docRef, {
                ...data,
                activeOtps: remaining,
              });
            }
          } catch {}

          clearOTPSession();
          return { valid: true };
        }
      }
    }
  } catch (err) {
    console.warn("Firestore cross-device verify error:", err);
  }

  return {
    valid: false,
    error: localCheck.error || "ভুল ওটিপি কোড! সঠিক কোড দিয়ে আবার চেষ্টা করুন।",
  };
};

/**
 * Clears the active OTP session from safe storages
 */
export const clearOTPSession = () => {
  try {
    safeSessionStorage.removeItem(OTP_STORAGE_KEY);
    safeLocalStorage.removeItem(OTP_STORAGE_KEY);
  } catch {}
};
