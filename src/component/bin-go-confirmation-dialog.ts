import {css, html, TemplateResult} from 'lit'
import {customElement, property} from 'lit/decorators.js'
import {AppBaseDialog} from "./base/app-base-dialog.ts";

@customElement('bin-go-confirmation-dialog')
export class BinGoConfirmationDialog extends AppBaseDialog {

    @property()
    public message = ''

    protected renderContent(): TemplateResult {
        return html`
            <div>${this.message}</div>
            <sl-button slot="footer" @click="${super.close}">Abbrechen</sl-button>
            <sl-button slot="footer" variant="primary" @click="${this.confirm}">OK</sl-button>
        `
    }

    public show(title: string, message: string) {
        this.dialogTitle = title;
        this.message = message;
        super.open()
    }

    private confirm() {
        const event = new CustomEvent('confirm', {
            detail: 'ok',
            bubbles: true,
            composed: true
        });

        this.dispatchEvent(event);
        super.close()
    }

    static styles = css``;

}

declare global {
    interface HTMLElementTagNameMap {
        'bin-go-confirmation-dialog': BinGoConfirmationDialog
    }
}
