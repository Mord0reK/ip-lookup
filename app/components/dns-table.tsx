"use client"

import { DNSRecords } from "@/types/api"

interface DNSTableProps {
  records: DNSRecords
}

export function DNSTable({ records }: DNSTableProps) {
  if (!records || Object.keys(records).length === 0) {
    return (
      <div className="col-span-full text-zinc-500 text-center py-4">
        Brak rekordów DNS
      </div>
    )
  }

  // Sort record types alphabetically
  const sortedTypes = Object.keys(records).sort()
  const hasRecords = sortedTypes.some(type => {
    const typeRecords = records[type]
    return Array.isArray(typeRecords) && typeRecords.length > 0
  })

  if (!hasRecords) {
    return (
      <div className="col-span-full text-zinc-500 text-center py-4">
        Brak rekordów DNS
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {sortedTypes.map(type => {
        const typeRecords = records[type]

        if (!Array.isArray(typeRecords) || typeRecords.length === 0) {
          return null
        }

        return (
          <div
            key={type}
            className="bg-zinc-800/30 rounded-2xl p-4 border border-zinc-700/30"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="px-2 py-0.5 bg-sky-500/10 text-sky-400 text-[10px] font-bold rounded uppercase tracking-wider">
                {type}
              </span>
              <span className="text-[10px] text-zinc-500">
                {typeRecords.length} {typeRecords.length === 1 ? 'rekord' : 'rekordów'}
              </span>
            </div>

            <div className="space-y-2">
              {typeRecords.map((record: any, index: number) => (
                <div key={index} className="group">
                  <div className="text-zinc-200 text-sm font-mono break-all bg-black/20 p-2 rounded border border-zinc-800/50 group-hover:border-zinc-700/50 transition-colors">
                    {record.data || record}
                  </div>
                  {record.name && record.name !== record.data && record.name !== (record.data + '.') && (
                    <div className="text-[10px] text-zinc-600 mt-0.5 ml-1 truncate">
                      Name: {record.name}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
