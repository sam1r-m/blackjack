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

def shuffle(deck):
    random.shuffle(deck)

def printDeck(deck):
    for card in deck:
        print(card)

def printHand(hand):
    for card in hand:
        print(card)

def checkBust(hand):
    if (sum(hand) > 21):
        return True

def checkBlackjack(hand):
    if (sum(hand) == 21):
        return True

def blackJack(deck):
    while (len(deck) > 8):
        dealerHand = ["Dealer Hand:"]
        playerHand = ["Player Hand:"]

        for i in range (0, 2):
            playerHand.append(deck.pop())
            dealerHand.append(deck.pop())
        
        printHand(dealerHand)
        print("\n")
        printHand(playerHand)
        print("\n")
        #print("Dealer Hand: Unknown, " + dealerHand[1] + "\n")
        #print("Player Hand: " + playerHand[0] + " " + playerHand[1] + "\n")

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
