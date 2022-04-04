import Head from "next/head";
import { NextPage } from "next";
import { useNear } from "../../context/near";
import Hub from "../../components/dashboard/hub";
import LinkForm from "../../components/dashboard/link_form";
import LayoutDashboard from "../../components/layout_dashboard";

const Dashboard: NextPage = () => {
  const { accountId } = useNear();
  
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

      <main className=" flex justify-evenly space-x-10">
        {accountId && <Hub accountId={accountId} isOwner={true} />}
        <LinkForm cta="Create" />
      </main>

      <footer className=""></footer>
    </LayoutDashboard>
  );
};

export default Dashboard;
