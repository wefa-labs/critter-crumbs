import { lazy, Suspense, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { ApiClientError, createApiClient, type AccountOption, type AccountProvider } from '@critter-crumbs/core';
import { copy, formatCopy, type CopyId, ValidationError } from '@critter-crumbs/shared';
import { browserSettings, MUSIC_SETTING, saveSetting, type StoredSetting } from '../sim/settings.js';
import { createSession } from './session.js';
import { createAudio, UNLOCK_EVENTS, type MusicTrack } from '../audio/index.js';
import { AudioProvider } from '../audio/context.js';
import { Announcements } from './announcements.js';
import { ConnectSheet } from './connect.js';
import { Launcher } from './launcher.js';
import { MusicButton } from './music-button.js';
import { appNotices, NoticeProvider } from './notices.js';
import { createPressWatch } from './music-choice.js';
import { screenMusic } from './screen-music.js';
import { readDarkChoice, saveDarkChoice, showDarkChoice } from './theme.js';
const FeastRoute=lazy(()=>import('./feast.js').then(module=>({default:module.FeastRoute})));
const LearnRoute=lazy(()=>import('./learn.js').then(module=>({default:module.Learn})));
/* starting a feast is a creator's occasional page, so its code arrives when it is opened */
const SetupRoute=lazy(()=>import('./setup.js').then(module=>({default:module.SetupRoute})));
/* the screens a connected member sees outside a feast arrive once someone has connected, so the launcher and the
   invite, which most people open first, do not carry them (scripts/build-budget.mjs) */
const HomeRoute=lazy(()=>import('./burrows.js').then(module=>({default:module.Home})));
const CreateBurrowRoute=lazy(()=>import('./burrows.js').then(module=>({default:module.CreateBurrow})));
const BurrowRoute=lazy(()=>import('./burrows.js').then(module=>({default:module.Burrow})));
const Onboarding=lazy(()=>import('./onboarding.js').then(module=>({default:module.Onboarding})));
const YourCritter=lazy(()=>import('./profile.js').then(module=>({default:module.YourCritter})));
import { returnPath } from './learn-return.js';
import { BetaChip } from './screen-header.js';
import { Link, Opening, ProfileButton, navigate } from './ui.js';

type Choice = { provider: AccountProvider; option: AccountOption };
function message(error: unknown, fallback: CopyId = 'err.generic') { return error instanceof ApiClientError || error instanceof ValidationError ? copy[error.copyId].replace(/\{[^}]+\}/g, '…') : copy[fallback]; }
export function App() {
  const [alert, setAlert] = useState(''), [announcement, announce] = useState('');
  /* how many minutes the device's clock is off, once a response has shown it: said once, and kept in view (notices.tsx) */
  const [skew, setSkew] = useState<number | null>(null);
  const [services] = useState(() => {
    const api = createApiClient({ onClockSkew: (_id, milliseconds) => { const minutes = Math.round(milliseconds / 60000); setSkew(minutes); announce(formatCopy('err.clockSkew', { minutes })); } });
    const preferences = browserSettings(window);
    const audio = createAudio(preferences.settings);
    return { api, session: createSession(api), preferences, audio, pressWatch: createPressWatch(audio.running) };
  });
  const { api, session, audio, pressWatch } = services, state = useSyncExternalStore(session.subscribe, session.snapshot);
  const [path, setPath] = useState(location.pathname), [busy, setBusy] = useState(false), running = useRef(false), resumeAfterConnect = useRef(false);
  /* the screen your critter's profile was opened over, which is where its back chevron leads, and what opened it: the
     face that was pressed, to have the focus back; a profile opened by its own address has neither beneath it. A visit
     to the first steps from the profile, which return to it, keeps the way back. */
  const [under, setUnder] = useState(() => returnPath(history.state)), [opener, setOpener] = useState<Element | null>(null);
  const [connecting, setConnecting] = useState(false), [choices, setChoices] = useState<Choice[]>([]), [discovering, setDiscovering] = useState(false), [connectReason, setConnectReason] = useState('');
  /* the choice the connect sheet is waiting on, from its press until the app it names has answered */
  const [waiting, setWaiting] = useState<AccountOption | null>(null);
  const [settings, setSettings] = useState(services.preferences.settings);
  /* dark follows the device until someone chooses (theme.ts) */
  const [darkChoice, setDarkChoice] = useState(() => readDarkChoice(services.preferences.storage)), [deviceDark, setDeviceDark] = useState(() => matchMedia('(prefers-color-scheme: dark)').matches);
  const sounding = useSyncExternalStore(audio.subscribe, audio.running);
  /* whose first meeting comes before the screen they connected on: it stays until Keep or Disconnect, even once the
     fourth re-roll has locked the critter (onboarding.tsx) */
  const [meetingFor, setMeetingFor] = useState<string | null>(null);
  const [online, setOnline] = useState(navigator.onLine);
  const providers = useRef<Promise<AccountProvider[]> | undefined>(undefined);
  const working = busy || state.busy;
  async function run(action: () => Promise<void>) {
    if (running.current) return;
    running.current = true; setBusy(true); setAlert('');
    try { await action(); } catch (error) { if (error instanceof ApiClientError && error.status === 401) { resumeAfterConnect.current = true; setConnectReason(error.copyId === 'err.generic' ? copy['err.sessionExpired'] : message(error)); void connect(); } else { setAlert(message(error)); audio.play('error'); } }
    finally { running.current = false; setBusy(false); }
  }
  useEffect(() => { void session.restore().catch(error => setAlert(message(error))); }, [session]);
  useEffect(() => {
    /* the profile's way back is read on arriving at it, except from the first steps, which return to it */
    const changed = () => { audio.stop(); setPath(location.pathname); if (location.pathname === '/your-critter') setUnder(under => history.state?.from === '/how-it-works' ? under : returnPath(history.state)); setAlert(''); };
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
      try { await session.connect(provider, option); audio.play('connect'); setConnecting(false); setConnectReason(''); if (resumeAfterConnect.current) { resumeAfterConnect.current = false; setAlert(copy['connect.resumed']); } }
      catch (error) { closeConnect(); setAlert(message(error, 'connect.rejected')); }
      finally { setWaiting(null); }
    });
  }
  function chooseSetting(key: StoredSetting, value: boolean) { saveSetting(services.preferences.storage, key, value); setSettings(settings => ({ ...settings, [key]: value })); }
  /* disconnecting leaves the member where a signed-out visitor would be: on the screen beneath your critter's profile,
     or on the page they connected on, which the first meeting comes before: the launcher, or a feast's invite */
  function disconnect(to?: string) { void run(async () => { await session.disconnect(); if (to) navigate(to); }); }
  function chooseDark(value: boolean) { saveDarkChoice(services.preferences.storage, value); showDarkChoice(document.documentElement, value); setDarkChoice(value); }
  /* the screen in view, or the one beneath your critter's profile while that is open */
  const profileOpen = path === '/your-critter', screen = profileOpen ? under : path;
  const setupRoute = /^\/burrows\/([^/]+)\/feasts\/new$/.exec(screen);
  const feastRoute = /^\/feasts\/([^/]+)(?:\/.*)?$/.exec(screen);
  const me = state.me, burrow = /^\/burrows\/([^/]+)$/.exec(screen);
  /* a critter not yet kept, or a member with neither an ENS name nor a display name, meets their critter first */
  if (me && meetingFor !== me.address && (!me.critterLocked || (!me.ensName && !me.displayName))) setMeetingFor(me.address);
  const meetingShown = me !== null && meetingFor === me.address;
  const openProfile = () => { setOpener(document.activeElement); navigate('/your-critter'); };
  /* the Music toggle wherever there is no Settings to open: the launcher, the first steps and a visitor's header */
  const musicButton = <MusicButton on={settings.music} sounding={sounding} soundAtPress={pressWatch.soundAtPress} choose={value => chooseSetting(MUSIC_SETTING, value)} />;
  /* the launcher says its own trouble, in its sheet */
  const launching = state.ready && !feastRoute && screen !== '/how-it-works' && !me;
  /* the notices that stand while their cause lasts, at the head of each screen's sheet (notices.tsx) */
  const notices = useMemo(() => appNotices(skew, me?.warning), [skew, me?.warning]);
  /* each screen's music; a feast's pages name their own, and loading leaves playing whatever was */
  let content, music: MusicTrack | undefined;
  if (!state.ready) content = <Opening bare />;
  else if (feastRoute) content = <Suspense fallback={<Opening bare />}><FeastRoute onProfile={openProfile} clearError={() => setAlert('')} key={feastRoute[1]! + (me?.address ?? '')} id={feastRoute[1]!} api={api} me={me} run={run} busy={working} announce={announce} settings={settings} path={screen} account={() => session.snapshot().account} connect={() => void connect()} sound={musicButton} /></Suspense>;
  else if (screen === '/how-it-works') { music = screenMusic.launcher; content = <Suspense fallback={<Opening bare />}><LearnRoute sound={musicButton} announce={announce} still={settings.still || settings.reducedMotion} /></Suspense>; }
  else if (!me) { music = screenMusic.launcher; content = <Launcher connect={() => void connect()} busy={working} notice={alert || (online ? '' : copy['err.offline'])} sound={musicButton} />; }
  else if (setupRoute) { music = screenMusic.setup; content = <Suspense fallback={<Opening />}><SetupRoute announce={announce} key={screen} burrowId={setupRoute[1]!} api={api} run={run} busy={working} /></Suspense>; }
  else if (screen === '/burrows/new') { music = screenMusic.burrow; content = <Suspense fallback={<Opening />}><CreateBurrowRoute api={api} session={session} run={run} busy={working} /></Suspense>; }
  else if (burrow) { music = screenMusic.burrow; content = <Suspense fallback={<Opening />}><BurrowRoute key={screen} id={burrow[1]!} api={api} me={me} session={session} run={run} busy={working} /></Suspense>; }
  else { music = screenMusic.home; content = <Suspense fallback={<Opening />}><HomeRoute me={me} api={api} /></Suspense>; }
  useEffect(() => { if (music) audio.music(music); }, [audio, music]);
  /* a screen over the one beneath, which stays as it was, inert, until the screen over it goes */
  const layer = !me ? null
    : meetingShown ? <Suspense fallback={<Opening bare />}><Onboarding key={me.address} me={me} session={session} run={run} busy={working} announce={announce} done={() => setMeetingFor(null)} disconnect={() => disconnect()} /></Suspense>
    : profileOpen ? <Suspense fallback={<Opening bare />}><YourCritter me={me} back={() => navigate(under)} settings={settings} choose={chooseSetting} dark={darkChoice ?? deviceDark} chooseDark={chooseDark}
      disconnect={() => disconnect(under)} run={run} busy={working} /></Suspense>
    : null;
  /* the screen beneath a layer stays as it was only when it was there before: your critter's profile, opened from it.
     The first meeting stands over nothing, and the screen it was opened on arrives once it is done. */
  const layered = layer !== null, beneath = !layered || (profileOpen && !meetingShown && opener !== null);
  useEffect(() => {
    if (layered || !opener) return;
    if (opener instanceof HTMLElement && opener.isConnected) opener.focus();
    setOpener(null);
  }, [layered, opener]);
  /* offline is said at once (Design System §12.6) and shown by the band, so its alert is read but not shown again */
  const alertSeen = !launching && (online || alert !== copy['err.offline']);
  return <AudioProvider value={audio}><Announcements alert={alert} alertSeen={alertSeen} announcement={announcement} clearAnnouncement={announce}><NoticeProvider notices={notices}>
    <a href="#content" className="skip-link" inert={layered}>{copy['skip.content']}</a>
    <header className="app-header" inert={layered}><div className="screen-mark"><Link href="/" className="brand wordmark">{copy['app.name']}</Link><BetaChip /></div><nav className="actions" aria-label={copy['app.navigation']}>
      {me ? <ProfileButton address={me.address} variant={me.variant} onClick={openProfile} />
        : musicButton}
    </nav><div id="feast-header" /></header>
    {!online && !launching ? <p className="offline-band">{copy['err.offline']}</p> : null}
    <main id="content" tabIndex={-1} inert={layered}>{beneath ? content : null}</main>
    {layered ? <div className="screen-layer">{layer}</div> : null}
    {connecting ? <ConnectSheet options={choices.map(choice => choice.option)} discovering={discovering} reason={connectReason} waiting={waiting} busy={working} choose={connectWith} cancel={closeConnect} /> : null}
  </NoticeProvider></Announcements></AudioProvider>;
}
