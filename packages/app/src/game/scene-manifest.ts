import type { tokens } from '../styles/tokens.js';
import type { PlateShape } from './plate.js';

interface Crop { x: number; y: number; w: number; h: number }
/** A device that has no plate yet draws the scene from crops of its painting. */
interface CropsDevice { image: string; kind: 'crops' }
/** A painting made for the device. */
interface PlateDevice extends PlateShape { image: string; kind: 'plate' }
type Device = CropsDevice | PlateDevice;
/** The images a crops scene is drawn from, rendered from its crops by scripts/scene-layers.mjs. */
interface Layers { floor: string; wall: string; cornerL: string; cornerR: string }
export interface Scene {
  id: string;
  devices: { phone: Device; desktop: Device };
  /** Only a scene with a crops device has the painting's shape, its crops and the layers rendered from them. */
  aspect?: number;
  floor?: Crop; wall?: Crop; cornerL?: Crop; cornerR?: Crop;
  layers?: Layers;
  lookFilter: keyof typeof tokens;
}

const isScenePath = (value: unknown) => typeof value === 'string' && value.startsWith('/scenes/');
const isPlate = (device: Device) => device.kind !== 'plate' || Number.isFinite(device.aspect) && device.aspect > 0 && Number.isFinite(device.wallFoot) && device.wallFoot > 0 && device.wallFoot < 1;

export function validateScenes(value: unknown): asserts value is Scene[] {
  if (!Array.isArray(value) || !value.length) throw new TypeError('Invalid scene manifest');
  for (const scene of value) {
    if (!scene.id || !scene.devices) throw new TypeError('Invalid scene identity');
    const devices = [scene.devices.phone, scene.devices.desktop] as Device[];
    for (const device of devices) if (!device || !isScenePath(device.image) || !['crops', 'plate'].includes(device.kind) || !isPlate(device)) throw new TypeError('Invalid device scene');
    if (!devices.some(device => device.kind === 'crops')) continue;
    for (const crop of [scene.floor, scene.wall, scene.cornerL, scene.cornerR] as Crop[]) if (!crop || ![crop.x, crop.y, crop.w, crop.h].every(Number.isFinite) || crop.w <= 0 || crop.h <= 0) throw new TypeError('Invalid scene crop');
    const layers = scene.layers as Layers | undefined;
    if (!layers || ![layers.floor, layers.wall, layers.cornerL, layers.cornerR].every(isScenePath)) throw new TypeError('A crops scene needs its rendered layers');
  }
}

/**
 * Reads the scenes once for the page. The first scene to draw waits on the read; every scene after it has them at its
 * first render, so it stands on its floor from its first frame. A read that fails, or gives a manifest the app refuses,
 * is forgotten, so the next scene to mount asks again.
 */
export function sceneReader(read: () => Promise<unknown>) {
  let known: Scene[] | undefined, reading: Promise<Scene[]> | undefined;
  return {
    known: () => known,
    read: () => reading ??= read().then(value => { validateScenes(value); return known = value; }).catch(() => { reading = undefined; return []; }),
  };
}
