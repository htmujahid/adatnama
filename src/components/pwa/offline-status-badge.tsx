import { WifiOffIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"

export function OfflineStatusBadge({ className }: { className?: string }) {
  return (
    <Badge variant="destructive" className={className}>
      <WifiOffIcon />
      Offline
    </Badge>
  )
}
