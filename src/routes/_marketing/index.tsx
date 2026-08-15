import { createFileRoute, Link } from "@tanstack/react-router"
import {
  ChevronDownIcon,
  CloudIcon,
  FormInputIcon,
  RefreshCwIcon,
  ServerIcon,
} from "lucide-react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export const Route = createFileRoute("/_marketing/")({ component: App })

const FEATURES = [
  {
    icon: FormInputIcon,
    title: "Typed fields",
    description:
      "Compose forms from shadcn/ui field components with schema-driven validation and full TypeScript inference.",
  },
  {
    icon: ServerIcon,
    title: "Submission endpoints",
    description:
      "Every form gets a server route on the same file to receive and validate submissions. No separate backend to run.",
  },
  {
    icon: RefreshCwIcon,
    title: "Reactive responses",
    description:
      "Submissions land in a TanStack Query cache, so lists and dashboards update the moment data changes.",
  },
  {
    icon: CloudIcon,
    title: "Edge storage",
    description:
      "Deploys to Cloudflare Workers, with KV, D1, and R2 ready to wire up as the storage behind your forms.",
  },
]

const STEPS = [
  {
    title: "Define the form",
    description:
      "Describe fields and validation in one place. Forming renders them with accessible shadcn/ui components and infers the submission type.",
  },
  {
    title: "Receive submissions",
    description:
      "A POST handler on the same route validates each entry and stores it at the edge. The route file is the whole stack.",
  },
  {
    title: "Watch responses live",
    description:
      "A typed query keeps every view of your submissions in sync. The status page on this site runs on the same data layer.",
  },
]

const FAQ = [
  {
    question: "What is Forming?",
    answer:
      "A form-building framework built on TanStack Start. You define a form and its schema, and Forming gives you a typed route, validation, a submission endpoint, and a reactive view of the responses.",
  },
  {
    question: "Do I need a separate backend?",
    answer:
      "No. Submission endpoints are server routes that deploy with the app to Cloudflare Workers. Storage is whatever Cloudflare binding you configure in wrangler.jsonc, such as KV, D1, or R2.",
  },
  {
    question: "What makes it local-first?",
    answer:
      "Reads come from a TanStack Query cache that is hydrated on the server and kept fresh in the background, so pages render instantly from local data and sync as the network allows.",
  },
  {
    question: "Can I use my own components?",
    answer:
      "Yes. Forming ships with the full shadcn/ui field set, including inputs, selects, checkboxes, radio groups, and OTP fields, but any controlled React input works.",
  },
  {
    question: "How do I deploy?",
    answer:
      "Run npm run deploy. It builds the app and publishes it to Cloudflare Workers through Wrangler, using the config that ships with the project.",
  },
]

function FormMock() {
  return (
    <div
      aria-hidden="true"
      className="rounded-xl border border-border bg-card p-6 shadow-xs sm:p-8"
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <div className="h-4 w-2/5 rounded bg-foreground/15" />
          <div className="h-3 w-3/5 rounded bg-muted" />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <div className="h-2.5 w-16 rounded bg-muted" />
            <div className="h-9 rounded-md border border-border bg-background" />
          </div>
          <div className="flex flex-col gap-2">
            <div className="h-2.5 w-20 rounded bg-muted" />
            <div className="h-9 rounded-md border border-border bg-background" />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="h-2.5 w-14 rounded bg-muted" />
          <div className="flex h-9 items-center justify-between rounded-md border border-border bg-background px-3">
            <div className="h-2.5 w-24 rounded bg-muted" />
            <ChevronDownIcon className="size-4 text-muted-foreground" />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="h-2.5 w-18 rounded bg-muted" />
          <div className="h-20 rounded-md border border-border bg-background" />
        </div>

        <div className="flex items-center gap-2.5">
          <div className="size-4 rounded-[4px] border border-border bg-background" />
          <div className="h-2.5 w-40 rounded bg-muted" />
        </div>

        <div className="flex h-9 w-28 items-center justify-center rounded-md bg-primary">
          <div className="h-2.5 w-14 rounded bg-primary-foreground/80" />
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <div>
      <section className="border-b border-border">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:py-28 lg:px-8">
          <div className="flex flex-col items-start gap-6">
            <Badge variant="secondary">Open source. Edge native.</Badge>
            <h1 className="font-heading text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              Build forms once. Ship them to the edge.
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground">
              Forming is a form-building framework built on TanStack Start.
              Define a form and get typed routes, validation, a submission
              endpoint, and a reactive view of responses, all deployed to
              Cloudflare.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                size="lg"
                nativeButton={false}
                render={<Link to="/features" />}
              >
                Explore features
              </Button>
              <Button
                variant="outline"
                size="lg"
                nativeButton={false}
                render={<Link to="/status" />}
              >
                View live status
              </Button>
            </div>
          </div>

          <FormMock />
        </div>
      </section>

      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
              Everything a form needs, in one file
            </h2>
            <p className="mt-3 text-muted-foreground">
              The pieces you would normally stitch together across a frontend, a
              backend, and a database live next to each other in a single route.
            </p>
          </div>

          <div className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="flex flex-col gap-3">
                <feature.icon className="size-5 text-primary" />
                <h3 className="font-heading font-medium">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto grid w-full max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_1.5fr] lg:gap-16 lg:px-8">
          <div className="flex flex-col items-start gap-4">
            <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
              From schema to submissions in three steps
            </h2>
            <p className="text-muted-foreground">
              No glue code between the form you render and the endpoint that
              receives it. The route file is the contract.
            </p>
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link to="/features" />}
            >
              See how data flows
            </Button>
          </div>

          <ol className="flex flex-col">
            {STEPS.map((step, index) => (
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
        <div className="mx-auto grid w-full max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_2fr] lg:gap-16 lg:px-8">
          <div>
            <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
              Questions
            </h2>
            <p className="mt-3 text-muted-foreground">
              The short version of what Forming is and how it runs.
            </p>
          </div>

          <Accordion>
            {FAQ.map((item) => (
              <AccordionItem key={item.question}>
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">{item.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section>
        <div className="mx-auto flex w-full max-w-7xl flex-col items-start justify-between gap-6 px-4 py-20 sm:px-6 lg:flex-row lg:items-center lg:px-8">
          <div>
            <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
              Start with a working example
            </h2>
            <p className="mt-2 max-w-xl text-muted-foreground">
              The status page is a live route built on the same data layer your
              forms will use.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button nativeButton={false} render={<Link to="/status" />}>
              View live status
            </Button>
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link to="/about" />}
            >
              About Forming
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
