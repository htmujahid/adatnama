import { createFileRoute, Link } from "@tanstack/react-router"
import {
  CalendarDaysIcon,
  CheckIcon,
  CircleCheckIcon,
  FlameIcon,
  SnowflakeIcon,
  UsersIcon,
  WifiOffIcon,
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
    icon: CircleCheckIcon,
    title: "One-tap check-ins",
    description:
      "Open the app, tap the habit, done. Today's habits are the first thing you see, with a note field if you want to jot down how it went.",
  },
  {
    icon: FlameIcon,
    title: "Streaks that motivate",
    description:
      "Every habit keeps a current streak and a personal best, with milestones at 7, 30, and 100 days to aim for.",
  },
  {
    icon: SnowflakeIcon,
    title: "Freezes for off days",
    description:
      "Life happens. Each habit comes with a few freezes that automatically cover a missed day, so one slip doesn't erase a month of work.",
  },
  {
    icon: CalendarDaysIcon,
    title: "Your own schedule",
    description:
      "Every day, weekdays, weekends, or exactly the days you pick. A habit only counts on the days you planned it for.",
  },
  {
    icon: UsersIcon,
    title: "Circles with friends",
    description:
      "Invite friends with a link, share the habits you choose, and see each other's streaks. You can even copy a friend's habit into your own list.",
  },
  {
    icon: WifiOffIcon,
    title: "Works offline",
    description:
      "Your habits live on your device, so checking in works on the subway or on a plane. Everything syncs when you're back online.",
  },
]

const STEPS = [
  {
    title: "Add a habit",
    description:
      'Give it a name, pick the days it should happen, and set a target like "20 pages" or "10 minutes" so you know what counts.',
  },
  {
    title: "Check in each day",
    description:
      "One tap marks today done. Check-ins happen on the day itself, so your history reflects what you actually did.",
  },
  {
    title: "Keep the streak alive",
    description:
      "Your streak grows with every planned day you complete. Miss one, and a freeze quietly covers for you until they run out.",
  },
]

const FAQ = [
  {
    question: "What happens if I miss a day?",
    answer:
      "Each habit has a small number of freezes. When you miss a day the habit was scheduled for, a freeze covers it automatically and your streak keeps going. Only when the freezes run out does the streak reset.",
  },
  {
    question: "Do I have to do every habit every day?",
    answer:
      "No. Each habit has its own schedule: every day, weekdays, weekends, or any custom set of days. Days that aren't on the schedule never count against you.",
  },
  {
    question: "Can I track more than one habit?",
    answer:
      "Yes, as many as you like. Each habit keeps its own streak, schedule, and history, and you can group them with color-coded categories to keep the list tidy.",
  },
  {
    question: "Can my friends see my habits?",
    answer:
      "Only if you want them to. Circles are small private groups you join by invite link or code, and you choose exactly which habits to share into each one. Everything else stays private.",
  },
  {
    question: "Does it work without an internet connection?",
    answer:
      "Yes. Once you've signed in, your habits are stored on your device, so you can check in anywhere. Changes sync automatically the next time you're online.",
  },
  {
    question: "Can I use it on my phone?",
    answer:
      "Adatnama runs in the browser and can be installed to your home screen like a regular app, on both phones and desktops.",
  },
]

const TODAY_HABITS = [
  { name: "Morning run", target: "5 km", streak: 12, done: true },
  { name: "Read", target: "20 pages", streak: 34, done: true },
  { name: "Stretch", target: "10 minutes", streak: 5, done: false },
] as const

function TodayMock() {
  return (
    <div
      aria-hidden="true"
      className="rounded-xl border border-border bg-card p-6 shadow-xs sm:p-8"
    >
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="font-heading text-lg font-semibold">Today</span>
            <span className="text-sm text-muted-foreground">
              2 of 3 habits done
            </span>
          </div>
          <Badge variant="secondary">1 left</Badge>
        </div>

        <div className="flex flex-col gap-2">
          {TODAY_HABITS.map((habit) => (
            <div
              key={habit.name}
              className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5"
            >
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full",
                  habit.done
                    ? "bg-primary text-primary-foreground"
                    : "border-2 border-dashed border-muted-foreground/40",
                )}
              >
                {habit.done && <CheckIcon className="size-3.5" />}
              </span>
              <div className="flex min-w-0 flex-1 flex-col">
                <span
                  className={cn(
                    "truncate text-sm font-medium",
                    habit.done && "text-muted-foreground line-through",
                  )}
                >
                  {habit.name}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {habit.target}
                </span>
              </div>
              <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-primary">
                <FlameIcon className="size-3.5" />
                <span className="font-heading text-xs font-semibold">
                  {habit.streak}
                </span>
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-border pt-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground">This week</span>
            <span className="font-heading text-sm font-semibold">
              86% complete
            </span>
          </div>
          <div className="flex flex-col items-end gap-0.5">
            <span className="text-xs text-muted-foreground">
              Longest streak
            </span>
            <span className="font-heading text-sm font-semibold">34 days</span>
          </div>
        </div>
      </div>
    </div>
  )
}

const STREAK_DAYS = [
  "done",
  "done",
  "done",
  "done",
  "done",
  "frozen",
  "done",
  "done",
  "done",
  "done",
  "frozen",
  "done",
  "done",
  "today",
] as const

function StreakGridMock() {
  return (
    <div
      aria-hidden="true"
      className="rounded-xl border border-border bg-card p-6 shadow-xs sm:p-8"
    >
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <span className="font-heading font-semibold">Morning run</span>
          <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-primary">
            <FlameIcon className="size-4" />
            <span className="font-heading text-sm font-semibold">13</span>
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
                day === "today" &&
                  "border-2 border-dashed border-primary text-primary",
              )}
            >
              {day === "done" && <CheckIcon className="size-3.5" />}
              {day === "frozen" && <SnowflakeIcon className="size-3.5" />}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-border pt-4 text-sm">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <SnowflakeIcon className="size-4 text-sky-600 dark:text-sky-400" />1
            of 3 freezes left
          </span>
          <span className="text-muted-foreground">Best: 27 days</span>
        </div>
      </div>
    </div>
  )
}

const CIRCLE_MEMBERS = [
  { name: "Sara", habit: "Morning run", streak: 21, done: 2, total: 2 },
  { name: "Omar", habit: "Read", streak: 9, done: 1, total: 2 },
  { name: "You", habit: "Stretch", streak: 5, done: 2, total: 3 },
] as const

function CircleMock() {
  return (
    <div
      aria-hidden="true"
      className="rounded-xl border border-border bg-card p-6 shadow-xs sm:p-8"
    >
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="font-heading font-semibold">Morning crew</span>
            <span className="text-sm text-muted-foreground">3 members</span>
          </div>
          <Badge variant="secondary">Invite link</Badge>
        </div>

        <div className="flex flex-col gap-2">
          {CIRCLE_MEMBERS.map((member) => (
            <div
              key={member.name}
              className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted font-heading text-xs font-semibold">
                {member.name.charAt(0)}
              </span>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-medium">
                  {member.name}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {member.done} of {member.total} done today
                </span>
              </div>
              <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-primary">
                <FlameIcon className="size-3.5" />
                <span className="font-heading text-xs font-semibold">
                  {member.streak}
                </span>
              </span>
            </div>
          ))}
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
            <Badge variant="secondary">Daily habit &amp; streak tracker</Badge>
            <h1 className="font-heading text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              Build habits that stick, one day at a time.
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground">
              Adatnama keeps your daily habits in one simple list. Check in with
              a tap, watch your streaks grow, and let a freeze cover you on the
              days life gets in the way.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                size="lg"
                nativeButton={false}
                render={<Link to="/login" />}
              >
                Get started
              </Button>
              <Button
                variant="outline"
                size="lg"
                nativeButton={false}
                render={<Link to="/features" />}
              >
                See all features
              </Button>
            </div>
          </div>

          <TodayMock />
        </div>
      </section>

      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
              Everything you need, nothing you don't
            </h2>
            <p className="mt-3 text-muted-foreground">
              A habit tracker should make the daily part easy and the long run
              visible. That's the whole idea.
            </p>
          </div>

          <div className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
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
              How it works
            </h2>
            <p className="text-muted-foreground">
              No setup marathon, no complicated rules. You'll have your first
              habit tracked in under a minute.
            </p>
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link to="/features" />}
            >
              Explore the details
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
        <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
          <StreakGridMock />

          <div className="flex flex-col items-start gap-4 max-lg:order-first">
            <SnowflakeIcon className="size-5 text-sky-600 dark:text-sky-400" />
            <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
              One bad day shouldn't cost you the streak
            </h2>
            <p className="text-muted-foreground">
              Most streaks don't end because people give up. They end because of
              one sick day, one late flight, one evening that got away. So every
              habit in Adatnama comes with freezes: when you miss a scheduled
              day, a freeze covers it automatically and the streak survives.
            </p>
            <p className="text-muted-foreground">
              You decide how many freezes each habit gets, from zero for the
              strict ones up to five for the forgiving ones. Frozen days show up
              honestly in your history, so you always know the real story.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
          <div className="flex flex-col items-start gap-4">
            <UsersIcon className="size-5 text-primary" />
            <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
              Habits are easier with company
            </h2>
            <p className="text-muted-foreground">
              Create a circle for your running group, your family, or a friend
              you're keeping honest. Share an invite link, pick which habits
              each of you shares, and check in on each other's streaks.
            </p>
            <p className="text-muted-foreground">
              See a habit you like in someone's list? Copy it into your own with
              one tap, schedule and all, and start your own streak on it.
            </p>
          </div>

          <CircleMock />
        </div>
      </section>

      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto grid w-full max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_2fr] lg:gap-16 lg:px-8">
          <div>
            <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
              Common questions
            </h2>
            <p className="mt-3 text-muted-foreground">
              The things people usually ask before their first check-in.
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
              Today is a good day to start
            </h2>
            <p className="mt-2 max-w-xl text-muted-foreground">
              Add your first habit and check in. That's day one of the streak.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button nativeButton={false} render={<Link to="/login" />}>
              Get started
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
