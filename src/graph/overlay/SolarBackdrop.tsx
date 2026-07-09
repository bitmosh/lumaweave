// SPDX-License-Identifier: Apache-2.0
/**
 * SolarBackdrop - v86b Solar Plasma backdrop layer
 * 
 * Animated gradient background with corona, flare, and starfield effects.
 * Respects backdropMotion setting and reduceMotion accessibility.
 * Consumes v86a tier model tokens.
 */
import { useEffect, useState } from "react";

interface SolarBackdropProps {
  backdropMotion: "off" | "low" | "half" | "full";
  reduceMotion: boolean;
  starfieldEnabled: boolean;
  // v86a tier model tokens
  coronaColor?: string;
  coronaIntensity?: number;
  flareColor?: string;
  starfieldDensity?: number;
  vignetteIntensity?: number;
}

export function SolarBackdrop({
  backdropMotion,
  reduceMotion,
  starfieldEnabled,
  coronaColor = "rgba(255, 180, 100, 0.15)",
  coronaIntensity = 1.0,
  flareColor = "rgba(180, 100, 255, 0.12)",
  starfieldDensity = 0.6,
  vignetteIntensity = 0.08,
}: SolarBackdropProps) {
  const [time, setTime] = useState(0);

  useEffect(() => {
    if (reduceMotion || backdropMotion === "off") return;

    const interval = setInterval(() => {
      setTime((t) => t + 0.016);
    }, 16);

    return () => clearInterval(interval);
  }, [backdropMotion, reduceMotion]);

  const motionMultiplier = reduceMotion ? 0 : backdropMotion === "low" ? 0.25 : backdropMotion === "half" ? 0.5 : 1.0;

  return (
    <div
      className="absolute inset-0 -z-10 pointer-events-none"
      style={{
        background: `
          radial-gradient(ellipse at 30% 20%, ${coronaColor.replace(/[\d.]+\)$/, `${0.15 * coronaIntensity * motionMultiplier})`)} 0%, transparent 50%),
          radial-gradient(ellipse at 70% 80%, ${flareColor.replace(/[\d.]+\)$/, `${0.12 * motionMultiplier})`)} 0%, transparent 50%),
          radial-gradient(ellipse at 50% 50%, rgba(255, 140, 80, ${vignetteIntensity * motionMultiplier}) 0%, transparent 70%),
          linear-gradient(135deg, #0a0a0f 0%, #1a1025 50%, #0f0a15 100%)
        `,
        animation: backdropMotion !== "off" && !reduceMotion
          ? `backdropShift ${30 / motionMultiplier}s ease-in-out infinite alternate`
          : "none",
      }}
    >
      {/* Starfield */}
      {starfieldEnabled && !reduceMotion && (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(1px 1px at ${20 + Math.sin(time * 0.5) * 10}% ${30 + Math.cos(time * 0.3) * 10}%, rgba(255, 255, 255, 0.3) 0%, transparent 1px),
                             radial-gradient(1px 1px at ${60 + Math.cos(time * 0.4) * 15}% ${70 + Math.sin(time * 0.6) * 12}%, rgba(255, 255, 255, 0.2) 0%, transparent 1px),
                             radial-gradient(1px 1px at ${40 + Math.sin(time * 0.7) * 8}% ${50 + Math.cos(time * 0.2) * 20}%, rgba(255, 255, 255, 0.25) 0%, transparent 1px)`,
            backgroundSize: "200px 200px, 150px 150px, 180px 180px",
            opacity: starfieldDensity * motionMultiplier,
          }}
        />
      )}
    </div>
  );
}
