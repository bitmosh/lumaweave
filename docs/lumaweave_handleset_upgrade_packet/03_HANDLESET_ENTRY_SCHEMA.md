# Handleset Entry Schema

## Status Values

```ts
export type HandleStatus =
  | "active"
  | "partial"
  | "planned"
  | "deprecated"
  | "internal"
  | "experimental";
```

## Status Meanings

```txt
active       = visible and runtime-wired
partial      = exists but not fully live or not fully tested
planned      = docs-only or visibly marked planned/disabled
deprecated   = kept for compatibility, not used
internal     = not user-facing
experimental = behind dev/debug mode
```

## TypeScript Shape

```ts
export interface HandlesetEntry<T = unknown> {
  handle: string;
  label: string;
  category: string;
  defaultValue: T;
  controlType: "range" | "select" | "color" | "checkbox" | "text";
  status: HandleStatus;

  source: {
    schemaPath: string;
    defaultsPath: string;
    registryPath: string;
  };

  runtime?: {
    target: string;
    file: string;
    updateMethod: string;
    liveUpdate: boolean;
  };

  qa?: {
    checklist?: string;
    playwright?: string[];
    manualRequired?: boolean;
  };

  notes?: string;
}
```

## Example Entry

```ts
{
  handle: "labels.edgeLabelFontSize",
  label: "Edge Label Font Size",
  category: "Labels",
  defaultValue: 13,
  controlType: "range",
  status: "active",
  source: {
    schemaPath: "settings.schema.ts",
    defaultsPath: "settings.defaults.ts",
    registryPath: "settings.registry.ts",
  },
  runtime: {
    target: "Sigma edgeLabelSize",
    file: "SigmaGraphView.tsx",
    updateMethod: "sigma.setSetting('edgeLabelSize', value)",
    liveUpdate: true,
  },
  qa: {
    checklist: "baseline-b-consolidation-followup-v3",
    playwright: ["settings-label-controls.spec.ts"],
    manualRequired: true,
  },
}
```
