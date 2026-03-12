import Link from "next/link";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
      {/* radial glow behind the title */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/[0.04] blur-[120px]" />

      <div className="relative z-10 flex flex-col items-center gap-10 px-6 text-center">
        {/* title card with glow border */}
        <div className="relative rounded-md border border-accent/40 px-12 py-10 shadow-[0_0_40px_rgba(54,214,168,0.06)] md:px-20 md:py-12">
          {/* corner accents */}
          <div className="absolute top-0 left-0 h-3 w-3 border-t-2 border-l-2 border-accent" />
          <div className="absolute top-0 right-0 h-3 w-3 border-t-2 border-r-2 border-accent" />
          <div className="absolute bottom-0 left-0 h-3 w-3 border-b-2 border-l-2 border-accent" />
          <div className="absolute bottom-0 right-0 h-3 w-3 border-b-2 border-r-2 border-accent" />

          <h1 className="font-[family-name:var(--font-pixel)] text-xl leading-[2.2] tracking-wide text-text md:text-2xl lg:text-3xl">
            Blackjack
            <br />
            <span className="text-accent">Martingale</span>
            <br />
            Simulator
          </h1>
        </div>

        {/* suits */}
        <div className="flex gap-5 text-2xl">
          <span className="text-loss drop-shadow-[0_0_8px_rgba(232,68,108,0.4)]">♥</span>
          <span className="text-accent drop-shadow-[0_0_8px_rgba(54,214,168,0.4)]">♠</span>
          <span className="text-loss drop-shadow-[0_0_8px_rgba(232,68,108,0.4)]">♦</span>
          <span className="text-accent drop-shadow-[0_0_8px_rgba(54,214,168,0.4)]">♣</span>
        </div>

        {/* CTA */}
        <Link
          href="/simulator"
          className="rounded-md border-2 border-highlight bg-highlight px-10 py-3.5 font-[family-name:var(--font-pixel)] text-xs tracking-wider text-bg shadow-[0_4px_0_#c9981a] transition-all hover:shadow-[0_4px_0_#c9981a,0_0_20px_rgba(240,194,74,0.2)] active:translate-y-[2px] active:shadow-[0_2px_0_#c9981a]"
        >
          [ START SIMULATION ]
        </Link>

        {/* subtle tagline */}
        <span className="font-[family-name:var(--font-mono)] text-xs tracking-wider text-muted/40">
          probability · stochastic processes · risk analytics
        </span>
      </div>
    </div>
  );
}
