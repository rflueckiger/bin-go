import {css, html, LitElement, nothing} from 'lit'
import {customElement, query, state} from 'lit/decorators.js'
import {storage} from "../storage.ts";
import {BinGoStateBuilder} from "../bin-go-state-builder.ts";
import {getISOWeek} from "date-fns/getISOWeek";
import {getYear} from "date-fns/getYear";
import '../component/bin-go-task-cell.ts'
import {BoardState} from "../domain/board-state.ts";
import {TaskCellState} from "../domain/task-cell-state.ts";
import {RewardCellState} from "../domain/reward-cell-state.ts";
import '../component/bin-go-inventory.ts';
import {RewardBoxQuality} from "../domain/reward-box.ts";
import {BinGoConfirmationDialog} from "../component/bin-go-confirmation-dialog.ts";
import '../component/bin-go-confirmation-dialog.ts';
import {CellState} from "../domain/cell-state.ts";
import {classMap} from 'lit/directives/class-map.js';
import {AppCollectRewardsDialog} from "../component/app-collect-rewards-dialog.ts";
import '../component/app-collect-rewards-dialog.ts';


@customElement('bin-go-play-page')
export class BinGoPlayPage extends LitElement {

    @state()
    private state?: BoardState

    @query('#reset-board-dialog')
    resetBoardDialog!: HTMLElement

    @query('#collect-rewards-dialog')
    collectRewardsDialog!: AppCollectRewardsDialog

    constructor() {
        super();

        const state = storage.loadState()
        if (state && !this.hasExpired(state)) {
            this.state = state
        } else {
            // if there is no game state or if the game state has expired, create new game state
            this.resetState()
        }
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
            <div class="header-row">
                <div class="action-bar bar-left">
                    <a class="link" href="#" @click="${this.handleResetStateRequest}">Reset</a>
                </div>
                <h1 class="header">BinGo!</h1>
                <div class="action-bar bar-right">
                    <a class="link" href="#" @click="${this.sendEdit}">Edit</a>
                </div>
            </div>            
            ${this.renderBoard()}
            <h1 class="header">Inventory</h1>
            <bin-go-inventory></bin-go-inventory>
            <bin-go-confirmation-dialog id="reset-board-dialog" @confirm="${() => this.resetState()}"></bin-go-confirmation-dialog>
            <app-collect-rewards-dialog id="collect-rewards-dialog"></app-collect-rewards-dialog>
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
            const classes = { cell: true, reward: true, unlocked: rewardCellState.unlocked, collected: rewardCellState.collected }
            return html`
                <div class="${classMap(classes)}" @click="${() => this.collectRewards(rewardCellState)}">
                    <div class="label">${rewardCellState.rewardBox.getQuality() === RewardBoxQuality.superior ? '⭐️' : '📦'}</div>
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
        [0, 1, 2].map(i => state.tasks[i].marked).reduce((rowMarked, cellMarked) => rowMarked && cellMarked) && (this.unlockRewards(this.state.rewards[0]));
        [3, 4, 5].map(i => state.tasks[i].marked).reduce((rowMarked, cellMarked) => rowMarked && cellMarked) && (this.unlockRewards(this.state.rewards[1]));
        [6, 7, 8].map(i => state.tasks[i].marked).reduce((rowMarked, cellMarked) => rowMarked && cellMarked) && (this.unlockRewards(this.state.rewards[2]));

        // column 1/2/3
        [0, 3, 6].map(i => state.tasks[i].marked).reduce((rowMarked, cellMarked) => rowMarked && cellMarked) && (this.unlockRewards(this.state.rewards[3]));
        [1, 4, 7].map(i => state.tasks[i].marked).reduce((rowMarked, cellMarked) => rowMarked && cellMarked) && (this.unlockRewards(this.state.rewards[4]));
        [2, 5, 8].map(i => state.tasks[i].marked).reduce((rowMarked, cellMarked) => rowMarked && cellMarked) && (this.unlockRewards(this.state.rewards[5]));

        storage.saveState(this.state)
        this.requestUpdate()
    }

    private unlockRewards(rewardCellState: RewardCellState) {
        if (rewardCellState.unlocked || rewardCellState.collected) {
            return
        }

        const markedAsUnlocked = storage.markRewardCellUnlocked(rewardCellState.id)
        if (markedAsUnlocked) {
            rewardCellState.unlocked = true
        }
    }

    private collectRewards(rewardCellState: RewardCellState) {
        if (!rewardCellState.unlocked || rewardCellState.collected) {
            return
        }

        const markedAsCollected = storage.markRewardCellCollected(rewardCellState.id)
        if (markedAsCollected) {
            rewardCellState.collected = true;

            const rewards = rewardCellState.rewardBox.getContent()
            storage.updateInventory(rewards)
            this.requestUpdate()

            this.collectRewardsDialog.show(rewards)
        }
    }

    private handleResetStateRequest() {
        (this.resetBoardDialog as BinGoConfirmationDialog).show(
            'Spielbrett zurücksetzen?',
            'Bist du sicher, dass du das aktuelle Spielbrett zurücksetzen willst?');
    }

    private resetState() {
        const config = storage.getConfig()
        if (!config) {
            throw new Error('IllegalStateException')
        }
        this.state = new BinGoStateBuilder(config).createState()
        storage.saveState(this.state)
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
        .board {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr auto;
            grid-gap: 8px;
        }
        .header-row {
            display: flex;
            align-items: baseline;
        }
        .header {
            text-align: center;
            flex: 1;
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

        .cell.reward .label {
            font-size: 3.25rem;
            line-height: 3.25rem;
            margin: auto;
        }

        .cell.reward.collected {
            visibility: hidden;
        }

        .action-bar {
            display: flex;
            gap: 0.5rem;
        }

        .link {
            color: #16697a;
            text-decoration: underline;
        }
        .link:hover {
            color: #ffa62b;
        }

        .cell.reward.unlocked {
            background: white;
        }
        
        .cell.reward.unlocked > .label {
            cursor: pointer;
            display: inline-block;
            animation: wiggle 3s ease-in-out infinite;
        }

        @keyframes wiggle {
            0%, 100% { transform: rotate(0deg); }
            3% { transform: rotate(-10deg); }
            6% { transform: rotate(10deg); }
            9% { transform: rotate(-6deg); }
            12% { transform: rotate(6deg); }
            15% { transform: rotate(3deg); }
            18% { transform: rotate(-3deg); }
            21% { transform: rotate(0deg); }
        }
    `
}

declare global {
    interface HTMLElementTagNameMap {
        'bin-go-play-page': BinGoPlayPage
    }
}
