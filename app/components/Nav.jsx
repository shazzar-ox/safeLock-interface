import { Web3Button } from "@web3modal/react";
import { useWeb3Modal } from "@web3modal/react";
import Link from "next/link";

const Nav = () => {
	const { open, close } = useWeb3Modal();
	return (
		<>
			<div className="p-5  border-b-2 flex">
				<Link href="/">
					<h2 className="py-4 px-4 font-bold text-3xl">Token Keep</h2>
				</Link>
				<div className="ml-auto py-4 px-2">
					<Web3Button themeMode="dark" />
				</div>
			</div>
			{/* <button onClick={() => open()}>Connected wallet</button> */}
		</>
	);
};
export default Nav;
