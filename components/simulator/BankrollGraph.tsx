"use client";

import { useRef, useEffect, useCallback } from "react";
import type { SessionRoundRecord } from "@/types/simulation";

interface BankrollGraphProps {
  rounds: SessionRoundRecord[];
  initialBankroll: number;
}

const PAD = { top: 16, right: 52, bottom: 28, left: 8 };

const C = {
  bg: "#111820",
  grid: "#1e2a35",
  label: "#6b7d8d",
  win: "#36d6a8",
  winEdge: "#2aad88",
  blackjack: "#f0c24a",
  blackjackEdge: "#c9981a",
  loss: "#e8446c",
  lossEdge: "#c43858",
  push: "#4da3ff",
  surrender: "#9b6dff",
  ref: "#f0c24a",
};

function barColor(result: string): { fill: string; edge: string } {
  switch (result) {
    case "blackjack":
      return { fill: C.blackjack, edge: C.blackjackEdge };
    case "win":
      return { fill: C.win, edge: C.winEdge };
    case "loss":
      return { fill: C.loss, edge: C.lossEdge };
    case "surrender":
      return { fill: C.surrender, edge: "#7a54cc" };
    case "push":
    default:
      return { fill: C.push, edge: "#3a82cc" };
  }
}

export default function BankrollGraph({ rounds, initialBankroll }: BankrollGraphProps) {
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

    if (rounds.length === 0) {
      ctx.fillStyle = C.label;
      ctx.font = '10px "Press Start 2P", monospace';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("play some hands", w / 2, h / 2);
      return;
    }

    const plotW = w - PAD.left - PAD.right;
    const plotH = h - PAD.top - PAD.bottom;

    // build candle data with result type
    const candles = rounds.map((r) => ({
      open: r.bankrollBefore,
      close: r.bankrollAfter,
      net: r.netWin,
      result: r.result,
    }));

    // cap bar width so early hands don't fill the whole chart
    const maxVisible = Math.floor(plotW / 4);
    const visible = candles.slice(-maxVisible);
    const maxBarW = 12;
    const barW = Math.min(maxBarW, Math.max(2, ((plotW / visible.length) | 0) - 1));
    const gap = 1;

    // y domain: enforce a minimum range of ±10% of initial bankroll
    // so the first few bars don't blow up to fill the entire chart
    const vals = [initialBankroll, ...visible.flatMap((c) => [c.open, c.close])];
    const dataMin = Math.min(...vals);
    const dataMax = Math.max(...vals);
    const minSpan = initialBankroll * 0.2;
    const dataSpan = dataMax - dataMin;
    const center = (dataMax + dataMin) / 2;

    let yMin: number, yMax: number;
    if (dataSpan < minSpan) {
      yMin = center - minSpan / 2;
      yMax = center + minSpan / 2;
    } else {
      const margin = dataSpan * 0.08;
      yMin = dataMin - margin;
      yMax = dataMax + margin;
    }
    const yRange = yMax - yMin || 1;

    const toY = (v: number) => (PAD.top + plotH - ((v - yMin) / yRange) * plotH) | 0;
    const toX = (i: number) => (PAD.left + i * (barW + gap)) | 0;

    // horizontal grid + y labels
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.font = "10px monospace";
    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
      const val = yMax - (i / gridLines) * yRange;
      const y = (PAD.top + (plotH / gridLines) * i) | 0;

      ctx.strokeStyle = C.grid;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(PAD.left, y + 0.5);
      ctx.lineTo(PAD.left + plotW, y + 0.5);
      ctx.stroke();

      ctx.fillStyle = C.label;
      ctx.fillText(`$${Math.round(val)}`, PAD.left + plotW + 5, y);
    }

    // initial bankroll reference line (dashed)
    const refY = toY(initialBankroll);
    ctx.strokeStyle = C.ref;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(PAD.left, refY + 0.5);
    ctx.lineTo(PAD.left + plotW, refY + 0.5);
    ctx.stroke();
    ctx.setLineDash([]);

    // draw candles
    for (let i = 0; i < visible.length; i++) {
      const c = visible[i];
      const x = toX(i);
      const openY = toY(c.open);
      const closeY = toY(c.close);
      const color = barColor(c.result);

      if (c.result === "push") {
        // horizontal dash for pushes
        ctx.strokeStyle = color.fill;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, openY + 0.5);
        ctx.lineTo(x + barW, openY + 0.5);
        ctx.stroke();
      } else {
        const top = Math.min(openY, closeY);
        const height = Math.max(Math.abs(closeY - openY), 2);

        ctx.fillStyle = color.fill;
        ctx.fillRect(x, top, barW, height);

        if (barW >= 4) {
          ctx.strokeStyle = color.edge;
          ctx.lineWidth = 1;
          ctx.strokeRect(x + 0.5, top + 0.5, barW - 1, height - 1);
        }
      }
    }

    // x-axis labels
    const labelEvery = Math.max(1, Math.ceil(visible.length / 8));
    const startIdx = candles.length - visible.length;
    ctx.fillStyle = C.label;
    ctx.font = "9px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    for (let i = 0; i < visible.length; i += labelEvery) {
      const handNum = startIdx + i + 1;
      const x = toX(i) + barW / 2;
      ctx.fillText(`${handNum}`, x, PAD.top + plotH + 6);
    }
  }, [rounds, initialBankroll]);

  useEffect(() => {
    draw();
    const obs = new ResizeObserver(draw);
    if (wrapRef.current) obs.observe(wrapRef.current);
    return () => obs.disconnect();
  }, [draw]);

  const currentBankroll =
    rounds.length > 0 ? rounds[rounds.length - 1].bankrollAfter : initialBankroll;

  return (
    <div className="rounded-md border border-border bg-panel p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-[family-name:var(--font-pixel)] text-xs text-text">
          Bankroll Chart
        </h2>
        {rounds.length > 0 && (
          <span className="font-[family-name:var(--font-mono)] text-sm text-accent">
            ${currentBankroll.toFixed(0)}
          </span>
        )}
      </div>
      <div ref={wrapRef} className="h-52">
        <canvas ref={canvasRef} className="block" />
      </div>
    </div>
  );
}
