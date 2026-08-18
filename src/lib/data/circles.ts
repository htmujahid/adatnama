import { queryOptions } from "@tanstack/react-query"

import { getCircle, listCircles, previewCircleByCode } from "@/actions/circles"

export const circlesQueryOptions = () =>
  queryOptions({
    queryKey: ["circles"],
    queryFn: () => listCircles(),
  })

export const circleQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: ["circles", slug],
    queryFn: () => getCircle({ data: { slug } }),
  })

export const circlePreviewQueryOptions = (code: string) =>
  queryOptions({
    queryKey: ["circles", "preview", code],
    queryFn: () => previewCircleByCode({ data: { code } }),
  })
