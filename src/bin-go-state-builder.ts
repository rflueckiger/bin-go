import {AppConfig, RewardSpec, storage} from "./storage.ts";
import {BoardState} from "./domain/board-state.ts";
import {TaskCellState} from "./domain/task-cell-state.ts";
import {RewardCellState} from "./domain/reward-cell-state.ts";
import {Rarity, Reward, RewardType} from "./domain/reward.ts";
import {LinearDecayAmountFunction} from "./domain/functions/linear-decay-amount-function.ts";

export class BinGoStateBuilder {

    private readonly config: AppConfig;

    private readonly amountFunction = new LinearDecayAmountFunction();

    constructor(config: AppConfig) {
        this.config = config;
    }

    public createState(): BoardState {
        const tasksCellStates: TaskCellState[] = this.config.tasks.map((task, index) => new TaskCellState(index, task.key, task.icon, task.description))

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
        //   1. roll for rarity, then pick 1 reward from that type randomly from the config
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
                && this.randomInt(0, 5) < 2) { // one more rewards in 2/5 of cases

                this.generateRewards(rewards, maxRolls, roll + 1)
            }
        }
    }

    private getRandomReward(rewardSpecs: RewardSpec[], rarity: Rarity): Reward | null {
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

    private createReward(rewardSpec: RewardSpec): Reward {
        switch (rewardSpec.type) {
            default: return {
                type: RewardType.Collectible,
                key: rewardSpec.key,
                icon: rewardSpec.icon,
                description: rewardSpec.description,
                rarity: rewardSpec.rarity,
                amount: this.getAmount(rewardSpec),
                partsToAWhole: rewardSpec.partsToAWhole,
                owner: rewardSpec.owner,
                value: rewardSpec.value,
                shelfLife: rewardSpec.shelfLife
            }
        }
    }

    private getAmount(rewardSpec: RewardSpec): number {
        if (rewardSpec.min !== rewardSpec.max) {
            return this.amountFunction.getAmount(rewardSpec.min, rewardSpec.max)
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
        if (roll < this.sumRarityChance([Rarity.Epic])) { return Rarity.Epic }
        else if (roll < this.sumRarityChance([Rarity.Epic, Rarity.Rare])) { return Rarity.Rare }
        else if (roll < this.sumRarityChance([Rarity.Epic, Rarity.Rare, Rarity.Uncommon])) { return Rarity.Uncommon }
        else return Rarity.Common
    }

    private sumRarityChance(rarities: Rarity[]): number {
        return rarities.map(r => storage.rarityChances[r]).reduce((sum, chance) => sum + chance)
    }

    private randomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
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