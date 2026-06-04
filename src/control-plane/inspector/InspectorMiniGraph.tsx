/**
 * Inspector Mini Graph
 *
 * Top-level component. Listens for inspector:open events.
 * Manages open state, dim mode integration, and mini-graph lifecycle.
 */

import { useEffect, useRef, useState } from "react";
import { useSettingsStore } from "../settings/settings.store";
import { inspectorSpokeRegistry } from "../../themes/inspectorSpokeRegistry";
import type { InspectorSpoke } from "../../themes/inspectorSpokeRegistry";
import type { TargetDescriptor } from "./inspector.types";
import { MiniGraphRenderer } from "./MiniGraphRenderer";

export function InspectorMiniGraph() {
  const [isOpen, setIsOpen] = useState(false);
  const [targetDescriptor, setTargetDescriptor] = useState<TargetDescriptor | null>(null);
  const [spokes, setSpokes] = useState<InspectorSpoke[]>([]);

  const animationsActive = useSettingsStore(
    (state) =>
      state.settings.appearance.animationEnabled && !state.settings.appearance.reduceMotion,
  );

  // Subscribe to spoke registry changes
  useEffect(() => {
    const unsubscribe = inspectorSpokeRegistry.subscribe((entries) => {
      setSpokes(entries);
    });
    // Initialize with current registry entries
    setSpokes(inspectorSpokeRegistry.list());

    return unsubscribe;
  }, []);

  const previousDimModeRef = useRef<string | null>(null);

  // Handle inspector:open event
  useEffect(() => {
    const handleInspectorOpen = (event: Event) => {
      const customEvent = event as CustomEvent<any>;
      const { targetId, label, anchorX, anchorY } = customEvent.detail;

      if (!targetId || !label) {
        console.warn("[InspectorMiniGraph] Missing required fields in inspector:open event");
        return;
      }

      // Save current dim mode before opening
      const currentDimMode = useSettingsStore.getState().settings.graphView.dimMode ?? "off";
      previousDimModeRef.current = currentDimMode;

      // Set dim mode to outside-cluster
      useSettingsStore.setState((state: any) => ({
        settings: {
          ...state.settings,
          graphView: {
            ...state.settings.graphView,
            dimMode: "outside-cluster",
          },
        },
      }));

      // Open inspector with target descriptor
      setIsOpen(true);
      setTargetDescriptor({ targetId, label, anchorX, anchorY });
    };

    window.addEventListener("inspector:open", handleInspectorOpen as EventListener);
    return () => {
      window.removeEventListener("inspector:open", handleInspectorOpen as EventListener);
    };
  }, []);

  // Handle close
  const handleClose = () => {
    // Restore previous dim mode
    if (previousDimModeRef.current !== null) {
      useSettingsStore.setState((state: any) => ({
        settings: {
          ...state.settings,
          graphView: {
            ...state.settings.graphView,
            dimMode: previousDimModeRef.current,
          },
        },
      }));
    }

    setIsOpen(false);
    setTargetDescriptor(null);
    previousDimModeRef.current = null;
  };

  // Handle Esc key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  if (!isOpen || !targetDescriptor) {
    return null;
  }

  return (
    <MiniGraphRenderer
      targetLabel={targetDescriptor.label}
      anchorX={targetDescriptor.anchorX}
      anchorY={targetDescriptor.anchorY}
      spokes={spokes}
      animationsActive={animationsActive}
      onClose={handleClose}
      targetDescriptor={targetDescriptor}
    />
  );
}
