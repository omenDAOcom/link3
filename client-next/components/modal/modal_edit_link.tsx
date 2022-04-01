import { useState } from "react";
import Modal from "./modal";
import { Link } from "../../near/types";
import LinkForm from "../dashboard/link_form";

interface Props {
  link: Link;
  isOpen: boolean;
  onClose: () => void;
}

const ModalEditLink = ({ link, isOpen, onClose }: Props) => {
  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <h2 className="text-primary text-3xl font-bold tracking-wider">
          Edit <span className="italic"> {link.title}</span>
        </h2>
        <LinkForm link={link} />
      </Modal>
    </>
  );
};

export default ModalEditLink;
