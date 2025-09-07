import {css, html, LitElement, nothing} from 'lit'
import {customElement, state} from 'lit/decorators.js'
import './pwa-badge'
import './page/bin-go-edit-page.ts'
import './page/bin-go-play-page.ts'
import './page/bin-go-sponsor-page.ts'
import {APP_DATA} from "./service/app-data.ts";

export enum Page {
    Edit,
    Play,
    Sponsor
}

@customElement('bin-go-app')
export class BinGoApp extends LitElement {

    @state()
    private page: Page | undefined

    constructor() {
        super();

        const path = window.location.pathname;
        if (path.endsWith('/sponsor')) {
            this.page = Page.Sponsor
        } else {
            APP_DATA.configService.getConfig().then(config => {
                // if there is no config, go to edit mode
                if (!config) {
                    console.log('No config detected. Going to "edit" mode.')
                    this.page = Page.Edit
                } else {
                    this.page = Page.Play
                }
            });
        }
    }

    render() {
        switch (this.page) {
            case Page.Edit: return html`<bin-go-edit-page @done="${this.handleDoneEditing}"></bin-go-edit-page>`
            case Page.Play: return html`<bin-go-play-page @edit="${this.handleStartEditing}"></bin-go-play-page>`
            case Page.Sponsor: return html`<bin-go-sponsor-page></bin-go-sponsor-page>`
            default: return nothing
        }
    }

    private handleDoneEditing() {
        this.page = Page.Play;
    }

    private handleStartEditing() {
        this.page = Page.Edit;
    }

    static styles = css`
        :host {
            max-width: 640px;
            margin: 0 auto;
            width: 100%;
        }  `
}
 declare global {
    interface HTMLElementTagNameMap {
        'bin-go-app': BinGoApp
    }
}
