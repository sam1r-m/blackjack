"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Card, RoundOutcome } from "@/types/blackjack";
import { Shoe } from "@/lib/engine/shoe";
import { runRound } from "@/lib/engine/round";
import { basicStrategy } from "@/lib/strategies/basicStrategy";
import { cardToSprite, CARD_BACK_SPRITE, CARD_BACK_RED_SPRITE } from "@/lib/cardSprite";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const BASE_BET = 25;
const START_BANKROLL = 1000;

const TABLE_RULES = {
  dealerRule: "hit_soft_17" as const,
  blackjackPayout: "3_to_2" as const,
  allowSurrender: true,
  allowDouble: true,
  allowSplit: true,
};

interface Slot {
  card: Card;
  owner: "player" | "dealer";
  handIndex: number;
  /** the dealer's second card, held face down until the hand is called */
  isHole?: boolean;
}

interface Frame {
  slots: Slot[];
  revealed: number;
  outcome: RoundOutcome;
  settled: boolean;
}

/**
 * Expose a finished round in the order a dealer would: the opening four, then
 * each player hand's draws, then the dealer's. Split hands stay grouped, so a
 * split reads as two hands rather than one long row.
 */
function toSlots(outcome: RoundOutcome): Slot[] {
  const slots: Slot[] = [];
  const hands = outcome.hands;
  const first = hands[0]?.playerCards ?? outcome.playerCards;

  slots.push({ card: first[0], owner: "player", handIndex: 0 });
  slots.push({ card: outcome.dealerCards[0], owner: "dealer", handIndex: 0 });
  if (first[1]) slots.push({ card: first[1], owner: "player", handIndex: 0 });
  if (outcome.dealerCards[1]) {
    slots.push({ card: outcome.dealerCards[1], owner: "dealer", handIndex: 0, isHole: true });
  }

  hands.forEach((hand, handIndex) => {
    hand.playerCards.slice(handIndex === 0 ? 2 : 0).forEach((card) => {
      slots.push({ card, owner: "player", handIndex });
    });
  });

  outcome.dealerCards.slice(2).forEach((card) => {
    slots.push({ card, owner: "dealer", handIndex: 0 });
  });

  return slots;
}

const RESULT_COPY: Record<string, { text: string; className: string }> = {
  win: { text: "Player wins", className: "text-accent" },
  blackjack: { text: "Blackjack", className: "text-highlight" },
  loss: { text: "Dealer wins", className: "text-loss" },
  push: { text: "Push", className: "text-info" },
  surrender: { text: "Surrendered", className: "text-[#9b6dff]" },
};

function money(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

export default function LiveTable() {
  const reducedMotion = usePrefersReducedMotion();
  const isNarrow = useMediaQuery("(max-width: 767px)");
  const [frame, setFrame] = useState<Frame | null>(null);
  const [bankroll, setBankroll] = useState(START_BANKROLL);
  const [handsDealt, setHandsDealt] = useState(0);
  // what the last hand paid, and a counter that retriggers the animations
  const [delta, setDelta] = useState<number | null>(null);
  const [pulse, setPulse] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    // the engine uses Math.random, so it only runs after mount and the server
    // and client markup stay identical
    const shoe = new Shoe({ deckCount: 6, penetration: 0.75 });
    let cancelled = false;

    const schedule = (fn: () => void, ms: number) => {
      const id = setTimeout(() => {
        if (!cancelled) fn();
      }, ms);
      timers.current.push(id);
    };

    const dealHand = () => {
      if (cancelled) return;

      const outcome = runRound(
        { rules: TABLE_RULES },
        {
          shoe,
          bet: BASE_BET,
          playerPolicy: basicStrategy,
          deckCount: 6,
          bankrollAvailable: Number.POSITIVE_INFINITY,
        }
      );

      const slots = toSlots(outcome);
      setFrame({ slots, revealed: reducedMotion ? slots.length : 0, outcome, settled: false });

      const step = 190;
      const settleAt = reducedMotion ? 350 : slots.length * step + 420;

      if (!reducedMotion) {
        for (let i = 1; i <= slots.length; i++) {
          schedule(() => setFrame((f) => (f ? { ...f, revealed: i } : f)), i * step);
        }
      }

      schedule(() => {
        setFrame((f) => (f ? { ...f, settled: true } : f));
        setBankroll((b) => b + outcome.netWin);
        setHandsDealt((n) => n + 1);
        setDelta(outcome.netWin);
        setPulse((p) => p + 1);
      }, settleAt);

      schedule(dealHand, settleAt + 2400);
    };

    const start = requestAnimationFrame(dealHand);

    return () => {
      cancelled = true;
      cancelAnimationFrame(start);
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, [reducedMotion]);

  const playerHands = useMemo(() => {
    if (!frame) return [] as { slot: Slot; index: number }[][];
    const grouped = new Map<number, { slot: Slot; index: number }[]>();
    frame.slots.forEach((slot, index) => {
      if (slot.owner !== "player") return;
      const list = grouped.get(slot.handIndex) ?? [];
      list.push({ slot, index });
      grouped.set(slot.handIndex, list);
    });
    return [...grouped.entries()].sort((a, b) => a[0] - b[0]).map(([, cards]) => cards);
  }, [frame]);

  const dealerSlots = useMemo(() => {
    if (!frame) return [] as { slot: Slot; index: number }[];
    return frame.slots
      .map((slot, index) => ({ slot, index }))
      .filter((entry) => entry.slot.owner === "dealer");
  }, [frame]);

  const baseScale = isNarrow ? 0.58 : 0.86;
  const handScale = baseScale * (playerHands.length > 2 ? 0.68 : playerHands.length === 2 ? 0.84 : 1);
  const result = frame?.settled ? RESULT_COPY[frame.outcome.result] : null;
  const netWin = frame?.settled ? frame.outcome.netWin : 0;

  return (
    <div
      className="relative isolate overflow-hidden rounded-2xl border-[3px] border-[#1e2a35]"
      style={{
        backgroundImage: "url(/Background_Green_Felt.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        boxShadow:
          "inset 0 0 110px 34px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(0,0,0,0.4), 0 18px 40px rgba(0,0,0,0.55)",
      }}
    >
      {/* tighter above so the hand sits higher on the felt, with the breathing
          room saved up for the gap before the call to action */}
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-5 py-8 sm:px-8 sm:py-10">
        {/* placard and live figures read as the two ends of a real table, and
            stack on narrow screens rather than squeezing each other */}
        <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="rounded-lg border-2 border-highlight/70 bg-[#0a0e13]/85 px-4 py-3 shadow-[0_4px_0_rgba(0,0,0,0.45)] sm:px-5 sm:py-4">
            <h1 className="font-[family-name:var(--font-pixel)] text-[13px] leading-[1.95] tracking-tight text-text sm:text-[17px]">
              Blackjack
              <br />
              <span className="text-accent">Martingale</span>
              <br />
              Simulator
            </h1>
            <div className="mt-3 border-t border-highlight/25 pt-2.5 font-[family-name:var(--font-mono)] text-[10px] leading-[1.7] sm:text-[11px]">
              <span className="block text-highlight">© 2026 Samir</span>
              <a
                href="https://github.com/sam1r-m/blackjack"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent underline-offset-2 transition-colors hover:text-highlight hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                Source on GitHub
              </a>
            </div>
          </div>

          <div className="text-left font-[family-name:var(--font-mono)] sm:text-right">
            <div className="text-[9px] uppercase tracking-[0.2em] text-white/65 sm:text-[10px]">
              Bankroll
            </div>
            {/* the delta floats out of the number without taking layout space,
                so the figure stays aligned with its label */}
            <div className="relative inline-block">
              {delta !== null && delta !== 0 && (
                <span
                  key={pulse}
                  aria-hidden
                  // sits right of the figure while the block is left-aligned,
                  // and flips to its left once the block aligns right
                  className={`animate-delta-float pointer-events-none absolute left-full top-1/2 ml-2.5 -translate-y-1/2 whitespace-nowrap text-[15px] font-bold tabular-nums sm:left-auto sm:right-full sm:ml-0 sm:mr-2.5 sm:text-[17px] ${
                    delta > 0 ? "text-accent" : "text-loss"
                  }`}
                  style={{ animation: "var(--animate-delta-float)" }}
                >
                  {delta > 0 ? "+" : "−"}${Math.abs(delta)}
                </span>
              )}
              <span
                // remounting on each settle restarts the pop
                key={`n-${pulse}`}
                className={`animate-bankroll-pop inline-block text-[30px] font-bold leading-tight tabular-nums sm:text-[34px] ${
                  bankroll >= START_BANKROLL ? "text-highlight" : "text-loss"
                }`}
                style={{ animation: "var(--animate-bankroll-pop)" }}
              >
                {money(bankroll)}
              </span>
            </div>
            <div className="mt-0.5 text-[10px] tabular-nums text-white/65 sm:text-[11px]">
              {handsDealt} {handsDealt === 1 ? "hand" : "hands"} · ${BASE_BET} a hand
            </div>
          </div>
        </div>

        {/* the shoe the cards come from: three decks stacked at the corner they
            arc in from */}
        <div className="pointer-events-none absolute right-6 top-1/2 hidden -translate-y-1/2 flex-col gap-3 lg:flex">
          {[CARD_BACK_SPRITE, CARD_BACK_RED_SPRITE, CARD_BACK_SPRITE].map((src, deck) => (
            <div key={deck} className="relative h-[92px] w-[72px]">
              {[0, 1, 2].map((i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={src}
                  alt=""
                  aria-hidden
                  width={66}
                  height={92}
                  className="absolute object-contain"
                  style={{
                    width: 66,
                    height: 92,
                    left: i * 3,
                    top: i * -2,
                    imageRendering: "pixelated",
                    filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.5))",
                  }}
                />
              ))}
            </div>
          ))}
        </div>

        {/* the hand itself */}
        <div className="flex flex-col items-center gap-3 sm:gap-4">
          <div className="flex min-h-[4.5rem] flex-wrap items-end justify-center gap-1.5 sm:min-h-[6.5rem]">
            {dealerSlots.map(({ slot, index }) => {
              const faceDown = slot.isHole && !frame?.settled;
              return (
                <DealtCard
                  key={`d-${index}`}
                  src={faceDown ? CARD_BACK_SPRITE : cardToSprite(slot.card)}
                  alt={faceDown ? "Dealer hole card, face down" : `${slot.card.rank} of ${slot.card.suit}`}
                  shown={frame ? index < frame.revealed : false}
                  reducedMotion={reducedMotion}
                  scale={baseScale}
                />
              );
            })}
          </div>

          <div className="flex h-7 items-center">
            {result && (
              <span
                className={`inline-flex items-center gap-2 rounded-md bg-black/60 px-3 py-1 ${result.className}`}
              >
                <span className="font-[family-name:var(--font-pixel)] text-[9px] leading-none sm:text-[10px]">
                  {result.text}
                </span>
                {netWin !== 0 && (
                  <span
                    // leading-none on both sides lets the flex box centre the two
                    // faces against each other, which lands within a pixel
                    className="font-[family-name:var(--font-mono)] text-[11px] font-bold leading-none tabular-nums sm:text-[12px]"
                  >
                    {netWin > 0 ? "+" : "−"}
                    {Math.abs(netWin)}
                  </span>
                )}
              </span>
            )}
          </div>

          <div className="flex min-h-[4.5rem] flex-wrap items-start justify-center gap-x-5 gap-y-2 sm:min-h-[6.5rem]">
            {playerHands.map((hand, handIndex) => (
              <div key={handIndex} className="flex items-end gap-1.5">
                {hand.map(({ slot, index }) => (
                  <DealtCard
                    key={`p-${index}`}
                    src={cardToSprite(slot.card)}
                    alt={`${slot.card.rank} of ${slot.card.suit}`}
                    shown={frame ? index < frame.revealed : false}
                    reducedMotion={reducedMotion}
                    scale={handScale}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* the live bet sits in the betting circle as a real chip, and the
            primary action sits directly under it */}
        <div className="flex flex-col items-center gap-8">
          <div className="flex h-[4.75rem] w-[4.75rem] items-center justify-center rounded-full border-2 border-dashed border-white/35">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/25chip.png"
              alt={`$${BASE_BET} chip, the bet on this hand`}
              width={54}
              height={54}
              className="h-[54px] w-[54px] object-contain drop-shadow-[0_3px_4px_rgba(0,0,0,0.5)]"
              style={{ imageRendering: "pixelated" }}
            />
          </div>
          <Link
            href="/simulator"
            className="rounded-lg border-2 border-highlight bg-highlight px-8 py-3.5 font-[family-name:var(--font-pixel)] text-[10px] leading-none text-bg shadow-[0_5px_0_#c9981a] transition-all hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent active:translate-y-[3px] active:shadow-[0_2px_0_#c9981a] sm:px-10 sm:text-[12px]"
          >
            Take a seat
          </Link>
        </div>
      </div>
    </div>
  );
}

function DealtCard({
  src,
  alt,
  shown,
  reducedMotion,
  scale,
}: {
  src: string;
  alt: string;
  shown: boolean;
  reducedMotion: boolean;
  scale: number;
}) {
  const width = Math.round(81 * scale);
  const height = Math.round(113 * scale);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className="object-contain will-change-transform"
      style={{
        width,
        height,
        imageRendering: "pixelated",
        opacity: shown ? 1 : 0,
        transform: shown ? "translate(0,0) rotate(0deg)" : "translate(90px,-70px) rotate(12deg)",
        transition: reducedMotion
          ? "opacity 140ms linear"
          : "transform 440ms cubic-bezier(0.16,1,0.3,1), opacity 190ms ease-out",
        filter: "drop-shadow(0 6px 8px rgba(0,0,0,0.45))",
      }}
    />
  );
}
