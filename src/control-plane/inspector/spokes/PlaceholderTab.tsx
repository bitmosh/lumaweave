// SPDX-License-Identifier: Apache-2.0
/**
 * Placeholder Tab (v89.4)
 *
 * Shown for spokes with status: "placeholder". Displays the
 * placeholderMessage from the registry and optionally the
 * intendedTokenPaths in a collapsed details element.
 */

import { inspectorSpokeRegistry } from "../../../themes/inspectorSpokeRegistry";
import type { TargetDescriptor } from "../inspector.types";
import { t } from "../../../i18n";
import "../styles/placeholder-tab.css";

export interface PlaceholderTabProps {
  targetDescriptor: TargetDescriptor;
  onClose?: () => void;
}

export function PlaceholderTab({ targetDescriptor: _targetDescriptor, onClose }: PlaceholderTabProps) {
  // Identify which spoke this tab belongs to by finding the placeholder spoke
  // whose tabComponent is this function. Since we can't reliably detect self-identity
  // at runtime, PlaceholderTab reads all placeholder spokes and renders based on
  // which one is expanded. MiniGraphRenderer passes expandedSpokeId — but that's
  // not threaded into the tabComponent props. We rely on the spoke having the message
  // baked in via the registry.
  //
  // Workaround: each placeholder spoke registers tabComponent as PlaceholderTab.
  // The actual message and paths are on the spoke registry entry. We expose a
  // static factory via `makePlaceholderTab` for spoke-specific instances that
  // capture the id at registration time.
  //
  // For now: render the first placeholder spoke message as a fallback. Spoke-specific
  // instances use `makePlaceholderTab(id)` below.
  const spokes = inspectorSpokeRegistry.list();
  const placeholder = spokes.find((s) => s.status === "placeholder");
  const message = placeholder ? t(`inspector.spokes.${placeholder.id}.placeholderMessage`) : t("inspector.spokes.placeholder.coming");
  const paths = placeholder?.intendedTokenPaths;

  return <PlaceholderContent onClose={onClose} message={message} paths={paths} />;
}

export function makePlaceholderTab(spokeId: string) {
  function BoundPlaceholderTab({ targetDescriptor: _td, onClose }: PlaceholderTabProps) {
    const spoke = inspectorSpokeRegistry.getById(spokeId);
    const message = spoke ? t(`inspector.spokes.${spokeId}.placeholderMessage`) : t("inspector.spokes.placeholder.coming");
    const paths = spoke?.intendedTokenPaths;
    return <PlaceholderContent onClose={onClose} message={message} paths={paths} />;
  }
  BoundPlaceholderTab.displayName = `PlaceholderTab(${spokeId})`;
  return BoundPlaceholderTab;
}

function PlaceholderContent({
  onClose,
  message,
  paths,
}: {
  onClose?: () => void;
  message: string;
  paths?: readonly string[];
}) {
  return (
    <div className="lw-placeholder-tab" data-testid="placeholder-tab">
      <header className="lw-placeholder-tab-header">
        {onClose && (
          <button onClick={onClose} aria-label={t("inspector.backLabel")} className="lw-placeholder-tab-back">
            {t("inspector.back")}
          </button>
        )}
      </header>

      <p className="lw-placeholder-tab-message" data-testid="placeholder-message">
        {message}
      </p>

      {paths && paths.length > 0 && (
        <details className="lw-placeholder-tab-paths">
          <summary data-testid="placeholder-intended-targets">{t("inspector.spokes.placeholder.intendedTargets")}</summary>
          <ul>
            {paths.map((p) => (
              <li key={p}>
                <code>{p}</code>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
