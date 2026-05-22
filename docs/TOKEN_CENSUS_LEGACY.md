# Token Census: LEGACY

Legacy tokens (CSS custom properties + parallel system tokens).

> **v88c migration (2026-05-22):** The following legacy short-form CSS variable names were
> migrated to canonical dashed-from-token-path names:
> `--lw-app-bg` → `--lw-app-background`, `--lw-panel-bg` → `--lw-panel-background`,
> `--lw-glow` → `--lw-app-glow`, `--lw-card-bg` → `--lw-panel-background`,
> `--lw-card-border` → `--lw-panel-border`. All writers and consumers updated atomically.

| Token Name | Source Files | Consumer Files | System |
|---|---|---|---|
| --lw-accent | src/app/AppShell.tsx:329 | src/app/AppShell.tsx | CSS var |
| --lw-panel-border | src/app/AppShell.tsx:326, src/styles/lumaweave-visual-handles.css:91 | src/app/AppShell.tsx, src/styles/lumaweave-visual-handles.css | CSS var |
| --lw-text-muted | src/app/AppShell.tsx:328, src/app/AppShell.tsx:353, src/styles/lumaweave-visual-handles.css:216, src/styles/lumaweave-visual-handles.css:217 | src/app/AppShell.tsx, src/styles/lumaweave-visual-handles.css | CSS var |
| --lw-text-primary | src/app/AppShell.tsx:327, src/control-plane/command-deck/CommandDeckPanel.tsx:24, src/control-plane/command-deck/CommandDeckShell.tsx:31, src/control-plane/command-deck/CommandDeckShell.tsx:61, src/control-plane/command-deck/CommandDeckShell.tsx:129, src/control-plane/command-deck/CommandDeckShell.tsx:152, src/control-plane/command-deck/CommandDeckShell.tsx:195 | src/app/AppShell.tsx, src/control-plane/command-deck/CommandDeckPanel.tsx, src/control-plane/command-deck/CommandDeckShell.tsx | CSS var |
| --lw-visual-accent | src/app/AppShell.tsx:330, src/app/AppShell.tsx:349, src/styles/lumaweave-visual-handles.css:21, src/styles/lumaweave-visual-handles.css:126, src/styles/lumaweave-visual-handles.css:135, src/styles/lumaweave-visual-handles.css:209, src/styles/lumaweave-visual-handles.css:214, src/styles/lumaweave-visual-handles.css:215, src/styles/lumaweave-visual-handles.css:232 | src/app/AppShell.tsx, src/styles/lumaweave-visual-handles.css | CSS var |
| --lw-visual-accent-hover | src/styles/lumaweave-visual-handles.css:23 | src/styles/lumaweave-visual-handles.css | CSS var |
| --lw-visual-accent-soft | src/styles/lumaweave-visual-handles.css:22 | src/styles/lumaweave-visual-handles.css | CSS var |
| --lw-visual-badge-bg | src/styles/lumaweave-visual-handles.css:34, src/styles/lumaweave-visual-handles.css:156 | src/styles/lumaweave-visual-handles.css | CSS var |
| --lw-visual-badge-text | src/styles/lumaweave-visual-handles.css:35, src/styles/lumaweave-visual-handles.css:157 | src/styles/lumaweave-visual-handles.css | CSS var |
| --lw-visual-button-active-bg | src/styles/lumaweave-visual-handles.css:45, src/styles/lumaweave-visual-handles.css:130, src/styles/lumaweave-visual-handles.css:134 | src/styles/lumaweave-visual-handles.css | CSS var |
| --lw-visual-button-bg | src/styles/lumaweave-visual-handles.css:41, src/styles/lumaweave-visual-handles.css:114 | src/styles/lumaweave-visual-handles.css | CSS var |
| --lw-visual-button-border | src/styles/lumaweave-visual-handles.css:42, src/styles/lumaweave-visual-handles.css:113 | src/styles/lumaweave-visual-handles.css | CSS var |
| --lw-visual-button-hover-bg | src/styles/lumaweave-visual-handles.css:44, src/styles/lumaweave-visual-handles.css:125 | src/styles/lumaweave-visual-handles.css | CSS var |
| --lw-visual-button-text | src/styles/lumaweave-visual-handles.css:43, src/styles/lumaweave-visual-handles.css:115 | src/styles/lumaweave-visual-handles.css | CSS var |
| --lw-visual-card-bg | src/styles/lumaweave-visual-handles.css:30, src/styles/lumaweave-visual-handles.css:101 | src/styles/lumaweave-visual-handles.css | CSS var |
| --lw-visual-card-border | src/styles/lumaweave-visual-handles.css:31, src/styles/lumaweave-visual-handles.css:100 | src/styles/lumaweave-visual-handles.css | CSS var |
| --lw-visual-divider-color | src/styles/lumaweave-visual-handles.css:38, src/styles/lumaweave-visual-handles.css:164 | src/styles/lumaweave-visual-handles.css | CSS var |
| --lw-visual-glow-color | src/styles/lumaweave-visual-handles.css:52, src/styles/lumaweave-visual-handles.css:177, src/styles/lumaweave-visual-handles.css:184 | src/styles/lumaweave-visual-handles.css | CSS var |
| --lw-visual-glow-spread | src/styles/lumaweave-visual-handles.css:53, src/styles/lumaweave-visual-handles.css:177, src/styles/lumaweave-visual-handles.css:184 | src/styles/lumaweave-visual-handles.css | CSS var |
| --lw-visual-graph-frame-bg | src/styles/lumaweave-visual-handles.css:48, src/styles/lumaweave-visual-handles.css:79 | src/styles/lumaweave-visual-handles.css | CSS var |
| --lw-visual-graph-frame-border | src/styles/lumaweave-visual-handles.css:49, src/styles/lumaweave-visual-handles.css:80 | src/styles/lumaweave-visual-handles.css | CSS var |
| --lw-visual-panel-bg | src/styles/lumaweave-visual-handles.css:26, src/styles/lumaweave-visual-handles.css:65, src/styles/lumaweave-visual-handles.css:72, src/styles/lumaweave-visual-handles.css:92 | src/styles/lumaweave-visual-handles.css | CSS var |
| --lw-visual-panel-border | src/styles/lumaweave-visual-handles.css:27, src/styles/lumaweave-visual-handles.css:91 | src/styles/lumaweave-visual-handles.css | CSS var |
| allMediumMultiplier | none | none | graphVisualTokens.ts |
| edge | none | none | graphVisualTokens.ts |
| edgeColor | none | none | graphVisualTokens.ts |
| edgeColorScale | none | none | graphVisualTokens.ts |
| edgeLabelColor | none | none | graphVisualTokens.ts |
| edgeLabelFont | none | none | graphVisualTokens.ts |
| edgeSize | none | none | graphVisualTokens.ts |
| hovered | none | none | graphVisualTokens.ts |
| labelFont | none | none | graphVisualTokens.ts |
| labelFontSize | none | none | graphVisualTokens.ts |
| labelRenderedSizeThreshold | none | none | graphVisualTokens.ts |
| labelTruncation | none | none | graphVisualTokens.ts |
| maxEdgeLabelLength | none | none | graphVisualTokens.ts |
| node | none | none | graphVisualTokens.ts |
| nodeColor | none | none | graphVisualTokens.ts |
| nodeColorScale | none | none | graphVisualTokens.ts |
| nodeLabelColor | none | none | graphVisualTokens.ts |
| nodeSizeMultiplier | none | none | graphVisualTokens.ts |
| relationshipEndpoint | none | none | graphVisualTokens.ts |
| secondary | none | none | graphVisualTokens.ts |
| sigmaConfig | none | none | graphVisualTokens.ts |
| tertiary | none | none | graphVisualTokens.ts |
