"use client";

import { memo } from "react";
import {
  Search,
  FileText,
  Calendar,
  Users,
  ExternalLink,
  Download,
  Library,
  Sparkles,
  Bookmark,
} from "lucide-react";
import useSearchPapers from "@/modules/workspace/search-papers/hooks/useSearchPapers";
import SavePaperModal from "@/components/dashboard/SavePaperModal";
import { Button, Input, Card, CardContent } from "@/shared/components/ui";

const SearchPapersPage = memo(function SearchPapersPage() {
  const {
    currentWorkspaceId,
    searchQuery,
    setSearchQuery,
    isLoading,
    results,
    hasSearched,
    currentPage,
    handleSearch,
    handleSavePaper,
    isSaveModalOpen,
    selectedPaper,
    handleCloseModal,
  } = useSearchPapers();
  return (
    <div className="p-4 md:p-6 w-full max-w-4xl mx-auto text-black dark:text-white min-h-screen flex flex-col gap-5">
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by topic, author, or ID..."
            className="w-full pl-10 pr-3 py-2.5 bg-white dark:bg-[#1a1a1a] rounded-lg text-sm"
          />
        </div>
        <Button
          type="submit"
          disabled={isLoading}
          className="px-5 py-2.5 flex items-center justify-center gap-2"
        >
          Search
        </Button>
      </form>

      <div className="flex flex-col gap-3 flex-1">
        {!hasSearched && (
          <div className="flex flex-col items-center justify-center mt-20 py-20 text-center ">
            <div className="w-12 h-12 bg-teal-50 dark:bg-teal-500/10 rounded-full flex items-center justify-center mb-4">
              <Library className="w-6 h-6 text-teal-600 dark:text-teal-500" />
            </div>
            <h3 className="text-sm font-semibold mb-1">Ready to explore?</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-60 leading-relaxed">
              Enter keywords above to find research on AI, Physics, Math, or
              Computer Science.
            </p>
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-5 h-5 border-2 border-teal-600/20 border-t-teal-600 rounded-full animate-spin" />
            <p className="text-[11px] text-zinc-500 font-medium">
              Fetching papers...
            </p>
          </div>
        )}

        {hasSearched && !isLoading && results.length > 0 && (
          <>
            <div className="text-[11px] uppercase tracking-wider font-semibold text-zinc-400 mb-1 flex items-center gap-2">
              <Sparkles className="w-3 h-3" /> Results for {searchQuery}
            </div>
            <div className="flex flex-col gap-3">
              {results.map((paper) => (
                <Card key={paper.id} className="rounded-xl">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="text-base font-semibold leading-tight hover:text-teal-600 transition-colors cursor-pointer">
                        {paper.title}
                      </h2>
                      <div className="flex gap-1 shrink-0">
                        <a
                          href={paper.link.replace("/abs/", "/pdf/") + ".pdf"}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-md text-zinc-400 hover:text-teal-500"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-zinc-500 mt-2">
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
                    <p className="text-zinc-600 dark:text-zinc-400 text-xs leading-normal line-clamp-2 mt-2">
                      {paper.summary}
                    </p>
                    <div className="flex items-center gap-3 mt-3">
                      <Button
                        onClick={() => handleSavePaper(paper)}
                        variant="ghost"
                        className="flex items-center gap-1.5 text-[12px] font-medium text-zinc-600 dark:text-zinc-400"
                      >
                        <Bookmark className="w-3.5 h-3.5" /> Save Paper
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

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

        {hasSearched && !isLoading && results.length > 0 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <button
              onClick={() => handleSearch(null, currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm font-medium rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ← Previous
            </button>

            <div className="flex gap-1">
              {(() => {
                const pageNumbers: number[] = [];
                const startPage = Math.max(1, currentPage - 1);
                const endPage = startPage + 2;

                for (let i = startPage; i <= endPage; i++) {
                  pageNumbers.push(i);
                }

                return pageNumbers.map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => handleSearch(null, pageNum)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${currentPage === pageNum ? "bg-teal-600 text-white" : "border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-teal-500"}`}
                  >
                    {pageNum}
                  </button>
                ));
              })()}
            </div>

            <button
              onClick={() => handleSearch(null, currentPage + 1)}
              className="px-3 py-2 text-sm font-medium rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-teal-500 transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </div>

      <SavePaperModal
        isOpen={isSaveModalOpen}
        onClose={handleCloseModal}
        paper={selectedPaper}
        workspaceId={currentWorkspaceId}
        onSuccess={() => {
          console.log("Paper saved successfully!");
        }}
      />
    </div>
  );
});

export default SearchPapersPage;
