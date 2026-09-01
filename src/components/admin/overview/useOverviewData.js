import { useCallback, useEffect, useState } from "react";

import {
  getActivities,
  getAllResults,
  getAnnouncement,
  getArchivedResultYears,
  getCommitteeMembers,
  getFaqs,
  getGalleryItems,
  getHeroSlides,
  getImportantDates,
  getMessages,
  getNotices,
  getRegistrations,
  getSyllabus,
  getTeamStructure,
  getUpazilaCenters,
  normalizeYear,
} from "../../../services/firestore";

/* ============================================================
   OVERVIEW DATA
   One place that reads every collection the dashboard reports on
   and turns it into the numbers the panels render.

   Two rules run through all of it:
   - a fetch that failed stays null and renders as "—". A zero here
     would read as "nothing waiting", which is the opposite of the
     truth when Firestore is simply unreachable.
   - nothing is derived from a second read of data already in hand.
     Result years, for instance, are counted from the results array
     rather than re-reading the whole collection.
   ============================================================ */

const DAY_MS = 86_400_000;

/** Bengali digits, for every number the panel shows. */
export const toBn = (value) =>
  value === null || value === undefined || value === ""
    ? "—"
    : String(value).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[d]);

const BENGALI_DIGIT = /[০-৯]/g;

/** Bengali numerals to ASCII, so two spellings of one value compare equal. */
const toAsciiDigits = (value) =>
  String(value ?? "").replace(BENGALI_DIGIT, (d) => String(d.charCodeAt(0) - 0x09e6));

/** Phone numbers and rolls arrive with dashes, spaces and either numeral set. */
const digitsOnly = (value) => toAsciiDigits(value).replace(/\D/g, "");

/** Trim + casefold + ASCII digits — the comparison key for a transaction id. */
const normKey = (value) => toAsciiDigits(value).trim().toLowerCase();

/** "২০০ টাকা" and "200" both come back as 200; anything unreadable is 0. */
const parseAmount = (value) => {
  const n = parseInt(digitsOnly(value), 10);
  return Number.isFinite(n) ? n : 0;
};

/* Lakh-style grouping (1,23,456) is how taka is written here, and en-IN
   produces exactly that before the digits are swapped to Bengali. */
export const toBnAmount = (value) =>
  value === null || value === undefined ? "—" : toBn(Number(value).toLocaleString("en-IN"));

/* The date fields in site settings are typed by hand and come back with
   whichever numerals the admin used. Date() cannot parse Bengali digits,
   so map them to ASCII before parsing and accept either form. */
const toParsableDate = (value) =>
  typeof value === "string" ? value.replace(BENGALI_DIGIT, (d) => String(d.charCodeAt(0) - 0x09e6)) : value;

/** Firestore Timestamp, {seconds}, Date or ISO string — all to one Date. */
export const toDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value?.toDate === "function") {
    try {
      return value.toDate();
    } catch {
      return null;
    }
  }
  if (typeof value?.seconds === "number") return new Date(value.seconds * 1000);
  const parsed = new Date(toParsableDate(value));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const BN_MONTHS = [
  "জানু",
  "ফেব্রু",
  "মার্চ",
  "এপ্রিল",
  "মে",
  "জুন",
  "জুলাই",
  "আগস্ট",
  "সেপ্ট",
  "অক্টো",
  "নভে",
  "ডিসে",
];

export const formatBnDate = (date) =>
  date ? `${toBn(date.getDate())} ${BN_MONTHS[date.getMonth()]}` : "—";

export const formatBnDateTime = (date) => {
  if (!date) return "—";
  const h = date.getHours();
  const m = date.getMinutes();
  const suffix = h < 12 ? "AM" : "PM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${formatBnDate(date)}, ${toBn(h12)}:${toBn(String(m).padStart(2, "0"))} ${suffix}`;
};

/** "৩ ঘণ্টা আগে" — coarse on purpose, the feed only needs recency. */
export const formatRelative = (date) => {
  if (!date) return "—";
  const diff = Date.now() - date.getTime();
  if (diff < 0) return formatBnDate(date);
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "এইমাত্র";
  if (mins < 60) return `${toBn(mins)} মিনিট আগে`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${toBn(hours)} ঘণ্টা আগে`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${toBn(days)} দিন আগে`;
  return formatBnDate(date);
};

/* ---------------------------------------------------------- aggregation */

/** Counts per value, biggest first, with everything past `limit` folded in. */
const topCounts = (items, pick, limit = 6, restLabel = "অন্যান্য") => {
  const counts = new Map();
  items.forEach((item) => {
    const key = (pick(item) || "").toString().trim();
    if (!key) return;
    counts.set(key, (counts.get(key) || 0) + 1);
  });

  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const head = sorted.slice(0, limit).map(([label, value]) => ({ label, value }));
  const restTotal = sorted.slice(limit).reduce((sum, [, value]) => sum + value, 0);
  if (restTotal > 0) head.push({ label: restLabel, value: restTotal, isRest: true });
  return head;
};

/**
 * Groups rows by a key and returns only the keys that appear more than once.
 * Blank keys are skipped — "both missing" is not a collision, and it would
 * otherwise swamp the list with every incomplete record.
 */
const findDuplicates = (items, keyFn, labelFn) =>
  [...items
    .reduce((groups, item) => {
      const key = keyFn(item);
      if (!key) return groups;
      groups.set(key, [...(groups.get(key) || []), item]);
      return groups;
    }, new Map())
    .entries()]
    .filter(([, group]) => group.length > 1)
    .map(([key, group]) => ({
      key,
      count: group.length,
      names: group.map(labelFn).filter(Boolean),
    }))
    .sort((a, b) => b.count - a.count);

const personName = (r) => r.nameBn || r.nameEn || r.trackingId || "নামবিহীন";

/**
 * Like topCounts, but carries a money total alongside the count and ranks by
 * money rather than volume — for a fee report, who holds the most taka
 * matters more than who filed the most forms.
 */
const groupWithAmount = (items, keyFn, amountFn, limit = 0, restLabel = "অন্যান্য") => {
  const map = new Map();
  items.forEach((item) => {
    const key = keyFn(item);
    if (!key) return;
    const bucket = map.get(key) || { count: 0, amount: 0 };
    map.set(key, { count: bucket.count + 1, amount: bucket.amount + amountFn(item) });
  });

  const sorted = [...map.entries()]
    .sort((a, b) => b[1].amount - a[1].amount || b[1].count - a[1].count)
    .map(([label, v]) => ({ label, value: v.count, amount: v.amount }));

  if (!limit || sorted.length <= limit) return sorted;

  const rest = sorted.slice(limit);
  return [
    ...sorted.slice(0, limit),
    {
      label: restLabel,
      value: rest.reduce((s, r) => s + r.value, 0),
      amount: rest.reduce((s, r) => s + r.amount, 0),
      isRest: true,
    },
  ];
};

/** One bucket per day for the last `days` days, oldest first. */
const dailySeries = (dates, days = 14) => {
  const today = startOfDay(new Date()).getTime();
  const buckets = Array.from({ length: days }, (_, i) => {
    const date = new Date(today - (days - 1 - i) * DAY_MS);
    return { date, label: formatBnDate(date), value: 0 };
  });

  dates.forEach((date) => {
    if (!date) return;
    const index = days - 1 - Math.round((today - startOfDay(date).getTime()) / DAY_MS);
    if (index >= 0 && index < days) buckets[index].value += 1;
  });

  return buckets;
};

const countSince = (dates, from, to = Infinity) =>
  dates.filter((d) => d && d.getTime() >= from && d.getTime() < to).length;

/** Percentage change against the previous window; null when there is no base. */
const trendPct = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : null;
  return Math.round(((current - previous) / previous) * 100);
};

/* ---------------------------------------------------------- milestones */

const MILESTONE_FIELDS = [
  { id: "registrationDeadline", label: "রেজিস্ট্রেশন শেষ", bnField: "registrationDeadlineBn" },
  { id: "admitCardReleaseDate", label: "প্রবেশপত্র প্রকাশ", bnField: "admitCardReleaseDateBn" },
  { id: "examDate", label: "পরীক্ষার দিন", bnField: "examDateBn" },
  { id: "resultPublishDate", label: "ফলাফল প্রকাশ", bnField: "resultPublishDateBn" },
  { id: "prizeDistributionDate", label: "পুরস্কার বিতরণ", bnField: "prizeDistributionDateBn" },
];

const buildMilestones = (dates) => {
  if (!dates) return [];
  const today = startOfDay(new Date()).getTime();

  return MILESTONE_FIELDS.map(({ id, label, bnField }) => {
    const date = toDate(dates[id]);
    const daysLeft = date ? Math.round((startOfDay(date).getTime() - today) / DAY_MS) : null;
    return {
      id,
      label,
      date,
      text: dates[bnField] || (date ? formatBnDate(date) : "নির্ধারিত হয়নি"),
      daysLeft,
      status: daysLeft === null ? "unset" : daysLeft < 0 ? "past" : daysLeft === 0 ? "today" : "upcoming",
      isCountdownTarget: dates.activeCountdownTarget === id,
    };
  });
};

/* ---------------------------------------------------------- the hook */

const settledValue = (result) => (result.status === "fulfilled" ? result.value : undefined);
const settledList = (result) => {
  const value = settledValue(result);
  return Array.isArray(value) ? value : null;
};

export const EMPTY_COUNTS = {
  results: null,
  notices: null,
  gallery: null,
  committee: null,
  messages: null,
  unreadMessages: null,
  registrations: null,
  pendingRegistrations: null,
};

/**
 * Reads everything the overview reports on.
 *
 * `counts` stays a flat shape because the sidebar badges read from it;
 * `data` carries the richer breakdowns that only the overview renders.
 */
export const useOverviewData = () => {
  const [counts, setCounts] = useState(EMPTY_COUNTS);
  const [data, setData] = useState(null);
  const [state, setState] = useState("loading"); // loading | ready | partial
  const [lastUpdated, setLastUpdated] = useState(null);

  const refresh = useCallback(async () => {
    setState("loading");

    const settled = await Promise.allSettled([
      getRegistrations(),
      getAllResults(),
      getMessages(),
      getNotices(),
      getGalleryItems("all"),
      getCommitteeMembers(),
      getImportantDates(),
      getArchivedResultYears(),
      getUpazilaCenters(),
      getFaqs(),
      getActivities(),
      getHeroSlides(),
      getSyllabus(),
      getTeamStructure(),
      getAnnouncement(),
    ]);

    const [
      regsR,
      resultsR,
      messagesR,
      noticesR,
      galleryR,
      committeeR,
      datesR,
      archivedR,
      upazilasR,
      faqsR,
      activitiesR,
      heroR,
      syllabusR,
      teamsR,
      announcementR,
    ] = settled;

    const regs = settledList(regsR);
    const results = settledList(resultsR);
    const messages = settledList(messagesR);
    const notices = settledList(noticesR);
    const gallery = settledList(galleryR);
    const committee = settledList(committeeR);
    const dates = settledValue(datesR) || null;
    const archivedYears = settledList(archivedR) || [];
    const upazilas = settledList(upazilasR);
    const faqs = settledList(faqsR);
    const activities = settledList(activitiesR);
    const heroSlides = settledList(heroR);
    const syllabus = settledList(syllabusR);
    const teams = settledList(teamsR);
    const announcement = settledValue(announcementR) || null;

    /* The four headline collections decide whether the page can claim to be
       complete. A missing FAQ list dulls one inventory tile; a missing
       registration list would make the whole page misleading. */
    const incomplete = [regsR, resultsR, messagesR, noticesR].some(
      (r) => r.status === "rejected" || !Array.isArray(r.value)
    );

    /* -------------------------------------------- registrations */
    const regDates = (regs || []).map((r) => toDate(r.createdAt));
    const todayStart = startOfDay(new Date()).getTime();

    const byStatus = {
      pending: (regs || []).filter((r) => r.status === "pending").length,
      approved: (regs || []).filter((r) => r.status === "approved").length,
      rejected: (regs || []).filter((r) => r.status === "rejected").length,
    };

    const awaitingRoll = (regs || []).filter(
      (r) => r.status === "approved" && !String(r.assignedRoll || "").trim()
    ).length;

    const registrations = regs
      ? {
          total: regs.length,
          ...byStatus,
          awaitingRoll,
          today: countSince(regDates, todayStart),
          last7: countSince(regDates, todayStart - 6 * DAY_MS),
          prev7: countSince(regDates, todayStart - 13 * DAY_MS, todayStart - 6 * DAY_MS),
          series: dailySeries(regDates, 14),
          byUpazila: topCounts(regs, (r) => r.upazila, 6),
          byClass: topCounts(regs, (r) => r.studentClass, 6),
          byGender: topCounts(regs, (r) => r.gender, 3),
          recent: [...regs]
            .map((r) => ({ ...r, _at: toDate(r.createdAt) }))
            .sort((a, b) => (b._at?.getTime() || 0) - (a._at?.getTime() || 0))
            .slice(0, 6),
        }
      : null;

    if (registrations) {
      registrations.trend = trendPct(registrations.last7, registrations.prev7);
    }

    /* -------------------------------------------- fees collected
       Payment is taken at submission, so a rejected application still has
       money against it. The three status totals are kept apart rather than
       summed, because deciding what counts as "collected" (and what has to
       be refunded) is the treasurer's call, not this panel's. */
    const CASH_METHOD = "Cash/School";

    const paidOnline = (regs || []).filter(
      (r) => (r.paymentMethod || "").trim() && r.paymentMethod !== CASH_METHOD
    );
    const duplicateTrx = findDuplicates(paidOnline, (r) => normKey(r.trxId), personName);

    const fees = regs
      ? (() => {
          const amountOf = (r) => parseAmount(r.feeAmount);
          const totals = { approved: 0, pending: 0, rejected: 0 };
          let unreadableAmount = 0;

          regs.forEach((r) => {
            const amount = amountOf(r);
            if (!amount) unreadableAmount += 1;
            if (totals[r.status] !== undefined) totals[r.status] += amount;
          });

          /* Money still in someone's hands is what this breakdown is for, so
             rejected applications are left out of it. */
          const live = regs.filter((r) => r.status !== "rejected");

          return {
            collected: totals.approved,
            awaiting: totals.pending,
            refundable: totals.rejected,
            byMethod: groupWithAmount(
              regs,
              (r) => (r.paymentMethod || "").trim() || "অজানা",
              amountOf
            ),
            byCollector: groupWithAmount(
              live,
              (r) => (r.collectedBy || "").trim(),
              amountOf,
              6
            ),
            /* Only offline entries carry a collector, so an online payment
               with no name against it is not a gap — a cash one is. */
            missingCollector: live.filter(
              (r) => r.paymentMethod === CASH_METHOD && !String(r.collectedBy || "").trim()
            ).length,
            onlineCount: paidOnline.length,
            cashCount: regs.filter((r) => r.paymentMethod === CASH_METHOD).length,
            missingTrx: paidOnline.filter((r) => !String(r.trxId || "").trim()).length,
            duplicateTrx,
            unreadableAmount,
          };
        })()
      : null;

    /* -------------------------------------------- data quality
       Everything here is a collision or a hole that only shows up on exam
       day, when it is too late to fix. */
    const quality = regs
      ? {
          duplicateRolls: findDuplicates(
            regs.filter((r) => String(r.assignedRoll || "").trim()),
            (r) => normKey(r.assignedRoll),
            personName
          ),
          duplicateMobiles: findDuplicates(regs, (r) => digitsOnly(r.mobile), personName),
          duplicateTrx,
          missingPhoto: regs.filter(
            (r) => r.status !== "rejected" && !String(r.photoUrl || "").trim()
          ).length,
          missingMobile: regs.filter((r) => !digitsOnly(r.mobile)).length,
        }
      : null;

    /* -------------------------------------------- admit card readiness
       The portal hands out a card whenever a row is approved OR carries a
       roll; every other field degrades to a fallback rather than blocking.
       So these are print-quality defects, not blockers, and are counted
       that way. */
    const admitEligible = (regs || []).filter(
      (r) => r.status === "approved" || String(r.assignedRoll || "").trim()
    );

    const has = (r, field) => !!String(r[field] || "").trim();

    const readiness = regs
      ? {
          eligible: admitEligible.length,
          noRoll: admitEligible.filter((r) => !has(r, "assignedRoll")).length,
          noPhoto: admitEligible.filter((r) => !has(r, "photoUrl")).length,
          defaultCenter: admitEligible.filter((r) => !has(r, "examCenter")).length,
          noRoom: admitEligible.filter((r) => !has(r, "roomNo")).length,
          clean: admitEligible.filter(
            (r) => has(r, "assignedRoll") && has(r, "photoUrl") && has(r, "examCenter")
          ).length,
          byCenter: topCounts(
            admitEligible,
            (r) => String(r.examCenter || "").trim() || "ডিফল্ট কেন্দ্র (সাইট সেটিংস)",
            6
          ),
        }
      : null;

    /* -------------------------------------------- messages */
    const msgDates = (messages || []).map((m) => toDate(m.createdAt));
    const messageStats = messages
      ? {
          total: messages.length,
          unread: messages.filter((m) => !m.isRead).length,
          chatbot: messages.filter((m) => m.source === "chatbot").length,
          form: messages.filter((m) => m.source !== "chatbot").length,
          today: countSince(msgDates, todayStart),
          last7: countSince(msgDates, todayStart - 6 * DAY_MS),
          prev7: countSince(msgDates, todayStart - 13 * DAY_MS, todayStart - 6 * DAY_MS),
          recent: [...messages]
            .map((m) => ({ ...m, _at: toDate(m.createdAt) }))
            .sort((a, b) => (b._at?.getTime() || 0) - (a._at?.getTime() || 0))
            .slice(0, 6),
        }
      : null;

    if (messageStats) {
      messageStats.trend = trendPct(messageStats.last7, messageStats.prev7);
    }

    /* -------------------------------------------- results, counted by year */
    const archivedSet = new Set(archivedYears.map(normalizeYear));
    const meritYear = dates?.meritListYear ? normalizeYear(dates.meritListYear) : "";

    const yearCounts = new Map();
    (results || []).forEach((r) => {
      const year = normalizeYear(r.year);
      if (!year) return;
      yearCounts.set(year, (yearCounts.get(year) || 0) + 1);
    });

    const resultStats = results
      ? {
          total: results.length,
          schools: new Set(
            results.map((r) => (r.school || "").trim()).filter(Boolean)
          ).size,
          byYear: [...yearCounts.entries()]
            .sort((a, b) => b[0].localeCompare(a[0]))
            .map(([year, value]) => ({
              year,
              value,
              archived: archivedSet.has(year),
              isMeritYear: !!meritYear && year === meritYear,
            })),
          byClass: topCounts(results, (r) => r.class, 6),
          byCategory: topCounts(results, (r) => r.category, 5),
        }
      : null;

    /* -------------------------------------------- what the public sees */
    const publicState = {
      examYear: dates?.examYear || null,
      resultsPublished: dates ? !!dates.resultsPublished : null,
      meritListYear: dates?.meritListYear || "",
      meritListCount: meritYear ? yearCounts.get(meritYear) || 0 : 0,
      countdownTarget: dates?.activeCountdownTarget || null,
      announcementOn: announcement ? announcement.enabled !== false : null,
      announcementTitle: announcement?.title || "",
    };

    /* -------------------------------------------- content inventory */
    const inventory = [
      { id: "notices", label: "নোটিশ", value: notices?.length ?? null },
      { id: "gallery", label: "গ্যালারি", value: gallery?.length ?? null },
      { id: "committee", label: "কমিটি সদস্য", value: committee?.length ?? null },
      { id: "hero", label: "হিরো স্লাইড", value: heroSlides?.length ?? null },
      { id: "activities", label: "কার্যক্রম", value: activities?.length ?? null },
      { id: "faqs", label: "প্রশ্নোত্তর", value: faqs?.length ?? null },
      { id: "syllabus", label: "সিলেবাস", value: syllabus?.length ?? null },
      { id: "teams", label: "টিম স্ট্রাকচার", value: teams?.length ?? null },
      { id: "upazilas", label: "উপজেলা কেন্দ্র", value: upazilas?.length ?? null },
    ];

    /* -------------------------------------------- merged activity feed */
    const feed = [
      ...(registrations?.recent || []).map((r) => ({
        kind: "registration",
        id: `reg-${r.id}`,
        at: r._at,
        title: r.nameBn || r.nameEn || "নামবিহীন আবেদন",
        detail: [r.studentClass, r.upazila].filter(Boolean).join(" • ") || "নতুন আবেদন",
        status: r.status,
        tab: "registrations",
      })),
      ...(messageStats?.recent || []).map((m) => ({
        kind: "message",
        id: `msg-${m.id}`,
        at: m._at,
        title: m.name || "নামবিহীন প্রেরক",
        detail: m.subject || (m.source === "chatbot" ? "চ্যাটবট বার্তা" : "সাধারণ বার্তা"),
        status: m.isRead ? "read" : "unread",
        source: m.source,
        tab: "messages",
      })),
    ]
      .filter((item) => item.at)
      .sort((a, b) => b.at.getTime() - a.at.getTime())
      .slice(0, 8);

    setCounts({
      results: resultStats ? resultStats.total : null,
      notices: notices ? notices.length : null,
      gallery: gallery ? gallery.length : null,
      committee: committee ? committee.length : null,
      messages: messageStats ? messageStats.total : null,
      unreadMessages: messageStats ? messageStats.unread : null,
      registrations: registrations ? registrations.total : null,
      pendingRegistrations: registrations ? registrations.pending : null,
    });

    setData({
      registrations,
      fees,
      quality,
      readiness,
      messages: messageStats,
      results: resultStats,
      milestones: buildMilestones(dates),
      publicState,
      inventory,
      feed,
    });

    setLastUpdated(new Date());
    setState(incomplete ? "partial" : "ready");
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { counts, data, state, lastUpdated, refresh };
};
