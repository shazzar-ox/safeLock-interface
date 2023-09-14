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
	const [savingsTokenName, setSavingsTokenName] = useState("")
	// const [decimalPlace, setDecimalPlace] = useState(0)

	const click = (name, decimalPlaces) => {
		console.log(name);
		// setCurrentAddress((prev) => (prev = name));
		localStorage.setItem("tokenName", name);
		localStorage.setItem("value", decimalPlaces);
		setSavingsTokenName(prev=> prev = name)
		setDecimalPlace((prev) => (prev = decimalPlaces));
		// setStateChange(!stateChange)
		// <Link>
	};

	useEffect(()=>{

	}, [])
	// console.log(stateChange);

	return (
		<>
			<WagmiConfig config={wagmiConfig}>
				{/* <NavBar /> */}
				<Nav />
				<Link href="/details">
					<div
						class="m-8 bg-gray-700 gap-x-8"
						onClick={() => click(USDT_ADDRESS, 1000000)}
					>
						<Curency
							icon={<FaDollarSign />}
							contract={savingsTokenName}
							name={"usdt"}
							digit={decimalPlace}
						/>
					</div>
				</Link>

				<Link href="/details">
					<div
						class="m-8 bg-gray-700 gap-x-8"
						onClick={() => click(EURO_ADDRESS, 1000000)}
					>
						<Curency
							icon={<FaEuroSign />}
							contract={savingsTokenName}
							name={"Euro"}
							digit={decimalPlace}
						/>
					</div>
				</Link>

				<Link href="/details">
					<div
						class="m-8 bg-gray-700 gap-x-8"
						onClick={() => click(GBP_ADDRESS, 1000000)}
					>
						<Curency
							icon={<FaPoundSign />}
							contract={savingsTokenName}
							name={"GBP"}
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
