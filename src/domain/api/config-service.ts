import {AppConfig} from "../config/app-config.ts";

export interface ConfigService {

    /* Returns the config */
    getConfig(): Promise<AppConfig | undefined>

    /* Save the config */
    save(config: AppConfig): Promise<void>

}