import { SetStateAction, useEffect, useState } from "react";
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

  const [localLinks, setLocalLinks] = useState<Link[]>(
    links.sort((a, b) => a.order - b.order)
  );
  const [selectedLink, setSelectedLink] = useState<Link | null>(null);

  const updateLocalLinks = useEffect(() => {
    setLocalLinks(links.sort((a, b) => a.order - b.order));
  }, [links]);

  const openModal = (link: Link) => {
    setIsOpen(true);
    setSelectedLink(link);
  };

  const closeModal = () => {
    setIsOpen(false);
    setSelectedLink(null);
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

  const reorder = async () => {
    try {
      setIsPending(true);
      const cenas: Map<number, number> = new Map();
      localLinks.forEach((link, index) => {
        cenas.set(parseInt(link.id), index);
      });

      const orderMap: { [key: string]: number } = {};

      localLinks.forEach((link, index) => {
        orderMap[link.id] = index;
      });

      const vec = localLinks.map((link) => link.id);
      console.log("vec", vec);
      await reorderLinks({ id_lists: vec });
      addToast("Links new order saved", { appearance: "success" });

      setIsPending(false);
    } catch (error) {
      addToast("Error saving new order", { appearance: "error" });
      // reset local links to original order
      updateLocalLinks;
      setIsPending(false);
    }
  };

  return (
    <>
      <div className="w-full text-left self-start">
        <button
          className={`text-xs font-medium tracking-wide hover:text-primary clickable
        ${isPending ? "text-primary animate-pulse" : ""}
        `}
          onClick={reorder}
        >
          save order
        </button>
      </div>
      <div
        className={`space-y-4 w-full ${
          isPending
            ? "opacity-10 pointer-events-none cursor-not-allowed"
            : "opacity-100 pointer-events-auto"
        }`}
      >
        <ReactSortable
          list={localLinks}
          setList={(newSelection) => setLocalLinks(newSelection)}
          animation={200}
          delay={2}
          className="space-y-4"
          // class to be ignored by the dragger
          filter=".not-trigger-drag"
        >
          {localLinks.map((link: Link) => (
            <Link3Item
              key={link.id}
              link={link}
              onEdit={openModal}
              onDelete={confirmDelete}
            />
          ))}
        </ReactSortable>
      </div>
      {isOpen && selectedLink && (
        <ModalEditLink
          isOpen={isOpen}
          onClose={closeModal}
          link={selectedLink}
        />
      )}
    </>
  );
};

export default Link3;
