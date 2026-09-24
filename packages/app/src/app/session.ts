import { ApiClientError, type Account, type AccountOption, type AccountProvider, type SignInChallenge, type createApiClient } from '@critter-crumbs/core';
import type { CopyId, Profile } from '@critter-crumbs/shared';
export interface Me extends Profile { burrows: { id: string; name: string }[]; warning?: CopyId }
export interface SessionState { me: Me | null; account: Account | null; busy: boolean; ready: boolean }
export type AppApi = ReturnType<typeof createApiClient>;

/** Session writes are ordered; a slow connection cannot overwrite a later disconnect. */
export function createSession(api: AppApi) {
  let state: SessionState = { me: null, account: null, busy: false, ready: false };
  const listeners = new Set<() => void>();
  let pending = Promise.resolve();
  const publish = (patch: Partial<SessionState>) => { state = { ...state, ...patch }; for (const listener of listeners) listener(); };
  function run(operation: () => Promise<void>) {
    const result = pending.then(async () => { publish({ busy: true }); try { await operation(); } finally { publish({ busy: false, ready: true }); } });
    pending = result.catch(() => {}); return result;
  }
  async function readMe() { return await api.get('/api/me') as unknown as Me; }
  return {
    snapshot: () => state,
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    restore: () => run(async () => {
      api.invalidate();
      try { publish({ me: await readMe() }); }
      catch (error) { if (error instanceof ApiClientError && error.status === 401) { await state.account?.disconnect(); publish({ me: null, account: null }); } else throw error; }
    }),
    connect: (provider: AccountProvider, option: AccountOption) => run(async () => {
      const account = await provider.connect(option);
      try {
        api.invalidate();
        const challenge = await api.get('/api/session/nonce') as unknown as SignInChallenge;
        const { buildSignInMessage } = await import('../crypto/index.js');
        const signature = await account.signMessage(buildSignInMessage(account.address, challenge));
        await api.write('/api/session', 'POST', { address: account.address, nonce: challenge.nonce, signature });
        const me = await readMe(); await state.account?.disconnect();
        publish({ account, me });
      } catch (error) { await account.disconnect(); throw error; }
    }),
    updateProfile: (update: { displayName?: string; variant?: number; keepCritter?: true }) => run(async () => {
      await api.write('/api/me', 'PUT', update); publish({ me: await readMe() });
    }),
    disconnect: () => run(async () => {
      try { await api.write('/api/session', 'DELETE'); } catch (error) { if (!(error instanceof ApiClientError && error.status === 401)) throw error; } await state.account?.disconnect(); publish({ me: null, account: null });
    }),
  };
}
export type Session = ReturnType<typeof createSession>;
