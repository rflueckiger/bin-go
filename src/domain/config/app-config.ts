import {Task} from "./task.ts";
import {RewardSpec} from "./reward-spec.ts";

export interface AppConfig {
    version: number;
    tasks: Task[];
    rewardSpecs: RewardSpec[];
}