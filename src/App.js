import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import Navigation from './components/Navigation';
import ChessSection from './components/ChessSection';
import SystemSection from './components/SystemSection';
import CryptoSection from './components/CryptoSection';
import StatusSection from './components/StatusSection';
import Footer from './components/Footer';

function App() {
  const [activeSection, setActiveSection] = useState('chess');
  const [data, setData] = useState({
    chess: {},
    system: {},
    crypto: {},
    status: {}
  });

  useEffect(() => {
    // Initialize data when component mounts
    // This would typically fetch from your backend API
    console.log('App initialized');
  }, []);

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'chess':
        return <ChessSection data={data.chess} />;
      case 'system':
        return <SystemSection data={data.system} />;
      case 'crypto':
        return <CryptoSection data={data.crypto} />;
      case 'status':
        return <StatusSection data={data.status} />;
      default:
        return <ChessSection data={data.chess} />;
    }
  };

  return (
    <div className="App">
      <Header />
      <Navigation 
        activeSection={activeSection} 
        setActiveSection={setActiveSection} 
      />
      <main className="main-content">
        {renderActiveSection()}
      </main>
      <Footer />
    </div>
  );
}

export default App;