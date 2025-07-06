import {css, html, PropertyValues, TemplateResult} from 'lit'
import {customElement, state} from 'lit/decorators.js'
import {TaskAndRewardFactory} from "../domain/task-and-reward-factory.ts";
import {EmojiUtil} from "../domain/util/emoji-util.ts";
import {RewardSpec} from "../domain/config/reward-spec.ts";
import {RewardSpecType} from "../domain/config/reward-spec-type.ts";
import {AppBaseDialog} from "./base/app-base-dialog.ts";
import './app-reward-spec-editor.ts';
import {setNumber} from "../domain/util/input-value-handler.ts";

export enum EditorOperation {
    Edit = 'edit',
    New = 'new'
}

@customElement('bin-go-reward-edit-dialog')
export class BinGoRewardEditDialog extends AppBaseDialog {

    private taskAndRewardFactory = new TaskAndRewardFactory();

    @state()
    private operation = EditorOperation.New

    @state()
    private internalRewardSpec?: RewardSpec

    protected renderContent(): TemplateResult {
        return html`${this.renderRewardSpecType()}`;
    }

    protected willUpdate(_changedProperties: PropertyValues) {
        this.dialogTitle = this.getDialogTitle()
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
        requestAnimationFrame(() => this.restoreScrollY());
    }

    private handleRewardTypeCollectible() {
        return html`
            <div class="container">
                <app-reward-spec-editor .rewardSpec="${this.internalRewardSpec}"></app-reward-spec-editor>
                <div class="actions">
                    <a href="#" @click="${this.applyChanges}">Änderungen übernehmen</a>
                </div>
            </div>
        `;
    }

    private handleRewardTypeCoins() {
        const spec = this.internalRewardSpec!

        // TODO: make app-reward-spec-editor configurable (fields array) and re-use here

        return html`
            <div class="container">
                <div class="fields-editable">
                    <div class="label">Min</div>
                    <input class="reward-min field-number" .value=${spec.min} @input=${setNumber(spec, 'min')}/>
                    <div class="label">Max</div>
                    <input class="reward-max field-number" .value=${spec.max} @input=${setNumber(spec, 'max')}/>
                </div>
                <div class="actions">
                    <a href="#" @click="${this.applyChanges}">Änderungen übernehmen</a>
                </div>
            </div>
        `;
    }

    public show(rewardSpec?: RewardSpec) {
        if (rewardSpec?.type === RewardSpecType.SponsoredCollectible) {
            throw Error('Sponsored rewards cannot be edited.')
        }

        this.operation = rewardSpec ? EditorOperation.Edit : EditorOperation.New

        // make shallow copy of original or make sure internal is undefined if no spec is passed
        this.internalRewardSpec = !!rewardSpec ? { ... rewardSpec } : undefined;

        super.open()
    }

    private applyChanges() {
        if (!this.internalRewardSpec) {
            return;
        }

        if (!this.validate(this.internalRewardSpec)) {
            return;
        }

        this.sendSavedEvent(this.internalRewardSpec, this.operation);
        super.close()
    }

    private validate(rewardSpec: RewardSpec): boolean {
        // TODO: use validator in reward-spec.ts
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
