const contractDetails = {
	tokenLock: {
		tokenAbi: require("../Constants/TokenLock/abi.json"),
		tokenContract: require("../Constants/TokenLock/contractAddress.json"),
	},
	aave: {
		tokenAbi: require("../Constants/aave/abi.json"),
		tokenContract: require("../Constants/aave/contractAddress.json"),
	},
	usdt: {
		tokenAbi: require("../Constants/usdt/abi.json"),
		tokenContract: require("../Constants/usdt/contractAddress.json"),
	},
	link: {
		tokenAbi: require("../Constants/link/abi.json"),
		tokenContract: require("../Constants/link/contractAddress.json"),
	},
};

module.exports = { contractDetails };
