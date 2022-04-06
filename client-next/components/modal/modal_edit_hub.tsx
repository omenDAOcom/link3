import Modal from "./modal";
import { HubDto } from "../../near/types";
import HubForm from "../dashboard/hub_form";

interface Props {
  hub: HubDto;
  isOpen: boolean;
  onClose: () => void;
}

const ModalEditHub = ({ hub, isOpen, onClose }: Props) => {
  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <h2 className="text-primary text-3xl font-bold tracking-wider">
          Edit <span className="italic"> {hub.title}</span>
        </h2>
        <HubForm cta="Edit" hub={hub} onSubmitResolve={onClose} />
      </Modal>
    </>
  );
};

export default ModalEditHub;
