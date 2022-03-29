
const contractId = process.env.NEXT_PUBLIC_CONTRACT_ID || 'contractId';
const theme = "dark" as Theme;
const walletTypes = ["near-wallet", "sender-wallet", "ledger-wallet"] as BuiltInWalletId[];


type BuiltInWalletId = "near-wallet" | "sender-wallet" | "ledger-wallet";
type NetworkId = "mainnet" | "betanet" | "testnet";
type Theme = "dark" | "light" | "auto";

interface Configs {
  // List of wallets you want to support in your dApp.
  wallets: Array<BuiltInWalletId>;
  // Network ID matching that of your dApp.
  networkId: NetworkId;
  contract: {
    // Account ID of the Smart Contract used for 'view' and 'signAndSendTransaction' calls.
    contractId: string;
    // Optional: Specify limited access to particular methods on the Smart Contract.
    methodNames?: Array<string>;
  };
  ui?: {
    // Optional: Specify light/dark theme for UI. Defaults to the browser configuration when
    // omitted or set to 'auto'.
    theme?: Theme;
    // Optional: Provides customisation description text in the UI.
    description?: string;
  };
}

const getConfig = <Configs>() => {
  switch (process.env.NODE_ENV as string) {
    case 'prod':
    case 'mainnet':
    case 'production':
      return {
        networkId: 'mainnet' as NetworkId,
        ui: {
          theme,
        },
        wallets: walletTypes,
        contract: { contractId },
      }
    // This is an example app so production is set to testnet.
    case 'dev':
    case 'testnet':
    case 'development':
      return {
        networkId: 'testnet' as NetworkId,
        ui: {
          theme,
        },
        wallets: walletTypes,
        contract: { contractId },
      }
    case 'betanet':
      return {
        networkId: 'betanet' as NetworkId,
        ui: {
          theme,
        },
        wallets: walletTypes,
        contract: { contractId },
      }
    case 'local':
      return {
        networkId: 'local' as NetworkId,
        ui: {
          theme,
        },
        wallets: walletTypes,
        contract: { contractId },
      }
    case 'test':
    case 'ci':
      return {
        networkId: 'shared-test' as NetworkId,
        ui: {
          theme,
        },
        wallets: walletTypes,
        contract: { contractId },
      }
    case 'ci-betanet':
      return {
        networkId: 'shared-test-staging' as NetworkId,
        ui: {
          theme,
        },
        wallets: walletTypes,
        contract: { contractId },
      }
    default:
      throw Error(`Unconfigured environment. Can be configured in src/config.js.`);
  }

}

export default getConfig;