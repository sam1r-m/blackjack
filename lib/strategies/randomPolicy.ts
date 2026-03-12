import type { GameStateView, PlayerAction, PlayerPolicy } from "@/types/blackjack";

// picks a random valid action - useful for stress testing the engine
export const randomPolicy: PlayerPolicy = {
  name: "random",

  decideAction(state: GameStateView): PlayerAction {
    const actions: PlayerAction[] = ["hit", "stand"];

    if (state.playerHand.canDouble) actions.push("double");
    if (state.playerHand.canSurrender) actions.push("surrender");

    return actions[Math.floor(Math.random() * actions.length)];
  },
};
