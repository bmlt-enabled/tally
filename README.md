# BMLT Tally

# INTRODUCTION

This is a Web app that aggregates the various known [BMLT Root Servers](https://bmlt.app/setting-up-the-bmlt/), and creates a "live" table that displays some basic statistics about those servers.

The tally queries the Aggregator for its results. Virtual servers are not catalogued in the Aggregator, so they are pulled from [here](src/lib/VirtualRoots.ts).

## [It can be seen in action here.](https://tally.bmlt.app)

Bootstrapped using [SvelteKit](https://kit.svelte.dev/). Powered by [Svelte](https://svelte.dev/) and [Vite](https://vitejs.dev/)

## Developing

Once you've installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

## Deploying

New deploys are done with every push to the main branch. You can deploy one manually by running:

```bash
npm run deploy
```
