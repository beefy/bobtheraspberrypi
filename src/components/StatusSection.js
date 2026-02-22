import React, { useState, useEffect } from 'react';
import { SystemAPI } from '../utils/api';

const StatusSection = ({ data }) => {
  const [statusUpdates, setStatusUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStatusUpdates = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch status updates for all agents (empty agent_name gets all)
        const updates = await SystemAPI.getStatusUpdates('', 25);
        
        // Sort by timestamp descending (most recent first)
        const sortedUpdates = updates.sort((a, b) => 
          new Date(b.timestamp) - new Date(a.timestamp)
        );
        
        setStatusUpdates(sortedUpdates);
      } catch (err) {
        console.error('Failed to fetch status updates:', err);
        setError('Failed to load status updates');
      } finally {
        setLoading(false);
      }
    };

    fetchStatusUpdates();
  }, []);

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    
    if (diffMinutes < 1) {
      return 'Just now';
    } else if (diffMinutes < 60) {
      return `${diffMinutes} min ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }
  };

  const getAgentColor = (agentName) => {
    switch(agentName?.toLowerCase()) {
      case 'bob': return '#3182ce';
      case 'bobby': return '#38a169';
      case 'robert': return '#d69e2e';
      default: return '#4a5568';
    }
  };

  if (loading) {
    return (
      <section className="content-section">
        <div className="section-header">
          <h2>📊 Status</h2>
        </div>
        <div className="section-content">
          <div className="loading">Loading status updates...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="content-section">
      <div className="section-header">
        <h2>📊 Status</h2>
      </div>
      <div className="section-content">
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <div className="status-updates-container">
          <h3>Recent Status Updates</h3>
          <div className="status-updates-scroll">
            {statusUpdates.length === 0 ? (
              <div className="no-data">No status updates available</div>
            ) : (
              statusUpdates.map((update) => (
                <div key={update._id} className="status-update-item">
                  <div className="status-header">
                    <span 
                      className="agent-badge" 
                      style={{ backgroundColor: getAgentColor(update.agent_name) }}
                    >
                      {update.agent_name?.charAt(0).toUpperCase() + update.agent_name?.slice(1)}
                    </span>
                    <span className="status-timestamp">
                      {formatTimestamp(update.timestamp)}
                    </span>
                  </div>
                  <div className="status-text">
                    {update.update_text}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatusSection;