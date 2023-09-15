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
		withdrawalName: "",
		emergencyWithdrawalName: "",
		amount: "",
		date: "",
	});
	const [eachNameArray, setEachNameArray] = useState([]);
	const [userFormData, setUserFormData] = useState(false);
	const [savedAmount, setSavedAmount] = useState(0);
	const [expectedWithdrawalDate, setExpectedWithdrawalDate] = useState(0);
	const [names, setNames] = useState("");
	let keys = Object.keys(eachNameArray);
	const [bodyAction, setBodyAction] = useState(false);
	const [appState, setAppState] = useState(false);
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
	const getUserSavingsInfo = useContractRead({
		address: safeLockContract,
		abi: tokenLockAbi,
		functionName: "getUserSavingInfo",
		args: [incomingContract, address, names],
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

	//  prepare config for withrawal....
	const { config: withdrawConfig } = usePrepareContractWrite({
		address: safeLockContract,
		abi: tokenLockAbi,
		functionName: "withdraw",
		args: [incomingContract, savingsInfo.withdrawalName],
	});

	//  prepare config for emergency withdrawal....emergencyWithdrawalName
	const { config: withdrawEmergencyConfig } = usePrepareContractWrite({
		address: safeLockContract,
		abi: tokenLockAbi,
		functionName: "emergencyWithdrawal",
		args: [incomingContract, savingsInfo.emergencyWithdrawalName],
	});

	// console.log(approveConfig, getDataBalance);

	//  deposit function settings...
	const {
		isSuccess: saveSuccess,
		data: saveData,
		write: saveFunc,
		reset: saveReset,
	} = useContractWrite(saveConfig);

	// withdraw function settings...
	const {
		isSuccess: withdrawSuccess,
		data: withdrawData,
		write: withdrawFunc,
		reset: withdrawReset,
		error: withdrawError,
		data: withrawData 
	} = useContractWrite(withdrawConfig);

	//  emergency withdraw function....withdrawEmergencyConfig
	const {
		isSuccess: withdrawEmergencySuccess,
		data: withdrawEmergencyData,
		write: withdrawEmergencyFunc,
		reset: withdrawEmergencyReset,
	} = useContractWrite(withdrawEmergencyConfig);

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
	let userNames = [];
	useEffect(() => {
		if (getUserSavingsName.data != undefined) {
			for (let i = 0; i < getUserSavingsName.data.length; i++) {
				const newArray = getUserSavingsName.data[i];
				userNames.push(newArray);
				console.log(userNames);
				setEachNameArray((prev) => {
					return [...prev, newArray];
				});
			}
		}
	}, [getUserSavingsName.isSuccess, saveSuccess]);

	useEffect(() => {
		if (getUserSavingsInfo.data != undefined) {
			let unixTimeStamp = getUserSavingsInfo.data.finalTime.toString();
			let date = new Date(unixTimeStamp * 1000);
			let dateTorealTime = date.toLocaleDateString();
			let amountToSave = getUserSavingsInfo.data.amount.toString() / decimal;
			setSavedAmount((prev) => (prev = amountToSave));
			setExpectedWithdrawalDate((prev) => (prev = dateTorealTime));
		}
	}, [getUserSavingsInfo.isSuccess, names]);

	useEffect(() => {
		if (userFormData) {
			const handleBodyClick = (event) => {
				// Your event handling logic here
				// console.log("Body clicked!", event.target);
				setUserFormData(false);
			};

			document.body.addEventListener("click", handleBodyClick);

			return () => {
				document.removeEventListener("click", handleBodyClick);
			};
		}
	});

	// console.log("this is ", eachNameArray);
	// approve function setttings...
	const {
		data: data1,
		write: approveFunc,
		isSuccess: approveSuccess,
		reset: approveReset,
	} = useContractWrite(approveConfig);

	// reset Approve....
	useEffect(() => {
		setAppState(true);
		setTimeout(() => {
			approveReset();
		}, 3000);
	}, [approveSuccess]);

	// reset Save
	useEffect(() => {
		setTimeout(() => {
			saveReset();
		}, 3000);
	}, [saveSuccess]);

	// withdraw reset
	useEffect(() => {
		setTimeout(() => {
			withdrawReset();
		}, 3000);
	}, [withdrawSuccess]);

	// emeregency withraw reset..
	useEffect(() => {
		setTimeout(() => {
			withdrawEmergencyReset();
		}, 3000);
	}, [withdrawEmergencySuccess]);

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

	const handleWithdrawalSubmit = (event) => {
		event.preventDefault();
		withdrawFunc();
	};

	const handleEmergencyWithdrawalSubmit = (event) => {
		event.preventDefault();
		withdrawEmergencyFunc();
	};

	const clicked = (value) => {
		// console.log(value);
		setNames(value);
		setUserFormData(true);
	};
	return (
		<>
			{/* <div onClick={refresh}> */}
			<WagmiConfig config={wagmiConfig}>
				{approveSuccess &&
					alert(
						`${incomingTokenName} has been approved, You can now Lock your Funds.. This transaction is Entirely Free`
					)}
				{saveSuccess &&
					alert(
						`${savingsInfo.amount / decimal} has been added to ${
							savingsInfo.savingsName
						} Happy Saving...`
					)}
				{withdrawSuccess &&
					alert(
						`${incomingTokenName} saved to ${savingsInfo.withdrawalName} has been deposited in your wallet!!!`
					)}

				{withdrawError && alert(`${withrawData}`)}
				{withdrawEmergencySuccess &&
					alert(
						`${incomingTokenName} saved to ${savingsInfo.withdrawalName} has been deposited in your wallet!!! 
						
						Note this comes with a 10% TaxFee`
					)}
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
								disabled={!appState && !isConnected}
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
								disabled={!appState && !isConnected}
								type="submit"
								class="rounded-full"
								onClick={handleSubmit}
							>
								SAVE!
							</button>
						</p>
					</form>
					<h3>{!isConnected && "Connect Wallet To Use App"}</h3>
					{incomingTokenName}...{decimal}... hello
				</div>
				<div>
					<ul>
						{keys.map((each) => {
							return (
								<li key={each} onClick={() => clicked(eachNameArray[each])}>
									{eachNameArray[each]}
								</li>
							);
						})}
					</ul>
					{isConnected && userFormData && (
						<form>
							<h3>Savings info....</h3>
							<label htmlFor="savingsName">Savings Name:</label>
							<p id="savingsName">{names}</p>
							<br />
							<label htmlFor="savingsAmount">Saved Amount:</label>
							<p id="savingsAmount">
								{savedAmount} {incomingTokenName}
							</p>
							<br />
							<label htmlFor="savingsWithdrawal">Withdrawal Date:</label>
							<p id="savingsWithdrawal">{expectedWithdrawalDate}</p>
						</form>
					)}
				</div>

				{/*  withrawal form.... */}
				<div class="my-8">
					<form>
						<h3>Withdrawal Slip..</h3>
						<label htmlFor="savingsNames">Savings Name:</label>
						<input
							type="text"
							name="withdrawalName"
							id="savingsNames"
							value={savingsInfo.withdrawalName}
							placeholder="Input savings name"
							onChange={inputChange}
						/>
						<br />
						<p>
							<button
								disabled={!isConnected}
								type="submit"
								class="rounded-full"
								onClick={handleWithdrawalSubmit}
							>
								WITHDRAW!
							</button>
						</p>
					</form>

					{/* Emergency WithdrawalSLip */}
					<form>
						<h3>Emergency Withdrawal Slip..</h3>
						<label htmlFor="savingsNamess">Savings Name:</label>
						<input
							type="text"
							name="emergencyWithdrawalName"
							id="savingsNamess"
							value={savingsInfo.emergencyWithdrawalName}
							placeholder="Input savings name"
							onChange={inputChange}
						/>
						<br />
						<p>
							<button
								disabled={!isConnected}
								type="submit"
								class="rounded-full"
								onClick={handleEmergencyWithdrawalSubmit}
							>
								EMERGENCY!
							</button>
						</p>
					</form>
				</div>
			</WagmiConfig>
			<Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
		</>
	);
};

export default SavingDetails;
