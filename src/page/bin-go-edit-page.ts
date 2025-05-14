import {LitElement, css, html} from 'lit'
import {customElement} from 'lit/decorators.js'
import {BinGoReward, BinGoTask, Storage} from "../storage.ts";

@customElement('bin-go-edit-page')
export class BinGoEditPage extends LitElement {

    private version = 1;

    private readonly taskItems: BinGoTask[] = [
        { key: '', label: '' },
        { key: '', label: '' },
        { key: '', label: '' },
        { key: '', label: '' },
        { key: '', label: '' },
        { key: '', label: '' },
        { key: '', label: '' },
        { key: '', label: '' },
        { key: '', label: '' }
    ]
    private readonly rewardItems: BinGoReward[] = [
        { key: '', label: '', type: 'item', min: 1, max: 1, partsToAWhole: 1 },
        { key: '', label: '', type: 'item', min: 1, max: 1, partsToAWhole: 1 },
        { key: '', label: '', type: 'item', min: 1, max: 1, partsToAWhole: 1 },
        { key: '', label: '', type: 'item', min: 1, max: 1, partsToAWhole: 1 },
        { key: '', label: '', type: 'item', min: 1, max: 1, partsToAWhole: 1 },
        { key: '', label: '', type: 'item', min: 1, max: 1, partsToAWhole: 1 }
    ]

    private storage = new Storage()

    constructor() {
        super();

        const config = this.storage.getConfig();
        if (config) {
            this.taskItems = config.tasks;
            this.rewardItems = config.rewards;
        }
    }

    render() {
        return html`
            <h1>Edit Mode</h1>

            <h3>Define 9 Tasks</h3>
            <div class="list">
                ${this.taskItems.map((task: BinGoTask, index: number) => {
                    return html`
                        <div class="list-item task-item">
                            <span>${index + 1}.</span>
                            <input class="task-name" data-index="${index}" .value=${task.label}
                                   @input=${this.inputHandler(this.taskItems)}/>
                        </div>`;
                })}
            </div>

            <h3>Define 6 Rewards</h3>
            <div class="list">
                ${this.rewardItems.map((reward: BinGoReward, index: number) => {
                    return html`
                        <div class="list-item reward-item">
                            <span>${index + 1}.</span>
                            <input class="reward-name" data-index="${index}" .value=${reward.label}
                                   @input=${this.inputHandler(this.rewardItems)}/>
                        </div>`;
                })}
            </div>

            <div class="action-bar">
                <a class="link" href="#" @click="${this.done}">Done</a>
            </div>
        `
    }

    private inputHandler(collection: (BinGoTask | BinGoReward)[]): ((event: Event) => void) {
        return (event: Event) => {
            const target = event.target as HTMLInputElement;
            const index = Number(target.dataset.index);
            collection[index].label = target.value;
            this.requestUpdate();
        }
    }

    private done() {
        this.storage.updateConfig({
            version: this.version,
            tasks: this.taskItems,
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
