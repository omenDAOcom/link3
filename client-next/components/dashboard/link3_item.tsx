import { Link } from "../../near/types";

interface Props {
  link: Link;
  onEdit: (link: Link) => void;
  onDelete: (link: Link) => void;
}

const Link3Item = ({ link, onEdit, onDelete }: Props) => {
  const { title, image_uri, uri, description } = link;

  const handleEdit = () => {
    onEdit(link);
  };

  const handleDelete = async () => {
    onDelete(link);
  };

  return (
    <div className="w-full relative">
      <div className="absolute inset-y-0 right-2 flex flex-col justify-evenly">
        <div
          onClick={handleEdit}
          className="clickable text-xs font-medium tracking-wide hover:text-primary"
        >
          edit
        </div>
        <div
          onClick={handleDelete}
          className="clickable text-xs font-medium tracking-wide hover:text-primary"
        >
          delete
        </div>
      </div>
      <a href={uri} target="_blank" rel="noreferrer">
        <div className="flex gap-x-4 items-center p-4 rounded border border-accent w-full">
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
  );
};

export default Link3Item;
