import fc from "fast-check";
import { expect, test } from "vitest";
import { type GameViewInput, gameView } from "../src/app/feast-view.js";
import { composeGame } from "../src/game/composition.js";
import { layoutGame, shortName } from "../src/game/layout.js";
import { Count, Pile, createWorld } from "../src/world/index.js";

// Each property is written over the code it checks, so the same property runs on the app's code
// and on a broken variant, which it must catch.

type Step =
  | { kind: "give" | "take"; critter: number }
  | { kind: "set"; critter: number; count: number }
  | { kind: "pour"; critter: number; direction: 1 | -1 }
  | { kind: "stop" }
  | { kind: "tick"; ms: number };

const step = (critters: number) =>
  fc.oneof(
    fc.record({
      kind: fc.constantFrom("give" as const, "take" as const),
      critter: fc.nat(critters - 1),
    }),
    fc.record({
      kind: fc.constant("set" as const),
      critter: fc.nat(critters - 1),
      count: fc.integer({ min: -20, max: 220 }),
    }),
    fc.record({
      kind: fc.constant("pour" as const),
      critter: fc.nat(critters - 1),
      direction: fc.constantFrom(1 as const, -1 as const),
    }),
    fc.record({ kind: fc.constant("stop" as const) }),
    fc.record({ kind: fc.constant("tick" as const), ms: fc.integer({ min: 1, max: 2_000 }) })
  ) as fc.Arbitrary<Step>;

/** The crumbs left in the heap and the crumbs each critter holds, after the steps. */
type Pour = (
  issued: number,
  critters: number,
  steps: Step[]
) => { remaining: number; given: number[] };

const pour: Pour = (issued, critters, steps) => {
  const game = createWorld({
    issued,
    critters: Array.from({ length: critters }, (_, i) => ({
      id: String(i),
      address: `0x${String(i + 1).padStart(40, "0")}`,
      name: `C${i}`,
      variant: 0,
    })),
  });
  try {
    let now = 0;
    game.tick(now);
    for (const s of steps) {
      if (s.kind === "tick") game.tick((now += s.ms));
      else if (s.kind === "stop") game.actions.stopPour();
      else {
        const critter = game.critters[s.critter]!;
        if (s.kind === "give") game.actions.giveCrumb(critter);
        else if (s.kind === "take") game.actions.takeCrumb(critter);
        else if (s.kind === "set") game.actions.setCount(critter, s.count);
        else if (s.kind === "pour") game.actions.startPour(critter, s.direction);
      }
      game.tick((now += 16));
    }
    return {
      remaining: game.heap.get(Pile)!.remaining,
      given: game.critters.map((critter) => critter.get(Count)!.given),
    };
  } finally {
    game.destroy();
  }
};

const pileCase = fc
  .tuple(fc.integer({ min: 10, max: 120 }), fc.integer({ min: 2, max: 5 }))
  .chain(([issued, critters]) =>
    fc.tuple(
      fc.constant(issued),
      fc.constant(critters),
      fc.array(step(critters), { maxLength: 60 })
    )
  );

const pileHolds = (implementation: Pour) =>
  fc.property(pileCase, ([issued, critters, steps]) => {
    const { remaining, given } = implementation(issued, critters, steps);
    return (
      remaining >= 0 &&
      given.every((n) => Number.isInteger(n) && n >= 0) &&
      remaining + given.reduce((a, b) => a + b, 0) === issued
    );
  });

test("the pile never makes or loses a crumb, whatever the presses, pours, counts and time", () => {
  fc.assert(pileHolds(pour), { numRuns: 200 });
});

test("the pile property catches a world that lets a count run past the heap", () => {
  // Broken on purpose: a count is taken as asked, never clamped to the crumbs left.
  const unclamped: Pour = (issued, critters, steps) => {
    const given = Array.from({ length: critters }, () => 0);
    for (const s of steps)
      if (s.kind === "set") given[s.critter] = Math.max(0, Math.trunc(s.count));
    return { remaining: issued - given.reduce((a, b) => a + b, 0), given };
  };
  expect(() => fc.assert(pileHolds(unclamped), { numRuns: 200 })).toThrow(/Property failed/);
});

const phases = ["draft", "gathering", "scattering", "feast", "cancelled", "void"] as const;
const viewInput: fc.Arbitrary<GameViewInput> = fc.record(
  {
    phase: fc.constantFrom(...phases),
    remaining: fc.integer({ min: 0, max: 100 }),
    receipt: fc.boolean(),
    dirty: fc.boolean(),
    reveal: fc.boolean(),
    reading: fc.boolean(),
    signing: fc.boolean(),
    saving: fc.boolean(),
    failure: fc.constantFrom("rejected" as const, "failed" as const, "closed" as const),
    opened: fc.boolean(),
    playing: fc.boolean(),
    keyPending: fc.boolean(),
    resultState: fc.constantFrom(
      "nobody" as const,
      "unreadable" as const,
      "tie" as const,
      "givers" as const,
      "recording" as const,
      "recorded" as const
    ),
    resultsOpen: fc.boolean(),
  },
  { requiredKeys: ["phase", "remaining"] }
) as fc.Arbitrary<GameViewInput>;

const editing = new Set([
  "reveal",
  "scatter",
  "reading",
  "done",
  "scattered",
  "signing",
  "saving",
  "rejected",
  "failed",
]);
const viewHolds = (implementation: typeof gameView) =>
  fc.property(viewInput, (input) => {
    const view = implementation(input);
    const open = input.phase === "scattering" && input.failure !== "closed";
    return (
      view.editable === open &&
      (open || !editing.has(view.state)) &&
      view.remaining === input.remaining
    );
  });

test("a scatter can be changed only while scattering is open, and no other phase shows an editing screen", () => {
  fc.assert(viewHolds(gameView), { numRuns: 2_000 });
});

test("the view property catches a view that keeps a closed scatter editable", () => {
  // Broken on purpose: it forgets that a closed scattering cannot be edited.
  const forgetful: typeof gameView = (input) => {
    const { failure, ...rest } = input;
    return gameView(failure === "closed" ? rest : input);
  };
  expect(() => fc.assert(viewHolds(forgetful), { numRuns: 2_000 })).toThrow(/Property failed/);
});

// Names drawn from letters and from characters outside the Basic Multilingual Plane (emoji),
// which JavaScript strings hold as two UTF-16 units.
const nameArbitrary = fc
  .array(fc.constantFrom("a", "M", "é", "🦊", "🐢", "🍄", "𝓐", "ねこ"), {
    minLength: 1,
    maxLength: 16,
  })
  .map((parts) => parts.join(""));
const loneSurrogate = /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/;
const { surface, scene } = composeGame("scatter", "phone");

const namesHold = (shorten: typeof shortName) =>
  fc.property(nameArbitrary, (name) => {
    const short = shorten(name);
    const points = [...name].length;
    const fits = points <= 10 ? short === name : [...short].length === 10 && short.endsWith("…");
    return !loneSurrogate.test(short) && fits;
  });

test("a name is shortened by its code points, never splitting an emoji, and a name that fits is left whole", () => {
  fc.assert(namesHold(shortName), { numRuns: 1_000 });
});

test("the name property catches shortening by UTF-16 units", () => {
  // Broken on purpose: the length and the cut count UTF-16 units, as the app once did.
  const byUnits = (name: string, limit = 10) =>
    name.length > limit ? name.slice(0, limit - 1) + "…" : name;
  expect(() => fc.assert(namesHold(byUnits), { numRuns: 1_000 })).toThrow(/Property failed/);
});

test("the layout gives a tag that fits by code points the same width short and full", () => {
  fc.assert(
    fc.property(fc.array(nameArbitrary, { minLength: 3, maxLength: 8 }), (names) => {
      const layout = layoutGame({
        viewport: { width: 375, height: 812 },
        critters: names.map((name) => ({
          name,
          own: false,
          count: 0,
          extent: { top: 0.28, left: 0.2, right: 0.8, headY: 0.48, headRadius: 0.17 },
        })),
        focus: 0,
        issued: 100,
        surface,
        scene,
      });
      return layout.slots.every(
        (slot) => [...slot.name].length > 10 || slot.shortWidth === slot.fullWidth
      );
    }),
    { numRuns: 300 }
  );
});
