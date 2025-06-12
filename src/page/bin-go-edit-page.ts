import {css, html, LitElement, nothing} from 'lit'
import {customElement, query, state} from 'lit/decorators.js'
import {RewardSpec, storage, Task} from "../storage.ts";
import '../component/bin-go-reward-editor.ts';
import {TaskAndRewardFactory} from "../domain/task-and-reward-factory.ts";
import {Rarity} from "../domain/reward.ts";
import '../simulation/reward-simulation-dialog.ts';
import {RewardSimulationDialog} from "../simulation/reward-simulation-dialog.ts";

@customElement('bin-go-edit-page')
export class BinGoEditPage extends LitElement {

    private version = 1;

    private taskAndRewardFactory = new TaskAndRewardFactory();

    private readonly tasks: Task[] = Array.from({ length: 9 }, () => this.taskAndRewardFactory.newTask())

    private readonly rewardSpecs: RewardSpec[] = []

    @state()
    private editing?: RewardSpec = undefined

    @state()
    private adding?: RewardSpec = undefined

    @query('#simulation-dialog')
    simulationDialog!: HTMLElement

    constructor() {
        super();

        const config = storage.getConfig();
        if (config) {
            this.tasks = config.tasks;
            this.rewardSpecs = config.rewardSpecs;
        }
    }

    render() {
        return html`
            <h3 class="title">Aufgaben</h3>
            <div class="foldable">
                <div class="paragraph">Definiere deine 9 Aufgaben, die du idealerweise jede Woche erledigen möchtest.
                    Es müssen nicht 9 verschiedene Aufgaben sein. Damit aber die App funktioniert, macht es Sinn, wenn
                    es zumindest 5-7 verschiedene sind.</div>
                <div class="paragraph">Die Reihenfolge der Aufgaben hier spielt keine Rolle. Verwende jeweils 1 Emoji um deine Aufgaben darzustellen.</div>
            </div>
            <div class="list task-list">
                <div class="task-row">${this.tasks.slice(0, 3).map(task => this.renderTaskRow(task))}</div>
                <div class="task-row">${this.tasks.slice(3, 6).map(task => this.renderTaskRow(task))}</div>
                <div class="task-row">${this.tasks.slice(6, 9).map(task => this.renderTaskRow(task))}</div>
            </div>
            
            <h3 class="title">Belohnungen</h3>
            <div class="foldable">
                <div class="paragraph">Hier kannst du deine Belohnungen erfassen. Belohnungen gehören jeweils zu einer von 4 Raritätsstufen: Common, Uncommon, Rare und Epic</div>
                <div class="paragraph">Eine Belohnung der Gruppe Common erhältst du immer!</div>
                <div class="paragraph">Unten siehst du jeweils wie gross die Chance ist, dass zusätzlich eine Belohnung einer bestimmten Gruppe erscheint.
                    Innerhalb einer Gruppe ist die Chance dann jeweils für alle Belohnungen gleich.</div>
                <div class="paragraph">Idealerweise erfasst für jede Gruppe mindestens 3-4 Belohnungen um das Spiel spannend zu halten.</div>
            </div>
            ${Object.values(Rarity).map(rarity => this.renderRewardGroup(rarity))}
            <div class="list-actions">
                <span>Hinzufügen:</span>
                <a href="#" @click="${() => this.adding = this.taskAndRewardFactory.newCollectibleSpec()}">Sammelstück</a>
                <a href="#" @click="${() => this.adding = this.taskAndRewardFactory.newCoinsSpec()}">Münzen</a>
                ${this.adding ? html`<bin-go-reward-editor .rewardSpec="${this.adding}" .editing="${true}" @done="${(event: CustomEvent) => this.addNewRewardSpec(event)}"></bin-go-reward-editor>` : nothing }
            </div>

            <div class="action-bar">
                <a class="link" href="#" @click="${this.done}">Fertig</a>
                <a class="link" href="#" @click="${() => this.showPreview()}">Simulation</a>
            </div>
            
            <reward-simulation-dialog id="simulation-dialog"></reward-simulation-dialog>
        `
    }

    private showPreview() {
        (this.simulationDialog as RewardSimulationDialog).showPreview(this.rewardSpecs)
    }

    private renderRewardGroup(rarity: Rarity) {
        const specs = this.rewardSpecs.filter(spec => spec.rarity === rarity);
        return html`
            <div class="paragraph"><strong>${this.capitalize(rarity)}</strong>: ${this.dropChance(rarity)}</div>
            ${specs.length > 0 ? html`
                <div class="list reward-list">
                    ${specs.map(spec => {
                        return html`
                        <div class="list-item reward-item">
                            <bin-go-reward-editor .rewardSpec="${spec}" .editing="${this.editing === spec}" @done="${(event: CustomEvent) => {
                            event.stopPropagation()
                            this.save()
                            this.editing = undefined
                        }}">
                            </bin-go-reward-editor>
                            ${!this.editing && !this.adding && !spec.owner ? html`<a href="#" @click="${() => this.editing = spec}">Ändern</a>` : nothing }
                            ${!this.editing && !this.adding ? html`<a href="#" @click="${() => this.removeReward(spec)}">Löschen</a>` : nothing}
                        </div>
                    `
                    })}
                </div>
            ` : html`
               <div class="paragraph">Keine Belohnungen</div>
            ` }
        `
    }

    private dropChance(rarity: Rarity): string {
        return new Intl.NumberFormat('de-CH', {
            style: 'percent',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(storage.rarityChances[rarity] / 1000);
    }

    private capitalize(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    private removeReward(rewardSpec: RewardSpec) {
        this.rewardSpecs.splice(this.rewardSpecs.indexOf(rewardSpec), 1)
        this.requestUpdate()
    }

    private addNewRewardSpec(event: CustomEvent) {
        event.stopPropagation()
        this.rewardSpecs.push(event.detail)
        this.adding = undefined
        this.requestUpdate()
    }

    private renderTaskRow(task: Task) {
        return html`
            <div class="list-item task-item">
                <input class="task-icon" .value="${task.icon}" @input=${this.inputToObjectUpdateHandler(task, 'icon')}/>
            </div>
        `
    }

    private inputToObjectUpdateHandler(object: any, property: string): ((event: Event) => void) {
        return (event: Event) => {
            const target = event.target as HTMLInputElement
            object[property] = target.value
            this.requestUpdate()
        }
    }

    private done() {
        this.sendDone();
    }

    private save() {
        storage.updateConfig({
            version: this.version,
            tasks: this.tasks,
            rewardSpecs: this.rewardSpecs,
        })
    }

    private sendDone() {
        const event = new CustomEvent('done', {
            detail: 'done',
            bubbles: true,
            composed: true
        });

        this.dispatchEvent(event);
    }

    static styles = css`
        .action-bar {
            margin-top: 1.5rem;
        }
        .link {
            color: #16697a;
            text-decoration: underline;
        }
        .link:hover {
            color: #ffa62b;
        }
        .paragraph {
            max-width: 55ch;
            margin: 1rem auto;
            text-align: center;
        }
        .title {
            margin: 1rem 0 0.5rem;
            font-size: 1.5rem;
            text-align: center;
        }
        .foldable {
            background: var(--app-color-task-background);
            border-radius: 5px;
            padding: 0.1rem 0.5rem;
            margin-bottom: 1rem;
        }
        .task-row {
            display: flex;
            gap: 10px;
            justify-content: center;
        }
        .task-item {
            margin-bottom: 5px;
        }
        .task-icon {
            height: 32px;
            width: 64px;
            font-size: 2rem;
            text-align: center;
        }
        .reward-list {
            margin-bottom: 2rem;
        }
        .reward-item {
            display: flex;
            justify-content: center;
            margin-bottom: 0.25rem;
            margin-top: 0.25rem;
            gap: 10px;
            align-items: center;
        }
        .list-actions {
            margin-top: 1rem;
            text-align: center;
        }
        .action-bar {
            margin-top: 1rem;
            text-align: center;
        }
    `
}

declare global {
    interface HTMLElementTagNameMap {
        'bin-go-edit-page': BinGoEditPage
    }
}
