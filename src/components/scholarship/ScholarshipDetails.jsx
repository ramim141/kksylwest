import React from 'react';
import ScholarshipHero from './ScholarshipHero';
import ApplicationProcess from './ApplicationProcess';
import Syllabus from './Syllabus';
import FormSubmit from './FormSubmit';
import Contact from './Contact';

// ============= MAIN COMPONENT =============
const ScholarshipDetails = () => {
  return (
    <div className="w-full min-h-screen bg-[#0b1326] text-white">
      {/* Header & Info Cards */}
      <ScholarshipHero />

      {/* Step by Step Application Process */}
      <ApplicationProcess />

      {/* Class 4 to 10 Syllabus */}
      <Syllabus />

      {/* Form Submission Guidelines */}
      <FormSubmit />

      {/* Helpdesk & Contact */}
      <Contact />
    </div>
  );
};

export default ScholarshipDetails;
