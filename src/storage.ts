export interface BinGoConfig {
    version: number;
    tasks: string[];
    rewards: string[];
}

export interface BinGoState {
    version: number;
    createdAt: number; // e.g. Date.now()
    tasks: BinGoCellState[], // order: 00, 01, 02, 10, 11, 12, 20, 21, 22
    rewards: BinGoCellState[], // order: 03, 13, 23, 30, 31, 32
}

export interface BinGoCellState {
    type: 'task' | 'reward',
    id: number,
    name: string,
    marked: boolean
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
        console.log('Validating updated config...')
        console.log(config);

        // TODO: validate / sanitize input

        console.log('Updating config...')
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
        console.log('Validating updated state...')
        console.log(state);

        // TODO: validate / sanitize input

        console.log('Updating state...')
        localStorage.setItem('state', JSON.stringify(state));
    }

    public updateCellState(cellState: BinGoCellState) {
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

    private static findCellState(state: BinGoState, type: 'task' | 'reward', id: number): BinGoCellState | undefined {
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