const { ethers } = require("hardhat");
async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    const Radiotrace = await ethers.getContractFactory("Radiotrace");
    const radiotrace = await Radiotrace.deploy();

    console.log("Contract deployed to:", radiotrace.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });