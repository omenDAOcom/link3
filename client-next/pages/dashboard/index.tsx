import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import ButtonLogin from '../../components/buttons'
import Layout from '../../components/layout'
import Hub from '../../components/dashboard/hub'
import LinkForm from '../../components/dashboard/link_form'
import { useNear } from '../../context/near'
import LayoutDashboard from '../../components/layout_dashboard'

const Dashboard: NextPage = () => {
  const { accountId } = useNear();
  return (
    <LayoutDashboard>
      <Head>
        <title>Link3</title>
        <meta name="description" content="A linktree alternative built on NEAR" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className=" flex justify-evenly space-x-10">
        {accountId &&
          (<Hub accountId={accountId} />)
        }
        <LinkForm />
      </main>

      <footer className="">

      </footer>
    </LayoutDashboard>
  )
}

export default Dashboard
