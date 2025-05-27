import {Rarity} from "../storage.ts";

export interface Reward {
    type: string
    key: string
    icon: string
    description?: string
    rarity: Rarity
    amount: number
    partsToAWhole: number
    owner?: string
}