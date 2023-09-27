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
	Button,
	Form,
	Input,
	DatePicker,
	TabList,
	Tab,
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
	const [callFunc, setCallFunc] = useState(false);
	const [chosenNumber, setChosenNumber] = useState("");
	const [isMobile, setIsMobile] = useState(false);
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
		// onError(error) {
		// 	handleNewNotification("time is not up");
		// },
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
		isError: withdrawError,
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
		// event.preventDefault();
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

	const {
		data: data1,
		write: approveFunc,
		isSuccess: approveSuccess,
		// isLoading:
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

	// contol form...

	useEffect(() => {
		const handleResize = () => {
			setIsMobile(window.innerWidth <= 768); // Adjust the screen size breakpoint as needed
		};

		window.addEventListener("resize", handleResize);
		handleResize(); // Set initial screen size

		return () => {
			window.removeEventListener("resize", handleResize);
		};
	}, []);

	// to check error
	useState(() => {
		if (withdrawError) {
			handleNewNotification("time is not up");
		}
	}, [withdrawError]);

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

	const inputDateChange = (data) => {
		console.log(data.date);
		const dateString = data.date;
		const date = new Date(dateString);
		const unixTimeStamp = date.getTime() / 1000;
		setSavingsInfo((prev) => {
			return { ...prev, date: unixTimeStamp };
		});
	};
	const inputChange = (event) => {
		console.log(event.target.value);
		const { id, name, value } = event.target;
		if (name == "amount") {
			setSavingsInfo((prev) => {
				return { ...prev, [name]: value * decimal };
			});
		} else {
			setSavingsInfo((prev) => {
				return { ...prev, [name]: value.toLowerCase() };
			});
		}
		// setConnectedChainId((prev) => (prev = chainId));
	};
	console.log(savingsInfo);
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
	console.log(keys);
	const handleEmergencyWithdrawalSubmit = (event) => {
		event.preventDefault();
		withdrawEmergencyFunc();
	};

	const clicked = (value) => {
		// console.log(value);
		// console.log(data)
		setNames(value);
	};
	const change = (data) => {
		console.log(data);
		setUserFormData(true);

		clicked(keys[data]);
		setChosenNumber((prev) => (prev = data));
	};

	return (
		<>
			{/* <div onClick={refresh}> */}
			<WagmiConfig config={wagmiConfig}>
				<Nav />
				{/* </div> */}
				<Information
					information={balance / decimal}
					topic="Your Balance"
					style={{ backgroundColor: "white" }}
				/>

				<div
					className="my-10 gap-y-10 "
					style={{ maxWidth: "24rem", margin: " 0 auto " }}
				>
					<h1 className="my-8 font-bold text-3xl">DEPOSIT SLIP</h1>
					<br />
					<Input
						label="Savings Name"
						// labelBgColor="#70bd7a"
						labelColor="cyan"
						name="savingsName"
						value={savingsInfo.savingsName}
						// onBlur={function noRefCheck() {}}
						onChange={inputChange}
						size="large"
						autoFocus
						errorMessage="this is not valid"
						style={{
							backgroundColor: "white",
							fontWeight: "bold",
						}}
					/>
					<br />
					<Input
						label="Amount"
						name="amount"
						// value={savingsName.amount}
						// onBlur={function noRefCheck() {}}
						labelColor="cyan"
						onChange={inputChange}
						size="large"
						type="number"
						validation={{
							numberMin: 0,
						}}
						// labelBgColor="#70bd7a"
						style={{
							backgroundColor: "white",
							fontWeight: "bold",
						}}
					/>
					<br />

					<DatePicker
						id="date-picker"
						name="date"
						label="Set Withdrawal Date"
						size="large"
						width="30px"
						labelColor="cyan"
						onChange={inputDateChange}
						validation={{
							min: `${year}-${month}-${day}`,
							required: true,
						}}
						// labelBgColor="#70bd7a"
						style={{
							backgroundColor: "white",
							fontWeight: "bold",
							width: "31%",
						}}
					/>
					<br />

					<div className="flex gap-4">
						<div className="flex gap-x-7">
							<Button
								color="green"
								onClick={approveToken}
								radius={0}
								size="xl"
								text={
									approvedTransaction.isLoading ? (
										<div className="animate-spin spinner-border h-10 w-10 border-b-8 rounded-full"></div>
									) : (
										<div className="font-bold text-2xl">Approve</div>
									)
								}
								theme="colored"
								type="button"
								disabled={
									approvedTransaction.isLoading || appState || !isConnected
								}
							/>
						</div>
						<div class="flex">
							<Button
								color="blue"
								disabled={saveConfirmation.isLoading || !appState}
								onClick={handleSubmit}
								size="xl"
								text={
									saveConfirmation.isLoading ? (
										<div className="animate-spin spinner-border h-10 w-10 border-b-8 rounded-full"></div>
									) : (
										<div className="font-bold text-2xl">Save</div>
									)
								}
								theme="colored"
								type="button"
							/>
						</div>
					</div>
				</div>
				{/* <h3>{!isConnected && "Connect Wallet To Use App"}</h3> */}
				<div className="my-8">
					{/* {incomingTokenName}...{decimal}... hellox */}
					<div
						className="clearList "
						style={{ maxWidth: "39rem", margin: " 0 auto ", color: "white" }}
					>
						<div>
							<TabList
								isWidthAuto
								defaultActiveKey={1}
								isVertical={isMobile ? false : true}
								onChange={change}
								// onClick={() => clicked(keys[chosenNumber])}
								tabStyle={isMobile ? "bulbUnion" : "bar"}
							>
								{keys.map((each, index) => {
									return (
										<Tab
											key={index}
											tabKey={index}
											// onClick={() => clicked(each)}
											tabNameColor="red"
											style={{ color: "red" }}
											tabName={
												<div class="font-bold  lg:text-white lg:text-3xl md:text-2xl">
													{each.charAt(0).toUpperCase() + each.slice(1)}
												</div>
											}
											// tabName={each.charAt(0).toUpperCase() + each.slice(1)}
										>
											<Form
												data={[
													{
														inputWidth: "100%",
														name: (
															<div className="font-bold text-1xl text-black">
																Savings Name
															</div>
														),
														type: "text",
														value: `${
															names == undefined
																? "Please select saving"
																: names
														}`,
														hasCopyButton: true,
														size: "large",
													},
													{
														inputWidth: "100%",
														name: (
															<div className="font-bold text-1xl text-black">
																`Amount Saved in ${incomingTokenName}`
															</div>
														),
														type: "number",
														value: `${savedAmount}`,
													},
													{
														name: (
															<div className="font-bold text-1xl text-black">
																Withdrawal Date
															</div>
														),
														type: "text",
														value: `${expectedWithdrawalDate}`,
													},
												]}
												isDisabled
												onSubmit={function noRefCheck() {}}
												customFooter={
													<div>
														<Button
															size="regular"
															// size="xl"
															text={
																expectedWithdrawalDate == "01/01/1970" ? (
																	<div className="font-bold text-2xl">
																		Select Savings Name....
																	</div>
																) : currentDate >=
																  new Date(
																		expectedWithdrawalDate
																			.split("/")
																			.reverse()
																			.join("/")
																  ) ? (
																	<div className="font-bold text-2xl">
																		Congratulations... use withdrawal slip
																	</div>
																) : (
																	<div className="font-bold text-2xl">
																		World Safest Bank
																	</div>
																)
															}
															theme="colored"
															color={
																currentDate >=
																new Date(
																	expectedWithdrawalDate
																		.split("/")
																		.reverse()
																		.join("/")
																)
																	? "green"
																	: "blue"
															}
														/>
													</div>
												}
												style={{ backgroundColor: "white", color: "white" }}
												title={
													<div className="font-bold text-1xl text-black">
														Savings Information
													</div>
												}
												size="large"
											/>
										</Tab>
									);
								})}
							</TabList>
						</div>
					</div>
				</div>
				{/*  withrawal form.... */}
				<div
					className="my-8 lg:flex md:grid gap-4"
					style={{ maxWidth: "39rem", margin: " 0 auto " }}
				>
					<div>
						<Input
							label={
								<div className="font-bold text-1xl text-green">
									Withdrawal Slip
								</div>
							}
							name="withdrawalName"
							value={savingsInfo.withdrawalName}
							// onBlur={function noRefCheck() {}}
							onChange={inputChange}
							size="large"
							autoFocus
							errorMessage="this is not valid"
							style={{
								backgroundColor: "white",
								fontWeight: "bold",
							}}
						/>
						<br />

						<Button
							color="green"
							disabled={withdrawConfirmation.isLoading}
							onClick={handleWithdrawalSubmit}
							size="large"
							text={
								withdrawConfirmation.isLoading ? (
									<div className="animate-spin spinner-border h-10 w-10 border-b-8 rounded-full"></div>
								) : (
									<div className="font-bold text-2xl">WITHDRAW</div>
								)
							}
							theme="colored"
							type="button"
						/>
					</div>
					<br />
					{/* Emergency WithdrawalSLip */}
					<div>
						<Input
							label={
								<div className="font-bold text-1xl text-red">
									Emergency Withdrawal Slip
								</div>
							}
							name="emergencyWithdrawalName"
							value={savingsInfo.emergencyWithdrawalName}
							// onBlur={function noRefCheck() {}}
							onChange={inputChange}
							size="large"
							autoFocus
							errorMessage="this is not valid"
							style={{
								backgroundColor: "white",
								fontWeight: "bold",
							}}
						/>
						<br />
						<Button
							color="red"
							disabled={withdrawEmergencyConfrimation.isLoading}
							onClick={handleEmergencyWithdrawalSubmit}
							size="large"
							text={
								withdrawEmergencyConfrimation.isLoading ? (
									<div className="animate-spin spinner-border h-10 w-10 border-b-8 rounded-full"></div>
								) : (
									<div className="font-bold text-2xl">EMERGENCY</div>
								)
							}
							theme="colored"
							type="button"
						/>
					</div>
				</div>
			</WagmiConfig>
			<Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
		</>
	);
};

export default SavingDetails;
