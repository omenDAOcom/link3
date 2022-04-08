import { useState } from "react";
import { Link } from "../../near/types";
import { NearLogo } from "../icons/near";

interface Props {
  link: Link;
  onEdit: (link: Link) => void;
  onDelete: (link: Link) => void;
  className?: string;
}

const Link3Item = ({ link, onEdit, onDelete, className }: Props) => {
  const { title, image_uri, uri, description } = link;

  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const handleEdit = () => {
    onEdit(link);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    // await has effect!
    await onDelete(link);
    setIsDeleting(false);
    console.log("Deleted link", link);
  };

  return (
    <>
      <div className="flex space-x-4 items-center">
        <p className="cursor-move">...</p>
        <div
          className={`${className} ignore-elements w-full relative p-4 rounded border border-accent w-full overflow-hidden`}
        >
          {isDeleting && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/70 z-10">
              <NearLogo
                className={`w-8 text-on-primary ${
                  isDeleting ? "animate-spin" : ""
                }`}
              />
            </div>
          )}
          <div className="absolute inset-y-0 right-2 flex flex-col justify-evenly">
            <div
              onClick={handleEdit}
              className="clickable text-xs font-medium tracking-wide hover:text-primary"
            >
              edit
            </div>
            <div
              onClick={handleDelete}
              className={`
          ${isDeleting ? "opacity-50" : "opacity-100"}
          clickable text-xs font-medium tracking-wide hover:text-primary`}
            >
              delete
            </div>
          </div>
          <a href={uri} target="_blank" rel="noreferrer">
            <div className="flex gap-x-4 items-center">
              <div className="relative w-10 aspect-square rounded-full overflow-hidden">
                <img
                  src={
                    image_uri
                      ? `https://ipfs.io/ipfs/${image_uri}`
                      : "https://picsum.photos/200"
                  }
                  alt={title}
                  className="object-cover object-center rounded-full min-w-full min-h-full"
                />
              </div>
              <div>
                <div>{title}</div>
                <div>{description}</div>
              </div>
            </div>
          </a>
        </div>
      </div>
    </>
  );
};

export default Link3Item;
