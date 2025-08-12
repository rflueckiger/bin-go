import {css, html, LitElement, nothing} from 'lit'
import {customElement, property, query, state} from 'lit/decorators.js'
import {Reward} from "../domain/reward.ts";
import {Operation, RewardCollection, UNIQUE_REWARD_KEY_COINS} from "../domain/reward-collection.ts";
import {RewardSorter} from "../domain/sorter/reward-sorter.ts";
import './bin-go-reward.ts'
import {SlDialog} from "@shoelace-style/shoelace";
import {ChangeRewardAmount} from "../domain/api/collection-service.ts";
import {APP_DATA} from "../service/app-data.ts";

export enum SpendAction {
    SpendForCoins,    // means lose a specific amount of that collectible and convert it to coins
    SpendForEffect    // means lose a specific amount of that collectible and use it in its intended way
                          // (which is usually outside the app, so it means just reducing the collectible's count)
}

@customElement('bin-go-inventory')
export class BinGoInventory extends LitElement {

    @property()
    public collection?: RewardCollection

    @state()
    private selectedReward?: Reward

    @state()
    private spendAmount = 0

    @state()
    private maxSpend = 0

    @state()
    private minSpend = 0

    @query('sl-dialog')
    dialog!: SlDialog

    private rewardSorter = new RewardSorter()

    render() {
        if (!this.collection || this.collection.getContent().length <= 0) {
            return html`Du hast noch keine Belohnungen erhalten`
        } else {
            return html`
                <div class="reward-layout">
                    ${this.collection.getContent().sort(this.rewardSorter.rarityDesc).map(reward => html`<bin-go-reward class="reward" .reward="${reward}" @click="${() => this.rewardSelected(reward)}"></bin-go-reward>`)}
                </div>
                <sl-dialog class="dialog" label="Belohnung">
                    <div class="container">
                        <bin-go-reward .reward="${this.selectedReward}"></bin-go-reward>
                        ${this.selectedReward?.sponsor ? html`<div class="sponsor">Sponsor: ${this.selectedReward?.sponsor}</div>` : nothing}
                        <div class="amount-wrapper">
                            <span class="label">Anzahl:</span>
                            <sl-input class="amount" type="number" min="${this.minSpend}" max="${this.maxSpend}" value="${this.spendAmount}" @sl-change=${(e: Event) => this.spendAmount = this.getNumberValue(e)}></sl-input>
                        </div>
                        <div class="action-wrapper">
                            <sl-button class="button" ?disabled="${this.maxSpend <= 0}" @click="${() => this.spendReward(this.selectedReward, SpendAction.SpendForEffect, this.spendAmount)}">${this.spendAmount} Einlösen</sl-button>
                            ${this.canSpendForCoins(this.selectedReward) ? html`
                                <sl-button class="button" ?disabled="${this.maxSpend <= 0}" @click="${() => this.spendReward(this.selectedReward, SpendAction.SpendForCoins, this.spendAmount)}">${this.spendAmount} Verkaufen für ${(this.selectedReward?.value || 0) * this.spendAmount} 🪙</sl-button>    
                        ` : nothing }
                        </div>
                        <sl-details class="more-options" summary="Weitere Optionen...">
                            <sl-button class="button" variant="danger" @click="${() => this.removeReward(this.selectedReward!.key)}">Belohnung entfernen!</sl-button>
                        </sl-details>
                    </div>
                </sl-dialog>
            `
        }
    }

    private removeReward(rewardKey: string) {
        APP_DATA.collectionService.purgeRewards([rewardKey]).then(collection => {
            this.collection = collection
            this.sendChangedEvent(collection)
        })
        this.dialog.hide()
    }

    private canSpendForCoins(reward?: Reward) {
        return reward?.key !== UNIQUE_REWARD_KEY_COINS && reward?.value && reward.value > 0
    }

    private getNumberValue(e: Event): number {
        const target = e.target as HTMLInputElement;
        return Number.parseInt(target.value)
    }

    private spendReward(reward: Reward | undefined, action: SpendAction, amount: number) {
        if (!reward || this.maxSpendAmount(reward) < amount) {
            return;
        }

        const changes: ChangeRewardAmount[] = []

        changes.push({
            rewardKey: reward.key,
            operation: Operation.Subtract,
            amount: reward.partsToAWhole * amount
        })

        if (action === SpendAction.SpendForCoins) {
            const value = reward.value || 0;
            const coins = value * amount;

            changes.push({
                rewardKey: UNIQUE_REWARD_KEY_COINS,
                operation: Operation.Add,
                amount: coins
            })
        }

        APP_DATA.collectionService.updateRewardAmount(changes)
            .then(collection => {
                this.collection = collection
                this.selectedReward = undefined;
                this.sendChangedEvent(collection)
            })

        this.dialog.hide()
    }

    private maxSpendAmount(reward?: Reward): number {
        if (!reward) {
            return 0
        }

        return Math.floor(reward.amount / reward.partsToAWhole);
    }

    private rewardSelected(reward: Reward) {
        this.selectedReward = reward;

        this.maxSpend = this.maxSpendAmount(this.selectedReward)
        this.minSpend = this.maxSpend > 0 ? 1 : 0
        this.spendAmount =  Math.min(this.maxSpend, 1)

        // make sure details part is always closed initially when opening the dialog
        const details = this.dialog?.querySelector('sl-details')
        if (details) {
            details.open = false
        }

        this.dialog.show()
    }

    private sendChangedEvent(collection: RewardCollection) {
        const event = new CustomEvent('changed', {
            detail: collection,
            bubbles: true,
            composed: true
        });

        this.dispatchEvent(event);
    }

    static styles = css`
        .reward-layout {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            grid-gap: 1rem;
        }
        
        .reward {
            cursor: pointer;
        }
        
        .container {
            display: flex;
            flex-direction: column;
        }
        
        .amount-wrapper {
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 1.5rem 0;
            gap: 0.5rem;
        }
        
        .action-wrapper {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
        }

        .more-options {
            margin-top: 1rem;
        }
        
        .more-options > .button {
            width: 100%;
        }
        
        .sponsor {
            text-align: center;
            font-size: 0.75rem;
        }
    `
}

declare global {
    interface HTMLElementTagNameMap {
        'bin-go-inventory': BinGoInventory
    }
}
