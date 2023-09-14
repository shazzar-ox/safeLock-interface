// "use client";
import { useEffect, useState } from "react";
import Nav from "./Nav";
import { PROJECT_ID } from "../utils/contractAddress";
import { ethers } from "ethers";
import { contractDetails } from "../components/index";

// import fs from "../utils/index.jsx";

// wallet connect parameters...
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
} from "wagmi";

import {
	EthereumClient,
	w3mConnectors,
	w3mProvider,
} from "@web3modal/ethereum";
import { Web3Modal, useWeb3Modal } from "@web3modal/react";
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

// app paramters statrs from here ....

const SavingDetails = () => {
	let token, tokenValue, data;
	// const config = useConfig()
	// const { data: account } = useAccount();
	// console.log(account);
	const { connector: activeConnector, isConnected, address } = useAccount();
	const { connect, connectors, error, isLoading, pendingConnector } =
		useConnect();
	const { chain, chains } = useNetwork();

	const { isOpen, open, close, setDefaultChain } = useWeb3Modal();
	const [incomingTokenName, setIncomingTokenName] = useState(0);
	const [decimal, setDecimal] = useState(0);
	const [state, setState] = useState(false);
	const [count, setcount] = useState(0);
	const [incomingContract, setIncomingContract] = useState("");
	const [incomingContractAbi, setIncomingContractAbi] = useState("");
	const [currentChainId, setCurrentChainId] = useState(1);
	const [safeLockContract, setSafeLockContract] = useState("");
	const tokenLockAbi = contractDetails["tokenLock"]["tokenAbi"];
	const [userBalance, setUserBalance] = useState(0);
	const [savingsInfo, setSavingsInfo] = useState({
		savingsName: "",
		amount: "",
		date: "",
	});
	const [eachName, setEachName] = useState("");
	const [userTableData, setUserTableData] = useState(true);
	// integrating front end to the contract with Wagmi...
	// 1. getUserBalance contract....

	const getDataBalance = useContractRead({
		address: incomingContract,
		abi: incomingContractAbi,
		functionName: "balanceOf",
		args: [address],
	});

	// TO GET USERS SAVINGS NAMES..an array
	const getUserSavingsName = useContractRead({
		address: safeLockContract,
		abi: tokenLockAbi,
		functionName: "getUserSavingsName",
		args: [incomingContract, address],
	});

	// GET SAVINGS USER INFO....
	const getUserInfo = useContractRead({
		address: safeLockContract,
		abi: tokenLockAbi,
		functionName: "getUserSavingInfo",
		args: [incomingContract, address, eachName],
	});
	// console.log(getUserInfo);

	// 2. prepareConfig...
	const { config: approveConfig } = usePrepareContractWrite({
		address: incomingContract,
		abi: incomingContractAbi,
		functionName: "approve",
		args: [safeLockContract, getDataBalance.data],
	});

	// prepare config for saving...
	const { config: saveConfig } = usePrepareContractWrite({
		address: safeLockContract,
		abi: tokenLockAbi,
		functionName: "deposit",
		args: [
			incomingContract,
			savingsInfo.savingsName,
			savingsInfo.amount,
			savingsInfo.date,
		],
	});
	// console.log(approveConfig, getDataBalance);

	//  deposit function settings...
	const { data: saveData, write: saveFunc } = useContractWrite(saveConfig);

	// functions....
	const approveToken = async (event) => {
		event.preventDefault();
		const data = await getDataBalance.data;
		console.log(`data remaining is ${data}`);
		approveFunc();
	};

	useEffect(() => {
		// console.log(isOpen)
		if (typeof window != "undefined" && isConnected) {
			const chainId = chain.id;
			setCurrentChainId((prev) => (prev = chainId));
			token = localStorage.getItem("tokenName");
			tokenValue = localStorage.getItem("value");
			setIncomingTokenName(
				(prev) => (prev = localStorage.getItem("tokenName"))
			);
			// console.log(token, incomingTokenName);

			setDecimal((prev) => (prev = localStorage.getItem("value")));
			const ERC20_CONTRACT_ADDRESSES = contractDetails[token]["tokenContract"];
			const ERC20_CONTRACT_ABI = contractDetails[token]["tokenAbi"];
			setIncomingContractAbi((prev) => (prev = ERC20_CONTRACT_ABI));
			const ERC2O_CONTRACT_ADDRESS =
				chainId in ERC20_CONTRACT_ADDRESSES
					? ERC20_CONTRACT_ADDRESSES[chainId]
					: null;
			console.log(ERC20_CONTRACT_ADDRESSES);
			setIncomingContract((prev) => (prev = ERC2O_CONTRACT_ADDRESS));
			// safeLock token details....
			const tokenLockAddresses = contractDetails["tokenLock"]["tokenContract"];
			const tokenLockAddress =
				chainId in tokenLockAddresses ? tokenLockAddresses[chainId] : null;
			setSafeLockContract((prev) => (prev = tokenLockAddress));
		} else {
			setState(!state);
		}
	}, [isConnected]);
	// let createTableRows;
	let userArray = [];
	useEffect(() => {
		console.log(getUserInfo.data);
		if (getUserSavingsName.data != undefined && getUserInfo.data != undefined) {

			for (let i = 1; i < getUserSavingsName.data.length; i++) {
						
					let unixTimeStamp = getUserInfo.data.finalTime.toString();
					let date = new Date(unixTimeStamp * 1000);
					let userObject = {
						[eachName]: {
							amount: getUserInfo.data.amount.toString() / decimal,
							finalTime: date.toLocaleDateString(),
						},
					};
					console.log(eachName);
					setUserTableData(!userTableData);
					console.log(userObject);
					userArray.push(userObject);
				
			}
		}
		console.log(userArray);
	}, [
		isConnected,
		eachName,
		getUserSavingsName.isSuccess,
		getUserInfo.isSuccess,
		// userTableData,
	]);

	// approve function setttings...
	const {
		data: data1,
		write: approveFunc,
		isSuccess: approveSuccess,
	} = useContractWrite(approveConfig);

	const currentDate = new Date();
	// console.log(currentDate.);
	const day =
		currentDate.getDate() < 10
			? `0${currentDate.getDate()}`
			: currentDate.getDate() + 1;
	const month =
		currentDate.getMonth() + 1 < 10
			? `0${currentDate.getMonth() + 1}`
			: currentDate.getMonth() + 1;
	const year = currentDate.getFullYear();
	// console.log(day, month, year);

	const refresh = () => {
		setcount((prev) => prev + 1);
	};

	const inputChange = (event) => {
		const { name, value } = event.target;
		if (name == "date") {
			const dateString = value;
			const date = new Date(dateString);
			const unixTimeStamp = date.getTime() / 1000;
			setSavingsInfo((prev) => {
				return { ...prev, [name]: unixTimeStamp };
			});
		} else if (name == "amount") {
			setSavingsInfo((prev) => {
				return { ...prev, [name]: value * decimal };
			});
		} else {
			setSavingsInfo((prev) => {
				return { ...prev, [name]: value };
			});
		}

		// setConnectedChainId(prev=> prev = chainId)
	};

	const handleSubmit = (event) => {
		event.preventDefault();
		const dateString = `${year}-${month}-${day}`;
		const date = new Date(dateString);
		const unixTimeStamp = date.getTime() / 1000;
		if (savingsInfo.savingsName == "") {
			alert("please input savings name");
		} else if (savingsInfo.amount < 0 || savingsInfo.amount == "") {
			alert("please input a valid number");
		} else if (
			savingsInfo.date < unixTimeStamp ||
			savingsInfo.date == "NaN" ||
			savingsInfo.date == ""
		) {
			alert("please adjust Date....");
		} else {
			console.log(savingsInfo);
			saveFunc();
		}
	};

	return (
		<>
			{/* <div onClick={refresh}> */}
			<WagmiConfig config={wagmiConfig}>
				<Nav />
				{/* </div> */}
				<div class="my-8">
					<form>
						<label htmlFor="savingsName">Savings Name:</label>
						<input
							type="text"
							name="savingsName"
							id="savingsName"
							value={savingsInfo.savingsName}
							placeholder="Input savings name"
							onChange={inputChange}
						/>
						<br />

						<label htmlFor="amount">Amount to Save:</label>
						<input
							type="number"
							placeholder="3"
							name="amount"
							// value={savingsInfo.amount}
							onChange={inputChange}
							min="0"
						></input>
						<br />

						<label htmlFor="calender">Withdrawal Date</label>
						<input
							type="date"
							id="calender"
							name="date"
							// value={savingsInfo.date}
							min={`${year}-${month}-${day}`}
							onChange={inputChange}
						></input>
						<br />
						<p>
							<button
								// type="submit"
								disabled={approveSuccess || !isConnected}
								class="rounded-full"
								// onClick={
								// }
								onClick={approveToken}
							>
								APPROVE!
							</button>
						</p>
						<p>
							<button
								disabled={!approveSuccess}
								type="submit"
								class="rounded-full"
								onClick={handleSubmit}
							>
								SAVE!
							</button>
							<button
								// type="submit"
								disabled={!approveSuccess}
							>
								WITHDRAW!
							</button>
						</p>
					</form>
					<h3>{!isConnected && "Connect Wallet To Use App"}</h3>
					{incomingTokenName}...{decimal}... hello
					<table class="table-auto">
						<tr>
							<th>Savings Name</th>
							<th>Withdrawal Date</th>
							<th>Saved Amount</th>
						</tr>
						{/* {createTableRows()} */}
						<tr>
							<td>{eachName}.....m</td>
							<td>
								{getUserInfo.data != undefined ? getUserInfo.data.amount : ""}
							</td>
							<td>
								{getUserInfo.data != undefined
									? getUserInfo.data.finalTime
									: ""}
							</td>
						</tr>
					</table>
				</div>
			</WagmiConfig>
			<Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
		</>
	);
};

export default SavingDetails;
