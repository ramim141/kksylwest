import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  HiHome,
  HiMagnifyingGlass,
  HiIdentification,
  HiTrophy,
  HiBell,
} from "react-icons/hi2";

const navItems = [
  { to: "/", label: "হোম", icon: HiHome },
  { to: "/admit-card", label: "প্রবেশপত্র", icon: HiIdentification },
  { to: "/search", label: "ফলাফল", icon: HiMagnifyingGlass, highlight: true },
  { to: "/leaderboard", label: "মেধা তালিকা", icon: HiTrophy },
  { to: "/notice", label: "নোটিশ", icon: HiBell },
];

const MobileBottomNav = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  if (isAdminRoute) return null;

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 print:hidden bg-[#0f1124]/95 backdrop-blur-xl border-t border-white/10 shadow-[0_-4px_25px_rgba(0,0,0,0.5)] px-1 sm:px-3 pt-1.5 pb-2 transition-colors duration-200"
      aria-label="Mobile Navigation"
      style={{ paddingBottom: "max(8px, env(safe-area-inset-bottom))" }}
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isResultItem = item.highlight;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all duration-200 cursor-pointer min-w-0 max-w-[72px] select-none ${
                  isActive
                    ? "text-emerald-400 font-black"
                    : "text-slate-400 hover:text-white font-semibold"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`relative p-1.5 rounded-xl transition-all duration-200 flex items-center justify-center ${
                      isActive
                        ? isResultItem
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/30 scale-110"
                          : "bg-emerald-500/20 text-emerald-400 scale-105 border border-emerald-500/30"
                        : isResultItem
                        ? "bg-indigo-600/30 text-indigo-300 border border-indigo-500/30"
                        : "text-slate-400"
                    }`}
                  >
                    <Icon className="text-lg sm:text-xl shrink-0" />
                  </div>
                  <span
                    className={`text-[10px] sm:text-[11px] mt-1 tracking-tight truncate w-full text-center leading-tight ${
                      isActive
                        ? "font-extrabold text-emerald-400"
                        : "text-slate-400"
                    }`}
                  >
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
