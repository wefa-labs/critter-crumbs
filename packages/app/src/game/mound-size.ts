/**
 * A mound of n crumbs: its rows and its drawn size. In a module of its own so that a screen outside the core game can
 * draw a heap without the circle's layout coming with it (the app shell has a size budget, Technical Spec §17).
 */
export function moundSize(n: number) { let rows = 0; while (rows * (rows + 1) / 2 < n) rows++; return { rows, width: Math.max(1, rows) * 5.2 + 8, height: Math.max(1, rows) * 3.4 + 9 }; }
