import Head from "next/head";
import Router from "next/router";
import { useEffect } from "react";
import { useNear } from "../context/near";
import { NearLogo } from "./icons/near";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const siteTitle = "Link3";
  const { isReady, accountId } = useNear();

  useEffect(() => {
    if (isReady && !accountId) {
      Router.push("/");
    }
  }, [isReady, accountId]);

  return (
    <div className="">
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta
          name="description"
          content="A linktree alternative built on NEAR"
        />
        <meta
          property="og:image"
          content={`https://og-image.vercel.app/${encodeURI(
            siteTitle
          )}.png?theme=light&md=0&fontSize=75px&images=https%3A%2F%2Fassets.zeit.co%2Fimage%2Fupload%2Ffront%2Fassets%2Fdesign%2Fnextjs-black-logo.svg`}
        />
        <meta name="og:title" content={siteTitle} />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      {!isReady && (
        <div className="flex flex-grow justify-center items-center ">
          <NearLogo className="w-32 h-32 animate-spin antialiased" />
        </div>
      )}
      {isReady && <main>{children}</main>}
    </div>
  );
};

export default Layout;
