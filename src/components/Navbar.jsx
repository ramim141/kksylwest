import React, { useState, useEffect } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/images/logo3.png";
import {
  HiXMark,
  HiBars3,
  HiHome,
  HiInformationCircle,
  HiAcademicCap,
  HiPencilSquare,
  HiIdentification,
  HiPhoto,
  HiMagnifyingGlass,
  HiBell,
  HiPhone,
  HiChevronRight,
  HiTrophy,
  HiArchiveBox,
} from "react-icons/hi2";
import { FaCrown, FaCertificate } from "react-icons/fa";
import { getAnnouncement } from "../services/firestore";
import { useExamYear } from "../context/ExamYearContext";
import { useBranding } from "../context/BrandingContext";

const Navbar = () => {
  const examYear = useExamYear();
  const { getLogoFor } = useBranding();
  const currentLogo = getLogoFor("navbar") || logo;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [announcement, setAnnouncement] = useState({
    enabled: true,
    title: "জরুরি ঘোষণা",
    message: "কিশোরকণ্ঠ মেধাবৃত্তির অনলাইন রেজিস্ট্রেশন চলছে! আপনার প্রবেশপত্র ডাউনলোড করতে প্রবেশপত্র মেনুতে ক্লিক করুন।",
    linkText: "প্রবেশপত্র ডাউনলোড →",
    linkUrl: "/admit-card",
    badgeType: "urgent",
  });
  const [searchRoll, setSearchRoll] = useState("");
  /* Phones only have ~600px of height to spend, and a three-row sticky
     header would take a fifth of it. Past the first screenful the top
     announcement strip folds away, leaving the brand row and the tabs
     pinned. */
  const [condensed, setCondensed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    let frame = 0;
    const read = () => {
      frame = 0;
      setCondensed(window.scrollY > 56);
    };
    // Coalesced into one rAF per frame: the listener itself does no layout
    // work, so scrolling never waits on it.
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };

    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    getAnnouncement().then((data) => {
      if (data) {
        setAnnouncement({
          enabled: data.enabled !== false,
          title: data.title || "জরুরি ঘোষণা",
          message: data.message || "কিশোরকণ্ঠ মেধাবৃত্তি ২০২৫-এর অনলাইন রেজিস্ট্রেশন চলছে!",
          linkText: data.linkText || "প্রবেশপত্র ডাউনলোড →",
          linkUrl: data.linkUrl || "/admit-card",
          badgeType: data.badgeType || "urgent",
        });
      }
    });
  }, []);

  // Close mobile dropdown on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchRoll.trim()) {
      navigate(`/search?roll=${encodeURIComponent(searchRoll.trim())}`);
      setSearchRoll("");
    } else {
      navigate("/search");
    }
  };

  const getSubNavLinkClass = ({ isActive }) =>
    `px-2.5 sm:px-3 py-1 rounded-md text-xs sm:text-[13px] transition-all duration-150 whitespace-nowrap cursor-pointer ${
      isActive
        ? "bg-[#252847] text-white font-bold shadow-sm"
        : "text-slate-300 hover:text-white hover:bg-white/[0.05] font-medium"
    }`;

  const getMobileItemClass = ({ isActive }) =>
    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-150 active:scale-[0.98] ${
      isActive
        ? "text-white bg-[#252847] font-black border border-indigo-500/30"
        : "text-slate-300 hover:bg-white/[0.06] border border-transparent"
    }`;

  return (
    <>
      {/* Full-Screen Dark Overlay Backdrop when open */}
      {isMobileMenuOpen && (
        <div
          onClick={closeMobileMenu}
          className="fixed inset-0 z-40 md:hidden bg-black/70 backdrop-blur-sm backdrop-enter"
        />
      )}

      {/* ===================================================================
          STICKY 3-TIER LUXURY PORTAL HEADER
          =================================================================== */}
      <header className="sticky top-0 z-50 font-sans print:hidden shadow-2xl shadow-black/60 will-change-transform">
        
        {/* -------------------------------------------------------------
            ROW 1: TOP ANNOUNCEMENT STRIP (Fully Admin Dynamic)
            ------------------------------------------------------------- */}
        {announcement.enabled !== false && (
          <div
            className={`bg-[#0f1124] text-slate-300 text-xs px-3 sm:px-6 border-b border-white/[0.06] overflow-hidden transition-[max-height,opacity,padding] duration-300 ease-out md:max-h-none md:opacity-100 md:py-1.5 ${
              condensed ? "max-h-0 opacity-0 py-0" : "max-h-16 opacity-100 py-1.5"
            }`}
          >
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
              
              {/* Left: Colored Bullet + Announcement Text */}
              <div className="flex flex-1 min-w-0 items-center gap-2 overflow-hidden">
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    announcement.badgeType === "urgent"
                      ? "bg-rose-500 shadow-sm shadow-rose-500/50"
                      : announcement.badgeType === "success"
                      ? "bg-emerald-400 shadow-sm shadow-emerald-400/50"
                      : announcement.badgeType === "amber"
                      ? "bg-amber-400 shadow-sm shadow-amber-400/50"
                      : "bg-indigo-400 shadow-sm shadow-indigo-400/50"
                  }`}
                />

                {/* Marquee. Two identical copies sit side by side and the pair
                    slides left by exactly half its own width, so the moment the
                    first copy leaves the second is already in its place and the
                    loop point is invisible. Hover pauses it (see index.css). */}
                <div className="flex-1 min-w-0 overflow-hidden">
                  <div className="flex w-max animate-marquee will-change-transform">
                    {[0, 1].map((copy) => (
                      <p
                        key={copy}
                        aria-hidden={copy === 1}
                        className="whitespace-nowrap pr-16 text-xs font-medium text-slate-300"
                      >
                        <span
                          className={`font-bold ${
                            announcement.badgeType === "urgent"
                              ? "text-rose-400"
                              : announcement.badgeType === "success"
                              ? "text-emerald-400"
                              : announcement.badgeType === "amber"
                              ? "text-amber-300"
                              : "text-indigo-300"
                          }`}
                        >
                          {announcement.title}
                        </span>{" "}
                        — {announcement.message}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: Quick Action Link */}
              {announcement.linkUrl && (
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    to={announcement.linkUrl || "/admit-card"}
                    className="text-[11px] sm:text-xs text-indigo-300 hover:text-white font-bold transition-colors underline decoration-indigo-400/50 hover:decoration-white"
                  >
                    {announcement.linkText || "প্রবেশপত্র ডাউনলোড →"}
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            ROW 2: MAIN BRAND HEADER & ACTIONS
            ------------------------------------------------------------- */}
        <div
          className={`bg-[#14162b] backdrop-blur-xl border-b border-white/[0.06] px-3 sm:px-6 transition-[padding] duration-300 ease-out sm:py-3.5 ${
            condensed ? "py-1.5" : "py-2.5"
          }`}
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            
            {/* Left: Official Logo Only */}
            <Link
              to="/"
              onClick={closeMobileMenu}
              className="flex items-center group cursor-pointer shrink-0"
            >
              <img
                src={currentLogo}
                alt="KishorKantho Logo"
                className={`w-auto object-contain block group-hover:scale-105 transition-all duration-300 sm:h-12 ${
                  condensed ? "h-7" : "h-8"
                }`}
                width="458"
                height="119"
                fetchPriority="high"
              />
            </Link>

            {/* Right Desktop: Search By Roll & Registration Button */}
            <div className="hidden md:flex items-center gap-3">
              {/* Search Pill Input */}
              <form
                onSubmit={handleSearchSubmit}
                className="relative flex items-center"
              >
                <HiMagnifyingGlass className="absolute left-3 text-slate-400 text-sm pointer-events-none" />
                <input
                  type="text"
                  placeholder="রোল দিয়ে খুঁজুন"
                  value={searchRoll}
                  onChange={(e) => setSearchRoll(e.target.value)}
                  className="pl-8 pr-3 py-1.5 w-36 lg:w-44 rounded-xl bg-white/[0.04] border border-white/15 hover:border-white/30 focus:border-indigo-400 focus:bg-white/[0.08] text-xs text-white placeholder-slate-400 focus:outline-none transition-all"
                />
              </form>

              {/* Registration Outlined CTA */}
              <Link
                to="/register"
                className="px-4 py-1.5 rounded-xl border border-indigo-400/50 bg-indigo-500/10 hover:bg-indigo-600/25 hover:border-indigo-400 text-indigo-200 hover:text-white font-bold text-xs transition-all shadow-sm active:scale-95"
              >
                রেজিস্ট্রেশন
              </Link>
            </div>

            {/* Right Mobile: Quick Search Icon & Hamburger Menu Toggle */}
            <div className="flex items-center gap-2 md:hidden">
              <Link
                to="/search"
                className="p-2 rounded-xl bg-white/[0.06] border border-white/15 text-slate-200 hover:text-white active:scale-90 transition-transform"
                title="রোল দিয়ে খুঁজুন"
              >
                <HiMagnifyingGlass className="text-base" />
              </Link>

              <button
                type="button"
                onClick={toggleMenu}
                className="p-2 rounded-xl bg-white/[0.06] border border-white/15 text-white active:scale-90 transition-transform cursor-pointer"
                aria-label="মেনু খুলুন/বন্ধ করুন"
              >
                {isMobileMenuOpen ? (
                  <HiXMark className="text-lg text-rose-400" />
                ) : (
                  <HiBars3 className="text-lg" />
                )}
              </button>
            </div>

          </div>
        </div>

        {/* -------------------------------------------------------------
            ROW 3: HORIZONTAL SUB-NAV MENU
            ------------------------------------------------------------- */}
        <div className="bg-[#14162b] backdrop-blur-xl border-b border-white/[0.08] px-3 sm:px-6 py-1.5 hidden md:block">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            
            {/* Left Nav Links */}
            <nav className="flex items-center gap-1 lg:gap-2 overflow-x-auto scrollbar-none py-0.5">
              <NavLink to="/home" className={getSubNavLinkClass}>
                হোম
              </NavLink>

              <NavLink to="/about" className={getSubNavLinkClass}>
                আমাদের সম্পর্কে
              </NavLink>

              <NavLink to="/notice" className={getSubNavLinkClass}>
                নোটিস
              </NavLink>

              <NavLink to="/gallery" className={getSubNavLinkClass}>
                গ্যালারী
              </NavLink>

              {/* Separator */}
              <span className="text-slate-600 px-1 select-none font-light">|</span>

              {/* Category Label */}
              <span className="text-slate-400 text-xs font-semibold px-1 select-none">
                মেধাবৃত্তি
              </span>

              <NavLink to="/scholarship" className={getSubNavLinkClass}>
                পরীক্ষা
              </NavLink>

              <NavLink to="/admit-card" className={getSubNavLinkClass}>
                প্রবেশপত্র
              </NavLink>

              <NavLink to="/leaderboard" className={getSubNavLinkClass}>
                মেধা তালিকা
              </NavLink>

              <NavLink to="/search" className={getSubNavLinkClass}>
                ফলাফল
              </NavLink>

              {/* Full year-wise result list */}
              <NavLink to="/list" className={getSubNavLinkClass}>
                আর্কাইভ ফলাফল
              </NavLink>
            </nav>

            {/* Far Right Nav Link */}
            <div className="shrink-0">
              <NavLink to="/contact" className={getSubNavLinkClass}>
                যোগাযোগ
              </NavLink>
            </div>

          </div>
        </div>

        {/* =============================================================
            MOBILE SINGLE-COLUMN DRAWER MENU
            ============================================================= */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 w-full z-50 bg-[#14162b]/98 backdrop-blur-2xl border-b border-white/10 shadow-2xl rounded-b-3xl p-4 space-y-3 max-h-[82vh] overflow-y-auto animate-fade-in-down">
            
            {/* Top 2 Primary Action Cards (Single line on all small devices) */}
            <div className="grid grid-cols-2 gap-2 pb-1">
              <NavLink
                to="/register"
                onClick={closeMobileMenu}
                className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] sm:text-xs shadow-md active:scale-95 transition-transform whitespace-nowrap overflow-hidden"
              >
                <HiPencilSquare className="text-sm shrink-0" />
                <span className="whitespace-nowrap">অনলাইন রেজিস্ট্রেশন</span>
              </NavLink>

              <NavLink
                to="/search"
                onClick={closeMobileMenu}
                className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] border border-white/15 text-white font-bold text-[11px] sm:text-xs shadow-md active:scale-95 transition-transform whitespace-nowrap overflow-hidden"
              >
                <HiMagnifyingGlass className="text-sm shrink-0" />
                <span className="whitespace-nowrap">রোল দিয়ে ফলাফল</span>
              </NavLink>
            </div>

            {/* SINGLE COLUMN NAV LINKS */}
            <div className="space-y-1 divide-y divide-white/[0.06]">
              <NavLink
                to="/home"
                onClick={closeMobileMenu}
                className={getMobileItemClass}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center text-sm">
                    <HiHome />
                  </div>
                  <span>হোমপেজ</span>
                </div>
                <HiChevronRight className="text-slate-500 text-xs" />
              </NavLink>

              <NavLink
                to="/about"
                onClick={closeMobileMenu}
                className={getMobileItemClass}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center text-sm">
                    <HiInformationCircle />
                  </div>
                  <span>আমাদের সম্পর্কে</span>
                </div>
                <HiChevronRight className="text-slate-500 text-xs" />
              </NavLink>

              <NavLink
                to="/notice"
                onClick={closeMobileMenu}
                className={getMobileItemClass}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center text-sm">
                    <HiBell />
                  </div>
                  <span>নোটিস বোর্ড</span>
                </div>
                <HiChevronRight className="text-slate-500 text-xs" />
              </NavLink>

              <NavLink
                to="/gallery"
                onClick={closeMobileMenu}
                className={getMobileItemClass}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center text-sm">
                    <HiPhoto />
                  </div>
                  <span>ফটো গ্যালারী</span>
                </div>
                <HiChevronRight className="text-slate-500 text-xs" />
              </NavLink>

              <NavLink
                to="/scholarship"
                onClick={closeMobileMenu}
                className={getMobileItemClass}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center text-sm">
                    <HiAcademicCap />
                  </div>
                  <span>মেধাবৃত্তি পরীক্ষা ও নিয়ম</span>
                </div>
                <HiChevronRight className="text-slate-500 text-xs" />
              </NavLink>

              <NavLink
                to="/admit-card"
                onClick={closeMobileMenu}
                className={getMobileItemClass}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center text-sm">
                    <HiIdentification />
                  </div>
                  <span>প্রবেশপত্র (Admit Card)</span>
                </div>
                <HiChevronRight className="text-slate-500 text-xs" />
              </NavLink>

              <NavLink
                to="/leaderboard"
                onClick={closeMobileMenu}
                className={getMobileItemClass}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center text-sm">
                    <FaCrown />
                  </div>
                  <span>শীর্ষ মেধা তালিকা</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-extrabold">
                  Top 3
                </span>
              </NavLink>

              <NavLink
                to="/list"
                onClick={closeMobileMenu}
                className={getMobileItemClass}
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center justify-center text-sm text-amber-400 w-7 h-7 rounded-xl bg-amber-500/15">
                    <HiArchiveBox />
                  </div>
                  <span>আর্কাইভ ফলাফল</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold font-bangla-number">
                  {examYear}
                </span>
              </NavLink>

              <NavLink
                to="/verify-certificate"
                onClick={closeMobileMenu}
                className={getMobileItemClass}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center text-sm">
                    <FaCertificate />
                  </div>
                  <span>সনদপত্র যাচাই (Verification)</span>
                </div>
                <HiChevronRight className="text-slate-500 text-xs" />
              </NavLink>

              <NavLink
                to="/contact"
                onClick={closeMobileMenu}
                className={getMobileItemClass}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center text-sm">
                    <HiPhone />
                  </div>
                  <span>যোগাযোগ ও হেল্পডেস্ক</span>
                </div>
                <HiChevronRight className="text-slate-500 text-xs" />
              </NavLink>
            </div>

          </div>
        )}

      </header>
    </>
  );
};

export default Navbar;