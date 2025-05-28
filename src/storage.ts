import {BoardState} from "./domain/board-state.ts";
import {CellState} from "./domain/cell-state.ts";
import {Reward} from "./domain/reward.ts";

export enum Rarity {
    Common = 'common',
    Uncommon = 'uncommon',
    Rare = 'rare',
    Epic = 'epic'
}

export interface AppConfig {
    version: number;
    tasks: Task[];
    rewardSpecs: RewardSpec[];
}

export interface Task {
    key: string;
    icon: string;           // emoji to represent the task, supports one or two characters (if the user has choices)
    description?: string;   // an optional description of the task
}

export interface RewardSpec {
    type: string;       // i.e. 'item', 'coins', 'secret' -- identifies the technical type
    key: string;        // the identifier of the reward, same key means the items can be combined, i.e. the name of an item like "cake"
    description?: string;   // the label of this reward, displayed to the user instead of the technical key
    partsToAWhole: number;  // whether multiple of these must be collected to generate a whole
    min: number;        // the min amount gained per reward
    max: number;        // the max amount gained per reward (the actual value will be random)
    rarity: Rarity;     // the rarity of the item
    icon: string;       // emoji to represent the reward, support 1 character
    owner?: string;     // marks that this reward is gifted by someone else and can't be edited
}

export interface Inventory {
    items: Reward[]
    coins: number
}

export class Storage {

    public static VERSION = 1;

    public rarityChances: { [key in Rarity]: number } = {
        [Rarity.Epic]: 5,
        [Rarity.Rare]: 50,
        [Rarity.Uncommon]: 250,
        [Rarity.Common]: 695
    }

    private inventoryListeners: (() => void)[] = []

    public addInventoryListener(listener: () => void) {
        this.inventoryListeners.push(listener)
    }

    public removeInventoryListener(listener: () => void) {
        this.inventoryListeners.splice(this.inventoryListeners.indexOf(listener), 1)
    }

    public getConfig(): AppConfig | undefined {
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

    public updateConfig(config: AppConfig) {
        // TODO: validate / sanitize input
        localStorage.setItem('config', JSON.stringify(config));
    }

    public getState(): BoardState | undefined {
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

    public updateState(state: BoardState) {
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

    public getInventory(): Inventory {
        console.log('Reading inventory...')
        const strInventory = localStorage.getItem('inventory');

        if (strInventory) {
            return JSON.parse(strInventory)
        }

        const emptyInventory = {
            coins: 0,
            items: []
        }
        localStorage.setItem('inventory', JSON.stringify(emptyInventory));
        return emptyInventory;
    }

    public updateInventory(rewards: Reward[]) {
        // TODO: show collected rewards to user

        console.log('Collecting rewards:')
        rewards.forEach(reward => { console.log(`- ${JSON.stringify(reward)}`) })

        const inventory = this.getInventory()
        if (!inventory) {
            throw new Error('Cannot update inventory, because inventory could not be loaded.')
        }

        rewards.forEach(reward => {
            if (reward.type === 'coins') {
                inventory.coins += reward.amount
            } else {
                const existingItems = inventory.items.find(item => item.key === reward.key)
                if (existingItems) {
                    existingItems.amount += reward.amount

                    // update other properties, the item might have received an overhaul in the meantime
                    existingItems.icon = reward.icon
                    existingItems.description = reward.description
                    existingItems.rarity = reward.rarity
                    existingItems.partsToAWhole = reward.partsToAWhole
                    existingItems.owner = reward.owner
                } else {
                    inventory.items.push(reward)
                }
            }
        })

        localStorage.setItem('inventory', JSON.stringify(inventory));
        this.inventoryListeners.forEach(listener => listener())
    }

    public updateRewardAmount(key: string, amount: number) {
        console.log(`Updating amount of reward "${key}" to ${amount}`)
        const inventory = this.getInventory()
        const existingReward = inventory.items.find(r => r.key == key)
        if (existingReward) {
            existingReward.amount = amount
            localStorage.setItem('inventory', JSON.stringify(inventory))
        }
    }

    private static findCellState(state: BoardState, type: 'task' | 'reward', id: number): CellState | undefined {
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

export const storage = new Storage();