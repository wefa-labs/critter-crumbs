/**
 * Text widths for the name tags, measured in the page's own font as the scatter page measures its tags (offsetWidth),
 * so the layout places tags at their real size. Without a canvas (tests, a locked-down browser) the layout falls back
 * to its estimate.
 */
let context: CanvasRenderingContext2D | null | undefined;
let family = '';
export function measureText(text: string, size: number, weight: number): number | undefined {
  if (context === undefined) {
    context = typeof document === 'undefined' ? null : document.createElement('canvas').getContext('2d');
    family = typeof document === 'undefined' ? '' : getComputedStyle(document.documentElement).getPropertyValue('--cc-font-body').trim();
  }
  if (!context || !family) return undefined;
  context.font = `${weight} ${size}px ${family}`;
  return context.measureText(text).width;
}
