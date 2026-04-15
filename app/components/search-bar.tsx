"use client"

import { useState, useRef, useEffect } from "react"
import { Search, Loader2 } from "lucide-react"
import { Button } from "@/ui/button"
import { Input } from "@/ui/input"
import { toast } from "sonner"

interface SearchBarProps {
  onSearch: (query: string) => void
  isLoading: boolean
}

/**
 * Extracts domain from various URL formats:
 * - https://example.com -> example.com
 * - http://example.com/path -> example.com
 * - www.example.com -> example.com
 * - example.com/path -> example.com
 * - <a href="example.com"> -> example.com
 */
function sanitizeQuery(input: string): string {
  let cleaned = input.trim()
  
  // Remove HTML tags (e.g., <a href="example.com">link</a>)
  cleaned = cleaned.replace(/<[^>]*>/g, '')
  
  // Extract URL from HTML attributes (href="...", src="...")
  const hrefMatch = cleaned.match(/(?:href|src)=["']([^"']+)["']/i)
  if (hrefMatch) {
    cleaned = hrefMatch[1]
  }
  
  // Remove protocol (http://, https://, ftp://, etc.)
  cleaned = cleaned.replace(/^[a-z]+:\/\//i, '')
  
  // Remove path, query params, and hash
  cleaned = cleaned.split('/')[0].split('?')[0].split('#')[0]
  
  // Remove www. prefix if present
  cleaned = cleaned.replace(/^www\./i, '')
  
  // Remove port number if present
  cleaned = cleaned.split(':')[0]
  
  return cleaned.toLowerCase()
}

export function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [query, setQuery] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) {
      toast.error("Please enter an IP address or domain")
      return
    }
    const sanitized = sanitizeQuery(query)
    if (sanitized !== query.trim().toLowerCase()) {
      setQuery(sanitized)
    }
    onSearch(sanitized)
  }

  useEffect(() => {
    if (!isLoading && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isLoading])

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-xl gap-2">
      <div className="relative flex-1">
        <Search className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Wpisz adres IP lub domenę..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 h-11"
          disabled={isLoading}
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
