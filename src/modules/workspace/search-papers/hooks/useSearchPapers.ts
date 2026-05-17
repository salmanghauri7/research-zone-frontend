import { useState } from "react";
import { searchPapers } from "@/api/papersApi";
import { useWorkspaceStore } from "@/store/workspaceStore";

export type Paper = {
  id: string;
  title: string;
  authors: string;
  published: string;
  summary: string;
  link: string;
  category: string;
};

export default function useSearchPapers() {
  const { currentWorkspaceId } = useWorkspaceStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Paper[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [cache, setCache] = useState<Record<string, Paper[]>>({});

  // Save modal state (kept here so component remains render-only)
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);

  const handleSavePaper = (paperItem: Paper) => {
    setSelectedPaper(paperItem);
    setIsSaveModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsSaveModalOpen(false);
    setSelectedPaper(null);
  };

  const handleSearch = async (
    e: React.FormEvent<HTMLFormElement> | null,
    page: number = 1,
  ): Promise<void> => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setHasSearched(true);
    setCurrentPage(page);

    const cacheKey = `${searchQuery}-${page}`;
    if (cache[cacheKey]) {
      setResults(cache[cacheKey]);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setIsLoading(true);
    window.scrollTo({ top: 0, behavior: "smooth" });

    try {
      const data = await searchPapers(searchQuery, page);
      if (data.results) {
        setResults(data.results);
        setCache((prev) => ({ ...prev, [cacheKey]: data.results }));
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

  return {
    currentWorkspaceId,
    searchQuery,
    setSearchQuery,
    isLoading,
    results,
    hasSearched,
    currentPage,
    setCurrentPage,
    handleSearch,
    cache,
    handleSavePaper,
    isSaveModalOpen,
    selectedPaper,
    handleCloseModal,
  };
}
