import { createFileRoute, Link } from "@tanstack/react-router"
import {
  ArchiveIcon,
  BellIcon,
  CalendarDaysIcon,
  ChartColumnIcon,
  CircleCheckIcon,
  FlameIcon,
  LinkIcon,
  MedalIcon,
  MoonStarIcon,
  NotebookPenIcon,
  SearchIcon,
  SmartphoneIcon,
  SnowflakeIcon,
  TagIcon,
  TrophyIcon,
  UsersIcon,
  WifiOffIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"

export const Route = createFileRoute("/_marketing/features")({
  component: FeaturesPage,
})

const TRACKING_FEATURES = [
  {
    icon: CircleCheckIcon,
    title: "Today's habits, front and center",
    description:
      "Your home screen shows exactly what's planned for today and how much of it is done. Checking in is a single tap.",
  },
  {
    icon: NotebookPenIcon,
    title: "Notes on any check-in",
    description:
      "Add a short note when you check in — how the run felt, what you read, why today was hard. It stays attached to that day.",
  },
  {
    icon: CalendarDaysIcon,
    title: "Honest, same-day tracking",
    description:
      "Check-ins happen on the day itself, not retroactively. Your history shows what you actually did, which is what makes it worth looking at.",
  },
]

const STREAK_FEATURES = [
  {
    icon: FlameIcon,
    title: "Current streak and personal best",
    description:
      "Each habit tracks how long your current run is and the longest you've ever managed, so there's always a number to beat.",
  },
  {
    icon: SnowflakeIcon,
    title: "Automatic freezes",
    description:
      "Give each habit up to five freezes. Miss a scheduled day and a freeze covers it on its own — no button to press, no streak lost. Frozen days are marked in your history so the record stays honest.",
  },
  {
    icon: MedalIcon,
    title: "Milestones at 7, 30, and 100 days",
    description:
      "Every habit shows how close you are to its next milestone, and each one keeps a status — active, at risk, or broken — so you can see at a glance which habit needs attention today.",
  },
]

const ORGANIZE_FEATURES = [
  {
    icon: CalendarDaysIcon,
    title: "Schedules that match real life",
    description:
      "Every day, weekdays, weekends, or any custom mix — gym on Monday, Wednesday, Friday. A habit is only expected on the days you chose, and only those days affect its streak.",
  },
  {
    icon: TagIcon,
    title: "Color-coded categories",
    description:
      "Group habits into categories you create — Health, Learning, Home — each with its own color, so a long list stays scannable.",
  },
  {
    icon: SearchIcon,
    title: "Search and filter",
    description:
      "Find any habit by name or narrow the list to one category when your collection grows.",
  },
  {
    icon: ArchiveIcon,
    title: "Archive instead of delete",
    description:
      "Pausing a habit for a while? Archive it with a note about why. It stops counting against you, keeps its history, and can be restored whenever you're ready.",
  },
]

const CIRCLE_FEATURES = [
  {
    icon: LinkIcon,
    title: "Invite with a link or code",
    description:
      "Create a circle, share the invite link or the short code, and friends are in. You can regenerate the code anytime to close the door.",
  },
  {
    icon: UsersIcon,
    title: "Share only what you choose",
    description:
      "Habits are private by default. You pick which ones each circle can see, and everyone's shared habits appear in one feed with their streaks and today's progress.",
  },
  {
    icon: FlameIcon,
    title: "Borrow a habit that works",
    description:
      "If someone in your circle has a habit you want, copy it into your own list — name, schedule, and target included — and start your own streak on it.",
  },
]

const PROGRESS_FEATURES = [
  {
    icon: ChartColumnIcon,
    title: "Insights and trends",
    description:
      "Charts for your weekly completion rate, streaks by habit, check-ins by habit, and a year-long heatmap of your last 12 months — the kind where the good weeks visibly fill in.",
  },
  {
    icon: CalendarDaysIcon,
    title: "A calendar of your check-ins",
    description:
      "A month view shades each day by how much you completed, so patterns like strong weekdays and quiet Sundays become obvious.",
  },
  {
    icon: TrophyIcon,
    title: "Achievements and levels",
    description:
      "Badges for real moments — your first check-in, a 7-day streak, a perfect week, a 100-day run — plus a level that grows with every check-in.",
  },
]

const EVERYDAY_FEATURES = [
  {
    icon: WifiOffIcon,
    title: "Works offline",
    description:
      "Your habits are stored on your device. Check in with no signal, and everything syncs when you're back online.",
  },
  {
    icon: SmartphoneIcon,
    title: "Install it like an app",
    description:
      "Add Adatnama to your phone's home screen or your desktop and it opens like a native app.",
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
      "Choose light, dark, or follow your device. Your preference is remembered on every device you use.",
  },
]

const SECTIONS = [
  {
    id: "tracking",
    title: "Daily tracking",
    description:
      "The part you'll do every day, kept as light as possible: open, tap, done.",
    features: TRACKING_FEATURES,
  },
  {
    id: "streaks",
    title: "Streaks, freezes, and milestones",
    description:
      "The long game — a streak worth protecting, with enough forgiveness built in that one bad day doesn't undo it.",
    features: STREAK_FEATURES,
  },
  {
    id: "organize",
    title: "Made to fit your week",
    description:
      "Habits on your terms: which days they happen, how they're grouped, and what happens when you need a break.",
    features: ORGANIZE_FEATURES,
  },
  {
    id: "circles",
    title: "Circles: do it together",
    description:
      "Small, private groups for the people keeping each other honest — a running crew, a family, two friends with a bet.",
    features: CIRCLE_FEATURES,
  },
  {
    id: "progress",
    title: "Watch the progress add up",
    description:
      "Daily check-ins turn into weekly rates, streak charts, and a year you can see at a glance.",
    features: PROGRESS_FEATURES,
  },
  {
    id: "everyday",
    title: "Comfortable everywhere",
    description:
      "The practical bits that make it pleasant to live with, online or off, on any screen.",
    features: EVERYDAY_FEATURES,
  },
]

const HABIT_FIELDS = [
  { label: "Name", example: "Morning run" },
  { label: "Target", example: "5 km" },
  { label: "Schedule", example: "Weekdays" },
  { label: "Category", example: "Health" },
  { label: "Reminder", example: "06:30" },
  { label: "Freezes", example: "3" },
]

function FeaturesPage() {
  return (
    <div>
      <section className="border-b border-border">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              Everything Adatnama does
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              A habit tracker has one job: make it easy to show up today and
              satisfying to look back on a month. Here's everything in the app,
              plainly described.
            </p>
          </div>

          <div
            aria-hidden="true"
            className="rounded-xl border border-border bg-card p-6 shadow-xs sm:p-8"
          >
            <div className="flex flex-col gap-4">
              <span className="font-heading font-semibold">
                What a habit looks like
              </span>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {HABIT_FIELDS.map((field) => (
                  <div
                    key={field.label}
                    className="flex flex-col gap-0.5 rounded-lg border border-border px-3 py-2"
                  >
                    <span className="text-xs text-muted-foreground">
                      {field.label}
                    </span>
                    <span className="truncate text-sm font-medium">
                      {field.example}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                Reminder and freezes are optional. Everything can be changed
                later.
              </p>
            </div>
          </div>
        </div>
      </section>

      {SECTIONS.map((section, index) => (
        <section
          key={section.id}
          className={
            index % 2 === 0
              ? "border-b border-border bg-muted/30"
              : "border-b border-border"
          }
        >
          <div className="mx-auto grid w-full max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_1.5fr] lg:gap-16 lg:px-8">
            <div className="flex flex-col items-start gap-4">
              <span className="font-mono text-sm text-muted-foreground">
                0{index + 1}
              </span>
              <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
                {section.title}
              </h2>
              <p className="text-muted-foreground">{section.description}</p>
            </div>

            <div className="flex flex-col gap-8">
              {section.features.map((feature) => (
                <div key={feature.title} className="flex gap-4">
                  <feature.icon className="mt-0.5 size-5 shrink-0 text-primary" />
                  <div className="flex flex-col gap-1.5">
                    <h3 className="font-heading font-medium">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      <section>
        <div className="mx-auto flex w-full max-w-7xl flex-col items-start justify-between gap-6 px-4 py-20 sm:px-6 lg:flex-row lg:items-center lg:px-8">
          <div>
            <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
              The best way to see it is to use it
            </h2>
            <p className="mt-2 max-w-xl text-muted-foreground">
              Add one habit tonight and check in tomorrow morning. That's the
              whole onboarding.
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
              Why we built it
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
