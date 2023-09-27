// import {react} from "react"
"use client";
import {
	USDT_ADDRESS,
	EURO_ADDRESS,
	GBP_ADDRESS,
	PROJECT_ID,
} from "./utils/contractAddress";

import {
	EthereumClient,
	w3mConnectors,
	w3mProvider,
} from "@web3modal/ethereum";
import { Web3Modal } from "@web3modal/react";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { sepolia } from "wagmi/chains";

const chains = [sepolia];
const projectId = PROJECT_ID;

const { publicClient } = configureChains(chains, [w3mProvider({ projectId })]);
const wagmiConfig = createConfig({
	autoConnect: true,
	connectors: w3mConnectors({ projectId, chains }),
	publicClient,
});
const ethereumClient = new EthereumClient(wagmiConfig, chains);

import NavBar from "./components/NavBar";
import Curency from "./components/Curency";
import Nav from "./components/Nav";
import SavingDetails from "./details/page";
import { FaDollarSign } from "react-icons/fa6";
import { FaPoundSign } from "react-icons/fa";
import { FaEuroSign } from "react-icons/fa6";
import { useEffect, useState } from "react";
import Link from "next/link";

const Home = () => {
	const [currentAddress, setCurrentAddress] = useState("0");
	const [decimalPlace, setDecimalPlace] = useState(1);
	const [stateChange, setStateChange] = useState(true);
	const [savingsTokenName, setSavingsTokenName] = useState("");
	// const [decimalPlace, setDecimalPlace] = useState(0)

	const click = (name, decimalPlaces) => {
		localStorage.setItem("tokenName", name);
		localStorage.setItem("value", decimalPlaces);
		setSavingsTokenName((prev) => (prev = name));
		setDecimalPlace((prev) => (prev = decimalPlaces));
		// setStateChange(!stateChange)
		// <Link>
	};

	return (
		<>
			<WagmiConfig config={wagmiConfig}>
				{/* <NavBar /> */}
				<Nav />
				<Link href="/details">
					<div
						// class="m-x-8 gap-x-8"
						// style={{margin: "0 auto" }}
						onClick={() => click("usdt", 1000000)}
					>
						<Curency
							icon={<FaDollarSign />}
							contract={savingsTokenName}
							name={"usdt"}
							num={1000000}
							digit={decimalPlace}
						/>
					</div>
				</Link>

				<Link href="/details">
					<div onClick={() => click("aave", 1e18)}>
						<Curency
							icon={<FaEuroSign />}
							contract={savingsTokenName}
							name={"aave"}
							num={1e18}
							digit={decimalPlace}
						/>
					</div>
				</Link>

				<Link href="/details">
					<div className="mx-auto" onClick={() => click("link", 1e18)}>
						<Curency
							icon={<FaPoundSign />}
							contract={savingsTokenName}
							name={"link"}
							num={1e18}
							digit={decimalPlace}
						/>
						{/* <SavingDetails contract={currentAddress} decimal={decimalPlace}/> */}
					</div>
				</Link>
			</WagmiConfig>
			<Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
		</>
	);
};
export default Home;
