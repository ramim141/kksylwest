import React, { useEffect, useState } from "react";
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
} from "react-icons/hi2";

import { NAV_GROUPS, NAV_INDEX } from "./navConfig";
import CommandPalette from "./CommandPalette";
import Overview from "./overview/Overview";
import { toBn, useOverviewData } from "./overview/useOverviewData";
import { Button, IconButton, useConfirm } from "./ui";
import { PageHeader } from "./ui/layout";

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
import ExamCenterManager from "./tabs/ExamCenterManager";
import AnnouncementManager from "./tabs/AnnouncementManager";
import WhatsAppBroadcaster from "./tabs/WhatsAppBroadcaster";
import AdmitCardBulkPrintManager from "./tabs/AdmitCardBulkPrintManager";

const TAB_VIEWS = {
  registrations: RegistrationManager,
  admitprint: AdmitCardBulkPrintManager,
  results: ResultManager,
  broadcaster: WhatsAppBroadcaster,
  upazilas: UpazilaCenterManager,
  examcenters: ExamCenterManager,
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

  /* ------------------------------------------------ metrics
     One read serves both surfaces: the overview panels and the badges
     that tell the sidebar where work is waiting. */
  const { counts, data: overviewData, state: statsState, lastUpdated, refresh: fetchStats } =
    useOverviewData();

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
    if (id === "registrations" && counts.pendingRegistrations > 0)
      return { text: `${toBn(counts.pendingRegistrations)} নতুন`, tone: "primary" };
    if (id === "messages" && counts.unreadMessages > 0)
      return { text: toBn(counts.unreadMessages), tone: "error" };
    if (id === "results" && counts.results > 0)
      return { text: toBn(counts.results), tone: "neutral" };
    if (id === "notices" && counts.notices > 0)
      return { text: toBn(counts.notices), tone: "neutral" };
    return null;
  };

  const current = NAV_INDEX[activeTab] || NAV_INDEX.overview;
  const ActiveView = TAB_VIEWS[activeTab];

  return (
    <div className="min-h-screen bg-surface text-ink-body font-sans antialiased relative selection:bg-primary/25 selection:text-ink-strong">
      {/* Background ambient gradient washes for depth */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-40 right-0 w-[500px] h-[500px] bg-primary/[0.035] rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-secondary/[0.02] rounded-full blur-3xl" />
        <div className="absolute -bottom-20 right-1/4 w-[600px] h-[600px] bg-tertiary/[0.025] rounded-full blur-3xl" />
      </div>

      <a
        href="#admin-content"
        className="sr-only focus:not-sr-only focus:fixed focus:z-[100] focus:top-4 focus:left-4
          focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2.5 focus:text-primary-on focus:font-semibold focus:shadow-lg"
      >
        সরাসরি মূল কনটেন্টে যান
      </a>

      {/* Drawer scrim — mobile only */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden animate-fadeIn"
        />
      )}

      {/* ==================== SIDEBAR ==================== */}
      <aside
        aria-label="অ্যাডমিন নেভিগেশন"
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-surface-low/95 backdrop-blur-2xl border-r border-line-soft/80
          transition-[width,transform] duration-200 ease-out shadow-2xl lg:shadow-none
          ${sidebarOpen ? "w-[268px]" : "w-[78px]"}
          ${mobileMenuOpen ? "translate-x-0 w-[268px]" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center gap-3 px-4 border-b border-line-soft/80 shrink-0 bg-surface-low/50">
          <div className="relative">
            <span className="w-10 h-10 rounded-xl shrink-0 bg-gradient-to-br from-primary via-primary-container to-emerald-700 text-primary-on flex items-center justify-center text-xl shadow-md shadow-primary/20">
              <HiShieldCheck />
            </span>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-primary border-2 border-surface-low" />
          </div>

          {(sidebarOpen || mobileMenuOpen) && (
            <div className="flex-1 min-w-0 leading-tight">
              <span className="block text-sm font-bold text-ink-strong tracking-tight truncate">
                কিশোরকণ্ঠ
              </span>
              <span className="block text-[11px] font-medium text-ink-muted uppercase tracking-wider truncate">
                কন্ট্রোল প্যানেল
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label={sidebarOpen ? "সাইডবার ছোট করুন" : "সাইডবার বড় করুন"}
            title={sidebarOpen ? "সাইডবার ছোট করুন" : "সাইডবার বড় করুন"}
            className={`hidden lg:flex w-8 h-8 rounded-lg items-center justify-center shrink-0
              text-ink-muted hover:text-ink-strong hover:bg-surface-overlay/80 transition-colors cursor-pointer
              ${sidebarOpen ? "" : "mx-auto"}`}
          >
            <HiChevronDoubleLeft
              className={`text-base transition-transform duration-200 ${sidebarOpen ? "" : "rotate-180"}`}
            />
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="মেনু বন্ধ করুন"
            className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-ink-muted hover:text-ink-strong hover:bg-surface-overlay/80 transition-colors cursor-pointer"
          >
            <HiXMark className="text-xl" />
          </button>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 px-3 py-4 space-y-5 overflow-x-hidden overflow-y-auto scrollbar-slim">
          {NAV_GROUPS.map(({ group, items }) => (
            <div key={group} className="space-y-1">
              {sidebarOpen || mobileMenuOpen ? (
                <p className="px-3 pb-1 text-[11px] font-bold text-ink-muted/70 uppercase tracking-wider">
                  {group}
                </p>
              ) : (
                <div className="mx-2 my-2.5 h-px bg-line-soft/60" aria-hidden="true" />
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
                    className={`relative w-full flex items-center gap-3 rounded-xl min-h-[42px] px-3
                      text-[13.5px] font-medium text-left transition-all duration-150 cursor-pointer select-none
                      ${expanded ? "" : "justify-center"}
                      ${
                        isActive
                          ? "bg-gradient-to-r from-primary/18 via-primary/10 to-transparent text-primary font-bold shadow-sm shadow-primary/5"
                          : "text-ink-muted hover:text-ink-strong hover:bg-surface-overlay/60"
                      }`}
                  >
                    {/* Glowing active indicator bar */}
                    {isActive && (
                      <span
                        aria-hidden="true"
                        className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-primary shadow-sm shadow-primary"
                      />
                    )}
                    <Icon className={`text-lg shrink-0 ${isActive ? "text-primary" : "text-ink-muted"}`} />
                    {expanded && <span className="flex-1 min-w-0 truncate">{tab.label}</span>}
                    {expanded && badge && (
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold leading-none font-bangla-number shadow-sm ${
                          badge.tone === "error"
                            ? "bg-error/20 text-error border border-error/30"
                            : badge.tone === "primary"
                            ? "bg-primary/20 text-primary border border-primary/30"
                            : "bg-surface-overlay text-ink-muted"
                        }`}
                      >
                        {badge.text}
                      </span>
                    )}
                    {/* Collapsed: dot indicator */}
                    {!expanded && badge && (
                      <span
                        aria-hidden="true"
                        className={`absolute top-2 right-2 w-2.5 h-2.5 rounded-full ring-2 ring-surface-low ${
                          badge.tone === "error" ? "bg-error animate-pulse" : "bg-primary"
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Signed-in Admin Profile Footer */}
        <div className="p-3 border-t border-line-soft/80 shrink-0 bg-surface-low/60">
          <div
            className={`flex items-center gap-3 rounded-xl bg-surface-card/80 border border-line-soft/80 p-2.5 shadow-sm ${
              sidebarOpen || mobileMenuOpen ? "" : "justify-center"
            }`}
          >
            <div className="relative shrink-0">
              <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/30 via-primary/15 to-transparent border border-primary/40 text-primary flex items-center justify-center text-sm font-bold shadow-inner">
                {currentUser?.email ? currentUser.email.charAt(0).toUpperCase() : "A"}
              </span>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-primary ring-2 ring-surface-card" />
            </div>

            {(sidebarOpen || mobileMenuOpen) && (
              <div className="flex-1 min-w-0 leading-tight">
                <p className="text-[13px] font-bold text-ink-strong truncate">
                  {currentUser?.email ? currentUser.email.split("@")[0] : "Admin"}
                </p>
                <p className="text-[11px] text-primary flex items-center gap-1.5 mt-0.5 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" aria-hidden="true" />
                  সক্রিয় অ্যাডমিন
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ==================== WORKSPACE ==================== */}
      <div
        className={`flex flex-col min-h-screen transition-[padding] duration-200 ${
          sidebarOpen ? "lg:pl-[268px]" : "lg:pl-[78px]"
        }`}
      >
        {/* Sticky Header Topbar */}
        <header className="sticky top-0 z-30 h-16 shrink-0 bg-surface/90 backdrop-blur-2xl border-b border-line-soft/80 px-4 sm:px-6 flex items-center gap-3 shadow-sm">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="মেনু খুলুন"
            className="lg:hidden w-10 h-10 -ml-1.5 rounded-lg flex items-center justify-center shrink-0 text-ink-muted hover:text-ink-strong hover:bg-surface-overlay/80 transition-colors cursor-pointer"
          >
            <HiBars3 className="text-xl" />
          </button>

          {/* Breadcrumb navigation */}
          <nav aria-label="ব্রেডক্রাম্ব" className="min-w-0 flex items-center gap-2 text-[13px]">
            <button
              type="button"
              onClick={() => goToTab("overview")}
              className={`rounded-lg px-2.5 py-1 transition-colors cursor-pointer shrink-0 font-medium ${
                activeTab === "overview"
                  ? "bg-primary/15 text-primary font-bold"
                  : "text-ink-muted hover:text-ink-strong hover:bg-surface-overlay/50"
              }`}
            >
              ড্যাশবোর্ড
            </button>
            {activeTab !== "overview" && (
              <>
                <span className="text-ink-muted/40 shrink-0" aria-hidden="true">
                  /
                </span>
                <span className="hidden sm:inline text-ink-muted shrink-0 text-[12px] uppercase tracking-wider">
                  {current.group}
                </span>
                <span className="hidden sm:inline text-ink-muted/40 shrink-0" aria-hidden="true">
                  /
                </span>
                <span className="font-bold text-ink-strong bg-surface-card/80 border border-line-soft/80 rounded-lg px-2.5 py-1 truncate shadow-sm">
                  {current.label}
                </span>
              </>
            )}
          </nav>

          <div className="flex-1" />

          {/* Jump-to Search bar button */}
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="hidden md:flex items-center gap-2.5 min-h-[38px] px-3.5 rounded-xl border border-line-soft/80
              bg-surface-card/80 backdrop-blur-sm text-ink-muted hover:text-ink-strong hover:border-line-strong/60 transition-all cursor-pointer shadow-sm group"
          >
            <HiMagnifyingGlass className="text-base group-hover:text-primary transition-colors" />
            <span className="text-[13px]">সেকশন খুঁজুন</span>
            <kbd className="rounded-md border border-line-soft bg-surface px-2 py-0.5 text-[11px] font-semibold text-ink-muted shadow-sm">
              Ctrl K
            </kbd>
          </button>

          <IconButton
            icon={HiMagnifyingGlass}
            label="সেকশন খুঁজুন"
            onClick={() => setPaletteOpen(true)}
            className="md:hidden"
          />

          {/* Database live connection state indicator */}
          <div
            className="hidden xl:inline-flex items-center gap-2 rounded-full border border-line-soft/80 bg-surface-card/80 px-3.5 py-1.5 text-[12px] text-ink-muted shadow-sm"
            title={
              isFirebaseConfigured()
                ? "Firestore ডেটাবেজের সাথে সরাসরি সংযুক্ত"
                : "Firebase কনফিগার করা নেই — পরিবর্তন সংরক্ষণ হবে না"
            }
          >
            <span className="relative flex h-2.5 w-2.5">
              {isFirebaseConfigured() && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              )}
              <span
                className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  isFirebaseConfigured() ? "bg-primary" : "bg-secondary"
                }`}
              />
            </span>
            <span className="font-medium">
              {isFirebaseConfigured() ? "লাইভ ডেটাবেজ" : "লোকাল মোড"}
            </span>
          </div>

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
            মূল সাইট
          </Button>

          <Button size="sm" tone="danger" icon={HiArrowRightOnRectangle} onClick={handleLogout}>
            <span className="hidden sm:inline">লগআউট</span>
          </Button>
        </header>

        {/* Main Body Canvas */}
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
                  তথ্য রিফ্রেশ
                </Button>
              ) : null
            }
          />

          {activeTab === "overview" ? (
            <Overview
              data={overviewData}
              state={statsState}
              lastUpdated={lastUpdated}
              goToTab={goToTab}
              badgeFor={badgeFor}
            />
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

