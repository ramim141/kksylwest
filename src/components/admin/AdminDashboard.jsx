import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { isFirebaseConfigured } from "../../firebase/config";
import {
  HiArrowRightOnRectangle,
  HiArrowTopRightOnSquare,
  HiShieldCheck,
  HiBars3,
  HiXMark,
  HiMagnifyingGlass,
  HiChevronDoubleLeft,
  HiArrowPath,
  HiExclamationTriangle,
  HiAcademicCap,
  HiDocumentChartBar,
  HiEnvelope,
  HiBell,
  HiCheckCircle,
  HiArrowSmallRight,
} from "react-icons/hi2";

import { NAV_GROUPS, NAV_INDEX } from "./navConfig";
import CommandPalette from "./CommandPalette";
import { Button, IconButton, Chip, Panel, useConfirm } from "./ui";
import { PageHeader, StatCard } from "./ui/layout";

import ResultManager from "./tabs/ResultManager";
import NoticeManager from "./tabs/NoticeManager";
import GalleryManager from "./tabs/GalleryManager";
import CommitteeManager from "./tabs/CommitteeManager";
import MessageManager from "./tabs/MessageManager";
import HeroManager from "./tabs/HeroManager";
import ActivityManager from "./tabs/ActivityManager";
import FaqManager from "./tabs/FaqManager";
import SiteSettingsManager from "./tabs/SiteSettingsManager";
import TeamStructureManager from "./tabs/TeamStructureManager";
import SyllabusManager from "./tabs/SyllabusManager";
import RegistrationManager from "./tabs/RegistrationManager";
import UpazilaCenterManager from "./tabs/UpazilaCenterManager";
import AnnouncementManager from "./tabs/AnnouncementManager";
import WhatsAppBroadcaster from "./tabs/WhatsAppBroadcaster";

import {
  getAllResults,
  getNotices,
  getGalleryItems,
  getCommitteeMembers,
  getMessages,
  getRegistrations,
} from "../../services/firestore";

const TAB_VIEWS = {
  registrations: RegistrationManager,
  results: ResultManager,
  broadcaster: WhatsAppBroadcaster,
  upazilas: UpazilaCenterManager,
  content: SiteSettingsManager,
  hero: HeroManager,
  activities: ActivityManager,
  teams: TeamStructureManager,
  syllabus: SyllabusManager,
  faqs: FaqManager,
  notices: NoticeManager,
  gallery: GalleryManager,
  committee: CommitteeManager,
  announcements: AnnouncementManager,
  messages: MessageManager,
};

const SIDEBAR_KEY = "kk-admin-sidebar-open";

const EMPTY_STATS = {
  results: null,
  notices: null,
  gallery: null,
  committee: null,
  messages: null,
  unreadMessages: null,
  registrations: null,
  pendingRegistrations: null,
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [confirm, confirmUI] = useConfirm();

  // Remember the admin's chrome preference across sessions.
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.localStorage.getItem(SIDEBAR_KEY) !== "false";
  });

  useEffect(() => {
    window.localStorage.setItem(SIDEBAR_KEY, String(sidebarOpen));
  }, [sidebarOpen]);

  /* ------------------------------------------------ metrics */
  const [stats, setStats] = useState(EMPTY_STATS);
  const [statsState, setStatsState] = useState("loading"); // loading | ready | partial

  const fetchStats = useCallback(async () => {
    setStatsState("loading");
    const [results, notices, gallery, committee, messages, regs] = await Promise.allSettled([
      getAllResults(),
      getNotices(),
      getGalleryItems("all"),
      getCommitteeMembers(),
      getMessages(),
      getRegistrations(),
    ]);

    // A failed fetch stays null and renders as "—". Showing a made-up number
    // here would mean the dashboard quietly lies whenever Firestore is down.
    const len = (r) => (r.status === "fulfilled" && Array.isArray(r.value) ? r.value.length : null);
    const list = (r) => (r.status === "fulfilled" && Array.isArray(r.value) ? r.value : null);

    const msgList = list(messages);
    const regList = list(regs);
    const settled = [results, notices, gallery, committee, messages, regs];

    // A promise can also "succeed" with undefined when a collection is missing.
    // That still leaves a blank number on screen, so it counts as partial too.
    const incomplete = settled.some(
      (r) => r.status === "rejected" || !Array.isArray(r.value)
    );

    setStats({
      results: len(results),
      notices: len(notices),
      gallery: len(gallery),
      committee: len(committee),
      messages: msgList ? msgList.length : null,
      unreadMessages: msgList ? msgList.filter((m) => !m.isRead).length : null,
      registrations: regList ? regList.length : null,
      pendingRegistrations: regList ? regList.filter((r) => r.status === "pending").length : null,
    });
    setStatsState(incomplete ? "partial" : "ready");
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  /* ------------------------------------------------ keyboard */
  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
      if (e.key === "Escape" && mobileMenuOpen) setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileMenuOpen]);

  // Never leave the drawer open with the page scrolling behind it.
  useEffect(() => {
    if (!mobileMenuOpen) return undefined;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [mobileMenuOpen]);

  const handleLogout = async () => {
    const ok = await confirm({
      title: "লগআউট করবেন?",
      body: "অ্যাডমিন প্যানেল থেকে বেরিয়ে গেলে আবার ইমেইল ও পাসওয়ার্ড দিয়ে প্রবেশ করতে হবে।",
      confirmLabel: "লগআউট",
      tone: "danger",
    });
    if (!ok) return;
    await logout();
    navigate("/admin/login", { replace: true });
  };

  const goToTab = (id) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* Badges come from live counts, so the sidebar shows where work is waiting. */
  const badgeFor = (id) => {
    if (id === "registrations" && stats.pendingRegistrations > 0)
      return { text: `${stats.pendingRegistrations} নতুন`, tone: "primary" };
    if (id === "messages" && stats.unreadMessages > 0)
      return { text: `${stats.unreadMessages}`, tone: "error" };
    if (id === "results" && stats.results > 0)
      return { text: `${stats.results}`, tone: "neutral" };
    if (id === "notices" && stats.notices > 0) return { text: `${stats.notices}`, tone: "neutral" };
    return null;
  };

  const current = NAV_INDEX[activeTab] || NAV_INDEX.overview;
  const ActiveView = TAB_VIEWS[activeTab];
  const num = (v) => (v == null ? "—" : v);

  return (
    <div className="min-h-screen bg-surface text-ink-body font-sans antialiased">
      <a
        href="#admin-content"
        className="sr-only focus:not-sr-only focus:fixed focus:z-[100] focus:top-4 focus:left-4
          focus:rounded focus:bg-primary-container focus:px-4 focus:py-2.5 focus:text-primary-on focus:font-semibold"
      >
        সরাসরি মূল কনটেন্টে যান
      </a>

      {/* Drawer scrim — mobile only */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden animate-fadeIn"
        />
      )}

      {/* ==================== SIDEBAR ==================== */}
      <aside
        aria-label="অ্যাডমিন নেভিগেশন"
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-surface-low border-r border-line-soft
          transition-[width,transform] duration-200 ease-out
          ${sidebarOpen ? "w-[264px]" : "w-[76px]"}
          ${mobileMenuOpen ? "translate-x-0 w-[264px]" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Brand */}
        <div className="h-16 flex items-center gap-2 px-4 border-b border-line-soft shrink-0">
          <span className="w-9 h-9 rounded shrink-0 bg-primary-container text-primary-on flex items-center justify-center text-lg">
            <HiShieldCheck />
          </span>
          {(sidebarOpen || mobileMenuOpen) && (
            <div className="flex-1 min-w-0 leading-tight">
              <span className="block text-sm font-semibold text-ink-strong truncate">কিশোরকণ্ঠ</span>
              <span className="block text-[12px] text-ink-muted truncate">অ্যাডমিন প্যানেল</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label={sidebarOpen ? "সাইডবার ছোট করুন" : "সাইডবার বড় করুন"}
            title={sidebarOpen ? "সাইডবার ছোট করুন" : "সাইডবার বড় করুন"}
            className={`hidden lg:flex w-9 h-9 rounded items-center justify-center shrink-0
              text-ink-muted hover:text-ink-strong hover:bg-surface-overlay transition-colors cursor-pointer
              ${sidebarOpen ? "" : "mx-auto"}`}
          >
            <HiChevronDoubleLeft
              className={`text-lg transition-transform duration-200 ${sidebarOpen ? "" : "rotate-180"}`}
            />
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="মেনু বন্ধ করুন"
            className="lg:hidden w-9 h-9 rounded flex items-center justify-center shrink-0 text-ink-muted hover:text-ink-strong cursor-pointer"
          >
            <HiXMark className="text-xl" />
          </button>
        </div>

        {/* Sections */}
        <nav className="flex-1 px-3 py-4 space-y-5 overflow-x-hidden overflow-y-auto scrollbar-slim">
          {NAV_GROUPS.map(({ group, items }) => (
            <div key={group} className="space-y-1">
              {sidebarOpen || mobileMenuOpen ? (
                <p className="px-3 pb-1 text-[12px] font-semibold text-ink-muted/80 tracking-wide">
                  {group}
                </p>
              ) : (
                <div className="mx-3 my-2 h-px bg-line-soft" aria-hidden="true" />
              )}

              {items.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                const badge = badgeFor(tab.id);
                const expanded = sidebarOpen || mobileMenuOpen;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => goToTab(tab.id)}
                    aria-current={isActive ? "page" : undefined}
                    title={!expanded ? tab.label : undefined}
                    className={`relative w-full flex items-center gap-3 rounded min-h-[44px] px-3
                      text-sm font-medium text-left transition-colors duration-150 cursor-pointer
                      ${expanded ? "" : "justify-center"}
                      ${
                        isActive
                          ? "bg-primary/12 text-primary font-semibold"
                          : "text-ink-muted hover:text-ink-strong hover:bg-surface-overlay/60"
                      }`}
                  >
                    {/* Active rail — reads at a glance even when collapsed */}
                    {isActive && (
                      <span
                        aria-hidden="true"
                        className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-0.5 rounded-r-full bg-primary"
                      />
                    )}
                    <Icon className="text-lg shrink-0" />
                    {expanded && <span className="flex-1 min-w-0 truncate">{tab.label}</span>}
                    {expanded && badge && (
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[12px] font-semibold leading-none ${
                          badge.tone === "error"
                            ? "bg-error/15 text-error"
                            : badge.tone === "primary"
                            ? "bg-primary/15 text-primary"
                            : "bg-surface-overlay/70 text-ink-muted"
                        }`}
                      >
                        {badge.text}
                      </span>
                    )}
                    {/* Collapsed: a dot is enough to say "something is waiting" */}
                    {!expanded && badge && (
                      <span
                        aria-hidden="true"
                        className={`absolute top-2 right-2 w-2 h-2 rounded-full ${
                          badge.tone === "error" ? "bg-error" : "bg-primary"
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Signed-in admin */}
        <div className="p-3 border-t border-line-soft shrink-0">
          <div
            className={`flex items-center gap-2.5 rounded bg-surface-card border border-line-soft p-2.5 ${
              sidebarOpen || mobileMenuOpen ? "" : "justify-center"
            }`}
          >
            <span className="w-8 h-8 rounded shrink-0 bg-primary-container text-primary-on flex items-center justify-center text-sm font-semibold">
              {currentUser?.email ? currentUser.email.charAt(0).toUpperCase() : "A"}
            </span>
            {(sidebarOpen || mobileMenuOpen) && (
              <div className="flex-1 min-w-0 leading-tight">
                <p className="text-[13px] font-semibold text-ink-strong truncate">
                  {currentUser?.email ? currentUser.email.split("@")[0] : "Admin"}
                </p>
                <p className="text-[12px] text-primary flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" aria-hidden="true" />
                  অনলাইন
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ==================== WORKSPACE ==================== */}
      <div
        className={`flex flex-col min-h-screen transition-[padding] duration-200 ${
          sidebarOpen ? "lg:pl-[264px]" : "lg:pl-[76px]"
        }`}
      >
        <header className="sticky top-0 z-30 h-16 shrink-0 bg-surface/90 backdrop-blur-xl border-b border-line-soft px-4 sm:px-6 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="মেনু খুলুন"
            className="lg:hidden w-11 h-11 -ml-2 rounded flex items-center justify-center shrink-0 text-ink-muted hover:text-ink-strong hover:bg-surface-overlay transition-colors cursor-pointer"
          >
            <HiBars3 className="text-xl" />
          </button>

          {/* Breadcrumb — driven by the registry, never hand-maintained */}
          <nav aria-label="ব্রেডক্রাম্ব" className="min-w-0 flex items-center gap-2 text-[13px]">
            <button
              type="button"
              onClick={() => goToTab("overview")}
              className="text-ink-muted hover:text-ink-body transition-colors cursor-pointer shrink-0"
            >
              ড্যাশবোর্ড
            </button>
            {activeTab !== "overview" && (
              <>
                <span className="text-ink-muted/50 shrink-0" aria-hidden="true">
                  /
                </span>
                <span className="hidden sm:inline text-ink-muted shrink-0">{current.group}</span>
                <span className="hidden sm:inline text-ink-muted/50 shrink-0" aria-hidden="true">
                  /
                </span>
                <span className="font-semibold text-ink-strong truncate">{current.label}</span>
              </>
            )}
          </nav>

          <div className="flex-1" />

          {/* Jump-to */}
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="hidden md:flex items-center gap-2 min-h-[38px] px-3 rounded border border-line-soft
              bg-surface-card text-ink-muted hover:text-ink-body hover:border-line-strong/50 transition-colors cursor-pointer"
          >
            <HiMagnifyingGlass className="text-base" />
            <span className="text-[13px]">সেকশন খুঁজুন</span>
            <kbd className="rounded border border-line-soft bg-surface px-1.5 py-0.5 text-[12px] font-medium">
              Ctrl K
            </kbd>
          </button>
          <IconButton
            icon={HiMagnifyingGlass}
            label="সেকশন খুঁজুন"
            onClick={() => setPaletteOpen(true)}
            className="md:hidden"
          />

          {/* Connection state */}
          <span
            className="hidden xl:inline-flex items-center gap-2 rounded-full border border-line-soft bg-surface-card px-3 py-1.5 text-[12px] text-ink-muted"
            title={
              isFirebaseConfigured()
                ? "Firestore ডেটাবেজের সাথে সরাসরি সংযুক্ত"
                : "Firebase কনফিগার করা নেই — পরিবর্তন সংরক্ষণ হবে না"
            }
          >
            <span
              aria-hidden="true"
              className={`w-2 h-2 rounded-full ${isFirebaseConfigured() ? "bg-primary" : "bg-secondary"}`}
            />
            {isFirebaseConfigured() ? "ডেটাবেজ সংযুক্ত" : "লোকাল মোড"}
          </span>

          <Button
            as={Link}
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            size="sm"
            tone="neutral"
            iconRight={HiArrowTopRightOnSquare}
            className="hidden sm:inline-flex"
          >
            ওয়েবসাইট
          </Button>

          <Button size="sm" tone="danger" icon={HiArrowRightOnRectangle} onClick={handleLogout}>
            <span className="hidden sm:inline">লগআউট</span>
          </Button>
        </header>

        <main
          id="admin-content"
          className="flex-1 w-full max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6"
        >
          <PageHeader
            icon={current.icon}
            title={current.title}
            description={current.description}
            meta={
              activeTab === "overview" ? (
                <Button
                  size="sm"
                  tone="neutral"
                  icon={HiArrowPath}
                  onClick={fetchStats}
                  loading={statsState === "loading"}
                >
                  হালনাগাদ করুন
                </Button>
              ) : null
            }
          />

          {activeTab === "overview" ? (
            <div className="space-y-6 animate-fadeIn">
              {statsState === "partial" && (
                <div className="flex items-start gap-3 rounded-lg border border-secondary/35 bg-secondary/10 px-4 py-3.5">
                  <HiExclamationTriangle className="text-xl text-secondary shrink-0 mt-px" />
                  <p className="text-sm text-ink-body leading-relaxed">
                    কিছু তথ্য ডেটাবেজ থেকে আনা যায়নি — নিচে “—” চিহ্নিত সংখ্যাগুলো অসম্পূর্ণ।
                    ইন্টারনেট সংযোগ যাচাই করে আবার হালনাগাদ করুন।
                  </p>
                </div>
              )}

              {/* Counts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard
                  icon={HiAcademicCap}
                  tone="primary"
                  value={num(stats.registrations)}
                  label="মোট অনলাইন আবেদন"
                  loading={statsState === "loading"}
                  onClick={() => goToTab("registrations")}
                  badge={
                    stats.pendingRegistrations > 0 ? (
                      <Chip tone="secondary">{stats.pendingRegistrations} পেন্ডিং</Chip>
                    ) : stats.pendingRegistrations === 0 ? (
                      <Chip tone="primary" icon={HiCheckCircle}>
                        সব যাচাই হয়েছে
                      </Chip>
                    ) : null
                  }
                />
                <StatCard
                  icon={HiDocumentChartBar}
                  tone="secondary"
                  value={num(stats.results)}
                  label="প্রকাশিত ফলাফল"
                  loading={statsState === "loading"}
                  onClick={() => goToTab("results")}
                />
                <StatCard
                  icon={HiEnvelope}
                  tone="tertiary"
                  value={num(stats.messages)}
                  label="ইনবক্সে মোট মেসেজ"
                  loading={statsState === "loading"}
                  onClick={() => goToTab("messages")}
                  badge={
                    stats.unreadMessages > 0 ? (
                      <Chip tone="error">{stats.unreadMessages} অপঠিত</Chip>
                    ) : null
                  }
                />
                <StatCard
                  icon={HiBell}
                  tone="primary"
                  value={num(stats.notices)}
                  label="প্রকাশিত নোটিশ"
                  loading={statsState === "loading"}
                  onClick={() => goToTab("notices")}
                />
              </div>

              {/* What needs a decision today */}
              {(stats.pendingRegistrations > 0 || stats.unreadMessages > 0) && (
                <Panel>
                  <h2 className="text-base font-semibold text-ink-strong mb-4">আপনার অপেক্ষায়</h2>
                  <div className="space-y-2.5">
                    {stats.pendingRegistrations > 0 && (
                      <button
                        type="button"
                        onClick={() => goToTab("registrations")}
                        className="w-full flex items-center gap-3.5 rounded border border-line-soft bg-surface p-4 text-left hover:border-primary/40 hover:bg-surface-overlay/40 transition-colors cursor-pointer"
                      >
                        <span className="w-10 h-10 rounded shrink-0 bg-primary/12 text-primary flex items-center justify-center text-xl">
                          <HiAcademicCap />
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className="block text-sm font-semibold text-ink-strong">
                            {stats.pendingRegistrations} টি আবেদন যাচাইয়ের অপেক্ষায়
                          </span>
                          <span className="block text-[13px] text-ink-muted mt-0.5">
                            অনুমোদন দিলে শিক্ষার্থীরা রোল ও প্রবেশপত্র পাবে
                          </span>
                        </span>
                        <HiArrowSmallRight className="text-xl text-ink-muted shrink-0" />
                      </button>
                    )}
                    {stats.unreadMessages > 0 && (
                      <button
                        type="button"
                        onClick={() => goToTab("messages")}
                        className="w-full flex items-center gap-3.5 rounded border border-line-soft bg-surface p-4 text-left hover:border-primary/40 hover:bg-surface-overlay/40 transition-colors cursor-pointer"
                      >
                        <span className="w-10 h-10 rounded shrink-0 bg-error/12 text-error flex items-center justify-center text-xl">
                          <HiEnvelope />
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className="block text-sm font-semibold text-ink-strong">
                            {stats.unreadMessages} টি অপঠিত মেসেজ
                          </span>
                          <span className="block text-[13px] text-ink-muted mt-0.5">
                            কন্টাক্ট ফর্ম ও চ্যাটবট থেকে আসা প্রশ্ন
                          </span>
                        </span>
                        <HiArrowSmallRight className="text-xl text-ink-muted shrink-0" />
                      </button>
                    )}
                  </div>
                </Panel>
              )}

              {/* Everything else, one hop away */}
              <Panel>
                <h2 className="text-base font-semibold text-ink-strong mb-1">সব সেকশন</h2>
                <p className="text-[13px] text-ink-muted mb-5">
                  যেকোনো সময়{" "}
                  <kbd className="rounded border border-line-soft bg-surface px-1.5 py-0.5 text-[12px]">
                    Ctrl
                  </kbd>{" "}
                  +{" "}
                  <kbd className="rounded border border-line-soft bg-surface px-1.5 py-0.5 text-[12px]">
                    K
                  </kbd>{" "}
                  চেপে সরাসরি যেকোনো সেকশনে যেতে পারবেন।
                </p>

                <div className="space-y-5">
                  {NAV_GROUPS.filter((g) => g.items.some((i) => i.id !== "overview")).map(
                    ({ group, items }) => (
                      <div key={group}>
                        <p className="text-[13px] font-semibold text-ink-muted mb-2.5">{group}</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5">
                          {items
                            .filter((i) => i.id !== "overview")
                            .map((item) => {
                              const Icon = item.icon;
                              return (
                                <button
                                  key={item.id}
                                  type="button"
                                  onClick={() => goToTab(item.id)}
                                  className="flex items-center gap-2.5 rounded border border-line-soft bg-surface
                                    min-h-[52px] px-3 py-2.5 text-left cursor-pointer
                                    hover:border-primary/40 hover:bg-surface-overlay/40 transition-colors"
                                >
                                  <span className="w-8 h-8 rounded shrink-0 bg-surface-overlay/60 text-ink-muted flex items-center justify-center text-base">
                                    <Icon />
                                  </span>
                                  <span className="text-[13px] font-semibold text-ink-body leading-snug">
                                    {item.label}
                                  </span>
                                </button>
                              );
                            })}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </Panel>
            </div>
          ) : (
            ActiveView && (
              <div className="animate-fadeIn">
                <ActiveView />
              </div>
            )
          )}
        </main>
      </div>

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onSelect={goToTab}
        activeId={activeTab}
      />
      {confirmUI}
    </div>
  );
};

export default AdminDashboard;
