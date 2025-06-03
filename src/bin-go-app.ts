import {LitElement, css, html} from 'lit'
import {customElement, state} from 'lit/decorators.js'
import './pwa-badge'
import './page/bin-go-edit-page.ts'
import './page/bin-go-play-page.ts'
import {storage} from "./storage.ts";

@customElement('bin-go-app')
export class BinGoApp extends LitElement {

    @state()
    private editMode = false;

    constructor() {
        super();

        const config = storage.getConfig();

        // if there is no config, go to edit mode
        if (!config) {
            console.log('No config detected. Going to "edit" mode.')
            this.editMode = true;
        }
    }

    render() {
        return html`
            ${this.editMode ? html`
                <bin-go-edit-page @done="${this.handleDoneEditing}"></bin-go-edit-page>` : html`
                <bin-go-play-page @edit="${this.handleStartEditing}"></bin-go-play-page>`}`
    }

    private handleDoneEditing() {
        this.editMode = false;
    }

    private handleStartEditing() {
        this.editMode = true;
    }

    static styles = css`
        :host {
            max-width: 640px;
            margin: 0 auto;
            padding: 2rem;
            width: 100%;
        }  `
}
 declare global {
    interface HTMLElementTagNameMap {
        'bin-go-app': BinGoApp
    }
}
