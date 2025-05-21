import {Rarity} from "../storage.ts";

export interface Reward {
    type: string
    key: string
    label: string
    rarity: Rarity
    amount: number
    partsToAWhole: number
}