import React, { useState } from 'react';
import { 
  HiPhone, 
  HiEnvelope, 
  HiMapPin, 
  HiUser,
  HiChatBubbleBottomCenterText,
  HiPaperAirplane,
  HiClock,
  HiBuildingOffice2,
  HiSparkles,
  HiArrowRight,
  HiCheckCircle,
  HiShare,
  HiGlobeAsiaAustralia
} from 'react-icons/hi2';
import { FaFacebookF, FaYoutube, FaWhatsapp } from 'react-icons/fa';
import { sendMessage } from '../services/firestore';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await sendMessage(formData);
      setSubmitStatus('success');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      console.error(err);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSubmitStatus(null), 5000);
    }
  };

  const handleMapClick = () => {
    window.open('https://www.google.com/maps/place/%E0%A6%A8%E0%A6%BF%E0%A7%9F%E0%A6%BE%E0%A6%AE%E0%A6%BE%E0%A6%B9%E0%A7%8D+%E0%A6%9F%E0%A6%BE%E0%A6%93%E0%A7%9F%E0%A6%BE%E0%A6%B0/@24.8675259,91.8568155,3a,58.7y,328.4h,97.45t/data=!3m7!1e1!3m5!1s8ShZkYe5d5Zj1Y7NIyFkEw!2e0!6shttps:%2F%2Fstreetviewpixels-pa.googleapis.com%2Fv1%2Fthumbnail%3Fcb_client%3Dmaps_sv.tactile%26w%3D900%26h%3D600%26pitch%3D-7.448823858365202%26panoid%3D8ShZkYe5d5Zj1Y7NIyFkEw%26yaw%3D328.39724145102605!7i16384!8i8192!4m6!3m5!1s0x3751aae9f370e6b3:0x130316da9abdf5cb!8m2!3d24.8676891!4d91.8565573!16s%2Fg%2F11bzrhtlft?entry=ttu&g_ep=EgoyMDI1MTIwMi4wIKXMDSoASAFQAw%3D%3D', '_blank');
  };

  return (
    <div className="min-h-screen bg-[#0b1326] text-white">
      
      {/* 1. Header Hero Banner */}
      <section className="relative w-full px-3 sm:px-6 pt-14 sm:pt-20 pb-12 sm:pb-16 bg-[#0f1124] border-b border-white/[0.08] overflow-hidden">
        {/* Glowing Ambient Blobs */}
        <div className="pointer-events-none absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto relative z-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-xs sm:text-sm font-extrabold backdrop-blur-md shadow-sm">
            <HiSparkles className="text-amber-400 text-base" />
            <span>২৪/৭ যোগাযোগ ও সাপোর্ট ডেস্ক • Contact & Support</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            আমাদের সাথে <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400">
              যোগাযোগ করুন
            </span>
          </h1>

          <p className="text-xs sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            আপনার যেকোনো প্রশ্ন, মেধা সংক্রান্ত পরামর্শ, বৃত্তি ফলাফল বা সহায়তার জন্য আমরা সবসময় প্রস্তুত।
          </p>
        </div>
      </section>

      {/* 2. Quick Contact Cards Dock */}
      <div className="w-full px-3 sm:px-6 -mt-8 relative z-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          
          {/* Phone Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#14162b] border border-emerald-500/30 hover:border-emerald-400/60 shadow-2xl transition-all duration-300 hover:-translate-y-1 text-center space-y-4 group">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-3xl mx-auto group-hover:scale-110 transition-transform shadow-md">
              <HiPhone />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">সরাসরি ফোন করুন</h3>
              <p className="text-lg sm:text-xl font-black text-emerald-400 font-mono">০১৯৬২-৬৩৩৬৬২</p>
              <p className="text-xs text-slate-400">সকাল ১১:০০ টা - রাত ৮:০০ টা</p>
            </div>
            <a
              href="tel:+8801962633662"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition hover:scale-105 active:scale-95"
            >
              <span>এখনই কল করুন</span>
              <HiArrowRight className="text-sm" />
            </a>
          </div>

          {/* Email Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#14162b] border border-sky-500/30 hover:border-sky-400/60 shadow-2xl transition-all duration-300 hover:-translate-y-1 text-center space-y-4 group">
            <div className="w-14 h-14 rounded-2xl bg-sky-500/15 text-sky-400 border border-sky-500/30 flex items-center justify-center text-3xl mx-auto group-hover:scale-110 transition-transform shadow-md">
              <HiEnvelope />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">ইমেইল পাঠান</h3>
              <p className="text-xs sm:text-sm font-black text-sky-400 font-mono break-all">kishorkanthasylwest@gmail.com</p>
              <p className="text-xs text-slate-400">যেকোনো তথ্য ও সহায়তার জন্য</p>
            </div>
            <a
              href="https://mail.google.com/mail/?view=cm&fs=1&to=kishorkanthasylwest@gmail.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 text-xs font-bold transition hover:scale-105 active:scale-95"
            >
              <span>ইমেইল লিখুন</span>
              <HiArrowRight className="text-sm" />
            </a>
          </div>

          {/* Location Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#14162b] border border-amber-500/30 hover:border-amber-400/60 shadow-2xl transition-all duration-300 hover:-translate-y-1 text-center space-y-4 group">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center text-3xl mx-auto group-hover:scale-110 transition-transform shadow-md">
              <HiMapPin />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">আমাদের কার্যালয়</h3>
              <p className="text-xs sm:text-sm font-semibold text-slate-200">নিয়ামাহ্ টাওয়ার (২য় তলা)</p>
              <p className="text-xs text-slate-400">চন্ডিপুল, দক্ষিণ সুরমা, সিলেট-৩১০০</p>
            </div>
            <button
              onClick={handleMapClick}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-bold transition hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>গুগল ম্যাপে দেখুন</span>
              <HiArrowRight className="text-sm" />
            </button>
          </div>

        </div>
      </div>

      {/* 3. Contact Form & Info Sidebar Section */}
      <section className="w-full px-3 sm:px-6 py-14 sm:py-20 bg-[#0b1326] border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          
          {/* Contact Form (7 cols) */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-10 rounded-3xl bg-[#14162b] border border-white/10 shadow-2xl space-y-6">
              
              <div className="space-y-2 border-b border-white/[0.08] pb-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-300 text-xs font-bold">
                  <HiChatBubbleBottomCenterText />
                  <span>সরাসরি বার্তা পাঠান</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white">
                  আপনার বার্তা <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400">আমাদের লিখুন</span>
                </h2>
                <p className="text-xs text-slate-400">আমরা অতি দ্রুত আপনার বার্তার উত্তর দেওয়ার চেষ্টা করব।</p>
              </div>

              {submitStatus === 'success' && (
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm font-bold content-swap">
                  <HiCheckCircle className="text-xl shrink-0" />
                  <span>আপনার বার্তা সফলভাবে পাঠানো হয়েছে! শীঘ্রই যোগাযোগ করা হবে।</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <HiUser className="text-indigo-400" />
                      <span>আপনার নাম</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="পুরো নাম লিখুন"
                      className="w-full px-4 py-3 bg-[#090a16] border border-white/15 rounded-xl text-xs sm:text-sm font-semibold text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <HiEnvelope className="text-indigo-400" />
                      <span>ইমেইল ঠিকানা</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="example@mail.com"
                      className="w-full px-4 py-3 bg-[#090a16] border border-white/15 rounded-xl text-xs sm:text-sm font-semibold text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <HiPhone className="text-indigo-400" />
                      <span>মোবাইল নম্বর</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="০১৭XXXXXXXX"
                      className="w-full px-4 py-3 bg-[#090a16] border border-white/15 rounded-xl text-xs sm:text-sm font-semibold text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <HiSparkles className="text-indigo-400" />
                      <span>বার্তার বিষয়</span>
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      placeholder="যেমন: বৃত্তি সংক্রান্ত প্রশ্ন"
                      className="w-full px-4 py-3 bg-[#090a16] border border-white/15 rounded-xl text-xs sm:text-sm font-semibold text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-400"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <HiChatBubbleBottomCenterText className="text-indigo-400" />
                    <span>বিস্তারিত বার্তা</span>
                  </label>
                  <textarea
                    rows={4}
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    placeholder="আপনার বার্তা বিস্তারিত লিখুন..."
                    className="w-full px-4 py-3 bg-[#090a16] border border-white/15 rounded-xl text-xs sm:text-sm font-semibold text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-400 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 cursor-pointer press disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 rounded-full border-white/40 border-t-white animate-spin" />
                      <span>পাঠানো হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <HiPaperAirplane className="text-base" />
                      <span>বার্তা পাঠান</span>
                    </>
                  )}
                </button>
              </form>

            </div>
          </div>

          {/* Contact Info Sidebar (5 cols) */}
          <div className="lg:col-span-5 space-y-5 sm:space-y-6">
            
            {/* Office Hours */}
            <div className="p-6 rounded-3xl bg-[#14162b] border border-white/10 shadow-xl space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center text-2xl">
                  <HiClock />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">অফিস সময়সূচি</h4>
                  <p className="text-xs text-slate-400">শনিবার থেকে বৃহস্পতিবার</p>
                </div>
              </div>
              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs sm:text-sm">
                <span className="text-slate-300">কার্যদিবস</span>
                <span className="font-bold text-amber-400">বিকাল ২:০০ - রাত ৮:০০</span>
              </div>
            </div>

            {/* Address Info */}
            <div className="p-6 rounded-3xl bg-[#14162b] border border-white/10 shadow-xl space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-2xl">
                  <HiBuildingOffice2 />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">অফিশিয়াল ঠিকানা</h4>
                  <p className="text-xs text-slate-400">কিশোরকণ্ঠ পাঠক ফোরাম সিলেট জেলা পশ্চিম</p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-2 border-t border-white/5">
                অস্থায়ী কার্যালয়: নিয়ামাহ্ টাওয়ার (২য় তলা), চন্ডিপুল, দক্ষিণ সুরমা, সিলেট-৩১০০
              </p>
            </div>

            {/* Social Media Connect */}
            <div className="p-6 rounded-3xl bg-[#14162b] border border-white/10 shadow-xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 flex items-center justify-center text-2xl">
                  <HiShare />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">সোশ্যাল মিডিয়ায় যুক্ত থাকুন</h4>
                  <p className="text-xs text-slate-400">সর্বশেষ আপডেট ও লাইভ নোটিফিকেশন পেতে</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 sm:gap-3 pt-2">
                <a
                  href="https://www.facebook.com/kishorkanthasylwest"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Facebook"
                  className="flex-1 py-2.5 sm:py-3 rounded-xl bg-[#1877f2]/15 hover:bg-[#1877f2]/25 border border-[#1877f2]/30 text-[#1877f2] text-xs font-bold flex items-center justify-center gap-2 transition hover:scale-105"
                >
                  <FaFacebookF className="text-base sm:text-sm" />
                  <span className="hidden sm:inline">Facebook</span>
                </a>

                <a
                  href="https://wa.me/8801962633662"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="WhatsApp"
                  className="flex-1 py-2.5 sm:py-3 rounded-xl bg-[#25d366]/15 hover:bg-[#25d366]/25 border border-[#25d366]/30 text-[#25d366] text-xs font-bold flex items-center justify-center gap-2 transition hover:scale-105"
                >
                  <FaWhatsapp className="text-base sm:text-sm" />
                  <span className="hidden sm:inline">WhatsApp</span>
                </a>

                <a
                  href="https://www.youtube.com/@kishorkanthasylwest"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="YouTube"
                  className="flex-1 py-2.5 sm:py-3 rounded-xl bg-[#ff0000]/15 hover:bg-[#ff0000]/25 border border-[#ff0000]/30 text-[#ff0000] text-xs font-bold flex items-center justify-center gap-2 transition hover:scale-105"
                >
                  <FaYoutube className="text-base sm:text-sm" />
                  <span className="hidden sm:inline">YouTube</span>
                </a>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 4. Google Maps Section */}
      <section className="w-full px-3 sm:px-6 py-14 sm:py-20 bg-[#0f1124]">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <HiMapPin className="text-emerald-400" />
                <span>আমাদের ভৌগোলিক অবস্থান</span>
              </h3>
              <p className="text-xs text-slate-400">নিয়ামাহ্ টাওয়ার, চন্ডিপুল, দক্ষিণ সুরমা, সিলেট</p>
            </div>
            <button
              onClick={handleMapClick}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition cursor-pointer self-start sm:self-auto"
            >
              <span>Google Maps এ খুলুন</span>
              <HiArrowRight />
            </button>
          </div>

          <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl h-[380px] sm:h-[450px] relative bg-black/40">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3618.9451396523!2d91.87041!3d24.89975!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x375054d3d270329f%3A0xf58ef93431f67382!2sBandar%20Bazar%2C%20Sylhet!5e0!3m2!1sen!2sbd!4v1699000000000!5m2!1sen!2sbd"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Kishorekantha Office Location"
              className="w-full h-full filter invert-[0.88] hue-rotate-180 contrast-[1.1] opacity-90"
            />
          </div>
        </div>
      </section>

    </div>
  );
};

export default Contact;