import { createFileRoute, Link } from "@tanstack/react-router"
import { EyeOffIcon, HardDriveIcon, LockIcon, MailIcon } from "lucide-react"

export const Route = createFileRoute("/_marketing/privacy")({
  component: PrivacyPage,
})

const EFFECTIVE_DATE = "August 19, 2026"

const SUMMARY_POINTS = [
  {
    icon: LockIcon,
    text: "Your habits are private by default. Only habits you deliberately share into a circle are visible to that circle's members.",
  },
  {
    icon: HardDriveIcon,
    text: "Your data lives in a local database on your device and syncs to your account so it follows you across devices.",
  },
  {
    icon: EyeOffIcon,
    text: "There are no ads and your data is never sold. We collect only what the app needs to work.",
  },
  {
    icon: MailIcon,
    text: "You can ask us to delete your account and everything attached to it at any time.",
  },
] as const

const SECTIONS = [
  {
    title: "1. What this policy covers",
    paragraphs: [
      "This policy explains what information Adatnama collects, where it is stored, and how it is used. Adatnama is a habit and streak tracker; the data it handles is the data you put into it, plus the minimum needed to run an account.",
      "If anything here is unclear, or you want your data corrected or removed, contact us at the address at the bottom of this page.",
    ],
  },
  {
    title: "2. Information you give us",
    list: [
      "Account details — your name and username, and a password if you set one. If you sign in with Google, we receive your name, email address, and profile picture from your Google account; we never see your Google password.",
      "Profile picture — if you upload one, we store the image so it can be shown on your profile and in your circles.",
      "Habit data — the habits you create (name, description, target, schedule, reminder time, freeze allowance), your check-ins, the notes you attach to them, your categories, and archive notes.",
      "Circle data — the name, description, and color of circles you create, who belongs to them, member roles, and which of your habits you have chosen to share into each circle.",
      "Preferences — defaults for new habits (schedule and freezes). Your theme choice (light or dark) is stored only in your browser, not on our servers.",
      "Notifications — if you enable reminder notifications, your browser gives us a push subscription (a delivery address for notifications), which we store so reminders can reach you.",
    ],
  },
  {
    title: "3. Where your data lives",
    paragraphs: [
      'On your device: Adatnama is built local-first. Your habits and check-ins are kept in a database in your browser\'s storage so the app works fully offline. The "Clear local data" option in Preferences wipes this on-device copy; your account copy is then re-downloaded next time you connect.',
      "On our servers: a synced copy of your account and habit data is stored on Cloudflare's infrastructure, which is what lets your habits follow you across devices and lets circles work. Profile pictures are stored there too.",
      "In transit, data moves between your device and our servers over encrypted connections (HTTPS). Passwords are stored only as cryptographic hashes, never as plain text.",
    ],
  },
  {
    title: "4. How your information is used",
    paragraphs: [
      "We use your data for exactly one purpose: making the app work for you. That means syncing your habits between your devices, computing streaks and statistics, showing shared habits to the circles you chose, and sending you the reminders you asked for.",
      "We do not sell your data, we do not show ads, and we do not share your information with third parties beyond the hosting infrastructure that runs the service.",
    ],
  },
  {
    title: "5. What other people can see",
    paragraphs: [
      "Nothing, unless you share it. Every habit is private to your account until you toggle it into a circle. Members of that circle can then see the habit's name, details, your streak, and your daily progress on it — and can copy the habit's setup (not your history) into their own list.",
      "Un-share a habit or leave a circle and that visibility ends. Your private habits, notes, and everything else in your account are never visible to other users.",
    ],
  },
  {
    title: "6. Cookies and local storage",
    paragraphs: [
      "Adatnama uses a session cookie to keep you signed in, and your browser's local storage for your theme preference and the offline database described above. There are no third-party advertising or tracking cookies.",
    ],
  },
  {
    title: "7. How long we keep data",
    paragraphs: [
      "Your data is kept for as long as your account exists. When you delete a habit, category, or circle, it is deleted — archiving a habit, by contrast, keeps its history so you can restore it later.",
      "To delete your account and everything attached to it, contact us at the address below and we will remove it.",
    ],
  },
  {
    title: "8. Children",
    paragraphs: [
      "Adatnama is not directed at children under 13, and we do not knowingly collect information from them. If you believe a child has created an account, contact us and we will remove it.",
    ],
  },
  {
    title: "9. Changes to this policy",
    paragraphs: [
      "If this policy changes in a way that matters, we will update the effective date at the top of this page. Continued use of Adatnama after a change means you accept the updated policy.",
    ],
  },
] as const

function PrivacyPage() {
  return (
    <div>
      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <p className="text-sm font-semibold tracking-wide text-primary uppercase">
              Legal
            </p>
            <h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              Privacy Policy
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
              {"paragraphs" in section &&
                section.paragraphs.map((paragraph, index) => (
                  <p key={index} className="text-pretty text-muted-foreground">
                    {paragraph}
                  </p>
                ))}
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
            </div>
          ))}

          <div className="flex flex-col gap-3">
            <h2 className="font-heading text-xl font-semibold tracking-tight">
              10. Contact
            </h2>
            <p className="text-pretty text-muted-foreground">
              Questions about this policy, or a request to access, correct, or
              delete your data:{" "}
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
              to="/terms"
              className="font-medium text-foreground underline underline-offset-4"
            >
              Terms of Service
            </Link>
            .
          </p>
        </div>
      </section>
    </div>
  )
}
