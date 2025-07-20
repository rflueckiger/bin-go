import {Rarity, Reward, RewardType} from "./reward.ts";

export const UNIQUE_REWARD_KEY_COINS = 'coins'

export enum Operation {
    Add = 1,
    Subtract = -1
}

export class RewardCollection {

    private readonly rewards: Reward[] = []

    constructor(initialContent?: Reward | Reward[]) {
        if (!initialContent) {
            this.rewards.push(createUniqueRewardCoins(0))
        } else {
            const rewards = Array.isArray(initialContent) ? initialContent : [initialContent]
            this.rewards.push(...rewards)
        }
    }

    public getReward(key: string): Reward | undefined {
        return this.rewards.find(reward => reward.key === key)
    }

    public merge(content: Reward | Reward[]) {
        const rewards = Array.isArray(content) ? content : [content]

        this.logRewards(rewards)

        rewards.forEach(reward => {
            if (reward.shelfLife === undefined || reward.shelfLife > 0) {
                const existingReward = this.rewards.find(existing => existing.key === reward.key)
                if (existingReward) {
                    this.mergeInto(existingReward, reward)
                } else {
                    this.rewards.push(reward)
                }
            } else {
                // collectibles with shelfLife <= 0 cannot be stored, they must be spent immediately
                // at this point conversion is the only available option
                this.convertToCoins(reward)
            }
        })
    }

    public updateAmount(rewardKey: string, operation: Operation, amount: number): boolean {
        const difference = operation * Math.max(0, amount)
        const existingReward = this.rewards.find(r => r.key === rewardKey)
        if (existingReward) {
            console.debug(`Updating amount of reward "${rewardKey}" by ${difference}`)
            existingReward.amount += difference
            return true
        }
        console.warn(`Updating amount of reward "${rewardKey}" by ${difference} failed. Reward not found.`)
        return false
    }

    private convertToCoins(reward: Reward) {
        if (!reward.value || reward.value <= 0) {
            return;
        }

        // reward has a value and can therefore be converted to coins
        const coins = Math.floor(reward.amount / reward.partsToAWhole) * reward.value
        const coinsReward = this.rewards.find(r => r.key === UNIQUE_REWARD_KEY_COINS)
        if (!coinsReward) {
            this.rewards.push(createUniqueRewardCoins(coins))
        } else {
            coinsReward.amount += coins
        }
    }

    private mergeInto(existingReward: Reward, addedReward: Reward) {
        existingReward.amount += addedReward.amount
        existingReward.icon = addedReward.icon
        existingReward.description = addedReward.description
        existingReward.rarity = addedReward.rarity
        existingReward.partsToAWhole = addedReward.partsToAWhole
        existingReward.sponsor = addedReward.sponsor
        existingReward.value = addedReward.value
        existingReward.shelfLife = addedReward.shelfLife
    }

    public getContent(): Reward[] {
        return this.rewards
    }

    private logRewards(rewards: Reward[]) {
        rewards.forEach(reward => { console.debug(`- ${JSON.stringify(reward)}`) })
    }

    toString(): string {
        return this.getContent().map(reward => `${reward.icon}(${reward.amount})`).join(', ')
    }
}

export const createUniqueRewardCoins = (coins: number)  => {
    return {
        type: RewardType.Unique,
        key: UNIQUE_REWARD_KEY_COINS,
        amount: coins,
        value: 1,
        rarity: Rarity.Common,
        icon: '🪙',
        partsToAWhole: 1,
        description: 'Hobby Investment Coin'
    }
}