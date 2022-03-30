import { Link } from "../../near/types";

interface Props {
  onEdit: (link: Link) => void;
  link: Link;
}

const Link3Item = ({ link, onEdit }: Props) => {
  const { title, image_uri, uri, description } = link;

  const handleEdit = () => {
    onEdit(link);
  };
  return (
    <div className="w-full relative">
      <div className="absolute top-1 right-2">
        <div onClick={handleEdit} className="clickable text-xs font-medium tracking-wide hover:text-primary">edit</div>
      </div>
      <a href={uri} target="_blank"
        rel="noreferrer"
      >
        <div className='flex gap-x-4 items-center p-4 rounded border border-accent w-full'>
          <div className="relative w-10 aspect-square rounded-full overflow-hidden">
            <img
              src={image_uri ? `https://ipfs.io/ipfs/${image_uri}` : "https://picsum.photos/200"}
              alt={title}
              className='object-cover object-center rounded-full'
              placeholder="blur"
            />
          </div>
          <div>
            <div>{title}</div>
            <div>{description}</div>
          </div>
        </div>
      </a>
    </div>
  )
}

export default Link3Item;