import {css, html, TemplateResult} from 'lit'
import {customElement, property} from 'lit/decorators.js'
import {AppBaseDialog} from "./base/app-base-dialog.ts";

@customElement('app-info-dialog')
export class AppInfoDialog extends AppBaseDialog {

    @property()
    public message = ''

    protected renderContent(): TemplateResult {
        return html`
            <div>${this.message}</div>
            <sl-button slot="footer" variant="primary" @click="${super.close}">OK</sl-button>
        `
    }

    public show(title: string, message: string) {
        this.dialogTitle = title;
        this.message = message;
        super.open()
    }

    static styles = css``;

}

declare global {
    interface HTMLElementTagNameMap {
        'app-info-dialog': AppInfoDialog
    }
}
