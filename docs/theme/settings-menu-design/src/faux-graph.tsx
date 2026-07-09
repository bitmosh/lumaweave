// SPDX-License-Identifier: Apache-2.0
/* IIFE-WRAPPED */
(() => {
/**
 * faux-graph.tsx
 *
 * Demonstration-only plasma graph backdrop. NOT part of the Settings
 * deliverable — its purpose is to give the Settings panel something
 * visually meaningful to float over so the "no backdrop, panel-over-work"
 * thesis is provable.
 *
 * The real LumaWeave canvas (sigma2d + node program) replaces this layer.
 */

interface FauxGraphProps {
  /** Live theme id — used to retune the palette. */
  themeId: string;
}

interface Node {
  x: number; y: number;
  vx: number; vy: number;
  r: number;
  color: string;
  glow: number;
}

const FauxGraph: React.FC<FauxGraphProps> = ({ themeId }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const animRef = React.useRef<number>();
  const stateRef = React.useRef<{ nodes: Node[]; edges: Array<[number, number]>; t: number }>({
    nodes: [], edges: [], t: 0,
  });

  // Build the graph once.
  React.useEffect(() => {
    const W = window.innerWidth;
    const H = window.innerHeight;
    const NODE_COUNT = 110;
    const nodes: Node[] = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      // Cluster nodes loosely into 4 superclusters for variety.
      const cluster = Math.floor(Math.random() * 4);
      const cx = (W / 5) * (cluster + 1);
      const cy = H / 2 + (Math.random() - 0.5) * H * 0.5;
      nodes.push({
        x: cx + (Math.random() - 0.5) * W * 0.35,
        y: cy + (Math.random() - 0.5) * H * 0.45,
        vx: 0, vy: 0,
        r: 3 + Math.random() * 5,
        color: '',
        glow: 0.4 + Math.random() * 0.6,
      });
    }
    const edges: Array<[number, number]> = [];
    for (let i = 0; i < NODE_COUNT * 1.3; i++) {
      const a = Math.floor(Math.random() * NODE_COUNT);
      const b = Math.floor(Math.random() * NODE_COUNT);
      if (a !== b) edges.push([a, b]);
    }
    stateRef.current = { nodes, edges, t: 0 };
  }, []);

  // Animate.
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const tick = () => {
      const root = document.documentElement;
      const cs = getComputedStyle(root);
      const appBg = cs.getPropertyValue('--lw-app-bg').trim() || '#0a0a14';
      const accent = cs.getPropertyValue('--lw-accent').trim() || '#5cd6ff';
      const magenta = cs.getPropertyValue('--lw-color-magenta-500').trim() || '#ff52a8';
      const purple = cs.getPropertyValue('--lw-color-purple-500').trim() || '#b56cff';
      const gold = cs.getPropertyValue('--lw-color-gold-500').trim() || '#ffc857';
      const flare = cs.getPropertyValue('--lw-color-flare-500').trim() || '#ff7a4a';
      const palette = [accent, magenta, purple, gold, flare];

      const W = window.innerWidth;
      const H = window.innerHeight;

      // Soft plasma background gradients.
      const grad = ctx.createRadialGradient(W * 0.7, H * 0.4, 0, W * 0.7, H * 0.4, W * 0.6);
      grad.addColorStop(0, hexA(magenta, 0.20));
      grad.addColorStop(1, hexA(appBg, 0));
      ctx.fillStyle = appBg;
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      const grad2 = ctx.createRadialGradient(W * 0.15, H * 0.6, 0, W * 0.15, H * 0.6, W * 0.5);
      grad2.addColorStop(0, hexA(purple, 0.18));
      grad2.addColorStop(1, hexA(appBg, 0));
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, W, H);

      const grad3 = ctx.createRadialGradient(W * 0.85, H * 0.85, 0, W * 0.85, H * 0.85, W * 0.4);
      grad3.addColorStop(0, hexA(accent, 0.14));
      grad3.addColorStop(1, hexA(appBg, 0));
      ctx.fillStyle = grad3;
      ctx.fillRect(0, 0, W, H);

      const { nodes, edges } = stateRef.current;
      stateRef.current.t += 0.005;
      const t = stateRef.current.t;

      // Drift nodes very slightly.
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += Math.sin(t + i * 0.3) * 0.18;
        n.y += Math.cos(t * 0.8 + i * 0.4) * 0.14;
        n.color = palette[i % palette.length];
      }

      // Edges (thin glowing).
      ctx.lineWidth = 0.6;
      ctx.strokeStyle = hexA(accent, 0.18);
      ctx.beginPath();
      for (const [a, b] of edges) {
        const na = nodes[a], nb = nodes[b];
        ctx.moveTo(na.x, na.y);
        ctx.lineTo(nb.x, nb.y);
      }
      ctx.stroke();

      // Nodes (with bloom).
      for (const n of nodes) {
        ctx.shadowBlur = 12 * n.glow;
        ctx.shadowColor = n.color;
        ctx.fillStyle = n.color;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [themeId]);

  return <canvas ref={canvasRef} />;
};

/** "rgba"-ify a hex/rgb color with an explicit alpha. */
function hexA(color: string, alpha: number): string {
  color = color.trim();
  if (color.startsWith('#')) {
    let r = 0, g = 0, b = 0;
    if (color.length === 4) {
      r = parseInt(color[1] + color[1], 16);
      g = parseInt(color[2] + color[2], 16);
      b = parseInt(color[3] + color[3], 16);
    } else {
      r = parseInt(color.slice(1, 3), 16);
      g = parseInt(color.slice(3, 5), 16);
      b = parseInt(color.slice(5, 7), 16);
    }
    return `rgba(${r},${g},${b},${alpha})`;
  }
  if (color.startsWith('rgb')) {
    return color.replace(/rgba?\(([^)]+)\)/, (_m, body) => {
      const parts = body.split(',').map((s: string) => s.trim()).slice(0, 3);
      return `rgba(${parts.join(',')},${alpha})`;
    });
  }
  return color;
}

(window as any).LW_FauxGraph = FauxGraph;

})();
