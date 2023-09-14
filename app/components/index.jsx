const contractDetails = {
	tokenLock: {
		tokenAbi: require("../Constants/TokenLock/abi.json"),
		tokenContract: require("../Constants/TokenLock/contractAddress.json"),
	},
    aave:{
        tokenAbi: require("../Constants/aave/abi.json"),
        tokenContract: require("../Constants/aave/contractAddress.json")
    }
};

module.exports = { contractDetails};
