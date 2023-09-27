import { useEffect, useState } from "react";
import SavingDetails from "../components/SavingDetails";
import { createPublicClient, http } from "viem";
import { PROJECT_ID } from "../utils/contractAddress";
import { contractDetails } from "../components/index";
import {
	useNotification,
	NotificationProvider,
	Information,
	Button,
	Form,
	Input,
	DatePicker,
	TabList,
	Tab,
} from "@web3uikit/core";
import {
	useAccount,
	configureChains,
	createConfig,
	WagmiConfig,
	useConnect,
	useContractWrite,
	useConfig,
	useNetwork,
	useContractRead,
	usePrepareContractWrite,
	useWaitForTransaction,
} from "wagmi";

import {
	EthereumClient,
	w3mConnectors,
	w3mProvider,
} from "@web3modal/ethereum";
import { Web3Modal, useWeb3Modal } from "@web3modal/react";
import { sepolia } from "wagmi/chains";
import { BsFillBellFill } from "react-icons/bs";

const chains = [sepolia];
const projectId = PROJECT_ID;

const { publicClient } = configureChains(chains, [w3mProvider({ projectId })]);
const wagmiConfig = createConfig({
	autoConnect: true,
	connectors: w3mConnectors({ projectId, chains }),
	publicClient,
});
const ethereumClient = new EthereumClient(wagmiConfig, chains);

const tokenLockAbi = contractDetails["tokenLock"]["tokenAbi"];

const Curency = ({ icon, contract, name, num, digit }) => {
	console.log(num);
	const [currentChainId, setCurrentChainId] = useState(1);
	const [incomingTokenName, setIncomingTokenName] = useState(0);
	const [decimal, setDecimal] = useState(0);
	const [incomingContract, setIncomingContract] = useState("");
	const [incomingContractAbi, setIncomingContractAbi] = useState("");
	const [safeLockContract, setSafeLockContract] = useState("");
	const [balance, setBalance] = useState("");
	const { connector: activeConnector, isConnected, address } = useAccount();
	const { connect, connectors, error, isLoading, pendingConnector } =
		useConnect();
	const { chain } = useNetwork();
	useEffect(() => {
		// console.log(isOpen)
		if (typeof window != "undefined" && isConnected) {
			const chainId = chain.id;
			setCurrentChainId((prev) => (prev = chainId));

			setIncomingTokenName((prev) => (prev = name));

			setDecimal((prev) => (prev = digit));
			const ERC20_CONTRACT_ADDRESSES = contractDetails[name]["tokenContract"];
			const ERC20_CONTRACT_ABI = contractDetails[name]["tokenAbi"];
			setIncomingContractAbi((prev) => (prev = ERC20_CONTRACT_ABI));

			const ERC2O_CONTRACT_ADDRESS =
				chainId in ERC20_CONTRACT_ADDRESSES
					? ERC20_CONTRACT_ADDRESSES[chainId]
					: null;
			// console.log(ERC20_CONTRACT_ADDRESSES);
			setIncomingContract((prev) => (prev = ERC2O_CONTRACT_ADDRESS));
			// safeLock token details....
			const tokenLockAddresses = contractDetails["tokenLock"]["tokenContract"];
			const tokenLockAddress =
				chainId in tokenLockAddresses ? tokenLockAddresses[chainId] : null;
			setSafeLockContract((prev) => (prev = tokenLockAddress));
		} else {
			// setState(!state);
		}
	}, [address]);

	// read token balnce address...
	const totalBalance = useContractRead({
		address: safeLockContract,
		abi: tokenLockAbi,
		functionName: "getTotalTokenSavings",
		args: [incomingContract, address],
		watch: true,
	});

	useEffect(() => {
		if (totalBalance.isSuccess) {
			console.log(totalBalance.data.toString());
			setBalance((prev) => (prev = totalBalance?.data.toString()));
		}
	}, [totalBalance.isSuccess, isConnected]);

	return (
		<>
			<WagmiConfig config={wagmiConfig}>
				<div class="flex items-center my-8 gap-x-4 lg:w-1/2 mx-auto md:w-2/3" >
					<div className="font-bold lg:text-3xl md:text-2xl text-white">{icon}</div>
					<div>
						<h2 className="font-bold lg:text-2xl md:text-2xl text-white">TokenKeep {name}</h2>
						<i className="text-white">click to save more {name}</i>
					</div>
				<Information topic="Current Balance" information={balance / num} />
				</div>

			</WagmiConfig>
		</>
	);
};
export default Curency;
