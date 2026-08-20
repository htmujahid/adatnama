import { useLiveQuery } from "@tanstack/react-db"

import { PasswordForm } from "@/components/profile/password-form"
import { SetPasswordForm } from "@/components/profile/set-password-form"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { accountsCollection } from "@/lib/collection/auth"

export function PasswordCard() {
  const { data: accounts = [] } = useLiveQuery({
    query: (q) => q.from({ account: accountsCollection }),
  })
  const hasPassword = accounts.some(
    (account) => account.providerId === "credential",
  )

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Password</CardTitle>
        {hasPassword && (
          <CardDescription>
            Enter your current password to set a new one.
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {hasPassword ? <PasswordForm /> : <SetPasswordForm />}
      </CardContent>
    </Card>
  )
}
