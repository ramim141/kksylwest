import React, { useState } from 'react';
import { HiPhone, HiEnvelope, HiSparkles, HiXMark, HiCheckCircle, HiClipboard } from 'react-icons/hi2';

const Contact = () => {
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const emailAddress = 'kishorkanthasylwest@gmail.com';

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(emailAddress);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <section className="relative w-full px-3 sm:px-6 py-12 sm:py-16 bg-[#0f1124] text-white">
      <div className="max-w-7xl mx-auto">
        
        {/* Contact Helpline Banner Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950/40 via-[#14162b] to-[#14162b] border border-indigo-500/30 p-8 sm:p-12 shadow-2xl text-center space-y-6">
          
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-xs font-bold uppercase tracking-wider">
            <HiSparkles className="text-amber-400 text-sm" />
            <span>২৪/৭ হেল্পডেস্ক ও সহায়তা</span>
          </div>

          <div className="space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-4xl font-black text-white">
              মেধাবৃত্তি সংক্রান্ত যেকোনো প্রয়োজনে <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400">
                আমাদের সাথে যোগাযোগ করুন
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              রেজিস্ট্রেশন, পরীক্ষার কেন্দ্র বা সিলেবাস সংক্রান্ত যেকোনো তথ্যের জন্য সরাসরি কল বা ইমেইল করুন।
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <a
              href="tel:01723147946"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-500/25 transition hover:scale-105 active:scale-95 cursor-pointer"
            >
              <HiPhone className="text-base" />
              <span>সরাসরি কল করুন (০১৭২৩-১৪৭৯৪৬)</span>
            </a>

            <button
              onClick={() => setIsEmailModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/10 text-white font-bold text-xs sm:text-sm backdrop-blur-md transition hover:scale-105 active:scale-95 cursor-pointer"
            >
              <HiEnvelope className="text-base text-emerald-400" />
              <span>ইমেইল পাঠান</span>
            </button>
          </div>

        </div>

      </div>

      {/* Email Modal */}
      {isEmailModalOpen && (
        <div
          onClick={() => setIsEmailModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 cursor-pointer bg-black/80 backdrop-blur-md backdrop-enter"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-[#14162b] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center overlay-enter"
          >
            {/* Close Button */}
            <button
              onClick={() => setIsEmailModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-white/[0.06] hover:bg-rose-600 transition cursor-pointer"
            >
              <HiXMark className="text-lg" />
            </button>

            {/* Icon */}
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 flex items-center justify-center text-3xl mx-auto shadow-md">
              <HiEnvelope />
            </div>

            {/* Title */}
            <div className="space-y-1">
              <h3 className="text-lg sm:text-xl font-bold text-white">
                আমাদের অফিসিয়াল ইমেইল
              </h3>
              <p className="text-xs text-slate-400">নিচের ইমেইলটি কপি করে সরাসরি বার্তা পাঠান</p>
            </div>

            {/* Email Box */}
            <div className="p-3.5 rounded-xl bg-[#090a16] border border-white/10 text-emerald-400 font-mono text-sm break-all font-bold">
              {emailAddress}
            </div>

            {/* Copy Button */}
            <button
              onClick={handleCopyEmail}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 transition cursor-pointer"
            >
              {isCopied ? (
                <>
                  <HiCheckCircle className="text-base text-emerald-400" />
                  <span>ইমেইল কপি হয়েছে!</span>
                </>
              ) : (
                <>
                  <HiClipboard className="text-base" />
                  <span>ইমেইল অ্যাড্রেস কপি করুন</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default Contact;
