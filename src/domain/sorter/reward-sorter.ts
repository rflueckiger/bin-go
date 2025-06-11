import {Rarity, Reward} from "../reward.ts";

export class RewardSorter {

    public rarityDesc(r1: Reward, r2: Reward): number {
        const rarityDiff = RewardSorter.getRarityOrder(r1.rarity) - RewardSorter.getRarityOrder(r2.rarity)
        if (rarityDiff !== 0) {
            return rarityDiff
        }
        return r1.key.localeCompare(r2.key)
    }

    private static getRarityOrder(rarity: Rarity): number {
        switch (rarity) {
            case Rarity.Epic: return 0;
            case Rarity.Rare: return 1;
            case Rarity.Uncommon: return 2;
            case Rarity.Common: return 3;
            default: return 5;
        }
    }
}