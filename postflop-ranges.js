// Postflop C-Bet Ranges
// Basiert auf vereinfachten GTO-Heuristiken

// ============================================
// HAND-KATEGORIEN
// ============================================
// Die Hand + Board wird zu einer Kategorie evaluiert:
// - straight_flush: Straight Flush (5 aufeinanderfolgende + gleiche Farbe)
// - quads: Vierling (4 gleiche Karten)
// - flush: Flush (5 Karten gleiche Farbe)
// - straight: Straße (5 aufeinanderfolgende Karten)
// - full_house: Full House (Drilling + Paar)
// - trips: Trips (Hero trifft Board-Pair)
// - set: Drilling (Pocket Pair trifft Board)
// - two_pair: Zwei Paare
// - overpair: Pocket Pair > höchste Board-Karte
// - underpair_high: Pocket Pair zwischen höchster und zweithöchster Board-Karte (z.B. JJ auf Q62)
// - underpair_low: Pocket Pair unter zweithöchster Board-Karte (z.B. 55 auf Q62)
// - top_pair_good: Top Pair mit Kicker T+
// - top_pair_weak: Top Pair mit Kicker < T
// - second_pair: Zweithöchstes Paar
// - low_pair: Drittes Paar oder schlechter
// - flush_draw: 4 Karten zu Flush
// - oesd: Open-Ended Straight Draw (8 Outs)
// - gutshot: Gutshot Straight Draw (4 Outs)
// - overcards: Zwei Overcards zum Board
// - ace_high: Ace High ohne Paar
// - nothing: Keine signifikante Hand

// ============================================
// C-BET RANGES (Hero ist PFR)
// ============================================
// Format: Position_vs_Caller -> Texture -> { cbet, check, mixed }

const CBET_RANGES = {
    // ========================================
    // BTN vs BB (häufigster Spot)
    // ========================================
    BTN_vs_BB: {
        // Dry Board (z.B. A72r, K82r, Q73r)
        // BTN hat Range Advantage -> viel C-Bet
        dry: {
            cbet: [
                'straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips',
                'set', 'two_pair', 'overpair',
                'top_pair_good', 'top_pair_weak',
                'flush_draw', 'oesd'
            ],
            check: ['low_pair', 'nothing'],
            mixed: [
                { category: 'underpair_high', cbet: 0.6, check: 0.4 },
                { category: 'underpair_low', cbet: 0.35, check: 0.65 },
                { category: 'second_pair', cbet: 0.6, check: 0.4 },
                { category: 'gutshot', cbet: 0.7, check: 0.3 },
                { category: 'overcards', cbet: 0.65, check: 0.35 },
                { category: 'ace_high', cbet: 0.5, check: 0.5 }
            ]
        },

        // Wet Board (z.B. JT8 two-tone, 987 two-tone)
        // Mehr Caution, weniger C-Bet
        wet: {
            cbet: [
                'straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips',
                'set', 'two_pair', 'overpair',
                'top_pair_good', 'flush_draw', 'oesd'
            ],
            check: [
                'low_pair', 'gutshot', 'nothing'
            ],
            mixed: [
                { category: 'top_pair_weak', cbet: 0.5, check: 0.5 },
                { category: 'second_pair', cbet: 0.3, check: 0.7 },
                { category: 'overcards', cbet: 0.4, check: 0.6 },
                { category: 'ace_high', cbet: 0.3, check: 0.7 }
            ]
        },

        // Paired Board (z.B. 772, K44, A22)
        // Polarisiert: starke Hände und Bluffs
        paired: {
            cbet: [
                'straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips',
                'set', 'two_pair', 'overpair',
                'top_pair_good'
            ],
            check: [
                'second_pair', 'low_pair', 'nothing'
            ],
            mixed: [
                { category: 'top_pair_weak', cbet: 0.6, check: 0.4 },
                { category: 'flush_draw', cbet: 0.5, check: 0.5 },
                { category: 'oesd', cbet: 0.4, check: 0.6 },
                { category: 'overcards', cbet: 0.5, check: 0.5 },
                { category: 'ace_high', cbet: 0.45, check: 0.55 }
            ]
        },

        // Monotone Board (z.B. 8h5h2h - alle gleiche Farbe)
        // Sehr vorsichtig, wenig C-Bet
        monotone: {
            cbet: [
                'straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips',
                'set', 'two_pair', 'flush_draw'
            ],
            check: [
                'second_pair', 'low_pair', 'gutshot',
                'overcards', 'ace_high', 'nothing'
            ],
            mixed: [
                { category: 'overpair', cbet: 0.6, check: 0.4 },
                { category: 'top_pair_good', cbet: 0.5, check: 0.5 },
                { category: 'top_pair_weak', cbet: 0.3, check: 0.7 },
                { category: 'oesd', cbet: 0.4, check: 0.6 }
            ]
        },

        // Connected Board (z.B. 876, JT9, 654)
        // Sehr vorsichtig, Range Disadvantage für PFR
        connected: {
            cbet: [
                'straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips',
                'set', 'two_pair'
            ],
            check: [
                'second_pair', 'low_pair', 'ace_high', 'nothing'
            ],
            mixed: [
                { category: 'overpair', cbet: 0.5, check: 0.5 },
                { category: 'top_pair_good', cbet: 0.55, check: 0.45 },
                { category: 'top_pair_weak', cbet: 0.35, check: 0.65 },
                { category: 'flush_draw', cbet: 0.6, check: 0.4 },
                { category: 'oesd', cbet: 0.5, check: 0.5 },
                { category: 'gutshot', cbet: 0.4, check: 0.6 },
                { category: 'overcards', cbet: 0.45, check: 0.55 }
            ]
        }
    },

    // ========================================
    // CO vs BB
    // ========================================
    CO_vs_BB: {
        dry: {
            cbet: [
                'straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips',
                'set', 'two_pair', 'overpair',
                'top_pair_good', 'top_pair_weak',
                'flush_draw', 'oesd'
            ],
            check: ['low_pair', 'nothing'],
            mixed: [
                { category: 'second_pair', cbet: 0.55, check: 0.45 },
                { category: 'gutshot', cbet: 0.6, check: 0.4 },
                { category: 'overcards', cbet: 0.6, check: 0.4 },
                { category: 'ace_high', cbet: 0.45, check: 0.55 }
            ]
        },
        wet: {
            cbet: [
                'straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips',
                'set', 'two_pair', 'overpair',
                'top_pair_good', 'flush_draw', 'oesd'
            ],
            check: ['low_pair', 'nothing'],
            mixed: [
                { category: 'top_pair_weak', cbet: 0.45, check: 0.55 },
                { category: 'second_pair', cbet: 0.25, check: 0.75 },
                { category: 'gutshot', cbet: 0.35, check: 0.65 },
                { category: 'overcards', cbet: 0.35, check: 0.65 },
                { category: 'ace_high', cbet: 0.25, check: 0.75 }
            ]
        },
        paired: {
            cbet: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set', 'two_pair', 'overpair', 'top_pair_good'],
            check: ['second_pair', 'low_pair', 'nothing'],
            mixed: [
                { category: 'top_pair_weak', cbet: 0.55, check: 0.45 },
                { category: 'flush_draw', cbet: 0.45, check: 0.55 },
                { category: 'oesd', cbet: 0.35, check: 0.65 },
                { category: 'overcards', cbet: 0.45, check: 0.55 },
                { category: 'ace_high', cbet: 0.4, check: 0.6 }
            ]
        },
        monotone: {
            cbet: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set', 'two_pair', 'flush_draw'],
            check: ['second_pair', 'low_pair', 'gutshot', 'overcards', 'ace_high', 'nothing'],
            mixed: [
                { category: 'overpair', cbet: 0.55, check: 0.45 },
                { category: 'top_pair_good', cbet: 0.45, check: 0.55 },
                { category: 'top_pair_weak', cbet: 0.25, check: 0.75 },
                { category: 'oesd', cbet: 0.35, check: 0.65 }
            ]
        },
        connected: {
            cbet: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set', 'two_pair'],
            check: ['second_pair', 'low_pair', 'ace_high', 'nothing'],
            mixed: [
                { category: 'overpair', cbet: 0.45, check: 0.55 },
                { category: 'top_pair_good', cbet: 0.5, check: 0.5 },
                { category: 'top_pair_weak', cbet: 0.3, check: 0.7 },
                { category: 'flush_draw', cbet: 0.55, check: 0.45 },
                { category: 'oesd', cbet: 0.45, check: 0.55 },
                { category: 'gutshot', cbet: 0.35, check: 0.65 },
                { category: 'overcards', cbet: 0.4, check: 0.6 }
            ]
        }
    },

    // ========================================
    // SB vs BB (Blind Battle)
    // ========================================
    SB_vs_BB: {
        // SB hat Position Disadvantage -> weniger aggro
        dry: {
            cbet: [
                'straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips',
                'set', 'two_pair', 'overpair',
                'top_pair_good', 'flush_draw'
            ],
            check: ['low_pair', 'ace_high', 'nothing'],
            mixed: [
                { category: 'top_pair_weak', cbet: 0.5, check: 0.5 },
                { category: 'second_pair', cbet: 0.35, check: 0.65 },
                { category: 'oesd', cbet: 0.55, check: 0.45 },
                { category: 'gutshot', cbet: 0.4, check: 0.6 },
                { category: 'overcards', cbet: 0.45, check: 0.55 }
            ]
        },
        wet: {
            cbet: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set', 'two_pair', 'overpair', 'flush_draw', 'oesd'],
            check: ['low_pair', 'gutshot', 'ace_high', 'nothing'],
            mixed: [
                { category: 'top_pair_good', cbet: 0.55, check: 0.45 },
                { category: 'top_pair_weak', cbet: 0.35, check: 0.65 },
                { category: 'second_pair', cbet: 0.2, check: 0.8 },
                { category: 'overcards', cbet: 0.3, check: 0.7 }
            ]
        },
        paired: {
            cbet: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set', 'two_pair', 'overpair'],
            check: ['second_pair', 'low_pair', 'gutshot', 'nothing'],
            mixed: [
                { category: 'top_pair_good', cbet: 0.55, check: 0.45 },
                { category: 'top_pair_weak', cbet: 0.4, check: 0.6 },
                { category: 'flush_draw', cbet: 0.45, check: 0.55 },
                { category: 'oesd', cbet: 0.35, check: 0.65 },
                { category: 'overcards', cbet: 0.4, check: 0.6 },
                { category: 'ace_high', cbet: 0.35, check: 0.65 }
            ]
        },
        monotone: {
            cbet: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set', 'two_pair', 'flush_draw'],
            check: ['second_pair', 'low_pair', 'gutshot', 'overcards', 'ace_high', 'nothing'],
            mixed: [
                { category: 'overpair', cbet: 0.45, check: 0.55 },
                { category: 'top_pair_good', cbet: 0.35, check: 0.65 },
                { category: 'top_pair_weak', cbet: 0.2, check: 0.8 },
                { category: 'oesd', cbet: 0.3, check: 0.7 }
            ]
        },
        connected: {
            cbet: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set', 'two_pair'],
            check: ['second_pair', 'low_pair', 'ace_high', 'nothing'],
            mixed: [
                { category: 'overpair', cbet: 0.4, check: 0.6 },
                { category: 'top_pair_good', cbet: 0.45, check: 0.55 },
                { category: 'top_pair_weak', cbet: 0.25, check: 0.75 },
                { category: 'flush_draw', cbet: 0.5, check: 0.5 },
                { category: 'oesd', cbet: 0.4, check: 0.6 },
                { category: 'gutshot', cbet: 0.3, check: 0.7 },
                { category: 'overcards', cbet: 0.35, check: 0.65 }
            ]
        }
    }
};

// ============================================
// FACING C-BET RANGES (Hero ist Caller)
// ============================================
// Format: Position_vs_PFR -> Texture -> { fold, call, raise, mixed }

const FACING_CBET_RANGES = {
    // ========================================
    // BB vs BTN C-Bet
    // ========================================
    BB_vs_BTN: {
        dry: {
            raise: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set', 'two_pair'],
            call: [
                'overpair', 'top_pair_good', 'top_pair_weak',
                'second_pair', 'flush_draw', 'oesd'
            ],
            fold: ['nothing'],
            mixed: [
                { category: 'low_pair', call: 0.4, fold: 0.6 },
                { category: 'gutshot', call: 0.5, fold: 0.5 },
                { category: 'overcards', call: 0.35, fold: 0.65 },
                { category: 'ace_high', call: 0.25, fold: 0.75 }
            ]
        },
        wet: {
            raise: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set', 'two_pair', 'flush_draw', 'oesd'],
            call: [
                'overpair', 'top_pair_good', 'top_pair_weak',
                'second_pair'
            ],
            fold: ['ace_high', 'nothing'],
            mixed: [
                { category: 'low_pair', call: 0.35, fold: 0.65 },
                { category: 'gutshot', call: 0.55, fold: 0.45 },
                { category: 'overcards', call: 0.3, fold: 0.7 }
            ]
        },
        paired: {
            raise: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set'],
            call: [
                'two_pair', 'overpair', 'top_pair_good',
                'flush_draw', 'oesd'
            ],
            fold: ['low_pair', 'ace_high', 'nothing'],
            mixed: [
                { category: 'top_pair_weak', call: 0.7, fold: 0.3 },
                { category: 'second_pair', call: 0.5, fold: 0.5 },
                { category: 'gutshot', call: 0.45, fold: 0.55 },
                { category: 'overcards', call: 0.4, fold: 0.6 }
            ]
        },
        monotone: {
            raise: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'flush_draw'],
            call: [
                'set', 'two_pair', 'overpair',
                'top_pair_good', 'oesd'
            ],
            fold: ['low_pair', 'ace_high', 'nothing'],
            mixed: [
                { category: 'top_pair_weak', call: 0.6, fold: 0.4 },
                { category: 'second_pair', call: 0.4, fold: 0.6 },
                { category: 'gutshot', call: 0.35, fold: 0.65 },
                { category: 'overcards', call: 0.25, fold: 0.75 }
            ]
        },
        connected: {
            raise: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set', 'two_pair', 'oesd'],
            call: [
                'overpair', 'top_pair_good', 'top_pair_weak',
                'second_pair', 'flush_draw'
            ],
            fold: ['ace_high', 'nothing'],
            mixed: [
                { category: 'low_pair', call: 0.4, fold: 0.6 },
                { category: 'gutshot', call: 0.6, fold: 0.4 },
                { category: 'overcards', call: 0.35, fold: 0.65 }
            ]
        }
    },

    // ========================================
    // BB vs CO C-Bet
    // ========================================
    BB_vs_CO: {
        dry: {
            raise: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set', 'two_pair'],
            call: [
                'overpair', 'top_pair_good', 'top_pair_weak',
                'second_pair', 'flush_draw', 'oesd'
            ],
            fold: ['nothing'],
            mixed: [
                { category: 'low_pair', call: 0.35, fold: 0.65 },
                { category: 'gutshot', call: 0.45, fold: 0.55 },
                { category: 'overcards', call: 0.3, fold: 0.7 },
                { category: 'ace_high', call: 0.2, fold: 0.8 }
            ]
        },
        wet: {
            raise: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set', 'two_pair', 'flush_draw', 'oesd'],
            call: ['overpair', 'top_pair_good', 'top_pair_weak', 'second_pair'],
            fold: ['ace_high', 'nothing'],
            mixed: [
                { category: 'low_pair', call: 0.3, fold: 0.7 },
                { category: 'gutshot', call: 0.5, fold: 0.5 },
                { category: 'overcards', call: 0.25, fold: 0.75 }
            ]
        },
        paired: {
            raise: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set'],
            call: ['two_pair', 'overpair', 'top_pair_good', 'flush_draw', 'oesd'],
            fold: ['low_pair', 'ace_high', 'nothing'],
            mixed: [
                { category: 'top_pair_weak', call: 0.65, fold: 0.35 },
                { category: 'second_pair', call: 0.45, fold: 0.55 },
                { category: 'gutshot', call: 0.4, fold: 0.6 },
                { category: 'overcards', call: 0.35, fold: 0.65 }
            ]
        },
        monotone: {
            raise: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'flush_draw'],
            call: ['set', 'two_pair', 'overpair', 'top_pair_good', 'oesd'],
            fold: ['low_pair', 'ace_high', 'nothing'],
            mixed: [
                { category: 'top_pair_weak', call: 0.55, fold: 0.45 },
                { category: 'second_pair', call: 0.35, fold: 0.65 },
                { category: 'gutshot', call: 0.3, fold: 0.7 },
                { category: 'overcards', call: 0.2, fold: 0.8 }
            ]
        },
        connected: {
            raise: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set', 'two_pair', 'oesd'],
            call: ['overpair', 'top_pair_good', 'top_pair_weak', 'second_pair', 'flush_draw'],
            fold: ['ace_high', 'nothing'],
            mixed: [
                { category: 'low_pair', call: 0.35, fold: 0.65 },
                { category: 'gutshot', call: 0.55, fold: 0.45 },
                { category: 'overcards', call: 0.3, fold: 0.7 }
            ]
        }
    },

    // ========================================
    // BB vs SB C-Bet (Blind Battle)
    // ========================================
    BB_vs_SB: {
        // BB hat Position -> kann mehr defenden
        dry: {
            raise: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set', 'two_pair'],
            call: [
                'overpair', 'top_pair_good', 'top_pair_weak',
                'second_pair', 'flush_draw', 'oesd', 'gutshot'
            ],
            fold: ['nothing'],
            mixed: [
                { category: 'low_pair', call: 0.5, fold: 0.5 },
                { category: 'overcards', call: 0.45, fold: 0.55 },
                { category: 'ace_high', call: 0.35, fold: 0.65 }
            ]
        },
        wet: {
            raise: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set', 'two_pair', 'flush_draw', 'oesd'],
            call: ['overpair', 'top_pair_good', 'top_pair_weak', 'second_pair', 'gutshot'],
            fold: ['nothing'],
            mixed: [
                { category: 'low_pair', call: 0.45, fold: 0.55 },
                { category: 'overcards', call: 0.4, fold: 0.6 },
                { category: 'ace_high', call: 0.3, fold: 0.7 }
            ]
        },
        paired: {
            raise: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set'],
            call: ['two_pair', 'overpair', 'top_pair_good', 'top_pair_weak', 'flush_draw', 'oesd'],
            fold: ['nothing'],
            mixed: [
                { category: 'second_pair', call: 0.6, fold: 0.4 },
                { category: 'low_pair', call: 0.4, fold: 0.6 },
                { category: 'gutshot', call: 0.5, fold: 0.5 },
                { category: 'overcards', call: 0.45, fold: 0.55 },
                { category: 'ace_high', call: 0.35, fold: 0.65 }
            ]
        },
        monotone: {
            raise: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'flush_draw'],
            call: ['set', 'two_pair', 'overpair', 'top_pair_good', 'oesd'],
            fold: ['nothing'],
            mixed: [
                { category: 'top_pair_weak', call: 0.65, fold: 0.35 },
                { category: 'second_pair', call: 0.5, fold: 0.5 },
                { category: 'low_pair', call: 0.3, fold: 0.7 },
                { category: 'gutshot', call: 0.4, fold: 0.6 },
                { category: 'overcards', call: 0.3, fold: 0.7 },
                { category: 'ace_high', call: 0.2, fold: 0.8 }
            ]
        },
        connected: {
            raise: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set', 'two_pair', 'oesd'],
            call: ['overpair', 'top_pair_good', 'top_pair_weak', 'second_pair', 'flush_draw', 'gutshot'],
            fold: ['nothing'],
            mixed: [
                { category: 'low_pair', call: 0.5, fold: 0.5 },
                { category: 'overcards', call: 0.4, fold: 0.6 },
                { category: 'ace_high', call: 0.3, fold: 0.7 }
            ]
        }
    }
};

// ============================================
// HAND STRENGTH VALUES (für EV-Berechnung)
// ============================================
const HAND_CATEGORY_VALUES = {
    'straight_flush': 100,
    'quads': 99,
    'flush': 97,
    'straight': 96,
    'full_house': 98,
    'trips': 90,
    'set': 95,
    'two_pair': 85,
    'overpair': 80,
    'underpair_high': 55,
    'underpair_low': 40,
    'top_pair_good': 70,
    'top_pair_weak': 60,
    'second_pair': 45,
    'low_pair': 30,
    'flush_draw': 55,
    'oesd': 50,
    'gutshot': 35,
    'overcards': 25,
    'ace_high': 20,
    'nothing': 10
};

// ============================================
// TEXTURE DESCRIPTIONS (für UI)
// ============================================
const TEXTURE_INFO = {
    'dry': {
        name: 'Dry',
        description: 'Rainbow, unconnected, keine Draws',
        example: 'A♠ 7♥ 2♦'
    },
    'wet': {
        name: 'Wet',
        description: 'Flush Draw möglich, einige Connects',
        example: 'J♠ T♠ 4♥'
    },
    'paired': {
        name: 'Paired',
        description: 'Zwei gleiche Ränge auf dem Board',
        example: '7♠ 7♥ 2♦'
    },
    'monotone': {
        name: 'Monotone',
        description: 'Alle drei Karten gleiche Farbe',
        example: '8♥ 5♥ 2♥'
    },
    'connected': {
        name: 'Connected',
        description: 'Drei aufeinanderfolgende oder nahe Karten',
        example: '8♠ 7♥ 6♦'
    }
};

// Export für postflop.js
window.CBET_RANGES = CBET_RANGES;
window.FACING_CBET_RANGES = FACING_CBET_RANGES;
window.HAND_CATEGORY_VALUES = HAND_CATEGORY_VALUES;
window.TEXTURE_INFO = TEXTURE_INFO;
