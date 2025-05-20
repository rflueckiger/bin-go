import {BinGoConfig} from "./storage.ts";
import {BinGoState} from "./domain/bin-go-state.ts";
import {TaskCellState} from "./domain/task-cell-state.ts";
import {RewardCellState} from "./domain/reward-cell-state.ts";

export class BinGoStateBuilder {

    private readonly config: BinGoConfig;

    constructor(config: BinGoConfig) {
        this.config = config;
    }

    public createState(): BinGoState {
        const tasksCellStates: TaskCellState[] = this.config.tasks.map((task, index) => new TaskCellState(index, task.key, task.label))

        // create 6 RewardCellStates and for each create rewards
        const rewardCellStates: RewardCellState[] = []
        // const rewardBuilder = new RewardBuilder(this.config.rewards);
        for (let i = 0; i < 6; i++) {
            //   1. roll for rarity, then pick 1 item from that type randomly from the config
            //      - choose lesser rarity if higher not available
            //   2. if epic/rare inside this loot box is doen, mark loot box as "sparkly"
            //      - roll amount (using randomGaussianInt) if min/max differ, otherwise take min/max as amount
            //   3. roll for chance to have additional item, if so, go back to 1.

            const rewards: (Coins | Item)[] = rewardBuilder.getRewards();

            rewardCellStates.push(new RewardCellState(i, rewards))
        }

        // TODO: old code - remove when code above is done
        const rewardCellStates: RewardCellState[] = this.config.rewards.map((reward, index) => {
            switch (reward.type) {
                case 'coins': {
                    const amount = this.randomGaussianInt(reward.min, reward.max);
                    return new RewardCellState(index, new Coins(amount))
                }
                case 'item': {
                    return new RewardCellState(index, new Item(reward.key, reward.label))
                }
                default: throw Error('Unknown reward type');
            }
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

    private randomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // chatgpt
    private randomGaussianInt(min: number, max: number, samples: number = 6): number {
        if (min > max) throw new Error("min must be <= max");

        const mean = (min + max) / 2;
        const stddev = (max - min) / 6; // Approx 99.7% values fall in this range for normal dist

        // Approximate Gaussian by averaging `samples` uniform random values
        let sum = 0;
        for (let i = 0; i < samples; i++) {
            sum += Math.random();
        }
        const normalized = (sum / samples - 0.5) * Math.sqrt(12); // Normalize to mean 0, stddev ~1
        const gaussian = mean + normalized * stddev;

        // Clamp to range and return integer
        return Math.max(min, Math.min(max, Math.round(gaussian)));
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