// Two palettes behind the same token names.
// `today` is packages/app/src/styles/tokens.json as shipped (the provisional values).
// `world` is Design System §3.1 and §4.2 as revised in PR #31 (D14).
export const PALETTES = {
  today: {
    label: 'Today',
    colours: {
      oat: '#F1E7D6', surface: '#FBF6EC', sunken: '#E6D9C3', burrow: '#2A211A', soil: '#5A4B3C', bark: '#6F6055',
      line: '#D6C7AD', 'line-strong': '#857463', honey: '#D89A2E', crust: '#A86B14', 'honey-tint': '#F5E6C4',
      moss: '#6B7F4A', 'moss-ink': '#43552B', 'moss-tint': '#DDE5CC', clay: '#C2563C', 'clay-ink': '#973A26', 'clay-tint': '#F3D9D0',
      dusk: '#7C7A94',
    },
    effects: {
      'shadow-1': '0 1px 2px rgb(42 33 26 / .10), 0 2px 6px rgb(42 33 26 / .06)',
      'shadow-2': '0 6px 16px rgb(42 33 26 / .14)',
      'shadow-3': '0 16px 40px rgb(42 33 26 / .22)',
      'shadow-up': '0 -4px 16px rgb(42 33 26 / .10)',
      'ground-glow': 'radial-gradient(120% 60% at 15% -10%, #FBF4E6 0%, transparent 60%)',
    },
    lights: {
      day: { sky: '#FFF4E3', ground: '#C7A67C', skyIntensity: 0.9, sun: '#FFE2B8', sunIntensity: 1.5, sunPosition: [3, 6, 4], ambient: '#F1E7D6', ambientIntensity: 0.2 },
      dusk: { sky: '#E9E2F0', ground: '#8C7C90', skyIntensity: 0.6, sun: '#C8BFE0', sunIntensity: 0.7, sunPosition: [-2, 5, 3], ambient: '#D9D2E3', ambientIntensity: 0.25 },
      feast: { sky: '#FFF1D6', ground: '#D9A860', skyIntensity: 1.1, sun: '#FFD590', sunIntensity: 2, sunPosition: [2, 7, 3], ambient: '#F1E7D6', ambientIntensity: 0.25 },
    },
  },
  world: {
    label: 'World palette',
    colours: {
      oat: '#E8DCC4', surface: '#F1E2B8', sunken: '#DCCFB0', burrow: '#2B2622', soil: '#2E4F5C', bark: '#3F5D6C',
      line: '#CDBFA3', 'line-strong': '#4A6B7C', honey: '#D9A441', crust: '#8F5F10', 'honey-tint': '#F6E9C8',
      moss: '#5F7A55', 'moss-ink': '#3E5637', 'moss-tint': '#D9E0C9', clay: '#B85520', 'clay-ink': '#7A3B3A', 'clay-tint': '#F0D6C7',
      dusk: '#4A6B7C', sky: '#8FC6D8',
    },
    effects: {
      'shadow-1': '0 1px 2px rgb(43 38 34 / .10), 0 2px 6px rgb(43 38 34 / .06)',
      'shadow-2': '0 6px 16px rgb(43 38 34 / .14)',
      'shadow-3': '0 16px 40px rgb(43 38 34 / .22)',
      'shadow-up': '0 -4px 16px rgb(43 38 34 / .10)',
      'ground-glow': 'radial-gradient(120% 60% at 15% -10%, #F7EBCD 0%, transparent 60%)',
    },
    lights: {
      day: { sky: '#F7EBCD', ground: '#C7A67C', skyIntensity: 0.9, sun: '#FFE2B8', sunIntensity: 1.5, sunPosition: [3, 6, 4], ambient: '#E8DCC4', ambientIntensity: 0.2 },
      dusk: { sky: '#BCD3DD', ground: '#4A6B7C', skyIntensity: 0.6, sun: '#8FC6D8', sunIntensity: 0.7, sunPosition: [-2, 5, 3], ambient: '#DCE4E8', ambientIntensity: 0.25 },
      feast: { sky: '#F7EBCD', ground: '#D9A441', skyIntensity: 1.1, sun: '#FFD590', sunIntensity: 2, sunPosition: [2, 7, 3], ambient: '#E8DCC4', ambientIntensity: 0.25 },
    },
  },
};

// What each colour token is for, from the §3.1 table.
export const TOKEN_USES = {
  oat: 'Page ground', surface: 'Cards and sheets', sunken: 'Recessed areas', burrow: 'Text, buttons, focus',
  soil: 'Secondary text', bark: 'Tertiary text', line: 'Hairlines', 'line-strong': 'Input edges',
  honey: 'Crumbs only', crust: 'Crumb edges', 'honey-tint': 'Pour highlight', moss: 'Done and alive',
  'moss-ink': 'Success text', 'moss-tint': 'Success chip', clay: 'Error fills', 'clay-ink': 'Error text',
  'clay-tint': 'Error banner', dusk: 'Asleep, dusk', sky: 'Through the window',
};

export const TYPE = {
  young: {
    label: 'Young Serif',
    display: '"Young Serif", "Iowan Old Style", "Palatino", Georgia, serif',
    body: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
    displayWeight: 400,
  },
  deck: {
    label: 'Shippori + Atkinson',
    display: '"Shippori Mincho", "Hiragino Mincho ProN", "Songti SC", "Times New Roman", serif',
    body: '"Atkinson Hyperlegible", system-ui, -apple-system, "Segoe UI", sans-serif',
    displayWeight: 500,
    stylesheet: 'https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&family=Shippori+Mincho:wght@400;500;700&display=swap',
  },
};

const linear = channel => { const c = channel / 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const luminance = hex => { const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)); return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b); };
/** WCAG 2.2 contrast ratio between two sRGB hex colours. */
export function contrast(a, b) { const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); }
