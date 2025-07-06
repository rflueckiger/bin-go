import {css, html, LitElement, PropertyValues, TemplateResult} from 'lit'
import {property, query} from 'lit/decorators.js'
import {SlDialog} from "@shoelace-style/shoelace";

export abstract class AppBaseDialog extends LitElement {

    @query('sl-dialog')
    dialog!: SlDialog

    private scrollY = 0

    @property()
    public dialogTitle = ''

    protected firstUpdated(_changedProperties: PropertyValues) {
        this.dialog.addEventListener('sl-show', () => {
            // Restore scroll position after dialog opens
            requestAnimationFrame(() => {
                this.restoreScrollY()
            });
        })
        this.dialog.addEventListener('sl-hide', () => {
            // Restore scroll position after dialog opens
            requestAnimationFrame(() => {
                this.restoreScrollY()
            });
        })
    }

    render() {
        return html`
            <sl-dialog label="${this.dialogTitle}">
                ${this.renderContent()}
            </sl-dialog>`
    }

    protected abstract renderContent(): TemplateResult

    public open() {
        this.storeScrollY()
        this.dialog.show()
    }

    protected restoreScrollY() {
        window.scrollTo(0, this.scrollY);
    }

    protected storeScrollY() {
        this.scrollY = window.scrollY
    }

    protected close() {
        this.dialog.hide()
    }

    static styles = css``;
}
