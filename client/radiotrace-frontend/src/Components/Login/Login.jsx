import React, { useState } from 'react';
import { ethers } from 'ethers';
import { useNavigate } from 'react-router-dom';
import RadiotraceABI from '../../radiotraceContract.sol/Radiotrace.json';
import './Login.css';

const contractAddress = '0x73511669fd4dE447feD18BB79bAFeAC93aB7F31f';

const Login = ({ setRole, setWalletConnected }) => {
    const [walletAddress, setWalletAddress] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const connectWallet = async () => {
        setErrorMessage('');
        if (window.ethereum) {
            try {
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();
                const address = await signer.getAddress();
                setWalletAddress(address);

                const contract = new ethers.Contract(contractAddress, RadiotraceABI.abi, signer);
                console.log("Contract instantiated:", contract);

                const adminAddress = await contract.admin();
                console.log("Admin address:", adminAddress);

                if (address.toLowerCase() === adminAddress.toLowerCase()) {
                    setRole('admin');
                    setWalletConnected(true);
                    alert('Admin logged in successfully');
                    navigate('/admin');
                } else if (await contract.manufacturers(address)) {
                    setRole('manufacturer');
                    setWalletConnected(true);
                    alert('Manufacturer logged in successfully');
                    navigate('/manufacturer');
                } else if (await contract.users(address)) {
                    setRole('user');
                    setWalletConnected(true);
                    alert('User logged in successfully');
                    navigate('/user');
                } else if (await contract.observers(address)) {
                    setRole('observer');
                    setWalletConnected(true);
                    alert('Observer logged in successfully');
                    navigate('/observer');
                } else {
                    alert('Address not recognized');
                }
            } catch (error) {
                console.error("Error connecting to wallet:", error);
                setErrorMessage('Error connecting to wallet. Please try again.');
            }
        } else {
            setErrorMessage('MetaMask is not installed. Please install it to use this app: https://metamask.io/download.html');
        }
    };

    return (
        <div className="container">
            <div className="card">
                <h1>Login</h1>
                <button className="button" onClick={connectWallet}>Connect Wallet</button>
                {walletAddress && <p className="connected-info">Connected: {walletAddress}</p>}
                {errorMessage && <p className="error-message">{errorMessage}</p>}
            </div>
        </div>
    );
};

export default Login;
