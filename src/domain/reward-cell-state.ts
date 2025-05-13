import {Coins} from "./coins.ts";
import {Item} from "./item.ts";
import {CellState} from "./cell-state.ts";

export class RewardCellState extends CellState {
    public readonly reward: Coins | Item;

    public hidden = false;
    public marked = false;

    constructor(id: number, reward: Coins | Item) {
        super(id, 'reward');

        this.reward = reward;
    }
}