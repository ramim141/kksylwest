import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getImportantDates } from "../services/firestore";

const LOCAL_KEY = "kkmb_important_dates_data";

const DEFAULTS = {
  examYear: "২০২৬",
  /* Empty until the admin picks a session to display, and false until the
     results are announced. Defaulting the other way would put an unreviewed
     leaderboard on the public site the moment a year's results were
     uploaded, which is exactly the accident these two settings exist to
     prevent. */
  meritListYear: "",
  resultsPublished: false,
};

/* All three live on the same site_settings/important_dates document, so
   reading them together costs what reading the exam year alone used to. */
const pick = (data) => ({
  examYear: data?.examYear ? String(data.examYear).trim() : DEFAULTS.examYear,
  meritListYear:
    data?.meritListYear != null
      ? String(data.meritListYear).trim()
      : DEFAULTS.meritListYear,
  resultsPublished: data?.resultsPublished === true,
});

const ExamYearContext = createContext({
  ...DEFAULTS,
  refreshExamYear: () => {},
});

export const ExamYearProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_KEY);
      if (saved) return pick(JSON.parse(saved));
    } catch {
      // A malformed cache is not worth a blank page; the fetch below fixes it.
    }
    return DEFAULTS;
  });

  const loadSettings = useCallback(async () => {
    try {
      const data = await getImportantDates();
      if (data) setSettings(pick(data));
    } catch (e) {
      console.warn("Failed to load exam settings from firestore", e);
    }
  }, []);

  useEffect(() => {
    loadSettings();

    // Listen for storage events across tabs or local updates
    const handleStorage = (e) => {
      if (e.key === LOCAL_KEY && e.newValue) {
        try {
          setSettings(pick(JSON.parse(e.newValue)));
        } catch {
          // Ignore a half-written value; the next load settles it.
        }
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [loadSettings]);

  return (
    <ExamYearContext.Provider value={{ ...settings, refreshExamYear: loadSettings }}>
      {children}
    </ExamYearContext.Provider>
  );
};

/* Kept returning a bare string: a dozen components render it inline and none
   of them care about the rest of the document. */
export const useExamYear = () => {
  const context = useContext(ExamYearContext);
  return context?.examYear || DEFAULTS.examYear;
};

/** What the public is allowed to see of the results, and for which session. */
export const useResultVisibility = () => {
  const context = useContext(ExamYearContext);
  return {
    examYear: context?.examYear || DEFAULTS.examYear,
    meritListYear: context?.meritListYear || "",
    resultsPublished: context?.resultsPublished === true,
  };
};
