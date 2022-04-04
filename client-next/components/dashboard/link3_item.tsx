import { useState } from "react";
import { Link } from "../../near/types";
import { NearLogo } from "../icons/near";

interface Props {
  link: Link;
  onEdit: (link: Link) => void;
  onDelete: (link: Link) => void;
  onChangeState: (id: string, is_published: boolean) => void;
  className?: string;
}

const Link3Item = ({
  link,
  onEdit,
  onDelete,
  onChangeState,
  className,
}: Props) => {
  const { title, image_uri, uri, description, is_published } = link;

  const [isPending, setIsPending] = useState<boolean>(false);

  const handleEdit = () => {
    onEdit(link);
  };

  const handleChangeState = async () => {
    if (link.id) {
      setIsPending(true);
      // await has effect!
      await onChangeState(link.id, !is_published);
      setIsPending(false);
    }
  };

  const handleDelete = async () => {
    setIsPending(true);
    // await has effect!
    await onDelete(link);
    setIsPending(false);
    console.log("Deleted link", link);
  };

  return (
    <div
      className={`${className} w-full relative p-4 rounded border border-accent w-full overflow-hidden`}
    >
      {isPending && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/70 z-10">
          <NearLogo
            className={`w-8 text-on-primary ${isPending ? "animate-spin" : ""}`}
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
          onClick={handleChangeState}
          className="clickable text-xs font-medium tracking-wide hover:text-primary"
        >
          changeState
        </div>
        <div
          onClick={handleDelete}
          className="clickable text-xs font-medium tracking-wide hover:text-primary"
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
            <div>{is_published ? "is published" : "is not published"}</div>
          </div>
        </div>
      </a>
    </div>
  );
};

export default Link3Item;
