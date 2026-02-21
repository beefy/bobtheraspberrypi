import React from 'react';

const Navigation = ({ activeSection, setActiveSection }) => {
  const sections = [
    { id: 'chess', label: 'Chess', icon: '♟️' },
    { id: 'system', label: 'System', icon: '⚙️' },
    { id: 'crypto', label: 'Crypto', icon: '₿' },
    { id: 'status', label: 'Status', icon: '📊' }
  ];

  return (
    <nav className="navigation">
      <div className="nav-container">
        {sections.map(section => (
          <button
            key={section.id}
            className={`nav-button ${activeSection === section.id ? 'active' : ''}`}
            onClick={() => setActiveSection(section.id)}
          >
            <span className="nav-icon">{section.icon}</span>
            <span className="nav-label">{section.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;