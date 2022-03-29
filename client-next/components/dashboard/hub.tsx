import {  Hub } from "../../near/types";
import { useMemo, useState } from "react";
import { useNear } from "../../context/near";
import Image from 'next/image'
// Components
import LinkTree from "./link_tree";
import Link from "next/link";
interface Props {
  accountId: string;
}

const Hub = (props: Props) => {
  const { accountId } = props;
  const { hub, getHub, isLoggedIn } = useNear()

  useMemo(async () => {
      await getHub(accountId);
      return hub
  }, [accountId, isLoggedIn])

  if (hub) {
    return (
      <>
        <div className="p-6 border border-accent rounded space-y-4 flex flex-col max-w-2xl w-full  items-center justify-center relative">
          <div className="absolute top-2 right-2">
            <Link
              href={`/miguelmendes.testnet`}
              // href={`/${accountId}`}
            >
              <a >
                View as other user
              </a>
            </Link>
          </div>
          <div
            className="relative w-40 aspect-square object-cover object-center rounded-full" >
            <Image
              src={hub.image_uri ? `https://ipfs.io/ipfs/${hub.image_uri}` : "https://picsum.photos/200"}
              alt={hub.title}
              className='object-cover object-center rounded-full'
              placeholder="blur"
              blurDataURL={rgbDataURL(255, 40, 6)}
              layout='fill'
            />
          </div>

          <div className="text-xl font-bold tracking-wider">
            {hub.title}
          </div>
          <LinkTree links={hub.links} />
        </div>
      </>
    )
  }
  return (
    <>
      <div>Sooning</div>
    </>
  )
}
export default Hub;

const keyStr =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='

const triplet = (e1: number, e2: number, e3: number) =>
  keyStr.charAt(e1 >> 2) +
  keyStr.charAt(((e1 & 3) << 4) | (e2 >> 4)) +
  keyStr.charAt(((e2 & 15) << 2) | (e3 >> 6)) +
  keyStr.charAt(e3 & 63)

const rgbDataURL = (r: number, g: number, b: number) =>
  `data:image/gif;base64,R0lGODlhAQABAPAA${triplet(0, r, g) + triplet(b, 255, 255)
  }/yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==`

