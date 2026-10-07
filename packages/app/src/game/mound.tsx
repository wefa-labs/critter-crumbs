import { PILE_RULE } from '@critter-crumbs/shared';
import { moundSize } from './layout.js';
import { crumbPath } from './art.js';
export function CrumbMound({count,empty=false,ppu}:{count:number;empty?:boolean;ppu?:number}){
 const n=PILE_RULE==='exact'?count:Math.ceil(count/4),{rows,width,height}=moundSize(n||(empty?3:0));let placed=0;
 const crumbs=[];for(let row=0;row<rows&&placed<n;row++){const columns=Math.min(rows-row,n-placed);for(let i=0;i<columns;i++,placed++)crumbs.push(<g key={placed} data-crumb="true" transform={`translate(${(i-(columns-1)/2)*5.2+((placed*13)%5-2)*.3} ${-row*3.4-1}) rotate(${(placed*37)%70-35}) scale(.4)`}><path d={crumbPath} fill="var(--cc-crumb)" stroke="var(--cc-text)" strokeWidth="1.3" strokeLinejoin="round"/><ellipse cx="-2" cy="-2.5" rx="2.6" ry="1.6" fill="var(--cc-crumb-highlight)"/></g>);}
 return <svg className="crumb-mound" style={ppu?{width:width*ppu,height:height*ppu}:undefined} viewBox={`${-width/2} ${-height+4.5} ${width} ${height}`} aria-hidden="true">{n?<ellipse cx="0" cy="2" rx={width/2-1.5} ry="2.4" fill="var(--cc-text)" opacity=".16"/>:null}{crumbs}{!n&&empty?[-5.2,0,5.2].map((x,i)=><path key={x} d={crumbPath} transform={`translate(${x} -1) rotate(${[-12,18,-4][i]}) scale(.4)`} fill="none" stroke="var(--cc-text)" strokeWidth="1.6" strokeDasharray="4 3" opacity=".4"/>):null}</svg>;
}
export function ThoughtBubble(){return <svg viewBox="0 0 52 44" aria-hidden="true">{[[22,17,11],[33,14,10],[42,20,8],[31,25,9],[17,25,7.5],[10,35,3.6],[4.5,40.5,2.3]].map(([cx,cy,r],i)=><circle key={i} cx={cx} cy={cy} r={r} fill="var(--cc-bg)" stroke="var(--cc-text)" strokeWidth="1.5"/>)}{[23,30,37].map(cx=><circle key={cx} cx={cx} cy="19.5" r="2" fill="var(--cc-text)"/>)}</svg>;}
