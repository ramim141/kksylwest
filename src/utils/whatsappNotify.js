/* ============================================================
   TWO-STAGE WHATSAPP NOTICE FOR A REGISTRATION
   ------------------------------------------------------------
   A registration earns exactly two messages, in this order:

   1. APPROVAL — the moment an admin approves the application.
      Carries the tracking number and nothing else: roll and centre
      simply do not exist yet at that point.
   2. ROLL     — once the roll and the exam centre are both set.
      Carries roll, centre, schedule and the admit-card link.

   Delivery is the admin's own WhatsApp (api.whatsapp.com prefilled
   link) — the site has no server, so nothing can be pushed on its
   own. What IS automatic is the bookkeeping: every send stamps the
   registration, so the list can show who is still owed which notice
   and the same message never goes out twice by accident.
   ============================================================ */

export const NOTICE_STAGES = {
  APPROVAL: "approval",
  ROLL: "roll",
};

/* Firestore fields that record a dispatch, one per stage. */
export const NOTICE_FIELDS = {
  [NOTICE_STAGES.APPROVAL]: "approvalNotifiedAt",
  [NOTICE_STAGES.ROLL]: "rollNotifiedAt",
};

export const NOTICE_LABELS = {
  [NOTICE_STAGES.APPROVAL]: "ট্র্যাকিং নম্বর",
  [NOTICE_STAGES.ROLL]: "রোল ও কেন্দ্র",
};

const DEFAULT_EXAM_DATE = "২৪ অক্টোবর ২০২৫ (শুক্রবার)";
const DEFAULT_EXAM_TIME = "সকাল ১০:০০ টা - ১১:৩০ টা";
const SIGNATURE = "কিশোরকণ্ঠ পাঠক ফোরাম, সিলেট জেলা পশ্চিম।";

/* Rolls and phone numbers are compared raw elsewhere (searchAdmitCard,
   the admit-card link), so Bengali digits have to come down to ASCII. */
const toAsciiDigits = (value) =>
  String(value ?? "").replace(/[\u09e6-\u09ef]/g, (d) =>
    String(d.charCodeAt(0) - 0x09e6)
  );

/**
 * The number a notice should go to, in the international form
 * api.whatsapp.com expects. Returns "" when the record carries none.
 */
export const whatsappNumberOf = (student = {}) => {
  const raw =
    student.whatsappNumber ||
    student.mobile ||
    student.guardianPhone ||
    student.studentPhone ||
    "";
  let digits = toAsciiDigits(raw).replace(/[^0-9]/g, "");
  if (!digits) return "";
  if (digits.startsWith("880")) return digits;
  if (digits.startsWith("0")) return `88${digits}`;
  if (digits.length === 10) return `880${digits}`;
  return digits;
};

const admitCardUrl = (roll) => {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/admit-card?id=${toAsciiDigits(roll).replace(/[^0-9]/g, "")}`;
};

/* Stage 1: approval confirmed, tracking number only. */
const approvalText = (student) => {
  const tracking = student.trackingId || student.trackingNumber || student.id || "";
  const lines = [
    `আসসালামু আলাইকুম ${student.nameBn || student.name || "শিক্ষার্থী"}! 🎉`,
    "কিশোরকণ্ঠ মেধাবৃত্তি পরীক্ষায় আপনার আবেদনটি যাচাই শেষে অনুমোদিত হয়েছে।",
    "",
    `🔖 আপনার ট্র্যাকিং নম্বর: *${tracking}*`,
  ];
  if (student.studentClass) lines.push(`• শ্রেণি: ${student.studentClass}`);
  if (student.institution || student.school) lines.push(`• প্রতিষ্ঠান: ${student.institution || student.school}`);
  lines.push(
    "",
    "নম্বরটি সংরক্ষণ করে রাখুন। পরবর্তীতে রোল নম্বর ও পরীক্ষা কেন্দ্র নির্ধারিত হলে আরেকটি বার্তায় প্রবেশপত্রসহ বিস্তারিত জানিয়ে দেওয়া হবে।",
    "",
    "ধন্যবাদান্তে,",
    SIGNATURE
  );
  return lines.join("\n");
};

/* Stage 2: roll and centre are settled — the full exam briefing. */
const rollText = (student) => {
  const roll = student.assignedRoll || "";
  const lines = [
    `আসসালামু আলাইকুম ${student.nameBn || "শিক্ষার্থী"}!`,
    "আপনার রোল নম্বর ও পরীক্ষা কেন্দ্র নির্ধারিত হয়েছে।",
    "",
    "📌 *পরীক্ষার বিবরণ:*",
    `• রোল নম্বর: *${roll}*`,
    `• শ্রেণি: ${student.studentClass || ""}`,
    `• পরীক্ষা কেন্দ্র: *${student.examCenter || ""}*`,
    `• পরীক্ষার সময়: ${student.examDate || DEFAULT_EXAM_DATE} (${
      student.examTime || DEFAULT_EXAM_TIME
    })`,
  ];
  if (student.roomNo) lines.push(`• রুম / সিট: ${student.roomNo}`);
  lines.push(
    `• ট্র্যাকিং আইডি: ${student.trackingId || ""}`,
    "",
    "🔗 *প্রবেশপত্র (Admit Card) ডাউনলোড লিংক:*",
    admitCardUrl(roll),
    "",
    "ধন্যবাদান্তে,",
    SIGNATURE
  );
  return lines.join("\n");
};

export const buildNoticeText = (stage, student = {}) =>
  stage === NOTICE_STAGES.ROLL ? rollText(student) : approvalText(student);

/**
 * Which notices a record has had and which it still owes.
 * A rejected application owes nothing.
 */
export const noticeStateOf = (student = {}) => {
  const approvalSent = !!student[NOTICE_FIELDS[NOTICE_STAGES.APPROVAL]];
  const rollSent = !!student[NOTICE_FIELDS[NOTICE_STAGES.ROLL]];
  const rejected = student.status === "rejected";
  const hasRollAndCenter =
    !!String(student.assignedRoll || "").trim() &&
    !!String(student.examCenter || "").trim();

  return {
    approvalSent,
    rollSent,
    approvalDue: !rejected && !approvalSent && student.status === "approved",
    rollDue: !rejected && !rollSent && hasRollAndCenter,
    /* The roll notice needs data the record may not carry yet. */
    rollReady: hasRollAndCenter,
    /* A roll with no centre is a dead end: the second notice can never go
       out until someone picks the centre, and nothing else would say so. */
    rollBlocked:
      !rejected &&
      !rollSent &&
      !!String(student.assignedRoll || "").trim() &&
      !String(student.examCenter || "").trim(),
  };
};

/** Stages owed right now, in the order they should be sent. */
export const dueStages = (student) => {
  const state = noticeStateOf(student);
  const stages = [];
  if (state.approvalDue) stages.push(NOTICE_STAGES.APPROVAL);
  if (state.rollDue) stages.push(NOTICE_STAGES.ROLL);
  return stages;
};

/**
 * Hands the prefilled message to WhatsApp in a new tab.
 * Returns false when the browser blocked the popup, so the caller can
 * say so instead of silently marking the notice as sent.
 */
export const openWhatsApp = (phone, text) => {
  const url = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(
    text
  )}`;
  const win = typeof window !== "undefined" ? window.open(url, "_blank") : null;
  return !!win;
};
