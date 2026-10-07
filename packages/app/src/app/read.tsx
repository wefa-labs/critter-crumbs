import {useEffect,useRef,useState} from 'react';
import {WorldProvider} from 'koota/react';
import {copy,formatCopy,STATEMENTS_FOCUS_MS,WAKE} from '@critter-crumbs/shared';
import {StatementReveal,type GameSettings} from '../world/index.js';
import {useAudio} from '../audio/context.js';
import {createStageRuntime} from '../sim/stage-runtime.js';
import {GameScene,GameNotice,StatementPanel} from '../game/parts.js';
import {Link,navigate,targetLabel} from './ui.js';
import {gameView,portraitVariant,type MemberFeast} from './feast-view.js';
export function Reveal({feast,settings,announce,viewer}:{feast:MemberFeast;settings:GameSettings;announce:(text:string)=>void;viewer:string}){
 const audio=useAudio(),[focus,setFocus]=useState(0),[reading,setReading]=useState(false),[ready,setReady]=useState(false),readingButton=useRef<HTMLButtonElement>(null);
 const [runtime]=useState(()=>createStageRuntime({viewer,asleep:true,issued:feast.crumbsPerCritter,settings,outputs:{sound:audio.cue},critters:feast.targets.map(target=>({id:target.id,address:target.ownerAddress??target.id,ownerAddress:target.ownerAddress,name:targetLabel(target),variant:portraitVariant(feast,target)}))}));
 useEffect(()=>{runtime.actions.beginReveal();const stop=runtime.start();let settled=false;const unwatch=runtime.onFrame(()=>{if(runtime.world.get(StatementReveal)?.ready&&!settled){settled=true;setReady(true);announce(formatCopy('reveal.announce',{n:feast.targets.length}));}});runtime.animateFor(STATEMENTS_FOCUS_MS+WAKE.ms);return()=>{unwatch();stop();audio.stop();queueMicrotask(()=>runtime.destroy());};},[runtime]);
 useEffect(()=>runtime.setSettings(settings),[runtime,settings]);
 useEffect(()=>{if(ready)readingButton.current?.focus();},[ready]);
 const state=gameView({phase:feast.phase,remaining:feast.crumbsPerCritter,reveal:!reading,reading}).state;
 return <WorldProvider world={runtime.world}><section className="game-flow"><GameScene runtime={runtime} feast={feast} focus={focus} turnTo={setFocus} state={state} editable={false} reading={reading} onRead={()=>{setReading(true);audio.play('statement.open');}} onClose={()=>setReading(false)} announce={announce} panel={reading?<StatementPanel feast={feast} focus={focus} close={()=>setReading(false)} turn={d=>setFocus((focus+d+feast.targets.length)%feast.targets.length)}/>:undefined} focusRow={<strong className="focus-name">{targetLabel(feast.targets[focus]!)}</strong>} middle={<Link className="button" href={`/feasts/${feast.id}/scatter`}>{copy['read.skip']}</Link>}/>{!reading?<GameNotice title={copy['reveal.title']}><p>{formatCopy('reveal.body',{crumbs:feast.crumbsPerCritter})}</p><button ref={readingButton} disabled={!ready} onClick={()=>navigate(`/feasts/${feast.id}/read`)}>{copy['reveal.cta']}</button></GameNotice>:null}</section></WorldProvider>;
}
