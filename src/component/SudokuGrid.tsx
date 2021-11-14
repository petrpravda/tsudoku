import './SudokuGrid.css';
import React, {CSSProperties, useEffect, useRef} from "react";
import {
    CellContent,
    deleteNumberAtSelection,
    moveCursor,
    setAutoCandidates,
    setFocusSelected,
    setNumberAt,
    setNumberAtSelection,
    updateNumberSelector,
    useSudokuGridState
} from "../context/SudokuGridContext";
import {Explanation} from "../model/sudoku/explanation";
import {FaSpinner} from "react-icons/fa";
import {NumericKeypadMode} from "../reducer/SudokuGridReducer";
import {nineByNineCoords, range} from "../model/sudoku/game";

enum EnumCellContentType {
    KNOWN,
    EMPTY,
    USER_ENTERED,
    CANDIDATES
}

const SudokuBoardContainer: React.FC<{}> = ({ children }) => {
    const { dispatch, autoCandidates, focusSelected, newGameDialogShow, numericKeypadMode } = useSudokuGridState();

    const containerRef = useRef<HTMLDivElement>(null);

    const onKeyDownListener = (e: KeyboardEvent) => {
        if (newGameDialogShow) {
            return;
        }

        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            e.preventDefault();
            dispatch(moveCursor(0, e.key === 'ArrowUp' ? -1 : 1));
        }
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            e.preventDefault();
            dispatch(moveCursor(e.key === 'ArrowLeft' ? -1 : 1, 0));
        }

        if (e.key >= '1' && e.key <= '9') {
            e.preventDefault();
            let enteredNumber = parseInt(e.key);
            dispatch(setNumberAtSelection(enteredNumber, numericKeypadMode === NumericKeypadMode.CANDIDATE_HINT))
        }
        if (e.key === 'Delete') {
            e.preventDefault();
            dispatch(deleteNumberAtSelection());
        }
        if (new Set(['A', 'a']).has(e.key)) {
            e.preventDefault();
            dispatch(setAutoCandidates(!autoCandidates));
        }
        if (new Set(['F', 'f']).has(e.key)) {
            e.preventDefault();
            dispatch(setFocusSelected(!focusSelected));
        }
        if (e.key === 'PageDown' || e.key === 'PageUp') {
            e.preventDefault();
            dispatch(updateNumberSelector(e.key === 'PageDown' ? 1 : -1));
        }

        // if (new Set(['U', 'u']).has(e.key) && e.ctrlKey && e.shiftKey) {
        //     this.$buefy.dialog.alert({
        //         title: 'Game snapshot',
        //         message: `Snapshot: <textarea rows="6" cols="70">${this.sudokuGameContext.getContextSnapshot()}</textarea>`,
        //         confirmText: 'Cool!'
        //     });
        //     e.stopPropagation();
        // }
        // if (new Set(['E', 'e']).has(e.key) && e.ctrlKey && e.shiftKey) {
        //     //this.sudokuGameContext.autoCandidates = !this.sudokuGameContext.autoCandidates;
        //     this.$buefy.dialog.alert({
        //         title: 'Game export',
        //         message: `Game: <textarea rows="4" cols="50">${this.sudokuGameContext.originalGame}</textarea>`,
        //         confirmText: 'Cool!'
        //     });
        //     e.stopPropagation();
        // }
    }

    const onResizeListener = () => {
        if (containerRef.current) {
            let width = containerRef.current.getBoundingClientRect().width;
            containerRef.current.style.setProperty('--sudoku-board-font-size', `${width / 40}px`);
        }
    };

    useEffect(() => {
        onResizeListener();
        window.addEventListener("resize", onResizeListener);
        return () => {
            window.removeEventListener("resize", onResizeListener);
        };
    }, []);

    useEffect(() => {
        window.addEventListener("keydown", onKeyDownListener);
        return () => {
            window.removeEventListener("keydown", onKeyDownListener);
        }
    });

    return (
        <div ref={containerRef} className="sudoku-board-container-outer">
            <div></div>
            <div className="column-headers headers">
                <div>1</div>
                <div>2</div>
                <div>3</div>
                <div>4</div>
                <div>5</div>
                <div>6</div>
                <div>7</div>
                <div>8</div>
                <div>9</div>
            </div>
            <div className="row-headers headers">
                <div>A</div>
                <div>B</div>
                <div>C</div>
                <div>D</div>
                <div>E</div>
                <div>F</div>
                <div>G</div>
                <div>H</div>
                <div>I</div>
            </div>
            <div className="sudoku-board-container" >
                {children}
            </div>
        </div>
    )
};

const CellCandidates: React.FC<{candidates: Set<number>, style?: CSSProperties | undefined, selectedNumber: number,
    focusSelected: boolean, explanation: Explanation | undefined, index: number}>
    = ({children, candidates, style, selectedNumber, focusSelected, explanation, index}) => {
    const isLegal = (value: number) => explanation && explanation.hintLegalCandidate(index, value);
    const isIllegal = (value: number) => explanation && explanation.hintIllegalCandidate(index, value);
    const isDimmed = (value: number) => focusSelected && candidates.has(value) && value !== selectedNumber;

    return (
        <div className="hints" style={style}>
            { range(1, 10).map(value =>
                candidates.has(value) && (<div className={`n${value} ${isDimmed(value) ? 'dimmed ' : ''}${isLegal(value) ? 'hint-legal ' : ''} ${isIllegal(value) ? 'hint-illegal ' : ''}`}
                     key={value}>{value}</div>)
            )}
        </div>
    );
}

const SudokuBoardCell: React.FC<{row: number, column: number, content: CellContent}>
    = ({row, column, content}) => {
    const { dispatch, isInSelection, selectedNumber, focusSelected, errors, explanation, enteredWithHelp } = useSudokuGridState();
    let innerCellStyle = isInSelection(row, column) ? {backgroundColor: 'rgba(250, 237, 61, 0.5)'} : {};
    const index = row * 9 + column;

    let bgHint = explanation !== undefined ? explanation.isHintArea(index) : false;

    const handleClick = (e: React.MouseEvent<Element, MouseEvent>): void => {
        dispatch(setNumberAt(row, column, e.button === 2));
    };

    return (
        <div
            className = {`sudoku-board-cell place-digit ` +
                `${errors.has(index) ? 'bg-error ' : ''}` +
                `${enteredWithHelp.has(index) ? 'bg-entered-w-help ' : ''}` +
                `${bgHint ? 'bg-hint-highlight ' : ''}`}
            onClick={ handleClick }
            onContextMenu={(e) => { e.preventDefault(); handleClick(e) }}
        >
            { content.type === EnumCellContentType.KNOWN && <div className="place-digit known" style={innerCellStyle}>{content.value}</div> }
            { content.type === EnumCellContentType.USER_ENTERED && <div className="place-digit user-entered" style={innerCellStyle}>{content.value}</div> }
            { content.type === EnumCellContentType.CANDIDATES && content.candidates &&
                <CellCandidates candidates={content.candidates} style={innerCellStyle} selectedNumber={selectedNumber}
                                focusSelected={focusSelected} index={index} explanation={explanation}/> }
            { content.type === EnumCellContentType.EMPTY && <div className="place-digit empty" style={innerCellStyle}/> }
        </div>
    );
}

const SudokuGrid = () => {
    const { readCellContent, loadingNewGame } = useSudokuGridState();

    return (
        <div className="sudoku-grid-outer">
            <div className="sudoku-grid">
                <div className="sudoku-grid-inner">
                    { !loadingNewGame && <SudokuBoardContainer>
                        {Array.from(nineByNineCoords()).map(c =>
                            <SudokuBoardCell key={`c${c.c}r${c.r}`} column={c.c} row={c.r}
                                             content={readCellContent(c.r, c.c)}/>)}
                    </SudokuBoardContainer> }
                    { loadingNewGame &&
                    <div className="spinner-container">
                        <FaSpinner className="spinner" />
                    </div>
                     }
                </div>
            </div>
        </div>
    );
};

export default SudokuGrid;
