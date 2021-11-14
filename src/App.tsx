import React from 'react';
import './App.css';
import Layout from "./Layout";
import SudokuGrid from "./component/SudokuGrid";
import ControlPanel from "./component/ControlPanel";
import {updateNumberSelector, useSudokuGridState} from "./context/SudokuGridContext";
import NewGameDialog from "./component/NewGameDialog";

function App() {
    const { dispatch } = useSudokuGridState();

    return (
        <div className="main" onWheel={(e) => dispatch(updateNumberSelector(Math.sign(e.deltaY)))}>
            <Layout>
                <SudokuGrid/>
                <ControlPanel/>
            </Layout>
            <NewGameDialog/>
        </div>
    );
}

export default App;
