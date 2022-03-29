import { useNear } from "../context/near";
import ButtonLogin from "./buttons";
import { NearLogo } from "./icons/near";

export default function Auth({
  className
}: {
  className?: string
}) {
  const { accountId, isLoggedIn, logout, show } = useNear();
  const handleAuth = () => {
    if (isLoggedIn) {
      logout();
    } else {
      show();
    }
  };
  if (isLoggedIn) {
    return (
      <div>
        <button className="">
          {accountId}
        </button>
        <ButtonLogin isLoading={false} isLoggedIn={isLoggedIn} onClick={handleAuth} />
      </div>
    )
  }
  return (
    <ButtonLogin isLoading={false} isLoggedIn={isLoggedIn} onClick={handleAuth} />
  )
}