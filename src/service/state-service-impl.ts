import {StateService} from "../domain/api/state-service.ts";
import {BoardState} from "../domain/board-state.ts";
import {RewardBox} from "../domain/reward-box.ts";
import {
    RewardCellStateMigrator_1_markedToUnlockedCollected
} from "../domain/migration/RewardCellStateMigrator_1_markedToUnlockedCollected.ts";
import {RewardCellState} from "../domain/reward-cell-state.ts";

export class StateServiceImpl implements StateService {

    private readonly store: LocalForage
    private readonly rootKey: string

    constructor(store: LocalForage, rootKey: string) {
        this.store = store
        this.rootKey = rootKey
    }

    async getState(): Promise<BoardState | undefined> {
        try {
            const stateRaw = await this.store.getItem(this.rootKey)
            if (stateRaw && typeof stateRaw === 'string') {
                return this.revive(stateRaw)
            }

            // no state found, check for legacy state
            const legacyState = localStorage.getItem(this.rootKey)
            if (legacyState) {
                // legacy state found -> migrate it
                const stateMigrated = await this.store.setItem(this.rootKey, legacyState)
                // delete legacy state
                localStorage.removeItem(this.rootKey)
                return this.revive(stateMigrated)
            }

            return undefined
        } catch (reason) {
            console.error('Error while loading state.', reason)
            throw new Error('Error while loading state.')
        }
    }

    async save(state: BoardState): Promise<void> {
        // await this.requestPersistentStorage() // TODO: <-- check if this works and/or is used properly
        await this.store.setItem(this.rootKey, this.serialize(state))
    }

    private revive(serialized: string): BoardState {
        return JSON.parse(serialized, (key, value) => {
            // reward box needs to be revived as a class instance
            if (key === 'rewardBox') {
                return new RewardBox(value.rewards)
            }
            if (key === 'rewards') {
                // migrate reward cell states; if "marked" => unlocked/collected
                return value.map(RewardCellStateMigrator_1_markedToUnlockedCollected.migrate);
            }
            return value;
        })
    }

    private serialize(state: BoardState): string {
        return JSON.stringify(state)
    }

    async completeTask(taskCellId: number): Promise<BoardState> {
        const state = await this.getState()
        if (!state) {
            throw new Error('Cannot complete task, no state found.')
        }

        const task = state.tasks.find(tc => tc.id === taskCellId)
        if (!task || task.marked) {
            return state
        }

        task.marked = true;

        // Check for completed rows/columns
        [0, 1, 2].map(i => state.tasks[i].marked).reduce((rowMarked, cellMarked) => rowMarked && cellMarked) && (this.unlockRewards(state.rewards[0]));
        [3, 4, 5].map(i => state.tasks[i].marked).reduce((rowMarked, cellMarked) => rowMarked && cellMarked) && (this.unlockRewards(state.rewards[1]));
        [6, 7, 8].map(i => state.tasks[i].marked).reduce((rowMarked, cellMarked) => rowMarked && cellMarked) && (this.unlockRewards(state.rewards[2]));

        // column 1/2/3
        [0, 3, 6].map(i => state.tasks[i].marked).reduce((rowMarked, cellMarked) => rowMarked && cellMarked) && (this.unlockRewards(state.rewards[3]));
        [1, 4, 7].map(i => state.tasks[i].marked).reduce((rowMarked, cellMarked) => rowMarked && cellMarked) && (this.unlockRewards(state.rewards[4]));
        [2, 5, 8].map(i => state.tasks[i].marked).reduce((rowMarked, cellMarked) => rowMarked && cellMarked) && (this.unlockRewards(state.rewards[5]));

        await this.save(state)
        return state
    }

    private unlockRewards(rewardCellState: RewardCellState) {
        if (!rewardCellState.unlocked && !rewardCellState.collected) {
            rewardCellState.unlocked = true
        }
    }

    async collectRewards(rewardCellId: number): Promise<RewardBox | undefined> {
        const state = await this.getState()
        if (!state) {
            return undefined
        }

        const cellState = state.rewards.find(rc => rc.id === rewardCellId)
        if (!cellState || !cellState.unlocked || cellState.collected) {
            return undefined
        }

        cellState.collected = true
        await this.save(state)
        return cellState.rewardBox
    }

}