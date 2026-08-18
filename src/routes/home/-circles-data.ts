export type CircleColor = { id: string; label: string; value: string }

export const CIRCLE_COLORS: ReadonlyArray<CircleColor> = [
  { id: "rose", label: "Rose", value: "#f43f5e" },
  { id: "orange", label: "Orange", value: "#f97316" },
  { id: "amber", label: "Amber", value: "#f59e0b" },
  { id: "emerald", label: "Emerald", value: "#10b981" },
  { id: "teal", label: "Teal", value: "#14b8a6" },
  { id: "sky", label: "Sky", value: "#0ea5e9" },
  { id: "indigo", label: "Indigo", value: "#6366f1" },
  { id: "violet", label: "Violet", value: "#8b5cf6" },
]

export type CircleMemberHabit = {
  id: string
  name: string
  category: string
  description: string
  target: string
  frequency: string
  streak: number
  done: boolean
}

export type CircleMember = {
  id: string
  name: string
  role: "owner" | "member"
  habits: ReadonlyArray<CircleMemberHabit>
}

export type Circle = {
  id: string
  name: string
  description: string
  color: string
  inviteCode: string
  members: ReadonlyArray<CircleMember>
}

export const CIRCLES = [
  {
    id: "family",
    name: "Family",
    description: "Keeping each other honest on the everyday stuff.",
    color: "#f43f5e",
    inviteCode: "FAM7K2Q9",
    members: [
      {
        id: "amara",
        name: "Amara Osei",
        role: "owner",
        habits: [
          {
            id: "evening-walk",
            name: "Evening walk",
            category: "Fitness",
            description: "Wind down with a walk around the neighborhood.",
            target: "30 minutes",
            frequency: "Daily",
            streak: 14,
            done: true,
          },
          {
            id: "family-dinner",
            name: "Family dinner",
            category: "Wellness",
            description: "Eat one meal together, screens off.",
            target: "1 meal",
            frequency: "Daily",
            streak: 22,
            done: true,
          },
        ],
      },
      {
        id: "malik",
        name: "Malik Chen",
        role: "member",
        habits: [
          {
            id: "read-together",
            name: "Read together",
            category: "Learning",
            description: "15 minutes of reading before bed.",
            target: "15 minutes",
            frequency: "Daily",
            streak: 6,
            done: false,
          },
          {
            id: "no-screens-after-9pm",
            name: "No screens after 9pm",
            category: "Wellness",
            description: "Phones away an hour before bed.",
            target: "0 minutes",
            frequency: "Daily",
            streak: 3,
            done: true,
          },
        ],
      },
    ],
  },
  {
    id: "friends",
    name: "Friends",
    description: "Casual accountability for the gym and the kitchen.",
    color: "#0ea5e9",
    inviteCode: "FRD3M8XZ",
    members: [
      {
        id: "jordan",
        name: "Jordan Kim",
        role: "owner",
        habits: [
          {
            id: "gym-session",
            name: "Gym session",
            category: "Fitness",
            description: "Push/pull/legs split at the gym.",
            target: "45 minutes",
            frequency: "Weekdays",
            streak: 9,
            done: true,
          },
          {
            id: "meal-prep-sunday",
            name: "Meal prep Sunday",
            category: "Nutrition",
            description: "Prep lunches for the week.",
            target: "5 meals",
            frequency: "Weekly",
            streak: 5,
            done: false,
          },
        ],
      },
      {
        id: "priya",
        name: "Priya Nair",
        role: "member",
        habits: [
          {
            id: "run-5k",
            name: "Run 5k",
            category: "Fitness",
            description: "Keep the weekend long run going.",
            target: "5 km",
            frequency: "Weekends",
            streak: 4,
            done: false,
          },
        ],
      },
    ],
  },
  {
    id: "accountability-partners",
    name: "Accountability Partners",
    description: "Focused check-ins on deep work and discipline.",
    color: "#8b5cf6",
    inviteCode: "ACC9P4LN",
    members: [
      {
        id: "noah",
        name: "Noah Fischer",
        role: "owner",
        habits: [
          {
            id: "deep-work-block",
            name: "Deep work block",
            category: "Learning",
            description: "90 minutes of focused, distraction-free work.",
            target: "90 minutes",
            frequency: "Weekdays",
            streak: 11,
            done: true,
          },
          {
            id: "journal",
            name: "Journal",
            category: "Mindful",
            description: "Write three lines before bed.",
            target: "3 lines",
            frequency: "Daily",
            streak: 30,
            done: true,
          },
        ],
      },
      {
        id: "quinn",
        name: "Quinn Alvarez",
        role: "member",
        habits: [
          {
            id: "cold-shower",
            name: "Cold shower",
            category: "Wellness",
            description: "End the shower with 60 seconds cold.",
            target: "60 seconds",
            frequency: "Daily",
            streak: 17,
            done: true,
          },
        ],
      },
    ],
  },
  {
    id: "book-club",
    name: "Book Club",
    description: "One chapter at a time, together.",
    color: "#f59e0b",
    inviteCode: "BKC5T2WQ",
    members: [
      {
        id: "sofia",
        name: "Sofia Reyes",
        role: "owner",
        habits: [
          {
            id: "read-30-pages",
            name: "Read 30 pages",
            category: "Learning",
            description: "Keep pace with this month's pick.",
            target: "30 pages",
            frequency: "Daily",
            streak: 8,
            done: true,
          },
        ],
      },
    ],
  },
] as const satisfies ReadonlyArray<Circle>
