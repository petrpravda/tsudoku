import {createContext, Dispatch, FC, SetStateAction, useContext, useReducer, useState} from "react";
import {appStateReducer, NumericKeypadMode, SudokuGridContextState} from "../reducer/SudokuGridReducer";
import {Explanation} from "../model/sudoku/explanation";

const appData: SudokuGridContextState = {
    known: Array.from(Array(81), () => undefined),
    userEntered: Array.from(Array(81), () => undefined),
    solution: undefined,
    errors: new Set(),
    solved: false,
    candidates: Array.from(Array(81), () => new Set()),
    solverCandidates: undefined,
    selectedNumber: 1,
    selection: [0],
    cursorX: 0,
    cursorY: 0,
    autoCandidates: false,
    focusSelected: false,
    explanation: undefined,
    loadingNewGame: false,
    numericKeypadMode: NumericKeypadMode.CELL_NUMERIC_VALUE,
    enteredWithHelp: new Set(),
}

enum EnumCellContentType {
    KNOWN,
    EMPTY,
    USER_ENTERED,
    CANDIDATES
}

export interface CellContent {
    value: number | undefined,
    type: EnumCellContentType,
    candidates: Set<number> | undefined,
}

interface SetNumberAtAction {
    type: "TOGGLE_NUMBER"
    payload: { index: number, candidatesMode: boolean }
}

interface SetNumberAtSelectionAtAction {
    type: "TOGGLE_NUMBER_AT_SELECTION"
    payload: { value: number, candidatesMode: boolean }
}

interface DeleteNumberAtSelectionAtAction {
    type: "DELETE_NUMBER_AT_SELECTION"
    payload: { }
}

interface UpdateNumberSelectorAction {
    type: "UPDATE_NUMBER_SELECTOR"
    payload: { direction?: number, value?: number }
}
interface MoveCursorAction {
    type: "MOVE_CURSOR"
    payload: { xMovement: number, yMovement: number }
}

interface LoadingNewGameAction {
    type: "LOADING_NEW_GAME",
    payload: { }
}
interface NewGameAction {
    type: "NEW_GAME",
    payload: { known: string, solution: string }
}

interface SetAutoCandidates {
    type: "SET_AUTO_CANDIDATES",
    payload: { autoCandidates: boolean }
}

interface SetFocusSelected {
    type: "SET_FOCUS_SELECTED",
    payload: { focusSelected: boolean }
}

interface EraseCandidates {
    type: "ERASE_CANDIDATES",
    payload: { }
}

interface FillCandidates {
    type: "FILL_CANDIDATES",
    payload: { }
}

interface RevealErrors {
    type: "REVEAL_ERRORS",
    payload: { }
}

interface ResetGame {
    type: "RESET_GAME",
    payload: { }
}

interface PrepareHint {
    type: "PREPARE_HINT",
    payload: { explanation: Explanation, solverCandidates: string }
}

interface ApplyHint {
    type: "APPLY_HINT",
    payload: { }
}

interface SetNumericKeypadMode {
    type: "SET_NUMERIC_KEYPAD_MODE",
    payload: { numericKeypadMode: NumericKeypadMode }
}

export type Action = SetNumberAtAction | UpdateNumberSelectorAction | MoveCursorAction
    | NewGameAction | SetNumberAtSelectionAtAction | DeleteNumberAtSelectionAtAction
    | SetAutoCandidates | SetFocusSelected | EraseCandidates | FillCandidates | RevealErrors
    | ResetGame | PrepareHint | ApplyHint | LoadingNewGameAction | SetNumericKeypadMode


export const setNumberAt = (row: number, column: number, candidatesMode: boolean): SetNumberAtAction =>
    ({ type: "TOGGLE_NUMBER", payload: { index: row * 9 + column, candidatesMode} });

export const setNumberAtSelection = (value: number, candidatesMode: boolean): SetNumberAtSelectionAtAction =>
    ({ type: "TOGGLE_NUMBER_AT_SELECTION", payload: { value, candidatesMode } });

export const deleteNumberAtSelection = (): DeleteNumberAtSelectionAtAction =>
    ({ type: "DELETE_NUMBER_AT_SELECTION", payload: { } });

export const updateNumberSelector = (direction?: number, value?: number): UpdateNumberSelectorAction =>
    ({ type: "UPDATE_NUMBER_SELECTOR", payload: {direction, value} });

export const moveCursor = (xMovement: number, yMovement: number): MoveCursorAction =>
    ({ type: "MOVE_CURSOR", payload: {xMovement, yMovement} });

export const loadingNewGame = (): LoadingNewGameAction =>
    ({ type: "LOADING_NEW_GAME", payload: {} });

export const newGame = (known: string, solution: string): NewGameAction =>
    ({ type: "NEW_GAME", payload: {known, solution} });

export const setAutoCandidates = (autoCandidates: boolean): SetAutoCandidates =>
    ({ type: "SET_AUTO_CANDIDATES", payload: {autoCandidates} });

export const setFocusSelected = (focusSelected: boolean): SetFocusSelected =>
    ({ type: "SET_FOCUS_SELECTED", payload: {focusSelected} });

export const eraseCandidates = (): EraseCandidates =>
    ({ type: "ERASE_CANDIDATES", payload: {} });

export const fillCandidates = (): FillCandidates =>
    ({ type: "FILL_CANDIDATES", payload: {} });

export const revealErrors = (): RevealErrors =>
    ({ type: "REVEAL_ERRORS", payload: {} });

export const resetGame = (): ResetGame =>
    ({ type: "RESET_GAME", payload: {} });

export const prepareHint = (explanation: Explanation, solverCandidates: string): PrepareHint =>
    ({ type: "PREPARE_HINT", payload: { explanation, solverCandidates } });

export const applyHint = (): ApplyHint =>
    ({ type: "APPLY_HINT", payload: {} });

export const setNumericKeypadMode = (numericKeypadMode: NumericKeypadMode): SetNumericKeypadMode =>
    ({ type: "SET_NUMERIC_KEYPAD_MODE", payload: { numericKeypadMode } });

type SudokuGridContextProps = {
    known: Array<number | undefined>,
    userEntered: Array<number | undefined>,
    selectedNumber: number,
    selection: Array<number>,
    readCellContent(row: number, column: number): CellContent,
    isInSelection(row: number, column: number): boolean,
    newGameDialogShow: boolean,
    setNewGameDialogShow: Dispatch<SetStateAction<boolean>>,
    autoCandidates: boolean,
    focusSelected: boolean,
    errors: Set<number>,
    solved: boolean,
    candidates: Array<Set<number> | undefined>,
    solverCandidates: string | undefined,
    explanation: Explanation | undefined,
    loadingNewGame: boolean,
    enteredWithHelp: Set<number>,
    numericKeypadMode: NumericKeypadMode,
    dispatch: Dispatch<Action>
}

const SudokuGridContext = createContext<SudokuGridContextProps>({} as SudokuGridContextProps);

export const SudokuGridProvider: FC = ({ children }) => {
    const [state, dispatch] = useReducer(appStateReducer, appData)
    const { selection, known, userEntered, candidates } = state;
    const [newGameDialogShow, setNewGameDialogShow] = useState(true);

    const isInSelection = (row: number, column: number) => {
        let index = row * 9 + column;
        return selection.includes(index);
    }

    const readCellContent = (row: number, column: number): CellContent => {
        let index = row * 9 + column;
        let knownValue = known[index];
        let userEnteredValue = userEntered[index];
        let candidatesValue = candidates[index];
        if (candidatesValue.size > 0) {
            return {type: EnumCellContentType.CANDIDATES, value: undefined, candidates: candidates[index]}
        } else if (knownValue !== undefined) {
            return {type: EnumCellContentType.KNOWN, value: knownValue, candidates: undefined};
        } else if (userEnteredValue !== undefined) {
            return {type: EnumCellContentType.USER_ENTERED, value: userEnteredValue, candidates: undefined};
        } else {
            return {type: EnumCellContentType.EMPTY, value: undefined, candidates: undefined};
        }
    }

    return (
        <SudokuGridContext.Provider value={{...state,
            newGameDialogShow,
            readCellContent, isInSelection, setNewGameDialogShow,
            dispatch}}>
            {children}
        </SudokuGridContext.Provider>
    )
}

export const useSudokuGridState = () => {
    return useContext(SudokuGridContext)
}
