import { queryOptions } from "@tanstack/react-query"

import { previewCircleByCode } from "@/actions/circles"

export const circlePreviewQueryOptions = (code: string) =>
  queryOptions({
    queryKey: ["circles", "preview", code],
    queryFn: () => previewCircleByCode({ data: { code } }),
  })
