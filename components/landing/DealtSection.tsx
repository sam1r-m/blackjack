"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

interface DealtSectionProps {
  heading: string;
  lede: string;
  children: ReactNode;
  /** the panel arcs in from this side, alternating down the page like a deal */
  from?: "left" | "right";
}

// useLayoutEffect warns during SSR, and this component only arms itself on the client
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * A section that arrives the way the table deals. The panel is only ever hidden
 * when we have confirmed it starts below the fold and an observer is watching
 * it, so a missing observer, a failed effect, or reduced motion all leave the
 * content plainly visible rather than blank.
 */
export default function DealtSection({ heading, lede, children, from = "right" }: DealtSectionProps) {
  const reducedMotion = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement | null>(null);
  const [armed, setArmed] = useState(false);
  const [dealt, setDealt] = useState(false);

  useIsomorphicLayoutEffect(() => {
    if (reducedMotion) return;
    if (typeof IntersectionObserver === "undefined") return;
    const node = ref.current;
    if (!node) return;
    // only worth animating if the visitor will actually scroll to it
    if (node.getBoundingClientRect().top < window.innerHeight * 0.9) return;
    setArmed(true);
  }, [reducedMotion]);

  useEffect(() => {
    if (!armed) return;
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setDealt(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 }
    );
    observer.observe(node);

    // never leave the panel hidden if the observer somehow never fires
    const failsafe = setTimeout(() => setDealt(true), 3000);
    return () => {
      observer.disconnect();
      clearTimeout(failsafe);
    };
  }, [armed]);

  const hidden = armed && !dealt;
  const offset = from === "right" ? 56 : -56;

  return (
    // more room above the heading than below it, so each section reads as a unit.
    // overflow-x-clip keeps the entrance transform from widening the page while
    // the panel is still sliding in.
    <section className="mx-auto w-full max-w-4xl overflow-x-clip px-5 pb-14 pt-20 sm:px-8 sm:pb-20 sm:pt-28">
      <h2
        className="max-w-[26ch] font-[family-name:var(--font-pixel)] text-[15px] leading-[1.9] text-text sm:text-[18px]"
        style={{ textWrap: "balance" }}
      >
        {heading}
      </h2>
      {/* ch is measured off the digit zero, which runs narrow in this face, so
          the cap is set below the target to land near a 70-character measure */}
      <p className="mt-5 max-w-[51ch] text-[17px] leading-[1.65] text-muted sm:text-[18px]">{lede}</p>
      <div
        ref={ref}
        className="mt-10"
        style={{
          opacity: hidden ? 0 : 1,
          transform: hidden ? `translate(${offset}px, -30px) rotate(${from === "right" ? 2.5 : -2.5}deg)` : "none",
          transition: reducedMotion
            ? "none"
            : "transform 640ms cubic-bezier(0.16,1,0.3,1), opacity 400ms ease-out",
        }}
      >
        {children}
      </div>
    </section>
  );
}
