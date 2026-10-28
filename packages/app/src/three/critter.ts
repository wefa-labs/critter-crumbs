// WEFA reserved mesh artwork implementation; see ../../LICENSE.
import { Bone, BufferGeometry, CapsuleGeometry, Color, ConeGeometry, Float32BufferAttribute, Group, MeshStandardMaterial, Skeleton, SkinnedMesh, SphereGeometry, Sprite, SpriteMaterial, TorusGeometry, Uint16BufferAttribute, Vector3, type Texture } from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { layout, type CritterParameters } from '@critter-crumbs/core';
import { REDUCED_MOTION, RENDER_BUDGET, RIG } from '@critter-crumbs/shared';
import { palette } from '../portraits/colour.js';
import { tokens } from '../styles/tokens.js';
import type { Rig as RigTrait } from '../world/traits.js';
import type { TraitRecord } from 'koota';

/** Four calls per critter: three merged skinned materials and one shared radial blob. */
export function createCritter(params: CritterParameters, blob: Texture) {
  const d = layout(params), paints = palette(params), group = new Group(), pose = new Group(); group.add(pose);
  const root = new Bone(), bones = [root], parts: BufferGeometry[][] = [[], [], []];
  function bone(parent: Bone, x: number, y: number, z: number) { const b = new Bone(); b.position.set(x, y, z); parent.add(b); bones.push(b); root.updateMatrixWorld(true); return b; }
  const head = bone(root, 0, d.headC, 0), ears: Bone[] = [], eyes: Bone[] = [], pupils: Bone[] = [], cheeks: Bone[] = [];
  function part(geometry: BufferGeometry, parent: Bone, xyz: number[], scale: number[], paint = paints.body.css, material = 0, rotation = 0, alpha = 1) {
    geometry.scale(scale[0]!, scale[1]!, scale[2]!); geometry.rotateZ(rotation); geometry.translate(xyz[0]!, xyz[1]!, xyz[2]!); geometry.applyMatrix4(parent.matrixWorld);
    if (geometry.index) { const indexed = geometry; geometry = indexed.toNonIndexed(); indexed.dispose(); }
    const count = geometry.attributes.position!.count, skin = [], weights = [], colours = [], rgb = new Color(paint);
    for (let i = 0; i < count; i++) { skin.push(bones.indexOf(parent), 0, 0, 0); weights.push(1, 0, 0, 0); colours.push(rgb.r, rgb.g, rgb.b, alpha); }
    geometry.setAttribute('skinIndex', new Uint16BufferAttribute(skin, 4)); geometry.setAttribute('skinWeight', new Float32BufferAttribute(weights, 4)); geometry.setAttribute('color', new Float32BufferAttribute(colours, 4)); parts[material]!.push(geometry);
  }
  const sphere = (width = 8, height = 6) => new SphereGeometry(1, width, height);
  const capsule = () => new CapsuleGeometry(1, 1, 2, 8);
  const body = params.bodyShape === 'capsule' ? capsule() : sphere(16, 12);
  if (params.bodyShape === 'bean') { const positions = body.attributes.position!; for (let i = 0; i < positions.count; i++) positions.setZ(i, positions.getZ(i) + .12 * positions.getY(i)); body.computeVertexNormals(); }
  part(body, root, [0, d.bodyC, params.belly * .1], [d.bw, d.bh / (params.bodyShape === 'capsule' ? 1.5 : 1), d.bw * (1 + params.belly)]);
  for (const side of [-1, 1]) {
    part(capsule(), root, [side * d.bw * .44, d.leg * .4, 0], [.10, d.leg / 3, .10]);
    if (params.armType !== 'none') part(capsule(), root, [side * d.bw * .96, d.bodyC, .05], [d.hr * (params.armType === 'paws' ? .33 : .22), d.hr * .3, d.hr * .24], paints.body.css, 0, side * -.25);
  }
  if (params.tailType === 'puff') part(sphere(), root, [d.bw, d.bodyC - d.bh * .45, -.16], [d.hr * .48, d.hr * .48, d.hr * .48]);
  if (params.tailType === 'stub') part(capsule(), root, [d.bw, d.bodyC - d.bh * .55, -.2], [d.hr * .26, d.hr * .4, d.hr * .26], paints.body.css, 0, -.9);
  if (params.tailType === 'curl') part(new TorusGeometry(1, .23, 4, 10, Math.PI * 1.7), root, [d.bw, d.bodyC - d.bh * .4, -.15], [d.hr * .55, d.hr * .55, d.hr * .55]);
  if (params.markings === 'belly patch') part(sphere(), root, [0, d.bodyC - .2 * d.bh, d.bw * .85], [d.bw * .58, d.bh * .60, .10], paints.accent.css);
  if (params.markings === 'spots') for (const [x,y,r] of [[-.5,.05,.18],[.1,-.42,.15],[.42,.12,.2]]) part(sphere(8,4),root,[x!*d.bw,d.bodyC+y!*d.bh,d.bw*.95],[r!*d.bw,r!*d.bw,.035],paints.accent.css);
  part(params.headShape === 'squarish' ? new RoundedBoxGeometry(2, 2, 2, 1, .4) : sphere(16, 12), head, [0, 0, 0], [d.hr, d.hr * (params.headShape === 'egg' ? 1.15 : 1), d.hr]);
  if (params.earType !== 'none') for (const side of [-1,1]) {
    const ear = bone(head, side * d.hr * .64, d.hr * .65, 0); ears.push(ear);
    const angle = -side * (params.earSpread + (params.earType === 'floppy' ? 70 : 0)) * Math.PI / 180;
    const earWidth = d.earLen * (params.earType === 'long' ? .27 : .48);
    if (params.earType === 'tufts') for (const offset of [-1,0,1]) part(new ConeGeometry(1,2,8),ear,[offset*earWidth*.6,d.earLen*.45,0],[earWidth*.4,d.earLen*(offset===0?.5:.35),earWidth*.4],paints.body.css,0,angle+offset*.2);
    else { const shape = () => params.earType === 'pointed' ? new ConeGeometry(1,2,8) : sphere(8,6);
      const x=-Math.sin(angle)*d.earLen*.45,y=Math.cos(angle)*d.earLen*.45;
      part(shape(),ear,[x,y,0],[earWidth,d.earLen*.55,earWidth*.45],paints.body.css,0,angle);
      part(shape(),ear,[x,y,earWidth*.35],[earWidth*.6,d.earLen*.39,earWidth*.15],paints.accent.css,0,angle);
    }
  }
  const eyeRadius=params.eyeSize*d.hr;
  for (const side of [-1,1]) {
    const eye = bone(head, side*params.eyeSpacing*d.hr,(params.eyeHeight-.5)*d.hr*2,d.hr*1.02); eyes.push(eye);
    part(sphere(10,8),eye,[0,0,0],[eyeRadius*(params.eyeStyle==='oval'?.85:1),eyeRadius*(params.eyeStyle==='oval'?1.15:1),eyeRadius*.5],tokens.surface,1);
    const pupil=bone(eye,eyeRadius*.15,0,eyeRadius*.4);pupils.push(pupil);
    part(sphere(10,8),pupil,[0,0,0],[eyeRadius*params.pupilSize,eyeRadius*params.pupilSize,eyeRadius*.25],tokens.burrow,2);
    if(params.eyeStyle==='half-lid') part(new SphereGeometry(1,8,4,0,Math.PI*2,0,Math.PI/2),eye,[0,0,.02],[eyeRadius,eyeRadius,eyeRadius*.55]);
    const cheek=bone(head,side*d.hr*.63,-d.hr*.28,d.hr*.8);cheeks.push(cheek);part(sphere(8,4),cheek,[0,0,0],[d.hr*.21,d.hr*.13,.04],paints.accent.css);
  }
  if(params.snout!=='none')part(sphere(),head,[d.hr*.05,-d.hr*.23,d.hr*.96],[d.hr*(params.snout==='button'?.14:.30),d.hr*(params.snout==='button'?.1:.19),d.hr*.15],paints.accent.css);
  const mouth=bone(head,0,-d.hr*.38,d.hr*1.04);
  part(new TorusGeometry(1,.08,2,8,Math.PI),mouth,[0,0,0],[d.hr*.22,d.hr*.15,.035],tokens.burrow,2,Math.PI,RIG.mouthOpacity);
  const materials=[new MeshStandardMaterial({roughness:.92,metalness:0,vertexColors:true,dithering:true,transparent:true}),new MeshStandardMaterial({roughness:.55,metalness:0,vertexColors:true,transparent:true}),new MeshStandardMaterial({roughness:.35,metalness:0,vertexColors:true,transparent:true})];
  const buckets=parts.map(bucket=>mergeGeometries(bucket)!);const geometry=mergeGeometries(buckets,true)!;
  for(const bucket of parts)for(const item of bucket)item.dispose();for(const item of buckets)item.dispose();
  const triangles=(geometry.index?.count??geometry.attributes.position!.count)/3+2;
  if(triangles>RENDER_BUDGET.trianglesPerCritter)throw new RangeError('Critter triangle budget exceeded');
  const mesh=new SkinnedMesh(geometry,materials);mesh.add(root);mesh.bind(new Skeleton(bones));mesh.frustumCulled=false;pose.add(mesh);
  const shadowMaterial=new SpriteMaterial({map:blob,color:tokens.burrow,opacity:.22,depthWrite:false});const shadow=new Sprite(shadowMaterial);shadow.scale.set(d.bw*2.7,.14,1);shadow.position.y=.02;group.add(shadow);
  const pupilRest=pupils.map(b=>b.position.clone());
  let fadeAt:number|undefined,previousScale:number|undefined,previousLids:number|undefined;
  function apply(rig:TraitRecord<typeof RigTrait>,now=0,quiet=false) {
    const changed=fadeAt===undefined||(quiet&&(rig.scaleX!==previousScale||rig.lids!==previousLids));
    if(changed)fadeAt=now;
    previousScale=rig.scaleX;previousLids=rig.lids;
    const opacity=Math.min(1,Math.max(0,(now-fadeAt!)/REDUCED_MOTION.growthCrossfadeMs));
    materials.forEach(material=>{material.opacity=opacity;});shadowMaterial.opacity=.22*opacity;
    pose.scale.set(rig.scaleX,rig.scaleY,rig.scaleZ);pose.rotation.set(rig.postureX*Math.PI/180,-12*Math.PI/180,rig.leanZ*Math.PI/180);pose.position.y=rig.liftY;
    head.rotation.z=rig.headTilt*Math.PI/180;ears.forEach((b,i)=>{b.rotation.z=(i===0?rig.earL:-rig.earR)*Math.PI/180;});
    eyes.forEach(b=>{b.scale.y=rig.lids;});pupils.forEach((b,i)=>{b.position.copy(pupilRest[i]!).add(new Vector3(rig.pupilX*eyeRadius,rig.pupilY*eyeRadius,0));});
    cheeks.forEach(b=>{b.scale.setScalar(Math.max(params.cheeks?1:0,rig.cheeks));});mouth.scale.set(rig.mouth>0?1:0,Math.max(0,rig.mouth),rig.mouth>0?1:0);
    return changed;
  }
  return {group,triangles,apply,dispose(){geometry.dispose();materials.forEach(m=>m.dispose());shadowMaterial.dispose();mesh.skeleton.dispose();}};
}
