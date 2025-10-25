import { Loader2 } from 'lucide-react'

interface DashboardLoaderProps {
  message?: string
  submessage?: string
}

export function DashboardLoader({ 
  message = "Loading dashboard", 
  submessage = "Fetching your data..." 
}: DashboardLoaderProps) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <div className="text-center">
          <h3 className="text-lg font-medium text-foreground">{message}</h3>
          <p className="text-sm text-muted-foreground">{submessage}</p>
        </div>
      </div>
    </div>
  )
}

export function InlineLoader({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex items-center space-x-2">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span className="text-sm text-muted-foreground">{message}</span>
    </div>
  )
}
