"use client"

import { Clock, Trash2 } from "lucide-react"
import { useState, useEffect } from "react"
import { HistoryItem } from "@/types/api"
import { getHistory, clearHistory } from "@/lib/history-store"
import { ScrollArea } from "@/ui/scroll-area"

interface HistoryPanelProps {
  onSelect: (query: string) => void
}

export function HistoryPanel({ onSelect }: HistoryPanelProps) {
  const [items, setItems] = useState<HistoryItem[]>([])

  const refreshHistory = () => {
    setItems(getHistory())
  }

  useEffect(() => {
    refreshHistory()

    // Listen for custom event when history is updated
    const handleHistoryUpdate = () => {
      refreshHistory()
    }

    window.addEventListener('historyUpdated', handleHistoryUpdate)

    return () => {
      window.removeEventListener('historyUpdated', handleHistoryUpdate)
    }
  }, [])

  const handleSelect = (query: string) => {
    onSelect(query)
  }

  const handleClear = () => {
    clearHistory()
  }

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return "Just now"
  }

  return (
    <div className="h-full flex flex-col p-4">
      <div className="flex items-center justify-between px-2 mb-4">
        <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Historia</h2>
        {items.length > 0 && (
          <button
            onClick={handleClear}
            className="text-[10px] text-zinc-600 hover:text-red-400 transition-colors uppercase tracking-tighter flex items-center gap-1"
          >
            <Trash2 className="h-3 w-3" />
            Wyczyść
          </button>
        )}
      </div>

      <ScrollArea className="flex-1 overflow-y-auto">
        <div className="space-y-1">
          {items.length === 0 ? (
            <p className="text-zinc-600 text-xs px-2 italic">Brak historii...</p>
          ) : (
            items.map((item) => (
              <button
                key={`${item.query}-${item.timestamp}`}
                onClick={() => handleSelect(item.query)}
                className="w-full text-left px-2.5 py-2 rounded-md hover:bg-zinc-800 transition-all group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate text-zinc-200 group-hover:text-zinc-100">
                      {item.query}
                    </div>
                    <div className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                      <Clock className="h-3 w-3" />
                      <span className="truncate">
                        {item.city}, {item.country}
                      </span>
                      <span className="text-zinc-600">•</span>
                      <span>{formatTime(item.timestamp)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[10px] h-5 px-1.5 bg-zinc-800 text-zinc-400 rounded flex items-center font-mono">
                      {item.type.toUpperCase()}
                    </span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
