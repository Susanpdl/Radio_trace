import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useNavigate } from 'react-router-dom';

import './User.css';
import RadiotraceABI from '../../radiotraceContract.sol/Radiotrace.json';

const contractAddress = '0x73511669fd4dE447feD18BB79bAFeAC93aB7F31f';

const User = () => {
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
                setProfile((prevProfile) => ({
                    ...prevProfile,
                    address,
                    balance: ethers.utils.formatEther(balance)
                }));

                const contract = new ethers.Contract(contractAddress, RadiotraceABI.abi, signer);
                setRadiotrace(contract);

                // Fetch sources for the user
                const userSources = await contract.getSourcesByUser(address);
                const formattedSources = userSources.map(source => ({
                    id: source.id,
                    activity: ethers.utils.formatEther(source.activity),
                    location: source.location,
                    custodian: source.owner
                }));

                setSources(formattedSources);
                setProfile((prevProfile) => ({
                    ...prevProfile,
                    totalSources: formattedSources.length
                }));

            } catch (error) {
                console.error("Error connecting to wallet:", error);
            }
        } else {
            alert('MetaMask is not installed. Please install it to use this app: https://metamask.io/download.html');
        }
    };

    const handleUpdateLocation = async (sourceId, newLocation) => {
        try {
            if (radiotrace) {
                const tx = await radiotrace.updateLocation(sourceId, newLocation);
                await tx.wait();
                alert('Location updated successfully');
                setSources(sources.map(source => source.id === sourceId ? { ...source, location: newLocation } : source));
            }
        } catch (error) {
            console.error("Error updating location:", error);
        }
    };

    const handleUpdateActivity = async (sourceId, newActivity) => {
        try {
            if (radiotrace) {
                const tx = await radiotrace.updateActivity(sourceId, newActivity);
                await tx.wait();
                alert('Activity updated successfully');
                setSources(sources.map(source => source.id === sourceId ? { ...source, activity: newActivity } : source));
            }
        } catch (error) {
            console.error("Error updating activity:", error);
        }
    };

    const handleTransferSource = async (event) => {
        event.preventDefault();
        const sourceId = event.target.transferSourceId.value;
        const receiverPublicKey = event.target.receiverPublicKey.value;

        try {
            if (radiotrace) {
                // Transfer the source
                const tx = await radiotrace.transferToAnotherUser(sourceId, receiverPublicKey);
                await tx.wait();
                alert('Source transferred and user role granted successfully');
                // Update the state
                const newSources = await radiotrace.getSourcesByUser(walletAddress);
                const formattedSources = newSources.map(source => ({
                    id: source.id,
                    activity: ethers.utils.formatEther(source.activity),
                    location: source.location,
                    custodian: source.owner
                }));

                setSources(formattedSources);
                setProfile((prevProfile) => ({
                    ...prevProfile,
                    totalSources: formattedSources.length
                }));
            }
        } catch (error) {
            console.error("Error transferring source:", error);
        }
    };
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
                        <p>Total Sources Owned: {profile.totalSources}</p>
                    </div>
                </div>
            </section>

            <section className="view-sources">
                <h2>Your Sources</h2>
                <table id="sourceTable">
                    <thead>
                        <tr>
                            <th>Source ID</th>
                            <th>Activity</th>
                            <th>Current Location</th>
                            <th>Custodian (Public Key)</th>
                            <th>Edit</th>
                            <th>Update Location</th>
                            <th>Update Activity</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sources.map(source => (
                            <tr key={source.id}>
                                <td>{source.id}</td>
                                <td>{source.activity}</td>
                                <td>{source.location}</td>
                                <td>{source.custodian}</td>
                                <td><button>Edit</button></td>
                                <td><button onClick={() => handleUpdateLocation(source.id, prompt('New Location'))}>Update Location</button></td>
                                <td><button onClick={() => handleUpdateActivity(source.id, prompt('New Activity'))}>Update Activity</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            <section className="transfer-source">
                <h2>Transfer Source</h2>
                <form onSubmit={handleTransferSource}>
                    <label htmlFor="transferSourceId">Source ID:</label>
                    <input type="text" id="transferSourceId" name="transferSourceId" required />
                    <label htmlFor="receiverPublicKey">Receiver's Public Key:</label>
                    <input type="text" id="receiverPublicKey" name="receiverPublicKey" required />
                    <button type="submit">Transfer Source</button>
                </form>
            </section>
        </div>
    );
};

export default User;