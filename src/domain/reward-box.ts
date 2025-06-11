import {Rarity, Reward} from "./reward.ts";

export enum RewardBoxQuality {
    normal,
    superior
}

export class RewardBox {
    private readonly rewards: Reward[];

    public constructor(rewards: Reward[]) {
        this.rewards = rewards;
    }

    public getContent(): Reward[] {
        return this.rewards
    }

    public getQuality(): RewardBoxQuality {
        if (this.rewards.length > 2 || this.rewards.filter(r => r.rarity === Rarity.Epic || r.rarity === Rarity.Rare).length > 0) {
            return RewardBoxQuality.superior
        }
        return RewardBoxQuality.normal
    }

    toString(): string {
        return `${this.getQuality() === RewardBoxQuality.superior ? '[+]' : '[ ]'} ${this.getContent().map(reward => `${reward.icon}(${reward.amount})`).join(', ')}`
    }
}