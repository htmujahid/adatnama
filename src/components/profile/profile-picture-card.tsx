import { AvatarForm } from "@/components/profile/avatar-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useHomeUser } from "@/hooks/use-home-user"

export function ProfilePictureCard() {
  const user = useHomeUser()

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Profile picture</CardTitle>
      </CardHeader>
      <CardContent>
        <AvatarForm user={user} />
      </CardContent>
    </Card>
  )
}
