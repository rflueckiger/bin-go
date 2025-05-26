import {css, html, LitElement} from 'lit'
import {customElement, property} from 'lit/decorators.js'
import {Inventory, Rarity, storage} from "../storage.ts";

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

    render() {
        if (this.inventory.items.length === 0 && this.inventory.coins <= 0) {
            return html`No rewards collected yet`
        } else {
            return html`
                <div class="items-layout">
                    ${this.renderItem(Rarity.Common, '🪙', this.inventory.coins, 1)}
                    ${this.inventory.items.map(reward => this.renderItem(reward.rarity, reward.label, reward.amount, reward.partsToAWhole))}
                </div>
            `
        }
    }

    private renderItem(rarity: Rarity, icon: string, amount: number, partsToAWhole: number) {
        return html`<div class="item-container ${rarity}">
            <div class="icon">${icon}</div>
            ${partsToAWhole === 1 ?
            html`<div class="amount-container">
                        <span class="amount">${amount}</span></div>` :
            html`<div class="amount-container">
                        <span class="amount">${amount}</span>/<span class="partsToAWhole">${partsToAWhole}</span></div>` }
        </div>`
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
