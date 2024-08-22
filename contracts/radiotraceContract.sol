// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.2 <0.9.0;


contract Radiotrace {
   // Structure to store details of a radioactive source
   struct Source {
       string id;         // Unique identifier for the source
       uint256 activity;  // Activity level of the source
       string location;   // Current location of the source
       address owner;     // Current owner of the source
       uint256 timestamp; // Timestamp of the last update to the source
   }


   // Structure to store details of a transaction involving a source
   struct Transaction {
       string sourceId;   // ID of the source involved in the transaction
       address from;      // Address of the sender
       address to;        // Address of the receiver
       uint256 timestamp; // Timestamp of the transaction
       string action;     // Action performed (e.g., "added", "transferred", "updated_location", "updated_activity")
   }


   // Mappings for various roles and source tracking
   mapping(string => Source) public sources;        // Mapping from source ID to Source details
   mapping(address => bool) public manufacturers;   // Mapping to track manufacturer addresses
   mapping(address => bool) public users;           // Mapping to track user addresses
   mapping(address => bool) public observers;       // Mapping to track observer addresses
   mapping(address => uint256) public userSourceCount; // Mapping to track the number of sources each user owns
   string[] public sourceIds;                       // Array to keep track of source IDs
   Transaction[] public transactions;               // Array to keep track of transactions


   address public admin; // Address of the adminn


   // Events for logging significant actions
   event ManufacturerAdded(address manufacturer);
   event UserAdded(address user);
   event UserRemoved(address user);
   event ObserverAdded(address observer);
   event SourceAdded(string id, address owner, uint256 timestamp);
   event SourceTransferred(string id, address from, address to, uint256 timestamp);
   event LocationUpdated(string id, string newLocation, uint256 timestamp);
   event ActivityUpdated(string id, uint256 newActivity, uint256 timestamp);


   // Constructor to set the deployer as the admin
   constructor() {
       admin = msg.sender;
   }


   // Modifier to restrict access to only manufacturers
   modifier onlyManufacturer() {
       require(manufacturers[msg.sender], "Not a manufacturer");
       _;
   }


   // Modifier to restrict access to only the admin
   modifier onlyAdmin() {
       require(msg.sender == admin, "Not an admin");
       _;
   }


   // Function to add a manufacturer, can only be called by the admin
   function addManufacturer(address _manufacturer) public onlyAdmin {
       manufacturers[_manufacturer] = true;
       emit ManufacturerAdded(_manufacturer);

   }



   // Internal function to add a user
   function addUser(address _user) public {
       users[_user] = true;
       observers[_user] = false;
       emit UserAdded(_user);
   }



   // Internal function to remove a user and add them as an observer
   function removeUser(address _user) internal {
       users[_user] = false;
       observers[_user] = true;
       emit UserRemoved(_user);
       emit ObserverAdded(_user);
   }


  //function to add observer
  function addObserver(address _observer) public onlyManufacturer {
    observers[_observer] = true;
    emit ObserverAdded(_observer);
    }

    function getAllSources() public view returns (Source[] memory) {
    uint256 totalSources = sourceIds.length;
    Source[] memory allSources = new Source[](totalSources);

    for (uint256 i = 0; i < totalSources; i++) {
        allSources[i] = sources[sourceIds[i]];
    }

    return allSources;
}


   function addSource(
        string memory _id,
        uint256 _activity,
        string memory _location
    ) public onlyManufacturer {
        require(sources[_id].owner == address(0), "Source already exists");
        uint256 timestamp = block.timestamp;
        sources[_id] = Source(_id, _activity, _location, msg.sender, timestamp);
        userSourceCount[msg.sender]++;
        sourceIds.push(_id); // Add the source ID to the array
        addUser(msg.sender);
        transactions.push(Transaction(_id, address(0), msg.sender, timestamp, "added"));
        emit SourceAdded(_id, msg.sender, timestamp);

        // Log the added source for debugging
        emit SourceAddedDebug(_id, _activity, _location, msg.sender, timestamp);
    }

    // Debug event for added source
    event SourceAddedDebug(string id, uint256 activity, string location, address owner, uint256 timestamp);





   // Function to transfer a source to a new owner
   function transferSource(
       string memory _id,
       address newOwner
   ) public {
       require(sources[_id].owner == msg.sender, "Only owner can transfer source");


       address previousOwner = sources[_id].owner;
       uint256 timestamp = block.timestamp;


       // Transfer ownership
       sources[_id].owner = newOwner;
       sources[_id].timestamp = timestamp; // Update timestamp
       userSourceCount[previousOwner]--;
       userSourceCount[newOwner]++;
       if (userSourceCount[previousOwner] == 0) {
           removeUser(previousOwner);
       }
       if (!users[newOwner]) {
           addUser(newOwner);
       }
       transactions.push(Transaction(_id, previousOwner, newOwner, timestamp, "transferred"));
       emit SourceTransferred(_id, msg.sender, newOwner, timestamp);
   }


// Function to transfer a source to a new owner
   function transferToAnotherUser(
       string memory _id,
       address newOwner
   ) public {
       require(sources[_id].owner == msg.sender, "Only owner can transfer source");


       address previousOwner = sources[_id].owner;
       uint256 timestamp = block.timestamp;
       sources[_id].owner = newOwner;
       sources[_id].timestamp = timestamp; // Update timestamp
       userSourceCount[previousOwner]--;
       userSourceCount[newOwner]++;
       if (userSourceCount[previousOwner] == 0) {
           removeUser(previousOwner);
       }
       transactions.push(Transaction(_id, previousOwner, newOwner, timestamp, "transferred"));
       emit SourceTransferred(_id, msg.sender, newOwner, timestamp);
   }

   // Function to update the location of a source
   function updateLocation(
       string memory _id,
       string memory _location
   ) public {
       require(sources[_id].owner == msg.sender, "Only owner can update location");
       uint256 timestamp = block.timestamp;
       sources[_id].location = _location;
       sources[_id].timestamp = timestamp; // Update timestamp
       transactions.push(Transaction(_id, msg.sender, msg.sender, timestamp, "updated_location"));
       emit LocationUpdated(_id, _location, timestamp);
   }


   // Function to update the activity of a source
   function updateActivity(
       string memory _id,
       uint256 _activity
   ) public {
       require(sources[_id].owner == msg.sender, "Only owner can update activity");
       uint256 timestamp = block.timestamp;
       sources[_id].activity = _activity;
       sources[_id].timestamp = timestamp; // Update timestamp
       transactions.push(Transaction(_id, msg.sender, msg.sender, timestamp, "updated_activity"));
       emit ActivityUpdated(_id, _activity, timestamp);
   }


   // Getter functions for frontend


   // Get details of a specific source by ID
   function getSourceDetails(string memory _id) public view returns (Source memory) {
       return sources[_id];
   }


   // Get the list of all source IDs
   function getAllSourceIds() public view returns (string[] memory) {
       return sourceIds;
   }


   // Get the number of sources owned by a user
   function getUserSourceCount(address _user) public view returns (uint256) {
       return userSourceCount[_user];
   }


   // Get the details of all sources owned by a user
   function getSourcesByUser(address _user) public view returns (Source[] memory) {
       uint256 count = userSourceCount[_user];
       Source[] memory userSources = new Source[](count);
       uint256 index = 0;
       for (uint256 i = 0; i < sourceIds.length; i++) {
           if (sources[sourceIds[i]].owner == _user) {
               userSources[index] = sources[sourceIds[i]];
               index++;
           }
       }
       return userSources;
   }


   // Get all transactions
   function getAllTransactions() public view returns (Transaction[] memory) {
       return transactions;
   }


   // Internal function to convert uint256 to string
   function uint256ToString(uint256 _value) internal pure returns (string memory) {
       if (_value == 0) {
           return "0";
       }
       uint256 temp = _value;
       uint256 digits;
       while (temp != 0) {
           digits++;
           temp /= 10;
       }
       bytes memory buffer = new bytes(digits);
       while (_value != 0) {
           digits -= 1;
           buffer[digits] = bytes1(uint8(48 + uint256(_value % 10)));
           _value /= 10;
       }
       return string(buffer);
   }
}


