import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { JournalEntry } from "@/models/JournalEntry";
import { LocalStorageService } from "@/services/LocalStorageService";

interface SearchResult {
  date: Date;
  entry: JournalEntry;
}

interface SearchContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedTags: Set<string>;
  toggleTag: (tag: string) => void;
  clearTags: () => void;
  searchResults: SearchResult[];
  isSearching: boolean;
  performSearch: (query: string, tags?: string[]) => Promise<void>;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const performSearch = useCallback(async (query: string, tags?: string[]) => {
    setIsSearching(true);
    try {
      const allEntryDates = await LocalStorageService.getAllEntryDates();
      const results: SearchResult[] = [];
      const tagsToFilter = tags || Array.from(selectedTags);

      for (const dateKey of allEntryDates) {
        const [year, month, day] = dateKey.split("-").map(Number);
        const date = new Date(year, month - 1, day);
        const entry = await LocalStorageService.loadEntry(date);

        const matchesText =
          query === "" ||
          entry.text.toLowerCase().includes(query.toLowerCase());
        const matchesTags =
          tagsToFilter.length === 0 ||
          tagsToFilter.every((tag) => entry.tags.includes(tag));

        if (matchesText && matchesTags) {
          results.push({ date, entry });
        }
      }

      results.sort((a, b) => b.date.getTime() - a.date.getTime());
      setSearchResults(results);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  }, [selectedTags]);

  const handleSetSearchQuery = useCallback(
    (query: string) => {
      setSearchQuery(query);
      performSearch(query);
    },
    [performSearch]
  );

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags((prev) => {
      const newTags = new Set(prev);
      if (newTags.has(tag)) {
        newTags.delete(tag);
      } else {
        newTags.add(tag);
      }
      return newTags;
    });
  }, []);

  const clearTags = useCallback(() => {
    setSelectedTags(new Set());
  }, []);

  return (
    <SearchContext.Provider
      value={{
        searchQuery,
        setSearchQuery: handleSetSearchQuery,
        selectedTags,
        toggleTag,
        clearTags,
        searchResults,
        isSearching,
        performSearch,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
}
