import {Action} from "../context/SudokuGridContext";
import {fillInCandidates, iterateSquareByIndex, range} from "../model/sudoku/game";
import {
    Explanation,
    parseCellPosition,
    parseCellPositions,
    parseSolverCandidates,
    Resolution,
    SolvingStepLeaveCandidates,
    SolvingStepRemoveCandidates,
    SolvingStepSetValue
} from "../model/sudoku/explanation";

export enum NumericKeypadMode {
    CELL_NUMERIC_VALUE,
    CANDIDATE_HINT
}

export type SudokuGridContextState = {
    // snapshot of unsolved Sudoku puzzle quiz
    known: Array<number | undefined>,
    // numbers entered by user
    userEntered: Array<number | undefined>,
    // unique solution to a Sudoku puzzle
    solution: Array<number> | undefined,
    // marks filled up by user
    candidates: Array<Set<number>>,
    // marks used by Sudoku solver engine, it is needed to maintain the state for some advanced solving techniques
    solverCandidates: string | undefined,
    // indices of cells indicating wrongly entered number by a user, it's set upon a user request
    errors: Set<number>,
    // flag indicating the puzzle is solved
    solved: boolean,
    // selected number by a mouse wheel selector
    selectedNumber: number,
    // selection of cells for toggling of numbers or candidate marks
    selection: Array<number>,
    // current indices of cursor for keyboard entry
    cursorX: number,
    cursorY: number,
    // candidates are reevaluated after each user entry
    autoCandidates: boolean,
    // candidates of selected number is highlighted
    focusSelected: boolean,
    // result of hint - upon user request
    explanation: Explanation | undefined,
    // flag indicating new game is being prepared
    loadingNewGame: boolean,
    // indices of cells which were hinted by Sudoku solving engine for the user
    enteredWithHelp: Set<number>,
    // are key presses 1-9 entering cell numbers or candidate hints?
    numericKeypadMode: NumericKeypadMode,
}

export const appStateReducer = (state: SudokuGridContextState, action: Action): SudokuGridContextState => {
    /**
     * Process entering of either a number or candidate marks. It also might be a resetting operation.
     *
     * @param selection cell indices
     * @param value number which is about to be set / reset
     * @param candidatesMode true for candidate mark mode
     */
    function handleNumberEntry(selection: Array<number>, value: number | undefined, candidatesMode: boolean): SudokuGridContextState {
        let candidates = Array.from(state.candidates, c => new Set(c));
        if (!candidatesMode) {
            let userEntered = [...state.userEntered];
            let errors = new Set([...state.errors]);
            let matchingCount = selection.map(i => userEntered[i]).filter(v => v === value).length;
            // setting=true for setting the cells, setting=false for erasing the cells
            let setting = matchingCount * 2 < selection.length || value === undefined;
            for (let index of selection) {
                userEntered[index] = setting ? value : undefined;
                // candidate marks are not relevant anymore, though cleanup of the cell is needed
                candidates[index] = new Set();
                // error will not be displayed anymore after update of this cell
                errors.delete(index);
            }
            if (state.autoCandidates) {
                candidates = fillInCandidates(state.known, userEntered);
            } else if (value !== undefined) {
                candidates = candidatesAfterNumberEntered(selection, candidates, value);
            }
            let newState = {...state, userEntered, candidates, errors};
            let solved = isSolved(newState);
            // solverCandidates are reset upon numeric entry
            return {...newState, solved, explanation: undefined, solverCandidates: undefined};
        // candidates mode, but only for defined value
        } else if (value !== undefined) {
            let matchingCount = selection
                .map(index => candidates[index])
                .filter(cell => cell !== undefined && cell.has(value))
                .length;
            let setting = matchingCount * 2 < selection.length;
            for (let index of selection) {
                if (setting) {
                    candidates[index].add(value);
                } else {
                    candidates[index].delete(value);
                }
            }
            return {...state, candidates, explanation: undefined };
        } else {
            return state;
        }
    }

    switch (action.type) {
        case "TOGGLE_NUMBER": {
            let selection = [action.payload.index];
            let result = handleNumberEntry(selection, state.selectedNumber, action.payload.candidatesMode);
            if (selection.length === 1) {
                let index = selection[0];
                let [cursorY, cursorX] = [Math.floor(index / 9), index % 9];
                return {...result, selection: selection, cursorX, cursorY};
            } else {
                return {...result, selection: selection};
            }
        }
        case "TOGGLE_NUMBER_AT_SELECTION": {
            let result = handleNumberEntry(state.selection, action.payload.value, action.payload.candidatesMode);
            return {...result, selectedNumber: action.payload.value};
        }
        case "DELETE_NUMBER_AT_SELECTION": {
            return handleNumberEntry(state.selection, undefined, false);
        }
        case "UPDATE_NUMBER_SELECTOR":
            if (action.payload.direction) {
                let selectedNumber = state.selectedNumber + action.payload.direction;
                selectedNumber = Math.max(1, Math.min(selectedNumber, 9));
                return { ...state, selectedNumber };
            } else if (action.payload.value) {
                return { ...state, selectedNumber: action.payload.value };
            } else {
                return state;
            }
        case "MOVE_CURSOR":
            let cursorX = Math.max(0, Math.min(state.cursorX + action.payload.xMovement, 8));
            let cursorY = Math.max(0, Math.min(state.cursorY + action.payload.yMovement, 8));
            let selection = [cursorY*9 + cursorX];
            return { ...state, cursorX, cursorY, selection };
        case "LOADING_NEW_GAME": {
            return { ...state, loadingNewGame: true };
        }
        case "NEW_GAME": {
            let known = Array.from(action.payload.known, c => c === '.' ? undefined : parseInt(c));
            let solution = Array.from(action.payload.solution, c => parseInt(c));
            let userEntered = Array.from(Array(81), () => undefined);
            console.info(action.payload.known);
            return {
                known, userEntered, solution,
                autoCandidates: false,
                candidates: Array.from(Array(81), () => new Set()),
                solverCandidates: undefined,
                cursorX: 0,
                cursorY: 0,
                errors: new Set(),
                focusSelected: false,
                selectedNumber: 1,
                selection: [0],
                solved: false,
                explanation: undefined,
                loadingNewGame: false,
                enteredWithHelp: new Set(),
                numericKeypadMode: NumericKeypadMode.CELL_NUMERIC_VALUE,
            };
        }
        case "SET_AUTO_CANDIDATES": {
            let candidates = action.payload.autoCandidates ? fillInCandidates(state.known, state.userEntered) : state.candidates;
            return { ...state, autoCandidates: action.payload.autoCandidates, candidates };
        }
        case "SET_FOCUS_SELECTED": {
            return { ...state, focusSelected: action.payload.focusSelected };
        }
        case "SET_NUMERIC_KEYPAD_MODE": {
            return { ...state, numericKeypadMode: action.payload.numericKeypadMode };
        }
        case "ERASE_CANDIDATES": {
            return { ...state, autoCandidates: false, // switch off autoCandidates
                candidates: Array.from(Array(81), () => new Set()) };
        }
        case "FILL_CANDIDATES": {
            return { ...state, candidates: fillInCandidates(state.known, state.userEntered) };
        }
        case "REVEAL_ERRORS": {
            return { ...state, errors: findErrors(state) };
        }
        case "RESET_GAME": {
            return {
                ...state,
                userEntered: Array.from(Array(81), () => undefined),
                autoCandidates: false,
                candidates: Array.from(Array(81), () => new Set()),
                solverCandidates: undefined,
                enteredWithHelp: new Set(),
                errors: new Set(),
                focusSelected: false,
                solved: false,
            };
        }
        case "PREPARE_HINT": {
            let explanation = action.payload.explanation;
            let solverCandidates = action.payload.solverCandidates;
            let candidates = explanation.prefillCrucialCandidates(getGameDescriptorNums(state), state.candidates);
            // don't solve anything yet, only mark cells with a flag telling the cell was solved with a hint
            let resolution = explanation.execute();
            let enteredWithHelp = new Set(state.enteredWithHelp);
            if (resolution.value && resolution.selection.length === 1) {
                enteredWithHelp.add(resolution.selection[0]);
            }
            return {...state, explanation, solverCandidates, candidates, enteredWithHelp};
        }
        case "APPLY_HINT": {
            if (state.explanation) {
                let resolution: Resolution = state.explanation.execute();
                if (resolution.value) {
                    let result = handleNumberEntry(resolution.selection, resolution.value, false);
                    return {...result, explanation: undefined};
                } else if (resolution.candidateValues) {
                    let candidates = removeCandidates(resolution.selection, resolution.candidateValues, state.candidates);
                    return {...state, candidates, autoCandidates: false, explanation: undefined};
                }
            }
            return {...state};
        }
    }
}

/**
 * Finds errors. Returns set of cells containing an error.
 *
 * @param state context state
 */
function findErrors(state: SudokuGridContextState): Set<number> {
    let gameDescriptor = getGameDescriptor(state);
    let listOfErrors = range(0, 81).filter(index => gameDescriptor.charAt(index) !== '.'
        && state.solution !== undefined
        && parseInt(gameDescriptor.charAt(index)) !== state.solution[index]);
    return new Set(listOfErrors);
}

/**
 * Returns recalculated information about all possible cell candidates.
 *
 * @param selection indices of all cells where values are entered
 * @param candidatesOld "old" list of candidates
 * @param value number being entered
 */
const candidatesAfterNumberEntered = (selection: Array<number>, candidatesOld: Array<Set<number>>, value: number): Array<Set<number>> => {
    //let game = range(0, 81).map(index => known[index] ?? userEntered[index]);
    let candidates = Array.from(candidatesOld, c => new Set(c));

    function removeCandidatesAround(index: number) {
        candidates[index] = new Set();
        let row = Math.floor(index / 9);
        let column = index - row * 9;
        for (let i = 0; i < 9; i++) {
            let columnIndex = i*9+column;
            let columnCellCandidates = candidates[columnIndex];
            if (columnCellCandidates !== undefined) {
                if (columnCellCandidates.delete(value)) {
                    candidates[columnIndex] = new Set(columnCellCandidates);
                }
            }
            let rowIndex = row*9+i;
            let rowCellCandidates = candidates[rowIndex];
            if (rowCellCandidates !== undefined) {
                if (rowCellCandidates.delete(value)) {
                    candidates[rowIndex] = new Set(rowCellCandidates);
                }
            }
        }
        for (let inSquare of iterateSquareByIndex(index)) {
            let squareCellCandidates = candidates[inSquare];
            if (squareCellCandidates !== undefined) {
                if (squareCellCandidates.delete(value)) {
                    candidates[inSquare] = new Set(squareCellCandidates);
                }
            }
        }
    }

    for (let index of selection) {
        removeCandidatesAround(index);
    }
    return candidates;
};

/**
 * Removes candidates
 *
 * @param removalIndices indices of all cells where candidates are removed
 * @param values numeric values for removal
 * @param oldCandidates "old" list of candidates
 */
function removeCandidates(removalIndices: number[], values: number[], oldCandidates: Array<Set<number>>): Array<Set<number>> {
    let candidates = [...oldCandidates];
    for (let index of removalIndices) {
        let hints = candidates[index];
        for (let value of values) {
            if (hints.has(value)) {
                hints.delete(value);
            }
        }
    }
    return candidates;
}

/**
 * Constructs "game descriptor" from context. Game descriptor is a union of puzzle game numbers and
 * user entered numbers. Returns list of numbers.
 *
 * @param state context state
 */
const getGameDescriptorNums = (state: SudokuGridContextState): Array<number | undefined> => {
    return range(0, 81)
        .map(index => state.known[index] ?? state.userEntered[index]);
}

/**
 * Constructs "game descriptor" from context. Game descriptor is a union of puzzle game numbers and
 * user entered numbers. Returns string descriptor. Empty cells are represented with "." character.
 *
 * @param state context state
 */
const getGameDescriptor = (state: SudokuGridContextState): string => {
    let game = getGameDescriptorNums(state)
        .map(num => num === undefined ? '.' : num.toString())
        .join('');
    return game;
}

/**
 * Evaluates user entered solution and return true if it is correctly solved.
 *
 * @param state context state
 */
function isSolved(state: SudokuGridContextState): boolean {
    const game = getGameDescriptorNums(state);
    // @ts-ignore
    return state.solution && state.solution.length === game.length && state.solution.every((value, index) => value === game[index]);
}

/**
 * Processes response from Sudoku engine for "hintone" command. Returns a tuple of Explanation and solver candidates
 *
 * @param allArgs hintone Sudoku engine response list
 */
export function handleHintOne(allArgs: string[]): [explanation: Explanation, solverCandidates: string] | undefined{
    let explanationStep: Explanation | undefined = undefined;
    //let candidates = new Candidates(this.getEnteredAndGivenNumbers()).sets;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let [cmd, ...args] = allArgs;
    switch (args[0]) {
        case 'solving_step_set_value':
            // solving_step_set_value|A2|8|B2,C2,D2,E2,F2,G2,H2,I2|A7,A8|Column|HiddenSimple
        {
            let index = parseCellPosition(args[1]);
            let value = parseInt(args[2]);
            let grayIndices = parseCellPositions(args[3]);
            let candidateRemovals = parseCellPositions(args[4]);
            let sectionType = args[5];
            let strategyType = args[6];
            let solverCandidatesString = args[7];
            let solverCandidates = parseSolverCandidates(solverCandidatesString);
            explanationStep = new SolvingStepSetValue(index, value, grayIndices, candidateRemovals, sectionType, strategyType, solverCandidates);
            return [explanationStep, solverCandidatesString];
        }
        case 'solving_step_remove_candidates':
            // hintone|solving_step_remove_candidates|A4,C4|A6|1,5|0|A4,A5,A6,B4,B5,B6,C4,C5,C6|NakedPair
        {
            let legals = parseCellPositions(args[1]);
            let illegals = parseCellPositions(args[2]);
            let values = args[3].split(",").map(x => parseInt(x));
            let elementCount = parseInt(args[4]);
            let grayIndices = parseCellPositions(args[5]);
            let strategyType = args[6];
            let intersectionType = args[7];
            let solverCandidatesString = args[8];
            let solverCandidates = parseSolverCandidates(solverCandidatesString);
            explanationStep = new SolvingStepRemoveCandidates(legals, illegals, values, elementCount, grayIndices, strategyType, intersectionType, solverCandidates);
            return [explanationStep, solverCandidatesString];
        }
        case 'solving_step_leave_candidates':
            // hintone|solving_step_leave_candidates|B1,B3|2,4|2|A1,A2,A3,B1,B2,B3,C1,C2,C3|HiddenPair
        {
            let legals = parseCellPositions(args[1]);
            let values = args[2].split(",").map(x => parseInt(x));
            let elementCount = parseInt(args[3]);
            let grayIndices = parseCellPositions(args[4]);
            let sectionType = args[5];
            let strategyType = args[6];
            explanationStep = new SolvingStepLeaveCandidates(legals, values, elementCount, grayIndices, sectionType, strategyType);
            let solverCandidatesString = args[7];
            return [explanationStep, solverCandidatesString];
        }
        default:
            // Logs reason why step couldn't be found. Typically it is because of invalid sudoku grid state (wrong user input).
            console.info(`Unsupported solution: ${allArgs}`);
    }
}

