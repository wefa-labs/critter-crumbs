import { DOM_HOP, REPLY } from '@critter-crumbs/shared';
import type { HopCue } from '../world/index.js';
import { hopPosition, hopProgress } from './hop-geometry.js';
import { tokens } from '../styles/tokens.js';
const DOM_HOP_MS = Number.parseFloat(tokens['dur-2']);
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
export function createHops(document: Document, source: () => HTMLElement | null, target: (id: string) => HTMLElement | null) {
  const flights: { glyph: SVGSVGElement; start: number; from: { x: number; y: number }; to: { x: number; y: number } }[] = [];
  return {
    add(cue: HopCue, now: number) {
      if (flights.length >= DOM_HOP.maxAlive) return;
      const a = source()?.getBoundingClientRect(), b = target(cue.to)?.getBoundingClientRect(); if (!a || !b) return;
      let from = { x: a.x + a.width / 2, y: a.y + a.height / 2 }, to = { x: b.x + b.width / 2, y: b.y + b.height / 2 };
      if (cue.reverse) [from, to] = [to, from];
      const glyph = crumb(document); glyph.classList.add('crumb-hop'); document.body.append(glyph); flights.push({ glyph, start: now, from, to });
    },
    tick(now: number) {
      for (let index = flights.length - 1; index >= 0; index--) {
        const flight = flights[index]!, t = Math.min(1, (now - flight.start) / DOM_HOP_MS);
        if (t >= 1) { flight.glyph.remove(); flights.splice(index, 1); continue; }
        const { x, y } = hopPosition(flight.from, flight.to, hopProgress(t));
        flight.glyph.style.transform = `translate(${x - 8}px, ${y - 8}px) rotate(${DOM_HOP.turnDegrees * t}deg)`;
        flight.glyph.style.opacity = String(t < DOM_HOP.fadeAt ? 1 : (1 - t) / (1 - DOM_HOP.fadeAt));
      }
    },
    clear() { for (const flight of flights) flight.glyph.remove(); flights.length = 0; },
  };
}

export function jiggleHeap(host: HTMLElement | null) { return host?.animate([{transform:'rotate(0deg)'},{transform:`rotate(${REPLY.wallDegrees}deg)`},{transform:`rotate(${-REPLY.wallDegrees}deg)`},{transform:'rotate(0deg)'}],{duration:REPLY.wallMs}) ?? null; }
