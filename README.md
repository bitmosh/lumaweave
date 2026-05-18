# Tauri + React + Typescript

This template should help get you started developing with Tauri, React and Typescript in Vite.

## Setup

```bash
npm install
npm run dev
```

The self-graph fixture (`src/fixtures/self-graph-generated.json` and siblings) is generated from this project's own `docs/` and `src/` directories. It's gitignored because Vite handles regeneration automatically:

- The `selfGraphWatcherPlugin` generates the fixture at dev server startup if it's missing (fresh clone, or anyone `rm`d it).
- The plugin also regenerates whenever a `.md` file under `docs/` changes during `npm run dev`.
- Manual regen on demand: `npm run generate:graph`.

When source adapters land in a future pass, this plugin will be replaced by adapter-aware initialization that handles user-selected source roots.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
