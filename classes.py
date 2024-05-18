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

class Hand:
    def __init__(self, type, cards):
        self.type = type
        self.cards = []

    def add_card(self, card):
        self.cards.append(card)
    
    def get_values(self):
        return [card.value for card in self.cards]
    
    def hand_total(self):
        total = 0
        aces = 0
        for card in self.cards:
            if card.value >= 10:
                total += 10
            elif card.value == 1:
                aces += 1
                total += 11
            else:
                total += card.value
        
        while (total > 21 and aces > 0):
            total -= 10
            aces -= 1
        
        return total

    def checkBlackjack(self):
        return (self.hand_total() == 21 and len(self.cards) == 2)
    
    def checkBust(self):
        return (self.hand_total() > 21)

    def __str__(self):
        return f"{self.type}: " + ", ".join(str(card) for card in self.cards) + "\n" + "Total: " + f"{self.hand_total()}"

def shuffle(deck):
    random.shuffle(deck)

def printDeck(deck):
    for card in deck:
        print(card)

def printHand(hand):
    for card in hand:
        print(card)

def checkPush(hand1, hand2):
    if (hand1.hand_total() == hand2.hand_total):
        return True
    
def blackJack(deck):
    while (len(deck) > 8): # I chose 8 arbitrarily. Can change to less or more cards
        dealerHand = Hand("Dealer", [])
        playerHand = Hand("Player", [])

        for i in range (0, 2):
            playerHand.add_card(deck.pop())
            dealerHand.add_card(deck.pop())

        # Prints initial blackjack state
        print(dealerHand.type)
        print(dealerHand.cards[0])
        print("Unknown")
        print(playerHand)
        
        if (checkPush(dealerHand, playerHand)):
            print("Push. Both players have BlackJack")
        elif (dealerHand.checkBlackjack()):
            print("Dealer has BlackJack")
        elif (playerHand.checkBlackjack()):
            print("Player has BlackJack")

        deck = ""
        


def main():
    playerShuffle = True

    suits = ["Hearts", "Diamonds", "Clubs", "Spades"] # Replaced by suits_symbol for clarity
    suits_symbol = ["♥︎","♦︎","♣︎","♠︎"]
    deck = [Card(value, suit) for value in range(1, 14) for suit in suits_symbol] # interchange suits_symbol and suits

    shoeSize = int(input("How many decks of cards do you want in the shoe? \n"))
    deck = deck * shoeSize
    shuffle(deck)

    blackJack(deck)

main()
