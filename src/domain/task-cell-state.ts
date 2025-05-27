import {CellState} from "./cell-state.ts";

export class TaskCellState extends CellState {
    public readonly key: string
    public readonly icon: string
    public readonly description?: string

    constructor(id: number, key: string, icon: string, description?: string) {
        super(id, 'task')

        this.key = key
        this.icon = icon
        this.description = description
    }
}