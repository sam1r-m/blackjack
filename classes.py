import random

class Card:
    def __init__(self, value, suit):
        self.value = value
        self.suit = suit

    def __str__(self):
            value_names = {1: "Ace", 11: "Jack", 12: "Queen", 13: "King"}
            # Use the value_names dictionary to convert numerical values to names, if applicable
            # If the value is not in the dictionary (2-10), it will just use the number
            value_str = value_names.get(self.value, str(self.value))
            return f"{value_str} of {self.suit}"

suits = ["Hearts", "Diamonds", "Clubs", "Spades"]
suits_symbol = ["♥︎","♦︎","♣︎","♠︎"]

deck = [Card(value, suit) for value in range(1, 14) for suit in suits_symbol] # interchange suits_symbol and suits

for card in deck:
     print(card)

random.shuffle(deck)
print("============ Shuffled deck ============")
for card in deck:
     print(card)
