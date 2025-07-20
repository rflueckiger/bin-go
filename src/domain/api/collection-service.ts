import {Operation, RewardCollection} from "../reward-collection.ts";
import {Reward} from "../reward.ts";
import {RewardSpec} from "../config/reward-spec.ts";

export interface ChangeRewardAmount {
    rewardKey: string,
    operation: Operation,
    amount: number
}

export interface CollectionService {

    /* Returns the rewards collection */
    getRewardCollection(): Promise<RewardCollection>

    /* Add the given rewards to the collection. Returns the updated collection. */
    addRewards(rewards: Reward[]): Promise<RewardCollection>

    /* Update certain (safely allowed) properties of matching rewards based on the given reward spec */
    updateReward(rewardSpec: RewardSpec): Promise<RewardCollection>

    /* Update the amount of the specified reward by the given amount */
    updateRewardAmount(changes: ChangeRewardAmount[]): Promise<RewardCollection>

}