import {CellState} from "./cell-state.ts";
import {Reward} from "./reward.ts";

export class RewardCellState extends CellState {
    public readonly rewards: Reward[];

    constructor(id: number, rewards: Reward[]) {
        super(id, 'reward');

        this.rewards = rewards;
    }
}