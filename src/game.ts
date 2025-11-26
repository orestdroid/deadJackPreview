import {DECK_LIBRARY} from "./deck.ts";

export type Card = {
    value: string;
    suit: string;
    weight: number;
};

const ALL_ITEMS = ["Удалить свою карту", "Украсть карту диллера", "+1 своей карте", "-1 своей карте"] as const;
type item = (typeof ALL_ITEMS)[number];

// todo should be in deck.ts
class Deck {
    cards: Card[] = [];

    constructor(cards: Card[]) {
        this.cards = [...cards];
        this.shuffle();
    }

    shuffle() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    draw(): Card {
        return this.cards.pop()!;
    }
}

export class BlackjackRound {

    player: Card[];
    dealer: Card[];
    isRoundOver = false;
    dealerHidden = true;
    public match: Match;


    constructor(match: Match) {
        this.player = [];
        this.dealer = [];
        this.match = match;
        this.isRoundOver = false;
        this.dealerHidden = true;
        this.player.push(this.match.popDeck());
        this.player.push(this.match.popDeck());
        this.dealer.push(this.match.popDeck());
        this.dealer.push(this.match.popDeck());
    }

    get playerItems() {
        return this.match.game.playerItems;
    }

    getHandValue(hand: Card[]): number {
        let total = hand.reduce((sum, c) => sum + c.weight, 0);
        let aces = hand.filter(c => c.value === "A").length;
        while (total > 21 && aces > 0) {
            total -= 10;
            aces--;
        }
        return total;
    }

    playerHit() {
        if (this.isRoundOver) return;
        this.player.push(this.match.popDeck());
        this.checkPlayerPoints();
    }

    checkPlayerPoints() {
        if (this.getHandValue(this.player) > 21) {
            this.isRoundOver = true;
            this.match.dealerRoundsWon++;
            this.match.history.push(false);
            // todo move that 3 lines above into .endMatch method
            this.match.endMatch("Player busts! Dealer wins.");
        }
    }

    playerStand() {
        if (this.isRoundOver) return;
        if (this.getHandValue(this.player) <= 21) {
            while (this.getHandValue(this.dealer) < this.getHandValue(this.player)) {
                this.dealer.push(this.match.popDeck());
            }
            while (this.getHandValue(this.dealer) < 17) {
                this.dealer.push(this.match.popDeck());
            }
        }
        this.finishRound();

    }

    // todo separate item effects into their own functions
    // e.g. useRemovePlayerCardItem(cardIndex: number), useStealDealerCardItem(cardIndex: number), etc.
    // todo item selection part of the code can be moved into Game class
    useItem() {
        if (this.isRoundOver) return;
        if (this.playerItems.length === 0) {
            document.getElementById("message")!.textContent = "No items to use!";
            return;
        }
        let itemUsePrompt = "Какой предмет использовать?\n";
        this.playerItems.forEach((item, index) => {
            itemUsePrompt += `${index}: ${item}\n`;
        });
        // todo you can extract that prompt logic into its own function
        // e.g. promptForNumberInput(message: string, maxIndex: number): number | null
        // will prompt user in infinite loop until valid input is given or user cancels
        let itemIndex = prompt(itemUsePrompt);
        if (itemIndex === null) return;
        else if (isNaN(Number(itemIndex))) return;
        else if (+itemIndex >= this.playerItems.length) return;
        const item = this.playerItems[+itemIndex];
        this.playerItems.splice(+itemIndex, 1);
        document.getElementById("message")!.textContent = `Used item: ${item}`;

        if (item === "Удалить свою карту") {
            let itemUsePrompt = prompt("Какую карту удалить?\n(Нумерация с 0)");
            if (itemUsePrompt === null) return;
            else if (isNaN(Number(itemUsePrompt))) return;
            else if (+itemUsePrompt < this.player.length) this.player.splice(+itemUsePrompt, 1);
        } else if (item === "Украсть карту диллера") {
            let itemUsePrompt = prompt("Какую карту украсть?\n(Нумерация с 0)");
            if (itemUsePrompt === null) return;
            else if (isNaN(Number(itemUsePrompt))) return;
            else if (+itemUsePrompt < this.dealer.length) {
                this.player.push(this.dealer[+itemUsePrompt]);
                this.dealer.splice(+itemUsePrompt, 1);
                this.dealer.push(this.match.popDeck());
            }

        } else if (item === "+1 своей карте") {
            let itemUsePrompt = prompt("К какой карте добавить 1?\n(Нумерация с 0)");
            if (itemUsePrompt === null) return;
            else if (isNaN(Number(itemUsePrompt))) return;
            else if (+itemUsePrompt < this.player.length) this.player[+itemUsePrompt].weight += 1;
        } else if (item === "-1 своей карте") {
            let itemUsePrompt = prompt("У какой карты отнять 1?\n(Нумерация с 0)");
            if (itemUsePrompt === null) return;
            else if (isNaN(Number(itemUsePrompt))) return;
            else if (+itemUsePrompt < this.player.length) this.player[+itemUsePrompt].weight -= 1;
        }
        this.checkPlayerPoints();
    }

    // todo this method can just calculate and return the result instead of ending the match itself
    // e.g. return "player_win" | "dealer_win" | "tie" | "player_bust" | "dealer_bust" | null
    // and then the caller in Match class can handle the match ending logic
    // todo also this method can be merged with checkPlayerPoints method
    finishRound() {
        const p = this.getHandValue(this.player);
        const d = this.getHandValue(this.dealer);
        // todo this line can be moved in Match or Game class
        if (this.match.roundsPlayed % 3 === 0) this.match.game.addItem();
        if (d > 21) {
            this.match.playerRoundsWon++;
            this.match.history.push(true);
            this.isRoundOver = true;
            this.dealerHidden = false;
            // todo move that 4 lines above into .endMatch method
            return this.match.endMatch("Dealer busts! Player wins.");

        }
        if (p > d) {
            this.match.playerRoundsWon++;
            this.match.history.push(true);
            this.isRoundOver = true;
            this.dealerHidden = false;
            return this.match.endMatch("Player wins!");
        }
        if (d > p) {
            this.match.dealerRoundsWon++;
            this.match.history.push(false);
            this.isRoundOver = true;
            this.dealerHidden = false;
            return this.match.endMatch("Dealer wins!");
        }
        this.isRoundOver = true;
        this.dealerHidden = false;
        return this.match.endMatch("It's a tie!");
    }

    // todo should be inlined in updateUI function
    restartButtonSwitch(turn: boolean) {
        const restartBtn = document.getElementById("restart") as HTMLButtonElement | null;
        if (restartBtn) {
            restartBtn.disabled = turn;
            restartBtn.setAttribute("aria-disabled", "false");
        }
    }
}

export class Match {
    deck: Deck;
    roundsPlayed = 1;
    playerRoundsWon = 0;
    dealerRoundsWon = 0;
    currentDeckIndex = 0;
    oldDeckIndex = 0;
    matchIsOver = false;
    game: Game;
    round: BlackjackRound;
    history: boolean[];

    createNewDeck(): Deck {
        const deckConfig = DECK_LIBRARY[this.currentDeckIndex];
        console.log(`🃏 Using deck: ${deckConfig.name}`);
        return new Deck(deckConfig.cards);
    }

    constructor(game: Game) {
        this.oldDeckIndex = this.currentDeckIndex;
        while (this.currentDeckIndex === this.oldDeckIndex) {
            // todo random function can be extracted into more friendly function e.g. getRandomInt(max: number): number
            // todo use ctrl+shift+f to find other instances of Math.random()
            this.currentDeckIndex = Math.floor(Math.random() * DECK_LIBRARY.length);
        }
        this.deck = this.createNewDeck();
        this.game = game;
        this.round = new BlackjackRound(this)
        this.history = []
    }

    popDeck() {
        let card = this.deck.draw()
        if (card !== undefined) {
            return card;
        }
        this.deck = this.createNewDeck();
        return this.deck.draw();

    }

    // todo add playerHit and playerStand methods that just call this.round.playerHit / this.round.playerStand
    // then ask this.round about round result ("player_win" | "dealer_win" | "tie" | "player_bust" | "dealer_bust" | null)
    // and handle match ending logic here accordingly


    endMatch(message: string) {
        // todo shouldn't directly manipulate UI here
        document.getElementById("message")!.textContent = message;

        if (this.playerRoundsWon === 3) {
            document.getElementById("message")!.textContent = "Get your point loser";
            this.game.playerScore++;
            this.matchIsOver = true;
            this.game.resetGame();
        }
        if (this.dealerRoundsWon === 3) {
            document.getElementById("message")!.textContent = "Better luck next time";
            this.game.playerHealth -= 1;
            this.matchIsOver = true;
            this.game.resetGame();
        }
    }
}

export class Game {

    playerHealth = 10;
    playerScore = 0;
    playerItems: item[] = [];
    match: Match;

    constructor() {
        this.match = new Match(this);
    }

  // todo add playerHit and playerStand methods that just call this.match.playerHit / this.match.playerStand
  // then check in this.match if match is over and handle accordingly
  // then check if game is over

  // todo add useItem method that will call this.match.round.useItemA or useItemB based on selected item


    addItem() {
        if (this.playerItems.length < 4)
            this.playerItems.push(ALL_ITEMS[Math.floor(Math.random() * ALL_ITEMS.length)]);

    }

    resetGame() {

        if (this.playerHealth <= 0) {
            this.playerScore = 0;
            this.playerItems = [];
            this.playerHealth = 10;
            alert("Game Over! You have no health left.");
        }
        if (this.playerScore >= 10) {
            this.playerScore = 0;
            this.playerItems = [];
            this.playerHealth = 10;
            alert("Congratulations! You reached 10 points and won the game!");
        }
    }

}
