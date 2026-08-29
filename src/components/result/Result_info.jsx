"use client"

const Result_info = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-surface-card via-surface-card to-tertiary/30 px-4 py-12">
      <div className="max-w-4xl w-full">
        {/* Main Card */}
        <div className="bg-surface-card rounded-xl shadow-overlay border-2 border-primary/25 overflow-hidden">
          {/* Header with Gradient */}
          <div className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-surface-card to-surface-card border-b border-primary/25 px-8 py-12 md:py-16">
            {/* Animated Background Orbs */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-tertiary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            {/* Icon */}
            <div className="relative z-10 flex justify-center mb-6">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-overlay">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>

            {/* Title */}
            <h1 className="relative z-10 text-3xl md:text-4xl lg:text-5xl font-bold text-center text-white mb-3 drop-shadow-lg">
              কিশোরকণ্ঠ মেধাবৃত্তি ২০২৫
            </h1>
            <div className="relative z-10 flex justify-center">
              <span className="inline-block px-6 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-sm font-semibold text-white">
                ফলাফল প্রকাশের তারিখ
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="px-4 sm:px-6 md:px-8 py-8 md:py-12">
            {/* Announcement Box */}
            <div className="bg-gradient-to-br from-primary/10 to-tertiary/10 border-2 border-primary/25 rounded-lg p-4 sm:p-6 md:p-8 mb-6 md:mb-8">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-primary-container to-tertiary-container rounded flex items-center justify-center">
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-ink-strong leading-relaxed">
                    কিশোরকণ্ঠ মেধাবৃত্তি ২০২৫ এর রেজাল্ট আগামী <span className="text-primary">১৩ ডিসেম্বর ২০২৫</span> সকাল <span className="text-primary">সকাল ১০:৩০ টায়</span> প্রকাশ করা হবে।
                  </h2>
                </div>
              </div>
            </div>

            {/* Date & Time Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
              {/* Date */}
              <div className="bg-gradient-to-br from-tertiary/10 to-tertiary/10 border-2 border-tertiary/25 rounded-lg p-5 md:p-6 text-center">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-tertiary-container to-tertiary-container rounded flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <svg className="w-6 h-6 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-xs sm:text-sm text-ink-muted mb-1 md:mb-2 font-semibold">তারিখ</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-ink-strong">১৩ ডিসেম্বর ২০২৫</p>
              </div>

              {/* Time */}
              <div className="bg-gradient-to-br from-tertiary/10 to-tertiary/10 border-2 border-tertiary/25 rounded-lg p-5 md:p-6 text-center">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-tertiary-container to-tertiary-container rounded flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <svg className="w-6 h-6 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-xs sm:text-sm text-ink-muted mb-1 md:mb-2 font-semibold">সময়</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-ink-strong">সকাল ১০:৩০ টা</p>
              </div>
            </div>

            {/* Note */}
            <div className="bg-gradient-to-r from-secondary/10 to-secondary/10 border-l-4 border-secondary/40 rounded p-4 md:p-6">
              <div className="flex items-start gap-2 sm:gap-3">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-secondary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-xs sm:text-sm md:text-base text-ink-strong font-medium leading-relaxed">
                  দয়া করে নির্ধারিত তারিখ ও সময়ে আবার ভিজিট করুন। ফলাফল ঠিক সময়মতো প্রকাশ করা হবে।
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gradient-to-r from-surface-card to-surface-card px-4 sm:px-6 md:px-8 py-4 md:py-6 border-t-2 border-line-soft">
            <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-ink-muted">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold">সকল তথ্য সঠিক এবং যাচাইকৃত</span>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 md:mt-8 text-center px-4">
          <p className="text-xs sm:text-sm text-ink-muted">
            আরও তথ্যের জন্য <a href="/scholarship" className="text-primary hover:text-primary font-semibold underline">স্কলারশিপ পেজ</a> দেখুন
          </p>
        </div>
      </div>
    </div>
  )
}

export default Result_info
