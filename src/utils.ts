export const formatUSD = (amount: number, places = 2) =>
    amount.toLocaleString(undefined, {
        minimumFractionDigits: places,
        maximumFractionDigits: places,
    });

export const rangeMinSize = (size: number, startAt: number, minSize = 10) => size >= minSize ? range(size, startAt) : range(minSize, startAt, size / minSize);

export const range = (size: number, startAt = 0, step = 1): ReadonlyArray<number> => [...Array(size).keys()].map(i => (i + startAt) * step);

export const format = (input: string, ...args: string[]) => input.replace(/{(\d+)}/g, (match, number) => typeof args[number] != 'undefined' ? args[number] : match);