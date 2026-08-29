import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaYoutube,
  FaWhatsapp,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaChevronUp,
  FaHeart,
} from "react-icons/fa";
import {
  HiSparkles,
  HiShieldCheck,
  HiIdentification,
  HiAcademicCap,
  HiDocumentText,
  HiMagnifyingGlass,
  HiTrophy,
} from "react-icons/hi2";
import logo from "../assets/images/logo3.png";
import { getContactSettings, DEFAULT_CONTACT_SETTINGS } from "../services/firestore";

const Footer = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [contact, setContact] = useState(DEFAULT_CONTACT_SETTINGS);

  useEffect(() => {
    getContactSettings().then((data) => {
      if (data) setContact(data);
    });

    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const cleanPhoneForWhatsApp = (num) =>
    num?.replace(/[^0-9]/g, "").replace(/^0/, "880") || "8801791629996";

  return (
    <footer className="relative bg-[#090a16] text-slate-300 border-t border-white/10 print:hidden overflow-hidden transition-colors duration-200 font-sans">
      {/* Background Subtle Ambient Glow */}
      <div className="pointer-events-none absolute top-0 left-1/4 w-96 h-96 -translate-y-1/2 rounded-full bg-indigo-500/5 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 w-96 h-96 translate-y-1/3 rounded-full bg-emerald-500/5 blur-3xl" />

      {/* Main Footer Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-8 relative z-10">
        {/* 4-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 pb-12 border-b border-white/10">
          
          {/* Col 1: Brand & Bio (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <Link to="/" className="inline-block group">
              <img
                src={logo}
                alt={contact.organizationName || "কিশোরকণ্ঠ পাঠক ফোরাম"}
                className="h-10 sm:h-12 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
              />
            </Link>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-normal">
              {contact.bio ||
                "১৯৯৪ সাল থেকে শিক্ষার্থীদের মেধা অন্বেষণ, নৈতিক চরিত্র গঠন এবং সুস্থ সংস্কৃতির বিকাশে নিরলসভাবে কাজ করে যাচ্ছে।"}
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-2.5 pt-1">
              {contact.facebookUrl && (
                <a
                  href={contact.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/10 hover:border-blue-500/50 hover:bg-blue-600 hover:text-white text-slate-300 flex items-center justify-center text-sm hover:scale-110 transition-all cursor-pointer shadow-sm"
                  title="Facebook Page"
                >
                  <FaFacebookF />
                </a>
              )}

              {contact.whatsappNumber && (
                <a
                  href={`https://wa.me/${cleanPhoneForWhatsApp(contact.whatsappNumber)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500 hover:text-slate-950 text-slate-300 flex items-center justify-center text-base hover:scale-110 transition-all cursor-pointer shadow-sm"
                  title="WhatsApp Support"
                >
                  <FaWhatsapp />
                </a>
              )}

              {contact.youtubeUrl && (
                <a
                  href={contact.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/10 hover:border-rose-500/50 hover:bg-rose-600 hover:text-white text-slate-300 flex items-center justify-center text-sm hover:scale-110 transition-all cursor-pointer shadow-sm"
                  title="YouTube Channel"
                >
                  <FaYoutube />
                </a>
              )}
            </div>
          </div>

          {/* Col 2: Quick Portals (3 cols) */}
          <div className="lg:col-span-3 space-y-3.5">
            <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              ডিজিটাল পোর্টাল
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm font-medium">
              <li>
                <Link
                  to="/scholarship"
                  className="text-slate-400 hover:text-emerald-400 hover:translate-x-1 transition-all inline-flex items-center gap-1.5"
                >
                  <HiDocumentText className="text-emerald-400 text-sm" />
                  <span>অনলাইন রেজিস্ট্রেশন</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/admit-card"
                  className="text-slate-400 hover:text-indigo-400 hover:translate-x-1 transition-all inline-flex items-center gap-1.5"
                >
                  <HiIdentification className="text-indigo-400 text-sm" />
                  <span>প্রবেশপত্র ডাউনলোড</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/search"
                  className="text-slate-400 hover:text-amber-400 hover:translate-x-1 transition-all inline-flex items-center gap-1.5"
                >
                  <HiMagnifyingGlass className="text-amber-400 text-sm" />
                  <span>ফলাফল অনুসন্ধান</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/list"
                  className="text-slate-400 hover:text-teal-400 hover:translate-x-1 transition-all inline-flex items-center gap-1.5"
                >
                  <HiAcademicCap className="text-teal-400 text-sm" />
                  <span>উত্তীর্ণদের তালিকা</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/leaderboard"
                  className="text-slate-400 hover:text-amber-400 hover:translate-x-1 transition-all inline-flex items-center gap-1.5"
                >
                  <HiTrophy className="text-amber-400 text-sm" />
                  <span>শীর্ষ মেধা তালিকা</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Useful Links (2 cols) */}
          <div className="lg:col-span-2 space-y-3.5">
            <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
              প্রয়োজনীয় লিংক
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm font-medium">
              <li>
                <Link
                  to="/about"
                  className="text-slate-400 hover:text-white hover:translate-x-1 transition-all block"
                >
                  আমাদের সম্পর্কে
                </Link>
              </li>
              <li>
                <Link
                  to="/notice"
                  className="text-slate-400 hover:text-white hover:translate-x-1 transition-all block"
                >
                  নোটিশ বোর্ড
                </Link>
              </li>
              <li>
                <Link
                  to="/gallery"
                  className="text-slate-400 hover:text-white hover:translate-x-1 transition-all block"
                >
                  ফটো গ্যালারি
                </Link>
              </li>
              <li>
                <Link
                  to="/scholarship"
                  className="text-slate-400 hover:text-white hover:translate-x-1 transition-all block"
                >
                  বৃত্তি সিলেবাস ও নিয়ম
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-slate-400 hover:text-white hover:translate-x-1 transition-all block"
                >
                  যোগাযোগ ও হেল্পলাইন
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Helpline (3 cols) */}
          <div className="lg:col-span-3 space-y-3.5">
            <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              যোগাযোগ ও সহায়তা
            </h4>

            <div className="space-y-2.5 text-xs sm:text-sm text-slate-400 font-normal">
              <div className="flex items-start gap-2.5">
                <FaMapMarkerAlt className="text-emerald-400 text-sm mt-0.5 shrink-0" />
                <span>{contact.officeAddress || "মেহনাজ টাওয়ার (৪র্থ তলা), রিকাবীবাজার, সিলেট-৩১০০"}</span>
              </div>

              <div className="flex items-center gap-2.5">
                <FaPhoneAlt className="text-emerald-400 text-xs shrink-0" />
                <a
                  href={`tel:${contact.helplinePrimary?.replace(/[^0-9+]/g, "") || "+8801962633662"}`}
                  className="hover:text-emerald-400 transition-colors"
                >
                  {contact.helplinePrimary || "০১৯৬২-৬৩৩৬৬২"}
                  {contact.helplineSecondary && `, ${contact.helplineSecondary}`}
                </a>
              </div>

              <div className="flex items-center gap-2.5">
                <FaEnvelope className="text-emerald-400 text-xs shrink-0" />
                <a
                  href={`mailto:${contact.email || "kkmb.sylhetwest@gmail.com"}`}
                  className="hover:text-emerald-400 transition-colors truncate"
                >
                  {contact.email || "kkmb.sylhetwest@gmail.com"}
                </a>
              </div>
            </div>

            {/* Direct WhatsApp Action Button */}
            <div className="pt-2">
              <a
                href={`https://wa.me/${cleanPhoneForWhatsApp(contact.whatsappNumber || "01791629996")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 hover:scale-102 active:scale-98 transition-all cursor-pointer"
              >
                <FaWhatsapp className="text-base" />
                <span>সরাসরি হোয়াটসঅ্যাপে কথা বলুন</span>
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 font-medium text-center sm:text-left">
          <p>
            {contact.copyrightText ||
              `সর্বস্বত্ব সংরক্ষিত © ১৯৯৪ - ${new Date().getFullYear()} কিশোরকণ্ঠ পাঠক ফোরাম, সিলেট জেলা পশ্চিম শাখা।`}
          </p>

          <p className="flex items-center justify-center gap-1">
            <span>কিশোরকণ্ঠ মেধাবৃত্তি পরিষদ • সিলেট জেলা পশ্চিম</span>
          </p>
        </div>
      </div>

      {/* Floating Scroll To Top Button */}
      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-20 right-5 sm:bottom-6 sm:right-6 z-40 w-11 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-2xl flex items-center justify-center text-sm transition-all hover:scale-110 active:scale-95 cursor-pointer border border-white/20 animate-fadeIn"
          aria-label="Scroll to top"
          title="উপরে যান"
        >
          <FaChevronUp />
        </button>
      )}
    </footer>
  );
};

export default Footer;