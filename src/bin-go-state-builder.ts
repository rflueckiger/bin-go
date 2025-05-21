import {BinGoConfig, BinGoRewardSpec, Rarity} from "./storage.ts";
import {BinGoState} from "./domain/bin-go-state.ts";
import {TaskCellState} from "./domain/task-cell-state.ts";
import {RewardCellState} from "./domain/reward-cell-state.ts";
import {Reward} from "./domain/reward.ts";

export class BinGoStateBuilder {

    private readonly config: BinGoConfig;

    constructor(config: BinGoConfig) {
        this.config = config;
    }

    public createState(): BinGoState {
        const tasksCellStates: TaskCellState[] = this.config.tasks.map((task, index) => new TaskCellState(index, task.key, task.label))

        // create 6 RewardCellStates and for each create rewards
        const rewardCellStates: RewardCellState[] = []
        for (let i = 0; i < 6; i++) {
            const rewards: Reward[] = [];
            this.generateRewards(rewards)
            rewardCellStates.push(new RewardCellState(i, rewards))
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

    private generateRewards(rewards: Reward[], maxRolls = 3, roll = 1) {
        //   1. roll for rarity, then pick 1 item from that type randomly from the config
        //   2. if epic/rare inside this loot box is done
        //   3. otherwise repeat for a maximum of 3 times total

        const rarity = this.getRarity();
        const reward = this.getRandomReward(this.config.rewardSpecs, rarity);

        if (reward) {
            rewards.push(reward)

            // max tries reached?
            if (roll >= maxRolls) {
                return
            }

            // maybe one more reward?
            if ((reward.rarity === Rarity.Uncommon || reward.rarity === Rarity.Common)
                && this.randomInt(0, 5) < 2) { // one more item in 2/5 of cases

                this.generateRewards(rewards, maxRolls, roll + 1)
            }
        }
    }

    private getRandomReward(rewardSpecs: BinGoRewardSpec[], rarity: Rarity): Reward | null {
        const matchingRewardSpecs = rewardSpecs.filter(spec => spec.rarity === rarity)
        if (matchingRewardSpecs.length > 0) {
            const randomIndex = this.randomInt(0, matchingRewardSpecs.length - 1)
            return this.createReward(matchingRewardSpecs[randomIndex])
        }

        const lowerRarity = this.getNextLowerRarity(rarity)
        if (lowerRarity) {
            return this.getRandomReward(rewardSpecs, lowerRarity)
        }

        return null
    }

    private createReward(rewardSpec: BinGoRewardSpec): Reward {
        switch (rewardSpec.type) {
            default: return {
                type: rewardSpec.type,
                key: rewardSpec.key,
                label: rewardSpec.label,
                rarity: rewardSpec.rarity,
                amount: this.getGaussianAmount(rewardSpec),
                partsToAWhole: rewardSpec.partsToAWhole
            }
        }
    }

    private getGaussianAmount(rewardSpec: BinGoRewardSpec): number {
        if (rewardSpec.min !== rewardSpec.max) {
            return this.randomGaussianInt(rewardSpec.min, rewardSpec.max)
        }
        return rewardSpec.min
    }

    private getNextLowerRarity(rarity: Rarity): Rarity | undefined {
        if (rarity === Rarity.Epic) { return Rarity.Rare }
        else if (rarity === Rarity.Rare) { return Rarity.Uncommon }
        else if (rarity === Rarity.Uncommon) { return Rarity.Common }
        else return undefined
    }

    private getRarity(): Rarity {
        const roll = this.randomInt(0, 999);
        if (roll < 8) { return Rarity.Epic }
        else if (roll < 88) { return Rarity.Rare }
        else if (roll < 338) { return Rarity.Uncommon }
        else return Rarity.Common
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