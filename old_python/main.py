from classes import Card, Hand
from functions import shuffle, blackJack

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