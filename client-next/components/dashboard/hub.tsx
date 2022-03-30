import { useCallback, useEffect, useMemo, useState } from "react";
import { useNear } from "../../context/near";
// Components
import Link3 from "./link3";
import Link from "next/link";

interface Props {
  accountId: string;
}

const Hub = (props: Props) => {
  const { accountId } = props;
  const { hub, getHub } = useNear();
  const fetchGetHub = useCallback(async () => {
    await getHub(accountId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId]);

  useEffect(() => {
    fetchGetHub();
  }, [fetchGetHub]);

  if (hub) {
    return (
      <>
        <div className="p-6 border border-accent rounded space-y-4 flex flex-col max-w-2xl w-full  items-center justify-center relative">
          <div className="absolute top-2 right-2">
            <Link href={`/${accountId}`}>
              <a>View as other user</a>
            </Link>
          </div>
          <div className="relative w-40 aspect-square object-cover object-center rounded-full">
            <img
              src={
                hub.image_uri
                  ? `https://ipfs.io/ipfs/${hub.image_uri}`
                  : "https://picsum.photos/200"
              }
              alt={hub.title}
              className="object-cover object-center rounded-full"
              placeholder="blur"
            />
          </div>

          <div className="text-xl font-bold tracking-wider">{hub.title}</div>
          <Link3 links={hub.links} />
        </div>
      </>
    );
  }

  return (
    <>
      <div>Loading...</div>
    </>
  );
};

export default Hub;
