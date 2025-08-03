import {css, html, LitElement} from 'lit'
import {customElement, state} from 'lit/decorators.js'
import {TaskAndRewardFactory} from "../domain/task-and-reward-factory.ts";
import {RewardSpec} from "../domain/config/reward-spec.ts";
import '../component/app-reward-spec-editor.ts';
import {SponsoredCollectibleCode} from "../domain/util/sponsored-collectible-code.ts";

@customElement('bin-go-sponsor-page')
export class BinGoSponsorPage extends LitElement {

    private taskAndRewardFactory = new TaskAndRewardFactory()

    @state()
    private rewardSpec: RewardSpec = this.taskAndRewardFactory.newCollectibleSpec()

    @state()
    private code = ''

    render() {
        return html`
            <h3 class="title">Belohnung sponsern</h3>
            <div class="foldable">
                <div class="paragraph">Hier kannst du für jemanden eine Belohnung erstellen.</div>
                <div class="paragraph">Konfiguriere die Belohnung unten und gib deinen Namen als Sponsor ein.</div>
                <div class="paragraph">Sobald du fertig bist, kannst du einen Code generieren, den du dem Empfänger mitteilen kannst.</div>
            </div>
            <app-reward-spec-editor sponsor .rewardSpec="${this.rewardSpec}"></app-reward-spec-editor>
            <div class="foldable code-section">
                <sl-button class="generate" @click="${this.generateCode}">Code generieren</sl-button>
                <sl-textarea class="code" readonly resize="none" .value="${this.code}"></sl-textarea>
            </div>
        `
    }

    private generateCode() {
        try {
            this.rewardSpec.key = this.taskAndRewardFactory.newKey()
            const code = SponsoredCollectibleCode.fromRewardSpec(this.rewardSpec)
            this.code = code.asString()
        } catch(e) {
            this.code = 'Code konnte nicht generiert werden.'
        }
    }

    static styles = css`
        .title {
            margin: 1rem 0 0.5rem;
            font-size: 1.5rem;
            text-align: center;
        }
        .paragraph {
            max-width: 55ch;
            margin: 1rem auto;
            text-align: center;
        }
        .foldable {
            background: var(--app-color-task-background);
            border-radius: 5px;
            padding: 0.1rem 0.5rem;
            margin-bottom: 1rem;
        }
        
        .code-section {
            margin: 1rem 0;
            padding: 1rem;
        }

        .code-section > .generate {
            margin-bottom: 1rem;
        }
        
        sl-textarea::part(textarea) {
            font-family: 'Courier New', Courier, monospace;
            height: 150px;
        }
    `
}

declare global {
    interface HTMLElementTagNameMap {
        'bin-go-sponsor-page': BinGoSponsorPage
    }
}
