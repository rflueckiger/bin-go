import ShortUniqueId from "short-unique-id";
import {Rarity} from "./reward.ts";
import {Task} from "./config/task.ts";
import {RewardSpec} from "./config/reward-spec.ts";
import {RewardSpecType} from "./config/reward-spec-type.ts";

export class TaskAndRewardFactory {

    private static readonly UID = new ShortUniqueId({ length: 6 });

    public newTask(): Task {
        return {
            key: `${TaskAndRewardFactory.UID.rnd()}`,
            icon: '🤷'
        }
    }

    public newCollectibleSpec(): RewardSpec {
        return {
            type: RewardSpecType.Collectible,
            key: `${TaskAndRewardFactory.UID.rnd()}`,
            icon: '🧩',
            min: 1,
            max: 1,
            partsToAWhole: 1,
            rarity: Rarity.Common
        }
    }

    public newCoinsSpec(): RewardSpec {
        return {
            type: RewardSpecType.Coins,
            key: `${TaskAndRewardFactory.UID.rnd()}`,
            icon: '🪙',
            min: 1,
            max: 8,
            partsToAWhole: 1,
            rarity: Rarity.Common,
            shelfLife: 0,
            value: 1
        }
    }

}