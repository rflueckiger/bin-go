
export interface HasKey {
    key: string
}

export function replaceAt<T extends HasKey>(items: T[], newItem: T): T[] {
    const existingItemIndex = items.findIndex(item => item.key === newItem.key)
    if (existingItemIndex < 0) {
        throw Error(`Cannot replace item! No item found with key: ${newItem.key}`)
    }
    return [...items.slice(0, existingItemIndex), newItem, ...items.slice(existingItemIndex + 1)];
}