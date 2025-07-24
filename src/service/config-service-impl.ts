import {AppConfig} from "../domain/config/app-config.ts";
import {ConfigService} from "../domain/api/config-service.ts";

export class ConfigServiceImpl implements ConfigService {

    private readonly store: LocalForage
    private readonly rootKey: string

    constructor(store: LocalForage, rootKey: string) {
        this.store = store
        this.rootKey = rootKey
    }

    async getConfig(): Promise<AppConfig | undefined> {
        try {
            const configRaw = await this.store.getItem(this.rootKey)
            if (configRaw && typeof configRaw === 'string') {
                return this.revive(configRaw)
            }

            // no config found, check for legacy config
            const legacyConfig = localStorage.getItem(this.rootKey)
            if (legacyConfig) {
                // legacy config found -> migrate it
                const configMigrated = await this.store.setItem(this.rootKey, legacyConfig)
                // delete legacy config
                localStorage.removeItem(this.rootKey)
                return this.revive(configMigrated)
            }

            return undefined
        } catch(reason) {
            console.error('Error while loading config.', reason)
            throw new Error('Error while loading config.')
        }
    }

    async save(config: AppConfig): Promise<void> {
        // await this.requestPersistentStorage() // TODO: <-- check if this works and/or is used properly
        await this.store.setItem(this.rootKey, this.serialize(config))

    }

    private revive(serialized: string): AppConfig {
        // currently no reviving necessary
        return JSON.parse(serialized)
    }

    private serialize(config: AppConfig): string {
        return JSON.stringify(config)
    }
}