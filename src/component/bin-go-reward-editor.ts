import {LitElement, css, html, nothing} from 'lit'
import {customElement, property} from 'lit/decorators.js'
import {BinGoReward, Rarity} from "../storage.ts";

@customElement('bin-go-reward-editor')
export class BinGoRewardEditor extends LitElement {

    @property()
    public reward?: BinGoReward;

    @property()
    public editing = false;

    render() {
        switch (this.reward?.type) {
            case 'item': return this.handleRewardTypeItem(this.reward)
            case 'coins': return this.handleRewardTypeCoins(this.reward)
            default: throw Error('Unknown reward type')
        }
    }

    private handleRewardTypeItem(reward: BinGoReward) {
        if (this.editing) {
            return html`
                <div class="container">
                    <div class="fields-editable">
                        <input class="reward-name" .value=${reward.label} @input=${this.updateStringInputHandler(reward, 'label')}/>
                        <select class="reward-rarity" .value="${reward.rarity}" @input="${this.updateStringInputHandler(reward, 'rarity')}">
                            ${Object.keys(Rarity).map(key => {
                                const value = Rarity[key as keyof typeof Rarity];
                                return html`<option value="${value}" ?selected="${value === reward.rarity}">${key}</option>`  
                            })}
                        </select>
                        <input class="reward-min field-number" .value=${reward.min} @input=${this.updateNumberInputHandler(reward, 'min')}/>
                        <input class="reward-max field-number" .value=${reward.max} @input=${this.updateNumberInputHandler(reward, 'max')}/>
                        <input class="reward-partsToAWhole field-number" .value=${reward.partsToAWhole} @input=${this.updateNumberInputHandler(reward, 'partsToAWhole')}/>    
                    </div>
                    <div class="actions">
                        <a href="#" @click="${this.done}">Done</a>
                    </div>
                </div>
            `;
        }
        return html`
            <div class="container ${reward.rarity}">
                <div class="fields-readonly">
                    <span>${reward.type.toUpperCase()}</span>
                    <span>${reward.label}</span>
                    <span>${this.renderAmountRange(reward.min, reward.max)}</span>
                    <span>${reward.partsToAWhole !== 1 ? html`<span>Collect: ${reward.partsToAWhole}</span>` : nothing}</span>
                </div>
            </div>
        `
    }

    private handleRewardTypeCoins(reward: BinGoReward) {
        if (this.editing) {
            return html`
                <div class="container">
                    <div class="fields-editable">
                        <input class="reward-min field-number" .value=${reward.min} @input=${this.updateNumberInputHandler(reward, 'min')}/>
                        <input class="reward-max field-number" .value=${reward.max} @input=${this.updateNumberInputHandler(reward, 'max')}/>
                    </div>
                    <div class="actions">
                        <a href="#" @click="${this.done}">Done</a>
                    </div>
                </div>
            `;
        }
        return html`
            <div class="container ${reward.rarity}">
                <div class="fields-readonly">
                    <span>${reward.type.toUpperCase()}</span>
                    <span>${this.renderAmountRange(reward.min, reward.max)}</span>
                </div>
            </div>
        `
    }

    private done() {
        this.editing = false;

        const event = new CustomEvent('done', {
            detail: 'done',
            bubbles: true,
            composed: true
        });

        this.dispatchEvent(event);
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

    private updateStringInputHandler(object: any, property: string): ((event: Event) => void) {
        return (event: Event) => {
            const target = event.target as HTMLInputElement
            object[property] = target.value
            this.requestUpdate()
        }
    }

    private updateNumberInputHandler(object: any, property: string): ((event: Event) => void) {
        return (event: Event) => {
            const target = event.target as HTMLInputElement
            object[property] = Number(target.value)
            this.requestUpdate()
        }
    }

    static styles = css`
        :host {
            :host {

            }
            .container {
                display: flex;
                gap: 10px;
                padding: 3px 8px;
                border-radius: 4px;
            }
            .container.common { background: #d5d5d5; }
            .container.uncommon { background: #9ed591; }
            .container.rare { background: #a9d1f4; }
            .container.epic { background: #d4b3de; }
            .fields-editable {
                display: flex;
                gap: 5px;
            }
            .field-number {
                width: 25px;
                text-align: center;
            }
        }
    `
}

declare global {
    interface HTMLElementTagNameMap {
        'bin-go-reward-editor': BinGoRewardEditor
    }
}
