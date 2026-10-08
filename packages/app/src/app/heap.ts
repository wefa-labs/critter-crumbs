import { REPLY } from '@critter-crumbs/shared';
import type { HopCue } from '../world/index.js';
import type {Entity,World} from 'koota';
import {DomFlight,spawnDomFlight} from '../world/dom-flights.js';
const ns = 'http://www.w3.org/2000/svg';
const shape = 'M-6-3 -1-6 5-4 7 1 2 6 -5 4Z';
export function crumb(document: Document) {
  const svg = document.createElementNS(ns, 'svg'); svg.setAttribute('viewBox', '-8 -8 16 16'); svg.setAttribute('aria-hidden', 'true'); svg.classList.add('crumb-glyph');
  const path = document.createElementNS(ns, 'path'); path.setAttribute('d', shape); svg.append(path);
  const fleck = document.createElementNS(ns, 'path'); fleck.setAttribute('d', 'M-3-3 -1-4 1-3'); fleck.classList.add('crumb-fleck'); svg.append(fleck); return svg;
}
export function createHeap(host: HTMLElement) {
  const svg = host.ownerDocument.createElementNS(ns, 'svg'); svg.setAttribute('viewBox', '0 0 96 56'); svg.setAttribute('aria-hidden', 'true');
  const glyphs = Array.from({ length: 24 }, (_, index) => {
    const row = index < 11 ? 0 : index < 19 ? 1 : 2, col = index - (row === 0 ? 0 : row === 1 ? 11 : 19), n = [11, 8, 5][row]!;
    const group = host.ownerDocument.createElementNS(ns, 'g'), glyph = crumb(host.ownerDocument);
    const rotation = ((index * 17 + 11) % 51) - 25, scale = .9 + ((index * 7) % 21) / 100;
    group.setAttribute('transform', `translate(${48 + (col - (n - 1) / 2) * 7.2} ${45 - row * 13}) rotate(${rotation}) scale(${scale})`);
    glyph.setAttribute('x', '-8'); glyph.setAttribute('y', '-8'); glyph.setAttribute('width', '16'); glyph.setAttribute('height', '16'); group.append(glyph); svg.append(group); return group;
  }); host.append(svg);
  let previous = -1;
  return { update(remaining: number, issued: number) { const visible = Math.ceil(remaining / issued * 24); if (visible === previous) return; previous = visible; glyphs.forEach((glyph, index) => { glyph.style.display = index < (visible || 3) ? '' : 'none'; glyph.classList.toggle('empty-crumb', visible === 0); }); }, destroy() { svg.remove(); } };
}
/** DOM owns the endpoint measurements and SVG nodes; Koota owns flight state and time. */
export function createHops(document:Document,source:()=>HTMLElement|null,target:(id:string)=>HTMLElement|null,world:()=>World){
 const glyphs=new Map<Entity,SVGSVGElement>();
 return {
  add(cue:HopCue){
   const a=source()?.getBoundingClientRect(),b=target(cue.to)?.getBoundingClientRect();if(!a||!b)return;
   let from={x:a.x+a.width/2,y:a.y+a.height/2},to={x:b.x+b.width/2,y:b.y+b.height/2};if(cue.reverse)[from,to]=[to,from];
   const entity=spawnDomFlight(world(),from,to);if(!entity)return;const glyph=crumb(document);glyph.classList.add('crumb-hop');document.body.append(glyph);glyphs.set(entity,glyph);
  },
  tick(){for(const [entity,glyph]of glyphs){if(!entity.isAlive()){glyph.remove();glyphs.delete(entity);continue;}const pose=entity.get(DomFlight)!;glyph.style.transform=`translate(${pose.x-8}px, ${pose.y-8}px) rotate(${pose.rotation}deg)`;glyph.style.opacity=String(pose.opacity);}},
  clear(){for(const [entity,glyph]of glyphs){glyph.remove();if(entity.isAlive())entity.destroy();}glyphs.clear();},
 };
}

export function jiggleHeap(host: HTMLElement | null) { return host?.animate([{transform:'rotate(0deg)'},{transform:`rotate(${REPLY.wallDegrees}deg)`},{transform:`rotate(${-REPLY.wallDegrees}deg)`},{transform:'rotate(0deg)'}],{duration:REPLY.wallMs}) ?? null; }
