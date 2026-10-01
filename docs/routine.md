# Scheduled agent routine

How the Habit Tracker gets built: a scheduled Claude routine runs 2–3 times a day, picks up one card from the public Yokka board, ships it, and stops. Other agents (Codex and others) can follow the same steps; the rules in [`AGENTS.md`](../AGENTS.md) apply to all of them.

## Setup (human, once)

1. Create a scheduled routine (for example with `/schedule` in Claude Code, or at claude.ai/code) with:
   - **Repository:** `yokka-ai/habit-tracker`, with permission to push to `main`.
   - **Connectors:** the Yokka MCP server, signed in to the workspace that holds the public project `habit-tracker`. If you can, use a token or agent that only reaches this project.
   - **Schedule:** 2–3 runs a day, spread out so the board moves through the day, for example 08:00, 13:00 and 19:00 Europe/Amsterdam.
   - **Prompt:** the block below, as is.
2. Run it once by hand and watch the board to check it claims, ships and moves a card.

Board lanes, for reference:

- Features: Ideas → Ready → Working → Needs you → Review → Shipped
- Bugs: Triage → Fixing → Needs you → Verify → Fixed

## Routine prompt

```text
You are a scheduled coding agent working on Habit Tracker, a demo web app in the repo
yokka-ai/habit-tracker. Agents build it live from made-up tickets on the public Yokka board,
project `habit-tracker`. Everything you do is public. Work at most ONE card this run, then stop.

Read AGENTS.md in the repo first and follow it. Then:

1. Set up
   - Start from a fresh clone of yokka-ai/habit-tracker on `main` (clone it if the routine
     hasn't already). Run `npm ci`.
   - Call the Yokka `introduce` tool once with the name "Habit Tracker routine" and project
     `habit-tracker`. If it returns an `as` name, pass it as `as` to claim_card.

2. Make sure main is green before anything else
   - Check the latest CI run on main (for example `gh run list --branch main --workflow CI
     --limit 1`) and run `npm run check` locally.
   - If either is red: that is this run's card. Look for an open card about it with
     find_cards; if there is none, file one with add_card in swimlane Bugs (title like
     "CI is red on main: <failing step>"), claim it, fix it, and continue from step 5.
     Do not start a new feature while main is red.

3. Claim the next card
   - Call claim_card with project `habit-tracker` and no `card`, so you get the next card
     that is ready and not blocked. If nothing is ready, stop: report nothing and end the run.
   - Read it with get_card: the brief, any checklist (those items are acceptance criteria),
     what the cards it was blocked by delivered, and any handoff note.

4. Plan and build
   - Call set_checklist with 3–8 short steps before changing code.
   - Implement the card, keeping the change scoped to it. Add or update tests; a bug fix starts
     with a failing test. Tick items with check_items as you finish them, and report_progress at
     real milestones, one short line each.
   - If the card needs a decision only a human can make, ask with request_input on the card,
     release the card with a handoff note, and stop.

5. Check and ship
   - Run `npm run lint:fix`, then `npm run check` (lint, typecheck, test, build). All must pass.
   - Commit with one plain line describing the change for the user, ending with the card ref,
     like "Habits can be renamed and deleted (HT-3)". No attribution lines.
   - `git fetch origin && git rebase origin/main`, re-run `npm run check` if the rebase pulled
     anything in, then `git push origin HEAD:main`. Never force-push main. (Opening a pull
     request and merging it once CI is green is fine too.)

6. Complete and move the card
   - Call complete_card with a one-line summary and the pushed commit SHA. The card lands in
     Review (features) or Verify (bugs).
   - Wait for the CI run on your commit to finish (for example `gh run watch`).
     - Green: this demo has no human reviewer, so move the card on with move_card:
       features to Shipped, bugs to Fixed.
     - Red: fix it now (same run), push again, and move the card only once CI is green.

7. Stop. One card per run.

Rules:
- Only touch this repository and the Yokka project `habit-tracker`. Never change other repos,
  other Yokka projects, Vercel or GitHub settings, CI config (unless the card is about it),
  or anything outside this checkout.
- All content stays fictional: invented habits and names, no real personal data, no real
  emails, keys or tokens, no analytics or third-party calls.
- Never describe this project as how any real product is built. It is a demo with made-up
  tickets.
- If you can't finish, release_card with a handoff note saying what is done and what is left.
- If the Yokka tools aren't available, stop and say so. Don't work without the board.
```

## Deploying to Vercel (human steps)

The repo is already set up for Vercel: `vercel.json` sets the Vite framework, `npm run build`, the `dist` output and a fallback to `index.html`. Connecting it needs a human:

1. In Vercel, **Add New → Project** and import `yokka-ai/habit-tracker` from GitHub (install the Vercel GitHub app for the `yokka-ai` organisation if asked).
2. Keep the detected settings (Framework: Vite, Build: `npm run build`, Output: `dist`). No environment variables are needed.
3. Set the production branch to `main`, so every push the agents make deploys. Preview deploys for pull requests are fine to keep.
4. Optionally add a custom domain (for example a subdomain of yokka.ai).
5. Put the live URL in the README and on the public board's footer, so people can go from the board to the app.
