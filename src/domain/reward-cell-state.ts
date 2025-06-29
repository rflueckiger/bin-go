import {RewardBox} from "./reward-box.ts";
import {CellState} from "./cell-state.ts";

export class RewardCellState implements CellState {
    public readonly type = 'reward'
    public readonly id: number
    public readonly rewardBox: RewardBox

    public unlocked = false
    public collected = false

    constructor(id: number, rewardBox: RewardBox) {
        this.id = id
        this.rewardBox = rewardBox
    }
}