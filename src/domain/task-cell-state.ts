import {CellState} from "./cell-state.ts";

export class TaskCellState extends CellState {
    public readonly key: string
    public readonly label: string

    constructor(id: number, key: string, label: string) {
        super(id, 'task');

        this.key = key;
        this.label = label;
    }
}