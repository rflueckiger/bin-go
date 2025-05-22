import {css, html, LitElement} from 'lit'
import {customElement} from 'lit/decorators.js'
import {Inventory, Rarity, Storage} from "../storage.ts";

@customElement('bin-go-inventory')
export class BinGoInventory extends LitElement {

    private readonly storage = new Storage()

    private inventory: Inventory

    private updateListener = () => {
        this.updateInventory()
    }

    constructor() {
        super();
        this.inventory = this.storage.getInventory()
    }

    connectedCallback() {
        super.connectedCallback();
        this.storage.addInventoryListener(this.updateListener);
    }

    disconnectedCallback() {
        this.storage.removeInventoryListener(this.updateListener)
        super.disconnectedCallback();
    }

    render() {
        if (this.inventory.items.length === 0 && this.inventory.coins <= 0) {
            return html`No rewards collected yet`
        } else {
            return html`
                <div>
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
                        <span class="amount">${amount}</span>
                        <span class="partsToAWhole">${partsToAWhole}</span></div>` }
        </div>`
    }

    private updateInventory() {
        console.log("Update Inventory")
        this.inventory = this.storage.getInventory()
    }

    static styles = css`
        :host {
            
        }
    `
}

declare global {
    interface HTMLElementTagNameMap {
        'bin-go-inventory': BinGoInventory
    }
}
