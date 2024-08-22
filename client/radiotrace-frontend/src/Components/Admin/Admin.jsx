import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useNavigate } from 'react-router-dom';

import RadiotraceABI from '../../radiotraceContract.sol/Radiotrace.json';
import './Admin.css';

const contractAddress = '0x73511669fd4dE447feD18BB79bAFeAC93aB7F31f';

const Admin = () => {
    const [radiotrace, setRadiotrace] = useState(null);
    const [manufacturerAddress, setManufacturerAddress] = useState('');
    const [observerAddress, setObserverAddress] = useState('');
    const navigate = useNavigate();


    const connectContract = async () => {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(contractAddress, RadiotraceABI.abi, signer);
            setRadiotrace(contract);
        } catch (error) {
            console.error("Error connecting to contract:", error);
        }
    };

    useEffect(() => {
        connectContract();
    }, []);

    const addManufacturer = async (event) => {
        event.preventDefault();
        try {
            if (radiotrace) {
                const tx = await radiotrace.addManufacturer(manufacturerAddress);
                await tx.wait();
                alert('Manufacturer added successfully');
            } else {
                console.error('Contract instance is not available');
            }
        } catch (error) {
            console.error('Error adding manufacturer:', error);
            alert('Error adding manufacturer');
        }
    };
    const logout = () => {

        // setWalletConnected(false);
        navigate('/');
    };

    return (
        <div className="admin-container">
            <h1>Admin Dashboard</h1>
            <section>
                <h2>Add Manufacturer</h2>
                <form onSubmit={addManufacturer}>
                    <div className="form-group">
                        <label htmlFor="manufacturerAddress">Manufacturer Address:</label>
                        <input
                            type="text"
                            id="manufacturerAddress"
                            value={manufacturerAddress}
                            onChange={(e) => setManufacturerAddress(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn">Add Manufacturer</button>
                </form>
            </section>
            <button className="btn" onClick={logout}>Logout</button>

        </div>
    );
};

export default Admin;
