import React, { useState, useEffect, useRef } from 'react';

const WALLETS = {
  "Bob": "EzwLZJRsMxCuaWHkHPDdd2kN6HDM5hgFX7KDYecCWPEq",
  "Bobby": "7R1mkbwmrSaX9SNx6TC9FHbMUGHYzLFsJZSbPAos5aU6",
  "Robert": "98sDfznEhrhVN39qVpaUyNDUUEhUMoVgRZsej3pe44Cb"
};

const CryptoSection = ({ data }) => {
  const [walletData, setWalletData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchingRef = useRef(false);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    // Prevent duplicate calls
    if (fetchingRef.current) return;
    
    fetchingRef.current = true;
    setLoading(true);
    setError(null);
    
    try {
      // Fetch wallet data from the API
      const response = await fetch('https://api.bobtheraspberrypi.com/api/v1/wallet/balances', {
        headers: {
          'accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch wallet data');
      }
      
      const data = await response.json();
      const walletResults = {};
      
      // Map API response to UI format
      data.wallets.forEach(wallet => {
        const walletAddress = wallet.wallet_address;
        
        // Find the agent name for this wallet address
        const agentName = Object.keys(WALLETS).find(
          name => WALLETS[name] === walletAddress
        );
        
        if (!agentName) return; // Skip unknown wallets
        
        // Transform balances to holdings format
        const holdings = Object.entries(wallet.balances)
          .filter(([symbol, data]) => data.balance > 0)
          .map(([symbol, data]) => ({
            symbol,
            amount: data.balance,
            price: data.usd_price,
            value: data.usd_value
          }));
        
        // Transform transactions
        const recentTransactions = wallet.recent_transactions.map(tx => ({
          signature: `${tx.signature.slice(0, 8)}...`,
          type: tx.sol_direction === 'received' ? 'received' : 
                tx.sol_direction === 'sent' ? 'sent' : 'other',
          amount: tx.sol_change || 0,
          symbol: 'SOL',
          timestamp: new Date(tx.block_time * 1000).toISOString()
        }));
        
        walletResults[agentName] = {
          address: walletAddress,
          holdings,
          totalValue: wallet.total_usd_value,
          recentTransactions
        };
      });
      
      setWalletData(walletResults);
    } catch (err) {
      console.error('Error fetching wallet data:', err);
      setError('Failed to load wallet data');
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
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
          <div className="loading-spinner">Loading wallet data... (this may take a while)</div>
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
                  {data.holdings.length > 0 ? (
                    data.holdings.map((token, index) => (
                      <div key={index} className="holding-item">
                        <div className="holding-info">
                          <span className="holding-symbol">{token.symbol}</span>
                          <span className="holding-amount">{formatTokenAmount(token.amount, token.symbol)}</span>
                        </div>
                        <div className="holding-value">{formatCurrency(token.value)}</div>
                      </div>
                    ))
                  ) : (
                    <div className="no-holdings">No tokens found</div>
                  )}
                </div>
              </div>

              <div className="transactions-section">
                <h4>Recent Transactions</h4>
                <div className="transactions-list">
                  {data.recentTransactions.length > 0 ? (
                    data.recentTransactions.map((tx, index) => (
                      <div key={index} className="transaction-item">
                        <div className="transaction-info">
                          <span className={`transaction-type ${tx.type}`}>
                          {tx.type === 'received' ? '↓ received' : 
                           tx.type === 'sent' ? '↑ sent' : '• other'} 
                          </span>
                          <span className="transaction-amount">
                            {formatTokenAmount(tx.amount, tx.symbol)} {tx.symbol}
                          </span>
                        </div>
                        <div className="transaction-time">
                          {new Date(tx.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-transactions">No recent transactions</div>
                  )}
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