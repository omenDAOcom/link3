import { useCallback, useEffect, useState } from "react";
import { useNear } from "../../context/near";
import ModalEditHub from "../modal/modal_edit_hub";
// Components
import Link3 from "./link3";

interface Props {
  accountId: string;
}

const Hub = (props: Props) => {
  const { accountId } = props;
  const { hub, getHub } = useNear();

  const [isModalEditOpen, setIsModalEditOpen] = useState<boolean>(false);

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
            <button
              onClick={() => setIsModalEditOpen(true)}
              className="clickable hover:text-primary"
            >
              Edit
            </button>
          </div>
          <img
            src={
              hub.image_uri
                ? `https://ipfs.io/ipfs/${hub.image_uri}`
                : "https://picsum.photos/200"
            }
            alt={hub.title}
            className="object-cover object-center rounded-full w-40 aspect-square "
          />
          <div className="space-y-2 flex flex-col justify-center items-center">
            <div className="text-xl font-bold tracking-wider">{hub.title}</div>
            <div className="tracking-wider leading-6">{hub.description}</div>
          </div>
          <Link3 links={hub.links} />
        </div>
        {isModalEditOpen && (
          <ModalEditHub
            isOpen={isModalEditOpen}
            hub={hub}
            onClose={() => setIsModalEditOpen(false)}
          />
        )}
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
