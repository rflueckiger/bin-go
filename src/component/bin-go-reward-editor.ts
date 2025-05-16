import {LitElement, css, html, nothing} from 'lit'
import {customElement, property} from 'lit/decorators.js'
import {BinGoReward, Storage} from "../storage.ts";

@customElement('bin-go-reward-editor')
export class BinGoRewardEditor extends LitElement {

    @property()
    public reward?: BinGoReward;

    @property()
    public editing = false;

    @property()
    public editable = false;

    private storage = new Storage()

    render() {
        switch (this.reward?.type) {
            case 'item': return this.handleRewardTypeItem(this.reward)
            // TODO: handle coins case
            default: throw Error('Unknown reward type')
        }
    }

    private handleRewardTypeItem(reward: BinGoReward) {
        if (this.editing) {
            return html`
                <div class="container">
                    <div class="fields-editable">
                        <input class="reward-name" .value=${reward.label} @input=${this.inputToObjectUpdateHandler(reward, 'label')}/>
                        <input class="reward-min" .value=${reward.min} @input=${this.inputToObjectUpdateHandler(reward, 'min')}/>
                        <input class="reward-max" .value=${reward.max} @input=${this.inputToObjectUpdateHandler(reward, 'max')}/>
                        <input class="reward-partsToAWhole" .value=${reward.partsToAWhole} @input=${this.inputToObjectUpdateHandler(reward, 'partsToAWhole')}/>    
                    </div>
                    <div class="actions">
                        <a href="#" @click="${this.finishEditing}">Done</a>
                    </div>
                </div>
            `;
        }
        return html`
            <div class="container">
                <div class="fields-readonly">
                    <span>${reward.type.toUpperCase()}</span>
                    <span>${reward.label}</span>
                    <span>${this.renderAmountRange(reward.min, reward.max)}</span>
                    <span>${reward.partsToAWhole !== 1 ? html`<span>Collect: ${reward.partsToAWhole}</span>` : nothing}</span>
                </div>
                ${this.editable ? html`
                    <div class="actions">
                        <a href="#" @click="${this.startEditing}">Edit</a>
                        <a href="#">Delete</a>
                    </div>` : nothing}
            </div>
        `
    }

    private startEditing() {
        if (!this.reward) {
            return
        }

        this.editing = true;
        console.log(`Start editing: ${this.reward}`)
    }

    private finishEditing() {
        this.editing = false;
        //this.storage.updateReward(this.reward);
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

    static styles = css`
        :host {
            
        }
    `

    private inputToObjectUpdateHandler(object: any, property: string): ((event: Event) => void) {
        return (event: Event) => {
            const target = event.target as HTMLInputElement
            object[property] = target.value
            this.requestUpdate()
        }
    }

   // private sendDone() {}
   // private sendEdit() {}
}

declare global {
    interface HTMLElementTagNameMap {
        'bin-go-reward-editor': BinGoRewardEditor
    }
}
