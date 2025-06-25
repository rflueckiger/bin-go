import {css, html, LitElement, nothing} from 'lit'
import {customElement, property, query, state} from 'lit/decorators.js'
import {storage} from "../storage.ts";
import {Reward} from "../domain/reward.ts";
import {Operation, RewardCollection, UNIQUE_REWARD_KEY_COINS} from "../domain/reward-collection.ts";
import {RewardSorter} from "../domain/sorter/reward-sorter.ts";
import './bin-go-reward.ts'
import {SlDialog} from "@shoelace-style/shoelace";

export enum SpendAction {
    SpendForCoins,    // means lose a specific amount of that collectible and convert it to coins
    SpendForEffect    // means lose a specific amount of that collectible and use it in its intended way
                          // (which is usually outside the app, so it means just reducing the collectible's count)
}

@customElement('bin-go-inventory')
export class BinGoInventory extends LitElement {

    @property()
    private collection: RewardCollection

    @state()
    private selectedReward?: Reward

    @query('sl-dialog')
    dialog!: SlDialog

    private collectionChangeListener = () => {
        this.updateInventory()
    }

    private rewardSorter = new RewardSorter()

    constructor() {
        super();
        this.collection = storage.loadCollection()
    }

    connectedCallback() {
        super.connectedCallback();
        storage.addCollectionChangeListener(this.collectionChangeListener);
    }

    disconnectedCallback() {
        storage.removeCollectionChangeListener(this.collectionChangeListener)
        super.disconnectedCallback();
    }

    render() {
        if (this.collection.getContent().length <= 0) {
            return html`No rewards collected yet`
        } else {
            return html`
                <div class="reward-layout">
                    ${this.collection.getContent().sort(this.rewardSorter.rarityDesc).map(reward => html`<bin-go-reward .reward="${reward}" @click="${() => this.rewardSelected(reward)}"></bin-go-reward>`)}
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

        this.collection = storage.loadCollection()
        this.selectedReward = undefined;
        this.dialog.hide()
        this.requestUpdate()
    }

    private maxSpendAmount(reward?: Reward): number {
        if (!reward) {
            return 0
        }

        return Math.floor(reward.amount / reward.partsToAWhole);
    }

    private rewardSelected(reward: Reward) {
        this.selectedReward = reward;
        this.dialog.show()
    }

    private updateInventory() {
        this.collection = storage.loadCollection()
    }

    static styles = css`
        .reward-layout {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            grid-gap: 1rem;
        }
    `
}

declare global {
    interface HTMLElementTagNameMap {
        'bin-go-inventory': BinGoInventory
    }
}
