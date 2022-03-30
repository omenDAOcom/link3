import { useEffect, useState } from "react";
import { Link } from "../../near/types";
import ModalEditLink from "../modal/modal_edit_link";
import LinkTreeItem from "./link3_item";


interface Props {
  links: Array<Link>;
}

const LinkTree = ({ links }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [link, setLink] = useState<Link | null>(null);

  const openModalEdit = (link: Link) => {
    setIsOpen(true);
    setLink(link);
  };
  const closeModal = () => {
    setIsOpen(false);
    setLink(null);
  };

  return (
    <>
      <div className="space-y-4 w-full">
        {links.map((link: Link) => <LinkTreeItem key={link.id} link={link} onEdit={openModalEdit} />)}
      </div>
      {
        isOpen &&
        <ModalEditLink isOpen={isOpen} onClose={closeModal} link={link} />
      }
    </>
  )
}

export default LinkTree;