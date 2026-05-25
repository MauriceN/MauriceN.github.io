// Tournament Ranges für Full-Ring (9-Max)
// Stacksize-basierte Ranges für MTT/SnG

// Tournament-Positionen (8 Positionen für Full-Ring 9-Max, ohne BB für OR)
const TOURNAMENT_POSITIONS = ['UTG', 'UTG1', 'UTG2', 'MP', 'HJ', 'CO', 'BTN', 'SB'];

// Alle verfügbaren Stacksizes
const TOURNAMENT_STACKSIZES = ['10-20bb', '25bb', '100bb'];

// ============================================
// OPENRAISE (OR) RANGES
// ============================================
// Opening Ranges nach Position und Stacksize
// Du gibst mir die Ranges, ich trage sie hier ein

const OR_RANGES = {
    // === 10-20bb ===
    // Struktur: openraise (immer), jam15 (bei <15bb), jam12 (bei <12bb)
    // Logik:
    //   - Stack >= 15bb: openraise = Raise, jam15 = Raise, jam12 = Raise, rest = Fold
    //   - Stack 12-14bb: openraise = Raise, jam15 = Jam, jam12 = Raise, rest = Fold
    //   - Stack < 12bb:  openraise = Raise, jam15 = Jam, jam12 = Jam, rest = Fold
    '10-20bb': {
        UTG: {
            // Openraise: AA, AKs, AQs, A9s, A8s, KK, KTs, QQ, QJs, QTs, JTs, T9s
            openraise: ['AA', 'KK', 'QQ', 'AKs', 'AQs', 'A9s', 'A8s', 'KTs', 'QJs', 'QTs', 'JTs', 'T9s'],
            // Openjam <15bb: AKo, KQs, AQo, AJo, TT, 99, 88
            jam15: ['TT', '99', '88', 'AKo', 'AQo', 'AJo', 'KQs'],
            // Openjam <12bb: AJs, ATs, KJs, KQo, JJ, 77
            jam12: ['JJ', '77', 'AJs', 'ATs', 'KJs', 'KQo'],
            fold: 'rest'
        },
        UTG1: {
            // Openraise: AA, AKs, AQs, A9s, A8s, A5s, KK, KTs, QQ, QTs, JTs, T9s
            openraise: ['AA', 'KK', 'QQ', 'AKs', 'AQs', 'A9s', 'A8s', 'A5s', 'KTs', 'QTs', 'JTs', 'T9s'],
            // Openjam <15bb: AKo, KQs, AQo, AJo, TT, 99, 88
            jam15: ['TT', '99', '88', 'AKo', 'AQo', 'AJo', 'KQs'],
            // Openjam <12bb: AJs, ATs, KJs, KQo, QJs, JJ, 77
            jam12: ['JJ', '77', 'AJs', 'ATs', 'KJs', 'KQo', 'QJs'],
            fold: 'rest'
        },
        UTG2: {
            // Openraise: AA, AKs, AQs, A8s, A7s, A6s, A5s, A4s, A3s, A2s, KK, KTs, QQ, QTs, ATo, T9s
            openraise: ['AA', 'KK', 'QQ', 'AKs', 'AQs', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s', 'ATo', 'KTs', 'QTs', 'T9s'],
            // Openjam <15bb: AKo, KQs, AQo, AJo, TT, 99, 88
            jam15: ['TT', '99', '88', 'AKo', 'AQo', 'AJo', 'KQs'],
            // Openjam <12bb: AJs, ATs, A9s, KJs, KQo, QJs, JJ, JTs, 77
            jam12: ['JJ', '77', 'AJs', 'ATs', 'A9s', 'KJs', 'KQo', 'QJs', 'JTs'],
            fold: 'rest'
        },
        MP: {
            // Openraise: AA, AKs, A8s, A7s, A6s, A5s, A4s, A3s, A2s, KK, K9s, QQ, Q9s, KJo, JJ, J9s, 98s
            openraise: ['AA', 'KK', 'QQ', 'JJ', 'AKs', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s', 'K9s', 'Q9s', 'KJo', 'J9s', '98s'],
            // Openjam <15bb: AKo, KQs, KJs, AQo, KQo, AJo, TT, 99, 88, 77
            jam15: ['TT', '99', '88', '77', 'AKo', 'AQo', 'AJo', 'KQs', 'KJs', 'KQo'],
            // Openjam <12bb: AQs, AJs, ATs, A9s, KTs, QJs, QTs, JTs, ATo, T9s, 66, 55
            jam12: ['66', '55', 'AQs', 'AJs', 'ATs', 'A9s', 'KTs', 'QJs', 'QTs', 'JTs', 'ATo', 'T9s'],
            fold: 'rest'
        },
        HJ: {
            // Openraise: AA, AKs, AQs, AJs, KK, QQ, K8s, Q9s, QJo, JJ, J9s, KTo, TT, T8s, 99, 87s, 76s
            openraise: ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', 'AKs', 'AQs', 'AJs', 'K8s', 'Q9s', 'QJo', 'J9s', 'KTo', 'T8s', '87s', '76s'],
            // Openjam <15bb: ATs, A9s, AKo, KQs, KJs, AQo, KQo, AJo, ATo, 88, 77, 66, 55
            jam15: ['88', '77', '66', '55', 'ATs', 'A9s', 'AKo', 'AQo', 'AJo', 'ATo', 'KQs', 'KJs', 'KQo'],
            // Openjam <12bb: A8s, A7s, A6s, A5s, A4s, A3s, A2s, KTs, K9s, QJs, QTs, KJo, JTs, T9s, A9o, 98s, 44, 33, 22
            jam12: ['44', '33', '22', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s', 'KTs', 'K9s', 'QJs', 'QTs', 'KJo', 'JTs', 'T9s', 'A9o', '98s'],
            fold: 'rest'
        },
        CO: {
            // Openraise: AA, AKs, AQs, AJs, ATs, KK, QQ, QJo, JJ, TT, 99, 88
            openraise: ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', 'AKs', 'AQs', 'AJs', 'ATs', 'QJo'],
            // Openjam <20bb (immer jam bei 10-20bb): 77, 66, 55, 44, 33, 22
            jam20: ['77', '66', '55', '44', '33', '22'],
            // Openjam <15bb: A9s, A8s, A7s, A6s, A5s, A4s, A3s, A2s, AKo, KQs, KJs, KTs, K9s, AQo, KQo, QJs, QTs, AJo, KJo, ATo
            jam15: ['A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s', 'AKo', 'AQo', 'AJo', 'ATo', 'KQs', 'KJs', 'KTs', 'K9s', 'KQo', 'KJo', 'QJs', 'QTs'],
            // Fold 12bb+: T7s, 86s, 75s, 65s, 64s, 54s (fold bei >=12bb, jam bei <12bb)
            fold12plus: ['T7s', '86s', '75s', '65s', '64s', '54s'],
            // Openjam <12bb (zusätzliche Hände): K8s, K7s, K6s, K5s, Q9s, Q8s, JTs, J9s, J8s, KTo, QTo, T9s, T8s, A9o, 98s, 97s, A8o, 87s, A7o, 76s, A6o, A5o, A4o, A3o
            jam12: ['K8s', 'K7s', 'K6s', 'K5s', 'Q9s', 'Q8s', 'JTs', 'J9s', 'J8s', 'KTo', 'QTo', 'T9s', 'T8s', 'A9o', '98s', '97s', 'A8o', '87s', 'A7o', '76s', 'A6o', 'A5o', 'A4o', 'A3o'],
            // Raise/Fold 10-20bb: A2o, JTo, J7s, Q7s, K4s, K3s, K2s
            raisefold: ['A2o', 'JTo', 'J7s', 'Q7s', 'K4s', 'K3s', 'K2s'],
            fold: 'rest'
        },
        BTN: {
            // Openraise: AA, AKs, AQs, AJs, ATs, A9s, A8s, AKo, KK, KQs, KJs, K4s, K3s, K2s, AQo, KQo, QQ, Q7s, Q6s, Q5s, AJo, JJ, J7s, ATo, TT, K9o, Q9o, J9o, T9o, 99, 88
            openraise: ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', 'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'AKo', 'AQo', 'AJo', 'ATo', 'KQs', 'KJs', 'K4s', 'K3s', 'K2s', 'KQo', 'Q7s', 'Q6s', 'Q5s', 'J7s', 'K9o', 'Q9o', 'J9o', 'T9o'],
            // Openjam <20bb: 55, 44, 33, 22
            jam20: ['55', '44', '33', '22'],
            // Openjam <15bb: A7s-A2s, KTs-K5s, QJs-Q8s, KJo, QJo, JTs-J8s, KTo, QTo, JTo, T9s-T7s, A9o-A2o, 98s, 97s, 87s, 86s, 77, 76s, 75s, 66, 65s, 64s, 54s
            jam15: ['77', '66', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s', 'KTs', 'K9s', 'K8s', 'K7s', 'K6s', 'K5s', 'QJs', 'QTs', 'Q9s', 'Q8s', 'KJo', 'QJo', 'JTs', 'J9s', 'J8s', 'KTo', 'QTo', 'JTo', 'T9s', 'T8s', 'T7s', 'A9o', 'A8o', 'A7o', 'A6o', 'A5o', 'A4o', 'A3o', 'A2o', '98s', '97s', '87s', '86s', '76s', '75s', '65s', '64s', '54s'],
            // Openjam <12bb (openraise Hände die bei <12bb zu jam werden): AQs, AJs, ATs, A9s, A8s, AKo, KQs, KJs, K4s, K3s, K2s, AQo, KQo, Q7s, Q6s, Q5s, AJo, J7s, ATo, K9o, Q9o, J9o, T9o, 99, 96s, 88
            jam12: ['99', '88', 'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'AKo', 'AQo', 'AJo', 'ATo', 'KQs', 'KJs', 'K4s', 'K3s', 'K2s', 'KQo', 'Q7s', 'Q6s', 'Q5s', 'J7s', 'K9o', 'Q9o', 'J9o', 'T9o', '96s'],
            fold: 'rest'
        },
        SB: {
            // Openjam <20bb: KTs, K9s, A5s, A4s, A3s, A2s, A8o, A7o, A6o, A5o, A4o, A3o, A2o, 77, 66, 55, 44, 33, 22
            jam20: ['77', '66', '55', '44', '33', '22', 'KTs', 'K9s', 'A5s', 'A4s', 'A3s', 'A2s', 'A8o', 'A7o', 'A6o', 'A5o', 'A4o', 'A3o', 'A2o'],
            // Limp 12-20bb (jam <12bb): AA, AKs, AQs, AJs, ATs, A9s, A8s, KK, KQs, KJs, QQ, QJs, JJ
            limp12: ['AA', 'KK', 'QQ', 'JJ', 'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'KQs', 'KJs', 'QJs'],
            // Openjam <15bb + limp 15-20bb - INKLUSIVE der "Openraise" Hände: AKo, AQo, KQo, AJo, KJo, ATo, TT, A9o, 99, 88
            jam15_limp: ['TT', '99', '88', 'AKo', 'AQo', 'AJo', 'ATo', 'A9o', 'KQo', 'KJo', 'A7s', 'A6s', 'K8s', 'K7s', 'K6s', 'K5s', 'K4s', 'K3s', 'K2s', 'QTs', 'Q9s', 'Q8s', 'Q7s', 'Q6s', 'Q5s', 'QJo', 'JTs', 'J9s', 'J8s', 'J7s', 'KTo', 'QTo', 'JTo', 'T9s', 'T8s', 'T7s', 'K9o', 'Q9o', 'J9o', 'T9o', '98s', '97s', '96s', '87s', '86s', '76s', '75s', '65s', '64s', '54s'],
            // Openjam <15bb + limp 15-20bb (zweite Gruppe)
            jam15_limp2: ['Q4s', 'Q3s', 'Q2s', 'J6s', 'T6s', '95s', 'K8o', 'Q8o', 'J8o', 'T8o', '98o', '85s', '97o', '87o', '74s', '63s', '53s', '43s'],
            // Limp 15-20bb only (fold bei <15bb)
            limp15: ['Q2o', 'Q3o', 'Q4o', 'J6o', 'T3s', 'T2s', '93s', '92s', '83s', '82s', '72s', '62s'],
            // Limp always
            limp_always: ['T4s', '94s', '73s', 'Q6o', 'T6o', '96o', '86o', 'Q5o', '75o', '65o', '52s', '54o', '42s', '32s'],
            // Openjam <12bb, Openraise 12-20bb
            jam12_raise: ['K7o', 'Q7o', 'J7o', 'T7o', 'K6o', '76o', 'K5o', 'K4o', 'K3o', 'K2o', 'J5s', 'J4s', 'J3s', 'J2s', 'T5s', '84s'],
            // Explizite Fold-Hände (alles andere ist spielbar!)
            foldOnly: ['J5o', 'T5o', '95o', '85o', 'J4o', 'T4o', '94o', '84o', '74o', '64o', 'J3o', 'T3o', '93o', '83o', '73o', '63o', '53o', '43o', 'J2o', 'T2o', '92o', '82o', '72o', '62o', '52o', '42o', '32o'],
            fold: 'rest'
        }
    },

    // === 25bb ===
    '25bb': {
        UTG: {
            // Openraise = alle Hände (call + fold vs 3bet + 4bet)
            openraise: ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', 'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'AKo', 'AQo', 'AJo', 'KQs', 'KJs', 'KTs', 'KQo', 'QJs', 'QTs', 'JTs', 'T9s'],
            // Für späteren 3bet-Modus:
            vs3bet_call: ['AJs', 'ATs', 'KQs', 'KJs', 'AQo', '99', '88'],
            vs3bet_fold: ['A9s', 'A8s', 'KTs', 'KQo', 'QJs', 'QTs', 'AJo', 'JTs', 'T9s', '77'],
            vs3bet_4bet: ['AA', 'AKs', 'AQs', 'AKo', 'KK', 'QQ', 'JJ', 'TT'],
            fold: 'rest'
        },
        UTG1: {
            openraise: ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', 'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'A5s', 'AKo', 'AQo', 'AJo', 'KQs', 'KJs', 'KTs', 'KQo', 'QJs', 'QTs', 'JTs', 'T9s'],
            vs3bet_call: ['AJs', 'ATs', 'KQs', 'KJs', 'AQo', '99', '88'],
            vs3bet_fold: ['A9s', 'A8s', 'A5s', 'KTs', 'KQo', 'QJs', 'QTs', 'AJo', 'JTs', 'T9s', '77'],
            vs3bet_4bet: ['AA', 'AKs', 'AQs', 'AKo', 'KK', 'QQ', 'JJ', 'TT'],
            fold: 'rest'
        },
        UTG2: {
            openraise: ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', 'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A4s', 'A3s', 'A2s', 'AKo', 'AQo', 'AJo', 'ATo', 'KQs', 'KJs', 'KTs', 'KQo', 'QJs', 'QTs', 'JTs', 'T9s', '98s'],
            vs3bet_call: ['AJs', 'ATs', 'KQs', 'KJs', 'AQo', '88'],
            vs3bet_fold: ['A9s', 'A8s', 'KTs', 'KQo', 'QJs', 'QTs', 'AJo', 'JTs', 'T9s', '77', 'A7s', 'A6s', 'A4s', 'A3s', 'A2s', 'ATo', '98s'],
            vs3bet_4bet: ['AA', 'AKs', 'AQs', 'AKo', 'KK', 'QQ', 'JJ', 'TT', '99'],
            fold: 'rest'
        },
        MP: {
            openraise: ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', 'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s', 'AKo', 'AQo', 'AJo', 'ATo', 'KQs', 'KJs', 'KTs', 'K9s', 'KQo', 'KJo', 'QJs', 'QTs', 'Q9s', 'JTs', 'J9s', 'T9s', '98s'],
            vs3bet_call: ['AJs', 'ATs', 'A9s', 'KQs', 'KJs', 'AQo', 'QJs', 'JTs', '88'],
            vs3bet_fold: ['A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s', 'KTs', 'K9s', 'KQo', 'QTs', 'Q9s', 'AJo', 'KJo', 'J9s', 'ATo', 'T9s', '98s', '77', '66'],
            vs3bet_4bet: ['AA', 'AKs', 'AQs', 'AKo', 'KK', 'QQ', 'JJ', 'TT', '99'],
            fold: 'rest'
        },
        HJ: {
            openraise: ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', 'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s', 'AKo', 'AQo', 'AJo', 'ATo', 'A9o', 'KQs', 'KJs', 'KTs', 'K9s', 'K8s', 'KQo', 'KJo', 'KTo', 'QJs', 'QTs', 'Q9s', 'Q8s', 'QJo', 'QTo', 'JTs', 'J9s', 'J8s', 'T9s', 'T8s', '98s', '97s', '87s', '76s'],
            vs3bet_call: ['ATs', 'A9s', 'KQs', 'KJs', 'QJs', 'AJo', 'JTs'],
            vs3bet_fold: ['A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s', 'KTs', 'K9s', 'K8s', 'KQo', 'QTs', 'Q9s', 'Q8s', 'KJo', 'QJo', 'J9s', 'J8s', 'ATo', 'KTo', 'QTo', 'T9s', 'T8s', 'A9o', '98s', '97s', '87s', '76s'],
            vs3bet_4bet: ['AA', 'AKs', 'AQs', 'AJs', 'AKo', 'KK', 'AQo', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55'],
            fold: 'rest'
        },
        CO: {
            openraise: ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44', '33', '22', 'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s', 'AKo', 'AQo', 'AJo', 'ATo', 'A9o', 'A8o', 'A5o', 'A4o', 'A3o', 'A2o', 'KQs', 'KJs', 'KTs', 'K9s', 'K8s', 'K7s', 'K6s', 'KQo', 'KJo', 'KTo', 'QJs', 'QTs', 'Q9s', 'Q8s', 'QJo', 'QTo', 'JTs', 'J9s', 'J8s', 'JTo', 'T9s', 'T8s', '98s', '97s', '87s', '76s', '75s', '65s'],
            vs3bet_call: ['ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s', 'KQs', 'KJs', 'KTs', 'KQo', 'QJs', 'QTs', 'AJo', 'JTs', 'T9s'],
            vs3bet_fold: ['K9s', 'K8s', 'K7s', 'K6s', 'Q9s', 'Q8s', 'KJo', 'QJo', 'J9s', 'J8s', 'ATo', 'KTo', 'QTo', 'JTo', 'T8s', 'A9o', '98s', '97s', 'A8o', '87s', '76s', '75s', '65s', 'A5o', 'A4o', 'A3o', 'A2o'],
            vs3bet_4bet: ['AA', 'AKs', 'AQs', 'AJs', 'AKo', 'KK', 'AQo', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44', '33', '22'],
            fold: 'rest'
        },
        BTN: {
            openraise: ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44', '33', '22', 'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s', 'AKo', 'AQo', 'AJo', 'ATo', 'A9o', 'A8o', 'A7o', 'A6o', 'A5o', 'A4o', 'A3o', 'A2o', 'KQs', 'KJs', 'KTs', 'K9s', 'K8s', 'K7s', 'K6s', 'K5s', 'K4s', 'K3s', 'K2s', 'KQo', 'KJo', 'KTo', 'K9o', 'QJs', 'QTs', 'Q9s', 'Q8s', 'Q7s', 'Q6s', 'Q5s', 'QJo', 'QTo', 'Q9o', 'JTs', 'J9s', 'J8s', 'J7s', 'JTo', 'J9o', 'T9s', 'T8s', 'T7s', 'T9o', '98s', '97s', '96s', '87s', '86s', '85s', '76s', '75s', '65s', '64s', '54s'],
            vs3bet_call: ['ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s', 'KQs', 'KJs', 'KTs', 'K9s', 'KQo', 'QJs', 'QTs', 'Q9s', 'AJo', 'KJo', 'JTs', 'J9s', 'ATo', 'T9s', 'T8s', '98s', '87s'],
            vs3bet_fold: ['K8s', 'K7s', 'K6s', 'K5s', 'K4s', 'K3s', 'K2s', 'Q8s', 'Q7s', 'Q6s', 'Q5s', 'QJo', 'J8s', 'J7s', 'KTo', 'QTo', 'JTo', 'T7s', 'A9o', 'K9o', 'Q9o', 'J9o', 'T9o', '97s', '96s', 'A8o', '86s', '85s', 'A7o', '76s', '75s', 'A6o', '65s', '64s', 'A5o', '54s', 'A4o', 'A3o', 'A2o'],
            vs3bet_4bet: ['AA', 'AKs', 'AQs', 'AJs', 'AKo', 'KK', 'AQo', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44', '33', '22'],
            fold: 'rest'
        },
        SB: {
            // Keine Daten für SB bei 25bb
            openraise: [],
            fold: 'rest'
        }
    },

    // === 100bb (40-100bb) ===
    '100bb': {
        UTG: {
            // Alle OR Hände (kombiniert aus allen 3bet-Reaktions-Kategorien)
            openraise: ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', 'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A5s', 'A4s', 'A3s', 'A2s', 'AKo', 'AQo', 'AJo', 'KQs', 'KJs', 'KTs', 'QJs', 'QTs', 'JTs', 'T9s', '98s'],
            // 3bet-Reaktionen für späteren Modus:
            vs3bet_4bet_value: ['AA', 'KK'],
            vs3bet_4bet_bluff: ['A5s', 'A4s', 'A3s'],
            vs3bet_call: ['AQs', 'AJs', 'ATs', 'KQs', 'KJs', 'AQo', 'QJs', 'JTs', 'T9s', '88', '77'],
            vs3bet_fold: ['A9s', 'A2s', 'KTs', 'QTs', 'AJo', '98s'],
            vs3bet_4bet_jam_40bb: ['AKs', 'AKo', 'QQ', 'JJ'],
            vs3bet_4bet_jam_30bb: ['AQs', 'AQo', 'TT', '99'],
            fold: 'rest'
        },
        UTG1: {
            openraise: ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', 'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'A5s', 'A4s', 'A3s', 'A2s', 'AKo', 'AQo', 'AJo', 'KQs', 'KJs', 'KTs', 'KQo', 'QJs', 'QTs', 'JTs', 'T9s', '98s', '87s'],
            vs3bet_4bet_value: ['AA', 'KK'],
            vs3bet_4bet_bluff: ['A5s', 'A4s', 'A3s'],
            vs3bet_call: ['AJs', 'ATs', 'KQs', 'KJs', 'AQo', 'QJs', 'JTs', 'T9s', '88', '77'],
            vs3bet_fold: ['A9s', 'A8s', 'A2s', 'KTs', 'KQo', 'QTs', 'AJo', '98s', '87s'],
            vs3bet_4bet_jam_40bb: ['AKs', 'AKo', 'QQ', 'JJ'],
            vs3bet_4bet_jam_30bb: ['TT', '99'],
            fold: 'rest'
        },
        UTG2: {
            openraise: ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', 'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s', 'AKo', 'AQo', 'AJo', 'ATo', 'KQs', 'KJs', 'KTs', 'KQo', 'KJo', 'QJs', 'QTs', 'JTs', 'T9s', '98s', '87s'],
            vs3bet_4bet_value: ['AA', 'KK'],
            vs3bet_4bet_bluff: ['A5s', 'A4s', 'A3s', 'A2s'],
            vs3bet_call: ['AJs', 'ATs', 'KQs', 'KJs', 'QJs', 'JTs', 'T9s', '98s', '88', '77', '66', '55'],
            vs3bet_fold: ['A9s', 'A8s', 'A7s', 'A6s', 'KTs', 'KQo', 'QTs', 'AJo', 'KJo', 'ATo', '87s'],
            vs3bet_4bet_jam_50bb: ['QQ'],
            vs3bet_4bet_jam_40bb: ['AKs', 'AKo', 'JJ'],
            vs3bet_4bet_jam_30bb: ['TT', '99', 'AQs', 'AQo'],
            fold: 'rest'
        },
        MP: {
            openraise: ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44', '33', '22', 'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s', 'AKo', 'AQo', 'AJo', 'ATo', 'KQs', 'KJs', 'KTs', 'K9s', 'KQo', 'KJo', 'QJs', 'QTs', 'Q9s', 'JTs', 'J9s', 'T9s', '98s', '87s', '76s'],
            vs3bet_4bet_value: ['AA', 'KK'],
            vs3bet_4bet_bluff: ['A5s', 'A4s', 'A3s', 'A2s'],
            vs3bet_call: ['AJs', 'ATs', 'A9s', 'KQs', 'KJs', 'QJs', 'JTs', 'T9s', '98s', '88', '87s', '77', '66', '55', '76s', '44', '33', '22'],
            vs3bet_fold: ['A8s', 'A7s', 'A6s', 'KTs', 'K9s', 'KQo', 'QTs', 'Q9s', 'AJo', 'KJo', 'J9s', 'ATo'],
            vs3bet_4bet_jam_50bb: ['AKs', 'QQ'],
            vs3bet_4bet_jam_40bb: ['JJ', 'AKo'],
            vs3bet_4bet_jam_30bb: ['TT', '99', 'AQs', 'AQo'],
            fold: 'rest'
        },
        HJ: {
            openraise: ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44', '33', '22', 'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s', 'AKo', 'AQo', 'AJo', 'ATo', 'A9o', 'KQs', 'KJs', 'KTs', 'K9s', 'K8s', 'KQo', 'KJo', 'KTo', 'QJs', 'QTs', 'Q9s', 'Q8s', 'QJo', 'QTo', 'JTs', 'J9s', 'J8s', 'JTo', 'T9s', 'T8s', '98s', '97s', '87s', '76s', '65s', '54s'],
            vs3bet_4bet_value: ['AA', 'KK'],
            vs3bet_4bet_bluff: ['A8s', 'A5s', 'A4s', 'A3s', 'A2s'],
            vs3bet_call: ['AQs', 'AQo', 'AJs', 'ATs', 'A9s', 'KQs', 'KJs', 'KTs', 'KQo', 'QJs', 'QTs', 'JTs', 'T9s', '98s', 'AJo', '87s', '76s', '66', '55', '65s', '54s', '44', '33', '22'],
            vs3bet_fold: ['A7s', 'A6s', 'K9s', 'K8s', 'Q9s', 'Q8s', 'KJo', 'QJo', 'J9s', 'J8s', 'ATo', 'KTo', 'QTo', 'JTo', 'T8s', 'A9o', '97s'],
            vs3bet_4bet_jam_50bb: ['AKs', 'AKo', 'QQ'],
            vs3bet_4bet_jam_40bb: ['JJ'],
            vs3bet_4bet_jam_30bb: ['TT', '99', '88', '77'],
            fold: 'rest'
        },
        CO: {
            openraise: ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44', '33', '22', 'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s', 'AKo', 'AQo', 'AJo', 'ATo', 'A9o', 'A8o', 'A5o', 'A4o', 'A3o', 'A2o', 'KQs', 'KJs', 'KTs', 'K9s', 'K8s', 'K7s', 'K6s', 'K5s', 'KQo', 'KJo', 'KTo', 'QJs', 'QTs', 'Q9s', 'Q8s', 'Q7s', 'QJo', 'QTo', 'JTs', 'J9s', 'J8s', 'J7s', 'JTo', 'T9s', 'T8s', 'T7s', '98s', '97s', '87s', '86s', '76s', '75s', '65s', '54s'],
            vs3bet_4bet_value: ['AA', 'KK'],
            vs3bet_4bet_bluff: ['A7s', 'A6s', 'ATo', 'K8s', 'K7s', 'A5s', 'A4s', 'A3s', 'A2s'],
            vs3bet_call: ['AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s', 'KQs', 'KJs', 'KTs', 'K9s', 'KQo', 'QJs', 'QTs', 'Q9s', 'AJo', 'JTs', 'J9s', 'T9s', 'T8s', '98s', '97s', '87s', '76s', '65s', '66', '55', '44', '33', '22', 'ATo', '86s', '54s'],
            vs3bet_fold: ['K6s', 'K5s', 'Q8s', 'Q7s', 'KJo', 'QJo', 'J8s', 'J7s', 'KTo', 'QTo', 'JTo', 'T7s', 'A9o', 'A8o', '75s', 'A5o', 'A4o', 'A3o', 'A2o'],
            vs3bet_4bet_jam_50bb: ['JJ', 'QQ', 'AKo', 'AKs'],
            vs3bet_4bet_jam_40bb: ['TT'],
            vs3bet_4bet_jam_30bb: ['99', '88', '77', 'AQs', 'AQo'],
            fold: 'rest'
        },
        BTN: {
            openraise: ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44', '33', '22', 'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s', 'AKo', 'AQo', 'AJo', 'ATo', 'A9o', 'KQs', 'KJs', 'KTs', 'K9s', 'K8s', 'K7s', 'K6s', 'K5s', 'K4s', 'K3s', 'K2s', 'KQo', 'KJo', 'KTo', 'K9o', 'K8o', 'QJs', 'QTs', 'Q9s', 'Q8s', 'Q7s', 'Q6s', 'Q5s', 'Q4s', 'Q3s', 'Q2s', 'QJo', 'QTo', 'Q9o', 'JTs', 'J9s', 'J8s', 'J7s', 'J6s', 'J5s', 'J4s', 'J3s', 'J2s', 'JTo', 'J9o', 'T9s', 'T8s', 'T7s', 'T6s', 'T5s', 'T4s', 'T9o', '98s', '97s', '96s', '95s', '94s', 'A8o', 'A7o', 'A6o', 'A5o', 'A4o', 'A3o', 'A2o', '87s', '86s', '85s', '84s', '76s', '75s', '74s', '73s', '65s', '64s', '63s', '54s', '53s', '43s'],
            vs3bet_4bet_value: ['AA', 'KK'],
            vs3bet_4bet_bluff: ['K7s', 'K6s', 'A9o', 'QJo'],
            vs3bet_call: ['ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s', 'KQs', 'KJs', 'KTs', 'K9s', 'K8s', 'KQo', 'QJs', 'QTs', 'Q9s', 'Q8s', 'AJo', 'KJo', 'JTs', 'J9s', 'J8s', 'ATo', 'T9s', 'T8s', '98s', '97s', '87s', '86s', '76s', '75s', '65s', '64s', '54s'],
            vs3bet_fold: ['K5s', 'K4s', 'K3s', 'K2s', 'Q7s', 'Q6s', 'Q5s', 'Q4s', 'Q3s', 'Q2s', 'J7s', 'J6s', 'J5s', 'J4s', 'J3s', 'J2s', 'KTo', 'QTo', 'JTo', 'T7s', 'T6s', 'T5s', 'T4s', 'K9o', 'Q9o', 'J9o', 'T9o', '96s', '95s', '94s', 'A8o', 'K8o', '85s', '84s', 'A7o', '74s', '73s', 'A6o', '63s', 'A5o', '53s', 'A4o', '43s', 'A3o', 'A2o'],
            vs3bet_4bet_jam_50bb: ['AKs', 'AKo', 'QQ', 'JJ'],
            vs3bet_4bet_jam_40bb: ['TT'],
            vs3bet_4bet_jam_30bb: ['22', '33', '44', '55', '66', '77', '88', '99', 'AQo', 'AQs', 'AJs'],
            fold: 'rest'
        },
        SB: {
            openraise: ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44', '33', '22', 'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s', 'AKo', 'AQo', 'AJo', 'ATo', 'A9o', 'A8o', 'A7o', 'A6o', 'A5o', 'A4o', 'A3o', 'A2o', 'KQs', 'KJs', 'KTs', 'K9s', 'K8s', 'K7s', 'K6s', 'K5s', 'K4s', 'K3s', 'K2s', 'KQo', 'KJo', 'KTo', 'K9o', 'QJs', 'QTs', 'Q9s', 'Q8s', 'Q7s', 'Q6s', 'Q5s', 'Q4s', 'Q3s', 'Q2s', 'QJo', 'QTo', 'Q9o', 'JTs', 'J9s', 'J8s', 'J7s', 'J6s', 'J5s', 'J4s', 'J3s', 'J2s', 'JTo', 'J9o', 'T9s', 'T8s', 'T7s', 'T6s', 'T5s', 'T9o', '98s', '98o', '97s', '96s', '95s', 'A8o', '87s', '86s', '85s', '76s', '75s', '64s', '65s', '54s'],
            vs3bet_4bet_value: ['AA', 'AKs', 'AKo', 'KK', 'QQ'],
            vs3bet_4bet_bluff: ['K8s', 'Q8s', 'J8s', 'K7s', 'K6s', '86s', '75s', '64s'],
            vs3bet_call: ['ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s', 'KQs', 'KJs', 'KTs', 'K9s', 'KQo', 'QJs', 'QTs', 'Q9s', 'AJo', 'KJo', 'QJo', 'JTs', 'J9s', 'ATo', 'T9s', 'T8s', '98s', '87s', '76s', '65s', '54s'],
            vs3bet_fold: ['K7s', 'K6s', 'K5s', 'K4s', 'K3s', 'K2s', 'Q7s', 'Q6s', 'Q5s', 'Q4s', 'Q3s', 'Q2s', 'J7s', 'J6s', 'J5s', 'J4s', 'J3s', 'J2s', 'KTo', 'QTo', 'JTo', 'T7s', 'T6s', 'T5s', 'A9o', 'K9o', 'Q9o', 'J9o', 'T9o', '97s', '96s', '95s', 'A8o', '98o', '86s', '85s', 'A7o', '75s', 'A6o', 'A5o', 'A4o', 'A3o', 'A2o'],
            vs3bet_4bet_jam_50bb: ['JJ'],
            vs3bet_4bet_jam_40bb: ['AQs', 'AQo', 'TT', '99', '88'],
            vs3bet_4bet_jam_30bb: ['AJs', '77', '66', '55', '44', '33', '22'],
            fold: 'rest'
        }
    }
};

// ============================================
// PUSH RANGES (All-in als Open)
// ============================================
// Wird später hinzugefügt wenn OR funktioniert

const PUSH_RANGES = {
    // PLACEHOLDER - Wird später gefüllt
    '10-20bb': {},
    '25bb': {},
    '15bb': {},
    '12bb': {},
    '10bb': {},
    '8bb': {},
    '6bb': {}
};

// ============================================
// REJAM RANGES (All-in über Raise)
// ============================================
// Wird später hinzugefügt

const REJAM_RANGES = {
    // PLACEHOLDER
};

// ============================================
// FLAT/3BET RANGES (Reaktion auf Opens)
// ============================================
// Hero ist NICHT Opener, sondern reagiert auf Open einer früheren Position.
//
// Struktur: FLAT_3BET_RANGES[vs_OPENER][stackBracket][heroPosition]
//
// Stack-Brackets (geplant): '20-30bb', '30-40bb', '40-50bb', '50bb+'
// Aktuell befüllt @ 20-30bb:
//   vs_UTG  → UTG1, MP, BTN, SB, BB
//   vs_MP   → BTN, SB, BB
//   vs_BTN  → SB, BB
//   vs_SB   → BB
//
// Sub-Bracket Logik innerhalb 20-30bb:
//   - Default-Keys (threebet_jam, flatcall, value_3bet) gelten 20-30bb
//   - Keys mit Suffix _25_30 überschreiben bei Stack 25-30bb
//   - Keys mit Suffix _20_25 überschreiben bei Stack 20-25bb
//   - flat_soft_table / threebet_bluff_optional sind situativ (Default: Fold)

const FLAT_3BET_RANGES = {
    vs_UTG: {
        '20-30bb': {
            UTG1: {
                threebet_jam: ['AKo', 'AKs', 'AQs', 'JJ', 'TT'],
                flatcall: ['AJs', 'KQs', 'AQo', '99'],
                value_3bet: ['AA', 'KK', 'QQ'],
                // 25-30bb: AKs + JJ werden Value-3-Bet statt Jam, AQo wird Bluff statt Flat
                value_3bet_25_30: ['AKs', 'JJ'],
                threebet_bluff_25_30: ['AQo'],
                flat_soft_table: ['QJs']
            },
            MP: {
                threebet_jam: ['AKo', 'AKs', 'AQs', 'AQo', 'JJ', 'TT'],
                flatcall: ['AJs', 'ATs', 'KQs', 'KJs', 'QJs', '99', '88'],
                value_3bet: ['AA', 'KK', 'QQ'],
                value_3bet_25_30: ['AKs', 'JJ'],
                threebet_bluff_25_30: ['AQo'],
                threebet_bluff_optional: ['A9s'],
                flat_soft_table: ['JTs']
            },
            BTN: {
                threebet_jam: ['AKs', 'AQs', 'AJs', 'ATs', 'AKo', 'AQo', 'JJ', 'TT', '99', '88'],
                flatcall: ['A9s', 'KQs', 'KJs', 'QJs', 'JTs', '77'],
                value_3bet: ['AA', 'KK', 'QQ'],
                value_3bet_25_30: ['AKs', 'JJ'],
                // 25-30bb: ATs + AQo aus Jam zu Flat
                flatcall_25_30: ['ATs', 'AQo'],
                threebet_bluff_25_30: ['AJo', 'A3s', 'A2s'],
                flat_soft_table: ['KTs', 'QTs', 'T9s', '66']
            },
            SB: {
                // SB jammt bei 20-30bb direkt All-in (kein klassisches 3-Bet Sizing)
                threebet_jam: ['AQs', 'AJs', 'ATs', 'AKo', 'KQs', 'AQo', 'TT', '99', '88'],
                value_3bet: ['AA', 'KK', 'QQ'],
                value_3bet_25_30: ['AKs', 'JJ'],
                // KJs: 20-25bb = Flat, 25-30bb = Bluff
                flatcall_20_25: ['KJs'],
                threebet_bluff_25_30: ['KJs', 'A3s', 'A2s'],
                threebet_bluff_20_25: ['A4s'],
                flat_soft_table: ['KTs', 'QJs', 'QTs', 'JTs']
            },
            BB: {
                threebet_jam: ['AQs', 'AJs', 'AKo', 'AQo', 'TT', '99'],
                flatcall: [
                    'KJs', 'KTs', 'K9s', 'K8s', 'K7s', 'K6s', 'K5s', 'K4s', 'K3s', 'KQo',
                    'QJs', 'QTs', 'Q9s', 'Q8s', 'Q7s', 'Q6s', 'Q5s', 'KJo', 'QJo',
                    'JTs', 'J9s', 'J8s', 'J7s', 'J6s', 'J5s', 'KTo', 'QTo', 'JTo',
                    'T9s', 'T8s', 'T7s', 'T6s', 'T5s',
                    'A9o', 'K9o', 'Q9o', 'J9o', 'T9o',
                    '98s', '97s', '96s', '95s', 'A8o', 'T8o', '98o',
                    '87s', '86s', '85s', '87o', '76s', '75s', '74s',
                    '65s', '64s', '54s', '53s', '43s'
                ],
                // 20bb+ = Flat, <20bb = All-in (im 20-30bb Bracket also alles Flat)
                flatcall_20bb_plus: [
                    'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s',
                    'KQs', 'AJo', 'ATo',
                    '88', '77', '66', '55', '44', '33', '22'
                ],
                // Nur verteidigen wenn Opener minraised
                defend_minraise_only: [
                    'K2s', 'Q4s', 'Q3s', 'Q2s', 'J4s', 'J3s', 'J2s', 'T4s',
                    '94s', '84s', 'A7o', '97o', '73s', 'A6o', '76o',
                    '63s', '62s', 'A5o', '65o', '52s', 'A4o', '42s', '32s'
                ],
                value_3bet: ['AA', 'KK'],
                // AKs/QQ/JJ: 20-25bb = All-in, 25-30bb = Value 3-Bet
                threebet_jam_20_25: ['AKs', 'QQ', 'JJ'],
                value_3bet_25_30: ['AKs', 'QQ', 'JJ'],
                threebet_bluff_25_30: ['A2o'],
                threebet_bluff_20_25: ['A3o']
            }
        }
        // '30-40bb', '40-50bb', '50bb+' folgen später
    },

    vs_MP: {
        '20-30bb': {
            BTN: {
                threebet_jam: ['AJs', 'ATs', 'AKo', 'KQs', 'AQo', '99', '88', '77', '66', '55', '44', '33', '22'],
                value_3bet: ['AA', 'AKs', 'KK', 'QQ', 'JJ'],
                value_3bet_25_30: ['AQs', 'TT'],
                // 25-30bb: kleine Pairs flat statt jam
                flatcall_25_30: ['88', '77', '66', '55', '44', '33', '22'],
                threebet_bluff_25_30: ['A5s', 'A4s', 'A3s', 'A2s'],
                threebet_bluff_20_25: ['ATo', 'K9s'],
                flat_soft_table: ['A9s', 'A8s', 'A7s', 'A6s', 'KJs', 'KTs', 'KQo', 'QJs', 'QTs', 'AJo', 'JTs', 'T9s']
            },
            SB: {
                threebet_jam: [
                    'AJs', 'ATs', 'AKo', 'KQs', 'KJs', 'KTs', 'K9s',
                    'AQo', 'KQo', 'QJs', 'QTs', 'Q9s',
                    'AJo', 'JTs', 'J9s',
                    'TT', 'T9s', '99', '98s', '88', '77', '66', '55', '44', '33', '22'
                ],
                // 20-25bb: Premiums jammen statt raise
                threebet_jam_20_25: ['AKs', 'AQs', 'QQ', 'JJ'],
                value_3bet: ['AA', 'KK'],
                value_3bet_25_30: ['AKs', 'AQs', 'QQ', 'JJ'],
                flatcall_25_30: ['ATs', 'KQs', 'KJs', 'KTs', 'QJs', 'QTs', 'JTs', 'T9s'],
                threebet_bluff_25_30: ['A9s', 'A3s', 'A2s'],
                threebet_bluff_20_25: ['A9s', 'A5s', 'A4s']
            },
            BB: {
                threebet_jam: ['AJs', 'ATs', 'AQo', '99', '88', '77', '66', '55'],
                threebet_jam_20_25: ['AKs', 'AQs', 'AKo', 'JJ', 'TT'],
                value_3bet: ['AA', 'KK', 'QQ'],
                value_3bet_25_30: ['AKs', 'AQs', 'AKo', 'JJ', 'TT'],
                flatcall: [
                    'K7s', 'K6s', 'K5s', 'K4s', 'K3s', 'K2s',
                    'Q9s', 'Q8s', 'Q7s', 'Q6s', 'Q5s', 'Q4s', 'QJo',
                    'J9s', 'J8s', 'J7s', 'J6s',
                    'KTo', 'QTo', 'JTo',
                    'T9s', 'T8s', 'T7s', 'T6s', 'T5s',
                    'A9o', 'K9o', 'Q9o', 'J9o', 'T9o',
                    '98s', '97s', '96s', '95s',
                    'A8o', '87s', '86s', '85s', '84s',
                    'A7o', '76s', '75s',
                    'A6o', '65s',
                    'A5o', 'A4o',
                    '44', '33', '22'
                ],
                flatcall_20bb_plus: [
                    'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s',
                    'KQs', 'KJs', 'KTs', 'K9s', 'K8s', 'KQo',
                    'QJs', 'QTs', 'AJo', 'KJo', 'JTs', 'ATo'
                ],
                defend_minraise_only: [
                    'Q3s', 'Q2s', 'J5s', 'J4s', 'J3s', 'J2s', 'T4s', 'T3s', 'T2s',
                    '94s', '93s',
                    'K8o', 'Q8o', 'J8o', 'T8o', '98o',
                    '83s', 'T7o', '97o', '87o',
                    '73s', '96o', '86o', '76o',
                    '62s', '65o', '52s', '64o', '54o',
                    '42s', '32s'
                ],
                threebet_bluff_25_30: ['74s', '64s', '63s', '54s', '53s', '43s'],
                threebet_bluff_20_25: ['A3o', 'A2o']
            }
        }
    },

    vs_BTN: {
        '20-30bb': {
            SB: {
                threebet_jam: [
                    'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s',
                    'AKo', 'KQs', 'KJs', 'KTs', 'K9s', 'K8s', 'K7s', 'K6s', 'K5s',
                    'AQo', 'KQo', 'QJs', 'QTs', 'Q9s', 'Q8s',
                    'AJo', 'KJo', 'QJo', 'JTs', 'J9s', 'J8s',
                    'ATo', 'KTo', 'T9s', 'T8s',
                    'A9o', '99', '98s',
                    'A8o', '88', '87s',
                    'A7o', '77', '76s',
                    '66', '65s',
                    '55', '54s',
                    '44', '33', '22'
                ],
                threebet_jam_20_25: ['AKs', 'AQs', 'TT'],
                value_3bet: ['AA', 'KK', 'QQ', 'JJ'],
                value_3bet_25_30: ['AKs', 'AQs', 'TT'],
                // 25-30bb: A7s-A2s aus Jam zu Bluff-Raise reklassifiziert
                threebet_bluff_25_30: ['A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s'],
                threebet_bluff_20_25: ['A8o', 'A7o']
            },
            BB: {
                threebet_jam: [
                    'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s',
                    'KJs', 'KQo', 'QJs', 'AJo', 'KJo', 'ATo', 'A9o',
                    '99', '88', '77', '66', '55', '44', '33', '22'
                ],
                threebet_jam_20_25: ['AQs', 'AJs', 'AKo', 'KQs', 'AQo', 'TT'],
                value_3bet: ['AA', 'AKs', 'KK', 'QQ', 'JJ'],
                value_3bet_25_30: ['AQs', 'AJs', 'AKo', 'KQs', 'AQo', 'TT'],
                // "Flatcall vs <2,25x openraise" – Call bei openSize < 2.5bb (2.0/2.2/2.3 callen, 2.5+ folden)
                flatcall_small_open: [
                    'Q7s', 'Q6s', 'Q5s', 'Q4s', 'Q3s', 'Q2s',
                    'J7s', 'J6s', 'J5s', 'J4s', 'J3s', 'J2s',
                    'QTo', 'JTo',
                    'T7s', 'T6s', 'T5s', 'T4s', 'T3s', 'T2s',
                    'K9o', 'Q9o', 'J9o', 'T9o',
                    '96s', '95s', '94s', '93s', '92s',
                    'K8o', 'Q8o', 'J8o', 'T8o', '98o',
                    '86s', '85s', '84s', '83s', '82s',
                    'K7o', 'Q7o', 'J7o', 'T7o', '97o', '87o',
                    '76s', '75s', '72s',
                    'K6o', 'Q6o', '65s', '62s',
                    'K5o', 'Q5o', '54s', '52s',
                    '42s', '32s'
                ],
                flatcall_20bb_plus: [
                    'KTs', 'K9s', 'K8s', 'K7s', 'K6s', 'K5s', 'K4s', 'K3s', 'K2s',
                    'QTs', 'Q9s', 'Q8s', 'QJo',
                    'JTs', 'J9s', 'J8s', 'KTo',
                    'T9s', 'T8s', '98s', '97s',
                    'A8o', '87s', 'A7o', 'A6o', 'A5o', 'A4o', 'A3o', 'A2o'
                ],
                defend_minraise_only: [
                    'J6o', 'T6o', '96o', '86o',
                    'J5o', '95o', '85o',
                    'K4o', 'Q4o', 'K3o', 'Q3o',
                    '53o', '43o',
                    'K2o', 'Q2o'
                ],
                threebet_bluff_25_30: ['74s', '73s', '76o', '64s', '63s', '75o', '53s', '64o', '43s'],
                threebet_bluff_20_25: ['65o', '54o']
            }
        }
    },

    vs_SB: {
        '20-30bb': {
            BB: {
                threebet_jam: [
                    'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s',
                    'KJs', 'KTs', 'K9s',
                    'KQo', 'QJs', 'QTs', 'Q9s',
                    'JTs', 'J9s', 'J8s',
                    'ATo', 'T9s', 'T8s', 'A9o',
                    '98s', 'A8o', '87s',
                    '77', '66', '55', '44', '33', '22'
                ],
                threebet_jam_20_25: ['AJs', 'ATs', 'AKo', 'KQs', 'AQo', 'AJo', '99', '88'],
                value_3bet: ['AA', 'AKs', 'AQs', 'KK', 'QQ', 'JJ', 'TT'],
                value_3bet_25_30: ['AJs', 'ATs', 'AKo', 'KQs', 'AQo', 'AJo', '99', '88'],
                threebet_bluff_25_30: ['74s', '73s', '64s', '63s', '54s', '53s', '64o', '43s'],
                threebet_bluff_20_25: ['65o', '54o'],
                flatcall: [
                    'K8s', 'K7s', 'K6s', 'K5s', 'K4s', 'K3s', 'K2s',
                    'Q8s', 'Q7s', 'Q6s', 'Q5s', 'Q4s', 'Q3s', 'Q2s',
                    'KJo', 'QJo',
                    'J7s', 'J6s', 'J5s', 'J4s', 'J3s', 'J2s',
                    'KTo', 'QTo', 'JTo',
                    'T7s', 'T6s', 'T5s', 'T4s', 'T3s', 'T2s',
                    'K9o', 'Q9o', 'J9o', 'T9o',
                    '97s', '96s', '95s', '94s', '93s', '92s',
                    'K8o', 'Q8o', 'J8o', 'T8o', '98o',
                    '86s', '85s', '84s', '83s', '82s',
                    'A7o', 'K7o', 'Q7o', 'J7o', 'T7o', '97o', '87o',
                    '76s', '75s', '72s',
                    'A6o', 'K6o', 'Q6o', 'J6o', 'T6o', '96o', '86o', '76o',
                    '65s', '62s',
                    'A5o', 'K5o', 'Q5o', 'J5o', 'T5o', '95o', '85o', '75o',
                    '52s',
                    'A4o', 'K4o', 'Q4o', 'J4o', 'T4o',
                    '42s',
                    'A3o', 'K3o', 'Q3o', 'J3o',
                    '53o', '43o', '32s',
                    'A2o', 'K2o', 'Q2o'
                ],
                defend_minraise_only: [
                    '94o', '84o', '74o', 'T3o',
                    '93o', '83o', '73o', '63o',
                    'J2o', 'T2o', '92o', '82o', '72o', '62o', '52o', '42o', '32o'
                ]
            }
        }
    }
    // vs_UTG1, vs_UTG2, vs_HJ, vs_CO folgen später
};

// ============================================
// CALL REJAM RANGES (Call All-in)
// ============================================
// Wird später hinzugefügt

const CALL_REJAM_RANGES = {
    // PLACEHOLDER
};

// ============================================
// BB DEFENSE RANGES
// ============================================
// Wird später hinzugefügt

const BB_DEFEND_RANGES = {
    // PLACEHOLDER
};

// ============================================
// BB VS SB RANGES
// ============================================
// Wird später hinzugefügt

const BB_VS_SB_RANGES = {
    // PLACEHOLDER
};

// ============================================
// HELPER FUNCTIONS
// ============================================

// Alias: 20-30bb OR nutzt 25bb-Ranges als Approximation (bis eigene Daten existieren)
function resolveORStacksize(stacksize) {
    if (stacksize === '20-30bb') return '25bb';
    return stacksize;
}

function getTournamentOpenRange(stacksize, position) {
    const effective = resolveORStacksize(stacksize);
    const stackRanges = OR_RANGES[effective];
    if (!stackRanges) return null;
    return stackRanges[position] || null;
}

// Bestimmt die korrekte Aktion für eine Hand basierend auf Position und exakter Stacksize
// Returns: 'openraise', 'jam', 'limp', oder 'fold'
function getTournamentORAction(hand, position, stackBB, stackSize = '10-20bb') {
    const effective = resolveORStacksize(stackSize);

    // === 25bb / 100bb / 20-30bb: Einfache Logik - nur Openraise oder Fold ===
    if (effective === '25bb' || effective === '100bb') {
        const range = OR_RANGES[effective][position];
        if (!range) return 'fold';
        if (range.openraise && range.openraise.includes(hand)) {
            return 'openraise';
        }
        return 'fold';
    }

    // === 10-20bb: Komplexe Logik mit Jam/Limp ===
    const range = OR_RANGES['10-20bb'][position];
    if (!range) return 'fold';

    // === SB SPEZIAL-LOGIK (mit Limp-Optionen) ===
    if (position === 'SB') {
        // Explizite Fold-Hände zuerst prüfen
        if (range.foldOnly && range.foldOnly.includes(hand)) {
            return 'fold';
        }

        // Jam <20bb (immer jam bei 10-20bb)
        if (range.jam20 && range.jam20.includes(hand)) {
            return 'jam';
        }

        // Limp 12-20bb, Jam <12bb (Premium-Hände)
        if (range.limp12 && range.limp12.includes(hand)) {
            return stackBB < 12 ? 'jam' : 'limp';
        }

        // Jam <15bb + Limp 15-20bb
        if (range.jam15_limp && range.jam15_limp.includes(hand)) {
            return stackBB < 15 ? 'jam' : 'limp';
        }
        if (range.jam15_limp2 && range.jam15_limp2.includes(hand)) {
            return stackBB < 15 ? 'jam' : 'limp';
        }

        // Limp 15-20bb only, Fold <15bb
        if (range.limp15 && range.limp15.includes(hand)) {
            return stackBB >= 15 ? 'limp' : 'fold';
        }

        // Limp always (bei 10-20bb)
        if (range.limp_always && range.limp_always.includes(hand)) {
            return 'limp';
        }

        // Jam <12bb, Openraise 12-20bb
        if (range.jam12_raise && range.jam12_raise.includes(hand)) {
            return stackBB < 12 ? 'jam' : 'openraise';
        }

        // Alles andere was nicht explizit fold ist = openraise
        return 'openraise';
    }

    // === STANDARD-LOGIK (andere Positionen) ===

    // Jam <20bb Hände (z.B. kleine Pairs) = Jam bei jeder Stack 10-20bb
    if (range.jam20 && range.jam20.includes(hand)) {
        return 'jam';
    }

    // Jam <12bb Hände - WICHTIG: Diese können auch in openraise sein!
    // Bei <=12bb wird gejammt, auch wenn die Hand in openraise ist
    if (range.jam12 && range.jam12.includes(hand) && stackBB <= 12) {
        return 'jam';
    }

    // Jam <15bb Hände = Jam bei <15bb
    if (range.jam15 && range.jam15.includes(hand) && stackBB < 15) {
        return 'jam';
    }

    // Fold 12bb+ Hände = Fold bei >=12bb, Jam bei <12bb
    if (range.fold12plus && range.fold12plus.includes(hand)) {
        return stackBB < 12 ? 'jam' : 'fold';
    }

    // Openraise Hände (wenn nicht schon gejammt)
    if (range.openraise && range.openraise.includes(hand)) {
        return 'openraise';
    }

    // Jam <15bb Hände bei >=15bb = Openraise (nicht in openraise Liste aber spielbar)
    if (range.jam15 && range.jam15.includes(hand)) {
        return 'openraise';
    }

    // Jam <12bb Hände bei >12bb = Openraise
    if (range.jam12 && range.jam12.includes(hand)) {
        return 'openraise';
    }

    // Raise/Fold Hände = Openraise bei 10-20bb
    if (range.raisefold && range.raisefold.includes(hand)) {
        return 'openraise';
    }

    return 'fold';
}

function getTournamentPushRange(stacksize, position) {
    const stackRanges = PUSH_RANGES[stacksize];
    if (!stackRanges) return null;
    return stackRanges[position] || null;
}

// ============================================
// EXPORTS
// ============================================

window.TOURNAMENT_POSITIONS = TOURNAMENT_POSITIONS;
window.TOURNAMENT_STACKSIZES = TOURNAMENT_STACKSIZES;
window.OR_RANGES = OR_RANGES;
window.PUSH_RANGES = PUSH_RANGES;
window.REJAM_RANGES = REJAM_RANGES;
window.FLAT_3BET_RANGES = FLAT_3BET_RANGES;
window.CALL_REJAM_RANGES = CALL_REJAM_RANGES;
window.BB_DEFEND_RANGES = BB_DEFEND_RANGES;
window.BB_VS_SB_RANGES = BB_VS_SB_RANGES;
window.getTournamentOpenRange = getTournamentOpenRange;
window.getTournamentPushRange = getTournamentPushRange;
window.getTournamentORAction = getTournamentORAction;

// Bestimmt die korrekte Aktion wenn Hero als Opener eine 3-Bet faced
// Returns: 'call', '4bet', oder 'fold'
function getTournamentVs3BetAction(hand, position, stackBB, stackSize = '25bb') {
    const range = OR_RANGES[stackSize][position];
    if (!range) return 'fold';

    // === 25bb: Einfache Logik ===
    if (stackSize === '25bb') {
        if (range.vs3bet_4bet && range.vs3bet_4bet.includes(hand)) {
            return '4bet';
        }
        if (range.vs3bet_call && range.vs3bet_call.includes(hand)) {
            return 'call';
        }
        if (range.vs3bet_fold && range.vs3bet_fold.includes(hand)) {
            return 'fold';
        }
        // Hand nicht in OR-Range = sollte nicht vorkommen, aber fold als fallback
        return 'fold';
    }

    // === 100bb: Stack-abhängige 4-Bet Entscheidungen ===
    if (stackSize === '100bb') {
        // 4bet value (immer)
        if (range.vs3bet_4bet_value && range.vs3bet_4bet_value.includes(hand)) {
            return '4bet';
        }

        // 4bet bluff (immer, unabhängig von Stack für Übungszwecke)
        if (range.vs3bet_4bet_bluff && range.vs3bet_4bet_bluff.includes(hand)) {
            return '4bet';
        }

        // Stack-abhängige 4bet jams
        if (range.vs3bet_4bet_jam_30bb && range.vs3bet_4bet_jam_30bb.includes(hand)) {
            return stackBB < 30 ? '4bet' : 'call';
        }
        if (range.vs3bet_4bet_jam_40bb && range.vs3bet_4bet_jam_40bb.includes(hand)) {
            return stackBB < 40 ? '4bet' : 'call';
        }
        if (range.vs3bet_4bet_jam_50bb && range.vs3bet_4bet_jam_50bb.includes(hand)) {
            return stackBB < 50 ? '4bet' : 'call';
        }

        // Call
        if (range.vs3bet_call && range.vs3bet_call.includes(hand)) {
            return 'call';
        }

        // Fold
        if (range.vs3bet_fold && range.vs3bet_fold.includes(hand)) {
            return 'fold';
        }

        return 'fold';
    }

    return 'fold';
}

window.getTournamentVs3BetAction = getTournamentVs3BetAction;

// Gibt die vs3bet Range für Position und Stacksize zurück (für Range Viewer)
function getTournamentVs3BetRange(stackSize, position) {
    const stackRanges = OR_RANGES[stackSize];
    if (!stackRanges || !stackRanges[position]) return null;

    const range = stackRanges[position];

    // Baue eine vereinfachte Range für den Range Viewer
    // Kombiniere alle 4bet-Kategorien zu einer
    let fourbet = [];
    if (range.vs3bet_4bet) fourbet = fourbet.concat(range.vs3bet_4bet);
    if (range.vs3bet_4bet_value) fourbet = fourbet.concat(range.vs3bet_4bet_value);
    if (range.vs3bet_4bet_bluff) fourbet = fourbet.concat(range.vs3bet_4bet_bluff);
    if (range.vs3bet_4bet_jam_30bb) fourbet = fourbet.concat(range.vs3bet_4bet_jam_30bb);
    if (range.vs3bet_4bet_jam_40bb) fourbet = fourbet.concat(range.vs3bet_4bet_jam_40bb);
    if (range.vs3bet_4bet_jam_50bb) fourbet = fourbet.concat(range.vs3bet_4bet_jam_50bb);

    return {
        fourbet: fourbet,
        call: range.vs3bet_call || [],
        fold: range.vs3bet_fold || []
    };
}

window.getTournamentVs3BetRange = getTournamentVs3BetRange;

// ============================================
// FACING OPEN ACTION (Hero reagiert auf Open)
// ============================================

// Bestimmt das Stack-Bracket
function getFacingOpenBracket(stackBB) {
    if (stackBB >= 20 && stackBB <= 30) return '20-30bb';
    if (stackBB > 30 && stackBB <= 40) return '30-40bb';
    if (stackBB > 40 && stackBB <= 50) return '40-50bb';
    if (stackBB > 50) return '50bb+';
    return null;
}

// Returns: 'jam', 'raise', 'call', oder 'fold'
// openSizeBB: Open-Sizing in BB (Default 2.3). Beeinflusst sizing-conditional Keys:
//   - flatcall_small_open: Call wenn openSize < 2.5 (RTF sagt "<2,25x", aber 2.3 zählt noch als klein)
//   - defend_minraise_only: Call nur wenn openSize <= 2.0 (echte Minraise)
// blindsWeak: bool. true → flat_soft_table-Hände werden zu Call (soft table / weak blinds).
function getTournamentFacingOpenAction(hand, heroPosition, openerPosition, stackBB, openSizeBB, blindsWeak) {
    const openerData = FLAT_3BET_RANGES[`vs_${openerPosition}`];
    if (!openerData) return 'fold';

    const bracket = getFacingOpenBracket(stackBB);
    if (!bracket) return 'fold';

    const bracketData = openerData[bracket];
    if (!bracketData) return 'fold';

    const range = bracketData[heroPosition];
    if (!range) return 'fold';

    const openSize = (typeof openSizeBB === 'number') ? openSizeBB : 2.3;

    const is25_30 = stackBB >= 25;
    const is20_25 = stackBB < 25;

    // === Stack-spezifische Overrides zuerst ===
    if (is25_30) {
        if (range.value_3bet_25_30 && range.value_3bet_25_30.includes(hand)) return 'raise';
        if (range.threebet_bluff_25_30 && range.threebet_bluff_25_30.includes(hand)) return 'raise';
        if (range.flatcall_25_30 && range.flatcall_25_30.includes(hand)) return 'call';
    }

    if (is20_25) {
        if (range.threebet_jam_20_25 && range.threebet_jam_20_25.includes(hand)) return 'jam';
        // "3bet bluff" semantisch = kleines 3-Bet (Raise), nicht Jam – auch bei 20-25bb
        if (range.threebet_bluff_20_25 && range.threebet_bluff_20_25.includes(hand)) return 'raise';
        if (range.flatcall_20_25 && range.flatcall_20_25.includes(hand)) return 'call';
    }

    // === Default-Keys (gelten für gesamten Bracket sofern nicht überschrieben) ===
    if (range.threebet_jam && range.threebet_jam.includes(hand)) return 'jam';
    if (range.value_3bet && range.value_3bet.includes(hand)) return 'raise';
    if (range.flatcall && range.flatcall.includes(hand)) return 'call';
    if (range.flatcall_20bb_plus && range.flatcall_20bb_plus.includes(hand)) return 'call';

    // === Sizing-conditional Calls ===
    if (openSize < 2.5 && range.flatcall_small_open && range.flatcall_small_open.includes(hand)) return 'call';
    if (openSize <= 2.0 && range.defend_minraise_only && range.defend_minraise_only.includes(hand)) return 'call';

    // === Soft-Table / Weak-Blinds: erweiterte Flat-Range ===
    if (blindsWeak && range.flat_soft_table && range.flat_soft_table.includes(hand)) return 'call';

    // Optional / situativ → Fold als Default (threebet_bluff_optional)
    return 'fold';
}

// Gibt eine kompilierte Range zurück (für Range Viewer)
function getTournamentFacingOpenRange(heroPosition, openerPosition, stackBB, openSizeBB, blindsWeak) {
    const openerData = FLAT_3BET_RANGES[`vs_${openerPosition}`];
    if (!openerData) return null;
    const bracket = getFacingOpenBracket(stackBB);
    if (!bracket) return null;
    const bracketData = openerData[bracket];
    if (!bracketData || !bracketData[heroPosition]) return null;
    return {
        _isFacingOpen: true,
        heroPosition,
        openerPosition,
        stackBB,
        openSizeBB: (typeof openSizeBB === 'number') ? openSizeBB : 2.3,
        blindsWeak: !!blindsWeak
    };
}

// Gibt verfügbare Hero-Positionen vs einen Opener bei einem Bracket zurück
function getAvailableFacingOpenHeroPositions(openerPosition, stackBB) {
    const openerData = FLAT_3BET_RANGES[`vs_${openerPosition}`];
    if (!openerData) return [];
    const bracket = getFacingOpenBracket(stackBB);
    if (!bracket) return [];
    const bracketData = openerData[bracket];
    if (!bracketData) return [];
    return Object.keys(bracketData);
}

// Gibt verfügbare Opener bei einem Bracket zurück
function getAvailableFacingOpenOpeners(stackBB) {
    const bracket = getFacingOpenBracket(stackBB);
    if (!bracket) return [];
    const openers = [];
    Object.keys(FLAT_3BET_RANGES).forEach(key => {
        if (key.startsWith('vs_') && FLAT_3BET_RANGES[key][bracket]) {
            openers.push(key.substring(3));
        }
    });
    return openers;
}

// Liefert alle Villain-Positionen, für die mindestens einer der gegebenen Heroes Daten hat
function getValidVillainsForHeroes(heroes, stackBB) {
    if (!heroes || heroes.length === 0) return [];
    const valid = new Set();
    getAvailableFacingOpenOpeners(stackBB).forEach(opener => {
        const heroCands = getAvailableFacingOpenHeroPositions(opener, stackBB);
        if (heroes.some(h => heroCands.includes(h))) valid.add(opener);
    });
    return Array.from(valid);
}

// Liefert alle Hero-Positionen, die gegen mindestens einen der gegebenen Villains Daten haben
function getValidHeroesForVillains(villains, stackBB) {
    if (!villains || villains.length === 0) return [];
    const valid = new Set();
    villains.forEach(opener => {
        getAvailableFacingOpenHeroPositions(opener, stackBB).forEach(h => valid.add(h));
    });
    return Array.from(valid);
}

window.getValidVillainsForHeroes = getValidVillainsForHeroes;
window.getValidHeroesForVillains = getValidHeroesForVillains;
window.getTournamentFacingOpenAction = getTournamentFacingOpenAction;
window.getTournamentFacingOpenRange = getTournamentFacingOpenRange;
window.getAvailableFacingOpenHeroPositions = getAvailableFacingOpenHeroPositions;
window.getAvailableFacingOpenOpeners = getAvailableFacingOpenOpeners;
window.getFacingOpenBracket = getFacingOpenBracket;
