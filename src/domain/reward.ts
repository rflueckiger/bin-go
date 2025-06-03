export enum Rarity {
    Common = 'common',
    Uncommon = 'uncommon',
    Rare = 'rare',
    Epic = 'epic'
}

export enum RewardType {
    Collectible = 'collectible',
    Unique = 'unique',
}

export interface Reward {
    type: RewardType
    key: string
    icon: string
    description?: string
    rarity: Rarity
    amount: number
    partsToAWhole: number
    owner?: string
    value?: number
    shelfLife?: number
}