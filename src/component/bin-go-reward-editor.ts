import {LitElement, css, html, nothing} from 'lit'
import {customElement, property} from 'lit/decorators.js'
import {RewardSpec, Rarity} from "../storage.ts";

@customElement('bin-go-reward-editor')
export class BinGoRewardEditor extends LitElement {

    @property()
    public rewardSpec?: RewardSpec;

    @property()
    public editing = false;

    render() {
        switch (this.rewardSpec?.type) {
            case 'item': return this.handleRewardTypeItem(this.rewardSpec)
            case 'coins': return this.handleRewardTypeCoins(this.rewardSpec)
            default: throw Error('Unknown reward type')
        }
    }

    private handleRewardTypeItem(rewardSpec: RewardSpec) {
        if (this.editing) {
            return html`
                <div class="container">
                    <div class="fields-editable">
                        <input class="reward-icon" .value=${rewardSpec.icon} @input=${this.updateStringInputHandler(rewardSpec, 'icon')}/>
                        <input class="reward-description" .value=${rewardSpec.description || ''} @input=${this.updateStringInputHandler(rewardSpec, 'description')}/>
                        <select class="reward-rarity" .value="${rewardSpec.rarity}" @input="${this.updateStringInputHandler(rewardSpec, 'rarity')}">
                            ${Object.keys(Rarity).map(key => {
                                const value = Rarity[key as keyof typeof Rarity];
                                return html`<option value="${value}" ?selected="${value === rewardSpec.rarity}">${key}</option>`  
                            })}
                        </select>
                        <input class="reward-min field-number" .value=${rewardSpec.min} @input=${this.updateNumberInputHandler(rewardSpec, 'min')}/>
                        <input class="reward-max field-number" .value=${rewardSpec.max} @input=${this.updateNumberInputHandler(rewardSpec, 'max')}/>
                        <input class="reward-partsToAWhole field-number" .value=${rewardSpec.partsToAWhole} @input=${this.updateNumberInputHandler(rewardSpec, 'partsToAWhole')}/>    
                    </div>
                    <div class="actions">
                        <a href="#" @click="${this.done}">Done</a>
                    </div>
                </div>
            `;
        }
        return html`
            <div class="container ${rewardSpec.rarity}">
                <div class="fields-readonly">
                    <span>${rewardSpec.icon}</span>
                    <span>${this.renderAmountRange(rewardSpec.min, rewardSpec.max)}</span>
                    ${rewardSpec.partsToAWhole !== 1 ? html`<span>Collect: ${rewardSpec.partsToAWhole}</span>` : nothing}
                    ${rewardSpec.owner ? html`<span>${rewardSpec.owner}</span>` : nothing}
                </div>
            </div>
        `
    }

    private handleRewardTypeCoins(rewardSpec: RewardSpec) {
        if (this.editing) {
            return html`
                <div class="container">
                    <div class="fields-editable">
                        <input class="reward-min field-number" .value=${rewardSpec.min} @input=${this.updateNumberInputHandler(rewardSpec, 'min')}/>
                        <input class="reward-max field-number" .value=${rewardSpec.max} @input=${this.updateNumberInputHandler(rewardSpec, 'max')}/>
                    </div>
                    <div class="actions">
                        <a href="#" @click="${this.done}">Done</a>
                    </div>
                </div>
            `;
        }
        return html`
            <div class="container ${rewardSpec.rarity}">
                <div class="fields-readonly">
                    <span>${rewardSpec.icon}</span>
                    <span>${this.renderAmountRange(rewardSpec.min, rewardSpec.max)}</span>
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
            .container.common { background: var(--app-color-common); }
            .container.uncommon { background: var(--app-color-uncommon); }
            .container.rare { background: var(--app-color-rare); }
            .container.epic { background: var(--app-color-epic); }
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
