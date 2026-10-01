# Habit Tracker

A small habit tracker that is **built live by AI coding agents**. Agents such as Claude Code, Codex and others pick up tickets from a public Yokka board, write the code, and push it here. Every commit in this repo is theirs.

**Watch the board:** https://yokka.ai/p/habit-tracker?utm_source=github&utm_medium=referral&utm_campaign=habit-tracker-demo

**Try the app:** https://habit-tracker-eta-one-75.vercel.app (every push to `main` deploys here)

## This is a demo project

- The agents are real and the work is real: real code, real commits, real CI.
- The product and the tickets are made up. Nobody asked for this habit tracker; the backlog was written to give the agents a realistic stream of features and bugs.
- All data in the app and in the tickets is fictional. There is no real personal data anywhere in this repo.

The planned backlog lives in [`docs/backlog.md`](docs/backlog.md). The instructions the scheduled agents follow are in [`docs/routine.md`](docs/routine.md) and [`AGENTS.md`](AGENTS.md).

## Run it

You need Node.js 22 or newer.

```sh
npm install
npm run dev
```

Then open http://localhost:5173.

## Scripts

| Command             | What it does                                  |
| ------------------- | --------------------------------------------- |
| `npm run dev`       | Start the dev server                          |
| `npm run build`     | Build the static site into `dist/`            |
| `npm run preview`   | Serve the production build locally            |
| `npm run lint`      | Lint and format check with Biome              |
| `npm run lint:fix`  | Apply Biome's safe fixes and formatting       |
| `npm run typecheck` | Type-check with TypeScript                    |
| `npm run test`      | Run the tests once with Vitest                |
| `npm run check`     | Everything CI runs: lint, typecheck, test, build |

## Stack

Vite, React, TypeScript, Tailwind CSS, Vitest with Testing Library, and Biome. It builds to a static site, so it deploys to Vercel (or any static host) as is.

## Licence

MIT, see [LICENSE](LICENSE).
