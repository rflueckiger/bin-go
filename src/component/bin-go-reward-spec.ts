import {css, html, LitElement, nothing} from 'lit'
import {customElement, property} from 'lit/decorators.js'
import {RewardSpec} from "../domain/config/reward-spec.ts";
import {RewardSpecType} from "../domain/config/reward-spec-type.ts";

@customElement('bin-go-reward-spec')
export class BinGoRewardSpec extends LitElement {

    @property()
    public rewardSpec?: RewardSpec;

    @property({ type: Boolean })
    public inCollection = false

    render() {
        switch (this.rewardSpec?.type) {
            case RewardSpecType.Collectible: return this.handleRewardTypeCollectible(this.rewardSpec)
            case RewardSpecType.Coins: return this.handleRewardTypeCoins(this.rewardSpec)
            case RewardSpecType.SponsoredCollectible: return this.handleRewardTypeSponsoredCollectible(this.rewardSpec)
            default: throw Error('Unknown reward type')
        }
    }

    private handleRewardTypeCollectible(rewardSpec: RewardSpec) {
        return html`
            <div class="container ${rewardSpec.rarity}">
                <div>
                    <span>${rewardSpec.icon}</span>
                    <span>${this.renderAmountRange(rewardSpec.min, rewardSpec.max)}</span>
                    ${rewardSpec.partsToAWhole !== 1 ? html`<span>Collect: ${rewardSpec.partsToAWhole}</span>` : nothing}
                </div>
            </div>
        `
    }

    private handleRewardTypeCoins(rewardSpec: RewardSpec) {
        return html`
            <div class="container ${rewardSpec.rarity}">
                <div>
                    <span>${rewardSpec.icon}</span>
                    <span>${this.renderAmountRange(rewardSpec.min, rewardSpec.max)}</span>
                </div>
            </div>
        `
    }

    private handleRewardTypeSponsoredCollectible(rewardSpec: RewardSpec) {
        return html`
            <div class="container ${rewardSpec.rarity}">
                <div>
                    <span>${this.inCollection ? html`${rewardSpec.icon}` : html`🎁`}</span>
                    <span>Sponsor: ${this.rewardSpec?.sponsor}</span>
                </div>
            </div>
        `
    }

    private renderAmountRange(min: number, max: number) {
        if (min === max) {
            if (min === 1) {
                return nothing
            }
            return html`<span>(${min})</span>`
        }
        return html`<span>(${min}-${max})</span>`
    }

    static styles = css`
        .container {
            display: flex;
            gap: 10px;
            padding: 3px 8px;
            border-radius: 4px;
        }
        .container.common { background: var(--app-color-common); }
        .container.uncommon { background: var(--app-color-uncommon); }
        .container.rare { background: var(--app-color-rare); }
        .container.epic { background: var(--app-color-epic); }
    `
}

declare global {
    interface HTMLElementTagNameMap {
        'bin-go-reward-spec': BinGoRewardSpec
    }
}
