const express = require('express');
const { ethers } = require('ethers');
const Radiotrace = require('../artifacts/contracts/radiotraceContract.sol/Radiotrace.json');
const cors = require('cors'); 


const app = express();
app.use(express.json());
app.use(cors());


const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
const adminAddress = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
const signer = provider.getSigner(adminAddress);
const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
const radiotrace = new ethers.Contract(contractAddress, Radiotrace.abi, signer);

app.post('/add-source', async (req, res) => {
    const { id, activity, location } = req.body;
    try {
        const tx = await radiotrace.addSource(id, activity, location);
        await tx.wait();
        res.send('Source added successfully');
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

app.post('/update-location', async (req, res) => {
    const { id, location } = req.body;
    try {
        const tx = await radiotrace.updateLocation(id, location);
        await tx.wait();
        res.send('Location updated successfully');
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

app.post('/update-activity', async (req, res) => {
    const { id, activity } = req.body;
    try {
        const tx = await radiotrace.updateActivity(id, activity);
        await tx.wait();
        res.send('Activity updated successfully');
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

app.post('/transfer-source', async (req, res) => {
    const { id, newOwner } = req.body;
    try {
        const tx = await radiotrace.transferSource(id, newOwner);
        await tx.wait();
        res.send('Source transferred successfully');
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

app.get('/source/:id', async (req, res) => {
    try {
        const source = await radiotrace.getSourceDetails(req.params.id);
        res.json(source);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});
