import { WifiOffIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { useOnlineStatus } from "@/hooks/use-online-status"

export function OfflineStatusBadge({ className }: { className?: string }) {
  const online = useOnlineStatus()

  if (online) return null

  return (
    <Badge variant="destructive" className={className}>
      <WifiOffIcon />
      Offline
    </Badge>
  )
}
