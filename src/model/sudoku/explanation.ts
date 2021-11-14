import { getStrategyName } from "./strategies";
import {Candidates, flipNumbers} from "./game";

export interface ExplanationInfo {
    title: string;
    description: string;
    resolution: string;
}

/**
 * At indices of selection either
 * 1) value will be set
 * or
 * 2) candidateValues candidates will be removed
 *
 * Only one of value and candidateValues is present.
 */
export interface Resolution {
    selection: Array<number>;
    value: number | undefined;
    candidateValues: Array<number> | undefined;
}

export abstract class Explanation {
    /**
     * Gray indices represent cells which are about to be highlighted during explanation.
     */
    abstract getGrayIndices(): Set<number>;
    abstract getStrategyType(): string;

    /**
     * Returns cell indices which are relevant for candidate hint updates.
     */
    getRefreshIndices(): Set<number> {
        return this.getGrayIndices();
    }

    /**
     * Checks if the candidate should be highlighted with green
     *
     * @param index cell index
     * @param value number
     */
    abstract hintLegalCandidate(index: number, value: number): boolean;

    /**
     * Checks if the candidate should be highlighted with red
     *
     * @param index cell index
     * @param value number
     */
    abstract hintIllegalCandidate(index: number, value: number): boolean;

    /**
     * Is the cell relevant for explanation of the step?
     *
     * @param index cell index
     */
    isHintArea(index: number): boolean {
        return this.getGrayIndices().has(index);
    }

    /**
     * Returns array of candidates filled by user, enhanced with candidates which are of interest during explanation of the step.
     *
     * @param gameDescriptor known + user entered values
     * @param candidates "old" candidates
     */
    prefillCrucialCandidates(gameDescriptor: Array<number | undefined>, candidates: Array<Set<number>>): Array<Set<number>> {
        return candidates;
    }

    /**
     * Returns instruction - what needs to be updated in context state
     */
    abstract execute(): Resolution;

    /**
     * Returns triplet of title, description and resolution as strings
     */
    abstract toInfo(): ExplanationInfo;

    /**
     * Returns strategy name
     */
    getStrategyName(): string {
        let result = getStrategyName(this.getStrategyType());
        return result;
    }
}

export class SolvingStepSetValue extends Explanation {
    public grayIndices: Set<number>;

    constructor(public index: number,
                public value: number,
                grayIndices: Array<number>,
                public candidateRemovals: Array<number>,
                public sectionType: string,
                public strategyType: string,
                public solverCandidates: Array<Set<number> | undefined>) {
        super();
        this.grayIndices = new Set(grayIndices);
    }

    getGrayIndices(): Set<number> {
        return this.grayIndices;
    }

    hintLegalCandidate(index: number, value: number): boolean {
        return index === this.index && value === this.value;
    }

    hintIllegalCandidate(index: number, value: number): boolean {
        return (index !== this.index && value === this.value && this.grayIndices.has(index)) // SimpleNaked
            || (index === this.index && value !== this.value); // HiddenSimple
    }


    execute(): Resolution {
        return {selection: [this.index], value: this.value, candidateValues: undefined};
    }

    prefillCrucialCandidates(gameDescriptor: Array<number | undefined>, _candidates: Array<Set<number>>): Array<Set<number>> {
        let newCandidates = [..._candidates];
        let candidates = new Candidates(gameDescriptor).sets;
        this.getRefreshIndices()
            .forEach(index => {
                // @ts-ignore
                if (candidates[index].has(this.value)) {
                    newCandidates = addCandidateAt(index, this.value, newCandidates);
                }
            });

        return newCandidates;
    }

    getStrategyType(): string {
        return this.strategyType;
    }

    toInfo(): ExplanationInfo {
        if (this.strategyType === 'NakedSingle') {
            return {title: `Naked Single in cell ${toCellPosition(this.index)}`,
                description: `The cell ${toCellPosition(this.index)} has a single candidate with the value of ${this.value}.`,
                resolution: `Cell solved with the value of ${this.value}. Candidate ${this.value} removed from cells ${toCellPositions(this.candidateRemovals)}.`};
        } else {
            return {title: `Hidden Single in cell ${toCellPosition(this.index)}`,
                description: `The cell ${toCellPosition(this.index)} is the only cell in ${this.sectionType} ${toSectionIdentificator(this.index, this.sectionType)} with the candidate value ${this.value}.`,
                resolution: `Cell solved with the value of ${this.value}.`};
        }
    }
}

// hintone|solving_step_remove_candidates|A4,C4|A6|1,5|0|A4,A5,A6,B4,B5,B6,C4,C5,C6|NakedPair


function addCandidateAt(index: number, num: number, candidates: Array<Set<number>>): Array<Set<number>> {
    let old = candidates[index];
    // @ts-ignore
    old.add(num);
    // @ts-ignore
    candidates[index] = old;
    return candidates;
}

function filterExistingOnly(legals: Set<number>, num: number, solverCandidates: Array<Set<number> | undefined>) {
    let filtered = [...legals]
        .filter(index => solverCandidates[index]?.has(num));
    return new Set(filtered);
}

export class SolvingStepRemoveCandidates extends Explanation {
    public legals: Set<number>;
    public illegals: Set<number>;
    public values: Set<number>;
    public grayIndices: Set<number>;

    constructor(legals: Array<number>,
                illegals: Array<number>,
                values: Array<number>,
                public elementCount: number,
                grayIndices: Array<number>,
                public strategyType: string,
                public intersectionType: string,
                public solverCandidates: Array<Set<number> | undefined>) {
        super();
        this.grayIndices = new Set(grayIndices);
        this.legals = new Set(legals);
        this.illegals = new Set(illegals);
        this.values = new Set(values);
    }

    getGrayIndices(): Set<number> {
        return this.grayIndices;
    }

    getRefreshIndices(): Set<number> {
        return new Set([...this.grayIndices, ...this.illegals]);
    }

    hintLegalCandidate(index: number, value: number): boolean {
        return this.legals.has(index) && this.values.has(value);
    }

    hintIllegalCandidate(index: number, value: number): boolean {
        return this.illegals.has(index) && this.values.has(value);
    }

    execute(): Resolution {
        console.info('Not implemented yet');
        return {selection: [...this.illegals], value: undefined, candidateValues: [...this.values]};
    }

    prefillCrucialCandidates(gameDescriptor: Array<number | undefined>, _candidates: Array<Set<number>>): Array<Set<number>> {
        let newCandidates = [..._candidates];

        let candidates = new Candidates(gameDescriptor).sets;
        this.getRefreshIndices()
            .forEach(index => {
                this.values.forEach(value => {
                    // @ts-ignore
                    if (candidates[index]?.has(value) && (this.legals.has(index) || this.illegals.has(index))) {
                        newCandidates = addCandidateAt(index, value, newCandidates);
                    }
                });
            });
        return newCandidates;
    }

    getStrategyType(): string {
        return this.strategyType;
    }

    toInfo(): ExplanationInfo {
        switch (this.strategyType) {
            case 'NakedPair':
                return {
                    title: `Naked Pair in cells ${toCellPositionsSet(this.legals)}`,
                    description: `Only cells ${toCellPositionsSet(this.legals)} can have the candidate values ${toValueList(this.values)}.`,
                    resolution: `Candidates ${toValueList(this.values)} removed from cells ${toCellPositionsSet(this.illegals)}.`
                };
            case 'PointingPair':
            case 'PointingTriple':
                let type = undefined;
                let sectionType = '';
                let index = [...this.legals][0];
                switch (this.intersectionType) {
                    case 'LineReductionColumn':
                        type = 'Line Reduction Column';
                        sectionType = 'Column';
                        break;
                    case 'LineReductionRow':
                        type = 'Line Reduction Row';
                        sectionType = 'Row';
                        break;
                    case 'BoxReductionColumn':
                        type = 'Box Reduction Column';
                        sectionType = 'Box';
                        break;
                    case 'BoxReductionRow':
                        type = 'Box Reduction Row';
                        sectionType = 'Box';
                        break;
                }

                let sectionId = toSectionIdentificator(index, sectionType);
                let where = `${sectionType} ${sectionId}`;

                return {
                    title: `${this.getStrategyName()} in cells ${toCellPositionsSet(this.legals)}`,
                    description: `Cells ${toCellPositionsSet(this.legals)} are the only cells in ${type} with the candidate value ${toValueList(this.values)}. The candidate must be in one of these cells and can be removed from other cells in ${where}.`,
                    resolution: `Candidates ${toValueList(this.values)} removed from cells ${toCellPositionsSet(this.illegals)}.`
                };
            case 'YWing':
                let legals = filterExistingOnly(this.legals, [...this.values][0], this.solverCandidates);
                return { // ${toCellPositionsSet(this.legals)}
                    title: `${this.getStrategyName()} in cells ${toCellPositionsSet(legals)}`,
                    description: `Only cells ${toCellPositionsSet(legals)} can have the candidate values ${toValueList(this.values)}.`,
                    resolution: `Candidate ${toValueList(this.values)} removed from cell ${toCellPositionsSet(this.illegals)}.`
                };
            default:
                return {
                    title: `${this.getStrategyName()} in cells ${toCellPositionsSet(this.legals)}`,
                    description: `Only cells ${toCellPositionsSet(this.legals)} can have the candidate values ${toValueList(this.values)}.`,
                    resolution: `Candidates ${toValueList(this.values)} removed from cells ${toCellPositionsSet(this.illegals)}.`
                };
        }
    }
}

export class SolvingStepLeaveCandidates extends Explanation {
    public legals: Set<number>;
    public values: Set<number>;
    public grayIndices: Set<number>;
    private readonly index: number;

    constructor(legals: Array<number>,
                values: Array<number>,
                public elementCount: number,
                grayIndices: Array<number>,
                public sectionType: string,
                public strategyType: string) {
        super();
        this.grayIndices = new Set(grayIndices);
        this.legals = new Set(legals);
        this.values = new Set(values);
        this.index = legals[0];
    }

    getGrayIndices(): Set<number> {
        return this.grayIndices;
    }

    hintLegalCandidate(index: number, value: number): boolean {
        return this.legals.has(index) && this.values.has(value);
    }

    hintIllegalCandidate(index: number, value: number): boolean {
        return this.legals.has(index) && !this.values.has(value);
    }

    execute(): Resolution {
        return {selection: [...this.legals], value: undefined, candidateValues: [...flipNumbers(this.values)]};
    }

    getStrategyType(): string {
        return this.strategyType;
    }

    toInfo(): ExplanationInfo {
        return {
            title: `${this.getStrategyName()} in cells ${toCellPositionsSet(this.legals)}`,
            description: `Cells ${toCellPositionsSet(this.legals)} are the only cells in ${this.sectionType} ${toSectionIdentificator(this.index, this.sectionType)} with the candidate values ${toValueList(this.values)}`,
            resolution: `All candidates other than ${toValueList(this.values)} can be removed from cells ${toCellPositionsSet(this.legals)}`
        };
    }
}

/**
 * Ordinal cell index number convertor to cell code
 *
 * @param index ordinal cell index
 */
export function toCellPosition(index: number): string {
    let row = index / 9;
    let column = index % 9;
    return `${String.fromCharCode(row + 65)}${column + 1}`;
}

/**
 * Ordinal cell index numbers convertor to cell codes
 *
 * @param indices ordinal cell indices
 */
export function toCellPositions(indices: Array<number>): string {
    return indices.map(index => toCellPosition(index))
        .join(", ");
}

/**
 * Returns human readable identifier of section which. Section is one of Row, Column or Box.
 * Rows are chars 'A' - 'I', columns are numbers 1 - 9, boxes are numbers 1 - 9.
 *
 * @param index cell index
 * @param sectionType one of Row, Column or Box
 */
export function toSectionIdentificator(index: number, sectionType: string): string {
    switch (sectionType) {
        case 'Row':
            return toCellPosition(index).substring(0, 1);
        case 'Column':
            return toCellPosition(index).substring(1, 2);
        case 'Box':
            let row = Math.floor(index / 9);
            let column = index % 9;
            let boxRow = Math.floor(row / 3);
            let boxColumn = Math.floor(column / 3);
            let box = boxRow * 3 + boxColumn + 1;
            return box.toString(10);
    }
    return 'N/A';
}

/**
 * Sorts and formats set of numbers to a string delimited with a comma.
 *
 * @param values set of values
 */
export function toValueList(values: Set<number>): string {
    return [...values].sort().join(", ");
}

/**
 * Converts set of ordinal cell index numbers to sorted cell identifiers
 * delimited with a comma
 *
 * @param indices ordinal cell indices
 */
export function toCellPositionsSet(indices: Set<number>): string {
    return toCellPositions([...indices].sort((a1,a2)=>a1-a2));
}

/**
 * Parse cell identifiers to ordinal cell index. For example from 'A3' to 2 (row 0, column 2).
 *
 * @param cellCode cell identifier
 */
export function parseCellPosition(cellCode: string): number {
    let row = cellCode.charCodeAt(0) - 65;
    let column = parseInt(cellCode.charAt(1)) - 1;
    return row * 9 + column;
}

/**
 * Splits cell identifiers and converts them into a list of ordinal Sudoku indices.
 *
 * @param cellCodes cell identifiers delimited with a comma
 */
export function parseCellPositions(cellCodes: string): Array<number> {
    return cellCodes.split(",").map(x => parseCellPosition(x));
}

/**
 * Parses candidate codes into a list of cells for whole Sudoku grid.
 *
 * @param candidateCodes candidate codes
 */
export function parseSolverCandidates(candidateCodes: string): Array<Set<number> | undefined> {
    return candidateCodes.split(',').map(c=>c.length>0 ? new Set(c.split('').map(x=>parseInt(x))) : undefined);
}
