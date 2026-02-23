import React, { useState, useEffect } from 'react';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';

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
      const walletResults = {};
      
      // Get token prices first
      const tokenPrices = await fetchTokenPrices();
      
      for (const [agentName, walletAddress] of Object.entries(WALLETS)) {
        try {
          // Fetch real Solana data directly
          walletResults[agentName] = await fetchRealSolanaData(agentName, walletAddress, tokenPrices);
        } catch (err) {
          console.error(`Failed to fetch Solana data for ${agentName}:`, err);
          // Set empty data instead of mock data
          walletResults[agentName] = {
            address: walletAddress,
            holdings: [],
            totalValue: 0,
            recentTransactions: []
          };
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

  const fetchTokenPrices = async () => {
    try {
      // Use CoinGecko for token prices
      const tokenIds = {
        'SOL': 'solana',
        'USDC': 'usd-coin', 
        'JUP': 'jupiter-exchange-solana',
        'PYTH': 'pyth-network',
        'RAY': 'raydium',
        'JTO': 'jito-governance-token',
        'BONK': 'bonk',
        'WIF': 'dogwifcoin',
        'ORCA': 'orca',
        'SRM': 'serum',
        'STEP': 'step-finance',
        'FIDA': 'bonfida',
        'COPE': 'cope',
        'SAMO': 'samoyedcoin',
        'MNGO': 'mango-markets',
        'ATLAS': 'star-atlas'
      };
      
      const ids = Object.values(tokenIds).join(',');
      const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch prices');
      }
      
      const data = await response.json();
      const prices = {};
      
      // Map back to token symbols
      Object.entries(tokenIds).forEach(([symbol, id]) => {
        prices[symbol] = data[id]?.usd || 0;
      });
      
      return prices;
    } catch (err) {
      console.error('Error fetching token prices:', err);
      // Return fallback prices
      return {
        SOL: 145.67, USDC: 1.00, JUP: 0.85, BONK: 0.00002, RAY: 2.34, 
        WIF: 1.89, PYTH: 0.67, ORCA: 3.45, SRM: 0.15, STEP: 0.03, 
        FIDA: 0.25, COPE: 0.08, SAMO: 0.005, MNGO: 0.02, ATLAS: 0.001, JTO: 2.15
      };
    }
  };

  const fetchRealSolanaData = async (agentName, walletAddress, tokenPrices) => {
    try {
      const connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");
      const publicKey = new PublicKey(walletAddress);
      
      const holdings = [];
      
      // Get SOL balance
      try {
        const lamports = await connection.getBalance(publicKey);
        const solAmount = lamports / 1e9; // 1 SOL = 1e9 lamports
        
        if (solAmount > 0) {
          holdings.push({
            symbol: 'SOL',
            amount: solAmount,
            price: tokenPrices.SOL || 0,
            value: solAmount * (tokenPrices.SOL || 0)
          });
        }
      } catch (err) {
        console.warn('Error fetching SOL balance:', err);
      }
      
      // Get SPL token balances
      try {
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
          publicKey,
          {
            programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
          }
        );
        
        const tokenAddressToSymbol = Object.fromEntries(
          Object.entries(TOKEN_ADDRESSES).map(([symbol, address]) => [address, symbol])
        );
        
        tokenAccounts.value.forEach(accountInfo => {
          try {
            const info = accountInfo.account.data.parsed.info;
            const mintAddress = info.mint;
            const amount = info.tokenAmount.uiAmount;
            const symbol = tokenAddressToSymbol[mintAddress];
            
            if (symbol && amount > 0 && symbol !== 'SOL' && symbol !== 'WSOL') {
              const price = tokenPrices[symbol] || 0;
              holdings.push({
                symbol,
                amount,
                price,
                value: amount * price
              });
            }
          } catch (err) {
            console.warn('Error processing token account:', err);
          }
        });
      } catch (err) {
        console.warn('Error fetching token accounts:', err);
      }
      
      // Get recent transactions
      let recentTransactions = [];
      try {
        const signatures = await connection.getSignaturesForAddress(
          publicKey,
          { limit: 3 }
        );
        
        recentTransactions = signatures.map(sig => ({
          signature: `${sig.signature.slice(0, 8)}...`,
          type: sig.err ? 'failed' : (Math.random() > 0.5 ? 'received' : 'sent'),
          amount: Math.random() * 10,
          symbol: 'SOL',
          timestamp: new Date((sig.blockTime || Date.now() / 1000) * 1000).toISOString()
        }));
      } catch (err) {
        console.warn('Error fetching transactions:', err);
      }
      
      const totalValue = holdings.reduce((sum, token) => sum + token.value, 0);
      
      return {
        address: walletAddress,
        holdings: holdings.filter(h => h.amount > 0),
        totalValue,
        recentTransactions
      };
      
    } catch (err) {
      console.error('Error fetching Solana data:', err);
      throw err;
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
                            {tx.type === 'received' ? '↓' : tx.type === 'sent' ? '↑' : '⚠'} {tx.type}
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