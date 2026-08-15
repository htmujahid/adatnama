import { createFileRoute, redirect } from "@tanstack/react-router"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { EditUserForm } from "@/components/users/edit-user-form"
import { userQueryOptions } from "@/lib/data/auth"

export const Route = createFileRoute("/home/users/$userId/edit")({
  beforeLoad: ({ context }) => {
    if (context.user.role !== "admin") {
      throw redirect({ to: "/home" })
    }
  },
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(userQueryOptions(params.userId)),
  component: EditUserPage,
})

function EditUserPage() {
  const user = Route.useLoaderData()

  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <Card size="sm">
        <CardHeader>
          <CardTitle>Edit user</CardTitle>
          <CardDescription>
            Update {user.name}&apos;s username, role, and status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EditUserForm user={user} />
        </CardContent>
      </Card>
    </div>
  )
}
