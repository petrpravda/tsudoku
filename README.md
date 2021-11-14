# Sudoku Game in React

This project is a port of my another Sudoku Game application developed in Vue.js.

The goal of Sudoku Game is correct classification of Sudoku Game Puzzle difficulties.
It also provides "unstuck" feature in a form of Hint for the user. It is able to find the
easiest step possible of the solving steps. It explains the step both textually and visually.
Explanation step feature works only if the Sudoku grid doesn't contain errors.
The game also provides "Reveal Errors" feature.

The original application is hosted on [sudokuexplained.com](https://sudokuexplained.com/).

Latest development snapshot of this application is hosted [here on Netlify](https://sudokuexplained.netlify.app/).

## Approaches used in this project

* State is managed in form of combination of React Context and React Reducer
* Minimalistic CSS framework [bulma.io](https://bulma.io/) is used without any third party react component library
* WebWorker used for managing Sudoku engine process
* Sudoku engine is programmed in [Rust](https://www.rust-lang.org/) and compiled into WebAssembly
* Communication with the engine is asynchronous
* Typescript is used for type safety

## What is not implemented

* selections of multiple cells with mouse moves with pressed buttons is not implemented yet (it's working on [sudokuexplained.com](https://sudokuexplained.com/))
* any navigation nor routes, it's because my further plan with this Pet project is moving it into [next.js](https://nextjs.org/)
* any jest tests because of time reasons
