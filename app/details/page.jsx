"use client";

import SavingDetails from "../components/SavingDetails";
import { WagmiConfig, createConfig, mainnet, sepolia } from "wagmi";
import { createPublicClient, http } from "viem";
import { NotificationProvider } from "@web3uikit/core";

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
			<NotificationProvider>
				<WagmiConfig config={config}>
					<SavingDetails />
				</WagmiConfig>
			</NotificationProvider>
		</>
	);
};

export default Details;
