import {css, html, LitElement, nothing} from 'lit'
import {customElement, query, state} from 'lit/decorators.js'
import {RewardSpec} from "../storage.ts";
import {RewardSimulation, RewardSimulationResult} from "./reward-simulation.ts";
import '../component/bin-go-reward.ts'

@customElement('reward-simulation-dialog')
export class RewardSimulationDialog extends LitElement {

    @query('sl-dialog')
    dialog!: HTMLElement

    @state()
    private calculating = true

    @state()
    private preview?: RewardSimulationResult

    @state()
    private picks = 0

    private rewardSimulation = new RewardSimulation()

    render() {
        return html`
            <sl-dialog class="dialog" no-header>
                <div class="dialog-title">Simulation</div>
                <div class="dialog-text">Durchschnittliche Belohnungen</div>
                ${this.calculating ? html`<div class="loading">Berechnen...</div>` : nothing}
                ${!this.calculating ? this.renderPreview() : nothing}
                <div>
                    <a href="#" @click="${this.done}">Fertig</a>
                </div>
            </sl-dialog>
        `
    }

    private renderPreview() {
        if (!this.preview) {
            return nothing
        }

        return html`
            <div class="pick-control">
                <a href="#" @click="${() => this.picks = Math.max(0, this.picks - 1)}">&lt;</a>
                <span>Reihen/Spalten pro Woche: ${this.picks + 1}</span>
                <a href="#" @click="${() => this.picks = Math.min(this.picks + 1, this.preview!.seriesCount - 1 || 0)}">&gt;</a>
            </div>
            
            <table class="preview-table">
                <thead>
                    <td class="header-cell reward">Belohnung</td>
                    <td class="header-cell number">Pro Jahr</td>
                    <td class="header-cell number">Pro Woche</td>
                </thead>
                <tbody>
                    ${this.preview.result[this.picks].collection.getContent().map(reward => {
                        const total = Number((reward.amount / reward.partsToAWhole).toFixed(1));
                        const perWeek = Number((total / this.preview!.seriesSize).toFixed(1))
                        
                        return html`
                            <tr>
                                <td class="cell reward"><bin-go-reward .reward="${reward}" >${reward.icon}</bin-go-reward></td>
                                <td class="cell number">${total}</td>
                                <td class="cell number">${perWeek}</td>
                            </tr>
                        `})}
                </tbody>
            </table>
        `
    }

    public showPreview(rewardSpecs: RewardSpec[]) {
        this.calculating = true;
        this.preview = undefined;

        (this.dialog as any).show()

        this.rewardSimulation.generatePreview(rewardSpecs).then(preview => {
            this.calculating = false

            // sort
            preview.result.forEach(series => {
                series.collection.getContent().sort((r1, r2) => r2.amount/r2.partsToAWhole - r1.amount/r1.partsToAWhole)
            })

            this.preview = preview
        })
    }

    private done(e: Event) {
        // TODO: async not really working
        // TODO: close causes aria issue
        e.preventDefault();
        setTimeout(() => {
            (this.dialog as any).hide()
        }, 500)
    }

    static styles = css`
        .preview-table {
            width: 100%;
            margin: 1rem 0;
        }
        .cell.number, .header-cell.number {
            text-align: center;
        }
        .loading {
            margin: 1rem 0;
        }
    `
}

declare global {
    interface HTMLElementTagNameMap {
        'reward-simulation-dialog': RewardSimulationDialog
    }
}
