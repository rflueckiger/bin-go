import {CellState} from "./cell-state.ts";

export class TaskCellState implements CellState {
    public readonly type = 'task'
    public readonly id: number
    public readonly key: string
    public readonly icon: string
    public readonly description?: string

    public marked = false;

    constructor(id: number, key: string, icon: string, description?: string) {
        this.id = id
        this.key = key
        this.icon = icon
        this.description = description
    }
}