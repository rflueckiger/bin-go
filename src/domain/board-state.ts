import {TaskCellState} from "./task-cell-state.ts";
import {RewardCellState} from "./reward-cell-state.ts";

export interface BoardState {
    version: number;
    createdAt: number; // e.g. Date.now()
    tasks: TaskCellState[], // order: 00, 01, 02, 10, 11, 12, 20, 21, 22
    rewards: RewardCellState[], // order: 03, 13, 23, 30, 31, 32
}