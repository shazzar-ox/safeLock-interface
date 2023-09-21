// "use client";
import { useEffect, useState } from "react";
import Nav from "./Nav";
import { PROJECT_ID } from "../utils/contractAddress";
import { ethers } from "ethers";
import { contractDetails } from "../components/index";
import { useRouter } from "next/navigation";
import {
	useNotification,
	NotificationProvider,
	Information,
	Button
} from "@web3uikit/core";

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

// app paramters statrs from here ....

const SavingDetails = () => {
	let token, tokenValue, data;

	const { connector: activeConnector, isConnected, address } = useAccount();
	const { connect, connectors, error, isLoading, pendingConnector } =
		useConnect();
	const { chain, chains } = useNetwork();

	const { isOpen, open, close, setDefaultChain } = useWeb3Modal();
	const [incomingTokenName, setIncomingTokenName] = useState(0);
	const [decimal, setDecimal] = useState(0);
	const [state, setState] = useState(false);
	const [count, setcount] = useState(0);
	const [balance, setBalance] = useState("");
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
	// let keys = Object.values(eachNameArray).sort();
	const [keys, setKeys] = useState([]);
	const [bodyAction, setBodyAction] = useState(false);
	const [appState, setAppState] = useState(false);
	const [boolManager, setboolManager] = useState(false);
	const [savedList, setSavedList] = useState("");
	const { push } = useRouter();
	const dispatch = useNotification();
	// integrating front end to the contract with Wagmi...

	// control all notifcations...

	const handleNewNotification = (msg) => {
		dispatch({
			type: "success",
			message: msg,
			title: "New Notification",
			position: "topR",
			icon: <BsFillBellFill />,
		});
	};
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
		watch: true,
	});

	// read token balnce address...
	const totalBalance = useContractRead({
		address: safeLockContract,
		abi: tokenLockAbi,
		functionName: "getTotalTokenSavings",
		args: [incomingContract, address],
		watch: true,
	});

	// wait for readConfirmation...

	// const readConfirmation = useWaitForTransaction({
	// 	confirmations: 3,
	// 	hash: getUserSavingsName?.hash,
	// });

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
		onError(error) {
			// alert("time is not up");
			handleNewNotification("time is not up");
		},
	});

	//  prepare config for emergency withdrawal....emergencyWithdrawalName
	const { config: withdrawEmergencyConfig } = usePrepareContractWrite({
		address: safeLockContract,
		abi: tokenLockAbi,
		functionName: "emergencyWithdrawal",
		args: [incomingContract, savingsInfo.emergencyWithdrawalName],
		// onError(error) {
		// 	alert(error);
		// },
	});

	// console.log(approveConfig, getDataBalance);

	//  deposit function settings...
	const {
		isSuccess: saveSuccess,
		data: saveData,
		write: saveFunc,
		reset: saveReset,
	} = useContractWrite(saveConfig);

	// wait for confirmation....

	const saveConfirmation = useWaitForTransaction({
		confirmations: 1,
		hash: saveData?.hash,
	});

	// withdraw function settings...
	const {
		isSuccess: withdrawSuccess,
		data: withdrawData,
		write: withdrawFunc,
		reset: withdrawReset,
		data: withrawData,
	} = useContractWrite(withdrawConfig);

	//  wait for conmfirmation....
	const withdrawConfirmation = useWaitForTransaction({
		confirmations: 1,
		hash: withdrawData?.hash,
	});

	//  emergency withdraw function....withdrawEmergencyConfig
	const {
		isSuccess: withdrawEmergencySuccess,
		data: withdrawEmergencyData,
		write: withdrawEmergencyFunc,
		reset: withdrawEmergencyReset,
	} = useContractWrite(withdrawEmergencyConfig);

	//  wait for withdraw confrimtation.....
	const withdrawEmergencyConfrimation = useWaitForTransaction({
		confirmations: 1,
		hash: withdrawEmergencyData?.hash,
	});

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
			console.log(token, incomingTokenName);
			if (token == null || tokenValue == null) {
				push("/");
			} else {
				setIncomingTokenName(
					(prev) => (prev = localStorage.getItem("tokenName"))
				);

				setDecimal((prev) => (prev = localStorage.getItem("value")));
				const ERC20_CONTRACT_ADDRESSES =
					contractDetails[token]["tokenContract"];
				const ERC20_CONTRACT_ABI = contractDetails[token]["tokenAbi"];
				setIncomingContractAbi((prev) => (prev = ERC20_CONTRACT_ABI));
				const ERC2O_CONTRACT_ADDRESS =
					chainId in ERC20_CONTRACT_ADDRESSES
						? ERC20_CONTRACT_ADDRESSES[chainId]
						: null;
				console.log(ERC20_CONTRACT_ADDRESSES);
				setIncomingContract((prev) => (prev = ERC2O_CONTRACT_ADDRESS));
				// safeLock token details....
				const tokenLockAddresses =
					contractDetails["tokenLock"]["tokenContract"];
				const tokenLockAddress =
					chainId in tokenLockAddresses ? tokenLockAddresses[chainId] : null;
				setSafeLockContract((prev) => (prev = tokenLockAddress));
			}
		} else {
			setState(!state);
		}
	}, [address, isConnected]);

	// let createTableRows;
	let userNames = [];
	useEffect(() => {
		if (getUserSavingsName.data != undefined) {
			for (let i = 0; i < getUserSavingsName.data.length; i++) {
				const newArray = getUserSavingsName.data[i];
				userNames.push(newArray);
				setEachNameArray((prev) => {
					return userNames;
				});
			}
		}
		if (totalBalance.data != undefined) {
			console.log(totalBalance.data.toString());
			setBalance((prev) => (prev = totalBalance?.data.toString()));
		}
	}, [
		getUserSavingsName.isSuccess,
		totalBalance.isSuccess,
		// getUserSavingsName.isLoading,
		// readConfirmation.isSuccess,
		saveConfirmation.isSuccess,
		address,
		withdrawConfirmation.isSuccess,
		withdrawEmergencyConfrimation.isSuccess,
	]);
	// console.log(readConfirmation.isSuccess);

	useEffect(() => {
		// document.querySelector(".clearList").textContent = "";

		setKeys(Object.values(eachNameArray).sort());
	}, [eachNameArray]);

	console.log(keys);

	useEffect(() => {
		if (getUserSavingsInfo.data != undefined) {
			let unixTimeStamp = getUserSavingsInfo.data.finalTime.toString();
			let date = new Date(unixTimeStamp * 1000);
			let dateTorealTime = date.toLocaleDateString();
			let amountToSave = getUserSavingsInfo.data.amount.toString() / decimal;
			setSavedAmount((prev) => (prev = amountToSave));
			setExpectedWithdrawalDate((prev) => (prev = dateTorealTime));
		}
	}, [getUserSavingsInfo.isSuccess, names, isConnected]);

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

	const approvedTransaction = useWaitForTransaction({
		confirmations: 1,
		hash: data1?.hash,
	});

	// reset Approve....
	useEffect(() => {
		if (approvedTransaction.isSuccess) {
			handleNewNotification(
				`${incomingTokenName} has been approved, You can now Lock your Funds.. This transaction is Entirely Free
				Tx:${approvedTransaction.data?.transactionHash}`
			);
			setAppState(true);
			setboolManager(true);
			setTimeout(() => {
				approveReset();
			}, 1000);
		}

		if (saveConfirmation.isSuccess) {
			handleNewNotification(
				`${savingsInfo.amount / decimal} has been added to ${
					savingsInfo.savingsName
				} Happy Saving...
				Tx:${saveConfirmation.data?.transactionHash}`
			);
			setTimeout(() => {
				saveReset();
			}, 3000);
		}
		if (withdrawConfirmation.isSuccess) {
			handleNewNotification(
				`${incomingTokenName} saved to ${savingsInfo.withdrawalName} has been deposited in your wallet!!!
				Tx:${withdrawConfirmation.data?.transactionHash}`
			);
			setTimeout(() => {
				withdrawReset();
			}, 3000);
		}
		if (withdrawEmergencyConfrimation.isSuccess) {
			handleNewNotification(`${incomingTokenName} saved to ${savingsInfo.withdrawalName} has been deposited in your wallet!!! 
			Note this comes with a 10% TaxFee
			Tx:${withdrawEmergencyConfrimation.data?.transactionHash}`);
			setTimeout(() => {
				withdrawEmergencyReset();
			}, 3000);
		}
	}, [
		approvedTransaction.isSuccess,
		saveConfirmation.isSuccess,
		withdrawConfirmation.isSuccess,
		withdrawEmergencyConfrimation.isSuccess,
	]);

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
				<Nav />
				{/* </div> */}
				<Information information={balance / decimal} topic="Your Balance" />

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
						<Button
							color="yellow"
							onClick={function noRefCheck() {}}
							radius={0}
							size="large"
							text="Approve"
							theme="colored"
							type="button"
						/>

						<button
							// type="submit"
							disabled={appState}
							class="rounded-full"
							// onClick={
							// }
							onClick={approveToken}
						>
							APPROVE!
						</button>

						<button
							disabled={!appState}
							type="submit"
							class="rounded-full"
							onClick={handleSubmit}
						>
							SAVE!
						</button>
					</form>
				</div>
				{/* <h3>{!isConnected && "Connect Wallet To Use App"}</h3> */}
				<div>
					{incomingTokenName}...{decimal}... hellox
					<div
						className="clearList"
						style={{ display: "inline-flex", gap: "2%" }}
					>
						<div>
							{keys.map((each, index) => {
								return (
									<div
										title="Click to see More information"
										key={index}
										onClick={() => clicked(each)}
									>
										{each}
									</div>
								);
							})}
						</div>
					</div>
				</div>
				{address && userFormData && (
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
				{/*  withrawal form.... */}
				<div class="my-8">
					<h3>Withdrawal Slip..</h3>
					<form>
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

						<button
							// disabled={}
							type="submit"
							class="rounded-full"
							onClick={handleWithdrawalSubmit}
						>
							WITHDRAW!
						</button>
					</form>

					{/* Emergency WithdrawalSLip */}
					<h3>Emergency Withdrawal Slip..</h3>
					<form>
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
						<button
							// disabled={}
							type="submit"
							class="rounded-full"
							onClick={handleEmergencyWithdrawalSubmit}
						>
							EMERGENCY!
						</button>
					</form>
				</div>
			</WagmiConfig>
			<Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
		</>
	);
};

export default SavingDetails;
