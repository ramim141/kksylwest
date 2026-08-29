import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import SearchForm from "./SearchForm";
import ResultCard from "./ResultCard";
import { searchResultByRoll } from "../../services/firestore";
import { SkeletonRegion, SkeletonResultCard } from "../common";

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [inputRoll, setInputRoll] = useState(searchParams.get("roll") || "");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const performSearch = async (rollToSearch) => {
    const cleanRoll = rollToSearch.trim();
    if (!cleanRoll) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const student = await searchResultByRoll(cleanRoll);
      if (student) {
        setResult(student);
        // Save to recent searches
        try {
          const prev = JSON.parse(
            localStorage.getItem("kkmb_recent_search_rolls") || "[]"
          );
          const updated = [cleanRoll, ...prev.filter((r) => r !== cleanRoll)].slice(
            0,
            5
          );
          localStorage.setItem(
            "kkmb_recent_search_rolls",
            JSON.stringify(updated)
          );
        } catch {}
      } else {
        setError(
          "দুঃখিত! এই রোল/ট্র্যাকিং আইডির বিপরীতে মেধাবৃত্তির কোনো ফলাফল পাওয়া যায়নি।"
        );
      }
    } catch (err) {
      console.error(err);
      setError("ফলাফল লোড করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  // Auto search on query parameter
  useEffect(() => {
    const queryRoll = searchParams.get("roll");
    if (queryRoll) {
      setInputRoll(queryRoll);
      performSearch(queryRoll);
    }
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!inputRoll.trim()) return;
    setSearchParams({ roll: inputRoll.trim() });
    performSearch(inputRoll);
  };

  const handlePrint = () => window.print();

  const resetSearch = () => {
    setResult(null);
    setInputRoll("");
    setSearchParams({});
  };

  return (
    <div className="relative min-h-[calc(100vh-140px)] bg-[#0b1326] text-white flex flex-col items-center justify-start w-full px-3 sm:px-6 lg:px-8 py-10 sm:py-16 overflow-hidden">
      {/* Background Decorative Ambient Blobs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-500/10 via-emerald-500/10 to-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -z-10"></div>

      <div className="flex flex-col items-center w-full max-w-5xl gap-8">
        {!result && (
          <SearchForm
            onSearch={handleSearch}
            inputRoll={inputRoll}
            setInputRoll={setInputRoll}
            loading={loading}
            error={error}
          />
        )}

        {/* The marksheet is heavy; a card-shaped placeholder holds its
            footprint so the page does not jump when the data lands. */}
        {loading && !result && (
          <SkeletonRegion
            label="ফলাফল খোঁজা হচ্ছে"
            className="flex justify-center w-full"
          >
            <SkeletonResultCard />
          </SkeletonRegion>
        )}

        {result && (
          <div className="w-full content-swap">
            <ResultCard
              data={result}
              onPrint={handlePrint}
              onReset={resetSearch}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
