import { Link } from "../../near/types";
import Image from 'next/image'
import { useNear } from "../../context/near";

interface Props {
  link: Link;
}

const LinkTreeItem = ({ link }: Props) => {
  const { updateLink } = useNear();
  const { title, image_uri, uri, description } = link;
  const cenas = () => {
    updateLink({
      id: link.id,
      title: "You know",
      image_uri: link.image_uri,
      uri: link.uri,
      description: "Olha que coisa mai linda",
    });
  }
  return (
    <div className="w-full relative">
      <div className="absolute top-1 right-2">
        <div onClick={cenas} className="clickable text-xs font-medium tracking-wide hover:text-primary">edit</div>
      </div>
      <a href={uri} target="_blank">
        <div className='flex gap-x-4 items-center p-4 rounded border border-accent w-full'>
          <div className="relative w-10 aspect-square rounded-full overflow-hidden">
            <Image
              src={image_uri ? `https://ipfs.io/ipfs/${image_uri}` : "https://picsum.photos/200"}
              alt={title}
              className='object-cover object-center rounded-full'
              placeholder="blur"
              blurDataURL={rgbDataURL(255, 40, 6)}
              layout='fill'
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

export default LinkTreeItem;

const keyStr =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='

const triplet = (e1: number, e2: number, e3: number) =>
  keyStr.charAt(e1 >> 2) +
  keyStr.charAt(((e1 & 3) << 4) | (e2 >> 4)) +
  keyStr.charAt(((e2 & 15) << 2) | (e3 >> 6)) +
  keyStr.charAt(e3 & 63)

const rgbDataURL = (r: number, g: number, b: number) =>
  `data:image/gif;base64,R0lGODlhAQABAPAA${triplet(0, r, g) + triplet(b, 255, 255)
  }/yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==`

