import type { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { UserIcon } from "lucide-react"

import type { listUsers } from "@/actions/auth"
import { Badge } from "@/components/reui/badge"
import type { DataGridFeatures } from "@/components/reui/data-grid/data-grid"
import { DataGridColumnHeader } from "@/components/reui/data-grid/data-grid-column-header"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { CsvColumn } from "@/lib/export"

import { UserActionsCell } from "./user-actions-cell"

export type User = Awaited<ReturnType<typeof listUsers>>["users"][number]

export const usersExportColumns: CsvColumn<User>[] = [
  { header: "Name", value: (user) => user.name },
  { header: "Email", value: (user) => user.email },
  { header: "Role", value: (user) => user.role ?? "user" },
  { header: "Status", value: (user) => (user.banned ? "Banned" : "Active") },
  {
    header: "Joined",
    value: (user) => format(new Date(user.createdAt), "yyyy-MM-dd"),
  },
]

export const usersColumns: ColumnDef<DataGridFeatures, User>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataGridColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      const user = row.original
      return (
        <div className="flex items-center gap-2.5">
          <Avatar size="sm">
            <AvatarImage src={user.image ?? undefined} alt={user.name} />
            <AvatarFallback>
              {user.name ? (
                user.name.slice(0, 2).toUpperCase()
              ) : (
                <UserIcon className="size-3" />
              )}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium">{user.name}</span>
        </div>
      )
    },
    meta: { headerTitle: "Name" },
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataGridColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.email}</span>
    ),
    meta: { headerTitle: "Email" },
  },
  {
    accessorKey: "role",
    header: ({ column }) => (
      <DataGridColumnHeader column={column} title="Role" />
    ),
    cell: ({ row }) => {
      const role = row.original.role ?? "user"
      return (
        <Badge
          variant={role === "admin" ? "primary-light" : "secondary"}
          className="capitalize"
        >
          {role}
        </Badge>
      )
    },
    meta: { headerTitle: "Role" },
  },
  {
    id: "status",
    accessorFn: (user) => (user.banned ? "banned" : "active"),
    header: ({ column }) => (
      <DataGridColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) =>
      row.original.banned ? (
        <Badge variant="destructive-light">Banned</Badge>
      ) : (
        <Badge variant="success-light">Active</Badge>
      ),
    meta: { headerTitle: "Status" },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataGridColumnHeader column={column} title="Joined" />
    ),
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {format(new Date(row.original.createdAt), "PP")}
      </span>
    ),
    meta: { headerTitle: "Joined" },
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => <UserActionsCell user={row.original} />,
    enableSorting: false,
    enableHiding: false,
    size: 60,
  },
]
