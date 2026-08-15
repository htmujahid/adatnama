import { createFileRoute, Link } from "@tanstack/react-router"
import {
  CloudIcon,
  MoonStarIcon,
  ServerIcon,
  ShieldCheckIcon,
  ZapIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export const Route = createFileRoute("/_marketing/features")({
  component: FeaturesPage,
})

const FIELD_COMPONENTS = [
  "Input",
  "Textarea",
  "Select",
  "Combobox",
  "Checkbox",
  "Radio Group",
  "Switch",
  "Slider",
  "Input OTP",
  "Date Picker",
  "Field",
  "Label",
]

const SUBMISSION_POINTS = [
  {
    icon: ServerIcon,
    title: "Server routes on the form's own file",
    description:
      "A POST handler lives next to the component that renders the form, so the endpoint and the UI never drift apart.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Validation at the boundary",
    description:
      "The same schema that types your fields validates the incoming request, on the server, before anything is stored.",
  },
  {
    icon: ZapIcon,
    title: "Isomorphic server functions",
    description:
      "Need to call form logic from a loader or an event handler? Server functions run the same code from either side.",
  },
]

const DATA_FLOW = [
  {
    title: "The loader prefetches on the server",
    description:
      "A route's loader calls queryClient.ensureQueryData() before the page renders, so the first paint already has data.",
  },
  {
    title: "The query dehydrates into the HTML",
    description:
      "The router's SSR integration serializes fetched data into the response. No client-side fetch on first load.",
  },
  {
    title: "The client hydrates instantly",
    description:
      "useSuspenseQuery reads the same cache the loader populated, so the page is interactive with real data immediately.",
  },
  {
    title: "The UI stays live",
    description:
      "Refetch intervals and invalidation keep submission lists current. The status page runs this exact loop.",
  },
]

const CLOUDFLARE_BINDINGS = ["KV", "D1", "R2", "Durable Objects"]

function FeaturesPage() {
  return (
    <div>
      <section className="border-b border-border">
        <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              Features
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Everything here is real and working in this codebase, not a
              mockup.{" "}
              <Link
                to="/status"
                className="text-primary underline underline-offset-4"
              >
                The status page
              </Link>{" "}
              runs the same data layer your forms will use.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto grid w-full max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
          <div className="flex flex-col items-start gap-4">
            <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
              The form layer
            </h2>
            <p className="text-muted-foreground">
              A complete set of accessible field components, built on base-ui
              primitives and styled with semantic design tokens. Compose them
              into any form, from a contact page to a multi-step wizard, and
              keep full control of the markup.
            </p>
            <p className="text-muted-foreground">
              Every component ships in this repo under{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">
                src/components/ui
              </code>
              , ready to restyle or replace.
            </p>
          </div>

          <div className="flex flex-wrap content-start items-start gap-2">
            {FIELD_COMPONENTS.map((name) => (
              <Badge key={name} variant="outline" className="h-7 px-3 text-sm">
                {name}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto grid w-full max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_1.5fr] lg:gap-16 lg:px-8">
          <div className="flex flex-col items-start gap-4">
            <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
              Submissions without a backend
            </h2>
            <p className="text-muted-foreground">
              Handling a form usually means standing up an API. In Forming, the
              endpoint is part of the route file, written with{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">
                @tanstack/react-start
              </code>{" "}
              server handlers.
            </p>
          </div>

          <div className="flex flex-col gap-8">
            {SUBMISSION_POINTS.map((point) => (
              <div key={point.title} className="flex gap-4">
                <point.icon className="mt-0.5 size-5 shrink-0 text-primary" />
                <div className="flex flex-col gap-1.5">
                  <h3 className="font-heading font-medium">{point.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {point.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto grid w-full max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_1.5fr] lg:gap-16 lg:px-8">
          <div className="flex flex-col items-start gap-4">
            <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
              How data flows
            </h2>
            <p className="text-muted-foreground">
              The exact path a request takes, from the server to a reactive
              client cache. This is the loop that keeps submission lists and
              dashboards live.
            </p>
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link to="/status" />}
            >
              Watch it run
            </Button>
          </div>

          <ol className="flex flex-col">
            {DATA_FLOW.map((step, index) => (
              <li
                key={step.title}
                className="flex gap-5 border-b border-border py-6 first:pt-0 last:border-b-0 last:pb-0"
              >
                <span className="font-mono text-sm text-muted-foreground">
                  0{index + 1}
                </span>
                <div className="flex flex-col gap-1.5">
                  <h3 className="font-heading font-medium">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto grid w-full max-w-7xl gap-12 px-4 py-20 sm:grid-cols-2 sm:px-6 lg:gap-16 lg:px-8">
          <div className="flex flex-col items-start gap-4">
            <CloudIcon className="size-5 text-primary" />
            <h2 className="font-heading text-xl font-semibold tracking-tight">
              Deploy to Cloudflare
            </h2>
            <p className="text-muted-foreground">
              One command builds the app and publishes it to Cloudflare Workers.
              Add a binding in{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">
                wrangler.jsonc
              </code>{" "}
              and your forms have edge storage.
            </p>
            <div className="flex flex-wrap gap-2">
              {CLOUDFLARE_BINDINGS.map((binding) => (
                <Badge key={binding} variant="outline">
                  {binding}
                </Badge>
              ))}
            </div>
            <code className="rounded-md border border-border bg-card px-3 py-2 font-mono text-sm">
              npm run deploy
            </code>
          </div>

          <div className="flex flex-col items-start gap-4">
            <MoonStarIcon className="size-5 text-primary" />
            <h2 className="font-heading text-xl font-semibold tracking-tight">
              A design system included
            </h2>
            <p className="text-muted-foreground">
              shadcn/ui on Tailwind CSS v4, themed with semantic tokens in
              OKLCH. Light, dark, and auto modes persist to localStorage and
              apply before first paint, so there is no flash of the wrong theme.
            </p>
            <p className="text-muted-foreground">
              Try the toggle in the header. Every page, including the code panel
              on the home page, adapts.
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto flex w-full max-w-7xl flex-col items-start justify-between gap-6 px-4 py-20 sm:px-6 lg:flex-row lg:items-center lg:px-8">
          <div>
            <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
              See it running
            </h2>
            <p className="mt-2 max-w-xl text-muted-foreground">
              The status page is a real server route and a real reactive query,
              refreshing live.
            </p>
          </div>
          <Button nativeButton={false} render={<Link to="/status" />}>
            View live status
          </Button>
        </div>
      </section>
    </div>
  )
}
