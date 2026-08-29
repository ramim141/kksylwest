import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  HiSparkles,
  HiMegaphone,
  HiXMark,
  HiArrowRight,
  HiFire,
} from "react-icons/hi2";
import { getAnnouncement } from "../../services/firestore";

const BreakingNewsBar = () => {
  const [announcement, setAnnouncement] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    getAnnouncement().then((data) => {
      if (data && data.enabled) {
        setAnnouncement(data);
      }
    });
  }, []);

  if (!announcement || !announcement.enabled || dismissed) return null;

  return (
    <div className="bg-primary-900 text-white text-xs py-2 px-4 relative z-50 print:hidden font-sans border-b border-white/10 animate-fadeIn">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Badge & News Text */}
        <div className="flex items-center gap-2.5 overflow-hidden flex-1">
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-b from-secondary/15 to-secondary-container text-primary font-black text-[10px] uppercase tracking-[0.1em] flex-shrink-0">
            <HiFire className="text-primary text-xs" />
            <span>{announcement.title || "ব্রেকিং নিউজ"}</span>
          </div>

          <p className="truncate font-medium tracking-wide text-xs text-white/80">
            {announcement.message}
          </p>
        </div>

        {/* Right: Optional Link & Dismiss Button */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {announcement.linkUrl && (
            <Link
              to={announcement.linkUrl}
              className="inline-flex items-center gap-1 font-bold text-secondary hover:text-white bg-white/10 hover:bg-white/20 border border-white/15 px-3 py-0.5 rounded-full transition duration-150 text-[11px]"
            >
              <span>{announcement.linkText || "বিস্তারিত"}</span>
              <HiArrowRight className="text-xs" />
            </Link>
          )}

          <button
            onClick={() => setDismissed(true)}
            className="p-1 rounded-full text-white/60 hover:text-white hover:bg-white/15 transition cursor-pointer"
            aria-label="বন্ধ করুন"
          >
            <HiXMark className="text-base" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BreakingNewsBar;
