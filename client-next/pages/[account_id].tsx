import { NextPage } from "next";
import { useRouter } from "next/router";
import Hub from "../components/dashboard/hub";

const Link3: NextPage = () => {
  const { query } = useRouter();
  const { account_id } = query;
  const accountId: string = account_id as string;

  return (
    <>
      <div>{account_id && <Hub accountId={accountId} />}</div>
    </>
  );
};

export default Link3;
