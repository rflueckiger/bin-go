import {Rarity} from "../reward.ts";

export const chances: { [key in Rarity]: number } = {
    [Rarity.Epic]: 5,
    [Rarity.Rare]: 50,
    [Rarity.Uncommon]: 200,
    [Rarity.Common]: 350
}
