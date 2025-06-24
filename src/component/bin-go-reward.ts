import {css, html, LitElement, nothing} from 'lit'
import {customElement, property} from 'lit/decorators.js'
import {Reward} from "../domain/reward.ts";

@customElement('bin-go-reward')
export class BinGoReward extends LitElement {

    @property()
    public reward?: Reward

    render() {
        // TODO: render remaining attributes directly or in tooltip: description, sponsor, etc.
        if (!this.reward) {
            return nothing;
        }

        const partsToAWhole = this.reward.partsToAWhole
        const amount = Math.floor(this.reward.amount / partsToAWhole)
        const parts = this.reward.amount % partsToAWhole

        return html`
            <div class="reward-container ${this.reward?.rarity || 'unknown'}">
                <div class="icon">${this.reward?.icon || '❔'}</div>
                <div class="details">
                    <div class="amount-container">
                        <span class="amount">${amount}</span>
                        <span class="parts">${partsToAWhole > 1 && parts > 0 ? ` ${parts}/${partsToAWhole}` : nothing}</span>
                    </div>
                    <div class="description">${this.reward.description}</div>
                </div>
            </div>`
    }

    static styles = css`
        .reward-container {
            display: flex;
            align-items: center;
            border-radius: 5px;
            cursor: pointer;
        }
        .details {
            margin: auto 5px;
            padding: 5px 0;
            overflow: hidden;
        }
        .icon {
            aspect-ratio: 1;
            background: white;
            width: 50px;
            min-width: 50px;
            border-radius: 5px;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 32px;
            margin: 5px;
        }
        .reward-container.epic {
            background: var(--app-color-epic);
        }
        .reward-container.rare {
            background: var(--app-color-rare);
        }
        .reward-container.uncommon {
            background: var(--app-color-uncommon);
        }
        .reward-container.common {
            background: var(--app-color-common);
        }
        .amount-container > .amount {
            font-weight: bold;
            font-size: 1.5rem;
            line-height: 1.5rem;
        }
        .amount-container > .parts {
            color: grey;
        }
        .description {
            font-size: 0.8rem;
            line-height: 0.8rem;
        }
    `
}

declare global {
    interface HTMLElementTagNameMap {
        'bin-go-reward': BinGoReward
    }
}
