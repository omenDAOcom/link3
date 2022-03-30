import { useNear } from "../context/near";
import ButtonLogin from "./buttons";

interface Props {
  className?: string;
}

const Auth = ({ className }: Props) => {
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
        <button className="">{accountId}</button>
        <ButtonLogin
          isLoading={false}
          isLoggedIn={isLoggedIn}
          onClick={handleAuth}
        />
      </div>
    );
  }

  return (
    <ButtonLogin
      isLoading={false}
      isLoggedIn={isLoggedIn}
      onClick={handleAuth}
    />
  );
};

export default Auth;
