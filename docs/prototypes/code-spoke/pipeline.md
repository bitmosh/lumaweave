# Code Spoke — Pipeline Trace

Maps the full architecture of the inspector code/IDE spoke feature: how a graph element gets from "user clicks it" to "editor opens at the right line."

**Audited:** 2026-06-03  
**Status:** IDE spoke is **live and fully wired**. Code spoke (`order: 5`) is a **placeholder for v98**.

---

## Two Spokes, One Feature

There are two registered spokes relevant to this feature — easy to conflate:

| Spoke | Order | Status | What it does |
|---|---|---|---|
| **Code** | 5 | Placeholder — "Coming in v98 (Code Spoke arc)" | Not built yet. Shows a coming-soon message. |
| **IDE** | 7 | Active — fully wired | Shows the provenance snippet + "Open in editor" button. This is the live feature. |

The v98 Code Spoke arc is intended to extend or complement the IDE spoke with deeper code analysis (multiple snippets, relationship tracing, AST-level context). The existing IDE spoke + provenance pipeline is the foundation it will build on.

---

## Full Pipeline Trace

### Entry point — Alt+Shift+click on any themed element

```
User Alt+Shift+clicks a DOM element with data-lw-theme-target="<id>"
  ↓
ThemeTargetInspectorOverlay.tsx
  Detects the hotkey + click combination
  Reads target ID from data-lw-theme-target attribute
  Dispatches "inspector:open" CustomEvent with:
    {
      targetId:  "topbar.root",         // the theme target ID
      label:     "Topbar",              // human label from registry
      surface:   "appearance",
      status:    "active",
      anchorX:   <page X coordinate>,   // center of clicked element
      anchorY:   <page Y coordinate>,
    }
```

### Radial menu — InspectorMiniGraph + MiniGraphRenderer

```
InspectorMiniGraph.tsx
  Listens for "inspector:open" on window
  Extracts TargetDescriptor from event.detail
  Subscribes to inspectorSpokeRegistry to get all registered spokes
  Passes { targetDescriptor, spokes } to MiniGraphRenderer
  ↓
MiniGraphRenderer.tsx
  Renders an SVG radial layout:
    - Root node at (anchorX, anchorY) — the clicked element's center
    - 9 spoke nodes arranged in a circle (RADIUS = 70px)
    - Physics simulation: gravity toward ring + repulsion between spokes (DAMPING = 0.85)
  Placeholder spokes render at reduced opacity (0.4 vs 0.7)
  ↓
User clicks the IDE spoke node
  ↓
MiniGraphRenderer sets expandedSpokeId = "ide"
  Unmounts SVG radial, mounts IdeTab React component
```

### IDE tab — provenance lookup and display

```
IdeTab.tsx
  Receives TargetDescriptor as props
  Calls getProvenance(targetDescriptor.targetId)
    → looks up targetId in provenance-manifest.json (bundled at build time)

  If provenance found:
    Renders:
      - targetId in header (e.g., "topbar.root")
      - File path + line number  (e.g., "src/app/AppShell.tsx:381")
      - <pre><code> block with the 7-line snippet
      - "Open in editor" button

  If no provenance:
    Renders empty state:
      "No provenance data found for this target."
      "Regenerate with npm run generate-provenance if you recently added this target."

  On "Open in editor" click:
    Dispatches "inspector:open-in-ide" CustomEvent with:
      {
        filePath:   provenance.filePath,    // "src/app/AppShell.tsx"
        lineNumber: provenance.startLine,   // 381
      }
```

### IDE integration — listener, URL construction, Tauri invoke

```
installOpenInIdeListener.ts  (singleton, wired in AppShell.tsx on mount)
  Listens for "inspector:open-in-ide" on window
  Reads from settings store (synchronous getState()):
    - settings.developer.preferredEditor  → e.g., "vscode"
    - settings.developer.customEditorTemplate
  Calls buildEditorUrl(editorId, filePath, lineNumber, customTemplate)
    → e.g., "vscode://file/src/app/AppShell.tsx:381"
  Invokes Tauri command: open_in_ide({ url })
    → Tauri shell opens the file at that line in the configured editor
  (Silent no-op if Tauri IPC is absent — safe for browser / Playwright)
```

---

## Where the Snippet Data Comes From

Snippets are **generated at build time** — no runtime file I/O or AST analysis. The output is a static JSON manifest bundled with the app.

### Generation script

```
npm run generate-provenance
  ↓
scripts/generate-provenance-manifest.mjs
  1. Globs all src/**/*.tsx
  2. Parses each file with the TypeScript compiler API (ts.createSourceFile)
  3. Walks the AST looking for JSX elements
  4. For each JSX element with data-lw-theme-target="<string-literal>":
       - Anchors to the opening tag (not the full element span)
         Reason: full-element spans on root components like app.shell would
         capture the entire file instead of the declaration site
       - Records startLine, endLine of the opening tag
       - Extracts snippet: 3 lines before + opening tag lines + 3 lines after
       - Skips dynamic attribute values (logs them as warnings)
  5. Writes src/themes/provenance-manifest.json
```

**Must be re-run** whenever a new `data-lw-theme-target` attribute is added to the codebase. The IDE spoke shows an empty state for any target not present in the last-generated manifest.

### Manifest shape

```json
{
  "app.shell": {
    "filePath": "src/app/AppShell.tsx",
    "startLine": 381,
    "endLine": 395,
    "snippet": "  return (\n    <TileProvider>\n      <main\n        className=\"h-screen overflow-hidden text-slate-100\"\n        style={{\n          \"--lw-app-background\": crossfadeTokens.app.background,\n          ..."
  },
  "topbar.root": { ... },
  "graph.frame":  { ... }
}
```

### ProvenanceEntry type

```typescript
export interface ProvenanceEntry {
  filePath:  string;   // relative path from project root
  startLine: number;   // 1-indexed line of the opening tag
  endLine:   number;   // 1-indexed line of the opening tag close
  snippet:   string;   // 7-line window (3 before + tag + 3 after)
}
```

### Runtime registry

```typescript
// src/themes/provenanceRegistry.ts
import manifestData from "./provenance-manifest.json";  // static import

export function getProvenance(targetId: string): ProvenanceEntry | undefined {
  return manifest[targetId];
}

export function getAllProvenance(): Map<string, ProvenanceEntry> {
  return new Map(Object.entries(manifest));
}

// Dev/Playwright probe: window.__lwProvenanceRegistry
```

---

## Editor Template Registry

Ten editors supported. `buildEditorUrl()` does simple `{path}` / `{line}` interpolation.

| Editor ID | Label | URL Template |
|---|---|---|
| `vscode` | VS Code | `vscode://file/{path}:{line}` |
| `windsurf` | Windsurf | `windsurf://file/{path}:{line}` |
| `cursor` | Cursor | `cursor://file/{path}:{line}` |
| `zed` | Zed | `zed://{path}:{line}` |
| `webstorm` | WebStorm | `webstorm://open?file={path}&line={line}` |
| `sublime` | Sublime Text | `subl://{path}:{line}` |
| `vim` | Vim | `null` → falls back to `file://` path |
| `neovim` | Neovim | `null` → falls back to `file://` path |
| `system-default` | System Default | `null` → falls back to `file://` path |
| `custom` | Custom | User-provided template string |

User's preferred editor is persisted in `settings.developer.preferredEditor`. Custom templates go in `settings.developer.customEditorTemplate`.

---

## Spoke Registration

All spokes are registered in AppShell's mount effect (`useEffect([], [])`) in canonical order:

| Call | ID | Order | Status | Tab component |
|---|---|---|---|---|
| `registerColorSpoke()` | `color` | 0 | active | ColorTab |
| `registerGeometrySpoke()` | `geometry` | 1 | active | GeometryTab |
| `registerTypeSpoke()` | `type` | 2 | active | — |
| `registerMotionSpoke()` | `motion` | 3 | active | — |
| `registerLayoutSpoke()` | `layout` | 4 | placeholder | PlaceholderTab |
| `registerCodeSpoke()` | `code` | 5 | **placeholder** | `makePlaceholderTab("code")` |
| `registerApplySpoke()` | `apply` | 6 | active | ApplyTab |
| `registerIdeSpoke()` | `ide` | 7 | **active** | IdeTab |
| `registerHistorySpoke()` | `history` | 8 | active | HistoryTab |

`makePlaceholderTab(spokeId)` is a factory that returns a component bound to a specific spoke ID. It reads the spoke's `placeholderMessage` from the registry at render time (via `t()` for i18n) and optionally lists `intendedTokenPaths` in a collapsed `<details>`.

---

## Key Files

| File | Role |
|---|---|
| `src/themes/ThemeTargetInspectorOverlay.tsx` | Entry point — Alt+Shift+click detection, dispatches `inspector:open` |
| `src/control-plane/inspector/InspectorMiniGraph.tsx` | Listens for `inspector:open`, owns TargetDescriptor state |
| `src/control-plane/inspector/MiniGraphRenderer.tsx` | SVG radial menu + physics layout, routes spoke click → tab component |
| `src/control-plane/inspector/RootNode.tsx` | SVG root node (center of radial) |
| `src/control-plane/inspector/SpokeNode.tsx` | SVG spoke nodes (ring around root) |
| `src/control-plane/inspector/inspector.types.ts` | `TargetDescriptor` type |
| `src/control-plane/inspector/spokes/IdeTab.tsx` | Live tab — renders snippet + "Open in editor" button |
| `src/control-plane/inspector/spokes/registerIdeSpoke.ts` | Registers the IDE spoke |
| `src/control-plane/inspector/spokes/registerCodeSpoke.ts` | Registers the Code spoke (placeholder) |
| `src/control-plane/inspector/spokes/PlaceholderTab.tsx` | Shared placeholder UI; `makePlaceholderTab(id)` factory |
| `src/control-plane/ide/installOpenInIdeListener.ts` | Singleton listener for `inspector:open-in-ide` → Tauri `open_in_ide` |
| `src/control-plane/ide/editorTemplateRegistry.ts` | URL templates for all 10 supported editors |
| `src/themes/provenanceRegistry.ts` | Runtime registry wrapping the JSON manifest |
| `src/themes/provenance-manifest.json` | Build-time output — `targetId → ProvenanceEntry` |
| `scripts/generate-provenance-manifest.mjs` | Build-time AST walker that produces the manifest |
| `src/themes/inspectorSpokeRegistry.ts` | Central registry all spokes register into; reactive `subscribe()` |
| `src/control-plane/inspector/styles/color-tab.css` | Styles for `.lw-ide-tab`, `.lw-ide-snippet`, `.lw-ide-open-button`, etc. |
| `src/control-plane/inspector/styles/placeholder-tab.css` | Styles for placeholder spoke UI |

---

## Custom Events (the seams between components)

| Event name | Dispatched by | Consumed by | Payload |
|---|---|---|---|
| `inspector:open` | `ThemeTargetInspectorOverlay` | `InspectorMiniGraph` | `TargetDescriptor` + anchor coords |
| `inspector:open-in-ide` | `IdeTab` (button click) | `installOpenInIdeListener` | `{ filePath, lineNumber }` |

---

## Test Coverage

| Spec file | What it covers |
|---|---|
| `tests/e2e/inspector-spokes-ide.spec.ts` | IDE spoke appears in radial, clicking it opens tab, tab shows source info, back button returns to ring |
| `tests/e2e/inspector-spokes-ide-provenance.spec.ts` | "Open in editor" button dispatches `inspector:open-in-ide` event |
| `tests/e2e/ide-integration.spec.ts` | Listener installs without error, dispatching event doesn't throw in browser context |

---

## Notes for v98 Code Spoke

The Code spoke placeholder has `placeholderMessage: "Coming in v98 (Code Spoke arc)"`. When building it out, the natural extension points are:

- **Expand `ProvenanceEntry`** — add fields for related nodes (callers, implementors, consumers), multiple snippet sites, or AST-level metadata
- **Extend the generation script** — `generate-provenance-manifest.mjs` already has the TS compiler API wired; deeper analysis (call graphs, import chains) can be added as additional passes
- **`CodeTab` component** — a new tab component alongside `IdeTab.tsx`, registered in `registerCodeSpoke.ts` replacing `makePlaceholderTab("code")`
- **Same event contract** — `inspector:open-in-ide` and the `installOpenInIdeListener` singleton can be reused as-is; the Code tab just dispatches the same event for each snippet link
