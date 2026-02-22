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
    return (
      <div className="metrics">
        <div className="metric-item">
          <span className="metric-label">CPU:</span>
          <span className="metric-value">{latest.cpu?.toFixed(1)}%</span>
        </div>
        <div className="metric-item">
          <span className="metric-label">Memory:</span>
          <span className="metric-value">{latest.memory?.toFixed(1)}%</span>
        </div>
        <div className="metric-item">
          <span className="metric-label">Disk:</span>
          <span className="metric-value">{latest.disk?.toFixed(1)}%</span>
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
    const maxUsage = Math.max(latest.cpu || 0, latest.memory || 0, latest.disk || 0);
    
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