// @ts-ignore
import LedgerWalletFactory from "ledger-wallet-provider";
// @ts-ignore
import TrezorWalletFactory from "trezor-wallet-provider";
// @ts-ignore
import Web3 from "web3"; // tslint:disable-line
// @ts-ignore
import ProviderEngine from "web3-provider-engine"; // tslint:disable-line
// @ts-ignore
import RpcSubprovider from "web3-provider-engine/subproviders/rpc"; // tslint:disable-line

export async function getLedgerWeb3(): Web3.provider {
  const networkId = 4; // for rinkeby testnet
  const ledgerWalletFactory = await LedgerWalletFactory(
    () => networkId,
    `44'/60'/0'/0`
  );

  if (!ledgerWalletFactory.isSupported) {
    throw new Error("Ledger not supported");
  }

  return getHardwareWeb3(ledgerWalletFactory);
}

export async function getTrezorWeb3(): Web3.provider {
  const trezorWallet = await TrezorWalletFactory();

  return getHardwareWeb3(trezorWallet);
}

async function getHardwareWeb3(providerFactory: any): Web3.provider {
  const engine = new ProviderEngine();
  const web3 = new Web3(engine);

  engine.addProvider(providerFactory);

  engine.addProvider(
    new RpcSubprovider({
      rpcUrl: "https://mainnet.infura.io"
    })
  );

  engine.start();

  return web3;
}

export function getBrowserWeb3(): Web3.web3 {
  const { web3: globalWeb3 } = window as any;

  if (typeof globalWeb3 === "undefined") {
    return;
  }

  const web3 = new Web3(globalWeb3.currentProvider);

  return web3;
}

export enum ProviderType {
  METAMASK = "Metamask",
  TRUST = "Trust",
  TOSHI = "Toshi",
  CIPHER = "Cipher",
  MIST = "Mist",
  PARITY = "Parity",
  INFURA = "Infura",
  TREZOR = "Trezor",
  LEDGER = "Ledger"
}

export function getBrowserProviderType(): ProviderType | undefined {
  // Swiped from here: https://ethereum.stackexchange.com/questions/24266/elegant-way-to-detect-current-provider-int-web3-js

  const globalWindow = window as any;
  const globalWeb3 = globalWindow.web3;

  if (typeof globalWeb3 === "undefined") {
    return;
  }

  if (globalWeb3.currentProvider.isMetaMask) {
    return ProviderType.METAMASK;
  }

  if (globalWeb3.currentProvider.isTrust) {
    return ProviderType.TRUST;
  }

  if (typeof globalWindow.SOFA !== "undefined") {
    return ProviderType.TOSHI;
  }

  if (typeof globalWindow.__CIPHER__ !== "undefined") {
    return ProviderType.CIPHER;
  }

  if (globalWeb3.currentProvider.constructor.name === "EthereumProvider") {
    return ProviderType.MIST;
  }

  if (globalWeb3.currentProvider.constructor.name === "Web3FrameProvider") {
    return ProviderType.PARITY;
  }

  if (
    globalWeb3.currentProvider.host &&
    globalWeb3.currentProvider.host.indexOf("infura") !== -1
  ) {
    return ProviderType.INFURA;
  }

  return;
}
