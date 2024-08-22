import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Manufacturer from './Components/Manufacturer/Manufacturer';


import Login from './Components/Login/Login';
import Admin from './Components/Admin/Admin';
import User from './Components/User/User';
import Observer from './Components/Observer/Observer';

const App = () => {
  const [role, setRole] = useState('');
  const [walletConnected, setWalletConnected] = useState(false);

  const renderRoleBasedPage = () => {
    switch (role) {
      case 'admin':
        return <Admin />;
      case 'manufacturer':
        return <Manufacturer />;
      case 'user':
        return <User />;
      case 'observer':
        return <Observer />;
      default:
        return <Navigate to="/" />;
    }
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login setRole={setRole} setWalletConnected={setWalletConnected} />} />
        <Route path="/admin" element={walletConnected && role === 'admin' ? renderRoleBasedPage() : <Navigate to="/" />} />
        <Route path="/manufacturer" element={walletConnected && role === 'manufacturer' ? renderRoleBasedPage() : <Navigate to="/" />} />
        <Route path="/user" element={walletConnected && role === 'user' ? renderRoleBasedPage() : <Navigate to="/" />} />
        <Route path="/observer" element={walletConnected && role === 'observer' ? renderRoleBasedPage() : <Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
