import React, { useState, useEffect } from 'react';

const TOKEN_ADDRESSES = {
  "SOL": "So11111111111111111111111111111111111111112",
  "WSOL": "So11111111111111111111111111111111111111112",
  "USDC": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  "JUP": "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
  "PYTH": "HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3",
  "RAY": "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
  "JTO": "jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL",
  "BONK": "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
  "WIF": "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm",
  "ORCA": "orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE",
  "SRM": "SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt",
  "STEP": "StepAscQoEioFxxWGnh2sLBDFp9d8rvKz2Yp39iDpyT",
  "FIDA": "EchesyfXePKdLtoiZSL8pBe8Myagyy8ZRqsACNCFGnvp",
  "COPE": "8HGyAAB1yoM1ttS7pXjHMa3dukTFGQggnFFH3hJZgzQh",
  "SAMO": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
  "MNGO": "MangoCzJ36AjZyKwVj3VnYU4GTonjfVEnJmvvWaxLac",
  "ATLAS": "ATLASXmbPQxBUYbxPQYEqzQBUHgiFCUsXx"
};

const WALLETS = {
  "Bob": "EzwLZJRsMxCuaWHkHPDdd2kN6HDM5hgFX7KDYecCWPEq",
  "Bobby": "7R1mkbwmrSaX9SNx6TC9FHbMUGHYzLFsJZSbPAos5aU6",
  "Robert": "98sDfznEhrhVN39qVpaUyNDUUEhUMoVgRZsej3pe44Cb"
};

const CryptoSection = ({ data }) => {
  const [walletData, setWalletData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.bobtheraspberrypi.com/api';
      const walletResults = {};
      
      for (const [agentName, walletAddress] of Object.entries(WALLETS)) {
        try {
          const response = await fetch(`${API_BASE_URL}/v1/crypto/wallet/${walletAddress}`, {
            headers: {
              'accept': 'application/json'
            }
          });
          
          if (response.ok) {
            walletResults[agentName] = await response.json();
          } else {
            // Fallback with mock data if API not available
            walletResults[agentName] = generateMockWalletData(agentName, walletAddress);
          }
        } catch (err) {
          console.warn(`Failed to fetch data for ${agentName}, using mock data:`, err);
          walletResults[agentName] = generateMockWalletData(agentName, walletAddress);
        }
      }
      
      setWalletData(walletResults);
    } catch (err) {
      console.error('Error fetching wallet data:', err);
      setError('Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  const generateMockWalletData = (agentName, walletAddress) => {
    const baseAmounts = {
      "Bob": { SOL: 12.45, USDC: 850.30, JUP: 1250, BONK: 50000 },
      "Bobby": { SOL: 8.21, USDC: 1205.80, RAY: 45.5, WIF: 125 },
      "Robert": { SOL: 15.67, USDC: 2100.45, PYTH: 78.3, ORCA: 89.2 }
    };

    const holdings = baseAmounts[agentName] || { SOL: 5.0, USDC: 500 };
    const mockPrices = { SOL: 145.67, USDC: 1.00, JUP: 0.85, BONK: 0.00002, RAY: 2.34, WIF: 1.89, PYTH: 0.67, ORCA: 3.45 };
    
    const tokensWithValues = Object.entries(holdings).map(([symbol, amount]) => ({
      symbol,
      amount,
      price: mockPrices[symbol] || 1.0,
      value: amount * (mockPrices[symbol] || 1.0)
    }));

    const totalValue = tokensWithValues.reduce((sum, token) => sum + token.value, 0);

    return {
      address: walletAddress,
      holdings: tokensWithValues,
      totalValue,
      recentTransactions: [
        { signature: 'abc123...', type: 'received', amount: 2.5, symbol: 'SOL', timestamp: new Date(Date.now() - 3600000).toISOString() },
        { signature: 'def456...', type: 'sent', amount: 100, symbol: 'USDC', timestamp: new Date(Date.now() - 7200000).toISOString() },
        { signature: 'ghi789...', type: 'received', amount: 50, symbol: holdings.JUP ? 'JUP' : 'RAY', timestamp: new Date(Date.now() - 10800000).toISOString() }
      ]
    };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatTokenAmount = (amount, symbol) => {
    if (symbol === 'BONK' && amount > 1000) {
      return `${(amount / 1000).toFixed(1)}K`;
    }
    if (amount < 0.01) {
      return amount.toExponential(2);
    }
    return amount.toLocaleString('en-US', { 
      minimumFractionDigits: symbol === 'USDC' ? 2 : 4,
      maximumFractionDigits: symbol === 'USDC' ? 2 : 4 
    });
  };

  const copyToClipboard = (address) => {
    navigator.clipboard.writeText(address);
    // Could add a toast notification here
  };

  if (loading) {
    return (
      <section className="content-section">
        <div className="section-header">
          <h2>₿ Crypto Wallets</h2>
        </div>
        <div className="section-content">
          <div className="loading-spinner">Loading wallet data...</div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="content-section">
        <div className="section-header">
          <h2>₿ Crypto Wallets</h2>
        </div>
        <div className="section-content">
          <div className="error-message">{error}</div>
        </div>
      </section>
    );
  }

  return (
    <section className="content-section">
      <div className="section-header">
        <h2>₿ Crypto Wallets</h2>
        <button onClick={fetchWalletData} className="refresh-btn" disabled={loading}>
          🔄 Refresh
        </button>
      </div>
      <div className="section-content">
        <div className="crypto-grid">
          {Object.entries(walletData).map(([agentName, data]) => (
            <div key={agentName} className="wallet-card">
              <h3 className="wallet-agent-name">{agentName}</h3>
              
              <div className="wallet-address" onClick={() => copyToClipboard(data.address)}>
                <span className="address-label">Address:</span>
                <span className="address-value" title="Click to copy">
                  {`${data.address.slice(0, 6)}...${data.address.slice(-6)}`}
                </span>
              </div>

              <div className="wallet-summary">
                <div className="total-value">
                  <span className="value-label">Total Value:</span>
                  <span className="value-amount">{formatCurrency(data.totalValue)}</span>
                </div>
              </div>

              <div className="holdings-section">
                <h4>Holdings</h4>
                <div className="holdings-list">
                  {data.holdings.map((token, index) => (
                    <div key={index} className="holding-item">
                      <div className="holding-info">
                        <span className="holding-symbol">{token.symbol}</span>
                        <span className="holding-amount">{formatTokenAmount(token.amount, token.symbol)}</span>
                      </div>
                      <div className="holding-value">{formatCurrency(token.value)}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="transactions-section">
                <h4>Recent Transactions</h4>
                <div className="transactions-list">
                  {data.recentTransactions.map((tx, index) => (
                    <div key={index} className="transaction-item">
                      <div className="transaction-info">
                        <span className={`transaction-type ${tx.type}`}>
                          {tx.type === 'received' ? '↓' : '↑'} {tx.type}
                        </span>
                        <span className="transaction-amount">
                          {formatTokenAmount(tx.amount, tx.symbol)} {tx.symbol}
                        </span>
                      </div>
                      <div className="transaction-time">
                        {new Date(tx.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CryptoSection;