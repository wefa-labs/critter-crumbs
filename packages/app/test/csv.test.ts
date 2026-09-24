import { expect,test } from 'vitest';
import { aggregateCsv, giverCsv, shareDecimal } from '../src/app/csv.js';
import type { OpenedFeast } from '../src/app/feast-session.js';
import type { MemberFeast } from '../src/app/feast-view.js';
const id=(n:number)=>`0x${n.toString(16).padStart(64,'0')}` as const;
const targets=[{id:id(1),ownerAddress:null,name:'工具, "shared"\nRepair',position:0,kind:'option' as const},{id:id(2),ownerAddress:null,name:'Seeds',position:1,kind:'option' as const}];
const result={totals:[{targetId:id(1),crumbs:1,share:[1,3] as [number,number]},{targetId:id(2),crumbs:2,share:[2,3] as [number,number]}],totalScattered:3};
test('aggregate CSV preserves target order, Unicode, commas, quotes, newlines and exact six-decimal shares',()=>{
  expect(aggregateCsv(targets,result)).toBe('critter,address,crumbs,share\r\n"工具, ""shared""\nRepair",,1,0.333333\r\nSeeds,,2,0.666667\r\n');
  expect(shareDecimal([0,1])).toBe('0.000000');expect(shareDecimal([1,1])).toBe('1.000000');expect(shareDecimal([1,2000000])).toBe('0.000001');
});
test('zero results export every critter; mapped totals do not rely on sort order',()=>{
  expect(aggregateCsv(targets,{totals:[...result.totals].reverse()})).toBe(aggregateCsv(targets,result));
  expect(aggregateCsv(targets,{totals:targets.map(target=>({targetId:target.id,crumbs:0,share:[0,1]}))})).toContain('Seeds,,0,0.000000');
});
test('giver export is gated and draws only from locally validated counted candidates',()=>{
  const feast={targets,individualOpen:false} as MemberFeast;
  const opened={givers:[{attester:'0x0000000000000000000000000000000000000001',seq:'1',uid:id(3),amounts:[20,80]}]} as Pick<OpenedFeast,'givers'>;
  expect(()=>giverCsv(feast,opened)).toThrow();
  expect(giverCsv({...feast,individualOpen:true},opened)).toContain(',20,80\r\n');
});
