import { useCallback, useState } from "react";

export type ListViewMode = "grid" | "list" | "board";

const STORAGE_KEY = "banquet-list-view";
const VALID_MODES: ListViewMode[] = ["grid", "list", "board"];

function readStoredView(pageKey: string, defaultMode: ListViewMode): ListViewMode {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultMode;
    const parsed = JSON.parse(raw) as Record<string, ListViewMode>;
    return VALID_MODES.includes(parsed[pageKey]) ? parsed[pageKey] : defaultMode;
  } catch {
    return defaultMode;
  }
}

function writeStoredView(pageKey: string, mode: ListViewMode) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Record<string, ListViewMode>) : {};
    parsed[pageKey] = mode;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
  } catch {
    /* ignore */
  }
}

export function useListViewMode(pageKey: string, defaultMode: ListViewMode = "grid") {
  const [view, setViewState] = useState<ListViewMode>(() => readStoredView(pageKey, defaultMode));

  const setView = useCallback(
    (mode: ListViewMode) => {
      setViewState(mode);
      writeStoredView(pageKey, mode);
    },
    [pageKey],
  );

  return [view, setView] as const;
}
