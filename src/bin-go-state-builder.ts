import {AppConfig} from "./storage.ts";
import {BoardState} from "./domain/board-state.ts";
import {TaskCellState} from "./domain/task-cell-state.ts";
import {RewardCellState} from "./domain/reward-cell-state.ts";
import {RewardBoxGenerator} from "./domain/reward-box-generator.ts";

export class BinGoStateBuilder {

    private readonly config: AppConfig
    private readonly rewardBoxGenerator: RewardBoxGenerator

    constructor(config: AppConfig) {
        this.config = config;
        this.rewardBoxGenerator = new RewardBoxGenerator(config.rewardSpecs)
    }

    public createState(): BoardState {
        const tasksCellStates: TaskCellState[] = this.config.tasks.map((task, index) => new TaskCellState(index, task.key, task.icon, task.description))

        // create 6 RewardCellStates and for each create rewards
        const rewardCellStates: RewardCellState[] = []
        for (let i = 0; i < 6; i++) {
            const box = this.rewardBoxGenerator.generate()
            rewardCellStates.push(new RewardCellState(i, box))
        }

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