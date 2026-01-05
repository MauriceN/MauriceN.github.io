// Poker Preflop Trainer - Spiellogik

const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
const SUITS = ['s', 'h', 'd', 'c']; // spades, hearts, diamonds, clubs
const SUIT_SYMBOLS = { s: '♠', h: '♥', d: '♦', c: '♣' };
const SUIT_NAMES = { s: 'spades', h: 'hearts', d: 'diamonds', c: 'clubs' };

let currentMode = 'rfi'; // 'rfi' oder '3bet'
let currentHand = null;
let currentPosition = null;
let currentOpenerPosition = null;
let correctActionData = null; // { action: 'raise'|'call'|'fold'|'mixed', isMixed: bool, mixedData?: {...} }
let score = { correct: 0, total: 0 };
let activePositions = ['UTG', 'HJ', 'CO', 'BTN', 'SB', 'BB'];

// EV Tracking
let evGainTotal = 0;
let evLossTotal = 0;
let mistakes = []; // Array der Fehler: { hand, position, userAction, correctAction, evLoss, openerPosition }

// Range Viewer State
let rangeRevealed = false;
let equityMode = false;

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

// DOM Elements
const elements = {};

function init() {
    // Cache DOM elements
    elements.cards = document.querySelector('.cards');
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

    elements.settingsToggle.addEventListener('click', toggleSettings);

    // Position filter listeners
    document.querySelectorAll('.position-filter').forEach(checkbox => {
        checkbox.addEventListener('change', updateActivePositions);
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboard);

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

    // Start
    nextHand();
}

function setMode(mode) {
    currentMode = mode;
    elements.modeBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    // Show/hide Call button based on mode
    elements.callBtn.style.display = mode === '3bet' ? 'inline-block' : 'none';

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
    elements.settingsPanel.classList.toggle('show');
}

function updateActivePositions() {
    activePositions = [];
    document.querySelectorAll('.position-filter:checked').forEach(checkbox => {
        activePositions.push(checkbox.value);
    });

    // Mindestens eine Position muss aktiv sein
    if (activePositions.length === 0) {
        activePositions = ['BTN'];
        document.querySelector('.position-filter[value="BTN"]').checked = true;
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

    if (currentMode === 'rfi') {
        range = RFI_RANGES[currentPosition];
        rangeLabel = `RFI Range: ${currentPosition}`;
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
        cell.classList.remove('raise', 'call', 'fold', 'mixed', 'current-hand',
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
                        // Set gradient based on ratio
                        const raisePercent = (mixedHand.raise || 0) * 100;
                        cell.style.background = `linear-gradient(135deg,
                            rgba(76,175,80,0.8) 0%,
                            rgba(76,175,80,0.8) ${raisePercent}%,
                            rgba(33,150,243,0.8) ${raisePercent}%,
                            rgba(33,150,243,0.8) 100%)`;
                    }
                }

                if (!isMixed) {
                    if (range.raise && range.raise.includes(cellHand)) {
                        cell.classList.add('raise');
                    } else if (range.call && range.call.includes(cellHand)) {
                        cell.classList.add('call');
                    } else {
                        cell.classList.add('fold');
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
    } else if (correctAction === 'fold') {
        // Trash richtig gefoldet = Verlust vermieden
        evGain = 100 - handValue;
    } else if (correctAction === 'call') {
        // Richtig gecallt = moderater Gain
        evGain = Math.round(handValue * 0.7);
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
    const actionNames = { fold: 'Fold', call: 'Call', raise: 'Raise' };

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

function determineCorrectAction(handNotation, position, mode, openerPosition = null) {
    let range = null;

    if (mode === 'rfi') {
        range = RFI_RANGES[position];
        if (!range) return { action: 'fold', isMixed: false };

        if (range.raise && range.raise.includes(handNotation)) {
            return { action: 'raise', isMixed: false };
        }
        // RFI hat keine mixed strategies aktuell
        return { action: 'fold', isMixed: false };
    } else {
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
    }
}

function nextHand() {
    // Reset UI
    elements.feedback.classList.remove('show', 'correct', 'wrong');
    elements.nextBtn.classList.remove('show');
    elements.actionBtns.forEach(btn => btn.disabled = false);

    // Hide range viewer for new hand
    hideRangeViewer();

    // Generate new hand
    currentHand = generateHand();
    const handNotation = handToNotation(currentHand);

    if (currentMode === 'rfi') {
        // RFI: Wähle Position (außer BB - dort gibt es kein RFI)
        const rfiPositions = activePositions.filter(p => p !== 'BB');
        if (rfiPositions.length === 0) {
            currentPosition = 'BTN'; // Fallback
        } else {
            currentPosition = rfiPositions[Math.floor(Math.random() * rfiPositions.length)];
        }
        currentOpenerPosition = null;
        correctActionData = determineCorrectAction(handNotation, currentPosition, 'rfi');

        elements.scenarioText.innerHTML = `Alle vor dir haben <strong>gefoldet</strong>.<br>Was machst du?`;
    } else {
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

        correctActionData = determineCorrectAction(handNotation, currentPosition, '3bet', currentOpenerPosition);

        elements.scenarioText.innerHTML = `<strong>${currentOpenerPosition}</strong> hat geraised.<br>Was machst du?`;
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
        </div>
    `).join('');

    elements.cards.innerHTML = html;
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
        // Normale Aktion
        isCorrect = action === correctActionData.action;
    }

    score.total++;
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
        calculateEVLoss(handNotation, action, correctAction, currentPosition, currentOpenerPosition);
    }
    updateEVDisplay();

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
    const actionNames = { fold: 'Fold', call: 'Call', raise: 'Raise', mixed: 'Mixed' };

    if (isMixedAcceptable) {
        // Mixed Strategy Feedback
        elements.feedbackIcon.textContent = '✓';
        elements.feedbackText.textContent = 'Korrekt!';
        const percent = Math.round(mixedFrequency * 100);
        const mixedData = correctActionData.mixedData;
        const raisePercent = Math.round((mixedData.raise || 0) * 100);
        const callPercent = Math.round((mixedData.call || 0) * 100);

        elements.correctAnswer.innerHTML = `
            <span class="hand-notation">${handNotation}</span> ist Mixed:
            <strong>${actionNames[userAction]}</strong> (${percent}%)
            <br><small>Raise ${raisePercent}% / Call ${callPercent}%</small>
        `;
    } else if (!isCorrect) {
        elements.feedbackIcon.textContent = '✗';
        elements.feedbackText.textContent = 'Falsch!';

        let correctActionName;
        if (correctActionData.isMixed) {
            const mixedData = correctActionData.mixedData;
            const raisePercent = Math.round((mixedData.raise || 0) * 100);
            const callPercent = Math.round((mixedData.call || 0) * 100);
            correctActionName = `Mixed (R${raisePercent}/C${callPercent})`;
        } else {
            correctActionName = actionNames[correctActionData.action];
        }

        elements.correctAnswer.innerHTML = `
            <span class="hand-notation">${handNotation}</span> sollte
            <strong>${correctActionName}</strong> sein
            ${currentMode === '3bet' ? ` (vs ${currentOpenerPosition} Open)` : ''}
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
            if (currentMode === '3bet') handleAction('call');
            break;
        case 'r':
        case '3':
            handleAction('raise');
            break;
    }
}

// Start wenn DOM geladen
document.addEventListener('DOMContentLoaded', init);
