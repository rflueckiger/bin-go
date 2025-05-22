import {LitElement, css, html} from 'lit'
import {customElement} from 'lit/decorators.js'

@customElement('bin-go-inventory')
export class BinGoInventory extends LitElement {

    //private readonly storage = new Storage()

    //private inventory: Inventory

    constructor() {
        super();

        //this.inventory = this.storage.getInventory()
    }

    connectedCallback() {
        super.connectedCallback();
        //this.storage.addInventoryListener(this);
    }

    disconnectedCallback() {
        //this.storage.removeInventoryListener(this)
        super.disconnectedCallback();
    }

    render() {
        return html`No rewards collected yet`
    }

    static styles = css`
        :host {
            
        }
    `
}

declare global {
    interface HTMLElementTagNameMap {
        'bin-go-inventory': BinGoInventory
    }
}
