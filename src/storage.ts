import {BoardState} from "./domain/board-state.ts";
import {Rarity} from "./domain/reward.ts";
import {RewardBox} from "./domain/reward-box.ts";
import {
    RewardCellStateMigrator_1_markedToUnlockedCollected
} from "./domain/migration/RewardCellStateMigrator_1_markedToUnlockedCollected.ts";
import {AppConfig} from "./domain/config/app-config.ts";

export class Storage {

    public static VERSION = 1;

    public rarityChances: { [key in Rarity]: number } = {
        [Rarity.Epic]: 5,
        [Rarity.Rare]: 50,
        [Rarity.Uncommon]: 200,
        [Rarity.Common]: 350
    }

    public getConfig(): AppConfig | undefined {
        const strConfig = localStorage.getItem('config');

        if (strConfig) {
            const config = JSON.parse(strConfig)
            const configVersion = Number(config.version);
            if (configVersion === Storage.VERSION) {
                return config;
            } else if (configVersion < Storage.VERSION) {
                console.log(`Older config detected (version=${config.version}). Current version=${Storage.VERSION}. Config migration necessary...`)
                // TODO: implement migration handlers when necessary
                throw new Error('StorageMigrationError')
            } else if (configVersion > Storage.VERSION) {
                console.warn(`Newer config detected (version=${config.version}). Current version=${Storage.VERSION}. No migration path...`)
                // TODO: implement resolution strategy
                throw new Error('StorageMigrationError')
            }
        }

        console.log('No config found.')
        return undefined;
    }

    public updateConfig(config: AppConfig) {
        // TODO: validate / sanitize input
        localStorage.setItem('config', JSON.stringify(config));
    }

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

    public clearState() {
        console.log('Clearing state...')
        localStorage.removeItem('state');
    }
}

export const storage = new Storage();