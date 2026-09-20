import { useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';
import type { DataSummary, ReceiptCategory } from '../../types';
import { getCategoryColor } from '../ui/CategoryBadge';

interface GraphNode {
  id: string;
  label: string;
  category: ReceiptCategory;
  count: number;
  type: 'artist' | 'category';
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface GraphLink {
  source: string;
  target: string;
  strength: number;
  reason: string;
}

interface ConnectionGraphProps {
  summary: DataSummary;
  onNodeClick?: (node: GraphNode) => void;
}

export function ConnectionGraph({ summary, onNodeClick }: ConnectionGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const simulRef = useRef<d3.Simulation<GraphNode, GraphLink> | null>(null);
  const nodesRef = useRef<GraphNode[]>([]);
  const linksRef = useRef<GraphLink[]>([]);
  const transformRef = useRef<d3.ZoomTransform>(d3.zoomIdentity);
  const hoveredRef = useRef<GraphNode | null>(null);

  const buildGraph = useCallback(() => {
    const nodes: GraphNode[] = [];
    const links: GraphLink[] = [];

    // Add top artists (up to 40)
    summary.spotify.topArtists.slice(0, 40).forEach(a => {
      nodes.push({
        id: `artist_${a.name}`,
        label: a.name,
        category: 'music',
        count: a.count,
        type: 'artist',
      });
    });

    // Add top household categories
    summary.household.topCategories.slice(0, 12).forEach(c => {
      const catMap: Record<string, ReceiptCategory> = {
        Food: 'food', Transportation: 'transport', Health: 'health',
        Household: 'household', subscription: 'subscription', Family: 'family',
        Entertainment: 'entertainment', Apparel: 'apparel', Culture: 'entertainment',
        Investment: 'investment',
      };
      const category = catMap[c.name] || 'other';
      nodes.push({
        id: `cat_${c.name}`,
        label: c.name,
        category,
        count: c.count,
        type: 'category',
      });
    });

    // Add links: artists with similar play counts → connected
    const artistNodes = nodes.filter(n => n.type === 'artist');
    for (let i = 0; i < artistNodes.length - 1; i++) {
      for (let j = i + 1; j < artistNodes.length; j++) {
        const ratio = Math.min(artistNodes[i].count, artistNodes[j].count) /
                       Math.max(artistNodes[i].count, artistNodes[j].count);
        if (ratio > 0.5 && i < j + 5) {
          links.push({
            source: artistNodes[i].id,
            target: artistNodes[j].id,
            strength: ratio,
            reason: 'Similar listening frequency',
          });
        }
      }
    }

    // Central music node connects to top 5 artists
    const musicCatNode: GraphNode = {
      id: 'cat_Music', label: 'Music', category: 'music', count: summary.spotify.totalRecords, type: 'category'
    };
    nodes.push(musicCatNode);
    artistNodes.slice(0, 8).forEach(a => {
      links.push({ source: 'cat_Music', target: a.id, strength: 0.8, reason: 'Music artist' });
    });

    nodesRef.current = nodes;
    linksRef.current = links;
  }, [summary]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const t = transformRef.current;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;

    ctx.save();
    ctx.clearRect(0, 0, w * dpr, h * dpr);

    ctx.translate(t.x, t.y);
    ctx.scale(t.k, t.k);

    const nodes = nodesRef.current;
    const links = linksRef.current;
    const hovered = hoveredRef.current;

    // Draw links
    links.forEach(link => {
      const s = nodes.find(n => n.id === (typeof link.source === 'object' ? (link.source as GraphNode).id : link.source));
      const tgt = nodes.find(n => n.id === (typeof link.target === 'object' ? (link.target as GraphNode).id : link.target));
      if (!s?.x || !tgt?.x) return;

      const isHighlighted = hovered && (
        (typeof link.source === 'object' ? (link.source as GraphNode).id : link.source) === hovered.id ||
        (typeof link.target === 'object' ? (link.target as GraphNode).id : link.target) === hovered.id
      );

      ctx.beginPath();
      ctx.moveTo(s.x!, s.y!);
      ctx.lineTo(tgt.x!, tgt.y!);
      ctx.strokeStyle = isHighlighted
        ? `rgba(0,0,0,${0.4 * link.strength})`
        : `rgba(0,0,0,${0.08 * link.strength})`;
      ctx.lineWidth = isHighlighted ? 1 : 0.5;
      ctx.stroke();
    });

    // Draw nodes
    nodes.forEach(node => {
      if (!node.x) return;
      const color = getCategoryColor(node.category);
      const maxCount = Math.max(...nodes.map(n => n.count));
      const r = 4 + (node.count / maxCount) * 18;
      const isHov = hovered?.id === node.id;

      // Glow for hovered
      if (isHov) {
        ctx.beginPath();
        ctx.arc(node.x, node.y!, r + 8, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(node.x, node.y!, 0, node.x, node.y!, r + 8);
        grad.addColorStop(0, color + '40');
        grad.addColorStop(1, color + '00');
        ctx.fillStyle = grad;
        ctx.fill();
      }

      // Node circle
      ctx.beginPath();
      ctx.arc(node.x, node.y!, r, 0, Math.PI * 2);
      ctx.fillStyle = isHov ? color : color + '99';
      ctx.fill();

      // Border
      ctx.strokeStyle = isHov ? color : color + '44';
      ctx.lineWidth = isHov ? 2 : 1;
      ctx.stroke();

      // Label (only for larger nodes or hovered)
      if (r > 9 || isHov) {
        ctx.fillStyle = isHov ? '#1A1A1A' : 'rgba(26,26,26,0.8)';
        ctx.font = isHov ? `bold ${Math.max(9, Math.min(13, r))}px monospace` : `${Math.max(8, Math.min(11, r))}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const label = node.label.length > 14 ? node.label.slice(0, 12) + '…' : node.label;
        ctx.fillText(label, node.x, node.y! + r + (isHov ? 16 : 13));
      }
    });

    ctx.restore();
  }, []);

  useEffect(() => {
    buildGraph();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;

    const sim = d3.forceSimulation<GraphNode>(nodesRef.current)
      .force('link', d3.forceLink<GraphNode, GraphLink>(linksRef.current)
        .id(d => d.id).distance(80).strength(l => l.strength * 0.3))
      .force('charge', d3.forceManyBody().strength(-120))
      .force('center', d3.forceCenter(w / 2, h / 2))
      .force('collision', d3.forceCollide<GraphNode>(d => {
        const max = Math.max(...nodesRef.current.map(n => n.count));
        return 8 + (d.count / max) * 22;
      }))
      .on('tick', draw);

    simulRef.current = sim;

    // Zoom
    const zoom = d3.zoom<HTMLCanvasElement, unknown>()
      .scaleExtent([0.3, 4])
      .on('zoom', e => {
        transformRef.current = e.transform;
        draw();
      });
    d3.select(canvas).call(zoom);

    // Drag
    d3.select(canvas).call(
      d3.drag<HTMLCanvasElement, unknown>()
        .subject((event: MouseEvent) => {
          const t = transformRef.current;
          const mx = (event.x - t.x) / t.k;
          const my = (event.y - t.y) / t.k;
          return nodesRef.current.find(n => {
            const max = Math.max(...nodesRef.current.map(x => x.count));
            const r = 4 + (n.count / max) * 18;
            return n.x && Math.hypot(n.x - mx, (n.y || 0) - my) < r;
          }) || null;
        })
        .on('start', function(event: d3.D3DragEvent<HTMLCanvasElement, unknown, GraphNode>, d: unknown) {
          const node = d as GraphNode;
          if (!node) return;
          if (!event.active) sim.alphaTarget(0.3).restart();
          node.fx = node.x;
          node.fy = node.y;
        })
        .on('drag', function(event: d3.D3DragEvent<HTMLCanvasElement, unknown, GraphNode>, d: unknown) {
          const node = d as GraphNode;
          if (!node) return;
          const t = transformRef.current;
          node.fx = (event.x - t.x) / t.k;
          node.fy = (event.y - t.y) / t.k;
        })
        .on('end', function(event: d3.D3DragEvent<HTMLCanvasElement, unknown, GraphNode>, d: unknown) {
          const node = d as GraphNode;
          if (!node) return;
          if (!event.active) sim.alphaTarget(0);
          node.fx = null;
          node.fy = null;
        })
    );

    // Hover
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const t = transformRef.current;
      const mx = (e.clientX - rect.left - t.x) / t.k;
      const my = (e.clientY - rect.top - t.y) / t.k;
      const found = nodesRef.current.find(n => {
        const max = Math.max(...nodesRef.current.map(x => x.count));
        const r = 4 + (n.count / max) * 18;
        return n.x && Math.hypot(n.x - mx, (n.y || 0) - my) < r;
      }) || null;
      hoveredRef.current = found;
      canvas.style.cursor = found ? 'pointer' : 'grab';
      draw();
    };
    const handleClick = () => {
      if (hoveredRef.current) {
        onNodeClick?.(hoveredRef.current);
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleClick);

    return () => {
      sim.stop();
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleClick);
    };
  }, [buildGraph, draw, onNodeClick]);

  return (
    <div className="relative w-full" style={{ height: 480 }}>
      <canvas
        ref={canvasRef}
        className="w-full h-full rounded-sm border border-dashed border-strong"
        style={{ background: 'var(--surface)', cursor: 'grab' }}
        aria-label="Interactive connection graph showing artists and categories"
        role="img"
      />
      <div className="absolute bottom-3 right-3 flex gap-2 text-[10px] text-2 font-mono font-bold">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-1" /> Music
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-2" /> Finance
        </span>
      </div>
      <div className="absolute top-3 left-3 text-[10px] text-3 font-mono">
        Scroll to zoom · Drag nodes · Click to inspect
      </div>
    </div>
  );
}
