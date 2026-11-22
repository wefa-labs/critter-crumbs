import { participantSetHash, tally, type TallyInput } from "@critter-crumbs/core";
import { type Address, canonicalJSON, type Hex } from "@critter-crumbs/shared";
import fc from "fast-check";
import { expect, test } from "vitest";

// Every client tallies the feast on its own and must reach the same result, however the scatters
// and the critters reach it. The property is written over the tally function, so it runs on the
// real tally and on a broken variant, which it must catch.

const feastId = "00000000-0000-4000-8000-000000000001";
const hex32 = (n: number) => `0x${n.toString(16).padStart(64, "0")}` as Hex;
const address = (n: number) => `0x${(n + 1).toString(16).padStart(40, "0")}` as Address;

/** Split `total` crumbs over `slots` targets by integer weights, nothing to the scatterer's own. */
function allocation(total: number, weights: number[], own: number) {
  const usable = weights.map((weight, i) => (i === own ? 0 : weight + 1));
  const sum = usable.reduce((a, b) => a + b, 0);
  const amounts = usable.map((weight) => Math.floor((weight * total) / sum));
  const first = usable.findIndex((weight) => weight > 0);
  amounts[first]! += total - amounts.reduce((a, b) => a + b, 0);
  return amounts;
}

/** A people feast: participants, one target each, and scatters, some replaced, some broken. */
const feast = fc
  .record({
    people: fc.integer({ min: 3, max: 6 }),
    crumbs: fc.integer({ min: 10, max: 200 }),
    ballots: fc.array(
      fc.record({
        who: fc.nat(5),
        weights: fc.array(fc.nat(9), { minLength: 6, maxLength: 6 }),
        broken: fc.constantFrom("none", "none", "none", "short", "self", "unreadable"),
      }),
      { maxLength: 12 }
    ),
  })
  .map(({ people, crumbs, ballots }): TallyInput => {
    const participants = Array.from({ length: people }, (_, i) => address(i));
    const targets = participants.map((owner, position) => ({
      id: hex32(1000 + position),
      ownerAddress: owner,
      position,
    }));
    const participantsHash = participantSetHash(participants);
    return {
      feastId,
      publishedSetHash: hex32(99),
      crumbsIssued: crumbs,
      participants,
      targets,
      ballots: ballots.map((ballot, i) => {
        const who = ballot.who % people;
        const amounts = allocation(crumbs, ballot.weights.slice(0, people), who);
        if (ballot.broken === "short") amounts[(who + 1) % people]! -= 1;
        if (ballot.broken === "self") amounts[who]! += 1;
        return {
          seq: String(i + 1),
          uid: hex32(5000 + i),
          attester: participants[who]!,
          plaintext:
            ballot.broken === "unreadable"
              ? null
              : canonicalJSON({
                  v: 1,
                  feast: feastId,
                  scatterer: participants[who]!,
                  participants: participantsHash,
                  allocation: targets.map((target, t) => [target.id, amounts[t]!]),
                  nonce: "0123456789abcdef",
                }),
        };
      }),
    };
  });

const orderHolds = (implementation: typeof tally) =>
  fc.property(
    feast.chain((input) =>
      fc.tuple(
        fc.constant(input),
        fc.shuffledSubarray(input.ballots, { minLength: input.ballots.length }),
        fc.shuffledSubarray(input.targets, { minLength: input.targets.length })
      )
    ),
    ([input, ballots, targets]) =>
      implementation({ ...input, ballots, targets }).resultHash === implementation(input).resultHash
  );

test("shuffled scatters and critters give the same result hash", () => {
  fc.assert(orderHolds(tally), { numRuns: 300 });
});

test("a valid scatter always counts all its crumbs, and totals are proportions of what was scattered", () => {
  fc.assert(
    fc.property(feast, (input) => {
      const result = tally(input);
      const scattered = result.totals.reduce((sum, total) => sum + total.crumbs, 0);
      return (
        scattered === result.totalScattered &&
        scattered === result.counted.length * input.crumbsIssued &&
        result.didNotScatter.length + result.counted.length === input.participants.length
      );
    }),
    { numRuns: 300 }
  );
});

test("the order property catches a tally that counts scatters in the order they arrive", () => {
  // Broken on purpose: sequence numbers follow arrival, so the last to arrive counts as latest.
  const byArrival: typeof tally = (input) =>
    tally({
      ...input,
      ballots: input.ballots.map((ballot, i) => ({ ...ballot, seq: String(i + 1) })),
    });
  expect(() => fc.assert(orderHolds(byArrival), { numRuns: 300 })).toThrow();
});
