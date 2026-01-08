// Postflop Trainer - Spiellogik
// ============================================

// ============================================
// KONSTANTEN
// ============================================

const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
const SUITS = ['s', 'h', 'd', 'c']; // spades, hearts, diamonds, clubs
const SUIT_SYMBOLS = { 's': '♠', 'h': '♥', 'd': '♦', 'c': '♣' };
const RANK_VALUES = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8,
    '9': 9, 'T': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
};

const CBET_SPOTS = ['BTN_vs_BB', 'CO_vs_BB', 'SB_vs_BB'];
const FACING_CBET_SPOTS = ['BB_vs_BTN', 'BB_vs_CO', 'BB_vs_SB'];
const TEXTURES = ['dry', 'wet', 'paired', 'monotone', 'connected'];

const HAND_CATEGORY_NAMES = {
    'quads': 'Quads',
    'straight_flush': 'Straight Flush',
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

// ============================================
// EXPLANATIONS - Konzept-Erklärungen
// ============================================

const TEXTURE_CONCEPTS = {
    dry: {
        name: 'Dry Board',
        concept: 'Auf trockenen Boards hat der PFR Range Advantage - er hat mehr starke Hände (Overpairs, Top Pairs). Daher kann er breit c-betten.',
        cbetFrequency: 'hoch'
    },
    wet: {
        name: 'Wet Board',
        concept: 'Auf nassen Boards (Flush Draws, Straights möglich) ist der Range Advantage geringer. Der Caller hat mehr Draws und Connected Hands.',
        cbetFrequency: 'mittel'
    },
    paired: {
        name: 'Paired Board',
        concept: 'Paired Boards treffen beide Ranges selten. Der PFR kann polarisiert spielen: starke Hände für Value, Air als Bluff.',
        cbetFrequency: 'selektiv'
    },
    monotone: {
        name: 'Monotone Board',
        concept: 'Bei drei gleichen Farben hat oft der Caller den Flush Draw. Ohne Flush Draw sollte der PFR vorsichtig sein.',
        cbetFrequency: 'niedrig'
    },
    connected: {
        name: 'Connected Board',
        concept: 'Connected Boards (z.B. 876) favorisieren den Caller, der mehr Straights und Two Pairs hat. Der PFR sollte tight c-betten.',
        cbetFrequency: 'niedrig'
    }
};

const HAND_EXPLANATIONS = {
    // C-Bet Mode Erklärungen
    cbet: {
        quads: {
            shouldBet: 'Quads sind die zweitstärkste Hand! Value-Bet, aber erwarte wenig Action.',
            shouldCheck: 'Check um Villain bluffen zu lassen - du hast das Board praktisch gelockt.'
        },
        straight_flush: {
            shouldBet: 'Straight Flush - die stärkste Hand! Baue den Pot für maximalen Value.',
            shouldCheck: 'Slow-Play kann sinnvoll sein, da Villain kaum mitgehen kann.'
        },
        straight: {
            shouldBet: 'Du hast eine Straight! Value-Bet und baue den Pot gegen schlechtere Hände.',
            shouldCheck: 'Auf sehr nassen Boards mit höheren Straights möglich ist Check manchmal besser.'
        },
        flush: {
            shouldBet: 'Du hast einen Flush - eine sehr starke Hand! Baue den Pot mit einer Value-Bet.',
            shouldCheck: 'Auf monotonen Boards könnte ein Check Villain erlauben zu bluffen, wenn er keinen Flush hat.'
        },
        full_house: {
            shouldBet: 'Full House ist ein Monster. Value-Bet und baue den Pot aggressiv auf.',
            shouldCheck: 'Full House kann auch slowplayen um Villain Bluffs zu erlauben.'
        },
        trips: {
            shouldBet: 'Trips auf einem Paired Board ist stark. C-Bet für Value von Overpairs und Draws.',
            shouldCheck: 'Check kann Sinn machen um nicht alle Bluffs zu vertreiben.'
        },
        set: {
            shouldBet: 'Sets sind Monster-Hände. Baue den Pot auf und hole Value von schwächeren Händen.',
            shouldCheck: 'Selbst Sets können auf gefährlichen Boards manchmal checken, um Raises zu vermeiden.'
        },
        two_pair: {
            shouldBet: 'Two Pair ist stark genug für Value. Schütze deine Hand vor Draws.',
            shouldCheck: 'Two Pair kann auf sehr nassen Boards checken, wenn viele Draws ankommen.'
        },
        overpair: {
            shouldBet: 'Overpairs sind auf den meisten Boards klar Value. C-Bet und baue den Pot.',
            shouldCheck: 'Auf sehr connected/monotone Boards kann Check sinnvoll sein - du bist oft schon hinten.'
        },
        underpair_high: {
            shouldBet: 'Hohe Underpairs (z.B. JJ auf Q-high) haben Showdown Value. C-Bet kann als Thin Value funktionieren.',
            shouldCheck: 'Check ist oft besser - du schlägst wenig und wirst von besserem gecallt. Pot Control.'
        },
        underpair_low: {
            shouldBet: 'Niedrige Underpairs sind zu schwach für Value. Nur als Bluff auf sehr dry Boards.',
            shouldCheck: 'Check ist Standard. Du hast etwas Showdown Value, aber zu wenig für eine Value-Bet.'
        },
        top_pair_good: {
            shouldBet: 'Top Pair mit gutem Kicker ist Value. C-Bet um von schlechteren Pairs und Draws gecallt zu werden.',
            shouldCheck: 'Auf nassen Boards ist dein Top Pair verletzlich. Check-Call kann besser sein.'
        },
        top_pair_weak: {
            shouldBet: 'Top Pair mit schwachem Kicker kann noch Value c-betten, aber sei vorsichtig bei Raises.',
            shouldCheck: 'Mit schwachem Kicker bist du oft dominiert. Check und kontrolliere den Pot.'
        },
        second_pair: {
            shouldBet: 'Second Pair hat etwas Showdown Value, aber c-betten ist riskant - du kriegst oft nur von besseren Händen Action.',
            shouldCheck: 'Check ist Standard. Deine Hand ist zu schwach für Value, zu stark für Fold.'
        },
        low_pair: {
            shouldBet: 'Low Pair ist zu schwach für Value. Als Bluff nur mit Backdoor-Equity sinnvoll.',
            shouldCheck: 'Check und gib auf bei Aggression. Du hast minimalen Showdown Value.'
        },
        flush_draw: {
            shouldBet: 'Flush Draws sind gute Semi-Bluffs. Du hast Fold Equity + Equity wenn gecallt.',
            shouldCheck: 'Check um einen Free-Card zu sehen, besonders wenn du Position hast.'
        },
        oesd: {
            shouldBet: 'Open-Ended Straight Draws (8 Outs) sind starke Semi-Bluffs. C-Bet für Fold Equity.',
            shouldCheck: 'Check ist ok um günstig zu drawen, besonders ohne Position.'
        },
        gutshot: {
            shouldBet: 'Gutshots (4 Outs) sind schwache Bluffs. Nur mit Backdoor-Equity oder auf sehr dry Boards.',
            shouldCheck: 'Mit nur 4 Outs ist Check Standard. Du brauchst mehr Equity zum Semi-Bluffen.'
        },
        overcards: {
            shouldBet: 'Overcards können als Bluff c-betten - du hast 6 Outs zum Top Pair wenn gecallt.',
            shouldCheck: 'Ohne Paar bist du weit hinten. Check ist oft besser als Chips zu verbrennen.'
        },
        ace_high: {
            shouldBet: 'Ace High kann auf dry Boards bluffen - aber erwarte keinen Call von schlechteren.',
            shouldCheck: 'Ace High hat minimale Equity. Check und gib auf bei Action.'
        },
        nothing: {
            shouldBet: 'Ohne Paar oder Draw ist C-Bet reiner Bluff. Nur auf sehr dry Boards sinnvoll.',
            shouldCheck: 'Ohne jede Equity: Check und aufgeben. Bluffen ohne Fold Equity ist Geldverbrennung.'
        }
    },
    // Facing C-Bet Erklärungen
    facing: {
        quads: {
            shouldRaise: 'Quads raisen für Value! Aber Slow-Play ist auch eine Option.',
            shouldCall: 'Call um Villain weitere Bluffs zu erlauben - du kannst nicht verlieren.',
            shouldFold: 'Quads folden? Niemals!'
        },
        straight_flush: {
            shouldRaise: 'Straight Flush raisen für maximalen Value!',
            shouldCall: 'Slow-Play um Villain mehr Chips zu entlocken.',
            shouldFold: 'Straight Flush folden ist unmöglich falsch.'
        },
        straight: {
            shouldRaise: 'Mit einer Straight solltest du für Value raisen!',
            shouldCall: 'Call ist ok, besonders wenn höhere Straights möglich sind.',
            shouldFold: 'Straight folden ist fast nie korrekt auf dem Flop.'
        },
        flush: {
            shouldRaise: 'Mit einem Flush solltest du für Value raisen! Villain hat oft genug Hände zum Callen.',
            shouldCall: 'Slow-Play kann funktionieren um Villain weitere Barrels bluffen zu lassen.',
            shouldFold: 'Einen Flush folden? Fast nie korrekt - außer auf 4-to-a-Straight Boards mit Action.'
        },
        full_house: {
            shouldRaise: 'Full House ist ein Monster. Raise für Value und baue den Pot.',
            shouldCall: 'Call um Villain weitere Bluffs zu erlauben - aber Raise ist meist besser.',
            shouldFold: 'Full House folden ist praktisch nie korrekt.'
        },
        trips: {
            shouldRaise: 'Trips ist stark genug zum Raisen. Hole Value von Overpairs und Draws.',
            shouldCall: 'Call ist ok, aber mit Trips willst du meist den Pot vergrößern.',
            shouldFold: 'Trips folden ist viel zu tight - du hast eine sehr starke Hand!'
        },
        set: {
            shouldRaise: 'Sets sollten für Value raisen. Der Gegner hat oft genug Top Pairs zum Weiterspielen.',
            shouldCall: 'Slow-Play kann auf trockenen Boards Sinn machen um Villain weitere Barrels zu erlauben.',
            shouldFold: 'Sets folden ist fast nie korrekt - außer auf 4-Flush/4-Straight Boards ohne Redraw.'
        },
        two_pair: {
            shouldRaise: 'Two Pair ist stark genug zum Raisen. Hole Value und schütze vor Draws.',
            shouldCall: 'Call ist ok wenn du Villain weitere Bluffs erlauben willst.',
            shouldFold: 'Two Pair folden? Nur auf absolut katastrophalen Runouts.'
        },
        overpair: {
            shouldRaise: 'Overpairs können raisen für Value, aber Call ist auch ok.',
            shouldCall: 'Call ist Standard. Du schlägst Bluffs und schwächere Value-Hände.',
            shouldFold: 'Overpair folden ist fast nie korrekt gegen eine einzelne C-Bet.'
        },
        underpair_high: {
            shouldRaise: 'Hohe Underpairs als Raise ist aggressiv. Nur als Bluff oder mit sehr guten Reads.',
            shouldCall: 'Call ist Standard. Du schlägst Bluffs und hast Implied Odds auf ein Set.',
            shouldFold: 'Fold ist zu tight. Hohe Underpairs haben genug Equity gegen C-Bet Range.'
        },
        underpair_low: {
            shouldRaise: 'Niedrige Underpairs raisen ist reiner Bluff. Selten sinnvoll.',
            shouldCall: 'Call nur mit guten Pot Odds. Dein Pair ist oft dominiert.',
            shouldFold: 'Fold ist oft korrekt bei niedrigen Underpairs - zu wenig Equity.'
        },
        top_pair_good: {
            shouldRaise: 'Top Pair guter Kicker kann raisen, aber Call ist meist besser - du willst Villain bluffen lassen.',
            shouldCall: 'Call ist Standard. Du schlägst Bluffs und kannst später Value holen.',
            shouldFold: 'Top Pair zu folden gibt zu viel auf. Villain blufft oft genug.'
        },
        top_pair_weak: {
            shouldRaise: 'Mit schwachem Kicker ist Raisen riskant - du kriegst nur von besser gecallt.',
            shouldCall: 'Call und evaluiere den Turn. Du schlägst noch viele Bluffs.',
            shouldFold: 'Folden ist zu tight. Auch mit schwachem Kicker bist du oft vorne.'
        },
        second_pair: {
            shouldRaise: 'Second Pair raisen ist Bluff-Raise Territorium. Nur mit guten Reads.',
            shouldCall: 'Call ist Standard. Du hast genug Equity gegen Villains Range.',
            shouldFold: 'Fold ist bei hoher C-Bet Frequenz des Gegners zu tight.'
        },
        low_pair: {
            shouldRaise: 'Low Pair raisen macht keinen Sinn - weder Value noch effektiver Bluff.',
            shouldCall: 'Call nur mit guten Implied Odds (Set-Mining) oder gegen sehr hohe C-Bet Frequenz.',
            shouldFold: 'Fold ist oft korrekt. Dein Pair ist zu schwach gegen eine normale Range.'
        },
        flush_draw: {
            shouldRaise: 'Flush Draw Check-Raisen ist stark! Du hast Fold Equity + 9 Outs wenn gecallt.',
            shouldCall: 'Call um günstig den Turn zu sehen. Bei Hit: großer Pot.',
            shouldFold: 'Flush Draw folden verschenkt zu viel Equity. Du hast ~35% Equity.'
        },
        oesd: {
            shouldRaise: 'OESD Check-Raise ist ein starker Semi-Bluff mit 8 Outs.',
            shouldCall: 'Call ist Standard mit guten Implied Odds.',
            shouldFold: 'OESD folden ist zu tight. Du hast genug Equity zum Weiterspielen.'
        },
        gutshot: {
            shouldRaise: 'Gutshot raisen ist aggressiv. Nur mit Backdoor-Equity oder als Bluff.',
            shouldCall: 'Call nur mit guten Pot Odds und Implied Odds.',
            shouldFold: 'Fold ist oft korrekt. 4 Outs reichen selten für profitable Calls.'
        },
        overcards: {
            shouldRaise: 'Overcards als Bluff-Raise können funktionieren, aber riskant ohne Backdoors.',
            shouldCall: 'Call nur auf sehr dry Boards wo du 6 cleane Outs hast.',
            shouldFold: 'Fold ist meist korrekt. Overcards ohne Draw haben zu wenig Equity.'
        },
        ace_high: {
            shouldRaise: 'Ace High raisen ist reiner Bluff. Nur mit guten Reads.',
            shouldCall: 'Call nur als Bluff-Catch gegen extrem aggressive Gegner.',
            shouldFold: 'Fold ist Standard. Ace High reicht nicht gegen eine normale C-Bet Range.'
        },
        nothing: {
            shouldRaise: 'Nothing raisen ist purer Bluff. Funktioniert nur auf sehr dry Boards.',
            shouldCall: 'Call ohne jede Equity ist Geldverbrennung. Fold!',
            shouldFold: 'Fold ist absolut korrekt. Ohne Equity gibst du nur Geld weg.'
        }
    }
};

// Funktion um die passende Erklärung zu generieren
function getExplanation(userAction, correctAction, handCategory, texture, mode) {
    const textureInfo = TEXTURE_CONCEPTS[texture];
    let explanation = '';

    // Texture Kontext
    explanation += `<strong>${textureInfo.name}:</strong> ${textureInfo.concept}<br><br>`;

    // Hand-spezifische Erklärung
    if (mode === 'cbet') {
        const handExp = HAND_EXPLANATIONS.cbet[handCategory];
        if (handExp) {
            if (correctAction === 'cbet') {
                explanation += `<strong>Warum C-Bet?</strong> ${handExp.shouldBet}`;
            } else {
                explanation += `<strong>Warum Check?</strong> ${handExp.shouldCheck}`;
            }
        }
    } else {
        const handExp = HAND_EXPLANATIONS.facing[handCategory];
        if (handExp) {
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
// STATE
// ============================================

let currentMode = 'cbet'; // 'cbet' oder 'facing-cbet'
let currentBoard = [];    // [{rank, suit}, ...]
let currentHeroHand = []; // [{rank, suit}, {rank, suit}]
let currentTexture = '';
let currentSpot = '';
let currentHandCategory = '';
let correctActionData = null;

let score = { correct: 0, total: 0 };
let evGainTotal = 0;
let evLossTotal = 0;
let mistakes = [];

// ============================================
// DOM ELEMENTS
// ============================================

const elements = {
    modeBtns: document.querySelectorAll('.mode-btn'),
    boardCards: [
        document.getElementById('board-card-1'),
        document.getElementById('board-card-2'),
        document.getElementById('board-card-3')
    ],
    heroCards: [
        document.getElementById('hero-card-1'),
        document.getElementById('hero-card-2')
    ],
    textureBadge: document.getElementById('texture-badge'),
    handCategoryBadge: document.getElementById('hand-category-badge'),
    positionBadge: document.getElementById('position-badge'),
    scenarioText: document.getElementById('scenario-text'),
    actionBtns: {
        cbet: document.getElementById('btn-cbet'),
        check: document.getElementById('btn-check'),
        fold: document.getElementById('btn-fold'),
        call: document.getElementById('btn-call'),
        raise: document.getElementById('btn-raise')
    },
    feedback: document.getElementById('feedback'),
    feedbackIcon: document.getElementById('feedback-icon'),
    feedbackText: document.getElementById('feedback-text'),
    correctAnswer: document.getElementById('correct-answer'),
    explanation: document.getElementById('explanation'),
    nextBtn: document.getElementById('next-btn'),
    correctCount: document.getElementById('correct-count'),
    totalCount: document.getElementById('total-count'),
    percentage: document.getElementById('percentage'),
    netEv: document.getElementById('net-ev'),
    evRating: document.getElementById('ev-rating'),
    evGains: document.getElementById('ev-gains'),
    evLosses: document.getElementById('ev-losses'),
    mistakesList: document.getElementById('mistakes-list')
};

// ============================================
// CARD GENERATION
// ============================================

function createDeck() {
    const deck = [];
    for (const rank of RANKS) {
        for (const suit of SUITS) {
            deck.push({ rank, suit });
        }
    }
    return deck;
}

function shuffleDeck(deck) {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function dealCards(deck, count) {
    return deck.splice(0, count);
}

// ============================================
// TEXTURE DETECTION
// ============================================

function identifyTexture(board) {
    const ranks = board.map(c => c.rank);
    const suits = board.map(c => c.suit);
    const values = ranks.map(r => RANK_VALUES[r]).sort((a, b) => a - b);

    // Paired: Zwei gleiche Ränge
    if (hasPair(ranks)) {
        return 'paired';
    }

    // Monotone: Alle 3 gleiche Farbe
    if (suits[0] === suits[1] && suits[1] === suits[2]) {
        return 'monotone';
    }

    // Connected: Max 2 Gaps zwischen höchster und niedrigster Karte
    const gap = values[2] - values[0];
    if (gap <= 4) {
        // Prüfe ob tatsächlich connected (nicht nur close)
        const isConnected = gap <= 4 && countConnections(values) >= 1;
        if (isConnected && !isRainbow(suits)) {
            return 'wet'; // Connected mit Flush Draw
        }
        if (isConnected) {
            return 'connected';
        }
    }

    // Wet: 2 gleiche Farben (Flush Draw möglich)
    if (hasTwoSuited(suits)) {
        return 'wet';
    }

    // Default: Dry
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
    const lowestBoardValue = boardValues[2];

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
        // Ace low für Wheel (A2345)
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

    // STRAIGHT FLUSH CHECK (muss zuerst kommen!)
    if (maxSuitCount >= 5 && flushSuit) {
        // Hole alle Karten der Flush-Farbe
        const flushCards = allCards.filter(c => c.suit === flushSuit);
        const flushValues = flushCards.map(c => RANK_VALUES[c.rank]);
        // Prüfe ob Hero am Straight Flush beteiligt ist
        const heroHasFlushSuit = heroSuits.includes(flushSuit);
        if (heroHasFlushSuit && checkStraight(flushValues)) {
            return 'straight_flush';
        }
    }

    // QUADS CHECK (4 gleiche)
    if (maxRankCount >= 4) {
        // Prüfe ob Hero an den Quads beteiligt ist
        const quadsRank = Object.entries(allRankCounts).find(([r, c]) => c >= 4)?.[0];
        if (heroRanks.includes(quadsRank)) {
            return 'quads';
        }
    }

    // FLUSH CHECK (5 gleiche Farbe)
    if (maxSuitCount >= 5) {
        // Prüfe ob Hero am Flush beteiligt ist
        if (heroSuits.includes(flushSuit)) {
            return 'flush';
        }
    }

    // STRAIGHT CHECK (5 aufeinanderfolgende)
    const uniqueAllValues = [...new Set(allValues)].sort((a, b) => a - b);
    if (checkStraight(allValues)) {
        // Prüfe ob Hero an der Straight beteiligt ist (mindestens eine Karte)
        // Eine Straight braucht 5 aufeinanderfolgende - Hero muss mindestens eine haben
        // die nicht durch das Board allein erreicht wird
        const boardOnlyStraight = checkStraight(boardValues);
        if (!boardOnlyStraight || heroValues.some(v => {
            // Prüfe ob Hero-Karte Teil einer Straight ist
            const withoutHeroCard = allValues.filter((val, idx) => idx !== allValues.indexOf(v));
            return !checkStraight(withoutHeroCard) || uniqueAllValues.length > [...new Set(boardValues)].length;
        })) {
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
            // Hero hat Trips/Quads mit seinem Pocket Pair
            // Prüfe ob Board ein separates Pair hat → Full House
            const otherBoardPair = Object.entries(boardRankCounts).find(([r, c]) => c >= 2 && r !== heroRanks[0]);
            if (otherBoardPair) {
                return 'full_house';
            }
            return 'set';
        }
        // Overpair
        if (pocketValue > highestBoardValue) {
            return 'overpair';
        }
        // Underpair (Pocket Pair unter höchster Board-Karte)
        if (pocketValue > secondBoardValue) {
            return 'underpair_high'; // z.B. JJ auf Q62
        }
        return 'underpair_low'; // z.B. 55 auf Q62
    }

    // Check für Two Pair / Full House / Trips
    const heroHitsBoard = heroRanks.filter(r => boardRanks.includes(r));
    if (heroHitsBoard.length === 2 && heroRanks[0] !== heroRanks[1]) {
        // Hero trifft beide Karten auf dem Board
        // Prüfe ob eine davon ein Board-Pair ist → Full House
        for (const hitRank of heroHitsBoard) {
            if (boardRankCounts[hitRank] >= 2) {
                // Hero hat Trips (z.B. 6 auf Board 66x) + Pair (andere Karte) = Full House
                return 'full_house';
            }
        }
        return 'two_pair';
    }

    // Check für Trips (Hero hat eine Karte eines Board-Pairs)
    if (heroHitsBoard.length === 1 && boardPairRank && heroHitsBoard[0] === boardPairRank) {
        return 'trips';
    }

    // Check für Pair
    if (heroHitsBoard.length === 1) {
        const hitRank = heroHitsBoard[0];
        const hitValue = RANK_VALUES[hitRank];
        const kickerValue = heroValues.find(v => v !== hitValue) || heroValues[0];

        if (hitValue === highestBoardValue) {
            // Top Pair
            if (kickerValue >= 10) { // T+
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

    // Check für Flush Draw (genau 4 gleiche Farbe)
    if (maxSuitCount === 4) {
        return 'flush_draw';
    }

    // Straight Draw Check
    const uniqueValues = [...new Set(allValues)].sort((a, b) => a - b);
    const straightDraw = checkStraightDraw(uniqueValues);
    if (straightDraw === 'oesd') {
        return 'oesd';
    }
    if (straightDraw === 'gutshot') {
        return 'gutshot';
    }

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
    // Suche nach 4 aufeinanderfolgenden Karten (OESD)
    // oder 4 Karten mit einem Gap (Gutshot)

    // Add low ace for wheel draws
    if (values.includes(14)) {
        values = [1, ...values];
    }

    for (let i = 0; i <= values.length - 4; i++) {
        const window = values.slice(i, i + 4);
        const span = window[3] - window[0];

        if (span === 3) {
            // 4 consecutive = OESD
            return 'oesd';
        }
        if (span === 4 && window.length === 4) {
            // 4 cards with one gap = Gutshot
            return 'gutshot';
        }
    }

    // Check for gutshot with 5 card window
    for (let i = 0; i <= values.length - 4; i++) {
        const window = values.slice(i, i + 5);
        if (window.length >= 4) {
            const span = window[window.length - 1] - window[0];
            if (span === 4 && window.length === 4) {
                return 'gutshot';
            }
        }
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

    // Fallback-Mapping für Kategorien die nicht explizit in der Range sind
    // underpair_high verhält sich ähnlich wie second_pair
    // underpair_low verhält sich ähnlich wie low_pair
    const categoryFallbacks = {
        'underpair_high': 'second_pair',
        'underpair_low': 'low_pair'
    };

    // Funktion um Kategorie oder Fallback zu finden
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
// SCENARIO GENERATION
// ============================================

function getActiveTextures() {
    const active = [];
    TEXTURES.forEach(tex => {
        const checkbox = document.getElementById(`tex-${tex}`);
        if (checkbox && checkbox.checked) {
            active.push(tex);
        }
    });
    return active.length > 0 ? active : TEXTURES;
}

function getActiveSpots() {
    const spots = currentMode === 'cbet' ? CBET_SPOTS : FACING_CBET_SPOTS;
    const prefix = currentMode === 'cbet' ? 'spot-' : 'spot-';

    const active = [];
    spots.forEach(spot => {
        const id = 'spot-' + spot.toLowerCase().replace('_', '-');
        const checkbox = document.getElementById(id);
        if (checkbox && checkbox.checked) {
            active.push(spot);
        }
    });
    return active.length > 0 ? active : spots;
}

function generateBoardForTexture(targetTexture, deck) {
    // Generiere Boards bis wir die gewünschte Texture haben
    let attempts = 0;
    const maxAttempts = 100;

    while (attempts < maxAttempts) {
        const testDeck = shuffleDeck([...deck]);
        const board = dealCards(testDeck, 3);
        const texture = identifyTexture(board);

        if (texture === targetTexture) {
            // Entferne die Karten aus dem Original-Deck
            board.forEach(card => {
                const idx = deck.findIndex(c => c.rank === card.rank && c.suit === card.suit);
                if (idx !== -1) deck.splice(idx, 1);
            });
            return board;
        }
        attempts++;
    }

    // Fallback: Nimm einfach 3 Karten
    return dealCards(deck, 3);
}

function nextScenario() {
    // Reset UI
    elements.feedback.classList.remove('show', 'correct', 'wrong');
    elements.nextBtn.classList.remove('show');
    setActionButtonsEnabled(true);

    // Generate new scenario
    const deck = createDeck();
    const shuffledDeck = shuffleDeck(deck);

    // Get active filters
    const activeTextures = getActiveTextures();
    const activeSpots = getActiveSpots();

    // Random texture and spot
    currentTexture = activeTextures[Math.floor(Math.random() * activeTextures.length)];
    currentSpot = activeSpots[Math.floor(Math.random() * activeSpots.length)];

    // Generate board with target texture
    currentBoard = generateBoardForTexture(currentTexture, shuffledDeck);

    // Generate hero hand
    currentHeroHand = dealCards(shuffledDeck, 2);

    // Evaluate hand category
    currentHandCategory = evaluateHandCategory(currentHeroHand, currentBoard);

    // Determine correct action
    correctActionData = determineCorrectAction(currentSpot, currentTexture, currentHandCategory);

    // Update UI
    renderBoard();
    renderHeroHand();
    renderScenario();
    updateActionButtons();
}

// ============================================
// RENDERING
// ============================================

function renderBoard() {
    currentBoard.forEach((card, i) => {
        const cardEl = elements.boardCards[i];
        cardEl.querySelector('.rank').textContent = card.rank;
        cardEl.querySelector('.suit').textContent = SUIT_SYMBOLS[card.suit];

        // Set color class
        cardEl.classList.remove('hearts', 'diamonds', 'spades', 'clubs');
        if (card.suit === 'h') cardEl.classList.add('hearts');
        else if (card.suit === 'd') cardEl.classList.add('diamonds');
        else if (card.suit === 's') cardEl.classList.add('spades');
        else if (card.suit === 'c') cardEl.classList.add('clubs');
    });

    // Update texture badge
    elements.textureBadge.textContent = TEXTURE_INFO[currentTexture].name;
    elements.textureBadge.className = 'texture-badge ' + currentTexture;
}

function renderHeroHand() {
    currentHeroHand.forEach((card, i) => {
        const cardEl = elements.heroCards[i];
        cardEl.querySelector('.rank').textContent = card.rank;
        cardEl.querySelector('.suit').textContent = SUIT_SYMBOLS[card.suit];

        // Set color class
        cardEl.classList.remove('hearts', 'diamonds', 'spades', 'clubs');
        if (card.suit === 'h') cardEl.classList.add('hearts');
        else if (card.suit === 'd') cardEl.classList.add('diamonds');
        else if (card.suit === 's') cardEl.classList.add('spades');
        else if (card.suit === 'c') cardEl.classList.add('clubs');
    });

    // Update hand category badge
    elements.handCategoryBadge.textContent = HAND_CATEGORY_NAMES[currentHandCategory] || currentHandCategory;
}

function renderScenario() {
    const [heroPos, , villainPos] = currentSpot.split('_');

    elements.positionBadge.textContent = heroPos;

    if (currentMode === 'cbet') {
        elements.scenarioText.innerHTML = `
            Du bist <strong>PFR am ${heroPos}</strong>, ${villainPos} callt.<br>
            <small>C-Bet oder Check?</small>
        `;
    } else {
        elements.scenarioText.innerHTML = `
            ${villainPos} öffnet, du callst im <strong>${heroPos}</strong>.<br>
            ${villainPos} c-bettet. <small>Was tust du?</small>
        `;
    }
}

function updateActionButtons() {
    if (currentMode === 'cbet') {
        elements.actionBtns.cbet.style.display = 'inline-block';
        elements.actionBtns.check.style.display = 'inline-block';
        elements.actionBtns.fold.style.display = 'none';
        elements.actionBtns.call.style.display = 'none';
        elements.actionBtns.raise.style.display = 'none';
    } else {
        elements.actionBtns.cbet.style.display = 'none';
        elements.actionBtns.check.style.display = 'none';
        elements.actionBtns.fold.style.display = 'inline-block';
        elements.actionBtns.call.style.display = 'inline-block';
        elements.actionBtns.raise.style.display = 'inline-block';
    }
}

function setActionButtonsEnabled(enabled) {
    Object.values(elements.actionBtns).forEach(btn => {
        btn.disabled = !enabled;
    });
}

// ============================================
// ACTION HANDLING
// ============================================

function handleAction(action) {
    if (elements.actionBtns.cbet.disabled) return;

    setActionButtonsEnabled(false);
    score.total++;

    let isCorrect = false;
    let isMixedAcceptable = false;
    let mixedFrequency = 0;

    if (correctActionData.isMixed) {
        const mixedData = correctActionData.mixedData;
        if (mixedData[action] && mixedData[action] > 0) {
            isMixedAcceptable = true;
            mixedFrequency = mixedData[action];
            isCorrect = true;
        }
    } else {
        isCorrect = action === correctActionData.action;
    }

    if (isCorrect) {
        score.correct++;
        const evGain = calculateEVGain(isMixedAcceptable, mixedFrequency);
        evGainTotal += evGain;
        showFeedback(true, isMixedAcceptable, mixedFrequency, evGain, action);
    } else {
        const evLoss = calculateEVLoss(action);
        evLossTotal += evLoss;
        addMistake(action, evLoss);
        showFeedback(false, false, 0, evLoss, action);
    }

    updateScoreDisplay();
    elements.nextBtn.classList.add('show');
}

function calculateEVGain(isMixed, mixedFrequency) {
    const baseValue = HAND_CATEGORY_VALUES[currentHandCategory] || 50;

    if (isMixed) {
        return Math.round(baseValue * mixedFrequency);
    }
    return baseValue;
}

function calculateEVLoss(userAction) {
    const baseValue = HAND_CATEGORY_VALUES[currentHandCategory] || 50;

    // Berechne EV-Verlust basierend auf Fehlertyp
    if (currentMode === 'cbet') {
        if (correctActionData.action === 'cbet' && userAction === 'check') {
            // Hätte c-betten sollen, aber gecheckt -> Value verloren
            return Math.round(baseValue * 0.6);
        }
        if (correctActionData.action === 'check' && userAction === 'cbet') {
            // Hätte checken sollen, aber c-bettet -> Bluff in schlechtem Spot
            return Math.round(baseValue * 0.8);
        }
    } else {
        // Facing C-Bet Fehler
        if (correctActionData.action === 'raise' && userAction === 'fold') {
            return Math.round(baseValue * 1.0); // Starke Hand gefoldet
        }
        if (correctActionData.action === 'call' && userAction === 'fold') {
            return Math.round(baseValue * 0.5); // Callbare Hand gefoldet
        }
        if (correctActionData.action === 'fold' && userAction === 'call') {
            return Math.round(baseValue * 0.6); // Gecallt statt gefoldet
        }
        if (correctActionData.action === 'fold' && userAction === 'raise') {
            return Math.round(baseValue * 1.0); // Geraist statt gefoldet
        }
    }

    return Math.round(baseValue * 0.5);
}

function addMistake(userAction, evLoss) {
    const handNotation = getHandNotation();
    const correctAction = correctActionData.isMixed
        ? getMixedActionString(correctActionData.mixedData)
        : correctActionData.action;

    mistakes.unshift({
        hand: handNotation,
        category: currentHandCategory,
        spot: currentSpot,
        texture: currentTexture,
        userAction,
        correctAction,
        evLoss
    });

    // Keep only top 10 mistakes
    if (mistakes.length > 10) {
        mistakes.pop();
    }

    renderMistakes();
}

function getHandNotation() {
    const r1 = currentHeroHand[0].rank;
    const r2 = currentHeroHand[1].rank;
    const s1 = currentHeroHand[0].suit;
    const s2 = currentHeroHand[1].suit;

    const v1 = RANK_VALUES[r1];
    const v2 = RANK_VALUES[r2];

    let notation;
    if (v1 > v2) {
        notation = r1 + r2;
    } else if (v2 > v1) {
        notation = r2 + r1;
    } else {
        notation = r1 + r2;
    }

    if (r1 !== r2) {
        notation += s1 === s2 ? 's' : 'o';
    }

    return notation;
}

function getMixedActionString(mixedData) {
    const parts = [];
    for (const [action, freq] of Object.entries(mixedData)) {
        if (action !== 'category' && freq > 0) {
            parts.push(`${Math.round(freq * 100)}% ${action}`);
        }
    }
    return parts.join(' / ');
}

// ============================================
// FEEDBACK
// ============================================

function showFeedback(isCorrect, isMixed, mixedFrequency, evChange, userAction) {
    elements.feedback.classList.remove('correct', 'wrong');
    elements.feedback.classList.add('show', isCorrect ? 'correct' : 'wrong');

    // Bestimme die korrekte Aktion für die Erklärung
    const correctAction = correctActionData.isMixed
        ? Object.entries(correctActionData.mixedData)
            .filter(([k, v]) => k !== 'category' && v > 0)
            .sort((a, b) => b[1] - a[1])[0][0]
        : correctActionData.action;

    if (isCorrect) {
        elements.feedbackIcon.textContent = '✓';
        if (isMixed) {
            elements.feedbackText.textContent = `Korrekt! (${Math.round(mixedFrequency * 100)}% Frequenz)`;
            elements.correctAnswer.innerHTML = `Mixed Strategy: ${getMixedActionString(correctActionData.mixedData)} | <span class="ev-positive">+${evChange} EV</span>`;
        } else {
            elements.feedbackText.textContent = 'Richtig!';
            elements.correctAnswer.innerHTML = `<span class="ev-positive">+${evChange} EV</span>`;
        }
        // Bei korrekter Antwort: kurze Bestätigung
        if (elements.explanation) {
            elements.explanation.innerHTML = '';
            elements.explanation.style.display = 'none';
        }
    } else {
        elements.feedbackIcon.textContent = '✗';
        elements.feedbackText.textContent = 'Falsch!';

        const correctActionDisplay = correctActionData.isMixed
            ? getMixedActionString(correctActionData.mixedData)
            : correctActionData.action.toUpperCase();
        elements.correctAnswer.innerHTML = `Korrekte Aktion: <strong>${correctActionDisplay}</strong> | <span class="ev-negative">-${evChange} EV</span>`;

        // Bei Fehler: Erklärung anzeigen
        if (elements.explanation) {
            const explanation = getExplanation(userAction, correctAction, currentHandCategory, currentTexture, currentMode);
            elements.explanation.innerHTML = explanation;
            elements.explanation.style.display = 'block';
        }
    }
}

// ============================================
// SCORE & EV DISPLAY
// ============================================

function updateScoreDisplay() {
    elements.correctCount.textContent = score.correct;
    elements.totalCount.textContent = score.total;

    const pct = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;
    elements.percentage.textContent = pct + '%';

    // EV Display
    const netEv = evGainTotal - evLossTotal;
    elements.netEv.textContent = (netEv >= 0 ? '+' : '') + netEv;
    elements.netEv.className = 'ev-metric-value ' + (netEv >= 0 ? 'ev-positive' : 'ev-negative');

    elements.evGains.textContent = '+' + evGainTotal;
    elements.evLosses.textContent = '-' + evLossTotal;

    // EV Rating
    const evPer100 = score.total > 0 ? Math.round((netEv / score.total) * 100) : 0;
    let ratingClass = 'rating-bad';
    let ratingText = 'Schlecht';

    if (evPer100 >= 50) {
        ratingClass = 'rating-excellent';
        ratingText = 'Exzellent';
    } else if (evPer100 >= 30) {
        ratingClass = 'rating-good';
        ratingText = 'Gut';
    } else if (evPer100 >= 10) {
        ratingClass = 'rating-medium';
        ratingText = 'OK';
    }

    elements.evRating.textContent = `${evPer100} (${ratingText})`;
    elements.evRating.className = 'ev-rating ' + ratingClass;
}

function renderMistakes() {
    if (mistakes.length === 0) {
        elements.mistakesList.innerHTML = '<li class="no-mistakes">Noch keine Fehler!</li>';
        return;
    }

    elements.mistakesList.innerHTML = mistakes.map(m => `
        <li class="mistake-item">
            <span class="mistake-hand">${m.hand}</span>
            <span class="mistake-scenario">${m.texture}</span>
            <span class="mistake-action">${m.userAction} → ${m.correctAction}</span>
            <span class="mistake-loss">-${m.evLoss}</span>
        </li>
    `).join('');
}

// ============================================
// MODE SWITCHING
// ============================================

function setMode(mode) {
    currentMode = mode;

    elements.modeBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    // Reset score
    score = { correct: 0, total: 0 };
    evGainTotal = 0;
    evLossTotal = 0;
    mistakes = [];

    updateScoreDisplay();
    renderMistakes();
    nextScenario();
}

// ============================================
// SETTINGS
// ============================================

function toggleSettings() {
    const panel = document.getElementById('settings-panel');
    panel.classList.toggle('show');
}

// ============================================
// KEYBOARD SHORTCUTS
// ============================================

function handleKeyboard(e) {
    // Nach Feedback: Space/Enter für nächste Hand
    if (elements.actionBtns.cbet.disabled) {
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            nextScenario();
        }
        return;
    }

    const key = e.key.toLowerCase();

    if (currentMode === 'cbet') {
        switch (key) {
            case 'b': handleAction('cbet'); break;
            case 'k': handleAction('check'); break;
        }
    } else {
        switch (key) {
            case 'f': handleAction('fold'); break;
            case 'c': handleAction('call'); break;
            case 'r': handleAction('raise'); break;
        }
    }
}

// ============================================
// INITIALIZATION
// ============================================

function init() {
    // Mode button listeners
    elements.modeBtns.forEach(btn => {
        btn.addEventListener('click', () => setMode(btn.dataset.mode));
    });

    // Keyboard listener
    document.addEventListener('keydown', handleKeyboard);

    // Start first scenario
    nextScenario();
}

// Start when DOM is ready
document.addEventListener('DOMContentLoaded', init);
