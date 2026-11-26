import { expect, test } from "vitest";
import { createLocalAccount } from "@critter-crumbs/core";
import { hexToString, verifyMessage, verifyTypedData } from "viem";
import {
  createWalletConnectAccountProvider,
  type WalletConnectConnection,
} from "../src/app/walletconnect.js";

const scatter = {
  domain: { name: "Fixture", chainId: 84532 },
  types: { Scatter: [{ name: "ciphertext", type: "bytes" }] },
  primaryType: "Scatter",
  message: { ciphertext: "0x1234" },
} as const;

test("a WalletConnect choice signs in and signs a scatter with the same account", async () => {
  const signer = createLocalAccount(`0x${"1".padStart(64, "0")}`);
  let session = false;
  const provider = createWalletConnectAccountProvider(
    async () => ({
      async pair() {
        session = true;
      },
      transport: {
        request: (async ({ method, params }: { method: string; params: string[] }) => {
          if (!session) throw new Error("Session closed");
          if (method === "eth_requestAccounts") return [signer.address];
          if (method === "eth_chainId") return "0x14a34";
          if (method === "personal_sign")
            return signer.signMessage(hexToString(params[0]! as `0x${string}`));
          if (method === "eth_signTypedData_v4")
            return signer.signTypedData(JSON.parse(params[1]!));
          throw new Error(method);
        }) as WalletConnectConnection["transport"]["request"],
      },
      async disconnect() {
        session = false;
      },
    }),
    84532
  );
  const choices = await provider.discover();
  expect(session).toBe(false);
  const account = await provider.connect(choices[0]!);
  const signature = await account.signMessage("Connect as this critter");
  expect(
    await verifyMessage({ address: signer.address, message: "Connect as this critter", signature })
  ).toBe(true);
  const scatterSignature = await account.signTypedData(scatter);
  expect(
    await verifyTypedData({ ...scatter, address: signer.address, signature: scatterSignature })
  ).toBe(true);

  const nextAccount = await provider.connect(choices[0]!);
  await account.disconnect();
  await expect(nextAccount.signMessage("Still connected")).resolves.toBeDefined();
  await nextAccount.disconnect();
  expect(session).toBe(false);
  await expect(nextAccount.signMessage("Disconnected")).rejects.toThrow("Disconnected account");
});
