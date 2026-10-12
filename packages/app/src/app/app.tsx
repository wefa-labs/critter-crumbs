import { lazy, Suspense, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { ApiClientError, createApiClient, type AccountOption, type AccountProvider } from '@critter-crumbs/core';
import { copy, formatCopy, type CopyId, ValidationError } from '@critter-crumbs/shared';
import { browserSettings, MUSIC_SETTING, saveSetting, settingKeys, type StoredSetting } from '../sim/settings.js';
import { createSession } from './session.js';
import { createAudio, UNLOCK_EVENTS, type MusicTrack } from '../audio/index.js';
import { AudioProvider } from '../audio/context.js';
import { Announcements } from './announcements.js';
import { ConnectSheet } from './connect.js';
import { Launcher } from './launcher.js';
import { MusicButton } from './music-button.js';
import { createPressWatch } from './music-choice.js';
import { screenMusic } from './screen-music.js';
import { readDarkChoice, saveDarkChoice, showDarkChoice } from './theme.js';
const FeastRoute=lazy(()=>import('./feast.js').then(module=>({default:module.FeastRoute})));
const LearnRoute=lazy(()=>import('./learn.js').then(module=>({default:module.Learn})));
/* starting a feast is a creator's occasional page, so its code arrives when it is opened */
const SetupRoute=lazy(()=>import('./setup.js').then(module=>({default:module.SetupRoute})));
import { Burrow, CreateBurrow, Home } from './burrows.js';
import { Dialog, Field, Link, Opening, PortraitImage, displayName } from './ui.js';

type Choice = { provider: AccountProvider; option: AccountOption };
function message(error: unknown, fallback: CopyId = 'err.generic') { return error instanceof ApiClientError || error instanceof ValidationError ? copy[error.copyId].replace(/\{[^}]+\}/g, '…') : copy[fallback]; }
export function App() {
  const [alert, setAlert] = useState(''), [announcement, announce] = useState('');
  const [services] = useState(() => {
    const api = createApiClient({ onClockSkew: (_id, milliseconds) => announce(formatCopy('err.clockSkew', { minutes: Math.round(milliseconds / 60000) })) });
    const preferences = browserSettings(window);
    const audio = createAudio(preferences.settings);
    return { api, session: createSession(api), preferences, audio, pressWatch: createPressWatch(audio.running) };
  });
  const { api, session, audio, pressWatch } = services, state = useSyncExternalStore(session.subscribe, session.snapshot);
  const [path, setPath] = useState(location.pathname), [busy, setBusy] = useState(false), running = useRef(false), resumeAfterConnect = useRef(false);
  const [connecting, setConnecting] = useState(false), [choices, setChoices] = useState<Choice[]>([]), [discovering, setDiscovering] = useState(false), [connectReason, setConnectReason] = useState('');
  /* the choice the connect sheet is waiting on, from its press until the app it names has answered */
  const [waiting, setWaiting] = useState<AccountOption | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false), [settings, setSettings] = useState(services.preferences.settings);
  /* dark follows the device until someone chooses (theme.ts) */
  const [darkChoice, setDarkChoice] = useState(() => readDarkChoice(services.preferences.storage)), [deviceDark, setDeviceDark] = useState(() => matchMedia('(prefers-color-scheme: dark)').matches);
  const sounding = useSyncExternalStore(audio.subscribe, audio.running);
  const [onboardingDismissed, dismissOnboarding] = useState(false);
  const [name, setName] = useState(''), [online, setOnline] = useState(navigator.onLine);
  const providers = useRef<Promise<AccountProvider[]> | undefined>(undefined);
  const working = busy || state.busy;
  async function run(action: () => Promise<void>) {
    if (running.current) return;
    running.current = true; setBusy(true); setAlert('');
    try { await action(); } catch (error) { if (error instanceof ApiClientError && error.status === 401) { resumeAfterConnect.current = true; setConnectReason(error.copyId === 'err.generic' ? '' : message(error)); void connect(); } else { setAlert(message(error)); audio.play('error'); } }
    finally { running.current = false; setBusy(false); }
  }
  useEffect(() => { void session.restore().catch(error => setAlert(message(error))); }, [session]);
  useEffect(() => {
    const changed = () => { audio.stop(); setPath(location.pathname); setAlert(''); setSettingsOpen(false); };
    const network = () => { setOnline(navigator.onLine); setAlert(navigator.onLine ? '' : copy['err.offline']); if (navigator.onLine) announce(copy['err.online']); };
    const media = matchMedia('(prefers-reduced-motion: reduce)'), scheme = matchMedia('(prefers-color-scheme: dark)');
    const motion = () => setSettings(value => ({ ...value, reducedMotion: media.matches })), device = () => setDeviceDark(scheme.matches);
    addEventListener('popstate', changed); addEventListener('online', network); addEventListener('offline', network); media.addEventListener('change', motion); scheme.addEventListener('change', device);
    return () => { removeEventListener('popstate', changed); removeEventListener('online', network); removeEventListener('offline', network); media.removeEventListener('change', motion); scheme.removeEventListener('change', device); };
  }, []);
  useEffect(() => { if (state.me?.warning) announce(copy[state.me.warning]); }, [state.me?.warning]);
  useEffect(() => { audio.setSettings(settings); }, [audio, settings]);
  useEffect(() => {
    /* the press watch hears of each event before it unlocks the sound (music-choice.ts) */
    const gesture = (event: Event) => { pressWatch.saw(event.type, event instanceof KeyboardEvent ? event.key : undefined); audio.unlock(); }, visibility = () => audio.setHidden(document.hidden);
    const press = (event: MouseEvent) => { if (event.target instanceof Element && event.target.closest('[data-sound="ui.tap"]')) audio.play('ui.tap'); };
    for (const type of UNLOCK_EVENTS) document.addEventListener(type,gesture,true);
    document.addEventListener('click',press); document.addEventListener('visibilitychange',visibility); visibility();
    return () => { for (const type of UNLOCK_EVENTS) document.removeEventListener(type,gesture,true); document.removeEventListener('click',press); document.removeEventListener('visibilitychange',visibility); audio.destroy(); };
  }, [audio, pressWatch]);
  useEffect(() => { document.documentElement.dataset.still = String(settings.still || settings.reducedMotion); }, [settings.still, settings.reducedMotion]);
  async function connect() {
    setConnecting(true); setDiscovering(true); setAlert('');
    try {
      providers.current ??= (async () => {
        if (import.meta.env.DEV) {
          const { createDevAccountProvider } = await import('../dev/account-provider.js');
          const local = createDevAccountProvider(api);
          if ((await local.discover()).length) return [local];
        }
        const { createInjectedAccountProvider } = await import('../crypto/index.js');
        return [createInjectedAccountProvider({ chainId: 84532 })];
      })();
      const found = await Promise.all((await providers.current).map(async provider => (await provider.discover()).map(option => ({ provider, option }))));
      setChoices(found.flat());
    } catch (error) { setAlert(message(error)); } finally { setDiscovering(false); }
  }
  /* A connection that is refused or fails closes the sheet, and the screen behind says why (the launcher in its sheet). */
  function closeConnect() { resumeAfterConnect.current = false; setConnectReason(''); setConnecting(false); }
  function connectWith(option: AccountOption) {
    const provider = choices.find(choice => choice.option === option)?.provider;
    if (!provider) return;
    setWaiting(option);
    void run(async () => {
      try { await session.connect(provider, option); audio.play('connect'); dismissOnboarding(false); setConnecting(false); setConnectReason(''); if (resumeAfterConnect.current) { resumeAfterConnect.current = false; setAlert(copy['connect.resumed']); } }
      catch (error) { closeConnect(); setAlert(message(error, 'connect.rejected')); }
      finally { setWaiting(null); }
    });
  }
  function chooseSetting(key: StoredSetting, value: boolean) { saveSetting(services.preferences.storage, key, value); setSettings(settings => ({ ...settings, [key]: value })); }
  function chooseDark(value: boolean) { saveDarkChoice(services.preferences.storage, value); showDarkChoice(document.documentElement, value); setDarkChoice(value); }
  const setupRoute = /^\/burrows\/([^/]+)\/feasts\/new$/.exec(path);
  const feastRoute = /^\/feasts\/([^/]+)(?:\/.*)?$/.exec(path);
  const me = state.me, burrow = /^\/burrows\/([^/]+)$/.exec(path);
  const nameNeeded = !!me && !me.ensName && !me.displayName;
  const meetNeeded = !!me && !nameNeeded && !me.critterLocked;
  /* the Music toggle wherever there is no Settings to open: the launcher, the first steps and a visitor's header */
  const musicButton = <MusicButton on={settings.music} sounding={sounding} soundAtPress={pressWatch.soundAtPress} choose={value => chooseSetting(MUSIC_SETTING, value)} />;
  /* the launcher says its own trouble, in its sheet */
  const launching = state.ready && !feastRoute && path !== '/how-it-works' && !me;
  /* each screen's music; a feast's pages name their own, and loading leaves playing whatever was */
  let content, music: MusicTrack | undefined;
  if (!state.ready) content = <Opening bare />;
  else if (feastRoute) content = <Suspense fallback={<Opening bare />}><FeastRoute onProfile={()=>setSettingsOpen(true)} clearError={() => setAlert('')} key={feastRoute[1]! + (me?.address ?? '')} id={feastRoute[1]!} api={api} me={me} run={run} busy={working} announce={announce} settings={settings} path={path} account={() => session.snapshot().account} connect={() => void connect()} sound={musicButton} /></Suspense>;
  else if (path === '/how-it-works') { music = screenMusic.launcher; content = <Suspense fallback={<Opening bare />}><LearnRoute sound={musicButton} announce={announce} still={settings.still || settings.reducedMotion} /></Suspense>; }
  else if (!me) { music = screenMusic.launcher; content = <Launcher connect={() => void connect()} busy={working} notice={alert || (online ? '' : copy['err.offline'])} sound={musicButton} />; }
  else if (setupRoute) { music = screenMusic.setup; content = <Suspense fallback={<Opening />}><SetupRoute announce={announce} key={path} burrowId={setupRoute[1]!} api={api} run={run} busy={working} /></Suspense>; }
  else if (path === '/burrows/new') { music = screenMusic.burrow; content = <CreateBurrow api={api} session={session} run={run} busy={working} />; }
  else if (burrow) { music = screenMusic.burrow; content = <Burrow key={path} id={burrow[1]!} api={api} me={me} session={session} run={run} busy={working} announce={announce} />; }
  else { music = screenMusic.home; content = <Home me={me} api={api} />; }
  useEffect(() => { if (music) audio.music(music); }, [audio, music]);
  return <AudioProvider value={audio}><Announcements alert={alert} alertSeen={!launching} announcement={announcement} clearAnnouncement={announce}>
    <a href="#content" className="skip-link">{copy['skip.content']}</a>
    <aside className="environment-notice" aria-label={copy['app.environment.label']}><strong>{copy['app.environment.badge']}</strong><span>{copy['app.environment.help']}</span></aside>
    <header><Link href="/" className="brand wordmark">{copy['app.name']}</Link><nav className="actions" aria-label={copy['app.navigation']}>
      {me ? <><button className="quiet connected-name" onClick={() => dismissOnboarding(false)}><PortraitImage address={me.address} variant={me.variant} name={displayName(me)} />{displayName(me)}</button><button className="quiet" disabled={working} onClick={() => void run(() => session.disconnect())}>{copy['action.disconnect']}</button><button className="secondary" onClick={() => setSettingsOpen(true)}>{copy['action.settings']}</button></>
        : musicButton}
    </nav><div id="feast-header" /></header>
    {!online && !launching ? <p className="notice">{copy['err.offline']}</p> : null}
    <main id="content" tabIndex={-1}>{content}</main>
    {connecting ? <ConnectSheet options={choices.map(choice => choice.option)} discovering={discovering} reason={connectReason} waiting={waiting} busy={working} choose={connectWith} cancel={closeConnect} /> : null}
    {nameNeeded && !connecting && !onboardingDismissed ? <Dialog title={copy['name.title']} onClose={() => dismissOnboarding(true)} busy={working}><p>{copy['name.help']}</p><form onSubmit={event => { event.preventDefault(); void run(async () => { await session.updateProfile({ displayName: name }); setName(''); }); }}><Field label="name.label"><input autoFocus required maxLength={40} value={name} onChange={event => setName(event.target.value)} /></Field><button disabled={working || !name.trim()}>{copy['name.save']}</button></form></Dialog> : null}
    {meetNeeded && !connecting && !onboardingDismissed ? <Dialog title={copy['critter.meet.title']} onClose={() => dismissOnboarding(true)} busy={working}><div className="meet-portrait"><PortraitImage address={me!.address} variant={me!.variant} name={displayName(me!)} size="stage" decorative={false} /></div><p>{formatCopy('critter.meet.body', { max: 4 })}</p><div className="actions"><button className="secondary" disabled={working || me!.rerollsUsed >= 4} onClick={() => void run(async () => { await session.updateProfile({ variant: me!.variant + 1 }); audio.play('reroll'); announce(formatCopy('critter.reroll.announce', { remaining: 4 - session.snapshot().me!.rerollsUsed })); })}>{me!.rerollsUsed === 3 ? copy['critter.reroll.last'] : formatCopy('critter.reroll', { remaining: 4 - me!.rerollsUsed })}</button><button disabled={working} onClick={() => void run(() => session.updateProfile({ keepCritter: true }))}>{copy['critter.keep']}</button></div></Dialog> : null}
    {settingsOpen ? <Dialog title={copy['settings.title']} onClose={() => setSettingsOpen(false)}><div className="stack">{me?<div className="actions"><button className="quiet" onClick={()=>{setSettingsOpen(false);dismissOnboarding(false);}}>{displayName(me)}</button><button className="secondary" disabled={working} onClick={()=>void run(async()=>{await session.disconnect();setSettingsOpen(false);})}>{copy['action.disconnect']}</button></div>:null}{(Object.keys(settingKeys) as StoredSetting[]).map(key => {
      const labels = { effects: 'sound.effects.label', music: 'sound.music.label', still: 'motion.still.label', simple: 'view.simple.label' } as const;
      const help = { effects: 'sound.effects.help', music: 'sound.music.help', still: 'motion.still.help', simple: 'view.simple.help' } as const;
      return <label className="setting" key={key}><input type="checkbox" checked={settings[key]} onChange={event => chooseSetting(key, event.target.checked)} /><span><strong>{copy[labels[key]]}</strong><small>{copy[help[key]]}</small></span></label>;
    })}<label className="setting"><input type="checkbox" checked={darkChoice ?? deviceDark} onChange={event => chooseDark(event.target.checked)} /><span><strong>{copy['view.dark.label']}</strong><small>{copy['view.dark.help']}</small></span></label>
      <Link href="/how-it-works">{copy['launch.learn']}</Link></div></Dialog> : null}
  </Announcements></AudioProvider>;
}
