import { useEffect, useState, type CSSProperties } from 'react';
import { defaultScene } from './art.js';
import { validateScenes, type Scene } from './scene-manifest.js';
import { sceneFilterStyle, sceneLayerStyle } from './styles.js';

/**
 * The floor the circle stands on, as the scatter review page builds it: one mirrored floor tile repeated on a plane
 * tilted away under a perspective, a shade falling from the wall, the wall band along the top and the two corners,
 * then the look's wash and grain. A painted floor-first plate replaces all of it with one image (design pass §22).
 * Scenes are data: a new one is images plus a manifest entry (scripts/scene-layers.mjs renders a crops scene's layers).
 */
export function SceneBackdrop({ id = defaultScene, desktop }: { id?: string; desktop: boolean }) {
  const scenes = useScenes();
  const scene = scenes.find(entry => entry.id === id) ?? scenes[0];
  if (!scene) return <div className="scene-backdrop" aria-hidden="true" />;
  const device = desktop ? scene.devices.desktop : scene.devices.phone;
  const filter = sceneFilterStyle(scene.lookFilter);
  if (device.kind === 'plate') return <div className="scene-backdrop scene-plate" aria-hidden="true" style={{ ...filter, backgroundImage: `url(${device.image})` }} />;
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

export function useScenes() {
  const [scenes, setScenes] = useState<Scene[]>([]);
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    void fetch('/scenes/manifest.json', { signal: controller.signal })
      .then(response => response.json())
      .then((value: unknown) => { validateScenes(value); if (active) setScenes(value); })
      .catch(error => { if (error.name !== 'AbortError' && active) setScenes([]); });
    return () => { active = false; controller.abort(); };
  }, []);
  return scenes;
}
