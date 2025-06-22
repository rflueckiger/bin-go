import {css, html, LitElement, PropertyValues} from 'lit'
import {customElement, property, query} from 'lit/decorators.js'

export enum EditorOperation {
    Edit = 'edit',
    New = 'new'
}

@customElement('bin-go-confirmation-dialog')
export class BinGoConfirmationDialog extends LitElement {

    @query('sl-dialog')
    dialog!: HTMLElement

    @property()
    public title = 'Bestätigen'

    @property()
    public message = ''

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
            <sl-dialog label="${this.title}">
                <div>${this.message}</div>
                <sl-button slot="footer" @click="${this.cancel}">Abbrechen</sl-button>
                <sl-button slot="footer" variant="primary" @click="${this.confirm}">OK</sl-button>
            </sl-dialog>`
    }

    public show(title: string, message: string) {
        this.title = title;
        this.message = message;
        this.scrollY = window.scrollY;
        (this.dialog as any).show()
    }

    private cancel() {
        (this.dialog as any).hide()
    }

    private confirm() {
        const event = new CustomEvent('confirm', {
            detail: 'ok',
            bubbles: true,
            composed: true
        });

        this.dispatchEvent(event);
        (this.dialog as any).hide()
    }

    static styles = css``;

}

declare global {
    interface HTMLElementTagNameMap {
        'bin-go-confirmation-dialog': BinGoConfirmationDialog
    }
}
