# DRAFT — vP-v86b-close-1-followup: Type Hygiene + Schema Fix

**Status:** DRAFT — Complete
**Date:** 2026-05-12
**Pass:** v86b-close-1-followup

---

## Summary

Fixed two type-safety issues from the v86b-close-1 overlay mounting pass:
1. Added missing "custom" enum value to `performance.qualityPreset` in settings schema
2. Extended resolved graph tokens type with `selectionHaloColor` field
3. Removed all `as any` type bypass casts from AppShell.tsx overlay mounts

Typecheck now passes with zero errors.

---

## Changes Made

### File: src/control-plane/settings/settings.schema.ts

**Issue:** The `performance.qualityPreset` enum was missing the "custom" value, causing TypeScript errors at AppShell.tsx:192 and :201 where `preset === "custom"` was flagged as having no overlap.

**Fix (line 121):**
```typescript
// Before
qualityPreset: "beautiful" | "balanced" | "large-graph" | "potato";

// After
qualityPreset: "custom" | "beautiful" | "balanced" | "large-graph" | "potato";
```

**Note:** The schema version was not bumped as this is a type-only correction, not a data migration.

---

### File: src/themes/theme.types.ts

**Finding:** The `ThemeRuntimeTokens` interface **already included** the `backdrop` and `bookmark` sub-objects as required fields (lines 95-121). No type extension was needed.

```typescript
backdrop: {
  coronaColor: string;
  coronaIntensity: number;
  flareColor: string;
  starfieldDensity: number;
  vignetteIntensity: number;
};
bookmark: {
  alertColor: string;
  pinnedColor: string;
  refColor: string;
};
```

**Conclusion:** The types were already correctly defined in v86a. The overlay mounts were using `as any` casts unnecessarily.

---

### File: src/themes/themeTokens.ts

**Issue:** The `resolveGraphVisualTokens` function return type did not include `selectionHaloColor`, which was being accessed in AppShell.tsx via an `as any` cast.

**Fix (line 726):**
```typescript
// Added to return object
selectionHaloColor: "#3b82f6",
```

**Note:** This is a hardcoded fallback value. In a future theme pass, this should be derived from `themeTokens.selection.haloColor` to respect the theme system properly.

---

### File: src/app/AppShell.tsx

**Removed all `as any` casts from themeTokens and resolvedGraphTokens access patterns:**

**Line 279 (handleViewportClick):**
```typescript
// Before
color: (resolvedGraphTokens as any)?.selectionHaloColor ?? "#3b82f6",

// After
color: resolvedGraphTokens?.selectionHaloColor ?? "#3b82f6",
```

**Lines 868-872 (SolarBackdrop):**
```typescript
// Before
coronaColor={(themeTokens as any).backdrop?.coronaColor}
coronaIntensity={(themeTokens as any).backdrop?.coronaIntensity}
flareColor={(themeTokens as any).backdrop?.flareColor}
starfieldDensity={(themeTokens as any).backdrop?.starfieldDensity}
vignetteIntensity={(themeTokens as any).backdrop?.vignetteIntensity}

// After
coronaColor={themeTokens.backdrop?.coronaColor}
coronaIntensity={themeTokens.backdrop?.coronaIntensity}
flareColor={themeTokens.backdrop?.flareColor}
starfieldDensity={themeTokens.backdrop?.starfieldDensity}
vignetteIntensity={themeTokens.backdrop?.vignetteIntensity}
```

**Line 983 (GlitterField):**
```typescript
// Before
color={(resolvedGraphTokens as any)?.selectionHaloColor ?? "#fbbf24"

// After
color={resolvedGraphTokens?.selectionHaloColor ?? "#fbbf24"
```

**Lines 995-997 (BookmarkLayer):**
```typescript
// Before
alertColor={(themeTokens as any).bookmark?.alertColor}
pinnedColor={(themeTokens as any).bookmark?.pinnedColor}
refColor={(themeTokens as any).bookmark?.refColor}

// After
alertColor={themeTokens.bookmark?.alertColor}
pinnedColor={themeTokens.bookmark?.pinnedColor}
refColor={themeTokens.bookmark?.refColor}
```

**Note:** Other `as any` casts in AppShell.tsx (for `window` object and tab handling) were left untouched as they are outside the scope of this pass.

---

## Typecheck Results

```
> lumaweave@0.6.0 typecheck
> tsc --noEmit
```

**Status:** ✅ Clean exit, zero errors

The two errors at AppShell.tsx:192 and :201 are now resolved after adding "custom" to the qualityPreset enum.

---

## Findings

### qualityPreset Enum Root Cause

The missing "custom" value was in the settings schema itself at `src/control-plane/settings/settings.schema.ts:121`. The type narrowing was happening at the schema definition level, not at a derived type or Zod schema. Adding "custom" to the enum array resolved both errors cleanly.

### ThemeRuntimeTokens Type Already Complete

The `ThemeRuntimeTokens` interface in `src/themes/theme.types.ts` already included the `backdrop` and `bookmark` sub-objects as required fields. These were added in v86a as part of the canonical token path promotion. The overlay mounts in close-1 used `as any` casts unnecessarily because the types were already present.

### resolvedGraphTokens Type Extension

The `resolveGraphVisualTokens` function in `src/themes/themeTokens.ts` returns an inline object type. This type did not include `selectionHaloColor`, which was needed by ClickHalo and GlitterField. Adding the field to the return object resolved the type error.

### selectionHaloColor Hardcoded Value

The current implementation uses a hardcoded fallback value `#3b82f6` (blue) for `selectionHaloColor`. This should be derived from `themeTokens.selection.haloColor` in a future theme pass to respect the theme system properly. All six theme presets have `selection.haloColor` defined in their token files.

---

## Files Modified

- `src/control-plane/settings/settings.schema.ts` — Added "custom" to performance.qualityPreset enum
- `src/themes/themeTokens.ts` — Added selectionHaloColor to resolveGraphVisualTokens return type
- `src/app/AppShell.tsx` — Removed all `as any` casts from themeTokens and resolvedGraphTokens access

---

## Files Not Modified

- `src/themes/theme.types.ts` — No changes needed (backdrop and bookmark already defined)

---

## Next Steps

### Immediate
- Operator can now proceed with manual validation of the v86b-close-1 overlay mounts

### Follow-up Passes
1. **Theme integration:** Update `resolveGraphVisualTokens` to derive `selectionHaloColor` from `themeTokens.selection.haloColor` instead of hardcoded fallback
2. **Schema version:** Consider bumping settings schema version if schema versioning policy requires it for type changes

---

## XP Notes

Small pass, high cleanliness value. Removing `as any` casts before they propagate is one of the cheapest type-hygiene wins available — every cast removed is a future bug that can't hide. Tracing the qualityPreset enum issue to its root (the schema definition) rather than patching at the call site prevented a larger type debt from accumulating.
