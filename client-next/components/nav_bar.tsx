import Link from "next/link"
interface Links {
  href: string,
  text: string
}
interface Props {
  links: Array<Links>
  className?: string
}

const NavBar = ({
  links,
  className,
}: Props) => {
  return (
    <>
      <div className="">
        <ul className="flex items-center justify-between space-x-4">
          {links.map((link, index) => (
            <li key={index}>
              <Link href={link.href}>
                <a className="">{link.text}</a>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}

export default NavBar