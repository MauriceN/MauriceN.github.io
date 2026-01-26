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
    },

    // ========================================
    // CO vs BTN (CO öffnet, BTN callt)
    // BTN hat Position + stärkere Range als BB
    // ========================================
    CO_vs_BTN: {
        dry: {
            cbet: [
                'straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips',
                'set', 'two_pair', 'overpair', 'top_pair_good'
            ],
            check: ['low_pair', 'gutshot', 'ace_high', 'nothing'],
            mixed: [
                { category: 'top_pair_weak', cbet: 0.5, check: 0.5 },
                { category: 'second_pair', cbet: 0.35, check: 0.65 },
                { category: 'flush_draw', cbet: 0.6, check: 0.4 },
                { category: 'oesd', cbet: 0.55, check: 0.45 },
                { category: 'overcards', cbet: 0.4, check: 0.6 }
            ]
        },
        wet: {
            cbet: [
                'straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips',
                'set', 'two_pair', 'overpair'
            ],
            check: ['low_pair', 'gutshot', 'ace_high', 'nothing'],
            mixed: [
                { category: 'top_pair_good', cbet: 0.55, check: 0.45 },
                { category: 'top_pair_weak', cbet: 0.35, check: 0.65 },
                { category: 'second_pair', cbet: 0.2, check: 0.8 },
                { category: 'flush_draw', cbet: 0.5, check: 0.5 },
                { category: 'oesd', cbet: 0.45, check: 0.55 },
                { category: 'overcards', cbet: 0.25, check: 0.75 }
            ]
        },
        paired: {
            cbet: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set', 'two_pair', 'overpair'],
            check: ['second_pair', 'low_pair', 'gutshot', 'nothing'],
            mixed: [
                { category: 'top_pair_good', cbet: 0.5, check: 0.5 },
                { category: 'top_pair_weak', cbet: 0.35, check: 0.65 },
                { category: 'flush_draw', cbet: 0.4, check: 0.6 },
                { category: 'oesd', cbet: 0.3, check: 0.7 },
                { category: 'overcards', cbet: 0.35, check: 0.65 },
                { category: 'ace_high', cbet: 0.3, check: 0.7 }
            ]
        },
        monotone: {
            cbet: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set', 'two_pair', 'flush_draw'],
            check: ['second_pair', 'low_pair', 'gutshot', 'overcards', 'ace_high', 'nothing'],
            mixed: [
                { category: 'overpair', cbet: 0.4, check: 0.6 },
                { category: 'top_pair_good', cbet: 0.35, check: 0.65 },
                { category: 'top_pair_weak', cbet: 0.2, check: 0.8 },
                { category: 'oesd', cbet: 0.25, check: 0.75 }
            ]
        },
        connected: {
            cbet: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set', 'two_pair'],
            check: ['second_pair', 'low_pair', 'ace_high', 'nothing'],
            mixed: [
                { category: 'overpair', cbet: 0.35, check: 0.65 },
                { category: 'top_pair_good', cbet: 0.4, check: 0.6 },
                { category: 'top_pair_weak', cbet: 0.2, check: 0.8 },
                { category: 'flush_draw', cbet: 0.45, check: 0.55 },
                { category: 'oesd', cbet: 0.35, check: 0.65 },
                { category: 'gutshot', cbet: 0.25, check: 0.75 },
                { category: 'overcards', cbet: 0.3, check: 0.7 }
            ]
        }
    },

    // ========================================
    // BTN vs SB (BTN öffnet, SB callt)
    // SB hat keine Position, aber tightere Range
    // ========================================
    BTN_vs_SB: {
        dry: {
            cbet: [
                'straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips',
                'set', 'two_pair', 'overpair', 'top_pair_good', 'top_pair_weak',
                'flush_draw', 'oesd'
            ],
            check: ['low_pair', 'nothing'],
            mixed: [
                { category: 'second_pair', cbet: 0.55, check: 0.45 },
                { category: 'gutshot', cbet: 0.6, check: 0.4 },
                { category: 'overcards', cbet: 0.55, check: 0.45 },
                { category: 'ace_high', cbet: 0.45, check: 0.55 }
            ]
        },
        wet: {
            cbet: [
                'straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips',
                'set', 'two_pair', 'overpair', 'top_pair_good', 'flush_draw', 'oesd'
            ],
            check: ['low_pair', 'gutshot', 'ace_high', 'nothing'],
            mixed: [
                { category: 'top_pair_weak', cbet: 0.5, check: 0.5 },
                { category: 'second_pair', cbet: 0.3, check: 0.7 },
                { category: 'overcards', cbet: 0.35, check: 0.65 }
            ]
        },
        paired: {
            cbet: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set', 'two_pair', 'overpair', 'top_pair_good'],
            check: ['second_pair', 'low_pair', 'nothing'],
            mixed: [
                { category: 'top_pair_weak', cbet: 0.55, check: 0.45 },
                { category: 'flush_draw', cbet: 0.5, check: 0.5 },
                { category: 'oesd', cbet: 0.4, check: 0.6 },
                { category: 'gutshot', cbet: 0.35, check: 0.65 },
                { category: 'overcards', cbet: 0.45, check: 0.55 },
                { category: 'ace_high', cbet: 0.4, check: 0.6 }
            ]
        },
        monotone: {
            cbet: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set', 'two_pair', 'flush_draw'],
            check: ['second_pair', 'low_pair', 'gutshot', 'overcards', 'ace_high', 'nothing'],
            mixed: [
                { category: 'overpair', cbet: 0.5, check: 0.5 },
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
            raise: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set', 'two_pair', 'flush_draw_oesd'],
            call: [
                'overpair', 'top_pair_good', 'top_pair_weak',
                'second_pair', 'flush_draw', 'oesd',
                'pair_flush_draw', 'pair_oesd', 'flush_draw_gutshot'
            ],
            fold: ['nothing'],
            mixed: [
                { category: 'low_pair', call: 0.4, fold: 0.6 },
                { category: 'gutshot', call: 0.5, fold: 0.5 },
                { category: 'overcards', call: 0.35, fold: 0.65 },
                { category: 'ace_high', call: 0.25, fold: 0.75 },
                { category: 'pair_gutshot', call: 0.6, fold: 0.4 }
            ]
        },
        wet: {
            raise: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set', 'two_pair', 'flush_draw', 'oesd', 'flush_draw_oesd', 'pair_flush_draw'],
            call: [
                'overpair', 'top_pair_good', 'top_pair_weak',
                'second_pair', 'pair_oesd', 'flush_draw_gutshot'
            ],
            fold: ['ace_high', 'nothing'],
            mixed: [
                { category: 'low_pair', call: 0.35, fold: 0.65 },
                { category: 'gutshot', call: 0.55, fold: 0.45 },
                { category: 'overcards', call: 0.3, fold: 0.7 },
                { category: 'pair_gutshot', call: 0.55, fold: 0.45 }
            ]
        },
        paired: {
            raise: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set', 'flush_draw_oesd'],
            call: [
                'two_pair', 'overpair', 'top_pair_good',
                'flush_draw', 'oesd', 'pair_flush_draw', 'pair_oesd', 'flush_draw_gutshot'
            ],
            fold: ['low_pair', 'ace_high', 'nothing'],
            mixed: [
                { category: 'top_pair_weak', call: 0.7, fold: 0.3 },
                { category: 'second_pair', call: 0.5, fold: 0.5 },
                { category: 'gutshot', call: 0.45, fold: 0.55 },
                { category: 'overcards', call: 0.4, fold: 0.6 },
                { category: 'pair_gutshot', call: 0.5, fold: 0.5 }
            ]
        },
        monotone: {
            raise: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'flush_draw', 'flush_draw_oesd', 'pair_flush_draw'],
            call: [
                'set', 'two_pair', 'overpair',
                'top_pair_good', 'oesd', 'flush_draw_gutshot'
            ],
            fold: ['low_pair', 'ace_high', 'nothing', 'pair_oesd', 'pair_gutshot'],
            mixed: [
                { category: 'top_pair_weak', call: 0.6, fold: 0.4 },
                { category: 'second_pair', call: 0.4, fold: 0.6 },
                { category: 'gutshot', call: 0.35, fold: 0.65 },
                { category: 'overcards', call: 0.25, fold: 0.75 }
            ]
        },
        connected: {
            raise: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set', 'two_pair', 'oesd', 'flush_draw_oesd'],
            call: [
                'overpair', 'top_pair_good', 'top_pair_weak',
                'second_pair', 'flush_draw', 'pair_flush_draw', 'pair_oesd', 'flush_draw_gutshot'
            ],
            fold: ['ace_high', 'nothing'],
            mixed: [
                { category: 'low_pair', call: 0.4, fold: 0.6 },
                { category: 'gutshot', call: 0.6, fold: 0.4 },
                { category: 'overcards', call: 0.35, fold: 0.65 },
                { category: 'pair_gutshot', call: 0.6, fold: 0.4 }
            ]
        }
    },

    // ========================================
    // BB vs CO C-Bet
    // ========================================
    BB_vs_CO: {
        dry: {
            raise: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set', 'two_pair', 'flush_draw_oesd'],
            call: [
                'overpair', 'top_pair_good', 'top_pair_weak',
                'second_pair', 'flush_draw', 'oesd',
                'pair_flush_draw', 'pair_oesd', 'flush_draw_gutshot'
            ],
            fold: ['nothing'],
            mixed: [
                { category: 'low_pair', call: 0.35, fold: 0.65 },
                { category: 'gutshot', call: 0.45, fold: 0.55 },
                { category: 'overcards', call: 0.3, fold: 0.7 },
                { category: 'ace_high', call: 0.2, fold: 0.8 },
                { category: 'pair_gutshot', call: 0.55, fold: 0.45 }
            ]
        },
        wet: {
            raise: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set', 'two_pair', 'flush_draw', 'oesd', 'flush_draw_oesd', 'pair_flush_draw'],
            call: ['overpair', 'top_pair_good', 'top_pair_weak', 'second_pair', 'pair_oesd', 'flush_draw_gutshot'],
            fold: ['ace_high', 'nothing'],
            mixed: [
                { category: 'low_pair', call: 0.3, fold: 0.7 },
                { category: 'gutshot', call: 0.5, fold: 0.5 },
                { category: 'overcards', call: 0.25, fold: 0.75 },
                { category: 'pair_gutshot', call: 0.5, fold: 0.5 }
            ]
        },
        paired: {
            raise: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set', 'flush_draw_oesd'],
            call: ['two_pair', 'overpair', 'top_pair_good', 'flush_draw', 'oesd', 'pair_flush_draw', 'pair_oesd', 'flush_draw_gutshot'],
            fold: ['low_pair', 'ace_high', 'nothing'],
            mixed: [
                { category: 'top_pair_weak', call: 0.65, fold: 0.35 },
                { category: 'second_pair', call: 0.45, fold: 0.55 },
                { category: 'gutshot', call: 0.4, fold: 0.6 },
                { category: 'overcards', call: 0.35, fold: 0.65 },
                { category: 'pair_gutshot', call: 0.45, fold: 0.55 }
            ]
        },
        monotone: {
            raise: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'flush_draw', 'flush_draw_oesd', 'pair_flush_draw'],
            call: ['set', 'two_pair', 'overpair', 'top_pair_good', 'oesd', 'flush_draw_gutshot'],
            fold: ['low_pair', 'ace_high', 'nothing', 'pair_oesd', 'pair_gutshot'],
            mixed: [
                { category: 'top_pair_weak', call: 0.55, fold: 0.45 },
                { category: 'second_pair', call: 0.35, fold: 0.65 },
                { category: 'gutshot', call: 0.3, fold: 0.7 },
                { category: 'overcards', call: 0.2, fold: 0.8 }
            ]
        },
        connected: {
            raise: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set', 'two_pair', 'oesd', 'flush_draw_oesd'],
            call: ['overpair', 'top_pair_good', 'top_pair_weak', 'second_pair', 'flush_draw', 'pair_flush_draw', 'pair_oesd', 'flush_draw_gutshot'],
            fold: ['ace_high', 'nothing'],
            mixed: [
                { category: 'low_pair', call: 0.35, fold: 0.65 },
                { category: 'gutshot', call: 0.55, fold: 0.45 },
                { category: 'overcards', call: 0.3, fold: 0.7 },
                { category: 'pair_gutshot', call: 0.55, fold: 0.45 }
            ]
        }
    },

    // ========================================
    // BB vs SB C-Bet (Blind Battle)
    // ========================================
    BB_vs_SB: {
        // BB hat Position -> kann mehr defenden
        dry: {
            raise: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set', 'two_pair', 'flush_draw_oesd'],
            call: [
                'overpair', 'top_pair_good', 'top_pair_weak',
                'second_pair', 'flush_draw', 'oesd', 'gutshot',
                'pair_flush_draw', 'pair_oesd', 'flush_draw_gutshot', 'pair_gutshot'
            ],
            fold: ['nothing'],
            mixed: [
                { category: 'low_pair', call: 0.5, fold: 0.5 },
                { category: 'overcards', call: 0.45, fold: 0.55 },
                { category: 'ace_high', call: 0.35, fold: 0.65 }
            ]
        },
        wet: {
            raise: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set', 'two_pair', 'flush_draw', 'oesd', 'flush_draw_oesd', 'pair_flush_draw'],
            call: ['overpair', 'top_pair_good', 'top_pair_weak', 'second_pair', 'gutshot', 'pair_oesd', 'flush_draw_gutshot', 'pair_gutshot'],
            fold: ['nothing'],
            mixed: [
                { category: 'low_pair', call: 0.45, fold: 0.55 },
                { category: 'overcards', call: 0.4, fold: 0.6 },
                { category: 'ace_high', call: 0.3, fold: 0.7 }
            ]
        },
        paired: {
            raise: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set', 'flush_draw_oesd'],
            call: ['two_pair', 'overpair', 'top_pair_good', 'top_pair_weak', 'flush_draw', 'oesd', 'pair_flush_draw', 'pair_oesd', 'flush_draw_gutshot'],
            fold: ['nothing'],
            mixed: [
                { category: 'second_pair', call: 0.6, fold: 0.4 },
                { category: 'low_pair', call: 0.4, fold: 0.6 },
                { category: 'gutshot', call: 0.5, fold: 0.5 },
                { category: 'overcards', call: 0.45, fold: 0.55 },
                { category: 'ace_high', call: 0.35, fold: 0.65 },
                { category: 'pair_gutshot', call: 0.55, fold: 0.45 }
            ]
        },
        monotone: {
            raise: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'flush_draw', 'flush_draw_oesd', 'pair_flush_draw'],
            call: ['set', 'two_pair', 'overpair', 'top_pair_good', 'oesd', 'flush_draw_gutshot'],
            fold: ['nothing', 'pair_oesd', 'pair_gutshot'],
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
            raise: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set', 'two_pair', 'oesd', 'flush_draw_oesd'],
            call: ['overpair', 'top_pair_good', 'top_pair_weak', 'second_pair', 'flush_draw', 'gutshot', 'pair_flush_draw', 'pair_oesd', 'flush_draw_gutshot'],
            fold: ['nothing'],
            mixed: [
                { category: 'low_pair', call: 0.5, fold: 0.5 },
                { category: 'overcards', call: 0.4, fold: 0.6 },
                { category: 'ace_high', call: 0.3, fold: 0.7 },
                { category: 'pair_gutshot', call: 0.6, fold: 0.4 }
            ]
        }
    },

    // ========================================
    // BTN vs CO C-Bet (BTN callt CO's Open)
    // BTN hat Position + starke Calling Range
    // ========================================
    BTN_vs_CO: {
        dry: {
            raise: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set', 'two_pair', 'flush_draw_oesd'],
            call: [
                'overpair', 'top_pair_good', 'top_pair_weak',
                'second_pair', 'flush_draw', 'oesd', 'gutshot',
                'pair_flush_draw', 'pair_oesd', 'flush_draw_gutshot', 'pair_gutshot'
            ],
            fold: ['nothing'],
            mixed: [
                { category: 'low_pair', call: 0.55, fold: 0.45 },
                { category: 'overcards', call: 0.5, fold: 0.5 },
                { category: 'ace_high', call: 0.4, fold: 0.6 }
            ]
        },
        wet: {
            raise: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set', 'two_pair', 'flush_draw', 'oesd', 'flush_draw_oesd', 'pair_flush_draw'],
            call: ['overpair', 'top_pair_good', 'top_pair_weak', 'second_pair', 'gutshot', 'pair_oesd', 'flush_draw_gutshot', 'pair_gutshot'],
            fold: ['nothing'],
            mixed: [
                { category: 'low_pair', call: 0.5, fold: 0.5 },
                { category: 'overcards', call: 0.45, fold: 0.55 },
                { category: 'ace_high', call: 0.35, fold: 0.65 }
            ]
        },
        paired: {
            raise: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set', 'flush_draw_oesd'],
            call: ['two_pair', 'overpair', 'top_pair_good', 'top_pair_weak', 'flush_draw', 'oesd', 'pair_flush_draw', 'pair_oesd', 'flush_draw_gutshot'],
            fold: ['nothing'],
            mixed: [
                { category: 'second_pair', call: 0.65, fold: 0.35 },
                { category: 'low_pair', call: 0.45, fold: 0.55 },
                { category: 'gutshot', call: 0.55, fold: 0.45 },
                { category: 'overcards', call: 0.5, fold: 0.5 },
                { category: 'ace_high', call: 0.4, fold: 0.6 },
                { category: 'pair_gutshot', call: 0.6, fold: 0.4 }
            ]
        },
        monotone: {
            raise: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'flush_draw', 'flush_draw_oesd', 'pair_flush_draw'],
            call: ['set', 'two_pair', 'overpair', 'top_pair_good', 'oesd', 'flush_draw_gutshot'],
            fold: ['nothing', 'pair_oesd', 'pair_gutshot'],
            mixed: [
                { category: 'top_pair_weak', call: 0.7, fold: 0.3 },
                { category: 'second_pair', call: 0.55, fold: 0.45 },
                { category: 'low_pair', call: 0.35, fold: 0.65 },
                { category: 'gutshot', call: 0.45, fold: 0.55 },
                { category: 'overcards', call: 0.35, fold: 0.65 },
                { category: 'ace_high', call: 0.25, fold: 0.75 }
            ]
        },
        connected: {
            raise: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set', 'two_pair', 'oesd', 'flush_draw_oesd'],
            call: ['overpair', 'top_pair_good', 'top_pair_weak', 'second_pair', 'flush_draw', 'gutshot', 'pair_flush_draw', 'pair_oesd', 'flush_draw_gutshot'],
            fold: ['nothing'],
            mixed: [
                { category: 'low_pair', call: 0.55, fold: 0.45 },
                { category: 'overcards', call: 0.45, fold: 0.55 },
                { category: 'ace_high', call: 0.35, fold: 0.65 },
                { category: 'pair_gutshot', call: 0.6, fold: 0.4 }
            ]
        }
    },

    // ========================================
    // BTN vs HJ C-Bet (BTN callt HJ's Open)
    // BTN hat Position, HJ hat stärkere Range
    // ========================================
    BTN_vs_HJ: {
        dry: {
            raise: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set', 'two_pair'],
            call: [
                'overpair', 'top_pair_good', 'top_pair_weak',
                'second_pair', 'flush_draw', 'oesd',
                'flush_draw_oesd', 'pair_flush_draw', 'pair_oesd'
            ],
            fold: ['nothing'],
            mixed: [
                { category: 'low_pair', call: 0.45, fold: 0.55 },
                { category: 'gutshot', call: 0.55, fold: 0.45 },
                { category: 'overcards', call: 0.4, fold: 0.6 },
                { category: 'ace_high', call: 0.3, fold: 0.7 },
                { category: 'pair_gutshot', call: 0.6, fold: 0.4 },
                { category: 'flush_draw_gutshot', call: 0.7, fold: 0.3 }
            ]
        },
        wet: {
            raise: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set', 'two_pair', 'flush_draw', 'oesd', 'flush_draw_oesd', 'pair_flush_draw', 'pair_oesd'],
            call: ['overpair', 'top_pair_good', 'top_pair_weak', 'second_pair', 'flush_draw_gutshot', 'pair_gutshot'],
            fold: ['ace_high', 'nothing'],
            mixed: [
                { category: 'low_pair', call: 0.4, fold: 0.6 },
                { category: 'gutshot', call: 0.55, fold: 0.45 },
                { category: 'overcards', call: 0.35, fold: 0.65 }
            ]
        },
        paired: {
            raise: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set'],
            call: ['two_pair', 'overpair', 'top_pair_good', 'flush_draw', 'oesd', 'pair_flush_draw', 'pair_oesd', 'flush_draw_oesd'],
            fold: ['low_pair', 'nothing'],
            mixed: [
                { category: 'top_pair_weak', call: 0.7, fold: 0.3 },
                { category: 'second_pair', call: 0.55, fold: 0.45 },
                { category: 'gutshot', call: 0.5, fold: 0.5 },
                { category: 'overcards', call: 0.4, fold: 0.6 },
                { category: 'ace_high', call: 0.3, fold: 0.7 },
                { category: 'pair_gutshot', call: 0.55, fold: 0.45 },
                { category: 'flush_draw_gutshot', call: 0.65, fold: 0.35 }
            ]
        },
        monotone: {
            raise: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'flush_draw', 'flush_draw_oesd', 'pair_flush_draw'],
            call: ['set', 'two_pair', 'overpair', 'top_pair_good', 'oesd', 'flush_draw_gutshot'],
            fold: ['low_pair', 'ace_high', 'nothing', 'pair_oesd', 'pair_gutshot'],
            mixed: [
                { category: 'top_pair_weak', call: 0.6, fold: 0.4 },
                { category: 'second_pair', call: 0.45, fold: 0.55 },
                { category: 'gutshot', call: 0.4, fold: 0.6 },
                { category: 'overcards', call: 0.3, fold: 0.7 }
            ]
        },
        connected: {
            raise: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set', 'two_pair', 'oesd', 'flush_draw_oesd', 'pair_oesd'],
            call: ['overpair', 'top_pair_good', 'top_pair_weak', 'second_pair', 'flush_draw', 'pair_flush_draw', 'flush_draw_gutshot'],
            fold: ['ace_high', 'nothing'],
            mixed: [
                { category: 'low_pair', call: 0.45, fold: 0.55 },
                { category: 'gutshot', call: 0.6, fold: 0.4 },
                { category: 'overcards', call: 0.4, fold: 0.6 },
                { category: 'pair_gutshot', call: 0.55, fold: 0.45 }
            ]
        }
    },

    // ========================================
    // CO vs HJ C-Bet (CO callt HJ's Open)
    // CO hat Position, aber tightere Calling Range
    // ========================================
    CO_vs_HJ: {
        dry: {
            raise: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set', 'two_pair'],
            call: [
                'overpair', 'top_pair_good', 'top_pair_weak',
                'second_pair', 'flush_draw', 'oesd',
                'flush_draw_oesd', 'pair_flush_draw', 'pair_oesd'
            ],
            fold: ['nothing'],
            mixed: [
                { category: 'low_pair', call: 0.4, fold: 0.6 },
                { category: 'gutshot', call: 0.5, fold: 0.5 },
                { category: 'overcards', call: 0.35, fold: 0.65 },
                { category: 'ace_high', call: 0.25, fold: 0.75 },
                { category: 'pair_gutshot', call: 0.55, fold: 0.45 },
                { category: 'flush_draw_gutshot', call: 0.65, fold: 0.35 }
            ]
        },
        wet: {
            raise: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set', 'two_pair', 'flush_draw', 'oesd', 'flush_draw_oesd', 'pair_flush_draw', 'pair_oesd'],
            call: ['overpair', 'top_pair_good', 'top_pair_weak', 'second_pair', 'flush_draw_gutshot', 'pair_gutshot'],
            fold: ['ace_high', 'nothing'],
            mixed: [
                { category: 'low_pair', call: 0.35, fold: 0.65 },
                { category: 'gutshot', call: 0.5, fold: 0.5 },
                { category: 'overcards', call: 0.3, fold: 0.7 }
            ]
        },
        paired: {
            raise: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set'],
            call: ['two_pair', 'overpair', 'top_pair_good', 'flush_draw', 'oesd', 'pair_flush_draw', 'pair_oesd', 'flush_draw_oesd'],
            fold: ['low_pair', 'ace_high', 'nothing'],
            mixed: [
                { category: 'top_pair_weak', call: 0.65, fold: 0.35 },
                { category: 'second_pair', call: 0.5, fold: 0.5 },
                { category: 'gutshot', call: 0.45, fold: 0.55 },
                { category: 'overcards', call: 0.35, fold: 0.65 },
                { category: 'pair_gutshot', call: 0.5, fold: 0.5 },
                { category: 'flush_draw_gutshot', call: 0.6, fold: 0.4 }
            ]
        },
        monotone: {
            raise: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'flush_draw', 'flush_draw_oesd', 'pair_flush_draw'],
            call: ['set', 'two_pair', 'overpair', 'top_pair_good', 'oesd', 'flush_draw_gutshot'],
            fold: ['low_pair', 'ace_high', 'nothing', 'pair_oesd', 'pair_gutshot'],
            mixed: [
                { category: 'top_pair_weak', call: 0.55, fold: 0.45 },
                { category: 'second_pair', call: 0.4, fold: 0.6 },
                { category: 'gutshot', call: 0.35, fold: 0.65 },
                { category: 'overcards', call: 0.25, fold: 0.75 }
            ]
        },
        connected: {
            raise: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set', 'two_pair', 'oesd', 'flush_draw_oesd', 'pair_oesd'],
            call: ['overpair', 'top_pair_good', 'top_pair_weak', 'second_pair', 'flush_draw', 'pair_flush_draw', 'flush_draw_gutshot'],
            fold: ['ace_high', 'nothing'],
            mixed: [
                { category: 'low_pair', call: 0.4, fold: 0.6 },
                { category: 'gutshot', call: 0.55, fold: 0.45 },
                { category: 'overcards', call: 0.35, fold: 0.65 },
                { category: 'pair_gutshot', call: 0.5, fold: 0.5 }
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
    // Combo Draws - Pair + Draw (sehr stark wegen Outs)
    'pair_flush_draw': 65,      // ~12 Outs - stärker als Top Pair weak
    'pair_oesd': 60,            // ~11 Outs
    'pair_gutshot': 45,         // ~7 Outs
    // Monster Draws (Flush Draw + Straight Draw)
    'flush_draw_oesd': 75,      // ~15 Outs - Monster Draw!
    'flush_draw_gutshot': 65,   // ~12 Outs
    // Standard Draws
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

// ============================================
// TURN BARREL RANGES (Hero hat am Flop c-bettet, Villain callt)
// ============================================
// Format: Position_vs_Caller -> FlopTexture -> TurnBrought -> { barrel, check, mixed }
// TurnBrought: blank, flush_completing, straight_completing, pairing, connected

const TURN_BARREL_RANGES = {
    // ========================================
    // BTN vs BB Turn Barrels
    // ========================================
    BTN_vs_BB: {
        // Dry Flop Textures
        dry: {
            blank: {
                barrel: [
                    'straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips',
                    'set', 'two_pair', 'overpair', 'top_pair_good', 'flush_draw', 'oesd'
                ],
                check: ['second_pair', 'low_pair', 'gutshot', 'nothing'],
                mixed: [
                    { category: 'top_pair_weak', barrel: 0.6, check: 0.4 },
                    { category: 'overcards', barrel: 0.5, check: 0.5 },
                    { category: 'ace_high', barrel: 0.4, check: 0.6 }
                ]
            },
            flush_completing: {
                barrel: [
                    'straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips',
                    'set', 'two_pair'
                ],
                check: ['top_pair_weak', 'second_pair', 'low_pair', 'oesd', 'gutshot', 'overcards', 'ace_high', 'nothing'],
                mixed: [
                    { category: 'overpair', barrel: 0.5, check: 0.5 },
                    { category: 'top_pair_good', barrel: 0.4, check: 0.6 },
                    { category: 'flush_draw', barrel: 0.7, check: 0.3 }
                ]
            },
            straight_completing: {
                barrel: [
                    'straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips',
                    'set', 'two_pair'
                ],
                check: ['top_pair_weak', 'second_pair', 'low_pair', 'gutshot', 'ace_high', 'nothing'],
                mixed: [
                    { category: 'overpair', barrel: 0.5, check: 0.5 },
                    { category: 'top_pair_good', barrel: 0.45, check: 0.55 },
                    { category: 'flush_draw', barrel: 0.6, check: 0.4 },
                    { category: 'oesd', barrel: 0.55, check: 0.45 },
                    { category: 'overcards', barrel: 0.35, check: 0.65 }
                ]
            },
            pairing: {
                barrel: [
                    'straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips',
                    'set', 'two_pair', 'overpair', 'top_pair_good'
                ],
                check: ['second_pair', 'low_pair', 'gutshot', 'ace_high', 'nothing'],
                mixed: [
                    { category: 'top_pair_weak', barrel: 0.55, check: 0.45 },
                    { category: 'flush_draw', barrel: 0.5, check: 0.5 },
                    { category: 'oesd', barrel: 0.45, check: 0.55 },
                    { category: 'overcards', barrel: 0.4, check: 0.6 }
                ]
            },
            connected: {
                barrel: [
                    'straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips',
                    'set', 'two_pair', 'overpair'
                ],
                check: ['second_pair', 'low_pair', 'gutshot', 'ace_high', 'nothing'],
                mixed: [
                    { category: 'top_pair_good', barrel: 0.55, check: 0.45 },
                    { category: 'top_pair_weak', barrel: 0.4, check: 0.6 },
                    { category: 'flush_draw', barrel: 0.6, check: 0.4 },
                    { category: 'oesd', barrel: 0.55, check: 0.45 },
                    { category: 'overcards', barrel: 0.35, check: 0.65 }
                ]
            }
        },
        // Wet Flop Textures
        wet: {
            blank: {
                barrel: [
                    'straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips',
                    'set', 'two_pair', 'overpair', 'top_pair_good', 'flush_draw', 'oesd'
                ],
                check: ['second_pair', 'low_pair', 'gutshot', 'ace_high', 'nothing'],
                mixed: [
                    { category: 'top_pair_weak', barrel: 0.5, check: 0.5 },
                    { category: 'overcards', barrel: 0.4, check: 0.6 }
                ]
            },
            flush_completing: {
                barrel: [
                    'straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips',
                    'set'
                ],
                check: ['overpair', 'top_pair_good', 'top_pair_weak', 'second_pair', 'low_pair', 'oesd', 'gutshot', 'overcards', 'ace_high', 'nothing'],
                mixed: [
                    { category: 'two_pair', barrel: 0.6, check: 0.4 },
                    { category: 'flush_draw', barrel: 0.8, check: 0.2 }
                ]
            },
            straight_completing: {
                barrel: [
                    'straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips',
                    'set'
                ],
                check: ['top_pair_weak', 'second_pair', 'low_pair', 'gutshot', 'ace_high', 'nothing'],
                mixed: [
                    { category: 'two_pair', barrel: 0.55, check: 0.45 },
                    { category: 'overpair', barrel: 0.4, check: 0.6 },
                    { category: 'top_pair_good', barrel: 0.35, check: 0.65 },
                    { category: 'flush_draw', barrel: 0.55, check: 0.45 },
                    { category: 'oesd', barrel: 0.5, check: 0.5 },
                    { category: 'overcards', barrel: 0.3, check: 0.7 }
                ]
            },
            pairing: {
                barrel: [
                    'straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips',
                    'set', 'two_pair', 'overpair'
                ],
                check: ['second_pair', 'low_pair', 'gutshot', 'ace_high', 'nothing'],
                mixed: [
                    { category: 'top_pair_good', barrel: 0.55, check: 0.45 },
                    { category: 'top_pair_weak', barrel: 0.4, check: 0.6 },
                    { category: 'flush_draw', barrel: 0.5, check: 0.5 },
                    { category: 'oesd', barrel: 0.45, check: 0.55 },
                    { category: 'overcards', barrel: 0.35, check: 0.65 }
                ]
            },
            connected: {
                barrel: [
                    'straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips',
                    'set', 'two_pair'
                ],
                check: ['second_pair', 'low_pair', 'gutshot', 'ace_high', 'nothing'],
                mixed: [
                    { category: 'overpair', barrel: 0.45, check: 0.55 },
                    { category: 'top_pair_good', barrel: 0.4, check: 0.6 },
                    { category: 'top_pair_weak', barrel: 0.3, check: 0.7 },
                    { category: 'flush_draw', barrel: 0.55, check: 0.45 },
                    { category: 'oesd', barrel: 0.5, check: 0.5 },
                    { category: 'overcards', barrel: 0.3, check: 0.7 }
                ]
            }
        },
        // Paired Flop Textures
        paired: {
            blank: {
                barrel: [
                    'straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips',
                    'set', 'two_pair', 'overpair', 'top_pair_good'
                ],
                check: ['second_pair', 'low_pair', 'gutshot', 'nothing'],
                mixed: [
                    { category: 'top_pair_weak', barrel: 0.55, check: 0.45 },
                    { category: 'flush_draw', barrel: 0.5, check: 0.5 },
                    { category: 'oesd', barrel: 0.45, check: 0.55 },
                    { category: 'overcards', barrel: 0.45, check: 0.55 },
                    { category: 'ace_high', barrel: 0.4, check: 0.6 }
                ]
            },
            flush_completing: {
                barrel: [
                    'straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips',
                    'set'
                ],
                check: ['overpair', 'top_pair_good', 'top_pair_weak', 'second_pair', 'low_pair', 'oesd', 'gutshot', 'overcards', 'ace_high', 'nothing'],
                mixed: [
                    { category: 'two_pair', barrel: 0.5, check: 0.5 },
                    { category: 'flush_draw', barrel: 0.75, check: 0.25 }
                ]
            },
            straight_completing: {
                barrel: [
                    'straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips',
                    'set'
                ],
                check: ['top_pair_weak', 'second_pair', 'low_pair', 'gutshot', 'ace_high', 'nothing'],
                mixed: [
                    { category: 'two_pair', barrel: 0.5, check: 0.5 },
                    { category: 'overpair', barrel: 0.4, check: 0.6 },
                    { category: 'top_pair_good', barrel: 0.35, check: 0.65 },
                    { category: 'flush_draw', barrel: 0.5, check: 0.5 },
                    { category: 'oesd', barrel: 0.45, check: 0.55 },
                    { category: 'overcards', barrel: 0.35, check: 0.65 }
                ]
            },
            pairing: {
                barrel: [
                    'straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips',
                    'set'
                ],
                check: ['second_pair', 'low_pair', 'gutshot', 'ace_high', 'nothing'],
                mixed: [
                    { category: 'two_pair', barrel: 0.6, check: 0.4 },
                    { category: 'overpair', barrel: 0.5, check: 0.5 },
                    { category: 'top_pair_good', barrel: 0.45, check: 0.55 },
                    { category: 'top_pair_weak', barrel: 0.35, check: 0.65 },
                    { category: 'flush_draw', barrel: 0.45, check: 0.55 },
                    { category: 'oesd', barrel: 0.4, check: 0.6 },
                    { category: 'overcards', barrel: 0.35, check: 0.65 }
                ]
            },
            connected: {
                barrel: [
                    'straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips',
                    'set', 'two_pair'
                ],
                check: ['second_pair', 'low_pair', 'gutshot', 'ace_high', 'nothing'],
                mixed: [
                    { category: 'overpair', barrel: 0.45, check: 0.55 },
                    { category: 'top_pair_good', barrel: 0.4, check: 0.6 },
                    { category: 'top_pair_weak', barrel: 0.3, check: 0.7 },
                    { category: 'flush_draw', barrel: 0.5, check: 0.5 },
                    { category: 'oesd', barrel: 0.45, check: 0.55 },
                    { category: 'overcards', barrel: 0.35, check: 0.65 }
                ]
            }
        },
        // Monotone Flop Textures
        monotone: {
            blank: {
                barrel: [
                    'straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips',
                    'set', 'two_pair', 'flush_draw'
                ],
                check: ['top_pair_weak', 'second_pair', 'low_pair', 'oesd', 'gutshot', 'overcards', 'ace_high', 'nothing'],
                mixed: [
                    { category: 'overpair', barrel: 0.5, check: 0.5 },
                    { category: 'top_pair_good', barrel: 0.45, check: 0.55 }
                ]
            },
            flush_completing: {
                barrel: ['straight_flush', 'quads', 'flush', 'full_house'],
                check: ['straight', 'trips', 'set', 'two_pair', 'overpair', 'top_pair_good', 'top_pair_weak', 'second_pair', 'low_pair', 'oesd', 'gutshot', 'overcards', 'ace_high', 'nothing'],
                mixed: [
                    { category: 'flush_draw', barrel: 0.9, check: 0.1 }
                ]
            },
            straight_completing: {
                barrel: [
                    'straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips',
                    'set', 'flush_draw'
                ],
                check: ['overpair', 'top_pair_good', 'top_pair_weak', 'second_pair', 'low_pair', 'oesd', 'gutshot', 'overcards', 'ace_high', 'nothing'],
                mixed: [
                    { category: 'two_pair', barrel: 0.5, check: 0.5 }
                ]
            },
            pairing: {
                barrel: [
                    'straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips',
                    'set', 'flush_draw'
                ],
                check: ['overpair', 'top_pair_good', 'top_pair_weak', 'second_pair', 'low_pair', 'oesd', 'gutshot', 'overcards', 'ace_high', 'nothing'],
                mixed: [
                    { category: 'two_pair', barrel: 0.5, check: 0.5 }
                ]
            },
            connected: {
                barrel: [
                    'straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips',
                    'set', 'flush_draw'
                ],
                check: ['overpair', 'top_pair_good', 'top_pair_weak', 'second_pair', 'low_pair', 'oesd', 'gutshot', 'overcards', 'ace_high', 'nothing'],
                mixed: [
                    { category: 'two_pair', barrel: 0.45, check: 0.55 }
                ]
            }
        },
        // Connected Flop Textures
        connected: {
            blank: {
                barrel: [
                    'straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips',
                    'set', 'two_pair', 'flush_draw', 'oesd'
                ],
                check: ['second_pair', 'low_pair', 'gutshot', 'ace_high', 'nothing'],
                mixed: [
                    { category: 'overpair', barrel: 0.5, check: 0.5 },
                    { category: 'top_pair_good', barrel: 0.5, check: 0.5 },
                    { category: 'top_pair_weak', barrel: 0.35, check: 0.65 },
                    { category: 'overcards', barrel: 0.4, check: 0.6 }
                ]
            },
            flush_completing: {
                barrel: [
                    'straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips',
                    'set'
                ],
                check: ['overpair', 'top_pair_good', 'top_pair_weak', 'second_pair', 'low_pair', 'oesd', 'gutshot', 'overcards', 'ace_high', 'nothing'],
                mixed: [
                    { category: 'two_pair', barrel: 0.5, check: 0.5 },
                    { category: 'flush_draw', barrel: 0.8, check: 0.2 }
                ]
            },
            straight_completing: {
                barrel: [
                    'straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips',
                    'set'
                ],
                check: ['top_pair_weak', 'second_pair', 'low_pair', 'gutshot', 'ace_high', 'nothing'],
                mixed: [
                    { category: 'two_pair', barrel: 0.45, check: 0.55 },
                    { category: 'overpair', barrel: 0.35, check: 0.65 },
                    { category: 'top_pair_good', barrel: 0.3, check: 0.7 },
                    { category: 'flush_draw', barrel: 0.5, check: 0.5 },
                    { category: 'oesd', barrel: 0.45, check: 0.55 },
                    { category: 'overcards', barrel: 0.25, check: 0.75 }
                ]
            },
            pairing: {
                barrel: [
                    'straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips',
                    'set', 'two_pair'
                ],
                check: ['second_pair', 'low_pair', 'gutshot', 'ace_high', 'nothing'],
                mixed: [
                    { category: 'overpair', barrel: 0.45, check: 0.55 },
                    { category: 'top_pair_good', barrel: 0.4, check: 0.6 },
                    { category: 'top_pair_weak', barrel: 0.3, check: 0.7 },
                    { category: 'flush_draw', barrel: 0.5, check: 0.5 },
                    { category: 'oesd', barrel: 0.45, check: 0.55 },
                    { category: 'overcards', barrel: 0.35, check: 0.65 }
                ]
            },
            connected: {
                barrel: [
                    'straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips',
                    'set'
                ],
                check: ['second_pair', 'low_pair', 'gutshot', 'ace_high', 'nothing'],
                mixed: [
                    { category: 'two_pair', barrel: 0.5, check: 0.5 },
                    { category: 'overpair', barrel: 0.4, check: 0.6 },
                    { category: 'top_pair_good', barrel: 0.35, check: 0.65 },
                    { category: 'top_pair_weak', barrel: 0.25, check: 0.75 },
                    { category: 'flush_draw', barrel: 0.5, check: 0.5 },
                    { category: 'oesd', barrel: 0.45, check: 0.55 },
                    { category: 'overcards', barrel: 0.3, check: 0.7 }
                ]
            }
        }
    },

    // ========================================
    // CO vs BB Turn Barrels (ähnlich zu BTN, etwas tighter)
    // ========================================
    CO_vs_BB: {
        dry: {
            blank: {
                barrel: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set', 'two_pair', 'overpair', 'top_pair_good', 'flush_draw', 'oesd'],
                check: ['second_pair', 'low_pair', 'gutshot', 'nothing'],
                mixed: [
                    { category: 'top_pair_weak', barrel: 0.55, check: 0.45 },
                    { category: 'overcards', barrel: 0.45, check: 0.55 },
                    { category: 'ace_high', barrel: 0.35, check: 0.65 }
                ]
            },
            flush_completing: {
                barrel: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set', 'two_pair'],
                check: ['top_pair_weak', 'second_pair', 'low_pair', 'oesd', 'gutshot', 'overcards', 'ace_high', 'nothing'],
                mixed: [
                    { category: 'overpair', barrel: 0.45, check: 0.55 },
                    { category: 'top_pair_good', barrel: 0.35, check: 0.65 },
                    { category: 'flush_draw', barrel: 0.65, check: 0.35 }
                ]
            },
            straight_completing: {
                barrel: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set', 'two_pair'],
                check: ['top_pair_weak', 'second_pair', 'low_pair', 'gutshot', 'ace_high', 'nothing'],
                mixed: [
                    { category: 'overpair', barrel: 0.45, check: 0.55 },
                    { category: 'top_pair_good', barrel: 0.4, check: 0.6 },
                    { category: 'flush_draw', barrel: 0.55, check: 0.45 },
                    { category: 'oesd', barrel: 0.5, check: 0.5 },
                    { category: 'overcards', barrel: 0.3, check: 0.7 }
                ]
            },
            pairing: {
                barrel: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set', 'two_pair', 'overpair', 'top_pair_good'],
                check: ['second_pair', 'low_pair', 'gutshot', 'ace_high', 'nothing'],
                mixed: [
                    { category: 'top_pair_weak', barrel: 0.5, check: 0.5 },
                    { category: 'flush_draw', barrel: 0.45, check: 0.55 },
                    { category: 'oesd', barrel: 0.4, check: 0.6 },
                    { category: 'overcards', barrel: 0.35, check: 0.65 }
                ]
            },
            connected: {
                barrel: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set', 'two_pair', 'overpair'],
                check: ['second_pair', 'low_pair', 'gutshot', 'ace_high', 'nothing'],
                mixed: [
                    { category: 'top_pair_good', barrel: 0.5, check: 0.5 },
                    { category: 'top_pair_weak', barrel: 0.35, check: 0.65 },
                    { category: 'flush_draw', barrel: 0.55, check: 0.45 },
                    { category: 'oesd', barrel: 0.5, check: 0.5 },
                    { category: 'overcards', barrel: 0.3, check: 0.7 }
                ]
            }
        },
        wet: {
            blank: {
                barrel: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set', 'two_pair', 'overpair', 'top_pair_good', 'flush_draw', 'oesd'],
                check: ['second_pair', 'low_pair', 'gutshot', 'ace_high', 'nothing'],
                mixed: [
                    { category: 'top_pair_weak', barrel: 0.45, check: 0.55 },
                    { category: 'overcards', barrel: 0.35, check: 0.65 }
                ]
            },
            flush_completing: {
                barrel: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set'],
                check: ['overpair', 'top_pair_good', 'top_pair_weak', 'second_pair', 'low_pair', 'oesd', 'gutshot', 'overcards', 'ace_high', 'nothing'],
                mixed: [
                    { category: 'two_pair', barrel: 0.55, check: 0.45 },
                    { category: 'flush_draw', barrel: 0.75, check: 0.25 }
                ]
            },
            straight_completing: {
                barrel: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set'],
                check: ['top_pair_weak', 'second_pair', 'low_pair', 'gutshot', 'ace_high', 'nothing'],
                mixed: [
                    { category: 'two_pair', barrel: 0.5, check: 0.5 },
                    { category: 'overpair', barrel: 0.35, check: 0.65 },
                    { category: 'top_pair_good', barrel: 0.3, check: 0.7 },
                    { category: 'flush_draw', barrel: 0.5, check: 0.5 },
                    { category: 'oesd', barrel: 0.45, check: 0.55 },
                    { category: 'overcards', barrel: 0.25, check: 0.75 }
                ]
            },
            pairing: {
                barrel: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set', 'two_pair', 'overpair'],
                check: ['second_pair', 'low_pair', 'gutshot', 'ace_high', 'nothing'],
                mixed: [
                    { category: 'top_pair_good', barrel: 0.5, check: 0.5 },
                    { category: 'top_pair_weak', barrel: 0.35, check: 0.65 },
                    { category: 'flush_draw', barrel: 0.45, check: 0.55 },
                    { category: 'oesd', barrel: 0.4, check: 0.6 },
                    { category: 'overcards', barrel: 0.3, check: 0.7 }
                ]
            },
            connected: {
                barrel: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set', 'two_pair'],
                check: ['second_pair', 'low_pair', 'gutshot', 'ace_high', 'nothing'],
                mixed: [
                    { category: 'overpair', barrel: 0.4, check: 0.6 },
                    { category: 'top_pair_good', barrel: 0.35, check: 0.65 },
                    { category: 'top_pair_weak', barrel: 0.25, check: 0.75 },
                    { category: 'flush_draw', barrel: 0.5, check: 0.5 },
                    { category: 'oesd', barrel: 0.45, check: 0.55 },
                    { category: 'overcards', barrel: 0.25, check: 0.75 }
                ]
            }
        },
        paired: {
            blank: {
                barrel: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set', 'two_pair', 'overpair', 'top_pair_good'],
                check: ['second_pair', 'low_pair', 'gutshot', 'nothing'],
                mixed: [
                    { category: 'top_pair_weak', barrel: 0.5, check: 0.5 },
                    { category: 'flush_draw', barrel: 0.45, check: 0.55 },
                    { category: 'oesd', barrel: 0.4, check: 0.6 },
                    { category: 'overcards', barrel: 0.4, check: 0.6 },
                    { category: 'ace_high', barrel: 0.35, check: 0.65 }
                ]
            },
            flush_completing: {
                barrel: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set'],
                check: ['overpair', 'top_pair_good', 'top_pair_weak', 'second_pair', 'low_pair', 'oesd', 'gutshot', 'overcards', 'ace_high', 'nothing'],
                mixed: [
                    { category: 'two_pair', barrel: 0.45, check: 0.55 },
                    { category: 'flush_draw', barrel: 0.7, check: 0.3 }
                ]
            },
            straight_completing: {
                barrel: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set'],
                check: ['top_pair_weak', 'second_pair', 'low_pair', 'gutshot', 'ace_high', 'nothing'],
                mixed: [
                    { category: 'two_pair', barrel: 0.45, check: 0.55 },
                    { category: 'overpair', barrel: 0.35, check: 0.65 },
                    { category: 'top_pair_good', barrel: 0.3, check: 0.7 },
                    { category: 'flush_draw', barrel: 0.45, check: 0.55 },
                    { category: 'oesd', barrel: 0.4, check: 0.6 },
                    { category: 'overcards', barrel: 0.3, check: 0.7 }
                ]
            },
            pairing: {
                barrel: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set'],
                check: ['second_pair', 'low_pair', 'gutshot', 'ace_high', 'nothing'],
                mixed: [
                    { category: 'two_pair', barrel: 0.55, check: 0.45 },
                    { category: 'overpair', barrel: 0.45, check: 0.55 },
                    { category: 'top_pair_good', barrel: 0.4, check: 0.6 },
                    { category: 'top_pair_weak', barrel: 0.3, check: 0.7 },
                    { category: 'flush_draw', barrel: 0.4, check: 0.6 },
                    { category: 'oesd', barrel: 0.35, check: 0.65 },
                    { category: 'overcards', barrel: 0.3, check: 0.7 }
                ]
            },
            connected: {
                barrel: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set', 'two_pair'],
                check: ['second_pair', 'low_pair', 'gutshot', 'ace_high', 'nothing'],
                mixed: [
                    { category: 'overpair', barrel: 0.4, check: 0.6 },
                    { category: 'top_pair_good', barrel: 0.35, check: 0.65 },
                    { category: 'top_pair_weak', barrel: 0.25, check: 0.75 },
                    { category: 'flush_draw', barrel: 0.45, check: 0.55 },
                    { category: 'oesd', barrel: 0.4, check: 0.6 },
                    { category: 'overcards', barrel: 0.3, check: 0.7 }
                ]
            }
        },
        monotone: {
            blank: {
                barrel: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set', 'two_pair', 'flush_draw'],
                check: ['top_pair_weak', 'second_pair', 'low_pair', 'oesd', 'gutshot', 'overcards', 'ace_high', 'nothing'],
                mixed: [
                    { category: 'overpair', barrel: 0.45, check: 0.55 },
                    { category: 'top_pair_good', barrel: 0.4, check: 0.6 }
                ]
            },
            flush_completing: {
                barrel: ['straight_flush', 'quads', 'flush', 'full_house'],
                check: ['straight', 'trips', 'set', 'two_pair', 'overpair', 'top_pair_good', 'top_pair_weak', 'second_pair', 'low_pair', 'oesd', 'gutshot', 'overcards', 'ace_high', 'nothing'],
                mixed: [
                    { category: 'flush_draw', barrel: 0.85, check: 0.15 }
                ]
            },
            straight_completing: {
                barrel: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set', 'flush_draw'],
                check: ['overpair', 'top_pair_good', 'top_pair_weak', 'second_pair', 'low_pair', 'oesd', 'gutshot', 'overcards', 'ace_high', 'nothing'],
                mixed: [
                    { category: 'two_pair', barrel: 0.45, check: 0.55 }
                ]
            },
            pairing: {
                barrel: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set', 'flush_draw'],
                check: ['overpair', 'top_pair_good', 'top_pair_weak', 'second_pair', 'low_pair', 'oesd', 'gutshot', 'overcards', 'ace_high', 'nothing'],
                mixed: [
                    { category: 'two_pair', barrel: 0.45, check: 0.55 }
                ]
            },
            connected: {
                barrel: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set', 'flush_draw'],
                check: ['overpair', 'top_pair_good', 'top_pair_weak', 'second_pair', 'low_pair', 'oesd', 'gutshot', 'overcards', 'ace_high', 'nothing'],
                mixed: [
                    { category: 'two_pair', barrel: 0.4, check: 0.6 }
                ]
            }
        },
        connected: {
            blank: {
                barrel: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set', 'two_pair', 'flush_draw', 'oesd'],
                check: ['second_pair', 'low_pair', 'gutshot', 'ace_high', 'nothing'],
                mixed: [
                    { category: 'overpair', barrel: 0.45, check: 0.55 },
                    { category: 'top_pair_good', barrel: 0.45, check: 0.55 },
                    { category: 'top_pair_weak', barrel: 0.3, check: 0.7 },
                    { category: 'overcards', barrel: 0.35, check: 0.65 }
                ]
            },
            flush_completing: {
                barrel: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set'],
                check: ['overpair', 'top_pair_good', 'top_pair_weak', 'second_pair', 'low_pair', 'oesd', 'gutshot', 'overcards', 'ace_high', 'nothing'],
                mixed: [
                    { category: 'two_pair', barrel: 0.45, check: 0.55 },
                    { category: 'flush_draw', barrel: 0.75, check: 0.25 }
                ]
            },
            straight_completing: {
                barrel: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set'],
                check: ['top_pair_weak', 'second_pair', 'low_pair', 'gutshot', 'ace_high', 'nothing'],
                mixed: [
                    { category: 'two_pair', barrel: 0.4, check: 0.6 },
                    { category: 'overpair', barrel: 0.3, check: 0.7 },
                    { category: 'top_pair_good', barrel: 0.25, check: 0.75 },
                    { category: 'flush_draw', barrel: 0.45, check: 0.55 },
                    { category: 'oesd', barrel: 0.4, check: 0.6 },
                    { category: 'overcards', barrel: 0.2, check: 0.8 }
                ]
            },
            pairing: {
                barrel: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set', 'two_pair'],
                check: ['second_pair', 'low_pair', 'gutshot', 'ace_high', 'nothing'],
                mixed: [
                    { category: 'overpair', barrel: 0.4, check: 0.6 },
                    { category: 'top_pair_good', barrel: 0.35, check: 0.65 },
                    { category: 'top_pair_weak', barrel: 0.25, check: 0.75 },
                    { category: 'flush_draw', barrel: 0.45, check: 0.55 },
                    { category: 'oesd', barrel: 0.4, check: 0.6 },
                    { category: 'overcards', barrel: 0.3, check: 0.7 }
                ]
            },
            connected: {
                barrel: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set'],
                check: ['second_pair', 'low_pair', 'gutshot', 'ace_high', 'nothing'],
                mixed: [
                    { category: 'two_pair', barrel: 0.45, check: 0.55 },
                    { category: 'overpair', barrel: 0.35, check: 0.65 },
                    { category: 'top_pair_good', barrel: 0.3, check: 0.7 },
                    { category: 'top_pair_weak', barrel: 0.2, check: 0.8 },
                    { category: 'flush_draw', barrel: 0.45, check: 0.55 },
                    { category: 'oesd', barrel: 0.4, check: 0.6 },
                    { category: 'overcards', barrel: 0.25, check: 0.75 }
                ]
            }
        }
    },

    // ========================================
    // SB vs BB Turn Barrels (OOP, vorsichtiger)
    // ========================================
    SB_vs_BB: {
        dry: {
            blank: {
                barrel: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set', 'two_pair', 'overpair', 'top_pair_good', 'flush_draw'],
                check: ['second_pair', 'low_pair', 'gutshot', 'ace_high', 'nothing'],
                mixed: [
                    { category: 'top_pair_weak', barrel: 0.45, check: 0.55 },
                    { category: 'oesd', barrel: 0.5, check: 0.5 },
                    { category: 'overcards', barrel: 0.35, check: 0.65 }
                ]
            },
            flush_completing: {
                barrel: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set'],
                check: ['overpair', 'top_pair_good', 'top_pair_weak', 'second_pair', 'low_pair', 'oesd', 'gutshot', 'overcards', 'ace_high', 'nothing'],
                mixed: [
                    { category: 'two_pair', barrel: 0.5, check: 0.5 },
                    { category: 'flush_draw', barrel: 0.6, check: 0.4 }
                ]
            },
            straight_completing: {
                barrel: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set'],
                check: ['top_pair_weak', 'second_pair', 'low_pair', 'gutshot', 'ace_high', 'nothing'],
                mixed: [
                    { category: 'two_pair', barrel: 0.5, check: 0.5 },
                    { category: 'overpair', barrel: 0.4, check: 0.6 },
                    { category: 'top_pair_good', barrel: 0.35, check: 0.65 },
                    { category: 'flush_draw', barrel: 0.45, check: 0.55 },
                    { category: 'oesd', barrel: 0.4, check: 0.6 },
                    { category: 'overcards', barrel: 0.25, check: 0.75 }
                ]
            },
            pairing: {
                barrel: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set', 'two_pair', 'overpair'],
                check: ['second_pair', 'low_pair', 'gutshot', 'ace_high', 'nothing'],
                mixed: [
                    { category: 'top_pair_good', barrel: 0.5, check: 0.5 },
                    { category: 'top_pair_weak', barrel: 0.35, check: 0.65 },
                    { category: 'flush_draw', barrel: 0.4, check: 0.6 },
                    { category: 'oesd', barrel: 0.35, check: 0.65 },
                    { category: 'overcards', barrel: 0.3, check: 0.7 }
                ]
            },
            connected: {
                barrel: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set', 'two_pair'],
                check: ['second_pair', 'low_pair', 'gutshot', 'ace_high', 'nothing'],
                mixed: [
                    { category: 'overpair', barrel: 0.4, check: 0.6 },
                    { category: 'top_pair_good', barrel: 0.4, check: 0.6 },
                    { category: 'top_pair_weak', barrel: 0.25, check: 0.75 },
                    { category: 'flush_draw', barrel: 0.45, check: 0.55 },
                    { category: 'oesd', barrel: 0.4, check: 0.6 },
                    { category: 'overcards', barrel: 0.25, check: 0.75 }
                ]
            }
        },
        wet: {
            blank: {
                barrel: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set', 'two_pair', 'overpair', 'flush_draw', 'oesd'],
                check: ['second_pair', 'low_pair', 'gutshot', 'ace_high', 'nothing'],
                mixed: [
                    { category: 'top_pair_good', barrel: 0.5, check: 0.5 },
                    { category: 'top_pair_weak', barrel: 0.35, check: 0.65 },
                    { category: 'overcards', barrel: 0.3, check: 0.7 }
                ]
            },
            flush_completing: {
                barrel: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set'],
                check: ['two_pair', 'overpair', 'top_pair_good', 'top_pair_weak', 'second_pair', 'low_pair', 'oesd', 'gutshot', 'overcards', 'ace_high', 'nothing'],
                mixed: [
                    { category: 'flush_draw', barrel: 0.7, check: 0.3 }
                ]
            },
            straight_completing: {
                barrel: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set'],
                check: ['top_pair_weak', 'second_pair', 'low_pair', 'gutshot', 'ace_high', 'nothing'],
                mixed: [
                    { category: 'two_pair', barrel: 0.45, check: 0.55 },
                    { category: 'overpair', barrel: 0.3, check: 0.7 },
                    { category: 'top_pair_good', barrel: 0.25, check: 0.75 },
                    { category: 'flush_draw', barrel: 0.4, check: 0.6 },
                    { category: 'oesd', barrel: 0.35, check: 0.65 },
                    { category: 'overcards', barrel: 0.2, check: 0.8 }
                ]
            },
            pairing: {
                barrel: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set', 'two_pair'],
                check: ['second_pair', 'low_pair', 'gutshot', 'ace_high', 'nothing'],
                mixed: [
                    { category: 'overpair', barrel: 0.45, check: 0.55 },
                    { category: 'top_pair_good', barrel: 0.4, check: 0.6 },
                    { category: 'top_pair_weak', barrel: 0.25, check: 0.75 },
                    { category: 'flush_draw', barrel: 0.35, check: 0.65 },
                    { category: 'oesd', barrel: 0.3, check: 0.7 },
                    { category: 'overcards', barrel: 0.25, check: 0.75 }
                ]
            },
            connected: {
                barrel: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set'],
                check: ['second_pair', 'low_pair', 'gutshot', 'ace_high', 'nothing'],
                mixed: [
                    { category: 'two_pair', barrel: 0.45, check: 0.55 },
                    { category: 'overpair', barrel: 0.35, check: 0.65 },
                    { category: 'top_pair_good', barrel: 0.3, check: 0.7 },
                    { category: 'top_pair_weak', barrel: 0.2, check: 0.8 },
                    { category: 'flush_draw', barrel: 0.4, check: 0.6 },
                    { category: 'oesd', barrel: 0.35, check: 0.65 },
                    { category: 'overcards', barrel: 0.2, check: 0.8 }
                ]
            }
        },
        paired: {
            blank: {
                barrel: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set', 'two_pair', 'overpair'],
                check: ['second_pair', 'low_pair', 'gutshot', 'nothing'],
                mixed: [
                    { category: 'top_pair_good', barrel: 0.5, check: 0.5 },
                    { category: 'top_pair_weak', barrel: 0.35, check: 0.65 },
                    { category: 'flush_draw', barrel: 0.4, check: 0.6 },
                    { category: 'oesd', barrel: 0.35, check: 0.65 },
                    { category: 'overcards', barrel: 0.35, check: 0.65 },
                    { category: 'ace_high', barrel: 0.3, check: 0.7 }
                ]
            },
            flush_completing: {
                barrel: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set'],
                check: ['two_pair', 'overpair', 'top_pair_good', 'top_pair_weak', 'second_pair', 'low_pair', 'oesd', 'gutshot', 'overcards', 'ace_high', 'nothing'],
                mixed: [
                    { category: 'flush_draw', barrel: 0.65, check: 0.35 }
                ]
            },
            straight_completing: {
                barrel: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set'],
                check: ['top_pair_weak', 'second_pair', 'low_pair', 'gutshot', 'ace_high', 'nothing'],
                mixed: [
                    { category: 'two_pair', barrel: 0.4, check: 0.6 },
                    { category: 'overpair', barrel: 0.3, check: 0.7 },
                    { category: 'top_pair_good', barrel: 0.25, check: 0.75 },
                    { category: 'flush_draw', barrel: 0.35, check: 0.65 },
                    { category: 'oesd', barrel: 0.3, check: 0.7 },
                    { category: 'overcards', barrel: 0.25, check: 0.75 }
                ]
            },
            pairing: {
                barrel: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set'],
                check: ['second_pair', 'low_pair', 'gutshot', 'ace_high', 'nothing'],
                mixed: [
                    { category: 'two_pair', barrel: 0.5, check: 0.5 },
                    { category: 'overpair', barrel: 0.4, check: 0.6 },
                    { category: 'top_pair_good', barrel: 0.35, check: 0.65 },
                    { category: 'top_pair_weak', barrel: 0.25, check: 0.75 },
                    { category: 'flush_draw', barrel: 0.3, check: 0.7 },
                    { category: 'oesd', barrel: 0.25, check: 0.75 },
                    { category: 'overcards', barrel: 0.25, check: 0.75 }
                ]
            },
            connected: {
                barrel: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set'],
                check: ['second_pair', 'low_pair', 'gutshot', 'ace_high', 'nothing'],
                mixed: [
                    { category: 'two_pair', barrel: 0.45, check: 0.55 },
                    { category: 'overpair', barrel: 0.35, check: 0.65 },
                    { category: 'top_pair_good', barrel: 0.3, check: 0.7 },
                    { category: 'top_pair_weak', barrel: 0.2, check: 0.8 },
                    { category: 'flush_draw', barrel: 0.35, check: 0.65 },
                    { category: 'oesd', barrel: 0.3, check: 0.7 },
                    { category: 'overcards', barrel: 0.25, check: 0.75 }
                ]
            }
        },
        monotone: {
            blank: {
                barrel: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set', 'two_pair', 'flush_draw'],
                check: ['top_pair_weak', 'second_pair', 'low_pair', 'oesd', 'gutshot', 'overcards', 'ace_high', 'nothing'],
                mixed: [
                    { category: 'overpair', barrel: 0.4, check: 0.6 },
                    { category: 'top_pair_good', barrel: 0.35, check: 0.65 }
                ]
            },
            flush_completing: {
                barrel: ['straight_flush', 'quads', 'flush', 'full_house'],
                check: ['straight', 'trips', 'set', 'two_pair', 'overpair', 'top_pair_good', 'top_pair_weak', 'second_pair', 'low_pair', 'oesd', 'gutshot', 'overcards', 'ace_high', 'nothing'],
                mixed: [
                    { category: 'flush_draw', barrel: 0.8, check: 0.2 }
                ]
            },
            straight_completing: {
                barrel: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set', 'flush_draw'],
                check: ['two_pair', 'overpair', 'top_pair_good', 'top_pair_weak', 'second_pair', 'low_pair', 'oesd', 'gutshot', 'overcards', 'ace_high', 'nothing'],
                mixed: []
            },
            pairing: {
                barrel: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set', 'flush_draw'],
                check: ['two_pair', 'overpair', 'top_pair_good', 'top_pair_weak', 'second_pair', 'low_pair', 'oesd', 'gutshot', 'overcards', 'ace_high', 'nothing'],
                mixed: []
            },
            connected: {
                barrel: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set', 'flush_draw'],
                check: ['two_pair', 'overpair', 'top_pair_good', 'top_pair_weak', 'second_pair', 'low_pair', 'oesd', 'gutshot', 'overcards', 'ace_high', 'nothing'],
                mixed: []
            }
        },
        connected: {
            blank: {
                barrel: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set', 'two_pair', 'flush_draw', 'oesd'],
                check: ['second_pair', 'low_pair', 'gutshot', 'ace_high', 'nothing'],
                mixed: [
                    { category: 'overpair', barrel: 0.4, check: 0.6 },
                    { category: 'top_pair_good', barrel: 0.4, check: 0.6 },
                    { category: 'top_pair_weak', barrel: 0.25, check: 0.75 },
                    { category: 'overcards', barrier: 0.3, check: 0.7 }
                ]
            },
            flush_completing: {
                barrel: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set'],
                check: ['two_pair', 'overpair', 'top_pair_good', 'top_pair_weak', 'second_pair', 'low_pair', 'oesd', 'gutshot', 'overcards', 'ace_high', 'nothing'],
                mixed: [
                    { category: 'flush_draw', barrel: 0.7, check: 0.3 }
                ]
            },
            straight_completing: {
                barrel: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set'],
                check: ['top_pair_weak', 'second_pair', 'low_pair', 'gutshot', 'ace_high', 'nothing'],
                mixed: [
                    { category: 'two_pair', barrel: 0.35, check: 0.65 },
                    { category: 'overpair', barrel: 0.25, check: 0.75 },
                    { category: 'top_pair_good', barrel: 0.2, check: 0.8 },
                    { category: 'flush_draw', barrel: 0.35, check: 0.65 },
                    { category: 'oesd', barrel: 0.3, check: 0.7 },
                    { category: 'overcards', barrel: 0.15, check: 0.85 }
                ]
            },
            pairing: {
                barrel: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set'],
                check: ['second_pair', 'low_pair', 'gutshot', 'ace_high', 'nothing'],
                mixed: [
                    { category: 'two_pair', barrel: 0.45, check: 0.55 },
                    { category: 'overpair', barrel: 0.35, check: 0.65 },
                    { category: 'top_pair_good', barrel: 0.3, check: 0.7 },
                    { category: 'top_pair_weak', barrel: 0.2, check: 0.8 },
                    { category: 'flush_draw', barrel: 0.35, check: 0.65 },
                    { category: 'oesd', barrel: 0.3, check: 0.7 },
                    { category: 'overcards', barrel: 0.25, check: 0.75 }
                ]
            },
            connected: {
                barrel: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set'],
                check: ['second_pair', 'low_pair', 'gutshot', 'ace_high', 'nothing'],
                mixed: [
                    { category: 'two_pair', barrel: 0.4, check: 0.6 },
                    { category: 'overpair', barrel: 0.3, check: 0.7 },
                    { category: 'top_pair_good', barrel: 0.25, check: 0.75 },
                    { category: 'top_pair_weak', barrel: 0.15, check: 0.85 },
                    { category: 'flush_draw', barrel: 0.35, check: 0.65 },
                    { category: 'oesd', barrel: 0.3, check: 0.7 },
                    { category: 'overcards', barrel: 0.2, check: 0.8 }
                ]
            }
        }
    },

    // CO_vs_BTN und BTN_vs_SB verwenden ähnliche Strukturen wie oben
    // Für den Start verwenden wir BTN_vs_BB als Fallback
    CO_vs_BTN: null, // Wird von Code als Fallback zu BTN_vs_BB behandelt
    BTN_vs_SB: null  // Wird von Code als Fallback zu BTN_vs_BB behandelt
};

// ============================================
// DELAYED C-BET RANGES (Turn nach Flop-Check)
// ============================================
// Nach einem Check auf dem Flop zeigen wir Schwäche.
// Am Turn betten wir mit: Traps, verbesserte Hände, Draws die ankommen, selektive Bluffs.
// Generell: Tighter als nach C-Bet, da Villain Range stärker ist.

const DELAYED_CBET_RANGES = {
    // ========================================
    // BTN vs BB Delayed C-Bet
    // ========================================
    BTN_vs_BB: {
        dry: {
            blank: {
                bet: [
                    'straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips',
                    'set', 'two_pair', 'overpair', 'top_pair_good'
                ],
                check: ['second_pair', 'low_pair', 'gutshot', 'nothing', 'ace_high'],
                mixed: [
                    { category: 'top_pair_weak', bet: 0.5, check: 0.5 },
                    { category: 'flush_draw', bet: 0.6, check: 0.4 },
                    { category: 'oesd', bet: 0.5, check: 0.5 },
                    { category: 'overcards', bet: 0.3, check: 0.7 }
                ]
            },
            flush_completing: {
                bet: [
                    'straight_flush', 'quads', 'flush', 'full_house', 'trips', 'set'
                ],
                check: ['overpair', 'top_pair_weak', 'second_pair', 'low_pair', 'oesd', 'gutshot', 'overcards', 'ace_high', 'nothing'],
                mixed: [
                    { category: 'two_pair', bet: 0.6, check: 0.4 },
                    { category: 'top_pair_good', bet: 0.4, check: 0.6 },
                    { category: 'straight', bet: 0.7, check: 0.3 }
                ]
            },
            straight_completing: {
                bet: [
                    'straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set'
                ],
                check: ['overpair', 'top_pair_weak', 'second_pair', 'low_pair', 'flush_draw', 'gutshot', 'overcards', 'ace_high', 'nothing'],
                mixed: [
                    { category: 'two_pair', bet: 0.5, check: 0.5 },
                    { category: 'top_pair_good', bet: 0.4, check: 0.6 },
                    { category: 'oesd', bet: 0.3, check: 0.7 }
                ]
            },
            pairing: {
                bet: [
                    'straight_flush', 'quads', 'full_house', 'trips', 'set', 'two_pair'
                ],
                check: ['top_pair_weak', 'second_pair', 'low_pair', 'flush_draw', 'oesd', 'gutshot', 'overcards', 'ace_high', 'nothing'],
                mixed: [
                    { category: 'overpair', bet: 0.5, check: 0.5 },
                    { category: 'top_pair_good', bet: 0.5, check: 0.5 },
                    { category: 'flush', bet: 0.8, check: 0.2 },
                    { category: 'straight', bet: 0.8, check: 0.2 }
                ]
            },
            connected: {
                bet: [
                    'straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips',
                    'set', 'two_pair', 'overpair'
                ],
                check: ['second_pair', 'low_pair', 'gutshot', 'overcards', 'ace_high', 'nothing'],
                mixed: [
                    { category: 'top_pair_good', bet: 0.6, check: 0.4 },
                    { category: 'top_pair_weak', bet: 0.4, check: 0.6 },
                    { category: 'flush_draw', bet: 0.5, check: 0.5 },
                    { category: 'oesd', bet: 0.5, check: 0.5 }
                ]
            }
        },
        wet: {
            blank: {
                bet: [
                    'straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips',
                    'set', 'two_pair', 'overpair', 'top_pair_good'
                ],
                check: ['second_pair', 'low_pair', 'gutshot', 'overcards', 'ace_high', 'nothing'],
                mixed: [
                    { category: 'top_pair_weak', bet: 0.5, check: 0.5 },
                    { category: 'flush_draw', bet: 0.7, check: 0.3 },
                    { category: 'oesd', bet: 0.6, check: 0.4 }
                ]
            },
            flush_completing: {
                bet: [
                    'straight_flush', 'quads', 'flush', 'full_house'
                ],
                check: ['overpair', 'top_pair_good', 'top_pair_weak', 'second_pair', 'low_pair', 'oesd', 'gutshot', 'overcards', 'ace_high', 'nothing'],
                mixed: [
                    { category: 'trips', bet: 0.6, check: 0.4 },
                    { category: 'set', bet: 0.7, check: 0.3 },
                    { category: 'two_pair', bet: 0.5, check: 0.5 },
                    { category: 'straight', bet: 0.6, check: 0.4 }
                ]
            },
            straight_completing: {
                bet: [
                    'straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set'
                ],
                check: ['top_pair_weak', 'second_pair', 'low_pair', 'flush_draw', 'gutshot', 'overcards', 'ace_high', 'nothing'],
                mixed: [
                    { category: 'two_pair', bet: 0.5, check: 0.5 },
                    { category: 'overpair', bet: 0.4, check: 0.6 },
                    { category: 'top_pair_good', bet: 0.4, check: 0.6 },
                    { category: 'oesd', bet: 0.4, check: 0.6 }
                ]
            },
            pairing: {
                bet: [
                    'straight_flush', 'quads', 'full_house', 'trips', 'set'
                ],
                check: ['top_pair_weak', 'second_pair', 'low_pair', 'flush_draw', 'oesd', 'gutshot', 'overcards', 'ace_high', 'nothing'],
                mixed: [
                    { category: 'two_pair', bet: 0.6, check: 0.4 },
                    { category: 'overpair', bet: 0.5, check: 0.5 },
                    { category: 'top_pair_good', bet: 0.5, check: 0.5 },
                    { category: 'flush', bet: 0.8, check: 0.2 },
                    { category: 'straight', bet: 0.7, check: 0.3 }
                ]
            },
            connected: {
                bet: [
                    'straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set', 'two_pair'
                ],
                check: ['second_pair', 'low_pair', 'gutshot', 'overcards', 'ace_high', 'nothing'],
                mixed: [
                    { category: 'overpair', bet: 0.6, check: 0.4 },
                    { category: 'top_pair_good', bet: 0.5, check: 0.5 },
                    { category: 'top_pair_weak', bet: 0.4, check: 0.6 },
                    { category: 'flush_draw', bet: 0.6, check: 0.4 },
                    { category: 'oesd', bet: 0.5, check: 0.5 }
                ]
            }
        },
        paired: {
            blank: {
                bet: [
                    'straight_flush', 'quads', 'full_house', 'flush', 'straight', 'trips', 'set'
                ],
                check: ['top_pair_weak', 'second_pair', 'low_pair', 'flush_draw', 'oesd', 'gutshot', 'overcards', 'ace_high', 'nothing'],
                mixed: [
                    { category: 'two_pair', bet: 0.7, check: 0.3 },
                    { category: 'overpair', bet: 0.5, check: 0.5 },
                    { category: 'top_pair_good', bet: 0.4, check: 0.6 }
                ]
            },
            flush_completing: {
                bet: ['straight_flush', 'quads', 'full_house', 'flush'],
                check: ['overpair', 'top_pair_good', 'top_pair_weak', 'second_pair', 'low_pair', 'oesd', 'gutshot', 'overcards', 'ace_high', 'nothing'],
                mixed: [
                    { category: 'trips', bet: 0.5, check: 0.5 },
                    { category: 'set', bet: 0.6, check: 0.4 },
                    { category: 'two_pair', bet: 0.4, check: 0.6 },
                    { category: 'straight', bet: 0.5, check: 0.5 }
                ]
            },
            straight_completing: {
                bet: ['straight_flush', 'quads', 'full_house', 'flush', 'straight', 'trips', 'set'],
                check: ['overpair', 'top_pair_weak', 'second_pair', 'low_pair', 'flush_draw', 'gutshot', 'overcards', 'ace_high', 'nothing'],
                mixed: [
                    { category: 'two_pair', bet: 0.5, check: 0.5 },
                    { category: 'top_pair_good', bet: 0.4, check: 0.6 },
                    { category: 'oesd', bet: 0.3, check: 0.7 }
                ]
            },
            pairing: {
                bet: ['straight_flush', 'quads', 'full_house'],
                check: ['overpair', 'top_pair_good', 'top_pair_weak', 'second_pair', 'low_pair', 'flush_draw', 'oesd', 'gutshot', 'overcards', 'ace_high', 'nothing'],
                mixed: [
                    { category: 'trips', bet: 0.6, check: 0.4 },
                    { category: 'set', bet: 0.7, check: 0.3 },
                    { category: 'two_pair', bet: 0.5, check: 0.5 },
                    { category: 'flush', bet: 0.7, check: 0.3 },
                    { category: 'straight', bet: 0.6, check: 0.4 }
                ]
            },
            connected: {
                bet: ['straight_flush', 'quads', 'full_house', 'flush', 'straight', 'trips', 'set'],
                check: ['top_pair_weak', 'second_pair', 'low_pair', 'gutshot', 'overcards', 'ace_high', 'nothing'],
                mixed: [
                    { category: 'two_pair', bet: 0.6, check: 0.4 },
                    { category: 'overpair', bet: 0.5, check: 0.5 },
                    { category: 'top_pair_good', bet: 0.4, check: 0.6 },
                    { category: 'flush_draw', bet: 0.5, check: 0.5 },
                    { category: 'oesd', bet: 0.4, check: 0.6 }
                ]
            }
        },
        monotone: {
            blank: {
                bet: ['straight_flush', 'quads', 'flush', 'full_house'],
                check: ['overpair', 'top_pair_good', 'top_pair_weak', 'second_pair', 'low_pair', 'oesd', 'gutshot', 'overcards', 'ace_high', 'nothing'],
                mixed: [
                    { category: 'trips', bet: 0.5, check: 0.5 },
                    { category: 'set', bet: 0.6, check: 0.4 },
                    { category: 'two_pair', bet: 0.4, check: 0.6 },
                    { category: 'straight', bet: 0.5, check: 0.5 },
                    { category: 'flush_draw', bet: 0.5, check: 0.5 }
                ]
            },
            flush_completing: {
                bet: ['straight_flush', 'quads', 'flush'],
                check: ['trips', 'set', 'two_pair', 'overpair', 'top_pair_good', 'top_pair_weak', 'second_pair', 'low_pair', 'oesd', 'gutshot', 'overcards', 'ace_high', 'nothing'],
                mixed: [
                    { category: 'full_house', bet: 0.8, check: 0.2 },
                    { category: 'straight', bet: 0.4, check: 0.6 }
                ]
            },
            straight_completing: {
                bet: ['straight_flush', 'quads', 'flush', 'full_house'],
                check: ['overpair', 'top_pair_good', 'top_pair_weak', 'second_pair', 'low_pair', 'flush_draw', 'gutshot', 'overcards', 'ace_high', 'nothing'],
                mixed: [
                    { category: 'straight', bet: 0.5, check: 0.5 },
                    { category: 'trips', bet: 0.4, check: 0.6 },
                    { category: 'set', bet: 0.5, check: 0.5 },
                    { category: 'two_pair', bet: 0.3, check: 0.7 },
                    { category: 'oesd', bet: 0.3, check: 0.7 }
                ]
            },
            pairing: {
                bet: ['straight_flush', 'quads', 'full_house', 'flush'],
                check: ['overpair', 'top_pair_good', 'top_pair_weak', 'second_pair', 'low_pair', 'flush_draw', 'oesd', 'gutshot', 'overcards', 'ace_high', 'nothing'],
                mixed: [
                    { category: 'trips', bet: 0.5, check: 0.5 },
                    { category: 'set', bet: 0.6, check: 0.4 },
                    { category: 'two_pair', bet: 0.4, check: 0.6 },
                    { category: 'straight', bet: 0.5, check: 0.5 }
                ]
            },
            connected: {
                bet: ['straight_flush', 'quads', 'flush', 'full_house'],
                check: ['overpair', 'top_pair_good', 'top_pair_weak', 'second_pair', 'low_pair', 'oesd', 'gutshot', 'overcards', 'ace_high', 'nothing'],
                mixed: [
                    { category: 'straight', bet: 0.5, check: 0.5 },
                    { category: 'trips', bet: 0.4, check: 0.6 },
                    { category: 'set', bet: 0.5, check: 0.5 },
                    { category: 'two_pair', bet: 0.3, check: 0.7 },
                    { category: 'flush_draw', bet: 0.4, check: 0.6 }
                ]
            }
        },
        connected: {
            blank: {
                bet: [
                    'straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips',
                    'set', 'two_pair', 'overpair'
                ],
                check: ['second_pair', 'low_pair', 'gutshot', 'overcards', 'ace_high', 'nothing'],
                mixed: [
                    { category: 'top_pair_good', bet: 0.6, check: 0.4 },
                    { category: 'top_pair_weak', bet: 0.4, check: 0.6 },
                    { category: 'flush_draw', bet: 0.6, check: 0.4 },
                    { category: 'oesd', bet: 0.5, check: 0.5 }
                ]
            },
            flush_completing: {
                bet: ['straight_flush', 'quads', 'flush', 'full_house'],
                check: ['overpair', 'top_pair_good', 'top_pair_weak', 'second_pair', 'low_pair', 'oesd', 'gutshot', 'overcards', 'ace_high', 'nothing'],
                mixed: [
                    { category: 'straight', bet: 0.5, check: 0.5 },
                    { category: 'trips', bet: 0.5, check: 0.5 },
                    { category: 'set', bet: 0.6, check: 0.4 },
                    { category: 'two_pair', bet: 0.4, check: 0.6 }
                ]
            },
            straight_completing: {
                bet: ['straight_flush', 'quads', 'flush', 'straight', 'full_house'],
                check: ['overpair', 'top_pair_weak', 'second_pair', 'low_pair', 'flush_draw', 'gutshot', 'overcards', 'ace_high', 'nothing'],
                mixed: [
                    { category: 'trips', bet: 0.5, check: 0.5 },
                    { category: 'set', bet: 0.6, check: 0.4 },
                    { category: 'two_pair', bet: 0.5, check: 0.5 },
                    { category: 'top_pair_good', bet: 0.4, check: 0.6 },
                    { category: 'oesd', bet: 0.4, check: 0.6 }
                ]
            },
            pairing: {
                bet: ['straight_flush', 'quads', 'full_house', 'flush', 'straight', 'trips', 'set'],
                check: ['top_pair_weak', 'second_pair', 'low_pair', 'flush_draw', 'oesd', 'gutshot', 'overcards', 'ace_high', 'nothing'],
                mixed: [
                    { category: 'two_pair', bet: 0.6, check: 0.4 },
                    { category: 'overpair', bet: 0.5, check: 0.5 },
                    { category: 'top_pair_good', bet: 0.4, check: 0.6 }
                ]
            },
            connected: {
                bet: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set', 'two_pair'],
                check: ['second_pair', 'low_pair', 'gutshot', 'overcards', 'ace_high', 'nothing'],
                mixed: [
                    { category: 'overpair', bet: 0.5, check: 0.5 },
                    { category: 'top_pair_good', bet: 0.5, check: 0.5 },
                    { category: 'top_pair_weak', bet: 0.3, check: 0.7 },
                    { category: 'flush_draw', bet: 0.5, check: 0.5 },
                    { category: 'oesd', bet: 0.4, check: 0.6 }
                ]
            }
        }
    },
    // CO_vs_BB und SB_vs_BB fallen auf BTN_vs_BB zurück (vereinfacht)
    CO_vs_BB: null, // Verwendet BTN_vs_BB als Fallback
    SB_vs_BB: null  // Verwendet BTN_vs_BB als Fallback
};

// ============================================
// FACING TURN BARREL RANGES (Villain Double Barrels)
// Hero hat Flop C-Bet gecallt, Villain bettet Turn erneut
// ============================================

const FACING_TURN_BARREL_RANGES = {
    // ========================================
    // BB vs BTN - Facing Double Barrel
    // ========================================
    BB_vs_BTN: {
        dry: {
            blank: {
                raise: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'set', 'flush_draw_oesd'],
                call: ['trips', 'two_pair', 'overpair', 'top_pair_good', 'flush_draw', 'oesd', 'pair_flush_draw', 'pair_oesd', 'flush_draw_gutshot'],
                fold: ['second_pair', 'low_pair', 'gutshot', 'nothing', 'ace_high', 'overcards'],
                mixed: [
                    { category: 'top_pair_weak', call: 0.6, fold: 0.4 },
                    { category: 'underpair_high', call: 0.4, fold: 0.6 },
                    { category: 'pair_gutshot', call: 0.5, fold: 0.5 }
                ]
            },
            flush_completing: {
                raise: ['straight_flush', 'quads', 'flush', 'full_house'],
                call: ['set', 'trips', 'two_pair', 'straight', 'flush_draw_oesd', 'flush_draw_gutshot'],
                fold: ['overpair', 'top_pair_good', 'top_pair_weak', 'second_pair', 'low_pair', 'oesd', 'gutshot', 'nothing', 'ace_high', 'overcards', 'pair_gutshot'],
                mixed: [
                    { category: 'flush_draw', call: 0.3, fold: 0.7 },
                    { category: 'pair_flush_draw', call: 0.4, fold: 0.6 },
                    { category: 'pair_oesd', call: 0.3, fold: 0.7 }
                ]
            },
            straight_completing: {
                raise: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'set', 'flush_draw_oesd'],
                call: ['trips', 'two_pair', 'overpair', 'top_pair_good', 'flush_draw', 'pair_flush_draw', 'flush_draw_gutshot'],
                fold: ['second_pair', 'low_pair', 'gutshot', 'nothing', 'ace_high', 'overcards', 'pair_gutshot'],
                mixed: [
                    { category: 'top_pair_weak', call: 0.5, fold: 0.5 },
                    { category: 'oesd', call: 0.4, fold: 0.6 },
                    { category: 'pair_oesd', call: 0.5, fold: 0.5 }
                ]
            },
            pairing: {
                raise: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'set', 'trips', 'flush_draw_oesd'],
                call: ['two_pair', 'overpair', 'top_pair_good', 'flush_draw', 'oesd', 'pair_flush_draw', 'pair_oesd', 'flush_draw_gutshot'],
                fold: ['second_pair', 'low_pair', 'gutshot', 'nothing', 'ace_high', 'overcards'],
                mixed: [
                    { category: 'top_pair_weak', call: 0.5, fold: 0.5 },
                    { category: 'pair_gutshot', call: 0.4, fold: 0.6 }
                ]
            },
            connected: {
                raise: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'set', 'flush_draw_oesd'],
                call: ['trips', 'two_pair', 'overpair', 'top_pair_good', 'flush_draw', 'oesd', 'pair_flush_draw', 'pair_oesd', 'flush_draw_gutshot'],
                fold: ['second_pair', 'low_pair', 'gutshot', 'nothing', 'ace_high', 'overcards'],
                mixed: [
                    { category: 'top_pair_weak', call: 0.5, fold: 0.5 },
                    { category: 'pair_gutshot', call: 0.5, fold: 0.5 }
                ]
            }
        },
        wet: {
            blank: {
                raise: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'set', 'flush_draw_oesd'],
                call: ['trips', 'two_pair', 'overpair', 'top_pair_good', 'flush_draw', 'oesd', 'pair_flush_draw', 'pair_oesd', 'flush_draw_gutshot'],
                fold: ['second_pair', 'low_pair', 'gutshot', 'nothing', 'ace_high', 'overcards'],
                mixed: [
                    { category: 'top_pair_weak', call: 0.5, fold: 0.5 },
                    { category: 'pair_gutshot', call: 0.4, fold: 0.6 }
                ]
            },
            flush_completing: {
                raise: ['straight_flush', 'quads', 'flush', 'full_house'],
                call: ['set', 'trips', 'two_pair', 'straight', 'flush_draw_oesd', 'flush_draw_gutshot'],
                fold: ['overpair', 'top_pair_good', 'top_pair_weak', 'second_pair', 'low_pair', 'flush_draw', 'oesd', 'gutshot', 'nothing', 'ace_high', 'overcards', 'pair_flush_draw', 'pair_oesd', 'pair_gutshot'],
                mixed: []
            },
            straight_completing: {
                raise: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'set', 'flush_draw_oesd'],
                call: ['trips', 'two_pair', 'overpair', 'flush_draw', 'pair_flush_draw', 'flush_draw_gutshot'],
                fold: ['top_pair_good', 'top_pair_weak', 'second_pair', 'low_pair', 'oesd', 'gutshot', 'nothing', 'ace_high', 'overcards', 'pair_gutshot'],
                mixed: [
                    { category: 'pair_oesd', call: 0.4, fold: 0.6 }
                ]
            },
            pairing: {
                raise: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'set', 'trips', 'flush_draw_oesd'],
                call: ['two_pair', 'overpair', 'top_pair_good', 'flush_draw', 'oesd', 'pair_flush_draw', 'pair_oesd', 'flush_draw_gutshot'],
                fold: ['second_pair', 'low_pair', 'gutshot', 'nothing', 'ace_high', 'overcards'],
                mixed: [
                    { category: 'top_pair_weak', call: 0.4, fold: 0.6 },
                    { category: 'pair_gutshot', call: 0.4, fold: 0.6 }
                ]
            },
            connected: {
                raise: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'set', 'flush_draw_oesd'],
                call: ['trips', 'two_pair', 'overpair', 'flush_draw', 'oesd', 'pair_flush_draw', 'pair_oesd', 'flush_draw_gutshot'],
                fold: ['top_pair_good', 'top_pair_weak', 'second_pair', 'low_pair', 'gutshot', 'nothing', 'ace_high', 'overcards'],
                mixed: [
                    { category: 'pair_gutshot', call: 0.4, fold: 0.6 }
                ]
            }
        },
        paired: {
            blank: {
                raise: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set', 'flush_draw_oesd'],
                call: ['two_pair', 'overpair', 'top_pair_good', 'flush_draw', 'oesd', 'pair_flush_draw', 'pair_oesd', 'flush_draw_gutshot'],
                fold: ['second_pair', 'low_pair', 'gutshot', 'nothing', 'ace_high', 'overcards'],
                mixed: [
                    { category: 'top_pair_weak', call: 0.5, fold: 0.5 },
                    { category: 'pair_gutshot', call: 0.5, fold: 0.5 }
                ]
            },
            flush_completing: {
                raise: ['straight_flush', 'quads', 'flush', 'full_house', 'trips'],
                call: ['set', 'two_pair', 'straight', 'flush_draw_oesd', 'flush_draw_gutshot'],
                fold: ['overpair', 'top_pair_good', 'top_pair_weak', 'second_pair', 'low_pair', 'flush_draw', 'oesd', 'gutshot', 'nothing', 'ace_high', 'overcards', 'pair_flush_draw', 'pair_oesd', 'pair_gutshot'],
                mixed: []
            },
            straight_completing: {
                raise: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set', 'flush_draw_oesd'],
                call: ['two_pair', 'overpair', 'flush_draw', 'pair_flush_draw', 'flush_draw_gutshot'],
                fold: ['top_pair_good', 'top_pair_weak', 'second_pair', 'low_pair', 'oesd', 'gutshot', 'nothing', 'ace_high', 'overcards', 'pair_gutshot'],
                mixed: [
                    { category: 'pair_oesd', call: 0.4, fold: 0.6 }
                ]
            },
            pairing: {
                raise: ['straight_flush', 'quads', 'full_house'],
                call: ['flush', 'straight', 'trips', 'set', 'two_pair', 'overpair', 'flush_draw', 'oesd', 'pair_flush_draw', 'pair_oesd', 'flush_draw_oesd', 'flush_draw_gutshot'],
                fold: ['top_pair_good', 'top_pair_weak', 'second_pair', 'low_pair', 'gutshot', 'nothing', 'ace_high', 'overcards'],
                mixed: [
                    { category: 'pair_gutshot', call: 0.4, fold: 0.6 }
                ]
            },
            connected: {
                raise: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set', 'flush_draw_oesd'],
                call: ['two_pair', 'overpair', 'top_pair_good', 'flush_draw', 'oesd', 'pair_flush_draw', 'pair_oesd', 'flush_draw_gutshot'],
                fold: ['second_pair', 'low_pair', 'gutshot', 'nothing', 'ace_high', 'overcards'],
                mixed: [
                    { category: 'top_pair_weak', call: 0.4, fold: 0.6 },
                    { category: 'pair_gutshot', call: 0.5, fold: 0.5 }
                ]
            }
        },
        monotone: {
            blank: {
                raise: ['straight_flush', 'quads', 'flush', 'full_house'],
                call: ['straight', 'trips', 'set', 'two_pair', 'overpair', 'top_pair_good', 'flush_draw_oesd', 'flush_draw_gutshot'],
                fold: ['second_pair', 'low_pair', 'oesd', 'gutshot', 'nothing', 'ace_high', 'overcards', 'pair_oesd', 'pair_gutshot'],
                mixed: [
                    { category: 'top_pair_weak', call: 0.4, fold: 0.6 },
                    { category: 'flush_draw', call: 0.7, fold: 0.3 },
                    { category: 'pair_flush_draw', call: 0.8, fold: 0.2 }
                ]
            },
            flush_completing: {
                raise: ['straight_flush', 'quads', 'flush'],
                call: ['full_house', 'straight', 'set', 'trips'],
                fold: ['two_pair', 'overpair', 'top_pair_good', 'top_pair_weak', 'second_pair', 'low_pair', 'flush_draw', 'oesd', 'gutshot', 'nothing', 'ace_high', 'overcards', 'pair_flush_draw', 'pair_oesd', 'pair_gutshot', 'flush_draw_oesd', 'flush_draw_gutshot'],
                mixed: []
            },
            straight_completing: {
                raise: ['straight_flush', 'quads', 'flush', 'full_house'],
                call: ['straight', 'trips', 'set', 'two_pair', 'flush_draw_oesd', 'flush_draw_gutshot'],
                fold: ['overpair', 'top_pair_good', 'top_pair_weak', 'second_pair', 'low_pair', 'flush_draw', 'oesd', 'gutshot', 'nothing', 'ace_high', 'overcards', 'pair_oesd', 'pair_gutshot'],
                mixed: [
                    { category: 'pair_flush_draw', call: 0.6, fold: 0.4 }
                ]
            },
            pairing: {
                raise: ['straight_flush', 'quads', 'flush', 'full_house'],
                call: ['straight', 'trips', 'set', 'two_pair', 'overpair', 'flush_draw_oesd', 'flush_draw_gutshot'],
                fold: ['top_pair_good', 'top_pair_weak', 'second_pair', 'low_pair', 'flush_draw', 'oesd', 'gutshot', 'nothing', 'ace_high', 'overcards', 'pair_oesd', 'pair_gutshot'],
                mixed: [
                    { category: 'pair_flush_draw', call: 0.6, fold: 0.4 }
                ]
            },
            connected: {
                raise: ['straight_flush', 'quads', 'flush', 'full_house'],
                call: ['straight', 'trips', 'set', 'two_pair', 'overpair', 'flush_draw_oesd', 'flush_draw_gutshot'],
                fold: ['top_pair_good', 'top_pair_weak', 'second_pair', 'low_pair', 'flush_draw', 'oesd', 'gutshot', 'nothing', 'ace_high', 'overcards', 'pair_oesd', 'pair_gutshot'],
                mixed: [
                    { category: 'pair_flush_draw', call: 0.6, fold: 0.4 }
                ]
            }
        },
        connected: {
            blank: {
                raise: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'set', 'flush_draw_oesd'],
                call: ['trips', 'two_pair', 'overpair', 'top_pair_good', 'flush_draw', 'oesd', 'pair_flush_draw', 'pair_oesd', 'flush_draw_gutshot'],
                fold: ['second_pair', 'low_pair', 'gutshot', 'nothing', 'ace_high', 'overcards'],
                mixed: [
                    { category: 'top_pair_weak', call: 0.5, fold: 0.5 },
                    { category: 'pair_gutshot', call: 0.5, fold: 0.5 }
                ]
            },
            flush_completing: {
                raise: ['straight_flush', 'quads', 'flush', 'full_house'],
                call: ['straight', 'set', 'trips', 'two_pair', 'flush_draw_oesd', 'flush_draw_gutshot'],
                fold: ['overpair', 'top_pair_good', 'top_pair_weak', 'second_pair', 'low_pair', 'flush_draw', 'oesd', 'gutshot', 'nothing', 'ace_high', 'overcards', 'pair_flush_draw', 'pair_oesd', 'pair_gutshot'],
                mixed: []
            },
            straight_completing: {
                raise: ['straight_flush', 'quads', 'flush', 'full_house', 'flush_draw_oesd'],
                call: ['straight', 'set', 'trips', 'two_pair', 'flush_draw', 'pair_flush_draw', 'flush_draw_gutshot'],
                fold: ['overpair', 'top_pair_good', 'top_pair_weak', 'second_pair', 'low_pair', 'oesd', 'gutshot', 'nothing', 'ace_high', 'overcards', 'pair_gutshot'],
                mixed: [
                    { category: 'pair_oesd', call: 0.4, fold: 0.6 }
                ]
            },
            pairing: {
                raise: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set', 'flush_draw_oesd'],
                call: ['two_pair', 'overpair', 'flush_draw', 'oesd', 'pair_flush_draw', 'pair_oesd', 'flush_draw_gutshot'],
                fold: ['top_pair_good', 'top_pair_weak', 'second_pair', 'low_pair', 'gutshot', 'nothing', 'ace_high', 'overcards'],
                mixed: [
                    { category: 'pair_gutshot', call: 0.4, fold: 0.6 }
                ]
            },
            connected: {
                raise: ['straight_flush', 'quads', 'flush', 'full_house', 'flush_draw_oesd'],
                call: ['straight', 'set', 'trips', 'two_pair', 'flush_draw', 'pair_flush_draw', 'pair_oesd', 'flush_draw_gutshot'],
                fold: ['overpair', 'top_pair_good', 'top_pair_weak', 'second_pair', 'low_pair', 'oesd', 'gutshot', 'nothing', 'ace_high', 'overcards'],
                mixed: [
                    { category: 'pair_gutshot', call: 0.5, fold: 0.5 }
                ]
            }
        }
    },
    // Andere Spots fallen auf BB_vs_BTN zurück
    BB_vs_CO: null,
    BB_vs_SB: null,
    BTN_vs_CO: null,
    BTN_vs_HJ: null,
    CO_vs_HJ: null
};

// ============================================
// PROBE BET RANGES (Villain checkt Turn)
// Hero hat Flop C-Bet gecallt, Villain checkt Turn
// ============================================

const PROBE_BET_RANGES = {
    // ========================================
    // BB vs BTN - Probe Bet (Villain zeigt Schwäche)
    // ========================================
    BB_vs_BTN: {
        dry: {
            blank: {
                bet: [
                    'straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips',
                    'set', 'two_pair', 'overpair', 'top_pair_good'
                ],
                check: ['second_pair', 'low_pair', 'gutshot', 'nothing', 'ace_high'],
                mixed: [
                    { category: 'top_pair_weak', bet: 0.6, check: 0.4 },
                    { category: 'flush_draw', bet: 0.7, check: 0.3 },
                    { category: 'oesd', bet: 0.6, check: 0.4 },
                    { category: 'overcards', bet: 0.4, check: 0.6 }
                ]
            },
            flush_completing: {
                bet: ['straight_flush', 'quads', 'flush', 'full_house', 'trips', 'set'],
                check: ['overpair', 'second_pair', 'low_pair', 'oesd', 'gutshot', 'ace_high', 'nothing', 'overcards'],
                mixed: [
                    { category: 'straight', bet: 0.7, check: 0.3 },
                    { category: 'two_pair', bet: 0.6, check: 0.4 },
                    { category: 'top_pair_good', bet: 0.5, check: 0.5 },
                    { category: 'top_pair_weak', bet: 0.3, check: 0.7 }
                ]
            },
            straight_completing: {
                bet: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set', 'two_pair'],
                check: ['second_pair', 'low_pair', 'gutshot', 'ace_high', 'nothing', 'overcards'],
                mixed: [
                    { category: 'overpair', bet: 0.6, check: 0.4 },
                    { category: 'top_pair_good', bet: 0.6, check: 0.4 },
                    { category: 'top_pair_weak', bet: 0.4, check: 0.6 },
                    { category: 'flush_draw', bet: 0.5, check: 0.5 },
                    { category: 'oesd', bet: 0.4, check: 0.6 }
                ]
            },
            pairing: {
                bet: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set', 'two_pair', 'overpair'],
                check: ['second_pair', 'low_pair', 'gutshot', 'ace_high', 'nothing', 'overcards'],
                mixed: [
                    { category: 'top_pair_good', bet: 0.7, check: 0.3 },
                    { category: 'top_pair_weak', bet: 0.5, check: 0.5 },
                    { category: 'flush_draw', bet: 0.6, check: 0.4 },
                    { category: 'oesd', bet: 0.5, check: 0.5 }
                ]
            },
            connected: {
                bet: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set', 'two_pair'],
                check: ['second_pair', 'low_pair', 'gutshot', 'ace_high', 'nothing', 'overcards'],
                mixed: [
                    { category: 'overpair', bet: 0.6, check: 0.4 },
                    { category: 'top_pair_good', bet: 0.6, check: 0.4 },
                    { category: 'top_pair_weak', bet: 0.4, check: 0.6 },
                    { category: 'flush_draw', bet: 0.6, check: 0.4 },
                    { category: 'oesd', bet: 0.5, check: 0.5 }
                ]
            }
        },
        wet: {
            blank: {
                bet: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set', 'two_pair', 'overpair'],
                check: ['second_pair', 'low_pair', 'gutshot', 'ace_high', 'nothing', 'overcards'],
                mixed: [
                    { category: 'top_pair_good', bet: 0.7, check: 0.3 },
                    { category: 'top_pair_weak', bet: 0.5, check: 0.5 },
                    { category: 'flush_draw', bet: 0.8, check: 0.2 },
                    { category: 'oesd', bet: 0.7, check: 0.3 }
                ]
            },
            flush_completing: {
                bet: ['straight_flush', 'quads', 'flush', 'full_house', 'trips', 'set'],
                check: ['overpair', 'top_pair_weak', 'second_pair', 'low_pair', 'oesd', 'gutshot', 'ace_high', 'nothing', 'overcards'],
                mixed: [
                    { category: 'straight', bet: 0.6, check: 0.4 },
                    { category: 'two_pair', bet: 0.5, check: 0.5 },
                    { category: 'top_pair_good', bet: 0.4, check: 0.6 }
                ]
            },
            straight_completing: {
                bet: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set'],
                check: ['overpair', 'top_pair_weak', 'second_pair', 'low_pair', 'oesd', 'gutshot', 'ace_high', 'nothing', 'overcards'],
                mixed: [
                    { category: 'two_pair', bet: 0.6, check: 0.4 },
                    { category: 'top_pair_good', bet: 0.5, check: 0.5 },
                    { category: 'flush_draw', bet: 0.5, check: 0.5 }
                ]
            },
            pairing: {
                bet: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set', 'two_pair'],
                check: ['second_pair', 'low_pair', 'gutshot', 'ace_high', 'nothing', 'overcards'],
                mixed: [
                    { category: 'overpair', bet: 0.6, check: 0.4 },
                    { category: 'top_pair_good', bet: 0.6, check: 0.4 },
                    { category: 'top_pair_weak', bet: 0.4, check: 0.6 },
                    { category: 'flush_draw', bet: 0.6, check: 0.4 },
                    { category: 'oesd', bet: 0.5, check: 0.5 }
                ]
            },
            connected: {
                bet: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set'],
                check: ['top_pair_weak', 'second_pair', 'low_pair', 'gutshot', 'ace_high', 'nothing', 'overcards'],
                mixed: [
                    { category: 'two_pair', bet: 0.6, check: 0.4 },
                    { category: 'overpair', bet: 0.5, check: 0.5 },
                    { category: 'top_pair_good', bet: 0.5, check: 0.5 },
                    { category: 'flush_draw', bet: 0.6, check: 0.4 },
                    { category: 'oesd', bet: 0.5, check: 0.5 }
                ]
            }
        },
        paired: {
            blank: {
                bet: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set', 'two_pair', 'overpair'],
                check: ['second_pair', 'low_pair', 'gutshot', 'ace_high', 'nothing', 'overcards'],
                mixed: [
                    { category: 'top_pair_good', bet: 0.7, check: 0.3 },
                    { category: 'top_pair_weak', bet: 0.5, check: 0.5 },
                    { category: 'flush_draw', bet: 0.6, check: 0.4 },
                    { category: 'oesd', bet: 0.5, check: 0.5 }
                ]
            },
            flush_completing: {
                bet: ['straight_flush', 'quads', 'flush', 'full_house', 'trips', 'set'],
                check: ['overpair', 'top_pair_good', 'top_pair_weak', 'second_pair', 'low_pair', 'oesd', 'gutshot', 'ace_high', 'nothing', 'overcards'],
                mixed: [
                    { category: 'straight', bet: 0.6, check: 0.4 },
                    { category: 'two_pair', bet: 0.5, check: 0.5 }
                ]
            },
            straight_completing: {
                bet: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set'],
                check: ['overpair', 'top_pair_weak', 'second_pair', 'low_pair', 'oesd', 'gutshot', 'ace_high', 'nothing', 'overcards'],
                mixed: [
                    { category: 'two_pair', bet: 0.6, check: 0.4 },
                    { category: 'top_pair_good', bet: 0.5, check: 0.5 },
                    { category: 'flush_draw', bet: 0.5, check: 0.5 }
                ]
            },
            pairing: {
                bet: ['straight_flush', 'quads', 'full_house', 'trips'],
                check: ['overpair', 'top_pair_weak', 'second_pair', 'low_pair', 'oesd', 'gutshot', 'ace_high', 'nothing', 'overcards'],
                mixed: [
                    { category: 'flush', bet: 0.7, check: 0.3 },
                    { category: 'straight', bet: 0.6, check: 0.4 },
                    { category: 'set', bet: 0.8, check: 0.2 },
                    { category: 'two_pair', bet: 0.6, check: 0.4 },
                    { category: 'top_pair_good', bet: 0.5, check: 0.5 },
                    { category: 'flush_draw', bet: 0.4, check: 0.6 }
                ]
            },
            connected: {
                bet: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set', 'two_pair'],
                check: ['second_pair', 'low_pair', 'gutshot', 'ace_high', 'nothing', 'overcards'],
                mixed: [
                    { category: 'overpair', bet: 0.6, check: 0.4 },
                    { category: 'top_pair_good', bet: 0.6, check: 0.4 },
                    { category: 'top_pair_weak', bet: 0.4, check: 0.6 },
                    { category: 'flush_draw', bet: 0.6, check: 0.4 },
                    { category: 'oesd', bet: 0.5, check: 0.5 }
                ]
            }
        },
        monotone: {
            blank: {
                bet: ['straight_flush', 'quads', 'flush', 'full_house', 'trips', 'set', 'two_pair'],
                check: ['second_pair', 'low_pair', 'oesd', 'gutshot', 'ace_high', 'nothing', 'overcards'],
                mixed: [
                    { category: 'straight', bet: 0.6, check: 0.4 },
                    { category: 'overpair', bet: 0.5, check: 0.5 },
                    { category: 'top_pair_good', bet: 0.5, check: 0.5 },
                    { category: 'top_pair_weak', bet: 0.3, check: 0.7 },
                    { category: 'flush_draw', bet: 0.8, check: 0.2 }
                ]
            },
            flush_completing: {
                bet: ['straight_flush', 'quads', 'flush'],
                check: ['straight', 'trips', 'set', 'two_pair', 'overpair', 'top_pair_good', 'top_pair_weak', 'second_pair', 'low_pair', 'flush_draw', 'oesd', 'gutshot', 'ace_high', 'nothing', 'overcards'],
                mixed: [
                    { category: 'full_house', bet: 0.8, check: 0.2 }
                ]
            },
            straight_completing: {
                bet: ['straight_flush', 'quads', 'flush', 'full_house'],
                check: ['overpair', 'top_pair_good', 'top_pair_weak', 'second_pair', 'low_pair', 'oesd', 'gutshot', 'ace_high', 'nothing', 'overcards'],
                mixed: [
                    { category: 'straight', bet: 0.6, check: 0.4 },
                    { category: 'trips', bet: 0.6, check: 0.4 },
                    { category: 'set', bet: 0.7, check: 0.3 },
                    { category: 'two_pair', bet: 0.5, check: 0.5 },
                    { category: 'flush_draw', bet: 0.6, check: 0.4 }
                ]
            },
            pairing: {
                bet: ['straight_flush', 'quads', 'flush', 'full_house', 'trips'],
                check: ['overpair', 'top_pair_good', 'top_pair_weak', 'second_pair', 'low_pair', 'oesd', 'gutshot', 'ace_high', 'nothing', 'overcards'],
                mixed: [
                    { category: 'straight', bet: 0.5, check: 0.5 },
                    { category: 'set', bet: 0.7, check: 0.3 },
                    { category: 'two_pair', bet: 0.5, check: 0.5 },
                    { category: 'flush_draw', bet: 0.5, check: 0.5 }
                ]
            },
            connected: {
                bet: ['straight_flush', 'quads', 'flush', 'full_house'],
                check: ['overpair', 'top_pair_good', 'top_pair_weak', 'second_pair', 'low_pair', 'oesd', 'gutshot', 'ace_high', 'nothing', 'overcards'],
                mixed: [
                    { category: 'straight', bet: 0.5, check: 0.5 },
                    { category: 'trips', bet: 0.6, check: 0.4 },
                    { category: 'set', bet: 0.7, check: 0.3 },
                    { category: 'two_pair', bet: 0.5, check: 0.5 },
                    { category: 'flush_draw', bet: 0.6, check: 0.4 }
                ]
            }
        },
        connected: {
            blank: {
                bet: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set', 'two_pair'],
                check: ['second_pair', 'low_pair', 'gutshot', 'ace_high', 'nothing', 'overcards'],
                mixed: [
                    { category: 'overpair', bet: 0.6, check: 0.4 },
                    { category: 'top_pair_good', bet: 0.6, check: 0.4 },
                    { category: 'top_pair_weak', bet: 0.4, check: 0.6 },
                    { category: 'flush_draw', bet: 0.7, check: 0.3 },
                    { category: 'oesd', bet: 0.6, check: 0.4 }
                ]
            },
            flush_completing: {
                bet: ['straight_flush', 'quads', 'flush', 'full_house'],
                check: ['overpair', 'top_pair_good', 'top_pair_weak', 'second_pair', 'low_pair', 'oesd', 'gutshot', 'ace_high', 'nothing', 'overcards'],
                mixed: [
                    { category: 'straight', bet: 0.6, check: 0.4 },
                    { category: 'trips', bet: 0.6, check: 0.4 },
                    { category: 'set', bet: 0.7, check: 0.3 },
                    { category: 'two_pair', bet: 0.5, check: 0.5 }
                ]
            },
            straight_completing: {
                bet: ['straight_flush', 'quads', 'flush', 'full_house'],
                check: ['overpair', 'top_pair_good', 'top_pair_weak', 'second_pair', 'low_pair', 'oesd', 'gutshot', 'ace_high', 'nothing', 'overcards'],
                mixed: [
                    { category: 'straight', bet: 0.7, check: 0.3 },
                    { category: 'trips', bet: 0.6, check: 0.4 },
                    { category: 'set', bet: 0.7, check: 0.3 },
                    { category: 'two_pair', bet: 0.5, check: 0.5 },
                    { category: 'flush_draw', bet: 0.5, check: 0.5 }
                ]
            },
            pairing: {
                bet: ['straight_flush', 'quads', 'flush', 'straight', 'full_house', 'trips', 'set'],
                check: ['top_pair_weak', 'second_pair', 'low_pair', 'oesd', 'gutshot', 'ace_high', 'nothing', 'overcards'],
                mixed: [
                    { category: 'two_pair', bet: 0.7, check: 0.3 },
                    { category: 'overpair', bet: 0.6, check: 0.4 },
                    { category: 'top_pair_good', bet: 0.5, check: 0.5 },
                    { category: 'flush_draw', bet: 0.5, check: 0.5 }
                ]
            },
            connected: {
                bet: ['straight_flush', 'quads', 'flush', 'full_house'],
                check: ['overpair', 'top_pair_good', 'top_pair_weak', 'second_pair', 'low_pair', 'oesd', 'gutshot', 'ace_high', 'nothing', 'overcards'],
                mixed: [
                    { category: 'straight', bet: 0.7, check: 0.3 },
                    { category: 'trips', bet: 0.6, check: 0.4 },
                    { category: 'set', bet: 0.7, check: 0.3 },
                    { category: 'two_pair', bet: 0.5, check: 0.5 },
                    { category: 'flush_draw', bet: 0.5, check: 0.5 }
                ]
            }
        }
    },
    // Andere Spots fallen auf BB_vs_BTN zurück
    BB_vs_CO: null,
    BB_vs_SB: null,
    BTN_vs_CO: null,
    BTN_vs_HJ: null,
    CO_vs_HJ: null
};

// Export für postflop.js
window.CBET_RANGES = CBET_RANGES;
window.FACING_CBET_RANGES = FACING_CBET_RANGES;
window.HAND_CATEGORY_VALUES = HAND_CATEGORY_VALUES;
window.TEXTURE_INFO = TEXTURE_INFO;
window.TURN_BARREL_RANGES = TURN_BARREL_RANGES;
window.DELAYED_CBET_RANGES = DELAYED_CBET_RANGES;
window.FACING_TURN_BARREL_RANGES = FACING_TURN_BARREL_RANGES;
window.PROBE_BET_RANGES = PROBE_BET_RANGES;
