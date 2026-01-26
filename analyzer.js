// Hand Analyzer - Logik
// =====================

// ============================================
// KONSTANTEN
// ============================================

const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
const SUITS = ['s', 'h', 'd', 'c'];
const SUIT_SYMBOLS = { 's': '♠', 'h': '♥', 'd': '♦', 'c': '♣' };
const SUIT_NAMES = { 's': 'spades', 'h': 'hearts', 'd': 'diamonds', 'c': 'clubs' };
const RANK_VALUES = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8,
    '9': 9, 'T': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
};

const CBET_SPOTS = ['BTN_vs_BB', 'CO_vs_BB', 'SB_vs_BB', 'CO_vs_BTN', 'BTN_vs_SB'];
const FACING_CBET_SPOTS = ['BB_vs_BTN', 'BB_vs_CO', 'BB_vs_SB', 'BTN_vs_CO', 'BTN_vs_HJ', 'CO_vs_HJ'];

const HAND_CATEGORY_NAMES = {
    'straight_flush': 'Straight Flush',
    'quads': 'Quads',
    'flush': 'Flush',
    'straight': 'Straight',
    'full_house': 'Full House',
    'trips': 'Trips',
    'set': 'Set',
    'two_pair': 'Two Pair',
    'overpair': 'Overpair',
    'underpair_high': 'Underpair (hoch)',
    'underpair_low': 'Underpair (niedrig)',
    'top_pair_good': 'Top Pair (guter Kicker)',
    'top_pair_weak': 'Top Pair (schwacher Kicker)',
    'second_pair': 'Second Pair',
    'low_pair': 'Low Pair',
    'flush_draw': 'Flush Draw',
    'oesd': 'Open-Ended Straight Draw',
    'gutshot': 'Gutshot',
    'overcards': 'Overcards',
    'ace_high': 'Ace High',
    'nothing': 'Nothing'
};

const TEXTURE_NAMES = {
    'dry': 'Dry',
    'wet': 'Wet',
    'paired': 'Paired',
    'monotone': 'Monotone',
    'connected': 'Connected'
};

// ============================================
// STATE
// ============================================

let currentMode = 'cbet';
let currentSpot = 'BTN_vs_BB';
let heroCards = [null, null];
let boardCards = [null, null, null];
let usedCards = new Set();

// ============================================
// DOM ELEMENTS
// ============================================

const elements = {
    modeBtns: document.querySelectorAll('.mode-btn'),
    spotButtons: document.getElementById('spot-buttons'),
    heroCardSlots: document.querySelectorAll('#hero-cards .card-slot'),
    boardCardSlots: document.querySelectorAll('#board-cards .card-slot'),
    cardPicker: document.getElementById('card-picker'),
    analyzeBtn: document.getElementById('analyze-btn'),
    results: document.getElementById('results'),
    resultCategory: document.getElementById('result-category'),
    resultTexture: document.getElementById('result-texture'),
    resultSpot: document.getElementById('result-spot'),
    correctAction: document.getElementById('correct-action'),
    explanationText: document.getElementById('explanation-text')
};

// ============================================
// INITIALIZATION
// ============================================

function init() {
    initCardPicker();
    initSpotButtons();
    initEventListeners();
    updateAnalyzeButton();
}

function initCardPicker() {
    const suitRows = elements.cardPicker.querySelectorAll('.suit-row');

    suitRows.forEach(row => {
        const suit = row.dataset.suit;
        const rankContainer = row.querySelector('.rank-cards');

        RANKS.forEach(rank => {
            const card = document.createElement('div');
            card.className = `picker-card ${SUIT_NAMES[suit]}`;
            card.dataset.rank = rank;
            card.dataset.suit = suit;
            card.textContent = rank;
            card.addEventListener('click', () => selectCard(rank, suit));
            rankContainer.appendChild(card);
        });
    });
}

function initSpotButtons() {
    const spots = currentMode === 'cbet' ? CBET_SPOTS : FACING_CBET_SPOTS;

    elements.spotButtons.innerHTML = '';
    spots.forEach((spot, idx) => {
        const btn = document.createElement('button');
        btn.className = 'spot-btn' + (idx === 0 ? ' active' : '');
        btn.dataset.spot = spot;
        btn.textContent = formatSpotName(spot);
        btn.addEventListener('click', () => selectSpot(spot));
        elements.spotButtons.appendChild(btn);
    });

    currentSpot = spots[0];
}

function formatSpotName(spot) {
    return spot.replace('_vs_', ' vs ');
}

function initEventListeners() {
    // Mode buttons
    elements.modeBtns.forEach(btn => {
        btn.addEventListener('click', () => setMode(btn.dataset.mode));
    });

    // Clear buttons
    document.querySelectorAll('.clear-btn').forEach(btn => {
        btn.addEventListener('click', () => clearCards(btn.dataset.target));
    });

    // Analyze button
    elements.analyzeBtn.addEventListener('click', analyze);
}

// ============================================
// MODE & SPOT SELECTION
// ============================================

function setMode(mode) {
    currentMode = mode;

    elements.modeBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    initSpotButtons();
    hideResults();
}

function selectSpot(spot) {
    currentSpot = spot;

    document.querySelectorAll('.spot-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.spot === spot);
    });

    hideResults();
}

// ============================================
// CARD SELECTION
// ============================================

function selectCard(rank, suit) {
    const cardKey = rank + suit;

    // Check if card is already used
    if (usedCards.has(cardKey)) return;

    // Find first empty slot
    let slotFound = false;

    // Try hero cards first
    for (let i = 0; i < heroCards.length; i++) {
        if (heroCards[i] === null) {
            heroCards[i] = { rank, suit };
            usedCards.add(cardKey);
            updateCardDisplay();
            slotFound = true;
            break;
        }
    }

    // Then try board cards
    if (!slotFound) {
        for (let i = 0; i < boardCards.length; i++) {
            if (boardCards[i] === null) {
                boardCards[i] = { rank, suit };
                usedCards.add(cardKey);
                updateCardDisplay();
                break;
            }
        }
    }

    updateAnalyzeButton();
    hideResults();
}

function clearCards(target) {
    if (target === 'hero') {
        heroCards.forEach(card => {
            if (card) usedCards.delete(card.rank + card.suit);
        });
        heroCards = [null, null];
    } else {
        boardCards.forEach(card => {
            if (card) usedCards.delete(card.rank + card.suit);
        });
        boardCards = [null, null, null];
    }

    updateCardDisplay();
    updateAnalyzeButton();
    hideResults();
}

function updateCardDisplay() {
    // Update hero card slots
    elements.heroCardSlots.forEach((slot, i) => {
        const card = heroCards[i];
        if (card) {
            slot.textContent = card.rank + SUIT_SYMBOLS[card.suit];
            slot.className = `card-slot filled ${SUIT_NAMES[card.suit]}`;
        } else {
            slot.textContent = '?';
            slot.className = 'card-slot empty';
        }
    });

    // Update board card slots
    elements.boardCardSlots.forEach((slot, i) => {
        const card = boardCards[i];
        if (card) {
            slot.textContent = card.rank + SUIT_SYMBOLS[card.suit];
            slot.className = `card-slot filled ${SUIT_NAMES[card.suit]}`;
        } else {
            slot.textContent = '?';
            slot.className = 'card-slot empty';
        }
    });

    // Update picker (disable used cards)
    document.querySelectorAll('.picker-card').forEach(card => {
        const key = card.dataset.rank + card.dataset.suit;
        card.classList.toggle('disabled', usedCards.has(key));
        card.classList.toggle('selected', usedCards.has(key));
    });
}

function updateAnalyzeButton() {
    const heroComplete = heroCards.every(c => c !== null);
    const boardComplete = boardCards.every(c => c !== null);
    elements.analyzeBtn.disabled = !(heroComplete && boardComplete);
}

// ============================================
// TEXTURE DETECTION
// ============================================

function identifyTexture(board) {
    const ranks = board.map(c => c.rank);
    const suits = board.map(c => c.suit);
    const values = ranks.map(r => RANK_VALUES[r]).sort((a, b) => a - b);

    // Paired
    if (hasPair(ranks)) {
        return 'paired';
    }

    // Monotone
    if (suits[0] === suits[1] && suits[1] === suits[2]) {
        return 'monotone';
    }

    // Connected
    const gap = values[2] - values[0];
    if (gap <= 4) {
        const isConnected = countConnections(values) >= 1;
        if (isConnected && !isRainbow(suits)) {
            return 'wet';
        }
        if (isConnected) {
            return 'connected';
        }
    }

    // Wet (two suited)
    if (hasTwoSuited(suits)) {
        return 'wet';
    }

    return 'dry';
}

function hasPair(ranks) {
    return ranks[0] === ranks[1] || ranks[1] === ranks[2] || ranks[0] === ranks[2];
}

function isRainbow(suits) {
    return suits[0] !== suits[1] && suits[1] !== suits[2] && suits[0] !== suits[2];
}

function hasTwoSuited(suits) {
    return suits[0] === suits[1] || suits[1] === suits[2] || suits[0] === suits[2];
}

function countConnections(values) {
    let connections = 0;
    const sorted = [...values].sort((a, b) => a - b);
    for (let i = 0; i < sorted.length - 1; i++) {
        if (sorted[i + 1] - sorted[i] <= 2) {
            connections++;
        }
    }
    return connections;
}

// ============================================
// HAND EVALUATION
// ============================================

function evaluateHandCategory(heroHand, board) {
    const heroRanks = heroHand.map(c => c.rank);
    const heroSuits = heroHand.map(c => c.suit);
    const heroValues = heroRanks.map(r => RANK_VALUES[r]);

    const boardRanks = board.map(c => c.rank);
    const boardSuits = board.map(c => c.suit);
    const boardValues = boardRanks.map(r => RANK_VALUES[r]).sort((a, b) => b - a);

    const highestBoardValue = boardValues[0];
    const secondBoardValue = boardValues[1];

    // Alle Karten kombinieren
    const allCards = [...heroHand, ...board];
    const allRanks = allCards.map(c => c.rank);
    const allSuits = [...heroSuits, ...boardSuits];
    const allValues = [...heroValues, ...boardValues];

    // Zähle Ränge für Quads/Trips Check
    const allRankCounts = {};
    allRanks.forEach(r => allRankCounts[r] = (allRankCounts[r] || 0) + 1);
    const maxRankCount = Math.max(...Object.values(allRankCounts));

    // Zähle Farben für Flush-Check
    const suitCounts = {};
    allSuits.forEach(s => suitCounts[s] = (suitCounts[s] || 0) + 1);
    const maxSuitCount = Math.max(...Object.values(suitCounts));

    // Finde Flush-Farbe falls vorhanden
    const flushSuit = Object.entries(suitCounts).find(([s, c]) => c >= 5)?.[0];

    // STRAIGHT CHECK Hilfsfunktion
    const checkStraight = (values) => {
        const unique = [...new Set(values)].sort((a, b) => a - b);
        if (unique.includes(14)) {
            unique.unshift(1);
        }
        for (let i = 0; i <= unique.length - 5; i++) {
            if (unique[i + 4] - unique[i] === 4) {
                return true;
            }
        }
        return false;
    };

    // STRAIGHT FLUSH CHECK
    if (maxSuitCount >= 5 && flushSuit) {
        const flushCards = allCards.filter(c => c.suit === flushSuit);
        const flushValues = flushCards.map(c => RANK_VALUES[c.rank]);
        const heroHasFlushSuit = heroSuits.includes(flushSuit);
        if (heroHasFlushSuit && checkStraight(flushValues)) {
            return 'straight_flush';
        }
    }

    // QUADS CHECK
    if (maxRankCount >= 4) {
        const quadsRank = Object.entries(allRankCounts).find(([r, c]) => c >= 4)?.[0];
        if (heroRanks.includes(quadsRank)) {
            return 'quads';
        }
    }

    // FLUSH CHECK
    if (maxSuitCount >= 5) {
        if (heroSuits.includes(flushSuit)) {
            return 'flush';
        }
    }

    // STRAIGHT CHECK
    if (checkStraight(allValues)) {
        const boardOnlyStraight = checkStraight(boardValues);
        const uniqueAllValues = [...new Set(allValues)];
        if (!boardOnlyStraight || uniqueAllValues.length > [...new Set(boardValues)].length) {
            return 'straight';
        }
    }

    // Zähle Board-Ränge für Full House / Trips Check
    const boardRankCounts = {};
    boardRanks.forEach(r => boardRankCounts[r] = (boardRankCounts[r] || 0) + 1);
    const boardPairRank = Object.entries(boardRankCounts).find(([r, c]) => c >= 2)?.[0];

    // Check für Set / Full House (Pocket Pair trifft Board)
    if (heroRanks[0] === heroRanks[1]) {
        const pocketValue = heroValues[0];
        if (boardRanks.includes(heroRanks[0])) {
            const otherBoardPair = Object.entries(boardRankCounts).find(([r, c]) => c >= 2 && r !== heroRanks[0]);
            if (otherBoardPair) {
                return 'full_house';
            }
            return 'set';
        }
        if (pocketValue > highestBoardValue) {
            return 'overpair';
        }
        if (pocketValue > secondBoardValue) {
            return 'underpair_high';
        }
        return 'underpair_low';
    }

    // Check für Two Pair / Full House / Trips
    const heroHitsBoard = heroRanks.filter(r => boardRanks.includes(r));
    if (heroHitsBoard.length === 2 && heroRanks[0] !== heroRanks[1]) {
        for (const hitRank of heroHitsBoard) {
            if (boardRankCounts[hitRank] >= 2) {
                return 'full_house';
            }
        }
        return 'two_pair';
    }

    // Check für Trips
    if (heroHitsBoard.length === 1 && boardPairRank && heroHitsBoard[0] === boardPairRank) {
        return 'trips';
    }

    // Check für Pair
    if (heroHitsBoard.length === 1) {
        const hitRank = heroHitsBoard[0];
        const hitValue = RANK_VALUES[hitRank];
        const kickerValue = heroValues.find(v => v !== hitValue) || heroValues[0];

        if (hitValue === highestBoardValue) {
            if (kickerValue >= 10) {
                return 'top_pair_good';
            } else {
                return 'top_pair_weak';
            }
        } else if (hitValue === secondBoardValue) {
            return 'second_pair';
        } else {
            return 'low_pair';
        }
    }

    // Flush Draw
    if (maxSuitCount === 4) {
        return 'flush_draw';
    }

    // Straight Draw Check
    const uniqueValues = [...new Set(allValues)].sort((a, b) => a - b);
    const straightDraw = checkStraightDraw(uniqueValues);
    if (straightDraw === 'oesd') return 'oesd';
    if (straightDraw === 'gutshot') return 'gutshot';

    // Overcards
    if (heroValues[0] > highestBoardValue && heroValues[1] > highestBoardValue) {
        return 'overcards';
    }

    // Ace High
    if (heroRanks.includes('A')) {
        return 'ace_high';
    }

    return 'nothing';
}

function checkStraightDraw(values) {
    if (values.includes(14)) {
        values = [1, ...values];
    }

    for (let i = 0; i <= values.length - 4; i++) {
        const window = values.slice(i, i + 4);
        const span = window[3] - window[0];

        if (span === 3) return 'oesd';
        if (span === 4 && window.length === 4) return 'gutshot';
    }

    return null;
}

// ============================================
// CORRECT ACTION DETERMINATION
// ============================================

function determineCorrectAction(spot, texture, handCategory) {
    let range;

    if (currentMode === 'cbet') {
        range = CBET_RANGES[spot]?.[texture];
    } else {
        range = FACING_CBET_RANGES[spot]?.[texture];
    }

    if (!range) {
        console.error('Range not found:', spot, texture);
        return { action: 'check', isMixed: false };
    }

    const categoryFallbacks = {
        'underpair_high': 'second_pair',
        'underpair_low': 'low_pair'
    };

    const findInArray = (arr, category) => {
        if (!arr) return false;
        if (arr.includes(category)) return true;
        if (categoryFallbacks[category] && arr.includes(categoryFallbacks[category])) return true;
        return false;
    };

    const findMixed = (mixedArr, category) => {
        if (!mixedArr) return null;
        let entry = mixedArr.find(m => m.category === category);
        if (!entry && categoryFallbacks[category]) {
            entry = mixedArr.find(m => m.category === categoryFallbacks[category]);
        }
        return entry;
    };

    // Check for mixed strategy first
    const mixedEntry = findMixed(range.mixed, handCategory);
    if (mixedEntry) {
        return {
            action: 'mixed',
            isMixed: true,
            mixedData: mixedEntry
        };
    }

    // Check definitive actions
    if (currentMode === 'cbet') {
        if (findInArray(range.cbet, handCategory)) {
            return { action: 'cbet', isMixed: false };
        }
        if (findInArray(range.check, handCategory)) {
            return { action: 'check', isMixed: false };
        }
    } else {
        if (findInArray(range.raise, handCategory)) {
            return { action: 'raise', isMixed: false };
        }
        if (findInArray(range.call, handCategory)) {
            return { action: 'call', isMixed: false };
        }
        if (findInArray(range.fold, handCategory)) {
            return { action: 'fold', isMixed: false };
        }
    }

    // Default
    return { action: currentMode === 'cbet' ? 'check' : 'fold', isMixed: false };
}

// ============================================
// EXPLANATIONS
// ============================================

const TEXTURE_CONCEPTS = {
    dry: {
        name: 'Dry Board',
        concept: 'Auf trockenen Boards hat der PFR Range Advantage - er hat mehr starke Hände (Overpairs, Top Pairs). Daher kann er breit c-betten.'
    },
    wet: {
        name: 'Wet Board',
        concept: 'Auf nassen Boards (Flush Draws, Straights möglich) ist der Range Advantage geringer. Der Caller hat mehr Draws und Connected Hands.'
    },
    paired: {
        name: 'Paired Board',
        concept: 'Paired Boards treffen beide Ranges selten. Der PFR kann polarisiert spielen: starke Hände für Value, Air als Bluff.'
    },
    monotone: {
        name: 'Monotone Board',
        concept: 'Bei drei gleichen Farben hat oft der Caller den Flush Draw. Ohne Flush Draw sollte der PFR vorsichtig sein.'
    },
    connected: {
        name: 'Connected Board',
        concept: 'Connected Boards (z.B. 876) favorisieren den Caller, der mehr Straights und Two Pairs hat. Der PFR sollte tight c-betten.'
    }
};

const HAND_EXPLANATIONS = {
    cbet: {
        straight_flush: { shouldBet: 'Straight Flush - die stärkste Hand! Baue den Pot für maximalen Value.', shouldCheck: 'Slow-Play kann sinnvoll sein, da Villain kaum mitgehen kann.' },
        quads: { shouldBet: 'Quads sind die zweitstärkste Hand! Value-Bet, aber erwarte wenig Action.', shouldCheck: 'Check um Villain bluffen zu lassen.' },
        flush: { shouldBet: 'Du hast einen Flush - eine sehr starke Hand! Baue den Pot mit einer Value-Bet.', shouldCheck: 'Auf monotonen Boards könnte ein Check Villain erlauben zu bluffen.' },
        straight: { shouldBet: 'Du hast eine Straight! Value-Bet und baue den Pot gegen schlechtere Hände.', shouldCheck: 'Auf sehr nassen Boards mit höheren Straights möglich ist Check manchmal besser.' },
        full_house: { shouldBet: 'Full House ist ein Monster. Value-Bet und baue den Pot aggressiv auf.', shouldCheck: 'Full House kann auch slowplayen um Villain Bluffs zu erlauben.' },
        trips: { shouldBet: 'Trips auf einem Paired Board ist stark. C-Bet für Value von Overpairs und Draws.', shouldCheck: 'Check kann Sinn machen um nicht alle Bluffs zu vertreiben.' },
        set: { shouldBet: 'Sets sind Monster-Hände. Baue den Pot auf und hole Value von schwächeren Händen.', shouldCheck: 'Selbst Sets können auf gefährlichen Boards manchmal checken.' },
        two_pair: { shouldBet: 'Two Pair ist stark genug für Value. Schütze deine Hand vor Draws.', shouldCheck: 'Two Pair kann auf sehr nassen Boards checken.' },
        overpair: { shouldBet: 'Overpairs sind auf den meisten Boards klar Value. C-Bet und baue den Pot.', shouldCheck: 'Auf sehr connected/monotone Boards kann Check sinnvoll sein.' },
        underpair_high: { shouldBet: 'Hohe Underpairs haben Showdown Value. C-Bet kann als Thin Value funktionieren.', shouldCheck: 'Check ist oft besser - du schlägst wenig und wirst von besserem gecallt.' },
        underpair_low: { shouldBet: 'Niedrige Underpairs sind zu schwach für Value. Nur als Bluff auf sehr dry Boards.', shouldCheck: 'Check ist Standard. Du hast etwas Showdown Value, aber zu wenig für eine Value-Bet.' },
        top_pair_good: { shouldBet: 'Top Pair mit gutem Kicker ist Value. C-Bet um von schlechteren Pairs gecallt zu werden.', shouldCheck: 'Auf nassen Boards ist dein Top Pair verletzlich.' },
        top_pair_weak: { shouldBet: 'Top Pair mit schwachem Kicker kann noch Value c-betten.', shouldCheck: 'Mit schwachem Kicker bist du oft dominiert. Check und kontrolliere den Pot.' },
        second_pair: { shouldBet: 'Second Pair hat etwas Showdown Value, aber c-betten ist riskant.', shouldCheck: 'Check ist Standard. Deine Hand ist zu schwach für Value, zu stark für Fold.' },
        low_pair: { shouldBet: 'Low Pair ist zu schwach für Value. Als Bluff nur mit Backdoor-Equity sinnvoll.', shouldCheck: 'Check und gib auf bei Aggression.' },
        flush_draw: { shouldBet: 'Flush Draws sind gute Semi-Bluffs. Du hast Fold Equity + Equity wenn gecallt.', shouldCheck: 'Check um eine Free-Card zu sehen.' },
        oesd: { shouldBet: 'Open-Ended Straight Draws (8 Outs) sind starke Semi-Bluffs.', shouldCheck: 'Check ist ok um günstig zu drawen.' },
        gutshot: { shouldBet: 'Gutshots (4 Outs) sind schwache Bluffs. Nur mit Backdoor-Equity.', shouldCheck: 'Mit nur 4 Outs ist Check Standard.' },
        overcards: { shouldBet: 'Overcards können als Bluff c-betten - du hast 6 Outs zum Top Pair.', shouldCheck: 'Ohne Paar bist du weit hinten.' },
        ace_high: { shouldBet: 'Ace High kann auf dry Boards bluffen.', shouldCheck: 'Ace High hat minimale Equity. Check.' },
        nothing: { shouldBet: 'Ohne Paar oder Draw ist C-Bet reiner Bluff.', shouldCheck: 'Ohne jede Equity: Check und aufgeben.' }
    },
    facing: {
        straight_flush: { shouldRaise: 'Straight Flush raisen für maximalen Value!', shouldCall: 'Slow-Play um Villain mehr Chips zu entlocken.', shouldFold: 'Niemals folden!' },
        quads: { shouldRaise: 'Quads raisen für Value!', shouldCall: 'Call um Villain weitere Bluffs zu erlauben.', shouldFold: 'Niemals folden!' },
        flush: { shouldRaise: 'Mit einem Flush solltest du für Value raisen!', shouldCall: 'Slow-Play kann funktionieren.', shouldFold: 'Fast nie korrekt.' },
        straight: { shouldRaise: 'Mit einer Straight solltest du für Value raisen!', shouldCall: 'Call ist ok, besonders wenn höhere Straights möglich sind.', shouldFold: 'Fast nie korrekt auf dem Flop.' },
        full_house: { shouldRaise: 'Full House ist ein Monster. Raise für Value.', shouldCall: 'Call um Villain weitere Bluffs zu erlauben.', shouldFold: 'Praktisch nie korrekt.' },
        trips: { shouldRaise: 'Trips ist stark genug zum Raisen.', shouldCall: 'Call ist ok, aber mit Trips willst du meist den Pot vergrößern.', shouldFold: 'Viel zu tight!' },
        set: { shouldRaise: 'Sets sollten für Value raisen.', shouldCall: 'Slow-Play kann auf trockenen Boards Sinn machen.', shouldFold: 'Fast nie korrekt.' },
        two_pair: { shouldRaise: 'Two Pair ist stark genug zum Raisen.', shouldCall: 'Call ist ok wenn du Villain bluffen lassen willst.', shouldFold: 'Nur auf katastrophalen Boards.' },
        overpair: { shouldRaise: 'Overpairs können raisen für Value.', shouldCall: 'Call ist Standard.', shouldFold: 'Fast nie korrekt gegen eine C-Bet.' },
        underpair_high: { shouldRaise: 'Nur als Bluff oder mit sehr guten Reads.', shouldCall: 'Call ist Standard.', shouldFold: 'Zu tight.' },
        underpair_low: { shouldRaise: 'Reiner Bluff. Selten sinnvoll.', shouldCall: 'Call nur mit guten Pot Odds.', shouldFold: 'Oft korrekt - zu wenig Equity.' },
        top_pair_good: { shouldRaise: 'Kann raisen, aber Call ist meist besser.', shouldCall: 'Call ist Standard.', shouldFold: 'Zu viel aufgegeben.' },
        top_pair_weak: { shouldRaise: 'Mit schwachem Kicker ist Raisen riskant.', shouldCall: 'Call und evaluiere den Turn.', shouldFold: 'Zu tight.' },
        second_pair: { shouldRaise: 'Nur als Bluff-Raise.', shouldCall: 'Call ist Standard.', shouldFold: 'Bei hoher C-Bet Frequenz zu tight.' },
        low_pair: { shouldRaise: 'Macht keinen Sinn.', shouldCall: 'Nur mit guten Implied Odds.', shouldFold: 'Oft korrekt.' },
        flush_draw: { shouldRaise: 'Check-Raise ist stark! Fold Equity + 9 Outs.', shouldCall: 'Call um günstig den Turn zu sehen.', shouldFold: 'Verschenkt zu viel Equity.' },
        oesd: { shouldRaise: 'OESD Check-Raise ist ein starker Semi-Bluff.', shouldCall: 'Call ist Standard mit guten Implied Odds.', shouldFold: 'Zu tight.' },
        gutshot: { shouldRaise: 'Aggressiv. Nur mit Backdoor-Equity.', shouldCall: 'Nur mit guten Pot Odds.', shouldFold: 'Oft korrekt. 4 Outs reichen selten.' },
        overcards: { shouldRaise: 'Können funktionieren, aber riskant.', shouldCall: 'Nur auf sehr dry Boards.', shouldFold: 'Meist korrekt.' },
        ace_high: { shouldRaise: 'Reiner Bluff.', shouldCall: 'Nur als Bluff-Catch.', shouldFold: 'Standard.' },
        nothing: { shouldRaise: 'Purer Bluff.', shouldCall: 'Geldverbrennung.', shouldFold: 'Absolut korrekt.' }
    }
};

function getExplanation(correctAction, handCategory, texture) {
    const textureInfo = TEXTURE_CONCEPTS[texture];
    let explanation = '';

    explanation += `<strong>${textureInfo.name}:</strong> ${textureInfo.concept}<br><br>`;

    const mode = currentMode === 'cbet' ? 'cbet' : 'facing';
    const handExp = HAND_EXPLANATIONS[mode][handCategory];

    if (handExp) {
        if (currentMode === 'cbet') {
            if (correctAction === 'cbet') {
                explanation += `<strong>Warum C-Bet?</strong> ${handExp.shouldBet}`;
            } else {
                explanation += `<strong>Warum Check?</strong> ${handExp.shouldCheck}`;
            }
        } else {
            if (correctAction === 'raise') {
                explanation += `<strong>Warum Raise?</strong> ${handExp.shouldRaise}`;
            } else if (correctAction === 'call') {
                explanation += `<strong>Warum Call?</strong> ${handExp.shouldCall}`;
            } else {
                explanation += `<strong>Warum Fold?</strong> ${handExp.shouldFold}`;
            }
        }
    }

    return explanation;
}

// ============================================
// ANALYSIS
// ============================================

function analyze() {
    const texture = identifyTexture(boardCards);
    const handCategory = evaluateHandCategory(heroCards, boardCards);
    const actionData = determineCorrectAction(currentSpot, texture, handCategory);

    // Display results
    elements.results.style.display = 'block';
    elements.resultCategory.textContent = HAND_CATEGORY_NAMES[handCategory] || handCategory;
    elements.resultTexture.innerHTML = `<span class="texture-badge ${texture}">${TEXTURE_NAMES[texture]}</span>`;
    elements.resultSpot.textContent = formatSpotName(currentSpot);

    if (actionData.isMixed) {
        const parts = [];
        for (const [action, freq] of Object.entries(actionData.mixedData)) {
            if (action !== 'category' && freq > 0) {
                parts.push(`${Math.round(freq * 100)}% ${action.toUpperCase()}`);
            }
        }
        elements.correctAction.textContent = parts.join(' / ');
        elements.correctAction.className = 'correct-action mixed';

        // Get the main action for explanation
        const mainAction = Object.entries(actionData.mixedData)
            .filter(([k, v]) => k !== 'category' && v > 0)
            .sort((a, b) => b[1] - a[1])[0][0];
        elements.explanationText.innerHTML = getExplanation(mainAction, handCategory, texture);
    } else {
        elements.correctAction.textContent = actionData.action.toUpperCase();
        elements.correctAction.className = 'correct-action';
        elements.explanationText.innerHTML = getExplanation(actionData.action, handCategory, texture);
    }

    // Scroll to results
    elements.results.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function hideResults() {
    elements.results.style.display = 'none';
}

// ============================================
// START
// ============================================

document.addEventListener('DOMContentLoaded', init);
