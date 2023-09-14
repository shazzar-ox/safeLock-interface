"use client";

import SavingDetails from "../components/SavingDetails";
import { WagmiConfig, createConfig, mainnet, sepolia } from "wagmi";
import { createPublicClient, http } from "viem";

const config = createConfig({
	autoConnect: true,
	publicClient: createPublicClient({
		chain: sepolia,
		transport: http(),
	}),
});
const Details = () => {
	return (
		<>
			<WagmiConfig config={config}>
				<SavingDetails />
			</WagmiConfig>
		</>
	);
};

export default Details;
