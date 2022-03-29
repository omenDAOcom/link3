import { Link } from "../../near/types";
import LinkTreeItem from "./link_tree_item";


interface Props {
  links: Array<Link>;
}

const LinkTree = ({ links }: Props) => {
  return (
      <div className="space-y-4 w-full">
        {links.map((link: Link) => <LinkTreeItem key={link.id} link={link} />)}
      </div>
  )
}

export default LinkTree;