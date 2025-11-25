type Card = {
    value: string;
    suit: string;
    weight: number;
};


/* ------------------------------------------
   CUSTOM DECKS YOU CAN EDIT
---------------------------------------------*/

// Generates a normal 52-card deck
function generateStandard52(): Card[] {
    const values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    const suits = ["♠", "♥", "♦", "♣"];
    const weights: Record<string, number> = {
        A: 11, J: 10, Q: 10, K: 10
    };

    const cards: Card[] = [];
    for (const v of values) {
        for (const s of suits) {
            cards.push({
                value: v,
                suit: s,
                weight: weights[v] || Number(v)
            });
        }
    }
    return cards;
}

function generateRandomNegativeDeck(): Card[] {
    const values = ["A", "-2", "-3", "4", "5", "6", "-7", "8", "9", "10", "J", "Q", "-K"];
    const suits = ["♠", "♥", "♦", "♣"];
    const weights: Record<string, number> = {
        A: 11, 'J': 10, Q: 10, '-K': -10
    };

    const cards: Card[] = [];
    for (const v of values) {
        for (const s of suits) {
            cards.push({
                value: v,
                suit: s,
                weight: weights[v] || Number(v)
            });
        }
    }
    return cards;
}

// Short deck (36 cards: 6–A)
function generateShortDeck(): Card[] {
    const values = ["A", "K", "Q", "J", "5", "4", "3", "2", "1"];
    const suits = ["♠", "♥", "♦", "♣"];
    const weights: Record<string, number> = {
        A: 11, J: 10, Q: 10, K: 10
    };

    const cards: Card[] = [];
    for (const v of values) {
        for (const s of suits) {
            cards.push({
                value: v,
                suit: s,
                weight: weights[v] || Number(v)
            });
        }
    }
    return cards;
}

function generateFaceAceDeck(): Card[] {
    const values = ["A", "A", "A", "A", "2", "3", "4", "5", "6", "7", "8", "9", "10",];
    const suits = ["♠", "♥", "♦", "♣"];
    const weights: Record<string, number> = {
        A: 11
    };

    const cards: Card[] = [];
    for (const v of values) {
        for (const s of suits) {
            cards.push({
                value: v,
                suit: s,
                weight: weights[v] || Number(v)
            });
        }
    }
    return cards;
}

// MASTER DECK COLLECTION — ADD ANYTHING YOU WANT
const DECK_LIBRARY: { name: string; cards: Card[] }[] = [
    {
        name: "Standard 52",
        cards: generateStandard52()
    },
    {
        name: "Short Deck 36",
        cards: generateShortDeck()
    },
    {
        name: "Face & Ace Deck",
        cards: generateFaceAceDeck()
    },
    {
        name: "Random Negative Deck",
        cards: generateRandomNegativeDeck()
    }
];

// ---------------------------------------------

let roundsPlayed = 1;
let playerRoundsWon = 0;
let dealerRoundsWon = 0;
let playerHealth = 10;
let playerScore = 0;
let currentDeckIndex = 0;
let oldDeckIndex = 0;
let itemsCollection = ["Удалить свою карту", "Украсть карту диллера", "+1 своей карте", "-1 своей карте"] as const;
type item = (typeof itemsCollection)[number];
let playerItems: item[] = [];

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

class BlackjackGame {
    deck: Deck;
    player: Card[] = [];
    dealer: Card[] = [];
    isGameOver = false;
    dealerHidden = true;

    constructor() {
        this.deck = this.createNewDeck();
        this.start();
    }

    createNewDeck(): Deck {
        const deckConfig = DECK_LIBRARY[currentDeckIndex];
        console.log(`🃏 Using deck: ${deckConfig.name}`);
        return new Deck(deckConfig.cards);
    }

    start() {
        this.player = [];
        this.dealer = [];
        this.isGameOver = false;
        this.dealerHidden = true;


        this.player.push(this.deck.draw());
        this.player.push(this.deck.draw());
        this.dealer.push(this.deck.draw());
        this.dealer.push(this.deck.draw());


        this.updateUI();
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
        if (this.isGameOver) return;

        this.player.push(this.deck.draw());
        this.updateUI();

        if (this.getHandValue(this.player) > 21) {
            roundsPlayed++;
            const restartBtn = document.getElementById("restart") as HTMLButtonElement | null;
            if (restartBtn) {
                restartBtn.disabled = false;
                restartBtn.setAttribute("aria-disabled", "false");
            }
            this.endGame("Player busts! Dealer wins.");
        }
    }

    playerStand() {
        if (this.isGameOver) return;

        while (this.getHandValue(this.dealer) < 17) {
            this.dealer.push(this.deck.draw());
        }
        this.finishRound();

    }

    useItem() {
        if (this.isGameOver) return;
        if (playerItems.length === 0) {
            document.getElementById("message")!.textContent = "No items to use!";
            return;
        }
        let itemUsePrompt = "Какой предмет использовать?\n";
        playerItems.forEach((item, index) => {
            itemUsePrompt += `${index}: ${item}\n`;
        });
        let itemIndex = prompt(itemUsePrompt);
        if (itemIndex === null) return;
        else if (isNaN(Number(itemIndex))) return;
        else if (+itemIndex >= playerItems.length) return;
        const item = playerItems[+itemIndex];
        playerItems.splice(+itemIndex, 1);
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
                this.dealer.push(this.deck.draw());
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

        this.updateUI();

        if (this.getHandValue(this.player) > 21) {
            roundsPlayed++;
            const restartBtn = document.getElementById("restart") as HTMLButtonElement | null;
            if (restartBtn) {
                restartBtn.disabled = false;
                restartBtn.setAttribute("aria-disabled", "false");
            }
            this.endGame("Player busts after using item! Dealer wins.");
        }
    }

    finishRound() {
        const p = this.getHandValue(this.player);
        const d = this.getHandValue(this.dealer);
        roundsPlayed++;
        if (d > 21) {
            playerRoundsWon++;
            const restartBtn = document.getElementById("restart") as HTMLButtonElement | null;
            if (restartBtn) {
                restartBtn.disabled = false;
                restartBtn.setAttribute("aria-disabled", "false");
            }
            return this.endGame("Dealer busts! Player wins.");
        }
        if (p > d) {
            playerRoundsWon++;
            const restartBtn = document.getElementById("restart") as HTMLButtonElement | null;
            if (restartBtn) {
                restartBtn.disabled = false;
                restartBtn.setAttribute("aria-disabled", "false");
            }
            return this.endGame("Player wins!");
        }
        if (d > p) {
            dealerRoundsWon++;
            const restartBtn = document.getElementById("restart") as HTMLButtonElement | null;
            if (restartBtn) {
                restartBtn.disabled = false;
                restartBtn.setAttribute("aria-disabled", "false");
            }
            return this.endGame("Dealer wins!");
        }
        const restartBtn = document.getElementById("restart") as HTMLButtonElement | null;
        if (restartBtn) {
            restartBtn.disabled = false;
            restartBtn.setAttribute("aria-disabled", "false");
        }
        return this.endGame("It's a tie!");
    }

    endGame(message: string) {
        this.isGameOver = true;
        this.dealerHidden = false;
        document.getElementById("message")!.textContent = message;
        if (playerRoundsWon === 3) {
            document.getElementById("message")!.textContent = "Get your point loser";
            playerScore++;
            this.resetRound();
        }
        if (dealerRoundsWon === 3) {
            document.getElementById("message")!.textContent = "Better luck next time";
            playerHealth -= 1;
            this.resetRound();
        }

        this.updateUI();
    }

    resetRound() {
        oldDeckIndex = currentDeckIndex;
        while (currentDeckIndex === oldDeckIndex) {
            currentDeckIndex = Math.floor(Math.random() * DECK_LIBRARY.length);
        }
        playerRoundsWon = 0;
        dealerRoundsWon = 0;
        roundsPlayed = 1;
    }


    updateUI() {
        document.getElementById("deck-name")!.textContent = DECK_LIBRARY[currentDeckIndex].name;
        document.getElementById("player-health")!.textContent = playerHealth.toString();
        document.getElementById("player-points")!.textContent = playerScore.toString();
        document.getElementById("player-rounds")!.textContent = playerRoundsWon.toString();
        document.getElementById("dealer-rounds")!.textContent = dealerRoundsWon.toString();
        document.getElementById("item-list")!.textContent =
            `Items: ${playerItems.join(", ") || "None"}`;
        document.getElementById("rounds")!.textContent = roundsPlayed.toString();
        document.getElementById("player")!.innerHTML =
            this.player.map(c => `${c.value}${c.suit}`).join(" ");
        const dealerDiv = document.getElementById("dealer")!;
        if (this.dealerHidden) {
            dealerDiv.innerHTML =
                `${this.dealer[0].value}${this.dealer[0].suit}  [❓]`;
        } else {
            dealerDiv.innerHTML =
                this.dealer.map(c => `${c.value}${c.suit}`).join(" ");
        }
        document.getElementById("player-score")!.textContent =
            this.getHandValue(this.player).toString();
        document.getElementById("dealer-score")!.textContent =
            this.dealerHidden
                ? "?"                     // hidden score
                : this.getHandValue(this.dealer).toString();

    }
}

let game = new BlackjackGame();

document.getElementById("hit")!.onclick = () => game.playerHit();
document.getElementById("stand")!.onclick = () => game.playerStand();
document.getElementById("use_item")!.onclick = () => game.useItem();
document.getElementById("restart")!.onclick = () => {
    const restartBtn = document.getElementById("restart") as HTMLButtonElement | null;
    if (restartBtn) {
        restartBtn.disabled = true;
        restartBtn.setAttribute("aria-disabled", "false");
    }

    if (playerHealth <= 0) {
        alert("Game Over! You have no health left.");
        game.resetRound();
        playerHealth = 10;
        playerScore = 0;
        playerItems = [];
        return;
    }

    if(playerScore >= 10){
        alert("Congratulations! You reached 10 points and won the game!");
        game.resetRound();
        playerHealth = 10;
        playerScore = 0;
        playerItems = [];
        return;
    }

    if (roundsPlayed % 3 === 0) {
        if (playerItems.length < 4)
            playerItems.push(itemsCollection[Math.floor(Math.random() * itemsCollection.length)]);
    }

    game = new BlackjackGame();
    document.getElementById("message")!.textContent = "";
};
