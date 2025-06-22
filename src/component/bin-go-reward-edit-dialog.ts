import {css, html, LitElement, PropertyValues} from 'lit'
import {customElement, query, state} from 'lit/decorators.js'
import {RewardSpec, RewardSpecType} from "../storage.ts";
import {Rarity} from "../domain/reward.ts";
import {AmountDistributionSimulator} from "../simulation/amount-distribution-simulator.ts";
import {TaskAndRewardFactory} from "../domain/task-and-reward-factory.ts";
import {EmojiUtil} from "../domain/util/emoji-util.ts";

export enum EditorOperation {
    Edit = 'edit',
    New = 'new'
}

@customElement('bin-go-reward-edit-dialog')
export class BinGoRewardEditDialog extends LitElement {

    private amountDistributionSimulator = new AmountDistributionSimulator();
    private taskAndRewardFactory = new TaskAndRewardFactory();

    @query('sl-dialog')
    dialog!: HTMLElement

    @state()
    private operation = EditorOperation.New

    @state()
    private internalRewardSpec?: RewardSpec

    private scrollY = 0

    protected firstUpdated(_changedProperties: PropertyValues) {
        this.dialog.addEventListener('sl-show', () => {
            // Restore scroll position after dialog opens
            requestAnimationFrame(() => {
                window.scrollTo(0, this.scrollY);
            });
        })
        this.dialog.addEventListener('sl-hide', () => {
            // Restore scroll position after dialog opens
            requestAnimationFrame(() => {
                window.scrollTo(0, this.scrollY);
            });
        })
    }

    render() {
        return html`
            <sl-dialog label="${this.getDialogTitle()}">
                ${this.renderRewardSpecType()}
            </sl-dialog>
        `
    }

    private getDialogTitle(): string {
        if (this.operation === EditorOperation.New) {
            switch (this.internalRewardSpec?.type) {
                case RewardSpecType.Collectible: return 'Neues Sammelstück'
                case RewardSpecType.Coins: return 'Neue Münzen'
                default: return 'Wähle einen Belohnungstyp'
            }
        } else if (this.operation === EditorOperation.Edit) {
            return 'Belohnung editieren'
        }
        throw Error('Unbekannte EditorOperation')
    }

    private renderRewardSpecType() {
        if (!this.internalRewardSpec) {
            return this.renderRewardTypeChoice()
        }

        switch (this.internalRewardSpec.type) {
            case RewardSpecType.Collectible: return this.handleRewardTypeCollectible()
            case RewardSpecType.Coins: return this.handleRewardTypeCoins()
            default: throw Error(`Unbekannter RewardType: ${this.internalRewardSpec.type}`)
        }
    }

    private renderRewardTypeChoice() {
        return html`
            <div class="container">
                <div class="reward-choice-list">
                    <a href="#" @click="${(e: Event) => this.handleRewardTypeChoice(e, this.taskAndRewardFactory.newCollectibleSpec)}">Sammelstück</a>
                    <a href="#" @click="${(e: Event) => this.handleRewardTypeChoice(e, this.taskAndRewardFactory.newCoinsSpec)}">Münzen</a>
                </div>
            </div>
        `
    }

    private handleRewardTypeChoice(e: Event, rewardSpecCreator: () => RewardSpec) {
        e.stopPropagation()
        this.internalRewardSpec = rewardSpecCreator()
        requestAnimationFrame(() => {
            window.scrollTo(0, this.scrollY);
        });
    }

    private handleRewardTypeCollectible() {
        const spec = this.internalRewardSpec!;

        // TODO: add preview at the top by using reward component directly?
        return html`
            <div class="container">
                <div class="fields-editable">
                    <div class="label">Icon</div>
                    <input class="reward-icon" .value=${spec.icon} @input=${this.updateStringInputHandler(spec, 'icon')}/>
                    <div class="label">Beschreibung</div>
                    <input class="reward-description" .value=${spec.description || ''} @input=${this.updateStringInputHandler(spec, 'description')}/>
                    <div class="label">Rarität</div>
                    <select class="reward-rarity" .value="${spec.rarity}" @input="${this.updateStringInputHandler(spec, 'rarity')}">
                        ${Object.keys(Rarity).map(key => {
                            const value = Rarity[key as keyof typeof Rarity];
                            return html`<option value="${value}" ?selected="${value === spec.rarity}">${key}</option>`  
                        })}
                    </select>
                    <div class="label has-action" @click="${() => this.amountDistributionSimulator.getAmountDistribution(spec)}">Min</div>
                    <input class="reward-min field-number" .value=${spec.min} @input=${this.updateNumberInputHandler(spec, 'min')}/>
                    <div class="label has-action" @click="${() => this.amountDistributionSimulator.getAmountDistribution(spec)}">Max</div>
                    <input class="reward-max field-number" .value=${spec.max} @input=${this.updateNumberInputHandler(spec, 'max')}/>
                    <div class="label">Teile für ein Ganzes</div>
                    <input class="reward-partsToAWhole field-number" .value=${spec.partsToAWhole} @input=${this.updateNumberInputHandler(spec, 'partsToAWhole')}/>
                    <div class="label">Coins</div>
                    <input class="reward-value field-number" .value=${spec.value || 0} @input=${this.updateNumberInputHandler(spec, 'value')}/>
                </div>
                <div class="actions">
                    <a href="#" @click="${this.applyChanges}">Änderungen übernehmen</a>
                </div>
            </div>
        `;
    }

    private handleRewardTypeCoins() {
        const spec = this.internalRewardSpec!

        return html`
            <div class="container">
                <div class="fields-editable">
                    <div class="label">Min</div>
                    <input class="reward-min field-number" .value=${spec.min} @input=${this.updateNumberInputHandler(spec, 'min')}/>
                    <div class="label">Max</div>
                    <input class="reward-max field-number" .value=${spec.max} @input=${this.updateNumberInputHandler(spec, 'max')}/>
                </div>
                <div class="actions">
                    <a href="#" @click="${this.applyChanges}">Änderungen übernehmen</a>
                </div>
            </div>
        `;
    }

    public show(rewardSpec?: RewardSpec) {
        this.operation = rewardSpec ? EditorOperation.Edit : EditorOperation.New

        // make shallow copy of original or make sure internal is undefined if no spec is passed
        this.internalRewardSpec = !!rewardSpec ? { ... rewardSpec } : undefined;

        this.scrollY = window.scrollY;

        (this.dialog as any).show()
    }

    private applyChanges() {
        // TODO: validate inputs, i.e. positive numbers, non-empty icon etc.
        if (!this.internalRewardSpec) {
            return;
        }

        if (!this.validate(this.internalRewardSpec)) {
            return;
        }

        this.sendSavedEvent(this.internalRewardSpec, this.operation);
        (this.dialog as any).hide()
    }

    private validate(rewardSpec: RewardSpec): boolean {
        // TODO: also check that only emojis are present in the string!
        if (EmojiUtil.countEmojis(rewardSpec.icon) !== 1
            || !this.isPositiveInt(rewardSpec.partsToAWhole)
            || !this.isPositiveInt(rewardSpec.min)
            || !this.isPositiveInt(rewardSpec.max)
            || (rewardSpec.value !== undefined && !this.isPositiveIntOrZero(rewardSpec.value))) {

            return false;
        }
        return true;
    }

    private isPositiveInt(n: number): boolean {
        return n > 0 && Number.isInteger(n)
    }

    private isPositiveIntOrZero(n: number): boolean {
        return n >= 0 && Number.isInteger(n)
    }

    private sendSavedEvent(rewardSpec: RewardSpec, operation: EditorOperation) {
        const event = new CustomEvent('saved', {
            detail: {
                result: rewardSpec,
                operation,
            },
            bubbles: true,
            composed: true
        });

        this.dispatchEvent(event);
    }

    private updateStringInputHandler(object: any, property: string): ((event: Event) => void) {
        return (event: Event) => {
            const target = event.target as HTMLInputElement
            object[property] = target.value
        }
    }

    private updateNumberInputHandler(object: any, property: string): ((event: Event) => void) {
        return (event: Event) => {
            const target = event.target as HTMLInputElement
            object[property] = Number(target.value)
        }
    }

    static styles = css`
        .container {
            display: flex;
            flex-direction: column;
        }
        .reward-choice-list {
            display: flex;
            flex-direction: column;
            text-align: center;
            margin: 1rem;
        }
        .actions {
            text-align: center;
            margin: 1rem;
        }
        .fields-editable {
            display: grid;
            grid-template-columns: 1fr 1fr;
            row-gap: 5px;
            column-gap: 10px;
            background: white;
            padding: 10px;
            border-radius: 5px;
            flex-direction: column;
        }
        .label {
            text-align: right;
        }
        .label.has-action {
            text-decoration: underline dotted;
            cursor: pointer;
        }
        .field-number {
            width: 25px;
            text-align: center;
        }
    `
}

declare global {
    interface HTMLElementTagNameMap {
        'bin-go-reward-edit-dialog': BinGoRewardEditDialog
    }
}
