// SPDX-License-Identifier: Apache-2.0
/**
 * CameraHUD - v86b camera HUD overlay
 * 
 * Shows camera state (zoom, rotation) in top-right corner.
 * Respects reduceMotion (hides rotation indicator).
 */
interface CameraHUDProps {
  zoom: number;
  rotation: number;
  reduceMotion: boolean;
}

export function CameraHUD({ zoom, rotation, reduceMotion }: CameraHUDProps) {
  const zoomPercent = Math.round(1 / zoom * 100);
  const rotationDeg = Math.round((rotation * 180) / Math.PI);

  return (
    <div
      className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200"
    >
      <div className="flex gap-4">
        <div>
          <span className="text-slate-500">Zoom:</span> {zoomPercent}%
        </div>
        {!reduceMotion && (
          <div>
            <span className="text-slate-500">Rot:</span> {rotationDeg}°
          </div>
        )}
      </div>
    </div>
  );
}
