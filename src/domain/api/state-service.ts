import {BoardState} from "../board-state.ts";
import {RewardBox} from "../reward-box.ts";

export interface StateService {

    /* Returns the state */
    getState(): Promise<BoardState | undefined>

    /* Save the state */
    save(state: BoardState): Promise<void>

    /**
     * Marks the task cell with the given id as completed. Returns false if the task cell was already marked completed.
     * This might result in one or more reward cells being unlocked.
     *
     * @param taskCellId the task cell id to complete
     */
    completeTask(taskCellId: number): Promise<BoardState>

    /**
     * Collect rewards from a unlocked reward cell. The cell will then be marked 'collected'.
     * If collecting rewards was successful the rewards are returned. If not, undefined is returned.
     *
     * @param rewardCellId the id of the unlocked reward cell to collect rewards from
     */
    collectRewards(rewardCellId: number): Promise<RewardBox | undefined>

}