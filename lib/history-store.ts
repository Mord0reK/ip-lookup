import { HistoryItem } from '@/types/api';

const HISTORY_KEY = 'ip-lookup-history';
const MAX_HISTORY = 20;

function emitHistoryUpdate() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('historyUpdated'));
  }
}

export function getHistory(): HistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addToHistory(item: HistoryItem): void {
  if (typeof window === 'undefined') return;
  try {
    const history = getHistory();
    const existingIndex = history.findIndex(h => h.query === item.query);
    if (existingIndex !== -1) {
      history.splice(existingIndex, 1);
    }
    history.unshift(item);
    if (history.length > MAX_HISTORY) {
      history.pop();
    }
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    emitHistoryUpdate();
  } catch {
    console.error('Failed to save history');
  }
}

export function removeFromHistory(query: string): void {
  if (typeof window === 'undefined') return;
  try {
    const history = getHistory().filter(h => h.query !== query);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    emitHistoryUpdate();
  } catch {
    console.error('Failed to remove from history');
  }
}

export function clearHistory(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(HISTORY_KEY);
  emitHistoryUpdate();
}
