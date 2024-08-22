async function main() {
    const [adminAddress] = await ethers.getSigners();
    console.log("Admin Address:", adminAddress.address);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
