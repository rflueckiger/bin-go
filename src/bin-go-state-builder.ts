import {BinGoCellState, BinGoConfig, BinGoState} from "./storage.ts";

export class BinGoStateBuilder {

    private readonly config: BinGoConfig;

    constructor(config: BinGoConfig) {
        this.config = config;
    }

    public createState(): BinGoState {
        const tasksCellStates = this.config.tasks.map((task, index) => {
            return {
                type: 'task',
                id: index,
                name: task,
                marked: false
            } as BinGoCellState
        })
        this.shuffle(tasksCellStates)

        const rewardCellStates = this.config.rewards.map((reward, index) => {
            return {
                type: 'reward',
                id: index,
                name: reward,
                marked: false
            } as BinGoCellState
        })
        this.shuffle(rewardCellStates)

        return {
            version: this.config.version,
            createdAt: Date.now(),
            tasks: tasksCellStates,
            rewards: rewardCellStates
        }
    }

    // https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
    // @ts-ignore
    private shuffle(array) {
        let i = array.length;

        // While there remain elements to shuffle...
        while (i != 0) {

            // Pick a remaining element...
            let randomIndex = Math.floor(Math.random() * i);
            i--;

            // And swap it with the current element.
            [array[i], array[randomIndex]] = [array[randomIndex], array[i]];
        }
    }

}