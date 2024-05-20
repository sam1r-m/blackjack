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
    if (hand1.hand_total() == hand2.hand_total()):
        print("It is a push")
        return True

def winCheck(dealerHand, playerHand):
    if ((dealerHand.checkBust()) or (playerHand.hand_total() > dealerHand.hand_total())):
        print("Player wins")
        return True
    elif ((playerHand.checkBust()) or (dealerHand.hand_total() > playerHand.hand_total())):
        print("Player loses")
        return False
    
def blackJack(deck):
    bankBalance = 100 # $ amount to start
    initialBet = 5 # $ amount for initial bet
    minimumBet = 5

    while (len(deck) > 8): # I chose 8 arbitrarily. Can change to less or more cards
        print("Your current bank balance is:", bankBalance)

        if (bankBalance < minimumBet):
            print("You have insufficient funds to continue playing")
            return
        
        bet = int(input("How much do you want to bet this hand? ")) # Bet amount
        bankBalance -= bet

        dealerHand = Hand("Dealer", [])
        playerHand = Hand("Player", [])

        for i in range (0, 2):
            playerHand.add_card(deck.pop())
            dealerHand.add_card(deck.pop())

        # Prints initial blackjack state
        print(f"{dealerHand.type}: " + f"{dealerHand.cards[0]}" + ", " + "Unknown" + "\n" + "Total: - ")
        print(playerHand)
        print("\n") 
        
        # Checking for early Black Jack
        if (dealerHand.checkBlackjack() and playerHand.checkBlackjack()):
            bankBalance += (bet * 2)
            continue
        elif (dealerHand.checkBlackjack()):
            print("Dealer has BlackJack")
            continue
        elif (playerHand.checkBlackjack()):
            print("Player has BlackJack")
            bankBalance += (bet * 2.5)
            continue
            
        playerAction = "hit" 
        while(not(playerHand.checkBust()) and not(playerAction == "stand")):
            playerAction = str(input("What do you want to do? ('hit' or 'stand'): "))
            
            if (playerAction == "hit"):
                playerHand.add_card(deck.pop())
                print(f"{dealerHand.type}: " + f"{dealerHand.cards[0]}" + ", " + "Unknown" + "\n" + "Total: - ")
                print(playerHand)
                print("\n")                 
        
        print(dealerHand)
        print(playerHand)
        print("\n")  

        if (not(playerHand.checkBust())):
            while (not(dealerHand.checkBust()) and (dealerHand.hand_total() <= 17)):
                #Check for soft 17
                if (dealerHand.hand_total() == 17):
                    if (dealerHand.cards[0].value == 1 or dealerHand.cards[1].value == 1):
                        dealerHand.add_card(deck.pop())
                else:
                    dealerHand.add_card(deck.pop())
            
            print(dealerHand)
            print(playerHand)
            print("\n")

        elif (playerHand.checkBust()):
            print("Player has bust")
            continue          

        if checkPush(dealerHand, playerHand):
            bankBalance += bet
        elif (winCheck(dealerHand, playerHand)):   
            bankBalance += (bet * 2)
        else:
            continue

        print("-*-========-=-========-*-")

    print("You have reached the end of the shoe. Your final balance is:")
    print(bankBalance)
        


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
