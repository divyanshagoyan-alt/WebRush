import { useEffect, useRef } from 'react';
import type { DataSummary } from '../../types';

interface ConstellationProps {
  summary: DataSummary;
}

interface Star {
  x: number; y: number;
  vx: number; vy: number;
  r: number;
  alpha: number;
  category: string;
}

const COLORS = ['#8B5CF6', '#22D3EE', '#34D399', '#FBBF24', '#FB7185', '#F59E0B'];

export function DataConstellation({ summary }: ConstellationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      const ctx = canvas.getContext('2d');
      ctx?.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    // Create stars based on actual data proportions
    const total = summary.spotify.totalRecords;
    const N = Math.min(80, Math.floor(total / 2000));
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;

    starsRef.current = Array.from({ length: N }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      r: 1 + Math.random() * 2.5,
      alpha: 0.3 + Math.random() * 0.6,
      category: COLORS[Math.floor(Math.random() * COLORS.length)],
    }));

    const animate = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);

      const stars = starsRef.current;

      // Draw connections
      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          const dist = Math.hypot(stars[i].x - stars[j].x, stars[i].y - stars[j].y);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(stars[i].x, stars[i].y);
            ctx.lineTo(stars[j].x, stars[j].y);
            ctx.strokeStyle = `rgba(139,92,246,${(1 - dist / 120) * 0.08})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Draw stars
      stars.forEach(s => {
        s.x += s.vx;
        s.y += s.vy;
        if (s.x < 0 || s.x > w) s.vx *= -1;
        if (s.y < 0 || s.y > h) s.vy *= -1;

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = s.category + Math.round(s.alpha * 255).toString(16).padStart(2, '0');
        ctx.fill();
      });

      rafRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, [summary]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      aria-hidden="true"
    />
  );
}
