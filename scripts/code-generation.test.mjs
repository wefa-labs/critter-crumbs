import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';

// The page's Content-Security-Policy (vercel.json, Technical Spec §2) has no 'unsafe-eval', so `eval` and `new Function`
// throw in the browser. Node's --disallow-code-generation-from-strings applies the same rule to a script.
const underThePolicy = source => spawnSync(process.execPath, ['--disallow-code-generation-from-strings', '--input-type=module', '--eval', source], { encoding: 'utf8' });

test('the flag refuses code made from a string, as the page policy does', () => {
  const result = underThePolicy(`new Function('return 1')`);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /EvalError/);
});

test('a Koota world stores, reads, updates and tracks changes without making code from strings', () => {
  const result = underThePolicy(`
    import assert from 'node:assert/strict';
    import { createWorld, trait } from 'koota';

    const Pile = trait({ issued: 100, remaining: 100 });
    const Count = trait({ given: 0 });
    const world = createWorld();

    // Adding with some of the fields keeps the defaults of the rest.
    const critter = world.spawn(Pile({ remaining: 40 }), Count);
    assert.deepEqual(critter.get(Pile), { issued: 100, remaining: 40 });

    // Setting some of the fields leaves the others alone, and each read is its own copy.
    critter.set(Pile, { remaining: 39 });
    assert.deepEqual(critter.get(Pile), { issued: 100, remaining: 39 });
    assert.notEqual(critter.get(Pile), critter.get(Pile));

    // An update of a trait nobody tracks writes every field back.
    world.query(Pile).updateEach(([pile]) => { pile.issued = 50; pile.remaining -= 1; });
    assert.deepEqual(critter.get(Pile), { issued: 50, remaining: 38 });

    // An update of a trait someone listens to reports a change only when a field really changed.
    let changes = 0;
    world.onChange(Count, () => { changes += 1; });
    world.query(Count).updateEach(([count]) => { count.given = 0; });
    assert.equal(changes, 0);
    world.query(Count).updateEach(([count]) => { count.given = 7; });
    assert.equal(changes, 1);
    assert.deepEqual(critter.get(Count), { given: 7 });
  `);
  assert.equal(result.status, 0, result.stderr);
});
