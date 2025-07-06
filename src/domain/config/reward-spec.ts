import {Rarity} from "../reward.ts";
import {RewardSpecType} from "./reward-spec-type.ts";
import {EmojiUtil} from "../util/emoji-util.ts";

export interface RewardSpec {
    type: RewardSpecType;   // i.e. 'collectible', 'coins' -- identifies the reward archetype, i.e. for editor selection
    key: string;        // the identifier of the reward, same key means the rewards can be combined, i.e. the name of a reward like "cake"
    description?: string;   // the label of this reward, displayed to the user instead of the technical key
    partsToAWhole: number;  // whether multiple of these must be collected to generate a whole
    min: number;        // the min amount gained per reward
    max: number;        // the max amount gained per reward (the actual value will be random)
    rarity: Rarity;     // the rarity of the reward
    icon: string;       // emoji to represent the reward, support 1 character
    sponsor?: string;   // marks that this reward is gifted by someone else and can't be edited
    value?: number;     // the value in coins of 1 (whole) reward
    shelfLife?: number; // undefined = does never expire, 0 = expires when collected (gets converted into coins)
                        // TODO: shelf life unit of actual values not yet defined and not yet supported
}

export const rewardSpecValidator = function(rewardSpec: RewardSpec): boolean {
    if (!rewardSpec.type || !Object.values(RewardSpecType).includes(rewardSpec.type)) return false;
    else if (!rewardSpec.key) return false;
    else if (!rewardSpec.partsToAWhole || !Number.isInteger(rewardSpec.partsToAWhole) || rewardSpec.partsToAWhole < 1) return false;
    else if (!rewardSpec.min || !Number.isInteger(rewardSpec.min) || rewardSpec.min < 1) return false;
    else if (!rewardSpec.max || !Number.isInteger(rewardSpec.max) || rewardSpec.max < 1) return false;
    else if (rewardSpec.min > rewardSpec.max) return false;
    else if (!rewardSpec.rarity || !Object.values(Rarity).includes(rewardSpec.rarity)) return false;
    // TODO: also check that only emojis are present in the string!
    else if (!rewardSpec.icon || EmojiUtil.countEmojis(rewardSpec.icon) !== 1) return false;
    else if (rewardSpec.value && (!Number.isInteger(rewardSpec.value) || rewardSpec.value < 0)) return false;
    else if (rewardSpec.shelfLife && rewardSpec.shelfLife !== 0) return false;
    else return true
}