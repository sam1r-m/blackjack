"use client";

import { useRef, useEffect, useCallback } from "react";
import type { MonteCarloSessionSample } from "@/types/simulation";

interface DistributionChartProps {
  sessions: MonteCarloSessionSample[];
  initialBankroll?: number;
}

const PAD = { top: 16, right: 12, bottom: 40, left: 8 };

const C = {
  bg: "#111820",
  grid: "#1e2a35",
  label: "#6b7d8d",
  bar: "#36d6a8",
  barEdge: "#2aad88",
  barLoss: "#e8446c",
  barLossEdge: "#c43858",
  ref: "#f0c24a",
};

function buildBuckets(values: number[], count: number) {
  if (values.length === 0) return [];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const size = range / count;

  const buckets = Array.from({ length: count }, (_, i) => ({
    low: min + i * size,
    high: min + (i + 1) * size,
    count: 0,
  }));

  for (const v of values) {
    let idx = Math.floor((v - min) / size);
    if (idx >= count) idx = count - 1;
    buckets[idx].count++;
  }

  return buckets;
}

export default function DistributionChart({ sessions, initialBankroll = 1000 }: DistributionChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const dpr = window.devicePixelRatio || 1;
    const w = wrap.clientWidth;
    const h = 208;

    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);
    ctx.imageSmoothingEnabled = false;

    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, w, h);

    if (sessions.length === 0) {
      ctx.fillStyle = C.label;
      ctx.font = '10px "Press Start 2P", monospace';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("run a simulation", w / 2, h / 2);
      return;
    }

    const plotW = w - PAD.left - PAD.right;
    const plotH = h - PAD.top - PAD.bottom;

    const bankrolls = sessions.map((s) => s.endingBankroll);
    const initialBR = initialBankroll;
    const bucketCount = Math.min(20, Math.max(8, Math.ceil(Math.sqrt(sessions.length))));
    const buckets = buildBuckets(bankrolls, bucketCount);

    const maxCount = Math.max(...buckets.map((b) => b.count), 1);
    const barW = Math.max(2, ((plotW / buckets.length) | 0) - 2);
    const gap = 2;

    // horizontal grid
    ctx.font = "9px monospace";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    const gridLines = 4;
    for (let i = 0; i <= gridLines; i++) {
      const val = maxCount - (i / gridLines) * maxCount;
      const y = (PAD.top + (plotH / gridLines) * i) | 0;

      ctx.strokeStyle = C.grid;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(PAD.left, y + 0.5);
      ctx.lineTo(PAD.left + plotW, y + 0.5);
      ctx.stroke();
    }

    // bars
    for (let i = 0; i < buckets.length; i++) {
      const b = buckets[i];
      const x = (PAD.left + i * (barW + gap)) | 0;
      const barH = Math.max(b.count > 0 ? 2 : 0, ((b.count / maxCount) * plotH) | 0);
      const y = PAD.top + plotH - barH;

      // color based on whether this bucket is above or below starting bankroll
      const midpoint = (b.low + b.high) / 2;
      const isProfit = midpoint >= initialBR;

      ctx.fillStyle = isProfit ? C.bar : C.barLoss;
      ctx.fillRect(x, y, barW, barH);

      if (barW >= 4 && barH >= 2) {
        ctx.strokeStyle = isProfit ? C.barEdge : C.barLossEdge;
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 0.5, y + 0.5, barW - 1, barH - 1);
      }
    }

    // x-axis labels
    ctx.fillStyle = C.label;
    ctx.font = "8px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    const labelEvery = Math.max(1, Math.ceil(buckets.length / 6));
    for (let i = 0; i < buckets.length; i += labelEvery) {
      const b = buckets[i];
      const x = (PAD.left + i * (barW + gap) + barW / 2) | 0;
      ctx.save();
      ctx.translate(x, PAD.top + plotH + 5);
      ctx.rotate(-0.4);
      ctx.fillText(`$${Math.round(b.low)}`, 0, 0);
      ctx.restore();
    }
  }, [sessions]);

  useEffect(() => {
    draw();
    const obs = new ResizeObserver(draw);
    if (wrapRef.current) obs.observe(wrapRef.current);
    return () => obs.disconnect();
  }, [draw]);

  return (
    <div className="rounded-md border border-border bg-panel p-4">
      <h2 className="mb-3 font-[family-name:var(--font-pixel)] text-xs text-text">
        Ending Bankroll Distribution
      </h2>
      <div ref={wrapRef} className="h-52">
        <canvas ref={canvasRef} className="block" />
      </div>
    </div>
  );
}
