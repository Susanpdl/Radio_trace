import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useNavigate } from 'react-router-dom';
import './Observer.css';
import RadiotraceABI from '../../radiotraceContract.sol/Radiotrace.json';

const contractAddress = '0x73511669fd4dE447feD18BB79bAFeAC93aB7F31f';

const Observer = () => {
    const [walletConnected, setWalletConnected] = useState(false);
    const [walletAddress, setWalletAddress] = useState('');
    const [sources, setSources] = useState([]);
    const [profile, setProfile] = useState({ address: '', balance: 0, totalSources: 0 });
    const [radiotrace, setRadiotrace] = useState(null);
    const navigate = useNavigate();


    const connectWallet = async () => {
        if (window.ethereum) {
            try {
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();
                const address = await signer.getAddress();
                setWalletAddress(address);
                setWalletConnected(true);

                const balance = await provider.getBalance(address);
                setProfile({ address, balance: ethers.utils.formatEther(balance), totalSources: sources.length });

                const contract = new ethers.Contract(contractAddress, RadiotraceABI.abi, signer);
                setRadiotrace(contract);

                // Fetch all sources
                const allSources = await contract.getAllSources();
                setSources(allSources.map(source => ({
                    id: source.id.toString(), // Ensure id is a string
                    activity: ethers.utils.formatEther(source.activity), // Convert activity to string
                    location: source.location,
                    custodian: source.owner
                })));

            } catch (error) {
                console.error("Error connecting to wallet:", error);
            }
        } else {
            alert('MetaMask is not installed. Please install it to use this app: https://metamask.io/download.html');
        }
    };

    useEffect(() => {
        if (radiotrace) {
            // Fetch sources again if the contract instance changes
            const fetchSources = async () => {
                try {
                    const allSources = await radiotrace.getAllSources();
                    setSources(allSources.map(source => ({
                        id: source.id.toString(), // Ensure id is a string
                        activity: ethers.utils.formatEther(source.activity), // Convert activity to string
                        location: source.location,
                        custodian: source.owner
                    })));
                } catch (error) {
                    console.error("Error fetching sources:", error);
                }
            };

            fetchSources();
        }
    }, [radiotrace]);
    const logout = () => {
        // setRole('');
        setWalletConnected(false);
        setWalletAddress('');
        navigate('/');
    };

    return (
        <div>
            <header>
                <div className="logo">
                    <h1>Radiotrace</h1>
                </div>
                <nav>
                    <ul>
                        <li><a href="#">Home</a></li>
                        <li><a href="#">Services</a></li>
                        <li><a href="#">Contact us</a></li>
                        <button className="btn" onClick={logout}>Logout</button>

                    </ul>
                </nav>
                <div className="connect-wallet">
                    {walletConnected ? (
                        <span>Connected: {walletAddress}</span>
                    ) : (
                        <button onClick={connectWallet}>Connect Wallet</button>
                    )}
                </div>
            </header>

            <section className="profile">
                <h2>Profile</h2>
                <div className="profile-details">
                    <div className="logo">
                        {/* Logo display */}
                    </div>
                    <div className="address">
                        <p>Address: {profile.address}</p>
                    </div>
                    <div className="balance">
                        <p>Balance: {profile.balance} ETH</p>
                    </div>
                    <div className="total-sources">
                        <p>Total Sources Observed: {sources.length}</p>
                    </div>
                </div>
            </section>

            <section className="view-sources">
                <h2>Observed Sources</h2>
                <table id="sourceTable">
                    <thead>
                        <tr>
                            <th>Source ID</th>
                            <th>Activity</th>
                            <th>Current Location</th>
                            <th>Custodian (Public Key)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sources.map(source => (
                            <tr key={source.id}>
                                <td>{source.id}</td>
                                <td>{source.activity} ETH</td>
                                <td>{source.location}</td>
                                <td>{source.custodian}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>


        </div>
    );
};

export default Observer;
