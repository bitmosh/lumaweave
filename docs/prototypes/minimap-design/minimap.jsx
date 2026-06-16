// minimap.jsx
// → Minimap.tsx in real app
//
// Top-level composition. Reads settings, subscribes via the three
// hooks (snapshot / camera / navigation), renders the shell + flipped-
// aware layout. ~80 lines.
//
// AppShell call site is unchanged from the previous version:
//   {settings.minimap.visible && <Minimap />}

function Minimap() {
  const settings = useMinimapSettings();
  const setSetting = useSetMinimapSetting();
  const { snapshotVersion, bounds, counts, isRefreshing } = useMinimapSnapshot();
  const { rect } = useMinimapCamera(bounds);

  if (!settings.visible) return null;

  return (
    <MinimapShell status={isRefreshing ? 'refresh' : 'idle'}>
      <MinimapBody
        snapshotVersion={snapshotVersion}
        bounds={bounds}
        viewportRect={rect}
        counts={counts}
        isRefreshing={isRefreshing}
        settings={settings}
        setSetting={setSetting}
      />
    </MinimapShell>
  );
}

// MinimapBody — consumes ShellContext (flipped, collapsed) and lays
// out the parts. Split out because MinimapShell needs to wrap with
// the context provider first.
function MinimapBody({
  snapshotVersion,
  bounds,
  viewportRect,
  counts,
  isRefreshing,
  settings,
  setSetting,
}) {
  const { flipped, collapsed } = useShellContext();
  const canvasAreaRef = React.useRef(null);
  const nav = useMinimapNavigation(bounds, canvasAreaRef);

  const onCollapseToggle = () => toggleCollapsed(settings, setSetting, flipped);
  const onClose = () => setSetting('visible', false);
  const onSnap = () => {
    setSetting({
      position: positionFromAnchor(settings.anchor, settings.size),
      size: { width: 300, height: 200 },
      collapsed: false,
    });
  };

  return (
    <>
      <MinimapHeader
        breadcrumb="radial backbone"
        status={isRefreshing ? 'refreshing' : 'fresh'}
        collapsed={collapsed}
        flipped={flipped}
        onCollapse={onCollapseToggle}
        onClose={onClose}
        onSnap={onSnap}
      />

      {!collapsed && (
        <>
          {/* Snapshot + viewport area. This is the click/drag/wheel target. */}
          <div
            ref={canvasAreaRef}
            data-testid="minimap-canvas-area"
            onMouseDown={nav.onMouseDown}
            onWheel={nav.onWheel}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: flipped ? 24 : 28,
              bottom: flipped ? 28 : 24,
              overflow: 'hidden',
              cursor: 'crosshair',
            }}
          >
            <MinimapSnapshotCanvas
              snapshotVersion={snapshotVersion}
              bounds={bounds}
              size={{
                width: settings.size.width,
                height: settings.size.height - 28 - 24,
              }}
            />
            {settings.showViewport && <MinimapViewportRect rect={viewportRect} />}
            <MinimapResizeGrip />
          </div>

          <MinimapFooter
            opacity={settings.opacity}
            onOpacityChange={(v) => setSetting('opacity', v)}
            counts={counts}
            flipped={flipped}
          />
        </>
      )}
    </>
  );
}

Object.assign(window, { Minimap });
