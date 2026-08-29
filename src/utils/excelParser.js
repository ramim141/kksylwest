import * as XLSX from "xlsx";

/**
 * Parses an Excel (.xlsx / .xls) or CSV file in the browser
 * and normalizes the columns into standard student result objects.
 */
export const parseExcelResults = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });

        // First sheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Convert to raw JSON rows
        const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

        if (!rawRows || rawRows.length === 0) {
          throw new Error("এক্সেল ফাইলে কোনো ডাটা পাওয়া যায়নি!");
        }

        // Normalize each row
        const normalizedResults = rawRows
          .map((row, index) => {
            const normalized = normalizeRow(row, index);
            return normalized;
          })
          .filter((item) => item.roll); // Filter out rows with no roll

        resolve(normalizedResults);
      } catch (error) {
        console.error("Excel parse error:", error);
        reject(error);
      }
    };

    reader.onerror = (error) => {
      reject(new Error("ফাইলটি পড়তে ব্যর্থ হয়েছে!"));
    };

    reader.readAsArrayBuffer(file);
  });
};

/**
 * Normalizes keys regardless of column naming (English/Bangla)
 */
const normalizeRow = (row, index) => {
  const result = {
    roll: "",
    name: "",
    father: "",
    school: "",
    class: "",
    category: "সাধারণ",
    year: new Date().getFullYear().toString(),
  };

  for (const [key, value] of Object.entries(row)) {
    const cleanKey = key.toString().trim().toLowerCase();
    const strVal = value !== undefined && value !== null ? value.toString().trim() : "";

    // Roll matching
    if (
      cleanKey.includes("roll") ||
      cleanKey.includes("রোল") ||
      cleanKey === "id" ||
      cleanKey === "roll_no" ||
      cleanKey === "roll no"
    ) {
      result.roll = strVal;
    }
    // Name matching
    else if (
      cleanKey.includes("name") ||
      cleanKey.includes("নাম") ||
      cleanKey.includes("student")
    ) {
      result.name = strVal;
    }
    // Father matching
    else if (
      cleanKey.includes("father") ||
      cleanKey.includes("পিতা") ||
      cleanKey.includes("বাবার") ||
      cleanKey.includes("parent")
    ) {
      result.father = strVal;
    }
    // School matching
    else if (
      cleanKey.includes("school") ||
      cleanKey.includes("স্কুল") ||
      cleanKey.includes("প্রতিষ্ঠান") ||
      cleanKey.includes("institution") ||
      cleanKey.includes("madrasa") ||
      cleanKey.includes("মাদ্রাসা")
    ) {
      result.school = strVal;
    }
    // Class matching
    else if (
      cleanKey.includes("class") ||
      cleanKey.includes("শ্রেণি") ||
      cleanKey.includes("শ্রেণী") ||
      cleanKey.includes("grade")
    ) {
      result.class = strVal;
    }
    // Category matching
    else if (
      cleanKey.includes("category") ||
      cleanKey.includes("ক্যাটাগরি") ||
      cleanKey.includes("বিভাগ") ||
      cleanKey.includes("type") ||
      cleanKey.includes("বৃত্তি")
    ) {
      result.category = strVal;
    }
    // Year matching
    else if (
      cleanKey.includes("year") ||
      cleanKey.includes("সাল") ||
      cleanKey.includes("বছর") ||
      cleanKey.includes("session")
    ) {
      result.year = strVal;
    }
  }

  // Fallback defaults
  if (!result.class) result.class = "৪র্থ";
  if (!result.category) result.category = "সাধারণ";

  return result;
};
