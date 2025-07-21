import localforage from "localforage";
import {CollectionServiceImpl} from "./collection-service-impl.ts";
import {CollectionService} from "../domain/api/collection-service.ts";
import {ConfigService} from "../domain/api/config-service.ts";
import {ConfigServiceImpl} from "./config-service-impl.ts";

export class AppData {

    private static COLLECTION_STORE = 'collection'
    private static CONFIG_STORE = 'config'

    private lfInstance = localforage.createInstance({ name: "app-data" })

    public collectionService: CollectionService
    public configService: ConfigService

    constructor() {
        this.collectionService = new CollectionServiceImpl(this.lfInstance, AppData.COLLECTION_STORE)
        this.configService = new ConfigServiceImpl(this.lfInstance, AppData.CONFIG_STORE)
    }
}

export const APP_DATA = new AppData()
