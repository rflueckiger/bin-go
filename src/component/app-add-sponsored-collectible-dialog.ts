import {css, html, PropertyValues, TemplateResult} from 'lit'
import {customElement, state} from 'lit/decorators.js'
import {AppBaseDialog} from "./base/app-base-dialog.ts";
import {setValue} from "../domain/util/input-value-handler.ts";
import {SponsoredCollectibleCode} from "../domain/util/sponsored-collectible-code.ts";
import {RewardSpec} from "../domain/config/reward-spec.ts";
import {EditorOperation} from "./bin-go-reward-edit-dialog.ts";
import {RewardSpecType} from "../domain/config/reward-spec-type.ts";

@customElement('app-add-sponsored-collectible-dialog')
export class AppAddSponsoredCollectibleDialog extends AppBaseDialog {

    @state()
    private input = ''

    @state()
    private internalRewardSpec?: RewardSpec

    dialogTitle = 'Geheime Belohnung'

    protected renderContent(): TemplateResult {
        return html`
            <div class="reward-container">
                <div class="text">Deine Freunde können dich unterstützen und dir Belohnungen sponsern. Schicke sie auf https://rflueckiger.github.io/bin-go/sponsor oder lass sie diesen QR-Code scannen.</div>
                <sl-qr-code value="https://rflueckiger.github.io/bin-go/sponsor"></sl-qr-code>
                <div class="text">Wenn sie fertig sind werden sie dir einen Code schicken, den du hier einfügen kannst, um die geheime Belohnung deiner Konfiguration hinzuzufügen:</div>
                <sl-textarea class="textbox" resize="none" @input="${setValue(this, 'input')}"></sl-textarea>
                <div class="error-message">${this.input && !this.internalRewardSpec ? 'Ungültiger Code!' : ''}</div>
            </div>
            <sl-button slot="footer" @click="${this.close}">Abbrechen</sl-button>
            <sl-button slot="footer" ?disabled="${!this.internalRewardSpec}" variant="primary" @click="${this.add}">Hinzufügen</sl-button>
        `
    }

    protected willUpdate(_changedProperties: PropertyValues) {
        try {
            const code = new SponsoredCollectibleCode(this.input)
            this.internalRewardSpec = code.asRewardSpec()
            this.internalRewardSpec.type = RewardSpecType.SponsoredCollectible
        } catch(e) {
            this.internalRewardSpec = undefined
        }
    }

    private add() {
        if (!this.internalRewardSpec) {
            return
        }
        this.sendSavedEvent(this.internalRewardSpec)
        super.close()
    }

    private sendSavedEvent(rewardSpec: RewardSpec) {
        const event = new CustomEvent('saved', {
            detail: {
                result: rewardSpec,
                operation: EditorOperation.New
            },
            bubbles: true,
            composed: true
        });

        this.dispatchEvent(event);
    }

    static styles = css`
        sl-textarea::part(textarea) {
            font-family: 'Courier New', Courier, monospace;
            height: 150px;
        }
        
        .reward-container {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }
    `;

}

declare global {
    interface HTMLElementTagNameMap {
        'app-add-sponsored-collectible-dialog': AppAddSponsoredCollectibleDialog
    }
}
