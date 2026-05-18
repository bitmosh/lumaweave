/**
 * v86b/vC3.1.1: Synthetic migration chain test
 *
 * Tests that the full migration chain from v76 to v82 produces the correct endpoint shape.
 * This ensures that each migration step in the chain preserves data and adds new fields correctly.
 */

import { test, expect } from "@playwright/test";
import { migrateSettings } from "../../src/control-plane/settings/settings.migrations";

test.describe("settings migration chain", () => {
  test("v76 → v82 chain produces correct endpoint", () => {
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

    // Verify version is current (v82 after C3.1.1 consolidation)
    expect(result.version).toBe(82);

    // Verify v80 fields are present (v86b additions)
    expect(result.appearance.glitterDensity).toBe("medium");
    expect(result.appearance.edgePlasmaMode).toBe("animated-overlay");
    expect(result.appearance.backdropMotion).toBe("half");
    expect(result.appearance.nodeHum).toBe(0.7);
    expect(result.appearance.nodeFlowSpeed).toBe(0.55);
    expect(result.appearance.nodeGlow).toBe(1.0);

    // Verify v81 field: helix → default migration (removed by final deep merge since not in defaults)
    const resultAny = result as any;
    expect(resultAny.physics.physicsDialect).toBeUndefined();

    // Verify v82 field: FA2 → gwells migration with dialect rename
    expect(resultAny.physics.dialectId).toBe("gwells.dialect.radial-backbone");

    // Verify FA2 fields are removed (v82 removed them)
    expect(resultAny.physics.physicsPreset).toBeUndefined();
    expect(resultAny.physics.linkDistance).toBeUndefined();
    expect(resultAny.physics.repelForce).toBeUndefined();
    // qualityPreset is not in current schema, so it's undefined
    expect(resultAny.physics.qualityPreset).toBeUndefined();
    // nodeSize is moved to graphView and preserved
    expect(resultAny.physics.nodeSize).toBeUndefined(); // Moved to graphView
    expect(result.graphView.nodeSize).toBe(10); // Preserved from original
    expect(result.appearance.theme).toBe("midnight");
    expect(result.appearance.accentIntensity).toBe(0.5);
  });
});
