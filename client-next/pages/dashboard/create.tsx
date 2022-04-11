import Head from "next/head";
import { useCallback, useEffect } from "react";
import Router from "next/router";
import { useNear } from "../../context/near";
import HubForm from "../../components/dashboard/hub_form";
import LayoutDashboard from "../../components/layout_dashboard";
import { NextPage } from "next/types";

const CreateLink3: NextPage = () => {
  const { getHub, hub, accountId } = useNear();
  if (hub && hub.owner_account_id === accountId) {
    Router.push("/dashboard");
  }
  const fetchGetHub = useCallback(async () => {
    if (accountId) {
      await getHub(accountId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId]);

  useEffect(() => {
    fetchGetHub();
  }, [fetchGetHub]);

  return (
    <LayoutDashboard>
      <Head>
        <title>Link3</title>
        <meta
          name="description"
          content="A linktree alternative built on NEAR"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className=" flex flex-col justify-center items-center space-y-10 h-screen">
        <HubForm cta="create" />
      </main>

      <footer className=""></footer>
    </LayoutDashboard>
  );
};

export default CreateLink3;
