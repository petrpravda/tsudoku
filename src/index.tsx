import React from 'react';
import ReactDOM from 'react-dom';
import 'bulma/css/bulma.min.css';
import './index.css';
import App from './App';
import {SudokuGridProvider} from "./context/SudokuGridContext";

ReactDOM.render(
  <React.StrictMode>
      <SudokuGridProvider>
          <App />
      </SudokuGridProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
