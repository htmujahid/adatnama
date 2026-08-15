import { createFileRoute, Link } from "@tanstack/react-router"

import { Button } from "@/components/ui/button"

export const Route = createFileRoute("/_marketing/about")({
  component: AboutPage,
})

const PRINCIPLES = [
  {
    title: "The route file is the contract",
    description:
      "A form, its validation, and its endpoint live in one file. When they can't drift apart, a whole class of bugs disappears.",
  },
  {
    title: "Type-safe end to end",
    description:
      "Routes, params, loaders, and queries are all inferred. The type of a submission comes from the same schema that renders the fields.",
  },
  {
    title: "Server-first, then reactive",
    description:
      "Data is fetched on the server and hydrated into a client cache that stays live. Pages render instantly and update on their own.",
  },
  {
    title: "Edge-native by default",
    description:
      "The whole app deploys to Cloudflare Workers, so forms and their storage run close to the people filling them in.",
  },
]

function AboutPage() {
  return (
    <div>
      <section className="border-b border-border">
        <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              About Forming
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Forming is a form-building framework for reactive, local-first
              applications, built on TanStack Start and deployed to Cloudflare.
              You define a form and its schema. Forming turns that into a typed
              route, accessible fields, server-side validation, a submission
              endpoint, and a live view of the responses.
            </p>
            <p className="mt-4 text-lg text-muted-foreground">
              Forms are where most apps actually meet their users, and where the
              frontend, the backend, and the database usually meet each other.
              Forming exists to make that seam one file instead of three
              services.
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
