import { Web3Button } from "@web3modal/react";
import { useWeb3Modal } from "@web3modal/react";
const Nav = () => {
	const { open, close } = useWeb3Modal();
	return (
		<>
			<div class="flex">
				<h2>Token Keep</h2>
				<div>
					<Web3Button themeMode="dark" />
				</div>
			</div>
			{/* <button onClick={() => open()}>Connected wallet</button> */}
		</>
	);
};
export default Nav;
