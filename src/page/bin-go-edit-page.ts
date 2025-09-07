import {css, html, LitElement, nothing} from 'lit'
import {customElement, query, state} from 'lit/decorators.js'
import '../component/bin-go-reward-spec.ts';
import {TaskAndRewardFactory} from "../domain/task-and-reward-factory.ts";
import {Rarity} from "../domain/reward.ts";
import {BinGoRewardEditDialog, EditorOperation} from "../component/bin-go-reward-edit-dialog.ts";
import '../component/bin-go-reward-edit-dialog.ts';
import {replaceAt} from "../domain/util/array-util.ts";
import {AppAddSponsoredCollectibleDialog} from "../component/app-add-sponsored-collectible-dialog.ts";
import '../component/app-add-sponsored-collectible-dialog.ts'
import {RewardSpec} from "../domain/config/reward-spec.ts";
import {Task} from "../domain/config/task.ts";
import {RewardSpecType} from "../domain/config/reward-spec-type.ts";
import {APP_DATA} from "../service/app-data.ts";
import {chances} from "../domain/config/chances.ts";
import {RewardCollection} from "../domain/reward-collection.ts";
import chevronLeft from '../assets/icons/chevron-left.svg?raw';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import '../simulation/reward-simulation-panel.ts';

@customElement('bin-go-edit-page')
export class BinGoEditPage extends LitElement {

    private version = 1;

    private taskAndRewardFactory = new TaskAndRewardFactory();

    @state()
    private tasks: Task[] | undefined

    @state()
    private collection: RewardCollection | undefined

    @state()
    private rewardSpecs: RewardSpec[] | undefined

    @query('#reward-editor-dialog')
    rewardEditorDialog!: HTMLElement

    @query('#add-sponsored-collectible-dialog')
    addSponsoredCollectibleDialog!: AppAddSponsoredCollectibleDialog

    constructor() {
        super();

        APP_DATA.configService.getConfig().then(config => {
            if (config) {
                this.tasks = config.tasks;
                this.rewardSpecs = config.rewardSpecs;
            } else {
                this.tasks = Array.from({ length: 9 }, () => this.taskAndRewardFactory.newTask())
                this.rewardSpecs = []
            }
        })

        APP_DATA.collectionService.getRewardCollection().then(c => this.collection = c)
    }

    render() {
        if (!this.tasks || !this.rewardSpecs) {
            return nothing
        }

        return html`
            <div class="header-bar">
                <div class="action" @click="${this.done}">
                    <div class="icon">${unsafeSVG(chevronLeft)}</div>
                    <span class="label">Zurück</span>
                </div>
            </div>
            
            <sl-tab-group>
                <sl-tab slot="nav" panel="tasks">Aufgaben</sl-tab>
                <sl-tab slot="nav" panel="rewards">Belohnungen</sl-tab>
                <sl-tab slot="nav" panel="simulation">Simulation</sl-tab>
                
                <sl-tab-panel class="panel" name="tasks">
                    <div class="foldable">
                        <div class="paragraph">Definiere deine 9 Aufgaben, die du idealerweise jede Woche erledigen möchtest.
                            Es müssen nicht 9 verschiedene Aufgaben sein. Damit aber die App funktioniert, macht es Sinn, wenn
                            es zumindest 5-7 verschiedene sind.</div>
                        <div class="paragraph">Die Reihenfolge der Aufgaben hier spielt keine Rolle. Verwende jeweils 1-2 Emojis um deine Aufgaben darzustellen.</div>
                    </div>
                    <div class="list task-list">
                        <div class="task-row">${this.tasks.slice(0, 3).map(task => this.renderTaskRow(task))}</div>
                        <div class="task-row">${this.tasks.slice(3, 6).map(task => this.renderTaskRow(task))}</div>
                        <div class="task-row">${this.tasks.slice(6, 9).map(task => this.renderTaskRow(task))}</div>
                    </div>
                </sl-tab-panel>
                
                <sl-tab-panel class="panel" name="rewards">
                    <div class="foldable">
                        <div class="paragraph">Hier kannst du deine Belohnungen erfassen. Belohnungen gehören jeweils zu einer von 4 Raritätsstufen: Common, Uncommon, Rare und Epic</div>
                        <div class="paragraph">Eine Belohnung der Gruppe Common erhältst du immer!</div>
                        <div class="paragraph">Unten siehst du jeweils wie gross die Chance ist, dass zusätzlich eine Belohnung einer bestimmten Gruppe erscheint.
                            Innerhalb einer Gruppe ist die Chance dann jeweils für alle Belohnungen gleich.</div>
                        <div class="paragraph">Idealerweise erfasst für jede Gruppe mindestens 3-4 Belohnungen um das Spiel spannend zu halten.</div>
                    </div>
                    ${Object.values(Rarity).map(rarity => this.renderRewardGroup(rarity))}
                    <div class="list-actions">
                        <a href="#" @click="${this.showNewRewardDialog}">Belohnung hinzufügen</a>
                        <a href="#" @click="${() => this.addSponsoredCollectibleDialog.open()}">Geheime Belohnung hinzufügen</a>
                    </div>
                    
                    <bin-go-reward-edit-dialog id="reward-editor-dialog" @saved="${this.handleRewardSaved}"></bin-go-reward-edit-dialog>
                    <app-add-sponsored-collectible-dialog id="add-sponsored-collectible-dialog" @saved="${this.handleRewardSaved}"></app-add-sponsored-collectible-dialog>
                </sl-tab-panel>
                
                <sl-tab-panel class="panel" name="simulation">
                    <reward-simulation-panel .rewardSpecs="${this.rewardSpecs}"></reward-simulation-panel>    
                </sl-tab-panel>
            </sl-tab-group>           
        `
    }

    private renderRewardGroup(rarity: Rarity) {
        const specs = this.rewardSpecs!.filter(spec => spec.rarity === rarity);
        return html`
            <div class="paragraph"><strong>${this.capitalize(rarity)}</strong>: ${this.dropChance(rarity)}</div>
            ${specs.length > 0 ? html`
                <div class="list reward-list">
                    ${specs.map(spec => {
                        const inCollection = this.isInCollection(spec)
                        return html`
                        <div class="list-item reward-item">
                            <bin-go-reward-spec .rewardSpec="${spec}" ?inCollection="${inCollection}"></bin-go-reward-spec>
                            ${spec.type !== RewardSpecType.SponsoredCollectible ? 
                                    html`<a href="#" @click="${() => this.showEditRewardDialog(spec)}">Ändern</a>` : nothing }
                            <a href="#" @click="${() => this.removeReward(spec)}">Löschen</a>
                        </div>
                    `
                    })}
                </div>
            ` : html`
               <div class="paragraph">Keine Belohnungen</div>
            ` }
        `
    }

    private isInCollection(rewardSpec: RewardSpec): boolean {
        if (!this.collection) {
            return false
        }
        return !!this.collection.getContent().find(reward => reward.key == rewardSpec.key)
    }

    private dropChance(rarity: Rarity): string {
        return new Intl.NumberFormat('de-CH', {
            style: 'percent',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(chances[rarity] / 1000);
    }

    private capitalize(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    private removeReward(rewardSpec: RewardSpec) {
        if (!this.rewardSpecs) {
            return
        }

        this.rewardSpecs.splice(this.rewardSpecs.indexOf(rewardSpec), 1)
        this.save()
        this.requestUpdate()
    }

    private showEditRewardDialog(rewardSpec: RewardSpec) {
        (this.rewardEditorDialog as BinGoRewardEditDialog).show(rewardSpec)
    }

    private showNewRewardDialog() {
        (this.rewardEditorDialog as BinGoRewardEditDialog).show()
    }

    private handleRewardSaved(e: Event) {
        e.stopPropagation()

        if (!this.rewardSpecs) {
            return
        }

        const customEvent: CustomEvent = e as CustomEvent;
        const rewardSpec = customEvent.detail.result as RewardSpec
        if (customEvent.detail?.operation === EditorOperation.Edit) {
            this.rewardSpecs = replaceAt(this.rewardSpecs, rewardSpec)
        } else if (customEvent.detail?.operation === EditorOperation.New) {
            this.rewardSpecs = [...this.rewardSpecs, rewardSpec]
        }

        this.save(() => {
            APP_DATA.collectionService.updateReward(rewardSpec)
            APP_DATA.stateService.updateReward(rewardSpec)
        })
    }

    private renderTaskRow(task: Task) {
        // TODO: check that only emojis are entered and a maximum of 2 (EmojiUtil.countEmojis)
        return html`
            <div class="list-item task-item">
                <input class="task-icon" .value="${task.icon}" @input=${this.inputToObjectUpdateHandler(task, 'icon', () => {
                    this.save()
                    this.requestUpdate()
                })}/>
            </div>
        `
    }

    private inputToObjectUpdateHandler(object: any, property: string, then: () => void): ((event: Event) => void) {
        return (event: Event) => {
            const target = event.target as HTMLInputElement
            object[property] = target.value
            then()
        }
    }

    private done() {
        this.sendDone();
    }

    private save(then?: () => void) {
        if (!this.tasks || !this.rewardSpecs) {
            return
        }

        APP_DATA.configService.save({
            version: this.version,
            tasks: this.tasks,
            rewardSpecs: this.rewardSpecs,
        }).then(() => {
            if (then) {
                then()
            }
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
        .header-bar {
            display: flex;
            margin: var(--app-content-vertical-margin) var(--app-content-horizontal-margin) 0;
        }
        .action {
            display: flex;
            gap: 5px;
            cursor: pointer;
        }
        .action:hover > .icon,
        .action:hover > .label {
            color: #ffa62b;
        }
        .link {
            cursor: pointer;
            color: #16697a;
            text-decoration: underline;
        }
        .link:hover {
            color: #ffa62b;
        }
        .panel {
            margin: 0 var(--app-content-horizontal-margin);
        }
        .paragraph {
            max-width: 55ch;
            margin: 1rem auto;
            text-align: center;
        }
        .title {
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
            display: flex;
            flex-direction: column;
        }
        .action-bar {
            margin-top: 1rem;
            text-align: center;
            display: flex;
            flex-direction: column;
        }
    `
}

declare global {
    interface HTMLElementTagNameMap {
        'bin-go-edit-page': BinGoEditPage
    }
}
