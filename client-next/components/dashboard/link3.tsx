import { useState } from "react";
import { Link } from "../../near/types";
import { useNear } from "../../context/near";
import { ReactSortable } from "react-sortablejs";
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

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isPending, setIsPending] = useState<boolean>(false);

  const [tempLinks, setTempLinks] = useState(
    links.sort((a, b) => a.order - b.order)
  );
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

  // const reorder = async () => {
  //   const olha = {};
  //   const cenas: Object = tempLinks.reduce((acc, link, index): Object => {
  //     olha[link.id] = index;
  //     return olha;
  //   });
  //   console.log("newOrder", cenas);
  //   const result = await reorderLinks({ new_orders: cenas });
  //   console.log("links", links);
  //   console.log("tempLinks", tempLinks);
  // };

  const reorder = async () => {
    setIsPending(true);
    const new_orders: { [key: string]: number } = {};
    tempLinks.forEach((link, index) => {
      new_orders[link.id] = index;
    });
    console.log("new_orders", new_orders);
    const result = await reorderLinks({ new_orders: new_orders });
    addToast("Links new order saved", { appearance: "success" });
    setIsPending(false);
    // console.log("links", links);
    // console.log("tempLinks", tempLinks);
  };

  return (
    <>
      <button
        className={`text-xs font-medium tracking-wide hover:text-primary clickable items-start w-full text-left
        ${isPending ? "text-primary animate-pulse" : ""}
        `}
        onClick={reorder}
      >
        save order
      </button>
      <div
        className={`space-y-4 w-full ${
          isPending
            ? "opacity-10 pointer-events-none cursor-not-allowed"
            : "opacity-100 pointer-events-auto"
        }`}
      >
        <ReactSortable
          list={tempLinks}
          setList={(newState) => setTempLinks(newState)}
          animation={200}
          delay={2}
          className="space-y-4"
          filter=".ignore-elements"
        >
          {tempLinks.map((link: Link) => (
            <Link3Item
              key={link.id}
              link={link}
              onEdit={openModal}
              onDelete={confirmDelete}
            />
          ))}
        </ReactSortable>
      </div>
      {isOpen && link && (
        <ModalEditLink isOpen={isOpen} onClose={closeModal} link={link} />
      )}
    </>
  );
};

export default Link3;
