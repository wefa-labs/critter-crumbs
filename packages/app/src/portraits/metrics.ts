import { layoutCritter, type VersionedCritter } from "@critter-crumbs/core";
import { gardenSpirits } from "./version.js";
import { gardenRenderer } from "./garden-registry.js";
export interface PortraitExtent {
  top: number;
  left: number;
  right: number;
  headY: number;
  headRadius: number;
  headX?: number;
  hover?: number;
}
const tails: Record<string, readonly [number, number]> = {
  puff: [0.95, 0.46],
  stub: [1.02, 0.5],
  branch: [0.9, 1.51],
  tadpole: [0.9, 1.34],
  spark: [0.9, 1.27],
  emberwisp: [0.9, 1.07],
  cloudwisp: [0.9, 1.25],
  longwisp: [0.9, 1.95],
};
const crests: Record<string, number> = {
  sapling: 0.62,
  droplet: 0.72,
  reed: 0.85,
  ember: 0.78,
  seedpods: 0.45,
};
/** Extents use the painter's authored box, never a DOM measurement. Pass garden=false for the October inked drawing. */
export function portraitMetrics(params: VersionedCritter, fed = 0, garden = gardenSpirits) {
  const g = layoutCritter(params);
  const R = g.hr * 54 * 1.22,
    W = g.bw * 54 * 1.04,
    H = g.bh * 54 * 0.9,
    Rt = R * 0.8;
  const bodyY = 140 - H * 0.96 - 2,
    headY = bodyY - H * 0.8 - R * 0.45,
    earLength = g.earLen * 54 * 0.78;
  const headTop = headY - R * (params.headShape === "egg" ? 1.12 : 1),
    angle = (params.earSpread * Math.PI) / 180;
  const topY =
    Math.min(
      headTop -
        (params.version === "2"
          ? (crests[params.crest] ?? (params.element === "air" ? 0.3 : 0))
          : 0) *
          R,
      headY - R * 0.62 - earLength * 0.95 * Math.max(0, Math.cos(angle)),
      headTop
    ) - 2;
  const [wReach, rReach] = tails[params.tailType] ?? [1, 0],
    rightX = 60 + wReach * W + rReach * Rt;
  const grow = 1 + 0.2 * fed,
    fit = Math.min(1, 134 / ((140 - topY) * grow), 56 / ((rightX - 60) * grow));
  const halfW = Math.max(R, W * 0.86, R * 0.64 + earLength * 0.95 * Math.abs(Math.sin(angle))) + 2,
    scale = fit * grow;
  let extent: PortraitExtent = {
    top: (140 - (140 - topY) * scale) / 150,
    left: (60 - halfW * scale) / 120,
    right: (60 + Math.max(halfW, rightX - 60 + 2) * scale) / 120,
    headY: (140 - (140 - headY) * scale) / 150,
    headRadius: (R * scale) / 120,
  };
  if (params.version === "1") {
    const hr = g.hr * 46,
      hy = 140 - g.headC * 46;
    extent.top = Math.max(0, (hy - hr - g.earLen * 46 * 0.65) / 150);
    extent.left = 0.13;
    extent.right = 0.9;
    extent.headY = hy / 150;
    extent.headRadius = hr / 120;
  }
  if (garden && params.version === "2") extent = gardenRenderer().metrics(params, fed).extent;
  return {
    R,
    W,
    H,
    Rt,
    bodyY,
    headY,
    earLength,
    headTop,
    topY,
    rightX,
    fit,
    grow,
    halfW,
    scale,
    extent,
  };
}
