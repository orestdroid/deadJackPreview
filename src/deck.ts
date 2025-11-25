import type {Card} from "./game.ts";

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

export const DECK_LIBRARY: { name: string; cards: Card[] }[] = [
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