import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { JournalEntry, createEmptyEntry } from "@/models/JournalEntry";
import { LocalStorageService } from "@/services/LocalStorageService";

interface JournalContextType {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  currentEntry: JournalEntry;
  isLoading: boolean;
  isSaving: boolean;
  loadEntry: (date: Date) => Promise<JournalEntry>;
  saveEntry: (date: Date, entry: JournalEntry) => Promise<void>;
  entryDates: Set<string>;
  refreshEntryDates: () => Promise<void>;
  allTags: Map<string, number>;
  refreshTags: () => Promise<void>;
}

const JournalContext = createContext<JournalContextType | undefined>(undefined);

export function JournalProvider({ children }: { children: ReactNode }) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentEntry, setCurrentEntry] = useState<JournalEntry>(
    createEmptyEntry()
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [entryDates, setEntryDates] = useState<Set<string>>(new Set());
  const [allTags, setAllTags] = useState<Map<string, number>>(new Map());

  const loadEntry = useCallback(async (date: Date): Promise<JournalEntry> => {
    setIsLoading(true);
    try {
      const entry = await LocalStorageService.loadEntry(date);
      setCurrentEntry(entry);
      return entry;
    } catch (error) {
      console.error("Error loading entry:", error);
      const emptyEntry = createEmptyEntry();
      setCurrentEntry(emptyEntry);
      return emptyEntry;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveEntry = useCallback(
    async (date: Date, entry: JournalEntry) => {
      setIsSaving(true);
      try {
        await LocalStorageService.saveEntry(date, entry);
        setCurrentEntry(entry);
      } catch (error) {
        console.error("Error saving entry:", error);
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    []
  );

  const refreshEntryDates = useCallback(async () => {
    try {
      const dates = await LocalStorageService.getAllEntryDates();
      setEntryDates(new Set(dates));
    } catch (error) {
      console.error("Error refreshing entry dates:", error);
    }
  }, []);

  const refreshTags = useCallback(async () => {
    try {
      const tags = await LocalStorageService.getAllTags();
      setAllTags(tags);
    } catch (error) {
      console.error("Error refreshing tags:", error);
    }
  }, []);

  useEffect(() => {
    loadEntry(selectedDate);
  }, [selectedDate, loadEntry]);

  useEffect(() => {
    refreshEntryDates();
    refreshTags();
  }, [refreshEntryDates, refreshTags]);

  return (
    <JournalContext.Provider
      value={{
        selectedDate,
        setSelectedDate,
        currentEntry,
        isLoading,
        isSaving,
        loadEntry,
        saveEntry,
        entryDates,
        refreshEntryDates,
        allTags,
        refreshTags,
      }}
    >
      {children}
    </JournalContext.Provider>
  );
}

export function useJournal() {
  const context = useContext(JournalContext);
  if (context === undefined) {
    throw new Error("useJournal must be used within a JournalProvider");
  }
  return context;
}
