import {RewardSpec} from "../storage.ts";
import {RewardBoxGenerator} from "../domain/reward-box-generator.ts";
import {RewardBox, RewardBoxQuality} from "../domain/reward-box.ts";
import {RewardCollection} from "../domain/reward-collection.ts";

type SampleGroup = { picks: number, collection: RewardCollection };

export type RewardSimulationResult = {
    sampleCount: number,
    seriesCount: number,
    seriesSize: number,
    result: {
        picks: number,
        collection: RewardCollection
    }[]
}

export class RewardSimulation {

    public async generatePreview(rewardSpecs: RewardSpec[]): Promise<RewardSimulationResult> {
        return new Promise<RewardSimulationResult>((resolve, reject) => {
            setTimeout(() => {
                try {
                    const preview = this.generatePreviewSync(rewardSpecs)
                    resolve(preview)
                } catch(e) {
                    reject(e)
                }
            }, 50);
        });
    }

    private generatePreviewSync(rewardSpecs: RewardSpec[]): RewardSimulationResult {
        const rewardBoxGenerator = new RewardBoxGenerator(rewardSpecs)
        // produce a reward set of 6 (1 week) and choose 1, 2, 3, 4, 5. 6 rewards at random (keep collections separate)
        // pick at least 1 high reward spot if possible
        // do this 52 times -> this is one series
        // do this n times (e.g. 100 times) and take the average of all n samples
        // show the occurrences for all collectibles in total and per week for the different groups

        const sampleCount = 100
        const seriesCount = 6
        const seriesSize = 52

        const data: SampleGroup[][] = []
        for (let i = 0; i < sampleCount; i++) {
            const sampleGroups = this.generateRewardSamples(rewardBoxGenerator, seriesCount, seriesSize)
            data.push(sampleGroups)
        }

        // calculating averages
        const result: SampleGroup[] = []
        for (let series = 0; series < seriesCount; series++) {
            const sampleGroup = {
                picks: series + 1,
                collection: new RewardCollection()
            }
            data.map(d => d[series]).forEach(group => sampleGroup.collection.merge(group.collection.getContent()))
            sampleGroup.collection.getContent().forEach(reward => reward.amount = reward.amount / sampleCount)
            result.push(sampleGroup)
        }

        return {
            sampleCount,
            seriesCount,
            seriesSize,
            result
        }
    }

    private generateRewardSamples(rewardBoxGenerator: RewardBoxGenerator, rewardBoxCount: number, sampleCount: number): SampleGroup[] {
        const sampleGroups: SampleGroup[] = Array.from(
            { length: rewardBoxCount },
            (_, i) => ({ picks: i + 1, collection: new RewardCollection()}))

        for (let i = 0; i < sampleCount; i++) {
            this.generateRewardsForSample(rewardBoxGenerator, sampleGroups)
        }
        return sampleGroups
    }

    private generateRewardsForSample(rewardBoxGenerator: RewardBoxGenerator, sampleGroups: SampleGroup[]) {
        const week: RewardBox[] = Array.from({ length: sampleGroups.length }, (_, _i) => rewardBoxGenerator.generate())

        // if there is a superior loot box, put 1 of them in first position, let the rest in quasi-shuffled state
        const i = week.findIndex(box => box.getQuality() === RewardBoxQuality.superior)
        if (i >= 0) {
            const removed = week.splice(i, 1)
            week.unshift(removed[0])
        }

        // week.forEach((box, i) => console.log(`${i + 1}: ${box.toString()}`))

        sampleGroups.forEach((sampleGroup, i) => {
            const rewards = week.slice(0, i + 1).map(box => box.getContent()).flat().map(reward => structuredClone(reward))
            sampleGroup.collection.merge(rewards)
            // console.log(sampleGroup.collection.toString())
        })
    }

}