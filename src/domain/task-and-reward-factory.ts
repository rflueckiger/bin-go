import {Rarity, RewardSpec, Task} from "../storage.ts";
import ShortUniqueId from "short-unique-id";

export class TaskAndRewardFactory {

    private static readonly UID = new ShortUniqueId({ length: 6 });

    public newTask(): Task {
        return {
            key: `${TaskAndRewardFactory.UID.rnd()}`,
            icon: '🤷'
        }
    }

    public newItemSpec(): RewardSpec {
        return {
            type: 'item',
            key: `${TaskAndRewardFactory.UID.rnd()}`,
            icon: '🎁',
            min: 1,
            max: 1,
            partsToAWhole: 1,
            rarity: Rarity.Common
        }
    }

    public newCoinsSpec(): RewardSpec {
        return {
            type: 'coins',
            key: `${TaskAndRewardFactory.UID.rnd()}`,
            icon: '🪙',
            min: 1,
            max: 8,
            partsToAWhole: 1,
            rarity: Rarity.Common
        }
    }

}