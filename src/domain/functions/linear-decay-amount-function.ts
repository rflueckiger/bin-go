import {AmountFunction} from "./amount-function.ts";

export class LinearDecayAmountFunction implements AmountFunction {
    public getAmount(min: number, max: number): number {
        const size = (max - min) + 1; // e.g. 10 - 1 + 1 = 10 -- the number of valid values in the range

        // calculate weights
        const weights = Array.from({ length: size }, (_, i) => {
            const x = i + 1
            const averageWeightPerValue = 1 / size
            return (((size + 1) - x) / (size + 1)) * 2 * averageWeightPerValue
        })

        const rnd = Math.random()

        let i = 0
        let accumulatedWeight = weights[i]
        while (i < weights.length && rnd > accumulatedWeight) {
            i += 1
            accumulatedWeight += weights[i]
        }

        // to get from i to value: i + min
        return i + min;
    }
}