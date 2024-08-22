const { ethers } = require("hardhat");

async function main() {
    const contractAddress = '0x73511669fd4dE447feD18BB79bAFeAC93aB7F31f';
    const Radiotrace = await ethers.getContractFactory("Radiotrace");
    const contract = await Radiotrace.attach(contractAddress);

    const adminAddress = await contract.admin();
    console.log("Admin Address:", adminAddress);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
