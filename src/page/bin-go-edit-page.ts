import {LitElement, css, html} from 'lit'
import {customElement, state} from 'lit/decorators.js'
import {BinGoReward, BinGoTask, Storage} from "../storage.ts";
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

    private readonly rewardItems: BinGoReward[] = []

    @state()
    private editing?: BinGoTask | BinGoReward = undefined

    private storage = new Storage()

    constructor() {
        super();

        const config = this.storage.getConfig();
        if (config) {
            this.tasks = config.tasks;
            this.rewardItems = config.rewards;
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
                ${this.rewardItems.map(reward => this.renderRewardRow(reward))}
                <div class="list-actions">
                    <span>Add:</span>
                    <a href="#" @click="${() => {
                        const newEmptyReward = { key: `${this.uid.rnd()}`, label: '', type: 'item', min: 1, max: 1, partsToAWhole: 1 }
                        this.rewardItems.push(newEmptyReward)
                        this.editing = newEmptyReward
                        this.requestUpdate()
                    }}">Item</a>
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
                <input class="key" .value="${task.key}" @input="${this.inputToObjectUpdateHandler(task, 'key')}"/>
                <input class="task-name" .value="${task.label}" @input=${this.inputToObjectUpdateHandler(task, 'label')}/>
            </div>
        `
    }

    private renderRewardRow(reward: BinGoReward) {
        return html`
            <div class="list-item reward-item">
                <bin-go-reward-editor .reward="${reward}" .editable="${!this.editing}" .editing="${this.editing === reward}" @edit="${() => this.editing = reward}" @done="${() => this.editing = undefined}"></bin-go-reward-editor>
            </div>`;
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
            rewards: this.rewardItems,
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
        }  `
}

declare global {
    interface HTMLElementTagNameMap {
        'bin-go-edit-page': BinGoEditPage
    }
}
