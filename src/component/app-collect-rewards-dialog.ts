import {css, html, LitElement, PropertyValues} from 'lit'
import {customElement, query, state} from 'lit/decorators.js'
import {SlDialog} from "@shoelace-style/shoelace";
import {Reward} from "../domain/reward.ts";
import {RewardSorter} from "../domain/sorter/reward-sorter.ts";

@customElement('app-collect-rewards-dialog')
export class AppCollectRewardsDialog extends LitElement {

    @query('sl-dialog')
    dialog!: SlDialog

    @state()
    private rewards: Reward[] = []

    private scrollY = 0

    private rewardSorter = new RewardSorter()

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
            <sl-dialog label="Belohnungen">
                <div class="reward-container">
                    ${this.rewards.sort(this.rewardSorter.rarityDesc).map(reward => html`<bin-go-reward .reward="${reward}"></bin-go-reward>`)}
                </div>
                <sl-button slot="footer" variant="primary" @click="${this.close}">OK</sl-button>
            </sl-dialog>`
    }

    public show(rewards: Reward[]) {
        this.rewards = rewards
        this.scrollY = window.scrollY
        this.dialog.show()
    }

    private close() {
        this.dialog.hide()
    }

    static styles = css`
        .reward-container {
            gap: 0.5rem;
            display: flex;
            flex-direction: column;
        }
    `;

}

declare global {
    interface HTMLElementTagNameMap {
        'app-collect-rewards-dialog': AppCollectRewardsDialog
    }
}
