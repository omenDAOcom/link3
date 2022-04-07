import { useState } from "react";
import { Link } from "../../near/types";
import { useNear } from "../../context/near";
import { useToasts } from "react-toast-notifications";
// Components
import Link3Item from "./link3_item";
import ModalEditLink from "../modal/modal_edit_link";

interface Props {
  links: Array<Link>;
}

const Link3 = ({ links }: Props) => {
  const { deleteLink, reorderLinks } = useNear();
  const { addToast } = useToasts();

  const [isOpen, setIsOpen] = useState(false);

  const [link, setLink] = useState<Link | null>(null);

  const openModal = (link: Link) => {
    setIsOpen(true);
    setLink(link);
  };

  const closeModal = () => {
    setIsOpen(false);
    setLink(null);
  };

  const confirmDelete = async (link: Link) => {
    const { title, id } = link;

    if (typeof id !== "undefined") {
      const confirmed = window.confirm(
        `Are you sure you want to delete ${title}?`
      );

      if (confirmed) {
        await deleteLink(id);
        addToast("Link deleted", { appearance: "success" });
      }
    }
  };

  // const reorder = async (dragIndex: number, hoverIndex: number) => {
  //   const dragLink = links[dragIndex];
  //   const newLinks = [...links];
  //   newLinks.splice(dragIndex, 1);
  //   newLinks.splice(hoverIndex, 0, dragLink);
  //   await Promise.all(
  //     newLinks.map(async (link, index) => {
  //       await updateLink(link, index);
  //     })
  //   );
  // };

  const reorder = async () => {
    const newOrder = {
      1: 1,
      2: 0,
    };
    const result = await reorderLinks({ new_orders: newOrder });
    console.log("result", result);
  };

  console.log("links", links);

  return (
    <>
      <button
        className="font-semibold hover:text-primary clickable"
        onClick={reorder}
      >
        TEST REORDER
      </button>
      <div className="space-y-4 w-full">
        {links.map((link: Link) => (
          <Link3Item
            key={link.id}
            link={link}
            onEdit={openModal}
            onDelete={confirmDelete}
          />
        ))}
      </div>
      {isOpen && link && (
        <ModalEditLink isOpen={isOpen} onClose={closeModal} link={link} />
      )}
    </>
  );
};

export default Link3;
