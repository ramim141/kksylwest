import React from 'react';
import { Link } from 'react-router-dom';
import { HiSparkles } from 'react-icons/hi2';

const RegistrationCTA = () => (
  <div className="relative p-8 mb-12 overflow-hidden text-center rounded-xl border border-primary/25 bg-gradient-to-br from-primary-900 via-surface-card to-surface-card">
    <div className="absolute top-0 left-0 w-full h-full opacity-10">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="registration-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="20" cy="20" r="2" fill="white"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#registration-pattern)" />
      </svg>
    </div>
    <div className="relative z-10 space-y-4">
      <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-sm">
        <HiSparkles /> সরাসরি ঘরে বসেই রেজিস্ট্রেশন করুন
      </div>
      <h2 className="text-3xl sm:text-4xl font-extrabold text-white">এখনই অনলাইনে রেজিস্ট্রেশন করুন</h2>
      <div>
        <Link
          to="/register"
          className="inline-block px-8 py-3.5 font-bold transition-all transform bg-surface-card rounded text-primary hover:bg-primary/10 hover:scale-105 hover:shadow-overlay cursor-pointer text-base"
        >
          অনলাইন রেজিস্ট্রেশন ফরম
        </Link>
      </div>
      <p className="text-white/90 text-sm">অথবা আপনার স্কুল প্রতিনিধির সাথে যোগাযোগ করে ফরম পূরণ করুন</p>
    </div>
  </div>
);

export default RegistrationCTA;