// SPDX-License-Identifier: Apache-2.0
/**
 * v86b/vC3.1.1/v96: Synthetic migration chain test
 *
 * Tests that the full migration chain from v76 to v87 produces the correct endpoint shape.
 * This ensures that each migration step in the chain preserves data and adds new fields correctly.
 * Chain includes: v76→v77 (settings tab removal), v77→v78 (tile layout), v78→v79 (appearance defaults),
 * v79→v80 (quality preset fields), v80→v81 (helix removal), v81→v82 (FA2 removal + gwells),
 * v82→v83 (seedParamOverrides), v83→v84 (pins), v84→v85 (pinnedHighlightActive), v85→v86 (FA2 safety net),
 * v86→v87 (developer.preferredEditor + customEditorTemplate).
 */

import { test, expect } from "@playwright/test";
import { migrateSettings } from "../../src/control-plane/settings/settings.migrations";
import { defaultSettings } from "../../src/control-plane/settings/settings.defaults";

test.describe("settings migration chain", () => {
  test("v76 → v87 chain produces correct endpoint", () => {
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

    // The chain must land on the CURRENT schema version. Derived from defaultSettings
    // rather than hardcoded: the assertion that matters is "migration reaches current",
    // not "migration reaches 93". Hardcoding it only guarantees it goes stale on the next
    // bump — which is exactly what happened (it sat at 93 while the schema reached 96,
    // undetected because this spec was in the collection-broken set).
    expect(result.version).toBe(defaultSettings.version);

    // Verify v80/v88 fields are present (v86b additions, v88 rename)
    expect((result.appearance as any).animationDensity).toBe("medium");
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

    // Verify v83 field: seedParamOverrides added
    expect(resultAny.physics.seedParamOverrides).toBeDefined();

    // Verify v84 field: pins added
    expect(resultAny.physics.pins).toBeDefined();

    // Verify v85 field: pinnedHighlightActive added
    expect(resultAny.physics.pinnedHighlightActive).toBe(false);

    // Verify FA2 fields are removed (v82 removed them, v86 safety net)
    expect(resultAny.physics.physicsPreset).toBeUndefined();
    expect(resultAny.physics.linkDistance).toBeUndefined();
    expect(resultAny.physics.repelForce).toBeUndefined();
    expect(resultAny.physics.centerForce).toBeUndefined();
    expect(resultAny.physics.communityGravity).toBeUndefined();
    expect(resultAny.physics.physicsDialect).toBeUndefined();
    expect(resultAny.physics.strongGravityMode).toBeUndefined();
    expect(resultAny.physics.linLogMode).toBeUndefined();
    expect(resultAny.physics.adjustSizes).toBeUndefined();
    expect(resultAny.physics.barnesHutTheta).toBeUndefined();
    // qualityPreset is not in physics (moved to performance in v86b), so it's undefined
    expect(resultAny.physics.qualityPreset).toBeUndefined();
    // nodeSize is moved to graphView and preserved
    expect(resultAny.physics.nodeSize).toBeUndefined(); // Moved to graphView
    expect(result.graphView.nodeSize).toBe(10); // Preserved from original
    expect(result.appearance.theme).toBe("midnight");
    expect(result.appearance.accentIntensity).toBe(0.5);

    // Verify v87 fields: developer editor settings added
    expect(result.developer.preferredEditor).toBe("vscode");
    expect(result.developer.customEditorTemplate).toBe("code --goto {path}:{line}");
  });
});
