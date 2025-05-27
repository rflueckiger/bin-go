import {css, html, LitElement, nothing} from 'lit'
import {customElement, state} from 'lit/decorators.js'
import {Rarity, storage} from "../storage.ts";
import {BinGoStateBuilder} from "../bin-go-state-builder.ts";
import {getISOWeek} from "date-fns/getISOWeek";
import {getYear} from "date-fns/getYear";
import '../component/bin-go-task-cell.ts'
import {BoardState} from "../domain/board-state.ts";
import {CellState} from "../domain/cell-state.ts";
import {TaskCellState} from "../domain/task-cell-state.ts";
import {RewardCellState} from "../domain/reward-cell-state.ts";
import '../component/bin-go-inventory.ts';

@customElement('bin-go-play-page')
export class BinGoPlayPage extends LitElement {

    @state()
    private readonly state?: BoardState

    constructor() {
        super();

        let state = storage.getState()

        // if there is no game state or if the game state has expired, create new game state
        if (!state || this.hasExpired(state)) {
            const config = storage.getConfig()
            if (!config) {
                throw new Error('IllegalStateException')
            }
            state = new BinGoStateBuilder(config).createState()
            storage.updateState(state)
        }

        this.state = state;
    }

    private hasExpired(state: BoardState) {
        const stateDate = new Date(state.createdAt)
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
            <h1>BinGo!</h1>
            <div class="action-bar">
                <a class="link" href="#" @click="${this.sendEdit}">Edit</a>
            </div>
            ${this.renderBoard()}
            <h1>Inventory</h1>
            <bin-go-inventory></bin-go-inventory>
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
            return html`
                <div class="cell reward ${rewardCellState.marked ? 'marked' : ''}">
                    ${!rewardCellState.marked ? html`<div class="label">${this.isSpecialRewardCell(rewardCellState) ? '💰💰' : '💰'}</div>` : nothing }
                </div>`
        }
        return nothing
    }

    private isSpecialRewardCell(rewardCellState: RewardCellState): boolean {
        return rewardCellState.rewards.length > 2
            || rewardCellState.rewards.filter(reward => reward.rarity === Rarity.Epic || reward.rarity === Rarity.Rare).length > 0
    }

    private marked() {
        if (!this.state) {
            return
        }

        const state = this.state;

        // line 1/2/3
        [0, 1, 2].map(i => state.tasks[i].marked).reduce((rowMarked, cellMarked) => rowMarked && cellMarked) && (this.collectRewards(this.state.rewards[0]));
        [3, 4, 5].map(i => state.tasks[i].marked).reduce((rowMarked, cellMarked) => rowMarked && cellMarked) && (this.collectRewards(this.state.rewards[1]));
        [6, 7, 8].map(i => state.tasks[i].marked).reduce((rowMarked, cellMarked) => rowMarked && cellMarked) && (this.collectRewards(this.state.rewards[2]));

        // column 1/2/3
        [0, 3, 6].map(i => state.tasks[i].marked).reduce((rowMarked, cellMarked) => rowMarked && cellMarked) && (this.collectRewards(this.state.rewards[3]));
        [1, 4, 7].map(i => state.tasks[i].marked).reduce((rowMarked, cellMarked) => rowMarked && cellMarked) && (this.collectRewards(this.state.rewards[4]));
        [2, 5, 8].map(i => state.tasks[i].marked).reduce((rowMarked, cellMarked) => rowMarked && cellMarked) && (this.collectRewards(this.state.rewards[5]));

        storage.updateState(this.state)
        this.requestUpdate()
    }

    private collectRewards(rewardCellState: RewardCellState) {
        if (rewardCellState.marked) {
            return
        }
        rewardCellState.marked = true
        storage.updateInventory(rewardCellState.rewards)
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
                min-height: 60px;
            }

            .cell .label {
                margin: auto;
                text-transform: uppercase;
            }
            
            .cell.reward {
                background: #ffa62b;
            }
            
            .cell.reward .label {
                font-size: 2.5rem;
            }
            
            .cell.reward.marked {
                background: #ffa62b;
                opacity: 0.25;
            }
            
            .action-bar {
                margin-bottom: 1.5rem;
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
