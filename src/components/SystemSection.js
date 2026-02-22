import React, { useState, useEffect } from 'react';
import { SystemAPI } from '../utils/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const SystemSection = ({ data }) => {
  const [systemData, setSystemData] = useState({
    bob: null,
    bobby: null,
    robert: null
  });
  const [heartbeatData, setHeartbeatData] = useState({
    bob: null,
    bobby: null,
    robert: null
  });
  const [responseTimeData, setResponseTimeData] = useState({
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

        // Fetch system data, heartbeats, and response times for all agents in parallel
        const [
          bobData, bobbyData, robertData,
          bobHeartbeat, bobbyHeartbeat, robertHeartbeat,
          bobResponseTime, bobbyResponseTime, robertResponseTime
        ] = await Promise.all([
          SystemAPI.getSystemInfoTimeseries('bob', startDate, endDate, 50),
          SystemAPI.getSystemInfoTimeseries('bobby', startDate, endDate, 50),
          SystemAPI.getSystemInfoTimeseries('robert', startDate, endDate, 50),
          SystemAPI.getHeartbeat('bob'),
          SystemAPI.getHeartbeat('bobby'),
          SystemAPI.getHeartbeat('robert'),
          SystemAPI.getResponseTimeStats('bob'),
          SystemAPI.getResponseTimeStats('bobby'),
          SystemAPI.getResponseTimeStats('robert')
        ]);

        setSystemData({
          bob: bobData,
          bobby: bobbyData,
          robert: robertData
        });

        setHeartbeatData({
          bob: bobHeartbeat[0] || null,
          bobby: bobbyHeartbeat[0] || null,
          robert: robertHeartbeat[0] || null
        });

        setResponseTimeData({
          bob: bobResponseTime[0] || null,
          bobby: bobbyResponseTime[0] || null,
          robert: robertResponseTime[0] || null
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

  const formatChartData = (data) => {
    if (!data || data.length === 0) return [];
    
    return data
      .map(item => ({
        time: new Date(item.ts).toLocaleTimeString(),
        timestamp: new Date(item.ts).getTime(),
        cpu: item.cpu ? (item.cpu * 100).toFixed(1) : 0,
        memory: item.memory ? (item.memory / (1024 * 1024 * 1024)).toFixed(1) : 0, // Convert to GB
        disk: item.disk ? (item.disk / (1024 * 1024 * 1024)).toFixed(1) : 0 // Convert to GB
      }))
      .sort((a, b) => a.timestamp - b.timestamp); // Sort by time
  };

  const getLatestValue = (data, metric) => {
    if (!data || data.length === 0) return 'N/A';
    const latest = data[data.length - 1]; // Most recent after sorting
    return latest[metric];
  };

  const formatTooltip = (value, name, props) => {
    if (name === 'cpu') {
      return [`${value}%`, 'CPU Usage'];
    }
    if (name === 'memory') {
      return [`${value} GB`, 'Memory Usage'];
    }
    if (name === 'disk') {
      return [`${value} GB`, 'Disk Usage'];
    }
    return [value, name];
  };

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'No heartbeat data';
    
    const now = new Date();
    const heartbeatTime = new Date(timestamp);
    const diffMs = now - heartbeatTime;
    
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);
    
    if (diffMinutes === 0) {
      return `${diffSeconds} seconds ago`;
    } else if (diffMinutes < 60) {
      return `${diffMinutes} min ${diffSeconds} seconds ago`;
    } else {
      const diffHours = Math.floor(diffMinutes / 60);
      const remainingMinutes = diffMinutes % 60;
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ${remainingMinutes} min ago`;
    }
  };

  const getHeartbeatColor = (timestamp) => {
    if (!timestamp) return '#666'; // Gray for no data
    
    const now = new Date();
    const heartbeatTime = new Date(timestamp);
    const diffMs = now - heartbeatTime;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 15) return '#00aa00'; // Green for < 15 minutes
    if (diffMinutes < 30) return '#ffaa00'; // Yellow for < 30 minutes
    return '#ff4444'; // Red for >= 60 minutes (1 hour)
  };

  const formatResponseTime = (responseTimeMs) => {
    if (responseTimeMs === null || responseTimeMs === undefined) return 'No data';
    
    if (responseTimeMs < 1000) {
      return `${responseTimeMs} ms`;
    } else {
      return `${(responseTimeMs / 1000).toFixed(2)} s`;
    }
  };

  const renderAgentSection = (agentName, data, color) => {
    const chartData = formatChartData(data);
    const heartbeat = heartbeatData[agentName];
    const responseTime = responseTimeData[agentName];
    const heartbeatColor = getHeartbeatColor(heartbeat?.last_heartbeat_ts);
    
    return (
      <div className="content-card agent-section">
        <div className="agent-header">
          <h3 style={{ color: color }}>{agentName.charAt(0).toUpperCase() + agentName.slice(1)}</h3>
          <div className="heartbeat-status" style={{ color: heartbeatColor }}>
            Last heartbeat: {formatTimeAgo(heartbeat?.last_heartbeat_ts)}
          </div>
          <div className="response-time-status">
            Avg response time: {formatResponseTime(responseTime?.average_response_time_ms)}
          </div>
        </div>
        
        {chartData.length === 0 ? (
          <div className="no-data">No data available</div>
        ) : (
          <>
            <div className="current-metrics">
              <div className="metric-summary">
                <span>CPU: {getLatestValue(chartData, 'cpu')}%</span>
                <span>Memory: {getLatestValue(chartData, 'memory')} GB</span>
                <span>Disk: {getLatestValue(chartData, 'disk')} GB</span>
              </div>
            </div>
            
            <div className="chart-container">
              <div className="chart-section">
                <h4>CPU Usage (%)</h4>
                <ResponsiveContainer width="100%" height={120}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="time" 
                      fontSize={10}
                      interval="preserveStartEnd"
                    />
                    <YAxis 
                      fontSize={10}
                      domain={[0, 100]}
                    />
                    <Tooltip formatter={formatTooltip} />
                    <Line 
                      type="monotone" 
                      dataKey="cpu" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              <div className="chart-section">
                <h4>Memory Usage (GB)</h4>
                <ResponsiveContainer width="100%" height={120}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="time" 
                      fontSize={10}
                      interval="preserveStartEnd"
                    />
                    <YAxis fontSize={10} />
                    <Tooltip formatter={formatTooltip} />
                    <Line 
                      type="monotone" 
                      dataKey="memory" 
                      stroke="#82ca9d" 
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              <div className="chart-section">
                <h4>Disk Usage (GB)</h4>
                <ResponsiveContainer width="100%" height={120}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="time" 
                      fontSize={10}
                      interval="preserveStartEnd"
                    />
                    <YAxis fontSize={10} />
                    <Tooltip formatter={formatTooltip} />
                    <Line 
                      type="monotone" 
                      dataKey="disk" 
                      stroke="#ffc658" 
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  const getStatusColor = (data) => {
    if (!data || data.length === 0) return '#666';
    
    const chartData = formatChartData(data);
    if (chartData.length === 0) return '#666';
    
    const latest = chartData[chartData.length - 1];
    const cpuPercent = parseFloat(latest.cpu);
    
    if (cpuPercent > 90) return '#ff4444'; // Red for high usage
    if (cpuPercent > 70) return '#ffaa00'; // Orange for medium usage
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
        <div className="system-grid">
          {renderAgentSection('bob', systemData.bob, getStatusColor(systemData.bob))}
          {renderAgentSection('bobby', systemData.bobby, getStatusColor(systemData.bobby))}
          {renderAgentSection('robert', systemData.robert, getStatusColor(systemData.robert))}
        </div>
      </div>
    </section>
  );
};

export default SystemSection;