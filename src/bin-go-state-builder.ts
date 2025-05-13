import {BinGoConfig} from "./storage.ts";
import {BinGoState} from "./domain/bin-go-state.ts";
import {TaskCellState} from "./domain/task-cell-state.ts";
import {RewardCellState} from "./domain/reward-cell-state.ts";
import {Item} from "./domain/item.ts";

export class BinGoStateBuilder {

    private readonly config: BinGoConfig;

    constructor(config: BinGoConfig) {
        this.config = config;
    }

    public createState(): BinGoState {
        const tasksCellStates: TaskCellState[] = this.config.tasks.map((task, index) => new TaskCellState(index, task, task))
        const rewardCellStates: RewardCellState[] = this.config.rewards.map((reward, index) => {
            // TODO: handle different reward types, like coins etc. as soon as available from config
            return new RewardCellState(index, new Item(reward, reward))
        })

        this.shuffle(tasksCellStates)
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