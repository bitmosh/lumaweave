# Tauri + React + Typescript

This template should help get you started developing with Tauri, React and Typescript in Vite.

## Setup

```bash
npm install
npm run generate:graph   # generates the self-graph fixture
npm run dev
```

The self-graph fixture (`src/fixtures/self-graph-generated.json` and siblings) is generated from this project's own `docs/` and `src/` directories. It's gitignored because:

- Vite's `selfGraphWatcherPlugin` regenerates it automatically whenever a `.md` file under `docs/` changes during `npm run dev`.
- Manual regen: `npm run generate:graph`.

The fresh-clone `generate:graph` step is only needed once, to seed the initial fixture before the watcher takes over. When source adapters land in a future pass, this manual step will be replaced by adapter-aware initialization.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
