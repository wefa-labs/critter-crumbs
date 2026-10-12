import { useEffect, useState } from 'react';
import { createWorld, type World } from 'koota';
import { useTrait, WorldProvider } from 'koota/react';
import { devCopy } from '@critter-crumbs/shared';
import { Settings } from '../world/index.js';
function Subscriber({ world }: { world: World }) {
  const settings = useTrait(world, Settings);
  return <output data-testid="trait-value">{settings ? settings.still ? devCopy['preview.trait.on'] : devCopy['preview.trait.off'] : devCopy['preview.trait.absent']}</output>;
}
export function WorldTraitWorkshop() {
  const [world] = useState(() => createWorld(Settings)), [mounted, setMounted] = useState(true);
  useEffect(() => () => world.destroy(), [world]);
  return <main><h1>{devCopy['preview.trait.title']}</h1><div className="actions"><button onClick={() => world.has(Settings) ? world.set(Settings, { still: !world.get(Settings)!.still }) : world.add(Settings({ still: true }))}>{devCopy['preview.trait.change']}</button><button onClick={() => world.remove(Settings)}>{devCopy['preview.trait.remove']}</button><button onClick={() => setMounted(value => !value)}>{devCopy['preview.trait.mount']}</button></div>{mounted ? <WorldProvider world={world}><Subscriber world={world} /></WorldProvider> : null}</main>;
}
