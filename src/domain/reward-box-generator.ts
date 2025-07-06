import {Rarity, Reward, RewardType} from "./reward.ts";
import {storage} from "../storage.ts";
import {LinearDecayAmountFunction} from "./functions/linear-decay-amount-function.ts";
import {RewardBox} from "./reward-box.ts";
import {RewardSpec} from "./config/reward-spec.ts";
import {RewardSpecType} from "./config/reward-spec-type.ts";

export class RewardBoxGenerator {

    private readonly rewardSpecs: RewardSpec[];

    private readonly amountFunction = new LinearDecayAmountFunction();

    private readonly obfuscateSponsoredRewards;

    public constructor(rewardSpecs: RewardSpec[], obfuscateSponsoredRewards = false) {
        this.rewardSpecs = rewardSpecs;
        this.obfuscateSponsoredRewards = obfuscateSponsoredRewards
    }

    public generate(): RewardBox {
        const rewards: Reward[] = []

        // basic reward
        const commonReward = this.getRandomReward(this.rewardSpecs, Rarity.Common);
        if (commonReward) {
            rewards.push(commonReward)
        }

        // additional rewards
        this.generateRewards(rewards)

        return new RewardBox(rewards)
    }

    private generateRewards(rewards: Reward[], maxRolls = 2, roll = 1) {
        //   1. roll for rarity, then pick 1 reward from that type randomly from the config
        //   2. if epic/rare inside this loot box is done
        //   3. otherwise repeat for a maximum of 3 times total

        const rarity = this.getRarity();
        if (rarity != null) {
            const reward = this.getRandomReward(this.rewardSpecs, rarity);
            if (reward) {
                rewards.push(reward)
            }
        }

        // max tries reached?
        if (roll >= maxRolls) {
            return
        }

        // already epic or rare rewards?
        if (rewards.filter(r => r.rarity === Rarity.Epic || r.rarity === Rarity.Rare).length > 0) {
            return
        }

        // chance of 2 in 5 to get additional rewards
        if (this.randomInt(0, 5) >= 2) {
            return
        }

        this.generateRewards(rewards, maxRolls, roll + 1)
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
        const reward = {
            type: RewardType.Collectible,
            key: rewardSpec.key,
            icon: rewardSpec.icon,
            description: rewardSpec.description,
            rarity: rewardSpec.rarity,
            amount: this.getAmount(rewardSpec),
            partsToAWhole: rewardSpec.partsToAWhole,
            sponsor: rewardSpec.sponsor,
            value: rewardSpec.value,
            shelfLife: rewardSpec.shelfLife
        }

        if (this.obfuscateSponsoredRewards && rewardSpec.type === RewardSpecType.SponsoredCollectible) {
            reward.type = RewardType.Collectible
            reward.icon = '🎁'
            reward.description = `Sponsor: ${rewardSpec.sponsor}`
        }

        return reward
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

    private getRarity(): Rarity | null {
        const roll = this.randomInt(0, 999);
        if (roll < this.sumRarityChance([Rarity.Epic])) { return Rarity.Epic }
        else if (roll < this.sumRarityChance([Rarity.Epic, Rarity.Rare])) { return Rarity.Rare }
        else if (roll < this.sumRarityChance([Rarity.Epic, Rarity.Rare, Rarity.Uncommon])) { return Rarity.Uncommon }
        else if (roll < this.sumRarityChance([Rarity.Epic, Rarity.Rare, Rarity.Uncommon, Rarity.Common])) { return Rarity.Common }
        else return null
    }

    private sumRarityChance(rarities: Rarity[]): number {
        return rarities.map(r => storage.rarityChances[r]).reduce((sum, chance) => sum + chance)
    }

    private randomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}