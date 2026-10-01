# Working on Habit Tracker

This repo is a demo project. AI coding agents build a small habit tracker app here by working made-up tickets on a public Yokka board. Everything you do is public: the board, the commits and the CI runs.

## Task tracking: Yokka

Work in this repo is tracked on the Yokka board, project "Habit Tracker" (`habit-tracker`), through the `yokka` MCP server. Pass `habit-tracker` to tools that take a project.

- Before starting work, find its card with `find_cards`, or take the next one with `claim_card` (leave out `card` to claim the next card waiting).
- If something needs doing that isn't on the board yet (a follow-up, a bug you found), file it with `add_card` instead of quietly widening your current card.
- When you're blocked on a decision only a human can make, ask with `request_input` on the card, not only in your output.
- For everything else (claiming, checklists, progress, completing), follow the Yokka server's instructions.
- If the Yokka tools aren't available, stop and say so instead of working without the board.

## Workflow

1. **Claim a card.** One card at a time. Read it with `get_card`: the brief, the checklist, what the cards it was blocked by delivered, and any handoff note.
2. **Plan.** Call `set_checklist` with 3 to 8 short steps before you change anything. If the card already has items, they are acceptance criteria: keep them.
3. **Check main is green first.** If CI on `main` is red, fix that before starting new work.
4. **Work it.** Keep the change scoped to the card. Tick items with `check_items` as you finish them, and `report_progress` at real milestones, one short line each.
5. **Run the checks locally:** `npm run check` (lint, typecheck, test, build). All must pass.
6. **Ship it.** Either push straight to `main`, or open a pull request and merge it once CI is green. Rebase on `origin/main` first so history stays linear. Never force-push `main`.
7. **Complete the card** with `complete_card`: a one-line summary of what changed, and the commit SHA or PR link.

If you can't finish, release the card with a handoff note saying what's done and what's left, so the next agent can pick it up.

## Code conventions

- **Stack:** Vite, React 19, TypeScript (strict), Tailwind CSS 4, Vitest with Testing Library, Biome.
- **Layout:** `src/` holds the app. Put features in `src/features/<feature>/` (components, hooks and tests side by side) and shared pieces in `src/lib/` (pure logic) and `src/components/` (shared UI). Keep files small and focused.
- **Components:** function components with named exports. No default exports. Props typed inline or with a local `type Props`.
- **State:** React state and context. No state library unless a card asks for one. Habit data persists in `localStorage` once that card has shipped; go through the storage module, not `localStorage` directly.
- **Dates:** treat a "day" as the user's local calendar date in `YYYY-MM-DD` form. Put date math in `src/lib/` with tests; don't sprinkle `new Date()` arithmetic through components. Time zones and leap years matter here.
- **Styling:** Tailwind utility classes. Support dark mode once it exists. No inline `style` unless the value is dynamic (like a habit's colour).
- **Accessibility:** real buttons and labels, visible focus, keyboard reachable. Test with roles and accessible names (`getByRole`), not test IDs.
- **Tests:** every card adds or updates tests. Pure logic gets unit tests; UI gets Testing Library tests. A bug fix starts with a failing test that reproduces it.
- **Dependencies:** keep them few. Add one only when it clearly earns its place, and say why in the commit message.
- **Formatting:** Biome decides. Run `npm run lint:fix` before committing. Files use LF line endings.
- **Commits:** one plain line in the imperative or descriptive mood, saying what changed for the user (for example `Habits can be renamed and deleted`). Mention the card ref at the end if you like: `(HT-12)`.

## Content stays fictional

This is a public demo. Everything in it must be made up.

- No real personal data anywhere: not in code, tests, fixtures, seed data, screenshots, commit messages or card comments. Use invented habits ("Drink water", "Read 10 pages") and invented names.
- No real email addresses, phone numbers, API keys or tokens. Don't add analytics, tracking or calls to third-party services.
- Don't describe this project as how any real product is built. It's a demo with made-up tickets.

## Boundaries

- Only touch this repository. Don't change other repos, other Yokka projects, or anything outside this checkout.
- Don't change CI, the licence or deployment settings unless your card is about them.
