import {BoardState} from "./domain/board-state.ts";
import {RewardBox} from "./domain/reward-box.ts";
import {
    RewardCellStateMigrator_1_markedToUnlockedCollected
} from "./domain/migration/RewardCellStateMigrator_1_markedToUnlockedCollected.ts";

export class Storage {

    public loadState(): BoardState | undefined {
        const serializedStateData = localStorage.getItem('state');
        if (serializedStateData) {
            return JSON.parse(serializedStateData, (key, value) => {
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
        return undefined;
    }

    public saveState(state: BoardState) {
        // TODO: validate / sanitize input
        localStorage.setItem('state', JSON.stringify(state));
    }

    public markTaskCell(id: number) {
        console.log(`Marking task cell with id: ${id}`)
        const state = this.loadState();
        if (!state) {
            return
        }

        const task = state.tasks.find(tc => tc.id === id)
        if (!task || task.marked) {
            return
        }

        task.marked = true
        this.saveState(state)
    }

    public markRewardCellUnlocked(id: number): boolean {
        console.log(`Unlocking reward cell with id: ${id}`)
        const state = this.loadState();
        if (!state) {
            return false
        }

        const cellState = state.rewards.find(rc => rc.id === id)
        if (!cellState || cellState.unlocked) {
            return false
        }

        cellState.unlocked = true
        this.saveState(state)
        return true
    }

    public markRewardCellCollected(id: number): boolean {
        console.log(`Collecting rewards from cell with id: ${id}`)
        const state = this.loadState();
        if (!state) {
            return false
        }

        const cellState = state.rewards.find(rc => rc.id === id)
        if (!cellState || !cellState.unlocked || cellState.collected) {
            return false
        }

        cellState.collected = true;
        this.saveState(state);
        return true
    }
}

export const storage = new Storage();