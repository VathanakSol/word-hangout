// Word Hangout — game logic
const WORDS = {
  easy: [
    ["APPLE", "A crunchy red or green fruit"],
    ["OCEAN", "Vast body of salt water"],
    ["CANDLE", "Wax stick you light for glow"],
    ["BREEZE", "Gentle wind"],
    ["PIZZA", "Cheesy Italian flatbread"],
    ["ROCKET", "Thing that flies to space"],
    ["JUNGLE", "Dense tropical forest"],
    ["PUPPY", "Young dog"],
    ["MARKET", "Place to buy fresh goods"],
    ["WINDOW", "Glass opening in a wall"],
    ["BANANA", "Yellow curved fruit"],
    ["CASTLE", "Fortress with towers"],
    ["DRAGON", "Fire-breathing legend"],
    ["GARDEN", "Where flowers grow"],
    ["MOUNTAIN", "Very tall hill"],
    ["PUDDLE", "Small pool after rain"],
    ["SILVER", "Shiny grey metal"],
    ["TURTLE", "Slow shelled reptile"],
    ["WINTER", "Coldest season"],
    ["COOKIE", "Sweet baked snack"]
  ],
  medium: [
    ["LIBRARY", "Building full of books"],
    ["VOLCANO", "Mountain that erupts"],
    ["PIRATE", "Sail-robbing scoundrel"],
    ["MYSTERY", "Unexplained puzzle"],
    ["GALAXY", "System of stars"],
    ["BLANKET", "Cozy bed covering"],
    ["CAPTAIN", "Leader of a ship"],
    ["DIAMOND", "Precious hardened carbon"],
    ["ECLIPSE", "When one body shadows another"],
    ["FARMER", "Person who grows crops"],
    ["HARBOR", "Where ships shelter"],
    ["ISLAND", "Land surrounded by water"],
    ["JOURNEY", "Long trip"],
    ["KITCHEN", "Room for cooking"],
    ["MIRROR", "Reflective glass"],
    ["NEBULA", "Cosmic cloud of gas"],
    ["ORCHARD", "Tree fruit grove"],
    ["PANDEMONIUM", "Total chaos"],
    ["SAHARA", "Huge African desert"],
    ["TELESCOPE", "Tool for far viewing"]
  ],
  hard: [
    ["ARCHITECTURE", "Art of designing buildings"],
    ["BUREAUCRACY", "Rule by endless departments"],
    ["CHAMELEON", "Color-shifting lizard"],
    ["CRYPTOGRAPHY", "Science of secret codes"],
    ["DISAPPOINTMENT", "Feeling let down"],
    ["ECLECTIC", "Drawing from many sources"],
    ["FORTUITOUS", "Happening by lucky chance"],
    ["GLORIOUS", "Magnificent and bright"],
    ["HIPPOPOTAMUS", "Big river herbivore"],
    ["IMPROVISATION", "Making it up as you go"],
    ["JELLYFISH", "Stinging drifting sea creature"],
    ["LABYRINTH", "Complex maze"],
    ["MELODRAMATIC", "Overly theatrical"],
    ["OBSESSION", "Can't-stop thinking"],
    ["PHENOMENON", "Remarkable occurrence"],
    ["QUINTESSENTIAL", "Perfect example of a kind"],
    ["RHINOCEROS", "Horned thick-skinned beast"],
    ["SERENDIPITY", "Happy accident finding"],
    ["THOUGHTFUL", "Kind and considerate"],
    ["WHISPERING", "Speaking very softly"]
  ]
};

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const MAX_WRONG = 6;

const els = {
  parts: document.getElementById("parts"),
  lives: document.getElementById("lives-badge"),
  streak: document.getElementById("streak-badge"),
  score: document.getElementById("score-badge"),
  difficulty: document.getElementById("difficulty"),
  category: document.getElementById("category-label"),
  wordDisplay: document.getElementById("word-display"),
  clue: document.getElementById("clue"),
  keyboard: document.getElementById("keyboard"),
  hintBtn: document.getElementById("hint-btn"),
  hintCount: document.getElementById("hint-count"),
  newGameBtn: document.getElementById("new-game-btn"),
  overlay: document.getElementById("overlay"),
  resultTitle: document.getElementById("result-title"),
  resultText: document.getElementById("result-text"),
  resultAnswer: document.getElementById("result-answer"),
  playAgainBtn: document.getElementById("play-again-btn")
};

let state = {};
let stats = loadStats();

function loadStats() {
  try {
    const raw = localStorage.getItem("word-hangout-stats");
    return raw ? JSON.parse(raw) : { streak: 0, best: 0, score: 0 };
  } catch (e) {
    return { streak: 0, best: 0, score: 0 };
  }
}

function saveStats() {
  try { localStorage.setItem("word-hangout-stats", JSON.stringify(stats)); } catch (e) {}
}

function newRound() {
  const level = els.difficulty.value;
  const pool = WORDS[level];
  const [word, clue] = pool[Math.floor(Math.random() * pool.length)];
  state = {
    word,
    clue,
    guessed: new Set(),
    wrong: 0,
    hints: 3,
    over: false,
    revealedOnly: []
  };
  els.category.textContent = "Category: " + level.charAt(0).toUpperCase() + level.slice(1);
  els.clue.innerHTML = "&nbsp;";
  els.overlay.classList.add("hidden");
  buildKeyboard();
  render();
}

function buildKeyboard() {
  els.keyboard.innerHTML = "";
  ALPHABET.forEach((letter) => {
    const btn = document.createElement("button");
    btn.className = "key";
    btn.type = "button";
    btn.textContent = letter;
    btn.dataset.letter = letter;
    btn.addEventListener("click", () => guess(letter));
    els.keyboard.appendChild(btn);
  });
}

function keyEl(letter) {
  return els.keyboard.querySelector('[data-letter="' + letter + '"]');
}

function guess(letter) {
  if (state.over || !ALPHABET.includes(letter) || state.guessed.has(letter)) return;
  state.guessed.add(letter);
  const el = keyEl(letter);
  if (state.word.includes(letter)) {
    if (el) el.classList.add("hit");
  } else {
    if (el) el.classList.add("miss");
    state.wrong++;
  }
  render();
  checkEnd();
}

function checkEnd() {
  const solved = state.word.split("").every((ch) => state.guessed.has(ch));
  if (solved) {
    finish(true);
  } else if (state.wrong >= MAX_WRONG) {
    finish(false);
  }
}

function finish(won) {
  state.over = true;
  if (won) {
    const remaining = MAX_WRONG - state.wrong;
    const gained = state.word.length * 10 + remaining * 15;
    stats.score += gained;
    stats.streak += 1;
    stats.best = Math.max(stats.best, stats.streak);
    els.resultTitle.textContent = "You hung out! 🎉";
    els.resultText.textContent = "+" + gained + " points · " + remaining + " lives to spare.";
  } else {
    stats.streak = 0;
    els.resultTitle.textContent = "Out of lives 💀";
    els.resultText.textContent = "The word was hiding in plain sight.";
  }
  saveStats();
  els.resultAnswer.textContent = state.word;
  els.overlay.classList.remove("hidden");
  render();
}

function useHint() {
  if (state.over || state.hints <= 0) return;
  const unknown = state.word.split("").filter((ch) => !state.guessed.has(ch));
  if (!unknown.length) return;
  const letter = unknown[Math.floor(Math.random() * unknown.length)];
  state.hints--;
  state.guessed.add(letter);
  state.revealedOnly.push(letter);
  const el = keyEl(letter);
  if (el) { el.classList.add("hit", "revealed"); el.disabled = true; }
  els.clue.textContent = state.clue;
  render();
  checkEnd();
}

function render() {
  // gallows parts
  const parts = els.parts.querySelectorAll(".part");
  parts.forEach((p, i) => p.classList.toggle("show", i < state.wrong));

  // badges
  els.lives.textContent = "Lives: " + (MAX_WRONG - state.wrong);
  els.lives.classList.toggle("danger", MAX_WRONG - state.wrong <= 2);
  els.streak.textContent = "Streak: " + stats.streak + " (best " + stats.best + ")";
  els.score.textContent = "Score: " + stats.score;
  els.hintCount.textContent = state.hints;
  els.hintBtn.disabled = state.hints === 0 || state.over;

  // word blanks — one underscore placeholder per letter, so the full length is visible
  els.wordDisplay.innerHTML = "";
  state.word.split("").forEach((ch, i) => {
    const slot = document.createElement("div");
    slot.className = "slot";
    slot.dataset.index = i;

    if (state.guessed.has(ch)) {
      slot.textContent = ch;               // revealed: show the letter only
      slot.classList.add("filled");
    } else {
      slot.textContent = "_";              // hidden: underscore placeholder only
      slot.classList.add("empty");
      slot.setAttribute("aria-label", "Letter " + (i + 1) + " not guessed yet");
    }
    if (state.over && !state.guessed.has(ch)) slot.classList.add("missed");
    els.wordDisplay.appendChild(slot);
  });

  // length info mirrors the placeholder count
  const hidden = state.word.split("").filter((ch) => !state.guessed.has(ch)).length;
  els.lengthCount.textContent = state.word.length + " letters · " + hidden + " still hidden";

  // lock keys
  els.keyboard.querySelectorAll(".key").forEach((k) => {
    k.disabled = state.over || state.guessed.has(k.dataset.letter);
  });
}

els.difficulty.addEventListener("change", newRound);
els.newGameBtn.addEventListener("click", newRound);
els.hintBtn.addEventListener("click", useHint);
els.playAgainBtn.addEventListener("click", newRound);
els.overlay.addEventListener("click", (e) => {
  if (e.target === els.overlay) els.overlay.classList.add("hidden");
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") { newRound(); return; }
  if (e.key === "Escape") { els.overlay.classList.add("hidden"); return; }
  const upper = e.key.toUpperCase();
  if (/^[A-Z]$/.test(upper)) guess(upper);
});

newRound();
