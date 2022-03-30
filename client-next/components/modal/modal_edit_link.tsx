import { useState } from 'react';
import Modal from './modal';
import { Link } from '../../near/types';
import LinkForm from '../dashboard/link_form';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  link: Link;
}

const ModalEditLink = ({
  isOpen,
  onClose,
  link,
}: Props) => {
  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
      >
        <h2 className='text-primary text-3xl font-bold tracking-wider'>Edit <span className='italic'> {link.title}</span></h2>
        <LinkForm cta='Edit' link={link} onSubmitResolve={onClose} />
      </Modal>
    </>
  );
};

export default ModalEditLink;