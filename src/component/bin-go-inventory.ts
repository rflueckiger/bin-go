import {css, html, LitElement, nothing} from 'lit'
import {customElement, property, query, state} from 'lit/decorators.js'
import {Inventory, Operation, storage, UNIQUE_REWARD_KEY_COINS} from "../storage.ts";
import {Rarity, Reward} from "../domain/reward.ts";

export enum SpendAction {
    SpendForCoins,    // means lose a specific amount of that collectible and convert it to coins
    SpendForEffect    // means lose a specific amount of that collectible and use it in its intended way
                          // (which is usually outside the app, so it means just reducing the collectible's count)
}

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
        if (this.inventory.rewards.length <= 0) {
            return html`No rewards collected yet`
        } else {
            return html`
                <div class="reward-layout">
                    ${this.inventory.rewards.sort(this.rewardSorter).map(reward => this.renderReward(reward))}
                </div>
                <sl-dialog class="dialog" no-header>
                    <div class="dialog-title">${this.selectedReward?.icon}</div>
                    <div class="dialog-text amount">${this.selectedReward?.amount} / ${this.selectedReward?.partsToAWhole}</div>
                    <button ?disabled="${this.maxSpendAmount(this.selectedReward) <= 0}" @click="${() => this.spendReward(this.selectedReward, SpendAction.SpendForEffect, 1)}">1 Einlösen</button>
                    ${this.selectedReward?.key !== UNIQUE_REWARD_KEY_COINS ? html`<button ?disabled="${this.maxSpendAmount(this.selectedReward) <= 0}" @click="${() => this.spendReward(this.selectedReward, SpendAction.SpendForCoins, 1)}">1 Verkaufen</button>` : nothing}
                </sl-dialog>
            `
        }
    }

    private spendReward(reward: Reward | undefined, action: SpendAction, amount: number) {
        if (!reward || this.maxSpendAmount(reward) < amount) {
            return;
        }

        const parts = reward.partsToAWhole * amount
        storage.changeAmount(reward.key, Operation.Subtract, parts)

        if (action === SpendAction.SpendForCoins) {
            const value = reward.value || 0;
            const coins = value * amount;
            storage.changeAmount(UNIQUE_REWARD_KEY_COINS, Operation.Add, coins)
        }

        this.inventory = storage.getInventory()
        this.selectedReward = undefined;
        (this.dialog as any).hide()
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

    private renderReward(reward: Reward) {
        // TODO: add description
        // TODO: add owner if applicable
        return html`
            <div class="reward-container ${reward.rarity}" @click="${() => this.rewardSelected(reward)}">
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
            .reward-layout {
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
                grid-gap: 1rem;
            }
            .reward-container {
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
        'bin-go-inventory': BinGoInventory
    }
}
