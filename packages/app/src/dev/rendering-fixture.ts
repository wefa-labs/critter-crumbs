import { formatDevCopy } from '@critter-crumbs/shared';
export const renderingCritters = (count: number) => Array.from({length:count},(_,i)=>({id:String(i),address:`0x${(i+1).toString(16).padStart(40,'0')}`,variant:i%5,name:formatDevCopy('preview.render.critter',{n:i+1})}));
