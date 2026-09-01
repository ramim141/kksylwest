import React from "react";
import {
  HiAcademicCap,
  HiArchiveBox,
  HiArrowSmallRight,
  HiBell,
  HiCalendarDays,
  HiChartBar,
  HiChatBubbleLeftRight,
  HiCheckCircle,
  HiClock,
  HiDocumentChartBar,
  HiEnvelope,
  HiExclamationTriangle,
  HiEye,
  HiEyeSlash,
  HiCurrencyBangladeshi,
  HiIdentification,
  HiInboxArrowDown,
  HiMapPin,
  HiMegaphone,
  HiShieldExclamation,
  HiSparkles,
  HiTicket,
  HiTrophy,
  HiUserGroup,
} from "react-icons/hi2";

import { NAV_GROUPS } from "../navConfig";
import { Chip, Panel } from "../ui";
import { StatCard } from "../ui/layout";
import {
  BarList,
  ColumnChart,
  IssueRow,
  MetricRow,
  MoneyTile,
  StackedBar,
  TrendPill,
} from "./charts";
import { formatRelative, toBn, toBnAmount } from "./useOverviewData";

/* ============================================================
   OVERVIEW
   The answer to "what needs me right now, and where does the
   season stand" — before the module grid that used to be the
   only thing on this page.
   ============================================================ */

/* ---------------------------------------------------------- section head */
const SectionTitle = ({ icon: Icon, title, hint, aside }) => (
  <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
    <div className="flex items-start gap-3 min-w-0">
      {Icon && (
        <span className="w-9 h-9 rounded-lg shrink-0 bg-surface-overlay/70 border border-line-soft/70 text-ink-muted flex items-center justify-center text-lg">
          <Icon />
        </span>
      )}
      <div className="min-w-0">
        <h2 className="text-[15px] sm:text-base font-bold text-ink-strong tracking-tight leading-snug">
          {title}
        </h2>
        {hint && <p className="text-[12.5px] text-ink-muted mt-0.5 leading-relaxed">{hint}</p>}
      </div>
    </div>
    {aside && <div className="shrink-0">{aside}</div>}
  </div>
);

/* ---------------------------------------------------------- action card */
const ActionCard = ({ icon: Icon, tone, title, body, onClick }) => {
  const tones = {
    secondary: {
      wrap: "border-secondary/30 from-secondary/10 hover:border-secondary/60",
      badge: "bg-secondary/20 text-secondary border-secondary/30",
      arrow: "text-secondary",
    },
    error: {
      wrap: "border-error/30 from-error/10 hover:border-error/60",
      badge: "bg-error/20 text-error border-error/30",
      arrow: "text-error",
    },
    tertiary: {
      wrap: "border-tertiary/30 from-tertiary/10 hover:border-tertiary/60",
      badge: "bg-tertiary/20 text-tertiary border-tertiary/30",
      arrow: "text-tertiary",
    },
  };
  const t = tones[tone] || tones.secondary;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group w-full flex items-center gap-4 rounded-xl border bg-gradient-to-r via-surface-low to-surface
        p-4 text-left hover:shadow-lg transition-all cursor-pointer ${t.wrap}`}
    >
      <span
        className={`w-11 h-11 rounded-xl shrink-0 border flex items-center justify-center text-2xl shadow-sm
          group-hover:scale-105 transition-transform ${t.badge}`}
      >
        <Icon />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-sm sm:text-base font-bold text-ink-strong">{title}</span>
        <span className="block text-[13px] text-ink-muted mt-0.5">{body}</span>
      </span>
      <span
        className={`w-8 h-8 rounded-lg bg-surface-overlay/80 flex items-center justify-center shrink-0
          group-hover:translate-x-1 transition-transform ${t.arrow}`}
      >
        <HiArrowSmallRight className="text-xl" />
      </span>
    </button>
  );
};

/* ---------------------------------------------------------- status tile */
const StatusTile = ({ icon: Icon, label, value, hint, tone = "neutral", onClick }) => {
  const tones = {
    primary: "text-primary bg-primary/12 border-primary/25",
    secondary: "text-secondary bg-secondary/12 border-secondary/25",
    tertiary: "text-tertiary bg-tertiary/12 border-tertiary/25",
    error: "text-error bg-error/12 border-error/25",
    neutral: "text-ink-muted bg-surface-overlay/70 border-line-soft/70",
  };
  const Tag = onClick ? "button" : "div";

  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`flex items-start gap-3 rounded-xl border border-line-soft/70 bg-surface-low/60 p-3.5 text-left min-w-0
        ${onClick ? "cursor-pointer hover:border-line-strong/60 hover:bg-surface-card transition-all" : ""}`}
    >
      <span
        className={`w-9 h-9 rounded-lg shrink-0 border flex items-center justify-center text-lg ${
          tones[tone] || tones.neutral
        }`}
      >
        <Icon />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[11.5px] font-semibold text-ink-muted uppercase tracking-wider">
          {label}
        </span>
        <span className="block text-[15px] font-bold text-ink-strong font-bangla-number truncate mt-0.5">
          {value}
        </span>
        {hint && <span className="block text-[11.5px] text-ink-faint truncate mt-0.5">{hint}</span>}
      </span>
    </Tag>
  );
};

/* ---------------------------------------------------------- milestones */
const MILESTONE_TONE = {
  past: { dot: "bg-primary border-primary", text: "text-primary", chip: "bg-primary/15 text-primary" },
  today: { dot: "bg-secondary border-secondary", text: "text-secondary", chip: "bg-secondary/20 text-secondary" },
  upcoming: { dot: "bg-surface-card border-line-strong", text: "text-ink-muted", chip: "bg-surface-overlay/80 text-ink-muted" },
  unset: { dot: "bg-surface-card border-line-soft", text: "text-ink-faint", chip: "bg-surface-overlay/60 text-ink-faint" },
};

const milestoneCountdown = (m) => {
  if (m.status === "unset") return "তারিখ নেই";
  if (m.status === "today") return "আজ";
  if (m.status === "past") return `${toBn(Math.abs(m.daysLeft))} দিন আগে`;
  return `${toBn(m.daysLeft)} দিন বাকি`;
};

const Timeline = ({ milestones }) => {
  /* The rail runs dot-centre to dot-centre, so the fill is measured in
     segments between dots — not in milestones — and stops at the furthest
     one already reached. */
  const reachedIndex = milestones.reduce(
    (acc, m, i) => (m.status === "past" || m.status === "today" ? i : acc),
    0
  );
  const progress = (reachedIndex / Math.max(milestones.length - 1, 1)) * 100;

  return (
    <div className="relative">
      {/* Rail behind the dots — desktop only, where the row reads horizontally */}
      <div
        aria-hidden="true"
        className="hidden lg:block absolute top-[9px] left-[10%] right-[10%] h-0.5 rounded-full bg-line-soft/80"
      >
        <div
          className="h-full rounded-full bg-primary/70 transition-[width] duration-700"
          style={{ width: `${progress}%` }}
        />
      </div>

      <ol className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-2">
        {milestones.map((m) => {
          const tone = MILESTONE_TONE[m.status] || MILESTONE_TONE.unset;
          return (
            <li
              key={m.id}
              className="flex lg:flex-col items-start lg:items-center gap-3 lg:gap-2 lg:text-center min-w-0"
            >
              <span
                className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center mt-0.5 lg:mt-0 ${tone.dot}
                  ${m.status === "today" ? "animate-pulse" : ""}`}
              >
                {m.status === "past" && (
                  <HiCheckCircle className="text-[13px] text-primary-on" aria-hidden="true" />
                )}
              </span>

              <div className="min-w-0 lg:px-1">
                <p className={`text-[13px] font-bold leading-snug ${tone.text}`}>
                  {m.label}
                  {m.isCountdownTarget && (
                    <span
                      title="সাইটের কাউন্টডাউন এই তারিখের দিকে চলছে"
                      className="ml-1.5 inline-block align-middle w-1.5 h-1.5 rounded-full bg-secondary"
                    />
                  )}
                </p>
                <p className="text-[12px] text-ink-muted mt-0.5 leading-snug break-words">{m.text}</p>
                <span
                  className={`inline-block mt-1.5 rounded-full px-2 py-0.5 text-[11px] font-bold font-bangla-number ${tone.chip}`}
                >
                  {milestoneCountdown(m)}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

/* ---------------------------------------------------------- activity feed */
const FeedItem = ({ item, onOpen }) => {
  const isMessage = item.kind === "message";
  const unread = isMessage && item.status === "unread";
  const pending = !isMessage && item.status === "pending";

  return (
    <li>
      <button
        type="button"
        onClick={() => onOpen(item.tab)}
        className="group w-full flex items-start gap-3 rounded-lg px-2.5 py-2.5 text-left cursor-pointer
          hover:bg-surface-overlay/50 transition-colors"
      >
        <span
          className={`w-8 h-8 rounded-lg shrink-0 border flex items-center justify-center text-sm ${
            isMessage
              ? "bg-tertiary/12 text-tertiary border-tertiary/25"
              : "bg-primary/12 text-primary border-primary/25"
          }`}
        >
          {isMessage ? <HiEnvelope /> : <HiAcademicCap />}
        </span>

        <span className="flex-1 min-w-0">
          <span className="flex items-center gap-2 min-w-0">
            <span className="text-[13px] font-bold text-ink-strong truncate group-hover:text-primary transition-colors">
              {item.title}
            </span>
            {unread && (
              <span className="shrink-0 rounded-full bg-error/20 text-error px-1.5 py-0.5 text-[10px] font-bold">
                অপঠিত
              </span>
            )}
            {pending && (
              <span className="shrink-0 rounded-full bg-secondary/20 text-secondary px-1.5 py-0.5 text-[10px] font-bold">
                পেন্ডিং
              </span>
            )}
          </span>
          <span className="block text-[12px] text-ink-muted truncate mt-0.5">{item.detail}</span>
        </span>

        <span className="shrink-0 text-[11.5px] text-ink-faint font-medium whitespace-nowrap pt-1">
          {formatRelative(item.at)}
        </span>
      </button>
    </li>
  );
};

/* ---------------------------------------------------------- skeleton */
const OverviewSkeleton = () => (
  <div className="space-y-6" aria-hidden="true">
    <div className="h-32 rounded-xl bg-surface-card/60 border border-line-soft/60 animate-pulse" />
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="h-40 rounded-xl bg-surface-card/60 border border-line-soft/60 animate-pulse" />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div className="h-64 rounded-xl bg-surface-card/60 border border-line-soft/60 animate-pulse" />
      <div className="h-64 rounded-xl bg-surface-card/60 border border-line-soft/60 animate-pulse" />
    </div>
  </div>
);

/* ============================================================ */

const Overview = ({ data, state, lastUpdated, goToTab, badgeFor }) => {
  if (!data) return <OverviewSkeleton />;

  const {
    registrations: regs,
    fees,
    quality,
    readiness,
    messages: msgs,
    results,
    milestones,
    publicState,
    inventory,
    feed,
  } = data;
  const loading = state === "loading";

  const dupRolls = quality?.duplicateRolls || [];
  const dupTrx = quality?.duplicateTrx || [];

  const nextMilestone =
    milestones.find((m) => m.status === "today") ||
    milestones.find((m) => m.status === "upcoming") ||
    null;

  const examPassed = milestones.find((m) => m.id === "examDate")?.status === "past";
  const emptySections = inventory.filter((i) => i.value === 0);

  const hasActions =
    (regs?.pending || 0) > 0 ||
    (msgs?.unread || 0) > 0 ||
    (regs?.awaitingRoll || 0) > 0 ||
    dupRolls.length > 0 ||
    (fees?.missingTrx || 0) > 0 ||
    (examPassed && publicState.resultsPublished === false);

  return (
    <div className="space-y-6 animate-fadeIn">
      {state === "partial" && (
        <div className="flex items-start gap-3 rounded-xl border border-secondary/40 bg-secondary/10 px-4 py-3.5 shadow-sm">
          <HiExclamationTriangle className="text-xl text-secondary shrink-0 mt-px" />
          <p className="text-sm text-ink-body leading-relaxed">
            কিছু তথ্য ডেটাবেজ থেকে আনা যায়নি — নিচে “—” চিহ্নিত সংখ্যাগুলো অসম্পূর্ণ। ইন্টারনেট সংযোগ
            যাচাই করে আবার রিফ্রেশ করুন।
          </p>
        </div>
      )}

      {/* ============ 1. SEASON STATUS: what the public sees right now ============ */}
      <Panel>
        <SectionTitle
          icon={HiSparkles}
          title="চলতি সেশনের অবস্থা"
          hint="এই মুহূর্তে ওয়েবসাইটে দর্শনার্থীরা যা দেখছে"
          aside={
            lastUpdated ? (
              <span className="text-[11.5px] text-ink-faint whitespace-nowrap">
                সর্বশেষ হালনাগাদ {formatRelative(lastUpdated)}
              </span>
            ) : null
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          <StatusTile
            icon={HiCalendarDays}
            tone="primary"
            label="চলতি সেশন"
            value={publicState.examYear ? `${publicState.examYear} সাল` : "—"}
            hint={nextMilestone ? `পরবর্তী: ${nextMilestone.label}` : "সব মাইলফলক শেষ"}
            onClick={() => goToTab("content")}
          />
          <StatusTile
            icon={HiClock}
            tone={nextMilestone?.status === "today" ? "secondary" : "tertiary"}
            label="পরবর্তী মাইলফলক"
            value={nextMilestone ? milestoneCountdown(nextMilestone) : "নেই"}
            hint={nextMilestone ? nextMilestone.text : "সবকিছু সম্পন্ন হয়েছে"}
            onClick={() => goToTab("content")}
          />
          <StatusTile
            icon={publicState.resultsPublished ? HiEye : HiEyeSlash}
            tone={publicState.resultsPublished ? "primary" : "secondary"}
            label="ফলাফল অনুসন্ধান"
            value={
              publicState.resultsPublished === null
                ? "—"
                : publicState.resultsPublished
                ? "চালু আছে"
                : "বন্ধ আছে"
            }
            hint={
              publicState.resultsPublished
                ? "শিক্ষার্থীরা রোল দিয়ে ফল দেখতে পারছে"
                : "রোল দিয়ে খোঁজা এখনো বন্ধ"
            }
            onClick={() => goToTab("content")}
          />
          <StatusTile
            icon={HiTrophy}
            tone={publicState.meritListYear ? "primary" : "neutral"}
            label="প্রকাশিত মেধা তালিকা"
            value={publicState.meritListYear ? `${publicState.meritListYear} সাল` : "প্রকাশিত হয়নি"}
            hint={
              publicState.meritListYear
                ? `${toBn(publicState.meritListCount)} জনের ফলাফল দেখানো হচ্ছে`
                : "লিডারবোর্ডে “শীঘ্রই” নোটিশ দেখাচ্ছে"
            }
            onClick={() => goToTab("content")}
          />
        </div>

        {publicState.announcementOn !== null && (
          <div className="flex items-center gap-2.5 mt-4 pt-4 border-t border-line-soft/60 text-[12.5px]">
            <HiMegaphone
              className={`text-base shrink-0 ${
                publicState.announcementOn ? "text-secondary" : "text-ink-faint"
              }`}
            />
            <span className="text-ink-muted">উপরের ঘোষণা বার</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                publicState.announcementOn
                  ? "bg-secondary/15 text-secondary"
                  : "bg-surface-overlay/80 text-ink-faint"
              }`}
            >
              {publicState.announcementOn ? "চালু" : "বন্ধ"}
            </span>
            {publicState.announcementOn && publicState.announcementTitle && (
              <span className="text-ink-faint truncate min-w-0">— {publicState.announcementTitle}</span>
            )}
            <button
              type="button"
              onClick={() => goToTab("announcements")}
              className="ml-auto shrink-0 text-primary font-semibold hover:underline cursor-pointer"
            >
              সম্পাদনা
            </button>
          </div>
        )}
      </Panel>

      {/* ============ 2. HEADLINE NUMBERS ============ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          icon={HiAcademicCap}
          tone="primary"
          value={toBn(regs?.total)}
          label={
            regs
              ? `মোট আবেদন • আজ ${toBn(regs.today)} টি`
              : "মোট অনলাইন আবেদন"
          }
          loading={loading}
          onClick={() => goToTab("registrations")}
          badge={regs ? <TrendPill value={regs.trend} /> : null}
        />
        <StatCard
          icon={HiDocumentChartBar}
          tone="secondary"
          value={toBn(results?.total)}
          label={
            results
              ? `প্রকাশিত ফলাফল • ${toBn(results.byYear.length)} সেশনে`
              : "প্রকাশিত ফলাফল"
          }
          loading={loading}
          onClick={() => goToTab("results")}
          badge={
            results && results.schools > 0 ? (
              <Chip tone="neutral">{toBn(results.schools)} প্রতিষ্ঠান</Chip>
            ) : null
          }
        />
        <StatCard
          icon={HiEnvelope}
          tone="tertiary"
          value={toBn(msgs?.total)}
          label={msgs ? `ইনবক্স • আজ ${toBn(msgs.today)} টি` : "ইনবক্সে মোট মেসেজ"}
          loading={loading}
          onClick={() => goToTab("messages")}
          badge={
            msgs?.unread > 0 ? (
              <Chip tone="error">{toBn(msgs.unread)} অপঠিত</Chip>
            ) : msgs ? (
              <Chip tone="primary" icon={HiCheckCircle}>
                সব পড়া
              </Chip>
            ) : null
          }
        />
        <StatCard
          icon={HiIdentification}
          tone={regs?.awaitingRoll > 0 ? "error" : "primary"}
          value={toBn(regs ? regs.approved - regs.awaitingRoll : null)}
          label={regs ? `রোল বরাদ্দ সম্পন্ন • ${toBn(regs.approved)} অনুমোদিতের মধ্যে` : "রোল বরাদ্দ"}
          loading={loading}
          onClick={() => goToTab("registrations")}
          badge={
            regs?.awaitingRoll > 0 ? (
              <Chip tone="error">{toBn(regs.awaitingRoll)} বাকি</Chip>
            ) : regs?.approved > 0 ? (
              <Chip tone="primary" icon={HiCheckCircle}>
                সম্পূর্ণ
              </Chip>
            ) : null
          }
        />
      </div>

      {/* ============ 3. WHAT NEEDS THE ADMIN ============ */}
      {hasActions && (
        <Panel>
          <SectionTitle
            icon={HiExclamationTriangle}
            title="আপনার অপেক্ষায়"
            hint="যে কাজগুলো না করলে শিক্ষার্থীরা আটকে থাকবে"
            aside={
              <span className="text-[12px] font-semibold text-secondary px-2.5 py-1 rounded-full bg-secondary/10 border border-secondary/20 whitespace-nowrap">
                পদক্ষেপ প্রয়োজন
              </span>
            }
          />

          <div className="space-y-3">
            {dupRolls.length > 0 && (
              <ActionCard
                icon={HiShieldExclamation}
                tone="error"
                title={`${toBn(dupRolls.length)} টি রোল একাধিক শিক্ষার্থীকে দেওয়া হয়েছে`}
                body={`যেমন রোল ${toBn(dupRolls[0].key)} — ${dupRolls[0].names
                  .slice(0, 2)
                  .join(", ")}। ফলাফল আপলোডের আগে ঠিক না করলে ফল মিলবে না`}
                onClick={() => goToTab("registrations")}
              />
            )}

            {regs?.pending > 0 && (
              <ActionCard
                icon={HiAcademicCap}
                tone="secondary"
                title={`${toBn(regs.pending)} টি নতুন আবেদন যাচাইয়ের অপেক্ষায়`}
                body="অনুমোদন দিলে শিক্ষার্থীরা রোল ও প্রবেশপত্র সংগ্রহ করতে পারবে"
                onClick={() => goToTab("registrations")}
              />
            )}

            {regs?.awaitingRoll > 0 && (
              <ActionCard
                icon={HiIdentification}
                tone="tertiary"
                title={`${toBn(regs.awaitingRoll)} জন অনুমোদিত শিক্ষার্থীর রোল বরাদ্দ হয়নি`}
                body="প্রবেশপত্রে রোলের বদলে ট্র্যাকিং আইডি ছাপবে, ফলে হলে রোল মেলানো যাবে না"
                onClick={() => goToTab("registrations")}
              />
            )}

            {fees?.missingTrx > 0 && (
              <ActionCard
                icon={HiCurrencyBangladeshi}
                tone="secondary"
                title={`${toBn(fees.missingTrx)} টি অনলাইন পেমেন্টে ট্রানজেকশন আইডি নেই`}
                body="টাকা সত্যিই এসেছে কি না যাচাই করার উপায় থাকছে না"
                onClick={() => goToTab("registrations")}
              />
            )}

            {msgs?.unread > 0 && (
              <ActionCard
                icon={HiEnvelope}
                tone="error"
                title={`${toBn(msgs.unread)} টি নতুন অপঠিত মেসেজ`}
                body="কন্টাক্ট ফর্ম ও চ্যাটবট থেকে আসা প্রশ্ন"
                onClick={() => goToTab("messages")}
              />
            )}

            {examPassed && publicState.resultsPublished === false && (
              <ActionCard
                icon={HiDocumentChartBar}
                tone="secondary"
                title="পরীক্ষা শেষ, কিন্তু ফলাফল অনুসন্ধান এখনো বন্ধ"
                body="সাইট সেটিংস থেকে ফলাফল প্রকাশ চালু করলে শিক্ষার্থীরা রোল দিয়ে ফল দেখতে পারবে"
                onClick={() => goToTab("content")}
              />
            )}
          </div>
        </Panel>
      )}

      {/* ============ 4. SEASON TIMELINE ============ */}
      {milestones.length > 0 && (
        <Panel>
          <SectionTitle
            icon={HiCalendarDays}
            title="সেশনের সময়রেখা"
            hint="সাইট সেটিংসে নির্ধারিত তারিখ অনুযায়ী"
            aside={
              <span className="inline-flex items-center gap-1.5 text-[11.5px] text-ink-muted">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                সাইটের কাউন্টডাউন
              </span>
            }
          />
          <Timeline milestones={milestones} />
        </Panel>
      )}

      {/* ============ 5. REGISTRATION ANALYTICS ============ */}
      {regs && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Panel>
            <SectionTitle
              icon={HiChartBar}
              title="আবেদনের দৈনিক গতি"
              hint="গত ১৪ দিনে জমা পড়া আবেদন"
              aside={<TrendPill value={regs.trend} />}
            />
            <ColumnChart series={regs.series} tone="primary" unit="আবেদন" />
            <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-line-soft/60 text-center">
              {[
                { label: "আজ", value: regs.today },
                { label: "গত ৭ দিন", value: regs.last7 },
                { label: "তার আগের ৭ দিন", value: regs.prev7 },
              ].map((cell) => (
                <div key={cell.label}>
                  <p className="text-xl font-bold text-ink-strong font-bangla-number tabular-nums">
                    {toBn(cell.value)}
                  </p>
                  <p className="text-[11.5px] text-ink-muted mt-0.5">{cell.label}</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel>
            <SectionTitle
              icon={HiCheckCircle}
              title="যাচাইয়ের অগ্রগতি"
              hint={`মোট ${toBn(regs.total)} টি আবেদনের বর্তমান অবস্থা`}
            />
            <StackedBar
              total={regs.total}
              segments={[
                { label: "অনুমোদিত", value: regs.approved, tone: "primary" },
                { label: "পেন্ডিং", value: regs.pending, tone: "secondary" },
                { label: "বাতিল", value: regs.rejected, tone: "error" },
              ]}
            />
            <div className="mt-5 pt-1">
              <MetricRow
                label="রোল বরাদ্দ সম্পন্ন"
                value={`${toBn(regs.approved - regs.awaitingRoll)} / ${toBn(regs.approved)}`}
                tone={regs.awaitingRoll > 0 ? "secondary" : "primary"}
                hint={
                  regs.awaitingRoll > 0
                    ? `${toBn(regs.awaitingRoll)} জনের প্রবেশপত্রে রোলের বদলে ট্র্যাকিং আইডি ছাপবে`
                    : "সব অনুমোদিত শিক্ষার্থীর রোল বসানো হয়েছে"
                }
              />
              <MetricRow
                label="যাচাই বাকি"
                value={toBn(regs.pending)}
                tone={regs.pending > 0 ? "secondary" : "primary"}
              />
              {regs.byGender.map((g) => (
                <MetricRow key={g.label} label={g.label} value={toBn(g.value)} />
              ))}
            </div>
          </Panel>
        </div>
      )}

      {/* ============ 5b. FEES + DATA QUALITY ============ */}
      {(fees || quality) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {fees && (
            <Panel>
              <SectionTitle
                icon={HiCurrencyBangladeshi}
                title="ফি আদায়ের হিসাব"
                hint="আবেদন জমার সময় নেওয়া রেজিস্ট্রেশন ফি"
                aside={
                  <Chip tone="neutral">
                    অনলাইন {toBn(fees.onlineCount)} • ক্যাশ {toBn(fees.cashCount)}
                  </Chip>
                }
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <MoneyTile
                  label="অনুমোদিত"
                  amount={toBnAmount(fees.collected)}
                  hint="যাচাই সম্পন্ন আবেদন"
                  tone="primary"
                />
                <MoneyTile
                  label="যাচাই বাকি"
                  amount={toBnAmount(fees.awaiting)}
                  hint="পেন্ডিং আবেদনের টাকা"
                  tone="secondary"
                />
                <MoneyTile
                  label="বাতিলকৃত"
                  amount={toBnAmount(fees.refundable)}
                  hint="ফেরত দিতে হতে পারে"
                  tone="error"
                />
              </div>

              <div className="mt-5 pt-4 border-t border-line-soft/60">
                <p className="text-[11.5px] font-bold text-ink-muted uppercase tracking-wider mb-3">
                  পেমেন্ট পদ্ধতি
                </p>
                <ul className="space-y-2.5">
                  {fees.byMethod.map((m) => (
                    <li
                      key={m.label}
                      className="flex items-center justify-between gap-3 text-[13px] border-b border-line-soft/40 pb-2 last:border-0 last:pb-0"
                    >
                      <span className="text-ink-body truncate">{m.label}</span>
                      <span className="shrink-0 text-ink-muted font-bangla-number">
                        {toBn(m.value)} টি
                        <span className="ml-2.5 font-bold text-ink-strong">
                          ৳ {toBnAmount(m.amount)}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-5 pt-4 border-t border-line-soft/60">
                <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
                  <p className="text-[11.5px] font-bold text-ink-muted uppercase tracking-wider">
                    কার কাছে জমা আছে
                  </p>
                  {fees.missingCollector > 0 && (
                    <p className="text-[11.5px] font-semibold text-secondary">
                      {toBn(fees.missingCollector)} টি নগদ জমায় নাম লেখা নেই
                    </p>
                  )}
                </div>

                {fees.byCollector.length > 0 ? (
                  <ul className="space-y-2.5">
                    {fees.byCollector.map((c) => (
                      <li
                        key={c.label}
                        className="flex items-center justify-between gap-3 text-[13px] border-b border-line-soft/40 pb-2 last:border-0 last:pb-0"
                      >
                        <span
                          className={`truncate ${c.isRest ? "text-ink-muted italic" : "text-ink-body"}`}
                        >
                          {c.label}
                        </span>
                        <span className="shrink-0 text-ink-muted font-bangla-number">
                          {toBn(c.value)} টি
                          <span className="ml-2.5 font-bold text-ink-strong">
                            ৳ {toBnAmount(c.amount)}
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[12.5px] text-ink-faint py-2">
                    কোনো আবেদনে “কার কাছে জমা” লেখা হয়নি। অফলাইন এন্ট্রির সময় নামটি লিখলে এখানে
                    ব্যক্তিভিত্তিক হিসাব দেখা যাবে।
                  </p>
                )}
              </div>

              {fees.unreadableAmount > 0 && (
                <p className="text-[11.5px] text-ink-faint mt-3.5">
                  {toBn(fees.unreadableAmount)} টি আবেদনে ফি-এর অঙ্ক পড়া যায়নি, তাই উপরের যোগফলে
                  সেগুলো ধরা হয়নি।
                </p>
              )}
            </Panel>
          )}

          {quality && (
            <Panel>
              <SectionTitle
                icon={HiShieldExclamation}
                title="ডেটা যাচাই"
                hint="পরীক্ষার দিনে ধরা পড়লে আর ঠিক করার সুযোগ থাকে না"
              />

              <div className="space-y-2.5">
                <IssueRow
                  tone="error"
                  label="একই রোল একাধিক শিক্ষার্থীর নামে"
                  count={dupRolls.length}
                  detail={
                    dupRolls.length
                      ? dupRolls
                          .slice(0, 3)
                          .map((d) => `রোল ${toBn(d.key)} → ${toBn(d.count)} জন`)
                          .join(" • ")
                      : "প্রতিটি বরাদ্দকৃত রোল আলাদা"
                  }
                  onClick={() => goToTab("registrations")}
                />
                <IssueRow
                  tone="error"
                  label="একই ট্রানজেকশন আইডি একাধিক আবেদনে"
                  count={dupTrx.length}
                  detail={
                    dupTrx.length
                      ? dupTrx
                          .slice(0, 2)
                          .map((d) => `${d.key} → ${toBn(d.count)} বার`)
                          .join(" • ")
                      : "প্রতিটি পেমেন্ট আলাদা"
                  }
                  onClick={() => goToTab("registrations")}
                />
                <IssueRow
                  label="একই মোবাইল নম্বরে একাধিক আবেদন"
                  count={quality.duplicateMobiles.length}
                  detail={
                    quality.duplicateMobiles.length
                      ? "ভাইবোন হতে পারে, আবার ভুল করে দুইবার জমাও হতে পারে"
                      : "প্রতিটি আবেদনে আলাদা নম্বর"
                  }
                  onClick={() => goToTab("registrations")}
                />
                <IssueRow
                  label="ছবি ছাড়া আবেদন"
                  count={quality.missingPhoto}
                  detail={
                    quality.missingPhoto
                      ? "প্রবেশপত্রে ছবির জায়গা ফাঁকা ছাপবে"
                      : "সবার ছবি আপলোড করা আছে"
                  }
                  onClick={() => goToTab("registrations")}
                />
                <IssueRow
                  label="মোবাইল নম্বর নেই"
                  count={quality.missingMobile}
                  detail={
                    quality.missingMobile
                      ? "হোয়াটসঅ্যাপ ব্রডকাস্টে এদের কাছে খবর পৌঁছাবে না"
                      : "সবার সাথে যোগাযোগের নম্বর আছে"
                  }
                  onClick={() => goToTab("broadcaster")}
                />
              </div>
            </Panel>
          )}
        </div>
      )}

      {/* ============ 5c. ADMIT CARD READINESS + CENTRES ============ */}
      {readiness && readiness.eligible > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Panel>
            <SectionTitle
              icon={HiTicket}
              title="প্রবেশপত্রের মান"
              hint={`${toBn(readiness.eligible)} জন এখন প্রবেশপত্র তুলতে পারবে`}
              aside={
                readiness.clean === readiness.eligible ? (
                  <Chip tone="primary" icon={HiCheckCircle}>
                    সব তথ্য পূর্ণ
                  </Chip>
                ) : (
                  <Chip tone="secondary">
                    {toBn(readiness.eligible - readiness.clean)} টিতে ঘাটতি
                  </Chip>
                )
              }
            />

            <StackedBar
              total={readiness.eligible}
              segments={[
                { label: "সম্পূর্ণ তথ্যসহ", value: readiness.clean, tone: "primary" },
                {
                  label: "কিছু তথ্য অনুপস্থিত",
                  value: readiness.eligible - readiness.clean,
                  tone: "secondary",
                },
              ]}
            />

            <div className="mt-5">
              <MetricRow
                label="রোল ছাড়া (ট্র্যাকিং আইডি ছাপবে)"
                value={toBn(readiness.noRoll)}
                tone={readiness.noRoll > 0 ? "secondary" : "primary"}
              />
              <MetricRow
                label="ছবি ছাড়া (ফাঁকা ঘর ছাপবে)"
                value={toBn(readiness.noPhoto)}
                tone={readiness.noPhoto > 0 ? "secondary" : "primary"}
              />
              <MetricRow
                label="কেন্দ্র বরাদ্দ হয়নি"
                value={toBn(readiness.defaultCenter)}
                tone={readiness.defaultCenter > 0 ? "secondary" : "primary"}
                hint="সাইট সেটিংসের ডিফল্ট কেন্দ্র ছাপবে"
              />
              <MetricRow
                label="রুম নম্বর দেওয়া হয়নি"
                value={toBn(readiness.noRoom)}
                hint="রুম নম্বর প্রবেশপত্রে ছাপে না, শুধু হলের বিন্যাসে কাজে লাগে"
              />
            </div>
          </Panel>

          <Panel>
            <SectionTitle
              icon={HiMapPin}
              title="কেন্দ্রভিত্তিক আসন"
              hint="প্রবেশপত্রে বরাদ্দকৃত কেন্দ্র অনুযায়ী"
            />
            <BarList items={readiness.byCenter} total={readiness.eligible} tone="tertiary" />
          </Panel>
        </div>
      )}

      {/* ============ 6. WHERE THE APPLICATIONS COME FROM ============ */}
      {regs && regs.total > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Panel>
            <SectionTitle
              icon={HiMapPin}
              title="থানা/উপজেলাভিত্তিক আবেদন"
              hint="কেন্দ্র ও আসন পরিকল্পনার জন্য"
            />
            <BarList items={regs.byUpazila} total={regs.total} tone="tertiary" />
          </Panel>

          <Panel>
            <SectionTitle icon={HiUserGroup} title="শ্রেণিভিত্তিক আবেদন" hint="প্রশ্নপত্রের সংখ্যা নির্ধারণে সহায়ক" />
            <BarList items={regs.byClass} total={regs.total} tone="primary" />
          </Panel>
        </div>
      )}

      {/* ============ 7. RECENT ACTIVITY + RESULT ARCHIVE ============ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Panel>
          <SectionTitle
            icon={HiInboxArrowDown}
            title="সাম্প্রতিক কার্যক্রম"
            hint="নতুন আবেদন ও বার্তা, সময় অনুসারে"
          />
          {feed.length > 0 ? (
            <ul className="-mx-2.5 divide-y divide-line-soft/40">
              {feed.map((item) => (
                <FeedItem key={item.id} item={item} onOpen={goToTab} />
              ))}
            </ul>
          ) : (
            <p className="text-[13px] text-ink-faint py-8 text-center">
              এখনো কোনো আবেদন বা বার্তা আসেনি।
            </p>
          )}
        </Panel>

        <Panel>
          <SectionTitle
            icon={HiArchiveBox}
            title="সেশনভিত্তিক ফলাফল সংরক্ষণ"
            hint="কোন বছরে কতজনের ফল আছে"
            aside={
              results ? (
                <Chip tone="neutral">মোট {toBn(results.total)}</Chip>
              ) : null
            }
          />

          {results && results.byYear.length > 0 ? (
            <ul className="space-y-2.5">
              {results.byYear.map((y) => (
                <li key={y.year}>
                  <button
                    type="button"
                    onClick={() => goToTab("results")}
                    className="group w-full flex items-center gap-3 rounded-lg border border-line-soft/70 bg-surface-low/60
                      px-3.5 py-2.5 text-left cursor-pointer hover:border-primary/40 hover:bg-surface-card transition-all"
                  >
                    <span className="text-[13.5px] font-bold text-ink-strong font-bangla-number shrink-0">
                      {toBn(y.year)}
                    </span>
                    {y.isMeritYear && (
                      <span className="shrink-0 rounded-full bg-primary/15 text-primary px-2 py-0.5 text-[10.5px] font-bold">
                        প্রকাশিত
                      </span>
                    )}
                    {y.archived && (
                      <span className="shrink-0 rounded-full bg-surface-overlay text-ink-faint px-2 py-0.5 text-[10.5px] font-bold">
                        আর্কাইভড
                      </span>
                    )}
                    <span className="flex-1 h-1.5 rounded-full bg-surface-overlay/70 overflow-hidden min-w-[40px]">
                      <span
                        className={`block h-full rounded-full ${y.archived ? "bg-ink-muted/40" : "bg-secondary"}`}
                        style={{
                          width: `${Math.max(
                            (y.value / Math.max(...results.byYear.map((r) => r.value), 1)) * 100,
                            4
                          )}%`,
                        }}
                      />
                    </span>
                    <span className="shrink-0 text-[13px] font-bold text-ink-body font-bangla-number tabular-nums">
                      {toBn(y.value)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[13px] text-ink-faint py-8 text-center">
              এখনো কোনো সেশনের ফলাফল আপলোড করা হয়নি।
            </p>
          )}

          {results && results.byCategory.length > 0 && (
            <div className="mt-5 pt-4 border-t border-line-soft/60">
              <p className="text-[11.5px] font-bold text-ink-muted uppercase tracking-wider mb-3">
                ক্যাটাগরিভিত্তিক বণ্টন
              </p>
              <BarList items={results.byCategory} total={results.total} tone="secondary" />
            </div>
          )}
        </Panel>
      </div>

      {/* ============ 8. CONTENT INVENTORY ============ */}
      <Panel>
        <SectionTitle
          icon={HiChatBubbleLeftRight}
          title="ওয়েবসাইট কনটেন্টের হালচাল"
          hint="প্রতিটি সেকশনে বর্তমানে কতটি এন্ট্রি আছে"
          aside={
            emptySections.length > 0 ? (
              <Chip tone="secondary">{toBn(emptySections.length)} টি সেকশন ফাঁকা</Chip>
            ) : (
              <Chip tone="primary" icon={HiCheckCircle}>
                সব সেকশনে কনটেন্ট আছে
              </Chip>
            )
          }
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {inventory.map((item) => {
            const empty = item.value === 0;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => goToTab(item.id)}
                className={`rounded-xl border px-3.5 py-3 text-left cursor-pointer transition-all
                  hover:-translate-y-0.5 hover:shadow-md
                  ${
                    empty
                      ? "border-secondary/40 bg-secondary/[0.07] hover:border-secondary/60"
                      : "border-line-soft/70 bg-surface-low/60 hover:border-primary/40 hover:bg-surface-card"
                  }`}
              >
                <p
                  className={`text-2xl font-bold font-bangla-number tabular-nums leading-none ${
                    empty ? "text-secondary" : "text-ink-strong"
                  }`}
                >
                  {toBn(item.value)}
                </p>
                <p className="text-[12px] text-ink-muted mt-1.5 truncate">{item.label}</p>
                {empty && <p className="text-[11px] text-secondary font-semibold mt-0.5">ফাঁকা</p>}
              </button>
            );
          })}
        </div>
      </Panel>

      {/* ============ 9. MODULE GRID ============ */}
      <Panel>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
          <h2 className="text-base sm:text-lg font-bold text-ink-strong tracking-tight">
            সকল কন্ট্রোল মডিউল
          </h2>
          <p className="text-[12px] text-ink-muted">
            কমান্ড প্যালেট:{" "}
            <kbd className="rounded border border-line-soft bg-surface px-1.5 py-0.5 text-[11px] font-mono text-ink-strong">
              Ctrl + K
            </kbd>
          </p>
        </div>
        <p className="text-[13px] text-ink-muted mb-6">
          ওয়েবসাইটের প্রতিটি বিভাগ পরিচালনার জন্য নির্দিষ্ট মডিউলে প্রবেশ করুন।
        </p>

        <div className="space-y-6">
          {NAV_GROUPS.filter((g) => g.items.some((i) => i.id !== "overview")).map(
            ({ group, items }) => (
              <div key={group}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/70" />
                  <p className="text-[12px] font-bold text-ink-muted uppercase tracking-wider">
                    {group}
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                  {items
                    .filter((i) => i.id !== "overview")
                    .map((item) => {
                      const Icon = item.icon;
                      const badge = badgeFor(item.id);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => goToTab(item.id)}
                          className="group flex items-center gap-3 rounded-xl border border-line-soft/80 bg-surface-low/70
                            min-h-[56px] px-3.5 py-3 text-left cursor-pointer select-none
                            hover:border-primary/50 hover:bg-surface-card hover:-translate-y-0.5 hover:shadow-md transition-all"
                        >
                          <span className="w-9 h-9 rounded-lg shrink-0 bg-surface-overlay/80 text-ink-muted group-hover:text-primary group-hover:bg-primary/15 border border-line-soft/50 group-hover:border-primary/30 flex items-center justify-center text-lg transition-all">
                            <Icon />
                          </span>
                          <div className="flex-1 min-w-0">
                            <span className="block text-[13px] font-bold text-ink-strong leading-snug group-hover:text-primary transition-colors truncate">
                              {item.label}
                            </span>
                          </div>
                          {badge && (
                            <span
                              className={`rounded-full px-2 py-0.5 text-[11px] font-bold leading-none font-bangla-number ${
                                badge.tone === "error"
                                  ? "bg-error/20 text-error"
                                  : badge.tone === "primary"
                                  ? "bg-primary/20 text-primary"
                                  : "bg-surface-overlay text-ink-muted"
                              }`}
                            >
                              {badge.text}
                            </span>
                          )}
                        </button>
                      );
                    })}
                </div>
              </div>
            )
          )}
        </div>
      </Panel>

      {/* Nudge for the one thing the inventory can only hint at */}
      {emptySections.length > 0 && (
        <p className="flex items-center gap-2 text-[12.5px] text-ink-faint px-1">
          <HiBell className="text-base shrink-0 text-secondary" />
          ফাঁকা সেকশনগুলো সাইটে খালি জায়গা হিসেবে দেখা যেতে পারে —{" "}
          {emptySections.map((s) => s.label).join(", ")} এখনো যোগ করা হয়নি।
        </p>
      )}
    </div>
  );
};

export default Overview;
