/**
 * Definition of strategies and their descriptions.
 */

export interface StrategyInfo {
    longCode: string;
    name: string;
    sortWeight: number;
}

export interface StrategyDescription {
    slug: string;
    name: string;
    category: string;
}

export const STRATEGIES = [['Ns', 'NakedSingle', 'Naked Single', '10', 'naked-single', 'basic'],
    ['Hs', 'HiddenSingle', 'Hidden Single', '20', 'hidden-single', 'basic'],
    ['Np', 'NakedPair', 'Naked Pair', '30', 'naked-pair', 'intermediate'],
    // ['Nt', 'NakedTriple', 'Naked Triple', '40', 'naked-triple', 'intermediate'],
    // ['Nq', 'NakedQuadruple', 'Naked Quadruple', '50', 'naked-quadruple', 'intermediate'],
    ['Hp', 'HiddenPair', 'Hidden Pair', '60', 'hidden-pair', 'intermediate'],
    // ['Ht', 'HiddenTriple', 'Hidden Triple', '70', 'hidden-triple', 'intermediate'],
    // ['Hq', 'HiddenQuadruple', 'Hidden Quadruple', '80', 'hidden-quadruple', 'intermediate'],
    ['Pp', 'PointingPair', 'Pointing Pair', '90', 'pointing-pair', 'intermediate'],
    ['Pt', 'PointingTriple', 'Pointing Triple', '100', 'pointing-triple', 'intermediate'],
    ['Xw', 'XWing', 'X-Wing', '110', 'x-wing', 'advanced'],
    ['Yw', 'YWing', 'Y-Wing', '120', 'y-wing', 'advanced'],
    ['Sf', 'Swordfish', 'Swordfish', '130', 'swordfish', 'advanced']];

export const STRATEGY_MAPPING = new Map<string, string[]>();
for (let strategy of STRATEGIES) {
    STRATEGY_MAPPING.set(strategy[0], [strategy[1], strategy[2], strategy[3]]);
}

export const STRATEGY_DESCRIPTIONS = new Array<StrategyDescription>();
for (let strategy of STRATEGIES) {
    STRATEGY_DESCRIPTIONS.push({
        name: strategy[2],
        slug: strategy[4],
        category: strategy[5]
    });
}

export function getStrategyLink(code: string): string | undefined {
    for (let strategy of STRATEGIES.values()) {
        if (strategy[0] === code || strategy[1] === code) {
            return `/strategy/${strategy[4]}`;
        }
    }

    return undefined;
}

export function mapStrategyNameToLink(name: string): string | undefined {
    let normRegex = /[ -]/;
    name = name.replace(normRegex, '');
    name = name.toLowerCase()
    if (name === 'xywing') {
        name = 'ywing';
    }
    for (let strategy of STRATEGIES.values()) {
        if (strategy[2].replace(normRegex, '').toLowerCase() === name) {
            return getStrategyLink(strategy[0]);
        }
    }

    return undefined;
}


export function getStrategyName(id: string): string {
    for (let strategy of STRATEGY_MAPPING.values()) {
        if (strategy[0] === id) {
            return strategy[1];
        }
    }

    return 'N/A';
}

export function readStrategyName(slug: string): string {
    for (let strategy of STRATEGIES.values()) {
        if (strategy[4] === slug) {
            return strategy[2];
        }
    }

    return 'N/A';
}

export function strategyData(slug: string): [string, string, string, string | undefined] {
    switch (slug) {
        case 'naked-single':
            return ['Naked Single means that in a specific cell only one digit remains possible. When all possible candidates are filled in in the Sudoku puzzle, there is last remaining candidate in the cell.',
                '...24.......73..6.12....7.8.92.5..31.4.9.....8.....4.....6.....2.6..3.9...5......|.................................................................................|35679,35678,3789,,,15689,1359,15,359,459,58,489,,,1589,1259,,2459,,,349,5,69,569,,45,,67,,,48,,4678,68,,,3567,,137,,12678,12678,2568,2578,2567,,13567,137,13,1267,1267,,257,25679,3479,1378,134789,,12789,1245789,12358,124578,23457,,178,,1458,178,,158,,457,3479,1378,,148,12789,124789,12368,12478,23467',
                '|solving_step_set_value|C4|5|A4,A5,A6,B4,B5,B6,C1,C2,C3,C4,C5,C6,C7,C8,C9,D4,E4,F4,G4,H4,I4|A6,B6,C6,C8,H4|SimpleCell|NakedSingle|35679,35678,3789,,,1689,1359,15,359,459,58,489,,,189,1259,,2459,,,349,,69,69,,4,,67,,,48,,4678,68,,,3567,,137,,12678,12678,2568,2578,2567,,13567,137,13,1267,1267,,257,25679,3479,1378,134789,,12789,1245789,12358,124578,23457,,178,,148,178,,158,,457,3479,1378,,148,12789,124789,12368,12478,23467',
            `The rationale behind this Sudoku solving strategy is elimination of all the impossible digits until there is a single candidate remaining. The last candidate is the correct digit. Once you fill it in the cell, you remove the digit from the other peers. 
            Though Naked Singles are easy to understand, they are not easy to spot in a Sudoku. Sometimes Naked Single is referred to as a "forced digit".`];
        case 'hidden-single':
            return ['A Hidden Single means that there is only one possible cell for a digit in a group. The digit appears to be "hidden" among other possible digits for the cell.',
                '...24.......73..6.12....7.8.92.5..31.4.9.....8.....4.....6.....2.6..3.9...5......|....................35...4..........3............................................|5679,5678,789,,,1689,1359,15,359,459,58,489,,,189,1259,,259,,,,,69,69,,,,67,,,48,,4678,68,,,,,17,,12678,12678,2568,2578,2567,,1567,17,13,1267,1267,,257,25679,479,1378,14789,,12789,1245789,12358,12578,23457,,178,,148,178,,158,,457,479,1378,,148,12789,124789,12368,1278,23467',
                '|solving_step_set_value|F2|5|D1,D2,D3,E1,E2,E3,F1,F2,F3|A2,B2,F8,F9|Box|HiddenSingle|5679,678,789,,,1689,1359,15,359,459,8,489,,,189,1259,,259,,,,,69,69,,,,67,,,48,,4678,68,,,,,17,,12678,12678,2568,2578,2567,,,17,13,1267,1267,,27,2679,479,1378,14789,,12789,1245789,12358,12578,23457,,178,,148,178,,158,,457,479,1378,,148,12789,124789,12368,1278,23467',
            `Pencilmarks doesn't reveal a hidden single. You have to evaluate all candidates for empty cells in a group. Once you find only 1 candidate digit in a group, you have your Hidden Single. You can put the digit into a cell 
             right away, because the digit cannot be filled into any other cell in the group. Sometimes the Hidden Single is referred to as a "Pinned Digit".`];
        case 'naked-pair':
            return ['If there are two cells in a group (row, column or box) that have only 2 candidates, then we have a Naked Pair. It means that no other digits can be in these cells. ' +
                'These candidate digits can be eliminated from other cells of the same group.',
                '..4...3.....91.2....1.78......7...6.4.....9.3..38..7.13.24.6...7.9.32.........6..|.....5.1..3...4......3..........3........1........9.......8.....6........4..97.32|2689,2789,,26,26,,,,6789,568,,5678,,,,,578,5678,2569,259,,,,,45,459,4569,12589,12589,58,,245,,458,,458,,2578,5678,256,256,,,258,,256,25,,,2456,,,245,,,15,,,,,15,579,579,,,,15,,,1458,458,458,158,,58,15,,,,,',
                '|solving_step_remove_candidates|A4,A5|A1,A2,A9|2,6|0|A1,A2,A3,A4,A5,A6,A7,A8,A9|NakedPair||89,789,,26,26,,,,789,568,,5678,,,,,578,5678,2569,259,,,,,45,459,4569,12589,12589,58,,245,,458,,458,,2578,5678,256,256,,,258,,256,25,,,2456,,,245,,,15,,,,,15,579,579,,,,15,,,1458,458,458,158,,58,15,,,,,',
                `Naked pairs are usually appearing at intersections of columns and rows where is more digits filled in than elsewhere on the board. Analogically both intersections of columns and boxes as well as intersections of
                 rows and boxes are places to look at while searching for Naked Pairs.`];
        // case 'naked-triple':
        //     return ['If there are three cells in a group (row, column or box) that have only 3 candidates. It means that no other digits can be in these cells. ' +
        //         'These candidate digits can be eliminated from other cells of the same group.',
        //         '',
        //         ''];
        // case 'naked-quadruple':
        //     return ['If there are four cells in a group (row, column or box) that have only 4 candidates. It means that no other digits can be in these cells. ' +
        //         'These candidate digits can be eliminated from other cells of the same group.', '', ''];
        case 'hidden-pair':
            return ['If there are two cells in a group (row, column, box) where there are 2 candidates that appear nowhere outside these cells in the same group. ' +
                'It means that no other digits can be in these cells. ' +
                'These candidate digits can be eliminated from other cells of the same group.',
                '..57..8......2659..9....76386.....5...4..2.1.5..8..3..7...8.....4..9...6......9..|6....9.................8......9.....9.....6.8....6...9..96................6......|,123,,,134,,,24,124,134,1378,1378,134,,,,,14,124,,12,145,145,,,,,,,1237,,1347,1347,24,,247,,37,,35,357,,,,,,127,127,,,147,,247,,,1235,,,,1345,124,234,1245,123,,1238,1235,,1357,12,2378,,123,12358,,12345,13457,13457,,23478,12457',
                '|solving_step_leave_candidates|B2,B3|7,8|2|B1,B2,B3,B4,B5,B6,B7,B8,B9|Row|HiddenPair|,123,,,134,,,24,124,134,78,78,134,,,,,14,124,,12,145,145,,,,,,,1237,,1347,1347,24,,247,,37,,35,357,,,,,,127,127,,,147,,247,,,1235,,,,1345,124,234,1245,123,,1238,1235,,1357,12,2378,,123,12358,,12345,13457,13457,,23478,12457',
                `Hidden Pairs are similar to Naked Pairs, but are harder to spot. Hidden Pairs appear most frequently in boxes where there are already two rows containing pair of digits. Or two columns containing pair of digits.`];
        // case 'hidden-triple':
        //     return ['If there are three cells in a group (row, column, box) where there are 3 candidates that appear nowhere outside these cells in the same group. ' +
        //         'It means that no other digits can be in these cells. ' +
        //         'These candidate digits can be eliminated from other cells of the same group.', '', ''];
        // case 'hidden-quadruple':
        //     return ['If there are four cells in a group (row, column, box) where there are 4 candidates that appear nowhere outside these cells in the same group. ' +
        //         'It means that no other digits can be in these cells. ' +
        //         'These candidate digits can be eliminated from other cells of the same group.', '', ''];
        case 'pointing-pair':
            return ['If a candidate is present in only two Cells of a Box, then it must be the solution for one of these two cells. ' +
                'If these two cells belong to the same Row or Column, then this candidate can not be the solution in any other cell of the same Row or Column outside of the Box.',
                '..57..8......2659..9....76386.....5...4..2.1.5..8..3..7...8.....4..9...6......9..|6....9.................8......9.....9.....6.8....6...9..96................6......|,123,,,134,,,24,124,134,78,78,134,,,,,14,124,,12,145,145,,,,,,,1237,,1347,1347,24,,247,,37,,35,357,,,,,,127,127,,,147,,247,,,1235,,,,1345,124,234,1245,123,,1238,1235,,1357,12,2378,,123,12358,,12345,13457,13457,,23478,12457',
                '|solving_step_remove_candidates|A9,B9|G9,I9|1|0|A7,A8,A9,B7,B8,B9,C7,C8,C9,D9,E9,F9,G9,H9,I9|PointingPair|LineReductionColumn|,123,,,134,,,24,124,134,78,78,134,,,,,14,124,,12,145,145,,,,,,,1237,,1347,1347,24,,247,,37,,35,357,,,,,,127,127,,,147,,247,,,1235,,,,1345,124,234,245,123,,1238,1235,,1357,12,2378,,123,12358,,12345,13457,13457,,23478,2457',
                `There are actually two variations of this strategy. In first you are eliminating candidates from a column or a row, because the pair candidates are the only candidates for the digit in a box. So only these 
                 two candidates can remain and the other digit candidates from a column or a row can be removed. In second variation you are eliminating candidates from a box, because the pair candidates are the only 
                 candidates for the digit in a column or a row.`];
        case 'pointing-triple':
            return ['If a candidate is present in only three Cells of a Box, then it must be the solution for one of these three cells. ' +
                'If these three cells belong to the same Row or Column, then this candidate can not be the solution in any other cell of the same Row or Column.',
                '8.7.2..5........4.39.........1..8...7.2145.6.....7.4....3..167.6.95..2...8.2.....|.....................................3.........8..2.............7.......1...67.9.|,14,,34,,3469,139,,1369,25,125,56,78,15,369,13789,,136789,,,456,78,15,46,178,128,12678,459,456,,369,39,,357,23,2357,,,,,,,89,,89,59,56,,369,,,,13,135,245,245,,49,89,,,,458,,,,,38,34,,18,148,,,45,,,,35,,345',
                '|solving_step_remove_candidates|A7,B7,C7|A9,B9,C8,C9|1|0|A7,A8,A9,B7,B8,B9,C7,C8,C9,D7,E7,F7,G7,H7,I7|PointingTriple|BoxReductionColumn|,14,,34,,3469,139,,369,25,125,56,78,15,369,13789,,36789,,,456,78,15,46,178,28,2678,459,456,,369,39,,357,23,2357,,,,,,,89,,89,59,56,,369,,,,13,135,245,245,,49,89,,,,458,,,,,38,34,,18,148,,,45,,,,35,,345',
                `There are actually two variations of this strategy. In first you are eliminating candidates from a column or a row, because the triple of candidates are the only candidates for the digit in a box. So only these 
                 three candidates can remain and the other digit candidates from a column or a row can be removed. In second variation you are eliminating candidates from a box, because the triple of candidates are the only 
                 candidates for the digit in a column or a row.`];
        case 'x-wing':
            return ['If a particular candidate is present in only two Cells in two Rows and if these Cells belong to the same Columns (forming the corners of a rectangle), ' +
                'then whichever Cell the candidate is the solution for in the first Row, the candidate must be the solution for the Cell of the second Row that is located in the other Column.\n' +
                'As this candidate must be the solution in two opposed corners of the rectangle, it can not be the solution anywhere else in these Columns.',
                '45.6.3..7.86...9...........81.94.....7..8...3.6..2....53.1.8.4.....6..8....4...7.|......82........3.3..8...6...3..67522.45.169.9.53.7418......2.6.4....3..6.8.3....|,,19,,19,,,,,17,,,27,157,24,,,145,,29,1279,,1579,49,15,,145,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,79,,79,,,,,17,,1279,27,,259,,,59,,29,,,,259,15,,159',
                '|solving_step_remove_candidates|A3,A5,G3,G5|C3,C5,H3|9|1|A3,A5,B3,B5,C3,C5,D3,D5,E3,E5,F3,F5,G3,G5,H3,H5,I3,I5|XWing||,,19,,19,,,,,17,,,27,157,24,,,145,,29,127,,157,49,15,,145,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,79,,79,,,,,17,,127,27,,259,,,59,,29,,,,259,15,,159',
                `X-Wing pattern is quite hard to spot. The goal is to find a rectangle where a candidate is in all of its corners. Then we have to check, if either rows or columns containing those edges are free 
                of other candidates of the same digit, If it is, we are free to eliminate remaining candidates of the same digits from columns or rows eventually. The rationale behind this is that two opposing corners 
                has to contain the digit, so all the other candidates must go away.`];
        case 'y-wing':
            return ['If a conjugate candidate pair in Cell can "see" two other conjugate candidate pair Cells ' +
                'that contain one candidate of the first Cell and the same other candidate, then that other candidate can not be the solution in any Cell ' +
                'that "sees" the two conjugate candidate pair Cells where it is present. Indeed, whatever the solution in the first Cell, ' +
                'the "other" candidate must be the solution in one of the two "other" Cells.',
                '.71.53.9...27..36.....4...2..5...23.....1.658.......19..3.24....46.3.....5.......|6..2..8.448..91..5539...17....4.9..7..43.....3.....4.........86.......212..1..943|,,,,,,,,,,,,,,,,,,,,,68,,68,,,,18,16,,,68,,,,,79,29,,,,27,,,,,26,78,568,678,25,,,,179,19,,59,,,57,,,89,,,89,,57,57,,,,,78,,678,68,,,',
                '|solving_step_remove_candidates|D1,G2,H1|D2,G1|1|1|A1,B1,C1,D1,E1,F1,G1,G2,G3,H1,H2,H3,I1,I2,I3|YWing||,,,,,,,,,,,,,,,,,,,,,68,,68,,,,18,6,,,68,,,,,79,29,,,,27,,,,,26,78,568,678,25,,,,79,19,,59,,,57,,,89,,,89,,57,57,,,,,78,,678,68,,,',
                `A Cell "sees" another Cell if both Cells belong to the same group. Y-Wing is sometimes called XY-Wing, the strategy is the same. `];
        case 'swordfish':
            return [`Swordfish strategy is actually an X-Wing strategy with three base and three cover sets instead of only two. In ideal Swordfish, there will be a candidate in all of the 9 edges of the cover sets. 
            However, each set needs candidates in at least two sets only. So it's possible to have a Swordfish formation with only 6 candidate cells in all of the edges.`,
                '..9..5.6...7.6..322...7.8......16..45..2...7....93....1.....5...7..9..2..6...3...|3...2.....5...9.....63...597235..98..91......6....7215.3...2.9...5......9.2.5..48|,148,,48,,,47,,17,48,,,148,,,14,,,,14,,,,14,,,,,,,,,,,,,,,,,48,48,36,,36,,48,48,,,,,,,,,48,67,48,,,,67,48,,,46,,148,36,,136,,,,17,,,17,,',
                '|solving_step_remove_candidates|A1,A4,A7,B1,B4,B7,H1,H4,H7|A2,H6|4|1|A1,A2,A3,A4,A5,A6,A7,A8,A9,B1,B2,B3,B4,B5,B6,B7,B8,B9,H1,H2,H3,H4,H5,H6,H7,H8,H9|Swordfish||,18,,48,,,47,,17,48,,,148,,,14,,,,14,,,,14,,,,,,,,,,,,,,,,,48,48,36,,36,,48,48,,,,,,,,,48,67,48,,,,67,48,,,46,,18,36,,136,,,,17,,,17,,',
                `Since this Strategy is hard to spot, learn how to use X-Wing strategy first. After you are familiar with it, you will be able to learn Swordfish easily.`];

    }

    return ['N/A', '', '', undefined];
}
