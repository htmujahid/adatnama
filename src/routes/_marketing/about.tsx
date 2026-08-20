import { createFileRoute, Link } from "@tanstack/react-router"

import { Button } from "@/components/ui/button"

export const Route = createFileRoute("/_marketing/about")({
  component: AboutPage,
})

const PRINCIPLES = [
  {
    title: "The daily part has to be effortless",
    description:
      "If checking in takes more than a moment, it stops happening. Today's habits are the first thing you see, and marking one done is a single tap.",
  },
  {
    title: "One bad day shouldn't erase a good month",
    description:
      "Strict streaks punish exactly the people who need encouragement. Freezes cover the occasional miss automatically, so the streak measures commitment, not perfection.",
  },
  {
    title: "The record should be honest",
    description:
      "You check in on the day itself, not three days later from memory. Frozen and missed days are shown for what they are. A history you can trust is the only kind worth keeping.",
  },
  {
    title: "Habits fit around your life, not the other way",
    description:
      "Not everything is an every-day habit. Gym three times a week, a family call on weekends: each habit runs on its own schedule, and only those days count.",
  },
  {
    title: "It's easier together",
    description:
      "A friend who can see your streak is a powerful reason to keep it. Circles keep that social pressure friendly, private, and limited to the habits you choose to share.",
  },
  {
    title: "It should work wherever you are",
    description:
      "A habit tracker you can't open on a plane or in a basement gym is a tracker with holes in it. Your habits live on your device and sync when you're back online.",
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
              Adatnama is a daily habit tracker built around a simple loop: you
              do the thing, you tap once, and the streak grows. Whether it's a
              morning run, twenty pages before bed, or calling your parents on
              Sundays, it turns showing up into something you can see.
            </p>
            <p className="mt-4 text-lg text-muted-foreground">
              Streaks work because the feedback is immediate and losing one
              stings. But most trackers make that sting too sharp. One missed
              day resets weeks of effort to zero, which is usually the moment
              people quit. Adatnama keeps the streak motivating and takes the
              cruelty out: freezes absorb the occasional bad day, schedules only
              expect a habit on the days you planned it, and the history always
              tells you the truth about how it went.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
              What we believe about habits
            </h2>
            <p className="mt-3 text-muted-foreground">
              Every feature in the app comes from one of these.
            </p>
          </div>
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
          <div>
            <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
              Sound like your kind of tracker?
            </h2>
            <p className="mt-2 max-w-xl text-muted-foreground">
              Start with one habit. The rest can wait until tomorrow.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button nativeButton={false} render={<Link to="/login" />}>
              Get started
            </Button>
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link to="/features" />}
            >
              Browse the features
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
