import Auth from "./auth";
import Link from "next/link";
import NavBar from "./nav_bar";
import { Logo } from "./icons/logo";

const links = [
  {
    href: "/",
    text: "Home",
  },
  {
    href: "/dashboard",
    text: "Dashboard",
  },
];

const TopBar = () => {
  return (
    <>
      <div className="flex items-center justify-between px-4 py-4 mb-6 shadow-lg shadow-primary">
        <Link href="/">
          <a>
            <Logo className="w-20 rounded-full " />
          </a>
        </Link>
        <NavBar links={links} />
        <Auth />
      </div>
    </>
  );
};

export default TopBar;
