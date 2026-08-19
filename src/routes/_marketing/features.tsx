import { createFileRoute, Link } from "@tanstack/react-router"
import {
  ArchiveIcon,
  BellIcon,
  CalendarDaysIcon,
  ChartColumnIcon,
  CheckIcon,
  CircleCheckIcon,
  CopyIcon,
  FlameIcon,
  LinkIcon,
  MedalIcon,
  MoonStarIcon,
  PencilLineIcon,
  SearchIcon,
  SmartphoneIcon,
  SnowflakeIcon,
  TagIcon,
  TrophyIcon,
  UsersIcon,
  WifiOffIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export const Route = createFileRoute("/_marketing/features")({
  component: FeaturesPage,
})

/* ------------------------------ hero visual ------------------------------ */

const FORM_DAYS = [
  { label: "M", active: true },
  { label: "T", active: false },
  { label: "W", active: true },
  { label: "T", active: false },
  { label: "F", active: true },
  { label: "S", active: false },
  { label: "S", active: false },
] as const

function HabitFormVisual() {
  return (
    <div aria-hidden="true" className="relative">
      <div className="absolute -inset-x-10 -top-10 -z-10 h-56 rounded-full bg-primary/15 blur-3xl" />
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xl shadow-foreground/5 sm:p-8">
        <div className="flex flex-col gap-5">
          <div>
            <p className="font-heading font-semibold">New habit</p>
            <p className="text-xs text-muted-foreground">
              Everything can be changed later.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-medium text-muted-foreground">Name</p>
            <div className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
              Morning run
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <p className="text-xs font-medium text-muted-foreground">
                Target
              </p>
              <div className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
                5 km
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <p className="text-xs font-medium text-muted-foreground">
                Category
              </p>
              <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm">
                <span className="size-2 rounded-full bg-emerald-500" />
                Health
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-medium text-muted-foreground">
              Schedule
            </p>
            <div className="flex gap-1.5">
              {FORM_DAYS.map((day, index) => (
                <span
                  key={index}
                  className={cn(
                    "flex size-8 items-center justify-center rounded-lg text-xs font-medium",
                    day.active
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground/50",
                  )}
                >
                  {day.label}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <p className="text-xs font-medium text-muted-foreground">
                Reminder
              </p>
              <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm">
                <BellIcon className="size-3.5 text-muted-foreground" />
                06:30
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <p className="text-xs font-medium text-muted-foreground">
                Freezes
              </p>
              <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm">
                <SnowflakeIcon className="size-3.5 text-sky-600 dark:text-sky-400" />
                3 per streak
              </div>
            </div>
          </div>

          <div className="flex h-9 items-center justify-center rounded-lg bg-primary text-sm font-medium text-primary-foreground">
            Create habit
          </div>
        </div>
      </div>
    </div>
  )
}

/* --------------------------- daily tracking mock -------------------------- */

const WEEK_DOTS = [
  "done",
  "done",
  "done",
  "frozen",
  "done",
  "done",
  "today",
] as const

function DailyTrackingVisual() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-4">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <CheckIcon className="size-4" />
          </span>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="text-sm font-medium">Morning run</span>
            <span className="text-xs text-muted-foreground">
              5 km &middot; done at 6:42
            </span>
          </div>
          <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-primary">
            <FlameIcon className="size-3.5" />
            <span className="font-heading text-xs font-semibold">12</span>
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          {WEEK_DOTS.map((state, index) => (
            <span
              key={index}
              className={cn(
                "flex size-7 items-center justify-center rounded-full",
                state === "done" && "bg-primary text-primary-foreground",
                state === "frozen" &&
                  "bg-sky-500/15 text-sky-600 dark:text-sky-400",
                state === "today" &&
                  "border-2 border-dashed border-primary text-primary",
              )}
            >
              {state === "done" && <CheckIcon className="size-3.5" />}
              {state === "frozen" && <SnowflakeIcon className="size-3.5" />}
            </span>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <PencilLineIcon className="size-3.5" />
          How did it go?
        </div>
        <p className="mt-2 text-sm">
          Cold out, went anyway. Legs felt heavy but finished the 5&nbsp;km.
        </p>
        <div className="mt-3 flex justify-end">
          <span className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
            Save note
          </span>
        </div>
      </div>
    </div>
  )
}

/* ----------------------------- streak section ----------------------------- */

const MILESTONES = [
  { value: "7", label: "First week" },
  { value: "30", label: "A full month" },
  { value: "100", label: "Century club" },
] as const

const FREEZE_WEEK = [
  { day: "Mon", state: "done" },
  { day: "Tue", state: "done" },
  { day: "Wed", state: "done" },
  { day: "Thu", state: "frozen" },
  { day: "Fri", state: "done" },
  { day: "Sat", state: "done" },
  { day: "Sun", state: "today" },
] as const

const STATUS_BADGES = [
  {
    label: "Active",
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    caption: "checked in on schedule",
  },
  {
    label: "At risk",
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    caption: "due today, not done yet",
  },
  {
    label: "Broken",
    className: "bg-muted text-muted-foreground",
    caption: "out of freezes — start again",
  },
] as const

/* --------------------------- organization rows ---------------------------- */

const CATEGORY_ROWS = [
  { name: "Health", color: "bg-emerald-500" },
  { name: "Learning", color: "bg-violet-500" },
  { name: "Home", color: "bg-sky-500" },
] as const

function ScheduleRowVisual() {
  return (
    <div aria-hidden="true" className="flex flex-wrap gap-1.5">
      <span className="rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground">
        Weekdays
      </span>
      <span className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground">
        Weekends
      </span>
      <span className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground">
        Mon &middot; Wed &middot; Fri
      </span>
    </div>
  )
}

function CategoryRowVisual() {
  return (
    <div aria-hidden="true" className="flex flex-wrap gap-1.5">
      {CATEGORY_ROWS.map((category) => (
        <span
          key={category.name}
          className="flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground"
        >
          <span className={cn("size-1.5 rounded-full", category.color)} />
          {category.name}
        </span>
      ))}
    </div>
  )
}

function SearchRowVisual() {
  return (
    <div
      aria-hidden="true"
      className="flex w-56 items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground"
    >
      <SearchIcon className="size-3.5" />
      Search habits&hellip;
    </div>
  )
}

function ArchiveRowVisual() {
  return (
    <div
      aria-hidden="true"
      className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground"
    >
      <ArchiveIcon className="size-3.5" />
      &ldquo;Paused while traveling&rdquo;
      <span className="rounded-md border border-border px-2 py-0.5 font-medium text-foreground">
        Restore
      </span>
    </div>
  )
}

const TERMS_ROWS = [
  {
    icon: CalendarDaysIcon,
    title: "Schedules that match real life",
    description:
      "Every day, weekdays, weekends, or any custom mix. Off-schedule days never count against a streak.",
    visual: ScheduleRowVisual,
  },
  {
    icon: TagIcon,
    title: "Color-coded categories",
    description:
      "Group habits into categories you create, each with its own color, so a long list stays scannable.",
    visual: CategoryRowVisual,
  },
  {
    icon: SearchIcon,
    title: "Search and filter",
    description:
      "Find any habit by name, or narrow the list to one category when your collection grows.",
    visual: SearchRowVisual,
  },
  {
    icon: ArchiveIcon,
    title: "Archive instead of delete",
    description:
      "Pause a habit with a note about why. It keeps its history and can be restored whenever you're ready.",
    visual: ArchiveRowVisual,
  },
] as const

/* ------------------------------ circle visuals ---------------------------- */

function InviteVisual() {
  return (
    <div
      aria-hidden="true"
      className="rounded-2xl border border-border bg-card p-5 shadow-sm"
    >
      <div className="flex flex-col gap-3">
        <p className="font-heading text-sm font-semibold">
          Invite to Morning crew
        </p>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted-foreground">
          <LinkIcon className="size-3.5 shrink-0" />
          <span className="truncate">&hellip;/circles/join/H7KQ2MRX</span>
          <CopyIcon className="ml-auto size-3.5 shrink-0" />
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Or share the code{" "}
            <span className="font-mono font-medium text-foreground">
              H7KQ2MRX
            </span>
          </span>
          <span>Regenerate</span>
        </div>
      </div>
    </div>
  )
}

const CIRCLE_MEMBERS = [
  { name: "Sara", role: "Owner", detail: "2 of 2 today", streak: 21 },
  { name: "Omar", role: "Member", detail: "1 of 2 today", streak: 9 },
  { name: "You", role: "Member", detail: "2 of 3 today", streak: 5 },
] as const

function MembersVisual() {
  return (
    <div
      aria-hidden="true"
      className="rounded-2xl border border-border bg-card p-5 shadow-sm"
    >
      <div className="flex flex-col gap-2">
        {CIRCLE_MEMBERS.map((member) => (
          <div
            key={member.name}
            className="flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-2.5"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted font-heading text-xs font-semibold">
              {member.name.charAt(0)}
            </span>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="flex items-center gap-2 text-sm font-medium">
                {member.name}
                <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                  {member.role}
                </span>
              </span>
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
    </div>
  )
}

const CIRCLE_POINTS = [
  {
    icon: LinkIcon,
    title: "Invite with a link or code",
    description:
      "Share the invite link or the short code. Regenerate it anytime to close the door behind you.",
  },
  {
    icon: UsersIcon,
    title: "Share only what you choose",
    description:
      "Habits are private by default. Toggle each one into a circle — everything else stays yours alone.",
  },
  {
    icon: CopyIcon,
    title: "Borrow a habit that works",
    description:
      "Copy a member's habit into your own list — name, schedule, and target included — and start your own streak.",
  },
] as const

/* ----------------------------- progress visuals --------------------------- */

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
            className={cn("size-3 rounded-xs", HEATMAP_CELL_CLASSES[level])}
          />
        ))}
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Last 12 months</span>
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

const WEEKLY_RATES = [64, 78, 55, 82, 90, 86] as const

function WeeklyRateVisual() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-3">
      <div className="flex items-end justify-between gap-2">
        {WEEKLY_RATES.map((rate, index) => (
          <div key={index} className="flex w-full flex-col items-center gap-1">
            <div className="flex h-16 w-full items-end rounded-sm bg-muted">
              <div
                className={cn(
                  "w-full rounded-sm",
                  index === WEEKLY_RATES.length - 1
                    ? "bg-primary"
                    : "bg-primary/50",
                )}
                style={{ height: `${rate}%` }}
              />
            </div>
            <span className="text-[10px] text-muted-foreground">
              W{index + 1}
            </span>
          </div>
        ))}
      </div>
      <div className="flex items-baseline justify-between text-xs text-muted-foreground">
        <span>Weekly completion</span>
        <span className="font-heading text-sm font-semibold text-foreground">
          86% this week
        </span>
      </div>
    </div>
  )
}

const ACHIEVEMENT_CHIPS = [
  "First step",
  "Week warrior",
  "Perfect week",
  "Team player",
] as const

function AchievementsVisual() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-1.5">
        {ACHIEVEMENT_CHIPS.map((label, index) => (
          <span
            key={label}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
              index < 3
                ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                : "border border-dashed border-border text-muted-foreground/60",
            )}
          >
            <TrophyIcon className="size-3" />
            {label}
          </span>
        ))}
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between text-xs text-muted-foreground">
          <span>Level 4</span>
          <span>120 XP to level 5</span>
        </div>
        <div className="h-1.5 rounded-full bg-muted">
          <div className="h-full w-2/5 rounded-full bg-primary" />
        </div>
      </div>
    </div>
  )
}

const CALENDAR_LEVELS = Array.from({ length: 35 }, (_, i) => {
  const hash = (i * 40503 + 17) % 100
  if (hash < 25) return 0
  if (hash < 50) return 1
  if (hash < 75) return 2
  return 3
})

const CALENDAR_CELL_CLASSES = [
  "bg-muted",
  "bg-primary/30",
  "bg-primary/60",
  "bg-primary",
] as const

function CalendarVisual() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-2">
      <div className="grid max-w-70 grid-cols-7 gap-1">
        {CALENDAR_LEVELS.map((level, index) => (
          <span
            key={index}
            className={cn(
              "flex aspect-square items-center justify-center rounded-md text-[10px]",
              CALENDAR_CELL_CLASSES[level],
              level >= 2 ? "text-primary-foreground" : "text-muted-foreground",
            )}
          >
            {index + 1}
          </span>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Each day shaded by habits completed
      </p>
    </div>
  )
}

/* --------------------------------- page ---------------------------------- */

const EVERYDAY_ITEMS = [
  {
    icon: WifiOffIcon,
    title: "Works offline",
    description:
      "Habits are stored on your device. Check in anywhere; changes sync when you're back online.",
  },
  {
    icon: SmartphoneIcon,
    title: "Installs like an app",
    description:
      "Add it to your phone's home screen or your desktop and it opens like a native app.",
  },
  {
    icon: BellIcon,
    title: "A time for every habit",
    description:
      "Give any habit a reminder time so it has a fixed place in your day — 6:30 for the run, 21:00 for reading.",
  },
  {
    icon: MoonStarIcon,
    title: "Light and dark",
    description:
      "Choose light, dark, or follow your device. Your preference is remembered everywhere you sign in.",
  },
] as const

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm font-semibold tracking-wide text-primary uppercase">
      {children}
    </p>
  )
}

function FeaturesPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]"
        />
        <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-2 lg:gap-20 lg:px-8">
          <div className="flex flex-col items-start gap-6">
            <Eyebrow>Features</Eyebrow>
            <h1 className="font-heading text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              Everything Adatnama does, plainly described
            </h1>
            <p className="max-w-xl text-lg text-pretty text-muted-foreground">
              A habit tracker has one job: make it easy to show up today and
              satisfying to look back on a month. Every feature below serves one
              of those two ends &mdash; starting with how simple a habit is to
              set up.
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
                render={<Link to="/about" />}
              >
                Why we built it
              </Button>
            </div>
          </div>

          <HabitFormVisual />
        </div>
      </section>

      {/* 01 — Daily tracking: split */}
      <section className="border-y border-border bg-muted/30">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-4 py-24 sm:px-6 sm:py-32 lg:grid-cols-2 lg:gap-20 lg:px-8">
          <div className="flex flex-col items-start gap-5">
            <Eyebrow>01 &middot; Daily tracking</Eyebrow>
            <h2 className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              The part you'll do every day, kept light
            </h2>
            <p className="text-lg text-pretty text-muted-foreground">
              Open the app and today's habits are the first thing you see.
              Checking in is one tap &mdash; everything else is optional.
            </p>
            <ul className="flex flex-col gap-4">
              {[
                {
                  title: "One tap marks today done",
                  description:
                    "Tap again to undo. The week strip on every habit shows the last seven days at a glance.",
                },
                {
                  title: "Notes when you want them",
                  description:
                    "Jot down how it went. The note stays attached to that day, for the you of next month.",
                },
                {
                  title: "Same-day only, by design",
                  description:
                    "Check-ins happen on the day itself, not retroactively — which is what makes the history worth trusting.",
                },
              ].map((point) => (
                <li key={point.title} className="flex gap-3">
                  <CircleCheckIcon className="mt-1 size-4 shrink-0 text-primary" />
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

          <DailyTrackingVisual />
        </div>
      </section>

      {/* 02 — Streaks: typographic milestones + week timeline */}
      <section className="mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="max-w-2xl">
          <Eyebrow>02 &middot; Streaks &amp; freezes</Eyebrow>
          <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            A streak worth protecting, with forgiveness built in
          </h2>
          <p className="mt-4 text-lg text-pretty text-muted-foreground">
            Every habit tracks its current run and your personal best. Miss a
            scheduled day and a freeze covers it automatically &mdash; you give
            each habit zero to five, and frozen days stay visible in the
            history.
          </p>
        </div>

        <div className="mt-14 grid gap-8 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-border">
          {MILESTONES.map((milestone) => (
            <div
              key={milestone.value}
              className="flex flex-col items-start gap-1 sm:items-center sm:text-center"
            >
              <p className="font-heading text-5xl font-semibold tracking-tight text-primary sm:text-6xl">
                {milestone.value}
                <span className="ml-1 text-lg font-normal text-muted-foreground">
                  days
                </span>
              </p>
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MedalIcon className="size-3.5 text-amber-600 dark:text-amber-400" />
                {milestone.label}
              </p>
            </div>
          ))}
        </div>

        <div aria-hidden="true" className="mt-14 flex flex-col gap-3">
          <div className="flex gap-1.5">
            {FREEZE_WEEK.map((entry) => (
              <div
                key={entry.day}
                className="flex flex-1 flex-col items-center gap-1.5"
              >
                <span
                  className={cn(
                    "flex h-11 w-full items-center justify-center rounded-lg",
                    entry.state === "done" &&
                      "bg-primary text-primary-foreground",
                    entry.state === "frozen" &&
                      "bg-sky-500/15 text-sky-600 dark:text-sky-400",
                    entry.state === "today" &&
                      "border-2 border-dashed border-primary text-primary",
                  )}
                >
                  {entry.state === "done" && <CheckIcon className="size-4" />}
                  {entry.state === "frozen" && (
                    <SnowflakeIcon className="size-4" />
                  )}
                </span>
                <span className="text-xs text-muted-foreground">
                  {entry.day}
                </span>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Thursday was missed &mdash; a freeze covered it automatically and
            the streak carried on.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2">
          {STATUS_BADGES.map((badge) => (
            <span
              key={badge.label}
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <span
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-xs font-medium",
                  badge.className,
                )}
              >
                {badge.label}
              </span>
              {badge.caption}
            </span>
          ))}
        </div>
      </section>

      {/* 03 — On your terms: divided list rows */}
      <section className="border-y border-border bg-muted/30">
        <div className="mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="max-w-2xl">
            <Eyebrow>03 &middot; Made to fit your week</Eyebrow>
            <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              Habits on your terms
            </h2>
            <p className="mt-4 text-lg text-pretty text-muted-foreground">
              Which days a habit happens, how the list is organized, and what
              happens when you need a break.
            </p>
          </div>

          <div className="mt-10 divide-y divide-border">
            {TERMS_ROWS.map((row) => (
              <div
                key={row.title}
                className="flex flex-col gap-4 py-6 md:flex-row md:items-center md:justify-between md:gap-10"
              >
                <div className="flex gap-4">
                  <row.icon className="mt-1 size-5 shrink-0 text-primary" />
                  <div className="flex flex-col gap-1">
                    <h3 className="font-heading font-semibold">{row.title}</h3>
                    <p className="max-w-xl text-sm text-pretty text-muted-foreground">
                      {row.description}
                    </p>
                  </div>
                </div>
                <div className="shrink-0 md:pl-4">
                  <row.visual />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 04 — Circles: reversed split */}
      <section className="mx-auto grid w-full max-w-7xl items-center gap-12 px-4 py-24 sm:px-6 sm:py-32 lg:grid-cols-2 lg:gap-20 lg:px-8">
        <div className="flex flex-col gap-4 max-lg:order-last">
          <InviteVisual />
          <MembersVisual />
        </div>

        <div className="flex flex-col items-start gap-5">
          <Eyebrow>04 &middot; Circles</Eyebrow>
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Small, private groups that keep you honest
          </h2>
          <p className="text-lg text-pretty text-muted-foreground">
            A running crew, a family, two friends with a bet. Everyone shares
            the habits they choose and sees each other's streaks and daily
            progress.
          </p>
          <ul className="flex flex-col gap-4">
            {CIRCLE_POINTS.map((point) => (
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
      </section>

      {/* 05 — Progress: bento */}
      <section className="border-y border-border bg-muted/30">
        <div className="mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow>05 &middot; Progress</Eyebrow>
            <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              Watch the check-ins add up
            </h2>
            <p className="mt-4 text-lg text-pretty text-muted-foreground">
              Daily taps turn into weekly rates, streak charts, a shaded
              calendar, and a year you can take in at a glance.
            </p>
          </div>

          <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
            <div className="flex min-w-0 flex-col gap-5 rounded-2xl border border-border bg-card p-6 sm:p-8 lg:col-span-4">
              <div className="flex flex-col gap-2">
                <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ChartColumnIcon className="size-5" />
                </span>
                <h3 className="mt-2 font-heading text-lg font-semibold">
                  A year in check-ins
                </h3>
                <p className="text-sm text-pretty text-muted-foreground">
                  A 12-month heatmap of everything you've done, alongside charts
                  for streaks by habit, check-ins by habit, and how your time
                  balances across categories.
                </p>
              </div>
              <div className="my-auto pt-4">
                <HeatmapVisual />
              </div>
            </div>

            <div className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-6 sm:p-8 lg:col-span-2">
              <div className="flex flex-col gap-2">
                <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <CalendarDaysIcon className="size-5" />
                </span>
                <h3 className="mt-2 font-heading text-lg font-semibold">
                  A calendar of your days
                </h3>
                <p className="text-sm text-pretty text-muted-foreground">
                  A month view shades each day by how much you completed.
                </p>
              </div>
              <div className="mt-auto">
                <CalendarVisual />
              </div>
            </div>

            <div className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-6 sm:p-8 lg:col-span-3">
              <div className="flex flex-col gap-2">
                <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ChartColumnIcon className="size-5" />
                </span>
                <h3 className="mt-2 font-heading text-lg font-semibold">
                  Weekly completion, week over week
                </h3>
                <p className="text-sm text-pretty text-muted-foreground">
                  Six weeks of completion rates side by side, with a weekly goal
                  to stay above 80%.
                </p>
              </div>
              <div className="mt-auto">
                <WeeklyRateVisual />
              </div>
            </div>

            <div className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-6 sm:p-8 lg:col-span-3">
              <div className="flex flex-col gap-2">
                <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <TrophyIcon className="size-5" />
                </span>
                <h3 className="mt-2 font-heading text-lg font-semibold">
                  Achievements and levels
                </h3>
                <p className="text-sm text-pretty text-muted-foreground">
                  Eight badges for real moments — your first check-in, a perfect
                  week, a 100-day run — plus a level that grows with every
                  check-in.
                </p>
              </div>
              <div className="mt-auto">
                <AchievementsVisual />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 06 — Everyday comfort: plain checklist */}
      <section className="mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="max-w-2xl">
          <Eyebrow>06 &middot; Everyday comfort</Eyebrow>
          <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Comfortable everywhere you are
          </h2>
          <p className="mt-4 text-lg text-pretty text-muted-foreground">
            The practical bits that make it pleasant to live with &mdash; online
            or off, on any screen, at any hour.
          </p>
        </div>

        <div className="mt-12 grid gap-x-10 gap-y-8 sm:grid-cols-2">
          {EVERYDAY_ITEMS.map((item) => (
            <div key={item.title} className="flex gap-4">
              <item.icon className="mt-1 size-5 shrink-0 text-primary" />
              <div className="flex flex-col gap-1">
                <h3 className="font-heading font-semibold">{item.title}</h3>
                <p className="text-sm text-pretty text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Minimal CTA */}
      <section className="border-t border-border">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-6 px-4 py-20 text-center sm:px-6 sm:py-24 lg:px-8">
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            The best way to see it is to use it
          </h2>
          <p className="max-w-xl text-lg text-pretty text-muted-foreground">
            Add one habit tonight and check in tomorrow morning. That's the
            whole onboarding.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
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
              render={<Link to="/about" />}
            >
              Why we built it
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
