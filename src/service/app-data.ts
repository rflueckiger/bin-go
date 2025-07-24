import localforage from "localforage";
import {CollectionServiceImpl} from "./collection-service-impl.ts";
import {CollectionService} from "../domain/api/collection-service.ts";
import {ConfigService} from "../domain/api/config-service.ts";
import {ConfigServiceImpl} from "./config-service-impl.ts";
import {StateService} from "../domain/api/state-service.ts";
import {StateServiceImpl} from "./state-service-impl.ts";

export class AppData {

    private static COLLECTION_STORE = 'collection'
    private static CONFIG_STORE = 'config'
    private static STATE_STORE = 'state'

    private lfInstance = localforage.createInstance({ name: "app-data" })

    public collectionService: CollectionService
    public configService: ConfigService
    public stateService: StateService

    constructor() {
        this.collectionService = new CollectionServiceImpl(this.lfInstance, AppData.COLLECTION_STORE)
        this.configService = new ConfigServiceImpl(this.lfInstance, AppData.CONFIG_STORE)
        this.stateService = new StateServiceImpl(this.lfInstance, AppData.STATE_STORE)
    }
}

export const APP_DATA = new AppData()
