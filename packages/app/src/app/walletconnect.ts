import {
  connectEip1193Account,
  type AccountProvider,
  type BaseChainId,
} from "@critter-crumbs/core";
import { copy } from "@critter-crumbs/shared";
import { walletConnectOptionId } from "./connect-option.js";

export interface WalletConnectConnection {
  transport: Parameters<typeof connectEip1193Account>[0];
  pair(): Promise<void>;
  disconnect(): Promise<void>;
}

export function createWalletConnectAccountProvider(
  load: () => Promise<WalletConnectConnection>,
  chainId: BaseChainId
): AccountProvider {
  const option = { id: walletConnectOptionId, name: copy["connect.walletConnect"] };
  let connection: Promise<WalletConnectConnection> | undefined;
  let accounts = 0;
  return {
    async discover() {
      return [option];
    },
    async connect(choice) {
      if (choice.id !== option.id) throw new Error("Unknown account provider");
      connection ??= load().catch((error) => {
        connection = undefined;
        throw error;
      });
      const remote = await connection;
      const disconnect = async () => {
        if (accounts === 0) await remote.disconnect().catch(() => {});
      };
      try {
        await remote.pair();
        const account = await connectEip1193Account(
          remote.transport,
          chainId,
          "walletconnect",
          async () => {
            accounts--;
            await disconnect();
          }
        );
        accounts++;
        return account;
      } catch (error) {
        await disconnect();
        throw error;
      }
    },
  };
}
