import React from "react";
import {
  Skeleton,
  SkeletonCircle,
  SkeletonRegion,
  SkeletonText,
  SkeletonGrid,
  SkeletonStats,
  SkeletonTable,
  SkeletonPodium,
  SkeletonFilterBar,
  SkeletonResultCard,
} from "./Skeleton";

/* ============================================================
   ROUTE SKELETONS

   One placeholder per page, each built from the same bands the
   real page uses — same background tone, same vertical rhythm,
   same card grid. A route chunk landing then swaps content into
   a box that is already the right shape, instead of replacing a
   generic hero-stats-grid slab that belonged to no page at all.

   Every shape here is traced from its page:
     /about   -> AboutHero + HistoryTimeline + MissionVision + ...
     /contact -> hero, the -mt-8 card dock, 7/5 form split, map
     /gallery -> hero collage, tab row, masonry grid
     ... and so on.
   ============================================================ */

const cx = (...parts) => parts.filter(Boolean).join(" ");

/* ---------- Band chrome: the full-bleed section wrapper ---------- */

const Band = ({
  tone = "#0f1124",
  bordered = true,
  className = "",
  inner = "",
  children,
}) => (
  <section
    className={cx(
      "w-full px-3 sm:px-6",
      bordered && "border-b border-white/[0.08]",
      className
    )}
    style={{ backgroundColor: tone }}
  >
    <div className={cx("max-w-7xl mx-auto", inner)}>{children}</div>
  </section>
);

/** Eyebrow chip + two headline lines + a sub-line: every hero on the site. */
const HeroCopy = ({ chip = "w-64", wide = false }) => (
  <div className="max-w-3xl mx-auto space-y-3 text-center sm:space-y-4">
    <Skeleton className={cx("h-7 sm:h-8 mx-auto rounded-full max-w-full", chip)} />
    <div className="space-y-2">
      <Skeleton
        className={cx(
          "h-9 sm:h-14 mx-auto rounded-xl max-w-full",
          wide ? "w-[30rem]" : "w-80"
        )}
      />
      <Skeleton className="h-9 sm:h-14 w-64 sm:w-96 max-w-full mx-auto rounded-xl" />
    </div>
    <Skeleton className="w-full h-4 max-w-xl mx-auto rounded-full" />
    <Skeleton className="w-2/3 h-4 max-w-md mx-auto rounded-full" />
  </div>
);

/** Section heading used above every content band below a hero. */
const BandHeading = ({ centered = true }) => (
  <div className={cx("space-y-3", centered && "text-center max-w-2xl mx-auto")}>
    <Skeleton className={cx("h-6 w-40 rounded-full", centered && "mx-auto")} />
    <Skeleton className={cx("h-7 sm:h-9 w-72 max-w-full rounded-lg", centered && "mx-auto")} />
    <Skeleton className={cx("h-3.5 w-full max-w-lg rounded-full", centered && "mx-auto")} />
  </div>
);

/** Icon tile + title + a stack of label/value rows — the site's info card. */
const InfoCard = ({ rows = 4, className = "" }) => (
  <div
    className={cx(
      "p-5 sm:p-7 rounded-3xl bg-[#14162b] border border-white/10 space-y-4",
      className
    )}
  >
    <div className="flex items-center gap-3">
      <Skeleton className="w-12 h-12 rounded-2xl shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="w-2/3 h-4 rounded-md" />
        <Skeleton className="w-1/3 h-3 rounded-full" />
      </div>
    </div>
    <div className="pt-3 space-y-3 border-t border-white/[0.08]">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-start gap-2.5">
          <Skeleton className="w-4 h-4 rounded shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="w-24 h-3 rounded-full" />
            <Skeleton className="h-3.5 rounded-full" style={{ width: `${88 - i * 9}%` }} />
          </div>
        </div>
      ))}
    </div>
  </div>
);

/** Label + input pair, for the form-driven pages. */
const Field = ({ tall = false }) => (
  <div className="space-y-1.5">
    <Skeleton className="w-28 h-3 rounded-full" />
    <Skeleton className={cx("w-full rounded-xl", tall ? "h-28" : "h-11")} />
  </div>
);

/** Horizontal pill row (tabs / category chips). */
const PillRow = ({ count = 5, className = "" }) => (
  <div className={cx("flex items-center gap-2 overflow-hidden", className)}>
    {Array.from({ length: count }).map((_, i) => (
      <Skeleton key={i} className="h-9 w-24 shrink-0 rounded-xl" />
    ))}
  </div>
);

/* ============================================================
   SECTION SKELETON
   For bands that are deferred rather than routed — the home page's
   below-the-fold sections. `minHeight` reserves the band's real
   height so mounting it never shifts what is under the reader's
   thumb.
   ============================================================ */

export const SectionSkeleton = ({
  tone = "#0b1326",
  cards = 3,
  columns = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  minHeight = 420,
  media = true,
  bordered = false,
  className = "",
}) => (
  <Band
    tone={tone}
    bordered={bordered}
    className={cx("py-12 sm:py-16", className)}
  >
    <div className="space-y-8" style={{ minHeight }} aria-hidden="true">
      <BandHeading />
      <SkeletonGrid count={cards} columns={columns} media={media} />
    </div>
  </Band>
);

/* ============================================================
   PAGE SKELETONS
   ============================================================ */

/** /about — hero + impact stats, timeline, mission/vision, values, team. */
export const AboutSkeleton = () => (
  <SkeletonRegion label="পরিচিতি পৃষ্ঠা লোড হচ্ছে" className="min-h-screen">
    <Band tone="#0b1326" className="pt-16 sm:pt-24 pb-12 sm:pb-16">
      <div className="space-y-8 sm:space-y-12">
        <HeroCopy chip="w-72" wide />
        <SkeletonStats count={4} />
      </div>
    </Band>

    {/* History timeline: alternating entries down a centre rail */}
    <Band tone="#0c0e1e" className="py-14 sm:py-20">
      <div className="space-y-10">
        <BandHeading />
        <div className="space-y-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className={cx(
                "flex items-start gap-4 sm:gap-6",
                i % 2 === 1 && "sm:flex-row-reverse sm:text-right"
              )}
            >
              <SkeletonCircle size={44} className="shrink-0" />
              <div className="flex-1 p-4 sm:p-6 rounded-2xl bg-[#14162b] border border-white/10 space-y-2.5">
                <Skeleton className="w-20 h-5 rounded-full" />
                <Skeleton className="w-1/2 h-4 rounded-md" />
                <SkeletonText lines={2} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Band>

    {/* Mission / Vision: two equal columns */}
    <Band tone="#0b1326" className="py-12 sm:py-16">
      <div className="space-y-8">
        <BandHeading />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
          <InfoCard rows={3} />
          <InfoCard rows={3} />
        </div>
      </div>
    </Band>

    {/* Core values: five compact tiles */}
    <Band tone="#0f1124" className="py-12 sm:py-16">
      <div className="space-y-8">
        <BandHeading />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-[#14162b] border border-white/10 space-y-3 text-center"
            >
              <Skeleton className="w-12 h-12 mx-auto rounded-2xl" />
              <Skeleton className="w-2/3 h-4 mx-auto rounded-md" />
              <SkeletonText lines={2} />
            </div>
          ))}
        </div>
      </div>
    </Band>

    {/* Team structure: two columns of member cards */}
    <Band tone="#0b1326" bordered={false} className="py-12 sm:py-16">
      <div className="space-y-8">
        <BandHeading />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
          <InfoCard rows={4} />
          <InfoCard rows={4} />
        </div>
      </div>
    </Band>
  </SkeletonRegion>
);

/** /contact — hero, the three-card dock that overlaps it, form + sidebar, map. */
export const ContactSkeleton = () => (
  <SkeletonRegion label="যোগাযোগ পৃষ্ঠা লোড হচ্ছে" className="min-h-screen bg-[#0b1326]">
    <Band tone="#0f1124" className="pt-14 sm:pt-20 pb-12 sm:pb-16">
      <HeroCopy chip="w-80" wide />
    </Band>

    {/* Quick-contact dock, pulled up over the hero edge */}
    <div className="relative z-20 w-full px-3 -mt-8 sm:px-6">
      <div className="grid max-w-7xl grid-cols-1 gap-5 mx-auto md:grid-cols-3 sm:gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="p-6 sm:p-8 rounded-3xl bg-[#14162b] border border-white/10 text-center space-y-4"
          >
            <Skeleton className="mx-auto w-14 h-14 rounded-2xl" />
            <div className="space-y-2">
              <Skeleton className="w-2/3 h-4 mx-auto rounded-md" />
              <Skeleton className="w-3/4 h-5 mx-auto rounded-md" />
              <Skeleton className="w-1/2 h-3 mx-auto rounded-full" />
            </div>
            <Skeleton className="w-40 h-10 mx-auto rounded-full" />
          </div>
        ))}
      </div>
    </div>

    {/* Form (7 cols) + info sidebar (5 cols) */}
    <Band tone="#0b1326" className="py-14 sm:py-20">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-7">
          <div className="p-6 sm:p-10 rounded-3xl bg-[#14162b] border border-white/10 space-y-6">
            <div className="pb-4 space-y-2 border-b border-white/[0.08]">
              <Skeleton className="w-44 h-6 rounded-full" />
              <Skeleton className="w-2/3 h-8 rounded-lg" />
              <Skeleton className="w-1/2 h-3 rounded-full" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field />
              <Field />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field />
              <Field />
            </div>
            <Field tall />
            <Skeleton className="w-full h-12 rounded-xl" />
          </div>
        </div>

        <div className="space-y-5 lg:col-span-5 sm:space-y-6">
          <InfoCard rows={1} />
          <InfoCard rows={1} />
          <div className="p-6 rounded-3xl bg-[#14162b] border border-white/10 space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton className="rounded-xl w-11 h-11 shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="w-2/3 h-4 rounded-md" />
                <Skeleton className="w-1/2 h-3 rounded-full" />
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Skeleton className="flex-1 h-12 rounded-xl" />
              <Skeleton className="flex-1 h-12 rounded-xl" />
              <Skeleton className="flex-1 h-12 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </Band>

    {/* Map band */}
    <Band tone="#0f1124" bordered={false} className="py-14 sm:py-20">
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="space-y-2">
            <Skeleton className="w-64 h-6 rounded-lg" />
            <Skeleton className="w-48 h-3 rounded-full" />
          </div>
          <Skeleton className="w-48 h-10 rounded-xl" />
        </div>
        <Skeleton className="w-full h-[380px] sm:h-[450px] rounded-3xl" />
      </div>
    </Band>
  </SkeletonRegion>
);

/** /notice — hero, toolbar with view toggles and chips, pinned notice, grid. */
export const NoticeSkeleton = () => (
  <SkeletonRegion label="নোটিশ বোর্ড লোড হচ্ছে" className="min-h-screen bg-[#0b1326]">
    <Band tone="#0f1124" className="pt-14 sm:pt-20 pb-12 sm:pb-16">
      <HeroCopy chip="w-64" />
    </Band>

    {/* Sticky-looking control dock */}
    <div className="w-full px-3 mt-6 sm:px-6 sm:mt-8">
      <div className="max-w-7xl mx-auto p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-[#14162b] border border-white/10 space-y-4">
        <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
          <Skeleton className="h-10 w-full sm:w-80 rounded-xl" />
          <div className="flex items-center gap-2">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <Skeleton className="w-10 h-10 rounded-xl" />
          </div>
        </div>
        <div className="pt-3 border-t border-white/[0.08]">
          <PillRow count={5} />
        </div>
      </div>
    </div>

    {/* Pinned spotlight + the notice grid */}
    <div className="w-full px-3 mt-6 sm:px-6 sm:mt-8 pb-14">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        <div className="space-y-3 sm:space-y-4">
          <Skeleton className="w-56 h-5 rounded-full" />
          <div className="p-5 sm:p-7 rounded-2xl sm:rounded-3xl bg-[#14162b] border border-amber-500/20 space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="w-20 h-5 rounded-full" />
              <Skeleton className="w-24 h-5 rounded-full" />
            </div>
            <Skeleton className="w-3/4 h-6 rounded-md" />
            <SkeletonText lines={3} />
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="w-48 h-5 rounded-full" />
          <SkeletonGrid count={6} media={false} />
        </div>
      </div>
    </div>
  </SkeletonRegion>
);

/** /gallery — hero with the image collage, stat row, tab bar, masonry grid. */
export const GallerySkeleton = () => (
  <SkeletonRegion label="গ্যালারি লোড হচ্ছে" className="min-h-screen bg-[#0b1326]">
    <Band tone="#0f1124" className="pt-14 sm:pt-20 pb-12 sm:pb-16">
      <div className="grid items-center grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="space-y-5">
          <Skeleton className="w-48 h-8 rounded-full" />
          <Skeleton className="w-full h-12 rounded-xl sm:h-16" />
          <Skeleton className="w-3/4 h-12 rounded-xl sm:h-16" />
          <SkeletonText lines={2} />
          <div className="flex flex-wrap gap-3 pt-2">
            <Skeleton className="w-40 h-11 rounded-xl" />
            <Skeleton className="w-40 h-11 rounded-xl" />
          </div>
        </div>

        {/* 2x2 photo collage */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <Skeleton className="w-full aspect-[4/5] rounded-2xl" />
          <Skeleton className="w-full aspect-[4/5] rounded-2xl mt-6 sm:mt-10" />
          <Skeleton className="w-full aspect-[4/5] rounded-2xl -mt-6 sm:-mt-10" />
          <Skeleton className="w-full aspect-[4/5] rounded-2xl" />
        </div>
      </div>

      <div className="mt-10">
        <SkeletonStats count={3} className="lg:grid-cols-3" />
      </div>
    </Band>

    <div className="w-full px-3 py-10 sm:px-6 sm:py-14">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col items-stretch justify-between gap-4 sm:flex-row sm:items-center">
          <PillRow count={3} />
          <Skeleton className="h-10 w-full sm:w-64 rounded-xl" />
        </div>
        <SkeletonGrid count={9} columns="grid-cols-2 sm:grid-cols-2 lg:grid-cols-3" />
      </div>
    </div>
  </SkeletonRegion>
);

/** /gallery/:id — a single album: banner, meta strip, photo grid. */
export const GalleryDetailsSkeleton = () => (
  <SkeletonRegion label="অ্যালবাম লোড হচ্ছে" className="min-h-screen bg-[#0b1326]">
    <Band tone="#0f1124" bordered={false} className="pt-8 pb-0 sm:pt-10">
      <Skeleton className="w-32 h-9 rounded-xl" />
    </Band>

    <div className="w-full px-3 pt-6 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <Skeleton className="w-full aspect-[16/9] sm:aspect-[21/9] rounded-3xl" />
        <div className="space-y-3">
          <Skeleton className="w-40 h-6 rounded-full" />
          <Skeleton className="w-2/3 h-8 rounded-lg sm:h-10" />
          <SkeletonText lines={2} />
        </div>
        <div className="flex flex-wrap gap-3">
          <Skeleton className="w-32 h-9 rounded-xl" />
          <Skeleton className="w-32 h-9 rounded-xl" />
          <Skeleton className="w-32 h-9 rounded-xl" />
        </div>
      </div>
    </div>

    <div className="w-full px-3 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto max-w-7xl">
        <SkeletonGrid count={9} columns="grid-cols-2 sm:grid-cols-3 lg:grid-cols-4" />
      </div>
    </div>
  </SkeletonRegion>
);

/** /scholarship — hero + three info cards, the step process, syllabus, help. */
export const ScholarshipSkeleton = () => (
  <SkeletonRegion label="মেধাবৃত্তির তথ্য লোড হচ্ছে" className="min-h-screen bg-[#0b1326]">
    <Band tone="#0f1124" className="pt-14 sm:pt-20 pb-12 sm:pb-16">
      <div className="space-y-10 sm:space-y-12">
        <HeroCopy chip="w-72" wide />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3 sm:gap-6">
          <InfoCard />
          <InfoCard />
          <InfoCard />
        </div>
      </div>
    </Band>

    {/* Step-by-step application process */}
    <Band tone="#0b1326" className="py-12 sm:py-16">
      <div className="space-y-8">
        <BandHeading />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="p-5 sm:p-6 rounded-2xl bg-[#14162b] border border-white/10 space-y-3"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="w-12 h-12 rounded-2xl" />
                <Skeleton className="w-10 h-6 rounded-full" />
              </div>
              <Skeleton className="w-2/3 h-4 rounded-md" />
              <SkeletonText lines={2} />
            </div>
          ))}
        </div>
      </div>
    </Band>

    {/* Syllabus: class selector rail + subject table */}
    <Band tone="#0f1124" className="py-12 sm:py-16">
      <div className="space-y-8">
        <BandHeading />
        <PillRow count={7} className="justify-center" />
        <SkeletonTable rows={5} columns={4} />
      </div>
    </Band>

    {/* Form guidance + helpdesk */}
    <Band tone="#0b1326" bordered={false} className="py-12 sm:py-16">
      <div className="space-y-8">
        <BandHeading />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <InfoCard rows={3} />
          <InfoCard rows={3} />
        </div>
      </div>
    </Band>
  </SkeletonRegion>
);

/** /register — the long multi-step application form. */
export const RegistrationSkeleton = () => (
  <SkeletonRegion label="রেজিস্ট্রেশন ফর্ম লোড হচ্ছে" className="min-h-screen bg-[#0b1326]">
    <Band tone="#0f1124" className="pt-14 sm:pt-20 pb-12 sm:pb-16">
      <HeroCopy chip="w-72" />
    </Band>

    <div className="w-full px-3 py-10 sm:px-6 sm:py-14">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Step rail */}
        <div className="flex items-center justify-between gap-2 p-4 sm:p-5 rounded-2xl bg-[#14162b] border border-white/10">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center flex-1 gap-2 min-w-0">
              <SkeletonCircle size={32} className="shrink-0" />
              <Skeleton className="flex-1 h-3 rounded-full max-w-[90px]" />
            </div>
          ))}
        </div>

        {/* Form card */}
        <div className="p-5 sm:p-8 rounded-3xl bg-[#14162b] border border-white/10 space-y-6">
          <div className="pb-4 space-y-2 border-b border-white/[0.08]">
            <Skeleton className="w-56 h-6 rounded-lg" />
            <Skeleton className="w-2/3 h-3 rounded-full" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <Field key={i} />
            ))}
          </div>
          <Field tall />
          <div className="flex items-center justify-between gap-3 pt-2">
            <Skeleton className="w-32 h-12 rounded-xl" />
            <Skeleton className="w-40 h-12 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  </SkeletonRegion>
);

/** /admit-card — hero, the lookup form, and the card footprint below it. */
export const AdmitCardSkeleton = () => (
  <SkeletonRegion label="প্রবেশপত্র পোর্টাল লোড হচ্ছে" className="min-h-screen bg-[#0b1326]">
    <Band tone="#0f1124" className="pt-14 sm:pt-20 pb-12 sm:pb-16">
      <HeroCopy chip="w-64" />
    </Band>

    <div className="w-full px-3 py-10 sm:px-6 sm:py-12">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Lookup card */}
        <div className="p-5 sm:p-7 rounded-3xl bg-[#14162b] border border-white/10 space-y-4">
          <Skeleton className="w-72 h-4 max-w-full rounded-full" />
          <div className="flex flex-col gap-2.5 sm:flex-row">
            <Skeleton className="flex-1 h-12 rounded-xl" />
            <Skeleton className="h-12 w-full sm:w-44 rounded-xl" />
          </div>
        </div>

        {/* Instruction tiles */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-[#14162b] border border-white/10 space-y-3"
            >
              <Skeleton className="w-11 h-11 rounded-2xl" />
              <Skeleton className="w-2/3 h-4 rounded-md" />
              <SkeletonText lines={2} />
            </div>
          ))}
        </div>
      </div>
    </div>
  </SkeletonRegion>
);

/** /leaderboard — hero, metric row, podium, filters, ranked table. */
export const LeaderboardSkeleton = () => (
  <SkeletonRegion
    label="মেধা তালিকা লোড হচ্ছে"
    className="min-h-screen bg-[#0b1326] px-3 sm:px-6 py-8 sm:py-16"
  >
    <div className="mx-auto space-y-8 max-w-7xl sm:space-y-12">
      <HeroCopy chip="w-72" wide />
      <SkeletonStats className="max-w-4xl mx-auto" />
      <SkeletonPodium />
      <SkeletonFilterBar pills={5} />
      <SkeletonTable rows={8} columns={7} />
    </div>
  </SkeletonRegion>
);

/** /list — archive results: hero band with stats, then filters + table. */
export const ResultListSkeleton = () => (
  <SkeletonRegion label="ফলাফল তালিকা লোড হচ্ছে" className="min-h-screen bg-[#0b1326] pb-20">
    <Band tone="#0f1124" className="pt-14 sm:pt-20 pb-12 sm:pb-16">
      <div className="space-y-8">
        <HeroCopy chip="w-80" wide />
        <SkeletonStats />
      </div>
    </Band>

    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-8 sm:py-10 space-y-6">
      <SkeletonFilterBar pills={6} />
      <SkeletonTable rows={8} columns={6} />
    </div>
  </SkeletonRegion>
);

/** /search — the roll lookup form, centred, with the marksheet footprint. */
export const SearchSkeleton = () => (
  <SkeletonRegion
    label="ফলাফল অনুসন্ধান লোড হচ্ছে"
    className="min-h-[calc(100vh-140px)] bg-[#0b1326] w-full px-3 sm:px-6 lg:px-8 py-10 sm:py-16"
  >
    <div className="flex flex-col items-center w-full max-w-5xl gap-8 mx-auto">
      <div className="w-full max-w-2xl p-6 sm:p-8 rounded-3xl bg-[#14162b] border border-white/10 space-y-5">
        <div className="space-y-3 text-center">
          <Skeleton className="w-16 h-16 mx-auto rounded-2xl" />
          <Skeleton className="w-64 h-7 max-w-full mx-auto rounded-lg" />
          <Skeleton className="w-full h-3.5 max-w-sm mx-auto rounded-full" />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Skeleton className="flex-1 h-12 rounded-xl" />
          <Skeleton className="h-12 w-full sm:w-36 rounded-xl" />
        </div>
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <Skeleton className="w-24 h-6 rounded-full" />
          <Skeleton className="w-20 h-6 rounded-full" />
          <Skeleton className="w-20 h-6 rounded-full" />
        </div>
      </div>
    </div>
  </SkeletonRegion>
);

/** /verify-certificate — lookup strip plus the landscape certificate box. */
export const CertificateSkeleton = () => (
  <SkeletonRegion
    label="সনদ যাচাই পৃষ্ঠা লোড হচ্ছে"
    className="min-h-screen bg-[#0b1326] px-3 sm:px-6 py-10 sm:py-16"
  >
    <div className="max-w-5xl mx-auto space-y-8">
      <HeroCopy chip="w-64" />
      <div className="p-5 sm:p-7 rounded-3xl bg-[#14162b] border border-white/10 space-y-4">
        <Skeleton className="w-64 h-4 max-w-full rounded-full" />
        <div className="flex flex-col gap-3 sm:flex-row">
          <Skeleton className="flex-1 h-12 rounded-xl" />
          <Skeleton className="h-12 w-full sm:w-40 rounded-xl" />
        </div>
      </div>
      <Skeleton className="w-full aspect-[1.414/1] rounded-3xl" />
    </div>
  </SkeletonRegion>
);

/** /admin/login — a single centred credential card. */
export const AdminLoginSkeleton = () => (
  <SkeletonRegion
    label="লগইন পৃষ্ঠা লোড হচ্ছে"
    className="min-h-screen bg-[#0b1326] flex items-center justify-center px-4 py-16"
  >
    <div className="w-full max-w-md p-7 sm:p-9 rounded-3xl bg-[#14162b] border border-white/10 space-y-6">
      <div className="space-y-3 text-center">
        <Skeleton className="w-16 h-16 mx-auto rounded-2xl" />
        <Skeleton className="w-48 h-6 mx-auto rounded-lg" />
        <Skeleton className="w-full h-3 max-w-xs mx-auto rounded-full" />
      </div>
      <Field />
      <Field />
      <Skeleton className="w-full h-12 rounded-xl" />
    </div>
  </SkeletonRegion>
);

/** /admin — sidebar rail + toolbar + data table. */
export const AdminSkeleton = () => (
  <SkeletonRegion label="ড্যাশবোর্ড লোড হচ্ছে" className="min-h-screen bg-[#0b1326]">
    <div className="flex min-h-screen">
      <div className="hidden lg:block w-64 shrink-0 border-r border-white/[0.08] bg-[#0f1124] p-4 space-y-3">
        <Skeleton className="w-full h-12 rounded-2xl" />
        <div className="pt-3 space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="w-full h-10 rounded-xl" style={{ opacity: 1 - i * 0.06 }} />
          ))}
        </div>
      </div>

      <div className="flex-1 min-w-0 p-4 space-y-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-2">
            <Skeleton className="w-48 h-6 rounded-lg" />
            <Skeleton className="w-64 h-3 max-w-full rounded-full" />
          </div>
          <Skeleton className="w-32 h-10 rounded-xl" />
        </div>
        <SkeletonStats />
        <SkeletonFilterBar pills={4} />
        <SkeletonTable rows={9} columns={6} />
      </div>
    </div>
  </SkeletonRegion>
);

/** Fallback for anything not matched below — a neutral hero + grid page. */
export const GenericPageSkeleton = () => (
  <SkeletonRegion label="পৃষ্ঠা লোড হচ্ছে" className="min-h-screen bg-[#0b1326]">
    <Band tone="#0f1124" className="pt-14 sm:pt-20 pb-12 sm:pb-16">
      <HeroCopy />
    </Band>
    <div className="w-full px-3 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto space-y-8 max-w-7xl">
        <SkeletonStats />
        <SkeletonGrid count={6} />
      </div>
    </div>
  </SkeletonRegion>
);

/* ============================================================
   RESOLVER
   ============================================================ */

/* Elements, not component references: each placeholder is stateless and
   identical every time, so building the elements once at module scope keeps
   the lookup a plain table read — no component is ever constructed during a
   render, and the same element object is reused for repeat visits. */
const ROUTE_SKELETONS = [
  ["/about", <AboutSkeleton />],
  ["/contact", <ContactSkeleton />],
  ["/notice", <NoticeSkeleton />],
  ["/gallery/", <GalleryDetailsSkeleton />],
  ["/gallery", <GallerySkeleton />],
  ["/scholarship", <ScholarshipSkeleton />],
  ["/register", <RegistrationSkeleton />],
  ["/admit-card", <AdmitCardSkeleton />],
  ["/admit", <AdmitCardSkeleton />],
  ["/leaderboard", <LeaderboardSkeleton />],
  ["/merit-list", <LeaderboardSkeleton />],
  ["/list", <ResultListSkeleton />],
  ["/search", <SearchSkeleton />],
  ["/verify-certificate", <CertificateSkeleton />],
  ["/certificate", <CertificateSkeleton />],
  ["/admin/login", <AdminLoginSkeleton />],
  ["/admin", <AdminSkeleton />],
];

const FALLBACK_SKELETON = <GenericPageSkeleton />;

/**
 * Renders the placeholder that matches the route being loaded.
 *
 * Longest prefix first, so /gallery/documentary/3 gets the album skeleton
 * rather than the gallery grid.
 */
export const RouteSkeleton = ({ pathname = "/" }) => {
  const path = pathname.toLowerCase();
  const hit = ROUTE_SKELETONS.find(
    ([prefix]) => path === prefix || path.startsWith(prefix)
  );
  return hit ? hit[1] : FALLBACK_SKELETON;
};

export default RouteSkeleton;
