# Backlog

Made-up but realistic tickets for this demo project. AI coding agents work them one at a time from the public Yokka board: https://yokka.ai/p/habit-tracker

The machine-readable version is [`backlog.json`](backlog.json). Features are listed in the order the app is meant to grow; each bug waits for the feature it depends on.

| Ref | Title | Swimlane | Labels | Blocked by |
| --- | --- | --- | --- | --- |
| HT-1 | Add a habit | Features | core | - |
| HT-2 | Save habits in localStorage | Features | data | HT-1 |
| HT-3 | Edit and delete a habit | Features | core | HT-1 |
| HT-4 | Daily check-off | Features | core, dates | HT-2 |
| HT-5 | Streak counter | Features | core, dates | HT-4 |
| HT-6 | Colours and emoji per habit | Features | ui | HT-3 |
| HT-7 | Weekly view | Features | ui, dates | HT-4 |
| HT-8 | Yearly heatmap | Features | ui, dates, stats | HT-4 |
| HT-9 | Onboarding empty state | Features | ui | HT-1 |
| HT-10 | Dark mode | Features | ui | HT-1 |
| HT-11 | Confetti on a 7-day streak | Features | ui, delight | HT-5 |
| HT-12 | Archive habits | Features | core | HT-3 |
| HT-13 | Habit categories | Features | core, ui | HT-3 |
| HT-14 | Drag to reorder habits | Features | ui | HT-2 |
| HT-15 | Stats page | Features | stats | HT-5 |
| HT-16 | Export as CSV and JSON | Features | data | HT-2 |
| HT-17 | Import from CSV and JSON | Features | data | HT-16 |
| HT-18 | Keyboard shortcuts | Features | ui, a11y | HT-4 |
| HT-19 | Reminders through browser notifications | Features | pwa | HT-2, HT-4 |
| HT-20 | Install as an app and work offline | Features | pwa | HT-2 |
| HT-21 | Translate the app into Dutch | Features | i18n | HT-15 |
| HT-22 | Accessibility pass | Features | a11y | HT-14, HT-18 |
| HT-23 | Streak breaks at midnight in UTC+13 | Bugs | dates | HT-5 |
| HT-24 | Heatmap is off by one in leap years | Bugs | dates, stats | HT-8 |
| HT-25 | Fast double click on check-off counts twice | Bugs | core | HT-4 |
| HT-26 | Streak drops a day after the clocks change | Bugs | dates | HT-5 |
| HT-27 | Export CSV breaks on commas and quotes in habit names | Bugs | data | HT-16, HT-6, HT-17 |
| HT-28 | Archived habits still count in stats | Bugs | stats | HT-15, HT-12 |
| HT-29 | Reminder fires twice with two tabs open | Bugs | pwa | HT-19 |
| HT-30 | Light theme flashes before dark mode loads | Bugs | ui | HT-10 |

## Features

### HT-1 Add a habit

Labels: core

**What:** A form above the list where you type a habit name (like "Drink water") and press Enter or Add. The new habit appears in the list and the empty state goes away. Names are trimmed, can't be empty and are at most 60 characters. Keep habits in React state for now; saving them is the next card.

**Why:** It's the first thing anyone does in a habit tracker, and every later card builds on a habit existing.

**Done when:**
- A `Habit` type exists in `src/lib/` with at least `id`, `name` and `createdAt`
- Adding a habit shows it in the list; an empty or whitespace name is refused with a visible message
- The empty state shows only when there are no habits
- Tests cover adding, trimming and the empty-name case

### HT-2 Save habits in localStorage

Labels: data · Blocked by: HT-1 Add a habit

**What:** Persist habits (and, later, check-ins) in `localStorage` through one small storage module in `src/lib/storage.ts`. Store a versioned object (`{ version: 1, habits: [...] }`) so later cards can migrate it. Corrupt or missing data falls back to an empty list instead of crashing.

**Why:** Without this, a reload wipes everything, and nobody would use the app for more than one visit.

**Done when:**
- Habits survive a page reload
- All reads and writes go through the storage module; components never touch `localStorage` directly
- Invalid JSON or an unknown version loads as empty and logs a warning
- Unit tests for load, save and the corrupt-data fallback

### HT-3 Edit and delete a habit

Labels: core · Blocked by: HT-1 Add a habit

**What:** Each habit row gets an Edit action (rename inline, Enter saves, Escape cancels) and a Delete action with a confirmation step. Deleting removes the habit and all its check-ins.

**Why:** People mistype names and drop habits. Without edit and delete the list only grows.

**Done when:**
- Renaming applies the same validation as adding
- Delete asks for confirmation and can be cancelled
- Deleting a habit also removes its check-ins from storage
- Tests for rename, cancel and delete

### HT-4 Daily check-off

Labels: core, dates · Blocked by: HT-2 Save habits in localStorage

**What:** A checkbox-style toggle on each habit marks it done for today; clicking again un-marks it. Store check-ins as local calendar days (`YYYY-MM-DD`) per habit. Add a `today()` helper in `src/lib/dates.ts` that every later card uses.

**Why:** Checking a habit off is the core loop of the app. Streaks, the weekly view and the heatmap all read these check-ins.

**Done when:**
- Toggling marks and un-marks today, and the state survives a reload
- Check-ins are stored per habit as a set of local `YYYY-MM-DD` strings
- The toggle is a real button with `aria-pressed` and a clear label
- Unit tests for the date helper and the toggle logic

### HT-5 Streak counter

Labels: core, dates · Blocked by: HT-4 Daily check-off

**What:** Show the current streak (consecutive days done, ending today or yesterday) and the best streak next to each habit. A streak isn't broken until a full day is missed: if today isn't done yet, yesterday's streak still counts.

**Why:** Streaks are the main motivation in habit apps. Seeing "12 days" makes people come back tomorrow.

**Done when:**
- Pure `currentStreak` and `bestStreak` functions in `src/lib/` with thorough tests (gaps, today not yet done, single day, no check-ins)
- Each habit row shows the current streak, with the best streak on hover or in smaller text
- Streaks update immediately when today is toggled

### HT-6 Colours and emoji per habit

Labels: ui · Blocked by: HT-3 Edit and delete a habit

**What:** When adding or editing a habit, pick a colour from a fixed palette of 8 and an optional emoji. The colour tints the check-off button and, later, the heatmap; the emoji shows before the name.

**Why:** A list of grey rows is hard to scan. Colour and emoji make each habit recognisable at a glance.

**Done when:**
- Colour and emoji are saved with the habit; existing habits get a default colour (migrate storage to version 2)
- The palette has enough contrast in both light text and filled states
- The emoji picker is a simple list of ~24 common emoji, no new dependency
- Tests for the storage migration and the picker

### HT-7 Weekly view

Labels: ui, dates · Blocked by: HT-4 Daily check-off

**What:** A Week view that shows each habit as a row with seven day cells for the current week, so you can see and toggle the past few days. Arrows move to the previous and next week; you can't check off future days.

**Why:** People forget to tick things off on the day. A week grid lets them catch up and see the shape of their week.

**Done when:**
- Switch between Today and Week from the header
- Past days toggle the same check-ins as the Today view; future days are disabled
- The week starts on Monday
- Tests for building the week's dates and the disabled future days

### HT-8 Yearly heatmap

Labels: ui, dates, stats · Blocked by: HT-4 Daily check-off

**What:** A GitHub-style heatmap of the last 365 days for each habit: 53 columns of weeks, 7 rows of weekdays, a filled square for each day done, in the habit's colour once colours exist. Month labels along the top, a tooltip with the date on hover.

**Why:** The year at a glance is the most satisfying view in a habit tracker, and the one people screenshot.

**Done when:**
- A pure function builds the grid of dates for a given end date; the component only renders it
- Each cell has an accessible label like "3 March: done"
- Renders quickly with several habits (no per-cell state)
- Tests for the grid builder, including where the year starts mid-week

### HT-9 Onboarding empty state

Labels: ui · Blocked by: HT-1 Add a habit

**What:** Replace the plain "No habits yet" message with a friendly first-run screen: one line on what the app does and 4–6 starter suggestions ("Drink water", "Read 10 pages", "Walk 20 minutes"...) that add a habit in one click.

**Why:** A blank screen loses people. Starter habits get them to their first check-off in seconds.

**Done when:**
- Clicking a suggestion adds that habit
- The screen disappears once there is at least one habit and returns if all are deleted
- Tests for adding from a suggestion

### HT-10 Dark mode

Labels: ui · Blocked by: HT-1 Add a habit

**What:** Support a dark theme. Follow the system setting by default, with a toggle in the header that cycles System, Light and Dark and is remembered.

**Why:** Many people check habits last thing at night. A bright white screen at 23:00 is unpleasant.

**Done when:**
- All existing screens look right in dark mode with readable contrast
- The choice is saved and applied on the next visit
- Tests for the theme preference logic

### HT-11 Confetti on a 7-day streak

Labels: ui, delight · Blocked by: HT-5 Streak counter

**What:** When a check-off brings a habit's current streak to 7 (and again at 30 and 100), play a short confetti burst and show a small "7 days in a row!" message. Write the confetti as a small canvas effect, no dependency. Respect `prefers-reduced-motion`: show the message without the animation.

**Why:** A small celebration at a milestone is cheap and makes the app feel alive.

**Done when:**
- Confetti fires once when a milestone is reached, not on every later toggle
- Reduced motion shows the message only
- Tests for the milestone detection

### HT-12 Archive habits

Labels: core · Blocked by: HT-3 Edit and delete a habit

**What:** An Archive action hides a habit from the main list without deleting its history. An "Archived" section (collapsed by default) lists archived habits with Restore and Delete.

**Why:** People pause habits for a season. Deleting would throw away their history; archiving keeps it.

**Done when:**
- Archived habits don't show in Today, Week or the heatmap list
- Restoring brings the habit back with its check-ins and streak intact
- Tests for archive and restore

### HT-13 Habit categories

Labels: core, ui · Blocked by: HT-3 Edit and delete a habit

**What:** Give each habit an optional category (Health, Mind, Work, Home, or a custom one). Show a filter row of category chips above the list; "All" is the default.

**Why:** With ten or more habits the list gets long. Categories let people focus on one area.

**Done when:**
- Category is set when adding or editing a habit and saved
- Filtering by a chip shows only that category; the choice is remembered
- Tests for filtering and for habits without a category

### HT-14 Drag to reorder habits

Labels: ui · Blocked by: HT-2 Save habits in localStorage

**What:** Reorder habits by dragging a handle on each row. Use native pointer events or the HTML drag and drop API; no new dependency unless it clearly earns its place. Provide Move up and Move down actions too, for keyboard users.

**Why:** People want their morning habits at the top. The order should be theirs, not creation order.

**Done when:**
- The order is saved and survives a reload
- Keyboard users can reorder with the Move up and Move down actions
- Tests for the reorder logic

### HT-15 Stats page

Labels: stats · Blocked by: HT-5 Streak counter

**What:** A Stats page with, per habit and overall: completion rate for the last 7, 30 and 365 days, current and best streak, and which weekday is strongest. Plain numbers and simple bars; no chart library.

**Why:** Numbers turn a vague "I'm doing ok" into something people can act on.

**Done when:**
- Reachable from the header; works with zero, one and many habits
- All calculations are pure functions in `src/lib/stats.ts` with tests
- Days before a habit was created don't count as missed

### HT-16 Export as CSV and JSON

Labels: data · Blocked by: HT-2 Save habits in localStorage

**What:** An Export menu offering two downloads: a JSON backup of everything (the storage object as is) and a CSV with one row per check-in (`habit,date`).

**Why:** People don't trust apps that hold their data hostage. Export also makes a backup possible before trying import.

**Done when:**
- Both files download with a dated filename like `habits-2026-10-01.json`
- The CSV has a header row and one row per check-in
- Tests for the CSV and JSON serialisers

### HT-17 Import from CSV and JSON

Labels: data · Blocked by: HT-16 Export as CSV and JSON

**What:** Import a file made by Export. JSON replaces everything after a confirmation; CSV merges check-ins into habits matched by name, creating missing habits. Show a summary ("Imported 3 habits, 214 check-ins") and clear errors for bad files.

**Why:** Export is only half a backup. Import lets people move between browsers and devices.

**Done when:**
- A round trip (export then import) gives back the same data
- Invalid files are refused with a helpful message and change nothing
- Tests for both parsers, including malformed input

### HT-18 Keyboard shortcuts

Labels: ui, a11y · Blocked by: HT-4 Daily check-off

**What:** Add shortcuts: `n` focuses the new-habit field, `1`–`9` toggle today for the habit in that position, `w` and `t` switch Week and Today, `?` opens a shortcuts dialog. Shortcuts never fire while typing in a field.

**Why:** Power users check off five habits every morning. Keys are faster than aiming at buttons.

**Done when:**
- All shortcuts work and are listed in the `?` dialog
- Typing in an input never triggers a shortcut
- Tests for the key handling

### HT-19 Reminders through browser notifications

Labels: pwa · Blocked by: HT-2 Save habits in localStorage; HT-4 Daily check-off

**What:** Let each habit have an optional reminder time. While the app is open (or installed), show a browser notification at that time if the habit isn't done today. Ask for notification permission only when the first reminder is set, never on page load.

**Why:** Forgetting is the main reason streaks break. A nudge at the right time fixes that.

**Done when:**
- Setting a reminder asks for permission once; a denied permission shows how to enable it
- A notification fires at the set time only if the habit isn't done
- Tests for the scheduling logic with fake timers

### HT-20 Install as an app and work offline

Labels: pwa · Blocked by: HT-2 Save habits in localStorage

**What:** Make the app an installable PWA: a web manifest with name, icons and theme colour, and a service worker that caches the app shell so it opens offline. Keep the service worker small and hand-written, or use a well-known Vite plugin.

**Why:** A habit tracker lives on the home screen. It must open instantly, even on a train without signal.

**Done when:**
- Lighthouse reports the app as installable
- After one visit the app loads with the network off
- A new deploy is picked up on the next visit (no stale app forever)

### HT-21 Translate the app into Dutch

Labels: i18n · Blocked by: HT-15 Stats page

**What:** Add a small i18n layer (a typed message catalogue, no heavy dependency) and translate all UI text into Dutch. Pick the language from the browser, with a switcher in the header. Dates and weekday names use `Intl`.

**Why:** It proves the app isn't English-only by accident, and Dutch makes a good first test language.

**Done when:**
- No hard-coded English strings left in components
- Switching language updates the whole UI and is remembered
- A test fails if a key exists in English but not in Dutch

### HT-22 Accessibility pass

Labels: a11y · Blocked by: HT-14 Drag to reorder habits; HT-18 Keyboard shortcuts

**What:** Audit the whole app with a screen reader and keyboard only, and fix what you find: focus order, focus visibility, labels, heading structure, colour contrast in both themes, and announcements for check-offs and streak changes.

**Why:** Everyone should be able to track habits, and the fixes are much cheaper now than later.

**Done when:**
- Every action is reachable and usable with the keyboard alone
- axe (via a test helper) reports no violations on the main screens
- A short `docs/accessibility.md` lists what was checked

## Bugs

### HT-23 Streak breaks at midnight in UTC+13

Labels: dates · Blocked by: HT-5 Streak counter

**What:** A user in Tonga (UTC+13) reports that their streak resets every morning: checking a habit off at 08:00 local time counts it for the previous day. Likely cause: a day key derived from UTC (for example `toISOString().slice(0, 10)`) instead of the local calendar date.

**Why:** Streaks are the heart of the app. Anyone far from UTC loses them for no reason.

**Done when:**
- A test running under `TZ=Pacific/Tongatapu` (and one under `TZ=America/Los_Angeles`) reproduces the bug and then passes
- Every day key in the app comes from the local-date helper

**Depends on:** the Streak counter card. Only reproducible once streaks exist.

### HT-24 Heatmap is off by one in leap years

Labels: dates, stats · Blocked by: HT-8 Yearly heatmap

**What:** In a leap year the heatmap shifts every day after 29 February by one cell, so a check-in on 1 March shows on 2 March and 31 December falls off the end. Likely cause: the grid assumes 365 days or adds days by milliseconds.

**Why:** The heatmap is the screen people share. Wrong squares make the whole app look broken.

**Done when:**
- Tests for grids ending in 2024 and 2028 put 29 February, 1 March and 31 December in the right cells
- Date stepping uses calendar arithmetic, not 86,400,000 ms

**Depends on:** the Yearly heatmap card.

### HT-25 Fast double click on check-off counts twice

Labels: core · Blocked by: HT-4 Daily check-off

**What:** Double-clicking a habit's check-off quickly leaves it checked and the streak one higher than it should be, or adds the same day twice to storage. Likely cause: the toggle reads stale state between two quick updates.

**Why:** Data that quietly inflates breaks trust in every number the app shows.

**Done when:**
- A test firing two clicks in a row ends with the correct state and no duplicate day
- State updates use the functional form and check-ins are stored as a set

**Depends on:** the Daily check-off card.

### HT-26 Streak drops a day after the clocks change

Labels: dates · Blocked by: HT-5 Streak counter

**What:** After daylight saving time starts (for example 29 March 2026 in Europe/Amsterdam), the current streak shows one day less than it should. Likely cause: counting days by dividing a millisecond difference by 24 hours, which is wrong on a 23-hour day.

**Why:** Everyone in a DST time zone loses a streak day twice a year.

**Done when:**
- A test under `TZ=Europe/Amsterdam` across 29 March and 25 October 2026 gives the right streak
- Day differences use calendar dates, not milliseconds

**Depends on:** the Streak counter card.

### HT-27 Export CSV breaks on commas and quotes in habit names

Labels: data · Blocked by: HT-16 Export as CSV and JSON; HT-6 Colours and emoji per habit; HT-17 Import from CSV and JSON

**What:** A habit named `Stretch, then "breathe"` produces a CSV that spreadsheet apps split into extra columns, and importing it back fails. Emoji in names come out garbled in some spreadsheet apps.

**Why:** Export is the backup. A backup that doesn't load back is worse than none.

**Done when:**
- Values with commas, quotes and newlines are quoted per RFC 4180
- The CSV starts with a UTF-8 BOM so emoji survive in spreadsheet apps
- A round-trip test with these names passes

**Depends on:** the Export as CSV and JSON card (and emoji from Colours and emoji per habit).

### HT-28 Archived habits still count in stats

Labels: stats · Blocked by: HT-15 Stats page; HT-12 Archive habits

**What:** The overall completion rate on the Stats page still includes archived habits, so archiving a neglected habit doesn't improve the overall number, and the per-habit list shows archived habits without saying so.

**Why:** Archiving exists so paused habits stop weighing on you. The stats should agree.

**Done when:**
- Overall stats exclude archived habits by default, with a toggle to include them
- Archived habits in the per-habit list are marked as archived
- Tests cover both cases

**Depends on:** the Stats page and Archive habits cards.

### HT-29 Reminder fires twice with two tabs open

Labels: pwa · Blocked by: HT-19 Reminders through browser notifications

**What:** With the app open in two browser tabs, every reminder shows two notifications. Each tab schedules its own timer.

**Why:** Duplicate notifications are the fastest way to get notifications turned off for good.

**Done when:**
- Only one notification shows per reminder, however many tabs are open (for example a notification `tag`, or one leader tab via `BroadcastChannel`)
- A test for the de-duplication logic

**Depends on:** the Reminders through browser notifications card.

### HT-30 Light theme flashes before dark mode loads

Labels: ui · Blocked by: HT-10 Dark mode

**What:** With dark mode on, a hard reload shows a white flash for a moment before the dark theme applies. The theme is set in React after first render.

**Why:** A white flash at night is exactly what dark mode is meant to prevent.

**Done when:**
- The saved theme is applied by a tiny inline script in `index.html` before the app loads
- No flash on reload with the cache disabled

**Depends on:** the Dark mode card.
