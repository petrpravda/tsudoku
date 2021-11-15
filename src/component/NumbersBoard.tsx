import './NumbersBoard.css';
import React from "react";
import {range} from "../model/sudoku/game";

export const NumbersBoard: React.FC<{selectedNumber: number, onNumberSelected: (value: number) => void}> =
    ({selectedNumber, onNumberSelected}) => {
    return (
        <div className="numbers-container">
            <div className="numbers-container-inner">
                <div className="number-selector" style={{left: `${(selectedNumber-1) * 11.11}%`}}/>
                <div className="parent">
                    {range(1, 10).map((number, i) =>
                        <div key={number} onClick={() => onNumberSelected(number)} className="number-item">{number}</div>
                    )}
                </div>
            </div>
        </div>
    );
}
