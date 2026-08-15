import { createFileRoute, redirect } from "@tanstack/react-router"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { CreateUserForm } from "@/components/users/create-user-form"

export const Route = createFileRoute("/home/users/create")({
  beforeLoad: ({ context }) => {
    if (context.user.role !== "admin") {
      throw redirect({ to: "/home" })
    }
  },
  component: CreateUserPage,
})

function CreateUserPage() {
  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <Card size="sm">
        <CardHeader>
          <CardTitle>Create user</CardTitle>
          <CardDescription>
            Add a new account with a username, password, and role.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateUserForm />
        </CardContent>
      </Card>
    </div>
  )
}
