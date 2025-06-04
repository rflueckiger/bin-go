import {AmountFunction} from "./amount-function.ts";

export class UniformAmountFunction implements AmountFunction {
    public getAmount(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min
    }
}