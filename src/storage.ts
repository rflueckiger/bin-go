import {BinGoState} from "./domain/bin-go-state.ts";
import {CellState} from "./domain/cell-state.ts";

export enum Rarity {
    Common = 'common',
    Uncommon = 'uncommon',
    Rare = 'rare',
    Epic = 'epic'
}

export interface BinGoConfig {
    version: number;
    tasks: BinGoTask[];
    rewardSpecs: BinGoRewardSpec[];
}

export interface BinGoTask {
    key: string;
    label: string;
}

export interface BinGoRewardSpec {
    type: string;       // i.e. 'item', 'coins' -- identifies the technical type
    key: string;        // the identifier of the reward, same key means the items can be combined, i.e. the name of an item like "cake"
    label: string;      // the label of this reward, displayed to the user instead of the technical key
    partsToAWhole: number;  // whether multiple of these must be collected to generate a whole
    min: number;        // the min amount gained per reward
    max: number;        // the max amount gained per reward (the actual value will be random)
    rarity: Rarity ;    // the rarity of the item
}

export class Storage {

    public static VERSION = 1;

    public getConfig(): BinGoConfig | undefined {
        console.log('Reading config...')
        const strConfig = localStorage.getItem('config');

        if (strConfig) {
            const config = JSON.parse(strConfig)
            console.log(config)
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

    public updateConfig(config: BinGoConfig) {
        // TODO: validate / sanitize input
        localStorage.setItem('config', JSON.stringify(config));
    }

    public getState(): BinGoState | undefined {
        console.log('Reading state...')
        const strState = localStorage.getItem('state');

        if (strState) {
            const state = JSON.parse(strState)
            console.log(state)
            const stateVersion = Number(state.version);
            if (stateVersion === Storage.VERSION) {
                return state;
            } else {
                console.log(`State version mismatch detected (version=${stateVersion}). Current version=${Storage.VERSION}. State migration necessary...`)
                throw new Error('StorageMigrationError')
            }
        }

        console.log('No state found.')
        return undefined;
    }

    public updateState(state: BinGoState) {
        // TODO: validate / sanitize input
        localStorage.setItem('state', JSON.stringify(state));
    }

    public updateCellState(cellState: CellState) {
        console.log(`Updating state of cell (${cellState.id}) ...`)
        const state = this.getState();
        if (!state) {
            throw new Error('IllegalStateError')
        }

        const existingCellState = Storage.findCellState(state, cellState.type, cellState.id)
        if (!existingCellState) {
            throw new Error('IllegalStateError')
        }

        existingCellState.marked = cellState.marked
        this.updateState(state);
    }

    private static findCellState(state: BinGoState, type: 'task' | 'reward', id: number): CellState | undefined {
        let cellStates
        if (type === 'task') { cellStates = state.tasks }
        if (type === 'reward') { cellStates = state.rewards }

        if (!cellStates) {
            return undefined;
        }

        return cellStates[id];
    }

    public clearState() {
        console.log('Clearing state...')
        localStorage.removeItem('state');
    }
}