import { createFileRoute, Link } from "@tanstack/react-router"

import { Button } from "@/components/ui/button"

export const Route = createFileRoute("/_marketing/about")({
  component: AboutPage,
})

const PRINCIPLES = [
  {
    title: "Checking in is instant",
    description:
      "A check-in updates your streak the moment you tap it. No page reload, no waiting for the count to catch up.",
  },
  {
    title: "Type-safe end to end",
    description:
      "Routes, params, loaders, and queries are all inferred. The same schema that defines a habit types every check-in against it.",
  },
  {
    title: "Server-first, then reactive",
    description:
      "Data is fetched on the server and hydrated into a client cache that stays live. Pages render instantly and update on their own.",
  },
  {
    title: "Edge-native by default",
    description:
      "The whole app deploys to Cloudflare Workers, so your habits and their streaks are tracked close to wherever you check in from.",
  },
]

function AboutPage() {
  return (
    <div>
      <section className="border-b border-border">
        <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              About Adatnama
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Adatnama is a streak and habit tracker built on TanStack Start
              and deployed to Cloudflare. Add a habit, check in daily, and
              Adatnama turns that into a running streak: a current count, a
              longest count, and a freeze you can spend when a day slips.
            </p>
            <p className="mt-4 text-lg text-muted-foreground">
              Streaks work because the feedback is immediate: you do the
              thing, the count goes up, and losing it feels like something
              worth protecting. Adatnama exists to keep that loop tight, so a
              check-in updates your streak instantly, with no gap between
              doing the habit and seeing it counted.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
            Principles
          </h2>
          <div className="mt-10 grid gap-x-12 gap-y-10 sm:grid-cols-2">
            {PRINCIPLES.map((principle, index) => (
              <div
                key={principle.title}
                className="flex flex-col gap-2 border-t border-border pt-5"
              >
                <span className="font-mono text-sm text-muted-foreground">
                  0{index + 1}
                </span>
                <h3 className="font-heading text-lg font-medium">
                  {principle.title}
                </h3>
                <p className="text-muted-foreground">{principle.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto flex w-full max-w-7xl flex-col items-start justify-between gap-6 px-4 py-20 sm:px-6 lg:flex-row lg:items-center lg:px-8">
          <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
            Curious what it can do?
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            <Button nativeButton={false} render={<Link to="/features" />}>
              Browse the features
            </Button>
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link to="/status" />}
            >
              Check the live status page
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
