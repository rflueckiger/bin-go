export class Item {
    public readonly key: string;
    public readonly label: string;
    public amount: number = 1;
    public partsToAWhole: number = 1;

    constructor(key: string, label: string) {
        this.key = key;
        this.label = label;
    }
}