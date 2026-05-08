/**
 * GlitterField - v86b glitter on selection
 * 
 * Particle field around selected node.
 * Respects glitterDensity setting and reduceMotion.
 * Consumes v86a tier model tokens.
 */
import { useEffect, useState } from "react";

interface GlitterFieldProps {
  x: number;
  y: number;
  color: string;
  glitterDensity: "off" | "low" | "medium" | "high";
  densityScale?: number;
  reduceMotion: boolean;
}

export function GlitterField({ x, y, color, glitterDensity, densityScale = 1.0, reduceMotion }: GlitterFieldProps) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number }>>([]);

  useEffect(() => {
    if (glitterDensity === "off" || reduceMotion) {
      setParticles([]);
      return;
    }

    const baseCount = glitterDensity === "low" ? 8 : glitterDensity === "medium" ? 16 : 32;
    const count = Math.round(baseCount * densityScale);
    const newParticles = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 60,
      y: (Math.random() - 0.5) * 60,
      size: Math.random() * 3 + 1,
    }));
    setParticles(newParticles);
  }, [glitterDensity, densityScale, reduceMotion]);

  if (glitterDensity === "off" || reduceMotion) return null;

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: x,
        top: y,
        transform: "translate(-50%, -50%)",
      }}
    >
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            backgroundColor: color,
            opacity: 0.6,
            animation: "glitter 1.5s ease-in-out infinite",
          }}
        />
      ))}
    </div>
  );
}
