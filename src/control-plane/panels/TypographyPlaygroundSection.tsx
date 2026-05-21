import "./typographyPlayground.css";
import { useState } from "react";
import { fontAxisRegistry } from "../../themes/fontAxisRegistry";

const SAMPLE_DISPLAY = "The quick brown fox jumps over the lazy dog";
const SAMPLE_BODY = "Pack my box with five dozen liquor jugs. The five boxing wizards jump quickly.";
const SAMPLE_MONO = "const result = await pipeline.run({ verbose: true });";

const FAMILIES = [
  { id: "space-grotesk-wght", family: "Space Grotesk", sample: SAMPLE_DISPLAY, cssVar: "--lw-font-display" },
  { id: "ibm-plex-sans-wght", family: "IBM Plex Sans", sample: SAMPLE_BODY, cssVar: "--lw-font-body" },
  { id: "ibm-plex-mono-wght", family: "IBM Plex Mono", sample: SAMPLE_MONO, cssVar: "--lw-font-mono" },
] as const;

export function TypographyPlaygroundSection() {
  const [weights, setWeights] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    for (const f of FAMILIES) {
      const entry = fontAxisRegistry.getById(f.id);
      init[f.id] = entry?.default ?? 400;
    }
    return init;
  });

  return (
    <div className="lw-typography-playground" data-testid="typography-playground">
      <p className="lw-playground-description">
        Adjust weight for each loaded font family. Changes are local to this playground.
      </p>

      {FAMILIES.map((f) => {
        const entry = fontAxisRegistry.getById(f.id);
        if (!entry) {
          return (
            <div key={f.id} className="lw-playground-error">
              Font axis "{f.id}" not registered.
            </div>
          );
        }
        return (
          <div key={f.id} className="lw-playground-family" data-testid={`playground-family-${f.id}`}>
            <div className="lw-playground-family-header">
              <span className="lw-playground-family-name">{f.family}</span>
              <span className="lw-playground-weight-value">{weights[f.id]}</span>
            </div>
            <input
              type="range"
              min={entry.min}
              max={entry.max}
              step={entry.step ?? 1}
              value={weights[f.id]}
              onChange={(e) => setWeights((prev) => ({ ...prev, [f.id]: parseInt(e.target.value, 10) }))}
              className="lw-playground-slider"
              data-testid={`playground-slider-${f.id}`}
              aria-label={`${f.family} weight`}
            />
            <div
              className="lw-playground-sample"
              style={{ fontFamily: `var(${f.cssVar})`, fontWeight: weights[f.id] }}
            >
              {f.sample}
            </div>
          </div>
        );
      })}
    </div>
  );
}
