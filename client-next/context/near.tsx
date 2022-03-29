import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import nearConfig from "../near/config";
import Big from "big.js";
import { Hub, HubDto, Link } from "../near/types";

type nearContextType = {
  isReady: boolean;
  isPending: boolean;
  accountId: string | null;
  isLoggedIn: boolean;
  hub: Hub | null;
  show: () => void;
  logout: () => void;
  getHub: (account_id: string) => Promise<any>;
  addLink: (props: Link) => Promise<any>;
  createHub: (props: HubDto) => Promise<any>;
  updateLink: (props: Link) => Promise<any>;
};

const nearContextDefaultValues: nearContextType = {
  isReady: false,
  isPending: false,
  accountId: null,
  isLoggedIn: false,
  hub: null,
  show: () => { },
  logout: () => { },
  getHub: () => Promise.resolve(),
  addLink: () => Promise.resolve(),
  createHub: () => Promise.resolve(),
  updateLink: () => Promise.resolve(),
};

const NearContext = createContext<nearContextType>(nearContextDefaultValues);

export function useNear() {
  return useContext(NearContext);
}

type Props = {
  children: ReactNode;
};

export function NearProvider({ children }: Props) {

  const [selector, setSelector] = useState<any>(null);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [isPending, setIsPending] = useState<boolean>(false);
  const [hub, setHub] = useState<Hub | null>(null);

  const initWallet = async () => {
    const walletSelector = await import("near-wallet-selector")
    const NearWalletSelector = walletSelector.default
    const selector = new NearWalletSelector(nearConfig());
    await selector.init();
    setSelector(selector);
  };

  useEffect(() => {
    initWallet();
  }, []);


  const handleSignIn = async () => {
    if (selector) {
      const account = await selector.getAccount();
      console.log("account", account);
      setIsLoggedIn(await selector.isSignedIn());
      setAccountId(account ? account.accountId : null);
      setIsReady(true);
    }
  }

  useEffect(() => {
    handleSignIn();
  }, [selector]);

  useEffect(() => {
    if (selector) {
      selector.on("signIn", handleSignIn);
      return () => selector.off("signIn", handleSignIn);
    }
  }, [selector]);


  const logout = async () => {
    await selector.signOut();
    setIsLoggedIn(await selector.isSignedIn());
    setAccountId(null);
  };
  const show = () => {
    selector.show();
  };

  async function getHub(account_id: string): Promise<Hub | null> {
    try {
      if (!selector || !account_id) {
        return null;
      }
      const result = await selector.contract.view({
        methodName: "get",
        args: { account_id }
      });
      setHub(result)
      return result
    } catch (error) {
      console.log("error", error);
      throw error;
    }
  }

  const BOATLOAD_OF_GAS = Big(3).times(10 ** 13).toFixed();
  async function addLink(props: Link) {
    try {
      console.log("CONTRACT CALL addLink", props);
      const result = await selector.contract.signAndSendTransaction({
        actions: [{
          type: "FunctionCall",
          params: {
            methodName: "add_link",
            args: { ...props },
            gas: BOATLOAD_OF_GAS,
          }
        }]
      });
      console.log("result", result);
      getHub(result.transaction.signer_id as string);
      return result;
    } catch (error) {
      throw error;
    }
  }
  async function updateLink(props: Link) {
    try {
      console.log("CONTRACT CALL updateLink", props);
      const result = await selector.contract.signAndSendTransaction({
        actions: [{
          type: "FunctionCall",
          params: {
            methodName: "update_link",
            args: { ...props },
            gas: BOATLOAD_OF_GAS,
          }
        }]
      });
      console.log("result", result);
      getHub(result.transaction.signer_id as string);
      return result;
    } catch (error) {
      throw error;
    }
  }
  async function createHub(props: HubDto) {
    try {
      console.log("CONTRACT CALL hub", props);
      const result = await selector.contract.signAndSendTransaction({
        actions: [{
          type: "FunctionCall",
          params: {
            methodName: "create",
            args: { ...props },
            gas: BOATLOAD_OF_GAS,
          }
        }]
      });
      console.log("result", result);
      return result;
    } catch (error) {
      console.log("error", error);
      throw error;
    }
  }


  const value = {
    hub,
    isReady,
    accountId,
    isLoggedIn,
    isPending,
    show,
    logout,
    getHub,
    addLink,
    createHub,
    updateLink,
  };

  return (
    <>
      <NearContext.Provider value={value}>
        {children}
      </NearContext.Provider>
    </>
  );
}


export default NearProvider;