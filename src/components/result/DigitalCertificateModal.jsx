import React, { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { QRCodeSVG } from "qrcode.react";
import {
  HiXMark,
  HiPrinter,
  HiArrowDownTray,
  HiCheckBadge,
  HiSparkles,
  HiAcademicCap,
  HiTrophy,
  HiShieldCheck,
} from "react-icons/hi2";
import { FaCrown, FaAward, FaCertificate, FaDownload } from "react-icons/fa";
import logo from "../../assets/images/logo3.png";
import { useBranding } from "../../context/BrandingContext";

const DigitalCertificateModal = ({ data, isOpen, onClose }) => {
  const certRef = useRef(null);
  const { getLogoFor } = useBranding();
  const currentLogo = getLogoFor("certificate") || logo;
  const [downloading, setDownloading] = useState(false);

  if (!isOpen || !data) return null;

  const getBadgeTitle = (cat) => {
    if (!cat) return "মেধাবৃত্তি সনদ";
    if (cat.toLowerCase().includes("talent") || cat.includes("ট্যালেন্ট"))
      return "ট্যালেন্টপুল বৃত্তি (Talentpool)";
    if (cat.toLowerCase().includes("general") || cat.includes("সাধারণ"))
      return "সাধারণ বৃত্তি (General)";
    if (cat.toLowerCase().includes("special") || cat.includes("বিশেষ"))
      return "বিশেষ গ্রেড বৃত্তি (Special Grade)";
    return `${cat} বৃত্তি`;
  };

  const verifyUrl = `${window.location.origin}/search?roll=${encodeURIComponent(data.roll || "")}`;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadHD = async () => {
    if (!certRef.current) return;
    setDownloading(true);
    try {
      await new Promise((r) => setTimeout(r, 150));
      const dataUrl = await toPng(certRef.current, {
        cacheBust: true,
        pixelRatio: 3, // Ultra-high resolution 300 DPI export
        quality: 0.99,
        backgroundColor: "#ffffff",
        skipFonts: true,
      });

      const link = document.createElement("a");
      link.download = `KKMB_Certificate_${data.roll || "Student"}_2025.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Certificate download error:", err);
      alert("সনদপত্র ডাউনলোড করতে সমস্যা হয়েছে। দয়া করে প্রিন্ট বাটন ব্যবহার করুন।");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 overflow-y-auto font-sans sm:p-6 bg-black/80 backdrop-blur-md backdrop-enter print:p-0 print:bg-white print:static">
      
      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-[#14162b] border border-white/15 rounded-3xl shadow-2xl overflow-hidden overlay-enter print:border-none print:shadow-none print:bg-white print:rounded-none print:w-full print:animate-none">
        
        {/* Modal Top Control Bar (Hidden on Print) */}
        <div className="p-4 sm:p-5 bg-[#0f1124] border-b border-white/10 flex items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-1.5">
              <FaCertificate className="text-amber-400" />
              <span>অফিসিয়াল ডিজিটাল মেধা সনদপত্র (Certificate of Merit)</span>
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow transition cursor-pointer"
            >
              <HiPrinter className="text-sm" />
              <span className="hidden sm:inline">প্রিন্ট (A4)</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadHD}
              disabled={downloading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow transition cursor-pointer disabled:opacity-50"
            >
              <FaDownload className="text-xs" />
              <span>{downloading ? "ডাউনলোড..." : "HD সনদ ডাউনলোড"}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-slate-300 hover:text-white transition cursor-pointer"
              title="বন্ধ করুন"
            >
              <HiXMark className="text-lg" />
            </button>
          </div>
        </div>

        {/* Certificate View Wrapper (Horizontal scroll friendly on mobile) */}
        <div className="p-3 sm:p-6 overflow-x-auto scrollbar-none">
          <div
            ref={certRef}
            id="digital-certificate-canvas"
            className="w-full min-w-[650px] max-w-[820px] mx-auto bg-[#faf8f2] text-slate-900 p-8 sm:p-12 rounded-2xl relative shadow-2xl border-8 border-double border-amber-600/40 select-none overflow-hidden print:p-8 print:m-0 print:border-8 print:shadow-none print:w-full"
            style={{
              backgroundImage: "radial-gradient(#d97706 0.4px, transparent 0.4px)",
              backgroundSize: "20px 20px",
            }}
          >
            {/* Ornate Inner Border Line */}
            <div className="absolute inset-3 sm:inset-4 border-2 border-amber-500/50 rounded-xl pointer-events-none" />
            <div className="absolute inset-5 sm:inset-6 border border-amber-400/30 rounded-lg pointer-events-none" />

            {/* Corner Classic Flourishes */}
            <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-amber-600/70 pointer-events-none" />
            <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-amber-600/70 pointer-events-none" />
            <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-amber-600/70 pointer-events-none" />
            <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-amber-600/70 pointer-events-none" />

            {/* Background Watermark Crest */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-6 pointer-events-none">
              <img src={currentLogo} alt="Watermark" className="w-96 h-auto grayscale" />
            </div>

            {/* CERTIFICATE CONTENT */}
            <div className="relative z-10 text-center space-y-6">
              
              {/* Header: Logo, Organization & Title */}
              <div className="space-y-2">
                <img
                  src={currentLogo}
                  alt="KishorKantho Logo"
                  className="h-14 sm:h-16 w-auto mx-auto object-contain drop-shadow-sm"
                />

                <div className="space-y-0.5">
                  <h2 className="text-xl sm:text-2xl font-black text-indigo-950 tracking-wide font-serif">
                    কিশোরকণ্ঠ পাঠক ফোরাম
                  </h2>
                  <p className="text-xs sm:text-sm font-bold text-amber-900 tracking-wider">
                    সিলেট জেলা পশ্চিম শাখা • রেজিস্টার্ড মেধা মূল্যায়ন পরিষদ
                  </p>
                </div>

                <div className="pt-2">
                  <div className="inline-block px-6 py-1.5 rounded-full bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 text-white font-black text-xs sm:text-sm tracking-widest uppercase shadow-md">
                    মেধা সম্মাননা সনদ (Certificate of Merit)
                  </div>
                </div>
              </div>

              {/* Certification Statement */}
              <p className="text-xs sm:text-sm text-slate-700 font-medium italic">
                এই মর্মে পরম আনন্দের সাথে প্রত্যয়ন করা যাচ্ছে যে,
              </p>

              {/* Student Name */}
              <div className="py-1">
                <div className="text-2xl sm:text-3xl font-black text-indigo-950 font-serif border-b-2 border-dotted border-amber-600/60 max-w-md mx-auto pb-1">
                  {data.name}
                </div>
                <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block mt-1">
                  পিতা: {data.father || "—"}
                </span>
              </div>

              {/* Achievement Body Text */}
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed max-w-xl mx-auto font-medium">
                শিক্ষা প্রতিষ্ঠান <strong className="text-indigo-950 font-bold">"{data.school}"</strong> থেকে{" "}
                <strong className="text-indigo-950 font-bold">{data.class}</strong> শ্রেণিতে অংশ নিয়ে{" "}
                <strong className="text-amber-900 font-black">কিশোরকণ্ঠ মেধাবৃত্তি পরীক্ষা ২০২৫</strong>-এ কৃতিত্বের সাথে{" "}
                <span className="inline-block px-3 py-0.5 rounded-md bg-amber-100 border border-amber-300 text-amber-900 font-black text-xs sm:text-sm">
                  {getBadgeTitle(data.category)}
                </span>{" "}
                অর্জন করেছে। তার রোল নম্বর <strong className="font-mono text-indigo-900 font-black">{data.roll}</strong>।
              </p>

              <p className="text-xs text-slate-600 italic">
                আমরা তার উজ্জ্বল ভবিষ্যৎ, মেধার বিকাশ ও সার্বিক সাফল্য কামনা করি।
              </p>

              {/* Footer: Signatures & QR Code */}
              <div className="pt-6 border-t border-amber-600/30 grid grid-cols-3 items-end gap-2 text-center text-xs">
                
                {/* Left: Director Signature */}
                <div className="space-y-1">
                  <div className="w-24 sm:w-32 border-b border-slate-700 mx-auto" />
                  <span className="text-[11px] font-bold text-slate-900 block">পরিচালক</span>
                  <span className="text-[9px] text-slate-500 block">কিশোরকণ্ঠ পাঠক ফোরাম</span>
                </div>

                {/* Center: Live Verification QR Code + Seal */}
                <div className="flex flex-col items-center justify-center space-y-1">
                  <div className="p-1.5 bg-white border border-slate-300 rounded-lg shadow-sm">
                    <QRCodeSVG value={verifyUrl} size={54} level="M" />
                  </div>
                  <span className="text-[8px] font-mono text-slate-500 font-bold">
                    Scan to Verify KKMB-2025
                  </span>
                </div>

                {/* Right: Controller Signature */}
                <div className="space-y-1">
                  <div className="w-24 sm:w-32 border-b border-slate-700 mx-auto" />
                  <span className="text-[11px] font-bold text-slate-900 block">পরীক্ষা নিয়ন্ত্রক</span>
                  <span className="text-[9px] text-slate-500 block">কিশোরকণ্ঠ মেধাবৃত্তি পরিষদ</span>
                </div>

              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DigitalCertificateModal;
