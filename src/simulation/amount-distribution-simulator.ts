import {LinearDecayAmountFunction} from "../domain/functions/linear-decay-amount-function.ts";
import {RewardSpec} from "../domain/config/reward-spec.ts";

type Stat =  { min: number, max: number, label: string, count: number, percentage: number }

export class AmountDistributionSimulator {
    public getAmountDistribution(rewardSpec: RewardSpec): Stat[] {
        const min = rewardSpec.min
        const max = rewardSpec.max
        const diff = rewardSpec.max - rewardSpec.min

        console.log(`Probability preview for '${rewardSpec.icon} (${rewardSpec.key})' [${min},${max}]:`)
        if (diff === 0) {
            console.log(`  ${min} - 100%`)
            return [{
                min,
                max,
                label: min.toString(),
                count: 1,
                percentage: 1
            }];
        }

        const amountFunction= new LinearDecayAmountFunction()

        const samples: number[] = []
        const sampleSize = 5000

        // create samples
        for (let i = 0; i < sampleSize; i++) {
            samples.push(amountFunction.getAmount(min, max))
        }

        // group samples
        const groupedSamples: Map<number, Stat> = new Map()
        samples.forEach(sample => {
            const stat = groupedSamples.get(sample)
            if (stat) {
                stat.count += 1
            } else {
                groupedSamples.set(sample, { min: sample, max: sample, label: sample.toString(), count: 1, percentage: 0 })
            }
        })

        // sort samples in ascending order by value
        const stats = Array
            .from(groupedSamples, ([value, stat]) => ({ value, stat }))
            .sort((a, b) => a.value - b.value)
            .map((sample) => sample.stat);

        const maxStats = 10
        let mergedStats: Stat[] = [...stats]
        while (mergedStats.length > maxStats) {
            const next: Stat[] = [];
            for (let i = 0; i < mergedStats.length; i += 2) {
                if (i + 1 < mergedStats.length) {
                    const min = mergedStats[i].min
                    const max = mergedStats[i + 1].max
                    next.push({
                        count: mergedStats[i].count + mergedStats[i + 1].count,
                        min,
                        max,
                        label: min === max ? min.toString() : `${min}-${max}`,
                        percentage: 0
                    });
                } else {
                    next.push(mergedStats[i]);
                }
            }
            mergedStats = next;
        }

        // calculate percentages
        mergedStats.forEach(stat => stat.percentage = stat.count / sampleSize)

        // print
        const maxWidth = mergedStats.reduce((a, b) => b.label.length > a ? b.label.length : a, 0)
        mergedStats.forEach(stat => {
            console.log(` ${stat.label.padStart(maxWidth)}: ${(stat.percentage * 100).toFixed(1).toString().padStart(4)}%`)
        })

        // TODO: instead of printing, show stats in table in overlay
        return mergedStats
    }
}