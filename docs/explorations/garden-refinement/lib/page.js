/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-unused-expressions -- Generated review bundle. */
"use strict";
(() => {
  var __require = /* @__PURE__ */ ((x) => typeof require < "u" ? require : typeof Proxy < "u" ? new Proxy(x, {
    get: (a, b) => (typeof require < "u" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require < "u")
      return require.apply(this, arguments);
    throw Error('Dynamic require of "' + x + '" is not supported');
  });
  // docs/explorations/garden-refinement/fixtures.json
  var fixtures_default = {
    generatorVersion: "2",
    renderer: "garden-refined-review-1",
    note: "Comparison fixtures selected to keep one species across variants 0–2; ordinary rerolls can change species. No saved identities are changed.",
    groups: [
      {
        species: "squirrel",
        name: "Acorn squirrel",
        address: "0x0000000000000000000000000000000000000052",
        variants: [
          0,
          1,
          2
        ]
      },
      {
        species: "moth",
        name: "Lichen moth",
        address: "0x000000000000000000000000000000000000024e",
        variants: [
          0,
          1,
          2
        ]
      },
      {
        species: "turtle",
        name: "Pond turtle",
        address: "0x000000000000000000000000000000000000014c",
        variants: [
          0,
          1,
          2
        ]
      },
      {
        species: "koi",
        name: "Koi kite",
        address: "0x00000000000000000000000000000000000000fd",
        variants: [
          0,
          1,
          2
        ]
      },
      {
        species: "fox",
        name: "Ember fox",
        address: "0x0000000000000000000000000000000000000479",
        variants: [
          0,
          1,
          2
        ]
      },
      {
        species: "phoenix",
        name: "Phoenix chick",
        address: "0x00000000000000000000000000000000000000b6",
        variants: [
          0,
          1,
          2
        ]
      },
      {
        species: "lemur",
        name: "Flying lemur",
        address: "0x00000000000000000000000000000000000001ba",
        variants: [
          0,
          1,
          2
        ]
      },
      {
        species: "lamb",
        name: "Cloud lamb",
        address: "0x000000000000000000000000000000000000011b",
        variants: [
          0,
          1,
          2
        ]
      }
    ]
  };
  // packages/shared/dist/limits.js
  var MAX_FEAST_TARGETS = 49;
  // packages/shared/dist/feel.js
  var HOLD_DELAY_MS = 300, POUR_RATE_MIN = 8, POUR_RATE_MAX = 40, POUR_RAMP_S = 1.5, POUR_SCALE = { base: 100, min: 0.5, max: 5 };
  var REPLY = { soundAheadMs: 20, ticksBeforeHold: 3, releaseFadeMs: 60, wallDegrees: 2, wallMs: 120, emptyOutlines: 3 }, TYPED_AMOUNT = { maxMs: 320, perCrumbMs: 8 }, RIG = { scale: [0.9, 1.4], lean: 3, posture: [-3, 0], headTilt: 8, ear: [-25, 15], lid: [0.12, 1], pupil: 0.3, cheekThreshold: 0.5, mouthThreshold: 0.35, mouthOpacity: 0.6, mouthTriangles: 40 }, IDLE = {
    awake: { breath: 0.012, breathHz: 0.4, wobble: 1.5, wobbleHz: 0.2 },
    asleep: { breath: 0.015, breathHz: 0.25, wobble: 0, earDroop: 25, nod: -4, nodMs: 600, nodEveryMs: 8000 },
    pleased: { threshold: 0.75, breath: 0.015, breathHz: 0.5, wobble: 2, wobbleHz: 0.3, hopScale: [1.04, 0.97], hopHeight: 0.03, hopMs: 260, hopEveryMs: [6000, 1e4] },
    blinkEveryMs: [3000, 6000],
    blinkMs: 120,
    pupilDrift: 0.05,
    pupilEveryMs: [4000, 9000]
  }, BUMP = [[0, 1.08, 0.92, 1.08], [90, 0.97, 1.04, 0.97], [180, 1.01, 0.995, 1.01], [260, 1, 1, 1]], CRUMB_GAZE = { ms: 120, lidWiden: 0.1 }, CHEW = { amplitude: 0.03, rateFraction: 0.25, maxHz: 8, earDegrees: 3, cheekScale: 1.2, mouthAdd: 0.2, decayMs: 260 }, WAKE = { ms: 600, lidEndMs: 120, earStartMs: 60, earEndMs: 500, stiffness: 180, damping: 12, overshootDegrees: 8, stretchStartMs: 120, stretchEndMs: 520, stretch: [0.95, 1.08, 0.95], headStartMs: 200 }, GROWTH = { fairShareCap: 2.5, exponent: 0.75, scaleGain: 0.35, minimumContentMood: 0.25 }, EXPRESSION = [
    { mood: 0, squint: 0, earLift: 0, mouth: 0, cheekScale: 0, tiltFactor: 1, posture: 0 },
    { mood: 0.25, squint: 0.1, earLift: 5, mouth: 0, cheekScale: 0, tiltFactor: 0.8, posture: 0 },
    { mood: 0.5, squint: 0.2, earLift: 10, mouth: 0.4, cheekScale: 1, tiltFactor: 0.5, posture: -1 },
    { mood: 0.75, squint: 0.3, earLift: 12, mouth: 0.7, cheekScale: 1, tiltFactor: 0.3, posture: -2 },
    { mood: 1, squint: 0.45, earLift: 15, mouth: 1, cheekScale: 1.1, tiltFactor: 0, posture: -3 }
  ], DELIGHTED = { wiggleDegrees: 3, wiggleEveryMs: 4000 }, DELIGHT_MOOD = 0.5, REDUCED_MOTION = { countPulseMs: 120, growthCrossfadeMs: 320, wakeCrossfadeMs: 200, dampingDb: -6, maxTicksPerSecond: 8 }, STATEMENTS_FOCUS_MS = 1200, STATEMENTS_REVEAL = { lightMs: 600, wakeStartMs: 200, staggerMs: 80, reducedMs: 200 }, FEAST = { glyphs: 24, fillMs: 400, glyphStaggerMs: 20, openSoundMs: 1200, wakeStartMs: 400, wakeEndMs: 1200, wakeStaggerMs: 40, waveStartMs: 1200, waveStaggerMs: 450, feedMs: 900, growOvershoot: 0.06, growPeakMs: 600, hops: [12, 24], minHops: 4, hopStreamMs: 600, settleDelayMs: 200, settleScale: [1.05, 0.96], settleHopMs: 300, settleLightMs: 800, maxMs: 8000, reducedMs: 320, skipMs: 200, skipSoundMs: 100 }, FLIGHT = { ms: 380, maxAlive: 64 }, DOM_HOP = { ms: 320, ease: [0.2, 0.8, 0.2, 1], maxAlive: 60, apexPx: 70, turnDegrees: 240, fadeAt: 0.8 };
  var CIRCLE_FEEL = { presentationMs: 100, turnMs: 320, stirMs: 850, sleepGlyphMs: 1100, sleepReleaseMs: 130, sleepLifeMs: 840, sleepDriftX: 16, sleepDriftY: 32, playEveryMs: [900, 2100], playMs: 480, phone: { focus: 140, back: 66, front: 100 }, desktop: { focus: 248, back: 120, front: 172 }, huddle: { phone: 66, desktop: 150 } };
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
  // docs/explorations/critter-directions/src/ink.ts
  var FOOT = 140, CENTER = 60;
  var BOX_H = 150, INK = "#2E2226", EYE = "#2C2129", EYE_SHADE = "#5B4350", PAGE = "#F6F0E4", CHEEK = "#F5A95D", CREAM = "#F3E6D6";
  var ELEMENT = {
    earth: { shadow: "#156152", base: "#289946", light: "#ACE676", soft: "#DEF5DA", glow: "#E9C46A" },
    water: { shadow: "#263580", base: "#2564B8", light: "#84D3F0", soft: "#E1EDFC", glow: "#9FE1DC" },
    fire: { shadow: "#852318", base: "#EB521D", light: "#F5A95D", soft: "#FCE7DE", glow: "#F28C38" },
    air: { shadow: "#52366B", base: "#B26ACC", light: "#E9BBF0", soft: "#F1E3FA", glow: "#BFE3F5" }
  }, serial = 0, uid = (prefix) => `${prefix}${(++serial).toString(36)}`;
  function mix(a, b, t) {
    let p = (x) => [1, 3, 5].map((i) => parseInt(x.slice(i, i + 2), 16)), A = p(a), B = p(b);
    return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, "0")).join("");
  }
  function oklch(l, c, h) {
    let lin = (cc) => {
      let a = cc * Math.cos(h * Math.PI / 180), b = cc * Math.sin(h * Math.PI / 180), l_ = l + 0.3963377774 * a + 0.2158037573 * b, m_ = l - 0.1055613458 * a - 0.0638541728 * b, s_ = l - 0.0894841775 * a - 1.291485548 * b, L = l_ ** 3, M = m_ ** 3, S = s_ ** 3;
      return [4.0767416621 * L - 3.3077115913 * M + 0.2309699292 * S, -1.2684380046 * L + 2.6097574011 * M - 0.3413193965 * S, -0.0041960863 * L - 0.7034186147 * M + 1.707614701 * S];
    }, lo = 0, hi = c, rgb = lin(c), ok = (v) => v.every((x) => x >= -0.000001 && x <= 1.000001);
    if (!ok(rgb)) {
      for (let i = 0;i < 22; i++) {
        let m = (lo + hi) / 2;
        if (ok(lin(m)))
          lo = m;
        else
          hi = m;
      }
      rgb = lin(lo);
    }
    return "#" + rgb.map((v) => Math.round(255 * Math.max(0, Math.min(1, v <= 0.0031308 ? 12.92 * v : 1.055 * v ** 0.4166666666666667 - 0.055))).toString(16).padStart(2, "0")).join("");
  }
  function toneOf(colour, coolShadow = "#3E4F63", warmLight = "#FBF0DC") {
    return { light: mix(colour, warmLight, 0.42), base: colour, shadow: mix(mix(colour, coolShadow, 0.38), "#2E2226", 0.12) };
  }

  class Pen {
    doc;
    svg;
    lw;
    defs;
    finish = "ink";
    constructor(doc, svg, lw) {
      this.doc = doc;
      this.svg = svg;
      this.lw = lw;
      this.defs = this.el("defs", {}, svg);
    }
    el(tag, attrs = {}, parent) {
      let node = this.doc.createElementNS("http://www.w3.org/2000/svg", tag);
      for (let [k, v] of Object.entries(attrs))
        if (v !== null && v !== void 0)
          node.setAttribute(k, String(v));
      return parent?.append(node), node;
    }
    g(parent, attrs = {}) {
      return this.el("g", attrs, parent);
    }
    filters = /* @__PURE__ */ new Map;
    filter(kind) {
      let have = this.filters.get(kind);
      if (have)
        return `url(#${have})`;
      let id = uid(`f${kind}`), f = this.el("filter", { id, x: "-20%", y: "-20%", width: "140%", height: "140%" }, this.defs);
      if (kind === "loose" || kind === "loose2")
        this.el("feTurbulence", { type: "fractalNoise", baseFrequency: kind === "loose" ? 0.045 : 0.06, numOctaves: 2, seed: kind === "loose" ? 7 : 23, result: "n" }, f), this.el("feDisplacementMap", { in: "SourceGraphic", in2: "n", scale: kind === "loose" ? 1.8 : 2.8, xChannelSelector: "R", yChannelSelector: "G" }, f);
      else if (kind === "soft")
        this.el("feGaussianBlur", { stdDeviation: 0.9 }, f);
      else if (kind === "wash")
        this.el("feTurbulence", { type: "fractalNoise", baseFrequency: "0.09 0.35", numOctaves: 2, seed: 4, result: "n" }, f), this.el("feDisplacementMap", { in: "SourceGraphic", in2: "n", scale: 4, xChannelSelector: "R", yChannelSelector: "G", result: "d" }, f), this.el("feGaussianBlur", { in: "d", stdDeviation: 0.8 }, f);
      else
        this.el("feTurbulence", { type: "fractalNoise", baseFrequency: 0.85, numOctaves: 2, seed: 3, result: "n" }, f), this.el("feColorMatrix", { in: "n", type: "matrix", values: "0 0 0 0 .16  0 0 0 0 .12  0 0 0 0 .15  0 0 0 .2 0", result: "g" }, f), this.el("feComposite", { in: "g", in2: "SourceGraphic", operator: "in", result: "gi" }, f), this.el("feBlend", { in: "SourceGraphic", in2: "gi", mode: "multiply" }, f);
      return this.filters.set(kind, id), `url(#${id})`;
    }
    clip(d) {
      let id = uid("c");
      return this.el("path", { d }, this.el("clipPath", { id }, this.defs)), `url(#${id})`;
    }
    radial(stops, cx = 0.34, cy = 0.28, r = 0.95) {
      let id = uid("r"), grad = this.el("radialGradient", { id, cx, cy, r }, this.defs);
      for (let [o, c, a] of stops)
        this.el("stop", { offset: o, "stop-color": c, "stop-opacity": a ?? 1 }, grad);
      return `url(#${id})`;
    }
    linear(stops, x1 = 0, y1 = 0, x2 = 0, y2 = 1) {
      let id = uid("l"), grad = this.el("linearGradient", { id, x1, y1, x2, y2 }, this.defs);
      for (let [o, c, a] of stops)
        this.el("stop", { offset: o, "stop-color": c, "stop-opacity": a ?? 1 }, grad);
      return `url(#${id})`;
    }
    form(parent, d, tone, o = {}) {
      let w = (o.weight ?? 1) * this.lw, g = this.g(parent, o.attrs ?? {}), loose = this.filter("loose");
      if (!o.noLine)
        this.el("path", { d, fill: "#2E2226", stroke: "#2E2226", "stroke-width": w * 1.3, "stroke-linejoin": "round", transform: `translate(${(w * 0.34).toFixed(2)} ${(w * 0.44).toFixed(2)})`, filter: loose }, g);
      if (this.el("path", { d, fill: o.flat ? tone.base : this.radial([[0, tone.light], [0.55, tone.base], [1, tone.base]], 0.3, 0.24, 0.85) }, g), !o.flat) {
        let painted = this.finish === "painted", s = o.size ?? 20, [dx, dy] = o.shade ?? (painted ? [0.42, 0.52] : [0.52, 0.6]), inner = this.g(g, { "clip-path": this.clip(d) }), lens = this.g(inner, { "clip-path": this.clip(d), transform: `translate(${(s * dx).toFixed(2)} ${(s * dy).toFixed(2)})` });
        if (this.el("path", { d, fill: tone.shadow, opacity: o.shadowOpacity ?? (painted ? 0.38 : 0.5), filter: this.filter("soft"), transform: `translate(${(-s * dx * 0.08).toFixed(2)} ${(-s * dy * 0.08).toFixed(2)})` }, lens), o.hatch && !painted)
          this.el("path", { d, fill: `url(#${this.hatchId()})`, opacity: 0.55 }, lens);
        if (painted && s > 4)
          this.el("path", { d, fill: "none", stroke: mix(tone.light, "#FFE7C2", 0.4), "stroke-width": Math.max(1.2, s * 0.11), opacity: 0.5, transform: `translate(${(-s * 0.05).toFixed(2)} ${(-s * 0.06).toFixed(2)})`, filter: this.filter("soft") }, inner);
        if (o.grain)
          this.el("path", { d, fill: tone.base, opacity: 0.5, filter: this.filter("grain"), style: "mix-blend-mode:multiply" }, inner);
      }
      if (!o.noLine)
        this.el("path", { d, fill: "none", stroke: "#2E2226", "stroke-width": w * 0.6, "stroke-linejoin": "round", "stroke-linecap": "round", opacity: 0.9, filter: loose }, g), this.el("path", { d, fill: "none", stroke: "#2E2226", "stroke-width": w * 0.32, opacity: 0.26, transform: "translate(1.1 .7)", filter: this.filter("loose2") }, g);
      return g;
    }
    hatch;
    hatchId() {
      if (this.hatch)
        return this.hatch;
      let id = uid("h"), pat = this.el("pattern", { id, width: 3.6, height: 3.6, patternUnits: "userSpaceOnUse", patternTransform: "rotate(-38)" }, this.defs);
      return this.el("path", { d: "M0 0 L0 3.6", stroke: "#2E2226", "stroke-width": 0.8, opacity: 0.55 }, pat), this.hatch = id;
    }
    patch(parent, d, fill, opacity = 1, attrs = {}) {
      return this.el("path", { d, fill, opacity, ...attrs }, parent);
    }
    stroke(parent, d, width, attrs = {}) {
      return this.el("path", { d, fill: "none", stroke: "#2E2226", "stroke-width": width, "stroke-linecap": "round", "stroke-linejoin": "round", filter: this.filter("loose"), ...attrs }, parent);
    }
    glow(parent, x, y, r, colour, strength = 0.75) {
      return this.el("circle", { cx: x, cy: y, r, fill: this.radial([[0, colour, strength], [1, colour, 0]], 0.5, 0.5, 0.5) }, parent);
    }
  }
  var ellipsePath = (cx, cy, rx, ry) => `M${cx - rx} ${cy}a${rx} ${ry} 0 1 0 ${2 * rx} 0a${rx} ${ry} 0 1 0 ${-2 * rx} 0Z`, f = (n) => +n.toFixed(2);
  function blob(points, tension = 1) {
    let n = points.length, p = (i) => points[(i + n) % n], d = `M${f(p(0)[0])} ${f(p(0)[1])}`;
    for (let i = 0;i < n; i++) {
      let p0 = p(i - 1), p1 = p(i), p2 = p(i + 1), p3 = p(i + 2), t = tension / 6;
      d += `C${f(p1[0] + (p2[0] - p0[0]) * t)} ${f(p1[1] + (p2[1] - p0[1]) * t)} ${f(p2[0] - (p3[0] - p1[0]) * t)} ${f(p2[1] - (p3[1] - p1[1]) * t)} ${f(p2[0])} ${f(p2[1])}`;
    }
    return d + "Z";
  }
  function curve(points, tension = 1) {
    let n = points.length, p = (i) => points[Math.max(0, Math.min(n - 1, i))], d = `M${f(p(0)[0])} ${f(p(0)[1])}`;
    for (let i = 0;i < n - 1; i++) {
      let p0 = p(i - 1), p1 = p(i), p2 = p(i + 1), p3 = p(i + 2), t = tension / 6;
      d += `C${f(p1[0] + (p2[0] - p0[0]) * t)} ${f(p1[1] + (p2[1] - p0[1]) * t)} ${f(p2[0] - (p3[0] - p1[0]) * t)} ${f(p2[1] - (p3[1] - p1[1]) * t)} ${f(p2[0])} ${f(p2[1])}`;
    }
    return d;
  }
  function stream(seed) {
    let s = seed | 0;
    return () => {
      s = s + 1831565813 | 0;
      let v = Math.imul(s ^ s >>> 15, 1 | s);
      return v ^= v + Math.imul(v ^ v >>> 7, 61 | v), ((v ^ v >>> 14) >>> 0) / 4294967296;
    };
  }

  // docs/explorations/critter-directions/src/face.ts
  function drawFace(pen, head, o) {
    let { r } = o, lw = pen.lw, eyeR = r * o.eye, ex = r * o.spread, ey = r * o.eyeY, turn = (o.turn ?? 0) * r;
    for (let side of [-1, 1]) {
      let anchor = pen.g(head, { transform: `translate(${f(side * ex + turn)} ${f(ey)})` });
      pen.el("path", { d: `M${f(-eyeR * 0.8)} ${f(eyeR * 0.05)}Q0 ${f(eyeR * 0.66)} ${f(eyeR * 0.8)} ${f(eyeR * 0.05)}`, fill: "none", stroke: INK, "stroke-width": lw * 0.85, "stroke-linecap": "round", class: "portrait__sleep-eye" }, anchor);
      let open = pen.g(anchor, { class: "portrait__eye" }), clip = pen.clip(ellipsePath(0, 0, eyeR, eyeR * 1.06));
      if (pen.el("ellipse", { cx: 0, cy: 0, rx: eyeR, ry: eyeR * 1.06, fill: EYE }, open), pen.el("ellipse", { cx: eyeR * 0.06, cy: eyeR * 0.52, rx: eyeR * 0.74, ry: eyeR * 0.42, fill: EYE_SHADE, opacity: 0.55, "clip-path": clip }, open), pen.el("circle", { cx: -eyeR * 0.34, cy: -eyeR * 0.38, r: eyeR * 0.21, fill: PAGE }, open), o.delighted)
        pen.el("circle", { cx: eyeR * 0.3, cy: eyeR * 0.3, r: eyeR * 0.08, fill: PAGE, opacity: 0.85 }, open);
      pen.el("ellipse", { cx: 0, cy: 0, rx: eyeR, ry: eyeR * 1.06, fill: "none", stroke: INK, "stroke-width": lw * 0.5 }, open);
    }
    let mouthY = r * (o.kind === "bird" ? 0.5 : o.kind === "fish" ? 0.42 : 0.5);
    for (let side of [-1, 1])
      pen.el("ellipse", { cx: side * r * 0.72 + turn, cy: r * 0.5, rx: r * 0.15, ry: r * 0.085, fill: CHEEK, opacity: 0.55, class: "portrait__cheek" }, head);
    if (o.kind === "bird" && o.beakTone) {
      let b = o.beakTone, by = r * 0.3;
      pen.form(head, `M${f(-r * 0.15 + turn)} ${f(by)}Q${f(turn)} ${f(by - r * 0.12)} ${f(r * 0.15 + turn)} ${f(by)}Q${f(r * 0.04 + turn)} ${f(by + r * 0.24)} ${f(turn)} ${f(by + r * 0.26)}Q${f(-r * 0.04 + turn)} ${f(by + r * 0.24)} ${f(-r * 0.15 + turn)} ${f(by)}Z`, b, { weight: 0.55, size: r * 0.15 });
      return;
    }
    if (o.kind === "mammal" || o.kind === "lamb" || o.kind === "turtle") {
      let nose = o.noseTone ?? INK, ny = r * 0.3;
      pen.el("path", { d: `M${f(-r * 0.08 + turn)} ${f(ny)}Q${f(turn)} ${f(ny - r * 0.05)} ${f(r * 0.08 + turn)} ${f(ny)}Q${f(turn)} ${f(ny + r * 0.09)} ${f(-r * 0.08 + turn)} ${f(ny)}Z`, fill: nose, opacity: o.kind === "turtle" ? 0.55 : 0.85 }, head);
    }
    if (o.kind === "fish") {
      pen.el("ellipse", { cx: turn, cy: mouthY, rx: r * 0.08, ry: r * 0.06, fill: INK, opacity: 0.75, class: "p-calm" }, head), pen.el("path", { d: `M${f(-r * 0.12 + turn)} ${f(mouthY - r * 0.02)}Q${f(turn)} ${f(mouthY + r * 0.2)} ${f(r * 0.12 + turn)} ${f(mouthY - r * 0.02)}Z`, fill: "#7A3B3A", stroke: INK, "stroke-width": lw * 0.45, class: "portrait__mouth", opacity: 0 }, head);
      return;
    }
    pen.el("path", { d: `M${f(-r * 0.11 + turn)} ${f(mouthY)}Q${f(turn)} ${f(mouthY + r * 0.07)} ${f(r * 0.11 + turn)} ${f(mouthY)}`, fill: "none", stroke: INK, "stroke-width": lw * 0.58, "stroke-linecap": "round", class: "p-calm" }, head), pen.el("path", { d: `M${f(-r * 0.15 + turn)} ${f(mouthY - r * 0.02)}Q${f(turn)} ${f(mouthY + r * 0.24)} ${f(r * 0.15 + turn)} ${f(mouthY - r * 0.02)}Z`, fill: "#7A3B3A", stroke: INK, "stroke-width": lw * 0.5, "stroke-linejoin": "round", class: "portrait__mouth" }, head);
  }

  // docs/explorations/critter-directions/src/garden.ts
  var SPECIES = { earth: ["squirrel", "moth"], water: ["turtle", "koi"], fire: ["fox", "phoenix"], air: ["lemur", "lamb"] };
  var FLIERS = /* @__PURE__ */ new Set(["moth", "koi", "phoenix", "lemur", "lamb"]), clamp01 = (x) => Math.min(0.999, Math.max(0, x));
  function uniforms(p) {
    return [
      (p.bodyHeight - 0.85) / 0.4,
      (p.bodyWidth - 0.75) / 0.4,
      p.belly / 0.3,
      (p.headSize - 0.5) / 0.22,
      (p.headTilt + 8) / 16,
      (p.earSize - 0.18) / 0.32,
      (p.earSpread - 35) / 40,
      (p.eyeSize - 0.1) / 0.1,
      (p.eyeSpacing - 0.32) / 0.3,
      (p.eyeHeight - 0.45) / 0.17,
      (p.pupilSize - 0.45) / 0.25,
      (p.legLength - 0.15) / 0.2,
      (p.chroma - 0.06) / 0.07,
      (p.lightness - 0.58) / 0.18,
      (p.accentShift - 15) / 30,
      p.idlePhase
    ].map(clamp01);
  }
  function gardenDraw(p, finish = "ink") {
    let u = uniforms(p), element = p.element, species = SPECIES[element][u[15] < 0.5 ? 0 : 1];
    return { element, species, u, seed: Math.floor(u[15] * 1e9) ^ Math.floor(u[1] * 1e6), finish, head: finish === "painted" ? 1.2 : 1 };
  }
  var lerp = (a, b, t) => a + (b - a) * t, pick = (list, x) => list[Math.min(list.length - 1, Math.floor(x * list.length))];
  function faceFrom(u, r) {
    return { r, eye: 0.29 + 0.07 * u[7], spread: 0.4 + 0.12 * u[8], eyeY: -0.04 + 0.12 * (0.5 - u[9]) };
  }
  var elTone = (e, k = 0) => {
    let E = ELEMENT[e];
    return { light: mix(E.light, CREAM, 0.25 + k), base: mix(E.base, E.light, 0.25 + k), shadow: E.shadow };
  }, own = (l, c, h, soften = 0.28) => toneOf(mix(oklch(l, c, h), CREAM, soften));
  function oakLeaf(pen, parent, x, y, size, angle, tone) {
    let s = size, half = s * 0.42, pts = [[0, 0], [half * 0.55, -s * 0.15], [half * 0.95, -s * 0.28], [half * 0.6, -s * 0.38], [half * 1, -s * 0.52], [half * 0.55, -s * 0.62], [half * 0.8, -s * 0.78], [0, -s], [-half * 0.8, -s * 0.78], [-half * 0.55, -s * 0.62], [-half * 1, -s * 0.52], [-half * 0.6, -s * 0.38], [-half * 0.95, -s * 0.28], [-half * 0.55, -s * 0.15]], g = pen.g(parent, { transform: `translate(${f(x)} ${f(y)}) rotate(${f(angle)})` });
    return pen.form(g, blob(pts, 0.7), tone, { weight: 0.55, size: s * 0.5, shade: [0.4, 0.3] }), pen.stroke(g, `M0 ${f(-s * 0.05)}L0 ${f(-s * 0.85)}`, pen.lw * 0.35, { opacity: 0.6 }), g;
  }
  function acorn(pen, parent, x, y, s, glowCol) {
    let g = pen.g(parent, { transform: `translate(${f(x)} ${f(y)})` });
    pen.glow(g, 0, -s * 0.2, s * 1.4, glowCol, 0.45), pen.form(g, ellipsePath(0, s * 0.25, s * 0.55, s * 0.68), toneOf("#C8955A"), { weight: 0.5, size: s * 0.5 }), pen.form(g, `M${f(-s * 0.68)} ${f(-s * 0.05)}Q0 ${f(-s * 0.85)} ${f(s * 0.68)} ${f(-s * 0.05)}Q0 ${f(s * 0.2)} ${f(-s * 0.68)} ${f(-s * 0.05)}Z`, toneOf("#7A5233"), { weight: 0.5, size: s * 0.4, grain: !0 }), pen.stroke(g, `M0 ${f(-s * 0.45)}q${f(s * 0.1)} ${f(-s * 0.3)} ${f(s * 0.3)} ${f(-s * 0.35)}`, pen.lw * 0.4);
  }
  function flame(pen, parent, x, y, s, cls = "") {
    let g = pen.g(parent, { transform: `translate(${f(x)} ${f(y)})`, class: cls }), E = ELEMENT.fire;
    pen.glow(g, 0, -s * 0.35, s * 1.25, E.glow, 0.5);
    let d = `M0 ${f(-s * 1.15)}C${f(s * 0.25)} ${f(-s * 0.75)} ${f(s * 0.62)} ${f(-s * 0.48)} ${f(s * 0.5)} ${f(-s * 0.05)}C${f(s * 0.42)} ${f(s * 0.32)} ${f(-s * 0.42)} ${f(s * 0.32)} ${f(-s * 0.5)} ${f(-s * 0.05)}C${f(-s * 0.58)} ${f(-s * 0.42)} ${f(-s * 0.12)} ${f(-s * 0.62)} 0 ${f(-s * 1.15)}Z`;
    return pen.form(g, d, { light: mix(E.light, "#FFF3D6", 0.4), base: E.light, shadow: E.base }, { weight: 0.5, size: s * 0.6, shade: [0.35, 0.25] }), pen.patch(g, `M0 ${f(-s * 0.55)}C${f(s * 0.18)} ${f(-s * 0.32)} ${f(s * 0.25)} ${f(-s * 0.05)} 0 ${f(s * 0.12)}C${f(-s * 0.25)} ${f(-s * 0.05)} ${f(-s * 0.15)} ${f(-s * 0.32)} 0 ${f(-s * 0.55)}Z`, "#FFF0C9", 0.85), g;
  }
  function ear(pen, head, side, at, angle, d, tone, inner, size) {
    let anchor = pen.g(head, { transform: `translate(${f(at[0])} ${f(at[1])})` }), rot = pen.g(anchor, { class: `portrait__ear portrait__ear--${side < 0 ? "l" : "r"}`, style: `--ear-base:${f(side * angle)}deg` }), mirror = side < 0 ? pen.g(rot, { transform: "scale(-1 1)" }) : rot;
    if (pen.form(mirror, d, tone, { weight: 0.75, size, shade: [0.45, 0.3] }), inner)
      pen.patch(mirror, d, inner, 0.85, { transform: "translate(0 -1) scale(.55 .7)" });
    return rot;
  }
  var roundEar = (w, L) => `M${f(-w)} 0C${f(-w * 1.15)} ${f(-L * 0.62)} ${f(-w * 0.45)} ${f(-L * 1.02)} 0 ${f(-L)}C${f(w * 0.5)} ${f(-L * 1.02)} ${f(w * 1.15)} ${f(-L * 0.6)} ${f(w)} 0Z`, pointEar = (w, L) => `M${f(-w)} 0C${f(-w * 0.9)} ${f(-L * 0.45)} ${f(-w * 0.25)} ${f(-L * 0.9)} ${f(-w * 0.05)} ${f(-L)}Q0 ${f(-L * 1.04)} ${f(w * 0.08)} ${f(-L * 0.98)}C${f(w * 0.35)} ${f(-L * 0.85)} ${f(w * 0.95)} ${f(-L * 0.42)} ${f(w)} 0Z`;
  function wisp(pen, parent, x, y, s, tone) {
    let d = `M${f(x)} ${f(y)}c${f(s * 0.4)} ${f(-s * 0.55)} ${f(s * 1.2)} ${f(-s * 0.5)} ${f(s * 1.35)} ${f(-s * 0.05)}c${f(-s * 0.45)} ${f(-s * 0.15)} ${f(-s * 0.85)} ${f(s * 0.05)} ${f(-s * 1)} ${f(s * 0.32)}c${f(-s * 0.12)} ${f(s * 0.12)} ${f(-s * 0.3)} ${f(s * 0.02)} ${f(-s * 0.35)} ${f(-s * 0.27)}Z`;
    pen.form(parent, d, tone, { weight: 0.5, size: s * 0.6, flat: !0 });
  }
  function squirrel(d) {
    let u = d.u, W = 18 + 6 * u[1], H = 22 + 6 * u[0], bodyY = FOOT - 4 - H, R = (21 + 5 * u[3]) * d.head, headX = CENTER - 1, headY = bodyY - H * 0.72 - R * 0.55, earL = R * (0.55 + 0.35 * u[5]), spread = 16 + 14 * u[6], sapling = u[2] > 0.45, plume = 1 + 0.25 * u[12], tailTop = bodyY - H * 1.45 * plume - 8, top = Math.min(headY - R - earL * Math.cos(spread * Math.PI / 180) - 2, tailTop - 6, sapling ? headY - R - R * 0.5 : 1 / 0), coat = pick([[0.64, 0.1, 48], [0.55, 0.09, 38], [0.72, 0.1, 78], [0.66, 0.035, 60]], u[14]), fur = own(coat[0] + 0.06 * (u[13] - 0.5), coat[1], coat[2]), belly = toneOf(mix(CREAM, fur.base, 0.18)), autumn = u[12] > 0.55, leafA = autumn ? toneOf(mix("#C7843A", CREAM, 0.15), "#5A3A2A") : elTone("earth"), leafB = autumn ? toneOf(mix("#B5562E", CREAM, 0.18), "#4A2A2A") : toneOf(mix(mix(ELEMENT.earth.base, "#C9A24A", 0.35), CREAM, 0.15), "#2E4A3A");
    return { geo: { top, left: CENTER - W - 12, right: CENTER + W + 34, headX, headY, headR: R, hover: 0 }, draw(pen, g, s) {
      let rand = stream(d.seed), tail = pen.g(g, { class: "cr-tail" }), spine = [[CENTER + W * 0.7, bodyY + H * 0.5], [CENTER + W + 14, bodyY + H * 0.1], [CENTER + W + 19, bodyY - H * 0.65 * plume], [CENTER + W + 12, tailTop + 6], [CENTER + W + 2, tailTop + 2]], along = (t) => {
        let i = Math.min(spine.length - 2, Math.floor(t * (spine.length - 1))), k = t * (spine.length - 1) - i, a = spine[i], b = spine[i + 1];
        return [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
      }, brush = blob([[CENTER + W * 0.55, bodyY + H * 0.62], [CENTER + W + 17, bodyY + H * 0.25], [CENTER + W + 24, bodyY - H * 0.6 * plume], [CENTER + W + 16, tailTop + 9], [CENTER + W + 4, tailTop + 6], [CENTER + W + 8, bodyY - H * 0.55 * plume], [CENTER + W * 0.95, bodyY + H * 0.05]], 0.9);
      pen.form(tail, brush, fur, { size: 10, grain: !0, hatch: !0 });
      let count = 8 + Math.floor(u[13] * 3);
      for (let i = 0;i < count; i++) {
        let t = 0.08 + 0.92 * i / (count - 1), [x, y] = along(t), side = i % 2 ? 1 : -1, size = 11 + 6 * Math.sin(t * Math.PI) + 2 * rand();
        oakLeaf(pen, tail, x + side * (3 + 4 * Math.sin(t * Math.PI)), y + 2, size, side * (35 + 30 * rand()) + 15 - t * 30, i % 3 === 1 ? leafB : leafA);
      }
      acorn(pen, tail, CENTER + W + 19, bodyY - H * 0.45, 4.6, ELEMENT.earth.glow), acorn(pen, tail, CENTER + W + 8, bodyY - H * 0.05, 4, ELEMENT.earth.glow);
      let body = blob([[CENTER, bodyY - H], [CENTER + W * 0.78, bodyY - H * 0.66], [CENTER + W * 0.98, bodyY + H * 0.05], [CENTER + W * 1.08, bodyY + H * 0.72], [CENTER + W * 0.6, bodyY + H * 1], [CENTER - W * 0.6, bodyY + H * 1], [CENTER - W * 1.08, bodyY + H * 0.72], [CENTER - W * 0.98, bodyY + H * 0.05], [CENTER - W * 0.78, bodyY - H * 0.66]]);
      if (pen.form(g, body, fur, { size: W, grain: !0, hatch: !0 }), pen.patch(g, ellipsePath(CENTER + 1, bodyY + H * 0.28, W * 0.6, H * 0.6), belly.base, 0.92), pen.glow(g, CENTER, bodyY - H * 0.05, W * 0.55, ELEMENT.earth.glow, 0.42), u[11] > 0.5)
        for (let k of [0, 1])
          pen.stroke(g, curve([[CENTER - W * 0.95, bodyY - H * (0.3 - k * 0.32)], [CENTER - W * 0.62, bodyY - H * (0.42 - k * 0.32)], [CENTER - W * 0.32, bodyY - H * (0.34 - k * 0.32)]]), pen.lw * 0.5, { opacity: 0.55 });
      else
        for (let [x, y, r] of [[-0.6, -0.3, 2.4], [-0.78, 0.18, 1.8], [0.62, -0.42, 2]])
          pen.patch(g, ellipsePath(CENTER + x * W, bodyY + y * H, r, r * 0.8), ELEMENT.earth.light, 0.75);
      for (let side of [-1, 1])
        pen.form(g, ellipsePath(CENTER + side * W * 0.48, bodyY - H * 0.04, 5.2, 6.4), fur, { weight: 0.7, size: 5, attrs: { transform: `rotate(${side * -18} ${f(CENTER + side * W * 0.48)} ${f(bodyY)})` } });
      for (let side of [-1, 1])
        pen.form(g, ellipsePath(CENTER + side * W * 0.52, FOOT - 3.2, 9.5, 4.8), toneOf(mix(fur.base, "#6B5040", 0.25)), { weight: 0.8, size: 6 });
      let anchor = pen.g(g, { transform: `translate(${f(headX)} ${f(headY)})` }), head = pen.g(anchor, { class: "portrait__head" });
      for (let side of [-1, 1]) {
        let e = ear(pen, head, side, [side * R * 0.58, -R * 0.66], spread, roundEar(R * 0.33, earL), fur, mix("#F2C6B4", fur.base, 0.2), R * 0.3);
        if (u[5] > 0.55)
          pen.stroke(side < 0 ? pen.g(e, { transform: "scale(-1 1)" }) : e, `M0 ${f(-earL * 0.95)}q2 -4 0.5 -7m-0.5 7q-2 -3.5 -1 -6`, pen.lw * 0.6);
      }
      if (sapling) {
        let sg = pen.g(head);
        pen.stroke(sg, `M0 ${f(-R * 0.92)}q1 ${f(-R * 0.25)} -1 ${f(-R * 0.48)}`, pen.lw * 0.9, { stroke: ELEMENT.earth.shadow }), oakLeaf(pen, sg, -1, -R * 1.3, 8, -40, elTone("earth")), oakLeaf(pen, sg, 0, -R * 1.25, 7, 35, leafB);
      }
      pen.form(head, ellipsePath(0, 0, R, R * 0.96), fur, { size: R, grain: !0, hatch: !0 }), pen.patch(head, ellipsePath(0, R * 0.36, R * 0.55, R * 0.4), belly.base, 0.9), drawFace(pen, head, { ...faceFrom(u, R), kind: "mammal", cheeks: u[2] > 0.3 || s.delighted, delighted: s.delighted });
    } };
  }
  function moth(d) {
    let u = d.u, R = (23 + 5 * u[0]) * (0.5 + d.head / 2), hover = 17 + 6 * u[11], cy = FOOT - hover - R - 2, span = R + 20 + 8 * u[1], wingBase = pick(["#B9AE98", "#9C7E62", "#93A27C", "#B47A54", "#A79AB5"], (u[14] * 2.7 + u[10] * 1.9) % 1), furC = pick([[0.88, 0.03, 80], [0.8, 0.02, 250], [0.78, 0.05, 60]], u[13]), fur = own(furC[0], furC[1], furC[2], 0.12), wing = toneOf(mix(wingBase, CREAM, 0.12), "#3A3F45"), lichen = mix(ELEMENT.earth.light, "#DCE0CB", 0.5), band = mix(wingBase, INK, 0.28), eyespot = u[12] > 0.4;
    return { geo: { top: cy - R - 22, left: CENTER - span - 4, right: CENTER + span + 4, headX: CENTER, headY: cy, headR: R, hover }, draw(pen, g, s) {
      let rand = stream(d.seed), fold = s.asleep ? 0.62 : 1;
      for (let side of [-1, 1]) {
        let wingG = pen.g(g, { class: `cr-wing cr-wing-${side < 0 ? "l" : "r"}`, transform: `translate(${f(CENTER)} ${f(cy)}) scale(${f(side * fold)} 1)` }), upper = blob([[R * 0.42, -R * 0.4], [R * 0.75, -R * 1.02], [span * 0.72, -R * 1.25], [span * 1.02, -R * 0.95], [span * 0.95, -R * 0.2], [span * 0.68, R * 0.05], [R * 0.55, R * 0.08]], 0.85), lower = blob([[R * 0.45, R * 0.02], [span * 0.6, R * 0.12], [span * 0.74, R * 0.55], [span * 0.52, R * 0.95], [span * 0.38, R * 0.78], [R * 0.55, R * 0.62]], 0.85);
        pen.form(wingG, lower, toneOf(mix(wing.base, CREAM, 0.38)), { size: R * 0.5, weight: 0.8, grain: !0 }), pen.form(wingG, upper, wing, { size: R * 0.75, weight: 0.85, grain: !0 });
        let inside = pen.g(wingG, { "clip-path": pen.clip(upper) });
        pen.stroke(inside, curve([[span * 0.42, -R * 1.25], [span * 0.55, -R * 0.65], [span * 0.48, R * 0.1]]), 3.2, { stroke: band, opacity: 0.45, filter: null });
        for (let k = 0;k < 3; k++)
          pen.stroke(inside, curve([[R * 0.7 + k * 7, -R * 0.82 + k * 2], [R * 0.92 + k * 9, -R * 0.45], [R * 0.82 + k * 10, -R * 0.02]]), pen.lw * 0.35, { opacity: 0.4 });
        for (let k = 0;k < 7; k++) {
          let x = span * (0.5 + 0.45 * rand()), y = -R * (0.1 + 0.95 * rand()), r = 1.5 + 2.4 * rand();
          pen.patch(inside, ellipsePath(x, y, r, r * 0.85), lichen, 0.85);
        }
        if (eyespot) {
          let ex = span * 0.76, ey = -R * 0.62;
          pen.glow(wingG, ex, ey, 8, ELEMENT.earth.glow, 0.6), pen.el("circle", { cx: ex, cy: ey, r: 4.6, fill: "#F4E4B4", stroke: INK, "stroke-width": pen.lw * 0.4 }, wingG), pen.el("circle", { cx: ex + 0.4, cy: ey + 0.3, r: 2.2, fill: mix(ELEMENT.earth.shadow, INK, 0.3) }, wingG);
        } else
          pen.patch(wingG, `M${f(span * 0.98)} ${f(-R * 0.9)}q${f(-span * 0.12)} ${f(R * 0.15)} ${f(-span * 0.08)} ${f(R * 0.5)}`, "none", 0.9, { stroke: "#F4E4B4", "stroke-width": 2.2, "stroke-linecap": "round" });
      }
      for (let side of [-1, 1]) {
        let x0 = CENTER + side * R * 0.32, y0 = cy - R * 0.86, x1 = x0 + side * 7, y1 = y0 - 14;
        pen.stroke(g, `M${f(x0)} ${f(y0)}Q${f(x0 + side * 1)} ${f(y0 - 9)} ${f(x1)} ${f(y1)}a3.6 3.6 0 1 ${side > 0 ? 1 : 0} ${f(side * 3)} ${f(4.2)}a1.9 1.9 0 1 ${side > 0 ? 1 : 0} ${f(-side * 2.6)} ${f(-0.6)}`, pen.lw * 0.95, { stroke: mix(ELEMENT.earth.shadow, INK, 0.35) });
        for (let k = 1;k <= 3; k++)
          pen.stroke(g, `M${f(x0 + side * k * 1.2)} ${f(y0 - k * 3.5)}l${f(side * 3.2)} ${f(-1.2)}`, pen.lw * 0.45, { stroke: ELEMENT.earth.base, opacity: 0.85 });
      }
      let fuzz = blob(Array.from({ length: 22 }, (_, i) => {
        let a = i / 22 * Math.PI * 2, k = i % 2 ? 1 : 0.95;
        return [CENTER + Math.cos(a) * R * k, cy + Math.sin(a) * R * 1.02 * k];
      }), 1);
      pen.form(g, fuzz, fur, { size: R, grain: !0 }), pen.patch(g, ellipsePath(CENTER, cy + R * 0.12, R * 0.78, R * 0.62), mix(fur.light, "#FFFFFF", 0.3), 0.5);
      for (let side of [-1, 1])
        pen.form(g, ellipsePath(CENTER + side * 6, cy + R + 1.5, 2.6, 3.2), toneOf("#8A7462"), { weight: 0.5, size: 2 });
      let anchor = pen.g(g, { transform: `translate(${CENTER} ${f(cy - R * 0.05)})` }), head = pen.g(anchor, { class: "portrait__head" });
      drawFace(pen, head, { ...faceFrom(u, R * 0.92), kind: "mammal", cheeks: !0, delighted: s.delighted, noseTone: "#6B5040" });
    } };
  }
  function turtle(d) {
    let u = d.u, rx = 34 + 6 * u[1], ry = 21 + 4 * u[0], sx = CENTER + 7, sy = FOOT - 7 - ry * 0.8, R = (19 + 4 * u[3]) * d.head, headX = CENTER - 13, headY = FOOT - 24 - R * 0.55, skinC = pick([[0.64, 0.07, 178], [0.66, 0.07, 150], [0.6, 0.05, 232]], u[14]), skin = own(skinC[0] + 0.06 * (u[13] - 0.5), skinC[1], skinC[2], 0.2), stoneSet = pick([["#B9B2A3", "#A8B4B4", "#C4BBA9", "#9FAAAE"], ["#D3C1A0", "#C9B48E", "#DCCDB2", "#BFA987"], ["#A9B29A", "#9DAA8E", "#B8BEA6", "#8E9C84"]], u[12]), garden = u[2], reed = garden > 0.66, flower = garden < 0.33;
    return { geo: { top: Math.min(sy - ry - 4, headY - R - 3, reed ? sy - ry - 22 : 1 / 0), left: Math.min(headX - R - 3, sx - rx - 3), right: sx + rx + 6, headX, headY, headR: R, hover: 0 }, draw(pen, g, s) {
      let rand = stream(d.seed);
      pen.form(g, ellipsePath(sx + rx * 0.72, FOOT - 4, 8, 5.5), skin, { weight: 0.7, size: 6 });
      let dome = `M${f(sx - rx)} ${f(sy + ry * 0.55)}C${f(sx - rx)} ${f(sy - ry * 0.9)} ${f(sx - rx * 0.5)} ${f(sy - ry * 1.05)} ${f(sx)} ${f(sy - ry * 1.05)}C${f(sx + rx * 0.5)} ${f(sy - ry * 1.05)} ${f(sx + rx)} ${f(sy - ry * 0.9)} ${f(sx + rx)} ${f(sy + ry * 0.55)}C${f(sx + rx * 0.6)} ${f(sy + ry * 0.85)} ${f(sx - rx * 0.6)} ${f(sy + ry * 0.85)} ${f(sx - rx)} ${f(sy + ry * 0.55)}Z`;
      pen.form(g, dome, toneOf(stoneSet[3], "#3E4F63"), { size: rx * 0.7, grain: !0 });
      let stones = pen.g(g, { "clip-path": pen.clip(dome) });
      [[-0.55, -0.35, 0.3, 0.42], [0, -0.62, 0.34, 0.36], [0.55, -0.35, 0.3, 0.42], [-0.78, 0.25, 0.26, 0.38], [-0.28, 0.12, 0.27, 0.4], [0.25, 0.12, 0.27, 0.4], [0.76, 0.25, 0.26, 0.38]].forEach(([cx, cyy, w, h], i) => {
        let x = sx + cx * rx, y = sy + cyy * ry, pts = Array.from({ length: 7 }, (_, k) => {
          let a = k / 7 * Math.PI * 2 + rand() * 0.3, kk = 0.86 + 0.18 * rand();
          return [x + Math.cos(a) * w * rx * kk, y + Math.sin(a) * h * ry * kk];
        });
        pen.form(stones, blob(pts, 0.9), toneOf(stoneSet[(i + Math.floor(u[13] * 4)) % stoneSet.length]), { size: w * rx, weight: 0.6, grain: !0 });
      }), pen.stroke(g, `M${f(sx - rx * 0.97)} ${f(sy + ry * 0.4)}C${f(sx - rx * 0.5)} ${f(sy + ry * 0.72)} ${f(sx + rx * 0.5)} ${f(sy + ry * 0.72)} ${f(sx + rx * 0.97)} ${f(sy + ry * 0.4)}`, pen.lw * 0.6, { opacity: 0.6 });
      let pw = 12 + 3 * u[11], py = sy - ry * 0.84, pool = ellipsePath(sx - 1, py, pw, 4.2);
      pen.form(g, pool, { light: "#F2FAFD", base: mix(ELEMENT.water.light, "#FFFFFF", 0.2), shadow: ELEMENT.water.base }, { weight: 0.55, size: 4, shade: [0.15, 0.5] }), pen.patch(g, `M${f(sx - pw * 0.6)} ${f(py - 1.2)}q${f(pw * 0.35)} -1.4 ${f(pw * 0.7)} -0.5`, "none", 1, { stroke: "#FFFFFF", "stroke-width": 1, "stroke-linecap": "round", opacity: 0.85 });
      let pad = `M${f(sx + 3)} ${f(py)}l4.6 -1.2a4.8 2 0 1 1 -1.4 -1.1Z`;
      if (pen.form(g, pad, elTone("earth", 0.05), { weight: 0.45, size: 2, flat: !0 }), flower)
        pen.form(g, ellipsePath(sx + 5, py - 1.6, 1.8, 1.4), toneOf("#F2B8C6"), { weight: 0.4, size: 1, flat: !0 });
      if (reed)
        pen.stroke(g, `M${f(sx + rx * 0.45)} ${f(sy - ry * 0.7)}q-1 -10 2 -19`, pen.lw * 0.8, { stroke: ELEMENT.earth.shadow }), pen.form(g, ellipsePath(sx + rx * 0.45 + 2, sy - ry * 0.7 - 20, 1.6, 4.2), toneOf("#8A6A4A"), { weight: 0.45, size: 1.5 });
      for (let [x, y] of [[headX - 8, FOOT - 3.5], [headX + 17, FOOT - 3]])
        pen.form(g, ellipsePath(x, y, 7.5, 5), skin, { weight: 0.75, size: 6, grain: !0 });
      pen.form(g, blob([[headX - R * 0.4, headY + R * 0.5], [headX + R * 0.6, headY + R * 0.2], [sx - rx * 0.55, sy + ry * 0.1], [sx - rx * 0.5, sy + ry * 0.55], [headX + R * 0.2, headY + R * 1.05]]), skin, { size: R * 0.6 });
      let anchor = pen.g(g, { transform: `translate(${f(headX)} ${f(headY)})` }), head = pen.g(anchor, { class: "portrait__head" });
      if (u[5] > 0.5)
        ear(pen, head, 1, [R * 0.05, -R * 0.84], 10, `M${f(-R * 0.18)} 0C${f(-R * 0.2)} ${f(-R * 0.28)} ${f(-R * 0.02)} ${f(-R * 0.44)} ${f(R * 0.2)} ${f(-R * 0.4)}C${f(R * 0.1)} ${f(-R * 0.24)} ${f(R * 0.22)} ${f(-R * 0.1)} ${f(R * 0.18)} 0Z`, { light: "#EAF6F8", base: mix(ELEMENT.water.light, skin.base, 0.4), shadow: skin.shadow }, null, R * 0.16);
      pen.form(head, ellipsePath(0, 0, R, R * 0.92), skin, { size: R, grain: !0 }), pen.glow(head, 0, R * 0.95, R * 0.55, ELEMENT.water.glow, 0.55);
      for (let [x, y, r] of [[-0.55, -0.45, 0.12], [0.4, -0.6, 0.09], [0.7, -0.2, 0.1]])
        pen.patch(head, ellipsePath(x * R, y * R, r * R, r * R * 0.8), mix(skin.light, ELEMENT.water.light, 0.4), 0.75);
      drawFace(pen, head, { ...faceFrom(u, R), kind: "turtle", cheeks: u[2] > 0.25 || s.delighted, delighted: s.delighted }), pen.form(head, `M${f(R * 0.06)} ${f(R * 0.1)}c1.6 2 2.1 3.9 0 4.6c-2.1 -0.7 -1.6 -2.6 0 -4.6Z`, { light: "#FFFFFF", base: ELEMENT.water.light, shadow: ELEMENT.water.base }, { weight: 0.4, size: 1.5, flat: !0 });
    } };
  }
  function koi(d) {
    let u = d.u, hover = 22 + 6 * u[11], rx = (23 + 3 * u[1]) * (0.6 + 0.4 * d.head), ry = (20 + 3 * u[0]) * (0.6 + 0.4 * d.head), cx = CENTER - 6, cy = FOOT - hover - ry - 2, tail = 32 + 9 * u[5], back = pick([["#F2EFE8", "#5E86B8"], ["#8FC4C9", "#2F5E7E"], ["#9AA6C4", "#F4EEE4"], ["#E9DCC3", "#4C7FA6"]], u[13]), body = toneOf(mix(back[0], CREAM, 0.1), "#4B6A86"), patchA = mix(back[1], CREAM, 0.25), patchB = mix(back[1], ELEMENT.water.shadow, 0.3), pattern = Math.floor(u[12] * 3), finTone = { light: "#F4FBFE", base: mix(ELEMENT.water.light, "#FFFFFF", 0.4), shadow: ELEMENT.water.light };
    return { geo: { top: cy - ry - 14 - tail * 0.45, left: cx - rx - 6, right: cx + rx + tail + 4, headX: cx - 2, headY: cy, headR: Math.max(rx, ry) * 0.88, hover }, draw(pen, g, s) {
      let rand = stream(d.seed), tg = pen.g(g, { class: "cr-tail" }), bx = cx + rx * 0.85, by = cy + 1, fin = `M${f(bx)} ${f(by - 6)}C${f(bx + tail * 0.35)} ${f(by - 11)} ${f(bx + tail * 0.72)} ${f(by - tail * 0.7)} ${f(bx + tail)} ${f(by - tail * 0.6)}C${f(bx + tail * 0.84)} ${f(by - tail * 0.32)} ${f(bx + tail * 0.72)} ${f(by - 4)} ${f(bx + tail * 0.9)} ${f(by + tail * 0.2)}C${f(bx + tail * 1)} ${f(by + tail * 0.4)} ${f(bx + tail * 0.6)} ${f(by + tail * 0.46)} ${f(bx + tail * 0.42)} ${f(by + tail * 0.24)}C${f(bx + tail * 0.25)} ${f(by + 9)} ${f(bx + 4)} ${f(by + 7)} ${f(bx)} ${f(by + 6)}Z`;
      pen.form(tg, fin, finTone, { weight: 0.5, size: tail * 0.3, shade: [0.2, 0.35], attrs: { opacity: 0.9 } });
      for (let k = 0;k < 5; k++)
        pen.patch(tg, `M${f(bx + 2)} ${f(by)}Q${f(bx + tail * 0.5)} ${f(by - tail * (0.42 - k * 0.18))} ${f(bx + tail * 0.92)} ${f(by - tail * (0.58 - k * 0.24))}`, "none", 0.65, { stroke: k % 2 ? mix(ELEMENT.water.light, "#FFFFFF", 0.3) : "#FFFFFF", "stroke-width": 0.8, "stroke-linecap": "round" });
      for (let [x, y, r] of [[bx + tail * 1.1, by - tail * 0.2, 1.9], [bx + tail * 0.96, by + tail * 0.52, 1.5], [bx + tail * 0.4, by - tail * 0.85, 1.3]])
        pen.form(tg, `M${f(x)} ${f(y - r * 1.6)}C${f(x + r)} ${f(y - r * 0.4)} ${f(x + r)} ${f(y + r)} ${f(x)} ${f(y + r)}C${f(x - r)} ${f(y + r)} ${f(x - r)} ${f(y - r * 0.4)} ${f(x)} ${f(y - r * 1.6)}Z`, finTone, { weight: 0.35, size: 1, flat: !0 });
      pen.form(g, `M${f(cx - rx * 0.25)} ${f(cy - ry * 0.9)}C${f(cx + rx * 0.05)} ${f(cy - ry * 1.5)} ${f(cx + rx * 0.62)} ${f(cy - ry * 1.38)} ${f(cx + rx * 0.9)} ${f(cy - ry * 0.55)}Z`, finTone, { weight: 0.5, size: 6, attrs: { opacity: 0.92 } });
      let bodyD = blob([[cx - rx, cy + 1], [cx - rx * 0.74, cy - ry * 0.8], [cx, cy - ry], [cx + rx * 0.7, cy - ry * 0.68], [cx + rx * 1.02, cy - ry * 0.15], [cx + rx * 1.02, cy + ry * 0.2], [cx + rx * 0.65, cy + ry * 0.72], [cx, cy + ry * 0.98], [cx - rx * 0.76, cy + ry * 0.76]]);
      pen.form(g, bodyD, body, { size: rx, shadowOpacity: 0.36 });
      let inner = pen.g(g, { "clip-path": pen.clip(bodyD) });
      pen.patch(inner, ellipsePath(cx - 2, cy + ry * 0.62, rx * 0.8, ry * 0.42), "#FFFFFF", 0.55);
      for (let row = 0;row < 3; row++)
        for (let k = 0;k < 4 - row; k++) {
          let x = cx + rx * (-0.05 + 0.24 * k + 0.12 * row), y = cy - ry * (0.62 - row * 0.26);
          pen.el("path", { d: `M${f(x - 3)} ${f(y)}q3 3.4 6 0`, fill: "none", stroke: INK, "stroke-width": 0.6, opacity: 0.28 }, inner);
        }
      pen.glow(inner, cx + 2, cy + ry * 0.35, rx * 0.72, ELEMENT.water.glow, 0.6);
      let spot = (x, y, r, c) => pen.patch(inner, blob(Array.from({ length: 7 }, (_, i) => {
        let a = i / 7 * Math.PI * 2;
        return [x + Math.cos(a) * r * (0.82 + 0.3 * rand()), y + Math.sin(a) * r * 0.78 * (0.82 + 0.3 * rand())];
      })), c, 0.82);
      if (pattern === 0)
        spot(cx + rx * 0.35, cy - ry * 0.55, rx * 0.42, patchA), spot(cx - rx * 0.45, cy - ry * 0.75, rx * 0.26, patchB);
      else if (pattern === 1)
        spot(cx - 1, cy - ry * 0.88, rx * 0.24, patchB);
      else
        for (let k = 0;k < 5; k++)
          spot(cx + rx * (-0.55 + 1.25 * rand()), cy - ry * (0.15 + 0.65 * rand()), rx * (0.1 + 0.08 * rand()), k % 2 ? patchA : patchB);
      for (let side of [-1, 1])
        pen.form(g, `M${f(cx + side * rx * 0.55)} ${f(cy + ry * 0.45)}c${f(side * 6)} ${f(2)} ${f(side * 12)} ${f(8)} ${f(side * 11)} ${f(14)}c${f(-side * 5)} ${f(-1)} ${f(-side * 10)} ${f(-5)} ${f(-side * 11)} ${f(-14)}Z`, finTone, { weight: 0.45, size: 4, attrs: { opacity: 0.9, class: `cr-wing cr-wing-${side < 0 ? "l" : "r"}` } });
      let anchor = pen.g(g, { transform: `translate(${f(cx - 2)} ${f(cy - 1)})` }), head = pen.g(anchor, { class: "portrait__head" }), r = Math.max(rx, ry) * 0.88;
      for (let side of [-1, 1])
        pen.stroke(head, `M${f(side * r * 0.2)} ${f(r * 0.48)}q${f(side * 4)} ${f(3)} ${f(side * 3)} ${f(7)}q${f(-side * 1)} ${f(2)} ${f(side * 1.5)} ${f(3)}`, pen.lw * 0.5, { opacity: 0.7 });
      drawFace(pen, head, { ...faceFrom(u, r), kind: "fish", cheeks: !0, delighted: s.delighted });
    } };
  }
  function fox(d) {
    let u = d.u, bx = CENTER + 8, rx = 26 + 4 * u[1], ry = 15 + 3 * u[0], by = FOOT - 4 - ry, R = (21 + 4 * u[3]) * d.head, headX = CENTER - 8, headY = by - 9 - R * 0.45, earL = R * (0.72 + 0.3 * u[5]), spread = 14 + 10 * u[6], lanterns = 1 + Math.floor(u[12] * 3), coatC = pick([[0.66, 0.12, 46], [0.74, 0.12, 70], [0.72, 0.02, 60], [0.56, 0.12, 32]], u[14]), coat = own(coatC[0] + 0.05 * (u[13] - 0.5), coatC[1], coatC[2], 0.14), cream = toneOf("#F4E7D2"), socks = u[11] > 0.5, ash = toneOf(socks ? mix(coat.shadow, "#4A3C3A", 0.55) : "#A9A39C", "#3E4F63"), tipX = bx + rx + 10, tipY = by - ry - 20;
    return { geo: { top: Math.min(headY - R - earL * Math.cos(spread * Math.PI / 180) - 2, tipY - 30), left: headX - R - 6, right: tipX + 14, headX, headY, headR: R, hover: 0 }, draw(pen, g, s) {
      let tail = pen.g(g, { class: "cr-tail" }), brush = blob([[bx + rx * 0.6, by + ry * 0.4], [bx + rx + 6, by + ry * 0.1], [tipX + 6, by - ry * 0.9], [tipX + 2, tipY], [tipX - 8, tipY + 3], [bx + rx * 0.62, by - ry * 0.55], [bx + rx * 0.35, by]], 0.9);
      pen.form(tail, brush, coat, { size: 12, grain: !0, hatch: !0 }), pen.patch(tail, blob([[tipX - 9, tipY + 4], [tipX + 2, tipY - 1], [tipX + 6, tipY + 7], [tipX - 3, tipY + 9]]), cream.base, 0.95);
      for (let i = 0;i < lanterns; i++)
        flame(pen, tail, tipX - 5 + (i - (lanterns - 1) / 2) * 9, tipY - 9 - i % 2 * 6, 6 + (i === 1 ? 1 : 0), `cr-lantern cr-lantern-${i}`);
      pen.form(g, blob([[bx - rx, by + ry * 0.3], [bx - rx * 0.6, by - ry * 0.95], [bx + rx * 0.3, by - ry], [bx + rx, by - ry * 0.1], [bx + rx * 0.85, by + ry * 0.85], [bx - rx * 0.4, by + ry * 0.95]]), coat, { size: rx * 0.7, grain: !0, hatch: !0 }), pen.form(g, ellipsePath(bx + rx * 0.62, FOOT - 3.4, 7, 4.2), ash, { weight: 0.7, size: 5 });
      for (let x of [headX - 7, headX + 9])
        pen.form(g, ellipsePath(x, FOOT - 3.2, 7, 4.4), ash, { weight: 0.75, size: 5 });
      let anchor = pen.g(g, { transform: `translate(${f(headX)} ${f(headY)})` }), head = pen.g(anchor, { class: "portrait__head" });
      for (let side of [-1, 1])
        ear(pen, head, side, [side * R * 0.55, -R * 0.62], spread, pointEar(R * 0.38, earL), coat, mix("#F6E2CF", coat.base, 0.15), R * 0.3);
      let ruff = blob([[-R * 1.18, R * 0.25], [-R * 0.8, -R * 0.1], [0, R * 0.1], [R * 0.8, -R * 0.1], [R * 1.18, R * 0.25], [R * 0.75, R * 0.85], [0, R * 1], [-R * 0.75, R * 0.85]]);
      pen.form(head, ellipsePath(0, 0, R, R * 0.94), coat, { size: R, grain: !0, hatch: !0 }), pen.form(head, ruff, cream, { size: R * 0.7, weight: 0.7 });
      for (let [x, y, a] of [[-1.05, 0.35, -40], [-0.95, 0.55, -20], [1.05, 0.35, 40], [0.95, 0.6, 25]])
        pen.stroke(head, `M${f(x * R)} ${f(y * R)}l${f(Math.sin(a * Math.PI / 180) * 6)} ${f(-Math.cos(a * Math.PI / 180) * 6)}`, pen.lw * 0.45, { stroke: "#C9A24A" });
      pen.patch(head, `M0 ${f(-R * 0.72)}C${f(R * 0.12)} ${f(-R * 0.6)} ${f(R * 0.12)} ${f(-R * 0.45)} 0 ${f(-R * 0.36)}C${f(-R * 0.12)} ${f(-R * 0.45)} ${f(-R * 0.12)} ${f(-R * 0.6)} 0 ${f(-R * 0.72)}Z`, "#F7F0E6", 0.95), drawFace(pen, head, { ...faceFrom(u, R), kind: "mammal", cheeks: !0, delighted: s.delighted });
    } };
  }
  function phoenix(d) {
    let u = d.u, hover = 14 + 6 * u[11], R = (24 + 4 * u[0]) * (0.5 + d.head / 2), cy = FOOT - hover - R - 5, crownKind = Math.floor(u[2] * 3), plumeC = pick([[0.64, 0.12, 50], [0.74, 0.12, 74], [0.68, 0.03, 62], [0.58, 0.12, 30]], u[14]), plume = own(plumeC[0] + 0.05 * (u[13] - 0.5), plumeC[1], plumeC[2], 0.12), belly = toneOf(mix(ELEMENT.fire.soft, CREAM, 0.3)), leafTones = [toneOf(mix("#C7652F", CREAM, 0.12)), toneOf(mix("#D9A04A", CREAM, 0.12)), toneOf(mix("#B35A3A", CREAM, 0.16))], wingL = R * (1.05 + 0.25 * u[5]);
    return { geo: { top: Math.min(cy - R - 17, cy - wingL * 0.95), left: CENTER - R - wingL * 0.6, right: CENTER + R + 26, headX: CENTER, headY: cy - R * 0.1, headR: R * 0.9, hover }, draw(pen, g, s) {
      let rand = stream(d.seed), fold = s.asleep ? 0.55 : 1, tail = pen.g(g, { class: "cr-tail" });
      for (let k = 0;k < 3; k++) {
        let x0 = CENTER + R * 0.55, y0 = cy + R * 0.55, x1 = x0 + 16 + k * 3, y1 = y0 + 6 + k * 6;
        pen.form(tail, `M${f(x0)} ${f(y0 - 2)}Q${f(x1 - 4)} ${f(y1 - 8)} ${f(x1)} ${f(y1)}Q${f(x1 - 9)} ${f(y1 - 2)} ${f(x0)} ${f(y0 + 2)}Z`, leafTones[k], { weight: 0.5, size: 4 }), pen.glow(tail, x1 + 1.5, y1 + 1, 5, ELEMENT.fire.glow, 0.65), pen.el("circle", { cx: x1 + 1.5, cy: y1 + 1, r: 1.7, fill: ELEMENT.fire.light, stroke: INK, "stroke-width": pen.lw * 0.3 }, tail);
      }
      for (let side of [-1, 1]) {
        let wg = pen.g(g, { class: `cr-wing cr-wing-${side < 0 ? "l" : "r"}`, transform: `translate(${f(CENTER + side * R * 0.7)} ${f(cy + R * 0.1)}) rotate(${side * (s.asleep ? 80 : 42)}) scale(${f(side * fold)} 1)` }), L = wingL, leaf = `M0 0C${f(L * 0.28)} ${f(-L * 0.4)} ${f(L * 0.62)} ${f(-L * 0.8)} ${f(L * 0.38)} ${f(-L * 1.05)}C${f(L * 0.3)} ${f(-L * 0.9)} ${f(L * 0.12)} ${f(-L * 0.95)} ${f(L * 0.02)} ${f(-L * 0.82)}C${f(-L * 0.12)} ${f(-L * 0.85)} ${f(-L * 0.35)} ${f(-L * 0.7)} ${f(-L * 0.25)} ${f(-L * 0.5)}C${f(-L * 0.42)} ${f(-L * 0.42)} ${f(-L * 0.4)} ${f(-L * 0.18)} ${f(-L * 0.18)} ${f(-L * 0.05)}Z`;
        pen.el("path", { d: leaf, fill: "none", stroke: ELEMENT.fire.light, "stroke-width": 4.5, opacity: 0.6, filter: pen.filter("soft") }, wg), pen.form(wg, leaf, leafTones[(1 + (side > 0 ? 1 : 0) + Math.floor(u[13] * 2)) % 3], { size: L * 0.4, weight: 0.75, grain: !0 }), pen.stroke(wg, `M${f(L * 0.02)} ${f(-L * 0.05)}L${f(L * 0.22)} ${f(-L * 0.85)}`, pen.lw * 0.45, { opacity: 0.55 });
        for (let k = 0;k < 3; k++)
          pen.stroke(wg, `M${f(L * (0.07 + k * 0.05))} ${f(-L * (0.25 + k * 0.2))}l${f(L * 0.2)} ${f(-L * 0.08)}M${f(L * (0.07 + k * 0.05))} ${f(-L * (0.25 + k * 0.2))}l${f(-L * 0.18)} ${f(-L * 0.12)}`, pen.lw * 0.32, { opacity: 0.45 });
      }
      let bodyD = blob([[CENTER, cy - R], [CENTER + R * 0.85, cy - R * 0.5], [CENTER + R * 1.02, cy + R * 0.25], [CENTER + R * 0.6, cy + R * 0.92], [CENTER, cy + R * 1.02], [CENTER - R * 0.6, cy + R * 0.92], [CENTER - R * 1.02, cy + R * 0.25], [CENTER - R * 0.85, cy - R * 0.5]]);
      pen.form(g, bodyD, plume, { size: R, grain: !0, hatch: !0 });
      let skirt = pen.g(g, { "clip-path": pen.clip(bodyD) });
      for (let k = 0;k < 8; k++) {
        let a = Math.PI * (0.1 + 0.8 * k / 7), x = CENTER + Math.cos(a) * R * 0.95, y = cy + Math.sin(a) * R * 0.85;
        pen.form(skirt, ellipsePath(x, y, 8.5, 5.5), leafTones[(k + Math.floor(rand() * 3)) % 3], { weight: 0.45, size: 4, attrs: { transform: `rotate(${f(a * 180 / Math.PI - 90)} ${f(x)} ${f(y)})` } });
      }
      pen.patch(g, ellipsePath(CENTER, cy + R * 0.32, R * 0.55, R * 0.5), belly.base, 0.92), pen.glow(g, CENTER, cy + R * 0.25, R * 0.48, ELEMENT.fire.glow, 0.5);
      for (let side of [-1, 1])
        pen.stroke(g, `M${f(CENTER + side * 6)} ${f(cy + R * 0.98)}l0 4.5m0 0l-2 2m2 -2l2 2`, pen.lw * 0.55, { stroke: "#7E7369" });
      let crown = pen.g(g);
      if (crownKind === 0)
        for (let dx of [-0.32, 0, 0.32]) {
          let x = CENTER + dx * R, y = cy - R * (dx === 0 ? 1.18 : 1.05);
          pen.stroke(crown, `M${f(CENTER + dx * R * 0.6)} ${f(cy - R * 0.88)}L${f(x)} ${f(y + 2)}`, pen.lw * 0.6, { stroke: "#6B4A35" }), pen.glow(crown, x, y, 5, ELEMENT.fire.glow, 0.55), pen.form(crown, ellipsePath(x, y, 3.2, 4), toneOf("#8E5A3A"), { weight: 0.5, size: 2.5 }), pen.patch(crown, ellipsePath(x, y + 1.6, 1.6, 1), ELEMENT.fire.light, 0.95);
        }
      else if (crownKind === 1)
        flame(pen, crown, CENTER + 1, cy - R * 0.9, 7);
      else
        for (let a of [-28, 0, 26])
          oakLeaf(pen, crown, CENTER + a * 0.12, cy - R * 0.9, 10, a, leafTones[a === 0 ? 0 : 1]);
      let anchor = pen.g(g, { transform: `translate(${CENTER} ${f(cy - R * 0.1)})` }), head = pen.g(anchor, { class: "portrait__head" });
      drawFace(pen, head, { ...faceFrom(u, R * 0.9), kind: "bird", cheeks: !0, delighted: s.delighted, beakTone: toneOf("#E8A65A") });
    } };
  }
  function lemur(d) {
    let u = d.u, hover = 17 + 6 * u[11], by = FOOT - hover - 20, R = (20 + 4 * u[3]) * d.head, headY = by - 16 - R * 0.55, reach = 38 + 9 * u[1], fernEars = u[5] > 0.45, furC = pick([[0.78, 0.02, 290], [0.84, 0.03, 75], [0.7, 0.025, 250]], u[14]), fur = own(furC[0] + 0.05 * (u[13] - 0.5), furC[1], furC[2], 0.16), belly = toneOf(mix(CREAM, "#FFFFFF", 0.3)), tint = pick([ELEMENT.air.soft, "#EDF3F7", "#F5EFE3"], u[12]), membrane = { light: mix(tint, "#FFFFFF", 0.5), base: mix(tint, ELEMENT.air.light, 0.18), shadow: mix(ELEMENT.air.light, "#8C92B0", 0.4) };
    return { geo: { top: headY - R - (fernEars ? R * 0.95 : R * 0.6), left: CENTER - reach - 5, right: CENTER + Math.max(reach, 44) + 6, headX: CENTER, headY, headR: R, hover }, draw(pen, g, s) {
      let fold = s.asleep ? 0.55 : 1, tail = pen.g(g, { class: "cr-tail" }), pts = [[CENTER + 6, by + 14], [CENTER + 20, by + 22], [CENTER + 36, by + 16], [CENTER + 40, by + 2]];
      pen.stroke(tail, curve(pts), 7, { stroke: INK, filter: null }), pen.stroke(tail, curve(pts), 5.2, { stroke: fur.base, filter: null }), pen.stroke(tail, curve(pts), 5.2, { stroke: fur.shadow, filter: null, "stroke-dasharray": "3.4 4", "stroke-linecap": "butt" }), wisp(pen, tail, CENTER + 38, by + 1, 9, { light: "#FFFFFF", base: "#F7F4FA", shadow: membrane.shadow });
      for (let side of [-1, 1]) {
        let wg = pen.g(g, { class: `cr-wing cr-wing-${side < 0 ? "l" : "r"}`, transform: `translate(${CENTER} ${f(by)}) scale(${f(side * fold)} 1)` }), wing = `M6 -16C${f(reach * 0.45)} -23 ${f(reach * 0.85)} -25 ${f(reach)} -19C${f(reach * 1.05)} -7 ${f(reach * 0.92)} 2 ${f(reach * 0.78)} 6C${f(reach * 0.62)} 12 ${f(reach * 0.4)} 10 ${f(reach * 0.28)} 17C${f(reach * 0.2)} 18 10 15 6 10Z`;
        pen.form(wg, wing, membrane, { size: 14, weight: 0.6, shade: [0.25, 0.45], shadowOpacity: 0.35, attrs: { opacity: 0.9 } });
        for (let k = 0;k < 4; k++)
          pen.stroke(wg, `M8 ${f(-8 + k * 3)}Q${f(reach * 0.45)} ${f(-14 + k * 6)} ${f(reach * (0.95 - k * 0.12))} ${f(-14 + k * 6.5)}`, pen.lw * 0.3, { opacity: 0.3 });
        for (let k = 0;k < 6; k++) {
          let t = k / 5, x = reach * (0.99 - t * 0.62), y = -17 + t * 31;
          pen.el("circle", { cx: f(x), cy: f(y), r: 1.35, fill: "#FFFFFF", stroke: INK, "stroke-width": 0.35, opacity: 0.9 }, wg);
        }
        pen.stroke(wg, `M8 -15Q${f(reach * 0.5)} -22 ${f(reach)} -19`, pen.lw * 0.9, { stroke: fur.shadow }), pen.form(wg, ellipsePath(reach, -19, 2.6, 2.2), fur, { weight: 0.45, size: 2 });
      }
      pen.form(g, ellipsePath(CENTER, by, 15, 18), fur, { size: 15, grain: !0 }), pen.patch(g, ellipsePath(CENTER, by + 3, 9, 12), belly.base, 0.9);
      for (let side of [-1, 1])
        pen.form(g, ellipsePath(CENTER + side * 7, by + 18, 3.6, 2.8), fur, { weight: 0.5, size: 2.5 });
      let anchor = pen.g(g, { transform: `translate(${CENTER} ${f(headY)})` }), head = pen.g(anchor, { class: "portrait__head" });
      if (fernEars)
        for (let side of [-1, 1]) {
          let shape = `M${f(-R * 0.22)} 0C${f(-R * 0.32)} ${f(-R * 0.45)} ${f(-R * 0.15)} ${f(-R * 0.85)} ${f(R * 0.12)} ${f(-R * 0.95)}C${f(R * 0.4)} ${f(-R * 1)} ${f(R * 0.42)} ${f(-R * 0.72)} ${f(R * 0.2)} ${f(-R * 0.7)}C${f(R * 0.08)} ${f(-R * 0.68)} ${f(R * 0.1)} ${f(-R * 0.8)} ${f(R * 0.18)} ${f(-R * 0.8)}C${f(R * 0.12)} ${f(-R * 0.6)} ${f(R * 0.28)} ${f(-R * 0.3)} ${f(R * 0.22)} 0Z`, e = ear(pen, head, side, [side * R * 0.62, -R * 0.6], 58, shape, toneOf(mix(fur.base, ELEMENT.earth.light, 0.35)), mix(ELEMENT.earth.soft, fur.base, 0.3), R * 0.25);
          for (let k = 1;k <= 3; k++)
            pen.stroke(side < 0 ? pen.g(e, { transform: "scale(-1 1)" }) : e, `M${f(R * 0.02)} ${f(-R * k * 0.2)}l${f(R * 0.14)} ${f(-R * 0.05)}`, pen.lw * 0.4, { opacity: 0.55 });
        }
      else
        for (let side of [-1, 1])
          ear(pen, head, side, [side * R * 0.7, -R * 0.45], 48, roundEar(R * 0.42, R * 0.6), fur, mix(ELEMENT.air.light, fur.base, 0.3), R * 0.3);
      pen.form(head, ellipsePath(0, 0, R, R * 0.95), fur, { size: R, grain: !0 }), pen.patch(head, ellipsePath(0, R * 0.32, R * 0.62, R * 0.45), belly.base, 0.88);
      for (let side of [-1, 1])
        pen.glow(head, side * R * (0.4 + 0.12 * u[8]), R * (-0.04 + 0.12 * (0.5 - u[9])), R * 0.5, ELEMENT.air.glow, 0.6);
      drawFace(pen, head, { ...faceFrom(u, R), kind: "mammal", cheeks: u[2] > 0.4 || s.delighted, delighted: s.delighted, noseTone: "#7A6470" });
    } };
  }
  function lamb(d) {
    let u = d.u, hover = 14 + 6 * u[11], rx = 29 + 4 * u[1], ry = 19 + 3 * u[0], cy = FOOT - hover - ry - 4, R = (15 + 3 * u[3]) * d.head, woolC = pick(["#F6F2F7", "#F7EAEA", "#ECE6F4", "#E8EFF6"], u[14]), wool = { light: "#FFFFFF", base: mix(woolC, ELEMENT.air.soft, 0.2), shadow: mix(ELEMENT.air.light, "#9AA4C2", 0.45) }, face = toneOf(u[13] > 0.72 ? mix("#8C7468", CREAM, 0.2) : mix("#F3D9C6", CREAM, 0.35)), rand = stream(d.seed), puffs = [[0, 0, 1]], count = 7 + Math.floor(u[12] * 3);
    for (let k = 0;k < count; k++) {
      let a = Math.PI * (1.05 + 0.9 * k / (count - 1)) + (rand() - 0.5) * 0.25;
      puffs.push([Math.cos(a) * rx * 0.72, Math.sin(a) * ry * 0.7, 0.36 + 0.14 * rand()]);
    }
    puffs.push([-rx * 0.62, ry * 0.35, 0.36], [rx * 0.6, ry * 0.32, 0.38]);
    let reach = (a) => Math.max(...puffs.map(([px, py, k]) => {
      let pr = k === 1 ? 0 : k * rx, dx = Math.cos(a), dy = Math.sin(a);
      if (k === 1)
        return 1 / Math.sqrt((dx / rx) ** 2 + (dy / ry) ** 2);
      let b = px * dx + py * dy, c = px * px + py * py - pr * pr, disc = b * b - c;
      return disc < 0 ? 0 : b + Math.sqrt(disc);
    })), outline = Array.from({ length: 64 }, (_, i) => {
      let a = i / 64 * Math.PI * 2, r = reach(a);
      return [CENTER + Math.cos(a) * r, cy + Math.sin(a) * r];
    });
    return { geo: { top: Math.min(...outline.map((p) => p[1])) - 3, left: Math.min(...outline.map((p) => p[0])) - 3, right: Math.max(...outline.map((p) => p[0])) + 10, headX: CENTER - 2, headY: cy + 3, headR: R * 1.1, hover }, draw(pen, g, s) {
      for (let x of [-rx * 0.5, -rx * 0.18, rx * 0.18, rx * 0.5])
        pen.stroke(g, `M${f(CENTER + x)} ${f(cy + ry * 0.75)}l0 6`, 2.6, { stroke: mix(wool.shadow, INK, 0.2) }), pen.form(g, ellipsePath(CENTER + x, cy + ry * 0.75 + 7, 2.6, 2.1), toneOf("#5E5260"), { weight: 0.4, size: 2 });
      let cloud = blob(outline, 1);
      pen.form(g, cloud, wool, { size: rx * 0.55, shade: [0.25, 0.5], shadowOpacity: 0.55 });
      let inner = pen.g(g, { "clip-path": pen.clip(cloud) });
      for (let [px, py, k] of puffs.slice(1, -2))
        pen.el("path", { d: `M${f(CENTER + px - k * rx * 0.7)} ${f(cy + py + k * rx * 0.4)}a${f(k * rx * 0.75)} ${f(k * rx * 0.75)} 0 0 1 ${f(k * rx * 1.3)} ${f(-k * rx * 0.2)}`, fill: "none", stroke: wool.shadow, "stroke-width": 0.9, opacity: 0.45 }, inner);
      for (let k = 0;k < 3; k++) {
        let x = CENTER + rx * (-0.6 + 1.2 * rand()), y = cy - ry * (0.2 + 0.4 * rand());
        pen.stroke(g, `M${f(x - 2)} ${f(y)}l4 0M${f(x)} ${f(y - 2)}l0 4M${f(x - 1.4)} ${f(y - 1.4)}l2.8 2.8`, 0.6, { opacity: 0.55, stroke: mix(ELEMENT.air.base, INK, 0.3) });
      }
      let tail = pen.g(g, { class: "cr-tail" });
      wisp(pen, tail, CENTER + rx * 0.98, cy - ry * 0.1, 8, wool), wisp(pen, tail, CENTER + rx * 0.9, cy + ry * 0.38, 6, wool);
      let anchor = pen.g(g, { transform: `translate(${f(CENTER - 2)} ${f(cy + 3)})` }), head = pen.g(anchor, { class: "portrait__head" });
      for (let side of [-1, 1])
        ear(pen, head, side, [side * R * 0.82, -R * 0.42], 105, `M${f(-R * 0.22)} 0C${f(-R * 0.3)} ${f(-R * 0.4)} ${f(-R * 0.12)} ${f(-R * 0.75)} 0 ${f(-R * 0.78)}C${f(R * 0.14)} ${f(-R * 0.75)} ${f(R * 0.3)} ${f(-R * 0.4)} ${f(R * 0.22)} 0Z`, face, mix(ELEMENT.air.light, face.base, 0.4), R * 0.2);
      pen.form(head, ellipsePath(0, 0, R * 0.9, R * 1), face, { size: R * 0.9 }), pen.patch(head, blob([[-R * 0.75, -R * 0.55], [-R * 0.3, -R * 1.02], [R * 0.3, -R * 1.05], [R * 0.75, -R * 0.55], [R * 0.4, -R * 0.62], [0, -R * 0.5], [-R * 0.4, -R * 0.62]]), wool.base, 0.95), drawFace(pen, head, { ...faceFrom(u, R * 1.05), spread: 0.36 + 0.1 * u[8], kind: "lamb", cheeks: !0, delighted: s.delighted, noseTone: "#8A6D72" });
    } };
  }
  var BUILDERS = { squirrel, moth, turtle, koi, fox, phoenix, lemur, lamb };
  function gardenLayout(d, fed = 0) {
    let sp = BUILDERS[d.species](d), geo = sp.geo, grow = 1 + 0.2 * fed, fit = Math.min(1, (FOOT - 6) / ((FOOT - geo.top) * grow), 56 / ((CENTER - geo.left) * grow), 57 / ((geo.right - CENTER) * grow)), scale = fit * grow, Y = (y) => (FOOT - (FOOT - y) * scale) / BOX_H, X = (x) => (CENTER + (x - CENTER) * scale) / 120;
    return { sp, fit, grow, extent: { top: Y(geo.top), left: X(geo.left), right: X(geo.right), headY: Y(geo.headY), headRadius: geo.headR * scale / 120, headX: X(geo.headX) } };
  }
  function paintGarden(document2, p, state = {}) {
    let d = gardenDraw(p, state.finish), fed = state.fed ?? 0, { sp, fit, grow, extent } = gardenLayout(d, fed), svg = document2.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", `0 0 120 ${BOX_H}`), svg.setAttribute("class", `portrait portrait-v2 critter garden finish-${d.finish} species-${d.species} element-${d.element}${FLIERS.has(d.species) ? " flier" : ""}`), svg.dataset.direction = "garden", svg.dataset.species = d.species, svg.dataset.element = d.element, svg.dataset.asleep = String(!!state.asleep);
    for (let [k, v] of Object.entries(extent))
      svg.dataset[k === "headY" ? "hy" : k === "headRadius" ? "hr" : k] = v.toFixed(3);
    if (svg.style.setProperty("--d", `${(p.idlePhase * 5).toFixed(2)}s`), svg.style.setProperty("--cheeks", state.delighted ? "1" : "0"), svg.style.setProperty("--mouth", state.delighted ? "1" : "0"), typeof state.size === "number")
      svg.setAttribute("width", String(state.size)), svg.setAttribute("height", String(state.size * 1.25));
    if (state.decorative !== !1)
      svg.setAttribute("aria-hidden", "true");
    let painted = d.finish === "painted", pen = new Pen(document2, svg, (painted ? 1.8 : 2.1) / Math.max(0.75, fit));
    pen.finish = d.finish;
    let hover = sp.geo.hover * (state.asleep ? 0.35 : 1), shadowW = (sp.geo.right - sp.geo.left) * 0.3 * fit * (hover ? 0.75 : 1);
    if (painted)
      pen.el("ellipse", { cx: CENTER, cy: FOOT + 1.5, rx: f(shadowW), ry: f(hover ? 3.4 : 4.6), fill: mix(ELEMENT[d.element].shadow, INK, 0.45), opacity: hover ? 0.2 : 0.24, filter: pen.filter("wash"), class: "portrait__shadow cr-shadow" }, svg);
    else
      pen.el("ellipse", { cx: CENTER, cy: FOOT + 1.5, rx: f(shadowW), ry: f(hover ? 3.2 : 4.4), fill: INK, opacity: hover ? 0.1 : 0.16, class: "portrait__shadow cr-shadow" }, svg);
    let fitG = pen.g(svg, { transform: fit < 1 ? `translate(${CENTER} ${FOOT}) scale(${fit.toFixed(4)}) translate(${-CENTER} ${-FOOT})` : null }), hoverG = pen.g(fitG, { class: "cr-hover", transform: hover !== sp.geo.hover ? `translate(0 ${f(sp.geo.hover - hover)})` : null }), figure = pen.g(hoverG, { class: "portrait__figure" }), body = pen.g(figure, { transform: fed ? `translate(${CENTER} ${FOOT}) scale(${grow.toFixed(3)}) translate(${-CENTER} ${-FOOT})` : null });
    if (sp.draw(pen, body, { asleep: !!state.asleep, delighted: !!state.delighted, fed }), !state.decorative && state.name) {
      let title = document2.createElementNS("http://www.w3.org/2000/svg", "title");
      title.textContent = state.name, svg.prepend(title), svg.setAttribute("role", "img"), svg.removeAttribute("aria-hidden");
    }
    return svg;
  }
  // packages/core/dist/generator/index.js
  var GEN_VERSION = "1";
  function cyrb532(value) {
    let h1 = 3735928559, h2 = 1103547991;
    for (let i = 0;i < value.length; i++) {
      let ch = value.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761), h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    return h1 = Math.imul(h1 ^ h1 >>> 16, 2246822507) ^ Math.imul(h2 ^ h2 >>> 13, 3266489909), h2 = Math.imul(h2 ^ h2 >>> 16, 2246822507) ^ Math.imul(h1 ^ h1 >>> 13, 3266489909), 4294967296 * (2097151 & h2) + (h1 >>> 0);
  }
  function mulberry322(seed) {
    let state = seed | 0;
    return () => {
      state = state + 1831565813 | 0;
      let value = Math.imul(state ^ state >>> 15, 1 | state);
      return value ^= value + Math.imul(value ^ value >>> 7, 61 | value), ((value ^ value >>> 14) >>> 0) / 4294967296;
    };
  }
  function generate(address, variant) {
    let input = hex(address, address.length === 42 ? 20 : 32);
    integer(variant, 0, 4);
    let rng = mulberry322(cyrb532(`${input}:${variant}:${GEN_VERSION}`)), uniform = (min, max) => min + (max - min) * rng();
    function choice(values) {
      let draw = rng() * values.reduce((sum, entry) => sum + entry[1], 0), threshold = 0;
      for (let [value, weight] of values)
        if (threshold += weight, draw < threshold)
          return value;
      throw RangeError("Invalid generator weights");
    }
    return {
      bodyShape: choice([["egg", 35], ["bean", 25], ["capsule", 25], ["round", 15]]),
      bodyHeight: uniform(0.85, 1.25),
      bodyWidth: uniform(0.75, 1.15),
      belly: uniform(0, 0.3),
      headShape: choice([["round", 45], ["egg", 30], ["squarish", 25]]),
      headSize: uniform(0.5, 0.72),
      headTilt: uniform(-8, 8),
      earType: choice([["round", 1], ["pointed", 1], ["long", 1], ["floppy", 1], ["tufts", 1], ["none", 1]]),
      earSize: uniform(0.18, 0.5),
      earSpread: uniform(35, 75),
      eyeStyle: choice([["round", 50], ["oval", 30], ["half-lid", 20]]),
      eyeSize: uniform(0.1, 0.2),
      eyeSpacing: uniform(0.32, 0.62),
      eyeHeight: uniform(0.45, 0.62),
      pupilSize: uniform(0.45, 0.7),
      snout: choice([["none", 40], ["button", 35], ["muzzle", 25]]),
      cheeks: rng() < 0.3,
      armType: choice([["stubs", 50], ["paws", 30], ["none", 20]]),
      legLength: uniform(0.15, 0.35),
      tailType: choice([["none", 30], ["puff", 25], ["curl", 25], ["stub", 20]]),
      markings: choice([["none", 55], ["belly patch", 25], ["spots", 20]]),
      hue: uniform(0, 360),
      chroma: uniform(0.06, 0.13),
      lightness: uniform(0.58, 0.76),
      accentShift: uniform(15, 45),
      idlePhase: uniform(0, 1)
    };
  }
  function layout(params) {
    let yF = { egg: 1.25, bean: 1.1, capsule: 1.15, round: 1 }[params.bodyShape], bh = 0.5 * params.bodyHeight * yF, bw = 0.5 * params.bodyWidth, leg = params.legLength * params.bodyHeight, bodyC = 0.6 * leg + bh, hr = 0.5 * params.headSize * params.bodyHeight, headC = bodyC + bh + 0.76 * hr, earLen = params.earSize * 2 * hr * 1.8;
    return { yF, bh, bw, leg, bodyC, hr, headC, earLen };
  }
  // packages/core/dist/generator/versioned.js
  var GEN_VERSION_22 = "2";
  function cyrb533(value) {
    let h1 = 3735928559, h2 = 1103547991;
    for (let i = 0;i < value.length; i++) {
      let ch = value.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761), h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    return h1 = Math.imul(h1 ^ h1 >>> 16, 2246822507) ^ Math.imul(h2 ^ h2 >>> 13, 3266489909), h2 = Math.imul(h2 ^ h2 >>> 16, 2246822507) ^ Math.imul(h1 ^ h1 >>> 13, 3266489909), 4294967296 * (2097151 & h2) + (h1 >>> 0);
  }
  function mulberry323(seed) {
    let state = seed | 0;
    return () => {
      state = state + 1831565813 | 0;
      let value = Math.imul(state ^ state >>> 15, 1 | state);
      return value ^= value + Math.imul(value ^ value >>> 7, 61 | value), ((value ^ value >>> 14) >>> 0) / 4294967296;
    };
  }
  function draws2(seedText) {
    let rng = mulberry323(cyrb533(seedText)), uniform = (min, max) => min + (max - min) * rng();
    function choice(values) {
      let draw = rng() * values.reduce((sum, entry) => sum + entry[1], 0), threshold = 0;
      for (let [value, weight] of values)
        if (threshold += weight, draw < threshold)
          return value;
      throw RangeError("Invalid generator weights");
    }
    return { rng, uniform, choice, equal: (list) => choice(list.map((value) => [value, 1])) };
  }
  var ELEMENTS2 = {
    earth: { ears: ["leaf", "round"], crests: [["sapling", 60], ["none", 40]], tails: ["branch", "puff"], marking: "moss", bands: [[130, 160], [60, 80]], glow: "#E9C46A", spot: "chest" },
    water: { ears: ["fin", "round"], crests: [["droplet", 50], ["reed", 50]], tails: ["tadpole", "stub"], marking: "dew", bands: [[180, 210]], glow: "#9FE1DC", spot: "throat" },
    fire: { ears: ["flame", "pointed"], crests: [["ember", 50], ["seedpods", 50]], tails: ["spark", "emberwisp"], marking: "belly", bands: [[20, 40], [40, 55]], glow: "#F28C38", spot: "chest" },
    air: { ears: ["cloud", "fern"], crests: [["none", 100]], tails: ["cloudwisp", "longwisp"], marking: "sky", bands: [[200, 220]], glow: "#BFE3F5", spot: "brow" }
  };
  function generate22(address, variant) {
    let input = hex(address, address.length === 42 ? 20 : 32);
    integer(variant, 0, 4);
    let { rng, uniform, choice, equal } = draws2(`${input}:${variant}:2`), element = equal(["earth", "water", "fire", "air"]), set = ELEMENTS2[element], params = {
      version: GEN_VERSION_22,
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
  function generateCritter2(address, variant, version = "1") {
    return version === "2" ? generate22(address, variant) : { ...generate(address, variant), version: "1" };
  }
  function layoutCritter2(params) {
    if (params.version === "1")
      return layout(params);
    let yF = { egg: 1.25, bean: 1.1, capsule: 1.15, round: 1 }[params.bodyShape], bh = 0.5 * params.bodyHeight * yF, bw = 0.5 * params.bodyWidth, leg = params.legLength * params.bodyHeight, bodyC = 0.6 * leg + bh, hr = 0.5 * params.headSize * params.bodyHeight, headC = bodyC + bh + 0.76 * hr;
    return { yF, bh, bw, leg, bodyC, hr, headC, earLen: params.earSize * 2 * hr * 1.8 };
  }
  // packages/app/src/portraits/index.ts
  var UNIT = 46;
  var state = /* @__PURE__ */ new WeakMap, portraitState = (svg) => state.get(svg);
  function rememberPortrait(svg, radii) {
    state.set(svg, radii);
  }
  function disposePortrait(svg) {
    state.get(svg)?.cleanup?.(), state.delete(svg);
  }

  // packages/app/src/portraits/garden/ink.ts
  var FOOT2 = 140, CENTER2 = 60;
  var BOX_H2 = 150, INK2 = "#2E2226", EYE2 = "#2C2129", EYE_SHADE2 = "#5B4350", PAGE2 = "#F6F0E4", CHEEK2 = "#F5A95D", CREAM2 = "#F3E6D6";
  var ELEMENT2 = {
    earth: { shadow: "#156152", base: "#289946", light: "#ACE676", soft: "#DEF5DA", glow: "#E9C46A" },
    water: { shadow: "#263580", base: "#2564B8", light: "#84D3F0", soft: "#E1EDFC", glow: "#9FE1DC" },
    fire: { shadow: "#852318", base: "#EB521D", light: "#F5A95D", soft: "#FCE7DE", glow: "#F28C38" },
    air: { shadow: "#52366B", base: "#B26ACC", light: "#E9BBF0", soft: "#F1E3FA", glow: "#BFE3F5" }
  }, serial2 = 0, uid2 = (prefix) => `garden-review-${prefix}${(++serial2).toString(36)}`;
  function mix2(a, b, t) {
    let p = (x) => [1, 3, 5].map((i) => parseInt(x.slice(i, i + 2), 16)), A = p(a), B = p(b);
    return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, "0")).join("");
  }
  function oklch2(l, c, h) {
    let lin = (cc) => {
      let a = cc * Math.cos(h * Math.PI / 180), b = cc * Math.sin(h * Math.PI / 180), l_ = l + 0.3963377774 * a + 0.2158037573 * b, m_ = l - 0.1055613458 * a - 0.0638541728 * b, s_ = l - 0.0894841775 * a - 1.291485548 * b, L = l_ ** 3, M = m_ ** 3, S = s_ ** 3;
      return [4.0767416621 * L - 3.3077115913 * M + 0.2309699292 * S, -1.2684380046 * L + 2.6097574011 * M - 0.3413193965 * S, -0.0041960863 * L - 0.7034186147 * M + 1.707614701 * S];
    }, lo = 0, hi = c, rgb = lin(c), ok = (v) => v.every((x) => x >= -0.000001 && x <= 1.000001);
    if (!ok(rgb)) {
      for (let i = 0;i < 22; i++) {
        let m = (lo + hi) / 2;
        if (ok(lin(m)))
          lo = m;
        else
          hi = m;
      }
      rgb = lin(lo);
    }
    return "#" + rgb.map((v) => Math.round(255 * Math.max(0, Math.min(1, v <= 0.0031308 ? 12.92 * v : 1.055 * v ** 0.4166666666666667 - 0.055))).toString(16).padStart(2, "0")).join("");
  }
  function toneOf2(colour, coolShadow = "#3E4F63", warmLight = "#FBF0DC") {
    return { light: mix2(colour, warmLight, 0.42), base: colour, shadow: mix2(mix2(colour, coolShadow, 0.38), "#2E2226", 0.12) };
  }

  class Pen3 {
    doc;
    svg;
    lw;
    defs;
    constructor(doc, svg, lw) {
      this.doc = doc;
      this.svg = svg;
      this.lw = lw;
      this.defs = this.el("defs", {}, svg);
    }
    el(tag, attrs = {}, parent) {
      let node = this.doc.createElementNS("http://www.w3.org/2000/svg", tag);
      for (let [k, v] of Object.entries(attrs))
        if (v !== null && v !== void 0)
          node.setAttribute(k, String(v));
      return parent?.append(node), node;
    }
    g(parent, attrs = {}) {
      return this.el("g", attrs, parent);
    }
    clip(d) {
      let id = uid2("c");
      return this.el("path", { d }, this.el("clipPath", { id }, this.defs)), `url(#${id})`;
    }
    radial(stops, cx = 0.34, cy = 0.28, r = 0.95) {
      let id = uid2("r"), grad = this.el("radialGradient", { id, cx, cy, r }, this.defs);
      for (let [o, c, a] of stops)
        this.el("stop", { offset: o, "stop-color": c, "stop-opacity": a ?? 1 }, grad);
      return `url(#${id})`;
    }
    linear(stops, x1 = 0, y1 = 0, x2 = 0, y2 = 1) {
      let id = uid2("l"), grad = this.el("linearGradient", { id, x1, y1, x2, y2 }, this.defs);
      for (let [o, c, a] of stops)
        this.el("stop", { offset: o, "stop-color": c, "stop-opacity": a ?? 1 }, grad);
      return `url(#${id})`;
    }
    form(parent, d, tone, o = {}) {
      let w = (o.weight ?? 1) * this.lw, g = this.g(parent, o.attrs ?? {}), shade = mix2(tone.base, tone.shadow, o.shadowOpacity ?? 0.44);
      if (!o.noLine)
        this.el("path", { d, fill: "#2E2226", stroke: "#2E2226", "stroke-width": w * 1.12, "stroke-linejoin": "round", transform: `translate(${f2(w * 0.2)} ${f2(w * 0.3)})` }, g);
      if (this.el("path", { d, fill: o.flat ? tone.base : this.radial([[0, tone.light], [0.46, tone.base], [1, shade]], 0.28, 0.22, 1.05) }, g), o.grain && !o.flat && (o.size ?? 20) > 9)
        this.el("path", { d, fill: this.paper(), opacity: 0.1 }, g);
      if (!o.noLine)
        this.el("path", { d, fill: "none", stroke: tone.line ?? "#2E2226", "stroke-width": w * 0.65, "stroke-linejoin": "round", "stroke-linecap": "round", opacity: 0.93 }, g);
      return g;
    }
    paperId;
    paper() {
      if (!this.paperId) {
        this.paperId = uid2("paper");
        let pattern = this.el("pattern", { id: this.paperId, width: 11, height: 13, patternUnits: "userSpaceOnUse" }, this.defs);
        this.el("path", { d: "M1 3l1.1-.3M7 10l.8.2M9 4l.6-.2", stroke: "#2E2226", "stroke-width": 0.55, "stroke-linecap": "round" }, pattern);
      }
      return `url(#${this.paperId})`;
    }
    patch(parent, d, fill, opacity = 1, attrs = {}) {
      return this.el("path", { d, fill, opacity, ...attrs }, parent);
    }
    stroke(parent, d, width, attrs = {}) {
      return this.el("path", { d, fill: "none", stroke: "#2E2226", "stroke-width": width, "stroke-linecap": "round", "stroke-linejoin": "round", ...attrs }, parent);
    }
    glow(parent, x, y, r, colour, strength = 0.75) {
      return this.el("circle", { cx: x, cy: y, r, fill: this.radial([[0, colour, strength], [1, colour, 0]], 0.5, 0.5, 0.5), class: "cr-glow" }, parent);
    }
  }
  var ellipsePath2 = (cx, cy, rx, ry) => `M${cx - rx} ${cy}a${rx} ${ry} 0 1 0 ${2 * rx} 0a${rx} ${ry} 0 1 0 ${-2 * rx} 0Z`, f2 = (n) => +n.toFixed(2);
  function blob2(points, tension = 1) {
    let n = points.length, p = (i) => points[(i + n) % n], d = `M${f2(p(0)[0])} ${f2(p(0)[1])}`;
    for (let i = 0;i < n; i++) {
      let p0 = p(i - 1), p1 = p(i), p2 = p(i + 1), p3 = p(i + 2), t = tension / 6;
      d += `C${f2(p1[0] + (p2[0] - p0[0]) * t)} ${f2(p1[1] + (p2[1] - p0[1]) * t)} ${f2(p2[0] - (p3[0] - p1[0]) * t)} ${f2(p2[1] - (p3[1] - p1[1]) * t)} ${f2(p2[0])} ${f2(p2[1])}`;
    }
    return d + "Z";
  }
  function curve2(points, tension = 1) {
    let n = points.length, p = (i) => points[Math.max(0, Math.min(n - 1, i))], d = `M${f2(p(0)[0])} ${f2(p(0)[1])}`;
    for (let i = 0;i < n - 1; i++) {
      let p0 = p(i - 1), p1 = p(i), p2 = p(i + 1), p3 = p(i + 2), t = tension / 6;
      d += `C${f2(p1[0] + (p2[0] - p0[0]) * t)} ${f2(p1[1] + (p2[1] - p0[1]) * t)} ${f2(p2[0] - (p3[0] - p1[0]) * t)} ${f2(p2[1] - (p3[1] - p1[1]) * t)} ${f2(p2[0])} ${f2(p2[1])}`;
    }
    return d;
  }
  function stream2(seed) {
    let s = seed | 0;
    return () => {
      s = s + 1831565813 | 0;
      let v = Math.imul(s ^ s >>> 15, 1 | s);
      return v ^= v + Math.imul(v ^ v >>> 7, 61 | v), ((v ^ v >>> 14) >>> 0) / 4294967296;
    };
  }

  // packages/app/src/portraits/garden/face.ts
  function drawFace2(pen, head, o) {
    let aspect = o.character === "keen" ? 0.94 : o.character === "dreamy" ? 1.12 : 1.04, { r } = o, lw = pen.lw, eyeR = r * o.eye, ex = r * o.spread, ey = r * o.eyeY, turn = (o.turn ?? 0) * r;
    for (let side of [-1, 1]) {
      let anchor = pen.g(head, { transform: `translate(${f2(side * ex + turn)} ${f2(ey)})` });
      pen.el("path", { d: `M${f2(-eyeR * 0.8)} ${f2(eyeR * 0.05)}Q0 ${f2(eyeR * 0.66)} ${f2(eyeR * 0.8)} ${f2(eyeR * 0.05)}`, fill: "none", stroke: INK2, "stroke-width": lw * 0.85, "stroke-linecap": "round", class: "portrait__sleep-eye" }, anchor);
      let open = pen.g(anchor, { class: "portrait__eye" }), clip = pen.clip(ellipsePath2(0, 0, eyeR, eyeR * aspect));
      pen.el("ellipse", { cx: 0, cy: 0, rx: eyeR, ry: eyeR * aspect, fill: EYE2 }, open);
      let pupil = pen.g(open, { class: "portrait__pupil", "clip-path": clip });
      if (pen.el("ellipse", { cx: eyeR * 0.06, cy: eyeR * 0.52, rx: eyeR * 0.74, ry: eyeR * 0.42, fill: EYE_SHADE2, opacity: 0.55, "clip-path": clip }, pupil), pen.el("circle", { cx: -eyeR * 0.34, cy: -eyeR * 0.38, r: eyeR * 0.21, fill: PAGE2 }, pupil), o.delighted)
        pen.el("circle", { cx: eyeR * 0.3, cy: eyeR * 0.3, r: eyeR * 0.08, fill: PAGE2, opacity: 0.85 }, pupil);
      pen.el("ellipse", { cx: 0, cy: 0, rx: eyeR, ry: eyeR * aspect, fill: "none", stroke: INK2, "stroke-width": lw * 0.5 }, open);
    }
    let mouthY = r * (o.kind === "bird" ? 0.5 : o.kind === "fish" ? 0.42 : 0.5);
    for (let side of [-1, 1])
      pen.el("ellipse", { cx: side * r * 0.72 + turn, cy: r * 0.5, rx: r * 0.15, ry: r * 0.085, fill: CHEEK2, opacity: 0.55, class: "portrait__cheek" }, head);
    if (o.kind === "bird" && o.beakTone) {
      let b = o.beakTone, by = r * 0.3;
      pen.form(head, `M${f2(-r * 0.15 + turn)} ${f2(by)}Q${f2(turn)} ${f2(by - r * 0.12)} ${f2(r * 0.15 + turn)} ${f2(by)}Q${f2(r * 0.04 + turn)} ${f2(by + r * 0.24)} ${f2(turn)} ${f2(by + r * 0.26)}Q${f2(-r * 0.04 + turn)} ${f2(by + r * 0.24)} ${f2(-r * 0.15 + turn)} ${f2(by)}Z`, b, { weight: 0.55, size: r * 0.15 });
      return;
    }
    if (o.kind === "mammal" || o.kind === "lamb" || o.kind === "turtle") {
      let nose = o.noseTone ?? INK2, ny = r * 0.3;
      pen.el("path", { d: `M${f2(-r * 0.08 + turn)} ${f2(ny)}Q${f2(turn)} ${f2(ny - r * 0.05)} ${f2(r * 0.08 + turn)} ${f2(ny)}Q${f2(turn)} ${f2(ny + r * 0.09)} ${f2(-r * 0.08 + turn)} ${f2(ny)}Z`, fill: nose, opacity: o.kind === "turtle" ? 0.55 : 0.85 }, head);
    }
    if (o.kind === "fish") {
      pen.el("ellipse", { cx: turn, cy: mouthY, rx: r * 0.08, ry: r * 0.06, fill: INK2, opacity: 0.75, class: "p-calm" }, head), pen.el("path", { d: `M${f2(-r * 0.12 + turn)} ${f2(mouthY - r * 0.02)}Q${f2(turn)} ${f2(mouthY + r * 0.2)} ${f2(r * 0.12 + turn)} ${f2(mouthY - r * 0.02)}Z`, fill: "#7A3B3A", stroke: INK2, "stroke-width": lw * 0.45, class: "portrait__mouth", opacity: 0 }, head);
      return;
    }
    pen.el("path", { d: `M${f2(-r * 0.11 + turn)} ${f2(mouthY)}Q${f2(turn)} ${f2(mouthY + r * 0.07)} ${f2(r * 0.11 + turn)} ${f2(mouthY)}`, fill: "none", stroke: INK2, "stroke-width": lw * 0.58, "stroke-linecap": "round", class: "p-calm" }, head), pen.el("path", { d: `M${f2(-r * 0.15 + turn)} ${f2(mouthY - r * 0.02)}Q${f2(turn)} ${f2(mouthY + r * 0.24)} ${f2(r * 0.15 + turn)} ${f2(mouthY - r * 0.02)}Z`, fill: "#7A3B3A", stroke: INK2, "stroke-width": lw * 0.5, "stroke-linejoin": "round", class: "portrait__mouth" }, head);
  }

  // packages/app/src/portraits/garden/species.ts
  var SPECIES2 = { earth: ["squirrel", "moth"], water: ["turtle", "koi"], fire: ["fox", "phoenix"], air: ["lemur", "lamb"] };
  var FLIERS2 = /* @__PURE__ */ new Set(["moth", "koi", "phoenix", "lemur", "lamb"]), clamp012 = (x) => Math.min(0.999, Math.max(0, x));
  function uniforms2(p) {
    return [
      (p.bodyHeight - 0.85) / 0.4,
      (p.bodyWidth - 0.75) / 0.4,
      p.belly / 0.3,
      (p.headSize - 0.5) / 0.22,
      (p.headTilt + 8) / 16,
      (p.earSize - 0.18) / 0.32,
      (p.earSpread - 35) / 40,
      (p.eyeSize - 0.1) / 0.1,
      (p.eyeSpacing - 0.32) / 0.3,
      (p.eyeHeight - 0.45) / 0.17,
      (p.pupilSize - 0.45) / 0.25,
      (p.legLength - 0.15) / 0.2,
      (p.chroma - 0.06) / 0.07,
      (p.lightness - 0.58) / 0.18,
      (p.accentShift - 15) / 30,
      p.idlePhase
    ].map(clamp012);
  }
  function gardenDraw2(p, finish = "painted") {
    let u = uniforms2(p), element = p.element, species = SPECIES2[element][u[15] < 0.5 ? 0 : 1];
    return { element, species, u, seed: Math.floor(u[15] * 1e9) ^ Math.floor(u[1] * 1e6), finish, head: finish === "painted" ? 1.2 : 1 };
  }
  var lerp2 = (a, b, t) => a + (b - a) * t, pick2 = (list, x) => list[Math.min(list.length - 1, Math.floor(x * list.length))];
  function faceFrom2(u, r) {
    return { r, eye: 0.265 + 0.065 * u[7], spread: 0.4 + 0.12 * u[8], eyeY: -0.04 + 0.12 * (0.5 - u[9]), character: u[10] < 0.34 ? "round" : u[10] < 0.67 ? "keen" : "dreamy" };
  }
  var elTone2 = (e, k = 0) => {
    let E = ELEMENT2[e];
    return { light: mix2(E.light, CREAM2, 0.25 + k), base: mix2(E.base, E.light, 0.25 + k), shadow: E.shadow };
  }, own2 = (l, c, h, soften = 0.28) => toneOf2(mix2(oklch2(l, c, h), CREAM2, soften));
  function oakLeaf2(pen, parent, x, y, size, angle, tone) {
    let s = size, half = s * 0.42, pts = [[0, 0], [half * 0.55, -s * 0.15], [half * 0.95, -s * 0.28], [half * 0.6, -s * 0.38], [half * 1, -s * 0.52], [half * 0.55, -s * 0.62], [half * 0.8, -s * 0.78], [0, -s], [-half * 0.8, -s * 0.78], [-half * 0.55, -s * 0.62], [-half * 1, -s * 0.52], [-half * 0.6, -s * 0.38], [-half * 0.95, -s * 0.28], [-half * 0.55, -s * 0.15]], g = pen.g(parent, { transform: `translate(${f2(x)} ${f2(y)}) rotate(${f2(angle)})` });
    return pen.form(g, blob2(pts, 0.7), tone, { weight: 0.55, size: s * 0.5 }), pen.stroke(g, `M0 ${f2(-s * 0.05)}L0 ${f2(-s * 0.85)}`, pen.lw * 0.35, { opacity: 0.6 }), g;
  }
  function acorn2(pen, parent, x, y, s, glowCol) {
    let g = pen.g(parent, { transform: `translate(${f2(x)} ${f2(y)})` });
    pen.glow(g, 0, -s * 0.2, s * 1.4, glowCol, 0.45), pen.form(g, ellipsePath2(0, s * 0.25, s * 0.55, s * 0.68), toneOf2("#C8955A"), { weight: 0.5, size: s * 0.5 }), pen.form(g, `M${f2(-s * 0.68)} ${f2(-s * 0.05)}Q0 ${f2(-s * 0.85)} ${f2(s * 0.68)} ${f2(-s * 0.05)}Q0 ${f2(s * 0.2)} ${f2(-s * 0.68)} ${f2(-s * 0.05)}Z`, toneOf2("#7A5233"), { weight: 0.5, size: s * 0.4, grain: !0 }), pen.stroke(g, `M0 ${f2(-s * 0.45)}q${f2(s * 0.1)} ${f2(-s * 0.3)} ${f2(s * 0.3)} ${f2(-s * 0.35)}`, pen.lw * 0.4);
  }
  function flame2(pen, parent, x, y, s, cls = "") {
    let g = pen.g(parent, { transform: `translate(${f2(x)} ${f2(y)})`, class: cls }), E = ELEMENT2.fire;
    pen.glow(g, 0, -s * 0.35, s * 1.25, E.glow, 0.5);
    let d = `M0 ${f2(-s * 1.15)}C${f2(s * 0.25)} ${f2(-s * 0.75)} ${f2(s * 0.62)} ${f2(-s * 0.48)} ${f2(s * 0.5)} ${f2(-s * 0.05)}C${f2(s * 0.42)} ${f2(s * 0.32)} ${f2(-s * 0.42)} ${f2(s * 0.32)} ${f2(-s * 0.5)} ${f2(-s * 0.05)}C${f2(-s * 0.58)} ${f2(-s * 0.42)} ${f2(-s * 0.12)} ${f2(-s * 0.62)} 0 ${f2(-s * 1.15)}Z`;
    return pen.form(g, d, { light: mix2(E.light, "#FFF3D6", 0.4), base: E.light, shadow: E.base }, { weight: 0.5, size: s * 0.6 }), pen.patch(g, `M0 ${f2(-s * 0.55)}C${f2(s * 0.18)} ${f2(-s * 0.32)} ${f2(s * 0.25)} ${f2(-s * 0.05)} 0 ${f2(s * 0.12)}C${f2(-s * 0.25)} ${f2(-s * 0.05)} ${f2(-s * 0.15)} ${f2(-s * 0.32)} 0 ${f2(-s * 0.55)}Z`, "#FFF0C9", 0.85), g;
  }
  function ear2(pen, head, side, at, angle, d, tone, inner, size) {
    let anchor = pen.g(head, { transform: `translate(${f2(at[0])} ${f2(at[1])})` }), rot = pen.g(anchor, { class: `portrait__ear portrait__ear--${side < 0 ? "l" : "r"}`, style: `--ear-base:${f2(side * angle)}deg` }), mirror = side < 0 ? pen.g(rot, { transform: "scale(-1 1)" }) : rot;
    if (pen.form(mirror, d, tone, { weight: 0.75, size }), inner)
      pen.patch(mirror, d, inner, 0.85, { transform: "translate(0 -1) scale(.55 .7)" });
    return rot;
  }
  function wingAt(pen, parent, root, side, fold) {
    return pen.g(pen.g(parent, { transform: root }), { class: `cr-wing cr-wing-${side < 0 ? "l" : "r"}`, transform: `scale(${f2(side * fold)} 1)` });
  }
  var roundEar2 = (w, L) => `M${f2(-w)} 0C${f2(-w * 1.15)} ${f2(-L * 0.62)} ${f2(-w * 0.45)} ${f2(-L * 1.02)} 0 ${f2(-L)}C${f2(w * 0.5)} ${f2(-L * 1.02)} ${f2(w * 1.15)} ${f2(-L * 0.6)} ${f2(w)} 0Z`, pointEar2 = (w, L) => `M${f2(-w)} 0C${f2(-w * 0.9)} ${f2(-L * 0.45)} ${f2(-w * 0.25)} ${f2(-L * 0.9)} ${f2(-w * 0.05)} ${f2(-L)}Q0 ${f2(-L * 1.04)} ${f2(w * 0.08)} ${f2(-L * 0.98)}C${f2(w * 0.35)} ${f2(-L * 0.85)} ${f2(w * 0.95)} ${f2(-L * 0.42)} ${f2(w)} 0Z`;
  function wisp2(pen, parent, x, y, s, tone) {
    let d = `M${f2(x)} ${f2(y)}c${f2(s * 0.4)} ${f2(-s * 0.55)} ${f2(s * 1.2)} ${f2(-s * 0.5)} ${f2(s * 1.35)} ${f2(-s * 0.05)}c${f2(-s * 0.45)} ${f2(-s * 0.15)} ${f2(-s * 0.85)} ${f2(s * 0.05)} ${f2(-s * 1)} ${f2(s * 0.32)}c${f2(-s * 0.12)} ${f2(s * 0.12)} ${f2(-s * 0.3)} ${f2(s * 0.02)} ${f2(-s * 0.35)} ${f2(-s * 0.27)}Z`;
    pen.form(parent, d, tone, { weight: 0.5, size: s * 0.6, flat: !0 });
  }
  function squirrel2(d) {
    let u = d.u, W = 18 + 6 * u[1], H = 22 + 6 * u[0], bodyY = FOOT2 - 4 - H, R = (21 + 5 * u[3]) * d.head, headX = CENTER2 - 1, headY = bodyY - H * 0.72 - R * 0.55, earL = R * (0.55 + 0.35 * u[5]), spread = 16 + 14 * u[6], sapling = u[2] > 0.45, plume = 1 + 0.25 * u[12], tailTop = bodyY - H * 1.45 * plume - 8, top = Math.min(headY - R - earL * Math.cos(spread * Math.PI / 180) - 2, tailTop - 6, sapling ? headY - R - R * 0.5 : 1 / 0), coat = pick2([[0.64, 0.1, 48], [0.55, 0.09, 38], [0.72, 0.1, 78], [0.66, 0.035, 60]], u[14]), fur = own2(coat[0] + 0.06 * (u[13] - 0.5), coat[1], coat[2]), belly = toneOf2(mix2(CREAM2, fur.base, 0.18)), autumn = u[12] > 0.55, leafA = autumn ? toneOf2(mix2("#C7843A", CREAM2, 0.15), "#5A3A2A") : elTone2("earth"), leafB = autumn ? toneOf2(mix2("#B5562E", CREAM2, 0.18), "#4A2A2A") : toneOf2(mix2(mix2(ELEMENT2.earth.base, "#C9A24A", 0.35), CREAM2, 0.15), "#2E4A3A");
    return { geo: { top, left: CENTER2 - W - 12, right: CENTER2 + W + 34, headX, headY, headR: R, hover: 0 }, draw(pen, g, s) {
      let rand = stream2(d.seed), tail = pen.g(g, { class: "cr-tail" }), spine = [[CENTER2 + W * 0.7, bodyY + H * 0.5], [CENTER2 + W + 14, bodyY + H * 0.1], [CENTER2 + W + 19, bodyY - H * 0.65 * plume], [CENTER2 + W + 12, tailTop + 6], [CENTER2 + W + 2, tailTop + 2]], along = (t) => {
        let i = Math.min(spine.length - 2, Math.floor(t * (spine.length - 1))), k = t * (spine.length - 1) - i, a = spine[i], b = spine[i + 1];
        return [lerp2(a[0], b[0], k), lerp2(a[1], b[1], k)];
      }, brush = blob2([[CENTER2 + W * 0.55, bodyY + H * 0.62], [CENTER2 + W + 17, bodyY + H * 0.25], [CENTER2 + W + 24, bodyY - H * 0.6 * plume], [CENTER2 + W + 16, tailTop + 9], [CENTER2 + W + 4, tailTop + 6], [CENTER2 + W + 8, bodyY - H * 0.55 * plume], [CENTER2 + W * 0.95, bodyY + H * 0.05]], 0.9);
      pen.form(tail, brush, fur, { size: 10, grain: !0 });
      let count = 6 + Math.floor(u[13] * 3);
      for (let i = 0;i < count; i++) {
        let t = 0.08 + 0.92 * i / (count - 1), [x, y] = along(t), side = i % 2 ? 1 : -1, size = 11 + 6 * Math.sin(t * Math.PI) + 2 * rand();
        oakLeaf2(pen, tail, x + side * (3 + 4 * Math.sin(t * Math.PI)), y + 2, size, side * (35 + 30 * rand()) + 15 - t * 30, i % 3 === 1 ? leafB : leafA);
      }
      acorn2(pen, tail, CENTER2 + W + 19, bodyY - H * 0.45, 4.6, ELEMENT2.earth.glow), acorn2(pen, tail, CENTER2 + W + 8, bodyY - H * 0.05, 4, ELEMENT2.earth.glow);
      let body = blob2([[CENTER2, bodyY - H], [CENTER2 + W * 0.78, bodyY - H * 0.66], [CENTER2 + W * 0.98, bodyY + H * 0.05], [CENTER2 + W * 1.08, bodyY + H * 0.72], [CENTER2 + W * 0.6, bodyY + H * 1], [CENTER2 - W * 0.6, bodyY + H * 1], [CENTER2 - W * 1.08, bodyY + H * 0.72], [CENTER2 - W * 0.98, bodyY + H * 0.05], [CENTER2 - W * 0.78, bodyY - H * 0.66]]);
      if (pen.form(g, body, fur, { size: W, grain: !0 }), pen.patch(g, ellipsePath2(CENTER2 + 1, bodyY + H * 0.28, W * 0.6, H * 0.6), belly.base, 0.92), pen.glow(g, CENTER2, bodyY - H * 0.05, W * 0.55, ELEMENT2.earth.glow, 0.42), u[11] > 0.5)
        for (let k of [0, 1])
          pen.stroke(g, curve2([[CENTER2 - W * 0.95, bodyY - H * (0.3 - k * 0.32)], [CENTER2 - W * 0.62, bodyY - H * (0.42 - k * 0.32)], [CENTER2 - W * 0.32, bodyY - H * (0.34 - k * 0.32)]]), pen.lw * 0.5, { opacity: 0.55 });
      else
        for (let [x, y, r] of [[-0.6, -0.3, 2.4], [-0.78, 0.18, 1.8], [0.62, -0.42, 2]])
          pen.patch(g, ellipsePath2(CENTER2 + x * W, bodyY + y * H, r, r * 0.8), ELEMENT2.earth.light, 0.75);
      for (let side of [-1, 1])
        pen.form(g, ellipsePath2(CENTER2 + side * W * 0.48, bodyY - H * 0.04, 5.2, 6.4), fur, { weight: 0.7, size: 5, attrs: { transform: `rotate(${side * -18} ${f2(CENTER2 + side * W * 0.48)} ${f2(bodyY)})` } });
      for (let side of [-1, 1])
        pen.form(g, ellipsePath2(CENTER2 + side * W * 0.52, FOOT2 - 3.2, 9.5, 4.8), toneOf2(mix2(fur.base, "#6B5040", 0.25)), { weight: 0.8, size: 6 });
      let anchor = pen.g(g, { transform: `translate(${f2(headX)} ${f2(headY)})` }), head = pen.g(anchor, { class: "portrait__head" });
      for (let side of [-1, 1]) {
        let e = ear2(pen, head, side, [side * R * 0.58, -R * 0.66], spread, roundEar2(R * 0.33, earL), fur, mix2("#F2C6B4", fur.base, 0.2), R * 0.3);
        if (u[5] > 0.55)
          pen.stroke(side < 0 ? pen.g(e, { transform: "scale(-1 1)" }) : e, `M0 ${f2(-earL * 0.95)}q2 -4 0.5 -7m-0.5 7q-2 -3.5 -1 -6`, pen.lw * 0.6);
      }
      if (sapling) {
        let sg = pen.g(head);
        pen.stroke(sg, `M0 ${f2(-R * 0.92)}q1 ${f2(-R * 0.25)} -1 ${f2(-R * 0.48)}`, pen.lw * 0.9, { stroke: ELEMENT2.earth.shadow }), oakLeaf2(pen, sg, -1, -R * 1.3, 8, -40, elTone2("earth")), oakLeaf2(pen, sg, 0, -R * 1.25, 7, 35, leafB);
      }
      pen.form(head, ellipsePath2(0, 0, R, R * 0.96), fur, { size: R, grain: !0 }), pen.patch(head, ellipsePath2(0, R * 0.36, R * 0.55, R * 0.4), belly.base, 0.9), drawFace2(pen, head, { ...faceFrom2(u, R), kind: "mammal", cheeks: u[2] > 0.3 || s.delighted, delighted: s.delighted });
    } };
  }
  function moth2(d) {
    let u = d.u, R = (23 + 5 * u[0]) * (0.5 + d.head / 2), hover = 17 + 6 * u[11], cy = FOOT2 - hover - R - 2, span = R + 13 + 6 * u[1], wingBase = pick2(["#B9AE98", "#9C7E62", "#93A27C", "#B47A54", "#A79AB5"], (u[14] * 2.7 + u[10] * 1.9) % 1), furC = pick2([[0.88, 0.03, 80], [0.8, 0.02, 250], [0.78, 0.05, 60]], u[13]), fur = own2(furC[0], furC[1], furC[2], 0.12), wing = toneOf2(mix2(wingBase, CREAM2, 0.12), "#3A3F45"), lichen = mix2(ELEMENT2.earth.light, "#DCE0CB", 0.5), band = mix2(wingBase, INK2, 0.28), eyespot = u[12] > 0.4;
    return { geo: { top: cy - R - 22, left: CENTER2 - span - 4, right: CENTER2 + span + 4, headX: CENTER2, headY: cy, headR: R, hover }, draw(pen, g, s) {
      let rand = stream2(d.seed), fold = s.asleep ? 0.62 : 1;
      for (let side of [-1, 1]) {
        let wingG = wingAt(pen, g, `translate(${f2(CENTER2)} ${f2(cy)})`, side, fold), upper = blob2([[R * 0.42, -R * 0.4], [R * 0.75, -R * 1.02], [span * 0.72, -R * 1.25], [span * 1.02, -R * 0.95], [span * 0.95, -R * 0.2], [span * 0.68, R * 0.05], [R * 0.55, R * 0.08]], 0.85), lower = blob2([[R * 0.45, R * 0.02], [span * 0.6, R * 0.12], [span * 0.74, R * 0.55], [span * 0.52, R * 0.95], [span * 0.38, R * 0.78], [R * 0.55, R * 0.62]], 0.85);
        pen.form(wingG, lower, toneOf2(mix2(wing.base, CREAM2, 0.38)), { size: R * 0.5, weight: 0.8, grain: !0 }), pen.form(wingG, upper, wing, { size: R * 0.75, weight: 0.85, grain: !0 });
        let inside = pen.g(wingG, { "clip-path": pen.clip(upper) });
        pen.stroke(inside, curve2([[span * 0.42, -R * 1.25], [span * 0.55, -R * 0.65], [span * 0.48, R * 0.1]]), 3.2, { stroke: band, opacity: 0.45, filter: null });
        for (let k = 0;k < 3; k++)
          pen.stroke(inside, curve2([[R * 0.7 + k * 7, -R * 0.82 + k * 2], [R * 0.92 + k * 9, -R * 0.45], [R * 0.82 + k * 10, -R * 0.02]]), pen.lw * 0.35, { opacity: 0.4 });
        for (let k = 0;k < 7; k++) {
          let x = span * (0.5 + 0.45 * rand()), y = -R * (0.1 + 0.95 * rand()), r = 1.5 + 2.4 * rand();
          pen.patch(inside, ellipsePath2(x, y, r, r * 0.85), lichen, 0.85);
        }
        if (eyespot) {
          let ex = span * 0.76, ey = -R * 0.62;
          pen.glow(wingG, ex, ey, 8, ELEMENT2.earth.glow, 0.6), pen.el("circle", { cx: ex, cy: ey, r: 4.6, fill: "#F4E4B4", stroke: INK2, "stroke-width": pen.lw * 0.4 }, wingG), pen.el("circle", { cx: ex + 0.4, cy: ey + 0.3, r: 2.2, fill: mix2(ELEMENT2.earth.shadow, INK2, 0.3) }, wingG);
        } else
          pen.patch(wingG, `M${f2(span * 0.98)} ${f2(-R * 0.9)}q${f2(-span * 0.12)} ${f2(R * 0.15)} ${f2(-span * 0.08)} ${f2(R * 0.5)}`, "none", 0.9, { stroke: "#F4E4B4", "stroke-width": 2.2, "stroke-linecap": "round" });
      }
      for (let side of [-1, 1]) {
        let x0 = CENTER2 + side * R * 0.32, y0 = cy - R * 0.86, x1 = x0 + side * 7, y1 = y0 - 14;
        pen.stroke(g, `M${f2(x0)} ${f2(y0)}Q${f2(x0 + side * 1)} ${f2(y0 - 9)} ${f2(x1)} ${f2(y1)}a3.6 3.6 0 1 ${side > 0 ? 1 : 0} ${f2(side * 3)} ${f2(4.2)}a1.9 1.9 0 1 ${side > 0 ? 1 : 0} ${f2(-side * 2.6)} ${f2(-0.6)}`, pen.lw * 0.95, { stroke: mix2(ELEMENT2.earth.shadow, INK2, 0.35) });
        for (let k = 1;k <= 3; k++)
          pen.stroke(g, `M${f2(x0 + side * k * 1.2)} ${f2(y0 - k * 3.5)}l${f2(side * 3.2)} ${f2(-1.2)}`, pen.lw * 0.45, { stroke: ELEMENT2.earth.base, opacity: 0.85 });
      }
      let fuzz = blob2(Array.from({ length: 22 }, (_, i) => {
        let a = i / 22 * Math.PI * 2, k = i % 2 ? 1 : 0.95;
        return [CENTER2 + Math.cos(a) * R * k, cy + Math.sin(a) * R * 1.02 * k];
      }), 1);
      pen.form(g, fuzz, fur, { size: R, grain: !0 }), pen.patch(g, ellipsePath2(CENTER2, cy + R * 0.12, R * 0.78, R * 0.62), mix2(fur.light, "#FFFFFF", 0.3), 0.5);
      for (let side of [-1, 1])
        pen.form(g, ellipsePath2(CENTER2 + side * 6, cy + R + 1.5, 2.6, 3.2), toneOf2("#8A7462"), { weight: 0.5, size: 2 });
      let anchor = pen.g(g, { transform: `translate(${CENTER2} ${f2(cy - R * 0.05)})` }), head = pen.g(anchor, { class: "portrait__head" });
      drawFace2(pen, head, { ...faceFrom2(u, R * 0.92), kind: "mammal", cheeks: !0, delighted: s.delighted, noseTone: "#6B5040" });
    } };
  }
  function turtle2(d) {
    let u = d.u, rx = 34 + 6 * u[1], ry = 21 + 4 * u[0], sx = CENTER2 + 7, sy = FOOT2 - 7 - ry * 0.8, R = (19 + 4 * u[3]) * d.head, headX = CENTER2 - 13, headY = FOOT2 - 24 - R * 0.55, skinC = pick2([[0.64, 0.07, 178], [0.66, 0.07, 150], [0.6, 0.05, 232]], u[14]), skin = own2(skinC[0] + 0.06 * (u[13] - 0.5), skinC[1], skinC[2], 0.2), stoneSet = pick2([["#B9B2A3", "#A8B4B4", "#C4BBA9", "#9FAAAE"], ["#D3C1A0", "#C9B48E", "#DCCDB2", "#BFA987"], ["#A9B29A", "#9DAA8E", "#B8BEA6", "#8E9C84"]], u[12]), garden = u[2], reed = garden > 0.66, flower = garden < 0.33;
    return { geo: { top: Math.min(sy - ry - 4, headY - R - 3, reed ? sy - ry - 22 : 1 / 0), left: Math.min(headX - R - 3, sx - rx - 3), right: sx + rx + 6, headX, headY, headR: R, hover: 0 }, draw(pen, g, s) {
      let rand = stream2(d.seed);
      pen.form(g, ellipsePath2(sx + rx * 0.72, FOOT2 - 4, 8, 5.5), skin, { weight: 0.7, size: 6 });
      let dome = `M${f2(sx - rx)} ${f2(sy + ry * 0.55)}C${f2(sx - rx)} ${f2(sy - ry * 0.9)} ${f2(sx - rx * 0.5)} ${f2(sy - ry * 1.05)} ${f2(sx)} ${f2(sy - ry * 1.05)}C${f2(sx + rx * 0.5)} ${f2(sy - ry * 1.05)} ${f2(sx + rx)} ${f2(sy - ry * 0.9)} ${f2(sx + rx)} ${f2(sy + ry * 0.55)}C${f2(sx + rx * 0.6)} ${f2(sy + ry * 0.85)} ${f2(sx - rx * 0.6)} ${f2(sy + ry * 0.85)} ${f2(sx - rx)} ${f2(sy + ry * 0.55)}Z`;
      pen.form(g, dome, toneOf2(stoneSet[3], "#3E4F63"), { size: rx * 0.7, grain: !0 });
      let stones = pen.g(g, { "clip-path": pen.clip(dome) });
      [[-0.55, -0.35, 0.3, 0.42], [0, -0.62, 0.34, 0.36], [0.55, -0.35, 0.3, 0.42], [-0.78, 0.25, 0.26, 0.38], [-0.28, 0.12, 0.27, 0.4], [0.25, 0.12, 0.27, 0.4], [0.76, 0.25, 0.26, 0.38]].forEach(([cx, cyy, w, h], i) => {
        let x = sx + cx * rx, y = sy + cyy * ry, pts = Array.from({ length: 7 }, (_, k) => {
          let a = k / 7 * Math.PI * 2 + rand() * 0.3, kk = 0.86 + 0.18 * rand();
          return [x + Math.cos(a) * w * rx * kk, y + Math.sin(a) * h * ry * kk];
        });
        pen.form(stones, blob2(pts, 0.9), toneOf2(stoneSet[(i + Math.floor(u[13] * 4)) % stoneSet.length]), { size: w * rx, weight: 0.6, grain: !0 });
      }), pen.stroke(g, `M${f2(sx - rx * 0.97)} ${f2(sy + ry * 0.4)}C${f2(sx - rx * 0.5)} ${f2(sy + ry * 0.72)} ${f2(sx + rx * 0.5)} ${f2(sy + ry * 0.72)} ${f2(sx + rx * 0.97)} ${f2(sy + ry * 0.4)}`, pen.lw * 0.6, { opacity: 0.6 });
      let pw = 12 + 3 * u[11], py = sy - ry * 0.84, pool = ellipsePath2(sx - 1, py, pw, 4.2);
      pen.form(g, pool, { light: "#F2FAFD", base: mix2(ELEMENT2.water.light, "#FFFFFF", 0.2), shadow: ELEMENT2.water.base }, { weight: 0.55, size: 4 }), pen.patch(g, `M${f2(sx - pw * 0.6)} ${f2(py - 1.2)}q${f2(pw * 0.35)} -1.4 ${f2(pw * 0.7)} -0.5`, "none", 1, { stroke: "#FFFFFF", "stroke-width": 1, "stroke-linecap": "round", opacity: 0.85 });
      let pad = `M${f2(sx + 3)} ${f2(py)}l4.6 -1.2a4.8 2 0 1 1 -1.4 -1.1Z`;
      if (pen.form(g, pad, elTone2("earth", 0.05), { weight: 0.45, size: 2, flat: !0 }), flower)
        pen.form(g, ellipsePath2(sx + 5, py - 1.6, 1.8, 1.4), toneOf2("#F2B8C6"), { weight: 0.4, size: 1, flat: !0 });
      if (reed)
        pen.stroke(g, `M${f2(sx + rx * 0.45)} ${f2(sy - ry * 0.7)}q-1 -10 2 -19`, pen.lw * 0.8, { stroke: ELEMENT2.earth.shadow }), pen.form(g, ellipsePath2(sx + rx * 0.45 + 2, sy - ry * 0.7 - 20, 1.6, 4.2), toneOf2("#8A6A4A"), { weight: 0.45, size: 1.5 });
      for (let [x, y] of [[headX - 8, FOOT2 - 3.5], [headX + 17, FOOT2 - 3]])
        pen.form(g, ellipsePath2(x, y, 7.5, 5), skin, { weight: 0.75, size: 6, grain: !0 });
      pen.form(g, blob2([[headX - R * 0.4, headY + R * 0.5], [headX + R * 0.6, headY + R * 0.2], [sx - rx * 0.55, sy + ry * 0.1], [sx - rx * 0.5, sy + ry * 0.55], [headX + R * 0.2, headY + R * 1.05]]), skin, { size: R * 0.6 });
      let anchor = pen.g(g, { transform: `translate(${f2(headX)} ${f2(headY)})` }), head = pen.g(anchor, { class: "portrait__head" });
      if (u[5] > 0.5)
        ear2(pen, head, 1, [R * 0.05, -R * 0.84], 10, `M${f2(-R * 0.18)} 0C${f2(-R * 0.2)} ${f2(-R * 0.28)} ${f2(-R * 0.02)} ${f2(-R * 0.44)} ${f2(R * 0.2)} ${f2(-R * 0.4)}C${f2(R * 0.1)} ${f2(-R * 0.24)} ${f2(R * 0.22)} ${f2(-R * 0.1)} ${f2(R * 0.18)} 0Z`, { light: "#EAF6F8", base: mix2(ELEMENT2.water.light, skin.base, 0.4), shadow: skin.shadow }, null, R * 0.16);
      pen.form(head, ellipsePath2(0, 0, R, R * 0.92), skin, { size: R, grain: !0 }), pen.glow(head, 0, R * 0.95, R * 0.55, ELEMENT2.water.glow, 0.55);
      for (let [x, y, r] of [[-0.55, -0.45, 0.12], [0.4, -0.6, 0.09], [0.7, -0.2, 0.1]])
        pen.patch(head, ellipsePath2(x * R, y * R, r * R, r * R * 0.8), mix2(skin.light, ELEMENT2.water.light, 0.4), 0.75);
      drawFace2(pen, head, { ...faceFrom2(u, R), kind: "turtle", cheeks: u[2] > 0.25 || s.delighted, delighted: s.delighted }), pen.form(head, `M${f2(R * 0.06)} ${f2(R * 0.1)}c1.6 2 2.1 3.9 0 4.6c-2.1 -0.7 -1.6 -2.6 0 -4.6Z`, { light: "#FFFFFF", base: ELEMENT2.water.light, shadow: ELEMENT2.water.base }, { weight: 0.4, size: 1.5, flat: !0 });
    } };
  }
  function koi2(d) {
    let u = d.u, hover = 22 + 6 * u[11], rx = (23 + 3 * u[1]) * (0.6 + 0.4 * d.head), ry = (20 + 3 * u[0]) * (0.6 + 0.4 * d.head), cx = CENTER2 - 6, cy = FOOT2 - hover - ry - 2, tail = 23 + 8 * u[5], back = pick2([["#F2EFE8", "#5E86B8"], ["#8FC4C9", "#2F5E7E"], ["#9AA6C4", "#F4EEE4"], ["#E9DCC3", "#4C7FA6"]], u[13]), body = toneOf2(mix2(back[0], CREAM2, 0.1), "#4B6A86"), patchA = mix2(back[1], CREAM2, 0.25), patchB = mix2(back[1], ELEMENT2.water.shadow, 0.3), pattern = Math.floor(u[12] * 3), finTone = { light: "#F4FBFE", base: mix2(ELEMENT2.water.light, "#FFFFFF", 0.4), shadow: ELEMENT2.water.light };
    return { geo: { top: cy - ry - 14 - tail * 0.45, left: cx - rx - 6, right: cx + rx + tail + 4, headX: cx - 2, headY: cy, headR: Math.max(rx, ry) * 0.88, hover }, draw(pen, g, s) {
      let rand = stream2(d.seed), tg = pen.g(g, { class: "cr-tail" }), bx = cx + rx * 0.85, by = cy + 1, fin = `M${f2(bx)} ${f2(by - 6)}C${f2(bx + tail * 0.35)} ${f2(by - 11)} ${f2(bx + tail * 0.72)} ${f2(by - tail * 0.7)} ${f2(bx + tail)} ${f2(by - tail * 0.6)}C${f2(bx + tail * 0.84)} ${f2(by - tail * 0.32)} ${f2(bx + tail * 0.72)} ${f2(by - 4)} ${f2(bx + tail * 0.9)} ${f2(by + tail * 0.2)}C${f2(bx + tail * 1)} ${f2(by + tail * 0.4)} ${f2(bx + tail * 0.6)} ${f2(by + tail * 0.46)} ${f2(bx + tail * 0.42)} ${f2(by + tail * 0.24)}C${f2(bx + tail * 0.25)} ${f2(by + 9)} ${f2(bx + 4)} ${f2(by + 7)} ${f2(bx)} ${f2(by + 6)}Z`;
      pen.form(tg, fin, finTone, { weight: 0.5, size: tail * 0.3, attrs: { opacity: 0.9 } });
      for (let k = 0;k < 5; k++)
        pen.patch(tg, `M${f2(bx + 2)} ${f2(by)}Q${f2(bx + tail * 0.5)} ${f2(by - tail * (0.42 - k * 0.18))} ${f2(bx + tail * 0.92)} ${f2(by - tail * (0.58 - k * 0.24))}`, "none", 0.65, { stroke: k % 2 ? mix2(ELEMENT2.water.light, "#FFFFFF", 0.3) : "#FFFFFF", "stroke-width": 0.8, "stroke-linecap": "round" });
      for (let [x, y, r] of [[bx + tail * 1.1, by - tail * 0.2, 1.9], [bx + tail * 0.96, by + tail * 0.52, 1.5], [bx + tail * 0.4, by - tail * 0.85, 1.3]])
        pen.form(tg, `M${f2(x)} ${f2(y - r * 1.6)}C${f2(x + r)} ${f2(y - r * 0.4)} ${f2(x + r)} ${f2(y + r)} ${f2(x)} ${f2(y + r)}C${f2(x - r)} ${f2(y + r)} ${f2(x - r)} ${f2(y - r * 0.4)} ${f2(x)} ${f2(y - r * 1.6)}Z`, finTone, { weight: 0.35, size: 1, flat: !0 });
      pen.form(g, `M${f2(cx - rx * 0.25)} ${f2(cy - ry * 0.9)}C${f2(cx + rx * 0.05)} ${f2(cy - ry * 1.5)} ${f2(cx + rx * 0.62)} ${f2(cy - ry * 1.38)} ${f2(cx + rx * 0.9)} ${f2(cy - ry * 0.55)}Z`, finTone, { weight: 0.5, size: 6, attrs: { opacity: 0.92 } });
      let bodyD = blob2([[cx - rx, cy + 1], [cx - rx * 0.74, cy - ry * 0.8], [cx, cy - ry], [cx + rx * 0.7, cy - ry * 0.68], [cx + rx * 1.02, cy - ry * 0.15], [cx + rx * 1.02, cy + ry * 0.2], [cx + rx * 0.65, cy + ry * 0.72], [cx, cy + ry * 0.98], [cx - rx * 0.76, cy + ry * 0.76]]);
      pen.form(g, bodyD, body, { size: rx, shadowOpacity: 0.36 });
      let inner = pen.g(g, { "clip-path": pen.clip(bodyD) });
      pen.patch(inner, ellipsePath2(cx - 2, cy + ry * 0.62, rx * 0.8, ry * 0.42), "#FFFFFF", 0.55);
      for (let row = 0;row < 3; row++)
        for (let k = 0;k < 4 - row; k++) {
          let x = cx + rx * (-0.05 + 0.24 * k + 0.12 * row), y = cy - ry * (0.62 - row * 0.26);
          pen.el("path", { d: `M${f2(x - 3)} ${f2(y)}q3 3.4 6 0`, fill: "none", stroke: INK2, "stroke-width": 0.6, opacity: 0.28 }, inner);
        }
      pen.glow(inner, cx + 2, cy + ry * 0.35, rx * 0.72, ELEMENT2.water.glow, 0.6);
      let spot = (x, y, r, c) => pen.patch(inner, blob2(Array.from({ length: 7 }, (_, i) => {
        let a = i / 7 * Math.PI * 2;
        return [x + Math.cos(a) * r * (0.82 + 0.3 * rand()), y + Math.sin(a) * r * 0.78 * (0.82 + 0.3 * rand())];
      })), c, 0.82);
      if (pattern === 0)
        spot(cx + rx * 0.35, cy - ry * 0.55, rx * 0.42, patchA), spot(cx - rx * 0.45, cy - ry * 0.75, rx * 0.26, patchB);
      else if (pattern === 1)
        spot(cx - 1, cy - ry * 0.88, rx * 0.24, patchB);
      else
        for (let k = 0;k < 5; k++)
          spot(cx + rx * (-0.55 + 1.25 * rand()), cy - ry * (0.15 + 0.65 * rand()), rx * (0.1 + 0.08 * rand()), k % 2 ? patchA : patchB);
      for (let side of [-1, 1])
        pen.form(pen.g(g, { transform: `translate(${f2(cx + side * rx * 0.55)} ${f2(cy + ry * 0.45)})` }), `M0 0c${f2(side * 6)} ${f2(2)} ${f2(side * 12)} ${f2(8)} ${f2(side * 11)} ${f2(14)}c${f2(-side * 5)} ${f2(-1)} ${f2(-side * 10)} ${f2(-5)} ${f2(-side * 11)} ${f2(-14)}Z`, finTone, { weight: 0.45, size: 4, attrs: { opacity: 0.9, class: `cr-wing cr-wing-${side < 0 ? "l" : "r"}` } });
      let anchor = pen.g(g, { transform: `translate(${f2(cx - 2)} ${f2(cy - 1)})` }), head = pen.g(anchor, { class: "portrait__head" }), r = Math.max(rx, ry) * 0.88;
      for (let side of [-1, 1])
        pen.stroke(head, `M${f2(side * r * 0.2)} ${f2(r * 0.48)}q${f2(side * 4)} ${f2(3)} ${f2(side * 3)} ${f2(7)}q${f2(-side * 1)} ${f2(2)} ${f2(side * 1.5)} ${f2(3)}`, pen.lw * 0.5, { opacity: 0.7 });
      drawFace2(pen, head, { ...faceFrom2(u, r), kind: "fish", cheeks: !0, delighted: s.delighted });
    } };
  }
  function fox2(d) {
    let u = d.u, bx = CENTER2 + 8, rx = 26 + 4 * u[1], ry = 15 + 3 * u[0], by = FOOT2 - 4 - ry, R = (21 + 4 * u[3]) * d.head, headX = CENTER2 - 8, headY = by - 9 - R * 0.45, earL = R * (0.72 + 0.3 * u[5]), spread = 14 + 10 * u[6], lanterns = 1 + Math.floor(u[12] * 3), coatC = pick2([[0.66, 0.12, 46], [0.74, 0.12, 70], [0.72, 0.02, 60], [0.56, 0.12, 32]], u[14]), coat = own2(coatC[0] + 0.05 * (u[13] - 0.5), coatC[1], coatC[2], 0.14), cream = toneOf2("#F4E7D2"), socks = u[11] > 0.5, ash = toneOf2(socks ? mix2(coat.shadow, "#4A3C3A", 0.55) : "#A9A39C", "#3E4F63"), tipX = bx + rx + 10, tipY = by - ry - 20;
    return { geo: { top: Math.min(headY - R - earL * Math.cos(spread * Math.PI / 180) - 2, tipY - 30), left: headX - R - 6, right: tipX + 14, headX, headY, headR: R, hover: 0 }, draw(pen, g, s) {
      let tail = pen.g(g, { class: "cr-tail" }), brush = blob2([[bx + rx * 0.6, by + ry * 0.4], [bx + rx + 6, by + ry * 0.1], [tipX + 6, by - ry * 0.9], [tipX + 2, tipY], [tipX - 8, tipY + 3], [bx + rx * 0.62, by - ry * 0.55], [bx + rx * 0.35, by]], 0.9);
      pen.form(tail, brush, coat, { size: 12, grain: !0 }), pen.patch(tail, blob2([[tipX - 9, tipY + 4], [tipX + 2, tipY - 1], [tipX + 6, tipY + 7], [tipX - 3, tipY + 9]]), cream.base, 0.95);
      for (let i = 0;i < lanterns; i++)
        flame2(pen, tail, tipX - 5 + (i - (lanterns - 1) / 2) * 9, tipY - 9 - i % 2 * 6, 6 + (i === 1 ? 1 : 0), `cr-lantern cr-lantern-${i}`);
      pen.form(g, blob2([[bx - rx, by + ry * 0.3], [bx - rx * 0.6, by - ry * 0.95], [bx + rx * 0.3, by - ry], [bx + rx, by - ry * 0.1], [bx + rx * 0.85, by + ry * 0.85], [bx - rx * 0.4, by + ry * 0.95]]), coat, { size: rx * 0.7, grain: !0 }), pen.form(g, ellipsePath2(bx + rx * 0.62, FOOT2 - 3.4, 7, 4.2), ash, { weight: 0.7, size: 5 });
      for (let x of [headX - 7, headX + 9])
        pen.form(g, ellipsePath2(x, FOOT2 - 3.2, 7, 4.4), ash, { weight: 0.75, size: 5 });
      let anchor = pen.g(g, { transform: `translate(${f2(headX)} ${f2(headY)})` }), head = pen.g(anchor, { class: "portrait__head" });
      for (let side of [-1, 1])
        ear2(pen, head, side, [side * R * 0.55, -R * 0.62], spread, pointEar2(R * 0.38, earL), coat, mix2("#F6E2CF", coat.base, 0.15), R * 0.3);
      let ruff = blob2([[-R * 1.18, R * 0.25], [-R * 0.8, -R * 0.1], [0, R * 0.1], [R * 0.8, -R * 0.1], [R * 1.18, R * 0.25], [R * 0.75, R * 0.85], [0, R * 1], [-R * 0.75, R * 0.85]]);
      pen.form(head, ellipsePath2(0, 0, R, R * 0.94), coat, { size: R, grain: !0 }), pen.form(head, ruff, cream, { size: R * 0.7, weight: 0.7 });
      for (let [x, y, a] of [[-1.05, 0.35, -40], [-0.95, 0.55, -20], [1.05, 0.35, 40], [0.95, 0.6, 25]])
        pen.stroke(head, `M${f2(x * R)} ${f2(y * R)}l${f2(Math.sin(a * Math.PI / 180) * 6)} ${f2(-Math.cos(a * Math.PI / 180) * 6)}`, pen.lw * 0.45, { stroke: "#C9A24A" });
      let blaze = Math.floor(u[2] * 3);
      if (blaze === 0)
        pen.patch(head, `M0 ${f2(-R * 0.86)}Q${f2(R * 0.2)} ${f2(-R * 0.6)} 0 ${f2(-R * 0.2)}Q${f2(-R * 0.18)} ${f2(-R * 0.56)} 0 ${f2(-R * 0.86)}Z`, cream.base, 0.94);
      else if (blaze === 1)
        for (let side of [-1, 1])
          pen.patch(head, ellipsePath2(side * R * 0.45, -R * 0.56, R * 0.16, R * 0.1), cream.base, 0.95);
      else
        pen.patch(head, `M${f2(-R * 0.26)} ${f2(-R * 0.72)}Q0 ${f2(-R * 0.34)} ${f2(R * 0.26)} ${f2(-R * 0.72)}L0 ${f2(-R * 0.02)}Z`, cream.base, 0.94);
      drawFace2(pen, head, { ...faceFrom2(u, R), kind: "mammal", cheeks: !0, delighted: s.delighted });
    } };
  }
  function phoenix2(d) {
    let u = d.u, hover = 14 + 6 * u[11], R = (24 + 4 * u[0]) * (0.5 + d.head / 2), cy = FOOT2 - hover - R - 5, crownKind = Math.floor(u[2] * 3), plumeC = pick2([[0.64, 0.12, 50], [0.74, 0.12, 74], [0.68, 0.03, 62], [0.58, 0.12, 30]], u[14]), plume = own2(plumeC[0] + 0.05 * (u[13] - 0.5), plumeC[1], plumeC[2], 0.12), belly = toneOf2(mix2(ELEMENT2.fire.soft, CREAM2, 0.3)), leafTones = [toneOf2(mix2("#C7652F", CREAM2, 0.12)), toneOf2(mix2("#D9A04A", CREAM2, 0.12)), toneOf2(mix2("#B35A3A", CREAM2, 0.16))], wingL = R * (0.84 + 0.24 * u[5]);
    return { geo: { top: Math.min(cy - R - 17, cy - wingL * 0.95), left: CENTER2 - R - wingL * 0.6, right: CENTER2 + R + 26, headX: CENTER2, headY: cy - R * 0.1, headR: R * 0.9, hover }, draw(pen, g, s) {
      let rand = stream2(d.seed), fold = s.asleep ? 0.55 : 1, tail = pen.g(g, { class: "cr-tail" });
      for (let k = 0;k < 3; k++) {
        let x0 = CENTER2 + R * 0.55, y0 = cy + R * 0.55, x1 = x0 + 16 + k * 3, y1 = y0 + 6 + k * 6;
        pen.form(tail, `M${f2(x0)} ${f2(y0 - 2)}Q${f2(x1 - 4)} ${f2(y1 - 8)} ${f2(x1)} ${f2(y1)}Q${f2(x1 - 9)} ${f2(y1 - 2)} ${f2(x0)} ${f2(y0 + 2)}Z`, leafTones[k], { weight: 0.5, size: 4 }), pen.glow(tail, x1 + 1.5, y1 + 1, 5, ELEMENT2.fire.glow, 0.65), pen.el("circle", { cx: x1 + 1.5, cy: y1 + 1, r: 1.7, fill: ELEMENT2.fire.light, stroke: INK2, "stroke-width": pen.lw * 0.3 }, tail);
      }
      for (let side of [-1, 1]) {
        let wg = wingAt(pen, g, `translate(${f2(CENTER2 + side * R * 0.7)} ${f2(cy + R * 0.1)}) rotate(${side * (s.asleep ? 80 : 42)})`, side, fold), L = wingL, leaf = `M0 0C${f2(L * 0.28)} ${f2(-L * 0.4)} ${f2(L * 0.62)} ${f2(-L * 0.8)} ${f2(L * 0.38)} ${f2(-L * 1.05)}C${f2(L * 0.3)} ${f2(-L * 0.9)} ${f2(L * 0.12)} ${f2(-L * 0.95)} ${f2(L * 0.02)} ${f2(-L * 0.82)}C${f2(-L * 0.12)} ${f2(-L * 0.85)} ${f2(-L * 0.35)} ${f2(-L * 0.7)} ${f2(-L * 0.25)} ${f2(-L * 0.5)}C${f2(-L * 0.42)} ${f2(-L * 0.42)} ${f2(-L * 0.4)} ${f2(-L * 0.18)} ${f2(-L * 0.18)} ${f2(-L * 0.05)}Z`;
        pen.el("path", { d: leaf, fill: "none", stroke: ELEMENT2.fire.light, "stroke-width": 4.5, opacity: 0.6 }, wg), pen.form(wg, leaf, leafTones[(1 + (side > 0 ? 1 : 0) + Math.floor(u[13] * 2)) % 3], { size: L * 0.4, weight: 0.75, grain: !0 }), pen.stroke(wg, `M${f2(L * 0.02)} ${f2(-L * 0.05)}L${f2(L * 0.22)} ${f2(-L * 0.85)}`, pen.lw * 0.45, { opacity: 0.55 });
        for (let k = 0;k < 3; k++)
          pen.stroke(wg, `M${f2(L * (0.07 + k * 0.05))} ${f2(-L * (0.25 + k * 0.2))}l${f2(L * 0.2)} ${f2(-L * 0.08)}M${f2(L * (0.07 + k * 0.05))} ${f2(-L * (0.25 + k * 0.2))}l${f2(-L * 0.18)} ${f2(-L * 0.12)}`, pen.lw * 0.32, { opacity: 0.45 });
      }
      let bodyD = blob2([[CENTER2, cy - R], [CENTER2 + R * 0.85, cy - R * 0.5], [CENTER2 + R * 1.02, cy + R * 0.25], [CENTER2 + R * 0.6, cy + R * 0.92], [CENTER2, cy + R * 1.02], [CENTER2 - R * 0.6, cy + R * 0.92], [CENTER2 - R * 1.02, cy + R * 0.25], [CENTER2 - R * 0.85, cy - R * 0.5]]);
      pen.form(g, bodyD, plume, { size: R, grain: !0 });
      let skirt = pen.g(g, { "clip-path": pen.clip(bodyD) });
      for (let k = 0;k < 8; k++) {
        let a = Math.PI * (0.1 + 0.8 * k / 7), x = CENTER2 + Math.cos(a) * R * 0.95, y = cy + Math.sin(a) * R * 0.85;
        pen.form(skirt, ellipsePath2(x, y, 8.5, 5.5), leafTones[(k + Math.floor(rand() * 3)) % 3], { weight: 0.45, size: 4, attrs: { transform: `rotate(${f2(a * 180 / Math.PI - 90)} ${f2(x)} ${f2(y)})` } });
      }
      pen.patch(g, ellipsePath2(CENTER2, cy + R * 0.32, R * 0.55, R * 0.5), belly.base, 0.92), pen.glow(g, CENTER2, cy + R * 0.25, R * 0.48, ELEMENT2.fire.glow, 0.5);
      for (let side of [-1, 1])
        pen.stroke(g, `M${f2(CENTER2 + side * 6)} ${f2(cy + R * 0.98)}l0 4.5m0 0l-2 2m2 -2l2 2`, pen.lw * 0.55, { stroke: "#7E7369" });
      let crown = pen.g(g);
      if (crownKind === 0)
        for (let dx of [-0.32, 0, 0.32]) {
          let x = CENTER2 + dx * R, y = cy - R * (dx === 0 ? 1.18 : 1.05);
          pen.stroke(crown, `M${f2(CENTER2 + dx * R * 0.6)} ${f2(cy - R * 0.88)}L${f2(x)} ${f2(y + 2)}`, pen.lw * 0.6, { stroke: "#6B4A35" }), pen.glow(crown, x, y, 5, ELEMENT2.fire.glow, 0.55), pen.form(crown, ellipsePath2(x, y, 3.2, 4), toneOf2("#8E5A3A"), { weight: 0.5, size: 2.5 }), pen.patch(crown, ellipsePath2(x, y + 1.6, 1.6, 1), ELEMENT2.fire.light, 0.95);
        }
      else if (crownKind === 1)
        flame2(pen, crown, CENTER2 + 1, cy - R * 0.9, 7);
      else
        for (let a of [-28, 0, 26])
          oakLeaf2(pen, crown, CENTER2 + a * 0.12, cy - R * 0.9, 10, a, leafTones[a === 0 ? 0 : 1]);
      let anchor = pen.g(g, { transform: `translate(${CENTER2} ${f2(cy - R * 0.1)})` }), head = pen.g(anchor, { class: "portrait__head" });
      drawFace2(pen, head, { ...faceFrom2(u, R * 0.9), kind: "bird", cheeks: !0, delighted: s.delighted, beakTone: toneOf2("#E8A65A") });
    } };
  }
  function lemur2(d) {
    let u = d.u, hover = 17 + 6 * u[11], by = FOOT2 - hover - 20, R = (20 + 4 * u[3]) * d.head, headY = by - 16 - R * 0.55, reach = 32 + 8 * u[1], fernEars = u[5] > 0.45, furC = pick2([[0.78, 0.02, 290], [0.84, 0.03, 75], [0.7, 0.025, 250]], u[14]), fur = own2(furC[0] + 0.05 * (u[13] - 0.5), furC[1], furC[2], 0.16), belly = toneOf2(mix2(CREAM2, "#FFFFFF", 0.3)), tint = pick2([ELEMENT2.air.soft, "#EDF3F7", "#F5EFE3"], u[12]), membrane = { light: mix2(tint, "#FFFFFF", 0.5), base: mix2(tint, ELEMENT2.air.light, 0.18), shadow: mix2(ELEMENT2.air.light, "#8C92B0", 0.4) };
    return { geo: { top: headY - R - (fernEars ? R * 0.95 : R * 0.6), left: CENTER2 - reach - 5, right: CENTER2 + Math.max(reach, 44) + 6, headX: CENTER2, headY, headR: R, hover }, draw(pen, g, s) {
      let fold = s.asleep ? 0.55 : 1, tail = pen.g(g, { class: "cr-tail" }), pts = [[CENTER2 + 6, by + 14], [CENTER2 + 20, by + 22], [CENTER2 + 36, by + 16], [CENTER2 + 40, by + 2]];
      pen.stroke(tail, curve2(pts), 7, { stroke: INK2, filter: null }), pen.stroke(tail, curve2(pts), 5.2, { stroke: fur.base, filter: null }), pen.stroke(tail, curve2(pts), 5.2, { stroke: fur.shadow, filter: null, "stroke-dasharray": "3.4 4", "stroke-linecap": "butt" }), wisp2(pen, tail, CENTER2 + 38, by + 1, 9, { light: "#FFFFFF", base: "#F7F4FA", shadow: membrane.shadow });
      for (let side of [-1, 1]) {
        let wg = wingAt(pen, g, `translate(${CENTER2} ${f2(by)})`, side, fold), wing = `M6 -16C${f2(reach * 0.45)} -23 ${f2(reach * 0.85)} -25 ${f2(reach)} -19C${f2(reach * 1.05)} -7 ${f2(reach * 0.92)} 2 ${f2(reach * 0.78)} 6C${f2(reach * 0.62)} 12 ${f2(reach * 0.4)} 10 ${f2(reach * 0.28)} 17C${f2(reach * 0.2)} 18 10 15 6 10Z`;
        pen.form(wg, wing, membrane, { size: 14, weight: 0.6, shadowOpacity: 0.35, attrs: { opacity: 0.9 } });
        for (let k = 0;k < 4; k++)
          pen.stroke(wg, `M8 ${f2(-8 + k * 3)}Q${f2(reach * 0.45)} ${f2(-14 + k * 6)} ${f2(reach * (0.95 - k * 0.12))} ${f2(-14 + k * 6.5)}`, pen.lw * 0.3, { opacity: 0.3 });
        for (let k = 0;k < 6; k++) {
          let t = k / 5, x = reach * (0.99 - t * 0.62), y = -17 + t * 31;
          pen.el("circle", { cx: f2(x), cy: f2(y), r: 1.35, fill: "#FFFFFF", stroke: INK2, "stroke-width": 0.35, opacity: 0.9 }, wg);
        }
        pen.stroke(wg, `M8 -15Q${f2(reach * 0.5)} -22 ${f2(reach)} -19`, pen.lw * 0.9, { stroke: fur.shadow }), pen.form(wg, ellipsePath2(reach, -19, 2.6, 2.2), fur, { weight: 0.45, size: 2 });
      }
      pen.form(g, ellipsePath2(CENTER2, by, 15, 18), fur, { size: 15, grain: !0 }), pen.patch(g, ellipsePath2(CENTER2, by + 3, 9, 12), belly.base, 0.9);
      for (let side of [-1, 1])
        pen.form(g, ellipsePath2(CENTER2 + side * 7, by + 18, 3.6, 2.8), fur, { weight: 0.5, size: 2.5 });
      let anchor = pen.g(g, { transform: `translate(${CENTER2} ${f2(headY)})` }), head = pen.g(anchor, { class: "portrait__head" });
      if (fernEars)
        for (let side of [-1, 1]) {
          let shape = `M${f2(-R * 0.22)} 0C${f2(-R * 0.32)} ${f2(-R * 0.45)} ${f2(-R * 0.15)} ${f2(-R * 0.85)} ${f2(R * 0.12)} ${f2(-R * 0.95)}C${f2(R * 0.4)} ${f2(-R * 1)} ${f2(R * 0.42)} ${f2(-R * 0.72)} ${f2(R * 0.2)} ${f2(-R * 0.7)}C${f2(R * 0.08)} ${f2(-R * 0.68)} ${f2(R * 0.1)} ${f2(-R * 0.8)} ${f2(R * 0.18)} ${f2(-R * 0.8)}C${f2(R * 0.12)} ${f2(-R * 0.6)} ${f2(R * 0.28)} ${f2(-R * 0.3)} ${f2(R * 0.22)} 0Z`, e = ear2(pen, head, side, [side * R * 0.62, -R * 0.6], 58, shape, toneOf2(mix2(fur.base, ELEMENT2.earth.light, 0.35)), mix2(ELEMENT2.earth.soft, fur.base, 0.3), R * 0.25);
          for (let k = 1;k <= 3; k++)
            pen.stroke(side < 0 ? pen.g(e, { transform: "scale(-1 1)" }) : e, `M${f2(R * 0.02)} ${f2(-R * k * 0.2)}l${f2(R * 0.14)} ${f2(-R * 0.05)}`, pen.lw * 0.4, { opacity: 0.55 });
        }
      else
        for (let side of [-1, 1])
          ear2(pen, head, side, [side * R * 0.7, -R * 0.45], 48, roundEar2(R * 0.42, R * 0.6), fur, mix2(ELEMENT2.air.light, fur.base, 0.3), R * 0.3);
      pen.form(head, ellipsePath2(0, 0, R, R * 0.95), fur, { size: R, grain: !0 }), pen.patch(head, ellipsePath2(0, R * 0.32, R * 0.62, R * 0.45), belly.base, 0.88);
      for (let side of [-1, 1])
        pen.glow(head, side * R * (0.4 + 0.12 * u[8]), R * (-0.04 + 0.12 * (0.5 - u[9])), R * 0.5, ELEMENT2.air.glow, 0.6);
      drawFace2(pen, head, { ...faceFrom2(u, R), kind: "mammal", cheeks: u[2] > 0.4 || s.delighted, delighted: s.delighted, noseTone: "#7A6470" });
    } };
  }
  function lamb2(d) {
    let u = d.u, hover = 14 + 6 * u[11], rx = 29 + 4 * u[1], ry = 19 + 3 * u[0], cy = FOOT2 - hover - ry - 4, R = (15 + 3 * u[3]) * d.head, woolC = pick2(["#F6F2F7", "#F7EAEA", "#ECE6F4", "#E8EFF6"], u[14]), wool = { light: "#FFFFFF", base: mix2(woolC, ELEMENT2.air.soft, 0.2), shadow: mix2(ELEMENT2.air.light, "#9AA4C2", 0.45) }, face = toneOf2(u[13] > 0.72 ? mix2("#8C7468", CREAM2, 0.2) : mix2("#F3D9C6", CREAM2, 0.35)), rand = stream2(d.seed), puffs = [[0, 0, 1]], count = 7 + Math.floor(u[12] * 3);
    for (let k = 0;k < count; k++) {
      let a = Math.PI * (1.05 + 0.9 * k / (count - 1)) + (rand() - 0.5) * 0.25;
      puffs.push([Math.cos(a) * rx * 0.72, Math.sin(a) * ry * 0.7, 0.36 + 0.14 * rand()]);
    }
    puffs.push([-rx * 0.62, ry * 0.35, 0.36], [rx * 0.6, ry * 0.32, 0.38]);
    let reach = (a) => Math.max(...puffs.map(([px, py, k]) => {
      let pr = k === 1 ? 0 : k * rx, dx = Math.cos(a), dy = Math.sin(a);
      if (k === 1)
        return 1 / Math.sqrt((dx / rx) ** 2 + (dy / ry) ** 2);
      let b = px * dx + py * dy, c = px * px + py * py - pr * pr, disc = b * b - c;
      return disc < 0 ? 0 : b + Math.sqrt(disc);
    })), outline = Array.from({ length: 64 }, (_, i) => {
      let a = i / 64 * Math.PI * 2, r = reach(a);
      return [CENTER2 + Math.cos(a) * r, cy + Math.sin(a) * r];
    });
    return { geo: { top: Math.min(...outline.map((p) => p[1])) - 3, left: Math.min(...outline.map((p) => p[0])) - 3, right: Math.max(...outline.map((p) => p[0])) + 10, headX: CENTER2 - 2, headY: cy + 3, headR: R * 1.1, hover }, draw(pen, g, s) {
      for (let x of [-rx * 0.5, -rx * 0.18, rx * 0.18, rx * 0.5])
        pen.stroke(g, `M${f2(CENTER2 + x)} ${f2(cy + ry * 0.75)}l0 6`, 2.6, { stroke: mix2(wool.shadow, INK2, 0.2) }), pen.form(g, ellipsePath2(CENTER2 + x, cy + ry * 0.75 + 7, 2.6, 2.1), toneOf2("#5E5260"), { weight: 0.4, size: 2 });
      let cloud = blob2(outline, 1);
      pen.form(g, cloud, wool, { size: rx * 0.55, shadowOpacity: 0.55 });
      let inner = pen.g(g, { "clip-path": pen.clip(cloud) });
      for (let [px, py, k] of puffs.slice(1, -2))
        pen.el("path", { d: `M${f2(CENTER2 + px - k * rx * 0.7)} ${f2(cy + py + k * rx * 0.4)}a${f2(k * rx * 0.75)} ${f2(k * rx * 0.75)} 0 0 1 ${f2(k * rx * 1.3)} ${f2(-k * rx * 0.2)}`, fill: "none", stroke: wool.shadow, "stroke-width": 0.9, opacity: 0.45 }, inner);
      for (let k = 0;k < 3; k++) {
        let x = CENTER2 + rx * (-0.6 + 1.2 * rand()), y = cy - ry * (0.2 + 0.4 * rand());
        pen.stroke(g, `M${f2(x - 2)} ${f2(y)}l4 0M${f2(x)} ${f2(y - 2)}l0 4M${f2(x - 1.4)} ${f2(y - 1.4)}l2.8 2.8`, 0.6, { opacity: 0.55, stroke: mix2(ELEMENT2.air.base, INK2, 0.3) });
      }
      let tail = pen.g(g, { class: "cr-tail" });
      wisp2(pen, tail, CENTER2 + rx * 0.98, cy - ry * 0.1, 8, wool), wisp2(pen, tail, CENTER2 + rx * 0.9, cy + ry * 0.38, 6, wool);
      let anchor = pen.g(g, { transform: `translate(${f2(CENTER2 - 2)} ${f2(cy + 3)})` }), head = pen.g(anchor, { class: "portrait__head" });
      if (u[2] > 0.62)
        for (let side of [-1, 1]) {
          let horn = pen.g(head, { transform: `translate(${f2(side * R * 0.74)} ${f2(-R * 0.62)}) scale(${side} 1)` });
          pen.stroke(horn, "M0 0q-8 -7 -4 -11q7 -3 9 3q1 5 -4 5", 4.3, { stroke: INK2 }), pen.stroke(horn, "M0 0q-8 -7 -4 -11q7 -3 9 3q1 5 -4 5", 2.8, { stroke: "#D9C5AD" });
        }
      for (let side of [-1, 1])
        ear2(pen, head, side, [side * R * 0.82, -R * 0.42], 105, `M${f2(-R * 0.22)} 0C${f2(-R * 0.3)} ${f2(-R * 0.4)} ${f2(-R * 0.12)} ${f2(-R * 0.75)} 0 ${f2(-R * 0.78)}C${f2(R * 0.14)} ${f2(-R * 0.75)} ${f2(R * 0.3)} ${f2(-R * 0.4)} ${f2(R * 0.22)} 0Z`, face, mix2(ELEMENT2.air.light, face.base, 0.4), R * 0.2);
      pen.form(head, ellipsePath2(0, 0, R * 0.9, R * 1), face, { size: R * 0.9 }), pen.patch(head, blob2([[-R * 0.75, -R * 0.55], [-R * 0.3, -R * 1.02], [R * 0.3, -R * 1.05], [R * 0.75, -R * 0.55], [R * 0.4, -R * 0.62], [0, -R * 0.5], [-R * 0.4, -R * 0.62]]), wool.base, 0.95), drawFace2(pen, head, { ...faceFrom2(u, R * 1.05), spread: 0.36 + 0.1 * u[8], kind: "lamb", cheeks: !0, delighted: s.delighted, noseTone: "#8A6D72" });
    } };
  }
  var BUILDERS2 = { squirrel: squirrel2, moth: moth2, turtle: turtle2, koi: koi2, fox: fox2, phoenix: phoenix2, lemur: lemur2, lamb: lamb2 };
  function gardenLayout2(d, fed = 0) {
    let sp = BUILDERS2[d.species](d), geo = sp.geo, grow = 1 + 0.2 * fed, fit = Math.min(1, (FOOT2 - 6) / ((FOOT2 - geo.top) * grow), 56 / ((CENTER2 - geo.left) * grow), 57 / ((geo.right - CENTER2) * grow)), scale = fit * grow, Y = (y) => (FOOT2 - (FOOT2 - y) * scale) / BOX_H2, X = (x) => (CENTER2 + (x - CENTER2) * scale) / 120;
    return { sp, fit, grow, extent: { top: Y(geo.top), left: X(geo.left), right: X(geo.right), headY: Y(geo.headY), headRadius: geo.headR * scale / 120, headX: X(geo.headX), hover: geo.hover * scale / BOX_H2 } };
  }
  function paintGarden2(document2, p, state = {}) {
    let d = gardenDraw2(p, state.finish), fed = state.fed ?? 0, { sp, fit, grow, extent } = gardenLayout2(d, fed), svg = document2.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", `0 0 120 ${BOX_H2}`), svg.setAttribute("class", `portrait portrait-v2 critter garden garden-refined finish-${d.finish} species-${d.species} element-${d.element}${FLIERS2.has(d.species) ? " flier" : ""}`), svg.dataset.direction = "garden-refined", svg.dataset.species = d.species, svg.dataset.element = d.element, svg.dataset.asleep = String(!!state.asleep), svg.dataset.size = String(state.size ?? "stage");
    for (let [k, v] of Object.entries(extent))
      svg.dataset[k === "headY" ? "hy" : k === "headRadius" ? "hr" : k] = v.toFixed(3);
    if (svg.style.setProperty("--d", `${(p.idlePhase * 5).toFixed(2)}s`), svg.style.setProperty("--cheeks", state.delighted ? "1" : "0"), svg.style.setProperty("--mouth", state.delighted ? "1" : "0"), typeof state.size === "number")
      svg.setAttribute("width", String(state.size)), svg.setAttribute("height", String(state.size * 1.25));
    if (state.decorative !== !1)
      svg.setAttribute("aria-hidden", "true");
    let painted = d.finish === "painted", pen = new Pen3(document2, svg, (painted ? 1.8 : 2.1) / Math.max(0.75, fit)), hover = sp.geo.hover;
    svg.style.setProperty("--garden-lift", `${state.asleep ? hover * 0.55 : 0}px`);
    let shadowW = (sp.geo.right - sp.geo.left) * 0.3 * fit * (hover ? 0.75 : 1);
    if (painted)
      pen.el("ellipse", { cx: CENTER2, cy: FOOT2 + 1.5, rx: f2(shadowW), ry: f2(hover ? 3.4 : 4.6), fill: pen.radial([[0, mix2(ELEMENT2[d.element].shadow, INK2, 0.45), hover ? 0.2 : 0.27], [1, INK2, 0]], 0.5, 0.5, 0.5), class: "portrait__shadow cr-shadow" }, svg);
    else
      pen.el("ellipse", { cx: CENTER2, cy: FOOT2 + 1.5, rx: f2(shadowW), ry: f2(hover ? 3.2 : 4.4), fill: INK2, opacity: hover ? 0.1 : 0.16, class: "portrait__shadow cr-shadow" }, svg);
    let fitG = pen.g(svg, { transform: fit < 1 ? `translate(${CENTER2} ${FOOT2}) scale(${fit.toFixed(4)}) translate(${-CENTER2} ${-FOOT2})` : null }), hoverG = pen.g(fitG, { class: "cr-hover", transform: hover !== sp.geo.hover ? `translate(0 ${f2(sp.geo.hover - hover)})` : null }), figure = pen.g(hoverG, { class: "portrait__figure" }), body = pen.g(figure, { transform: fed ? `translate(${CENTER2} ${FOOT2}) scale(${grow.toFixed(3)}) translate(${-CENTER2} ${-FOOT2})` : null });
    if (sp.draw(pen, body, { asleep: !1, delighted: !!state.delighted, fed }), state.holding && ["squirrel", "fox", "lemur"].includes(d.species)) {
      let x = sp.geo.headX, y = Math.min(FOOT2 - 11, sp.geo.headY + sp.geo.headR * 1.5), hands = pen.g(body, { class: "garden-held-crumb" });
      pen.form(hands, `M${f2(x - 5)} ${f2(y - 3)}l6 -2l5 4l-2 6l-7 1l-4 -4Z`, toneOf2("#D9A441"), { size: 5, weight: 0.7 });
      for (let side of [-1, 1])
        pen.form(hands, ellipsePath2(x + side * 6, y + 3, 3.8, 4.2), toneOf2(CREAM2), { size: 3, weight: 0.5 });
    }
    if (!state.decorative && state.name) {
      let title = document2.createElementNS("http://www.w3.org/2000/svg", "title");
      title.textContent = state.name, svg.prepend(title), svg.setAttribute("role", "img"), svg.removeAttribute("aria-hidden");
    }
    let head = [...svg.querySelectorAll(".portrait__head")], eyes = [...svg.querySelectorAll(".portrait__eye")], cheeks = [...svg.querySelectorAll(".portrait__cheek")], mouths = [...svg.querySelectorAll(".portrait__mouth")], calm = [...svg.querySelectorAll(".p-calm")], ears = [...svg.querySelectorAll(".portrait__ear")].map((node) => ({ node, base: parseFloat(node.style.getPropertyValue("--ear-base")) || 0, side: node.classList.contains("portrait__ear--l") ? 1 : -1 })), pupils = [...svg.querySelectorAll(".portrait__pupil")], eyeRadius = sp.geo.headR * (0.265 + 0.065 * d.u[7]), shadow = svg.querySelector(".portrait__shadow");
    return rememberPortrait(svg, { headRadius: sp.geo.headR, eyeRadius: sp.geo.headR * (0.265 + 0.065 * d.u[7]), applyRig: ({ rig, now, asleep, quiet }) => {
      let lift = asleep ? hover * 0.55 : quiet || !hover ? 0 : Math.sin(now / 2600 * Math.PI * 2 + p.idlePhase * Math.PI * 2) * 2.5;
      hoverG.style.transform = `translateY(${lift.toFixed(2)}px)`, figure.style.transform = `translateY(${-rig.liftY * UNIT}px) rotate(${rig.leanZ}deg) scale(${rig.scaleX},${rig.scaleY})`, shadow.style.transform = `scaleX(${rig.scaleX})`;
      for (let node of head)
        node.style.transform = `rotate(${rig.headTilt}deg)`;
      for (let node of eyes)
        node.style.scale = `1 ${rig.lids}`;
      for (let { node, base, side } of ears)
        node.style.transform = `rotate(${base + (side > 0 ? rig.earL : -rig.earR)}deg)`;
      for (let node of pupils)
        node.style.transform = `translate(${rig.pupilX * eyeRadius}px,${rig.pupilY * eyeRadius}px)`;
      for (let node of cheeks)
        node.style.scale = String(rig.cheeks);
      for (let node of mouths)
        node.style.opacity = String(rig.mouth);
      for (let node of calm)
        node.style.opacity = String(1 - rig.mouth);
    } }), svg;
  }

  // packages/app/src/game/styles.ts
  function faceCrop(size, headY, headX = 0.5, headRadius) {
    let scale = headRadius === void 0 ? 1.9 : Math.max(1.7, Math.min(3.2, 0.4 / headRadius)), width = size * scale, height = width * 150 / 120;
    return { "--face-size": `${size}px`, "--face-width": `${width}px`, "--face-top": `${size / 2 - headY * height}px`, "--face-left": `${size / 2 - headX * width}px` };
  }

  // node_modules/koota/dist/chunk-ZWIGMIL4.js
  var $internal = Symbol.for("koota.internal"), actionsId = 0;
  function createActions(initializer) {
    let id = actionsId++, actions = Object.assign((world) => {
      let ctx = world[$internal], instance = ctx.actionInstances[id];
      if (!instance) {
        if (instance = initializer(world), id >= ctx.actionInstances.length)
          ctx.actionInstances.length = id + 1;
        ctx.actionInstances[id] = instance;
      }
      return instance;
    }, {
      initializer
    });
    return Object.defineProperty(actions, "id", {
      value: id,
      writable: !1,
      enumerable: !0,
      configurable: !1
    }), actions;
  }
  var WORLD_ID_BITS = 4, GENERATION_BITS = 8, ENTITY_ID_BITS = 20, WORLD_ID_MASK = (1 << WORLD_ID_BITS) - 1, GENERATION_MASK = (1 << GENERATION_BITS) - 1, ENTITY_ID_MASK = (1 << ENTITY_ID_BITS) - 1, GENERATION_SHIFT = ENTITY_ID_BITS, WORLD_ID_SHIFT = GENERATION_SHIFT + GENERATION_BITS;
  function packEntity(worldId, generation, entityId) {
    return (worldId & WORLD_ID_MASK) << WORLD_ID_SHIFT | (generation & GENERATION_MASK) << GENERATION_SHIFT | entityId & ENTITY_ID_MASK;
  }
  var incrementGeneration = (entity) => entity & ~(GENERATION_MASK << GENERATION_SHIFT) | ((entity >>> GENERATION_SHIFT & GENERATION_MASK) + 1 & GENERATION_MASK) << GENERATION_SHIFT;
  function shallowEqual(obj1, obj2) {
    return obj1 === obj2 || typeof obj1 === "object" && obj1 !== null && typeof obj2 === "object" && obj2 !== null && (() => {
      let keys1 = Object.keys(obj1), keys2 = Object.keys(obj2);
      return keys1.length === keys2.length && keys1.every((key) => Object.hasOwn(obj2, key) && obj1[key] === obj2[key]);
    })();
  }
  var $relationPair = Symbol.for("relationPair"), $relation = Symbol.for("relation"), $orderedTargetsTrait = Symbol.for("orderedTargetsTrait");
  function createWorldIndex() {
    return {
      worldCursor: 0,
      releasedWorldIds: [],
      maxWorlds: 2 ** WORLD_ID_BITS
    };
  }
  function allocateWorldId(index) {
    if (index.releasedWorldIds.length > 0)
      return index.releasedWorldIds.pop();
    if (index.worldCursor >= index.maxWorlds)
      throw Error(`Koota: Too many worlds created. The maximum is ${index.maxWorlds}.`);
    return index.worldCursor++;
  }
  function releaseWorldId(index, worldId) {
    if (worldId < 0 || worldId >= index.maxWorlds)
      throw Error(`Invalid world ID: ${worldId}`);
    if (worldId === index.worldCursor - 1)
      index.worldCursor--;
    else if (worldId < index.worldCursor && !index.releasedWorldIds.includes(worldId))
      index.releasedWorldIds.push(worldId);
  }
  var universe = {
    worlds: [],
    cachedQueries: /* @__PURE__ */ new Map,
    worldIndex: createWorldIndex(),
    reset: () => {
      universe.worlds = [], universe.cachedQueries = /* @__PURE__ */ new Map, universe.worldIndex = createWorldIndex();
    }
  }, $modifier = Symbol("modifier");
  function isTrackingModifier(modifier) {
    let {
      type
    } = modifier;
    return type.includes("added") || type.includes("removed") || type.includes("changed");
  }
  function getTrackingType(modifier) {
    let {
      type
    } = modifier;
    if (type.includes("added"))
      return "add";
    if (type.includes("removed"))
      return "remove";
    if (type.includes("changed"))
      return "change";
    return null;
  }
  function isOrWithModifiers(modifier) {
    return modifier.type === "or" && Array.isArray(modifier.modifiers);
  }
  var cursor = 3;
  function getTrackingCursor() {
    return cursor;
  }
  function setTrackingMasks(world, id) {
    let ctx = world[$internal], snapshot = structuredClone(ctx.entityMasks);
    ctx.trackingSnapshots.set(id, snapshot), ctx.dirtyMasks.set(id, snapshot.map((mask) => mask.map(() => 0))), ctx.changedMasks.set(id, snapshot.map((mask) => mask.map(() => 0)));
  }
  var $queryRef = Symbol.for("queryRef");
  function checkQuery(world, query, entity) {
    let { staticBitmasks, generations } = query, ctx = world[$internal], eid = entity & ENTITY_ID_MASK;
    if (query.traitInstances.all.length === 0)
      return !1;
    for (let i = 0;i < generations.length; i++) {
      let generationId = generations[i], bitmask = staticBitmasks[i];
      if (!bitmask)
        continue;
      let { required, forbidden, or } = bitmask, entityMask = ctx.entityMasks[generationId]?.[eid] || 0;
      if (!forbidden && !required && !or)
        return !1;
      if (forbidden && (entityMask & forbidden) !== 0)
        return !1;
      if (required && (entityMask & required) !== required)
        return !1;
      if (or !== 0 && (entityMask & or) === 0)
        return !1;
    }
    return !0;
  }
  function checkQueryWithRelations(world, query, entity) {
    if (!checkQuery(world, query, entity))
      return !1;
    if (query.relationFilters && query.relationFilters.length > 0)
      for (let pair of query.relationFilters) {
        if (pair.targetQueryMatches) {
          if (!hasRelationTargetInSet(world, pair.relation, entity, pair.targetQueryMatches))
            return !1;
          continue;
        }
        if (!hasRelationPair(world, entity, pair))
          return !1;
      }
    return !0;
  }
  function checkQueryTracking(world, query, entity, eventType, eventGenerationId, eventBitflag) {
    let { staticBitmasks, trackingGroups, generations } = query, traitInstancesAll = query.traitInstances.all, entityMasks = world[$internal].entityMasks, eid = entity & ENTITY_ID_MASK, generationsLen = generations.length, trackingGroupsLen = trackingGroups.length;
    if (traitInstancesAll.length === 0)
      return !1;
    for (let i = 0;i < generationsLen; i++) {
      let generationId = generations[i], bitmask = staticBitmasks[i];
      if (!bitmask)
        continue;
      let { required, forbidden, or } = bitmask, genMasks = entityMasks[generationId], entityMask = genMasks ? genMasks[eid] | 0 : 0;
      if (forbidden && (entityMask & forbidden) !== 0)
        return !1;
      if (required && (entityMask & required) !== required)
        return !1;
      if (or !== 0 && (entityMask & or) === 0)
        return !1;
    }
    let hasOrGroup = !1, anyOrMatched = !1;
    for (let i = 0;i < trackingGroupsLen; i++) {
      let group = trackingGroups[i], { type: groupType, logic: groupLogic, bitmasks: groupBitmasks } = group, groupBitmask = groupBitmasks[eventGenerationId];
      if (groupBitmask && groupBitmask & eventBitflag) {
        if (eventType === "remove") {
          if (groupType === "add" || groupType === "change")
            return !1;
        } else if (eventType === "add") {
          if (groupType === "remove" || groupType === "change")
            return !1;
        }
        if (groupType === eventType) {
          if (eventType === "change") {
            let genMasks = entityMasks[eventGenerationId];
            if (!((genMasks ? genMasks[eid] | 0 : 0) & eventBitflag))
              return !1;
          }
          let groupTrackers = group.trackers, trackerArr = groupTrackers[eventGenerationId];
          if (!trackerArr)
            trackerArr = [], groupTrackers[eventGenerationId] = trackerArr;
          trackerArr[eid] = trackerArr[eid] | 0 | eventBitflag;
        }
      }
      if (groupLogic === "or") {
        if (hasOrGroup = !0, !anyOrMatched) {
          let groupTrackers = group.trackers, bitmaskLen = groupBitmasks.length;
          for (let genId = 0;genId < bitmaskLen; genId++) {
            let mask = groupBitmasks[genId];
            if (!mask)
              continue;
            let trackerArr = groupTrackers[genId];
            if ((trackerArr ? trackerArr[eid] | 0 : 0) & mask) {
              anyOrMatched = !0;
              break;
            }
          }
        }
      } else {
        let groupTrackers = group.trackers, bitmaskLen = groupBitmasks.length;
        for (let genId = 0;genId < bitmaskLen; genId++) {
          let mask = groupBitmasks[genId];
          if (!mask)
            continue;
          let trackerArr = groupTrackers[genId];
          if (((trackerArr ? trackerArr[eid] | 0 : 0) & mask) !== mask)
            return !1;
        }
      }
    }
    if (hasOrGroup && !anyOrMatched)
      return !1;
    return !0;
  }
  function checkQueryTrackingWithRelations(world, query, entity, eventType, eventGenerationId, eventBitflag) {
    if (!checkQueryTracking(world, query, entity, eventType, eventGenerationId, eventBitflag))
      return !1;
    if (query.relationFilters && query.relationFilters.length > 0)
      for (let pair of query.relationFilters) {
        if (pair.targetQueryMatches) {
          if (!hasRelationTargetInSet(world, pair.relation, entity, pair.targetQueryMatches))
            return !1;
          continue;
        }
        if (!hasRelationPair(world, entity, pair))
          return !1;
      }
    return !0;
  }
  function setChanged(world, entity, trait2) {
    let result_markChanged_4_$f, ctx_4_$f = world[$internal];
    if (!hasTrait(world, entity, trait2))
      result_markChanged_4_$f = void 0;
    else {
      let traitId_1_$f_4_$f = trait2.id;
      if (!(traitId_1_$f_4_$f < ctx_4_$f.traitInstances.length && ctx_4_$f.traitInstances[traitId_1_$f_4_$f] !== void 0))
        registerTrait(world, trait2);
      let data_4_$f = ctx_4_$f.traitInstances[trait2.id], eid_4_$f = entity & ENTITY_ID_MASK, {
        generationId,
        bitflag
      } = data_4_$f;
      for (let changedMask_4_$f of ctx_4_$f.changedMasks.values()) {
        if (!changedMask_4_$f[generationId])
          changedMask_4_$f[generationId] = [];
        if (!changedMask_4_$f[generationId][eid_4_$f])
          changedMask_4_$f[generationId][eid_4_$f] = 0;
        changedMask_4_$f[generationId][eid_4_$f] |= bitflag;
      }
      for (let query_4_$f of data_4_$f.trackingQueries) {
        if (!query_4_$f.hasChangedModifiers)
          continue;
        if (!query_4_$f.changedTraits.has(trait2))
          continue;
        if (query_4_$f.relationFilters && query_4_$f.relationFilters.length > 0 ? checkQueryTrackingWithRelations(world, query_4_$f, entity, "change", generationId, bitflag) : query_4_$f.checkTracking(world, entity, "change", generationId, bitflag))
          query_4_$f.add(entity);
        else
          query_4_$f.remove(world, entity);
      }
      result_markChanged_4_$f = data_4_$f;
    }
    let data = result_markChanged_4_$f;
    if (!data)
      return;
    for (let sub of data.changeSubscriptions)
      sub(entity);
  }
  function setPairChanged(world, entity, trait2, target) {
    let result_markChanged_5_$f, ctx_5_$f = world[$internal];
    if (!hasTrait(world, entity, trait2))
      result_markChanged_5_$f = void 0;
    else {
      let traitId_1_$f_5_$f = trait2.id;
      if (!(traitId_1_$f_5_$f < ctx_5_$f.traitInstances.length && ctx_5_$f.traitInstances[traitId_1_$f_5_$f] !== void 0))
        registerTrait(world, trait2);
      let data_5_$f = ctx_5_$f.traitInstances[trait2.id], eid_5_$f = entity & ENTITY_ID_MASK, {
        generationId,
        bitflag
      } = data_5_$f;
      for (let changedMask_5_$f of ctx_5_$f.changedMasks.values()) {
        if (!changedMask_5_$f[generationId])
          changedMask_5_$f[generationId] = [];
        if (!changedMask_5_$f[generationId][eid_5_$f])
          changedMask_5_$f[generationId][eid_5_$f] = 0;
        changedMask_5_$f[generationId][eid_5_$f] |= bitflag;
      }
      for (let query_5_$f of data_5_$f.trackingQueries) {
        if (!query_5_$f.hasChangedModifiers)
          continue;
        if (!query_5_$f.changedTraits.has(trait2))
          continue;
        if (query_5_$f.relationFilters && query_5_$f.relationFilters.length > 0 ? checkQueryTrackingWithRelations(world, query_5_$f, entity, "change", generationId, bitflag) : query_5_$f.checkTracking(world, entity, "change", generationId, bitflag))
          query_5_$f.add(entity);
        else
          query_5_$f.remove(world, entity);
      }
      result_markChanged_5_$f = data_5_$f;
    }
    let data = result_markChanged_5_$f;
    if (!data)
      return;
    for (let sub of data.changeSubscriptions)
      sub(entity, target);
  }
  function setupOrderedTraitSync(world, orderedTrait) {
    let ctx = world[$internal], relationTrait = orderedTrait[$orderedTargetsTrait].relation[$internal].trait, orderedInstance = ctx.traitInstances[orderedTrait.id];
    if (!orderedInstance)
      return;
    let relationInstance = ctx.traitInstances[relationTrait.id];
    if (!relationInstance)
      registerTrait(world, relationTrait), relationInstance = ctx.traitInstances[relationTrait.id];
    let {
      generationId,
      bitflag,
      store
    } = orderedInstance, {
      entityMasks,
      entityIndex
    } = ctx, traitCtx = orderedTrait[$internal], getList = (parent) => {
      let eid = parent & ENTITY_ID_MASK;
      return entityMasks[generationId]?.[eid] & bitflag ? traitCtx.get(eid, store) : void 0;
    };
    relationInstance.addSubscriptions.add((child, parent) => {
      getList(parent)?._appendWithoutSync(child);
    }), relationInstance.removeSubscriptions.add((child, parent) => {
      let eid = parent & ENTITY_ID_MASK, denseIdx = entityIndex.sparse[eid];
      if (denseIdx !== void 0 && (entityIndex.dense[denseIdx] & ENTITY_ID_MASK) === eid)
        getList(parent)?._removeWithoutSync(child);
    });
  }
  var OrderedList = class extends Array {
    world;
    parent;
    relation;
    orderedTrait;
    _syncing = !1;
    constructor(world, parent, relation2, orderedTrait, items = []) {
      super(...items);
      this.world = world, this.parent = parent, this.relation = relation2, this.orderedTrait = orderedTrait;
    }
    get [Symbol.toStringTag]() {
      return "OrderedList";
    }
    push(...items) {
      this._syncing = !0;
      try {
        for (let item of items)
          addTrait(this.world, item, this.relation(this.parent));
        let result = super.push(...items);
        return setChanged(this.world, this.parent, this.orderedTrait), result;
      } finally {
        this._syncing = !1;
      }
    }
    pop() {
      this._syncing = !0;
      try {
        let item = super.pop();
        if (item !== void 0)
          removeTrait(this.world, item, this.relation(this.parent)), setChanged(this.world, this.parent, this.orderedTrait);
        return item;
      } finally {
        this._syncing = !1;
      }
    }
    shift() {
      this._syncing = !0;
      try {
        let item = super.shift();
        if (item !== void 0)
          removeTrait(this.world, item, this.relation(this.parent)), setChanged(this.world, this.parent, this.orderedTrait);
        return item;
      } finally {
        this._syncing = !1;
      }
    }
    unshift(...items) {
      this._syncing = !0;
      try {
        for (let item of items)
          addTrait(this.world, item, this.relation(this.parent));
        let result = super.unshift(...items);
        return setChanged(this.world, this.parent, this.orderedTrait), result;
      } finally {
        this._syncing = !1;
      }
    }
    splice(start, deleteCount, ...items) {
      this._syncing = !0;
      try {
        let removed = super.splice(start, deleteCount ?? 0, ...items);
        for (let item of removed)
          removeTrait(this.world, item, this.relation(this.parent));
        for (let item of items)
          addTrait(this.world, item, this.relation(this.parent));
        if (removed.length > 0 || items.length > 0)
          setChanged(this.world, this.parent, this.orderedTrait);
        return removed;
      } finally {
        this._syncing = !1;
      }
    }
    sort(compareFn) {
      return super.sort(compareFn), setChanged(this.world, this.parent, this.orderedTrait), this;
    }
    reverse() {
      return super.reverse(), setChanged(this.world, this.parent, this.orderedTrait), this;
    }
    map(callbackfn) {
      return Array.prototype.map.call(this, callbackfn);
    }
    filter(predicate) {
      return Array.prototype.filter.call(this, predicate);
    }
    slice(start, end) {
      return Array.prototype.slice.call(this, start, end);
    }
    moveTo(item, toIndex) {
      let fromIndex = this.indexOf(item);
      if (fromIndex === -1)
        throw Error("Item not found in OrderedList");
      if (fromIndex === toIndex)
        return;
      super.splice(fromIndex, 1), super.splice(toIndex, 0, item), setChanged(this.world, this.parent, this.orderedTrait);
    }
    insert(item, index) {
      this._syncing = !0;
      try {
        addTrait(this.world, item, this.relation(this.parent)), super.splice(index, 0, item), setChanged(this.world, this.parent, this.orderedTrait);
      } finally {
        this._syncing = !1;
      }
    }
    _appendWithoutSync(item) {
      if (!this._syncing)
        super.push(item), setChanged(this.world, this.parent, this.orderedTrait);
    }
    _removeWithoutSync(item) {
      if (!this._syncing) {
        let index = this.indexOf(item);
        if (index !== -1)
          super.splice(index, 1), setChanged(this.world, this.parent, this.orderedTrait);
      }
    }
  };
  function createStore(schema) {
    if (typeof schema === "function")
      return [];
    else {
      let store = {};
      for (let key in schema)
        store[key] = [];
      return store;
    }
  }
  function createSoASetFunction(schema) {
    let keys = Object.keys(schema);
    return (index, store, value) => {
      for (let i = 0;i < keys.length; i++) {
        let key = keys[i];
        if (key in value)
          store[key][index] = value[key];
      }
    };
  }
  function createSoAFastSetFunction(schema) {
    let keys = Object.keys(schema);
    return (index, store, value) => {
      for (let i = 0;i < keys.length; i++) {
        let key = keys[i];
        store[key][index] = value[key];
      }
    };
  }
  function createSoAFastSetChangeFunction(schema) {
    let keys = Object.keys(schema);
    return (index, store, value) => {
      let changed = !1;
      for (let i = 0;i < keys.length; i++) {
        let key = keys[i];
        if (store[key][index] !== value[key])
          store[key][index] = value[key], changed = !0;
      }
      return changed;
    };
  }
  function createSoAGetFunction(schema) {
    let keys = Object.keys(schema);
    return (index, store) => {
      let value = {};
      for (let i = 0;i < keys.length; i++) {
        let key = keys[i];
        value[key] = store[key][index];
      }
      return value;
    };
  }
  function createAoSSetFunction(_schema) {
    return (index, store, value) => {
      store[index] = value;
    };
  }
  function createAoSFastSetChangeFunction(_schema) {
    return (index, store, value) => {
      let changed = !1;
      if (value !== store[index])
        store[index] = value, changed = !0;
      return changed;
    };
  }
  function createAoSGetFunction(_schema) {
    return (index, store) => store[index];
  }
  var noop = () => {}, createTagNoop = () => noop, createSetFunction = {
    soa: createSoASetFunction,
    aos: createAoSSetFunction,
    tag: createTagNoop
  }, createFastSetFunction = {
    soa: createSoAFastSetFunction,
    aos: createAoSSetFunction,
    tag: createTagNoop
  }, createFastSetChangeFunction = {
    soa: createSoAFastSetChangeFunction,
    aos: createAoSFastSetChangeFunction,
    tag: createTagNoop
  }, createGetFunction = {
    soa: createSoAGetFunction,
    aos: createAoSGetFunction,
    tag: createTagNoop
  }, tagSchema = Object.freeze({}), traitId = 0;
  function createTrait(schema = tagSchema) {
    let isAoS = typeof schema === "function", isTag = !isAoS && Object.keys(schema).length === 0, traitType = isAoS ? "aos" : isTag ? "tag" : "soa";
    for (let key_0_$f in schema) {
      let value_0_$f = schema[key_0_$f];
      if (value_0_$f !== null && typeof value_0_$f === "object") {
        let kind_0_$f = Array.isArray(value_0_$f) ? "array" : "object";
        throw Error(`Koota: ${key_0_$f} is an ${kind_0_$f}, which is not supported in traits.`);
      }
    }
    let id = traitId++, Trait = Object.assign((params) => [Trait, params], {
      [$internal]: {
        id,
        set: createSetFunction[traitType](schema),
        fastSet: createFastSetFunction[traitType](schema),
        fastSetWithChangeDetection: createFastSetChangeFunction[traitType](schema),
        get: createGetFunction[traitType](schema),
        createStore: () => createStore(schema),
        relation: null,
        type: traitType
      }
    });
    return Object.defineProperty(Trait, "id", {
      value: id,
      writable: !1,
      enumerable: !0,
      configurable: !1
    }), Object.defineProperty(Trait, "schema", {
      value: schema,
      writable: !1,
      enumerable: !0,
      configurable: !1
    }), Trait;
  }
  var trait = createTrait;
  function registerTrait(world, trait2) {
    let ctx = world[$internal], traitCtx = trait2[$internal], data = {
      generationId: ctx.entityMasks.length - 1,
      bitflag: ctx.bitflag,
      trait: trait2,
      store: traitCtx.createStore(),
      queries: /* @__PURE__ */ new Set,
      trackingQueries: /* @__PURE__ */ new Set,
      notQueries: /* @__PURE__ */ new Set,
      relationQueries: /* @__PURE__ */ new Set,
      schema: trait2.schema,
      changeSubscriptions: /* @__PURE__ */ new Set,
      addSubscriptions: /* @__PURE__ */ new Set,
      removeSubscriptions: /* @__PURE__ */ new Set
    }, traitId_1_$f = trait2.id;
    if (traitId_1_$f >= ctx.traitInstances.length)
      ctx.traitInstances.length = traitId_1_$f + 1;
    if (ctx.traitInstances[traitId_1_$f] = data, world.traits.add(trait2), traitCtx.relation)
      ctx.relations.add(traitCtx.relation);
    let ctx_2_$f = world[$internal];
    if (ctx_2_$f.bitflag *= 2, ctx_2_$f.bitflag >= 2147483648)
      ctx_2_$f.bitflag = 1, ctx_2_$f.entityMasks.push([]);
    if ($orderedTargetsTrait in trait2)
      setupOrderedTraitSync(world, trait2);
  }
  function getOrderedTrait(world, entity, trait2) {
    let relation2 = trait2[$orderedTargetsTrait].relation;
    return new OrderedList(world, entity, relation2, trait2);
  }
  function addTrait(world, entity, ...traits) {
    for (let i = 0;i < traits.length; i++) {
      let config = traits[i];
      if (config?.[$relationPair]) {
        let result_addRelationPair_6_$f, { relation: relation_6_$f, target: target_6_$f } = config;
        if (typeof target_6_$f !== "number")
          result_addRelationPair_6_$f = void 0;
        else {
          let params_6_$f = config.params, relationCtx_6_$f = relation_6_$f[$internal], relationTrait_6_$f = relationCtx_6_$f.trait, result_hasRelationToTarget_7_$f, ctx_7_$f = world[$internal], relationCtx_7_$f = relation_6_$f[$internal], baseTrait_7_$f = relationCtx_7_$f.trait, traitData_7_$f = ctx_7_$f.traitInstances[baseTrait_7_$f.id];
          if (!traitData_7_$f || !traitData_7_$f.relationTargets)
            result_hasRelationToTarget_7_$f = !1;
          else {
            let eid_7_$f = entity & ENTITY_ID_MASK;
            if (relationCtx_7_$f.exclusive)
              result_hasRelationToTarget_7_$f = traitData_7_$f.relationTargets[eid_7_$f] === target_6_$f;
            else {
              let targets_7_$f = traitData_7_$f.relationTargets[eid_7_$f];
              result_hasRelationToTarget_7_$f = targets_7_$f ? targets_7_$f.includes(target_6_$f) : !1;
            }
          }
          if (result_hasRelationToTarget_7_$f)
            result_addRelationPair_6_$f = void 0;
          else {
            if (relationCtx_6_$f.exclusive) {
              let result_getFirstRelationTarget_8_$f, ctx_8_$f = world[$internal], relationCtx_8_$f = relation_6_$f[$internal], traitData_8_$f = ctx_8_$f.traitInstances[relationCtx_8_$f.trait.id];
              if (!traitData_8_$f || !traitData_8_$f.relationTargets)
                result_getFirstRelationTarget_8_$f = void 0;
              else {
                let eid_8_$f = entity & ENTITY_ID_MASK;
                if (relationCtx_8_$f.exclusive)
                  result_getFirstRelationTarget_8_$f = traitData_8_$f.relationTargets[eid_8_$f];
                else
                  result_getFirstRelationTarget_8_$f = traitData_8_$f.relationTargets[eid_8_$f]?.[0];
              }
              let oldTarget_6_$f = result_getFirstRelationTarget_8_$f;
              if (oldTarget_6_$f !== void 0 && oldTarget_6_$f !== target_6_$f) {
                let instance_6_$f2 = world[$internal].traitInstances[relationTrait_6_$f.id];
                if (instance_6_$f2)
                  for (let sub_6_$f of instance_6_$f2.removeSubscriptions)
                    sub_6_$f(entity, oldTarget_6_$f);
                removeRelationTarget(world, relation_6_$f, entity, oldTarget_6_$f);
              }
            }
            let result_addTraitToEntity_10_$f;
            if (hasTrait(world, entity, relationTrait_6_$f))
              result_addTraitToEntity_10_$f = void 0;
            else {
              let ctx_10_$f = world[$internal], traitId_14_$f = relationTrait_6_$f.id;
              if (!(traitId_14_$f < ctx_10_$f.traitInstances.length && ctx_10_$f.traitInstances[traitId_14_$f] !== void 0))
                registerTrait(world, relationTrait_6_$f);
              let instance_10_$f = ctx_10_$f.traitInstances[relationTrait_6_$f.id], {
                generationId,
                bitflag,
                queries,
                trackingQueries
              } = instance_10_$f, eid_10_$f = entity & ENTITY_ID_MASK;
              ctx_10_$f.entityMasks[generationId][eid_10_$f] |= bitflag;
              for (let dirtyMask_10_$f of ctx_10_$f.dirtyMasks.values()) {
                if (!dirtyMask_10_$f[generationId])
                  dirtyMask_10_$f[generationId] = [];
                dirtyMask_10_$f[generationId][eid_10_$f] |= bitflag;
              }
              for (let query_10_$f of queries)
                if (query_10_$f.toRemove.remove(entity), query_10_$f.relationFilters && query_10_$f.relationFilters.length > 0 ? checkQueryWithRelations(world, query_10_$f, entity) : query_10_$f.check(world, entity))
                  query_10_$f.add(entity);
                else
                  query_10_$f.remove(world, entity);
              for (let query_10_$f of trackingQueries)
                if (query_10_$f.toRemove.remove(entity), query_10_$f.relationFilters && query_10_$f.relationFilters.length > 0 ? checkQueryTrackingWithRelations(world, query_10_$f, entity, "add", generationId, bitflag) : query_10_$f.checkTracking(world, entity, "add", generationId, bitflag))
                  query_10_$f.add(entity);
                else
                  query_10_$f.remove(world, entity);
              ctx_10_$f.entityTraits.get(entity).add(relationTrait_6_$f), result_addTraitToEntity_10_$f = instance_10_$f;
            }
            let instance_6_$f = result_addTraitToEntity_10_$f, targetIndex_6_$f = addRelationTarget(world, relation_6_$f, entity, target_6_$f);
            if (targetIndex_6_$f === -1)
              result_addRelationPair_6_$f = void 0;
            else {
              let schema_6_$f = instance_6_$f?.schema_6_$f ?? world[$internal].traitInstances[relationTrait_6_$f.id].schema, result_getSchemaDefaults_12_$f;
              if (relationTrait_6_$f[$internal].type === "aos")
                result_getSchemaDefaults_12_$f = typeof schema_6_$f === "function" ? schema_6_$f() : null;
              else if (!schema_6_$f || typeof schema_6_$f === "function" || Object.keys(schema_6_$f).length === 0)
                result_getSchemaDefaults_12_$f = null;
              else {
                let defaults_12_$f = {};
                for (let key_12_$f in schema_6_$f)
                  if (typeof schema_6_$f[key_12_$f] === "function")
                    defaults_12_$f[key_12_$f] = schema_6_$f[key_12_$f]();
                  else
                    defaults_12_$f[key_12_$f] = schema_6_$f[key_12_$f];
                result_getSchemaDefaults_12_$f = defaults_12_$f;
              }
              let defaults_6_$f = result_getSchemaDefaults_12_$f;
              if (defaults_6_$f)
                setRelationDataAtIndex(world, entity, relation_6_$f, targetIndex_6_$f, {
                  ...defaults_6_$f,
                  ...params_6_$f
                });
              else if (params_6_$f)
                setRelationDataAtIndex(world, entity, relation_6_$f, targetIndex_6_$f, params_6_$f);
              instance_6_$f = instance_6_$f ?? world[$internal].traitInstances[relationTrait_6_$f.id];
              for (let sub_6_$f of instance_6_$f.addSubscriptions)
                sub_6_$f(entity, target_6_$f);
            }
          }
        }
        continue;
      }
      let trait2, params;
      if (Array.isArray(config))
        [trait2, params] = config;
      else
        trait2 = config;
      let result_addTraitToEntity_17_$f;
      if (hasTrait(world, entity, trait2))
        result_addTraitToEntity_17_$f = void 0;
      else {
        let ctx_17_$f = world[$internal], traitId_20_$f = trait2.id;
        if (!(traitId_20_$f < ctx_17_$f.traitInstances.length && ctx_17_$f.traitInstances[traitId_20_$f] !== void 0))
          registerTrait(world, trait2);
        let instance_17_$f = ctx_17_$f.traitInstances[trait2.id], {
          generationId,
          bitflag,
          queries,
          trackingQueries
        } = instance_17_$f, eid_17_$f = entity & ENTITY_ID_MASK;
        ctx_17_$f.entityMasks[generationId][eid_17_$f] |= bitflag;
        for (let dirtyMask_17_$f of ctx_17_$f.dirtyMasks.values()) {
          if (!dirtyMask_17_$f[generationId])
            dirtyMask_17_$f[generationId] = [];
          dirtyMask_17_$f[generationId][eid_17_$f] |= bitflag;
        }
        for (let query_17_$f of queries)
          if (query_17_$f.toRemove.remove(entity), query_17_$f.relationFilters && query_17_$f.relationFilters.length > 0 ? checkQueryWithRelations(world, query_17_$f, entity) : query_17_$f.check(world, entity))
            query_17_$f.add(entity);
          else
            query_17_$f.remove(world, entity);
        for (let query_17_$f of trackingQueries)
          if (query_17_$f.toRemove.remove(entity), query_17_$f.relationFilters && query_17_$f.relationFilters.length > 0 ? checkQueryTrackingWithRelations(world, query_17_$f, entity, "add", generationId, bitflag) : query_17_$f.checkTracking(world, entity, "add", generationId, bitflag))
            query_17_$f.add(entity);
          else
            query_17_$f.remove(world, entity);
        ctx_17_$f.entityTraits.get(entity).add(trait2), result_addTraitToEntity_17_$f = instance_17_$f;
      }
      let data = result_addTraitToEntity_17_$f;
      if (!data)
        continue;
      let traitCtx = trait2[$internal], result_getSchemaDefaults_19_$f;
      if (traitCtx.type === "aos")
        result_getSchemaDefaults_19_$f = typeof data.schema === "function" ? data.schema() : null;
      else if (!data.schema || typeof data.schema === "function" || Object.keys(data.schema).length === 0)
        result_getSchemaDefaults_19_$f = null;
      else {
        let defaults_19_$f = {};
        for (let key_19_$f in data.schema)
          if (typeof data.schema[key_19_$f] === "function")
            defaults_19_$f[key_19_$f] = data.schema[key_19_$f]();
          else
            defaults_19_$f[key_19_$f] = data.schema[key_19_$f];
        result_getSchemaDefaults_19_$f = defaults_19_$f;
      }
      let defaults = $orderedTargetsTrait in trait2 ? getOrderedTrait(world, entity, trait2) : result_getSchemaDefaults_19_$f;
      if (traitCtx.type === "aos")
        setTrait(world, entity, trait2, params ?? defaults, !1);
      else if (defaults)
        setTrait(world, entity, trait2, {
          ...defaults,
          ...params
        }, !1);
      else if (params)
        setTrait(world, entity, trait2, params, !1);
      for (let sub of data.addSubscriptions)
        sub(entity);
    }
  }
  function removeTrait(world, entity, ...traits) {
    for (let i = 0;i < traits.length; i++) {
      let trait2 = traits[i];
      if (trait2?.[$relationPair]) {
        let result_removeRelationPair_34_$f, { relation: relation_34_$f, target: target_34_$f } = trait2, relationTrait_34_$f = relation_34_$f[$internal].trait;
        if (!hasTrait(world, entity, relationTrait_34_$f))
          result_removeRelationPair_34_$f = void 0;
        else {
          let instance_34_$f = world[$internal].traitInstances[relationTrait_34_$f.id];
          if (target_34_$f === "*") {
            if (instance_34_$f) {
              let result_getRelationTargets_36_$f, ctx_36_$f = world[$internal], relationCtx_36_$f = relation_34_$f[$internal], traitData_36_$f = ctx_36_$f.traitInstances[relationCtx_36_$f.trait.id];
              if (!traitData_36_$f || !traitData_36_$f.relationTargets)
                result_getRelationTargets_36_$f = [];
              else {
                let eid_36_$f = entity & ENTITY_ID_MASK;
                if (relationCtx_36_$f.exclusive) {
                  let target_36_$f = traitData_36_$f.relationTargets[eid_36_$f];
                  result_getRelationTargets_36_$f = target_36_$f !== void 0 ? [target_36_$f] : [];
                } else {
                  let targets_36_$f = traitData_36_$f.relationTargets[eid_36_$f];
                  result_getRelationTargets_36_$f = targets_36_$f !== void 0 ? targets_36_$f.slice() : [];
                }
              }
              let targets_34_$f = result_getRelationTargets_36_$f;
              for (let t_34_$f of targets_34_$f)
                for (let sub_34_$f of instance_34_$f.removeSubscriptions)
                  sub_34_$f(entity, t_34_$f);
            }
            removeAllRelationTargets(world, relation_34_$f, entity), removeTraitFromEntity(world, entity, relationTrait_34_$f), result_removeRelationPair_34_$f = void 0;
          } else if (typeof target_34_$f === "number") {
            if (instance_34_$f)
              for (let sub_34_$f of instance_34_$f.removeSubscriptions)
                sub_34_$f(entity, target_34_$f);
            let {
              removedIndex,
              wasLastTarget
            } = removeRelationTarget(world, relation_34_$f, entity, target_34_$f);
            if (removedIndex === -1)
              result_removeRelationPair_34_$f = void 0;
            else if (wasLastTarget)
              removeTraitFromEntity(world, entity, relationTrait_34_$f);
          }
        }
        continue;
      }
      if (!hasTrait(world, entity, trait2))
        continue;
      let traitCtx = trait2[$internal];
      if (traitCtx.relation) {
        let instance = world[$internal].traitInstances[trait2.id];
        if (instance) {
          let result_getRelationTargets_38_$f, ctx_38_$f = world[$internal], relationCtx_38_$f = traitCtx.relation[$internal], traitData_38_$f = ctx_38_$f.traitInstances[relationCtx_38_$f.trait.id];
          if (!traitData_38_$f || !traitData_38_$f.relationTargets)
            result_getRelationTargets_38_$f = [];
          else {
            let eid_38_$f = entity & ENTITY_ID_MASK;
            if (relationCtx_38_$f.exclusive) {
              let target_38_$f = traitData_38_$f.relationTargets[eid_38_$f];
              result_getRelationTargets_38_$f = target_38_$f !== void 0 ? [target_38_$f] : [];
            } else {
              let targets_38_$f = traitData_38_$f.relationTargets[eid_38_$f];
              result_getRelationTargets_38_$f = targets_38_$f !== void 0 ? targets_38_$f.slice() : [];
            }
          }
          let targets = result_getRelationTargets_38_$f;
          for (let t of targets)
            for (let sub of instance.removeSubscriptions)
              sub(entity, t);
        }
        removeAllRelationTargets(world, traitCtx.relation, entity);
      } else {
        let instance = world[$internal].traitInstances[trait2.id];
        if (instance)
          for (let sub of instance.removeSubscriptions)
            sub(entity);
      }
      removeTraitFromEntity(world, entity, trait2);
    }
  }
  function cleanupRelationTarget(world, relation2, entity, target) {
    let relationTrait = relation2[$internal].trait, instance = world[$internal].traitInstances[relationTrait.id];
    if (instance)
      for (let sub of instance.removeSubscriptions)
        sub(entity, target);
    let {
      removedIndex,
      wasLastTarget
    } = removeRelationTarget(world, relation2, entity, target);
    if (removedIndex === -1)
      return;
    if (wasLastTarget)
      removeTraitFromEntity(world, entity, relationTrait);
  }
  function hasTrait(world, entity, trait2) {
    let ctx = world[$internal], instance = ctx.traitInstances[trait2.id];
    if (!instance)
      return !1;
    let {
      generationId,
      bitflag
    } = instance, eid = entity & ENTITY_ID_MASK;
    return (ctx.entityMasks[generationId][eid] & bitflag) === bitflag;
  }
  function setTrait(world, entity, trait2, value, triggerChanged = !0) {
    if (trait2?.[$relationPair]) {
      let { relation: relation_47_$f, target: target_47_$f } = trait2;
      if (typeof target_47_$f !== "number")
        result_setTraitForPair_47_$f = void 0;
      else if (setRelationData(world, entity, relation_47_$f, target_47_$f, value), triggerChanged)
        setPairChanged(world, entity, relation_47_$f[$internal].trait, target_47_$f);
      return;
    }
    let ctx_48_$f = trait2[$internal], store_48_$f = world[$internal].traitInstances[trait2.id].store, index_48_$f = entity & ENTITY_ID_MASK;
    value instanceof Function && (value = value(ctx_48_$f.get(index_48_$f, store_48_$f))), ctx_48_$f.set(index_48_$f, store_48_$f, value), triggerChanged && setChanged(world, entity, trait2);
    return;
  }
  function getTrait(world, entity, trait2) {
    if (trait2?.[$relationPair]) {
      let result_getTraitForPair_52_$f, { relation: relation_52_$f, target: target_52_$f } = trait2;
      if (!hasRelationPair(world, entity, trait2))
        result_getTraitForPair_52_$f = void 0;
      else if (typeof target_52_$f !== "number")
        result_getTraitForPair_52_$f = void 0;
      else
        result_getTraitForPair_52_$f = getRelationData(world, entity, relation_52_$f, target_52_$f);
      return result_getTraitForPair_52_$f;
    }
    let result_getTraitForTrait_53_$f;
    if (!hasTrait(world, entity, trait2))
      result_getTraitForTrait_53_$f = void 0;
    else {
      let traitCtx_53_$f = trait2[$internal], store_53_$f = world[$internal].traitInstances[trait2.id].store;
      result_getTraitForTrait_53_$f = traitCtx_53_$f.get(entity & ENTITY_ID_MASK, store_53_$f);
    }
    return result_getTraitForTrait_53_$f;
  }
  function removeTraitFromEntity(world, entity, trait2) {
    if (!hasTrait(world, entity, trait2))
      return;
    let ctx = world[$internal], instance = ctx.traitInstances[trait2.id], {
      generationId,
      bitflag,
      queries,
      trackingQueries
    } = instance, eid = entity & ENTITY_ID_MASK;
    ctx.entityMasks[generationId][eid] &= ~bitflag;
    for (let dirtyMask of ctx.dirtyMasks.values())
      dirtyMask[generationId][eid] |= bitflag;
    for (let query of queries)
      if (query.relationFilters && query.relationFilters.length > 0 ? checkQueryWithRelations(world, query, entity) : query.check(world, entity))
        query.add(entity);
      else
        query.remove(world, entity);
    for (let query of trackingQueries)
      if (query.relationFilters && query.relationFilters.length > 0 ? checkQueryTrackingWithRelations(world, query, entity, "remove", generationId, bitflag) : query.checkTracking(world, entity, "remove", generationId, bitflag))
        query.add(entity);
      else
        query.remove(world, entity);
    ctx.entityTraits.get(entity).delete(trait2);
  }
  function createRelation(definition) {
    let relationTrait = trait(definition?.store ?? {}), traitCtx = relationTrait[$internal];
    traitCtx.relation = null;
    let autoDestroy = !1;
    if (definition?.autoDestroy === "orphan" || definition?.autoDestroy === "source")
      autoDestroy = "source";
    else if (definition?.autoDestroy === "target")
      autoDestroy = "target";
    if (definition?.autoRemoveTarget)
      console.warn(`Koota: 'autoRemoveTarget' is deprecated. Use 'autoDestroy: "orphan"' instead.`), autoDestroy = "source";
    let relationCtx = {
      trait: relationTrait,
      exclusive: definition?.exclusive ?? !1,
      autoDestroy
    };
    function relationFn(...args) {
      let firstArg = args[0];
      if (firstArg === void 0)
        throw Error("Relation target is undefined");
      if (firstArg === "*" || typeof firstArg === "number")
        return {
          [$relationPair]: !0,
          relation: relationFn,
          target: firstArg,
          params: args[1]
        };
      if (firstArg?.[$queryRef]) {
        if (args.length > 1)
          throw Error("Query relations do not accept additional parameters.");
        return {
          [$relationPair]: !0,
          relation: relationFn,
          targetQuery: firstArg
        };
      }
      return {
        [$relationPair]: !0,
        relation: relationFn,
        targetQuery: args
      };
    }
    let relation2 = Object.assign(relationFn, {
      [$internal]: relationCtx
    });
    return Object.defineProperty(relation2, $relation, {
      value: !0,
      writable: !1,
      enumerable: !1,
      configurable: !1
    }), traitCtx.relation = relation2, relation2;
  }
  var relation = createRelation, EMPTY_ENTITY_ARRAY = Object.freeze([]);
  function addToRelationSources(traitData, entity, target) {
    let buckets = traitData.relationSourcesByTarget ??= [];
    (buckets[target & ENTITY_ID_MASK] ??= []).push(entity);
  }
  function removeFromRelationSources(traitData, entity, target) {
    let bucket = traitData.relationSourcesByTarget?.[target & ENTITY_ID_MASK];
    if (!bucket)
      return;
    let idx = bucket.indexOf(entity);
    if (idx === -1)
      return;
    let last = bucket.length - 1;
    if (idx !== last)
      bucket[idx] = bucket[last];
    bucket.pop();
  }
  function addRelationTarget(world, relation2, entity, target) {
    let ctx = world[$internal], relationCtx = relation2[$internal], baseTrait = relationCtx.trait, traitData = ctx.traitInstances[baseTrait.id];
    if (!traitData)
      return -1;
    if (!traitData.relationTargets)
      traitData.relationTargets = [];
    let eid = entity & ENTITY_ID_MASK, targetIndex;
    if (relationCtx.exclusive) {
      let targets = traitData.relationTargets, previousTarget = targets[eid];
      if (previousTarget === target)
        return -1;
      if (previousTarget !== void 0)
        removeFromRelationSources(traitData, entity, previousTarget);
      targets[eid] = target, targetIndex = 0;
    } else {
      let targetsArray = traitData.relationTargets;
      if (!targetsArray[eid])
        targetsArray[eid] = [];
      if (targetsArray[eid].indexOf(target) !== -1)
        return -1;
      targetIndex = targetsArray[eid].length, targetsArray[eid].push(target);
    }
    return addToRelationSources(traitData, entity, target), updateQueriesForRelationChange(world, relation2, entity), targetIndex;
  }
  function removeRelationTarget(world, relation2, entity, target) {
    let ctx = world[$internal], relationCtx = relation2[$internal], relationTrait = relationCtx.trait, data = ctx.traitInstances[relationTrait.id];
    if (!data || !data.relationTargets)
      return {
        removedIndex: -1,
        wasLastTarget: !1
      };
    let eid = entity & ENTITY_ID_MASK, removedIndex = -1, hasRemainingTargets = !1;
    if (relationCtx.exclusive) {
      let targets = data.relationTargets;
      if (targets[eid] === target)
        removeFromRelationSources(data, entity, target), targets[eid] = void 0, removedIndex = 0, hasRemainingTargets = !1, clearRelationDataInternal(data.store, relationTrait[$internal].type, eid, 0, !0);
    } else {
      let entityTargets = data.relationTargets[eid];
      if (entityTargets) {
        let idx = entityTargets.indexOf(target);
        if (idx !== -1) {
          let lastIdx = entityTargets.length - 1;
          if (removeFromRelationSources(data, entity, target), idx !== lastIdx)
            entityTargets[idx] = entityTargets[lastIdx];
          entityTargets.pop(), swapAndPopRelationData(data.store, relationTrait[$internal].type, eid, idx, lastIdx), removedIndex = idx, hasRemainingTargets = entityTargets.length > 0;
        }
      }
    }
    if (removedIndex !== -1)
      updateQueriesForRelationChange(world, relation2, entity);
    return {
      removedIndex,
      wasLastTarget: removedIndex !== -1 && !hasRemainingTargets
    };
  }
  function updateQueriesForRelationChange(world, relation2, entity) {
    let ctx = world[$internal], baseTrait = relation2[$internal].trait, traitData = ctx.traitInstances[baseTrait.id];
    if (!traitData)
      return;
    for (let query of traitData.relationQueries)
      if (checkQueryWithRelations(world, query, entity))
        query.add(entity);
      else
        query.remove(world, entity);
  }
  function swapAndPopRelationData(store, type, eid, idx, lastIdx) {
    if (type === "aos") {
      let arr = store[eid];
      if (arr) {
        if (idx !== lastIdx)
          arr[idx] = arr[lastIdx];
        arr.pop();
      }
    } else
      for (let key in store) {
        let arr = store[key][eid];
        if (arr) {
          if (idx !== lastIdx)
            arr[idx] = arr[lastIdx];
          arr.pop();
        }
      }
  }
  function clearRelationDataInternal(store, type, eid, _idx, exclusive) {
    if (!exclusive)
      return;
    if (type === "aos")
      store[eid] = void 0;
    else
      for (let key in store)
        store[key][eid] = void 0;
  }
  function removeAllRelationTargets(world, relation2, entity) {
    let result_getRelationTargets_16_$f, ctx_16_$f = world[$internal], relationCtx_16_$f = relation2[$internal], traitData_16_$f = ctx_16_$f.traitInstances[relationCtx_16_$f.trait.id];
    if (!traitData_16_$f || !traitData_16_$f.relationTargets)
      result_getRelationTargets_16_$f = [];
    else {
      let eid_16_$f = entity & ENTITY_ID_MASK;
      if (relationCtx_16_$f.exclusive) {
        let target_16_$f = traitData_16_$f.relationTargets[eid_16_$f];
        result_getRelationTargets_16_$f = target_16_$f !== void 0 ? [target_16_$f] : [];
      } else {
        let targets_16_$f = traitData_16_$f.relationTargets[eid_16_$f];
        result_getRelationTargets_16_$f = targets_16_$f !== void 0 ? targets_16_$f.slice() : [];
      }
    }
    let targets = result_getRelationTargets_16_$f;
    for (let target of targets)
      removeRelationTarget(world, relation2, entity, target);
  }
  function getEntitiesWithRelationTo(world, relation2, target) {
    let ctx = world[$internal];
    if (!world.has(target))
      return EMPTY_ENTITY_ARRAY;
    let baseTrait = relation2[$internal].trait, traitData = ctx.traitInstances[baseTrait.id];
    if (!traitData?.relationSourcesByTarget)
      return EMPTY_ENTITY_ARRAY;
    return traitData.relationSourcesByTarget[target & ENTITY_ID_MASK]?.slice() ?? EMPTY_ENTITY_ARRAY;
  }
  function hasRelationTargetInSet(world, relation2, entity, matches) {
    let ctx = world[$internal], relationCtx = relation2[$internal], traitData = ctx.traitInstances[relationCtx.trait.id];
    if (!traitData?.relationTargets)
      return !1;
    let eid = entity & ENTITY_ID_MASK;
    if (relationCtx.exclusive) {
      let target = traitData.relationTargets[eid];
      return target !== void 0 && matches.has(target);
    }
    let targets = traitData.relationTargets[eid];
    if (!targets)
      return !1;
    for (let i = 0;i < targets.length; i++)
      if (matches.has(targets[i]))
        return !0;
    return !1;
  }
  function setRelationDataAtIndex(world, entity, relation2, targetIndex, value) {
    let relationCtx = relation2[$internal], baseTrait = relationCtx.trait, traitData = world[$internal].traitInstances[baseTrait.id];
    if (!traitData)
      return;
    let store = traitData.store, eid = entity & ENTITY_ID_MASK;
    if (baseTrait[$internal].type === "aos") {
      if (relationCtx.exclusive)
        store[eid] = value;
      else
        (store[eid] ??= [])[targetIndex] = value;
      return;
    }
    if (relationCtx.exclusive)
      for (let key in value)
        store[key][eid] = value[key];
    else
      for (let key in value)
        (store[key][eid] ??= [])[targetIndex] = value[key];
  }
  function setRelationData(world, entity, relation2, target, value) {
    let result_getTargetIndex_23_$f, ctx_23_$f = world[$internal], relationCtx_23_$f = relation2[$internal], baseTrait_23_$f = relationCtx_23_$f.trait, traitData_23_$f = ctx_23_$f.traitInstances[baseTrait_23_$f.id];
    if (!traitData_23_$f || !traitData_23_$f.relationTargets)
      result_getTargetIndex_23_$f = -1;
    else {
      let eid_23_$f = entity & ENTITY_ID_MASK;
      if (relationCtx_23_$f.exclusive)
        result_getTargetIndex_23_$f = traitData_23_$f.relationTargets[eid_23_$f] === target ? 0 : -1;
      else {
        let targets_23_$f = traitData_23_$f.relationTargets[eid_23_$f];
        result_getTargetIndex_23_$f = targets_23_$f ? targets_23_$f.indexOf(target) : -1;
      }
    }
    let targetIndex = result_getTargetIndex_23_$f;
    if (targetIndex === -1)
      return;
    setRelationDataAtIndex(world, entity, relation2, targetIndex, value);
  }
  function getRelationData(world, entity, relation2, target) {
    let ctx = world[$internal], baseTrait = relation2[$internal].trait, traitData = ctx.traitInstances[baseTrait.id];
    if (!traitData)
      return;
    let result_getTargetIndex_25_$f, ctx_25_$f = world[$internal], relationCtx_25_$f = relation2[$internal], baseTrait_25_$f = relationCtx_25_$f.trait, traitData_25_$f = ctx_25_$f.traitInstances[baseTrait_25_$f.id];
    if (!traitData_25_$f || !traitData_25_$f.relationTargets)
      result_getTargetIndex_25_$f = -1;
    else {
      let eid_25_$f = entity & ENTITY_ID_MASK;
      if (relationCtx_25_$f.exclusive)
        result_getTargetIndex_25_$f = traitData_25_$f.relationTargets[eid_25_$f] === target ? 0 : -1;
      else {
        let targets_25_$f = traitData_25_$f.relationTargets[eid_25_$f];
        result_getTargetIndex_25_$f = targets_25_$f ? targets_25_$f.indexOf(target) : -1;
      }
    }
    let targetIndex = result_getTargetIndex_25_$f;
    if (targetIndex === -1)
      return;
    let traitCtx = baseTrait[$internal], store = traitData.store, eid = entity & ENTITY_ID_MASK, relationCtx = relation2[$internal];
    if (traitCtx.type === "aos")
      if (relationCtx.exclusive)
        return store[eid];
      else
        return store[eid]?.[targetIndex];
    else {
      let result = {}, storeRecord = store;
      for (let key in store)
        if (relationCtx.exclusive)
          result[key] = storeRecord[key][eid];
        else
          result[key] = storeRecord[key][eid]?.[targetIndex];
      return result;
    }
  }
  function hasRelationPair(world, entity, pair) {
    let { relation: relation2, target, targetQuery } = pair;
    if (!hasTrait(world, entity, relation2[$internal].trait))
      return !1;
    if (targetQuery) {
      let matchingTargets = targetQuery?.[$queryRef] ? world.query(targetQuery) : world.query(...targetQuery);
      if (!matchingTargets.length)
        return !1;
      let result_getRelationTargets_28_$f, ctx_28_$f = world[$internal], relationCtx_28_$f = relation2[$internal], traitData_28_$f = ctx_28_$f.traitInstances[relationCtx_28_$f.trait.id];
      if (!traitData_28_$f || !traitData_28_$f.relationTargets)
        result_getRelationTargets_28_$f = [];
      else {
        let eid_28_$f = entity & ENTITY_ID_MASK;
        if (relationCtx_28_$f.exclusive) {
          let target_28_$f = traitData_28_$f.relationTargets[eid_28_$f];
          result_getRelationTargets_28_$f = target_28_$f !== void 0 ? [target_28_$f] : [];
        } else {
          let targets_28_$f = traitData_28_$f.relationTargets[eid_28_$f];
          result_getRelationTargets_28_$f = targets_28_$f !== void 0 ? targets_28_$f.slice() : [];
        }
      }
      let targets = result_getRelationTargets_28_$f;
      for (let i = 0;i < targets.length; i++)
        if (matchingTargets.includes(targets[i]))
          return !0;
      return !1;
    }
    if (target === "*")
      return !0;
    if (typeof target === "number") {
      let result_hasRelationToTarget_29_$f, ctx_29_$f = world[$internal], relationCtx_29_$f = relation2[$internal], baseTrait_29_$f = relationCtx_29_$f.trait, traitData_29_$f = ctx_29_$f.traitInstances[baseTrait_29_$f.id];
      if (!traitData_29_$f || !traitData_29_$f.relationTargets)
        result_hasRelationToTarget_29_$f = !1;
      else {
        let eid_29_$f = entity & ENTITY_ID_MASK;
        if (relationCtx_29_$f.exclusive)
          result_hasRelationToTarget_29_$f = traitData_29_$f.relationTargets[eid_29_$f] === target;
        else {
          let targets_29_$f = traitData_29_$f.relationTargets[eid_29_$f];
          result_hasRelationToTarget_29_$f = targets_29_$f ? targets_29_$f.includes(target) : !1;
        }
      }
      return result_hasRelationToTarget_29_$f;
    }
    return !1;
  }
  var SparseSet = class {
    _dense = [];
    _sparse = [];
    _cursor = 0;
    _denseRaw = {
      array: this._dense,
      length: 0
    };
    has(val) {
      let index = this._sparse[val];
      return index < this._cursor && this._dense[index] === val;
    }
    add(val) {
      if (this.has(val))
        return;
      this._sparse[val] = this._cursor, this._dense[this._cursor++] = val;
    }
    remove(val) {
      if (!this.has(val))
        return;
      let index = this._sparse[val];
      this._cursor--;
      let swapped = this._dense[this._cursor];
      if (swapped !== val)
        this._dense[index] = swapped, this._sparse[swapped] = index;
    }
    clear() {
      for (let i = 0;i < this._cursor; i++)
        this._sparse[this._dense[i]] = 0;
      this._cursor = 0;
    }
    sort() {
      this._dense.sort((a, b) => a - b);
      for (let i = 0;i < this._dense.length; i++)
        this._sparse[this._dense[i]] = i;
    }
    getIndex(val) {
      return this._sparse[val];
    }
    get dense() {
      return this._dense.slice(0, this._cursor);
    }
    get denseRaw() {
      return this._denseRaw.length = this._cursor, this._denseRaw;
    }
    get rawDense() {
      return this._dense;
    }
    get length() {
      return this._cursor;
    }
    get sparse() {
      return this._sparse;
    }
  }, EMPTY_BLOCK = new Uint32Array(32);
  function createQueryResult(world, entities, query, params) {
    let traits = [], stores = [];
    for (let i_0_$f = 0;i_0_$f < params.length; i_0_$f++) {
      let param_0_$f = params[i_0_$f];
      if (param_0_$f?.[$relationPair]) {
        let baseTrait_0_$f = param_0_$f.relation[$internal].trait;
        if (baseTrait_0_$f[$internal].type !== "tag") {
          traits.push(baseTrait_0_$f);
          let instance_19_$f = world[$internal].traitInstances[baseTrait_0_$f.id];
          stores.push(instance_19_$f.store);
        }
        continue;
      }
      if (param_0_$f?.[$modifier]) {
        if (param_0_$f.type === "not")
          continue;
        let modifierTraits_0_$f = param_0_$f.traits;
        for (let trait_0_$f of modifierTraits_0_$f) {
          if (trait_0_$f[$internal].type === "tag")
            continue;
          traits.push(trait_0_$f);
          let instance_21_$f = world[$internal].traitInstances[trait_0_$f.id];
          stores.push(instance_21_$f.store);
        }
      } else {
        let trait_0_$f = param_0_$f;
        if (trait_0_$f[$internal].type === "tag")
          continue;
        traits.push(trait_0_$f);
        let instance_22_$f = world[$internal].traitInstances[trait_0_$f.id];
        stores.push(instance_22_$f.store);
      }
    }
    let results = Object.assign(entities, {
      readEach(callback) {
        let state = Array.from({
          length: traits.length
        });
        for (let i = 0;i < entities.length; i++) {
          let entity = entities[i], eid = entity & ENTITY_ID_MASK;
          for (let i_2_$f = 0;i_2_$f < traits.length; i_2_$f++) {
            let value_2_$f = traits[i_2_$f][$internal].get(eid, stores[i_2_$f]);
            state[i_2_$f] = value_2_$f;
          }
          callback(state, entity, i);
        }
        return results;
      },
      updateEach(callback, options = {
        changeDetection: "auto"
      }) {
        let state = Array.from({
          length: traits.length
        });
        if (options.changeDetection === "auto") {
          let changedPairs = [], atomicSnapshots = [], trackedIndices = [], untrackedIndices = [];
          for (let i_3_$f = 0;i_3_$f < traits.length; i_3_$f++) {
            let trait_3_$f = traits[i_3_$f], hasTracked_3_$f = world[$internal].trackedTraits.has(trait_3_$f), hasChanged_3_$f = query.hasChangedModifiers && query.changedTraits.has(trait_3_$f);
            if (hasTracked_3_$f || hasChanged_3_$f)
              trackedIndices.push(i_3_$f);
            else
              untrackedIndices.push(i_3_$f);
          }
          for (let i = 0;i < entities.length; i++) {
            let entity = entities[i], eid = entity & ENTITY_ID_MASK;
            for (let j_5_$f = 0;j_5_$f < traits.length; j_5_$f++) {
              let ctx_5_$f = traits[j_5_$f][$internal], value_5_$f = ctx_5_$f.get(eid, stores[j_5_$f]);
              state[j_5_$f] = value_5_$f, atomicSnapshots[j_5_$f] = ctx_5_$f.type === "aos" ? {
                ...value_5_$f
              } : null;
            }
            if (callback(state, entity, i), !world.has(entity))
              continue;
            for (let j = 0;j < trackedIndices.length; j++) {
              let index = trackedIndices[j], trait2 = traits[index], ctx = trait2[$internal], newValue = state[index], store = stores[index], changed = !1;
              if (ctx.type === "aos") {
                if (changed = ctx.fastSetWithChangeDetection(eid, store, newValue), !changed)
                  changed = !shallowEqual(newValue, atomicSnapshots[index]);
              } else
                changed = ctx.fastSetWithChangeDetection(eid, store, newValue);
              if (changed)
                changedPairs.push([entity, trait2]);
            }
            for (let j = 0;j < untrackedIndices.length; j++) {
              let index = untrackedIndices[j], ctx = traits[index][$internal], store = stores[index];
              ctx.fastSet(eid, store, state[index]);
            }
          }
          for (let i = 0;i < changedPairs.length; i++) {
            let [entity, trait2] = changedPairs[i];
            setChanged(world, entity, trait2);
          }
        } else if (options.changeDetection === "always") {
          let changedPairs = [], atomicSnapshots = [];
          for (let i = 0;i < entities.length; i++) {
            let entity = entities[i], eid = entity & ENTITY_ID_MASK;
            for (let j_7_$f = 0;j_7_$f < traits.length; j_7_$f++) {
              let ctx_7_$f = traits[j_7_$f][$internal], value_7_$f = ctx_7_$f.get(eid, stores[j_7_$f]);
              state[j_7_$f] = value_7_$f, atomicSnapshots[j_7_$f] = ctx_7_$f.type === "aos" ? {
                ...value_7_$f
              } : null;
            }
            if (callback(state, entity, i), !world.has(entity))
              continue;
            for (let j = 0;j < traits.length; j++) {
              let trait2 = traits[j], ctx = trait2[$internal], newValue = state[j], changed = !1;
              if (ctx.type === "aos") {
                if (changed = ctx.fastSetWithChangeDetection(eid, stores[j], newValue), !changed)
                  changed = !shallowEqual(newValue, atomicSnapshots[j]);
              } else
                changed = ctx.fastSetWithChangeDetection(eid, stores[j], newValue);
              if (changed)
                changedPairs.push([entity, trait2]);
            }
          }
          for (let i = 0;i < changedPairs.length; i++) {
            let [entity, trait2] = changedPairs[i];
            setChanged(world, entity, trait2);
          }
        } else if (options.changeDetection === "never")
          for (let i = 0;i < entities.length; i++) {
            let entity = entities[i], eid = entity & ENTITY_ID_MASK;
            for (let i_9_$f = 0;i_9_$f < traits.length; i_9_$f++) {
              let value_9_$f = traits[i_9_$f][$internal].get(eid, stores[i_9_$f]);
              state[i_9_$f] = value_9_$f;
            }
            if (callback(state, entity, i), !world.has(entity))
              continue;
            for (let j = 0;j < traits.length; j++)
              traits[j][$internal].fastSet(eid, stores[j], state[j]);
          }
        return results;
      },
      useStores(callback) {
        return callback(stores, entities), results;
      },
      select(...params2) {
        traits.length = 0, stores.length = 0;
        for (let i_10_$f = 0;i_10_$f < params2.length; i_10_$f++) {
          let param_10_$f = params2[i_10_$f];
          if (param_10_$f?.[$relationPair]) {
            let baseTrait_10_$f = param_10_$f.relation[$internal].trait;
            if (baseTrait_10_$f[$internal].type !== "tag") {
              traits.push(baseTrait_10_$f);
              let instance_12_$f = world[$internal].traitInstances[baseTrait_10_$f.id];
              stores.push(instance_12_$f.store);
            }
            continue;
          }
          if (param_10_$f?.[$modifier]) {
            if (param_10_$f.type === "not")
              continue;
            let modifierTraits_10_$f = param_10_$f.traits;
            for (let trait_10_$f of modifierTraits_10_$f) {
              if (trait_10_$f[$internal].type === "tag")
                continue;
              traits.push(trait_10_$f);
              let instance_14_$f = world[$internal].traitInstances[trait_10_$f.id];
              stores.push(instance_14_$f.store);
            }
          } else {
            let trait_10_$f = param_10_$f;
            if (trait_10_$f[$internal].type === "tag")
              continue;
            traits.push(trait_10_$f);
            let instance_15_$f = world[$internal].traitInstances[trait_10_$f.id];
            stores.push(instance_15_$f.store);
          }
        }
        return results;
      },
      sort(callback = (a, b) => (a & ENTITY_ID_MASK) - (b & ENTITY_ID_MASK)) {
        return Array.prototype.sort.call(entities, callback), results;
      }
    });
    return results;
  }
  var relationOnlyMethods = {
    readEach(callback) {
      for (let i = 0;i < this.length; i++)
        callback([], this[i], i);
      return this;
    },
    updateEach(callback) {
      for (let i = 0;i < this.length; i++)
        callback([], this[i], i);
      return this;
    },
    useStores(callback) {
      return callback([], this), this;
    },
    select() {
      return this;
    },
    sort(callback = (a, b) => (a & ENTITY_ID_MASK) - (b & ENTITY_ID_MASK)) {
      return Array.prototype.sort.call(this, callback), this;
    }
  };
  function createRelationOnlyQueryResult(entities) {
    if (entities.length === 0)
      return cachedEmptyRelationResult;
    return Object.assign(entities, relationOnlyMethods);
  }
  var cachedEmptyRelationResult = Object.assign([], relationOnlyMethods), MODIFIER_FACTOR = 1e5, RELATION_FACTOR = 1e7, RELATION_OFFSET = 5000000, RELATION_QUERY_OFFSET = 9000000, sortBuf = new Float64Array(1024), nextQueryId = 1, queryHashToId = /* @__PURE__ */ new Map;
  function queryHashNumericId(hash) {
    let id = queryHashToId.get(hash);
    if (id === void 0)
      id = nextQueryId++, queryHashToId.set(hash, id);
    return id;
  }
  var createQueryHash = (parameters) => {
    let cursor2 = 0;
    for (let i = 0;i < parameters.length; i++) {
      let param = parameters[i];
      if (param?.[$relationPair]) {
        let relationId = param.relation[$internal].trait.id;
        if (param.targetQuery) {
          let subHash = param.targetQuery?.[$queryRef] ? param.targetQuery.hash : createQueryHash([...param.targetQuery]);
          sortBuf[cursor2++] = relationId * RELATION_FACTOR + queryHashNumericId(subHash) + RELATION_QUERY_OFFSET;
          continue;
        }
        let target = param.target, targetId = typeof target === "number" ? target : -1;
        sortBuf[cursor2++] = relationId * RELATION_FACTOR + targetId + RELATION_OFFSET;
        continue;
      }
      if (param?.[$modifier]) {
        for (let j = 0;j < param.traitIds.length; j++)
          sortBuf[cursor2++] = param.id * MODIFIER_FACTOR + param.traitIds[j];
        continue;
      }
      sortBuf[cursor2++] = param.id;
    }
    let filled = sortBuf.subarray(0, cursor2);
    return filled.sort(), filled.join(",");
  }, IsExcluded = trait();
  function resolveRelationFilter(filter) {
    if (!filter.targetQuery)
      return filter;
    let targetQueryRef = filter.targetQuery?.[$queryRef] ? filter.targetQuery : createQuery(...filter.targetQuery);
    return {
      ...filter,
      targetQueryRef,
      targetQueryMatches: new SparseSet
    };
  }
  function runQuery(world, query, params) {
    commitQueryRemovals(world);
    let entities = query.entities.dense.slice();
    if (query.isTracking) {
      query.entities.clear();
      let len = entities.length;
      for (let i = 0;i < len; i++)
        query.resetTrackingBitmasks(entities[i]);
    }
    return createQueryResult(world, entities, query, params);
  }
  function addEntityToQuery(query, entity) {
    query.toRemove.remove(entity), query.entities.add(entity);
    for (let sub of query.addSubscriptions)
      sub(entity);
    query.version++;
  }
  function removeEntityFromQuery(world, query, entity) {
    if (!query.entities.has(entity) || query.toRemove.has(entity))
      return;
    let ctx = world[$internal];
    query.toRemove.add(entity), ctx.dirtyQueries.add(query);
    for (let sub of query.removeSubscriptions)
      sub(entity);
    query.version++;
  }
  function commitQueryRemovals(world) {
    let ctx = world[$internal];
    if (!ctx.dirtyQueries.size)
      return;
    for (let query of ctx.dirtyQueries)
      for (let i = query.toRemove.dense.length - 1;i >= 0; i--) {
        let eid = query.toRemove.dense[i];
        query.toRemove.remove(eid), query.entities.remove(eid);
      }
    ctx.dirtyQueries.clear();
  }
  function resetQueryTrackingBitmasks(query, eid) {
    let groups = query.trackingGroups, len = groups.length;
    for (let i = 0;i < len; i++) {
      let trackers = groups[i].trackers, trackersLen = trackers.length;
      for (let j = 0;j < trackersLen; j++) {
        let tracker = trackers[j];
        if (tracker)
          tracker[eid] = 0;
      }
    }
  }
  function processTrackingModifier(world, query, modifier, logic, ctx, groupsMap) {
    let trackingType = getTrackingType(modifier);
    if (!trackingType)
      return;
    let id = modifier.id, key = `${trackingType}-${id}-${logic}`, group = groupsMap.get(key);
    if (!group)
      group = {
        logic,
        type: trackingType,
        id,
        bitmasks: [],
        trackers: []
      }, groupsMap.set(key, group), query.trackingGroups.push(group);
    for (let trait2 of modifier.traits) {
      let traitId_1_$f = trait2.id;
      if (!(traitId_1_$f < ctx.traitInstances.length && ctx.traitInstances[traitId_1_$f] !== void 0))
        registerTrait(world, trait2);
      let instance = ctx.traitInstances[trait2.id];
      query.traits.push(trait2), query.traitInstances.all.push(instance);
      let genId = instance.generationId;
      if (group.bitmasks[genId] = (group.bitmasks[genId] || 0) | instance.bitflag, trackingType === "change")
        query.changedTraits.add(trait2), query.hasChangedModifiers = !0;
    }
    query.isTracking = !0;
  }
  function createQueryInstance(world, parameters) {
    let query = {
      version: 0,
      world,
      parameters,
      hash: "",
      traits: [],
      traitInstances: {
        required: [],
        forbidden: [],
        or: [],
        all: []
      },
      staticBitmasks: [],
      trackingGroups: [],
      generations: [],
      entities: new SparseSet,
      isTracking: !1,
      hasChangedModifiers: !1,
      changedTraits: /* @__PURE__ */ new Set,
      toRemove: new SparseSet,
      cleanup: [],
      addSubscriptions: /* @__PURE__ */ new Set,
      removeSubscriptions: /* @__PURE__ */ new Set,
      relationFilters: [],
      run: (world2, params) => runQuery(world2, query, params),
      add: (entity) => addEntityToQuery(query, entity),
      remove: (world2, entity) => removeEntityFromQuery(world2, query, entity),
      check: (world2, entity) => checkQuery(world2, query, entity),
      checkTracking: (world2, entity, eventType, generationId, bitflag) => checkQueryTracking(world2, query, entity, eventType, generationId, bitflag),
      resetTrackingBitmasks: (eid) => resetQueryTrackingBitmasks(query, eid)
    }, ctx = world[$internal], trackingGroupsMap = /* @__PURE__ */ new Map;
    for (let i = 0;i < parameters.length; i++) {
      let parameter = parameters[i];
      if (parameter?.[$relationPair]) {
        let relation2 = parameter.relation;
        query.relationFilters.push(resolveRelationFilter(parameter));
        let baseTrait = relation2[$internal].trait, traitId_4_$f = baseTrait.id;
        if (!(traitId_4_$f < ctx.traitInstances.length && ctx.traitInstances[traitId_4_$f] !== void 0))
          registerTrait(world, baseTrait);
        query.traitInstances.required.push(ctx.traitInstances[baseTrait.id]), query.traits.push(baseTrait);
        continue;
      }
      if (parameter?.[$modifier]) {
        let traits = parameter.traits;
        for (let j = 0;j < traits.length; j++) {
          let t = traits[j], traitId_7_$f = t.id;
          if (!(traitId_7_$f < ctx.traitInstances.length && ctx.traitInstances[traitId_7_$f] !== void 0))
            registerTrait(world, t);
        }
        if (parameter.type === "not")
          query.traitInstances.forbidden.push(...traits.map((t) => ctx.traitInstances[t.id]));
        else if (parameter.type === "or") {
          if (query.traitInstances.or.push(...traits.map((t) => ctx.traitInstances[t.id])), isOrWithModifiers(parameter)) {
            for (let nestedModifier of parameter.modifiers)
              if (isTrackingModifier(nestedModifier))
                processTrackingModifier(world, query, nestedModifier, "or", ctx, trackingGroupsMap);
          }
        } else if (isTrackingModifier(parameter))
          processTrackingModifier(world, query, parameter, "and", ctx, trackingGroupsMap);
      } else {
        let t = parameter, traitId_10_$f = t.id;
        if (!(traitId_10_$f < ctx.traitInstances.length && ctx.traitInstances[traitId_10_$f] !== void 0))
          registerTrait(world, t);
        query.traitInstances.required.push(ctx.traitInstances[t.id]), query.traits.push(t);
      }
    }
    if (query.traitInstances.forbidden.push(ctx.traitInstances[IsExcluded.id]), query.traitInstances.all = [
      ...query.traitInstances.all,
      ...query.traitInstances.required,
      ...query.traitInstances.forbidden,
      ...query.traitInstances.or
    ], query.generations = query.traitInstances.all.map((c) => c.generationId).reduce((a, v) => {
      if (a.includes(v))
        return a;
      return a.push(v), a;
    }, []), query.staticBitmasks = query.generations.map((generationId) => {
      let required = query.traitInstances.required.filter((c) => c.generationId === generationId).reduce((a, c) => a | c.bitflag, 0), forbidden = query.traitInstances.forbidden.filter((c) => c.generationId === generationId).reduce((a, c) => a | c.bitflag, 0), or = query.traitInstances.or.filter((c) => c.generationId === generationId).reduce((a, c) => a | c.bitflag, 0);
      return {
        required,
        forbidden,
        or
      };
    }), query.hash = createQueryHash(parameters), ctx.queriesHashMap.set(query.hash, query), query.isTracking)
      query.traitInstances.all.forEach((instance) => {
        instance.trackingQueries.add(query);
      });
    else
      query.traitInstances.all.forEach((instance) => {
        instance.queries.add(query);
      });
    if (query.traitInstances.forbidden.length > 0)
      ctx.notQueries.add(query);
    let hasRelationFilters = query.relationFilters && query.relationFilters.length > 0;
    if (hasRelationFilters)
      for (let pair of query.relationFilters) {
        let relationTrait = pair.relation[$internal].trait, relationTraitInstance = ctx.traitInstances[relationTrait.id];
        if (relationTraitInstance)
          relationTraitInstance.relationQueries.add(query);
        if (pair.targetQueryRef && pair.targetQueryMatches) {
          let matchingTargets = world.query(pair.targetQueryRef);
          for (let i = 0;i < matchingTargets.length; i++)
            pair.targetQueryMatches.add(matchingTargets[i]);
          let refreshSourcesForTarget = (target) => {
            let sources = getEntitiesWithRelationTo(world, pair.relation, target);
            for (let i = 0;i < sources.length; i++) {
              let source = sources[i];
              if (checkQueryWithRelations(world, query, source))
                query.add(source);
              else
                query.remove(world, source);
            }
          };
          query.cleanup.push(world.onQueryAdd(pair.targetQueryRef, (target) => {
            pair.targetQueryMatches.add(target), refreshSourcesForTarget(target);
          })), query.cleanup.push(world.onQueryRemove(pair.targetQueryRef, (target) => {
            pair.targetQueryMatches.remove(target), refreshSourcesForTarget(target);
          }));
        }
      }
    if (query.trackingGroups.length > 0)
      for (let group of query.trackingGroups) {
        let {
          type,
          id,
          logic,
          bitmasks
        } = group, snapshot = ctx.trackingSnapshots.get(id), dirtyMask = ctx.dirtyMasks.get(id), changedMask = ctx.changedMasks.get(id);
        for (let entity of ctx.entityIndex.dense) {
          if (query.entities.has(entity))
            continue;
          let eid = entity & ENTITY_ID_MASK, matches = logic === "and";
          for (let genId = 0;genId < bitmasks.length; genId++) {
            let mask = bitmasks[genId];
            if (!mask)
              continue;
            let oldMask = snapshot[genId]?.[eid] || 0, currentMask = ctx.entityMasks[genId]?.[eid] || 0;
            for (let bit = 1;bit <= mask; bit <<= 1) {
              if (!(mask & bit))
                continue;
              let traitMatches = !1;
              switch (type) {
                case "add":
                  traitMatches = (oldMask & bit) === 0 && (currentMask & bit) === bit;
                  break;
                case "remove":
                  traitMatches = (oldMask & bit) === bit && (currentMask & bit) === 0 || (oldMask & bit) === 0 && (currentMask & bit) === 0 && ((dirtyMask[genId]?.[eid] ?? 0) & bit) === bit;
                  break;
                case "change":
                  traitMatches = ((changedMask[genId]?.[eid] ?? 0) & bit) === bit;
                  break;
              }
              if (logic === "and") {
                if (!traitMatches) {
                  matches = !1;
                  break;
                }
              } else if (traitMatches) {
                matches = !0;
                break;
              }
            }
            if (logic === "and" && !matches)
              break;
            if (logic === "or" && matches)
              break;
          }
          if (matches)
            if (hasRelationFilters) {
              let relationMatch = !0;
              for (let pair of query.relationFilters)
                if (!hasRelationPair(world, entity, pair)) {
                  relationMatch = !1;
                  break;
                }
              if (relationMatch)
                query.add(entity);
            } else
              query.add(entity);
        }
      }
    else {
      let entities = ctx.entityIndex.dense;
      for (let i = 0;i < entities.length; i++) {
        let entity = entities[i];
        if (hasRelationFilters ? checkQueryWithRelations(world, query, entity) : query.check(world, entity))
          query.add(entity);
      }
    }
    return query;
  }
  var queryId = 0;
  function createQuery(...parameters) {
    let hash = createQueryHash(parameters), existing = universe.cachedQueries.get(hash);
    if (existing)
      return existing;
    let id = queryId++, queryRef = Object.freeze({
      [$queryRef]: !0,
      id,
      hash,
      parameters
    });
    return universe.cachedQueries.set(hash, queryRef), queryRef;
  }
  var createEntityIndex = (worldId) => ({
    aliveCount: 0,
    dense: [],
    sparse: [],
    maxId: 0,
    worldId
  }), allocateEntity = (index) => {
    if (index.aliveCount < index.dense.length) {
      let recycledEntity = incrementGeneration(index.dense[index.aliveCount]);
      return index.dense[index.aliveCount] = recycledEntity, index.sparse[recycledEntity & ENTITY_ID_MASK] = index.aliveCount, index.aliveCount++, recycledEntity;
    }
    let id = index.maxId++, entity = packEntity(index.worldId, 0, id);
    return index.dense.push(entity), index.sparse[id] = index.aliveCount, index.aliveCount++, entity;
  }, releaseEntity = (index, entity) => {
    let id = entity & ENTITY_ID_MASK, denseIndex = index.sparse[id];
    if (denseIndex === void 0 || denseIndex >= index.aliveCount)
      return;
    let lastIndex = index.aliveCount - 1, lastEntity = index.dense[lastIndex], lastId = lastEntity & ENTITY_ID_MASK;
    index.sparse[lastId] = denseIndex, index.dense[denseIndex] = lastEntity, index.sparse[id] = lastIndex, index.dense[lastIndex] = entity, index.aliveCount--;
  }, getAliveEntities = (index) => index.dense.slice(0, index.aliveCount);
  Number.prototype.add = function(...traits) {
    let worldId_0_$f = this >>> WORLD_ID_SHIFT;
    return addTrait(universe.worlds[worldId_0_$f], this, ...traits);
  };
  Number.prototype.remove = function(...traits) {
    let worldId_1_$f = this >>> WORLD_ID_SHIFT;
    return removeTrait(universe.worlds[worldId_1_$f], this, ...traits);
  };
  Number.prototype.has = function(trait2) {
    let worldId_2_$f = this >>> WORLD_ID_SHIFT, world = universe.worlds[worldId_2_$f];
    if (trait2?.[$relationPair])
      return hasRelationPair(world, this, trait2);
    let result_hasTrait_4_$f, ctx_4_$f = world[$internal], instance_4_$f = ctx_4_$f.traitInstances[trait2.id];
    if (!instance_4_$f)
      result_hasTrait_4_$f = !1;
    else {
      let {
        generationId,
        bitflag
      } = instance_4_$f, eid_4_$f = this & ENTITY_ID_MASK;
      result_hasTrait_4_$f = (ctx_4_$f.entityMasks[generationId][eid_4_$f] & bitflag) === bitflag;
    }
    return result_hasTrait_4_$f;
  };
  Number.prototype.destroy = function() {
    let worldId_5_$f = this >>> WORLD_ID_SHIFT;
    return destroyEntity(universe.worlds[worldId_5_$f], this);
  };
  Number.prototype.changed = function(trait2) {
    let worldId_6_$f = this >>> WORLD_ID_SHIFT;
    return setChanged(universe.worlds[worldId_6_$f], this, trait2);
  };
  Number.prototype.get = function(trait2) {
    let worldId_7_$f = this >>> WORLD_ID_SHIFT;
    return getTrait(universe.worlds[worldId_7_$f], this, trait2);
  };
  Number.prototype.set = function(trait2, value, triggerChanged = !0) {
    let worldId_8_$f = this >>> WORLD_ID_SHIFT;
    setTrait(universe.worlds[worldId_8_$f], this, trait2, value, triggerChanged);
  };
  Number.prototype.targetsFor = function(relation2) {
    let result_getRelationTargets_9_$f, worldId_10_$f = this >>> WORLD_ID_SHIFT, ctx_9_$f = universe.worlds[worldId_10_$f][$internal], relationCtx_9_$f = relation2[$internal], traitData_9_$f = ctx_9_$f.traitInstances[relationCtx_9_$f.trait.id];
    if (!traitData_9_$f || !traitData_9_$f.relationTargets)
      result_getRelationTargets_9_$f = [];
    else {
      let eid_9_$f = this & ENTITY_ID_MASK;
      if (relationCtx_9_$f.exclusive) {
        let target_9_$f = traitData_9_$f.relationTargets[eid_9_$f];
        result_getRelationTargets_9_$f = target_9_$f !== void 0 ? [target_9_$f] : [];
      } else {
        let targets_9_$f = traitData_9_$f.relationTargets[eid_9_$f];
        result_getRelationTargets_9_$f = targets_9_$f !== void 0 ? targets_9_$f.slice() : [];
      }
    }
    return result_getRelationTargets_9_$f;
  };
  Number.prototype.targetFor = function(relation2) {
    let result_getFirstRelationTarget_11_$f, worldId_12_$f = this >>> WORLD_ID_SHIFT, ctx_11_$f = universe.worlds[worldId_12_$f][$internal], relationCtx_11_$f = relation2[$internal], traitData_11_$f = ctx_11_$f.traitInstances[relationCtx_11_$f.trait.id];
    if (!traitData_11_$f || !traitData_11_$f.relationTargets)
      result_getFirstRelationTarget_11_$f = void 0;
    else {
      let eid_11_$f = this & ENTITY_ID_MASK;
      if (relationCtx_11_$f.exclusive)
        result_getFirstRelationTarget_11_$f = traitData_11_$f.relationTargets[eid_11_$f];
      else
        result_getFirstRelationTarget_11_$f = traitData_11_$f.relationTargets[eid_11_$f]?.[0];
    }
    return result_getFirstRelationTarget_11_$f;
  };
  Number.prototype.id = function() {
    return this & ENTITY_ID_MASK;
  };
  Number.prototype.generation = function() {
    return this >>> GENERATION_SHIFT & GENERATION_MASK;
  };
  Number.prototype.isAlive = function() {
    let worldId_15_$f = this >>> WORLD_ID_SHIFT, entityIndex = universe.worlds[worldId_15_$f][$internal].entityIndex, result_isEntityAlive_16_$f, denseIndex_16_$f = entityIndex.sparse[this & ENTITY_ID_MASK];
    if (denseIndex_16_$f === void 0 || denseIndex_16_$f >= entityIndex.aliveCount)
      result_isEntityAlive_16_$f = !1;
    else {
      let storedEntity_16_$f = entityIndex.dense[denseIndex_16_$f];
      result_isEntityAlive_16_$f = (this >>> GENERATION_SHIFT & GENERATION_MASK) === (storedEntity_16_$f >>> GENERATION_SHIFT & GENERATION_MASK) && this >>> WORLD_ID_SHIFT === entityIndex.worldId;
    }
    return result_isEntityAlive_16_$f;
  };
  function createEntity(world, ...traits) {
    let ctx = world[$internal], entity = allocateEntity(ctx.entityIndex);
    for (let query of ctx.notQueries) {
      if (query.check(world, entity))
        query.add(entity);
      query.resetTrackingBitmasks(entity & ENTITY_ID_MASK);
    }
    return ctx.entityTraits.set(entity, /* @__PURE__ */ new Set), addTrait(world, entity, ...traits), entity;
  }
  var cachedSet = /* @__PURE__ */ new Set, cachedQueue = [];
  function destroyEntity(world, entity) {
    let ctx = world[$internal];
    if (!world.has(entity))
      throw Error("Koota: The entity being destroyed does not exist.");
    let entityQueue = cachedQueue, processedEntities = cachedSet;
    entityQueue.length = 0, entityQueue.push(entity), processedEntities.clear();
    while (entityQueue.length > 0) {
      let currentEntity = entityQueue.pop();
      if (processedEntities.has(currentEntity))
        continue;
      processedEntities.add(currentEntity);
      for (let relation2 of ctx.relations) {
        let relationCtx = relation2[$internal], sources = getEntitiesWithRelationTo(world, relation2, currentEntity);
        for (let si = sources.length - 1;si >= 0; si--) {
          let source = sources[si];
          if (!world.has(source))
            continue;
          if (cleanupRelationTarget(world, relation2, source, currentEntity), relationCtx.autoDestroy === "source")
            entityQueue.push(source);
        }
        if (relationCtx.autoDestroy === "target") {
          let result_getRelationTargets_1_$f, ctx_1_$f = world[$internal], relationCtx_1_$f = relation2[$internal], traitData_1_$f = ctx_1_$f.traitInstances[relationCtx_1_$f.trait.id];
          if (!traitData_1_$f || !traitData_1_$f.relationTargets)
            result_getRelationTargets_1_$f = [];
          else {
            let eid_1_$f = currentEntity & ENTITY_ID_MASK;
            if (relationCtx_1_$f.exclusive) {
              let target_1_$f = traitData_1_$f.relationTargets[eid_1_$f];
              result_getRelationTargets_1_$f = target_1_$f !== void 0 ? [target_1_$f] : [];
            } else {
              let targets_1_$f = traitData_1_$f.relationTargets[eid_1_$f];
              result_getRelationTargets_1_$f = targets_1_$f !== void 0 ? targets_1_$f.slice() : [];
            }
          }
          let targets = result_getRelationTargets_1_$f;
          for (let target of targets) {
            if (!world.has(target))
              continue;
            if (!processedEntities.has(target))
              entityQueue.push(target);
          }
        }
      }
      let entityTraits = ctx.entityTraits.get(currentEntity);
      if (entityTraits)
        for (let trait2 of entityTraits)
          removeTrait(world, currentEntity, trait2);
      releaseEntity(ctx.entityIndex, currentEntity);
      let allQuery = ctx.queriesHashMap.get("");
      if (allQuery)
        allQuery.remove(world, currentEntity);
      ctx.entityTraits.delete(currentEntity);
      let eid = currentEntity & ENTITY_ID_MASK;
      for (let i = 0;i < ctx.entityMasks.length; i++)
        ctx.entityMasks[i][eid] = 0;
    }
  }
  function createWorld(optionsOrFirstTrait, ...traits) {
    let id = allocateWorldId(universe.worldIndex), isInitialized = !1, lazyTraits;
    function resolveHookTrait(input) {
      if (input?.[$relationPair])
        return input.relation[$internal].trait;
      if (input?.[$relation])
        return input[$internal].trait;
      return input;
    }
    function resolveHookCallback(input, callback) {
      if (input?.[$relationPair]) {
        let pairTargetQuery = input.targetQuery;
        if (pairTargetQuery) {
          let targetQuery = pairTargetQuery?.[$queryRef] ? pairTargetQuery : createQuery(...pairTargetQuery);
          return (entity, target) => {
            if (target !== void 0 && world.query(targetQuery).includes(target))
              callback(entity, target);
          };
        }
        let pairTarget = input.target;
        if (pairTarget === "*")
          return callback;
        return (entity, target) => {
          if (target === pairTarget)
            callback(entity, target);
        };
      }
      return callback;
    }
    let world = {
      [$internal]: {
        entityIndex: createEntityIndex(id),
        entityMasks: [[]],
        entityTraits: /* @__PURE__ */ new Map,
        bitflag: 1,
        traitInstances: [],
        relations: /* @__PURE__ */ new Set,
        queriesHashMap: /* @__PURE__ */ new Map,
        queryInstances: [],
        actionInstances: [],
        notQueries: /* @__PURE__ */ new Set,
        dirtyQueries: /* @__PURE__ */ new Set,
        dirtyMasks: /* @__PURE__ */ new Map,
        trackingSnapshots: /* @__PURE__ */ new Map,
        changedMasks: /* @__PURE__ */ new Map,
        worldEntity: null,
        trackedTraits: /* @__PURE__ */ new Set,
        resetSubscriptions: /* @__PURE__ */ new Set
      },
      traits: /* @__PURE__ */ new Set,
      init(...initTraits) {
        let ctx = world[$internal];
        if (isInitialized)
          return;
        isInitialized = !0, universe.worlds[id] = world;
        let cursor2 = getTrackingCursor();
        for (let i = 0;i < cursor2; i++)
          setTrackingMasks(world, i);
        let traitId_4_$f = IsExcluded.id;
        if (!(traitId_4_$f < ctx.traitInstances.length && ctx.traitInstances[traitId_4_$f] !== void 0))
          registerTrait(world, IsExcluded);
        if (lazyTraits)
          initTraits = lazyTraits, lazyTraits = void 0;
        ctx.worldEntity = createEntity(world, IsExcluded, ...initTraits);
      },
      spawn(...spawnTraits) {
        return createEntity(world, ...spawnTraits);
      },
      has(target) {
        let result_isEntityAlive_5_$f, denseIndex_5_$f = world[$internal].entityIndex.sparse[target & ENTITY_ID_MASK];
        if (denseIndex_5_$f === void 0 || denseIndex_5_$f >= world[$internal].entityIndex.aliveCount)
          result_isEntityAlive_5_$f = !1;
        else {
          let storedEntity_5_$f = world[$internal].entityIndex.dense[denseIndex_5_$f];
          result_isEntityAlive_5_$f = (target >>> GENERATION_SHIFT & GENERATION_MASK) === (storedEntity_5_$f >>> GENERATION_SHIFT & GENERATION_MASK) && target >>> WORLD_ID_SHIFT === world[$internal].entityIndex.worldId;
        }
        return typeof target === "number" ? result_isEntityAlive_5_$f : hasTrait(world, world[$internal].worldEntity, target);
      },
      add(...addTraits) {
        addTrait(world, world[$internal].worldEntity, ...addTraits);
      },
      remove(...removeTraits) {
        removeTrait(world, world[$internal].worldEntity, ...removeTraits);
      },
      get(trait2) {
        return getTrait(world, world[$internal].worldEntity, trait2);
      },
      set(trait2, value) {
        setTrait(world, world[$internal].worldEntity, trait2, value, !0);
      },
      destroy() {
        destroyEntity(world, world[$internal].worldEntity), world[$internal].worldEntity = null, world.reset(), isInitialized = !1, releaseWorldId(universe.worldIndex, id), universe.worlds[id] = null;
      },
      reset() {
        lazyTraits = void 0;
        let ctx = world[$internal];
        world.entities.forEach((entity) => {
          if (world.has(entity))
            destroyEntity(world, entity);
        }), ctx.entityIndex = createEntityIndex(id), ctx.entityTraits.clear(), ctx.entityMasks = [[]], ctx.bitflag = 1;
        for (let query of ctx.queriesHashMap.values())
          for (let i = 0;i < query.cleanup.length; i++)
            query.cleanup[i]();
        ctx.traitInstances.length = 0, world.traits.clear(), ctx.relations.clear(), ctx.queriesHashMap.clear(), ctx.queryInstances.length = 0, ctx.actionInstances.length = 0, ctx.dirtyQueries.clear(), ctx.notQueries.clear(), ctx.trackingSnapshots.clear(), ctx.dirtyMasks.clear(), ctx.changedMasks.clear(), ctx.trackedTraits.clear(), ctx.worldEntity = createEntity(world, IsExcluded);
        for (let sub of ctx.resetSubscriptions)
          sub(world);
      },
      query(...args) {
        let ctx = world[$internal];
        if (args.length === 1 && args[0]?.[$queryRef]) {
          let queryRef = args[0], query = ctx.queryInstances[queryRef.id];
          if (query)
            return query.run(world, queryRef.parameters);
          if (query = ctx.queriesHashMap.get(queryRef.hash), !query) {
            if (query = createQueryInstance(world, queryRef.parameters), ctx.queriesHashMap.set(queryRef.hash, query), queryRef.id >= ctx.queryInstances.length)
              ctx.queryInstances.length = queryRef.id + 1;
            ctx.queryInstances[queryRef.id] = query;
          }
          return query.run(world, queryRef.parameters);
        } else {
          let params = args;
          if (params.length === 1 && params[0]?.[$relationPair]) {
            let relation2 = params[0].relation, target = params[0].target;
            if (!params[0].targetQuery && typeof target === "number") {
              let entities = getEntitiesWithRelationTo(world, relation2, target);
              return createRelationOnlyQueryResult(entities);
            }
          }
          let hash = createQueryHash(params), query = ctx.queriesHashMap.get(hash);
          if (!query)
            query = createQueryInstance(world, params), ctx.queriesHashMap.set(hash, query);
          return query.run(world, params);
        }
      },
      queryFirst(...args) {
        return world.query(...args)[0];
      },
      onQueryAdd(args, callback) {
        let ctx = world[$internal], query;
        if (args?.[$queryRef]) {
          let queryRef = args;
          if (query = ctx.queryInstances[queryRef.id] || ctx.queriesHashMap.get(queryRef.hash), !query) {
            if (query = createQueryInstance(world, queryRef.parameters), ctx.queriesHashMap.set(queryRef.hash, query), queryRef.id >= ctx.queryInstances.length)
              ctx.queryInstances.length = queryRef.id + 1;
            ctx.queryInstances[queryRef.id] = query;
          }
        } else {
          let hash = createQueryHash(args);
          if (query = ctx.queriesHashMap.get(hash), !query)
            query = createQueryInstance(world, args), ctx.queriesHashMap.set(hash, query);
        }
        return query.addSubscriptions.add(callback), () => query.addSubscriptions.delete(callback);
      },
      onQueryRemove(args, callback) {
        let ctx = world[$internal], query;
        if (args?.[$queryRef]) {
          let queryRef = args;
          if (query = ctx.queryInstances[queryRef.id] || ctx.queriesHashMap.get(queryRef.hash), !query) {
            if (query = createQueryInstance(world, queryRef.parameters), ctx.queriesHashMap.set(queryRef.hash, query), queryRef.id >= ctx.queryInstances.length)
              ctx.queryInstances.length = queryRef.id + 1;
            ctx.queryInstances[queryRef.id] = query;
          }
        } else {
          let hash = createQueryHash(args);
          if (query = ctx.queriesHashMap.get(hash), !query)
            query = createQueryInstance(world, args), ctx.queriesHashMap.set(hash, query);
        }
        return query.removeSubscriptions.add(callback), () => query.removeSubscriptions.delete(callback);
      },
      onAdd(trait2, callback) {
        let ctx = world[$internal], resolvedTrait = resolveHookTrait(trait2), resolvedCallback = resolveHookCallback(trait2, callback), data = ctx.traitInstances[resolvedTrait.id];
        if (!data)
          registerTrait(world, resolvedTrait), data = ctx.traitInstances[resolvedTrait.id];
        return data.addSubscriptions.add(resolvedCallback), () => data.addSubscriptions.delete(resolvedCallback);
      },
      onRemove(trait2, callback) {
        let ctx = world[$internal], resolvedTrait = resolveHookTrait(trait2), resolvedCallback = resolveHookCallback(trait2, callback), data = ctx.traitInstances[resolvedTrait.id];
        if (!data)
          registerTrait(world, resolvedTrait), data = ctx.traitInstances[resolvedTrait.id];
        return data.removeSubscriptions.add(resolvedCallback), () => data.removeSubscriptions.delete(resolvedCallback);
      },
      onChange(trait2, callback) {
        let ctx = world[$internal], resolvedTrait = resolveHookTrait(trait2), resolvedCallback = resolveHookCallback(trait2, callback), traitId_19_$f = resolvedTrait.id;
        if (!(traitId_19_$f < ctx.traitInstances.length && ctx.traitInstances[traitId_19_$f] !== void 0))
          registerTrait(world, resolvedTrait);
        let data = ctx.traitInstances[resolvedTrait.id];
        return data.changeSubscriptions.add(resolvedCallback), ctx.trackedTraits.add(resolvedTrait), () => {
          if (data.changeSubscriptions.delete(resolvedCallback), data.changeSubscriptions.size === 0)
            ctx.trackedTraits.delete(resolvedTrait);
        };
      }
    };
    if (Object.defineProperty(world, "id", {
      get: () => id,
      enumerable: !0
    }), Object.defineProperty(world, "isInitialized", {
      get: () => isInitialized,
      enumerable: !0
    }), Object.defineProperty(world, "entities", {
      get: () => getAliveEntities(world[$internal].entityIndex),
      enumerable: !0
    }), optionsOrFirstTrait && typeof optionsOrFirstTrait === "object" && !Array.isArray(optionsOrFirstTrait)) {
      let {
        traits: optionTraits = [],
        lazy = !1
      } = optionsOrFirstTrait;
      if (!lazy)
        world.init(...optionTraits);
      else
        lazyTraits = optionTraits;
    } else
      world.init(...optionsOrFirstTrait ? [optionsOrFirstTrait, ...traits] : traits);
    return world;
  }

  // packages/app/src/world/traits.ts
  var Clock = trait({ now: 0, dt: 0 }), Count = trait({ given: 0 }), Pile = trait({ issued: 100, remaining: 100 }), Pouring = trait({ direction: 1, startedAt: 0, acc: 0, emitted: 1, lastSoftAt: 0 }), PouringInto = relation({ exclusive: !0 }), SoundEvent = trait({ token: "ui.tap", pitchStep: 0, level: 0, action: "trigger", durationMs: 0, rate: 0 }), Hop = trait({ from: "", to: "", reverse: !1 }), IsOwn = trait(), Asleep = trait(), Identity = trait({ id: "", address: "", variant: 0, seed: "", parameters: () => generateCritter2(`0x${"0".repeat(40)}`, 0) }), Name = trait({ display: "" }), Owner = trait({ address: "" }), Phase = trait({ name: "scattering", gatheringEndsAt: 0, scatteringEndsAt: 0 }), Settings = trait({ effects: !0, music: !0, still: !1, simple: !1, reducedMotion: !1 }), Viewer = trait({ address: "" }), Received = trait({ crumbs: 0, share: () => [0, 1], fed: 0, mood: 0 }), Rig = trait({ scaleX: 1, scaleY: 1, scaleZ: 1, leanZ: 0, postureX: 0, headTilt: 0, earL: 0, earR: 0, lids: 1, mouth: 0, cheeks: 0, pupilX: 0, pupilY: 0, liftY: 0 }), Feast = trait({ beat: "Laid out", startedAt: 0, index: -1, skipped: !1 }), Bump = trait({ t: 0, fromX: 1.08, fromY: 0.92, fromZ: 1.08 }), Chewing = trait({ rate: 0, releasedAt: -1 }), Mesh = trait(() => null), Portrait = trait(() => null), Flight = trait({ t: 0, x: 0, y: 0, z: 0, startX: -1, startY: 0, startZ: 0, endX: 0, endY: 1, endZ: 0, reverse: !1 }), FlyingTo = relation({ autoDestroy: "source" }), StatementReveal = trait({ daylight: 0, ready: !1 }), Delight = trait({ level: 0 });

  // packages/app/src/world/reveal.ts
  function createReveal(world, critters) {
    let start = null;
    return {
      begin() {
        if (start !== null)
          return;
        start = world.get(Clock).now, world.add(StatementReveal), world.spawn(SoundEvent({ token: "statements.reveal", level: -10 }));
      },
      tick() {
        if (start === null)
          return;
        let now = world.get(Clock).now - start, settings = world.get(Settings), quiet = settings.still || settings.reducedMotion, step = Math.min(STATEMENTS_REVEAL.staggerMs, Math.max(0, (STATEMENTS_FOCUS_MS - STATEMENTS_REVEAL.wakeStartMs - WAKE.ms) / Math.max(1, critters.length - 1)));
        critters.forEach((entity, index) => {
          if (now >= (quiet ? 0 : STATEMENTS_REVEAL.wakeStartMs + step * index) && !entity.has(IsOwn) && entity.has(Asleep))
            entity.remove(Asleep);
        }), world.set(StatementReveal, { daylight: Math.min(1, now / (quiet ? STATEMENTS_REVEAL.reducedMs : STATEMENTS_REVEAL.lightMs)), ready: now >= (quiet ? STATEMENTS_REVEAL.reducedMs : STATEMENTS_FOCUS_MS) });
      }
    };
  }

  // packages/app/src/world/director.ts
  function createDirector(world, critters) {
    let targetIds = critters.map((critter) => critter.get(Identity).id), stagger = critters.length < 2 ? 0 : Math.min(FEAST.waveStaggerMs, (FEAST.maxMs - FEAST.waveStartMs - FEAST.feedMs - FEAST.settleDelayMs - FEAST.settleLightMs) / (critters.length - 1)), wakeStagger = critters.length < 2 ? 0 : Math.min(FEAST.wakeStaggerMs, (FEAST.waveStartMs - FEAST.wakeStartMs - WAKE.ms) / (critters.length - 1)), run = () => world.query(Feast)[0], hasCrumbs = () => critters.some((critter) => critter.isAlive() && critter.get(Received).crumbs > 0), transitionFrom = { dusk: 1, feast: 0, day: 0 }, still = () => {
      let settings = world.get(Settings);
      return settings.still || settings.reducedMotion;
    };
    function start() {
      transitionFrom = { dusk: 1, feast: 0, day: 0 }, run()?.destroy(), world.spawn(Feast({ beat: still() ? "Crossfade" : "Laid out", startedAt: world.get(Clock).now }));
      for (let critter of critters) {
        if (!critter.isAlive())
          continue;
        if (still())
          critter.remove(Asleep);
        else
          critter.add(Asleep);
      }
      if (still())
        world.spawn(SoundEvent({ token: "feast.settle", level: -8 }));
      else
        world.spawn(SoundEvent({ token: "feast.open", level: -8 }));
    }
    function begin(result) {
      if (result.totals.length !== critters.length || result.totals.some((total, i) => total.targetId !== targetIds[i]))
        throw RangeError("Feast result must use the world target order");
      for (let [index, critter] of critters.entries()) {
        if (!critter.isAlive())
          continue;
        let total = result.totals[index], share = total.share[0] / total.share[1], fed = Math.min(1, Math.max(0, share * critters.length / GROWTH.fairShareCap)) ** GROWTH.exponent;
        critter.set(Received, { crumbs: total.crumbs, share: [...total.share], fed, mood: total.crumbs > 0 ? Math.max(GROWTH.minimumContentMood, fed) : 0 }), critter.add(Asleep);
      }
      start();
    }
    function timing() {
      if (!hasCrumbs())
        return { stagger: 0, settle: FEAST.wakeEndMs + FEAST.settleDelayMs, readable: FEAST.wakeEndMs + FEAST.settleDelayMs + FEAST.settleLightMs };
      let waveEnd = FEAST.waveStartMs + Math.max(0, critters.length - 1) * stagger + FEAST.feedMs;
      return { stagger, settle: waveEnd + FEAST.settleDelayMs, readable: waveEnd + FEAST.settleDelayMs + FEAST.settleLightMs };
    }
    function tick() {
      let entity = run(), state = entity?.get(Feast);
      if (!entity || !state || state.beat === "Readable")
        return;
      let elapsed = world.get(Clock).now - state.startedAt;
      if (state.beat === "Skipping" || state.beat === "Crossfade") {
        if (elapsed >= (state.beat === "Skipping" ? FEAST.skipMs : FEAST.reducedMs))
          entity.set(Feast, { beat: "Readable" });
        return;
      }
      if (still()) {
        transitionFrom = lighting(), entity.set(Feast, { beat: "Crossfade", startedAt: world.get(Clock).now });
        for (let critter of critters)
          if (critter.isAlive())
            critter.remove(Asleep);
        world.spawn(SoundEvent({ token: "feast.open", action: "stop", durationMs: FEAST.skipSoundMs })), world.spawn(SoundEvent({ token: "feast.settle", level: -8 }));
        return;
      }
      let times = timing();
      for (let [index, critter] of critters.entries()) {
        if (!critter.isAlive())
          continue;
        if (elapsed >= FEAST.wakeStartMs + index * wakeStagger)
          critter.remove(Asleep);
      }
      if (hasCrumbs() && elapsed >= FEAST.waveStartMs && state.beat !== "Settle") {
        let next = Math.min(critters.length - 1, times.stagger === 0 ? 0 : Math.floor((elapsed - FEAST.waveStartMs) / times.stagger));
        for (let index = state.index + 1;index <= next; index++) {
          let critter = critters[index];
          if (!critter.isAlive())
            continue;
          let received = critter.get(Received);
          if (received.crumbs > 0)
            world.spawn(SoundEvent({ token: "feast.feed", pitchStep: Math.min(10, Math.max(1, Math.floor(received.share[0] / received.share[1] / 0.05))), level: -8 })), world.spawn(Hop({ from: "feast", to: critter.get(Identity).id })), critter.add(Chewing({
              rate: POUR_RATE_MIN + (POUR_RATE_MAX - POUR_RATE_MIN) * received.share[0] / received.share[1],
              releasedAt: state.startedAt + FEAST.waveStartMs + index * stagger + FEAST.feedMs
            }));
        }
        entity.set(Feast, { beat: "Wave", index: next });
      } else if (elapsed >= FEAST.wakeStartMs && state.beat === "Laid out")
        entity.set(Feast, { beat: "Waking" });
      let maximum = Math.max(0, ...critters.map((critter) => critter.isAlive() ? critter.get(Received).crumbs : 0)), previousElapsed = elapsed - world.get(Clock).dt;
      if (maximum > 0)
        for (let [index, critter] of critters.entries()) {
          if (!critter.isAlive())
            continue;
          let crumbs = critter.get(Received).crumbs;
          if (crumbs === 0)
            continue;
          let hopCount = Math.max(FEAST.minHops, Math.round(FEAST.hops[1] * crumbs / maximum));
          for (let hop = 1;hop < hopCount; hop++) {
            let at = FEAST.waveStartMs + index * stagger + hop / (hopCount - 1) * FEAST.hopStreamMs;
            if (at > previousElapsed && at <= elapsed && world.query(Hop).length < DOM_HOP.maxAlive)
              world.spawn(Hop({ from: "feast", to: critter.get(Identity).id }));
          }
        }
      if (elapsed >= times.settle && state.beat !== "Settle")
        entity.set(Feast, { beat: "Settle" }), world.spawn(SoundEvent({ token: "feast.settle", level: hasCrumbs() ? -8 : -14 }));
      if (elapsed >= times.readable)
        entity.set(Feast, { beat: "Readable" });
    }
    function growth(index) {
      let state = run()?.get(Feast);
      if (!state || ["Readable", "Crossfade", "Skipping"].includes(state.beat))
        return 1;
      let age = world.get(Clock).now - state.startedAt - FEAST.waveStartMs - index * stagger, target = 1 + GROWTH.scaleGain * critters[index].get(Received).fed;
      if (target === 1)
        return 1;
      let ease = (value) => {
        let t = Math.min(1, Math.max(0, value));
        return t * t * (3 - 2 * t);
      };
      return ((age <= FEAST.growPeakMs ? 1 + (target * (1 + FEAST.growOvershoot) - 1) * ease(age / FEAST.growPeakMs) : target + target * FEAST.growOvershoot * (1 - ease((age - FEAST.growPeakMs) / (FEAST.feedMs - FEAST.growPeakMs)))) - 1) / (target - 1);
    }
    function skip() {
      let entity = run();
      if (!entity || ["Readable", "Skipping"].includes(entity.get(Feast).beat))
        return;
      transitionFrom = lighting(), entity.set(Feast, { beat: "Skipping", startedAt: world.get(Clock).now, skipped: !0 });
      for (let critter of critters)
        if (critter.isAlive())
          critter.remove(Asleep);
      world.spawn(SoundEvent({ token: "feast.open", action: "stop", durationMs: FEAST.skipSoundMs }));
    }
    function replay() {
      if (run())
        start();
    }
    function settleAge() {
      let state = run()?.get(Feast);
      return !state || state.skipped || still() || !hasCrumbs() ? -1 : world.get(Clock).now - state.startedAt - timing().settle;
    }
    function lighting() {
      let state = run()?.get(Feast);
      if (!state || state.beat === "Readable")
        return { dusk: 0, feast: 0, day: 1 };
      let elapsed = world.get(Clock).now - state.startedAt, times = timing(), clamp = (value) => Math.min(1, Math.max(0, value));
      if (state.beat === "Skipping" || state.beat === "Crossfade") {
        let t = clamp(elapsed / (state.beat === "Skipping" ? FEAST.skipMs : FEAST.reducedMs));
        return { dusk: transitionFrom.dusk * (1 - t), feast: transitionFrom.feast * (1 - t), day: transitionFrom.day * (1 - t) + t };
      }
      if (state.beat === "Settle") {
        let t = clamp((elapsed - times.settle) / FEAST.settleLightMs);
        return { dusk: 0, feast: 1 - t, day: t };
      }
      let t = clamp((elapsed - FEAST.waveStartMs) / Math.max(1, times.settle - FEAST.settleDelayMs - FEAST.waveStartMs));
      return { dusk: 1 - t, feast: t, day: 0 };
    }
    function presentation() {
      let state = run()?.get(Feast);
      if (!state)
        return null;
      let elapsed = world.get(Clock).now - state.startedAt, final = ["Settle", "Readable", "Skipping", "Crossfade"].includes(state.beat), amounts = critters.map((critter) => critter.isAlive() ? critter.get(Received).crumbs : 0), total = amounts.reduce((sum, value) => sum + value, 0), counts = amounts.map((amount, index) => final ? amount : Math.round(amount * Math.min(1, Math.max(0, (elapsed - FEAST.waveStartMs - index * stagger) / FEAST.hopStreamMs)))), fill = Math.min(1, Math.max(0, elapsed / FEAST.fillMs));
      return { lighting: lighting(), counts, heapTotal: final ? total : Math.round(total * fill), heapFraction: final || !total ? 0 : fill * Math.max(1 / FEAST.glyphs, 1 - counts.reduce((sum, value) => sum + value, 0) / total), settled: state.beat === "Settle" || state.beat === "Readable" };
    }
    return { presentation, begin, tick, growth, skip, replay, settleAge, playing: () => !!run() && run().get(Feast).beat !== "Readable", hasRun: () => !!run() };
  }

  // packages/app/src/world/motion.ts
  var Waking = trait({ t: 0 }), clamp = (value, min, max) => Math.max(min, Math.min(max, value)), ease = (value) => {
    let t = clamp(value, 0, 1);
    return t * t * (3 - 2 * t);
  };
  function createMotion(world, critters, director) {
    let idleMotion = !0, targets = /* @__PURE__ */ new Map, unwatch = world.onRemove(Asleep, (critter) => {
      if (critter.isAlive() && critter.has(Identity))
        critter.add(Waking({ t: world.get(Clock).now }));
    });
    function bump(critter, at = world.get(Clock).now) {
      let current = critter.get(Rig), previous = critter.get(Bump), base = 1 + GROWTH.scaleGain * critter.get(Received).fed, update = {
        t: at,
        fromX: previous ? current.scaleX / base : BUMP[0][1],
        fromY: previous ? current.scaleY / base : BUMP[0][2],
        fromZ: previous ? current.scaleZ / base : BUMP[0][3]
      };
      if (previous)
        critter.set(Bump, update);
      else
        critter.add(Bump(update));
    }
    function expression() {
      let settleAge = director.settleAge(), playing = director.playing();
      for (let [index, critter] of critters.entries()) {
        if (!critter.isAlive()) {
          targets.delete(critter);
          continue;
        }
        let received = critter.get(Received), identity = critter.get(Identity).parameters, asleep = critter.has(Asleep), amount = director.growth(index), mood = Math.max(received.mood * Math.min(1, amount), asleep ? 0 : world.get(Delight)?.level ?? 0), scale = 1 + GROWTH.scaleGain * received.fed * amount, lower = EXPRESSION[Math.min(EXPRESSION.length - 1, Math.floor(mood * 4))], upper = EXPRESSION[Math.min(EXPRESSION.length - 1, Math.floor(mood * 4) + 1)], progress = upper.mood === lower.mood ? 0 : (mood - lower.mood) / (upper.mood - lower.mood), blend = (key) => lower[key] + (upper[key] - lower[key]) * progress, ears = asleep ? -IDLE.asleep.earDroop : blend("earLift"), target = {
          scaleX: scale,
          scaleY: scale,
          scaleZ: scale,
          leanZ: 0,
          liftY: 0,
          headTilt: identity.headTilt * blend("tiltFactor"),
          earL: ears,
          earR: ears,
          postureX: blend("posture"),
          lids: asleep ? RIG.lid[0] : 1 - blend("squint"),
          mouth: mood >= RIG.mouthThreshold ? blend("mouth") : 0,
          cheeks: identity.cheeks || received.fed * amount >= RIG.cheekThreshold || mood >= 0.5 ? Math.max(1, blend("cheekScale")) : 0,
          pupilX: 0,
          pupilY: 0
        }, bump = critter.get(Bump), settings = world.get(Settings), now = world.get(Clock).now, moving = !settings.still && !settings.reducedMotion;
        if (moving && idleMotion) {
          let phase = identity.idlePhase, radians = phase * Math.PI * 2, idle = asleep ? IDLE.asleep : mood >= IDLE.pleased.threshold ? IDLE.pleased : IDLE.awake;
          if (target.scaleY *= 1 + idle.breath * Math.sin(now / 1000 * Math.PI * 2 * idle.breathHz + radians), target.leanZ = asleep ? 0 : idle.wobble * Math.sin(now / 1000 * Math.PI * 2 * ("wobbleHz" in idle ? idle.wobbleHz : 0) + radians), asleep) {
            let nodAge = (now + phase * IDLE.asleep.nodEveryMs) % IDLE.asleep.nodEveryMs;
            if (nodAge < IDLE.asleep.nodMs)
              target.headTilt += IDLE.asleep.nod * Math.sin(Math.PI * nodAge / IDLE.asleep.nodMs);
          } else {
            let blinkPeriod = IDLE.blinkEveryMs[0] + phase * (IDLE.blinkEveryMs[1] - IDLE.blinkEveryMs[0]), blinkAge = (now + phase * blinkPeriod) % blinkPeriod;
            if (blinkAge < IDLE.blinkMs)
              target.lids = Math.max(RIG.lid[0], target.lids * Math.abs(2 * blinkAge / IDLE.blinkMs - 1));
            let pupilPeriod = IDLE.pupilEveryMs[0] + phase * (IDLE.pupilEveryMs[1] - IDLE.pupilEveryMs[0]);
            if (target.pupilX = IDLE.pupilDrift * Math.sin(now / pupilPeriod * Math.PI * 2 + radians), target.pupilY = IDLE.pupilDrift * Math.cos(now / pupilPeriod * Math.PI * 2 + radians), mood >= IDLE.pleased.threshold && !playing) {
              let hopPeriod = IDLE.pleased.hopEveryMs[0] + phase * (IDLE.pleased.hopEveryMs[1] - IDLE.pleased.hopEveryMs[0]), hopAge = (now + phase * hopPeriod) % hopPeriod;
              if (hopAge < IDLE.pleased.hopMs) {
                let hop = Math.sin(Math.PI * hopAge / IDLE.pleased.hopMs);
                target.scaleX *= 1 + (IDLE.pleased.hopScale[0] - 1) * hop, target.scaleY *= 1 + (IDLE.pleased.hopScale[1] - 1) * hop, target.liftY = IDLE.pleased.hopHeight * hop;
              }
            }
            if (mood >= 1) {
              let wiggleAge = (now + phase * DELIGHTED.wiggleEveryMs) % DELIGHTED.wiggleEveryMs;
              if (wiggleAge < IDLE.pleased.hopMs) {
                let wiggle = DELIGHTED.wiggleDegrees * Math.sin(wiggleAge / IDLE.pleased.hopMs * Math.PI * 2);
                target.earL += wiggle, target.earR -= wiggle;
              }
            }
          }
        }
        if (moving && settleAge >= 0 && settleAge < FEAST.settleHopMs) {
          let settle = 1 - ease(settleAge / FEAST.settleHopMs);
          target.scaleX *= 1 + (FEAST.settleScale[0] - 1) * settle, target.scaleY *= 1 + (FEAST.settleScale[1] - 1) * settle, target.liftY = IDLE.pleased.hopHeight * Math.sin(Math.PI * settleAge / FEAST.settleHopMs);
        }
        if (bump) {
          let age = now - bump.t;
          if (age >= BUMP[3][0])
            critter.remove(Bump);
          else if (age >= 0 && !settings.still && !settings.reducedMotion) {
            let keyframes = [[0, bump.fromX, bump.fromY, bump.fromZ], ...BUMP.slice(1)], endIndex = keyframes.findIndex((frame) => frame[0] > age), start = keyframes[endIndex - 1], end = keyframes[endIndex], progress = (age - start[0]) / (end[0] - start[0]);
            if (target.scaleX *= start[1] + (end[1] - start[1]) * progress, target.scaleY *= start[2] + (end[2] - start[2]) * progress, target.scaleZ *= start[3] + (end[3] - start[3]) * progress, age < CRUMB_GAZE.ms)
              target.pupilX = -RIG.pupil * (1 - age / CRUMB_GAZE.ms), target.lids += CRUMB_GAZE.lidWiden;
          }
        }
        let chew = critter.get(Chewing);
        if (chew) {
          let strength = chew.releasedAt < 0 ? 1 : clamp(1 - (now - chew.releasedAt) / CHEW.decayMs, 0, 1);
          if (strength === 0)
            critter.remove(Chewing);
          else if (!settings.still && !settings.reducedMotion) {
            let wave = Math.sin(now / 1000 * Math.PI * 2 * Math.min(CHEW.maxHz, chew.rate * CHEW.rateFraction)) * strength;
            target.scaleY *= 1 + wave * CHEW.amplitude, target.earL += wave * CHEW.earDegrees, target.earR += wave * CHEW.earDegrees, target.cheeks *= 1 + (CHEW.cheekScale - 1) * strength, target.mouth = Math.min(1, target.mouth + CHEW.mouthAdd * strength);
          }
        }
        let waking = critter.get(Waking);
        if (waking) {
          let age = now - waking.t;
          if (age >= WAKE.ms || !moving)
            critter.remove(Waking);
          else {
            if (target.lids = RIG.lid[0] + (1 - blend("squint") - RIG.lid[0]) * (1 - (1 - clamp(age / WAKE.lidEndMs, 0, 1)) ** 3), age < WAKE.earEndMs) {
              let t = Math.max(0, age - WAKE.earStartMs) / 1000, damping = WAKE.damping / 2, frequency = Math.sqrt(WAKE.stiffness - damping * damping), spring = 1 - Math.exp(-damping * t) * (Math.cos(frequency * t) + damping / frequency * Math.sin(frequency * t));
              target.earL = target.earR = Math.min(blend("earLift") + WAKE.overshootDegrees, -IDLE.asleep.earDroop + (blend("earLift") + IDLE.asleep.earDroop) * spring);
            }
            let stretch = age < WAKE.stretchStartMs ? ease(age / WAKE.stretchStartMs) : 1 - ease((age - WAKE.stretchStartMs) / (WAKE.stretchEndMs - WAKE.stretchStartMs));
            target.scaleX *= 1 + (WAKE.stretch[0] - 1) * stretch, target.scaleY *= 1 + (WAKE.stretch[1] - 1) * stretch, target.scaleZ *= 1 + (WAKE.stretch[2] - 1) * stretch, target.headTilt += IDLE.asleep.nod * (1 - ease((age - WAKE.headStartMs) / (WAKE.ms - WAKE.headStartMs)));
          }
        }
        target.scaleX = clamp(target.scaleX, ...RIG.scale), target.scaleY = clamp(target.scaleY, ...RIG.scale), target.scaleZ = clamp(target.scaleZ, ...RIG.scale), target.leanZ = clamp(target.leanZ, -RIG.lean, RIG.lean), target.lids = clamp(target.lids, ...RIG.lid), targets.set(critter, target);
      }
    }
    function rig() {
      for (let [critter, target] of targets)
        critter.set(Rig, target);
    }
    function chew(critter, rate) {
      if (critter.remove(Bump), critter.has(Chewing))
        critter.set(Chewing, { rate, releasedAt: -1 });
      else
        critter.add(Chewing({ rate, releasedAt: -1 }));
    }
    function release(critter) {
      if (critter.has(Chewing))
        critter.set(Chewing, { releasedAt: world.get(Clock).now });
    }
    function reset() {
      for (let critter of critters)
        if (critter.isAlive())
          critter.remove(Bump, Chewing, Waking);
    }
    return { isAnimating: () => world.query(Bump).length > 0 || world.query(Chewing).length > 0 || world.query(Waking).length > 0, bump, chew, release, expression, rig, reset, setIdleMotion(value) {
      idleMotion = value;
    }, destroy: unwatch };
  }

  // packages/app/src/world/circle.ts
  var Facing = trait({ side: 1 }), Play = trait({ startedAt: 0 }), Stir = trait({ startedAt: 0 }), Circle = trait({ from: 0, to: 0, startedAt: 0, progress: 1, huddle: !1 });
  function createCircleMotion(world, critters) {
    world.add(Circle);
    let quiet = () => {
      let settings = world.get(Settings);
      return settings.still || settings.reducedMotion;
    };
    return {
      turn(from, to) {
        world.set(Circle, { from, to, startedAt: world.get(Clock).now, progress: quiet() ? 1 : 0 });
      },
      play(entity) {
        if (quiet() || !critters.includes(entity))
          return;
        if (entity.has(Play))
          entity.set(Play, { startedAt: world.get(Clock).now });
        else
          entity.add(Play({ startedAt: world.get(Clock).now }));
      },
      progress() {
        return world.get(Circle).progress;
      },
      huddle(value) {
        world.set(Circle, { huddle: value });
      },
      stir(entity) {
        if (!critters.includes(entity))
          return;
        if (!quiet()) {
          let side = -(entity.get(Facing)?.side ?? 1);
          if (entity.has(Facing))
            entity.set(Facing, { side });
          else
            entity.add(Facing({ side }));
        }
        if (entity.has(Stir))
          entity.set(Stir, { startedAt: world.get(Clock).now });
        else
          entity.add(Stir({ startedAt: world.get(Clock).now }));
      },
      facing(entity) {
        return entity.get(Facing)?.side ?? 1;
      },
      sleepGlyphs(entity) {
        let stir = entity.get(Stir), age = stir ? world.get(Clock).now - stir.startedAt : -1;
        return [0, 1, 2].map((index) => {
          let elapsed = age - index * CIRCLE_FEEL.sleepReleaseMs, t = Math.min(1, Math.max(0, elapsed / CIRCLE_FEEL.sleepLifeMs));
          return { visible: !!stir && elapsed >= 0 && elapsed < CIRCLE_FEEL.sleepLifeMs, opacity: 1 - t, x: quiet() ? 0 : t * CIRCLE_FEEL.sleepDriftX, y: quiet() ? 0 : -t * CIRCLE_FEEL.sleepDriftY };
        });
      },
      sleeping(entity) {
        return entity.has(Stir);
      },
      isAnimating() {
        return world.get(Circle).progress < 1 || world.query(Stir).length > 0 || world.query(Play).length > 0;
      },
      tick() {
        let now = world.get(Clock).now, state = world.get(Circle), t = quiet() ? 1 : Math.min(1, (now - state.startedAt) / CIRCLE_FEEL.turnMs);
        world.set(Circle, { progress: t * t * (3 - 2 * t) });
        for (let entity of critters) {
          let rig = entity.get(Rig), stir = entity.get(Stir);
          if (stir) {
            let age = now - stir.startedAt;
            if (age >= CIRCLE_FEEL.sleepGlyphMs)
              entity.remove(Stir);
            else if (!quiet())
              entity.set(Rig, { headTilt: rig.headTilt + 18 * Math.sin(Math.PI * Math.min(1, age / CIRCLE_FEEL.stirMs)), leanZ: rig.leanZ + 5 * Math.sin(age / CIRCLE_FEEL.stirMs * Math.PI * 2) });
          }
          let play = entity.get(Play);
          if (play) {
            let age = now - play.startedAt;
            if (age >= CIRCLE_FEEL.playMs || quiet())
              entity.remove(Play);
            else
              entity.set(Rig, { liftY: rig.liftY + 0.13043478260869565 * Math.sin(Math.PI * age / CIRCLE_FEEL.playMs) });
          }
          if (state.huddle && !quiet()) {
            let seed = entity.get(Identity).parameters.idlePhase, period = CIRCLE_FEEL.playEveryMs[0] + seed * (CIRCLE_FEEL.playEveryMs[1] - CIRCLE_FEEL.playEveryMs[0]), age = (now + seed * period) % period;
            if (age < CIRCLE_FEEL.playMs)
              entity.set(Rig, { liftY: rig.liftY + 0.13043478260869565 * Math.sin(Math.PI * age / CIRCLE_FEEL.playMs), headTilt: rig.headTilt + 5 * Math.sin(age / CIRCLE_FEEL.playMs * Math.PI * 2) });
          }
        }
      }
    };
  }

  // packages/app/src/app/hop-geometry.ts
  var curve3 = DOM_HOP.ease, cubic = (t, a, b) => 3 * (1 - t) ** 2 * t * a + 3 * (1 - t) * t * t * b + t ** 3;
  function hopProgress(progress) {
    if (progress <= 0 || progress >= 1)
      return Math.max(0, Math.min(1, progress));
    let low = 0, high = 1;
    for (let i = 0;i < 24; i++) {
      let t = (low + high) / 2;
      if (cubic(t, curve3[0], curve3[2]) < progress)
        low = t;
      else
        high = t;
    }
    return cubic((low + high) / 2, curve3[1], curve3[3]);
  }
  function hopPosition(from, to, t) {
    let apex = Math.min(from.y, to.y) - DOM_HOP.apexPx, control = apex - Math.sqrt((from.y - apex) * (to.y - apex));
    return { x: from.x + (to.x - from.x) * t, y: (1 - t) ** 2 * from.y + 2 * (1 - t) * t * control + t * t * to.y };
  }

  // packages/app/src/world/dom-flights.ts
  var DomFlight = trait({ startedAt: 0, fromX: 0, fromY: 0, toX: 0, toY: 0, x: 0, y: 0, rotation: 0, opacity: 1 });
  function tickDomFlights(world) {
    let now = world.get(Clock).now, settings = world.get(Settings);
    for (let entity of world.query(DomFlight)) {
      let state = entity.get(DomFlight), t = Math.min(1, Math.max(0, (now - state.startedAt) / DOM_HOP.ms));
      if (t === 1 || settings.still || settings.reducedMotion) {
        entity.destroy();
        continue;
      }
      let point = hopPosition({ x: state.fromX, y: state.fromY }, { x: state.toX, y: state.toY }, hopProgress(t));
      entity.set(DomFlight, { ...point, rotation: DOM_HOP.turnDegrees * t, opacity: t < DOM_HOP.fadeAt ? 1 : (1 - t) / (1 - DOM_HOP.fadeAt) });
    }
  }

  // packages/app/src/world/flights.ts
  function createFlights(world, bump) {
    function spawn(critter, reverse) {
      let settings = world.get(Settings);
      if (!critter.has(Mesh) || settings.simple || settings.still || settings.reducedMotion || world.query(Flight).length >= FLIGHT.maxAlive)
        return;
      let dimensions = layoutCritter2(critter.get(Identity).parameters), mouth = { x: 0, y: dimensions.headC - dimensions.hr / 3, z: dimensions.hr }, heap = { x: -dimensions.bw * 2, y: 0, z: 0 }, start = reverse ? mouth : heap, end = reverse ? heap : mouth;
      world.spawn(Flight({
        t: world.get(Clock).now,
        ...start,
        startX: start.x,
        startY: start.y,
        startZ: start.z,
        endX: end.x,
        endY: end.y,
        endZ: end.z,
        reverse
      }), FlyingTo(critter));
    }
    function tick() {
      let now = world.get(Clock).now;
      for (let crumb of world.query(Flight)) {
        let state = crumb.get(Flight), target = crumb.targetFor(FlyingTo), progress = Math.max(0, Math.min(1, (now - state.t) / FLIGHT.ms));
        if (!target?.isAlive() || progress === 1) {
          if (target?.isAlive())
            bump(target);
          crumb.destroy();
          continue;
        }
        let apex = Math.max(state.startY, state.endY) + Math.abs(state.endX - state.startX) / 2, t = 1 - progress;
        crumb.set(Flight, {
          x: state.startX * t + state.endX * progress,
          y: t * t * state.startY + 2 * t * progress * apex + progress * progress * state.endY,
          z: state.startZ * t + state.endZ * progress
        });
      }
    }
    return { spawn, tick };
  }

  // packages/app/src/world/index.ts
  function createWorld2(options) {
    if (integer(options.issued, 10, 1000, "setup.crumbs.help"), options.critters.length > MAX_FEAST_TARGETS)
      throw new ValidationError("err.feastCapacity");
    if (new Set(options.critters.map((critter) => critter.id)).size !== options.critters.length)
      throw RangeError("Duplicate critter identity");
    let generated = options.critters.map((value) => generateCritter2(value.address, value.variant, options.critterVersion)), world = createWorld(Clock, Phase, Delight, Settings(options.settings ?? {}), Viewer({ address: options.viewer ?? "" })), heap = world.spawn(Pile({ issued: options.issued, remaining: options.issued })), critters = options.critters.map((value, index) => {
      let entity = world.spawn(Count, Received, Rig, Name({ display: value.name }), Identity({
        id: value.id,
        address: value.address,
        variant: value.variant,
        seed: `${value.address.toLowerCase()}:${value.variant}:${options.critterVersion ?? "1"}`,
        parameters: generated[index]
      })), owner = value.ownerAddress === void 0 ? value.address : value.ownerAddress;
      if (owner)
        entity.add(Owner({ address: owner }));
      if (owner && owner.toLowerCase() === options.viewer?.toLowerCase())
        entity.add(IsOwn, Asleep);
      if (options.asleep)
        entity.add(Asleep);
      return entity;
    }), reveal = createReveal(world, critters), queue = [], previous, lastRemaining = options.issued, director = createDirector(world, critters), circle = createCircleMotion(world, critters), motion = createMotion(world, critters, director), flights = createFlights(world, motion.bump), actions = createActions(() => ({
      beginReveal() {
        queue.push({ type: "reveal" });
      },
      giveCrumb(critter) {
        queue.push({ type: "press", critter, direction: 1, hold: !1 });
      },
      takeCrumb(critter) {
        queue.push({ type: "press", critter, direction: -1, hold: !1 });
      },
      startPour(critter, direction) {
        queue.push({ type: "press", critter, direction, hold: !0 });
      },
      stopPour() {
        queue.push({ type: "stop" });
      },
      suspend() {
        queue.push({ type: "suspend" });
      },
      setIdleMotion(value) {
        queue.push({ type: "idle", value });
      },
      delight(on) {
        queue.push({ type: "delight", on });
      },
      fallAsleep() {
        queue.push({ type: "sleep" });
      },
      setCount(critter, count) {
        queue.push({ type: "count", critter, count });
      },
      setSettings(patch) {
        queue.push({ type: "settings", patch: { ...patch } });
      },
      beginFeast(result) {
        queue.push({ type: "feast", result: structuredClone(result) });
      },
      skipFeast() {
        queue.push({ type: "skip" });
      },
      replayFeast() {
        queue.push({ type: "replay" });
      }
    }))(world);
    function pitch(count) {
      return Math.min(10, Math.max(0, Math.floor(count / (options.issued * 0.05))));
    }
    function emit(token, pitchStep = 0, level = -16, action = "trigger", durationMs = 0, rate = 0) {
      world.spawn(SoundEvent({ token, pitchStep, level, action, durationMs, rate }));
    }
    function hop(critter, direction) {
      if (world.get(Settings).still || world.get(Settings).reducedMotion)
        return;
      world.spawn(Hop({ from: "heap", to: critter.get(Identity).id, reverse: direction < 0 }));
    }
    function stop(reply = !1) {
      let target = heap.targetFor(PouringInto);
      if (target?.isAlive())
        motion.release(target);
      let pouring = heap.get(Pouring);
      if (pouring && pouring.emitted >= REPLY.ticksBeforeHold)
        emit(pouring.direction > 0 ? "pour.hold" : "pour.reverse", target?.isAlive() ? pitch(target.get(Count).given) : 0, -14, "stop", REPLY.releaseFadeMs);
      if (target?.isAlive() && pouring) {
        let step = pitch(target.get(Count).given);
        if (reply && world.get(Clock).now - pouring.startedAt >= HOLD_DELAY_MS)
          emit(pouring.direction > 0 ? "crumb.add" : "crumb.remove", step, pouring.direction > 0 ? -14 : -16), hop(target, pouring.direction), motion.bump(target);
      }
      if (heap.remove(Pouring), target)
        heap.remove(PouringInto(target));
    }
    function wall(critter, direction) {
      return direction > 0 ? heap.get(Pile).remaining === 0 : critter.get(Count).given === 0;
    }
    function give(critter, direction) {
      let pile = heap.get(Pile), count = critter.get(Count);
      if (wall(critter, direction))
        return !1;
      if (critter.set(Count, { given: count.given + direction }), heap.set(Pile, { remaining: pile.remaining - direction }), !heap.has(Pouring))
        motion.bump(critter);
      return flights.spawn(critter, direction < 0), !0;
    }
    function input() {
      for (let action of queue.splice(0)) {
        if (action.type === "idle") {
          motion.setIdleMotion(action.value);
          continue;
        }
        if (action.type === "delight") {
          world.set(Delight, { level: action.on ? DELIGHT_MOOD : 0 });
          continue;
        }
        if (action.type === "sleep") {
          stop();
          for (let critter of critters)
            if (!critter.has(Asleep))
              critter.add(Asleep);
          continue;
        }
        if (action.type === "suspend") {
          stop();
          continue;
        }
        if (action.type === "settings") {
          let before = world.get(Settings);
          if (action.patch.effects === !1 && before.effects || action.patch.still && !before.still || action.patch.reducedMotion && !before.reducedMotion)
            stop();
          world.set(Settings, action.patch);
          continue;
        }
        if (stop(!["feast", "skip", "replay"].includes(action.type)), action.type === "reveal") {
          reveal.begin();
          continue;
        }
        if (action.type === "feast") {
          director.begin(action.result), motion.reset();
          continue;
        }
        if (action.type === "skip" || action.type === "replay") {
          director[action.type](), motion.reset();
          continue;
        }
        if (action.type === "stop")
          continue;
        if (director.hasRun())
          continue;
        if (!critters.includes(action.critter) || !action.critter.isAlive() || action.critter.has(IsOwn))
          continue;
        if (action.type === "count") {
          if (!Number.isFinite(action.count))
            continue;
          let count = action.critter.get(Count).given, pile = heap.get(Pile), next = Math.max(0, Math.min(count + pile.remaining, Math.trunc(action.count)));
          if (action.critter.set(Count, { given: next }), heap.set(Pile, { remaining: pile.remaining + count - next }), next !== count) {
            let duration = Math.min(TYPED_AMOUNT.maxMs, Math.abs(next - count) * TYPED_AMOUNT.perCrumbMs);
            emit(next > count ? "pour.hold" : "pour.reverse", pitch(next), next > count ? -14 : -16, "trigger", duration), motion.bump(action.critter, world.get(Clock).now + duration);
          }
          continue;
        }
        let before = action.critter.get(Count).given;
        if (give(action.critter, action.direction)) {
          if (emit(action.direction > 0 ? "crumb.add" : "crumb.remove", action.direction > 0 ? pitch(before + 1) : Math.max(0, pitch(before) - 1), action.direction > 0 ? -14 : -16), hop(action.critter, action.direction), action.hold)
            heap.add(Pouring({ direction: action.direction, startedAt: world.get(Clock).now, lastSoftAt: world.get(Clock).now, acc: 0 }), PouringInto(action.critter));
          if (wall(action.critter, action.direction))
            stop(), emit("pile.wall");
        } else
          emit("pile.wall");
      }
    }
    function pour() {
      let current = heap.get(Pouring), critter = heap.targetFor(PouringInto);
      if (!current)
        return;
      if (!critter || !critter.isAlive()) {
        stop();
        return;
      }
      let clock = world.get(Clock), elapsed = clock.now - current.startedAt - HOLD_DELAY_MS;
      if (elapsed <= 0)
        return;
      let dt = Math.min(clock.dt, elapsed) / 1000, scale = Math.max(POUR_SCALE.min, Math.min(POUR_SCALE.max, options.issued / POUR_SCALE.base)), rate = (POUR_RATE_MIN + (POUR_RATE_MAX - POUR_RATE_MIN) * Math.min(1, elapsed / 1000 / POUR_RAMP_S)) * scale;
      motion.chew(critter, rate);
      let acc = current.acc + rate * dt, { emitted, lastSoftAt } = current;
      while (acc >= 1) {
        if (!give(critter, current.direction)) {
          stop(), emit("pile.wall");
          return;
        }
        acc -= 1, emitted += 1, heap.set(Pouring, { emitted });
        let step = pitch(critter.get(Count).given);
        if (world.get(Settings).still || world.get(Settings).reducedMotion) {
          if (clock.now - lastSoftAt >= 1000 / REDUCED_MOTION.maxTicksPerSecond)
            emit(current.direction > 0 ? "crumb.add" : "crumb.remove", step, current.direction > 0 ? -14 : -16), lastSoftAt = clock.now;
        } else {
          if (emitted <= REPLY.ticksBeforeHold)
            emit(current.direction > 0 ? "crumb.add" : "crumb.remove", step, current.direction > 0 ? -14 : -16);
          if (emitted >= REPLY.ticksBeforeHold)
            emit(current.direction > 0 ? "pour.hold" : "pour.reverse", step, current.direction > 0 ? -14 : -16, emitted === REPLY.ticksBeforeHold ? "start" : "update", 0, rate);
        }
        if (wall(critter, current.direction)) {
          stop(), emit("pile.wall");
          return;
        }
      }
      heap.set(Pouring, { acc, lastSoftAt });
    }
    function clock(now) {
      world.set(Clock, { now, dt: previous === void 0 ? 0 : Math.max(0, Math.min(50, now - previous)) }), previous = now;
    }
    function pile() {
      let remaining = heap.get(Pile).remaining;
      if (lastRemaining > 0 && remaining === 0)
        emit("pile.empty", 0, -12);
      lastRemaining = remaining;
    }
    function feast() {
      reveal.tick(), director.tick();
    }
    function expression() {
      motion.expression();
    }
    function rig() {
      motion.rig();
    }
    function flight() {
      flights.tick();
    }
    function sound() {
      for (let event of world.query(SoundEvent)) {
        let settings = world.get(Settings), { rate, ...cue } = event.get(SoundEvent);
        if (options.outputs?.feedback?.({ ...cue, ...rate > 0 ? { rate } : {} }), settings.effects || cue.action === "stop")
          options.outputs?.sound?.({ ...cue, ...rate > 0 ? { rate } : {}, level: cue.level + (settings.still || settings.reducedMotion ? REDUCED_MOTION.dampingDb : 0) });
        event.destroy();
      }
    }
    function render3d() {
      options.outputs?.render3d?.(world);
    }
    function render2d() {
      options.outputs?.render2d?.(world);
    }
    function sweep() {
      for (let event of world.query(Hop)) {
        let cue = event.get(Hop);
        options.outputs?.hop?.({ ...cue }), event.destroy();
      }
      for (let event of world.query(SoundEvent))
        event.destroy();
    }
    let systems = [clock, input, pour, pile, feast, expression, rig, circle.tick, () => tickDomFlights(world), flight, sound, render3d, render2d, sweep];
    function tick(now) {
      if (!Number.isFinite(now) || previous !== void 0 && now < previous)
        throw RangeError("Tick time must be finite and monotonic");
      for (let system of systems)
        system(now);
    }
    return { world, heap, critters, actions, circle, tick, isAnimating: () => director.playing() || circle.isAnimating() || motion.isAnimating() || world.query(Flight).length > 0 || world.query(DomFlight).length > 0, feastPresentation: director.presentation, destroy: () => {
      motion.destroy(), world.destroy();
    } };
  }

  // packages/app/src/portraits/pose.ts
  function renderPortraits(world) {
    for (let entity of world.query(Portrait, Rig)) {
      let svg = entity.get(Portrait);
      if (!svg)
        continue;
      if (svg.parentElement?.dataset.offscreen === "true")
        continue;
      let rig = entity.get(Rig), current = portraitState(svg), asleep = entity.has(Asleep), settings = world.get(Settings), quiet = settings.still || settings.reducedMotion, meshed = svg.parentElement?.dataset.mesh === "ready";
      if (meshed && !quiet)
        continue;
      let changed = current?.asleep !== void 0 && (current.asleep !== asleep || current.scale !== rig.scaleX), outgoing;
      if (quiet && changed && current && svg.parentElement?.classList.contains("stage"))
        current.cleanup?.(), outgoing = svg.cloneNode(!0), outgoing.setAttribute("aria-hidden", "true"), outgoing.removeAttribute("role"), outgoing.classList.add("portrait-fade"), svg.after(outgoing);
      if (current?.applyRig)
        current.applyRig({ rig, now: world.get(Clock).now, asleep, quiet });
      else
        for (let [key, value] of Object.entries(rig)) {
          let property = key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`), unit = ["leanZ", "headTilt", "earL", "earR", "postureX"].includes(key) ? "deg" : key === "liftY" || key === "pupilX" || key === "pupilY" ? "px" : "";
          svg.style.setProperty(`--${property}`, `${unit === "px" ? value * (key.startsWith("pupil") ? current?.eyeRadius ?? 0 : UNIT) : value}${unit}`);
        }
      if (svg.dataset.asleep !== String(asleep))
        svg.dataset.asleep = String(asleep);
      let mouth = svg.querySelector(".portrait__mouth");
      if (mouth && current && !current.applyRig) {
        let radius = current.headRadius;
        mouth.setAttribute("d", `M${-radius * 0.2} ${radius * 0.4} Q0 ${radius * (0.4 + 0.25 * rig.mouth)} ${radius * 0.22} ${radius * 0.4}`), mouth.setAttribute("opacity", rig.mouth > 0 ? String(RIG.mouthOpacity) : "0");
      }
      if (current) {
        if (outgoing) {
          let duration = current.scale !== rig.scaleX ? REDUCED_MOTION.growthCrossfadeMs : REDUCED_MOTION.wakeCrossfadeMs, incoming = meshed ? void 0 : svg.animate([{ opacity: 0 }, { opacity: 1 }], { duration }), leaving = outgoing.animate([{ opacity: 1 }, { opacity: 0 }], { duration }), old = outgoing;
          current.cleanup = () => {
            incoming?.cancel(), leaving.cancel(), old.remove();
          }, leaving.finished.then(() => {
            old.remove(), delete current.cleanup;
          }).catch(() => {});
        }
        current.asleep = asleep, current.scale = rig.scaleX;
      }
    }
  }

  // docs/explorations/garden-refinement/src/page.ts
  var h = (tag, text, cls) => {
    let el = document.createElement(tag);
    if (text !== void 0)
      el.textContent = text;
    if (cls)
      el.className = cls;
    return el;
  }, main = document.querySelector("main"), section = (id, title, lede) => {
    let el = h("section");
    return el.id = id, el.append(h("h2", title), h("p", lede, "lede")), main.append(el), el;
  }, hero = section("cast", "Eight inhabitants, one painted world", "Acorn squirrel · lichen moth · pond turtle · koi kite · ember fox · phoenix chick · flying lemur · cloud lamb. The refined portraits use soft gradients and static paper marks, with no live SVG filters."), cast = h("div", void 0, "cast");
  hero.append(cast);
  for (let group of fixtures_default.groups) {
    let p = generate2(group.address, 0), item = h("figure"), label = h("a", group.name);
    label.href = `#species-${group.species}`;
    let caption = h("figcaption");
    caption.append(label), item.append(paintGarden2(document, p, { finish: "painted", size: 140, name: group.name, decorative: !1 }), caption), cast.append(item);
  }
  var compare = section("compare", "Before and after, three variants of every species", "Left: the selected prototype. Right: the refinement. Matching addresses and variants throughout. These fixtures deliberately keep one species across three rerolls so variation is easy to compare; normal rerolls can change species.");
  for (let group of fixtures_default.groups) {
    let block = h("article", void 0, "species-block");
    block.id = `species-${group.species}`, block.append(h("h3", group.name), h("code", group.address));
    let strip = h("div", void 0, "variants");
    for (let variant of group.variants) {
      let p = generate2(group.address, variant), card = h("div", void 0, "variant"), pair = h("div", void 0, "pair");
      card.append(h("h4", `Variant ${variant}`));
      for (let [label, paint] of [["Prototype", paintGarden], ["Refined", paintGarden2]]) {
        let figure = h("figure");
        figure.append(paint(document, p, { finish: "painted", size: 130, decorative: !0 }), h("figcaption", label)), pair.append(figure);
      }
      card.append(pair), strip.append(card);
    }
    block.append(strip), compare.append(block);
  }
  var faces = section("faces", "Faces that stay recognisable at list sizes", "40, 44 and 64 pixels. Each crop uses the head’s own centre and radius, including off-centre fox, turtle and koi heads.");
  for (let group of fixtures_default.groups) {
    let row = h("div", void 0, "face-row");
    row.append(h("strong", group.name));
    for (let variant of group.variants)
      for (let size of [40, 44, 64]) {
        let p = generate2(group.address, variant), extent = gardenLayout2(gardenDraw2(p)).extent, face = h("span", void 0, "face"), style = faceCrop(size, extent.headY, extent.headX, extent.headRadius);
        for (let [key, value] of Object.entries(style))
          face.style.setProperty(key, value);
        face.append(paintGarden2(document, p, { finish: "painted", decorative: !0 })), row.append(face);
      }
    faces.append(row);
  }
  var silhouettes = section("silhouettes", "Recognition beyond colour", "The same three variants per species, shown without colour. Proportion, ear, wing, crown and tail differences carry part of each identity; eight species do not guarantee unique critters.");
  for (let group of fixtures_default.groups) {
    let row = h("div", void 0, "silhouette-row");
    row.append(h("strong", group.name));
    for (let variant of group.variants)
      row.append(paintGarden2(document, generate2(group.address, variant), { finish: "painted", size: 100, decorative: !0 }));
    silhouettes.append(row);
  }
  var states = section("states", "Quiet expressions and a crumb-holding alternative", "Awake · asleep · receiving a crumb · fed · delighted · holding a crumb (review alternative). Low shares never create a sad expression. Paws holding crumbs are proposed here and remain off in the integrated renderer.");
  for (let name of ["fox", "squirrel", "lemur"]) {
    let group = fixtures_default.groups.find((group) => group.species === name), row = h("div", void 0, "states"), p = generate2(group.address, 0);
    for (let [label, state] of [["Awake", {}], ["Asleep", { asleep: !0 }], ["Crumb arrives", { delighted: !0 }], ["Fed", { fed: 0.8 }], ["Delighted", { delighted: !0, fed: 1 }], ["Holding?", { delighted: !0, holding: !0 }]]) {
      let fig = h("figure"), svg = paintGarden2(document, p, { ...state, finish: "painted", size: 110, decorative: !0 });
      if (label === "Crumb arrives")
        svg.style.setProperty("--scale-x", "1.08");
      fig.append(svg, h("figcaption", label)), row.append(fig);
    }
    states.append(row);
  }
  var bench = section("motion", "Motion through the app’s real pose system", "Ten critters, including three foxes, driven by createWorld.tick and renderPortraits. Measure six seconds after a one-second warmup. This measures frame pacing in this browser, not calibrated phone GPU performance."), controls = h("div", void 0, "controls"), run = h("button", "Measure refined portraits"), before = h("button", "Measure prototype"), quiet = h("input"), quietLabel = h("label", " Still critters "), sleep = h("button", "Sleep / wake"), crumb = h("button", "Give a crumb");
  quiet.type = "checkbox";
  quietLabel.prepend(quiet);
  var stop = h("button", "Stop motion");
  controls.append(run, before, quietLabel, sleep, crumb, stop);
  var status = h("output", "Ready. Start a measurement to watch breathing, blinking and hover."), stage = h("div", void 0, "motion-stage");
  status.id = "measurement";
  status.setAttribute("aria-live", "polite");
  bench.append(controls, status, stage);
  var fox3 = fixtures_default.groups.find((group) => group.species === "fox"), group = [...fox3.variants.map((variant) => ({ address: fox3.address, variant, name: `Fox ${variant}` })), ...fixtures_default.groups.filter((g) => g.species !== "fox").map((g) => ({ address: g.address, variant: 0, name: g.name }))], cleanup = () => {}, world, sleeping = !1, start = (prototype) => {
    cleanup(), sleeping = !1, stage.replaceChildren(), run.disabled = before.disabled = !0, delete status.dataset.result, status.textContent = "Measuring…";
    let game = createWorld2({ critterVersion: "2", issued: 100, critters: group.map((g, i) => ({ ...g, id: String(i) })), settings: { still: quiet.checked, simple: !0, reducedMotion: quiet.checked }, outputs: { render2d: renderPortraits } });
    world = game;
    let svgs = group.map((g, i) => {
      let box = h("div", void 0, "stage"), svg = (prototype ? paintGarden : paintGarden2)(document, generate2(g.address, g.variant), { finish: "painted", decorative: !0 });
      return game.critters[i].add(Portrait(svg)), box.append(svg, h("small", g.name)), stage.append(box), svg;
    }), request = 0, first, last, finished = !1, deltas = [], frame = (now) => {
      if (first ??= now, game.tick(now), last !== void 0 && now - first > 1000 && !finished)
        deltas.push(now - last);
      if (last = now, !finished && now - first >= 7000) {
        finished = !0;
        let sorted = [...deltas].sort((a, b) => a - b), mean = deltas.reduce((a, b) => a + b, 0) / deltas.length, result = { renderer: prototype ? "prototype" : "refined", frames: deltas.length, fps: +(1000 / mean).toFixed(1), medianMs: +sorted[Math.floor(sorted.length * 0.5)].toFixed(2), p95Ms: +sorted[Math.floor(sorted.length * 0.95)].toFixed(2), over50ms: deltas.filter((n) => n > 50).length, still: quiet.checked, svgNodes: svgs.reduce((n, svg) => n + svg.querySelectorAll("*").length, 0), filters: stage.querySelectorAll("filter").length, viewport: [innerWidth, innerHeight], dpr: devicePixelRatio, visibility: document.visibilityState, userAgent: navigator.userAgent };
        status.textContent = JSON.stringify(result), status.dataset.result = JSON.stringify(result), run.disabled = before.disabled = !1;
      }
      request = requestAnimationFrame(frame);
    };
    request = requestAnimationFrame(frame), cleanup = () => {
      cancelAnimationFrame(request), svgs.forEach(disposePortrait), game.destroy(), world = void 0, run.disabled = before.disabled = !1;
    };
  };
  stop.onclick = () => cleanup();
  run.onclick = () => start(!1);
  before.onclick = () => start(!0);
  quiet.onchange = () => world?.actions.setSettings({ still: quiet.checked, reducedMotion: quiet.checked });
  sleep.onclick = () => {
    if (!world)
      return;
    if (sleeping = !sleeping, sleeping)
      world.actions.fallAsleep();
    else
      cleanup(), start(!1);
  };
  crumb.onclick = () => {
    if (world && !sleeping)
      world.actions.giveCrumb(world.critters[0]);
  };
  addEventListener("pagehide", () => cleanup(), { once: !0 });
  var data = section("data", "Appearance and rollback boundaries", "This is renderer garden-refined-review-1 over frozen generator v2 comparison inputs. It does not assign a production generator version or migrate saved identities. The application’s review choice is ?critters=garden in development, or an explicitly enabled VITE_GARDEN_REVIEW build. Remove the query or use ?critters=1 to return to the baseline."), record2 = h("a", "Read the design record, verification and rollback instructions");
  record2.href = "README.md";
  data.append(record2);
  var seed = h("details");
  seed.append(h("summary", "Exact fixture data"), h("pre", JSON.stringify(fixtures_default, null, 2)));
  data.append(seed);
  var links = h("p");
  for (let [label, path] of [["Launcher", "/?critters=garden"], ["Scattering", "/dev/screens?critters=garden&capture&state=scatter&count=10&scene=window"], ["Results", "/dev/screens?critters=garden&capture&state=results&count=10&scene=window"]]) {
    let a = h("a", label);
    a.href = path, links.append(a, document.createTextNode(" · "));
  }
  data.append(links);
  var scenes = section("scenes", "The portraits in the application", "Unretouched captures from the integrated review renderer. Scattering and results use the app’s development fixtures. Launcher, first meeting and all four tutorial steps use the current app. Light game surfaces and dark tutorial surfaces retain the existing theme treatment."), captures = h("div", void 0, "captures");
  scenes.append(captures);
  for (let [label, file] of [["Ten-critter scattering · desktop", "scattering-desktop"], ["Ten-critter results · desktop", "results-desktop"], ["First meeting · phone", "onboarding-phone"], ["Worked result tutorial · phone", "tutorial-4-phone"]]) {
    let figure = h("figure"), link = h("a"), img = h("img");
    link.href = `images/${file}.jpg`, img.src = link.href, img.alt = label, img.loading = "lazy", link.append(img), figure.append(link, h("figcaption", label)), captures.append(figure);
  }
})();
