// 3D stills for the comparison page. The version 1 build is packages/app/src/three/critter.ts
// (createCritter) at rest, without the skeleton, lit and framed as three/runtime.ts does it.
// Version 2 parts follow the composition rules of Design System §5.3 as a prototype.
// Surfaces: `rough` is today's MeshStandardMaterial; `toon` is D15's two-step ramp.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { layout, palette } from './generator.js';

const RAD = Math.PI / 180;
const LEAF = '#5F7A55', SKY = '#8FC6D8';
const EAR_DROOP = 25, LIDS_ASLEEP = 0.12, SCALE_GAIN = 0.35, MOUTH_THRESHOLD = 0.35, CHEEK_THRESHOLD = 0.5;

function ramp(values) {
  const texture = new THREE.DataTexture(new Uint8Array(values), values.length, 1, THREE.RedFormat);
  texture.minFilter = texture.magFilter = THREE.NearestFilter;
  texture.generateMipmaps = false; texture.needsUpdate = true;
  return texture;
}
/** The glow point stays inside the accent material group: a per-vertex mask adds emissive at 0.35 (§4.1). */
function withGlow(material) {
  material.onBeforeCompile = shader => {
    shader.vertexShader = 'attribute float glowMask;\nvarying float vGlowMask;\n' + shader.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvGlowMask = glowMask;');
    shader.fragmentShader = 'varying float vGlowMask;\n' + shader.fragmentShader.replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\ntotalEmissiveRadiance += vColor.rgb * 0.35 * vGlowMask;');
  };
  material.customProgramCacheKey = () => 'cc-glow';
  return material;
}
/** Inverted hull: back faces pushed out along the normal, drawn in ink. One extra draw per material group. */
function hull(ink) {
  const material = new THREE.MeshBasicMaterial({ color: ink, side: THREE.BackSide });
  material.onBeforeCompile = shader => { shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\ntransformed += normalize(normal) * 0.028;'); };
  material.customProgramCacheKey = () => 'cc-hull';
  return material;
}

export function buildCritter(params, { surface = 'rough', outline = false, glow = true, ink, eyeWhite, asleep = false, fed = 0, blob }) {
  const d = layout(params), paints = palette(params), v2 = params.version === 2;
  const group = new THREE.Group(), pose = new THREE.Group(); group.add(pose);
  const buckets = [[], [], []];
  const at = (x, y, z) => new THREE.Vector3(x, y, z);
  const root = at(0, 0, 0), head = at(0, d.headC, 0);
  function part(geometry, origin, xyz, scale, paint = paints.body.css, material = 0, rotation = 0, { alpha = 1, glowMask = 0, local } = {}) {
    geometry.scale(scale[0], scale[1], scale[2]); geometry.rotateZ(rotation); geometry.translate(xyz[0], xyz[1], xyz[2]);
    local?.(geometry);
    geometry.translate(origin.x, origin.y, origin.z);
    if (geometry.index) { const indexed = geometry; geometry = indexed.toNonIndexed(); indexed.dispose(); }
    for (const name of Object.keys(geometry.attributes)) if (name !== 'position' && name !== 'normal') geometry.deleteAttribute(name);
    const count = geometry.attributes.position.count, rgb = new THREE.Color(paint), colours = new Float32Array(count * 4);
    for (let i = 0; i < count; i++) colours.set([rgb.r, rgb.g, rgb.b, alpha], i * 4);
    geometry.setAttribute('color', new THREE.BufferAttribute(colours, 4));
    geometry.setAttribute('glowMask', new THREE.BufferAttribute(new Float32Array(count).fill(glowMask), 1));
    buckets[material].push(geometry);
  }
  const sphere = (width = 8, height = 6) => new THREE.SphereGeometry(1, width, height);
  const capsule = () => new THREE.CapsuleGeometry(1, 1, 2, 8);
  const cone = () => new THREE.ConeGeometry(1, 2, 8);

  const body = params.bodyShape === 'capsule' ? capsule() : sphere(16, 12);
  if (params.bodyShape === 'bean') { const positions = body.attributes.position; for (let i = 0; i < positions.count; i++) positions.setZ(i, positions.getZ(i) + .12 * positions.getY(i)); body.computeVertexNormals(); }
  part(body, root, [0, d.bodyC, params.belly * .1], [d.bw, d.bh / (params.bodyShape === 'capsule' ? 1.5 : 1), d.bw * (1 + params.belly)]);
  for (const side of [-1, 1]) {
    part(capsule(), root, [side * d.bw * .44, d.leg * .4, 0], [.10, d.leg / 3, .10]);
    if (params.armType !== 'none') part(capsule(), root, [side * d.bw * .96, d.bodyC, .05], [d.hr * (params.armType === 'paws' ? .33 : .22), d.hr * .3, d.hr * .24], paints.body.css, 0, side * -.25);
  }
  const tailBase = [d.bw, d.bodyC - d.bh * .45, -.16];
  const tails = {
    puff: () => part(sphere(), root, tailBase, [d.hr * .48, d.hr * .48, d.hr * .48]),
    stub: () => part(capsule(), root, [d.bw, d.bodyC - d.bh * .55, -.2], [d.hr * .26, d.hr * .4, d.hr * .26], paints.body.css, 0, -.9),
    curl: () => part(new THREE.TorusGeometry(1, .23, 4, 10, Math.PI * 1.7), root, [d.bw, d.bodyC - d.bh * .4, -.15], [d.hr * .55, d.hr * .55, d.hr * .55]),
    branch: () => { for (const [dx, dy, size, turn] of [[.35, .15, .3, -.6], [.6, .5, .26, -.9], [.75, .9, .22, -1.2]]) part(capsule(), root, [d.bw + dx * d.hr, d.bodyC - d.bh * .3 + dy * d.hr, -.2], [d.hr * size * .5, d.hr * size, d.hr * size * .3], paints.accent.css, 0, turn); },
    tadpole: () => part(cone(), root, [d.bw + d.hr * .45, d.bodyC - d.bh * .3, -.2], [d.hr * .28, d.hr * .7, d.hr * .2], paints.accent.css, 0, -2.2),
    spark: () => { for (const [dx, dy, size] of [[.3, .15, .18], [.6, .55, .14], [.8, .95, .1]]) part(sphere(8, 6), root, [d.bw + dx * d.hr, d.bodyC - d.bh * .3 + dy * d.hr, -.2], [d.hr * size, d.hr * size, d.hr * size], params.glow, 0, 0, { glowMask: 1 }); },
    emberwisp: () => { part(cone(), root, [d.bw + d.hr * .35, d.bodyC - d.bh * .1, -.2], [d.hr * .22, d.hr * .6, d.hr * .18], paints.accent.css, 0, -.5); part(sphere(8, 6), root, [d.bw + d.hr * .7, d.bodyC + d.hr * .35, -.2], [d.hr * .13, d.hr * .13, d.hr * .13], params.glow, 0, 0, { glowMask: 1 }); },
    cloudwisp: () => { part(sphere(), root, tailBase, [d.hr * .42, d.hr * .38, d.hr * .38], paints.accent.css); part(sphere(), root, [d.bw + d.hr * .5, d.bodyC - d.bh * .2, -.25], [d.hr * .3, d.hr * .28, d.hr * .28], paints.accent.css); },
    longwisp: () => { for (const [dx, dy, size, turn] of [[.2, 0, .22, -1.9], [.65, .25, .18, -1.2], [.9, .7, .13, -.5]]) part(capsule(), root, [d.bw + dx * d.hr, d.bodyC - d.bh * .4 + dy * d.hr, -.2], [d.hr * size * .6, d.hr * size * 1.4, d.hr * size * .5], paints.accent.css, 0, turn); },
  };
  tails[params.tailType]?.();
  const front = (x, y) => [x * d.bw, d.bodyC + y * d.bh, d.bw * .95];
  const markings = {
    'belly patch': () => part(sphere(), root, [0, d.bodyC - .2 * d.bh, d.bw * .85], [d.bw * .58, d.bh * .60, .10], paints.accent.css),
    spots: () => { for (const [x, y, r] of [[-.5, .05, .18], [.1, -.42, .15], [.42, .12, .2]]) part(sphere(8, 4), root, front(x, y), [r * d.bw, r * d.bw, .035], paints.accent.css); },
    moss: () => { for (const [x, y] of [[-.5, .2], [.35, -.1], [-.1, -.5]]) part(sphere(8, 4), root, front(x, y), [d.bw * .22, d.bh * .13, .035], paints.accent.css); },
    dew: () => { for (const [x, y] of [[-.4, .3], [.3, .1], [-.2, -.4], [.45, -.4]]) part(sphere(8, 4), root, front(x, y), [d.bw * .08, d.bw * .08, .04], params.glow, 0, 0, { glowMask: 1 }); },
    belly: () => part(sphere(), root, [0, d.bodyC - .25 * d.bh, d.bw * .82], [d.bw * .6, d.bh * .5, .1], params.glow, 0, 0, { glowMask: .5 }),
    sky: () => { for (const [x, y] of [[-.4, .1], [.25, -.2], [-.1, -.55]]) part(new THREE.BoxGeometry(1, 1, 1), root, front(x, y), [d.bw * .3, d.bh * .06, .03], SKY); },
  };
  markings[params.markings]?.();

  part(params.headShape === 'squarish' ? new RoundedBoxGeometry(2, 2, 2, 1, .4) : sphere(16, 12), head, [0, 0, 0], [d.hr, d.hr * (params.headShape === 'egg' ? 1.15 : 1), d.hr]);
  const crown = d.hr * (params.headShape === 'egg' ? 1.15 : 1);
  const crests = {
    sapling: () => { part(capsule(), head, [0, crown + d.hr * .22, 0], [d.hr * .05, d.hr * .15, d.hr * .05], paints.accent.css); part(sphere(8, 4), head, [-d.hr * .2, crown + d.hr * .42, 0], [d.hr * .22, d.hr * .08, d.hr * .12], LEAF, 0, .45); part(sphere(8, 4), head, [d.hr * .2, crown + d.hr * .34, 0], [d.hr * .22, d.hr * .08, d.hr * .12], LEAF, 0, -.4); },
    droplet: () => part(sphere(8, 6), head, [0, crown + d.hr * .12, 0], [d.hr * .16, d.hr * .22, d.hr * .16], paints.accent.css),
    reed: () => { part(capsule(), head, [0, crown + d.hr * .35, -d.hr * .1], [d.hr * .035, d.hr * .3, d.hr * .035], LEAF); part(capsule(), head, [0, crown + d.hr * .72, -d.hr * .1], [d.hr * .08, d.hr * .12, d.hr * .08], paints.accent.css); },
    ember: () => part(cone(), head, [0, crown + d.hr * .2, 0], [d.hr * .12, d.hr * .25, d.hr * .12], params.glow, 0, -.2, { glowMask: 1 }),
    seedpods: () => { for (const dx of [-.3, 0, .3]) part(sphere(8, 6), head, [dx * d.hr, crown + d.hr * (dx === 0 ? .12 : 0), 0], [d.hr * .14, d.hr * .14, d.hr * .14], paints.accent.css); },
  };
  crests[params.crest]?.();
  if (params.earType !== 'none') for (const side of [-1, 1]) {
    const ear = at(side * d.hr * .64, d.headC + d.hr * .65, 0);
    const droop = asleep ? { local: geometry => geometry.rotateZ(-side * EAR_DROOP * RAD) } : {};
    const angle = -side * (params.earSpread + (params.earType === 'floppy' ? 70 : 0)) * RAD;
    const earWidth = d.earLen * (params.earType === 'long' ? .27 : .48);
    const x = -Math.sin(angle) * d.earLen * .45, y = Math.cos(angle) * d.earLen * .45;
    if (params.earType === 'tufts' || params.earType === 'flame') for (const offset of [-1, 0, 1]) part(cone(), ear, [offset * earWidth * .6, d.earLen * .45, 0], [earWidth * .4, d.earLen * (offset === 0 ? .5 : .35), earWidth * .4], paints.body.css, 0, angle + offset * .2, droop);
    else if (params.earType === 'cloud') { part(sphere(), ear, [x, y, 0], [earWidth * .9, d.earLen * .42, earWidth * .8], paints.body.css, 0, angle, droop); part(sphere(), ear, [x * 1.5 - side * earWidth * .3, y * 1.4, 0], [earWidth * .6, d.earLen * .3, earWidth * .55], paints.body.css, 0, angle, droop); }
    else if (params.earType === 'fern') { part(capsule(), ear, [x, y, 0], [earWidth * .32, d.earLen * .4, earWidth * .25], paints.body.css, 0, angle, droop); part(new THREE.TorusGeometry(1, .3, 4, 8, Math.PI * 1.4), ear, [x * 2, y * 2, 0], [earWidth * .28, earWidth * .28, earWidth * .28], paints.accent.css, 0, angle, droop); }
    else {
      const flat = params.earType === 'leaf' || params.earType === 'fin';
      const shape = () => params.earType === 'pointed' || flat ? cone() : sphere(8, 6);
      part(shape(), ear, [x, y, 0], [earWidth * (params.earType === 'fin' ? .8 : 1), d.earLen * .55, earWidth * (flat ? .2 : .45)], paints.body.css, 0, angle, droop);
      part(shape(), ear, [x, y, earWidth * (flat ? .12 : .35)], [earWidth * .6, d.earLen * .39, earWidth * (flat ? .1 : .15)], paints.accent.css, 0, angle, droop);
    }
  }
  const eyeRadius = params.eyeSize * d.hr;
  const lids = asleep ? { local: geometry => geometry.scale(1, LIDS_ASLEEP, 1) } : {};
  for (const side of [-1, 1]) {
    const eye = at(side * params.eyeSpacing * d.hr, d.headC + (params.eyeHeight - .5) * d.hr * 2, d.hr * 1.02);
    part(sphere(10, 8), eye, [0, 0, 0], [eyeRadius * (params.eyeStyle === 'oval' ? .85 : 1), eyeRadius * (params.eyeStyle === 'oval' ? 1.15 : 1), eyeRadius * .5], eyeWhite, 1, 0, lids);
    part(sphere(10, 8), eye, [eyeRadius * .15, 0, eyeRadius * .4], [eyeRadius * params.pupilSize, eyeRadius * params.pupilSize, eyeRadius * .25], ink, 2, 0, lids);
    if (params.eyeStyle === 'half-lid') part(new THREE.SphereGeometry(1, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), eye, [0, 0, .02], [eyeRadius, eyeRadius, eyeRadius * .55], paints.body.css, 0, 0, lids);
    if (params.cheeks || fed >= CHEEK_THRESHOLD) part(sphere(8, 4), at(side * d.hr * .63, d.headC - d.hr * .28, d.hr * .8), [0, 0, 0], [d.hr * .21, d.hr * .13, .04], paints.accent.css);
  }
  if (params.snout !== 'none') part(sphere(), head, [d.hr * .05, -d.hr * .23, d.hr * .96], [d.hr * (params.snout === 'button' ? .14 : .30), d.hr * (params.snout === 'button' ? .1 : .19), d.hr * .15], paints.accent.css);
  if (fed >= MOUTH_THRESHOLD) part(new THREE.TorusGeometry(1, .08, 2, 8, Math.PI), at(0, d.headC - d.hr * .38, d.hr * 1.04), [0, 0, 0], [d.hr * .22, d.hr * .15, .035], ink, 2, Math.PI, { alpha: .6 });
  if (v2 && glow) {
    const spot = params.spot === 'brow' ? [0, d.headC + d.hr * .5, d.hr * .82] : params.spot === 'throat' ? [0, d.bodyC + d.bh * .72, d.bw * .7] : [0, d.bodyC + d.bh * .35, d.bw * .88];
    part(sphere(8, 6), root, spot, [d.hr * .16, d.hr * .16, d.hr * .16], params.glow, 0, 0, { glowMask: 1 });
  }

  const toon = surface === 'toon', ramps = [];
  const materials = toon
    ? [new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: ramps[ramps.push(ramp([90, 255])) - 1], dithering: true, transparent: true }),
      new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: ramps[ramps.push(ramp([255, 255])) - 1], transparent: true }),
      new THREE.MeshStandardMaterial({ roughness: .35, metalness: 0, vertexColors: true, transparent: true })]
    : [new THREE.MeshStandardMaterial({ roughness: .92, metalness: 0, vertexColors: true, dithering: true, transparent: true }),
      new THREE.MeshStandardMaterial({ roughness: .55, metalness: 0, vertexColors: true, transparent: true }),
      new THREE.MeshStandardMaterial({ roughness: .35, metalness: 0, vertexColors: true, transparent: true })];
  if (v2 && glow) withGlow(materials[0]);
  const merged = buckets.map(bucket => mergeGeometries(bucket));
  const geometry = mergeGeometries(merged, true);
  for (const bucket of buckets) for (const item of bucket) item.dispose();
  for (const item of merged) item.dispose();
  const mesh = new THREE.Mesh(geometry, materials); pose.add(mesh);
  let outlineMaterial;
  if (outline) { outlineMaterial = hull(ink); pose.add(new THREE.Mesh(geometry, [outlineMaterial, outlineMaterial, outlineMaterial])); }
  const shadowMaterial = new THREE.SpriteMaterial({ map: blob, color: ink, opacity: .22, depthWrite: false });
  const shadow = new THREE.Sprite(shadowMaterial); shadow.scale.set(d.bw * 2.7, .14, 1); shadow.position.y = .02; group.add(shadow);
  pose.rotation.set(0, -12 * RAD, 0);
  pose.scale.setScalar(1 + SCALE_GAIN * fed);
  return { group, dispose() { geometry.dispose(); materials.forEach(m => m.dispose()); ramps.forEach(t => t.dispose()); outlineMaterial?.dispose(); shadowMaterial.dispose(); } };
}

let renderer, blob;
function blobTexture() {
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = 128;
  const context = canvas.getContext('2d'), gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(255,255,255,1)'); gradient.addColorStop(1, 'rgba(255,255,255,0)');
  context.fillStyle = gradient; context.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(canvas);
}
/** One shared renderer draws each critter into a transparent PNG, with the app's camera and lights. */
export function renderStill(params, options, width, height) {
  if (!renderer) {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(1); renderer.setClearColor(new THREE.Color(0), 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1;
    blob = blobTexture();
  }
  const scene = new THREE.Scene(), light = options.lights;
  scene.add(new THREE.HemisphereLight(light.sky, light.ground, light.skyIntensity));
  const sun = new THREE.DirectionalLight(light.sun, light.sunIntensity); sun.position.set(...light.sunPosition); scene.add(sun);
  scene.add(new THREE.AmbientLight(light.ambient, light.ambientIntensity));
  const critter = buildCritter(params, { ...options, blob }); scene.add(critter.group);
  const camera = new THREE.PerspectiveCamera(28, width / height, .1, 100); camera.position.set(0, 1.4, 7.5); camera.lookAt(0, 1.4, 0);
  renderer.setSize(width, height, false);
  renderer.render(scene, camera);
  const calls = renderer.info.render.calls, triangles = renderer.info.render.triangles;
  const url = renderer.domElement.toDataURL('image/png');
  critter.dispose();
  return { url, calls, triangles };
}
