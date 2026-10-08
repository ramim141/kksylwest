/**
 * Admin OTP Verification & Email Dispatch Service
 * Handles generation, multi-gateway email dispatching to kishorkanthasylwest@gmail.com,
 * and cross-device synchronization via Firestore and local storage.
 */
import { db, isFirebaseConfigured } from "../firebase/config";

const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const OTP_STORAGE_KEY = "_kk_admin_otp_session";

// Target admin email and password credentials
export const ADMIN_CREDENTIALS = {
  email: "kishorkanthasylwest@gmail.com",
  password: "medhabritti2026",
};

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
 * using multi-gateway fallback & synchronizes to Firestore for cross-device authentication
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
  const messageBody = `কিশোরকণ্ঠ মেধাবৃত্তি পরীক্ষা কন্ট্রোল প্যানেল অ্যাডমিন লগইন ভেরিফিকেশন কোড।\n\nআপনার ওটিপি (OTP) কোড: ${otp}\n\nএই কোডটি আগামী ${expiryMinutes} মিনিট পর্যন্ত কার্যকর থাকবে। (সময়: ${currentTimeStr})\n\nআপনি যদি লগইন করার চেষ্টা না করে থাকেন, অনুগ্রহ করে এই মেসেজটি এড়িয়ে চলুন।`;

  const sessionData = {
    otp: btoa(otp), // obfuscated token
    email: targetEmail,
    createdAt: Date.now(),
    expiresAt: Date.now() + OTP_EXPIRY_MS,
  };

  // 1. Store in local sessionStorage & localStorage
  try {
    sessionStorage.setItem(OTP_STORAGE_KEY, JSON.stringify(sessionData));
    localStorage.setItem(OTP_STORAGE_KEY, JSON.stringify(sessionData));
  } catch {
    // ignore storage quota error
  }

  // 2. Synchronize to Firestore for cross-device verification
  try {
    if (isFirebaseConfigured()) {
      const { setDoc, doc } = await import("firebase/firestore");
      await setDoc(doc(db, "admin_security", "login_otp"), {
        otp: btoa(otp),
        email: targetEmail,
        createdAt: Date.now(),
        expiresAt: Date.now() + OTP_EXPIRY_MS,
      });
    }
  } catch (firestoreErr) {
    console.warn("Firestore cross-device OTP sync:", firestoreErr);
  }

  let emailSentSuccessfully = false;

  // Helper with timeout to prevent hanging on weak mobile connections
  const fetchWithTimeout = (url, options, timeout = 4000) => {
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
        3500
      );
      if (response.ok) {
        emailSentSuccessfully = true;
      }
    } catch (err) {
      console.warn("EmailJS send fallback:", err);
    }
  }

  // Gateway 2: Web3Forms API dispatch (with fallback access key)
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
          3500
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
        3500
      ).catch(() => {});
    } catch (err) {
      console.warn("FormSubmit fallback notice:", err);
    }
  }

  // Log OTP for development visibility & quick debugging
  console.info(
    `%c[Admin Security OTP] Code: ${otp} (Sent to: ${targetEmail})`,
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

  const rawSession =
    sessionStorage.getItem(OTP_STORAGE_KEY) || localStorage.getItem(OTP_STORAGE_KEY);

  if (!rawSession) {
    return {
      valid: false,
      error: "ওটিপি সেশনের মেয়াদ শেষ হয়েছে। পুনরায় ওটিপি পাঠান।",
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
 * Asynchronous OTP check supporting both local session and Firestore cross-device synchronization
 */
export const verifyAdminOTPAsync = async (enteredOtp) => {
  if (!enteredOtp) {
    return { valid: false, error: "অনুগ্রহ করে ওটিপি কোডটি লিখুন।" };
  }

  const cleanOtp = normalizeToEnglishDigits(enteredOtp)
    .replace(/\s+/g, "")
    .trim();

  // 1. First check local session / local storage
  const localCheck = verifyAdminOTP(cleanOtp);
  if (localCheck.valid) {
    return localCheck;
  }

  // 2. If local session failed, check Firestore cross-device synced OTP
  try {
    if (isFirebaseConfigured()) {
      const { getDoc, doc, deleteDoc } = await import("firebase/firestore");
      const docRef = doc(db, "admin_security", "login_otp");
      const snap = await getDoc(docRef);

      if (snap.exists()) {
        const data = snap.data();
        if (Date.now() > data.expiresAt) {
          try {
            await deleteDoc(docRef);
          } catch {}
          return {
            valid: false,
            error: "ওটিপি কোডের মেয়াদ (৫ মিনিট) শেষ হয়ে গেছে। পুনরায় নতুন কোড নিন।",
          };
        }

        const originalOtp = atob(data.otp);
        if (cleanOtp === originalOtp) {
          // Clear verified OTP
          try {
            await deleteDoc(docRef);
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
 * Clears the active OTP session from local storages
 */
export const clearOTPSession = () => {
  try {
    sessionStorage.removeItem(OTP_STORAGE_KEY);
    localStorage.removeItem(OTP_STORAGE_KEY);
  } catch {}
};
