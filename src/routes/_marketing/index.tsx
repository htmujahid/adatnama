import { createFileRoute, Link } from "@tanstack/react-router"
import {
  CheckIcon,
  CloudIcon,
  FlameIcon,
  ListChecksIcon,
  SnowflakeIcon,
} from "lucide-react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export const Route = createFileRoute("/_marketing/")({ component: App })

const FEATURES = [
  {
    icon: FlameIcon,
    title: "Streak counts",
    description:
      "Every check-in updates your current and longest streak instantly, with the full history behind it.",
  },
  {
    icon: ListChecksIcon,
    title: "Multiple habits",
    description:
      "Track as many habits as you want. Each one keeps its own streak, freeze count, and check-in history.",
  },
  {
    icon: SnowflakeIcon,
    title: "Streak freezes",
    description:
      "Spend a freeze to protect a streak through a missed day, instead of watching it reset to zero.",
  },
  {
    icon: CloudIcon,
    title: "Edge storage",
    description:
      "Deploys to Cloudflare Workers, with D1 storing every habit and check-in at the edge.",
  },
]

const STEPS = [
  {
    title: "Add a habit",
    description:
      "Name what you're building. Adatnama starts tracking it from day one, with its own streak and freeze count.",
  },
  {
    title: "Check in daily",
    description:
      "One tap logs today. Miss a day and the streak resets, unless you spend a freeze to protect it.",
  },
  {
    title: "Watch the streak grow",
    description:
      "Current streak, longest streak, and a full check-in history update live. The status page on this site runs on the same data layer.",
  },
]

const FAQ = [
  {
    question: "What is Adatnama?",
    answer:
      "A streak and habit tracker built on TanStack Start. Check in on your habits daily, and Adatnama tracks your current streak, longest streak, and full history, for as many habits as you want.",
  },
  {
    question: "How do streak freezes work?",
    answer:
      "Each habit holds a limited number of freezes. Spend one to cover a missed day so the streak survives instead of resetting to zero.",
  },
  {
    question: "Can I track more than one habit?",
    answer:
      "Yes. Add as many habits as you want, each with its own streak, freeze count, and check-in history, all in one account.",
  },
  {
    question: "What makes it local-first?",
    answer:
      "Reads come from a TanStack Query cache that is hydrated on the server and kept fresh in the background, so your streaks render instantly and sync as the network allows.",
  },
  {
    question: "How do I deploy?",
    answer:
      "Run npm run deploy. It builds the app and publishes it to Cloudflare Workers through Wrangler, using the config that ships with the project.",
  },
]

const STREAK_DAYS = [
  "done",
  "done",
  "done",
  "frozen",
  "done",
  "done",
  "done",
  "done",
  "missed",
  "done",
  "done",
  "done",
  "done",
  "today",
] as const

function StreakMock() {
  return (
    <div
      aria-hidden="true"
      className="rounded-xl border border-border bg-card p-6 shadow-xs sm:p-8"
    >
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1.5">
            <div className="h-2.5 w-20 rounded bg-muted" />
            <span className="font-heading text-lg font-semibold">
              Morning run
            </span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-primary">
            <FlameIcon className="size-4" />
            <span className="font-heading text-sm font-semibold">12</span>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {STREAK_DAYS.map((day, index) => (
            <div
              key={index}
              className={cn(
                "flex size-8 items-center justify-center rounded-md",
                day === "done" && "bg-primary text-primary-foreground",
                day === "frozen" &&
                  "bg-sky-500/15 text-sky-600 dark:text-sky-400",
                day === "missed" && "bg-muted text-muted-foreground/40",
                day === "today" &&
                  "border-2 border-dashed border-primary text-primary",
              )}
            >
              {day === "done" && <CheckIcon className="size-3.5" />}
              {day === "frozen" && <SnowflakeIcon className="size-3.5" />}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-border pt-5">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">
              Longest streak
            </span>
            <span className="font-heading font-semibold">27 days</span>
          </div>
          <div className="flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">
            Check in
          </div>
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
            <Badge variant="secondary">
              Built for daily habits. Edge native.
            </Badge>
            <h1 className="font-heading text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              Check in daily. Never break the streak.
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground">
              Adatnama is a streak and habit tracker built on TanStack Start.
              Add a habit, check in daily, and watch your current streak,
              longest streak, and full history update live, all deployed to
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

          <StreakMock />
        </div>
      </section>

      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
              Everything a streak needs, in one place
            </h2>
            <p className="mt-3 text-muted-foreground">
              Habits, check-ins, and freezes live together, so your streak is
              never more than a tap away from being up to date.
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
              From habit to streak in three steps
            </h2>
            <p className="text-muted-foreground">
              No separate log book, no separate reminder app. Add the habit,
              check in, watch the streak count up.
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
              The short version of what Adatnama is and how it runs.
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
              habits will use.
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
              About Adatnama
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
