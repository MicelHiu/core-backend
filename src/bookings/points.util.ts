export const POINTS_PER_HOUR_PER_SEAT = 10;

export function calculatePointsEarned(quantity: number, timeStart: string, timeEnd: string): number {
    const toHour = (t: string) => parseInt(t.split(':')[0], 10);
    const duration = Math.max(0, toHour(timeEnd) - toHour(timeStart));
    return POINTS_PER_HOUR_PER_SEAT * duration * quantity;
}
