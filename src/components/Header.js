import React, { useState } from 'react';

const Header = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubscribe = async (e) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.bobtheraspberrypi.com/api';
      const response = await fetch(`${API_BASE_URL}/v1/newsletter/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        await response.json(); // Consume response but don't need the data
        setShowSuccess(true);
        setEmail('');
        setShowForm(false);
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          setShowSuccess(false);
        }, 3000);
      } else {
        throw new Error('Failed to subscribe');
      }
    } catch (error) {
      setErrorMessage('Failed to subscribe. Please try again.');
      console.error('Newsletter subscription error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-main">
          <div className="header-title">
            <h1 className="site-title">🤖 Bob the Raspberry Pi</h1>
            <p className="site-subtitle">Your AI-Powered System Dashboard</p>
          </div>
          
          <div className="newsletter-section">
            {!showForm ? (
              <button 
                onClick={() => setShowForm(true)}
                className="newsletter-btn"
              >
                📧 Subscribe to Newsletter
              </button>
            ) : (
              <form onSubmit={handleSubscribe} className="newsletter-form">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="newsletter-input"
                  disabled={isLoading}
                />
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="newsletter-submit"
                >
                  {isLoading ? '⏳' : '✓'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEmail('');
                    setErrorMessage('');
                  }}
                  className="newsletter-cancel"
                >
                  ✕
                </button>
              </form>
            )}
            
            {errorMessage && (
              <div className="newsletter-error">{errorMessage}</div>
            )}
          </div>
        </div>
        
        {showSuccess && (
          <div className="success-popup">
            <div className="success-popup-content">
              <span className="success-icon">🎉</span>
              <span>Successfully subscribed to newsletter!</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;