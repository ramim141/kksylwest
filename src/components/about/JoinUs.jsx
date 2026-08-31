import React from 'react';
import { 
  HiUserPlus, 
  HiHeart, 
  HiAcademicCap, 
  HiSparkles,
  HiArrowRight,
  HiCheckCircle,
  HiUsers,
  HiHandRaised
} from 'react-icons/hi2';

const JoinUs = () => {
  const benefits = [
    {
      icon: HiAcademicCap,
      title: 'শিক্ষায় অবদান',
      description: 'মেধাবী শিক্ষার্থীদের স্বপ্ন পূরণে সাহায্য করুন',
      gradient: 'from-primary-container to-tertiary-container',
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary'
    },
    {
      icon: HiUsers,
      title: 'সামাজিক নেটওয়ার্ক',
      description: 'একই চিন্তাভাবনার মানুষদের সাথে যুক্ত হোন',
      gradient: 'from-tertiary-container to-tertiary-container',
      iconBg: 'bg-tertiary/10',
      iconColor: 'text-tertiary'
    },
    {
      icon: HiHeart,
      title: 'সেবার সুযোগ',
      description: 'সমাজের উন্নয়নে প্রত্যক্ষ ভূমিকা রাখুন',
      gradient: 'from-tertiary-container to-tertiary-container',
      iconBg: 'bg-tertiary/10',
      iconColor: 'text-tertiary'
    },
    {
      icon: HiSparkles,
      title: 'দক্ষতা উন্নয়ন',
      description: 'নেতৃত্ব ও সংগঠনের অভিজ্ঞতা অর্জন করুন',
      gradient: 'from-secondary-container to-secondary-container',
      iconBg: 'bg-secondary/10',
      iconColor: 'text-secondary'
    }
  ];

  const steps = [
    {
      number: '০১',
      title: 'ফর্ম পূরণ করুন',
      description: 'আপনার তথ্য দিয়ে সদস্যপদ ফর্ম পূরণ করুন'
    },
    {
      number: '০২',
      title: 'অনুমোদন পান',
      description: 'আমাদের টিম আপনার আবেদন যাচাই করবে'
    },
    {
      number: '০৩',
      title: 'যুক্ত হোন',
      description: 'অনুমোদনের পর আপনি সক্রিয় সদস্য হবেন'
    }
  ];

  return (
    <section className="relative py-20 overflow-hidden bg-gradient-to-br from-primary/10 via-tertiary/10 to-tertiary/10">
      
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute rounded-full w-96 h-96 -top-20 -left-20 bg-primary/30 blur-3xl animate-blob"></div>
        <div className="absolute rounded-full w-96 h-96 -bottom-20 -right-20 bg-tertiary/30 blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full top-1/2 left-1/2 w-[600px] h-[600px] bg-tertiary/30 blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="container relative z-10 px-4 mx-auto max-w-7xl">
        
        {/* Section Header */}
        <div className="mb-16 text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 mb-6 text-sm font-bold text-white rounded-full bg-gradient-to-r from-primary-container to-tertiary-container">
            <HiHandRaised className="w-5 h-5" />
            আমাদের সাথে থাকুন
          </div>
          <h2 className="mb-4 text-4xl font-bold text-ink-strong md:text-5xl lg:text-6xl">
            আমাদের সাথে <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-container to-tertiary-container">যুক্ত হোন</span>
          </h2>
          <p className="max-w-3xl mx-auto text-lg text-ink-strong md:text-xl">
            এই গৌরবময় যাত্রার অংশীদার হয়ে পরবর্তী প্রজন্মের মেধাবী শিক্ষার্থীদের স্বপ্ন পূরণে সাহায্য করুন
          </p>
          <div className="w-24 h-1.5 mx-auto mt-6 rounded-full bg-gradient-to-r from-primary-container to-tertiary-container"></div>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 gap-6 mb-16 md:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div
                key={index}
                className="relative p-6 overflow-hidden transition-all duration-500 transform bg-surface-card group rounded-lg hover:shadow-overlay hover:-translate-y-2 hover:scale-105"
              >
                {/* Gradient Background on Hover */}
                <div className={`
                  absolute inset-0 
                  bg-gradient-to-br ${benefit.gradient}
                  opacity-0 group-hover:opacity-100
                  transition-all duration-500
                `}></div>

                {/* Content */}
                <div className="relative z-10">
                  <div className={`
                    inline-flex items-center justify-center w-14 h-14 mb-4 rounded
                    ${benefit.iconBg} ${benefit.iconColor}
                    group-hover:bg-white/20 group-hover:text-white group-hover:scale-110 group-hover:rotate-6 transition-all duration-500
                  `}>
                    <Icon className="w-7 h-7" />
                  </div>
                  
                  <h3 className="mb-2 text-xl font-bold text-ink-strong transition-colors duration-300 group-hover:text-white">
                    {benefit.title}
                  </h3>
                  
                  <p className="text-sm text-ink-muted transition-colors duration-300 group-hover:text-white/90">
                    {benefit.description}
                  </p>
                </div>

                {/* Decorative Corner */}
                <div className="absolute top-0 right-0 w-20 h-20 transition-opacity duration-500 rounded-bl-full opacity-0 bg-gradient-to-br from-white/30 to-transparent group-hover:opacity-100"></div>
              </div>
            );
          })}
        </div>

        {/* Main CTA Card */}
        <div className="relative max-w-5xl p-8 mx-auto overflow-hidden bg-surface-card shadow-overlay md:p-12 rounded-xl">
          
          {/* Gradient Border Glow */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary via-tertiary to-tertiary blur-2xl opacity-20"></div>

          <div className="relative z-10">
            <div className="grid items-center gap-8 lg:grid-cols-2">
              
              {/* Left Side - Steps */}
              <div>
                <h3 className="mb-6 text-2xl font-bold text-ink-strong md:text-3xl">
                  কিভাবে যুক্ত হবেন?
                </h3>
                
                <div className="space-y-6">
                  {steps.map((step, index) => (
                    <div key={index} className="flex gap-4 group">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center w-12 h-12 font-bold text-white transition-all duration-300 bg-gradient-to-br from-primary-container to-tertiary-container rounded group-hover:scale-110">
                          {step.number}
                        </div>
                      </div>
                      <div>
                        <h4 className="mb-1 text-lg font-bold text-ink-strong transition-colors group-hover:text-primary">
                          {step.title}
                        </h4>
                        <p className="text-sm text-ink-muted">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Features List */}
                <div className="p-6 mt-8 border-2 border-primary/25 rounded-lg bg-gradient-to-br from-primary/10 to-tertiary/10">
                  <div className="space-y-3">
                    {['বিনামূল্যে সদস্যপদ', 'সকল কার্যক্রমে অংশগ্রহণ', 'সার্টিফিকেট প্রাপ্তি'].map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <HiCheckCircle className="flex-shrink-0 w-6 h-6 text-primary" />
                        <span className="font-medium text-ink-strong">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Side - CTA */}
              <div className="space-y-6">
                <div className="p-8 text-center border-2 border-dashed border-primary/25 rounded-lg bg-gradient-to-br from-primary/10 to-tertiary/10">
                  <div className="inline-flex items-center justify-center w-20 h-20 mx-auto mb-6 transition-all duration-500 bg-gradient-to-br from-primary-container to-tertiary-container rounded-lg hover:scale-110 hover:rotate-6">
                    <HiUserPlus className="w-10 h-10 text-white" />
                  </div>
                  
                  <h4 className="mb-3 text-2xl font-bold text-ink-strong">
                    স্বেচ্ছাসেবক হন
                  </h4>
                  
                  <p className="mb-6 text-ink-muted">
                    আজই আমাদের সাথে যুক্ত হয়ে সমাজ পরিবর্তনের অংশীদার হোন
                  </p>
                  
                  <button className="inline-flex items-center gap-2 px-8 py-4 font-bold text-white transition-all transform bg-gradient-to-r from-primary-container to-tertiary-container rounded hover:shadow-overlay hover:-translate-y-1 hover:scale-105 group">
                    <span>এখনই যুক্ত হোন</span>
                    <HiArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>

                {/* Contact Info */}
                <div className="p-6 text-center bg-surface-card border-2 border-line-soft rounded-lg">
                  <p className="mb-4 text-sm font-semibold text-ink-strong">
                    আরও তথ্যের জন্য যোগাযোগ করুন
                  </p>
                  <div className="space-y-2 text-sm text-ink-muted">
                    <p>📧 kishorkanthasylwest@gmail.com</p>
                    <p>📞 +880 1711-000000</p>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute w-32 h-32 rounded-full bg-primary/15 -top-16 -left-16 opacity-30 blur-2xl"></div>
          <div className="absolute w-32 h-32 bg-tertiary/15 rounded-full -bottom-16 -right-16 opacity-30 blur-2xl"></div>
        </div>

        {/* Bottom Stats */}
        <div className="grid grid-cols-2 gap-4 mt-12 md:grid-cols-4 md:gap-6">
          {[
            { number: '৫০০+', label: 'সক্রিয় স্বেচ্ছাসেবক' },
            { number: '১০০+', label: 'বার্ষিক কার্যক্রম' },
            { number: '৩৬০০০+', label: 'উপকৃত শিক্ষার্থী' },
            { number: '৩২+', label: 'বছরের অভিজ্ঞতা' }
          ].map((stat, index) => (
            <div
              key={index}
              className="p-6 text-center transition-all duration-300 transform bg-surface-card rounded-lg hover:shadow-overlay hover:-translate-y-1"
            >
              <div className="mb-2 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-container to-tertiary-container">
                {stat.number}
              </div>
              <div className="text-sm font-semibold text-ink-muted">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default JoinUs;
