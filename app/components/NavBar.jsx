"use-client"
import React, { useEffect } from "react";
import { useMoralis } from "react-moralis";


const NavBar = () => {
	const {
		enableWeb3,
		account,
		isWeb3Enabled,
		Moralis,
		deactivateWeb3,
		isWeb3EnableLoading,
	} = useMoralis();

	useEffect(() => {
		console.log("yes");
		if (isWeb3Enabled) {
			return;
		} else if (localStorage.getItem("connected")) {
			enableWeb3();
		}
		console.log(isWeb3Enabled);
	}, [isWeb3Enabled]);

	useEffect(() => {
		Moralis.onAccountChanged((account) => {
			console.log(`accounts changed to ${account}`);
			if (account == null) {
				localStorage.removeItem("connected");
				deactivateWeb3();
				console.log("deactivated...");
			}
		});
	}, []);

	const enable = async () => {
		if (typeof window != "undefined") {
			await enableWeb3();
			localStorage.setItem("connected", "injected");
		}
	};
	return (
		<>
			<nav>
				{isWeb3Enabled ? (
					<div>
						<button>
							Connected to {account.slice(0, 6)}...
							{account.slice(account.length - 4)}
						</button>
						{/* <button onClick={()=>deactivateWeb3()}>dsiconnect</button> */}
					</div>
				) : (
					<button onClick={enable} disabled={isWeb3EnableLoading}>
						Connect Wallet
					</button>
				)}
			</nav>
		</>
	);
};
export default NavBar;
