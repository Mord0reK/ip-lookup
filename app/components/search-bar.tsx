"use client"

import { useState } from "react"
import { Search, Loader2 } from "lucide-react"
import { Button } from "@/ui/button"
import { Input } from "@/ui/input"
import { toast } from "sonner"

interface SearchBarProps {
  onSearch: (query: string) => void
  isLoading: boolean
}

export function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [query, setQuery] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) {
      toast.error("Please enter an IP address or domain")
      return
    }
    onSearch(query.trim())
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-xl gap-2">
      <div className="relative flex-1">
        <Search className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Wpisz adres IP lub domenę..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 h-11"
          disabled={isLoading}
          autoFocus
        />
      </div>
      <Button type="submit" disabled={isLoading} className="px-5 h-11">
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Wyszukiwanie...
          </>
        ) : (
          "Wyszukaj"
        )}
      </Button>
    </form>
  )
}
