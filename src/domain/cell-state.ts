export abstract class CellState {
    public readonly type: 'task' | 'reward';
    public readonly id: number;

    public marked = false;

    protected constructor(id: number, type: 'task' | 'reward') {
        this.id = id;
        this.type = type;
    }
}