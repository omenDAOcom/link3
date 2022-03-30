import { ReactNode, useEffect, useState } from "react";
import IconClose from "../icons/icon_close";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  contentClass?: string;
}

const DURATION = 300;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const Modal = ({ isOpen, onClose, children, contentClass }: ModalProps) => {
  const [isShown, setIsShown] = useState(false);

  const onRequestClose = () => {
    setIsShown(false);
    sleep(DURATION).then(() => {
      onClose();
    });
  };

  useEffect(() => {
    if (isOpen) {
      sleep(50).then(() => setIsShown(true));
    }
  }, [isOpen]);

  return (
    <>
      {isOpen && (
        <div
          className={`
        ${isShown ? "opacity-100" : "opacity-0"}
        transition duration-[${DURATION}ms] ease-linear
        absolute inset-0`}
        >
          <div className="fixed inset-0 z-10 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/80 z-20 cursor-pointer"
              onClick={onRequestClose}
            />
            <div className="relative z-30 ">
              <IconClose
                className="absolute top-4 right-4 w-8 text-paragraph hover:text-primary clickable "
                onClick={onRequestClose}
              />
              <div
                className={`${contentClass} bg-surface p-10 min-w-[50vw] flex flex-col items-center justify-center rounded space-y-10 `}
              >
                {children}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Modal;
