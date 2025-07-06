import {css, html, TemplateResult} from 'lit'
import {customElement, state} from 'lit/decorators.js'
import {Reward} from "../domain/reward.ts";
import {RewardSorter} from "../domain/sorter/reward-sorter.ts";
import {AppBaseDialog} from "./base/app-base-dialog.ts";

@customElement('app-collect-rewards-dialog')
export class AppCollectRewardsDialog extends AppBaseDialog {

    @state()
    private rewards: Reward[] = []

    private rewardSorter = new RewardSorter()

    dialogTitle = 'Belohnungen'

    protected renderContent(): TemplateResult {
        return html`
            <div class="reward-container">
                ${this.rewards.sort(this.rewardSorter.rarityDesc).map(reward => html`<bin-go-reward .reward="${reward}"></bin-go-reward>`)}
            </div>
            <sl-button slot="footer" variant="primary" @click="${super.close}">OK</sl-button>
        `
    }

    public show(rewards: Reward[]) {
        this.rewards = rewards
        super.open()
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
