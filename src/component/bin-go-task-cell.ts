import {LitElement, css, html} from 'lit'
import {customElement, property} from 'lit/decorators.js'
import {BinGoCellState, Storage} from "../storage.ts";

@customElement('bin-go-task-cell')
export class BinGoTaskCell extends LitElement {

    @property()
    public cellState?: BinGoCellState;

    private readonly storage = new Storage()

    private timer?: number

    private startHold = (e: Event) => {
        e.preventDefault()
        this.shadowRoot!.querySelector('.circle')?.classList.add('marking')

        this.timer = setTimeout(() => {
            console.log('Held for 3.5 seconds!');
            this.shadowRoot!.querySelector('.circle')?.classList.remove('marking')
            // Add your final action here
            this.mark()
        }, 2000);
    };

    private cancelHold = () => {
        clearTimeout(this.timer);
        this.shadowRoot!.querySelector('.circle')?.classList.remove('marking')
    };

    render() {
        return html`
            <div class="cell ${this.cellState?.marked ? 'marked' : ''}" 
                 @touchstart="${this.startHold}"
                 @touchend="${this.cancelHold}"
                 @touchcancel="${this.cancelHold}"
                 @mousedown="${this.startHold}"
                 @mouseup="${this.cancelHold}"
                 @mouseleave="${this.cancelHold}"
            >
                <div class="circle"></div>
                <div class="label">${this.cellState?.name}</div>
            </div>
        `
    }

    private mark() {
        if (!this.cellState || this.cellState.marked) {
            return
        }

        this.cellState.marked = true;
        this.storage.updateCellState(this.cellState)
        this.requestUpdate()

        this.dispatchEvent(new CustomEvent('marked', {
            detail: 'marked',
            bubbles: true,
            composed: true
        }));
    }

    static styles = css`
        .cell {
            padding: 0.5rem;
            border-radius: 5px;
            display: flex;
            user-select: none;

            cursor: pointer;
            background: white;
            font-size: 2.5rem;
            
            position: relative;
            overflow: hidden;
            
            transition: transform 0.1s ease-in;
        }
        
        .cell:not(.marked):hover {
            transform: scale(1.05);
        }

        .label {
            margin: auto;
            z-index: 2;
            text-transform: uppercase;
        }

        .marked {
            background: #82c0cc;
            cursor: default;
        }
        
        .marking {
            animation: circleAnimation 2s linear;
        }
        
        .circle {
            position: absolute;
            z-index: 1;
            width: 0;
            height: 0;
            border-radius: 50%;
            background-color: var(--app-color-task-marked-background);
            opacity: 0;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            pointer-events: none;
        }

        @keyframes circleAnimation {
            to {
                width: 80px;
                height: 80px;
                opacity: 1;
            }
        }
    `
}

declare global {
    interface HTMLElementTagNameMap {
        'bin-go-task-cell': BinGoTaskCell
    }
}
