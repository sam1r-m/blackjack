import random
from classes import Card, Hand

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
            print(dealerHand)
            print(playerHand)
            print("\n")
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
                if (dealerHand.hand_total() == 17 and any(card.value == 1 for card in dealerHand.cards)):
                    print("The dealer is hitting a card on a soft 17")
                    dealerHand.add_card(deck.pop())
                elif(dealerHand.hand_total() < 17):
                    dealerHand.add_card(deck.pop())
                else:
                    print("The dealer has a hard 17 so they stop hitting")
                    #break
                    
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
        
