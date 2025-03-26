export const range = (start: number, end: number, step = 1): number[] => {
    const result = [];
    for (let idx = start; idx < end; idx += step) {
        result.push(idx);
    }
    return result;
};
