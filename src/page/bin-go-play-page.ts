import {LitElement, css, html, nothing} from 'lit'
import {customElement, state} from 'lit/decorators.js'
import {Storage} from "../storage.ts";
import {BinGoStateBuilder} from "../bin-go-state-builder.ts";
import {getISOWeek} from "date-fns/getISOWeek";
import {getYear} from "date-fns/getYear";
import '../component/bin-go-task-cell.ts'
import {BinGoState} from "../domain/bin-go-state.ts";
import {CellState} from "../domain/cell-state.ts";
import {TaskCellState} from "../domain/task-cell-state.ts";
import {RewardCellState} from "../domain/reward-cell-state.ts";
import {Item} from "../domain/item.ts";

@customElement('bin-go-play-page')
export class BinGoPlayPage extends LitElement {

    private readonly storage = new Storage()

    @state()
    private readonly state?: BinGoState

    constructor() {
        super();

        let state = this.storage.getState()

        // if there is no game state or if the game state has expired, create new game state
        if (!state || this.hasExpired(state)) {
            const config = this.storage.getConfig()
            if (!config) {
                throw new Error('IllegalStateException')
            }
            state = new BinGoStateBuilder(config).createState()
            this.storage.updateState(state)
        }

        this.state = state;
    }

    private hasExpired(_state: BinGoState) {
        const stateDate = new Date(_state.createdAt)
        const currentDate = new Date()

        const stateWeek = getISOWeek(stateDate)
        const stateYear = getYear(stateDate)
        const currentWeek = getISOWeek(currentDate)
        const currentYear = getYear(currentDate)

        console.log(`Checking state for expiration - state week ${stateWeek}/${stateYear} <-> current week: ${currentWeek}/${currentYear}`)
        if (stateWeek !== currentWeek || getYear(stateDate) !== getYear(currentDate)) {
            console.log('State has expired.')
            return true;
        }
        return false;
    }

    render() {
        return html`
            <h1>Play Mode</h1>
            ${this.renderBoard()}
            <div class="action-bar">
                <a class="link" href="#" @click="${this.sendEdit}">Edit</a>
            </div>
        `
    }

    private renderBoard() {
        if (!this.state) {
            return nothing
        }

        if (!this.state.rewards || this.state.rewards.length !== 6) {
            return html`Rewards not properly generated!`
        }

        const state = this.state;

        const cellStates: CellState[] = []
        cellStates.push(...[0, 1, 2].map(i => state.tasks[i]))
        cellStates.push(this.state.rewards[0])
        cellStates.push(...[3, 4, 5].map(i => state.tasks[i]))
        cellStates.push(this.state.rewards[1])
        cellStates.push(...[6, 7, 8].map(i => state.tasks[i]))
        cellStates.push(...this.state.rewards.slice(2))

        return html`
            <div class="board">
                ${cellStates.map(cellState => this.renderCell(cellState))}
            </div>
        `
    }

    private renderCell(cellState: CellState) {
        if (cellState.type === 'task') {
            const taskCellState = cellState as TaskCellState
            return html`<bin-go-task-cell .cellState="${taskCellState}" @marked="${this.marked}" ></bin-go-task-cell>`
        } else if (cellState.type === 'reward') {
            const rewardCellState = cellState as RewardCellState
            // TODO: properly handle coins/items -> extract to separate component class: bin-go-reward-cell
            // TODO: handle hidden rewards -> visualize with question mark of something like this
            return html`
                <div class="cell reward ${rewardCellState.marked ? 'marked' : ''}">
                    <div class="label">${(rewardCellState.reward as Item).label}</div>
                </div>`
        }
        return nothing
    }

    private marked() {
        if (!this.state) {
            return
        }

        const state = this.state;

        // line 1/2/3
        [0, 1, 2].map(i => state.tasks[i].marked).reduce((rowMarked, cellMarked) => rowMarked && cellMarked) && (this.state.rewards[0].marked = true);
        [3, 4, 5].map(i => state.tasks[i].marked).reduce((rowMarked, cellMarked) => rowMarked && cellMarked) && (this.state.rewards[1].marked = true);
        [6, 7, 8].map(i => state.tasks[i].marked).reduce((rowMarked, cellMarked) => rowMarked && cellMarked) && (this.state.rewards[2].marked = true);

        // column 1/2/3
        [0, 3, 6].map(i => state.tasks[i].marked).reduce((rowMarked, cellMarked) => rowMarked && cellMarked) && (this.state.rewards[3].marked = true);
        [1, 4, 7].map(i => state.tasks[i].marked).reduce((rowMarked, cellMarked) => rowMarked && cellMarked) && (this.state.rewards[4].marked = true);
        [2, 5, 8].map(i => state.tasks[i].marked).reduce((rowMarked, cellMarked) => rowMarked && cellMarked) && (this.state.rewards[5].marked = true);

        this.storage.updateState(this.state)
        this.requestUpdate()
    }

    private sendEdit() {
        const event = new CustomEvent('edit', {
            detail: 'edit',
            bubbles: true,
            composed: true
        });

        this.dispatchEvent(event);
    }

    static styles = css`
        :host {
            .board {
                display: grid;
                grid-template-columns: 1fr 1fr 1fr 1fr;
                grid-gap: 8px;
            }
            
            .cell {
                padding: 0.5rem;
                border-radius: 5px;
                display: flex;
                user-select: none;
            }

            .cell .label {
                margin: auto;
                text-transform: uppercase;
            }
            
            .cell.reward {
                background: #ffa62b;
            }
            
            .cell.reward.marked {
                background: #ffa62b;
                opacity: 0.25;
            }
            
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
        }`
}

declare global {
    interface HTMLElementTagNameMap {
        'bin-go-play-page': BinGoPlayPage
    }
}
