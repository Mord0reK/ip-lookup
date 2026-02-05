import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card"
import { cn } from "@/lib/utils"

interface InfoCardProps {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function InfoCard({ title, icon, children, className }: InfoCardProps) {
  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="flex flex-row items-center gap-2 pb-3">
        <div className="p-1.5 bg-primary/10 rounded-md text-primary">
          {icon}
        </div>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {children}
      </CardContent>
    </Card>
  )
}
