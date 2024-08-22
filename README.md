Here is the link to the research report: https://docs.google.com/document/d/1w2a-ECDf7PEiPu3l-ehaHOqQuAieQpah/edit?usp=sharing&ouid=104802075831782577707&rtpof=true&sd=true 
**Getting Started**

### Prerequisites
- Node.js
- npm
- MetaMask (installed as a browser extension)
  
### Installation
1. **Clone the Repository:**

   git clone https://github.com/Susanpdl/Radio_trace.git,
   
   cd Radio_trace
   
**2. Initialize the Project:**

   Go to the src folder and initialize the project:
   
   npm init
   
**3. Install Dependencies:**

   Install the necessary npm packages:
   
   npm install

   npm start
   
**4. Start the Hardhat Node:**

   Navigate to the contracts folder and start the Hardhat local blockchain node:
   
   cd ../contracts
   
   npm install
   
   npx hardhat node

**5. Deploy the Contracts:**

   Deploy the contracts to the local Hardhat network:
   
   npx hardhat run scripts/deploy.js --network localhost


**6. Adding Hardhat Network to MetaMask**

  1. **Open MetaMask:**
      Click on the MetaMask extension in your browser.
    
  2. **Add a New Network:**
      Click on the network dropdown at the top.

  3. **Select "Add Network".**
     
      Fill in Network Details:
     
      Network Name: Hardhat Localhost
     
      New RPC URL: http://127.0.0.1:8545
     
      Chain ID: 31337
     
      Currency Symbol: GO (optional)

  5. **Switch to the Hardhat Network:**
     
      Ensure that the newly added "Hardhat Localhost" network is selected in MetaMask.

  6. **Import Admin Account into MetaMask**

      When you started the Hardhat node, a list of accounts and their private keys was displayed.
      
      Copy the private key of the admin account (Account # 19).

  7. **Import Account:**

      Open MetaMask and go to the accounts section.
      
      Click on "Import Account".
      
      Paste the copied private key.
      
      The admin account should now be visible in MetaMask, connected to the Hardhat Localhost network.



