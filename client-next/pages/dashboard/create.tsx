import Head from "next/head";
import Router from "next/router";
import { useMemo } from "react";
import HubForm from "../../components/dashboard/hub_form";
import Layout from "../../components/layout";
import LayoutDashboard from "../../components/layout_dashboard";
import { useNear } from "../../context/near";

const CreateLink3 = () => {

  const { getHub, hub, accountId, isLoggedIn } = useNear();
  if (hub && hub.owner_account_id === accountId) {
    Router.push('/dashboard')
  }
  useMemo(async () => {
    await getHub(accountId);
    return hub
  }, [accountId, isLoggedIn])

  return (
    <LayoutDashboard>
      <Head>
        <title>Link3</title>
        <meta name="description" content="A linktree alternative built on NEAR" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className=" flex flex-col justify-center items-center space-y-10 h-screen">
        <HubForm />
      </main>

      <footer className="">

      </footer>
    </LayoutDashboard>
  )
};

export default CreateLink3;