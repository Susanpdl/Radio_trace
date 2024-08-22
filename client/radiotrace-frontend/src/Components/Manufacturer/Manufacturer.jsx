import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useNavigate } from 'react-router-dom';

import './Manufacturer.css';
import RadiotraceABI from '../../radiotraceContract.sol/Radiotrace.json';

const contractAddress = '0x73511669fd4dE447feD18BB79bAFeAC93aB7F31f';

const Manufacturer = () => {
    const [admin, setAdmin] = useState('');
    const [walletConnected, setWalletConnected] = useState(false);
    const [walletAddress, setWalletAddress] = useState('');
    const [sources, setSources] = useState([]);
    const [profile, setProfile] = useState({ address: '', balance: 0, totalSources: 0 });
    const [sourceDetails, setSourceDetails] = useState(null);
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
                const formattedBalance = ethers.utils.formatEther(balance);

                const contract = new ethers.Contract(contractAddress, RadiotraceABI.abi, signer);
                setRadiotrace(contract);

                const userSources = await contract.getSourcesByUser(address);
                const formattedSources = userSources.map(source => ({
                    id: source.id,
                    activity: ethers.utils.formatEther(source.activity),
                    location: source.location,
                    custodian: source.owner
                }));

                setSources(formattedSources);
                setProfile({ address, balance: formattedBalance, totalSources: formattedSources.length });

            } catch (error) {
                console.error("Error connecting to wallet:", error);
            }
        } else {
            alert('MetaMask is not installed. Please install it to use this app: https://metamask.io/download.html');
        }
    };

    const handleGetSourceDetails = async (event) => {
        event.preventDefault();
        const sourceId = event.target.sourceId.value;
        try {
            if (radiotrace) {
                const source = await radiotrace.getSourceDetails(sourceId);
                if (source.owner === ethers.constants.AddressZero) {
                    alert("Source not found");
                } else {
                    setSourceDetails({
                        id: source.id,
                        activity: ethers.utils.formatEther(source.activity),
                        location: source.location,
                        custodian: source.owner,
                        timestamp: new Date(source.timestamp * 1000).toLocaleString()
                    });
                    console.log('Source details:', source);
                }
            }
        } catch (error) {
            console.error("Error fetching source details:", error);
            alert("Error fetching source details. Make sure the source ID is correct and try again.");
        }
    };

    const handleTransferSource = async (event) => {
        event.preventDefault();
        const sourceId = event.target.transferSourceId.value;
        const receiverPublicKey = event.target.receiverPublicKey.value;

        try {
            if (radiotrace) {
                const tx = await radiotrace.transferSource(sourceId, receiverPublicKey);
                await tx.wait();

                const addUserTx = await radiotrace.addUser(receiverPublicKey);
                await addUserTx.wait();

                alert('Source transferred and user role granted successfully');

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

    const handleAddSource = async (event) => {
        event.preventDefault();
        const sourceId = event.target.sourceId.value;
        const activity = ethers.utils.parseUnits(event.target.activity.value, 'ether');
        const location = event.target.location.value;

        try {
            if (radiotrace) {
                const tx = await radiotrace.addSource(sourceId, activity, location);
                await tx.wait();
                alert('Source added successfully');

                setSources([...sources, {
                    id: sourceId,
                    activity: ethers.utils.formatEther(activity),
                    location,
                    custodian: walletAddress
                }]);

                setProfile((prevProfile) => ({
                    ...prevProfile,
                    totalSources: prevProfile.totalSources + 1
                }));
            }
        } catch (error) {
            console.error("Error adding source:", error);
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
                setSources(sources.map(source => source.id === sourceId ? { ...source, activity: ethers.utils.formatEther(newActivity) } : source));
            }
        } catch (error) {
            console.error("Error updating activity:", error);
        }
    };

    const handleAddObserver = async (event) => {
        event.preventDefault();
        const observerPublicKey = event.target.observerPublicKey.value;

        try {
            if (radiotrace) {
                const tx = await radiotrace.addObserver(observerPublicKey);
                await tx.wait();
                alert('Observer added successfully');
            }
        } catch (error) {
            console.error("Error adding observer:", error);
            alert("Error adding observer. Make sure the public key is correct and try again.");
        }
    };
    const logout = () => {

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

            <section className="get-sources">
                <h2>Get Sources</h2>
                <form onSubmit={handleGetSourceDetails}>
                    <label htmlFor="sourceId">Source ID:</label>
                    <input type="text" id="sourceId" name="sourceId" required />
                    <button type="submit">Get Details</button>
                </form>
                {sourceDetails && (
                    <div>
                        <p>ID: {sourceDetails.id}</p>
                        <p>Activity: {sourceDetails.activity} ETH</p>
                        <p>Location: {sourceDetails.location}</p>
                        <p>Custodian: {sourceDetails.custodian}</p>
                        <p>Timestamp: {sourceDetails.timestamp}</p>
                    </div>
                )}
            </section>

            <section className="transfer-source">
                <h2>Transfer Source</h2>
                <form onSubmit={handleTransferSource}>
                    <label htmlFor="transferSourceId">Source ID:</label>
                    <input type="text" id="transferSourceId" name="transferSourceId" required />
                    <label htmlFor="receiverPublicKey">Receiver's Public Key:</label>
                    <input type="text" id="receiverPublicKey" name="receiverPublicKey" required />
                    <button type="submit">Transfer</button>
                </form>
            </section>

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

            <section className="update-source">
                <h2>Update Source</h2>
                <table id="sourceTable">
                    <thead>
                        <tr>
                            <th>Source ID</th>
                            <th>Activity</th>
                            <th>Current Location</th>
                            <th>Custodian</th>
                            <th>Update Location</th>
                            <th>Update Activity</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sources.map((source, index) => (
                            <tr key={index}>
                                <td>{source.id}</td>
                                <td>{source.activity}</td>
                                <td>{source.location}</td>
                                <td>{source.custodian}</td>
                                <td>
                                    <form onSubmit={(event) => {
                                        event.preventDefault();
                                        handleUpdateLocation(source.id, event.target.newLocation.value);
                                    }}>
                                        <input type="text" name="newLocation" placeholder="New Location" required />
                                        <button type="submit">Update</button>
                                    </form>
                                </td>
                                <td>
                                    <form onSubmit={(event) => {
                                        event.preventDefault();
                                        handleUpdateActivity(source.id, ethers.utils.parseUnits(event.target.newActivity.value, 'ether'));
                                    }}>
                                        <input type="text" name="newActivity" placeholder="New Activity" required />
                                        <button type="submit">Update</button>
                                    </form>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            <section className="add-source">
                <h2>Add Source</h2>
                <form onSubmit={handleAddSource}>
                    <label htmlFor="sourceId">Source ID:</label>
                    <input type="text" id="sourceId" name="sourceId" required />
                    <label htmlFor="activity">Activity:</label>
                    <input type="text" id="activity" name="activity" required />
                    <label htmlFor="location">Location:</label>
                    <input type="text" id="location" name="location" required />
                    <button type="submit">Add Source</button>
                </form>
            </section>

            <section className="add-observer">
                <h2>Add Observer</h2>
                <form onSubmit={handleAddObserver}>
                    <label htmlFor="observerPublicKey">Observer's Public Key:</label>
                    <input type="text" id="observerPublicKey" name="observerPublicKey" required />
                    <button type="submit">Add Observer</button>
                </form>
            </section>
        </div>
    );
};

export default Manufacturer;