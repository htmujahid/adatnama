import { createFileRoute, Link } from "@tanstack/react-router"
import {
  CalendarDaysIcon,
  ChartColumnIcon,
  CheckIcon,
  CircleCheckIcon,
  EyeOffIcon,
  FlameIcon,
  HardDriveIcon,
  LockIcon,
  MedalIcon,
  PencilLineIcon,
  RefreshCwIcon,
  SmartphoneIcon,
  SnowflakeIcon,
  TrophyIcon,
  UsersIcon,
  WifiOffIcon,
} from "lucide-react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export const Route = createFileRoute("/_marketing/")({ component: App })

/* ------------------------------- content ------------------------------- */

const RIBBON_ITEMS = [
  { icon: CircleCheckIcon, label: "One-tap check-ins" },
  { icon: SnowflakeIcon, label: "Automatic streak freezes" },
  { icon: CalendarDaysIcon, label: "Custom schedules" },
  { icon: UsersIcon, label: "Private circles" },
  { icon: WifiOffIcon, label: "Offline-first" },
]

const STEPS = [
  {
    title: "Add a habit",
    description:
      "Name it, pick the days it should happen, and set a target like “20 pages” or “10 minutes” so you always know what counts.",
  },
  {
    title: "Check in each day",
    description:
      "One tap marks today done. Check-ins happen on the day itself, so your history reflects what you actually did.",
  },
  {
    title: "Keep the streak alive",
    description:
      "Every planned day you complete grows the streak. Miss one, and a freeze quietly covers for you until they run out.",
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

/* ---------------------------- hero app frame ---------------------------- */

const TODAY_HABITS = [
  {
    name: "Morning run",
    target: "5 km",
    category: "bg-emerald-500",
    streak: 12,
    done: true,
  },
  {
    name: "Read",
    target: "20 pages",
    category: "bg-violet-500",
    streak: 34,
    done: true,
  },
  {
    name: "Stretch",
    target: "10 minutes",
    category: "bg-sky-500",
    streak: 5,
    done: false,
  },
] as const

const WEEK_BARS = [55, 80, 100, 60, 100, 35, 70] as const
const WEEK_LABELS = ["M", "T", "W", "T", "F", "S", "S"] as const

function HeroFrame() {
  return (
    <div
      aria-hidden="true"
      className="relative mx-auto mt-16 max-w-4xl sm:mt-20"
    >
      {/* glow behind the frame */}
      <div className="absolute -inset-x-8 -top-12 -z-10 h-64 rounded-full bg-primary/15 blur-3xl sm:-inset-x-20" />

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-foreground/10">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <div className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-border" />
            <span className="size-2.5 rounded-full bg-border" />
            <span className="size-2.5 rounded-full bg-border" />
          </div>
          <div className="mx-auto flex items-center gap-1.5 rounded-md bg-muted px-3 py-1 text-xs text-muted-foreground">
            <FlameIcon className="size-3 text-primary" />
            adatnama
          </div>
          <div className="w-9" />
        </div>

        <div className="grid gap-4 p-4 sm:gap-6 sm:p-6 lg:grid-cols-3">
          <div className="flex flex-col gap-3 lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-heading font-semibold">Today</p>
                <p className="text-xs text-muted-foreground">
                  Tuesday &middot; 2 of 3 done
                </p>
              </div>
              <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                1 left
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {TODAY_HABITS.map((habit) => (
                <div
                  key={habit.name}
                  className="flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-2.5"
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
                  <span
                    className={cn(
                      "size-2 shrink-0 rounded-full",
                      habit.category,
                    )}
                  />
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
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-1 flex-col justify-between gap-3 rounded-xl border border-border bg-background p-4">
              <div className="flex items-baseline justify-between">
                <p className="text-xs text-muted-foreground">This week</p>
                <p className="font-heading text-sm font-semibold">86%</p>
              </div>
              <div className="flex items-end justify-between gap-1.5">
                {WEEK_BARS.map((height, index) => (
                  <div
                    key={index}
                    className="flex w-full flex-col items-center gap-1.5"
                  >
                    <div className="flex h-14 w-full items-end rounded-sm bg-muted">
                      <div
                        className={cn(
                          "w-full rounded-sm",
                          index === 6 ? "bg-primary/40" : "bg-primary",
                        )}
                        style={{ height: `${height}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {WEEK_LABELS[index]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2 rounded-xl border border-border bg-background p-4">
              <div className="flex items-baseline justify-between">
                <p className="text-xs text-muted-foreground">Level 4</p>
                <p className="text-xs text-muted-foreground">120 XP to go</p>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div className="h-full w-2/5 rounded-full bg-primary" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* floating detail cards */}
      <div className="absolute -top-8 -right-6 hidden rotate-2 rounded-xl border border-border bg-card p-4 shadow-lg lg:block">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <FlameIcon className="size-4.5" />
          </span>
          <div>
            <p className="font-heading text-sm font-semibold">12-day streak</p>
            <p className="text-xs text-muted-foreground">Best: 27 days</p>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-10 -left-12 hidden -rotate-1 rounded-xl border border-border bg-card p-4 shadow-lg lg:block">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
            <TrophyIcon className="size-4.5" />
          </span>
          <div>
            <p className="font-heading text-sm font-semibold">
              Achievement unlocked
            </p>
            <p className="text-xs text-muted-foreground">
              Week warrior &middot; 7 days in a row
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ----------------------------- bento visuals ----------------------------- */

const CIRCLE_MEMBERS = [
  { name: "Sara", detail: "Morning run · 2 of 2 today", streak: 21 },
  { name: "Omar", detail: "Read · 1 of 2 today", streak: 9 },
  { name: "You", detail: "Stretch · 2 of 3 today", streak: 5 },
] as const

function CircleVisual() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-2">
      {CIRCLE_MEMBERS.map((member) => (
        <div
          key={member.name}
          className="flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-2.5"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted font-heading text-xs font-semibold">
            {member.name.charAt(0)}
          </span>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-medium">{member.name}</span>
            <span className="truncate text-xs text-muted-foreground">
              {member.detail}
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
  )
}

const HEATMAP_COLS = 26
const HEATMAP_LEVELS = Array.from({ length: HEATMAP_COLS * 7 }, (_, i) => {
  const hash = (i * 2654435761) % 100
  if (hash < 18) return 0
  if (hash < 42) return 1
  if (hash < 68) return 2
  if (hash < 88) return 3
  return 4
})

const HEATMAP_CELL_CLASSES = [
  "bg-muted",
  "bg-primary/25",
  "bg-primary/45",
  "bg-primary/70",
  "bg-primary",
] as const

function HeatmapVisual() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-3">
      <div className="grid grid-flow-col grid-rows-7 gap-1 overflow-hidden">
        {HEATMAP_LEVELS.map((level, index) => (
          <span
            key={index}
            className={cn("size-2.5 rounded-xs", HEATMAP_CELL_CLASSES[level])}
          />
        ))}
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Jan</span>
        <span className="flex items-center gap-1">
          Less
          {HEATMAP_CELL_CLASSES.map((cellClass) => (
            <span
              key={cellClass}
              className={cn("size-2 rounded-xs", cellClass)}
            />
          ))}
          More
        </span>
      </div>
    </div>
  )
}

const SCHEDULE_DAYS = [
  { label: "M", active: true },
  { label: "T", active: true },
  { label: "W", active: true },
  { label: "T", active: true },
  { label: "F", active: true },
  { label: "S", active: false },
  { label: "S", active: false },
] as const

function ScheduleVisual() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-1.5">
        <span className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground">
          Every day
        </span>
        <span className="rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground">
          Weekdays
        </span>
        <span className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground">
          Weekends
        </span>
      </div>
      <div className="flex gap-1.5">
        {SCHEDULE_DAYS.map((day, index) => (
          <span
            key={index}
            className={cn(
              "flex size-8 items-center justify-center rounded-lg text-xs font-medium",
              day.active
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground/50",
            )}
          >
            {day.label}
          </span>
        ))}
      </div>
    </div>
  )
}

const MILESTONE_CHIPS = [
  { label: "7 days", unlocked: true },
  { label: "30 days", unlocked: true },
  { label: "100 days", unlocked: false },
] as const

function MilestonesVisual() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-1.5">
        {MILESTONE_CHIPS.map((chip) => (
          <span
            key={chip.label}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
              chip.unlocked
                ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                : "border border-dashed border-border text-muted-foreground/60",
            )}
          >
            <MedalIcon className="size-3" />
            {chip.label}
          </span>
        ))}
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between text-xs text-muted-foreground">
          <span>Century club</span>
          <span>34 / 100</span>
        </div>
        <div className="h-1.5 rounded-full bg-muted">
          <div className="h-full w-1/3 rounded-full bg-primary" />
        </div>
      </div>
    </div>
  )
}

function NoteVisual() {
  return (
    <div
      aria-hidden="true"
      className="flex flex-col gap-2 rounded-xl border border-border bg-background p-3"
    >
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <PencilLineIcon className="size-3.5" />
        Morning run &middot; today
      </div>
      <p className="text-sm">
        Cold out, went anyway. Legs felt heavy but finished the 5&nbsp;km.
      </p>
    </div>
  )
}

/* ------------------------------ freeze visual ---------------------------- */

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

function FreezeVisual() {
  return (
    <div
      aria-hidden="true"
      className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8"
    >
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-heading font-semibold">Morning run</p>
            <p className="text-xs text-muted-foreground">Last two weeks</p>
          </div>
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
                "flex aspect-square items-center justify-center rounded-lg",
                day === "done" && "bg-primary text-primary-foreground",
                day === "frozen" &&
                  "bg-sky-500/15 text-sky-600 dark:text-sky-400",
                day === "today" &&
                  "border-2 border-dashed border-primary text-primary",
              )}
            >
              {day === "done" && <CheckIcon className="size-4" />}
              {day === "frozen" && <SnowflakeIcon className="size-4" />}
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

/* ---------------------------- habit ideas cloud --------------------------- */

const HABIT_IDEAS = [
  { name: "Morning run", color: "bg-emerald-500" },
  { name: "Drink 2L of water", color: "bg-emerald-500" },
  { name: "Read 20 pages", color: "bg-violet-500" },
  { name: "Practice Spanish", color: "bg-violet-500" },
  { name: "Journal", color: "bg-amber-500" },
  { name: "Meditate 10 minutes", color: "bg-amber-500" },
  { name: "Water the plants", color: "bg-sky-500" },
  { name: "Call the parents", color: "bg-sky-500" },
  { name: "10k steps", color: "bg-emerald-500" },
  { name: "An hour on the side project", color: "bg-violet-500" },
  { name: "No phone after 22:00", color: "bg-amber-500" },
  { name: "Cook instead of ordering", color: "bg-sky-500" },
  { name: "Stretch", color: "bg-emerald-500" },
  { name: "Piano practice", color: "bg-violet-500" },
  { name: "In bed by 23:00", color: "bg-amber-500" },
] as const

/* ------------------------------ privacy visual ---------------------------- */

function PrivacyMock() {
  return (
    <div
      aria-hidden="true"
      className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8"
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <LockIcon className="size-4" />
          </span>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="text-sm font-medium">Journal</span>
            <span className="text-xs text-muted-foreground">
              Only you can see this
            </span>
          </div>
          <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
            Private
          </span>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <UsersIcon className="size-4" />
          </span>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="text-sm font-medium">Morning run</span>
            <span className="text-xs text-muted-foreground">
              Shared with Morning crew &middot; 3 people
            </span>
          </div>
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
            Shared
          </span>
        </div>

        <p className="mt-3 border-t border-border pt-4 text-sm text-muted-foreground">
          Sharing is per habit and per circle &mdash; flip it off anytime and
          the habit is yours alone again.
        </p>
      </div>
    </div>
  )
}

/* --------------------------------- page --------------------------------- */

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-sm font-semibold tracking-wide text-primary uppercase">
        {eyebrow}
      </p>
      <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-lg text-pretty text-muted-foreground">
        {description}
      </p>
    </div>
  )
}

function App() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]"
        />

        <div className="mx-auto w-full max-w-7xl px-4 pt-20 pb-24 sm:px-6 sm:pt-28 sm:pb-32 lg:px-8">
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <div className="flex items-center gap-2 rounded-full border border-border bg-card py-1 pr-3 pl-1.5 text-sm text-muted-foreground shadow-xs">
              <span className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <FlameIcon className="size-3" />
              </span>
              Habit tracking, minus the guilt
            </div>

            <h1 className="mt-6 font-heading text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
              Build habits that last.
              <br />
              <span className="text-primary">One day at a time.</span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg text-pretty text-muted-foreground sm:text-xl">
              Adatnama turns daily check-ins into streaks worth protecting
              &mdash; with freezes for the bad days, schedules that fit real
              life, and friends who keep you honest.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button
                size="lg"
                nativeButton={false}
                render={<Link to="/login" />}
              >
                Start your first habit
              </Button>
              <Button
                variant="outline"
                size="lg"
                nativeButton={false}
                render={<Link to="/features" />}
              >
                Explore features
              </Button>
            </div>

            <p className="mt-4 text-sm text-muted-foreground">
              Works offline &middot; Installs on any device &middot; Habits stay
              private
            </p>
          </div>

          <HeroFrame />
        </div>
      </section>

      {/* Feature ribbon */}
      <section className="border-y border-border bg-muted/30">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-4 py-6 sm:px-6 lg:justify-between lg:px-8">
          {RIBBON_ITEMS.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <item.icon className="size-4 text-primary" />
              {item.label}
            </div>
          ))}
        </div>
      </section>

      {/* Bento features */}
      <section className="mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <SectionHeading
          eyebrow="Features"
          title="Everything you need, nothing to babysit"
          description="A habit tracker should make the daily part easy and the long run visible. Every piece of Adatnama serves one of those two jobs."
        />

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <div className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-6 sm:p-8 lg:col-span-3">
            <div className="flex flex-col gap-2">
              <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <UsersIcon className="size-5" />
              </span>
              <h3 className="mt-2 font-heading text-lg font-semibold">
                Circles keep you honest
              </h3>
              <p className="text-sm text-pretty text-muted-foreground">
                Invite friends with a link, share only the habits you choose,
                and see each other's streaks and daily progress. Spot a habit
                you like? Copy it into your own list with one tap.
              </p>
            </div>
            <div className="mt-auto">
              <CircleVisual />
            </div>
          </div>

          <div className="flex min-w-0 flex-col gap-5 rounded-2xl border border-border bg-card p-6 sm:p-8 lg:col-span-3">
            <div className="flex flex-col gap-2">
              <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ChartColumnIcon className="size-5" />
              </span>
              <h3 className="mt-2 font-heading text-lg font-semibold">
                A year you can see
              </h3>
              <p className="text-sm text-pretty text-muted-foreground">
                Daily check-ins add up to a 12-month heatmap, weekly completion
                rates, and streak charts &mdash; the kind of record that makes a
                good month visible at a glance.
              </p>
            </div>
            <div className="mt-auto">
              <HeatmapVisual />
            </div>
          </div>

          <div className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-6 sm:p-8 lg:col-span-2">
            <div className="flex flex-col gap-2">
              <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <CalendarDaysIcon className="size-5" />
              </span>
              <h3 className="mt-2 font-heading text-lg font-semibold">
                Schedules that fit
              </h3>
              <p className="text-sm text-pretty text-muted-foreground">
                Every day, weekdays, weekends, or any mix. A habit only counts
                on the days you planned it for.
              </p>
            </div>
            <div className="mt-auto">
              <ScheduleVisual />
            </div>
          </div>

          <div className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-6 sm:p-8 lg:col-span-2">
            <div className="flex flex-col gap-2">
              <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <TrophyIcon className="size-5" />
              </span>
              <h3 className="mt-2 font-heading text-lg font-semibold">
                Wins worth collecting
              </h3>
              <p className="text-sm text-pretty text-muted-foreground">
                Milestones at 7, 30, and 100 days, badges for real moments, and
                a level that grows with every check-in.
              </p>
            </div>
            <div className="mt-auto">
              <MilestonesVisual />
            </div>
          </div>

          <div className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-6 sm:p-8 lg:col-span-2">
            <div className="flex flex-col gap-2">
              <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <PencilLineIcon className="size-5" />
              </span>
              <h3 className="mt-2 font-heading text-lg font-semibold">
                Notes on any day
              </h3>
              <p className="text-sm text-pretty text-muted-foreground">
                Jot down how it went when you check in. The note stays attached
                to that day, for the you of next month.
              </p>
            </div>
            <div className="mt-auto">
              <NoteVisual />
            </div>
          </div>

          <div className="flex flex-col justify-between gap-6 rounded-2xl border border-border bg-card p-6 sm:flex-row sm:items-center sm:p-8 lg:col-span-6">
            <div className="flex max-w-md flex-col gap-2">
              <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <WifiOffIcon className="size-5" />
              </span>
              <h3 className="mt-2 font-heading text-lg font-semibold">
                Yours, even without a signal
              </h3>
              <p className="text-sm text-pretty text-muted-foreground">
                Your habits live on your device, so checking in works on the
                subway or on a plane. Everything syncs when you're back online.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { icon: WifiOffIcon, label: "Offline check-ins" },
                { icon: RefreshCwIcon, label: "Syncs automatically" },
                { icon: SmartphoneIcon, label: "Installs like an app" },
              ].map((chip) => (
                <span
                  key={chip.label}
                  className="flex items-center gap-2 rounded-full border border-border bg-background px-3.5 py-2 text-sm text-muted-foreground"
                >
                  <chip.icon className="size-4 text-primary" />
                  {chip.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Freeze story */}
      <section className="border-y border-border bg-muted/30">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-4 py-24 sm:px-6 sm:py-32 lg:grid-cols-2 lg:gap-20 lg:px-8">
          <div className="flex flex-col items-start gap-5">
            <p className="text-sm font-semibold tracking-wide text-primary uppercase">
              Streak freezes
            </p>
            <h2 className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              One bad day shouldn't cost you the streak
            </h2>
            <p className="text-lg text-pretty text-muted-foreground">
              Most streaks don't end because people give up. They end because of
              one sick day, one late flight, one evening that got away.
            </p>
            <ul className="flex flex-col gap-4">
              {[
                {
                  title: "Freezes work on their own",
                  description:
                    "Miss a scheduled day and a freeze covers it automatically. No button to press, no streak lost.",
                },
                {
                  title: "You set the strictness",
                  description:
                    "From zero freezes for the non-negotiables up to five for the forgiving ones — per habit.",
                },
                {
                  title: "The record stays honest",
                  description:
                    "Frozen days are marked in your history for what they are, so you always know the real story.",
                },
              ].map((point) => (
                <li key={point.title} className="flex gap-3">
                  <CheckIcon className="mt-1 size-4 shrink-0 text-primary" />
                  <div>
                    <p className="font-medium">{point.title}</p>
                    <p className="text-sm text-pretty text-muted-foreground">
                      {point.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <FreezeVisual />
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <SectionHeading
          eyebrow="How it works"
          title="Tracked in under a minute"
          description="No setup marathon, no complicated rules. Add a habit tonight, check in tomorrow morning — that's the whole onboarding."
        />

        <ol className="mx-auto mt-16 grid max-w-5xl gap-10 sm:grid-cols-3 sm:gap-8">
          {STEPS.map((step, index) => (
            <li key={step.title} className="relative flex flex-col gap-3">
              <div className="flex items-center gap-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-card font-heading text-sm font-semibold shadow-xs">
                  {index + 1}
                </span>
                {index < STEPS.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="hidden h-px flex-1 bg-border sm:block"
                  />
                )}
              </div>
              <h3 className="mt-2 font-heading text-lg font-semibold">
                {step.title}
              </h3>
              <p className="text-sm text-pretty text-muted-foreground">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* Habit ideas */}
      <section className="border-y border-border bg-muted/30">
        <div className="mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <SectionHeading
            eyebrow="Ideas"
            title="What will you track?"
            description="Anything you can do in a day can be a habit. Group yours with color-coded categories you create — here are a few to borrow."
          />

          <div className="mx-auto mt-12 flex max-w-4xl flex-wrap justify-center gap-2.5">
            {HABIT_IDEAS.map((idea) => (
              <span
                key={idea.name}
                className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm shadow-xs"
              >
                <span className={cn("size-2 rounded-full", idea.color)} />
                {idea.name}
              </span>
            ))}
            <span className="flex items-center rounded-full border border-dashed border-border px-4 py-2 text-sm text-muted-foreground">
              + yours
            </span>
          </div>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Each habit gets its own schedule, target, and streak &mdash; so
            &ldquo;10k steps every day&rdquo; and &ldquo;piano on
            weekends&rdquo; live comfortably side by side.
          </p>
        </div>
      </section>

      {/* Privacy */}
      <section className="mx-auto grid w-full max-w-7xl items-center gap-12 px-4 py-24 sm:px-6 sm:py-32 lg:grid-cols-2 lg:gap-20 lg:px-8">
        <div className="flex flex-col items-start gap-5">
          <p className="text-sm font-semibold tracking-wide text-primary uppercase">
            Privacy
          </p>
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Your habits are nobody else's business
          </h2>
          <p className="text-lg text-pretty text-muted-foreground">
            A habit tracker sees the personal stuff &mdash; what you're working
            on, what you're struggling with. Adatnama treats that accordingly.
          </p>
          <ul className="flex flex-col gap-4">
            {[
              {
                icon: LockIcon,
                title: "Private unless you share",
                description:
                  "Every habit stays yours alone until you deliberately share it into a circle — and only that circle sees it.",
              },
              {
                icon: HardDriveIcon,
                title: "Stored on your device",
                description:
                  "Your habits live in a local database on your device and sync to your account — that's what makes offline check-ins work.",
              },
              {
                icon: EyeOffIcon,
                title: "No feed, no followers",
                description:
                  "There's nothing public to perform for. Circles are only the people you invited, and nothing else is visible to anyone.",
              },
            ].map((point) => (
              <li key={point.title} className="flex gap-3">
                <point.icon className="mt-1 size-4 shrink-0 text-primary" />
                <div>
                  <p className="font-medium">{point.title}</p>
                  <p className="text-sm text-pretty text-muted-foreground">
                    {point.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <PrivacyMock />
      </section>

      {/* FAQ */}
      <section className="border-t border-border">
        <div className="mx-auto grid w-full max-w-7xl gap-12 px-4 py-24 sm:px-6 sm:py-32 lg:grid-cols-[1fr_1.6fr] lg:gap-20 lg:px-8">
          <div className="flex flex-col items-start gap-4">
            <p className="text-sm font-semibold tracking-wide text-primary uppercase">
              FAQ
            </p>
            <h2 className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              Common questions
            </h2>
            <p className="text-lg text-pretty text-muted-foreground">
              The things people usually ask before their first check-in. For the
              full tour, see the{" "}
              <Link
                to="/features"
                className="font-medium text-foreground underline underline-offset-4"
              >
                features page
              </Link>
              .
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

      {/* CTA band */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-24 sm:px-6 sm:pb-32 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-16 text-center sm:px-16 sm:py-20">
          <div
            aria-hidden="true"
            className="absolute -top-24 left-1/2 size-72 -translate-x-1/2 rounded-full bg-primary-foreground/15 blur-3xl"
          />
          <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-6">
            <span className="flex size-12 items-center justify-center rounded-xl bg-primary-foreground/15 text-primary-foreground">
              <FlameIcon className="size-6" />
            </span>
            <h2 className="font-heading text-3xl font-semibold tracking-tight text-balance text-primary-foreground sm:text-4xl">
              Today is a good day to start
            </h2>
            <p className="text-lg text-pretty text-primary-foreground/80">
              Add your first habit and check in. That's day one of the streak.
            </p>
            <Button
              size="lg"
              variant="secondary"
              nativeButton={false}
              render={<Link to="/login" />}
            >
              Start your first habit
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
