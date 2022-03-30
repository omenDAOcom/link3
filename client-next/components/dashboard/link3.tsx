import { useEffect, useState } from "react";
import { Link } from "../../near/types";
import ModalEditLink from "../modal/modal_edit_link";
import Link3Item from "./link3_item";
interface Props {
  links: Array<Link>;
}

const Link3 = ({ links }: Props) => {
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

  return (
    <>
      <div className="space-y-4 w-full">
        {links.map((link: Link) => <Link3Item key={link.id} link={link} onEdit={openModal} />)}
      </div>
      {
        isOpen &&
        <ModalEditLink isOpen={isOpen} onClose={closeModal} link={link} />
      }
    </>
  )
}

export default Link3;