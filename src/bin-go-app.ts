import {LitElement, css, html} from 'lit'
import {customElement, state} from 'lit/decorators.js'
import './pwa-badge'
import './page/bin-go-edit-page.ts'
import './page/bin-go-play-page.ts'
import {Storage} from "./storage.ts";

@customElement('bin-go-app')
export class BinGoApp extends LitElement {

    @state()
    private editMode = false;

    private readonly storage = new Storage()

    constructor() {
        super();

        const config = this.storage.getConfig();

        // if there is no config, go to edit mode
        if (!config) {
            console.log('No config detected. Going to "edit" mode.')
            this.editMode = true;
        }
    }

    render() {
        // TODO: check storage - if there this is first time visit, show editor
        // TODO: develop editor page -> add up to 9 tasks and 6 treats (include version nr)
        // TODO: create random grid and store it (timestamp, version)
        // TODO: show grid
        // TODO: allow finish of tasks and receive treats
        // TODO: store hobby coins indefinitely
        // TODO: reset grid and treats (other than hobby coins) every week (upon entering)
        // TODO: go back to edit mode - fix all related update problems
        // TODO: add icon support
        // TODO: styling
        // TODO: pwa support
        // TODO: deploy on github
        // TODO: add support for partial treats
        // TODO: add splash screen for received completed treats
        // TODO: add helper text / branding etc. / polish
        // TODO: allow spending of hobby coins

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
            max-width: 1280px;
            margin: 0 auto;
            padding: 2rem;
            text-align: center;
        }  `
}

declare global {
    interface HTMLElementTagNameMap {
        'bin-go-app': BinGoApp
    }
}
