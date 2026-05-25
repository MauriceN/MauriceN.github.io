// Poker Preflop Trainer - Spiellogik

const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
const SUITS = ['s', 'h', 'd', 'c']; // spades, hearts, diamonds, clubs
const SUIT_SYMBOLS = { s: '♠', h: '♥', d: '♦', c: '♣' };
const SUIT_NAMES = { s: 'spades', h: 'hearts', d: 'diamonds', c: 'clubs' };

let currentMode = 'or'; // 'rfi', '3bet', 'facing3bet', 'isolate' (cash) oder 'or' (tournament)
let currentHand = null;
let currentPosition = null;
let currentOpenerPosition = null;
let current3BettorPosition = null; // Für facing3bet Modus
let currentLimperPosition = null; // Für isolate Modus
let correctActionData = null; // { action: 'raise'|'call'|'fold'|'mixed', isMixed: bool, mixedData?: {...} }
let score = { correct: 0, total: 0 };
let activePositions = ['UTG', 'HJ', 'CO', 'BTN', 'SB', 'BB'];

// Game Type: 'cash' oder 'tournament'
let gameType = 'tournament';
let currentStackSize = '10-20bb'; // Tournament Stack Kategorie
let currentStackBB = 15; // Exakte Stacksize in BB (10-20)
let currentOpenSize = 2.3; // Open-Sizing in BB (für vsopen Mode)
let currentBlindsWeak = false; // Zufällig pro vsopen-Szenario: sind die Blinds weak?
let activeTournamentPositions = ['UTG', 'UTG1', 'UTG2', 'MP', 'HJ', 'CO', 'BTN', 'SB', 'BB'];
let activeVillainPositions = ['UTG', 'MP', 'BTN', 'SB']; // Opener-Filter für vsopen Mode

// EV Tracking
let evGainTotal = 0;
let evLossTotal = 0;
let mistakes = []; // Array der Fehler: { hand, position, userAction, correctAction, evLoss, openerPosition }

// Range Viewer State
let rangeRevealed = false;
let equityMode = false;

// LocalStorage & Leak Detection
const STORAGE_KEY = 'poker-preflop-trainer-stats';
let focusModeActive = false;

// Detailed stats per mode/position/handType for leak detection
let detailedStats = {
    rfi: {},       // key: "position|handType" -> { total, correct, evLost }
    '3bet': {},    // key: "position_vs_opener|handType" -> { total, correct, evLost }
    facing3bet: {},// key: "position_vs_3bettor|handType" -> { total, correct, evLost }
    isolate: {},   // key: "position_vs_limper|handType" -> { total, correct, evLost }
    // Tournament modes
    'or': {},      // key: "stacksize|position|handType" -> { total, correct, evLost }
    'vs3bet': {}, // key: "stacksize|position|handType" -> { total, correct, evLost }
    'vsopen': {}  // key: "stacksize|position_vs_opener|handType"
};

// Hand-Typ Kategorien für Leak-Erkennung
const HAND_TYPES = {
    'premium_pairs': ['AA', 'KK', 'QQ'],
    'medium_pairs': ['JJ', 'TT', '99', '88'],
    'small_pairs': ['77', '66', '55', '44', '33', '22'],
    'broadway_suited': ['AKs', 'AQs', 'AJs', 'ATs', 'KQs', 'KJs', 'KTs', 'QJs', 'QTs', 'JTs'],
    'broadway_offsuit': ['AKo', 'AQo', 'AJo', 'ATo', 'KQo', 'KJo', 'KTo', 'QJo', 'QTo', 'JTo'],
    'suited_aces': ['A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s'],
    'suited_connectors': ['T9s', '98s', '87s', '76s', '65s', '54s', '43s'],
    'suited_gappers': ['J9s', 'T8s', '97s', '86s', '75s', '64s', '53s'],
    'offsuit_aces': ['A9o', 'A8o', 'A7o', 'A6o', 'A5o', 'A4o', 'A3o', 'A2o'],
    'trash': [] // alles andere
};

const HAND_TYPE_NAMES = {
    'premium_pairs': 'Premium Pairs',
    'medium_pairs': 'Medium Pairs',
    'small_pairs': 'Small Pairs',
    'broadway_suited': 'Broadway Suited',
    'broadway_offsuit': 'Broadway Offsuit',
    'suited_aces': 'Suited Aces',
    'suited_connectors': 'Suited Connectors',
    'suited_gappers': 'Suited Gappers',
    'offsuit_aces': 'Offsuit Aces',
    'trash': 'Sonstige'
};

// Hand-Werte für EV-Berechnung (höher = wertvoller)
const HAND_BASE_VALUES = {
    // Pocket Pairs
    'AA': 100, 'KK': 95, 'QQ': 90, 'JJ': 85, 'TT': 75,
    '99': 65, '88': 55, '77': 50, '66': 45, '55': 40, '44': 35, '33': 30, '22': 25,
    // Suited Broadways
    'AKs': 92, 'AQs': 85, 'AJs': 78, 'ATs': 72,
    'KQs': 80, 'KJs': 73, 'KTs': 68,
    'QJs': 72, 'QTs': 65,
    'JTs': 68,
    // Offsuit Broadways
    'AKo': 88, 'AQo': 78, 'AJo': 70, 'ATo': 62,
    'KQo': 72, 'KJo': 65, 'KTo': 58,
    'QJo': 62, 'QTo': 55,
    'JTo': 58
};

// ============================================
// LOCALSTORAGE & LEAK DETECTION
// ============================================

function getHandType(handNotation) {
    for (const [type, hands] of Object.entries(HAND_TYPES)) {
        if (hands.includes(handNotation)) {
            return type;
        }
    }
    return 'trash';
}

function getSpotKey() {
    if (currentMode === 'rfi') {
        return currentPosition;
    } else if (currentMode === '3bet') {
        return `${currentPosition}_vs_${currentOpenerPosition}`;
    } else if (currentMode === 'facing3bet') {
        return `${currentPosition}_vs_${current3BettorPosition}`;
    } else if (currentMode === 'isolate') {
        return `${currentPosition}_vs_${currentLimperPosition}`;
    } else if (currentMode === 'or') {
        // Tournament OR mode: include stacksize
        return `${currentStackSize}|${currentPosition}`;
    } else if (currentMode === 'vs3bet') {
        // Tournament vs 3-Bet mode: include stacksize and 3bettor
        return `${currentStackSize}|${currentPosition}_vs_${current3BettorPosition}`;
    } else if (currentMode === 'vsopen') {
        // Tournament vs Open mode: include stacksize and opener
        return `${currentStackSize}|${currentPosition}_vs_${currentOpenerPosition}`;
    }
    return 'unknown';
}

function trackDetailedStat(handNotation, isCorrect, evLost = 0) {
    const handType = getHandType(handNotation);
    const spotKey = getSpotKey();
    const key = `${spotKey}|${handType}`;
    const modeStats = detailedStats[currentMode];

    if (!modeStats[key]) {
        modeStats[key] = { total: 0, correct: 0, evLost: 0 };
    }

    modeStats[key].total++;
    if (isCorrect) {
        modeStats[key].correct++;
    } else {
        modeStats[key].evLost += evLost;
    }

    saveToLocalStorage();
}

function saveToLocalStorage() {
    const data = {
        score,
        evGainTotal,
        evLossTotal,
        mistakes,
        detailedStats,
        savedAt: Date.now()
    };
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
        console.warn('LocalStorage nicht verfügbar:', e);
    }
}

function loadFromLocalStorage() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) return false;

        const data = JSON.parse(saved);

        // Restore state
        score = data.score || { correct: 0, total: 0 };
        evGainTotal = data.evGainTotal || 0;
        evLossTotal = data.evLossTotal || 0;
        mistakes = data.mistakes || [];
        detailedStats = data.detailedStats || { rfi: {}, '3bet': {}, facing3bet: {}, isolate: {}, 'or': {}, 'vs3bet': {}, 'vsopen': {} };
        // Sicherstellen, dass alle Modi existieren (für alte LocalStorage-Daten)
        if (!detailedStats.isolate) detailedStats.isolate = {};
        if (!detailedStats.or) detailedStats.or = {};
        if (!detailedStats.vs3bet) detailedStats.vs3bet = {};
        if (!detailedStats.vsopen) detailedStats.vsopen = {};

        return true;
    } catch (e) {
        console.warn('Fehler beim Laden:', e);
        return false;
    }
}

function resetAllStats() {
    if (!confirm('Alle Stats zurücksetzen? Diese Aktion kann nicht rückgängig gemacht werden.')) {
        return;
    }

    score = { correct: 0, total: 0 };
    evGainTotal = 0;
    evLossTotal = 0;
    mistakes = [];
    detailedStats = { rfi: {}, '3bet': {}, facing3bet: {}, isolate: {}, 'or': {}, 'vs3bet': {}, 'vsopen': {} };
    focusModeActive = false;

    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
        console.warn('LocalStorage nicht verfügbar:', e);
    }

    updateScoreDisplay();
    updateEVDisplay();
    renderWeaknesses();

    // Reset focus mode UI
    const btn = document.getElementById('focus-mode-btn');
    const indicator = document.getElementById('focus-mode-indicator');
    if (btn) {
        btn.classList.remove('active');
        btn.textContent = 'Schwächen trainieren';
    }
    if (indicator) {
        indicator.style.display = 'none';
    }
}

function getWeaknesses(limit = 5) {
    const allWeaknesses = [];

    // Sammle Weaknesses aus allen Modi
    for (const mode of ['rfi', '3bet', 'facing3bet', 'isolate', 'or']) {
        const modeStats = detailedStats[mode];

        for (const [key, stats] of Object.entries(modeStats)) {
            const [spot, handType] = key.split('|');
            const successRate = stats.total > 0 ? stats.correct / stats.total : 1;

            // Nur Spots mit mindestens 3 Versuchen und < 80% Erfolgsrate
            if (stats.total >= 3 && successRate < 0.8) {
                allWeaknesses.push({
                    mode,
                    spot,
                    handType,
                    total: stats.total,
                    correct: stats.correct,
                    successRate,
                    evLost: stats.evLost
                });
            }
        }
    }

    // Sortiere nach Fehlerrate (höchste zuerst)
    return allWeaknesses
        .sort((a, b) => a.successRate - b.successRate)
        .slice(0, limit);
}

function renderWeaknesses() {
    const weaknessesList = document.getElementById('weaknesses-list');
    if (!weaknessesList) return;

    const weaknesses = getWeaknesses(5);

    if (weaknesses.length === 0) {
        const totalPlays = Object.values(detailedStats).reduce((sum, modeStats) =>
            sum + Object.values(modeStats).reduce((s, stat) => s + stat.total, 0), 0);

        if (totalPlays < 10) {
            weaknessesList.innerHTML = '<p class="no-weaknesses">Spiele mehr Hände um Leaks zu identifizieren</p>';
        } else {
            weaknessesList.innerHTML = '<p class="no-weaknesses good">Keine signifikanten Leaks gefunden!</p>';
        }
        return;
    }

    const modeNames = { rfi: 'RFI', '3bet': '3-Bet', facing3bet: 'vs 3-Bet', isolate: 'vs Limp', 'or': 'OR (MTT)' };

    weaknessesList.innerHTML = weaknesses.map(w => {
        const successPercent = Math.round(w.successRate * 100);
        const failPercent = 100 - successPercent;
        const handTypeName = HAND_TYPE_NAMES[w.handType] || w.handType;
        const spotFormatted = w.spot.replace(/_vs_/g, ' vs ');

        return `
            <div class="weakness-item">
                <div class="weakness-header">
                    <span class="weakness-category">${handTypeName}</span>
                    <span class="weakness-rate ${failPercent > 50 ? 'bad' : 'warning'}">${failPercent}% falsch</span>
                </div>
                <div class="weakness-details">
                    <span class="weakness-mode">${modeNames[w.mode]}</span>
                    <span class="weakness-spot">${spotFormatted}</span>
                </div>
                <div class="weakness-stats">
                    <span>${w.correct}/${w.total} richtig</span>
                    <span class="weakness-ev-lost">-${w.evLost} EV</span>
                </div>
            </div>
        `;
    }).join('');
}

function toggleFocusMode() {
    const weaknesses = getWeaknesses(10);

    if (weaknesses.length === 0 && !focusModeActive) {
        alert('Keine Schwachstellen erkannt! Spiele mehr Hände um Leaks zu identifizieren.');
        return;
    }

    focusModeActive = !focusModeActive;

    // Update UI
    const btn = document.getElementById('focus-mode-btn');
    const indicator = document.getElementById('focus-mode-indicator');

    if (focusModeActive) {
        btn.classList.add('active');
        btn.textContent = 'Fokus-Modus beenden';
        indicator.style.display = 'flex';
    } else {
        btn.classList.remove('active');
        btn.textContent = 'Schwächen trainieren';
        indicator.style.display = 'none';
    }

    nextHand();
}

function generateFocusHand() {
    const weaknesses = getWeaknesses(10);

    if (weaknesses.length === 0) {
        // Keine Schwächen mehr - zurück zum normalen Modus
        focusModeActive = false;
        const btn = document.getElementById('focus-mode-btn');
        const indicator = document.getElementById('focus-mode-indicator');
        if (btn) {
            btn.classList.remove('active');
            btn.textContent = 'Schwächen trainieren';
        }
        if (indicator) {
            indicator.style.display = 'none';
        }
        return false;
    }

    // Wähle zufällige Schwäche (gewichtet nach Fehlerrate)
    const totalWeight = weaknesses.reduce((sum, w) => sum + (1 - w.successRate), 0);
    let random = Math.random() * totalWeight;
    let selectedWeakness = weaknesses[0];

    for (const w of weaknesses) {
        random -= (1 - w.successRate);
        if (random <= 0) {
            selectedWeakness = w;
            break;
        }
    }

    // Setze Modus basierend auf Schwäche
    currentMode = selectedWeakness.mode;

    // Parse Spot
    if (selectedWeakness.mode === 'rfi') {
        currentPosition = selectedWeakness.spot;
        currentOpenerPosition = null;
        current3BettorPosition = null;
        currentLimperPosition = null;
    } else if (selectedWeakness.mode === '3bet') {
        const parts = selectedWeakness.spot.split(' vs ');
        currentPosition = parts[0];
        currentOpenerPosition = parts[1] || 'BTN';
        current3BettorPosition = null;
        currentLimperPosition = null;
    } else if (selectedWeakness.mode === 'facing3bet') {
        const parts = selectedWeakness.spot.split(' vs ');
        currentPosition = parts[0];
        current3BettorPosition = parts[1] || 'BB';
        currentOpenerPosition = null;
        currentLimperPosition = null;
    } else if (selectedWeakness.mode === 'isolate') {
        const parts = selectedWeakness.spot.split(' vs ');
        currentPosition = parts[0];
        currentLimperPosition = parts[1] || 'UTG';
        currentOpenerPosition = null;
        current3BettorPosition = null;
    } else if (selectedWeakness.mode === 'or') {
        // Tournament OR mode: spot format is "stacksize|position"
        const parts = selectedWeakness.spot.split('|');
        currentStackSize = parts[0] || '10-20bb';
        currentPosition = parts[1] || 'BTN';
        currentOpenerPosition = null;
        current3BettorPosition = null;
        currentLimperPosition = null;
    }

    // Generiere Hand vom passenden Typ
    const targetHandType = selectedWeakness.handType;
    const targetHands = HAND_TYPES[targetHandType] || [];

    // Versuche eine Hand aus der Kategorie zu generieren
    const maxAttempts = 50;
    for (let i = 0; i < maxAttempts; i++) {
        currentHand = generateHand();
        const handNotation = handToNotation(currentHand);

        if (targetHands.length === 0 || targetHands.includes(handNotation)) {
            return true;
        }
    }

    // Fallback: Wähle direkt eine Hand aus der Kategorie
    if (targetHands.length > 0) {
        const targetNotation = targetHands[Math.floor(Math.random() * targetHands.length)];
        currentHand = notationToHand(targetNotation);
        return true;
    }

    return true;
}

function notationToHand(notation) {
    // Konvertiere Hand-Notation zu Karten-Array
    const rank1 = notation[0];
    const rank2 = notation[1];
    const suited = notation.endsWith('s');
    const isPair = notation.length === 2;

    const suit1 = SUITS[Math.floor(Math.random() * 4)];
    let suit2;

    if (isPair) {
        // Pocket Pair - verschiedene Farben
        const availableSuits = SUITS.filter(s => s !== suit1);
        suit2 = availableSuits[Math.floor(Math.random() * availableSuits.length)];
    } else if (suited) {
        suit2 = suit1;
    } else {
        const availableSuits = SUITS.filter(s => s !== suit1);
        suit2 = availableSuits[Math.floor(Math.random() * availableSuits.length)];
    }

    return [
        { rank: rank1, suit: suit1 },
        { rank: rank2, suit: suit2 }
    ];
}

function updateModeUI() {
    // Update Mode Buttons
    elements.modeBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === currentMode);
    });

    // Show/hide Call button (used as Limp in isolate mode)
    const callBtn = document.querySelector('.action-btn.call');
    const limpBtn = document.querySelector('.action-btn.limp');
    const jamBtn = document.querySelector('.action-btn.jam');

    // Tournament mode: Buttons basierend auf Stacksize und Mode
    if (gameType === 'tournament') {
        if (currentMode === 'vsopen') {
            // vs Open: Fold, Call, 3-Bet (raise), Jam
            if (callBtn) callBtn.style.display = 'inline-block';
            if (limpBtn) limpBtn.style.display = 'none';
            if (jamBtn) jamBtn.style.display = 'inline-block';
        } else if (currentMode === 'vs3bet') {
            // vs 3-Bet: Fold, Call, 4-Bet
            if (callBtn) callBtn.style.display = 'inline-block';
            if (limpBtn) limpBtn.style.display = 'none';
            if (jamBtn) jamBtn.style.display = 'none';
        } else if (currentStackSize === '10-20bb') {
            // 10-20bb OR: Jam sichtbar, Limp nur für SB
            if (callBtn) callBtn.style.display = 'none';
            if (limpBtn) limpBtn.style.display = (currentPosition === 'SB') ? 'inline-block' : 'none';
            if (jamBtn) jamBtn.style.display = 'inline-block';
        } else {
            // 25bb, 100bb OR: Nur Fold + Raise (kein Jam/Limp)
            if (callBtn) callBtn.style.display = 'none';
            if (limpBtn) limpBtn.style.display = 'none';
            if (jamBtn) jamBtn.style.display = 'none';
        }
    } else {
        // Cash Game Modi
        if (currentMode === '3bet' || currentMode === 'facing3bet') {
            if (callBtn) callBtn.style.display = 'inline-block';
            if (limpBtn) limpBtn.style.display = 'none';
            if (jamBtn) jamBtn.style.display = 'none';
        } else if (currentMode === 'isolate') {
            if (callBtn) callBtn.style.display = 'none';
            if (limpBtn) limpBtn.style.display = 'inline-block';
            if (jamBtn) jamBtn.style.display = 'none';
        } else {
            if (callBtn) callBtn.style.display = 'none';
            if (limpBtn) limpBtn.style.display = 'none';
            if (jamBtn) jamBtn.style.display = 'none';
        }
    }

    // Update Raise button text
    const raiseBtn = document.querySelector('.action-btn.raise');
    if (currentMode === 'facing3bet' || currentMode === 'vs3bet') {
        raiseBtn.innerHTML = '4-Bet<span class="shortcut">R</span>';
    } else if (currentMode === 'isolate') {
        raiseBtn.innerHTML = 'Iso-Raise<span class="shortcut">R</span>';
    } else if (currentMode === 'or') {
        raiseBtn.innerHTML = 'Openraise<span class="shortcut">R</span>';
    } else if (currentMode === 'vsopen') {
        raiseBtn.innerHTML = '3-Bet<span class="shortcut">R</span>';
    } else {
        raiseBtn.innerHTML = 'Raise<span class="shortcut">R</span>';
    }

    // Villain-Filter nur in vsopen Mode (Tournament) sichtbar
    const villainGrid = document.getElementById('tournament-villain-grid');
    const villainLabel = document.getElementById('villain-sub-label');
    const heroLabel = document.getElementById('hero-sub-label');
    const showVillain = (gameType === 'tournament' && currentMode === 'vsopen');
    if (villainGrid) villainGrid.style.display = showVillain ? 'grid' : 'none';
    if (villainLabel) villainLabel.style.display = showVillain ? 'block' : 'none';
    if (heroLabel) heroLabel.style.display = showVillain ? 'block' : 'none';

    // Verfügbarkeit der Hero/Villain-Checkboxes koppeln (vsopen Mode)
    updateVillainAvailability();
    updateHeroAvailability();
}

function renderScenarioText() {
    if (currentMode === 'rfi') {
        elements.scenarioText.innerHTML = `Alle vor dir haben <strong>gefoldet</strong>.<br>Was machst du?`;
    } else if (currentMode === '3bet') {
        elements.scenarioText.innerHTML = `<strong>${currentOpenerPosition}</strong> hat geraised.<br>Was machst du?`;
    } else if (currentMode === 'facing3bet') {
        elements.scenarioText.innerHTML = `Du hast aus <strong>${currentPosition}</strong> geraised.<br><strong>${current3BettorPosition}</strong> 3-bettet. Was machst du?`;
    } else if (currentMode === 'isolate') {
        elements.scenarioText.innerHTML = `<strong>${currentLimperPosition}</strong> hat gelimpt.<br>Was machst du?`;
    }
}

// DOM Elements
const elements = {};

function init() {
    // Cache DOM elements
    elements.cards = document.querySelector('.cards');
    elements.heroCards = document.getElementById('hero-cards');
    elements.seatsContainer = document.getElementById('seats-container');
    elements.scenarioInfo = document.getElementById('scenario-info');
    elements.potDisplay = document.getElementById('pot-display');
    elements.positionBadge = document.querySelector('.position-badge');
    elements.scenarioText = document.querySelector('.scenario-text');
    elements.feedback = document.querySelector('.feedback');
    elements.feedbackIcon = document.querySelector('.feedback-icon');
    elements.feedbackText = document.querySelector('.feedback-text');
    elements.correctAnswer = document.querySelector('.correct-answer');
    elements.nextBtn = document.querySelector('.next-btn');
    elements.actionBtns = document.querySelectorAll('.action-btn');
    elements.modeBtns = document.querySelectorAll('.mode-btn');
    elements.scoreCorrect = document.getElementById('score-correct');
    elements.scoreTotal = document.getElementById('score-total');
    elements.scorePercent = document.getElementById('score-percent');
    elements.callBtn = document.querySelector('.action-btn.call');
    elements.settingsPanel = document.querySelector('.settings-panel');
    elements.settingsToggle = document.querySelector('.settings-toggle button');
    elements.cashPositionsGrid = document.getElementById('cash-positions-grid');
    elements.tournamentPositionsGrid = document.getElementById('tournament-positions-grid');
    elements.evPer100 = document.getElementById('ev-per-100');
    elements.evRating = document.getElementById('ev-rating');
    elements.evGain = document.getElementById('ev-gain');
    elements.evLoss = document.getElementById('ev-loss');
    elements.mistakesList = document.getElementById('mistakes-list');
    elements.rangeGrid = document.getElementById('range-grid');
    elements.rangeSpoiler = document.getElementById('range-spoiler');
    elements.rangeInfo = document.getElementById('range-info');
    elements.rangeLegend = document.getElementById('range-legend');
    elements.rangeModeToggle = document.getElementById('range-mode-toggle');

    // Event Listeners
    elements.modeBtns.forEach(btn => {
        btn.addEventListener('click', () => setMode(btn.dataset.mode));
    });

    elements.actionBtns.forEach(btn => {
        btn.addEventListener('click', () => handleAction(btn.dataset.action));
    });

    elements.nextBtn.addEventListener('click', nextHand);

    // Settings toggle (optional - may not exist in new UI)
    if (elements.settingsToggle) {
        elements.settingsToggle.addEventListener('click', toggleSettings);
    }

    // Position filter listeners (Cash) - both sidebar and legacy
    document.querySelectorAll('.cash-pos').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            // Sync sidebar with legacy checkboxes
            syncPositionCheckboxes('cash', e.target.value, e.target.checked);
            updateActivePositions();
        });
    });

    // Position filter listeners (Tournament) - both sidebar and legacy
    document.querySelectorAll('.tournament-pos').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            // Sync sidebar with legacy checkboxes
            syncPositionCheckboxes('tournament', e.target.value, e.target.checked);
            updateActiveTournamentPositions();
            updateVillainAvailability();
        });
    });

    // Villain position filter listeners (vsopen Mode)
    document.querySelectorAll('.tournament-villain-pos').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            updateActiveVillainPositions();
            updateHeroAvailability();
        });
    });

    // Game Type Toggle listeners
    document.querySelectorAll('.game-type-btn').forEach(btn => {
        btn.addEventListener('click', () => setGameType(btn.dataset.type));
    });

    // Stacksize Selector listeners (legacy)
    document.querySelectorAll('.stacksize-btn').forEach(btn => {
        btn.addEventListener('click', () => setStackSize(btn.dataset.stack));
    });

    // Sidebar Mode Selector listeners
    document.querySelectorAll('.sidebar-mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            setMode(btn.dataset.mode);
            // Update active state
            document.querySelectorAll('.sidebar-mode-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Sidebar Stacksize Selector listeners
    document.querySelectorAll('.sidebar-stacksize-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            setStackSize(btn.dataset.stack);
            // Update active state
            document.querySelectorAll('.sidebar-stacksize-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboard);

    // Sidebar Toggle
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const mainLayout = document.querySelector('.main-layout');
    if (sidebarToggle && mainLayout) {
        // Restore saved state
        const savedHidden = localStorage.getItem('sidebar-hidden') === 'true';
        if (savedHidden) mainLayout.classList.add('sidebar-hidden');

        sidebarToggle.addEventListener('click', () => {
            const hidden = mainLayout.classList.toggle('sidebar-hidden');
            try {
                localStorage.setItem('sidebar-hidden', hidden ? 'true' : 'false');
            } catch (e) {}
        });
    }

    // Range viewer toggle
    elements.rangeModeToggle.addEventListener('change', (e) => {
        equityMode = e.target.checked;
        elements.rangeLegend.classList.toggle('equity-mode', equityMode);
        if (rangeRevealed) {
            renderRangeViewer();
        }
    });

    // Initialize range grid
    initRangeGrid();

    // Load saved stats from localStorage
    const hasData = loadFromLocalStorage();
    if (hasData) {
        updateScoreDisplay();
        updateEVDisplay();
        renderWeaknesses();
        console.log('Stats geladen:', score.total, 'Hände gespielt');
    } else {
        renderWeaknesses();
    }

    // Initialize game type UI (default is tournament)
    updateModeButtons();
    updateModeUI();
    if (gameType === 'tournament') {
        updateActiveTournamentPositions();
        updateActiveVillainPositions();
        // Show tournament position filters, hide cash (legacy)
        document.getElementById('cash-positions').style.display = 'none';
        document.getElementById('tournament-positions').style.display = 'flex';
        // Show tournament position filters, hide cash (sidebar)
        if (elements.cashPositionsGrid) elements.cashPositionsGrid.style.display = 'none';
        if (elements.tournamentPositionsGrid) elements.tournamentPositionsGrid.style.display = 'grid';
    } else {
        // Show cash position filters, hide tournament (sidebar)
        if (elements.cashPositionsGrid) elements.cashPositionsGrid.style.display = 'grid';
        if (elements.tournamentPositionsGrid) elements.tournamentPositionsGrid.style.display = 'none';
    }

    // Start
    nextHand();
}

function setMode(mode) {
    currentMode = mode;
    elements.modeBtns = document.querySelectorAll('.mode-btn');
    elements.modeBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    // Show/hide Call, Limp and Jam buttons based on mode
    const limpBtn = document.querySelector('.action-btn.limp');
    const callBtn = document.querySelector('.action-btn.call');
    const jamBtn = document.querySelector('.action-btn.jam');

    // Tournament mode: Buttons basierend auf Stacksize und Mode
    if (gameType === 'tournament') {
        if (currentMode === 'vsopen') {
            // vs Open: Fold, Call, 3-Bet (raise), Jam
            if (callBtn) callBtn.style.display = 'inline-block';
            if (limpBtn) limpBtn.style.display = 'none';
            if (jamBtn) jamBtn.style.display = 'inline-block';
        } else if (currentMode === 'vs3bet') {
            // vs 3-Bet: Fold, Call, 4-Bet
            if (callBtn) callBtn.style.display = 'inline-block';
            if (limpBtn) limpBtn.style.display = 'none';
            if (jamBtn) jamBtn.style.display = 'none';
        } else if (currentStackSize === '10-20bb') {
            // 10-20bb OR: Jam sichtbar, Limp nur für SB
            if (callBtn) callBtn.style.display = 'none';
            if (limpBtn) limpBtn.style.display = (currentPosition === 'SB') ? 'inline-block' : 'none';
            if (jamBtn) jamBtn.style.display = 'inline-block';
        } else {
            // 25bb, 100bb OR: Nur Fold + Raise (kein Jam/Limp)
            if (callBtn) callBtn.style.display = 'none';
            if (limpBtn) limpBtn.style.display = 'none';
            if (jamBtn) jamBtn.style.display = 'none';
        }
    } else {
        // Cash Game Modi
        if (mode === '3bet' || mode === 'facing3bet') {
            if (callBtn) callBtn.style.display = 'inline-block';
            if (limpBtn) limpBtn.style.display = 'none';
            if (jamBtn) jamBtn.style.display = 'none';
        } else if (mode === 'isolate') {
            if (callBtn) callBtn.style.display = 'none';
            if (limpBtn) limpBtn.style.display = 'inline-block';
            if (jamBtn) jamBtn.style.display = 'none';
        } else {
            if (callBtn) callBtn.style.display = 'none';
            if (limpBtn) limpBtn.style.display = 'none';
            if (jamBtn) jamBtn.style.display = 'none';
        }
    }

    // Update Raise button text based on mode
    const raiseBtn = document.querySelector('.action-btn.raise');
    if (mode === 'facing3bet' || mode === 'vs3bet') {
        raiseBtn.innerHTML = '4-Bet<span class="shortcut">R</span>';
    } else if (mode === 'isolate') {
        raiseBtn.innerHTML = 'Iso-Raise<span class="shortcut">R</span>';
    } else if (mode === 'or') {
        raiseBtn.innerHTML = 'Openraise<span class="shortcut">R</span>';
    } else if (mode === 'vsopen') {
        raiseBtn.innerHTML = '3-Bet<span class="shortcut">R</span>';
    } else {
        raiseBtn.innerHTML = 'Raise<span class="shortcut">R</span>';
    }

    // Reset score and EV when changing mode
    score = { correct: 0, total: 0 };
    evGainTotal = 0;
    evLossTotal = 0;
    mistakes = [];
    updateScoreDisplay();
    updateEVDisplay();

    nextHand();
}

function toggleSettings() {
    if (elements.settingsPanel) {
        elements.settingsPanel.classList.toggle('show');
    }
}

// Toggle collapsible sidebar sections
function toggleSidebarSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.toggle('collapsed');
    }
}

// Make function globally available
window.toggleSidebarSection = toggleSidebarSection;

// Toggle EV section
function toggleEVSection() {
    const section = document.getElementById('ev-section');
    if (section) {
        section.classList.toggle('collapsed');
    }
}
window.toggleEVSection = toggleEVSection;

function setGameType(type) {
    gameType = type;

    // Update UI
    document.querySelectorAll('.game-type-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.type === type);
    });

    // Update subtitle
    const subtitle = document.getElementById('game-subtitle');
    if (type === 'cash') {
        subtitle.textContent = '6-Max No-Limit Hold\'em';
    } else {
        subtitle.textContent = 'Tournament Full-Ring (9-Max)';
    }

    // Show/hide stacksize selector (legacy)
    const stacksizeSelector = document.getElementById('stacksize-selector');
    if (stacksizeSelector) {
        if (type === 'tournament') {
            stacksizeSelector.style.display = 'inline-flex';
        } else {
            stacksizeSelector.style.display = 'none';
        }
    }

    // Show/hide stacksize section (sidebar)
    const stacksizeSection = document.getElementById('stacksize-section');
    if (stacksizeSection) {
        if (type === 'tournament') {
            stacksizeSection.style.display = 'block';
        } else {
            stacksizeSection.style.display = 'none';
        }
    }

    // Show/hide position filters (legacy)
    const cashPositions = document.getElementById('cash-positions');
    const tournamentPositions = document.getElementById('tournament-positions');
    if (type === 'tournament') {
        cashPositions.style.display = 'none';
        tournamentPositions.style.display = 'flex';
    } else {
        cashPositions.style.display = 'flex';
        tournamentPositions.style.display = 'none';
    }

    // Show/hide position filters (sidebar)
    const cashPositionsGrid = document.getElementById('cash-positions-grid');
    const tournamentPositionsGrid = document.getElementById('tournament-positions-grid');
    if (cashPositionsGrid && tournamentPositionsGrid) {
        if (type === 'tournament') {
            cashPositionsGrid.style.display = 'none';
            tournamentPositionsGrid.style.display = 'grid';
        } else {
            cashPositionsGrid.style.display = 'grid';
            tournamentPositionsGrid.style.display = 'none';
        }
    }

    // Update mode buttons
    updateModeButtons();

    // Set default mode for game type
    if (type === 'tournament') {
        currentMode = 'or';
        updateActiveTournamentPositions();
    } else {
        currentMode = 'rfi';
        updateActivePositions();
    }

    // Update action buttons (Jam visible in tournament mode)
    updateModeUI();

    // Reset scores for new game type
    score = { correct: 0, total: 0 };
    evGainTotal = 0;
    evLossTotal = 0;
    mistakes = [];
    updateScoreDisplay();
    updateEVDisplay();

    nextHand();
}

function setStackSize(stack) {
    currentStackSize = stack;

    // Update UI
    document.querySelectorAll('.stacksize-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.stack === stack);
    });

    // Setze Modus passend zu Stack (manche Modi sind nicht für alle Stacks verfügbar)
    if (stack === '10-20bb' && (currentMode === 'vs3bet' || currentMode === 'vsopen')) {
        currentMode = 'or';
    } else if (stack === '20-30bb') {
        // 20-30bb: OR + vsOpen. Keep current if valid, else default to vsopen
        if (currentMode !== 'or' && currentMode !== 'vsopen') {
            currentMode = 'vsopen';
        }
    } else if ((stack === '25bb' || stack === '100bb') && currentMode === 'vsopen') {
        // vsOpen aktuell nur bei 20-30bb
        currentMode = 'or';
    }

    // Update mode buttons (jetzt mit korrektem currentMode für active-State)
    updateModeButtons();

    // Update action buttons
    updateModeUI();

    // Reset scores
    score = { correct: 0, total: 0 };
    evGainTotal = 0;
    evLossTotal = 0;
    mistakes = [];
    updateScoreDisplay();
    updateEVDisplay();

    nextHand();
}

function updateModeButtons() {
    const modeSelector = document.querySelector('.mode-selector');
    const sidebarModeSelector = document.getElementById('sidebar-mode-selector');

    if (gameType === 'cash') {
        // Cash Game Modi
        if (modeSelector) {
            modeSelector.innerHTML = `
                <button class="mode-btn active" data-mode="rfi">RFI</button>
                <button class="mode-btn" data-mode="3bet">3-Bet</button>
                <button class="mode-btn" data-mode="facing3bet">vs 3-Bet</button>
                <button class="mode-btn" data-mode="isolate">vs Limp</button>
            `;
        }
        if (sidebarModeSelector) {
            sidebarModeSelector.innerHTML = `
                <button class="sidebar-mode-btn active" data-mode="rfi">RFI (Openraise)</button>
                <button class="sidebar-mode-btn" data-mode="3bet">3-Bet</button>
                <button class="sidebar-mode-btn" data-mode="facing3bet">vs 3-Bet</button>
                <button class="sidebar-mode-btn" data-mode="isolate">vs Limp</button>
            `;
        }
    } else {
        // Tournament Modi
        if (currentStackSize === '20-30bb') {
            // 20-30bb: OR + vs Open (Flat/3-Bet vs Opener)
            const orActive = currentMode === 'or' ? 'active' : '';
            const vsopenActive = currentMode === 'vsopen' || currentMode !== 'or' ? 'active' : '';
            if (modeSelector) {
                modeSelector.innerHTML = `
                    <button class="mode-btn ${orActive}" data-mode="or">OR</button>
                    <button class="mode-btn ${vsopenActive}" data-mode="vsopen">vs Open</button>
                `;
            }
            if (sidebarModeSelector) {
                sidebarModeSelector.innerHTML = `
                    <button class="sidebar-mode-btn ${orActive}" data-mode="or">OR (Openraise)</button>
                    <button class="sidebar-mode-btn ${vsopenActive}" data-mode="vsopen">vs Open (Flat/3-Bet)</button>
                `;
            }
        } else if (currentStackSize === '10-20bb') {
            if (modeSelector) {
                modeSelector.innerHTML = `
                    <button class="mode-btn active" data-mode="or">OR</button>
                `;
            }
            if (sidebarModeSelector) {
                sidebarModeSelector.innerHTML = `
                    <button class="sidebar-mode-btn active" data-mode="or">OR (Openraise)</button>
                `;
            }
        } else {
            // 25bb und 100bb: OR + vs 3-Bet
            if (modeSelector) {
                modeSelector.innerHTML = `
                    <button class="mode-btn active" data-mode="or">OR</button>
                    <button class="mode-btn" data-mode="vs3bet">vs 3-Bet</button>
                `;
            }
            if (sidebarModeSelector) {
                sidebarModeSelector.innerHTML = `
                    <button class="sidebar-mode-btn active" data-mode="or">OR (Openraise)</button>
                    <button class="sidebar-mode-btn" data-mode="vs3bet">vs 3-Bet</button>
                `;
            }
        }
    }

    // Re-attach event listeners (legacy)
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', () => setMode(btn.dataset.mode));
    });
    elements.modeBtns = document.querySelectorAll('.mode-btn');

    // Re-attach event listeners (sidebar)
    document.querySelectorAll('.sidebar-mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            setMode(btn.dataset.mode);
            document.querySelectorAll('.sidebar-mode-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

function updateActiveTournamentPositions() {
    activeTournamentPositions = [];
    document.querySelectorAll('.tournament-pos:checked').forEach(checkbox => {
        activeTournamentPositions.push(checkbox.value);
    });

    // Mindestens eine Position muss aktiv sein
    if (activeTournamentPositions.length === 0) {
        activeTournamentPositions = ['BTN'];
        document.querySelector('.tournament-pos[value="BTN"]').checked = true;
    }
}

function updateActiveVillainPositions() {
    activeVillainPositions = [];
    document.querySelectorAll('.tournament-villain-pos:checked').forEach(checkbox => {
        activeVillainPositions.push(checkbox.value);
    });

    // Mindestens ein Villain muss aktiv sein
    if (activeVillainPositions.length === 0) {
        activeVillainPositions = ['UTG'];
        const fallback = document.querySelector('.tournament-villain-pos[value="UTG"]');
        if (fallback) fallback.checked = true;
    }
}

// Graut Villain-Checkboxes aus, für die kein aktiver Hero einen Datensatz hat.
// Disabled-State erhält den Checked-Zustand des Users, damit beim Re-Aktivieren
// der vorige Filter wiederhergestellt ist.
function updateVillainAvailability() {
    const villainCheckboxes = document.querySelectorAll('.tournament-villain-pos');
    if (!villainCheckboxes.length) return;

    const inVsOpen = (gameType === 'tournament' && currentMode === 'vsopen');
    if (!inVsOpen) {
        villainCheckboxes.forEach(cb => { cb.disabled = false; });
        return;
    }

    // vsopen läuft immer im 20-30bb Bracket – 25 als kanonischer Lookup
    const validVillains = (typeof getValidVillainsForHeroes === 'function')
        ? getValidVillainsForHeroes(activeTournamentPositions, 25)
        : [];

    villainCheckboxes.forEach(cb => {
        cb.disabled = !validVillains.includes(cb.value);
    });
}

// Symmetrisch: Graut Hero-Checkboxes aus, für die kein aktiver Villain einen Datensatz hat.
// Nur in vsopen Mode aktiv – in anderen Modi werden alle Hero-Positionen genutzt.
function updateHeroAvailability() {
    const heroCheckboxes = document.querySelectorAll('.tournament-pos');
    if (!heroCheckboxes.length) return;

    const inVsOpen = (gameType === 'tournament' && currentMode === 'vsopen');
    if (!inVsOpen) {
        heroCheckboxes.forEach(cb => { cb.disabled = false; });
        return;
    }

    const validHeroes = (typeof getValidHeroesForVillains === 'function')
        ? getValidHeroesForVillains(activeVillainPositions, 25)
        : [];

    heroCheckboxes.forEach(cb => {
        cb.disabled = !validHeroes.includes(cb.value);
    });
}

// Sync sidebar and legacy position checkboxes
function syncPositionCheckboxes(type, position, checked) {
    const prefix = type === 'tournament' ? 'tpos' : 'pos';
    const sidebarPrefix = type === 'tournament' ? 'sidebar-tpos' : 'sidebar-pos';

    // Map position values to lowercase IDs
    const posMap = {
        'UTG': 'utg', 'UTG1': 'utg1', 'UTG2': 'utg2', 'MP': 'mp',
        'HJ': 'hj', 'CO': 'co', 'BTN': 'btn', 'SB': 'sb', 'BB': 'bb'
    };
    const posId = posMap[position] || position.toLowerCase();

    // Sync legacy checkbox
    const legacyCheckbox = document.getElementById(`${prefix}-${posId}`);
    if (legacyCheckbox && legacyCheckbox.checked !== checked) {
        legacyCheckbox.checked = checked;
    }

    // Sync sidebar checkbox
    const sidebarCheckbox = document.getElementById(`${sidebarPrefix}-${posId}`);
    if (sidebarCheckbox && sidebarCheckbox.checked !== checked) {
        sidebarCheckbox.checked = checked;
    }
}

function updateActivePositions() {
    activePositions = [];
    document.querySelectorAll('.cash-pos:checked').forEach(checkbox => {
        activePositions.push(checkbox.value);
    });

    // Mindestens eine Position muss aktiv sein
    if (activePositions.length === 0) {
        activePositions = ['BTN'];
        document.querySelector('.cash-pos[value="BTN"]').checked = true;
    }
}

function generateHand() {
    // Zwei zufällige Karten generieren
    const deck = [];
    for (const rank of RANKS) {
        for (const suit of SUITS) {
            deck.push({ rank, suit });
        }
    }

    // Shuffle und zwei Karten ziehen
    const shuffled = deck.sort(() => Math.random() - 0.5);
    return [shuffled[0], shuffled[1]];
}

function handToNotation(hand) {
    const [card1, card2] = hand;
    const rank1 = card1.rank;
    const rank2 = card2.rank;
    const suited = card1.suit === card2.suit;

    // Sortieren nach Rank (höhere zuerst)
    const idx1 = RANKS.indexOf(rank1);
    const idx2 = RANKS.indexOf(rank2);

    let notation;
    if (rank1 === rank2) {
        // Pocket Pair
        notation = rank1 + rank2;
    } else if (idx1 < idx2) {
        notation = rank1 + rank2 + (suited ? 's' : 'o');
    } else {
        notation = rank2 + rank1 + (suited ? 's' : 'o');
    }

    return notation;
}

function getRandomPosition(exclude = []) {
    const available = activePositions.filter(p => !exclude.includes(p));
    return available[Math.floor(Math.random() * available.length)];
}

function getValidOpenerPositions(heroPosition) {
    // Opener muss VOR dem Hero sein
    const posOrder = ['UTG', 'HJ', 'CO', 'BTN', 'SB', 'BB'];
    const heroIdx = posOrder.indexOf(heroPosition);
    return posOrder.slice(0, heroIdx).filter(p => activePositions.includes(p));
}

// Range Viewer Functions
function initRangeGrid() {
    const ranks = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
    let html = '';

    for (let row = 0; row < 13; row++) {
        for (let col = 0; col < 13; col++) {
            let hand;
            if (row === col) {
                // Pocket Pair (diagonal)
                hand = ranks[row] + ranks[col];
            } else if (col > row) {
                // Suited (above diagonal)
                hand = ranks[row] + ranks[col] + 's';
            } else {
                // Offsuit (below diagonal)
                hand = ranks[col] + ranks[row] + 'o';
            }
            html += `<div class="range-cell" data-hand="${hand}">${hand}</div>`;
        }
    }

    elements.rangeGrid.innerHTML = html;
}

function renderRangeViewer() {
    const handNotation = currentHand ? handToNotation(currentHand) : null;

    // Get current range based on mode
    let range = null;
    let rangeLabel = '';
    let isFourBetRange = false;
    let isIsoRange = false;

    if (currentMode === 'vs3bet') {
        // Tournament vs 3-Bet mode
        range = getTournamentVs3BetRange(currentStackSize, currentPosition);
        rangeLabel = `vs 3-Bet: ${currentPosition} (${currentStackBB}bb)`;
        isFourBetRange = true;
    } else if (currentMode === 'vsopen') {
        // Tournament vs Open mode
        range = getTournamentFacingOpenRange(currentPosition, currentOpenerPosition, currentStackBB, currentOpenSize, currentBlindsWeak);
        const sizeLabel = Number.isInteger(currentOpenSize) ? `${currentOpenSize}.0bb` : `${currentOpenSize}bb`;
        const weakNote = currentBlindsWeak ? ', Blinds weak' : '';
        rangeLabel = `vs ${currentOpenerPosition} Open (${sizeLabel}${weakNote}): ${currentPosition} (${currentStackBB}bb)`;
    } else if (currentMode === 'or') {
        // Tournament OR mode - spezielle Behandlung
        range = getTournamentOpenRange(currentStackSize, currentPosition);
        rangeLabel = `OR Range: ${currentPosition} (${currentStackBB}bb)`;
        // Markiere als Tournament-Range für spezielle Darstellung
        range._isTournamentOR = true;
    } else if (currentMode === 'rfi') {
        range = RFI_RANGES[currentPosition];
        rangeLabel = `RFI Range: ${currentPosition}`;
    } else if (currentMode === 'facing3bet' && current3BettorPosition) {
        const key = `${currentPosition}_vs_${current3BettorPosition}_3bet`;
        range = FACING_3BET_RANGES[key];
        rangeLabel = `vs 3-Bet: ${currentPosition} vs ${current3BettorPosition}`;
        isFourBetRange = true;
    } else if (currentMode === 'isolate' && currentLimperPosition) {
        const key = `${currentPosition}_vs_${currentLimperPosition}_limp`;
        range = ISO_RAISE_RANGES[key];
        rangeLabel = `Iso-Raise: ${currentPosition} vs ${currentLimperPosition} Limp`;
        isIsoRange = true;
    } else if (currentOpenerPosition) {
        const key = `${currentPosition}_vs_${currentOpenerPosition}`;
        range = THREEBET_RANGES[key];
        rangeLabel = `3-Bet Range: ${currentPosition} vs ${currentOpenerPosition}`;
    }

    elements.rangeInfo.textContent = rangeLabel;

    // Update each cell
    const cells = elements.rangeGrid.querySelectorAll('.range-cell');
    cells.forEach(cell => {
        const cellHand = cell.dataset.hand;

        // Remove old classes
        cell.classList.remove('raise', 'call', 'fold', 'mixed', 'limp', 'jam', 'current-hand',
            'equity-90', 'equity-80', 'equity-70', 'equity-60', 'equity-50',
            'equity-40', 'equity-30', 'equity-20', 'equity-10');
        cell.style.background = ''; // Reset inline style for mixed

        // Mark current hand
        if (cellHand === handNotation) {
            cell.classList.add('current-hand');
        }

        if (equityMode) {
            // Equity-based coloring
            const value = getHandValue(cellHand);
            const bucket = Math.min(90, Math.max(10, Math.floor(value / 10) * 10));
            cell.classList.add(`equity-${bucket}`);
        } else {
            // Action-based coloring
            if (range) {
                // Check for mixed first
                let isMixed = false;
                if (range.mixed) {
                    const mixedHand = range.mixed.find(m => m.hand === cellHand);
                    if (mixedHand) {
                        isMixed = true;
                        cell.classList.add('mixed');
                        // Set gradient based on ratio (fourbet or raise depending on mode)
                        const raisePercent = (mixedHand.fourbet || mixedHand.raise || mixedHand.limp || 0) * 100;
                        cell.style.background = `linear-gradient(135deg,
                            rgba(76,175,80,0.8) 0%,
                            rgba(76,175,80,0.8) ${raisePercent}%,
                            rgba(33,150,243,0.8) ${raisePercent}%,
                            rgba(33,150,243,0.8) 100%)`;
                    }
                }

                if (!isMixed) {
                    // Tournament OR mode - spezielle Behandlung
                    if (range._isTournamentOR) {
                        // Bestimme korrekte Aktion basierend auf currentStackBB
                        const action = getTournamentORAction(cellHand, currentPosition, currentStackBB, currentStackSize);
                        if (action === 'openraise') {
                            cell.classList.add('raise');
                        } else if (action === 'jam') {
                            cell.classList.add('jam');
                        } else {
                            cell.classList.add('fold');
                        }
                    } else if (range._isFacingOpen) {
                        const action = getTournamentFacingOpenAction(cellHand, range.heroPosition, range.openerPosition, range.stackBB, range.openSizeBB, range.blindsWeak);
                        if (action === 'jam') {
                            cell.classList.add('jam');
                        } else if (action === 'raise') {
                            cell.classList.add('raise');
                        } else if (action === 'call') {
                            cell.classList.add('call');
                        } else {
                            cell.classList.add('fold');
                        }
                    } else {
                        // Check for raise (3-bet mode) or fourbet (facing 3-bet mode)
                        const raiseHands = isFourBetRange ? range.fourbet : range.raise;
                        if (raiseHands && raiseHands.includes(cellHand)) {
                            cell.classList.add('raise');
                        } else if (range.call && range.call.includes(cellHand)) {
                            cell.classList.add('call');
                        } else if (isIsoRange && range.limp && range.limp.includes(cellHand)) {
                            cell.classList.add('limp');
                        } else {
                            cell.classList.add('fold');
                        }
                    }
                }
            } else {
                cell.classList.add('fold');
            }
        }
    });
}

function showRangeViewer() {
    rangeRevealed = true;
    elements.rangeSpoiler.classList.add('hidden');
    renderRangeViewer();
}

function hideRangeViewer() {
    rangeRevealed = false;
    elements.rangeSpoiler.classList.remove('hidden');
    elements.rangeInfo.textContent = '-';
}

function getHandValue(handNotation) {
    // Direkter Lookup oder geschätzter Wert für nicht-gelistete Hände
    if (HAND_BASE_VALUES[handNotation]) {
        return HAND_BASE_VALUES[handNotation];
    }

    // Schätze Wert für andere Hände basierend auf Struktur
    const rank1 = handNotation[0];
    const rank2 = handNotation[1];
    const suited = handNotation.endsWith('s');

    const rankValues = { 'A': 14, 'K': 13, 'Q': 12, 'J': 11, 'T': 10,
                         '9': 9, '8': 8, '7': 7, '6': 6, '5': 5, '4': 4, '3': 3, '2': 2 };

    let value = rankValues[rank1] + rankValues[rank2];
    if (suited) value += 8;  // Suited Bonus
    if (rank1 === rank2) value += 15;  // Pair Bonus

    // Connectedness Bonus
    const gap = Math.abs(rankValues[rank1] - rankValues[rank2]);
    if (gap === 1) value += 5;
    else if (gap === 2) value += 3;

    // Normalisieren auf 0-100 Skala (min ~4, max ~43 vor Normalisierung)
    return Math.min(100, Math.max(5, Math.round((value - 4) * 2.5)));
}

function calculateEVGain(handNotation, correctAction) {
    const handValue = getHandValue(handNotation);
    let evGain = 0;

    // EV-Gain für richtige Entscheidungen
    if (correctAction === 'raise') {
        // Premium richtig geraised = Value generiert
        evGain = handValue;
    } else if (correctAction === 'jam') {
        // Richtig gejammt = Value generiert (etwas höher weil mehr Fold Equity)
        evGain = Math.round(handValue * 1.1);
    } else if (correctAction === 'fold') {
        // Trash richtig gefoldet = Verlust vermieden
        evGain = 100 - handValue;
    } else if (correctAction === 'call') {
        // Richtig gecallt = moderater Gain
        evGain = Math.round(handValue * 0.7);
    } else if (correctAction === 'limp') {
        // Richtig gelimpt = moderater Gain (marginale Hände im Pot halten)
        evGain = Math.round(handValue * 0.5);
    }

    evGainTotal += evGain;
    return evGain;
}

function calculateEVLoss(handNotation, userAction, correctAction, position, openerPosition) {
    const handValue = getHandValue(handNotation);
    let evLoss = 0;

    // Korrekte EV-Loss Berechnung
    if (correctAction === 'raise' && userAction === 'fold') {
        // Premium gefoldet = Verlust des Hand-Werts
        evLoss = handValue;
    } else if (correctAction === 'fold' && userAction === 'raise') {
        // Trash geraised = je schlechter die Hand, desto größer der Fehler
        evLoss = 100 - handValue;
    } else if (correctAction === 'call' && userAction === 'fold') {
        // Call gefoldet = Verlust des Hand-Werts (etwas reduziert)
        evLoss = Math.round(handValue * 0.7);
    } else if (correctAction === 'call' && userAction === 'raise') {
        // Call zu Raise = zu aggressiv, moderater Fehler
        evLoss = Math.round((100 - handValue) * 0.4);
    } else if (correctAction === 'raise' && userAction === 'call') {
        // Raise zu Call = zu passiv, verliert Value
        evLoss = Math.round(handValue * 0.4);
    } else if (correctAction === 'fold' && userAction === 'call') {
        // Fold zu Call = Trash gecallt
        evLoss = Math.round((100 - handValue) * 0.7);
    }
    // Limp-spezifische Fehler (für Isolate-Modus)
    else if (correctAction === 'limp' && userAction === 'fold') {
        // Limp-behind gefoldet = moderater Verlust
        evLoss = Math.round(handValue * 0.5);
    } else if (correctAction === 'limp' && userAction === 'raise') {
        // Limp-behind zu Raise = zu aggressiv mit marginaler Hand
        evLoss = Math.round((100 - handValue) * 0.5);
    } else if (correctAction === 'raise' && userAction === 'limp') {
        // Iso-raise zu Limp = Value verschenkt
        evLoss = Math.round(handValue * 0.5);
    } else if (correctAction === 'fold' && userAction === 'limp') {
        // Fold zu Limp = Trash gelimpt
        evLoss = Math.round((100 - handValue) * 0.5);
    }
    // Jam-spezifische Fehler (für Tournament OR-Modus)
    else if (correctAction === 'jam' && userAction === 'fold') {
        // Jam-Hand gefoldet = großer Verlust
        evLoss = Math.round(handValue * 0.9);
    } else if (correctAction === 'jam' && userAction === 'raise') {
        // Jam zu Raise = falsche Sizing, aber Hand richtig gespielt
        evLoss = Math.round(handValue * 0.3);
    } else if (correctAction === 'raise' && userAction === 'jam') {
        // Raise zu Jam = zu aggressiv, ICM-Fehler
        evLoss = Math.round((100 - handValue) * 0.4);
    } else if (correctAction === 'fold' && userAction === 'jam') {
        // Fold zu Jam = großer Fehler
        evLoss = 100 - handValue;
    }

    evLoss = Math.max(5, evLoss); // Minimum 5 EV-Loss pro Fehler

    // Fehler speichern
    mistakes.push({
        hand: handNotation,
        position: position,
        openerPosition: openerPosition,
        userAction: userAction,
        correctAction: correctAction,
        evLoss: evLoss
    });

    // Sortiere nach EV-Loss (höchste zuerst), behalte max 10
    mistakes.sort((a, b) => b.evLoss - a.evLoss);
    if (mistakes.length > 10) {
        mistakes = mistakes.slice(0, 10);
    }

    evLossTotal += evLoss;
    return evLoss;
}

function updateEVDisplay() {
    // Net EV berechnen
    const netEV = evGainTotal - evLossTotal;
    const netEVPer100 = score.total > 0 ? (netEV / score.total) * 100 : 0;

    // Net EV /100h anzeigen
    const sign = netEVPer100 >= 0 ? '+' : '';
    elements.evPer100.textContent = sign + netEVPer100.toFixed(0);
    elements.evPer100.className = 'ev-metric-value ' + (netEVPer100 >= 0 ? 'ev-positive' : 'ev-negative');

    // Bewertung basierend auf Net EV/100h
    let rating = '';
    let ratingClass = '';
    if (score.total >= 5) {
        if (netEVPer100 >= 6000) {
            rating = 'Perfekt';
            ratingClass = 'rating-excellent';
        } else if (netEVPer100 >= 4000) {
            rating = 'Sehr gut';
            ratingClass = 'rating-excellent';
        } else if (netEVPer100 >= 2000) {
            rating = 'Solide';
            ratingClass = 'rating-good';
        } else if (netEVPer100 >= 0) {
            rating = 'Ausbaufähig';
            ratingClass = 'rating-medium';
        } else {
            rating = 'Negativ';
            ratingClass = 'rating-bad';
        }
    }
    elements.evRating.textContent = rating;
    elements.evRating.className = 'ev-rating ' + ratingClass;

    // Gains und Losses anzeigen
    elements.evGain.textContent = '+' + evGainTotal;
    elements.evLoss.textContent = '-' + evLossTotal;

    // Fehler-Liste aktualisieren
    const actionNames = { fold: 'Fold', call: 'Call', raise: 'Raise', limp: 'Limp', jam: 'Jam' };

    if (mistakes.length === 0) {
        elements.mistakesList.innerHTML = '<li class="no-mistakes">Noch keine Fehler!</li>';
    } else {
        elements.mistakesList.innerHTML = mistakes.map(m => {
            const scenario = m.openerPosition
                ? `${m.position} vs ${m.openerPosition}`
                : m.position;
            return `<li class="mistake-item">
                <span class="mistake-hand">${m.hand}</span>
                <span class="mistake-scenario">${scenario}</span>
                <span class="mistake-action">${actionNames[m.userAction]} statt ${actionNames[m.correctAction]}</span>
                <span class="mistake-loss">-${m.evLoss}</span>
            </li>`;
        }).join('');
    }
}

function determineCorrectAction(handNotation, position, mode, openerPosition = null, threeBettorPosition = null, limperPosition = null, stackSize = null) {
    let range = null;

    // Tournament OR Mode
    if (mode === 'or') {
        // Benutze getTournamentORAction für Stacksize-abhängige Entscheidung
        const action = getTournamentORAction(handNotation, position, currentStackBB, currentStackSize);

        if (action === 'openraise') {
            return { action: 'raise', isMixed: false };
        } else if (action === 'jam') {
            return { action: 'jam', isMixed: false };
        } else if (action === 'limp') {
            return { action: 'limp', isMixed: false };
        }
        return { action: 'fold', isMixed: false };
    }

    // Tournament vs 3-Bet Mode (als Opener auf 3-Bet reagieren)
    if (mode === 'vs3bet') {
        const action = getTournamentVs3BetAction(handNotation, position, currentStackBB, currentStackSize);

        if (action === '4bet') {
            return { action: 'raise', isMixed: false }; // 4-bet wird als 'raise' behandelt
        } else if (action === 'call') {
            return { action: 'call', isMixed: false };
        }
        return { action: 'fold', isMixed: false };
    }

    // Tournament vs Open Mode (Hero reagiert auf Open einer früheren Position)
    if (mode === 'vsopen') {
        const action = getTournamentFacingOpenAction(handNotation, position, currentOpenerPosition, currentStackBB, currentOpenSize, currentBlindsWeak);
        if (action === 'jam') return { action: 'jam', isMixed: false };
        if (action === 'raise') return { action: 'raise', isMixed: false }; // 3-Bet
        if (action === 'call') return { action: 'call', isMixed: false };
        return { action: 'fold', isMixed: false };
    }

    if (mode === 'rfi') {
        range = RFI_RANGES[position];
        if (!range) return { action: 'fold', isMixed: false };

        if (range.raise && range.raise.includes(handNotation)) {
            return { action: 'raise', isMixed: false };
        }
        // RFI hat keine mixed strategies aktuell
        return { action: 'fold', isMixed: false };
    } else if (mode === '3bet') {
        // 3-Bet Szenario
        const key = `${position}_vs_${openerPosition}`;
        range = THREEBET_RANGES[key];

        if (!range) return { action: 'fold', isMixed: false };

        // Check for mixed strategy first
        if (range.mixed) {
            const mixedHand = range.mixed.find(m => m.hand === handNotation);
            if (mixedHand) {
                return {
                    action: 'mixed',
                    isMixed: true,
                    mixedData: mixedHand
                };
            }
        }

        if (range.raise && range.raise.includes(handNotation)) {
            return { action: 'raise', isMixed: false };
        }
        if (range.call && range.call.includes(handNotation)) {
            return { action: 'call', isMixed: false };
        }
        return { action: 'fold', isMixed: false };
    } else if (mode === 'facing3bet') {
        // Facing 3-Bet Szenario - du hast geöffnet, jemand 3-bettet
        const key = `${position}_vs_${threeBettorPosition}_3bet`;
        range = FACING_3BET_RANGES[key];

        if (!range) return { action: 'fold', isMixed: false };

        // Check for mixed strategy first
        if (range.mixed) {
            const mixedHand = range.mixed.find(m => m.hand === handNotation);
            if (mixedHand) {
                // Konvertiere fourbet zu raise für die UI
                const mixedDataForUI = {
                    hand: mixedHand.hand,
                    raise: mixedHand.fourbet,
                    call: mixedHand.call
                };
                return {
                    action: 'mixed',
                    isMixed: true,
                    mixedData: mixedDataForUI,
                    isFourBet: true
                };
            }
        }

        if (range.fourbet && range.fourbet.includes(handNotation)) {
            return { action: 'raise', isMixed: false, isFourBet: true }; // raise = 4-bet in diesem Kontext
        }
        if (range.call && range.call.includes(handNotation)) {
            return { action: 'call', isMixed: false };
        }
        return { action: 'fold', isMixed: false };
    } else if (mode === 'isolate') {
        // Isolate Szenario - jemand limpt, wir entscheiden ob iso-raise, limp oder fold
        const key = `${position}_vs_${limperPosition}_limp`;
        range = ISO_RAISE_RANGES[key];

        if (!range) return { action: 'fold', isMixed: false };

        // Check for mixed strategy first
        if (range.mixed) {
            const mixedHand = range.mixed.find(m => m.hand === handNotation);
            if (mixedHand) {
                return {
                    action: 'mixed',
                    isMixed: true,
                    mixedData: mixedHand,
                    isIsoRaise: true
                };
            }
        }

        if (range.raise && range.raise.includes(handNotation)) {
            return { action: 'raise', isMixed: false, isIsoRaise: true }; // raise = iso-raise
        }
        if (range.limp && range.limp.includes(handNotation)) {
            return { action: 'limp', isMixed: false };
        }
        return { action: 'fold', isMixed: false };
    }

    return { action: 'fold', isMixed: false };
}

function nextHand() {
    // Reset UI
    elements.feedback.classList.remove('show', 'correct', 'wrong');
    elements.nextBtn.classList.remove('show');
    elements.actionBtns.forEach(btn => btn.disabled = false);

    // Hide range viewer for new hand
    hideRangeViewer();

    // Focus mode: Generiere Hand basierend auf Schwächen
    if (focusModeActive) {
        generateFocusHand();
        const handNotation = handToNotation(currentHand);
        correctActionData = determineCorrectAction(
            handNotation,
            currentPosition,
            currentMode,
            currentOpenerPosition,
            current3BettorPosition
        );

        // Update UI basierend auf Modus
        updateModeUI();
        renderScenarioText();
        renderCards();
        elements.positionBadge.textContent = `Du bist ${currentPosition}`;
        return;
    }

    // Generate new hand
    currentHand = generateHand();
    const handNotation = handToNotation(currentHand);

    // Tournament OR Mode
    if (currentMode === 'or') {
        // OR: Wähle Tournament Position (außer BB, und SB nur bei 10-20bb)
        let orPositions = activeTournamentPositions.filter(p => p !== 'BB');
        if (currentStackSize === '25bb' || currentStackSize === '100bb' || currentStackSize === '20-30bb') {
            orPositions = orPositions.filter(p => p !== 'SB');
        }
        if (orPositions.length === 0) {
            currentPosition = 'BTN'; // Fallback
        } else {
            currentPosition = orPositions[Math.floor(Math.random() * orPositions.length)];
        }
        currentOpenerPosition = null;
        current3BettorPosition = null;
        currentLimperPosition = null;

        // Generiere Stacksize basierend auf gewählter Kategorie
        if (currentStackSize === '10-20bb') {
            currentStackBB = Math.floor(Math.random() * 11) + 10; // 10-20
        } else if (currentStackSize === '20-30bb') {
            currentStackBB = Math.floor(Math.random() * 11) + 20; // 20-30
        } else if (currentStackSize === '25bb') {
            currentStackBB = 25;
        } else if (currentStackSize === '100bb') {
            currentStackBB = Math.floor(Math.random() * 61) + 40; // 40-100
        }

        correctActionData = determineCorrectAction(handNotation, currentPosition, 'or', null, null, null, currentStackSize);

        elements.scenarioText.innerHTML = `<strong>${currentStackBB}bb</strong> Stack - Alle vor dir haben <strong>gefoldet</strong>.<br>Was machst du?`;

        // Update UI (inkl. Limp-Button für SB)
        updateModeUI();
        renderCards();
        elements.positionBadge.textContent = `Du bist ${currentPosition}`;
        return;
    }

    // Tournament vs 3-Bet Mode
    if (currentMode === 'vs3bet') {
        // Wähle Opener-Position (wir sind der Opener)
        // Nur Positionen die OR-Ranges haben und von denen aus 3-bet werden kann
        const openerPositions = activeTournamentPositions.filter(p => p !== 'BB' && p !== 'SB');
        if (openerPositions.length === 0) {
            currentPosition = 'BTN'; // Fallback
        } else {
            currentPosition = openerPositions[Math.floor(Math.random() * openerPositions.length)];
        }

        // 3-Bettor ist immer eine Position hinter uns (vereinfacht: BB oder SB)
        const positionOrder = ['UTG', 'UTG1', 'UTG2', 'MP', 'HJ', 'CO', 'BTN', 'SB', 'BB'];
        const openerIndex = positionOrder.indexOf(currentPosition);
        const possibleThreeBettors = positionOrder.slice(openerIndex + 1);
        current3BettorPosition = possibleThreeBettors[Math.floor(Math.random() * possibleThreeBettors.length)] || 'BB';

        currentOpenerPosition = null; // Wir sind selbst der Opener
        currentLimperPosition = null;

        // Generiere Stack (für 100bb: variabel 40-100, für 25bb: fix 25)
        if (currentStackSize === '100bb') {
            currentStackBB = Math.floor(Math.random() * 61) + 40; // 40-100
        } else {
            currentStackBB = 25;
        }

        // Wähle nur Hände die in der OR-Range sind (wir haben ja geöffnet)
        const orRange = OR_RANGES[currentStackSize] ? OR_RANGES[currentStackSize][currentPosition] : null;

        // Generiere immer erst eine Hand als Fallback
        currentHand = generateHand();

        if (orRange && orRange.openraise && orRange.openraise.length > 0) {
            // Versuche eine Hand aus der OR-Range zu generieren
            let attempts = 0;
            while (attempts < 50) {
                currentHand = generateHand();
                const notation = handToNotation(currentHand);
                if (orRange.openraise.includes(notation)) {
                    break;
                }
                attempts++;
            }
        }

        const handNotationVs3bet = handToNotation(currentHand);
        correctActionData = determineCorrectAction(handNotationVs3bet, currentPosition, 'vs3bet', null, current3BettorPosition, null, currentStackSize);

        elements.scenarioText.innerHTML = `<strong>${currentStackBB}bb</strong> Stack - Du hast aus <strong>${currentPosition}</strong> geraised.<br><strong>${current3BettorPosition}</strong> 3-bettet. Was machst du?`;

        // Update UI
        updateModeUI();
        renderCards();
        elements.positionBadge.textContent = `Du bist ${currentPosition}`;
        return;
    }

    // Tournament vs Open Mode
    if (currentMode === 'vsopen') {
        // Stack zufällig 20-30bb
        currentStackBB = Math.floor(Math.random() * 11) + 20; // 20-30

        // Verfügbare Opener bei diesem Bracket, gefiltert nach User-Auswahl (Villain)
        const allOpeners = getAvailableFacingOpenOpeners(currentStackBB);
        if (allOpeners.length === 0) {
            elements.scenarioText.innerHTML = `Keine Daten für ${currentStackBB}bb verfügbar.`;
            renderCards();
            return;
        }
        // Villain-Filter: Schnitt aus User-Auswahl UND verfügbaren Daten für aktive Heroes
        const villainsForActiveHeroes = (typeof getValidVillainsForHeroes === 'function')
            ? getValidVillainsForHeroes(activeTournamentPositions, currentStackBB)
            : allOpeners;
        const filteredOpeners = allOpeners
            .filter(p => activeVillainPositions.includes(p))
            .filter(p => villainsForActiveHeroes.includes(p));
        // Fallback-Kaskade: User-Filter → nur Hero-passend → alles
        const openerPool = filteredOpeners.length > 0
            ? filteredOpeners
            : (villainsForActiveHeroes.length > 0 ? villainsForActiveHeroes : allOpeners);
        currentOpenerPosition = openerPool[Math.floor(Math.random() * openerPool.length)];

        // Verfügbare Hero-Positionen vs diesen Opener
        const heroCandidates = getAvailableFacingOpenHeroPositions(currentOpenerPosition, currentStackBB);
        // Schnitt mit activeTournamentPositions (Hero-Filter)
        const filteredHeroes = heroCandidates.filter(p => activeTournamentPositions.includes(p));
        const heroPool = filteredHeroes.length > 0 ? filteredHeroes : heroCandidates;
        currentPosition = heroPool[Math.floor(Math.random() * heroPool.length)];

        // Variables Open-Sizing: 2.0 (minraise), 2.2 (small), 2.3 (standard), 2.5 (large)
        const sizingPool = [2.0, 2.2, 2.3, 2.5];
        currentOpenSize = sizingPool[Math.floor(Math.random() * sizingPool.length)];

        // Random ob die Blinds weak sind (50/50) — aktiviert flat_soft_table Hände
        currentBlindsWeak = Math.random() < 0.5;

        current3BettorPosition = null;
        currentLimperPosition = null;

        const handNotationVsOpen = handToNotation(currentHand);
        correctActionData = determineCorrectAction(handNotationVsOpen, currentPosition, 'vsopen', currentOpenerPosition, null, null, currentStackSize);

        const sizeLabel = Number.isInteger(currentOpenSize) ? `${currentOpenSize}.0bb` : `${currentOpenSize}bb`;
        elements.scenarioText.innerHTML = `<strong>${currentStackBB}bb</strong> Stack - <strong>${currentOpenerPosition}</strong> raised auf <strong>${sizeLabel}</strong>.<br>Du bist <strong>${currentPosition}</strong>. Was machst du?`;

        updateModeUI();
        renderCards();
        elements.positionBadge.textContent = `Du bist ${currentPosition}`;
        return;
    }

    if (currentMode === 'rfi') {
        // RFI: Wähle Position (außer BB - dort gibt es kein RFI)
        const rfiPositions = activePositions.filter(p => p !== 'BB');
        if (rfiPositions.length === 0) {
            currentPosition = 'BTN'; // Fallback
        } else {
            currentPosition = rfiPositions[Math.floor(Math.random() * rfiPositions.length)];
        }
        currentOpenerPosition = null;
        current3BettorPosition = null;
        correctActionData = determineCorrectAction(handNotation, currentPosition, 'rfi');

        elements.scenarioText.innerHTML = `Alle vor dir haben <strong>gefoldet</strong>.<br>Was machst du?`;
    } else if (currentMode === '3bet') {
        // 3-Bet: Wähle Hero Position und Opener Position
        // Hero kann nicht UTG sein (niemand vor ihm)
        const heroPositions = activePositions.filter(p => p !== 'UTG');
        if (heroPositions.length === 0) {
            currentPosition = 'BB';
        } else {
            currentPosition = heroPositions[Math.floor(Math.random() * heroPositions.length)];
        }

        const validOpeners = getValidOpenerPositions(currentPosition);
        if (validOpeners.length === 0) {
            // Fallback wenn keine gültigen Opener
            currentPosition = 'BB';
            currentOpenerPosition = 'BTN';
        } else {
            currentOpenerPosition = validOpeners[Math.floor(Math.random() * validOpeners.length)];
        }

        current3BettorPosition = null;
        correctActionData = determineCorrectAction(handNotation, currentPosition, '3bet', currentOpenerPosition);

        elements.scenarioText.innerHTML = `<strong>${currentOpenerPosition}</strong> hat geraised.<br>Was machst du?`;
    } else if (currentMode === 'facing3bet') {
        // Facing 3-Bet: Du öffnest, jemand 3-bettet
        // Verfügbare Spots: SB vs BB, BTN vs SB, BTN vs BB
        const facing3betSpots = [
            { opener: 'SB', threeBettor: 'BB' },
            { opener: 'BTN', threeBettor: 'SB' },
            { opener: 'BTN', threeBettor: 'BB' }
        ];

        const spot = facing3betSpots[Math.floor(Math.random() * facing3betSpots.length)];
        currentPosition = spot.opener;
        current3BettorPosition = spot.threeBettor;
        currentOpenerPosition = null;

        correctActionData = determineCorrectAction(handNotation, currentPosition, 'facing3bet', null, current3BettorPosition);

        elements.scenarioText.innerHTML = `Du hast aus <strong>${currentPosition}</strong> geraised.<br><strong>${current3BettorPosition}</strong> 3-bettet. Was machst du?`;
    } else if (currentMode === 'isolate') {
        // Isolate: Jemand limpt, wir entscheiden ob iso-raise, limp behind oder fold
        // Verfügbare Spots basierend auf ISO_RAISE_RANGES
        const isoSpots = [
            { hero: 'BTN', limper: 'UTG' },
            { hero: 'BTN', limper: 'HJ' },
            { hero: 'BTN', limper: 'CO' },
            { hero: 'CO', limper: 'UTG' },
            { hero: 'CO', limper: 'HJ' },
            { hero: 'HJ', limper: 'UTG' },
            { hero: 'SB', limper: 'UTG' },
            { hero: 'SB', limper: 'HJ' },
            { hero: 'SB', limper: 'CO' },
            { hero: 'SB', limper: 'BTN' },
            { hero: 'BB', limper: 'SB' }
        ];

        const spot = isoSpots[Math.floor(Math.random() * isoSpots.length)];
        currentPosition = spot.hero;
        currentLimperPosition = spot.limper;
        currentOpenerPosition = null;
        current3BettorPosition = null;

        correctActionData = determineCorrectAction(handNotation, currentPosition, 'isolate', null, null, currentLimperPosition);

        elements.scenarioText.innerHTML = `<strong>${currentLimperPosition}</strong> hat gelimpt.<br>Was machst du?`;
    }

    // Update UI
    renderCards();
    elements.positionBadge.textContent = `Du bist ${currentPosition}`;
}

function renderCards() {
    const html = currentHand.map(card => `
        <div class="card ${SUIT_NAMES[card.suit]}">
            <span class="rank">${card.rank}</span>
            <span class="suit">${SUIT_SYMBOLS[card.suit]}</span>
            <span class="center-rank">${card.rank}</span>
        </div>
    `).join('');

    // Render to both old and new containers for compatibility
    if (elements.cards) elements.cards.innerHTML = html;
    if (elements.heroCards) elements.heroCards.innerHTML = html;

    // Render the poker table
    renderPokerTable();
}

// Poker Table Rendering
function getTablePositions() {
    if (gameType === 'tournament') {
        return ['UTG', 'UTG1', 'UTG2', 'MP', 'HJ', 'CO', 'BTN', 'SB', 'BB'];
    } else {
        return ['UTG', 'HJ', 'CO', 'BTN', 'SB', 'BB'];
    }
}

function getSeatPosition(index, totalSeats) {
    // Distribute seats evenly around ellipse
    // Start at bottom (hero), go clockwise
    const angle = (Math.PI / 2) + (index / totalSeats) * 2 * Math.PI;

    // Table felt is inset 10%, so it spans from 10% to 90% (80% total)
    // Center is at 50%, radii should place seats just outside the felt
    const radiusX = 44;
    const radiusY = 44; // Slightly larger to push top positions up

    const x = 50 + radiusX * Math.cos(angle);
    const y = 50 + radiusY * Math.sin(angle);

    return { x, y };
}

function getPotSize() {
    const SB = 0.5;
    const BB = 1;
    const OPEN_SIZE = 2.3;
    const THREEBET_SIZE_DEEP = 7.5;   // 100bb context
    const THREEBET_SIZE_SHALLOW = 5.5; // 25bb context

    if (currentMode === 'or' || currentMode === 'rfi') {
        return SB + BB; // 1.5bb
    }
    if (currentMode === '3bet') {
        // Cash: opener raised (Hero entscheidet vs Open)
        return SB + BB + OPEN_SIZE;
    }
    if (currentMode === 'vsopen') {
        // Tournament: Hero faced Open (variables Sizing)
        return SB + BB + currentOpenSize;
    }
    if (currentMode === 'isolate') {
        // Limper limped (1bb)
        return SB + BB + BB;
    }
    if (currentMode === 'vs3bet' || currentMode === 'facing3bet') {
        // Hero opened, 3-bettor 3-bettet — Size abhängig von Position
        const isOOP = current3BettorPosition === 'SB' || current3BettorPosition === 'BB';
        const threebetSize = isOOP ? 8.5 : 6.5;
        return SB + BB + OPEN_SIZE + threebetSize;
    }
    return SB + BB;
}

function formatPot(potBB) {
    // Nice Zahl Anzeige
    return potBB % 1 === 0 ? `${potBB}bb` : `${potBB.toFixed(1)}bb`;
}

function renderPokerTable() {
    if (!elements.seatsContainer) return;

    if (elements.potDisplay) {
        elements.potDisplay.textContent = `Pot: ${formatPot(getPotSize())}`;
    }

    const allPositions = getTablePositions();
    const heroIndex = allPositions.indexOf(currentPosition);

    if (heroIndex === -1) return;

    // Rotate positions so hero is at index 0 (bottom of table)
    const rotatedPositions = [
        ...allPositions.slice(heroIndex),
        ...allPositions.slice(0, heroIndex)
    ];

    const totalSeats = rotatedPositions.length;
    let seatsHtml = '';
    let blindChipsHtml = '';
    let dealerBtnHtml = '';

    rotatedPositions.forEach((pos, idx) => {
        const { x, y } = getSeatPosition(idx, totalSeats);
        const isHero = pos === currentPosition;
        const isFolded = getPositionAction(pos) === 'fold';
        const isBTN = pos === 'BTN';

        const action = getPositionAction(pos);
        const actionText = getActionDisplayText(pos, action);

        // Text above circle for top half, below for bottom half
        const isTopHalf = y < 45;

        const classes = ['seat'];
        if (isHero) classes.push('hero');
        if (isFolded) classes.push('folded');
        if (isTopHalf) classes.push('top-half');

        // "weak" Marker: nur in vsopen Mode bei SB/BB wenn Blinds als weak markiert sind
        const showWeak = (currentMode === 'vsopen' && currentBlindsWeak && (pos === 'SB' || pos === 'BB'));
        const weakHtml = showWeak ? '<div class="seat-weak">weak</div>' : '';

        seatsHtml += `
            <div class="${classes.join(' ')}" style="left: ${x}%; top: ${y}%;">
                <div class="seat-label top">${isTopHalf ? pos : ''}</div>
                <div class="seat-stack">${currentStackBB}</div>
                <div class="seat-label bottom">${!isTopHalf ? pos : ''}</div>
                ${weakHtml}
                ${actionText ? `<div class="seat-action">${actionText}</div>` : ''}
            </div>
        `;

        // Alle Chips/Buttons gleichmäßig auf dem Tisch (0.3 Richtung Mitte)
        const CHIP_MULTIPLIER = 0.3;

        // Dealer button - immer auf dem Tisch neben BTN
        if (isBTN) {
            const btnX = x + (50 - x) * CHIP_MULTIPLIER;
            const btnY = y + (50 - y) * CHIP_MULTIPLIER;
            dealerBtnHtml = `<div class="dealer-btn" style="left: ${btnX}%; top: ${btnY}%;">D</div>`;
        }

        // Blind chips - aber nicht wenn dieser Spieler bereits geraised/3-bettet hat
        // (dann ist der Blind in der Raise-Size schon drin)
        const blindAlreadyCommitted = action === 'raise' || action === '3bet';
        if (pos === 'SB' && !isFolded && !blindAlreadyCommitted) {
            const chipX = x + (50 - x) * CHIP_MULTIPLIER;
            const chipY = y + (50 - y) * CHIP_MULTIPLIER;
            blindChipsHtml += `<div class="blind-chip sb" style="left: ${chipX}%; top: ${chipY}%;">0.5bb</div>`;
        }
        if (pos === 'BB' && !isFolded && !blindAlreadyCommitted) {
            const chipX = x + (50 - x) * CHIP_MULTIPLIER;
            const chipY = y + (50 - y) * CHIP_MULTIPLIER;
            blindChipsHtml += `<div class="blind-chip bb" style="left: ${chipX}%; top: ${chipY}%;">1bb</div>`;
        }

        // Raise chip für Opener (in vs Open / 3bet / Iso Modi)
        if (action === 'raise' && !isHero) {
            const chipX = x + (50 - x) * CHIP_MULTIPLIER;
            const chipY = y + (50 - y) * CHIP_MULTIPLIER;
            // In vsopen Mode aktuelles Sizing zeigen, sonst Standard 2.3bb
            const raiseSize = (currentMode === 'vsopen')
                ? (Number.isInteger(currentOpenSize) ? `${currentOpenSize}.0bb` : `${currentOpenSize}bb`)
                : '2.3bb';
            blindChipsHtml += `<div class="raise-chip" style="left: ${chipX}%; top: ${chipY}%;">${raiseSize}</div>`;
        }

        // 3-Bet chip (vs3bet / facing3bet Modi): OOP = 8.5bb (Blinds), IP = 6.5bb
        if (action === '3bet' && !isHero) {
            const isOOP = pos === 'SB' || pos === 'BB';
            const threebetSize = isOOP ? '8.5bb' : '6.5bb';
            const chipX = x + (50 - x) * CHIP_MULTIPLIER;
            const chipY = y + (50 - y) * CHIP_MULTIPLIER;
            blindChipsHtml += `<div class="raise-chip threebet" style="left: ${chipX}%; top: ${chipY}%;">${threebetSize}</div>`;
        }
    });

    elements.seatsContainer.innerHTML = seatsHtml + dealerBtnHtml + blindChipsHtml;
}

function getPositionAction(position) {
    // Determine what action this position has taken based on mode and scenario
    if (position === currentPosition) {
        return 'hero'; // Hero hasn't acted yet
    }

    const allPositions = getTablePositions();
    const heroIdx = allPositions.indexOf(currentPosition);
    const posIdx = allPositions.indexOf(position);

    if (currentMode === 'or' || currentMode === 'rfi') {
        // OR/RFI mode: everyone before hero has folded
        if (posIdx < heroIdx) {
            return 'fold';
        }
        // Blinds haven't acted yet
        return position === 'SB' || position === 'BB' ? 'blind' : null;
    }

    if (currentMode === 'vs3bet') {
        // vs 3bet: Hero opened, someone 3bet
        if (position === current3BettorPosition) {
            return '3bet';
        }
        if (posIdx < heroIdx && position !== current3BettorPosition) {
            return 'fold';
        }
        return null;
    }

    if (currentMode === '3bet' || currentMode === 'vsopen') {
        // 3bet/vsopen mode: opener raised, others folded
        if (position === currentOpenerPosition) {
            return 'raise';
        }
        if (posIdx < heroIdx && position !== currentOpenerPosition) {
            return 'fold';
        }
        return null;
    }

    if (currentMode === 'isolate') {
        // Iso mode: limper limped
        if (position === currentLimperPosition) {
            return 'limp';
        }
        if (posIdx < heroIdx && position !== currentLimperPosition) {
            return 'fold';
        }
        return null;
    }

    return null;
}

function getActionDisplayText(position, action) {
    if (action === 'hero') return null;
    if (action === 'fold') return 'Fold';
    if (action === 'raise') return 'Raise';
    if (action === '3bet') return '3-Bet';
    if (action === 'limp') return 'Limp';
    if (action === 'blind') return null; // Blinds shown as chips, not text
    return null;
}

function handleAction(action) {
    // Buttons deaktivieren
    elements.actionBtns.forEach(btn => btn.disabled = true);

    const handNotation = handToNotation(currentHand);
    const handValue = getHandValue(handNotation);

    let isCorrect = false;
    let isMixedAcceptable = false;
    let mixedFrequency = 0;

    if (correctActionData.isMixed) {
        // Mixed Strategy: Check if action is one of the mixed options
        const mixedData = correctActionData.mixedData;
        if (mixedData[action] && mixedData[action] > 0) {
            isMixedAcceptable = true;
            mixedFrequency = mixedData[action];
            isCorrect = true; // Beide Aktionen sind "korrekt"
        }
    } else {
        // Normale Aktion - 'limp' ist auch ein valider Vergleich
        isCorrect = action === correctActionData.action;
    }

    score.total++;
    let evLost = 0;

    if (isCorrect) {
        score.correct++;
        if (isMixedAcceptable) {
            // Mixed: EV-Gain proportional zur Frequenz
            const evGain = Math.round(handValue * mixedFrequency);
            evGainTotal += evGain;
        } else {
            // Normale korrekte Aktion
            calculateEVGain(handNotation, correctActionData.action);
        }
    } else {
        // Fehler (bei Mixed: Fold gewählt wo kein Fold erlaubt)
        const correctAction = correctActionData.isMixed ? 'mixed' : correctActionData.action;
        evLost = calculateEVLoss(handNotation, action, correctAction, currentPosition, currentOpenerPosition);
    }

    // Track detailed stats for leak detection
    trackDetailedStat(handNotation, isCorrect, evLost);

    updateEVDisplay();
    renderWeaknesses();

    // Feedback anzeigen
    showFeedback(isCorrect, action, isMixedAcceptable, mixedFrequency);
    updateScoreDisplay();

    // Show range viewer after action
    showRangeViewer();

    // Next Button anzeigen
    elements.nextBtn.classList.add('show');
}

function showFeedback(isCorrect, userAction, isMixedAcceptable = false, mixedFrequency = 0) {
    elements.feedback.classList.remove('correct', 'wrong');
    elements.feedback.classList.add('show', isCorrect ? 'correct' : 'wrong');

    const handNotation = handToNotation(currentHand);
    const isFourBetMode = currentMode === 'facing3bet' || currentMode === 'vs3bet';
    const isIsoMode = currentMode === 'isolate';
    const isORMode = currentMode === 'or';
    const isVsOpenMode = currentMode === 'vsopen';

    let raiseLabel = 'Raise';
    if (isFourBetMode) raiseLabel = '4-Bet';
    else if (isIsoMode) raiseLabel = 'Iso-Raise';
    else if (isORMode) raiseLabel = 'Open';
    else if (isVsOpenMode) raiseLabel = '3-Bet';

    const actionNames = {
        fold: 'Fold',
        call: 'Call',
        limp: 'Limp',
        jam: isVsOpenMode ? '3-Bet Jam' : 'Openjam',
        raise: raiseLabel,
        mixed: 'Mixed'
    };

    if (isMixedAcceptable) {
        // Mixed Strategy Feedback
        elements.feedbackIcon.textContent = '✓';
        elements.feedbackText.textContent = 'Korrekt!';
        const percent = Math.round(mixedFrequency * 100);
        const mixedData = correctActionData.mixedData;
        const raisePercent = Math.round((mixedData.raise || 0) * 100);
        const callPercent = Math.round((mixedData.call || 0) * 100);
        const raiseLabel = isFourBetMode ? '4-Bet' : 'Raise';

        elements.correctAnswer.innerHTML = `
            <span class="hand-notation">${handNotation}</span> ist Mixed:
            <strong>${actionNames[userAction]}</strong> (${percent}%)
            <br><small>${raiseLabel} ${raisePercent}% / Call ${callPercent}%</small>
        `;
    } else if (!isCorrect) {
        elements.feedbackIcon.textContent = '✗';
        elements.feedbackText.textContent = 'Falsch!';

        let correctActionName;
        if (correctActionData.isMixed) {
            const mixedData = correctActionData.mixedData;
            const raisePercent = Math.round((mixedData.raise || 0) * 100);
            const callPercent = Math.round((mixedData.call || 0) * 100);
            const raiseAbbr = isFourBetMode ? '4B' : 'R';
            correctActionName = `Mixed (${raiseAbbr}${raisePercent}/C${callPercent})`;
        } else {
            correctActionName = actionNames[correctActionData.action];
        }

        let scenarioInfo = '';
        if (currentMode === '3bet') {
            scenarioInfo = ` (vs ${currentOpenerPosition} Open)`;
        } else if (currentMode === 'facing3bet') {
            scenarioInfo = ` (${currentPosition} vs ${current3BettorPosition} 3-Bet)`;
        } else if (currentMode === 'isolate') {
            scenarioInfo = ` (vs ${currentLimperPosition} Limp)`;
        } else if (currentMode === 'or') {
            scenarioInfo = ` (${currentPosition}, ${currentStackBB}bb)`;
        } else if (currentMode === 'vsopen') {
            scenarioInfo = ` (${currentPosition} vs ${currentOpenerPosition}, ${currentStackBB}bb)`;
        }

        elements.correctAnswer.innerHTML = `
            <span class="hand-notation">${handNotation}</span> sollte
            <strong>${correctActionName}</strong> sein${scenarioInfo}
        `;
    } else {
        elements.feedbackIcon.textContent = '✓';
        elements.feedbackText.textContent = 'Richtig!';
        elements.correctAnswer.innerHTML = `
            <span class="hand-notation">${handNotation}</span> =
            <strong>${actionNames[correctActionData.action]}</strong> ✓
        `;
    }
}

function updateScoreDisplay() {
    elements.scoreCorrect.textContent = score.correct;
    elements.scoreTotal.textContent = score.total;

    const percent = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;
    elements.scorePercent.textContent = percent + '%';

    // Farbe basierend auf Prozent
    elements.scorePercent.className = 'score-value';
    if (score.total >= 5) {
        if (percent >= 70) {
            elements.scorePercent.classList.add('good');
        } else if (percent < 50) {
            elements.scorePercent.classList.add('bad');
        }
    }
}

function handleKeyboard(e) {
    // Nur wenn Buttons aktiv sind
    if (elements.actionBtns[0].disabled) {
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            nextHand();
        }
        return;
    }

    switch (e.key.toLowerCase()) {
        case 'f':
        case '1':
            handleAction('fold');
            break;
        case 'c':
        case '2':
            if (currentMode === '3bet' || currentMode === 'facing3bet' || currentMode === 'vs3bet' || currentMode === 'vsopen') handleAction('call');
            break;
        case 'l':
            if (currentMode === 'isolate') handleAction('limp');
            // SB kann limpen im Tournament OR Mode
            if (currentMode === 'or' && currentPosition === 'SB') handleAction('limp');
            break;
        case 'j':
            if (currentMode === 'or' || currentMode === 'vsopen') handleAction('jam');
            break;
        case 'r':
        case '3':
            handleAction('raise');
            break;
    }
}

// Start wenn DOM geladen
document.addEventListener('DOMContentLoaded', init);
