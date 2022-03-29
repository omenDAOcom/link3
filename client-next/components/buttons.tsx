import { NearLogo } from "./icons/near";

export default function ButtonLogin({
  isLoading, isLoggedIn, className, onClick
}: {
  isLoading: boolean,
  isLoggedIn: boolean,
  className?: string
  onClick?: () => void;
}) {
  return (
    <button onClick={onClick} className={`${className}
      bg-primary 
      text-on-primary
      font-medium
      text-sm 
      py-1
      px-8 
      flex
      justify-center
      items-center
      gap-x-2
      rounded
      `}>
      {isLoggedIn ? 'Disconnect' : 'Login with NEAR'}
      <NearLogo className={`w-6 text-on-primary ${isLoading ? "animate-spin" : ""}`} />
    </button>
  )
}