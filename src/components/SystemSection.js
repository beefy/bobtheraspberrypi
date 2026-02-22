import React, { useState, useEffect } from 'react';
import { SystemAPI } from '../utils/api';

const SystemSection = ({ data }) => {
  const [systemData, setSystemData] = useState({
    bob: null,
    bobby: null,
    robert: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSystemData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get last 24 hours of data
        const endDate = new Date().toISOString();
        const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

        // Fetch data for all agents in parallel
        const [bobData, bobbyData, robertData] = await Promise.all([
          SystemAPI.getSystemInfoTimeseries('bob', startDate, endDate, 10),
          SystemAPI.getSystemInfoTimeseries('bobby', startDate, endDate, 10),
          SystemAPI.getSystemInfoTimeseries('robert', startDate, endDate, 10)
        ]);

        setSystemData({
          bob: bobData,
          bobby: bobbyData,
          robert: robertData
        });
      } catch (err) {
        console.error('Failed to fetch system data:', err);
        setError('Failed to load system data');
      } finally {
        setLoading(false);
      }
    };

    fetchSystemData();
  }, []);

  const formatMetrics = (data) => {
    if (!data || data.length === 0) return 'No data available';
    
    const latest = data[0]; // Most recent data point
    
    // Format CPU as percentage (convert from decimal to percentage)
    const cpuPercent = latest.cpu ? (latest.cpu * 100).toFixed(1) : 0;
    
    // Format memory and disk as GB or MB if they're raw byte values
    const formatBytes = (bytes) => {
      if (!bytes) return '0';
      
      const gb = bytes / (1024 * 1024 * 1024);
      if (gb >= 1) {
        return `${gb.toFixed(1)} GB`;
      }
      
      const mb = bytes / (1024 * 1024);
      return `${mb.toFixed(0)} MB`;
    };
    
    return (
      <div className="metrics">
        <div className="metric-item">
          <span className="metric-label">CPU:</span>
          <span className="metric-value">{cpuPercent}%</span>
        </div>
        <div className="metric-item">
          <span className="metric-label">Memory:</span>
          <span className="metric-value">{formatBytes(latest.memory)}</span>
        </div>
        <div className="metric-item">
          <span className="metric-label">Disk:</span>
          <span className="metric-value">{formatBytes(latest.disk)}</span>
        </div>
        <div className="metric-item">
          <span className="metric-label">Last Update:</span>
          <span className="metric-value">{new Date(latest.ts).toLocaleTimeString()}</span>
        </div>
      </div>
    );
  };

  const getStatusColor = (data) => {
    if (!data || data.length === 0) return '#666';
    
    const latest = data[0];
    // Convert CPU to percentage for status calculation
    const cpuPercent = latest.cpu ? latest.cpu * 100 : 0;
    // For memory and disk, we'll assume they're usage percentages if under 100, otherwise raw values
    const memoryPercent = latest.memory < 100 ? latest.memory : (latest.memory / (8 * 1024 * 1024 * 1024)) * 100; // Assuming 8GB total
    const diskPercent = latest.disk < 100 ? latest.disk : (latest.disk / (500 * 1024 * 1024 * 1024)) * 100; // Assuming 500GB total
    
    const maxUsage = Math.max(cpuPercent, memoryPercent, diskPercent);
    
    if (maxUsage > 90) return '#ff4444'; // Red for high usage
    if (maxUsage > 70) return '#ffaa00'; // Orange for medium usage
    return '#00aa00'; // Green for low usage
  };

  if (loading) {
    return (
      <section className="content-section">
        <div className="section-header">
          <h2>⚙️ System</h2>
        </div>
        <div className="section-content">
          <div className="loading">Loading system data...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="content-section">
      <div className="section-header">
        <h2>⚙️ System</h2>
      </div>
      <div className="section-content">
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        <div className="content-grid">
          <div className="content-card">
            <h3 style={{ color: getStatusColor(systemData.bob) }}>Bob</h3>
            {formatMetrics(systemData.bob)}
          </div>
          
          <div className="content-card">
            <h3 style={{ color: getStatusColor(systemData.bobby) }}>Bobby</h3>
            {formatMetrics(systemData.bobby)}
          </div>
          
          <div className="content-card">
            <h3 style={{ color: getStatusColor(systemData.robert) }}>Robert</h3>
            {formatMetrics(systemData.robert)}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SystemSection;