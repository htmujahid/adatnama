import { getRouteApi } from "@tanstack/react-router"

const rootRouteApi = getRouteApi("__root__")

export function useSession() {
  return rootRouteApi.useRouteContext({ select: (context) => context.session })
}
