import {CellState} from "./cell-state.ts";
import {RewardBox} from "./reward-box.ts";

export class RewardCellState extends CellState {
    public readonly rewardBox: RewardBox;

    constructor(id: number, rewardBox: RewardBox) {
        super(id, 'reward');

        this.rewardBox = rewardBox;
    }
}