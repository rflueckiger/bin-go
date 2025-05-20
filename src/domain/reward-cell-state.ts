import {CellState} from "./cell-state.ts";
import {Reward} from "./reward.ts";

export class RewardCellState extends CellState {
    public readonly reward: Reward;

    public hidden = false;
    public marked = false;

    constructor(id: number, reward: Reward) {
        super(id, 'reward');

        this.reward = reward;
    }
}