import {css, html, LitElement, nothing} from 'lit'
import {customElement, property, query} from 'lit/decorators.js'
import {Rarity} from "../domain/reward.ts";
import {RewardSpec} from "../domain/config/reward-spec.ts";
import {setNumber, setValue} from "../domain/util/input-value-handler.ts";
import {AppInfoDialog} from "./app-info-dialog.ts";
import './app-info-dialog.ts'

@customElement('app-reward-spec-editor')
export class AppRewardSpecEditor extends LitElement {

    static strings: { [key: string]: { label: string, info: string }} = {
        icon: {
            label: 'Icon',
            info: 'Wähle 1 Emoji, welches diese Belohnung repräsentiert.'
        },
        description: {
            label: 'Beschreibung',
            info: 'Optional: Eine Beschreibung der Belohnung.'
        },
        rarity: {
            label: 'Rarität',
            info: 'Wähle wie selten diese Belohnung sein soll: Common = sehr häufig, alltäglich; Uncommon: weniger häufig, alle paar Wochen mal; Rare: selten, alle paar Monate mal; Epic: extrem selten, vielleicht 1x pro Jahr.'
        },
        min: {
            label: 'Min',
            info: 'Wenn diese Belohnung auftaucht, dann mindestens in dieser Menge. Minimum: 1'
        },
        max: {
            label: 'Max',
            info: 'Wenn diese Belohnung auftaucht, dann maximal in dieser Menge. Minimum: 1'
        },
        partsToAWhole: {
            label: 'Teile für ein Ganzes',
            info: 'Viele Einheiten dieser Belohnung benötigt werden um 1 Ganzes zu erhalten, welches dann eingelöst werden kann. Minimum: 1'
        },
        value: {
            label: 'Münzen',
            info: 'Optional: Der Wert in Münzen einer ganzen Einheit dieser Belohnung. Erlaubt es diese Belohnung anstelle sie einzulösen für Münzen zu verkaufen.'
        },
        sponsor: {
            label: 'Sponsor',
            info: 'Gib hier deinen Namen ein, damit der Empfänger weiss von wem die Belohnung stammt.'
        }
    }

    // TODO: add distribution dialog
    //private amountDistributionSimulator = new AmountDistributionSimulator();

    @property()
    public rewardSpec?: RewardSpec

    @property({ type: Boolean })
    public sponsor = false

    @query('#info-dialog')
    private infoDialog!: AppInfoDialog

    protected render(): unknown {
        if (!this.rewardSpec) {
            return nothing
        }

        const spec = this.rewardSpec!;

        return html`
            <div class="fields-editable">
                ${this.renderLabel('icon')}
                <sl-input class="reward-icon" size="small" .value=${spec.icon} @input=${setValue(spec, 'icon')}/></sl-input>
                ${this.renderLabel('description')}
                <sl-input class="reward-description" size="small" .value=${spec.description || ''} @input=${setValue(spec, 'description')}/></sl-input>
                ${this.renderLabel('rarity')}
                <sl-select class="reward-rarity" size="small" .value="${spec.rarity}" @sl-change="${setValue(spec, 'rarity')}">
                    ${Object.keys(Rarity).map(key => {
                        const value = Rarity[key as keyof typeof Rarity];
                        return html`<sl-option value="${value}">${key}</sl-option>`
                    })}
                </sl-select>
                ${this.renderLabel('min')}
                <sl-input class="reward-min field-number" size="small" .value=${spec.min} @input=${setNumber(spec, 'min')}/></sl-input>
                ${this.renderLabel('max')}
                <sl-input class="reward-max field-number" size="small" .value=${spec.max} @input=${setNumber(spec, 'max')}/></sl-input>
                ${this.renderLabel('partsToAWhole')}
                <sl-input class="reward-partsToAWhole field-number" size="small" .value=${spec.partsToAWhole} @input=${setNumber(spec, 'partsToAWhole')}/></sl-input>
                ${this.renderLabel('value')}
                <sl-input class="reward-value field-number" size="small" .value=${spec.value || 0} @input=${setNumber(spec, 'value')}/></sl-input>
                ${this.sponsor ? html`
                    ${this.renderLabel('sponsor')}
                    <sl-input class="reward-sponsor" size="small" .value=${spec.sponsor || ''} @input=${setValue(spec, 'sponsor')}/></sl-input>
                ` : nothing }
            </div>
            <app-info-dialog id="info-dialog"></app-info-dialog>
        `;
    }

    private renderLabel(field: string) {
        const info = AppRewardSpecEditor.strings[field].info
        const label = AppRewardSpecEditor.strings[field].label
        return html`<div class="label has-action" @click="${() => this.infoDialog.show(label, info)}">${label}</div>`
    }

    static styles = css`
        .fields-editable {
            display: grid;
            grid-template-columns: 1fr 1fr;
            row-gap: 5px;
            column-gap: 10px;
            background: white;
            padding: 10px;
            border-radius: 5px;
            flex-direction: column;
            align-items: baseline;
        }
        
        .reward-icon {
            max-width: 40px;
        }
        
        .label {
            text-align: right;
        }
        .label.has-action {
            text-decoration: underline dotted;
            cursor: pointer;
        }
        
        .field-number {
            width: 60px;
            text-align: center;
        }
    `
}

declare global {
    interface HTMLElementTagNameMap {
        'app-reward-spec-editor': AppRewardSpecEditor
    }
}
