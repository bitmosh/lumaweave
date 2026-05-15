/**
 * v86b: Synthetic migration chain test
 *
 * Tests that the full migration chain from v76 to v81 produces the correct endpoint shape.
 * This ensures that each migration step in the chain preserves data and adds new fields correctly.
 */

import { test, expect } from "@playwright/test";
import { migrateSettings } from "../../src/control-plane/settings/settings.migrations";

test.describe("settings migration chain", () => {
  test("v76 → v81 chain produces correct endpoint", () => {
    // Synthetic v76 settings object (minimal shape, using any to bypass type checks)
    const v76: any = {
      version: 76,
      physics: {
        physicsPreset: "performance",
        nodeSize: 10,
        linkDistance: 100,
        physicsDialect: "helix", // Test helix → default migration
      },
      appearance: {
        theme: "midnight",
        accentIntensity: 0.5,
        panelTransparency: 0.8,
        glitterEnabled: true,
        reduceMotion: false,
        starfieldEnabled: true,
        drama: "quiet",
      },
    };

    // Run full migration chain
    const result = migrateSettings(v76);

    // Verify version is current
    expect(result.version).toBe(81);

    // Verify v80 fields are present (v86b additions)
    expect(result.appearance.glitterDensity).toBe("medium");
    expect(result.appearance.edgePlasmaMode).toBe("animated-overlay");
    expect(result.appearance.backdropMotion).toBe("half");
    expect(result.physics.qualityPreset).toBeDefined();
    expect(result.appearance.nodeHum).toBe(0.7);
    expect(result.appearance.nodeFlowSpeed).toBe(0.55);
    expect(result.appearance.nodeGlow).toBe(1.0);

    // Verify v81 field: helix → default migration
    expect(result.physics.physicsDialect).toBe("default");

    // Verify original fields are preserved
    expect(result.physics.physicsPreset).toBe("performance");
    expect(result.physics.nodeSize).toBe(10);
    expect(result.physics.linkDistance).toBe(100);
    expect(result.appearance.theme).toBe("midnight");
    expect(result.appearance.accentIntensity).toBe(0.5);
  });
});
