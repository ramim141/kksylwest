import React, { useRef, useState } from "react";
import { toPng } from "html-to-image";
import {
  HiSparkles,
  HiArrowDownTray,
  HiShare,
  HiPrinter,
  HiArrowPath,
  HiCheckBadge,
  HiTrophy,
  HiAcademicCap,
  HiBuildingOffice2,
  HiUser,
  HiIdentification,
  HiCheckCircle,
} from "react-icons/hi2";
import {
  FaFacebookF,
  FaWhatsapp,
  FaAward,
  FaGraduationCap,
  FaCertificate,
  FaDownload,
} from "react-icons/fa";

import DigitalCertificateModal from "./DigitalCertificateModal";

const toBengaliNumber = (num) =>
  num?.toString().replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[d]) || "";

const ResultCard = ({ data, onReset, onPrint }) => {
  const cardRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);

  const isPassed =
    data.category &&
    data.category.toLowerCase() !== "fail" &&
    data.category.toLowerCase() !== "অনুত্তীর্ণ";

  // Category Badge Title
  const getBadgeTitle = (cat) => {
    if (!cat) return "মেধাবৃত্তি সনদ";
    if (cat.toLowerCase().includes("talent") || cat.includes("ট্যালেন্ট"))
      return "ট্যালেন্টপুল বৃত্তি";
    if (cat.toLowerCase().includes("general") || cat.includes("সাধারণ"))
      return "সাধারণ বৃত্তি";
    if (cat.toLowerCase().includes("special") || cat.includes("বিশেষ"))
      return "বিশেষ গ্রেড বৃত্তি";
    return `${cat} বৃত্তি`;
  };

  // HD PNG Download handler
  const handleDownloadPhotoCard = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      await new Promise((r) => setTimeout(r, 150));

      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2.5, // Crisp high-res export
        quality: 0.98,
        backgroundColor: "#090d1a",
      });

      const link = document.createElement("a");
      link.download = `KKMB_Result_${data.roll || "Student"}_2025.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Photo card generation error:", err);
      alert("ফটো কার্ড ডাউনলোড করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।");
    } finally {
      setDownloading(false);
    }
  };

  // Web Share API handler
  const handleSocialShare = async () => {
    setSharing(true);
    const shareText = `🎉 আলহামদুলিল্লাহ! আমি কিশোরকণ্ঠ মেধাবৃত্তি পরীক্ষা ২০২৫-এ '${getBadgeTitle(
      data.category
    )}' অর্জন করেছি!\n\n👨‍🎓 নাম: ${data.name}\n📋 রোল: ${
      data.roll
    }\n🏫 প্রতিষ্ঠান: ${data.school}\n\nআপনার ফলাফল চেক করুন: ${
      window.location.origin
    }/search?roll=${data.roll}`;

    try {
      if (cardRef.current && navigator.canShare) {
        const dataUrl = await toPng(cardRef.current, {
          cacheBust: true,
          pixelRatio: 2,
          quality: 0.95,
          backgroundColor: "#090d1a",
        });

        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], `result_${data.roll}.png`, {
          type: "image/png",
        });

        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: "কিশোরকণ্ঠ মেধাবৃত্তি ফলাফল ২০২৫",
            text: shareText,
            files: [file],
          });
          setSharing(false);
          return;
        }
      }

      if (navigator.share) {
        await navigator.share({
          title: "কিশোরকণ্ঠ মেধাবৃত্তি ফলাফল ২০২৫",
          text: shareText,
          url: `${window.location.origin}/search?roll=${data.roll}`,
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 3000);
      }
    } catch (err) {
      console.warn("Share cancelled or failed:", err);
    } finally {
      setSharing(false);
    }
  };

  const handleWhatsAppShare = () => {
    const text = `🎉 আলহামদুলিল্লাহ! কিশোরকণ্ঠ মেধাবৃত্তি পরীক্ষা ২০২৫-এ *${
      data.name
    }* (রোল: ${data.roll}) *${getBadgeTitle(
      data.category
    )}* অর্জন করেছে! 🏆\n\nফলাফল চেক করুন: ${window.location.origin}/search?roll=${data.roll}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleFacebookShare = () => {
    const url = encodeURIComponent(`${window.location.origin}/search?roll=${data.roll}`);
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      "_blank",
      "width=600,height=400"
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-fadeIn text-white font-sans">
      
      {/* Top Banner Toolbar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#14162b] border border-white/10 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3 text-left self-start sm:self-auto">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-2xl shrink-0 shadow-sm">
            {isPassed ? <HiTrophy /> : <HiIdentification />}
          </div>
          <div>
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <HiSparkles /> ফলাফল প্রকাশিত
            </span>
            <h3 className="text-sm sm:text-base font-black text-white">
              {data.name} (রোল: <span className="font-mono text-emerald-400">{data.roll}</span>)
            </h3>
          </div>
        </div>

        {/* Action Buttons Top Bar */}
        <div className="flex items-center gap-2 flex-wrap justify-end w-full sm:w-auto">
          {isPassed && (
            <button
              type="button"
              onClick={() => setIsCertModalOpen(true)}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md shadow-amber-400/25 transition-all cursor-pointer whitespace-nowrap"
            >
              <FaCertificate className="text-xs" />
              <span>ডিজিটাল সনদ</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleDownloadPhotoCard}
            disabled={downloading}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs shadow-md shadow-emerald-500/25 transition-all cursor-pointer disabled:opacity-50 whitespace-nowrap"
          >
            <FaDownload className="text-xs" />
            <span>{downloading ? "ডাউনলোড..." : "ফটো কার্ড"}</span>
          </button>

          <button
            type="button"
            onClick={handleSocialShare}
            disabled={sharing}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow transition cursor-pointer whitespace-nowrap"
          >
            <HiShare className="text-sm" />
            <span>শেয়ার</span>
          </button>

          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center justify-center gap-1 px-3.5 py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-slate-300 hover:text-white font-bold text-xs transition cursor-pointer shrink-0 whitespace-nowrap"
          >
            <HiArrowPath className="text-sm" />
            <span>অন্য রোল</span>
          </button>
        </div>
      </div>

      {copySuccess && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl text-center font-bold animate-fadeIn">
          🎉 রেজাল্ট লিংক ক্লিপবোর্ডে কপি হয়েছে! এখন ফেসবুক বা মেসেঞ্জারে পেস্ট করে শেয়ার করতে পারেন।
        </div>
      )}

      {/* ===================================================================
          MINIMAL & ACADEMIC EDUCATION-STYLE PHOTO CARD TEMPLATE
          =================================================================== */}
      <div className="flex justify-center">
        <div
          ref={cardRef}
          id="photo-card-export"
          className="w-full max-w-[580px] rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden transition-all border border-slate-700/60 shadow-2xl select-none"
          style={{
            background: "linear-gradient(145deg, #0d1224 0%, #080b18 50%, #060914 100%)",
          }}
        >
          {/* Subtle Academic Dual Border */}
          <div className="absolute inset-2 sm:inset-2.5 rounded-[1.4rem] border border-amber-400/25 pointer-events-none" />
          
          {/* Corner Minimal Accents */}
          <div className="absolute top-4 left-4 w-3.5 h-3.5 border-t-2 border-l-2 border-amber-400/50 pointer-events-none" />
          <div className="absolute top-4 right-4 w-3.5 h-3.5 border-t-2 border-r-2 border-amber-400/50 pointer-events-none" />
          <div className="absolute bottom-4 left-4 w-3.5 h-3.5 border-b-2 border-l-2 border-amber-400/50 pointer-events-none" />
          <div className="absolute bottom-4 right-4 w-3.5 h-3.5 border-b-2 border-r-2 border-amber-400/50 pointer-events-none" />

          {/* CARD CONTENT */}
          <div className="relative z-10 space-y-5 text-center">
            
            {/* Header: Institutional Seal & Title */}
            <div className="space-y-1.5 pt-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-[11px] font-bold tracking-wide">
                <FaGraduationCap className="text-amber-400 text-xs" />
                <span>কিশোরকণ্ঠ পাঠক ফোরাম • সিলেট জেলা পশ্চিম</span>
              </div>

              <h1 className="text-lg sm:text-xl font-black tracking-tight text-white">
                কিশোরকণ্ঠ মেধাবৃত্তি পরীক্ষা — ২০২৫
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-400 font-medium">
                অফিসিয়াল মেধা ফলাফল ও মূল্যায়ন সনদ
              </p>
              
              <div className="w-20 h-0.5 mx-auto bg-gradient-to-r from-transparent via-amber-400/60 to-transparent rounded-full mt-2" />
            </div>

            {/* Academic Award / Merit Honor Strip */}
            <div className="py-1">
              {isPassed ? (
                <div className="p-3.5 sm:p-4 rounded-2xl bg-[#141a33]/90 border border-amber-400/40 shadow-lg space-y-1.5">
                  <span className="text-[10px] sm:text-[11px] font-bold text-amber-300 uppercase tracking-widest block">
                    ★ অর্জন ও মেধা গ্রেড ★
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300">
                    {getBadgeTitle(data.category)}
                  </h2>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700 text-slate-300 text-xs font-semibold">
                  অংশগ্রহণের জন্য ধন্যবাদ
                </div>
              )}
            </div>

            {/* Student Academic Info Table / Grid */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#0a0e1c] border border-white/10 text-left space-y-3">
              {/* Name & Class Row */}
              <div className="flex items-center justify-between gap-3 border-b border-white/[0.08] pb-2.5">
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase tracking-wider">
                    শিক্ষার্থীর নাম
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-white truncate">
                    {data.name}
                  </h3>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase tracking-wider">
                    শ্রেণি
                  </span>
                  <span className="text-xs sm:text-sm font-black text-emerald-400 block font-mono">
                    {data.class}
                  </span>
                </div>
              </div>

              {/* 2-Column Structured Matrix */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block">
                    বৃত্তি রোল নম্বর
                  </span>
                  <span className="font-mono font-bold text-sm sm:text-base text-amber-300">
                    {data.roll}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block">
                    পিতার নাম
                  </span>
                  <span className="font-semibold text-slate-300 truncate block text-[11px] sm:text-xs">
                    {data.father || "—"}
                  </span>
                </div>

                <div className="col-span-2">
                  <span className="text-[10px] text-slate-400 font-semibold block">
                    শিক্ষা প্রতিষ্ঠান
                  </span>
                  <span className="font-bold text-white text-xs sm:text-sm truncate block">
                    {data.school}
                  </span>
                </div>

                {data.upazila && (
                  <div className="col-span-2">
                    <span className="text-[10px] text-slate-400 font-semibold block">
                      উপজেলা / কেন্দ্র
                    </span>
                    <span className="font-semibold text-slate-300 text-xs">
                      {data.upazila}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer: Official Verification & Minimal Institutional Seal */}
            <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between gap-3 text-left">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                  <HiCheckBadge className="text-emerald-400 text-sm" /> অফিসিয়াল সত্যায়িত ফলাফল
                </div>
                <p className="text-[10px] text-slate-400">
                  পরীক্ষা নিয়ন্ত্রক, কিশোরকণ্ঠ মেধাবৃত্তি পরিষদ
                </p>
                <p className="text-[9px] font-mono text-slate-500">
                  ভেরিফাই: kishorkantho.org/search
                </p>
              </div>

              {/* Minimal Seal */}
              <div className="w-14 h-14 rounded-full border border-dashed border-amber-400/50 bg-amber-400/5 flex flex-col items-center justify-center text-center p-0.5 shrink-0">
                <span className="text-[7px] uppercase tracking-tighter text-amber-300 font-black leading-none">
                  SEAL 2025
                </span>
                <span className="text-[8px] font-black text-white leading-none mt-0.5">
                  KKMB
                </span>
                <span className="text-[6px] text-amber-300/80 font-bold leading-none mt-0.5">
                  SYLHET
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Social Media Share Bar - Minimal Sleek Icons */}
      <div className="p-3 sm:p-4 bg-[#14162b] border border-white/10 rounded-2xl shadow-xl flex items-center justify-between gap-3 flex-wrap print:hidden">
        <span className="text-xs font-bold text-slate-300">সোশ্যাল মিডিয়ায় শেয়ার করুন:</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleFacebookShare}
            className="w-9 h-9 rounded-xl bg-blue-600/15 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 flex items-center justify-center text-sm transition cursor-pointer"
            title="Facebook এ শেয়ার করুন"
          >
            <FaFacebookF />
          </button>

          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="w-9 h-9 rounded-xl bg-emerald-500/15 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 border border-emerald-500/30 flex items-center justify-center text-base transition cursor-pointer"
            title="WhatsApp এ পাঠান"
          >
            <FaWhatsapp />
          </button>

          <button
            type="button"
            onClick={handleSocialShare}
            disabled={sharing}
            className="w-9 h-9 rounded-xl bg-indigo-600/15 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 flex items-center justify-center text-base transition cursor-pointer"
            title="লিংক কপি / শেয়ার করুন"
          >
            <HiShare />
          </button>

          <button
            type="button"
            onClick={handleDownloadPhotoCard}
            disabled={downloading}
            className="w-9 h-9 rounded-xl bg-amber-400/15 hover:bg-amber-400 text-amber-300 hover:text-slate-950 border border-amber-400/30 flex items-center justify-center text-sm transition cursor-pointer disabled:opacity-50"
            title="ফটো কার্ড ডাউনলোড করুন"
          >
            <FaDownload />
          </button>

          <button
            type="button"
            onClick={onPrint}
            className="w-9 h-9 rounded-xl bg-white/[0.06] hover:bg-white/[0.15] text-slate-300 hover:text-white border border-white/10 flex items-center justify-center text-base transition cursor-pointer"
            title="স্লিপ প্রিন্ট করুন"
          >
            <HiPrinter />
          </button>
        </div>
      </div>

      {/* Digital Certificate of Merit Modal */}
      <DigitalCertificateModal
        data={data}
        isOpen={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
      />

    </div>
  );
};

export default ResultCard;
