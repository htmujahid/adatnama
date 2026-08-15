import { MailIcon, ShieldIcon, UserIcon, UserRoundXIcon } from "lucide-react"

import type { FilterFieldConfig } from "@/components/reui/filters"

export const usersFilterFields: FilterFieldConfig[] = [
  {
    key: "name",
    label: "Name",
    type: "text",
    icon: <UserIcon className="size-4" />,
  },
  {
    key: "email",
    label: "Email",
    type: "text",
    icon: <MailIcon className="size-4" />,
  },
  {
    key: "role",
    label: "Role",
    type: "select",
    icon: <ShieldIcon className="size-4" />,
    options: [
      { value: "admin", label: "Admin" },
      { value: "user", label: "User" },
    ],
  },
  {
    key: "status",
    label: "Status",
    type: "select",
    icon: <UserRoundXIcon className="size-4" />,
    options: [
      { value: "active", label: "Active" },
      { value: "banned", label: "Banned" },
    ],
  },
]
