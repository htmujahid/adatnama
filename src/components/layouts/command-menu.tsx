"use client"

import * as React from "react"
import { formatForDisplay } from "@tanstack/hotkeys"
import { useLiveQuery } from "@tanstack/react-db"
import { useHotkey } from "@tanstack/react-hotkeys"
import { useNavigate } from "@tanstack/react-router"
import {
  ArchiveIcon,
  AwardIcon,
  CalendarCheckIcon,
  FlameIcon,
  FolderIcon,
  HomeIcon,
  LaptopIcon,
  ListChecksIcon,
  MoonIcon,
  PlusIcon,
  SearchIcon,
  Settings2Icon,
  SunIcon,
  TrendingUpIcon,
  UserIcon,
  UsersIcon,
} from "lucide-react"

import { CircleColorDot } from "@/components/circles/circle-color-dot"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Kbd } from "@/components/ui/kbd"
import { useThemeMode } from "@/hooks/use-theme-mode"
import { circlesCollection } from "@/lib/collection/circles"
import { habitsCollection } from "@/lib/collection/habits"
import { getHotkeyReference } from "@/lib/hotkeys"

const MAX_RESULTS = 6

export function CommandMenu() {
  const [open, setOpen] = React.useState(false)
  const navigate = useNavigate()
  const { mode, setMode } = useThemeMode()

  const { data: habits = [] } = useLiveQuery({
    query: (q) => q.from({ habit: habitsCollection }),
  })
  const { data: circles = [] } = useLiveQuery({
    query: (q) => q.from({ circle: circlesCollection }),
  })

  useHotkey(getHotkeyReference("command-menu").hotkey!, () => {
    setOpen((value) => !value)
  })

  const runCommand = React.useCallback((action: () => void) => {
    setOpen(false)
    action()
  }, [])

  return (
    <>
      <InputGroup
        role="button"
        tabIndex={0}
        aria-label="Open command menu"
        onClick={() => setOpen(true)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault()
            setOpen(true)
          }
        }}
        className="w-9 shrink-0 cursor-pointer sm:w-56"
      >
        <InputGroupInput
          placeholder="Search or jump to..."
          readOnly
          tabIndex={-1}
          className="hidden cursor-pointer caret-transparent sm:block"
        />
        <InputGroupAddon>
          <SearchIcon className="text-muted-foreground" />
        </InputGroupAddon>
        <InputGroupAddon align="inline-end" className="hidden sm:flex">
          <Kbd>
            {formatForDisplay(getHotkeyReference("command-menu").hotkey!)}
          </Kbd>
        </InputGroupAddon>
      </InputGroup>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Command menu"
        description="Search habits, circles, and pages"
      >
        <Command>
          <CommandInput placeholder="Search habits, circles, or type a command..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>

            <CommandGroup heading="Quick actions">
              <CommandItem
                value="new habit create habit"
                onSelect={() =>
                  runCommand(() => navigate({ to: "/home/habits/new" }))
                }
              >
                <PlusIcon />
                New habit
              </CommandItem>
              <CommandItem
                value="new circle create circle"
                onSelect={() =>
                  runCommand(() => navigate({ to: "/home/circles/new" }))
                }
              >
                <UsersIcon />
                New circle
              </CommandItem>
            </CommandGroup>

            {habits.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Habits">
                  {habits.slice(0, MAX_RESULTS).map((habit) => (
                    <CommandItem
                      key={habit.id}
                      value={`habit ${habit.name}`}
                      onSelect={() =>
                        runCommand(() =>
                          navigate({
                            to: "/home/habits/$habitId",
                            params: { habitId: habit.id },
                          }),
                        )
                      }
                    >
                      <ListChecksIcon />
                      {habit.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}

            {circles.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Circles">
                  {circles.slice(0, MAX_RESULTS).map((circle) => (
                    <CommandItem
                      key={circle.id}
                      value={`circle ${circle.name}`}
                      onSelect={() =>
                        runCommand(() =>
                          navigate({
                            to: "/home/circles/$circleId",
                            params: { circleId: circle.slug },
                          }),
                        )
                      }
                    >
                      <CircleColorDot color={circle.color} />
                      {circle.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}

            <CommandSeparator />
            <CommandGroup heading="Navigate">
              <CommandItem
                value="home dashboard"
                onSelect={() => runCommand(() => navigate({ to: "/home" }))}
              >
                <HomeIcon />
                Home
              </CommandItem>
              <CommandItem
                value="all habits"
                onSelect={() =>
                  runCommand(() => navigate({ to: "/home/habits" }))
                }
              >
                <ListChecksIcon />
                All habits
              </CommandItem>
              <CommandItem
                value="categories"
                onSelect={() =>
                  runCommand(() => navigate({ to: "/home/categories" }))
                }
              >
                <FolderIcon />
                Categories
              </CommandItem>
              <CommandItem
                value="archived habits"
                onSelect={() =>
                  runCommand(() => navigate({ to: "/home/habits/archived" }))
                }
              >
                <ArchiveIcon />
                Archived habits
              </CommandItem>
              <CommandItem
                value="streaks"
                onSelect={() =>
                  runCommand(() => navigate({ to: "/home/streaks" }))
                }
              >
                <FlameIcon />
                Streaks
              </CommandItem>
              <CommandItem
                value="achievements"
                onSelect={() =>
                  runCommand(() => navigate({ to: "/home/achievements" }))
                }
              >
                <AwardIcon />
                Achievements
              </CommandItem>
              <CommandItem
                value="check-ins"
                onSelect={() =>
                  runCommand(() => navigate({ to: "/home/checkins" }))
                }
              >
                <CalendarCheckIcon />
                Check-ins
              </CommandItem>
              <CommandItem
                value="insights"
                onSelect={() =>
                  runCommand(() => navigate({ to: "/home/insights" }))
                }
              >
                <TrendingUpIcon />
                Insights
              </CommandItem>
              <CommandItem
                value="circles"
                onSelect={() =>
                  runCommand(() => navigate({ to: "/home/circles" }))
                }
              >
                <UsersIcon />
                Circles
              </CommandItem>
            </CommandGroup>

            <CommandSeparator />
            <CommandGroup heading="Settings">
              <CommandItem
                value="preferences settings"
                onSelect={() =>
                  runCommand(() => navigate({ to: "/home/preferences" }))
                }
              >
                <Settings2Icon />
                Preferences
              </CommandItem>
              <CommandItem
                value="profile account"
                onSelect={() =>
                  runCommand(() => navigate({ to: "/home/profile" }))
                }
              >
                <UserIcon />
                Profile
              </CommandItem>
            </CommandGroup>

            <CommandSeparator />
            <CommandGroup heading="Theme">
              <CommandItem
                value="light theme"
                data-checked={mode === "light"}
                onSelect={() => runCommand(() => setMode("light"))}
              >
                <SunIcon />
                Light
              </CommandItem>
              <CommandItem
                value="dark theme"
                data-checked={mode === "dark"}
                onSelect={() => runCommand(() => setMode("dark"))}
              >
                <MoonIcon />
                Dark
              </CommandItem>
              <CommandItem
                value="system theme auto"
                data-checked={mode === "auto"}
                onSelect={() => runCommand(() => setMode("auto"))}
              >
                <LaptopIcon />
                System
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  )
}
