import { useEffect, useState, type CSSProperties } from 'react';
import { defaultScene } from './art.js';
import { plateLift } from './plate.js';
import { sceneReader, type Scene } from './scene-manifest.js';
import { sceneFilterStyle, sceneLayerStyle } from './styles.js';

/**
 * The floor the circle stands on, under the look's wash and grain. A plate is one painting of the room seen from above,
 * made for its device and raised until its wall ends just above the circle's back row, `backRow` pixels down a scene of
 * `size` (game/plate.ts). A crops scene has no plate yet and is built as the scatter review page builds it: one mirrored
 * floor tile repeated on a plane tilted away under a perspective, a shade falling from the wall, the wall band along the
 * top and the two corners. Scenes are data: a new one is images plus a manifest entry (scripts/scene-layers.mjs renders a
 * crops scene's layers).
 */
export function SceneBackdrop({ id = defaultScene, desktop, size, backRow }: { id?: string; desktop: boolean; size: { width: number; height: number }; backRow: number }) {
  const scenes = useScenes();
  const scene = scenes.find(entry => entry.id === id) ?? scenes[0];
  if (!scene) return <div className="scene-backdrop" aria-hidden="true" />;
  const device = desktop ? scene.devices.desktop : scene.devices.phone;
  const filter = sceneFilterStyle(scene.lookFilter);
  if (device.kind === 'plate') {
    return (
      <div className="scene-backdrop" aria-hidden="true" style={filter}>
        <div className="scene-plate" style={{ backgroundImage: `url(${device.image})`, top: -plateLift(size, device, backRow) }} />
        <div className="scene-wash" />
        <div className="scene-grain" />
      </div>
    );
  }
  const layers = scene.layers!;
  const style = { ...filter, ...sceneLayerStyle(layers) } as CSSProperties;
  return (
    <div className="scene-backdrop" aria-hidden="true" style={style}>
      <div className="floor-plane" />
      <div className="floor-shade" />
      <div className="wall-band" />
      <div className="scene-corner left" />
      <div className="scene-corner right" />
      <div className="scene-wash" />
      <div className="scene-grain" />
    </div>
  );
}

const manifest = sceneReader(() => fetch('/scenes/manifest.json').then(response => response.json() as Promise<unknown>));

export function useScenes() {
  const [scenes, setScenes] = useState<Scene[]>(() => manifest.known() ?? []);
  useEffect(() => {
    let active = true;
    void manifest.read().then(read => { if (active) setScenes(read); });
    return () => { active = false; };
  }, []);
  return scenes;
}
