import { ProfileForm } from "@/components/profile/profile-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useHomeUser } from "@/hooks/use-home-user"

export function AccountCard() {
  const user = useHomeUser()

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Account</CardTitle>
      </CardHeader>
      <CardContent>
        <ProfileForm user={user} />
      </CardContent>
    </Card>
  )
}
