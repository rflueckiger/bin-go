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
    type: RewardSpecType;   // i.e. 'collectible', 'coins' -- identifies the reward archetype, i.e. for editor selection
    key: string;        // the identifier of the reward, same key means the rewards can be combined, i.e. the name of a reward like "cake"
    description?: string;   // the label of this reward, displayed to the user instead of the technical key
    partsToAWhole: number;  // whether multiple of these must be collected to generate a whole
    min: number;        // the min amount gained per reward
    max: number;        // the max amount gained per reward (the actual value will be random)
    rarity: Rarity;     // the rarity of the reward
    icon: string;       // emoji to represent the reward, support 1 character
    owner?: string;     // marks that this reward is gifted by someone else and can't be edited
    value?: number;      // the value in coins of 1 (whole) reward
    shelfLife?: number;  // undefined = does never expire, 0 = expires when collected (gets converted into coins)
                        // TODO: shelf life unit of actual values not yet defined and not yet supported
}

export interface Inventory {
    rewards: Reward[]
}

export enum Operation {
    Add = 1,
    Substract = -1
}

export const UNIQUE_REWARD_KEY_COINS = 'coins'

export const createUniqueRewardCoins = (coins: number)  => {
    return {
        type: 'unique',
        key: UNIQUE_REWARD_KEY_COINS,
        amount: coins,
        value: 1,
        rarity: Rarity.Common,
        icon: '🪙',
        partsToAWhole: 1,
        description: 'Hobby Investment Coins'
    }
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
            rewards: [ createUniqueRewardCoins(0) ]
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
            if (reward.shelfLife === undefined || reward.shelfLife > 0) {
                const existingReward = inventory.rewards.find(r => r.key === reward.key)
                if (existingReward) {
                    existingReward.amount += reward.amount

                    existingReward.icon = reward.icon
                    existingReward.description = reward.description
                    existingReward.rarity = reward.rarity
                    existingReward.partsToAWhole = reward.partsToAWhole
                    existingReward.owner = reward.owner
                    existingReward.value = reward.value
                    existingReward.shelfLife = reward.shelfLife
                } else {
                    inventory.rewards.push(reward)
                }
            } else {
                // collectibles with shelfLife <= 0 cannot be stored, they must be spent immediately
                // currently conversion is the only available option
                this.convertRewardToCoins(inventory, reward)
            }
        })

        localStorage.setItem('inventory', JSON.stringify(inventory));
        this.inventoryListeners.forEach(listener => listener())
    }

    private convertRewardToCoins(inventory: Inventory, reward: Reward) {
        if (!reward.value || reward.value <= 0) {
            // reward has no value and is therefore lost without getting coins
            console.log(`Reward ${reward.key} is not converted to coins, since it has no value.`)
            return;
        }

        // reward has a value and can therefore be converted to coins
        const coins = Math.floor(reward.amount / reward.partsToAWhole) * reward.value
        const coinsReward = inventory.rewards.find(r => r.key === UNIQUE_REWARD_KEY_COINS)
        if (!coinsReward) {
            inventory.rewards.push(createUniqueRewardCoins(coins))
        } else {
            coinsReward.amount += coins
        }
        console.log(`Reward ${reward.key} is converted to ${coins} coins.`)
    }

    public changeAmount(rewardKey: string, operation: Operation, amount: number) {
        const difference = operation * Math.max(0, amount)
        console.log(`Updating amount of reward "${rewardKey}" by ${difference}`)
        const inventory = this.getInventory()
        const existingReward = inventory.rewards.find(r => r.key === rewardKey)
        if (existingReward) {
            existingReward.amount += difference
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