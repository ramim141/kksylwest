import React from 'react';

// ============= ICON COMPONENTS =============
export const BookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
  </svg>
);

export const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
  </svg>
);

export const TrophyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0V5.625a2.25 2.25 0 11-4.5 0v7.125M12 3.75v-1.5" />
  </svg>
);

export const ClipboardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
  </svg>
);

export const WarningIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="flex-shrink-0 w-6 h-6 mt-1 text-secondary">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
  </svg>
);

export const DocumentIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);

// ============= SUB COMPONENTS =============
export const Badge = ({ text }) => (
  <div className="inline-flex items-center px-4 py-2 mb-4 text-sm font-medium rounded-full bg-primary/10 text-primary">
    <span className="w-2 h-2 mr-2 rounded-full bg-primary-container"></span>
    {text}
  </div>
);

export const SectionHeader = ({ title, subtitle }) => (
  <div className="mb-12 text-center">
    <Badge text="মেধাবৃত্তি তথ্য" />
    <h1 className="mb-4 text-4xl font-bold text-ink-strong md:text-5xl">
      {title} <span className="text-primary">২০২৫</span>
    </h1>
    <p className="max-w-3xl mx-auto text-lg text-ink-muted">{subtitle}</p>
  </div>
);

export const CardIcon = ({ Icon, bgColor, textColor }) => (
  <div className={`flex items-center justify-center w-12 h-12 rounded ${bgColor} ${textColor}`}>
    <Icon />
  </div>
);

export const InfoItem = ({ label, value, dotColor = 'bg-primary-container' }) => (
  <div className="flex items-start">
    <span className={`flex-shrink-0 w-2 h-2 mt-2 rounded-full ${dotColor}`}></span>
    <div className="ml-4">
      <p className="font-semibold text-ink-strong">{label}</p>
      <p className="text-ink-muted">{value}</p>
    </div>
  </div>
);

export const StepItem = ({ step, label, value }) => (
  <div className="flex items-start">
    <span className="flex items-center justify-center flex-shrink-0 w-6 h-6 mt-1 text-xs font-bold text-white rounded-full bg-tertiary-container">
      {step}
    </span>
    <div className="ml-4">
      <p className="font-semibold text-ink-strong">{label}</p>
      <p className="text-ink-muted">{value}</p>
    </div>
  </div>
);

export const InfoCard = ({ Icon, title, items, bgColor, textColor, dotColor, ItemComponent = InfoItem }) => (
  <div className="p-8 transition-all duration-300 bg-surface-card border border-line-soft rounded-lg hover:shadow-overlay">
    <div className="flex items-center mb-6">
      <CardIcon Icon={Icon} bgColor={bgColor} textColor={textColor} />
      <h2 className="ml-4 text-2xl font-bold text-ink-strong">{title}</h2>
    </div>
    <div className="space-y-4">
      {items.map((item, index) => (
        ItemComponent === StepItem ? (
          <ItemComponent key={index} {...item} />
        ) : (
          <ItemComponent key={index} {...item} dotColor={dotColor} />
        )
      ))}
    </div>
  </div>
);

export const WarningBox = ({ title, message }) => (
  <div className="p-6 mb-12 border-l-4 rounded bg-secondary/10 border-secondary/40">
    <div className="flex items-start">
      <WarningIcon />
      <div className="ml-4">
        <h3 className="mb-2 text-lg font-bold text-secondary">{title}</h3>
        <p className="text-secondary">{message}</p>
      </div>
    </div>
  </div>
);
