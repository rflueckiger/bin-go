import {css, html, LitElement} from 'lit'
import {customElement, property} from 'lit/decorators.js'
import {Reward} from "../domain/reward.ts";

@customElement('bin-go-reward')
export class BinGoReward extends LitElement {

    @property()
    public reward?: Reward

    render() {
        // TODO: render remaining attributes directly or in tooltip: description, sponsor, etc.

        return html`
            <div class="reward-container ${this.reward?.rarity || 'unknown'}">
                <div class="icon">${this.reward?.icon || '❔'}</div>
                ${this.reward?.partsToAWhole === 1 ?
                    html`
                        <div class="amount-container">
                            <span class="amount">${this.reward?.amount || 0}</span>
                        </div>` :
                    html`
                        <div class="amount-container">
                            <span class="amount">${this.reward?.amount || 0}</span>/
                            <span class="partsToAWhole">${this.reward?.partsToAWhole || 0}</span>
                        </div>`}
            </div>`
    }

    static styles = css`
        :host {
            .reward-container {
                display: flex;
                gap: 7px;
                align-items: center;
                border-radius: 5px;
                cursor: pointer;
            }
            .icon {
                aspect-ratio: 1;
                background: white;
                width: 50px;
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
        }
    `
}

declare global {
    interface HTMLElementTagNameMap {
        'bin-go-reward': BinGoReward
    }
}
