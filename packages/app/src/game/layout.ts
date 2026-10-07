import { copy, CIRCLE_FEEL, PILE_RULE } from '@critter-crumbs/shared';
import type { PortraitExtent } from '../portraits/metrics.js';
export interface Rect { x:number;y:number;width:number;height:number }
export type LayoutState = 'scatter'|'reading'|'feast'|'results'|'empty-results';
export interface LayoutCritter { name:string;own:boolean;count:number;extent:PortraitExtent }
export interface LayoutInput { viewport:{width:number;height:number};critters:readonly LayoutCritter[];focus:number;state:LayoutState;issued:number }
export const overlapArea=(a:Rect,b:Rect)=>Math.max(0,Math.min(a.x+a.width,b.x+b.width)-Math.max(a.x,b.x))*Math.max(0,Math.min(a.y+a.height,b.y+b.height)-Math.max(a.y,b.y));
export function shortName(name:string,limit=10){return name.length>limit?name.slice(0,limit-1)+'…':name;}
const nameWidth=(name:string)=>[...name].reduce((width,ch)=>width+(/[MW@]/.test(ch)?11:/[ilj1 .]/.test(ch)?4:8),0);
export function moundSize(n:number){let rows=0;while(rows*(rows+1)/2<n)rows++;return {rows,width:Math.max(1,rows)*5.2+8,height:Math.max(1,rows)*3.4+9};}
function geometry(W:number,H:number,n:number,desktop:boolean,feast:boolean){
 const floor=H-130,growth=feast?.9:1;
 if(desktop){const u=Math.min(W/880,floor/606),room=(n>8?.78:1)*growth,back=CIRCLE_FEEL.desktop.back*u*room,beside=Math.cos(2*Math.PI/n),frontY=floor*.95,backY=Math.max(floor*.22,back*1.04+40),ry=Math.min((frontY-backY)/(1+beside),floor*.4);return {u,cx:W/2,cy:backY+ry,rx:W*(n>8?.44:.42),ry,back,front:CIRCLE_FEEL.desktop.front*u*room,focusY:floor-14*u,focusSize:CIRCLE_FEEL.desktop.focus*u*growth,ppu:4.2*u,maxHeap:210*u};}
 const crowd=(n>8?.8:n>6?.94:1)*growth;
 return {u:1,cx:W/2,cy:floor*(n>8?.475:n>6?.455:.45),rx:W*.34,ry:floor*(n>8?.32:n>6?.29:.28),back:CIRCLE_FEEL.phone.back*crowd,front:CIRCLE_FEEL.phone.front*crowd,focusY:floor-14,focusSize:CIRCLE_FEEL.phone.focus,ppu:3.4,maxHeap:150};
}
export function layoutGame(input:LayoutInput){
 const desktop=input.viewport.width>=900,W=input.viewport.width-(desktop?Math.min(480,Math.max(400,input.viewport.width*.25)):0),H=input.viewport.height-64,n=input.critters.length;
 if(!n||input.focus<0||input.focus>=n)throw new RangeError('Invalid circle focus');
 const gathered=input.state==='results',empty=input.state==='empty-results',dockH=empty?(desktop?74:260):gathered?(desktop?74:Math.max(130,H-196)):130;
 const geo=geometry(W,empty?H-dockH+130:H,n,desktop,input.state==='feast');
 const dock:Rect={x:0,y:H-dockH,width:W,height:dockH};
 const slots=input.critters.map((critter,index)=>{
  const slot=(index-input.focus+n)%n;let x=geo.cx,y=geo.focusY,size=geo.focusSize,depth=999,face:'left'|'right'|'front'='front';
  if(gathered){const front=n<=5?n:Math.ceil(n/2)+1,back=n-front,crowd=n>8?.88:1;size=(desktop?CIRCLE_FEEL.huddle.desktop*geo.u:CIRCLE_FEEL.huddle.phone)*crowd;const step=size*.58,frontX=(j:number)=>W/2+(j-(front-1)/2)*step;
   if(index<front){x=frontX(index);y=dock.y+size*.1;depth=3200+index;}else{const gap=Math.floor((front-1-back)/2)+(index-front);x=(frontX(gap)+frontX(gap+1))/2;y=dock.y-size*.26;size*=.9;depth=3100+index;}face=x<W/2?'right':'left';
  }else if(slot!==0){const angle=(90-slot*360/n)*Math.PI/180,sin=Math.sin(angle);x=geo.cx+geo.rx*Math.cos(angle);y=geo.cy+geo.ry*sin;size=geo.back+(geo.front-geo.back)*(sin+1)/2;depth=Math.max(1,Math.round(y));}
  const width=Math.round(size),height=Math.round(size*1.25),stage:Rect={x:x-width/2,y:y-height*140/150,width,height},ext=critter.extent;
  const figure:Rect={x:stage.x+ext.left*width,y:stage.y+ext.top*height,width:(ext.right-ext.left)*width,height:y+3-(stage.y+ext.top*height)};
  const pileSize=moundSize(PILE_RULE === 'exact' ? critter.count : Math.ceil(critter.count/4)),pileWidth=critter.count?Math.min(width*.58,pileSize.width*1.1):0;
  const pile:Rect={x:stage.x+.54*width,y:stage.y+.98*height-pileWidth*pileSize.height/pileSize.width,width:pileWidth,height:pileWidth*pileSize.height/pileSize.width};
  const name=critter.own?copy['scatter.own.short']:critter.name,tagHeight=slot===0&&desktop?36:n>8&&!desktop?26:28,fullWidth=nameWidth(name)*(slot===0&&desktop?1.14:n>8&&!desktop?.86:1)+(critter.own||slot===0&&desktop?24:48),shortWidth=nameWidth(shortName(name))*(n>8&&!desktop?.86:1)+(critter.own?24:48);
  return {index,slot,stage,figure,pile,foot:{x,y},depth,face,fullWidth,shortWidth,name,tag:{x:x-fullWidth/2,y:figure.y-4-tagHeight,width:fullWidth,height:tagHeight,hidden:gathered||empty||slot===0&&!desktop,short:false}};
 });
 const focused=slots.find(it=>it.slot===0)!,extent=input.critters[focused.index]!.extent,headR=extent.headRadius*focused.stage.width,headY=focused.stage.y+extent.headY*focused.stage.height;
 const obstacles=slots.filter(it=>it.pile.width&&it.slot!==0).map(it=>it.pile);
 const full=moundSize(PILE_RULE === 'exact' ? input.issued : Math.ceil(input.issued/4)),top=geo.cy-geo.ry+12*geo.u,bottom=desktop?focused.figure.y-4-28-12:Math.min(focused.figure.y,headY-headR*1.05-56)-6;
 const ppu=Math.min(geo.ppu,geo.maxHeap/full.width,Math.max(1,bottom-top)/full.height),heapWidth=full.width*ppu,heapHeight=full.height*ppu,span=Math.max(0,bottom-top-heapHeight),middle=top+span/2;
 const heap:Rect={x:geo.cx-heapWidth/2,y:middle,width:heapWidth,height:heapHeight};
 const around=slots.filter(it=>it.slot!==0).flatMap(it=>[it.figure,{x:it.foot.x-it.shortWidth/2,y:it.figure.y-32,width:it.shortWidth,height:28}]);
 let least=Infinity;for(let step=0;step<=10;step++){const y=top+span*step/10,box={...heap,y},cost=around.reduce((sum,other)=>sum+overlapArea(box,other),0)+Math.abs(y-middle)*.5;if(cost<least){least=cost;heap.y=y;}}
 if(input.state!=='reading')obstacles.push(heap);
 const bubble:Rect={x:Math.min(focused.foot.x+Math.max(headR*.55,desktop?focused.fullWidth/2+6:0),W-58),y:headY-headR*1.05-40,width:52,height:44};
 const candidates=[bubble,{...bubble,x:Math.max(focused.foot.x-Math.max(headR*.55,desktop?focused.fullWidth/2+6:0)-52,6)},{...bubble,y:bubble.y-16}];
 const bestBubble=candidates.map((box,index)=>({box,cost:slots.reduce((sum,it)=>sum+(it.slot===0?0:overlapArea(box,it.figure)),0)+index*40})).sort((a,b)=>a.cost-b.cost)[0]!.box;
 if(input.state!=='reading')obstacles.push(bestBubble);
 // Solve the centred tags together: a tall back critter must leave space for its neighbours.
 const visible=slots.filter(it=>!it.tag.hidden),tolerance=desktop?(input.viewport.width===1280?161:0):n>8?123:0;
 const choices=visible.map(it=>{
  const above=it.figure.y-4-it.tag.height,widths=it.shortWidth<it.fullWidth&&!(it.slot===0&&desktop)?[it.fullWidth,it.shortWidth]:[it.fullWidth];
  const candidates=widths.flatMap((width,shortIndex)=>Array.from({length:65},(_,i)=>{
   const box:Rect={x:Math.min(Math.max(it.foot.x-width/2,6),W-6-width),y:Math.max(2,above-i*4),width,height:it.tag.height};
   const hit=slots.reduce((maximum,other)=>other===it?maximum:Math.max(maximum,overlapArea(box,other.figure)),0);
   const blocked=overlapArea(box,{x:heap.x-2,y:heap.y-2,width:heap.width+4,height:heap.height+4})>0||obstacles.some(other=>overlapArea(box,other)>0)||box.y+box.height>dock.y;
   return {box,short:shortIndex>0,cost:i+shortIndex*20+hit,valid:width<=W-12&&!blocked&&hit<=tolerance};
  })).filter(it=>it.valid).sort((a,b)=>a.cost-b.cost);
  return {it,candidates};
 }).sort((a,b)=>a.candidates.length-b.candidates.length);
 const assigned:Rect[]=[],selected=new Map<number,{box:Rect;short:boolean}>();let attempts=0;
 function fit(index:number):boolean{
  if(index===choices.length)return true;if(++attempts>12000)return false;
  const {it,candidates}=choices[index]!;
  for(const candidate of candidates){if(assigned.some(other=>overlapArea(candidate.box,other)>0))continue;assigned.push(candidate.box);selected.set(it.index,candidate);if(fit(index+1))return true;assigned.pop();selected.delete(it.index);}
  return false;
 }
 const fitted=fit(0);
 for(const it of visible){const choice=selected.get(it.index)??choices.find(choice=>choice.it===it)?.candidates[0];if(choice)it.tag={...choice.box,short:choice.short,hidden:input.state==='reading'&&!desktop&&choice.box.y<390};else if(!fitted)it.tag={...it.tag,y:Math.max(2,it.tag.y)};}
 return {desktop,scene:{x:0,y:64,width:W,height:H},dock,heap,bubble:bestBubble,slots,ppu,unit:geo.u};
}
