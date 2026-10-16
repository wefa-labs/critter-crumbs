/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-unused-expressions -- Generated bundle; lint src instead. */
(() => {
  var __require = /* @__PURE__ */ ((x) => typeof require < "u" ? require : typeof Proxy < "u" ? new Proxy(x, {
    get: (a, b) => (typeof require < "u" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require < "u")
      return require.apply(this, arguments);
    throw Error('Dynamic require of "' + x + '" is not supported');
  });
  // packages/shared/dist/validate.js
  class ValidationError extends Error {
    copyId;
    constructor(copyId = "err.generic") {
      super(copyId);
      this.copyId = copyId, this.name = "ValidationError";
    }
  }
  function integer(value, min, max, id = "err.generic") {
    if (typeof value !== "number" || !Number.isSafeInteger(value) || value < min || value > max)
      throw new ValidationError(id);
    return value;
  }
  function hex(value, bytes) {
    if (typeof value !== "string" || !/^0x(?:[0-9a-fA-F]{2})*$/.test(value) || bytes !== void 0 && value.length !== 2 + bytes * 2)
      throw new ValidationError;
    return value.toLowerCase();
  }
  // packages/core/src/generator/versioned.ts
  var GEN_VERSION_2 = "2";
  function cyrb53(value) {
    let h1 = 3735928559, h2 = 1103547991;
    for (let i = 0;i < value.length; i++) {
      let ch = value.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761), h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    return h1 = Math.imul(h1 ^ h1 >>> 16, 2246822507) ^ Math.imul(h2 ^ h2 >>> 13, 3266489909), h2 = Math.imul(h2 ^ h2 >>> 16, 2246822507) ^ Math.imul(h1 ^ h1 >>> 13, 3266489909), 4294967296 * (2097151 & h2) + (h1 >>> 0);
  }
  function mulberry32(seed) {
    let state = seed | 0;
    return () => {
      state = state + 1831565813 | 0;
      let value = Math.imul(state ^ state >>> 15, 1 | state);
      return value ^= value + Math.imul(value ^ value >>> 7, 61 | value), ((value ^ value >>> 14) >>> 0) / 4294967296;
    };
  }
  function draws(seedText) {
    let rng = mulberry32(cyrb53(seedText)), uniform = (min, max) => min + (max - min) * rng();
    function choice(values) {
      let draw = rng() * values.reduce((sum, entry) => sum + entry[1], 0), threshold = 0;
      for (let [value, weight] of values)
        if (threshold += weight, draw < threshold)
          return value;
      throw RangeError("Invalid generator weights");
    }
    return { rng, uniform, choice, equal: (list) => choice(list.map((value) => [value, 1])) };
  }
  var ELEMENTS = {
    earth: { ears: ["leaf", "round"], crests: [["sapling", 60], ["none", 40]], tails: ["branch", "puff"], marking: "moss", bands: [[130, 160], [60, 80]], glow: "#E9C46A", spot: "chest" },
    water: { ears: ["fin", "round"], crests: [["droplet", 50], ["reed", 50]], tails: ["tadpole", "stub"], marking: "dew", bands: [[180, 210]], glow: "#9FE1DC", spot: "throat" },
    fire: { ears: ["flame", "pointed"], crests: [["ember", 50], ["seedpods", 50]], tails: ["spark", "emberwisp"], marking: "belly", bands: [[20, 40], [40, 55]], glow: "#F28C38", spot: "chest" },
    air: { ears: ["cloud", "fern"], crests: [["none", 100]], tails: ["cloudwisp", "longwisp"], marking: "sky", bands: [[200, 220]], glow: "#BFE3F5", spot: "brow" }
  };
  function generate2(address, variant) {
    let input = hex(address, address.length === 42 ? 20 : 32);
    integer(variant, 0, 4);
    let { rng, uniform, choice, equal } = draws(`${input}:${variant}:2`), element = equal(["earth", "water", "fire", "air"]), set = ELEMENTS[element], params = {
      version: GEN_VERSION_2,
      element,
      bodyShape: choice([["egg", 35], ["bean", 25], ["capsule", 25], ["round", 15]]),
      bodyHeight: uniform(0.85, 1.25),
      bodyWidth: uniform(0.75, 1.15),
      belly: uniform(0, 0.3),
      headShape: choice([["round", 45], ["egg", 30], ["squarish", 25]]),
      headSize: uniform(0.5, 0.72),
      headTilt: uniform(-8, 8),
      earType: equal(set.ears),
      earSize: uniform(0.18, 0.5),
      earSpread: uniform(35, 75),
      crest: choice(set.crests),
      eyeStyle: choice([["round", 50], ["oval", 30], ["half-lid", 20]]),
      eyeSize: uniform(0.1, 0.2),
      eyeSpacing: uniform(0.32, 0.62),
      eyeHeight: uniform(0.45, 0.62),
      pupilSize: uniform(0.45, 0.7),
      snout: choice([["none", 40], ["button", 35], ["muzzle", 25]]),
      cheeks: rng() < 0.3,
      armType: choice([["stubs", 50], ["paws", 30], ["none", 20]]),
      legLength: uniform(0.15, 0.35),
      tailType: equal(set.tails),
      markings: choice([["none", 40], [set.marking, 60]])
    }, band = set.bands[Math.floor(rng() * set.bands.length)];
    return { ...params, hue: uniform(band[0], band[1]), chroma: uniform(0.06, 0.13), lightness: uniform(0.58, 0.76), accentShift: uniform(15, 45), idlePhase: uniform(0, 1), glow: set.glow, spot: set.spot };
  }
  // packages/core/dist/generator/index.js
  function layout(params) {
    let yF = { egg: 1.25, bean: 1.1, capsule: 1.15, round: 1 }[params.bodyShape], bh = 0.5 * params.bodyHeight * yF, bw = 0.5 * params.bodyWidth, leg = params.legLength * params.bodyHeight, bodyC = 0.6 * leg + bh, hr = 0.5 * params.headSize * params.bodyHeight, headC = bodyC + bh + 0.76 * hr, earLen = params.earSize * 2 * hr * 1.8;
    return { yF, bh, bw, leg, bodyC, hr, headC, earLen };
  }
  // packages/core/dist/generator/versioned.js
  function layoutCritter2(params) {
    if (params.version === "1")
      return layout(params);
    let yF = { egg: 1.25, bean: 1.1, capsule: 1.15, round: 1 }[params.bodyShape], bh = 0.5 * params.bodyHeight * yF, bw = 0.5 * params.bodyWidth, leg = params.legLength * params.bodyHeight, bodyC = 0.6 * leg + bh, hr = 0.5 * params.headSize * params.bodyHeight, headC = bodyC + bh + 0.76 * hr;
    return { yF, bh, bw, leg, bodyC, hr, headC, earLen: params.earSize * 2 * hr * 1.8 };
  }
  // packages/app/src/portraits/metrics.ts
  var tails = { puff: [0.95, 0.46], stub: [1.02, 0.5], branch: [0.9, 1.51], tadpole: [0.9, 1.34], spark: [0.9, 1.27], emberwisp: [0.9, 1.07], cloudwisp: [0.9, 1.25], longwisp: [0.9, 1.95] }, crests = { sapling: 0.62, droplet: 0.72, reed: 0.85, ember: 0.78, seedpods: 0.45 };
  function portraitMetrics(params, fed = 0) {
    let g = layoutCritter2(params), R = g.hr * 54 * 1.22, W = g.bw * 54 * 1.04, H = g.bh * 54 * 0.9, Rt = R * 0.8, bodyY = 140 - H * 0.96 - 2, headY = bodyY - H * 0.8 - R * 0.45, earLength = g.earLen * 54 * 0.78, headTop = headY - R * (params.headShape === "egg" ? 1.12 : 1), angle = params.earSpread * Math.PI / 180, topY = Math.min(headTop - (params.version === "2" ? crests[params.crest] ?? (params.element === "air" ? 0.3 : 0) : 0) * R, headY - R * 0.62 - earLength * 0.95 * Math.max(0, Math.cos(angle)), headTop) - 2, [wReach, rReach] = tails[params.tailType] ?? [1, 0], rightX = 60 + wReach * W + rReach * Rt, grow = 1 + 0.2 * fed, fit = Math.min(1, 134 / ((140 - topY) * grow), 56 / ((rightX - 60) * grow)), halfW = Math.max(R, W * 0.86, R * 0.64 + earLength * 0.95 * Math.abs(Math.sin(angle))) + 2, scale = fit * grow, extent = { top: (140 - (140 - topY) * scale) / 150, left: (60 - halfW * scale) / 120, right: (60 + Math.max(halfW, rightX - 60 + 2) * scale) / 120, headY: (140 - (140 - headY) * scale) / 150, headRadius: R * scale / 120 };
    if (params.version === "1") {
      let hr = g.hr * 46, hy = 140 - g.headC * 46;
      extent.top = Math.max(0, (hy - hr - g.earLen * 46 * 0.65) / 150), extent.left = 0.13, extent.right = 0.9, extent.headY = hy / 150, extent.headRadius = hr / 120;
    }
    return { R, W, H, Rt, bodyY, headY, earLength, headTop, topY, rightX, fit, grow, halfW, scale, extent };
  }

  // packages/app/src/portraits/colour.ts
  var multiply = (matrix, vector) => matrix.map((row) => row[0] * vector[0] + row[1] * vector[1] + row[2] * vector[2]);
  function linear(lightness, chroma, hue) {
    let angle = hue * Math.PI / 180, lms = multiply([[1, 0.3963377773761749, 0.2158037573099136], [1, -0.1055613458156586, -0.0638541728258133], [1, -0.0894841775298119, -1.2914855480194092]], [lightness, chroma * Math.cos(angle), chroma * Math.sin(angle)]), xyz = multiply([[1.2268798758459243, -0.5578149944602171, 0.2813910456659647], [-0.0405757452148008, 1.112286803280317, -0.0717110580655164], [-0.0763729366746601, -0.4214933324022432, 1.5869240198367816]], lms.map((value) => value ** 3));
    return multiply([[3.2409699419045226, -1.537383177570094, -0.4986107602930034], [-0.9692436362808796, 1.8759675015077202, 0.04155505740717559], [0.05563007969699366, -0.20397695888897652, 1.0569715142428786]], xyz);
  }
  function colour(lightness, chroma, hue) {
    let low = 0, high = chroma, rgb = linear(lightness, chroma, hue), inGamut = (values) => values.every((value) => value >= -0.0000001 && value <= 1.0000001);
    if (!inGamut(rgb)) {
      for (let step = 0;step < 24; step++) {
        let candidate = (low + high) / 2;
        if (inGamut(linear(lightness, candidate, hue)))
          low = candidate;
        else
          high = candidate;
      }
      rgb = linear(lightness, low, hue);
    }
    rgb = rgb.map((value) => Math.max(0, Math.min(1, value)));
    let css = "#" + rgb.map((value) => Math.round(255 * (value <= 0.0031308 ? 12.92 * value : 1.055 * value ** 0.4166666666666667 - 0.055)).toString(16).padStart(2, "0")).join("");
    return { linear: rgb, css };
  }
  function palette(params) {
    return { body: colour(params.lightness, params.chroma, params.hue), accent: colour(params.lightness + 0.12, params.chroma, params.hue + params.accentShift) };
  }

  // packages/app/src/styles/tokens.ts
  var tokens = {
    oat: "#F6F0E4",
    surface: "#F6F0E4",
    sunken: "#EADFD2",
    burrow: "#2E2226",
    soil: "#6B5B5E",
    bark: "#6B5B5E",
    line: "rgb(46 34 38 / .14)",
    "line-strong": "#2E2226",
    honey: "#CFA552",
    crust: "#A86B14",
    "honey-tint": "#F5E6C4",
    moss: "#6B7F4A",
    "moss-ink": "#43552B",
    "moss-tint": "#DDE5CC",
    clay: "#C2563C",
    "clay-ink": "#973A26",
    "clay-tint": "#F3D9D0",
    dusk: "#7C7A94",
    text: "var(--cc-burrow)",
    bg: "var(--cc-oat)",
    focus: "var(--cc-burrow)",
    ink: "var(--cc-burrow)",
    action: "#D9A441",
    "action-text": "var(--cc-burrow)",
    ok: "var(--cc-moss)",
    error: "var(--cc-clay)",
    crumb: "var(--cc-honey)",
    "font-display": 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
    "font-wordmark": 'Grandstander, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
    "font-body": 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
    "font-data": 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
    "text-xs": ".75rem",
    "text-sm": ".875rem",
    "text-lg": "1rem",
    "text-xl": "1.25rem",
    "space-1": "0.25rem",
    "space-2": "0.5rem",
    "space-3": "0.75rem",
    "space-4": "1rem",
    "space-5": "1.25rem",
    "space-6": "1.5rem",
    "space-7": "2rem",
    "space-8": "2.5rem",
    "space-9": "3rem",
    "space-10": "4rem",
    "radius-pill": "999px",
    "shadow-1": "2px 2px 0 rgb(46 107 114 / .32)",
    "shadow-2": "3px 3px 0 rgb(46 107 114 / .32)",
    "shadow-3": "3px 3px 0 rgb(46 107 114 / .32)",
    "ground-glow": "radial-gradient(120% 60% at 15% -10%, #FBF4E6 0%, transparent 60%)",
    "ease-out": "cubic-bezier(.2,.8,.2,1)",
    "ease-hop": "cubic-bezier(.3,1.4,.5,1)",
    "z-canvas": "0",
    "z-content": "1",
    "z-sticky": "10",
    "z-sheet": "20",
    "dur-1": "120ms",
    "dur-2": "200ms",
    "dur-3": "320ms",
    "dur-4": "600ms",
    "text-md": "1rem",
    "text-2xl": "1.75rem",
    "text-3xl": "1.75rem",
    "radius-sm": "8px",
    "radius-md": "999px",
    "radius-lg": "22px",
    "shadow-up": "3px 3px 0 rgb(46 107 114 / .32)",
    border: "1.5px solid var(--cc-line-strong)",
    "border-strong": "1.5px solid var(--cc-line-strong)",
    "ease-in-out": "cubic-bezier(.6,0,.2,1)",
    "text-2": "var(--cc-soil)",
    "text-3": "var(--cc-bark)",
    "bg-raised": "var(--cc-surface)",
    "bg-sunken": "var(--cc-sunken)",
    "ok-text": "var(--cc-moss-ink)",
    "ok-bg": "var(--cc-moss-tint)",
    "error-text": "var(--cc-clay-ink)",
    "error-bg": "var(--cc-clay-tint)",
    "crumb-edge": "var(--cc-crust)",
    "light-day-sky": "#FFF4E3",
    "light-day-ground": "#C7A67C",
    "light-day-sky-intensity": 0.9,
    "light-day-sun": "#FFE2B8",
    "light-day-sun-intensity": 1.5,
    "light-day-sun-x": 3,
    "light-day-sun-y": 6,
    "light-day-sun-z": 4,
    "light-day-ambient": "#F1E7D6",
    "light-day-ambient-intensity": 0.2,
    "light-dusk-sky": "#E9E2F0",
    "light-dusk-ground": "#8C7C90",
    "light-dusk-sky-intensity": 0.6,
    "light-dusk-sun": "#C8BFE0",
    "light-dusk-sun-intensity": 0.7,
    "light-dusk-sun-x": -2,
    "light-dusk-sun-y": 5,
    "light-dusk-sun-z": 3,
    "light-dusk-ambient": "#D9D2E3",
    "light-dusk-ambient-intensity": 0.25,
    "light-feast-sky": "#FFF1D6",
    "light-feast-ground": "#D9A860",
    "light-feast-sky-intensity": 1.1,
    "light-feast-sun": "#FFD590",
    "light-feast-sun-intensity": 2,
    "light-feast-sun-x": 2,
    "light-feast-sun-y": 7,
    "light-feast-sun-z": 3,
    "light-feast-ambient": "#F1E7D6",
    "light-feast-ambient-intensity": 0.25,
    "crumb-highlight": "#F3DF95",
    pod: "#C9A15E",
    "pod-stem": "#5E7D45",
    "pod-leaf": "#8DB46A",
    "floor-base": "#D9CBB2",
    "scene-filter": "saturate(.82) brightness(1.05) sepia(.1)",
    "scene-wash": "linear-gradient(to bottom, rgb(246 240 228 / .05), rgb(246 240 228 / .2) 55%, rgb(246 240 228 / .42))",
    "portrait-cream": "#F3E6D6",
    "portrait-light": "#FBF0DC",
    "portrait-line-width": 2.1,
    "portrait-eye": "#2C2129",
    "portrait-eye-shade": "#5B4350",
    "portrait-cheek": "#F5A95D",
    "portrait-tone-0-base": "#CDB3A9",
    "portrait-tone-0-shadow": "#9A7A80",
    "portrait-tone-0-light": "#EBD9CF",
    "portrait-tone-0-soft": "#F3EAE4",
    "portrait-tone-1-base": "#B69993",
    "portrait-tone-1-shadow": "#86686E",
    "portrait-tone-1-light": "#DDC2B7",
    "portrait-tone-1-soft": "#EFE4DF",
    "portrait-tone-2-base": "#A3837F",
    "portrait-tone-2-shadow": "#74585F",
    "portrait-tone-2-light": "#CCAFA6",
    "portrait-tone-2-soft": "#E6D5CF",
    "floor-grain-opacity": 0.12,
    "element-fire-shadow": "#852318",
    "element-fire-base": "#EB521D",
    "element-fire-light": "#F5A95D",
    "element-fire-soft": "#FCE7DE",
    "element-earth-shadow": "#156152",
    "element-earth-base": "#289946",
    "element-earth-light": "#ACE676",
    "element-earth-soft": "#DEF5DA",
    "element-water-shadow": "#263580",
    "element-water-base": "#2564B8",
    "element-water-light": "#84D3F0",
    "element-water-soft": "#E1EDFC",
    "element-air-shadow": "#52366B",
    "element-air-base": "#B26ACC",
    "element-air-light": "#E9BBF0",
    "element-air-soft": "#F1E3FA",
    "floor-shade": "linear-gradient(to bottom, rgb(20 10 10 / .55) var(--scene-wall-height), rgb(20 10 10 / .12) calc(var(--scene-wall-height) + 16%), transparent 66%)",
    "scene-grain": `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .2 0 0 0 0 .15 0 0 0 0 .2 0 0 0 .5 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`
  };

  // packages/app/src/portraits/index.ts
  var state = /* @__PURE__ */ new WeakMap;
  function rememberPortrait(svg, radii) {
    state.set(svg, radii);
  }

  // packages/app/src/portraits/painter-v2.ts
  var inkedPortraitLook = { line: tokens.burrow, lineW: tokens["portrait-line-width"], shading: "paint", hatch: !0, grain: !0, cream: tokens["portrait-cream"], tones: [
    { base: tokens["portrait-tone-0-base"], shadow: tokens["portrait-tone-0-shadow"], light: tokens["portrait-tone-0-light"], soft: tokens["portrait-tone-0-soft"] },
    { base: tokens["portrait-tone-1-base"], shadow: tokens["portrait-tone-1-shadow"], light: tokens["portrait-tone-1-light"], soft: tokens["portrait-tone-1-soft"] },
    { base: tokens["portrait-tone-2-base"], shadow: tokens["portrait-tone-2-shadow"], light: tokens["portrait-tone-2-light"], soft: tokens["portrait-tone-2-soft"] }
  ] }, ELEMENT = {
    earth: { base: tokens["element-earth-base"], shadow: tokens["element-earth-shadow"], light: tokens["element-earth-light"], soft: tokens["element-earth-soft"] },
    water: { base: tokens["element-water-base"], shadow: tokens["element-water-shadow"], light: tokens["element-water-light"], soft: tokens["element-water-soft"] },
    fire: { base: tokens["element-fire-base"], shadow: tokens["element-fire-shadow"], light: tokens["element-fire-light"], soft: tokens["element-fire-soft"] },
    air: { base: tokens["element-air-base"], shadow: tokens["element-air-shadow"], light: tokens["element-air-light"], soft: tokens["element-air-soft"] }
  }, paintDefinitions = `<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
    <filter id="loose" x="-15%" y="-15%" width="130%" height="130%"><feTurbulence type="fractalNoise" baseFrequency=".04" numOctaves="2" seed="11" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="2.2" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="loose2" x="-15%" y="-15%" width="130%" height="130%"><feTurbulence type="fractalNoise" baseFrequency=".05" numOctaves="2" seed="29" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="3.2" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="fur" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="3" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 .14  0 0 0 0 .11  0 0 0 0 .15  0 0 0 .16 0" result="g"/><feComposite in="g" in2="SourceGraphic" operator="in" result="gi"/><feBlend in="SourceGraphic" in2="gi" mode="multiply"/></filter>
    <filter id="poster" color-interpolation-filters="sRGB"><feComponentTransfer><feFuncR type="discrete" tableValues="0 .2 .4 .6 .8 1"/><feFuncG type="discrete" tableValues="0 .2 .4 .6 .8 1"/><feFuncB type="discrete" tableValues="0 .2 .4 .6 .8 1"/></feComponentTransfer></filter>
    <pattern id="strokes" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(-32)"><path d="M0 3.5 H4.6" stroke="${tokens.burrow}" stroke-width="1.7" stroke-linecap="round" opacity=".28"/></pattern>
    <pattern id="hatch" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(-38)"><path d="M0 0 L0 4" stroke="${tokens.burrow}" stroke-width="1.1" opacity=".5"/></pattern>
</defs></svg>`, serial = 0, FOOT = 140, CENTER = 60, BOX_H = 150;
  function mix(a, b, amount) {
    let rgb = (x) => [1, 3, 5].map((i) => parseInt(x.slice(i, i + 2), 16)), A = rgb(a), B = rgb(b);
    return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * amount).toString(16).padStart(2, "0")).join("");
  }
  function paintV2(document2, params, state, look = inkedPortraitLook) {
    function s(tag, attrs = {}, parent) {
      let node = document2.createElementNS("http://www.w3.org/2000/svg", tag);
      for (let [key, value] of Object.entries(attrs))
        if (value !== null && value !== void 0)
          node.setAttribute(key, String(value));
      return parent?.append(node), node;
    }
    function paintedFill(defs, id, tone) {
      let grad = s("radialGradient", { id: `${id}-g${++serial}`, cx: 0.34, cy: 0.28, r: 0.95 }, defs);
      return s("stop", { offset: 0, "stop-color": tone.light }, grad), s("stop", { offset: 0.46, "stop-color": tone.base }, grad), s("stop", { offset: 1, "stop-color": tone.shadow }, grad), `url(#${grad.id})`;
    }
    function shaded(parent, defs, id, e, tone, st, strokeWidth, extra = {}) {
      let fill = st.shading === "paint" ? paintedFill(defs, id, tone) : tone.base;
      s("ellipse", { ...e, fill, ...extra }, parent);
      let clip = s("clipPath", { id: `${id}-c${++serial}` }, defs);
      s("ellipse", e, clip);
      let inner = s("g", { "clip-path": `url(#${clip.id})`, ...extra }, parent);
      if (st.shading === "flat")
        s("ellipse", { cx: e.cx + e.rx * 0.42, cy: e.cy + e.ry * 0.5, rx: e.rx * 1.05, ry: e.ry, fill: tone.shadow }, inner);
      else {
        let crescent = s("clipPath", { id: `${id}-k${++serial}` }, defs);
        s("ellipse", { cx: e.cx + e.rx * 0.5, cy: e.cy + e.ry * 0.58, rx: e.rx * 1.02, ry: e.ry * 0.98 }, crescent);
        let cel = s("g", { "clip-path": `url(#${crescent.id})` }, inner);
        s("rect", { x: e.cx - e.rx * 1.2, y: e.cy - e.ry * 1.2, width: e.rx * 2.4, height: e.ry * 2.4, fill: tone.shadow, opacity: 0.5 }, cel), s("rect", { x: e.cx - e.rx * 1.2, y: e.cy - e.ry * 1.2, width: e.rx * 2.4, height: e.ry * 2.4, fill: st.hatch ? "url(#hatch)" : "url(#strokes)" }, cel);
      }
      s("ellipse", { ...e, fill: "none", stroke: st.line, "stroke-width": strokeWidth * 0.55, opacity: 0.32, filter: "url(#loose2)", transform: `${extra.transform ?? ""} translate(1.2 .8)` }, parent), s("ellipse", { ...e, fill: "none", stroke: st.line, "stroke-width": strokeWidth, opacity: 0.9, filter: "url(#loose)", ...extra }, parent);
    }
    function paint(params, st, { size = 0, delighted = !1, fed = 0, asleep = !1 } = {}) {
      let el = ELEMENT[params.element], id = `pc${++serial}`, own = palette(params).body.css, base = st.element ? { base: el.light, shadow: el.base, light: el.soft, soft: el.soft } : st.tones[Math.floor(params.idlePhase * 3) % 3], PAGE = tokens.oat, LINE = st.line, PEACH = tokens["portrait-cheek"], EYE = tokens["portrait-eye"], lw = st.lineW, softened = mix(own, st.cream, 0.55), tone = st.element ? base : { base: mix(softened, base.base, 0.25), shadow: mix(mix(own, LINE, 0.3), base.shadow, 0.3), light: mix(softened, tokens["portrait-light"], 0.45), soft: base.soft }, svg = s("svg", { viewBox: `0 0 120 ${BOX_H}`, class: `critter${delighted ? " delighted" : ""}${asleep ? " asleep" : ""}`, "aria-hidden": "true" });
      if (size)
        svg.style.width = `${size}px`;
      svg.style.setProperty("--head-tilt", `${params.headTilt}deg`), svg.style.setProperty("--cheeks", delighted || params.cheeks ? "1" : "0"), svg.style.setProperty("--mouth", delighted ? "1" : "0"), svg.style.setProperty("--d", `${(params.idlePhase * 5).toFixed(2)}s`);
      let defs = s("defs", {}, svg), { R, W, H, Rt, bodyY, headY, earLength, fit, extent } = portraitMetrics(params, fed);
      for (let [key, value] of Object.entries(extent))
        svg.dataset[key === "headY" ? "hy" : key === "headRadius" ? "hr" : key] = value.toFixed(3);
      s("ellipse", { cx: CENTER, cy: FOOT + 2, rx: W * 1.3 * fit, ry: 4.5, fill: LINE, opacity: 0.14 }, svg);
      let fitGroup = s("g", { transform: fit < 1 ? `translate(${CENTER} ${FOOT}) scale(${fit.toFixed(4)}) translate(${-CENTER} ${-FOOT})` : null }, svg), figure = s("g", { class: "portrait__figure" }, fitGroup), body = s("g", { transform: fed ? `translate(${CENTER} ${FOOT}) scale(${(1 + 0.2 * fed).toFixed(3)}) translate(${-CENTER} ${-FOOT})` : null }, figure), tx = CENTER + W * 0.9, ty = bodyY + H * 0.3;
      ({
        puff: () => shaded(body, defs, id, { cx: CENTER + W * 0.95, cy: bodyY + H * 0.45, rx: Rt * 0.46, ry: Rt * 0.42 }, tone, st, lw * 0.8),
        stub: () => shaded(body, defs, id, { cx: CENTER + W * 1.02, cy: bodyY + H * 0.5, rx: Rt * 0.5, ry: Rt * 0.26 }, tone, st, lw * 0.75),
        branch: () => {
          s("path", { d: `M${tx} ${ty} q${Rt * 0.9} ${-Rt * 0.2} ${Rt * 1.3} ${-Rt * 1.4}`, fill: "none", stroke: tone.shadow, "stroke-width": Rt * 0.14, "stroke-linecap": "round" }, body);
          for (let [dx, dy, sz, turn] of [[0.5, -0.3, 0.34, -35], [1, -0.8, 0.3, -60], [1.25, -1.35, 0.26, -80]])
            s("ellipse", { cx: tx + dx * Rt, cy: ty + dy * Rt, rx: sz * Rt, ry: sz * Rt * 0.55, transform: `rotate(${turn} ${tx + dx * Rt} ${ty + dy * Rt})`, fill: el.base, stroke: LINE, "stroke-width": lw * 0.6, filter: "url(#loose)" }, body);
        },
        tadpole: () => {
          s("path", { d: `M${tx - Rt * 0.2} ${ty - Rt * 0.15} q${Rt * 1.1} ${-Rt * 0.1} ${Rt * 1.5} ${-Rt * 0.9} q${-Rt * 0.2} ${Rt * 0.7} ${-Rt * 1.2} ${Rt * 1.15} z`, fill: tone.base, stroke: LINE, "stroke-width": lw * 0.7, filter: "url(#loose)" }, body), s("circle", { cx: tx + Rt * 1.2, cy: ty - Rt * 0.85, r: Rt * 0.14, fill: el.light }, body);
        },
        spark: () => {
          for (let [dx, dy, sz] of [[0.45, -0.5, 0.2], [0.85, -1, 0.16], [1.15, -1.55, 0.12]])
            s("circle", { cx: tx + dx * Rt, cy: ty + dy * Rt, r: sz * Rt, fill: el.light, stroke: el.base, "stroke-width": 0.8 }, body);
        },
        emberwisp: () => {
          s("path", { d: `M${tx - Rt * 0.2} ${ty - Rt * 0.1} q${Rt * 0.9} ${-Rt * 0.4} ${Rt * 1.1} ${-Rt * 1.4} q${-Rt * 0.05} ${Rt * 0.8} ${-Rt * 0.8} ${Rt * 1.25} z`, fill: tone.base, stroke: LINE, "stroke-width": lw * 0.7, filter: "url(#loose)" }, body), s("circle", { cx: tx + Rt * 0.9, cy: ty - Rt * 1.45, r: Rt * 0.17, fill: el.light, stroke: el.base, "stroke-width": 0.8 }, body);
        },
        cloudwisp: () => {
          for (let [dx, dy, sz] of [[0.4, 0, 0.4], [0.95, -0.28, 0.3]])
            s("circle", { cx: tx + dx * Rt, cy: ty + dy * Rt, r: sz * Rt, fill: tone.light, stroke: LINE, "stroke-width": lw * 0.6, filter: "url(#loose)" }, body);
        },
        longwisp: () => s("path", { d: `M${tx - Rt * 0.2} ${ty} q${Rt * 1.2} ${-Rt * 0.1} ${Rt * 1.7} ${-Rt * 0.8} q${Rt * 0.15} ${-Rt * 0.45} ${Rt * 0.45} ${-Rt * 0.8} q${-Rt * 0.6} ${Rt * 0.9} ${-Rt * 1.95} ${Rt * 1.75} z`, fill: tone.light, stroke: LINE, "stroke-width": lw * 0.65, filter: "url(#loose)" }, body)
      })[params.tailType]?.();
      let furGroup = s("g", { filter: st.grain ? "url(#fur)" : null }, body);
      shaded(furGroup, defs, id, { cx: CENTER, cy: bodyY, rx: W, ry: H }, tone, st, lw);
      let belly = params.markings === "belly" ? mix(tone.soft, el.light, 0.45) : tone.soft;
      if (s("ellipse", { cx: CENTER + W * 0.05, cy: bodyY + H * 0.32, rx: W * 0.56, ry: H * 0.52, fill: belly, opacity: 0.9 }, body), ["moss", "dew", "sky"].includes(params.markings))
        for (let [x, y, r] of [[-0.52, -0.18, 0.17], [0.44, 0.06, 0.14], [-0.3, 0.5, 0.11]])
          s("ellipse", { cx: CENTER + x * W, cy: bodyY + y * H, rx: W * r, ry: H * r * 0.7, fill: el.light, opacity: 0.78 }, body);
      let glowAt = params.spot === "throat" ? [CENTER, bodyY - H * 0.55] : params.spot === "brow" ? null : [CENTER + W * 0.05, bodyY + H * 0.05];
      if (glowAt) {
        let glow = s("radialGradient", { id: `${id}-w${++serial}` }, defs);
        s("stop", { offset: 0, "stop-color": params.glow, "stop-opacity": 0.75 }, glow), s("stop", { offset: 1, "stop-color": params.glow, "stop-opacity": 0 }, glow), s("circle", { cx: glowAt[0], cy: glowAt[1], r: W * 0.42, fill: `url(#${glow.id})` }, body);
      }
      for (let side of [-1, 1])
        shaded(body, defs, id, { cx: CENTER + side * W * 0.6, cy: bodyY + H * 0.1, rx: R * 0.24, ry: R * 0.32 }, tone, st, lw * 0.75, { transform: `rotate(${side * -22} ${CENTER + side * W * 0.6} ${bodyY + H * 0.1})` });
      for (let side of [-1, 1])
        s("ellipse", { cx: CENTER + side * W * 0.46, cy: FOOT - 3.5, rx: W * 0.36, ry: W * 0.21, fill: tone.base, stroke: LINE, "stroke-width": lw * 0.8, filter: "url(#loose)" }, body), s("ellipse", { cx: CENTER + side * W * 0.46, cy: FOOT - 3, rx: W * 0.2, ry: W * 0.1, fill: mix(tone.base, tone.shadow, 0.35) }, body);
      let headAnchor = s("g", { transform: `translate(${CENTER} ${headY})` }, body), head = s("g", { class: "portrait__head", transform: `rotate(${params.headTilt})` }, headAnchor);
      for (let side of [-1, 1]) {
        let earAnchor = s("g", { transform: `translate(${side * R * 0.64} ${-R * 0.62})` }, head), anchor = s("g", { class: `portrait__ear portrait__ear--${side < 0 ? "l" : "r"}`, style: `--ear-base:${side * params.earSpread}deg` }, earAnchor), w = earLength * 0.46, L = earLength * 0.95, d = {
          pointed: `M${-w} 0 Q${-w * 0.8} ${-L * 0.55} 0 ${-L} Q${w * 0.8} ${-L * 0.55} ${w} 0 Z`,
          tufts: `M${-w} 0 L${-w * 0.8} ${-L * 0.65} L${-w * 0.15} ${-L * 0.5} L0 ${-L} L${w * 0.35} ${-L * 0.55} L${w} ${-L * 0.7} L${w} 0 Z`,
          leaf: `M0 0 C${-w * 1.3} ${-L * 0.35} ${-w * 0.7} ${-L * 0.8} 0 ${-L} C${w * 0.7} ${-L * 0.8} ${w * 1.3} ${-L * 0.35} 0 0 Z`,
          fin: `M${-w * 0.9} 0 C${-w * 0.6} ${-L * 0.5} ${w * 0.1} ${-L * 0.9} ${w * 0.7} ${-L} C${w * 0.5} ${-L * 0.6} ${w * 0.8} ${-L * 0.25} ${w} 0 Z`,
          flame: [[-w * 0.55, 0.7], [0, 1], [w * 0.55, 0.75]].map(([dx, hh]) => `M${dx - w * 0.4} 0 C${dx - w * 0.45} ${-L * hh * 0.5} ${dx - w * 0.1} ${-L * hh * 0.7} ${dx} ${-L * hh} C${dx + w * 0.1} ${-L * hh * 0.7} ${dx + w * 0.45} ${-L * hh * 0.5} ${dx + w * 0.4} 0 Z`).join(" "),
          cloud: [[0, -L * 0.42, L * 0.42], [w * 0.55, -L * 0.78, L * 0.28]].map(([cx, cy, sz]) => `M${cx - sz} ${cy} a${sz} ${sz} 0 1 0 ${2 * sz} 0 a${sz} ${sz} 0 1 0 ${-2 * sz} 0`).join(" "),
          fern: `M${-w * 0.45} 0 C${-w * 0.7} ${-L * 0.45} ${-w * 0.35} ${-L * 0.85} ${w * 0.15} ${-L * 0.95} C${w * 0.75} ${-L * 1.02} ${w * 0.8} ${-L * 0.62} ${w * 0.3} ${-L * 0.62} C${w * 0.05} ${-L * 0.62} ${w * 0.05} ${-L * 0.78} ${w * 0.25} ${-L * 0.78} C${w * 0.1} ${-L * 0.55} ${w * 0.45} ${-L * 0.3} ${w * 0.45} 0 Z`
        }[params.earType] ?? `M${-w} 0 C${-w * 1.4} ${-L * 0.7} ${-w * 0.7} ${-L} 0 ${-L} C${w * 0.9} ${-L} ${w * 1.3} ${-L * 0.6} ${w} 0 Z`, mirror = side < 0 ? s("g", { transform: "scale(-1 1)" }, anchor) : anchor;
        s("path", { d, fill: tone.base, stroke: LINE, "stroke-width": lw * 0.8, "stroke-linejoin": "round", filter: "url(#loose)" }, mirror), s("path", { d, fill: mix(el.soft, el.light, 0.35), opacity: 0.9, transform: "scale(.56 .68)" }, mirror);
      }
      shaded(head, defs, id, { cx: 0, cy: 0, rx: R, ry: R * (params.headShape === "egg" ? 1.12 : params.headShape === "squarish" ? 0.95 : 1) }, tone, st, lw);
      let top = -R * (params.headShape === "egg" ? 1.12 : 0.98);
      if ({
        sapling: () => {
          s("rect", { x: -R * 0.05, y: top - R * 0.5, width: R * 0.1, height: R * 0.58, rx: R * 0.05, fill: el.shadow }, head);
          for (let [cx, cy, turn] of [[-R * 0.24, top - R * 0.5, -28], [R * 0.24, top - R * 0.36, 24]])
            s("ellipse", { cx, cy, rx: R * 0.26, ry: R * 0.13, transform: `rotate(${turn} ${cx} ${cy})`, fill: el.base, stroke: LINE, "stroke-width": lw * 0.55, filter: "url(#loose)" }, head), s("ellipse", { cx: cx - R * 0.06, cy: cy - R * 0.04, rx: R * 0.12, ry: R * 0.05, transform: `rotate(${turn} ${cx} ${cy})`, fill: el.light }, head);
        },
        droplet: () => {
          s("path", { d: `M0 ${top - R * 0.72} C${R * 0.27} ${top - R * 0.35} ${R * 0.24} ${top + R * 0.06} 0 ${top + R * 0.06} C${-R * 0.24} ${top + R * 0.06} ${-R * 0.27} ${top - R * 0.35} 0 ${top - R * 0.72} Z`, fill: el.base, stroke: LINE, "stroke-width": lw * 0.6, filter: "url(#loose)" }, head), s("circle", { cx: -R * 0.07, cy: top - R * 0.3, r: R * 0.07, fill: el.light }, head);
        },
        reed: () => {
          s("rect", { x: -R * 0.04, y: top - R * 0.8, width: R * 0.08, height: R * 0.85, rx: R * 0.04, fill: el.shadow }, head), s("ellipse", { cx: 0, cy: top - R * 0.78, rx: R * 0.1, ry: R * 0.2, fill: el.base, stroke: LINE, "stroke-width": lw * 0.5 }, head);
        },
        ember: () => {
          s("path", { d: `M${-R * 0.17} ${top + R * 0.05} C${-R * 0.22} ${top - R * 0.3} ${-R * 0.02} ${top - R * 0.45} ${R * 0.05} ${top - R * 0.78} C${R * 0.13} ${top - R * 0.4} ${R * 0.27} ${top - R * 0.25} ${R * 0.19} ${top + R * 0.05} Z`, fill: el.base, stroke: LINE, "stroke-width": lw * 0.6, filter: "url(#loose)" }, head), s("path", { d: `M${-R * 0.07} ${top + R * 0.02} C${-R * 0.09} ${top - R * 0.2} ${R * 0.02} ${top - R * 0.3} ${R * 0.04} ${top - R * 0.5} C${R * 0.07} ${top - R * 0.25} ${R * 0.12} ${top - R * 0.15} ${R * 0.09} ${top + R * 0.02} Z`, fill: el.light }, head);
        },
        seedpods: () => {
          for (let dx of [-0.3, 0, 0.3])
            s("circle", { cx: dx * R, cy: top - R * (dx === 0 ? 0.28 : 0.13), r: R * 0.16, fill: el.base, stroke: LINE, "stroke-width": lw * 0.5 }, head), s("circle", { cx: dx * R - R * 0.05, cy: top - R * (dx === 0 ? 0.33 : 0.18), r: R * 0.06, fill: el.light }, head);
        }
      }[params.crest]?.(), params.element === "air")
        for (let [dx, sz] of [[-0.12, 0.2], [0.14, 0.15]])
          s("circle", { cx: dx * R, cy: top - R * 0.08, r: sz * R, fill: el.light, stroke: LINE, "stroke-width": lw * 0.5, filter: "url(#loose)" }, head);
      if (params.markings !== "none")
        s("ellipse", { cx: R * 0.14, cy: -R * 0.6, rx: R * 0.17, ry: R * 0.11, transform: `rotate(-12 ${R * 0.14} ${-R * 0.6})`, fill: el.light, opacity: 0.8 }, head);
      if (params.spot === "brow") {
        let glow = s("radialGradient", { id: `${id}-b${++serial}` }, defs);
        s("stop", { offset: 0, "stop-color": params.glow, "stop-opacity": 0.8 }, glow), s("stop", { offset: 1, "stop-color": params.glow, "stop-opacity": 0 }, glow), s("circle", { cx: 0, cy: -R * 0.55, r: R * 0.4, fill: `url(#${glow.id})` }, head);
      }
      if (params.snout === "muzzle")
        s("ellipse", { cx: R * 0.04, cy: R * 0.42, rx: R * 0.22, ry: R * 0.14, fill: tone.soft, stroke: LINE, "stroke-width": lw * 0.45, filter: "url(#loose)" }, head);
      let eyeR = R * (0.24 + params.eyeSize * 0.8), spread = Math.min(1, Math.max(0, (params.eyeSpacing - 0.32) / 0.3)), ex = Math.max(eyeR + R * 0.1, R * (0.38 + 0.16 * spread)), ey = R * (-0.02 + (0.5 - params.eyeHeight) * 1.2);
      for (let side of [-1, 1]) {
        let eye = s("g", { transform: `translate(${side * ex} ${ey})` }, head);
        s("path", { d: `M${-eyeR * 0.78} ${eyeR * 0.05} Q0 ${eyeR * 0.62} ${eyeR * 0.78} ${eyeR * 0.05}`, fill: "none", stroke: LINE, "stroke-width": lw * 0.85, "stroke-linecap": "round", class: "portrait__sleep-eye" }, eye);
        let open = s("g", { class: "portrait__eye" }, eye), clip = s("clipPath", { id: `${id}-e${++serial}` }, defs);
        s("ellipse", { cx: 0, cy: 0, rx: eyeR, ry: eyeR * 1.06 }, clip), s("ellipse", { cx: 0, cy: 0, rx: eyeR, ry: eyeR * 1.06, fill: EYE }, open), s("ellipse", { cx: eyeR * 0.05, cy: eyeR * 0.5, rx: eyeR * 0.72, ry: eyeR * 0.42, fill: tokens["portrait-eye-shade"], opacity: 0.55, "clip-path": `url(#${clip.id})` }, open), s("circle", { cx: -eyeR * 0.34, cy: -eyeR * 0.38, r: eyeR * 0.2, fill: PAGE }, open), s("ellipse", { cx: 0, cy: 0, rx: eyeR, ry: eyeR * 1.06, fill: "none", stroke: LINE, "stroke-width": lw * 0.5 }, open);
      }
      for (let side of [-1, 1])
        s("ellipse", { cx: side * R * 0.74, cy: R * 0.52, rx: R * 0.14, ry: R * 0.08, fill: PEACH, class: "portrait__cheek", style: params.cheeks ? "opacity:.5" : "" }, head);
      if (params.snout === "button")
        s("ellipse", { cx: R * 0.02, cy: R * 0.32, rx: R * 0.09, ry: R * 0.06, fill: tone.shadow }, head);
      return s("path", { d: `M${-R * 0.1} ${R * 0.52} Q0 ${R * 0.58} ${R * 0.1} ${R * 0.52}`, fill: "none", stroke: LINE, "stroke-width": lw * 0.6, "stroke-linecap": "round", class: "p-calm" }, head), s("path", { d: `M${-R * 0.13} ${R * 0.5} Q0 ${R * 0.68} ${R * 0.13} ${R * 0.5}`, fill: "none", stroke: LINE, "stroke-width": lw * 0.65, "stroke-linecap": "round", class: "portrait__mouth" }, head), rememberPortrait(svg, { headRadius: R, eyeRadius: eyeR }), svg.dataset.asleep = String(asleep), svg.classList.add("portrait", "portrait-v2"), svg;
    }
    let svg = paint(params, look, { ...state, size: typeof state.size === "number" ? state.size : 0 }), source = new DOMParser().parseFromString(paintDefinitions, "image/svg+xml"), defs = document2.importNode(source.documentElement.querySelector("defs"), !0);
    svg.prepend(defs);
    for (let node of svg.querySelectorAll("[id]")) {
      let previous = node.id, next = `paint-${++serial}-${previous}`;
      node.id = next;
      for (let drawn of svg.querySelectorAll("*"))
        for (let attribute of Array.from(drawn.attributes))
          if (attribute.value.includes(`url(#${previous})`))
            drawn.setAttribute(attribute.name, attribute.value.replaceAll(`url(#${previous})`, `url(#${next})`));
    }
    if (svg.dataset.version = params.version, svg.dataset.size = String(state.size ?? "stage"), typeof state.size === "number")
      svg.setAttribute("width", String(state.size)), svg.setAttribute("height", String(state.size * 1.25));
    if (state.decorative)
      svg.setAttribute("aria-hidden", "true");
    else
      svg.removeAttribute("aria-hidden"), svg.setAttribute("role", "img"), s("title", {}, svg).textContent = state.name;
    return svg;
  }

  // packages/app/src/app/painted-scene.ts
  var MOSS = "0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf", FERN = "0x2B5AD5c4795c026514f8317c7a215E218DcCD6cF", JUNIPER = "0xF1F6619B38A98d6De0800F1DefC0a6399eB6d30C", CLOVER = "0x1efF47bc3a10a45D4B230B5d10E37751FE6AA718";

  // docs/explorations/scene-proportions/src/mocks.ts
  var ROOM = { w: 1600, h: 897 }, h = (tag, attrs = {}, ...children) => {
    let el = document.createElement(tag);
    for (let [k, v] of Object.entries(attrs))
      el.setAttribute(k, v);
    return el.append(...children.filter(Boolean)), el;
  }, DEVICES = [{ name: "390 × 844", width: 390, height: 844, desktop: !1 }, { name: "375 × 667", width: 375, height: 667, desktop: !1 }, { name: "1280 × 720", width: 1280, height: 720, desktop: !0 }], roomHeight = (d) => d.desktop ? Math.max(d.width / 1.7837, d.height - 36) : 0.8 * d.height;
  function room(d, floor, painting, light) {
    let rh = roomHeight(d), rw = rh * ROOM.w / ROOM.h;
    return { el: h("div", { class: `room light-${light}`, style: `width:${floor.width}px;height:${floor.height}px` }, h("div", { class: "paint", style: `background-image:url(../../../packages/app/public/scenes/${painting}.webp);background-size:auto ${rh}px` }), h("div", { class: "wash" })), at: (x, y) => ({ left: floor.width / 2 + (x / 100 - 0.5) * rw, top: floor.height - (1 - y / 100) * rh }), k: rh / ROOM.h };
  }
  function critter(address, variant, opts) {
    let p = generate2(address, variant), svg = paintV2(document, p, { name: "", decorative: !0, size: "stage", asleep: !!opts.asleep, fed: opts.fed ?? 0 });
    svg.style.setProperty("--mouth", opts.delighted ? "1" : "0"), svg.style.setProperty("--cheeks", opts.delighted ? "1" : "0");
    let { left, top } = opts.at(opts.x, opts.y), width = opts.size * opts.k, node = h("div", { class: "crit", style: `left:${left}px;top:${top}px;width:${width}px` });
    if (opts.face === "left")
      svg.style.transform = "scaleX(-1)";
    return node.append(svg), { node, params: p };
  }
  function heap(n, x, y, size, r) {
    let s = (tag, a, parent) => {
      let e = document.createElementNS("http://www.w3.org/2000/svg", tag);
      for (let [k, v] of Object.entries(a))
        e.setAttribute(k, String(v));
      return parent?.append(e), e;
    }, k = 0;
    while (k * (k + 1) / 2 < n)
      k++;
    let w = k * 5.2 + 8, hh = k * 3.4 + 9, svg = s("svg", { viewBox: `${-w / 2} ${-hh + 4.5} ${w} ${hh}`, "aria-hidden": "true" });
    s("ellipse", { cx: 0, cy: 2, rx: w / 2 - 1.5, ry: 2.4, fill: "#2E2226", opacity: 0.16 }, svg);
    let placed = 0;
    for (let row = 0;row < k && placed < n; row++) {
      let count = Math.min(k - row, n - placed);
      for (let i = 0;i < count; i++, placed++) {
        let g = s("g", { transform: `translate(${(i - (count - 1) / 2) * 5.2} ${-row * 3.4 - 1}) rotate(${placed * 37 % 70 - 35}) scale(.4)` }, svg);
        s("path", { d: "M-6-3 -1-6.5 5-4 7.5 1 2 6.5 -5.5 4Z", fill: "#CFA552", stroke: "#2E2226", "stroke-width": 1.3, "stroke-linejoin": "round" }, g), s("ellipse", { cx: -2, cy: -2.5, rx: 2.6, ry: 1.6, fill: "#F2DD8E" }, g);
      }
    }
    let { left, top } = r.at(x, y), width = size * r.k * Math.max(1, k / 4), node = h("div", { class: "prop", style: `left:${left}px;top:${top}px;width:${width}px` });
    return node.append(svg), node;
  }
  function frame(d, title, scene, sheet, sheetH) {
    let header = h("header", { class: "bar" }, h("b", { class: "wordmark" }, "Critter Crumbs"), h("span", { class: "music", "aria-hidden": "true" }, "♪")), f = h("div", { class: `frame ${d.desktop ? "desktop" : "phone"}`, style: `width:${d.width}px;height:${d.height}px`, "aria-label": `${title}, ${d.name}` }), body = h("div", { class: "mock-content" }, ...sheet.slice(0, -1)), actions = h("div", { class: "mock-actions" }, sheet[sheet.length - 1]);
    if (d.desktop) {
      let panel = Math.min(480, Math.max(400, d.width * 0.25)), floor = { width: d.width - panel, height: d.height - 64 };
      f.append(header, h("div", { class: "body desktop" }, h("div", { class: "floor" }, scene(floor)), h("section", { class: "panel", style: `width:${panel}px` }, body, actions)));
    } else {
      let sheetPx = Math.min(sheetH, 0.58 * d.height), floor = { width: d.width, height: d.height - 64 - sheetPx + 24 };
      f.append(header, h("div", { class: "floor", style: `height:${floor.height}px` }, scene(floor)), h("section", { class: "sheet", style: `height:${sheetPx}px` }, body, actions));
    }
    return f;
  }
  var field = (label, value, count) => h("label", { class: "field" }, h("span", {}, label), h("span", { class: "input" }, h("span", {}, value), h("i", {}, count)));
  function meeting(d) {
    let sheet = [
      h("div", { class: "between" }, h("h2", {}, "Meet your critter"), h("span", { class: "chip" }, "Earth")),
      h("p", {}, "Made from your address. Re-roll up to 4 times, then it's yours."),
      field("What should the burrow call you?", "Moss", "4 / 40"),
      h("div", { class: "grow" }),
      h("div", { class: "actions" }, h("button", { class: "soft" }, "Re-roll (4 left)"), h("button", { class: "pill" }, "Keep this one"))
    ];
    return frame(d, "First meeting", (floor) => {
      let r = room(d, floor, "window", "day");
      return r.el.append(critter(MOSS, 0, { size: 230, k: r.k, x: 50, y: 94, at: r.at, delighted: !1 }).node), r.el;
    }, sheet, 330);
  }
  function feastStep(d) {
    let rows = [[MOSS, "Moss", 120], [CLOVER, "Clover", 90], [JUNIPER, "Juniper", 60], [FERN, "Fern", 30]], table = h("div", { class: "mini-results" }, ...rows.map(([, name, n]) => h("div", { class: "row" }, h("span", {}, name), h("b", {}, String(n)), h("span", { class: "share" }, `${Math.round(n / 3)}%`)))), sheet = [
      h("div", { class: "dots", "aria-hidden": "true" }, h("i"), h("i"), h("i"), h("i", { "data-on": "true" })),
      h("h2", {}, "When the feast opens"),
      h("p", {}, "Every scatter opens at once. A critter's share is what it received out of every crumb given."),
      table,
      h("p", { class: "help" }, "Fern didn't scatter and still received 30. Shares count the 300 crumbs given."),
      h("div", { class: "grow" }),
      h("button", { class: "pill wide" }, "Got it")
    ];
    return frame(d, "First steps, a feast", (floor) => {
      let r = room(d, floor, "window", "feast"), spots = [[39.4, 90, 165, "right"], [46.1, 94, 190, void 0], [54.5, 93, 190, "left"], [61, 89, 165, "left"]];
      return rows.forEach(([address, , n], i) => {
        let fed = Math.min(1, n / 300 * 4 / 2.5) ** 0.75, [x, y, size, face] = spots[i];
        r.el.append(critter(address, 0, { size, k: r.k, x, y, at: r.at, delighted: !0, fed, ...face ? { face } : {} }).node), r.el.append(heap(Math.round(n / 10), x + 3.4, y + 1, 30, r));
      }), r.el;
    }, sheet, 380);
  }
  var root = document.getElementById("mocks");
  for (let [title, make] of [["The first meeting, one surface", meeting], ["A fourth first step: the feast, worked through", feastStep]]) {
    let row = h("div", { class: "row-frames" });
    for (let d of DEVICES)
      row.append(h("figure", {}, make(d), h("figcaption", {}, d.name)));
    root.append(h("section", {}, h("h2", {}, title), row));
  }
})();
