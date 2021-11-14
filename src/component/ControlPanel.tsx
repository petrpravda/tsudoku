import './ControlPanel.css'
// @ts-ignore
import confetti from 'canvas-confetti';
import React, {useEffect} from "react";
import {
    FaBinoculars,
    FaBug,
    FaCircle,
    FaEraser,
    FaGamepad,
    FaKeyboard,
    FaLightbulb,
    FaMagic,
    FaPencilAlt,
    FaRedo,
    FaTh
} from "react-icons/fa";
import {NumbersBoard} from "./NumbersBoard";
import {
    applyHint,
    eraseCandidates,
    fillCandidates,
    prepareHint,
    resetGame,
    revealErrors,
    setAutoCandidates,
    setFocusSelected,
    setNumericKeypadMode,
    useSudokuGridState
} from "../context/SudokuGridContext";
import {askForHint, getCandidatesDescriptor, getGameDescriptor} from "../model/sudoku/game";
import {Explanation} from "../model/sudoku/explanation";
import {NumericKeypadMode} from "../reducer/SudokuGridReducer";

const ControlButton: React.FC<{full?: boolean, onClick?: () => void, dimmed?: boolean}> = ({
        children, full = false, onClick, dimmed = false }) => {
    let style = {gridColumn: full ? "1 / 3" : "", display: "flex", gap: "0.5em"};
    return <button className={dimmed ? 'button is-light' : 'button is-primary'} style={style} onClick={onClick}>
        {children}
    </button>;
}

const ExplanationControl: React.FC<{explanation: Explanation}>
    = ({explanation}) => {
    const info = explanation.toInfo();

    return <div>
        <div>{info.title}</div>
        <div>{info.description}</div>
        <div>{info.resolution}</div>
    </div>;
}

const ControlPanel: React.FC<{}> = ({ children }) => {
    let state = useSudokuGridState();
    const { selectedNumber, setNewGameDialogShow, autoCandidates, focusSelected, dispatch, solved,
        candidates, solverCandidates, known, userEntered, explanation, numericKeypadMode } = state;

    const showNewGameDialog = () => {
        setNewGameDialogShow(true);
    };

    useEffect(()=>{
        if (solved) {
            confetti();
        }
    }, [solved]);

    const hintButtonHandler = async () => {
        if (explanation !== undefined) {
            dispatch(applyHint());
        } else {
            let hintStep = await askForHint(getGameDescriptor(known, userEntered),
                getCandidatesDescriptor(candidates), solverCandidates);
            if (hintStep) {
                let [explanation, newSolverCandidates] = hintStep;
                //console.info(`HINT ${JSON.stringify(explanation)}\n${newSolverCandidates}`);
                dispatch(prepareHint(explanation, newSolverCandidates));
            }
        }
    }

    const onKeyDownListener = (e: KeyboardEvent) => {
        if (new Set(['H', 'h']).has(e.key)) {
            e.preventDefault();
            hintButtonHandler().then(()=>{});
        }
        if (new Set(['N', 'n']).has(e.key)) {
            e.preventDefault();
            showNewGameDialog();
        }
    }

    useEffect(() => {
        window.addEventListener("keydown", onKeyDownListener);
        return () => {
            window.removeEventListener("keydown", onKeyDownListener);
        }
    });

    // @ts-ignore
    return (
        <div className="control-panel-outer">
            <div className="control-panel">
                <div className="buttons control-panel-grid">
                    <ControlButton onClick={showNewGameDialog} full={true}>New Puzzle <FaGamepad/></ControlButton>
                    <ControlButton full={true} onClick={hintButtonHandler}>{explanation ? 'Continue with Hint' : 'Hint'} <FaLightbulb/></ControlButton>

                    <ControlButton onClick={() => dispatch(fillCandidates())}>Fill candidates <FaPencilAlt/></ControlButton>
                    <ControlButton onClick={() => dispatch(eraseCandidates())}>Erase candidates <FaEraser/></ControlButton>
                    <label className="checkbox switch">
                        <input type="checkbox" checked={autoCandidates} onChange={e => dispatch(setAutoCandidates(e.target.checked))} /> <FaMagic/> Auto-candidates
                    </label>
                    <label className="checkbox switch">
                        <input type="checkbox" checked={focusSelected} onChange={e => dispatch(setFocusSelected(e.target.checked))} /> <FaBinoculars/> Focused on {selectedNumber}
                    </label>
                    <ControlButton onClick={() => dispatch(revealErrors())}>Reveal errors <FaBug/></ControlButton>
                    <ControlButton onClick={() => dispatch(resetGame())}>Reset game <FaRedo/></ControlButton>
                    <NumbersBoard selectedNumber={selectedNumber} />
                    <ControlButton dimmed={numericKeypadMode !== NumericKeypadMode.CELL_NUMERIC_VALUE}
                                   onClick={() => dispatch(setNumericKeypadMode(NumericKeypadMode.CELL_NUMERIC_VALUE))}>Numbers <FaCircle/></ControlButton>
                    <ControlButton dimmed={numericKeypadMode !== NumericKeypadMode.CANDIDATE_HINT}
                                   onClick={() => dispatch(setNumericKeypadMode(NumericKeypadMode.CANDIDATE_HINT))}>Candidates <FaTh/></ControlButton>
                    <ControlButton full={true}>Keyboard shortcuts <FaKeyboard/></ControlButton>
                </div>
            </div>
            <div className="explanation-panel">
                {explanation && <ExplanationControl explanation={explanation}/>}
            </div>
        </div>
    )
};

export default ControlPanel;
