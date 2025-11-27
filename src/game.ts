import {Deck, DECK_LIBRARY} from "./deck.ts";

export type Card = {
    value: string;
    suit: string;
    weight: number;
};

const ALL_ITEMS = ["Удалить свою карту", "Украсть карту диллера", "+1 своей карте", "-1 своей карте"] as const;
type item = (typeof ALL_ITEMS)[number];

export class BlackjackRound {

    player: Card[];
    dealer: Card[];
    isRoundOver = false;
    dealerHidden = true;
    public match: Match;
    isPlayerStand = false;


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
        this.isPlayerStand = false;
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
        this.isPlayerStand = true;
    }


    useRemovePlayerCardItem(cardIndex: number) {
        this.player.splice(cardIndex, 1);
    }

    useStealDealerCardItem(cardIndex: number) {
        this.player.push(this.dealer[cardIndex]);
        this.dealer.splice(cardIndex, 1);
        this.dealer.push(this.match.popDeck());
    }

    useAddOneToPlayerCardItem(cardIndex: number) {
        this.player[cardIndex].weight += 1
    }

    useSubtractOneFromPlayerCardItem(cardIndex: number) {
        this.player[cardIndex].weight -= 1
    }

    checkRound() {
        const p = this.getHandValue(this.player);
        const d = this.getHandValue(this.dealer);
        if (p > 21) {
            return "player_burst";
        }
        if (d > 21) {
            return "dealer_burst";
        }
        if (!this.isPlayerStand) return null;
        if (p > d) {
            return "player_win";
        }
        if (d > p) {
            return "dealer_win";
        }
        if (d === p) {
            return "tie";
        }
        return null;
    }
}

export class Match {
    deck: Deck;
    roundsPlayedInMatch = 1;
    roundsPlayedInGame = 1;
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
            this.currentDeckIndex = getRandomInt(DECK_LIBRARY.length);
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

    playerHit() {
        this.round.playerHit();
    }

    playerStand() {
        this.round.playerStand();
    }

    checkMatch() {
        const roundStatus = this.round.checkRound()
        if (roundStatus === null) return null;
        this.round.isRoundOver = true;
        if (this.roundsPlayedInGame % 3 === 0) this.game.addItem();
        this.roundsPlayedInMatch++;
        this.roundsPlayedInGame++;
        this.round.dealerHidden = false;
        if (roundStatus === "player_win" || roundStatus === "dealer_burst") {
            this.playerRoundsWon++;
            this.history.push(true);
        } else if (roundStatus === "dealer_win" || roundStatus === "player_burst") {
            this.dealerRoundsWon++;
            this.history.push(false);
        } else return null;

        if (this.playerRoundsWon === 3) {
            this.matchIsOver = true;
            this.roundsPlayedInGame = 0;
            return "player_won_match"
        }
        if (this.dealerRoundsWon === 3) {
            this.matchIsOver = true;
            this.roundsPlayedInGame = 0;
            return "dealer_won_match"
        }
        return null;
    }
}

export class Game {

    playerHealth = 10;
    playerScore = 0;
    playerItems: item[] = [];
    match: Match;
    matchStatus = ""


    constructor() {
        this.match = new Match(this);
    }

    playerHit() {
        this.match.playerHit();
        this.checkGame()
    }

    playerStand() {
        this.match.playerStand();
        this.checkGame()
    }

    addItem() {
        if (this.playerItems.length < 4)
            this.playerItems.push(ALL_ITEMS[getRandomInt(ALL_ITEMS.length)]);

    }

    checkUsersItems() {
        if (this.playerItems.length === 0) {
            return "No items to use!";
        }
    }

    useItem() {
        const round = this.match.round;
        if (round.isRoundOver) return;

        this.match.game.checkUsersItems()

        let itemIndex = promptForNumberInput(`Какую карту использовать:\n
        ${this.playerItems.map((item, index) =>
            `${index + 1}: ${item}`).join("\n")}`, this.playerItems.length);
        if (itemIndex === null) return;

        const item = this.playerItems[+itemIndex];
        this.playerItems.splice(+itemIndex, 1);
        document.getElementById("message")!.textContent = `Used item: ${item}`;

        if (item === "Удалить свою карту") {
            let itemUsePrompt = promptForNumberInput("Какую карту удалить?\n", round.player.length);
            if (itemUsePrompt === null) return;
            round.useRemovePlayerCardItem(itemUsePrompt);
        } else if (item === "Украсть карту диллера") {
            let itemUsePrompt = promptForNumberInput("Какую карту украсть?\n", round.dealer.length);
            if (itemUsePrompt === null) return;
            round.useStealDealerCardItem(itemUsePrompt);
        } else if (item === "+1 своей карте") {
            let itemUsePrompt = promptForNumberInput("К какой карте добавить 1?\n", round.player.length);
            if (itemUsePrompt === null) return;
            round.useAddOneToPlayerCardItem(itemUsePrompt);
        } else if (item === "-1 своей карте") {
            let itemUsePrompt = promptForNumberInput("У какой карты отнять 1?\n", round.player.length);
            if (itemUsePrompt === null) return;
            round.useSubtractOneFromPlayerCardItem(itemUsePrompt);
        }
        this.checkGame();
    }

    checkGame() {
        const matchResult = this.match.checkMatch();
        if (matchResult === null) return;
        else if (matchResult === "player_won_match") {
            this.playerScore++;
            this.matchStatus = "player_won_match"
        } else {
            this.playerHealth--;
            this.matchStatus = "dealer_won_match";
        }

        if (this.playerHealth <= 0) {
            this.playerScore = 0;
            this.playerItems = [];
            this.playerHealth = 10;
            alert("GIT GUD 💀");
        }
        if (this.playerScore >= 10) {
            this.playerScore = 0;
            this.playerItems = [];
            this.playerHealth = 10;
            alert("Поздравляю с победой");
        }
        return;
    }
}

function promptForNumberInput(message: string, maxIndex: number | null) {
    while (true) {
        let itemIndex = prompt(message);
        if (itemIndex === null) return null;
        else if (isNaN(Number(itemIndex))) continue;
        else if (+itemIndex > maxIndex!) continue;
        else if (+itemIndex <= 0) continue;
        else return +itemIndex - 1;
    }
}

export function getRandomInt(maxNumber: number) {
    return Math.floor(Math.random() * maxNumber);
}

