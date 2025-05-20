import {LitElement, css, html, nothing} from 'lit'
import {customElement, state} from 'lit/decorators.js'
import {BinGoRewardSpec, BinGoTask, Rarity, Storage} from "../storage.ts";
import '../component/bin-go-reward-editor.ts';
import ShortUniqueId from 'short-unique-id';

@customElement('bin-go-edit-page')
export class BinGoEditPage extends LitElement {

    private version = 1;

    private readonly uid = new ShortUniqueId({ length: 6 });

    private readonly tasks: BinGoTask[] = [
        { key: `${this.uid.rnd()}`, label: ''},
        { key: `${this.uid.rnd()}`, label: ''},
        { key: `${this.uid.rnd()}`, label: ''},
        { key: `${this.uid.rnd()}`, label: ''},
        { key: `${this.uid.rnd()}`, label: ''},
        { key: `${this.uid.rnd()}`, label: ''},
        { key: `${this.uid.rnd()}`, label: ''},
        { key: `${this.uid.rnd()}`, label: ''},
        { key: `${this.uid.rnd()}`, label: ''}
    ]

    private readonly rewardSpecs: BinGoRewardSpec[] = []

    @state()
    private editing?: BinGoTask | BinGoRewardSpec = undefined

    private storage = new Storage()

    constructor() {
        super();

        const config = this.storage.getConfig();
        if (config) {
            this.tasks = config.tasks;
            this.rewardSpecs = config.rewardSpecs;
        }
    }

    render() {
        return html`
            <h1>Edit Mode</h1>

            <h3>Define 9 Tasks</h3>
            <div class="list">
                ${this.tasks.map(task => this.renderTaskRow(task))}
            </div>

            <h3>Define Rewards</h3>
            <div class="list">
                ${this.rewardSpecs.map(rewardSpec => {
                    return html`
                        <div class="list-item reward-item">
                            <bin-go-reward-editor .rewardSpec="${rewardSpec}" .editing="${this.editing === rewardSpec}" @done="${(event: CustomEvent) => {
                                    event.stopPropagation()
                                    this.editing = undefined          
                                }}"></bin-go-reward-editor>
                            ${!this.editing ? html`
                                <a href="#" @click="${() => this.editing = rewardSpec}">Edit</a>
                                <a href="#" @click="${() => {
                                        this.rewardSpecs.splice(this.rewardSpecs.indexOf(rewardSpec), 1)
                                        this.requestUpdate()
                                    }}">Remove</a>
                            ` : nothing}
                        </div>
                    `
                })}
                <div class="list-actions">
                    <span>Add:</span>
                    <a href="#" @click="${() => {
                        const newEmptyReward = { key: `${this.uid.rnd()}`, label: '', type: 'item', min: 1, max: 1, partsToAWhole: 1, rarity: Rarity.Common }
                        this.rewardSpecs.push(newEmptyReward)
                        this.editing = newEmptyReward
                        this.requestUpdate()
                    }}">Item</a>
                    <a href="#" @click="${() => {
                        const newEmptyReward = { key: `${this.uid.rnd()}`, label: '', type: 'coins', min: 3, max: 8, partsToAWhole: 1, rarity: Rarity.Common }
                        this.rewardSpecs.push(newEmptyReward)
                        this.editing = newEmptyReward
                        this.requestUpdate()
                    }}">Coins</a>
                </div>
            </div>

            <div class="action-bar">
                <a class="link" href="#" @click="${this.done}">Done</a>
            </div>
        `
    }

    private renderTaskRow(task: BinGoTask) {
        return html`
            <div class="list-item task-item">
                <input class="task-name" .value="${task.label}" @input=${this.inputToObjectUpdateHandler(task, 'label')}/>
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
        this.storage.updateConfig({
            version: this.version,
            tasks: this.tasks,
            rewardSpecs: this.rewardSpecs,
        })
        this.storage.clearState()
        this.sendDone();
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
        :host {
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
            }
            .action-bar {
                margin-top: 1rem;
            }
        }  `
}

declare global {
    interface HTMLElementTagNameMap {
        'bin-go-edit-page': BinGoEditPage
    }
}
