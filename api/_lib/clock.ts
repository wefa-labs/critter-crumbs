/** The sole server wall-clock adapter. Domain code receives this function. */
export const serverNow = (): number => Date.now();
