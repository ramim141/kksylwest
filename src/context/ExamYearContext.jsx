import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getImportantDates } from "../services/firestore";

const ExamYearContext = createContext({
  examYear: "২০২৬",
  refreshExamYear: () => {},
});

export const ExamYearProvider = ({ children }) => {
  const [examYear, setExamYear] = useState(() => {
    try {
      const saved = localStorage.getItem("kkmb_important_dates_data");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.examYear) return String(parsed.examYear).trim();
      }
    } catch (e) {}
    return "২০২৬";
  });

  const loadExamYear = useCallback(async () => {
    try {
      const data = await getImportantDates();
      if (data && data.examYear) {
        setExamYear(String(data.examYear).trim());
      }
    } catch (e) {
      console.warn("Failed to load exam year from firestore", e);
    }
  }, []);

  useEffect(() => {
    loadExamYear();

    // Listen for storage events across tabs or local updates
    const handleStorage = (e) => {
      if (e.key === "kkmb_important_dates_data" && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed.examYear) setExamYear(String(parsed.examYear).trim());
        } catch (err) {}
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [loadExamYear]);

  return (
    <ExamYearContext.Provider value={{ examYear, refreshExamYear: loadExamYear }}>
      {children}
    </ExamYearContext.Provider>
  );
};

export const useExamYear = () => {
  const context = useContext(ExamYearContext);
  return context?.examYear || "২০২৬";
};
