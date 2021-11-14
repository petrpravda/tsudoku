import React, {useEffect, useRef, useState} from "react";
import ModalDialog from "./ModalDialog";
import {loadingNewGame, newGame, useSudokuGridState} from "../context/SudokuGridContext";
import {ENGINE} from "../model/sudoku/engine";

const NewGameDialog: React.FC<{}> = ({ children }) => {
    const { newGameDialogShow, setNewGameDialogShow, dispatch } = useSudokuGridState();
    const [difficulty, setDifficulty] = useState<string>('Ve');

    const dropDownRef = useRef(null);

    const selectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;
        setDifficulty(value);
    };

    useEffect(() => {
        if (dropDownRef.current) {
            // @ts-ignore
            dropDownRef.current.focus();
        }
    }, [newGameDialogShow]);

    const handleNewGameClicked = async () => {
        setNewGameDialogShow(false);
        dispatch(loadingNewGame());
        const suc = await ENGINE.sendMsg(`newgame ${difficulty}`);
        console.info(suc);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        let [ command, data ]  = suc.split('|');
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        let [ known, diff, strategies, gameId ] = data.split(',');
        const suc2 = await ENGINE.sendMsg(`check ${known}`);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [cmd, solution, error] = suc2.split('|');
        console.info(solution);
        dispatch(newGame(known, solution));
    };

    useEffect(() => {
        const onEnterListener = (e: KeyboardEvent) => {
            if (newGameDialogShow && e.key === 'Enter') {
                handleNewGameClicked().then(() => {});
            }
        }

        window.addEventListener("keydown", onEnterListener);
        return () => {
            window.removeEventListener("keydown", onEnterListener);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [newGameDialogShow]);

    const footer = <>
        <button type="button" className="button" onClick={() => { setNewGameDialogShow(false) }}><span>Cancel</span>
        </button>
        <button type="button" className="button is-primary" onClick={handleNewGameClicked}>
            <span>Start New Game</span>
        </button>
    </>;

    return (
        <ModalDialog footer={footer} show={newGameDialogShow} onClose={() => { setNewGameDialogShow(false) }}>
            <div className="field"><label className="label">Difficulty</label>
                <div className="control"><span className="select"><select onChange={selectChange} ref={dropDownRef}>
                    <option value="Ve">Very Easy</option>
                    <option value="Ea">Easy</option>
                    <option value="Me">Medium</option>
                    <option value="Ha">Hard</option>
                    <option value="Vh">Very Hard</option>
                </select></span>
                </div>
            </div>
        </ModalDialog>
    )
}

export default NewGameDialog;
