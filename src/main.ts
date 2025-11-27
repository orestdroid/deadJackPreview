import {DECK_LIBRARY} from "./deck.ts";
import {BlackjackRound, Game, Match} from "./game.ts";

const playerHealthUI = document.getElementById("player_health")!;
const deckNameUI = document.getElementById("deck_name")!;
const playerPointsUI = document.getElementById("player_points")!;
const itemListUI = document.getElementById("item_list")!;
const roundsUI = document.getElementById("rounds")!;
const playerUI = document.getElementById("player")!;
const dealerUI = document.getElementById("dealer")!;
const playerScoreUI = document.getElementById("player_score")!;
const dealerScoreUI = document.getElementById("dealer_score")!;
const matchHistoryUI = document.getElementById("match_history")!;
const message = document.getElementById("message")!;
const restartBtn = document.getElementById("restart")! as HTMLButtonElement;

const GAME_STATUSES : {[key : string] : string} = {
    "player_won_match": "Молодец получай очко",
    "dealer_won_match": "Минус ебало, анлаки",
    "" : ""
};

function updateUI() {
    restartBtn.disabled = !game.match.round.isRoundOver;
    message.textContent = GAME_STATUSES[game.matchStatus];
    deckNameUI.textContent = DECK_LIBRARY[game.match.currentDeckIndex].name;
    playerHealthUI.textContent = game.playerHealth.toString();
    playerPointsUI.textContent = game.playerScore.toString();
    itemListUI.textContent = `Items: ${game.playerItems.join(", ") || "None"}`;
    roundsUI.textContent = game.match.roundsPlayedInMatch.toString();
    playerUI.innerHTML = game.match.round.player.map(c => `${c.value}${c.suit}`).join(" ");
    if (game.match.round.dealerHidden) {
        dealerUI.innerHTML = `${game.match.round.dealer[0].value}${game.match.round.dealer[0].suit}  [❓]`;
    } else {
        dealerUI.innerHTML = game.match.round.dealer.map(c => `${c.value}${c.suit}`).join(" ");
    }
    playerScoreUI.textContent = game.match.round.getHandValue(game.match.round.player).toString();
    dealerScoreUI.textContent = game.match.round.dealerHidden ? "?" : game.match.round.getHandValue(game.match.round.dealer).toString();
    matchHistoryUI.textContent = game.match.history.map((i) => i ? "🟢" : "🔴").join()

}

let game = new Game();
updateUI();


document.getElementById("hit")!.onclick = () => {
    game.playerHit()
    updateUI()
};
document.getElementById("stand")!.onclick = () => {
    game.playerStand()
    updateUI()
};
document.getElementById("use_item")!.onclick = () => {
    game.useItem()
    updateUI()
};
document.getElementById("restart")!.onclick = () => {
    updateUI()
    game.match.round = new BlackjackRound(game.match)
    if (game.match.matchIsOver) game.match = new Match(game);
    document.getElementById("message")!.textContent = "";
    updateUI()
};
