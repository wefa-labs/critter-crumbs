import type { tokens } from '../styles/tokens.js';

interface Crop { x: number; y: number; w: number; h: number }
interface Device { image: string; kind: 'crops' | 'plate' }
/** The images a crops scene is drawn from, rendered from its crops by scripts/scene-layers.mjs. */
interface Layers { floor: string; wall: string; cornerL: string; cornerR: string }
export interface Scene {
  id: string;
  aspect: number;
  devices: { phone: Device; desktop: Device };
  floor: Crop; wall: Crop; cornerL: Crop; cornerR: Crop;
  layers?: Layers;
  lookFilter: keyof typeof tokens;
}

const isScenePath = (value: unknown) => typeof value === 'string' && value.startsWith('/scenes/');

export function validateScenes(value: unknown): asserts value is Scene[] {
  if (!Array.isArray(value) || !value.length) throw new TypeError('Invalid scene manifest');
  for (const scene of value) {
    if (!scene.id || !scene.devices) throw new TypeError('Invalid scene identity');
    const devices = [scene.devices.phone, scene.devices.desktop] as Device[];
    for (const device of devices) if (!device || !isScenePath(device.image) || !['crops', 'plate'].includes(device.kind)) throw new TypeError('Invalid device scene');
    if (!devices.some(device => device.kind === 'crops')) continue;
    for (const crop of [scene.floor, scene.wall, scene.cornerL, scene.cornerR] as Crop[]) if (!crop || ![crop.x, crop.y, crop.w, crop.h].every(Number.isFinite) || crop.w <= 0 || crop.h <= 0) throw new TypeError('Invalid scene crop');
    const layers = scene.layers as Layers | undefined;
    if (!layers || ![layers.floor, layers.wall, layers.cornerL, layers.cornerR].every(isScenePath)) throw new TypeError('A crops scene needs its rendered layers');
  }
}
