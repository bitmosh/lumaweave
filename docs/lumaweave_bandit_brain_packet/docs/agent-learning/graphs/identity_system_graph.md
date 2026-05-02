# Identity System Graph

```mermaid
flowchart TD
  H[handleId] --> C[Control Contract Registry]
  S[settingsKey] --> R[Runtime Settings Store]
  C --> MC[Mission Control Debug]
  C --> QA[QA Contracts]

  QK[qaKey] --> QR[qa-registry.ts]
  AK[advisoryKey] --> AR[advisory-registry.ts]
  QR --> QP[QaPanel]
  AR --> QP
  QP --> PW[Playwright Evidence]
  QP --> REP[QA Report]

  TTP[themeTokenPath] --> TTPM[Theme Token Path Map]
  TTPM --> TTR[Theme Target Registry]
  TTID[themeTargetId] --> TTR
  TTR --> DOM[data-lw-theme-target]
  DOM --> OVR[Inspector Overlay]
  OVR --> PW

  DT[data-testid] --> PW
```

## Reading The Graph

- `themeTokenPath` is value vocabulary.
- `themeTargetId` is surface identity.
- `data-lw-theme-target` is runtime DOM evidence.
- `data-testid` is Playwright access evidence.
- `qaKey` and `advisoryKey` are related but distinct contract selectors.
