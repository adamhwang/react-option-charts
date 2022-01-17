export const formatUSD = (amount: number, places = 2) =>
    amount.toLocaleString(undefined, {
        minimumFractionDigits: places,
        maximumFractionDigits: places,
    });
