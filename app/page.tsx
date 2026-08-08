import LiveTable from "@/components/landing/LiveTable";
import DealtSection from "@/components/landing/DealtSection";
import RulesLedger from "@/components/landing/RulesLedger";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* the table itself is the first viewport */}
      <header className="px-3 pt-3 sm:px-6 sm:pt-6">
        <LiveTable />
      </header>

      <main>
        <DealtSection
          from="right"
          heading="House Edge Explained"
          lede="House edge is governed by the rules of the game. This can range from how many decks are used, what blackjack pays, whether the dealer hits soft 17, and more."
        >
          <RulesLedger />
        </DealtSection>
      </main>
    </div>
  );
}
