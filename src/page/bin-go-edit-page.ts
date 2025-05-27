import {LitElement, css, html, nothing} from 'lit'
import {customElement, state} from 'lit/decorators.js'
import {RewardSpec, Task, storage} from "../storage.ts";
import '../component/bin-go-reward-editor.ts';
import {TaskAndRewardFactory} from "../domain/task-and-reward-factory.ts";

@customElement('bin-go-edit-page')
export class BinGoEditPage extends LitElement {

    private version = 1;

    private taskAndRewardFactory = new TaskAndRewardFactory();

    private readonly tasks: Task[] = Array.from({ length: 9 }, () => this.taskAndRewardFactory.newTask())

    private readonly rewardSpecs: RewardSpec[] = []

    @state()
    private editing?: Task | RewardSpec = undefined

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
            <h3>Define 9 Tasks</h3>
            <div class="paragraph">Use Emojis to represent your tasks. For best experience use 1 Emoji per task.</div>
            <div class="list task-list">
                <div class="task-row">${this.tasks.slice(0, 3).map(task => this.renderTaskRow(task))}</div>
                <div class="task-row">${this.tasks.slice(3, 6).map(task => this.renderTaskRow(task))}</div>
                <div class="task-row">${this.tasks.slice(6, 9).map(task => this.renderTaskRow(task))}</div>
            </div>

            <h3>Define Rewards</h3>
            <div class="list reward-list">
                ${this.rewardSpecs.map(rewardSpec => {
                    return html`
                        <div class="list-item reward-item">
                            <bin-go-reward-editor .rewardSpec="${rewardSpec}" .editing="${this.editing === rewardSpec}" @done="${(event: CustomEvent) => {
                                    event.stopPropagation()
                                    this.editing = undefined          
                                }}"></bin-go-reward-editor>
                            ${!this.editing ? html`
                                ${!rewardSpec.owner ? html`<a href="#" @click="${() => this.editing = rewardSpec}">Edit</a>` : nothing}
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
                    <a href="#" @click="${() => this.addNewRewardSpec(this.taskAndRewardFactory.newItemSpec)}">Item</a>
                    <a href="#" @click="${() => this.addNewRewardSpec(this.taskAndRewardFactory.newCoinsSpec)}">Coins</a>
                </div>
            </div>

            <div class="action-bar">
                <a class="link" href="#" @click="${this.done}">Done</a>
            </div>
        `
    }

    private addNewRewardSpec(factoryMethod:() => RewardSpec) {
        const newEmptyReward = factoryMethod();
        this.rewardSpecs.push(newEmptyReward)
        this.editing = newEmptyReward
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
        storage.updateConfig({
            version: this.version,
            tasks: this.tasks,
            rewardSpecs: this.rewardSpecs,
        })
        storage.clearState()
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
            .paragraph {
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
