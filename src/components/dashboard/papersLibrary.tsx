"use client";

import { memo, useState } from "react";
import {
  Search,
  FileText,
  Calendar,
  Users,
  ExternalLink,
  Download,
  Library,
  Sparkles,
} from "lucide-react";
import { searchPapers } from "@/api/papersApi";
import { paper } from "./workspace/types";

const PaperLibrary = memo(function PaperLibrary() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [cache, setCache] = useState<Record<string, typeof results>>({});

  const handleSearch = async (
    e: React.FormEvent<HTMLFormElement> | null,
    page: number = 1,
  ): Promise<void> => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setHasSearched(true);
    setCurrentPage(page);

    // Check cache first
    const cacheKey = `${searchQuery}-${page}`;
    if (cache[cacheKey]) {
      setResults(cache[cacheKey]);
      // Scroll to top for cached results
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Only show loading if we need to fetch
    setIsLoading(true);

    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });

    try {
      const data = await searchPapers(searchQuery, page);

      if (data.results) {
        setResults(data.results);
        // Store in cache
        setCache((prev: Record<string, typeof data.results>) => ({
          ...prev,
          [cacheKey]: data.results,
        }));
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error("Error searching papers:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 w-full max-w-4xl mx-auto text-black dark:text-white min-h-screen flex flex-col gap-5">
      {/* Header */}
      {/* <div className="flex flex-col">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Access millions of open-access research papers.
        </p>
      </div> */}

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by topic, author, or ID..."
            className="w-full pl-10 pr-3 py-2.5 bg-white dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-70 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          Search
        </button>
      </form>

      {/* Content Area */}
      <div className="flex flex-col gap-3 flex-1">
        {/* 1. INITIAL STATE (Before searching) */}
        {!hasSearched && (
          // border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50/30 dark:bg-zinc-900/10
          <div className="flex flex-col items-center justify-center mt-20 py-20 text-center ">
            <div className="w-12 h-12 bg-teal-50 dark:bg-teal-500/10 rounded-full flex items-center justify-center mb-4">
              <Library className="w-6 h-6 text-teal-600 dark:text-teal-500" />
            </div>
            <h3 className="text-sm font-semibold mb-1">Ready to explore?</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-[240px] leading-relaxed">
              Enter keywords above to find research on AI, Physics, Math, or
              Computer Science.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {["Quantum Computing", "LLMs", "Neural Networks"].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSearchQuery(tag)}
                  className="text-[10px] px-2 py-1 rounded-md bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-teal-500 transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 2. LOADING STATE */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-5 h-5 border-2 border-teal-600/20 border-t-teal-600 rounded-full animate-spin" />
            <p className="text-[11px] text-zinc-500 font-medium">
              Fetching papers...
            </p>
          </div>
        )}

        {/* 3. RESULTS STATE */}
        {hasSearched && !isLoading && results.length > 0 && (
          <>
            <div className="text-[11px] uppercase tracking-wider font-semibold text-zinc-400 mb-1 flex items-center gap-2">
              <Sparkles className="w-3 h-3" /> Results for {searchQuery}
            </div>
            <div className="flex flex-col gap-3">
              {results.map((paper: paper) => (
                <div
                  key={paper.id}
                  className="p-4 bg-white dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-teal-500/40 transition-colors flex flex-col gap-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-base font-semibold leading-tight hover:text-teal-600 transition-colors cursor-pointer">
                      {paper.title}
                    </h2>
                    <div className="flex gap-1 shrink-0">
                      <a
                        href={paper.link}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md text-zinc-400 hover:text-teal-500"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-zinc-500">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />{" "}
                      <span className="truncate max-w-[200px]">
                        {paper.authors}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />{" "}
                      <span>{paper.published}</span>
                    </div>
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-400 text-xs leading-normal line-clamp-2">
                    {paper.summary}
                  </p>
                  <div className="flex items-center gap-2">
                    <a
                      href={`${paper.link}.pdf`}
                      target="_blank"
                      className="flex items-center gap-1.5 text-[12px] font-medium text-teal-700 dark:text-teal-400 hover:underline"
                    >
                      <Download className="w-3.5 h-3.5" /> PDF
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* 4. EMPTY RESULTS STATE */}
        {hasSearched && !isLoading && results.length === 0 && (
          <div className="text-center py-12 px-4 bg-zinc-50/50 dark:bg-zinc-900/30 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
            <FileText className="w-8 h-8 mx-auto mb-2 text-zinc-300" />
            <p className="text-sm text-zinc-500 font-medium">
              No results found.
            </p>
            <p className="text-xs text-zinc-400 mt-1">
              Try different keywords or check for typos.
            </p>
          </div>
        )}

        {/* 5. PAGINATION */}
        {hasSearched && !isLoading && results.length > 0 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            {/* Previous Button */}
            <button
              onClick={() => handleSearch(null, currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm font-medium rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ← Previous
            </button>

            {/* Page Numbers */}
            <div className="flex gap-1">
              {(() => {
                const pageNumbers = [];
                const startPage = Math.max(1, currentPage - 1);
                const endPage = startPage + 2;

                for (let i = startPage; i <= endPage; i++) {
                  pageNumbers.push(i);
                }

                return pageNumbers.map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => handleSearch(null, pageNum)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      currentPage === pageNum
                        ? "bg-teal-600 text-white"
                        : "border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-teal-500"
                    }`}
                  >
                    {pageNum}
                  </button>
                ));
              })()}
            </div>

            {/* Next Button */}
            <button
              onClick={() => handleSearch(null, currentPage + 1)}
              className="px-3 py-2 text-sm font-medium rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-teal-500 transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

export default PaperLibrary;
