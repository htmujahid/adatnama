import { getRouteApi } from "@tanstack/react-router"

const homeRouteApi = getRouteApi("/home")

export function useHomeUser() {
  return homeRouteApi.useRouteContext({ select: (context) => context.user })
}
