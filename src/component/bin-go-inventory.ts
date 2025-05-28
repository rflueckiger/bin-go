import {css, html, LitElement} from 'lit'
import {customElement, property, state, query} from 'lit/decorators.js'
import {Inventory, Rarity, storage} from "../storage.ts";
import {Reward} from "../domain/reward.ts";

@customElement('bin-go-inventory')
export class BinGoInventory extends LitElement {

    @property()
    private inventory: Inventory

    private updateListener = () => {
        this.updateInventory()
    }

    constructor() {
        super();
        this.inventory = storage.getInventory()
    }

    connectedCallback() {
        super.connectedCallback();
        storage.addInventoryListener(this.updateListener);
    }

    disconnectedCallback() {
        storage.removeInventoryListener(this.updateListener)
        super.disconnectedCallback();
    }

    @state()
    private selectedReward?: Reward

    @query('sl-dialog')
    dialog!: HTMLElement

    render() {
        if (this.inventory.items.length === 0 && this.inventory.coins <= 0) {
            return html`No rewards collected yet`
        } else {
            return html`
                <div class="items-layout">
                    ${this.renderCoins(this.inventory.coins)}
                    ${this.inventory.items.sort(this.rewardSorter).map(reward => this.renderItem(reward))}
                </div>
                <sl-dialog class="dialog" no-header>
                    <div class="dialog-title">${this.selectedReward?.icon}</div>
                    <div class="dialog-text amount">${this.selectedReward?.amount} / ${this.selectedReward?.partsToAWhole}</div>
                    <button ?disabled="${this.maxSpendAmount(this.selectedReward) <= 0}" @click="${() => this.redeemReward(this.selectedReward, 1)}">1 Einlösen</button>
                </sl-dialog>
            `
        }
    }

    private redeemReward(reward: Reward | undefined, amount: number) {
        if (!reward || this.maxSpendAmount(reward) < amount) {
            return;
        }

        reward.amount = reward.amount -= reward.partsToAWhole * amount;
        storage.updateRewardAmount(reward.key, reward.amount)
        this.inventory = storage.getInventory()
        this.requestUpdate()
    }

    private maxSpendAmount(reward?: Reward): number {
        if (!reward) {
            return 0
        }

        return Math.floor(reward.amount / reward.partsToAWhole);
    }

    private rewardSorter(r1: Reward, r2: Reward) {
        const rarityDiff = BinGoInventory.getRarityOrder(r1.rarity) - BinGoInventory.getRarityOrder(r2.rarity)
        if (rarityDiff !== 0) {
            return rarityDiff
        }
        return r1.key.localeCompare(r2.key)
    }

    private static getRarityOrder(rarity: Rarity): number {
        switch (rarity) {
            case Rarity.Epic: return 0;
            case Rarity.Rare: return 1;
            case Rarity.Uncommon: return 2;
            case Rarity.Common: return 3;
            default: return 5;
        }
    }

    private renderCoins(amount: number) {
        return html`<div class="item-container ${Rarity.Common}">
            <div class="icon">🪙</div>
            <div class="amount-container">
                <span class="amount">${amount}</span>
            </div>
        </div>`
    }

    private renderItem(reward: Reward) {
        // TODO: add description
        // TODO: add owner if applicable
        return html`
            <div class="item-container ${reward.rarity}" @click="${() => this.rewardSelected(reward)}">
                <div class="icon">${reward.icon}</div>
                ${reward.partsToAWhole === 1 ?
                        html`
                            <div class="amount-container">
                                <span class="amount">${reward.amount}</span></div>` :
                        html`
                            <div class="amount-container">
                                <span class="amount">${reward.amount}</span>/<span
                                    class="partsToAWhole">${reward.partsToAWhole}</span></div>`}
            </div>`
    }

    private rewardSelected(reward: Reward) {
        this.selectedReward = reward;
        (this.dialog as any).show()
    }

    private updateInventory() {
        console.log("Update Inventory")
        this.inventory = storage.getInventory()
    }

    static styles = css`
        :host {
            .items-layout {
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
                grid-gap: 1rem;
            }
            .item-container {
                display: flex;
                gap: 1rem;
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
            .item-container.epic {
                background: var(--app-color-epic);
            }
            .item-container.rare {
                background: var(--app-color-rare);
            }
            .item-container.uncommon {
                background: var(--app-color-uncommon);
            }
            .item-container.common {
                background: var(--app-color-common);
            }
        }
    `
}

declare global {
    interface HTMLElementTagNameMap {
        'bin-go-inventory': BinGoInventory
    }
}
