
export const setValue = function(object: any, property: string): ((event: Event) => void) {
    return (event: Event) => {
        const target = event.target as HTMLInputElement
        object[property] = target.value
    }
}

export const setNumber = function(object: any, property: string): ((event: Event) => void) {
    return (event: Event) => {
        const target = event.target as HTMLInputElement
        object[property] = Number(target.value)
    }
}
