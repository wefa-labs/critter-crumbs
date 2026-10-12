import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { composeGame } from '../src/game/composition.js';
import { circleBackRow, layoutGame } from '../src/game/layout.js';
import { PLATE_GAP, plateLift, type PlateShape } from '../src/game/plate.js';
import { sceneReader, validateScenes } from '../src/game/scene-manifest.js';

type Size = { width: number; height: number };
/* Where a raised plate's wall ends on the screen, worked out as the browser draws it rather than as plateLift reckons it:
   the plate's box reaches `lift` above the scene, and `background-size: cover` fits the picture to that box from its top. */
const shownHeight = (scene: Size, plate: PlateShape, lift: number) => Math.max(scene.height + lift, scene.width / plate.aspect);
const wallFootOnScreen = (scene: Size, plate: PlateShape, lift: number) => plate.wallFoot * shownHeight(scene, plate, lift) - lift;

/* the four plates the app ships, and scenes from a short in-app browser to a wide desk */
const plates: PlateShape[] = [{ aspect: 0.5, wallFoot: 0.16 }, { aspect: 0.5, wallFoot: 0.135 }, { aspect: 1.5, wallFoot: 0.215 }, { aspect: 1.5, wallFoot: 0.22 }];
const scenes: Size[] = [{ width: 390, height: 780 }, { width: 390, height: 600 }, { width: 375, height: 603 }, { width: 430, height: 868 }, { width: 500, height: 636 }, { width: 880, height: 736 }, { width: 1440, height: 1016 }, { width: 2080, height: 1376 }];

describe('a painted plate', () => {
  it('stays where it is when its wall already ends above the back row', () => {
    expect(plateLift({ width: 390, height: 780 }, { aspect: 0.5, wallFoot: 0.1 }, 107)).toBe(0);
  });

  it('is raised until its wall ends a strip of floor above the back row, on tall, short and wide scenes', () => {
    for (const scene of scenes) for (const plate of plates) for (const backRow of [60, 100, 150, 220]) {
      const lift = plateLift(scene, plate, backRow), label = `${scene.width} x ${scene.height}, wall ${plate.wallFoot}, row ${backRow}`;
      expect(lift, label).toBeGreaterThanOrEqual(0);
      if (lift > 0) expect(wallFootOnScreen(scene, plate, lift), label).toBeCloseTo(backRow - PLATE_GAP, 6);
      else expect(wallFootOnScreen(scene, plate, 0), label).toBeLessThanOrEqual(backRow - PLATE_GAP);
    }
  });

  it('still covers the scene to its foot once raised', () => {
    for (const scene of scenes) for (const plate of plates) {
      const lift = plateLift(scene, plate, 60);
      expect(shownHeight(scene, plate, lift) - lift).toBeGreaterThanOrEqual(scene.height);
    }
  });
});

describe('the circle’s back row', () => {
  const viewports: Size[] = [{ width: 375, height: 667 }, { width: 390, height: 664 }, { width: 390, height: 844 }, { width: 430, height: 932 }, { width: 900, height: 700 }, { width: 1280, height: 800 }, { width: 1440, height: 900 }, { width: 1920, height: 1080 }];
  const extent = { top: 0.28, left: 0.2, right: 0.8, headY: 0.48, headRadius: 0.17 };
  const critters = (count: number) => Array.from({ length: count }, (_, index) => ({ name: `Critter ${index}`, own: index === 2, count: 12, extent }));
  /* every foot the circle puts on the floor while scattering and, grown, after the feast */
  const feet = (viewport: Size, count: number) => (['scatter', 'feasted'] as const).flatMap(state => {
    const { surface, scene } = composeGame(state, viewport.width >= 900 ? 'desktop' : 'phone');
    return layoutGame({ viewport, critters: critters(count), focus: 0, issued: 100, surface, scene }).slots.map(slot => slot.foot.y);
  });

  it('is above every critter’s feet, whatever the size of the burrow', () => {
    for (const viewport of viewports) for (const count of [3, 4, 5, 6, 7, 8, 9, 10, 12]) {
      expect(Math.min(...feet(viewport, count)), `${viewport.width} x ${viewport.height}, ${count}`).toBeGreaterThanOrEqual(circleBackRow(viewport, count) - 1e-6);
    }
  });

  it('is where the back critter of an even circle stands', () => {
    for (const viewport of viewports) for (const count of [4, 6, 8, 10]) {
      expect(Math.min(...feet(viewport, count)), `${viewport.width} x ${viewport.height}, ${count}`).toBeCloseTo(circleBackRow(viewport, count), 6);
    }
  });
});

describe('the scene manifest', () => {
  const scenes = new URL('../public/scenes/', import.meta.url);
  const shipped = (): unknown => JSON.parse(readFileSync(new URL('manifest.json', scenes), 'utf8'));
  const plate = (device: object) => [{ id: 'window', lookFilter: 'scene-filter', devices: { phone: device, desktop: device } }];

  it('is one the app accepts, and every picture it names is there', () => {
    const manifest = shipped();
    validateScenes(manifest);
    for (const scene of manifest) for (const image of [scene.devices.phone.image, scene.devices.desktop.image, ...Object.values(scene.layers ?? {})]) {
      expect(existsSync(new URL(image.replace('/scenes/', ''), scenes)), image).toBe(true);
    }
  });

  it('shows the game’s two scenes as plates on both devices', () => {
    const manifest = shipped();
    validateScenes(manifest);
    for (const id of ['window', 'dusk']) expect(Object.values(manifest.find(scene => scene.id === id)!.devices).map(device => device.kind), id).toEqual(['plate', 'plate']);
  });

  it('refuses a plate that does not say its shape or where its wall ends', () => {
    const image = '/scenes/window-plate-phone.webp';
    expect(() => validateScenes(plate({ image, kind: 'plate', aspect: 0.5, wallFoot: 0.16 }))).not.toThrow();
    for (const broken of [{ image, kind: 'plate' }, { image, kind: 'plate', aspect: 0.5 }, { image, kind: 'plate', aspect: 0, wallFoot: 0.16 }, { image, kind: 'plate', aspect: 0.5, wallFoot: 1 }]) {
      expect(() => validateScenes(plate(broken)), JSON.stringify(broken)).toThrow(TypeError);
    }
  });

  it('is read once for the page: every scene after the first has it without waiting', async () => {
    let reads = 0;
    const reader = sceneReader(async () => { reads++; return shipped(); });
    expect(reader.known()).toBeUndefined();
    const [first, second] = await Promise.all([reader.read(), reader.read()]);
    expect(second).toBe(first);
    expect(reader.known()).toBe(first);
    expect(await reader.read()).toBe(first);
    expect(reads).toBe(1);
  });

  it('is asked for again after a read that failed or gave a manifest the app refuses', async () => {
    const answers = [() => Promise.reject(new Error('offline')), async () => [], async () => shipped()];
    let reads = 0;
    const reader = sceneReader(() => answers[reads++]!());
    expect(await reader.read()).toEqual([]);
    expect(await reader.read()).toEqual([]);
    expect(reader.known()).toBeUndefined();
    expect((await reader.read()).map(scene => scene.id)).toContain('dusk');
    expect(reads).toBe(3);
  });
});
