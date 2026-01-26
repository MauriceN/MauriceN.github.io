// Poker Preflop Ranges für 6-Max
// Format: Hand-Notation -> Aktion
// Hände: AA, AKs, AKo, etc. (s = suited, o = offsuit)

const POSITIONS = ['UTG', 'HJ', 'CO', 'BTN', 'SB', 'BB'];

// Hilfsfunktion: Alle Pocket Pairs
const pairs = ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44', '33', '22'];

// Hilfsfunktion: Range-String zu Array
function expandRange(rangeStr) {
    const hands = [];
    const parts = rangeStr.split(',').map(s => s.trim());

    for (const part of parts) {
        if (part.includes('+')) {
            // z.B. "TT+" = TT, JJ, QQ, KK, AA
            const base = part.replace('+', '');
            if (pairs.includes(base)) {
                const idx = pairs.indexOf(base);
                hands.push(...pairs.slice(0, idx + 1));
            }
        } else if (part.includes('-')) {
            // z.B. "ATs-A5s"
            hands.push(part); // Vereinfacht - direkt speichern
        } else {
            hands.push(part);
        }
    }
    return hands;
}

// RFI (Raise First In) Ranges - was öffnen wir von welcher Position?
const RFI_RANGES = {
    UTG: {
        raise: [
            // Pairs
            'AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77',
            // Suited Broadways
            'AKs', 'AQs', 'AJs', 'ATs', 'KQs', 'KJs', 'QJs', 'JTs',
            // Offsuit Broadways
            'AKo', 'AQo', 'AJo', 'KQo'
        ],
        fold: 'rest'
    },
    HJ: {
        raise: [
            // Pairs
            'AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66',
            // Suited
            'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A5s', 'A4s',
            'KQs', 'KJs', 'KTs', 'QJs', 'QTs', 'JTs', 'T9s', '98s',
            // Offsuit
            'AKo', 'AQo', 'AJo', 'ATo', 'KQo', 'KJo'
        ],
        fold: 'rest'
    },
    CO: {
        raise: [
            // Pairs
            'AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44',
            // Suited
            'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s',
            'KQs', 'KJs', 'KTs', 'K9s', 'QJs', 'QTs', 'Q9s', 'JTs', 'J9s', 'T9s', 'T8s', '98s', '97s', '87s', '76s', '65s',
            // Offsuit
            'AKo', 'AQo', 'AJo', 'ATo', 'A9o', 'KQo', 'KJo', 'KTo', 'QJo', 'QTo', 'JTo'
        ],
        fold: 'rest'
    },
    BTN: {
        raise: [
            // Pairs - alle
            'AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44', '33', '22',
            // Suited - sehr weit
            'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s',
            'KQs', 'KJs', 'KTs', 'K9s', 'K8s', 'K7s', 'K6s', 'K5s', 'K4s',
            'QJs', 'QTs', 'Q9s', 'Q8s', 'Q7s',
            'JTs', 'J9s', 'J8s', 'J7s',
            'T9s', 'T8s', 'T7s',
            '98s', '97s', '96s',
            '87s', '86s', '85s',
            '76s', '75s', '74s',
            '65s', '64s',
            '54s', '53s',
            '43s',
            // Offsuit
            'AKo', 'AQo', 'AJo', 'ATo', 'A9o', 'A8o', 'A7o', 'A6o', 'A5o', 'A4o', 'A3o', 'A2o',
            'KQo', 'KJo', 'KTo', 'K9o', 'K8o',
            'QJo', 'QTo', 'Q9o',
            'JTo', 'J9o', 'J8o',
            'T9o', 'T8o',
            '98o', '97o',
            '87o', '86o',
            '76o', '75o',
            '65o'
        ],
        fold: 'rest'
    },
    SB: {
        raise: [
            // Pairs
            'AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44', '33', '22',
            // Suited
            'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s',
            'KQs', 'KJs', 'KTs', 'K9s', 'K8s', 'K7s', 'K6s', 'K5s',
            'QJs', 'QTs', 'Q9s', 'Q8s', 'Q7s',
            'JTs', 'J9s', 'J8s',
            'T9s', 'T8s',
            '98s', '97s',
            '87s', '86s',
            '76s', '75s',
            '65s', '64s',
            '54s',
            // Offsuit
            'AKo', 'AQo', 'AJo', 'ATo', 'A9o', 'A8o', 'A7o', 'A6o', 'A5o',
            'KQo', 'KJo', 'KTo', 'K9o',
            'QJo', 'QTo',
            'JTo', 'J9o',
            'T9o',
            '98o',
            '87o'
        ],
        fold: 'rest'  // Im SB: raise or fold, kein limp
    }
};

// 3-Bet Ranges - wie reagieren wir auf einen Open?
// Format: [deine Position][opener position] -> { raise: [...], call: [...], fold: 'rest' }
const THREEBET_RANGES = {
    // Aus dem HJ vs UTG Open
    HJ_vs_UTG: {
        raise: ['AA', 'KK', 'QQ', 'AKs', 'AKo'],
        call: ['JJ', 'TT', '99', 'AQs', 'AJs', 'KQs'],
        fold: 'rest'
    },

    // Aus dem CO
    CO_vs_UTG: {
        raise: ['AA', 'KK', 'QQ', 'AKs', 'AKo'],
        call: ['JJ', 'TT', '99', '88', 'AQs', 'AJs', 'ATs', 'KQs', 'KJs', 'QJs'],
        fold: 'rest'
    },
    CO_vs_HJ: {
        raise: ['AA', 'KK', 'QQ', 'JJ', 'AKs', 'AKo', 'AQs'],
        call: ['TT', '99', '88', '77', 'AJs', 'ATs', 'KQs', 'KJs', 'QJs', 'JTs'],
        fold: 'rest'
    },

    // Aus dem BTN
    BTN_vs_UTG: {
        raise: ['AA', 'KK', 'QQ', 'AKs', 'AKo'],
        call: ['JJ', 'TT', '99', '88', '77', 'AQs', 'AJs', 'ATs', 'KQs', 'KJs', 'QJs', 'JTs', 'T9s', '98s'],
        fold: 'rest'
    },
    BTN_vs_HJ: {
        raise: ['AA', 'KK', 'QQ', 'JJ', 'AKs', 'AKo', 'AQs', 'A5s', 'A4s'],
        call: ['TT', '99', '88', '77', '66', 'AJs', 'ATs', 'A9s', 'KQs', 'KJs', 'KTs', 'QJs', 'QTs', 'JTs', 'T9s', '98s', '87s', '76s'],
        fold: 'rest'
    },
    BTN_vs_CO: {
        raise: ['AA', 'KK', 'QQ', 'JJ', 'TT', 'AKs', 'AKo', 'AQs', 'AQo', 'A5s', 'A4s', 'KQs'],
        call: ['88', '77', '66', '55', 'A9s', 'A8s', 'KTs', 'K9s', 'QTs', 'Q9s', 'JTs', 'J9s', 'T9s', 'T8s', '98s', '97s', '87s', '86s', '76s', '65s'],
        mixed: [
            { hand: '99', raise: 0.5, call: 0.5 },
            { hand: 'AJs', raise: 0.6, call: 0.4 },
            { hand: 'ATs', raise: 0.4, call: 0.6 },
            { hand: 'KJs', raise: 0.5, call: 0.5 },
            { hand: 'QJs', raise: 0.4, call: 0.6 }
        ],
        fold: 'rest'
    },

    // Aus dem SB
    SB_vs_UTG: {
        raise: ['AA', 'KK', 'QQ', 'AKs', 'AKo'],
        call: [],  // OOP vs UTG = sehr tight
        fold: 'rest'
    },
    SB_vs_HJ: {
        raise: ['AA', 'KK', 'QQ', 'JJ', 'AKs', 'AKo', 'AQs'],
        call: ['TT', '99'],
        fold: 'rest'
    },
    SB_vs_CO: {
        raise: ['AA', 'KK', 'QQ', 'JJ', 'TT', 'AKs', 'AKo', 'AQs', 'AQo', 'A5s', 'A4s'],
        call: ['99', '88', 'AJs', 'KQs'],
        fold: 'rest'
    },
    SB_vs_BTN: {
        raise: ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', 'AKs', 'AKo', 'AQs', 'AQo', 'AJs', 'ATs', 'A5s', 'A4s', 'A3s', 'KQs', 'KJs'],
        call: ['88', '77', '66', 'A9s', 'A8s', 'KTs', 'K9s', 'QJs', 'QTs', 'JTs', 'T9s', '98s', '87s', '76s'],
        fold: 'rest'
    },

    // Aus dem BB
    BB_vs_UTG: {
        raise: ['AA', 'KK', 'QQ', 'AKs', 'AKo'],
        call: ['TT', '99', '88', '77', '66', '55', '44', '33', '22', 'AQs', 'AJs', 'ATs', 'A9s', 'A4s', 'A3s', 'A2s', 'KQs', 'KJs', 'KTs', 'QJs', 'QTs', 'JTs', 'T9s', '98s', '87s', '76s', '65s', '54s'],
        mixed: [
            { hand: 'JJ', raise: 0.4, call: 0.6 },
            { hand: 'A5s', raise: 0.5, call: 0.5 }
        ],
        fold: 'rest'
    },
    BB_vs_HJ: {
        raise: ['AA', 'KK', 'QQ', 'AKs', 'AKo', 'AQs'],
        call: ['99', '88', '77', '66', '55', '44', '33', '22', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A3s', 'A2s', 'KQs', 'KJs', 'KTs', 'K9s', 'QJs', 'QTs', 'Q9s', 'JTs', 'J9s', 'T9s', 'T8s', '98s', '97s', '87s', '86s', '76s', '75s', '65s', '64s', '54s', '53s', '43s', 'KQo', 'KJo'],
        mixed: [
            { hand: 'JJ', raise: 0.6, call: 0.4 },
            { hand: 'TT', raise: 0.35, call: 0.65 },
            { hand: 'AJs', raise: 0.45, call: 0.55 },
            { hand: 'A5s', raise: 0.7, call: 0.3 },
            { hand: 'A4s', raise: 0.6, call: 0.4 }
        ],
        fold: 'rest'
    },
    BB_vs_CO: {
        raise: ['AA', 'KK', 'QQ', 'AKs', 'AKo', 'AQs', 'AQo'],
        call: ['88', '77', '66', '55', '44', '33', '22', 'A9s', 'A8s', 'A7s', 'A6s', 'A2s', 'KJs', 'KTs', 'K9s', 'K8s', 'K7s', 'QTs', 'Q9s', 'Q8s', 'JTs', 'J9s', 'J8s', 'T9s', 'T8s', 'T7s', '98s', '97s', '96s', '87s', '86s', '85s', '76s', '75s', '74s', '65s', '64s', '54s', '53s', '43s', 'KQo', 'KJo', 'KTo', 'QJo', 'QTo', 'JTo'],
        mixed: [
            { hand: 'JJ', raise: 0.7, call: 0.3 },
            { hand: 'TT', raise: 0.55, call: 0.45 },
            { hand: '99', raise: 0.35, call: 0.65 },
            { hand: 'AJs', raise: 0.6, call: 0.4 },
            { hand: 'ATs', raise: 0.4, call: 0.6 },
            { hand: 'A5s', raise: 0.75, call: 0.25 },
            { hand: 'A4s', raise: 0.7, call: 0.3 },
            { hand: 'A3s', raise: 0.6, call: 0.4 },
            { hand: 'KQs', raise: 0.55, call: 0.45 },
            { hand: 'QJs', raise: 0.35, call: 0.65 }
        ],
        fold: 'rest'
    },
    BB_vs_BTN: {
        raise: ['AA', 'KK', 'QQ', 'AKs', 'AKo', 'AQs', 'AQo'],
        call: ['55', '44', '33', '22', 'AJo', 'ATo', 'A9o', 'A6s', 'K7s', 'K6s', 'K5s', 'K4s', 'Q8s', 'Q7s', 'Q6s', 'J8s', 'J7s', 'T8s', 'T7s', '97s', '96s', '86s', '85s', '75s', '74s', '64s', '63s', '53s', '52s', '42s', '32s', 'KQo', 'KJo', 'KTo', 'K9o', 'QJo', 'QTo', 'Q9o', 'JTo', 'J9o', 'T9o', '98o', '87o', '76o'],
        mixed: [
            // Pocket Pairs
            { hand: 'JJ', raise: 0.75, call: 0.25 },
            { hand: 'TT', raise: 0.65, call: 0.35 },
            { hand: '99', raise: 0.5, call: 0.5 },
            { hand: '88', raise: 0.4, call: 0.6 },
            { hand: '77', raise: 0.3, call: 0.7 },
            { hand: '66', raise: 0.25, call: 0.75 },
            // Suited Aces
            { hand: 'AJs', raise: 0.7, call: 0.3 },
            { hand: 'ATs', raise: 0.6, call: 0.4 },
            { hand: 'A9s', raise: 0.5, call: 0.5 },
            { hand: 'A8s', raise: 0.4, call: 0.6 },
            { hand: 'A7s', raise: 0.35, call: 0.65 },
            { hand: 'A5s', raise: 0.7, call: 0.3 },
            { hand: 'A4s', raise: 0.65, call: 0.35 },
            { hand: 'A3s', raise: 0.55, call: 0.45 },
            { hand: 'A2s', raise: 0.45, call: 0.55 },
            // Suited Kings
            { hand: 'KQs', raise: 0.6, call: 0.4 },
            { hand: 'KJs', raise: 0.55, call: 0.45 },
            { hand: 'KTs', raise: 0.45, call: 0.55 },
            { hand: 'K9s', raise: 0.35, call: 0.65 },
            { hand: 'K8s', raise: 0.3, call: 0.7 },
            // Suited Queens
            { hand: 'QJs', raise: 0.5, call: 0.5 },
            { hand: 'QTs', raise: 0.4, call: 0.6 },
            { hand: 'Q9s', raise: 0.3, call: 0.7 },
            // Suited Connectors
            { hand: 'JTs', raise: 0.4, call: 0.6 },
            { hand: 'J9s', raise: 0.3, call: 0.7 },
            { hand: 'T9s', raise: 0.35, call: 0.65 },
            { hand: '98s', raise: 0.3, call: 0.7 },
            { hand: '87s', raise: 0.3, call: 0.7 },
            { hand: '76s', raise: 0.25, call: 0.75 },
            { hand: '65s', raise: 0.25, call: 0.75 },
            { hand: '54s', raise: 0.2, call: 0.8 },
            { hand: '43s', raise: 0.15, call: 0.85 }
        ],
        fold: 'rest'
    },
    BB_vs_SB: {
        raise: ['AA', 'KK', 'QQ', 'JJ', 'TT', 'AKs', 'AKo', 'AQs', 'AQo', 'AJs', 'AJo', 'ATs', 'KQs', 'KQo', 'KJs', 'KJo'],
        call: ['22', 'A2o', 'K7o', 'K6o', 'K5o', 'K4o', 'K3o', 'K2o', 'Q6o', 'Q5o', 'Q4o', 'Q3o', 'Q2o', 'J6o', 'J5o', 'J4o', 'J3o', 'T6o', 'T5o', 'T4o', '95o', '94o', '85o', '84o', '83o', '74o', '73o', '72o', '63o', '62o', '52o', '42o', '32o'],
        mixed: [
            // Pocket Pairs - kleinere sind oft Call/Raise Mix
            { hand: '99', raise: 0.8, call: 0.2 },
            { hand: '88', raise: 0.7, call: 0.3 },
            { hand: '77', raise: 0.6, call: 0.4 },
            { hand: '66', raise: 0.45, call: 0.55 },
            { hand: '55', raise: 0.35, call: 0.65 },
            { hand: '44', raise: 0.25, call: 0.75 },
            { hand: '33', raise: 0.2, call: 0.8 },
            // Suited Aces
            { hand: 'A9s', raise: 0.85, call: 0.15 },
            { hand: 'A8s', raise: 0.8, call: 0.2 },
            { hand: 'A7s', raise: 0.75, call: 0.25 },
            { hand: 'A6s', raise: 0.7, call: 0.3 },
            { hand: 'A5s', raise: 0.85, call: 0.15 },
            { hand: 'A4s', raise: 0.8, call: 0.2 },
            { hand: 'A3s', raise: 0.7, call: 0.3 },
            { hand: 'A2s', raise: 0.6, call: 0.4 },
            // Suited Kings
            { hand: 'KTs', raise: 0.85, call: 0.15 },
            { hand: 'K9s', raise: 0.75, call: 0.25 },
            { hand: 'K8s', raise: 0.6, call: 0.4 },
            { hand: 'K7s', raise: 0.45, call: 0.55 },
            { hand: 'K6s', raise: 0.35, call: 0.65 },
            { hand: 'K5s', raise: 0.3, call: 0.7 },
            { hand: 'K4s', raise: 0.25, call: 0.75 },
            { hand: 'K3s', raise: 0.2, call: 0.8 },
            { hand: 'K2s', raise: 0.15, call: 0.85 },
            // Suited Queens
            { hand: 'QJs', raise: 0.9, call: 0.1 },
            { hand: 'QTs', raise: 0.8, call: 0.2 },
            { hand: 'Q9s', raise: 0.65, call: 0.35 },
            { hand: 'Q8s', raise: 0.5, call: 0.5 },
            { hand: 'Q7s', raise: 0.35, call: 0.65 },
            { hand: 'Q6s', raise: 0.25, call: 0.75 },
            { hand: 'Q5s', raise: 0.2, call: 0.8 },
            { hand: 'Q4s', raise: 0.15, call: 0.85 },
            { hand: 'Q3s', raise: 0.1, call: 0.9 },
            { hand: 'Q2s', raise: 0.1, call: 0.9 },
            // Suited Jacks
            { hand: 'JTs', raise: 0.85, call: 0.15 },
            { hand: 'J9s', raise: 0.7, call: 0.3 },
            { hand: 'J8s', raise: 0.5, call: 0.5 },
            { hand: 'J7s', raise: 0.35, call: 0.65 },
            { hand: 'J6s', raise: 0.25, call: 0.75 },
            { hand: 'J5s', raise: 0.15, call: 0.85 },
            { hand: 'J4s', raise: 0.1, call: 0.9 },
            // Suited Tens
            { hand: 'T9s', raise: 0.8, call: 0.2 },
            { hand: 'T8s', raise: 0.6, call: 0.4 },
            { hand: 'T7s', raise: 0.4, call: 0.6 },
            { hand: 'T6s', raise: 0.25, call: 0.75 },
            { hand: 'T5s', raise: 0.15, call: 0.85 },
            // Suited Connectors & Gappers
            { hand: '98s', raise: 0.75, call: 0.25 },
            { hand: '97s', raise: 0.55, call: 0.45 },
            { hand: '96s', raise: 0.35, call: 0.65 },
            { hand: '95s', raise: 0.2, call: 0.8 },
            { hand: '87s', raise: 0.7, call: 0.3 },
            { hand: '86s', raise: 0.5, call: 0.5 },
            { hand: '85s', raise: 0.3, call: 0.7 },
            { hand: '84s', raise: 0.15, call: 0.85 },
            { hand: '76s', raise: 0.65, call: 0.35 },
            { hand: '75s', raise: 0.45, call: 0.55 },
            { hand: '74s', raise: 0.25, call: 0.75 },
            { hand: '73s', raise: 0.15, call: 0.85 },
            { hand: '65s', raise: 0.6, call: 0.4 },
            { hand: '64s', raise: 0.4, call: 0.6 },
            { hand: '63s', raise: 0.2, call: 0.8 },
            { hand: '54s', raise: 0.55, call: 0.45 },
            { hand: '53s', raise: 0.35, call: 0.65 },
            { hand: '52s', raise: 0.15, call: 0.85 },
            { hand: '43s', raise: 0.4, call: 0.6 },
            { hand: '42s', raise: 0.2, call: 0.8 },
            { hand: '32s', raise: 0.15, call: 0.85 },
            // Offsuit Aces
            { hand: 'ATo', raise: 0.75, call: 0.25 },
            { hand: 'A9o', raise: 0.6, call: 0.4 },
            { hand: 'A8o', raise: 0.5, call: 0.5 },
            { hand: 'A7o', raise: 0.4, call: 0.6 },
            { hand: 'A6o', raise: 0.3, call: 0.7 },
            { hand: 'A5o', raise: 0.45, call: 0.55 },
            { hand: 'A4o', raise: 0.35, call: 0.65 },
            { hand: 'A3o', raise: 0.25, call: 0.75 },
            // Offsuit Kings
            { hand: 'KTo', raise: 0.7, call: 0.3 },
            { hand: 'K9o', raise: 0.55, call: 0.45 },
            { hand: 'K8o', raise: 0.4, call: 0.6 },
            // Offsuit Queens
            { hand: 'QJo', raise: 0.75, call: 0.25 },
            { hand: 'QTo', raise: 0.6, call: 0.4 },
            { hand: 'Q9o', raise: 0.45, call: 0.55 },
            { hand: 'Q8o', raise: 0.3, call: 0.7 },
            { hand: 'Q7o', raise: 0.2, call: 0.8 },
            // Offsuit Jacks
            { hand: 'JTo', raise: 0.7, call: 0.3 },
            { hand: 'J9o', raise: 0.5, call: 0.5 },
            { hand: 'J8o', raise: 0.35, call: 0.65 },
            { hand: 'J7o', raise: 0.2, call: 0.8 },
            // Offsuit Tens & Lower
            { hand: 'T9o', raise: 0.6, call: 0.4 },
            { hand: 'T8o', raise: 0.4, call: 0.6 },
            { hand: 'T7o', raise: 0.25, call: 0.75 },
            { hand: '98o', raise: 0.5, call: 0.5 },
            { hand: '97o', raise: 0.35, call: 0.65 },
            { hand: '96o', raise: 0.2, call: 0.8 },
            { hand: '87o', raise: 0.45, call: 0.55 },
            { hand: '86o', raise: 0.3, call: 0.7 },
            { hand: '76o', raise: 0.4, call: 0.6 },
            { hand: '75o', raise: 0.25, call: 0.75 },
            { hand: '65o', raise: 0.35, call: 0.65 },
            { hand: '64o', raise: 0.2, call: 0.8 },
            { hand: '54o', raise: 0.3, call: 0.7 },
            { hand: '53o', raise: 0.15, call: 0.85 },
            { hand: '43o', raise: 0.2, call: 0.8 }
        ],
        fold: 'rest'
    }
};

// Facing 3-Bet Ranges - wie reagieren wir wenn wir öffnen und ge-3-bettet werden?
// Format: [opener position]_vs_[3bettor position]_3bet -> { fourbet: [...], call: [...], fold: 'rest' }
const FACING_3BET_RANGES = {
    // SB öffnet, BB 3-bettet - der wichtigste Spot!
    SB_vs_BB_3bet: {
        fourbet: [
            'AA', 'KK', 'QQ', 'AKs', 'AKo'
        ],
        call: [
            'JJ', 'TT', '99', '88', '77',
            'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s',
            'KQs', 'KJs', 'KTs', 'K9s', 'K8s',
            'QJs', 'QTs', 'Q9s',
            'JTs', 'J9s',
            'T9s', 'T8s',
            '98s', '97s',
            '87s', '86s',
            '76s', '75s',
            '65s', '64s',
            '54s',
            'AQo', 'AJo', 'ATo',
            'KQo', 'KJo'
        ],
        mixed: [
            // Premium Pairs mit 4-bet/call Mix
            { hand: 'JJ', fourbet: 0.4, call: 0.6 },
            { hand: 'TT', fourbet: 0.25, call: 0.75 },
            // Suited Aces als 4-bet Bluffs
            { hand: 'A5s', fourbet: 0.5, call: 0.5 },
            { hand: 'A4s', fourbet: 0.4, call: 0.6 },
            { hand: 'A3s', fourbet: 0.3, call: 0.7 }
        ],
        fold: 'rest'
    },

    // BTN öffnet, SB 3-bettet
    BTN_vs_SB_3bet: {
        fourbet: [
            'AA', 'KK', 'QQ', 'AKs', 'AKo'
        ],
        call: [
            'JJ', 'TT', '99', '88', '77', '66',
            'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s',
            'KQs', 'KJs', 'KTs', 'K9s',
            'QJs', 'QTs', 'Q9s',
            'JTs', 'J9s',
            'T9s', 'T8s',
            '98s', '97s',
            '87s', '86s',
            '76s', '75s',
            '65s',
            '54s',
            'AQo', 'AJo',
            'KQo'
        ],
        mixed: [
            { hand: 'JJ', fourbet: 0.5, call: 0.5 },
            { hand: 'TT', fourbet: 0.3, call: 0.7 },
            { hand: 'A5s', fourbet: 0.6, call: 0.4 },
            { hand: 'A4s', fourbet: 0.5, call: 0.5 }
        ],
        fold: 'rest'
    },

    // BTN öffnet, BB 3-bettet
    BTN_vs_BB_3bet: {
        fourbet: [
            'AA', 'KK', 'QQ', 'AKs', 'AKo'
        ],
        call: [
            'JJ', 'TT', '99', '88', '77', '66', '55',
            'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s',
            'KQs', 'KJs', 'KTs', 'K9s', 'K8s',
            'QJs', 'QTs', 'Q9s', 'Q8s',
            'JTs', 'J9s', 'J8s',
            'T9s', 'T8s',
            '98s', '97s',
            '87s', '86s',
            '76s', '75s',
            '65s', '64s',
            '54s', '53s',
            'AQo', 'AJo', 'ATo',
            'KQo', 'KJo',
            'QJo'
        ],
        mixed: [
            { hand: 'JJ', fourbet: 0.45, call: 0.55 },
            { hand: 'TT', fourbet: 0.3, call: 0.7 },
            { hand: '99', fourbet: 0.15, call: 0.85 },
            { hand: 'A5s', fourbet: 0.55, call: 0.45 },
            { hand: 'A4s', fourbet: 0.45, call: 0.55 },
            { hand: 'A3s', fourbet: 0.35, call: 0.65 }
        ],
        fold: 'rest'
    }
};

// Iso-Raise Ranges - wie reagieren wir auf Limper?
// Format: [hero position]_vs_[limper position]_limp -> { raise: [...], limp: [...], fold: 'rest' }
// Für Micro Stakes: Weite Iso-Ranges weil Limper oft weak sind
const ISO_RAISE_RANGES = {
    // === BTN vs Limper (beste Position, weiteste Range) ===
    BTN_vs_UTG_limp: {
        raise: [
            // Alle Pairs
            'AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44', '33', '22',
            // Suited Broadways + Aces
            'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s',
            'KQs', 'KJs', 'KTs', 'K9s', 'K8s',
            'QJs', 'QTs', 'Q9s',
            'JTs', 'J9s',
            'T9s', 'T8s',
            '98s', '97s',
            '87s', '86s',
            '76s', '75s',
            '65s', '64s',
            '54s',
            // Offsuit Broadways
            'AKo', 'AQo', 'AJo', 'ATo', 'A9o',
            'KQo', 'KJo', 'KTo',
            'QJo', 'QTo',
            'JTo'
        ],
        limp: [
            // Spekulative Hände die gut multiway spielen
            '43s', '32s',
            'K7s', 'K6s', 'K5s',
            'Q8s', 'Q7s',
            'J8s', 'J7s',
            'T7s',
            '96s', '85s', '74s', '63s', '53s', '42s'
        ],
        fold: 'rest'
    },

    BTN_vs_HJ_limp: {
        raise: [
            'AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44', '33', '22',
            'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s',
            'KQs', 'KJs', 'KTs', 'K9s', 'K8s', 'K7s',
            'QJs', 'QTs', 'Q9s', 'Q8s',
            'JTs', 'J9s', 'J8s',
            'T9s', 'T8s', 'T7s',
            '98s', '97s', '96s',
            '87s', '86s', '85s',
            '76s', '75s',
            '65s', '64s',
            '54s', '53s',
            '43s',
            'AKo', 'AQo', 'AJo', 'ATo', 'A9o', 'A8o',
            'KQo', 'KJo', 'KTo', 'K9o',
            'QJo', 'QTo',
            'JTo', 'J9o',
            'T9o'
        ],
        limp: [
            'K6s', 'K5s', 'K4s',
            'Q7s', 'Q6s',
            'J7s',
            '95s', '84s', '74s', '63s', '52s', '42s', '32s'
        ],
        fold: 'rest'
    },

    BTN_vs_CO_limp: {
        raise: [
            'AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44', '33', '22',
            'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s',
            'KQs', 'KJs', 'KTs', 'K9s', 'K8s', 'K7s', 'K6s',
            'QJs', 'QTs', 'Q9s', 'Q8s', 'Q7s',
            'JTs', 'J9s', 'J8s', 'J7s',
            'T9s', 'T8s', 'T7s',
            '98s', '97s', '96s',
            '87s', '86s', '85s',
            '76s', '75s', '74s',
            '65s', '64s', '63s',
            '54s', '53s', '52s',
            '43s', '42s',
            '32s',
            'AKo', 'AQo', 'AJo', 'ATo', 'A9o', 'A8o', 'A7o', 'A6o', 'A5o',
            'KQo', 'KJo', 'KTo', 'K9o', 'K8o',
            'QJo', 'QTo', 'Q9o',
            'JTo', 'J9o', 'J8o',
            'T9o', 'T8o',
            '98o', '97o',
            '87o', '86o',
            '76o'
        ],
        limp: [],
        fold: 'rest'
    },

    // === CO vs Limper ===
    CO_vs_UTG_limp: {
        raise: [
            'AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55',
            'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s',
            'KQs', 'KJs', 'KTs', 'K9s',
            'QJs', 'QTs', 'Q9s',
            'JTs', 'J9s',
            'T9s', 'T8s',
            '98s', '97s',
            '87s', '86s',
            '76s',
            '65s',
            '54s',
            'AKo', 'AQo', 'AJo', 'ATo',
            'KQo', 'KJo',
            'QJo'
        ],
        limp: [
            '44', '33', '22',
            'K8s', 'K7s',
            'Q8s',
            'J8s',
            '96s', '85s', '75s', '64s', '53s', '43s'
        ],
        fold: 'rest'
    },

    CO_vs_HJ_limp: {
        raise: [
            'AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44',
            'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s',
            'KQs', 'KJs', 'KTs', 'K9s', 'K8s',
            'QJs', 'QTs', 'Q9s', 'Q8s',
            'JTs', 'J9s', 'J8s',
            'T9s', 'T8s',
            '98s', '97s',
            '87s', '86s',
            '76s', '75s',
            '65s', '64s',
            '54s', '53s',
            '43s',
            'AKo', 'AQo', 'AJo', 'ATo', 'A9o',
            'KQo', 'KJo', 'KTo',
            'QJo', 'QTo',
            'JTo'
        ],
        limp: [
            '33', '22',
            'K7s', 'K6s',
            'Q7s',
            'J7s',
            'T7s',
            '96s', '85s', '74s', '63s', '52s'
        ],
        fold: 'rest'
    },

    // === HJ vs UTG Limper (tighter wegen Position) ===
    HJ_vs_UTG_limp: {
        raise: [
            'AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77',
            'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A5s', 'A4s',
            'KQs', 'KJs', 'KTs',
            'QJs', 'QTs',
            'JTs',
            'T9s',
            '98s',
            '87s',
            '76s',
            '65s',
            'AKo', 'AQo', 'AJo',
            'KQo'
        ],
        limp: [
            '66', '55', '44', '33', '22',
            'A8s', 'A7s', 'A6s', 'A3s', 'A2s',
            'K9s', 'K8s',
            'Q9s',
            'J9s',
            'T8s',
            '97s',
            '86s',
            '75s',
            '54s'
        ],
        fold: 'rest'
    },

    // === SB vs Limper (OOP, tighter aber trotzdem iso-raisen wegen Dead Money) ===
    SB_vs_UTG_limp: {
        raise: [
            'AA', 'KK', 'QQ', 'JJ', 'TT', '99',
            'AKs', 'AQs', 'AJs', 'ATs', 'A5s',
            'KQs', 'KJs',
            'QJs',
            'JTs',
            'AKo', 'AQo', 'AJo',
            'KQo'
        ],
        limp: [
            '88', '77', '66', '55', '44', '33', '22',
            'A9s', 'A8s', 'A7s', 'A6s', 'A4s', 'A3s', 'A2s',
            'KTs', 'K9s',
            'QTs', 'Q9s',
            'J9s',
            'T9s', 'T8s',
            '98s', '97s',
            '87s', '86s',
            '76s', '75s',
            '65s', '64s',
            '54s'
        ],
        fold: 'rest'
    },

    SB_vs_HJ_limp: {
        raise: [
            'AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88',
            'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A5s', 'A4s',
            'KQs', 'KJs', 'KTs',
            'QJs', 'QTs',
            'JTs',
            'T9s',
            '98s',
            'AKo', 'AQo', 'AJo', 'ATo',
            'KQo', 'KJo'
        ],
        limp: [
            '77', '66', '55', '44', '33', '22',
            'A8s', 'A7s', 'A6s', 'A3s', 'A2s',
            'K9s', 'K8s',
            'Q9s',
            'J9s',
            'T8s',
            '97s',
            '87s', '86s',
            '76s', '75s',
            '65s', '64s',
            '54s', '53s'
        ],
        fold: 'rest'
    },

    SB_vs_CO_limp: {
        raise: [
            'AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77',
            'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'A5s', 'A4s', 'A3s',
            'KQs', 'KJs', 'KTs', 'K9s',
            'QJs', 'QTs', 'Q9s',
            'JTs', 'J9s',
            'T9s', 'T8s',
            '98s', '97s',
            '87s',
            '76s',
            '65s',
            'AKo', 'AQo', 'AJo', 'ATo', 'A9o',
            'KQo', 'KJo', 'KTo',
            'QJo'
        ],
        limp: [
            '66', '55', '44', '33', '22',
            'A7s', 'A6s', 'A2s',
            'K8s', 'K7s',
            'Q8s',
            'J8s',
            '96s',
            '86s',
            '75s',
            '54s'
        ],
        fold: 'rest'
    },

    SB_vs_BTN_limp: {
        raise: [
            'AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66',
            'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A5s', 'A4s', 'A3s', 'A2s',
            'KQs', 'KJs', 'KTs', 'K9s', 'K8s',
            'QJs', 'QTs', 'Q9s', 'Q8s',
            'JTs', 'J9s', 'J8s',
            'T9s', 'T8s',
            '98s', '97s',
            '87s', '86s',
            '76s', '75s',
            '65s', '64s',
            '54s',
            'AKo', 'AQo', 'AJo', 'ATo', 'A9o', 'A8o',
            'KQo', 'KJo', 'KTo', 'K9o',
            'QJo', 'QTo',
            'JTo'
        ],
        limp: [
            '55', '44', '33', '22',
            'A6s',
            'K7s', 'K6s',
            'Q7s',
            'J7s',
            'T7s',
            '96s', '85s', '74s', '63s', '53s'
        ],
        fold: 'rest'
    },

    // === BB vs SB Limp (BB hat Position! Sehr aggressiv raisen) ===
    BB_vs_SB_limp: {
        raise: [
            // Sehr weite Value-Range
            'AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44',
            'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s',
            'KQs', 'KJs', 'KTs', 'K9s', 'K8s', 'K7s', 'K6s', 'K5s',
            'QJs', 'QTs', 'Q9s', 'Q8s', 'Q7s',
            'JTs', 'J9s', 'J8s', 'J7s',
            'T9s', 'T8s', 'T7s',
            '98s', '97s', '96s',
            '87s', '86s', '85s',
            '76s', '75s', '74s',
            '65s', '64s', '63s',
            '54s', '53s', '52s',
            '43s', '42s',
            '32s',
            'AKo', 'AQo', 'AJo', 'ATo', 'A9o', 'A8o', 'A7o', 'A6o', 'A5o', 'A4o', 'A3o', 'A2o',
            'KQo', 'KJo', 'KTo', 'K9o', 'K8o', 'K7o',
            'QJo', 'QTo', 'Q9o', 'Q8o',
            'JTo', 'J9o', 'J8o',
            'T9o', 'T8o',
            '98o', '97o',
            '87o', '86o',
            '76o', '75o',
            '65o', '64o',
            '54o'
        ],
        limp: [
            // Nur sehr marginale Hände checken
            '33', '22',
            'K4s', 'K3s', 'K2s',
            'Q6s', 'Q5s', 'Q4s', 'Q3s', 'Q2s',
            'J6s', 'J5s', 'J4s',
            'T6s', 'T5s', 'T4s',
            '95s', '94s',
            '84s', '83s',
            '73s', '72s',
            '62s',
            'K6o', 'K5o', 'K4o', 'K3o', 'K2o',
            'Q7o', 'Q6o', 'Q5o',
            'J7o', 'J6o',
            'T7o', 'T6o',
            '96o', '95o',
            '85o', '84o',
            '74o', '73o',
            '63o', '62o',
            '53o', '52o',
            '43o', '42o',
            '32o'
        ],
        fold: 'rest'  // Praktisch nichts folden
    }
};

// Export für app.js
window.POSITIONS = POSITIONS;
window.RFI_RANGES = RFI_RANGES;
window.THREEBET_RANGES = THREEBET_RANGES;
window.FACING_3BET_RANGES = FACING_3BET_RANGES;
window.ISO_RAISE_RANGES = ISO_RAISE_RANGES;
