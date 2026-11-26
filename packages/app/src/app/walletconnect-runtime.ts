import { EthereumProvider } from "@walletconnect/ethereum-provider";
import encodeQR from "qr";
import { copy } from "@critter-crumbs/shared";
import type { BaseChainId } from "@critter-crumbs/core";
import type { WalletConnectConnection } from "./walletconnect.js";

const signingMethods = ["personal_sign", "eth_signTypedData_v4"];
const deepLinkChoice = "WALLETCONNECT_DEEPLINK_CHOICE";
const sessionPrefixKey = "critter-crumbs:walletconnect-session";
type Provider = Awaited<ReturnType<typeof EthereumProvider.init>>;

export interface ConnectionApp {
  name: string;
  native: string;
}

export interface WalletConnectPairing {
  cancel(): void;
  code?: { uri: string; image: string; apps: PairingLink[] };
}

interface PairingLink {
  name: string;
  href: string;
  remember(): void;
}

function rememberConnectionApp(app: ConnectionApp) {
  try {
    localStorage.setItem(deepLinkChoice, JSON.stringify({ name: app.name, href: app.native }));
  } catch {
    // Storage is optional. The member can switch apps by hand to confirm later signatures.
  }
}

function parseConnectionApps(payload: unknown): ConnectionApp[] {
  if (
    !payload ||
    typeof payload !== "object" ||
    !("data" in payload) ||
    !Array.isArray(payload.data)
  )
    return [];
  return payload.data.flatMap((row: unknown) => {
    if (
      !row ||
      typeof row !== "object" ||
      !("name" in row) ||
      !("mobile_link" in row) ||
      typeof row.name !== "string" ||
      typeof row.mobile_link !== "string"
    )
      return [];
    const scheme = /^([a-z][a-z0-9+.-]*):\/\/[a-z0-9._~%/-]*$/i
      .exec(row.mobile_link)?.[1]
      ?.toLowerCase();
    if (
      !scheme ||
      /^(https?|wss?|javascript|vbscript|data|blob|file|about|chrome|intent|tel|mailto|sms|facetime)$/.test(
        scheme
      )
    )
      return [];
    const native = row.mobile_link.endsWith("/") ? row.mobile_link : `${row.mobile_link}/`;
    return [{ name: row.name, native }];
  });
}

async function mobileApps(projectId: string, chainId: BaseChainId, signal: AbortSignal) {
  if (!matchMedia("(pointer: coarse)").matches && !/Android|iPhone|iPad/i.test(navigator.userAgent))
    return [];
  const url = new URL("https://api.web3modal.org/getWallets");
  url.search = new URLSearchParams({
    projectId,
    st: "appkit",
    sv: "html-core-1.8.19",
    page: "1",
    entries: "24",
    chains: `eip155:8453,eip155:${chainId}`,
  }).toString();
  try {
    const response = await fetch(url, { signal, referrerPolicy: "no-referrer" });
    return response.ok ? parseConnectionApps(await response.json()) : [];
  } catch {
    return [];
  }
}

export function loadWalletConnect(
  projectId: string,
  chainId: BaseChainId,
  showPairing: (pairing: WalletConnectPairing | null) => void
): WalletConnectConnection {
  const origin = window.location.origin;
  const init = (customStoragePrefix: string) =>
    EthereumProvider.init({
      projectId,
      customStoragePrefix,
      metadata: {
        name: copy["app.name"],
        description: copy["app.tagline"],
        url: origin,
        icons: [`${origin}/icons/critter-192.png`],
      },
      showQrModal: false,
      telemetryEnabled: false,
      chains: [chainId],
      methods: signingMethods,
      events: ["accountsChanged", "chainChanged"],
      optionalChains: [chainId],
      optionalMethods: [
        "eth_sendTransaction",
        "wallet_switchEthereumChain",
        "wallet_addEthereumChain",
      ],
    });
  let active: { provider: Provider; prefix: string } | undefined;

  function savedPrefix(prefix?: string) {
    try {
      if (prefix !== undefined) localStorage.setItem(sessionPrefixKey, prefix);
      const stored = localStorage.getItem(sessionPrefixKey);
      return stored && /^[0-9a-f-]{36}$/.test(stored) ? stored : undefined;
    } catch {
      return undefined;
    }
  }

  function usableSession(provider: Provider) {
    const { session } = provider;
    return (
      session &&
      Object.values(session.namespaces).some(
        (namespace) =>
          namespace.accounts.some((account) => account.startsWith(`eip155:${chainId}:`)) &&
          signingMethods.every((method) => namespace.methods.includes(method))
      )
    );
  }
  async function disconnect() {
    const connection = active;
    active = undefined;
    if (!connection) return;
    if (savedPrefix() === connection.prefix) {
      try {
        localStorage.removeItem(sessionPrefixKey);
      } catch {}
    }
    if (connection.provider.session) await connection.provider.disconnect();
  }
  return {
    get transport() {
      if (!active) throw new Error("No active connection");
      return active.provider as unknown as WalletConnectConnection["transport"];
    },
    async pair() {
      if (!active) {
        const prefix = savedPrefix() ?? crypto.randomUUID();
        active = { prefix, provider: await init(prefix) };
      }
      const connection = active;
      const { provider } = connection;
      if (usableSession(provider)) return;
      if (provider.session) await provider.disconnect();
      const controller = new AbortController();
      const cancel = () => controller.abort();
      const signal = controller.signal;
      showPairing({ cancel });
      try {
        localStorage.removeItem(deepLinkChoice);
      } catch {
        // The QR code and mobile links also work with storage disabled.
      }
      let topic: string | undefined, observeProposal!: () => void;
      const proposed = new Promise<void>((resolve) => {
        observeProposal = resolve;
      });
      const onUri = (uri: string) => {
        topic = /^wc:([a-f0-9]{64})@2\?/.exec(uri)?.[1];
        observeProposal();
        if (!topic || signal.aborted) return;
        const code = {
          uri,
          image: encodeQR(uri, "data-url", { scale: 4 }),
          apps: [] as PairingLink[],
        };
        showPairing({ cancel, code });
        void mobileApps(projectId, chainId, signal).then((entries) => {
          const apps = entries.map((app) => ({
            name: app.name,
            href: `${app.native}wc?uri=${encodeURIComponent(uri)}`,
            remember: () => rememberConnectionApp(app),
          }));
          if (!signal.aborted) showPairing({ cancel, code: { ...code, apps } });
        });
      };
      const discardCancelledSession = async () => {
        if (topic && provider.session?.pairingTopic === topic) await provider.disconnect();
      };
      provider.on("display_uri", onUri);
      const pending = provider.connect().finally(observeProposal);
      try {
        const cancelled = new Promise<never>((_resolve, reject) => {
          signal.addEventListener("abort", () => reject(signal.reason), { once: true });
          if (signal.aborted) reject(signal.reason);
        });
        await Promise.race([pending, cancelled]);
        if (!usableSession(provider))
          throw new Error("Connection cannot sign on the selected chain");
        savedPrefix(connection.prefix);
      } finally {
        if (signal.aborted) {
          // The relay may settle an abandoned proposal later. Its provider owns a separate SDK
          // storage namespace so cleanup cannot disconnect a subsequent choice.
          active = undefined;
          if (savedPrefix() === connection.prefix) {
            try {
              localStorage.removeItem(sessionPrefixKey);
            } catch {}
          }
          void proposed.then(async () => {
            provider.removeListener("display_uri", onUri);
            if (!topic) return;
            await provider.signer.client.core.pairing.disconnect({ topic }).catch(() => {});
            await discardCancelledSession().catch(() => {});
          });
          void pending.then(discardCancelledSession, () => {}).catch(() => {});
        } else {
          provider.removeListener("display_uri", onUri);
          cancel();
        }
        showPairing(null);
      }
    },
    disconnect,
  };
}
