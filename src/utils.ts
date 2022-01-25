export const formatUSD = (amount: number, places = 2) =>
    amount.toLocaleString(undefined, {
        minimumFractionDigits: places,
        maximumFractionDigits: places,
    });

export const range = (size: number, startAt: number = 0): ReadonlyArray<number> => {
    return [...Array(size).keys()].map(i => i + startAt);
}

export const format = (input: string, ...args: string[]) => input.replace(/{(\d+)}/g, (match, number) => typeof args[number] != 'undefined' ? args[number] : match);