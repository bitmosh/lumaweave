// SPDX-License-Identifier: Apache-2.0
import { useEffect, useState } from 'react';
import { SettingsSubSection } from '../SettingsContent';
import { t } from '../../../i18n';
import { useSettingsStore } from '../settings.store';
import { inspectorSpokeRegistry } from '../../../themes/inspectorSpokeRegistry';
import type { InspectorSpoke } from '../../../themes/inspectorSpokeRegistry';

/* ─── Preview constants (match MiniGraphRenderer) ──────────────────────── */
const STAGE = 320;
const CENTER = STAGE / 2;
const RING_R = 118;
const RING_BTN = 60;
const SUB_OFFSET = 47;

function angleFor(index: number, total: number) {
  return (index / total) * 360 - 90;
}

function PreviewSpokeIcon({ spoke, size = 18 }: { spoke: InspectorSpoke; size?: number }) {
  if (!spoke.iconPath) return null;
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24"
      fill={spoke.iconFill ? 'currentColor' : 'none'}
      stroke="currentColor" strokeWidth={1.7}
      strokeLinecap="round" strokeLinejoin="round"
    >
      <path d={spoke.iconPath} />
    </svg>
  );
}

function RadialPreviewWidget() {
  const [spokes, setSpokes] = useState<InspectorSpoke[]>(() => inspectorSpokeRegistry.list());
  const animationsActive = useSettingsStore(
    (s) => s.settings.appearance.animationEnabled && !s.settings.appearance.reduceMotion,
  );
  const [activeSpokeId, setActiveSpokeId] = useState<string | null>(null);

  useEffect(() => inspectorSpokeRegistry.subscribe(setSpokes), []);

  const activeSpokeIndex = activeSpokeId ? spokes.findIndex((s) => s.id === activeSpokeId) : -1;
  const activeSpoke = activeSpokeIndex >= 0 ? spokes[activeSpokeIndex] : null;
  const ringSpinning = animationsActive && !activeSpoke;

  const handleStageClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.closest('.lw-radial-spoke') ||
      target.closest('.lw-radial-submenu') ||
      target.closest('.lw-radial-center')
    ) return;
    if (activeSpokeId) setActiveSpokeId(null);
  };

  return (
    <div className="lw-radial-frame">
      <div
        className="lw-radial-stage"
        style={{ width: STAGE, height: STAGE }}
        onClick={handleStageClick}
      >
        {/* Decorative rings */}
        <svg
          className={'lw-radial-rings' + (ringSpinning ? ' is-spinning' : '')}
          width={STAGE} height={STAGE} viewBox={`0 0 ${STAGE} ${STAGE}`}
        >
          <g stroke="var(--lw-accent)" strokeWidth="1" fill="none">
            <circle cx={CENTER} cy={CENTER} r={RING_R} strokeDasharray="3 6" opacity="0.55" />
            <circle cx={CENTER} cy={CENTER} r={RING_R - 8} strokeDasharray="2 8" opacity="0.35" />
            {[0, 90, 180, 270].map((deg) => {
              const a = (deg * Math.PI) / 180;
              return (
                <line
                  key={deg}
                  x1={CENTER + 25 * Math.cos(a)} y1={CENTER + 25 * Math.sin(a)}
                  x2={CENTER + 42 * Math.cos(a)} y2={CENTER + 42 * Math.sin(a)}
                  strokeDasharray="2 3" opacity="0.55"
                />
              );
            })}
          </g>
        </svg>

        {/* Center button */}
        <button
          type="button"
          className={'lw-radial-center' + (activeSpoke ? ' is-active' : '')}
          style={{ left: CENTER, top: CENTER }}
          title={activeSpoke ? 'Close' : 'Preview — Alt+Shift+click any target to open live'}
          onClick={() => setActiveSpokeId(null)}
        >
          {activeSpoke ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <line x1="4" y1="4" x2="12" y2="12" /><line x1="12" y1="4" x2="4" y2="12" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="8" cy="8" r="2.4" fill="currentColor" />
            </svg>
          )}
        </button>

        {/* Spoke buttons */}
        {spokes.map((spoke, index) => {
          const isOpen = spoke.id === activeSpokeId;
          const isDim = !!activeSpoke && !isOpen;
          const a = (angleFor(index, spokes.length) * Math.PI) / 180;
          const x = CENTER + RING_R * Math.cos(a);
          const y = CENTER + RING_R * Math.sin(a);
          return (
            <button
              type="button"
              key={spoke.id}
              className={
                'lw-radial-spoke' +
                (isOpen ? ' is-open' : '') +
                (isDim ? ' is-dim' : '') +
                (spoke.status === 'placeholder' ? ' is-placeholder' : '')
              }
              style={{ left: x, top: y, width: RING_BTN, height: RING_BTN }}
              onClick={() => setActiveSpokeId(isOpen ? null : spoke.id)}
              title={spoke.label ?? spoke.name}
            >
              <PreviewSpokeIcon spoke={spoke} />
              <span className="lw-radial-spoke-label">{spoke.label ?? spoke.name}</span>
            </button>
          );
        })}

        {/* Submenu stub — angle-based offset, no viewport clamping needed */}
        {activeSpoke && (() => {
          const a = (angleFor(activeSpokeIndex, spokes.length) * Math.PI) / 180;
          const px = CENTER + (RING_R + SUB_OFFSET) * Math.cos(a);
          const py = CENTER + (RING_R + SUB_OFFSET) * Math.sin(a);
          const txPct = -50 + Math.cos(a) * 50;
          const tyPct = -50 + Math.sin(a) * 50;
          return (
            <div
              className="lw-radial-submenu"
              style={{ left: px, top: py, transform: `translate(${txPct}%, ${tyPct}%)` }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="lw-radial-submenu-head">
                <PreviewSpokeIcon spoke={activeSpoke} size={13} />
                <span>{activeSpoke.label ?? activeSpoke.name}</span>
              </div>
              <div className="lw-radial-submenu-body">
                <p style={{ fontSize: 11, color: 'var(--lw-text-muted)', margin: 0, lineHeight: 1.55 }}>
                  Alt + Shift + click any theme target to open the live inspector and access this spoke.
                </p>
              </div>
            </div>
          );
        })()}
      </div>

      <div className="lw-radial-hotkey">
        <span style={{ color: 'var(--lw-text-muted)' }}>activation</span>
        <span style={{ color: 'var(--lw-text-primary)' }}>Alt + Shift + click</span>
        {!animationsActive && (
          <span style={{ marginLeft: 'auto', color: 'var(--lw-color-gold-500)' }}>
            motion paused
          </span>
        )}
      </div>
    </div>
  );
}

/* ─── Category ──────────────────────────────────────────────────────────── */

export function CategoryInspector() {
  const settings = useSettingsStore((s) => s.settings);
  const setSetting = useSettingsStore((s) => s.setSetting);

  return (
    <div data-testid="settings-category-content-inspector" className="space-y-4">
      <SettingsSubSection id="inspector.preview" label={t("settings.sections.inspector.preview")}>
        <RadialPreviewWidget />
      </SettingsSubSection>

      <SettingsSubSection id="inspector.activation" label={t("settings.sections.inspector.activation")}>
        <p className="text-xs text-slate-500">
          {t("settings.sections.inspector.activationDesc")}
        </p>
        <label className="flex items-center gap-2 mt-2 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.inspector?.autoOpenOnSelection ?? true}
            onChange={(e) =>
              setSetting("inspector.autoOpenOnSelection" as any, e.target.checked)
            }
          />
          <div>
            <div className="text-xs text-slate-300">
              {t("settings.inspector.autoOpen.label")}
            </div>
            <div className="text-xs text-slate-500">
              {t("settings.inspector.autoOpen.description")}
            </div>
          </div>
        </label>
      </SettingsSubSection>

      <SettingsSubSection id="inspector.behavior" label={t("settings.sections.inspector.behavior")}>
        <p className="text-xs text-slate-500">
          {t("settings.sections.inspector.behaviorDesc")}
        </p>
      </SettingsSubSection>

      <SettingsSubSection id="inspector.coming" label={t("settings.sections.inspector.coming")} defaultCollapsed>
        <p className="text-xs text-slate-500">
          {t("settings.sections.inspector.comingDesc")}
        </p>
      </SettingsSubSection>
    </div>
  );
}
