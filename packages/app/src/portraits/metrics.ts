import { layoutCritter, type VersionedCritter } from '@critter-crumbs/core';
export interface PortraitExtent { top: number; left: number; right: number; headY: number; headRadius: number }
const tails: Record<string, readonly [number,number]> = {puff:[.95,.46],stub:[1.02,.5],branch:[.9,1.51],tadpole:[.9,1.34],spark:[.9,1.27],emberwisp:[.9,1.07],cloudwisp:[.9,1.25],longwisp:[.9,1.95]};
const crests: Record<string,number> = {sapling:.62,droplet:.72,reed:.85,ember:.78,seedpods:.45};
/** Extents use the painter's authored box, never a DOM measurement. */
export function portraitMetrics(params: VersionedCritter, fed=0) {
 const g=layoutCritter(params);
 const R=g.hr*54*1.22,W=g.bw*54*1.04,H=g.bh*54*.9,Rt=R*.8;
 const bodyY=140-H*.96-2,headY=bodyY-H*.8-R*.45,earLength=g.earLen*54*.78;
 const headTop=headY-R*(params.headShape==='egg'?1.12:1),angle=params.earSpread*Math.PI/180;
 const topY=Math.min(headTop-(params.version==='2'?(crests[params.crest]??(params.element==='air'?.3:0)):0)*R,headY-R*.62-earLength*.95*Math.max(0,Math.cos(angle)),headTop)-2;
 const [wReach,rReach]=tails[params.tailType]??[1,0],rightX=60+wReach*W+rReach*Rt;
 const grow=1+.2*fed,fit=Math.min(1,134/((140-topY)*grow),56/((rightX-60)*grow));
 const halfW=Math.max(R,W*.86,R*.64+earLength*.95*Math.abs(Math.sin(angle)))+2,scale=fit*grow;
 const extent:PortraitExtent={top:(140-(140-topY)*scale)/150,left:(60-halfW*scale)/120,right:(60+Math.max(halfW,rightX-60+2)*scale)/120,headY:(140-(140-headY)*scale)/150,headRadius:R*scale/120};
 if(params.version==='1') {const hr=g.hr*46,hy=140-g.headC*46;extent.top=Math.max(0,(hy-hr-g.earLen*46*.65)/150);extent.left=.13;extent.right=.9;extent.headY=hy/150;extent.headRadius=hr/120;}
 return {R,W,H,Rt,bodyY,headY,earLength,headTop,topY,rightX,fit,grow,halfW,scale,extent};
}
