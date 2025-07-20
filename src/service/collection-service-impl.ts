import {ChangeRewardAmount, CollectionService} from "../domain/api/collection-service.ts";
import {Reward} from "../domain/reward.ts";
import {RewardCollection} from "../domain/reward-collection.ts";
import localforage from "localforage";
import {RewardSpec} from "../domain/config/reward-spec.ts";

export class CollectionServiceImpl implements CollectionService {

    private static COLLECTION_STORE = 'collection'

    private lfInstance = localforage.createInstance({ name: "app-data" })

    async getRewardCollection(): Promise<RewardCollection> {
        try {
            const collectionRaw = await this.lfInstance.getItem(CollectionServiceImpl.COLLECTION_STORE)
            if (collectionRaw && typeof collectionRaw === 'string') {
                return this.revive(collectionRaw)
            }

            // no collection found, check for legacy collection
            const legacyCollection = localStorage.getItem(CollectionServiceImpl.COLLECTION_STORE)
            if (legacyCollection) {
                // legacy collection found -> migrate it
                const collectionMigrated = await this.lfInstance.setItem(CollectionServiceImpl.COLLECTION_STORE, legacyCollection)
                // delete legacy collection
                localStorage.removeItem(CollectionServiceImpl.COLLECTION_STORE)
                return this.revive(collectionMigrated)
            }

            // nothing to migrated -> create new collection
            const newCollection = new RewardCollection()
            await this.save(newCollection)
            return newCollection
        } catch(reason) {
            console.error('Error while loading collection.', reason)
            throw new Error('Error while loading collection.')
        }
    }

    private async save(collection: RewardCollection): Promise<void> {
        // await this.requestPersistentStorage() // TODO: <-- check if this works and/or is used properly
        await this.lfInstance.setItem(CollectionServiceImpl.COLLECTION_STORE, this.serialize(collection))
    }

    private revive(serialized: string): RewardCollection {
        const collectionData = JSON.parse(serialized)
        // revive
        return new RewardCollection(collectionData.rewards)
    }

    private serialize(collection: RewardCollection): string {
        return JSON.stringify({
            rewards: collection.getContent()
        })
    }

    async addRewards(rewards: Reward[]): Promise<RewardCollection> {
        const collection = await this.getRewardCollection()
        collection.merge(rewards)
        await this.save(collection)
        return collection
    }

    async updateReward(rewardSpec: RewardSpec): Promise<RewardCollection> {
        const collection = await this.getRewardCollection()
        const reward = collection.getContent().find(reward => reward.key === rewardSpec.key)
        if (reward) {
            reward.icon = rewardSpec.icon
            reward.description = rewardSpec.description
            reward.rarity = rewardSpec.rarity
            reward.partsToAWhole = rewardSpec.partsToAWhole
            reward.value = rewardSpec.value
            reward.sponsor = rewardSpec.sponsor

            await this.save(collection)
        }
        return collection
    }

    async updateRewardAmount(changes: ChangeRewardAmount[]): Promise<RewardCollection> {
        const collection = await this.getRewardCollection()
        let failed = false
        for (let i = 0; i < changes.length; i++) {
            const change = changes[i]
            const success = collection.updateAmount(change.rewardKey, change.operation, change.amount)
            if (!success) {
                failed = true
                break;
            }
        }

        if (!failed) {
            await this.save(collection)
            return collection
        }

        return await this.getRewardCollection()
    }

    // @ts-ignore
    private async requestPersistentStorage(): Promise<boolean> {
        if (navigator.storage && navigator.storage.persist) {
            const isPersisted = await navigator.storage.persisted();
            if (isPersisted) {
                console.log("Already using persistent storage.");
                return true;
            }

            const result = await navigator.storage.persist();
            if (result) {
                console.log("Persistent storage granted.");
            } else {
                console.warn("Persistent storage denied.");
            }
            return result;
        } else {
            console.warn("Persistent storage API not supported.");
            return false;
        }
    }
}