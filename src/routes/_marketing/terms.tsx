import { createFileRoute, Link } from "@tanstack/react-router"
import { ScaleIcon, ShieldCheckIcon, UserIcon, UsersIcon } from "lucide-react"

export const Route = createFileRoute("/_marketing/terms")({
  component: TermsPage,
})

const EFFECTIVE_DATE = "August 20, 2026"

const SUMMARY_POINTS = [
  {
    icon: UserIcon,
    text: "Your habit data is yours. We only store and process it to run the app for you.",
  },
  {
    icon: UsersIcon,
    text: "Be decent in circles: you choose what you share, and members can copy a shared habit's setup.",
  },
  {
    icon: ShieldCheckIcon,
    text: "Don't abuse the service, other people, or the systems it runs on.",
  },
  {
    icon: ScaleIcon,
    text: "The service is provided as-is. You can stop using it anytime and ask us to delete your account.",
  },
] as const

const SECTIONS = [
  {
    title: "1. Agreeing to these terms",
    paragraphs: [
      "By creating an account or using Adatnama, you agree to these terms and to the Privacy Policy. If you don't agree, please don't use the service.",
    ],
  },
  {
    title: "2. What Adatnama is",
    paragraphs: [
      "Adatnama is a habit and streak tracker: you create habits, check in on them, and the app tracks streaks, freezes, statistics, and optional shared circles. The service is currently provided free of charge.",
      "Adatnama works offline by keeping a copy of your data on your device, and syncs that data to your account when you're online.",
      "The optional AI planner can draft a habit from a goal you describe. Drafts are generated automatically and can be wrong or a poor fit; review a draft before accepting it. Nothing is added to your account until you do.",
    ],
  },
  {
    title: "3. Your account",
    list: [
      "You can sign in with Google or with a username and password.",
      "Keep your credentials to yourself; you're responsible for what happens under your account.",
      "Give us reasonably accurate account information, and don't impersonate someone else.",
      "You must be at least 13 years old to use Adatnama.",
    ],
  },
  {
    title: "4. Your content",
    paragraphs: [
      "Everything you put into Adatnama remains yours: habits, check-ins, notes, categories, circle names and descriptions, and your profile picture.",
      "So that the app can function, you grant us a limited license to store, process, and transmit that content: syncing it between your devices, computing streaks and statistics from it, showing shared habits to the circles you chose, and delivering the reminders you set. That license exists only to operate the service and ends when your content is deleted.",
    ],
  },
  {
    title: "5. Circles and sharing",
    paragraphs: [
      "Circles are private, invite-only groups. When you share a habit into a circle, its members can see that habit's details, your streak, and your daily progress on it, and they may copy the habit's setup (name, schedule, target) into their own list. Your check-in history is never copied.",
      "Circle owners and admins can manage members, including removing them. Anyone can leave a circle at any time. Whoever shares an invite link or code is responsible for who they let in.",
    ],
  },
  {
    title: "6. Acceptable use",
    list: [
      "Don't use the service for anything unlawful.",
      "Don't harass or abuse other people, including through circle names, descriptions, habit names, or notes shared into a circle.",
      "Don't attempt to break, probe, overload, or gain unauthorized access to the service or other people's accounts.",
      "Don't scrape the service or resell access to it.",
    ],
    paragraphs: [
      "We may remove content or suspend accounts and circles that violate these rules.",
    ],
  },
  {
    title: "7. Availability and changes",
    paragraphs: [
      'We work to keep Adatnama available and your data safe, but the service is provided "as is" and "as available", without warranties of any kind. Features may change, be added, or be removed as the product evolves.',
      "Your on-device copy keeps the app usable during outages, but you should not treat Adatnama as your only record of anything critical.",
    ],
  },
  {
    title: "8. Ending things",
    paragraphs: [
      "You can stop using Adatnama at any time, and you can ask us to delete your account and all data attached to it by contacting the address below.",
      "We may suspend or terminate accounts that violate these terms. Where reasonable, we'll warn you first.",
    ],
  },
  {
    title: "9. Limitation of liability",
    paragraphs: [
      "To the maximum extent permitted by law, Adatnama and its operator are not liable for indirect, incidental, or consequential damages, or for loss of data, arising from your use of the service. Nothing in these terms limits liability that cannot lawfully be limited.",
    ],
  },
  {
    title: "10. Changes to these terms",
    paragraphs: [
      "If these terms change in a way that matters, we will update the effective date at the top of this page. Continued use of Adatnama after a change means you accept the updated terms.",
    ],
  },
] as const

function TermsPage() {
  return (
    <div>
      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <p className="text-sm font-semibold tracking-wide text-primary uppercase">
              Legal
            </p>
            <h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              Terms of Service
            </h1>
            <p className="mt-4 text-muted-foreground">
              Effective {EFFECTIVE_DATE}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto flex max-w-3xl flex-col gap-12">
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
            <h2 className="font-heading font-semibold">The short version</h2>
            <ul className="mt-4 flex flex-col gap-3">
              {SUMMARY_POINTS.map((point, index) => (
                <li key={index} className="flex gap-3">
                  <point.icon className="mt-0.5 size-4 shrink-0 text-primary" />
                  <p className="text-sm text-pretty text-muted-foreground">
                    {point.text}
                  </p>
                </li>
              ))}
            </ul>
            <p className="mt-4 border-t border-border pt-4 text-sm text-muted-foreground">
              The rest of this page says the same thing in more detail.
            </p>
          </div>

          {SECTIONS.map((section) => (
            <div key={section.title} className="flex flex-col gap-3">
              <h2 className="font-heading text-xl font-semibold tracking-tight">
                {section.title}
              </h2>
              {"list" in section && (
                <ul className="flex list-disc flex-col gap-2 pl-5">
                  {section.list.map((item, index) => (
                    <li
                      key={index}
                      className="text-pretty text-muted-foreground"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              )}
              {"paragraphs" in section &&
                section.paragraphs.map((paragraph, index) => (
                  <p key={index} className="text-pretty text-muted-foreground">
                    {paragraph}
                  </p>
                ))}
            </div>
          ))}

          <div className="flex flex-col gap-3">
            <h2 className="font-heading text-xl font-semibold tracking-tight">
              11. Contact
            </h2>
            <p className="text-pretty text-muted-foreground">
              Questions about these terms:{" "}
              <a
                href="mailto:htmujahid@gmail.com"
                className="font-medium text-foreground underline underline-offset-4"
              >
                htmujahid@gmail.com
              </a>
              .
            </p>
          </div>

          <p className="border-t border-border pt-6 text-sm text-muted-foreground">
            See also the{" "}
            <Link
              to="/privacy"
              className="font-medium text-foreground underline underline-offset-4"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </section>
    </div>
  )
}
