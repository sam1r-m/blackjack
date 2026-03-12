import type { Card, DealerRule } from "@/types/blackjack";
import type { Shoe } from "./shoe";
import { getHandTotals } from "./hand";

// dealer plays out their hand according to table rules
export function playDealerHand(
  initialCards: Card[],
  shoe: Shoe,
  rule: DealerRule
): Card[] {
  const cards = [...initialCards];

  while (true) {
    const totals = getHandTotals(cards);

    if (totals.bestTotal > 21) break;

    if (totals.bestTotal >= 18) break;

    if (totals.bestTotal === 17) {
      // hit on soft 17 if the rule says so
      if (rule === "hit_soft_17" && totals.isSoft) {
        cards.push(shoe.draw());
        continue;
      }
      break;
    }

    // always hit below 17
    cards.push(shoe.draw());
  }

  return cards;
}
