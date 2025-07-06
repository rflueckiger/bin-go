import {RewardSpec, rewardSpecValidator} from "../config/reward-spec.ts";

export class SponsoredCollectibleCode {

    private readonly code: string
    private readonly rewardSpec: RewardSpec

    constructor(code: string) {
        this.code = code

        const serialized = SponsoredCollectibleCode.decodeBase64Unicode(code)
        this.rewardSpec = JSON.parse(serialized)

        const valid = rewardSpecValidator(this.rewardSpec)
        if (!valid) {
            throw new Error("Invalid Reward Spec")
        }
    }

    public static fromRewardSpec(rewardSpec: RewardSpec): SponsoredCollectibleCode {
        const json = JSON.stringify(rewardSpec)
        const code = SponsoredCollectibleCode.encodeBase64Unicode(json)
        return new SponsoredCollectibleCode(code)
    }

    public asString(): string {
        return this.code
    }

    public asRewardSpec(): RewardSpec {
        return this.rewardSpec
    }

    // Encode Unicode string to Base64
    private static encodeBase64Unicode(str: string): string {
        return btoa(
            encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1: string) =>
                String.fromCharCode(parseInt(p1, 16))
            )
        )
    }

    // Decode Base64 to Unicode string
    private static decodeBase64Unicode(base64: string): string {
        return decodeURIComponent(
            atob(base64)
                .split('')
                .map((c: string) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
                .join('')
        )
    }
}