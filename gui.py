import random

# Suppress the Tkinter deprecation warning
import os
os.environ['TK_SILENCE_DEPRECATION'] = '1'

# GUI libraries:
import tkinter as tk
from tkinter import scrolledtext

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

def display_deck():
    suits = ["♥︎","♦︎","♣︎","♠︎"]
    deck = [Card(value, suit) for value in range(1, 14) for suit in suits]
    
    # Create the main window
    root = tk.Tk()
    root.title("Blackjack Deck")
    
    # Create a scrolled text area widget
    text_area = scrolledtext.ScrolledText(root, wrap=tk.WORD, width=40, height=20)
    text_area.pack(padx=10, pady=10)
    
    # Prevent users from editing the text area
    text_area.config(state='disabled')
    
    # Add the cards to the text area
    for card in deck:
        print(card)  # This should print to your console/terminal.
        text_area.config(state='normal')
        text_area.insert(tk.END, str(card) + '\n')
        text_area.config(state='disabled')
    
    # Start the GUI event loop
    root.mainloop()

if __name__ == "__main__":
    display_deck()