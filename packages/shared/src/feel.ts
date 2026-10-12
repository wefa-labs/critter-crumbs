/** Game Design §2. Base rates are multiplied by POUR_SCALE in the simulation. */
export const TAP_GIVE = 'press';
export const HOLD_DELAY_MS = 300;
export const POUR_RATE_MIN = 8;
export const POUR_RATE_MAX = 40;
export const POUR_RAMP_S = 1.5;
export const POUR_SCALE = { base: 100, min: 0.5, max: 5 } as const;
export const RELEASE = 0;
export const ACCUMULATOR = 'fractional';
export const WALL = 'stop';
export const REPLY = { soundAheadMs: 20, ticksBeforeHold: 3, releaseFadeMs: 60, wallDegrees: 2, wallMs: 120, emptyOutlines: 3 } as const;
export const TYPED_AMOUNT = { maxMs: 320, perCrumbMs: 8 } as const;

/** §3. Angles are degrees, timings milliseconds unless the name says otherwise. */
export const RIG = { scale: [0.9, 1.4], lean: 3, posture: [-3, 0], headTilt: 8, ear: [-25, 15], lid: [0.12, 1], pupil: 0.3, cheekThreshold: 0.5, mouthThreshold: 0.35, mouthOpacity: 0.6, mouthTriangles: 40 } as const;
export const IDLE = {
  awake: { breath: 0.012, breathHz: 0.4, wobble: 1.5, wobbleHz: 0.2 },
  asleep: { breath: 0.015, breathHz: 0.25, wobble: 0, earDroop: 25, nod: -4, nodMs: 600, nodEveryMs: 8000 },
  pleased: { threshold: 0.75, breath: 0.015, breathHz: 0.5, wobble: 2, wobbleHz: 0.3, hopScale: [1.04, 0.97], hopHeight: 0.03, hopMs: 260, hopEveryMs: [6000, 10000] },
  blinkEveryMs: [3000, 6000], blinkMs: 120, pupilDrift: 0.05, pupilEveryMs: [4000, 9000],
} as const;
export const BUMP = [[0, 1.08, 0.92, 1.08], [90, 0.97, 1.04, 0.97], [180, 1.01, 0.995, 1.01], [260, 1, 1, 1]] as const;
export const CRUMB_GAZE = { ms: 120, lidWiden: 0.1 } as const;
export const CHEW = { amplitude: 0.03, rateFraction: 0.25, maxHz: 8, earDegrees: 3, cheekScale: 1.2, mouthAdd: 0.2, decayMs: 260 } as const;
export const WAKE = { ms: 600, lidEndMs: 120, earStartMs: 60, earEndMs: 500, stiffness: 180, damping: 12, overshootDegrees: 8, stretchStartMs: 120, stretchEndMs: 520, stretch: [0.95, 1.08, 0.95], headStartMs: 200 } as const;
export const GROWTH = { fairShareCap: 2.5, exponent: 0.75, scaleGain: 0.35, minimumContentMood: 0.25 } as const;
export const EXPRESSION = [
  { mood: 0, squint: 0, earLift: 0, mouth: 0, cheekScale: 0, tiltFactor: 1, posture: 0 },
  { mood: 0.25, squint: 0.1, earLift: 5, mouth: 0, cheekScale: 0, tiltFactor: 0.8, posture: 0 },
  { mood: 0.5, squint: 0.2, earLift: 10, mouth: 0.4, cheekScale: 1, tiltFactor: 0.5, posture: -1 },
  { mood: 0.75, squint: 0.3, earLift: 12, mouth: 0.7, cheekScale: 1, tiltFactor: 0.3, posture: -2 },
  { mood: 1, squint: 0.45, earLift: 15, mouth: 1, cheekScale: 1.1, tiltFactor: 0, posture: -3 },
] as const;
export const DELIGHTED = { wiggleDegrees: 3, wiggleEveryMs: 4000 } as const;
/** The mood awake critters show when statements open: the "pleased" step of EXPRESSION, cheeks and a small smile. */
export const DELIGHT_MOOD = 0.5;
export const REDUCED_MOTION = { countPulseMs: 120, growthCrossfadeMs: 320, wakeCrossfadeMs: 200, dampingDb: -6, maxTicksPerSecond: 8 } as const;

/** §4. A single ordered sequence drives DOM and both later renderers. */
export const STATEMENTS_FOCUS_MS = 1200;
export const STATEMENTS_REVEAL = { lightMs: 600, wakeStartMs: 200, staggerMs: 80, reducedMs: 200 } as const;
export const FEAST = { glyphs: 24, fillMs: 400, glyphStaggerMs: 20, openSoundMs: 1200, wakeStartMs: 400, wakeEndMs: 1200, wakeStaggerMs: 40, waveStartMs: 1200, waveStaggerMs: 450, feedMs: 900, growOvershoot: 0.06, growPeakMs: 600, hops: [12, 24], minHops: 4, hopStreamMs: 600, settleDelayMs: 200, settleScale: [1.05, 0.96], settleHopMs: 300, settleLightMs: 800, maxMs: 8000, reducedMs: 320, skipMs: 200, skipSoundMs: 100 } as const;
/** §6 and §7.3: the 3D flight lifetime and hard live-particle budget. */
export const FLIGHT = { ms: 380, maxAlive: 64 } as const;
/** §6 and §8: DOM hop geometry and the live-node budget shared by both views. */
export const DOM_HOP = { ms:320,ease:[.2,.8,.2,1],maxAlive: 60, apexPx: 70, turnDegrees: 240, fadeAt: 0.8 } as const;
/** §5.6. Persistence values are strings, as required by localStorage. Music is on by default (decision of 2026-10-08). */
export const SETTINGS = {
  effects: { key: 'cc.sound.effects', default: '1' },
  music: { key: 'cc.sound.music', default: '1' },
  still: { key: 'cc.motion.still', default: '0' },
  simple: { key: 'cc.view.simple', default: '0' },
} as const;

/** Dark mode has no default of its own: unset, it follows the device (decision of 2026-10-11). Stored as '1' or '0'. */
export const DARK_SETTING_KEY = 'cc.view.dark';

/** §6: unchanged rendering limits and session degradation timings. */
export const RENDER_BUDGET = { slowFrameMs: 33, verySlowFrameMs: 50, degradeMs: [2000, 3000, 5000], restoreMs: 2000, desktopDpr: 2, phoneDpr: 1.5, trianglesPerCritter: 3000, sceneTriangles: 30000, callsPerCritter: 4, sceneCalls: 40, degradedCrumbs: 8, blobSize: 128 } as const;

/** October adoption. One rule governs the remaining heap and every received pile. */
export const PILE_RULE: 'exact' | 'proportional' = 'exact';
export const CIRCLE_FEEL = { presentationMs:100,turnMs:320, stirMs:850, sleepGlyphMs:1100,sleepReleaseMs:130,sleepLifeMs:840,sleepDriftX:16,sleepDriftY:32, playEveryMs:[900,2100], playMs:480, phone:{focus:140,back:66,front:100}, desktop:{focus:248,back:120,front:172}, huddle:{phone:66,desktop:150} } as const;
