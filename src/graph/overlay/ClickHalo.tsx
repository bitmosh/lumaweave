// SPDX-License-Identifier: Apache-2.0
/**
 * ClickHalo - v86b click ripple effect
 * 
 * Expands ripple on node click, then fades out.
 * Respects reduceMotion accessibility.
 * Consumes v86a tier model tokens.
 */
import { useEffect, useState } from "react";

interface ClickHaloProps {
  x: number;
  y: number;
  color?: string;
  maxRadiusRatio?: number;
  reduceMotion: boolean;
  onComplete: () => void;
}

export function ClickHalo({
  x,
  y,
  color = "#3b82f6",
  maxRadiusRatio = 3,
  reduceMotion,
  onComplete,
}: ClickHaloProps) {
  const [scale, setScale] = useState(0);
  const [opacity, setOpacity] = useState(0.6);

  useEffect(() => {
    if (reduceMotion) {
      setScale(maxRadiusRatio);
      setTimeout(() => {
        setOpacity(0);
        onComplete();
      }, 100);
      return;
    }

    const duration = 400;
    const startTime = performance.now();

    const animate = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      setScale(progress * maxRadiusRatio);
      setOpacity(0.6 * (1 - progress));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        onComplete();
      }
    };

    requestAnimationFrame(animate);
  }, [reduceMotion, maxRadiusRatio, onComplete]);

  return (
    <div
      className="absolute pointer-events-none rounded-full border-2"
      style={{
        left: x,
        top: y,
        width: 20,
        height: 20,
        borderColor: color,
        transform: `translate(-50%, -50%) scale(${scale})`,
        opacity,
      }}
    />
  );
}
