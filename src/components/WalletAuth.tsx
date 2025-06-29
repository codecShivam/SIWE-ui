import React, { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useAuth } from '../contexts/AuthContext';

interface UserProfile {
  address: string;
  createdAt: string;
}

const WalletAuth: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { isAuthenticated, isLoading, error, authenticate, logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Fetch user profile when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
    } else {
      setProfile(null);
    }
  }, [isAuthenticated]);

  const fetchProfile = async () => {
    setProfileLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/a/profile', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const userData = await response.json();
        setProfile(userData);
      } else {
        console.error('Failed to fetch profile');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleAuthenticate = async () => {
    try {
      await authenticate();
    } catch (err) {
      console.error('Authentication failed:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <div className="wallet-auth">
      <div className="wallet-section">
        <h2>Wallet Connection</h2>
        <ConnectButton />
      </div>

      {isConnected && address && (
        <div className="auth-section">
          <h3>Authentication</h3>
          
          {error && (
            <div className="error-message">
              Error: {error}
            </div>
          )}

          {!isAuthenticated ? (
            <div>
              <p>Wallet connected but not authenticated</p>
              <button 
                onClick={handleAuthenticate}
                disabled={isLoading}
                className="auth-button"
              >
                {isLoading ? 'Authenticating...' : 'Sign In with Ethereum'}
              </button>
            </div>
          ) : (
            <div>
              <div className="auth-status">
                <h3>✅ Authenticated</h3>
                <p>Address: {address}</p>
                
                {profileLoading ? (
                  <p>Loading profile...</p>
                ) : profile ? (
                  <div className="profile-info">
                    <h4>Profile Information:</h4>
                    <p><strong>Address:</strong> {profile.address}</p>
                    <p><strong>Member since:</strong> {new Date(profile.createdAt).toLocaleDateString()}</p>
                  </div>
                ) : null}
                
                <button 
                  onClick={handleLogout}
                  disabled={isLoading}
                  className="logout-button"
                >
                  {isLoading ? 'Logging out...' : 'Logout'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {!isConnected && (
        <div className="not-connected">
          <p>Please connect your wallet to continue</p>
        </div>
      )}
    </div>
  );
};

export default WalletAuth; 