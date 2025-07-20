import React, { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useAuth } from '../contexts/AuthContext';

interface ProfileFormData {
  name: string;
  email: string;
  avatar: string;
}

const WalletAuth: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { 
    isAuthenticated, 
    isLoading, 
    error, 
    userData, 
    authenticate, 
    logout,
    createOrUpdateProfile,
    deleteProfile,
    fetchUserData
  } = useAuth();
  
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [profileForm, setProfileForm] = useState<ProfileFormData>({
    name: '',
    email: '',
    avatar: ''
  });

  // Initialize form with existing profile data when editing
  const handleEditProfile = () => {
    if (userData?.profile) {
      setProfileForm({
        name: userData.profile.name || '',
        email: userData.profile.email || '',
        avatar: userData.profile.avatar || ''
      });
    }
    setShowProfileForm(true);
  };

  const handleCreateProfile = () => {
    setProfileForm({ name: '', email: '', avatar: '' });
    setShowProfileForm(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!profileForm.name.trim() && !profileForm.email.trim() && !profileForm.avatar.trim()) {
      alert('Please fill in at least one field');
      return;
    }

    // Email validation
    if (profileForm.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.email.trim())) {
      alert('Please enter a valid email address');
      return;
    }

    // URL validation for avatar
    if (profileForm.avatar.trim() && !/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg)$/i.test(profileForm.avatar.trim())) {
      alert('Please enter a valid image URL (jpg, jpeg, png, gif, webp, svg)');
      return;
    }
    
    // Only include non-empty fields
    const profileData: Partial<ProfileFormData> = {};
    if (profileForm.name.trim()) profileData.name = profileForm.name.trim();
    if (profileForm.email.trim()) profileData.email = profileForm.email.trim();
    if (profileForm.avatar.trim()) profileData.avatar = profileForm.avatar.trim();

    try {
      await createOrUpdateProfile(profileData);
      setShowProfileForm(false);
      setProfileForm({ name: '', email: '', avatar: '' });
    } catch (err) {
      console.error('Profile operation failed:', err);
    }
  };

  const handleDeleteProfile = async () => {
    if (window.confirm('Are you sure you want to delete your profile? This action cannot be undone.')) {
      try {
        await deleteProfile();
      } catch (err) {
        console.error('Profile deletion failed:', err);
      }
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

  const handleRetryFetchData = async () => {
    try {
      await fetchUserData();
    } catch (err) {
      console.error('Retry fetch failed:', err);
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
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
              <strong>Error:</strong> {error}
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
                
                {/* Debug Info */}
                {!userData && (
                  <div className="debug-info">
                    <p>Loading user data...</p>
                    <small>If this persists, check console for API errors</small>
                    <br />
                    <button 
                      onClick={handleRetryFetchData}
                      disabled={isLoading}
                      className="retry-button"
                      style={{ marginTop: '0.5rem' }}
                    >
                      {isLoading ? 'Retrying...' : '🔄 Retry Loading Data'}
                    </button>
                  </div>
                )}
                
                {userData ? (
                  <div className="user-dashboard">
                    {/* User Account Info */}
                    <div className="account-card">
                      <div className="card-header">
                        <h4>👤 Account Information</h4>
                      </div>
                      <div className="card-content">
                        <div className="info-row">
                          <span className="label">User ID:</span>
                          <span className="value">{userData.user.id}</span>
                        </div>
                        <div className="info-row">
                          <span className="label">Wallet Address:</span>
                          <span className="value monospace">{formatAddress(userData.user.walletAddress)}</span>
                          <span className="full-address">{userData.user.walletAddress}</span>
                        </div>
                        <div className="info-row">
                          <span className="label">Member Since:</span>
                          <span className="value">{new Date(userData.user.createdAt).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}</span>
                        </div>
                        <div className="info-row">
                          <span className="label">Last Updated:</span>
                          <span className="value">{new Date(userData.user.updatedAt).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}</span>
                        </div>
                      </div>
                    </div>

                    {/* Profile Info */}
                    <div className="profile-card">
                      <div className="card-header">
                        <h4>📋 Profile Information</h4>
                        <div className="header-actions">
                          {userData.profile ? (
                            <button 
                              onClick={handleEditProfile}
                              disabled={isLoading}
                              className="edit-button-small"
                              title="Edit Profile"
                            >
                              ✏️ Edit
                            </button>
                          ) : (
                            <button 
                              onClick={handleCreateProfile}
                              disabled={isLoading}
                              className="create-button-small"
                              title="Create Profile"
                            >
                              ➕ Create
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <div className="card-content">
                        {userData.profile ? (
                          <div className="profile-display">
                            <div className="profile-main">
                              {userData.profile.avatar && (
                                <div className="avatar-display">
                                  <img 
                                    src={userData.profile.avatar} 
                                    alt="Profile Avatar"
                                    className="avatar-image"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                  />
                                </div>
                              )}
                              <div className="profile-details">
                                <div className="info-row">
                                  <span className="label">Name:</span>
                                  <span className="value">{userData.profile.name || <em>Not set</em>}</span>
                                </div>
                                <div className="info-row">
                                  <span className="label">Email:</span>
                                  <span className="value">{userData.profile.email || <em>Not set</em>}</span>
                                </div>
                                {userData.profile.avatar && (
                                  <div className="info-row">
                                    <span className="label">Avatar:</span>
                                    <span className="value avatar-url">
                                      <a href={userData.profile.avatar} target="_blank" rel="noopener noreferrer">
                                        View Image
                                      </a>
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="profile-meta">
                              <div className="meta-item">
                                <span className="meta-label">Profile Created:</span>
                                <span className="meta-value">{new Date(userData.profile.createdAt).toLocaleDateString()}</span>
                              </div>
                              <div className="meta-item">
                                <span className="meta-label">Last Updated:</span>
                                <span className="meta-value">{new Date(userData.profile.updatedAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                            
                            <div className="profile-actions">
                              <button 
                                onClick={handleEditProfile}
                                disabled={isLoading}
                                className="edit-button"
                              >
                                ✏️ Edit Profile
                              </button>
                              <button 
                                onClick={handleDeleteProfile}
                                disabled={isLoading}
                                className="delete-button"
                              >
                                🗑️ Delete Profile
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="no-profile">
                            <div className="no-profile-icon">👤</div>
                            <h5>No Profile Created</h5>
                            <p>Create a profile to personalize your account with your name, email, and avatar.</p>
                            <button 
                              onClick={handleCreateProfile}
                              disabled={isLoading}
                              className="create-button-large"
                            >
                              ➕ Create Your Profile
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  // Fallback UI when userData is not available but user is authenticated
                  <div className="fallback-profile-ui">
                    <div className="profile-card">
                      <div className="card-header">
                        <h4>📋 Profile Management</h4>
                        <div className="header-actions">
                          <button 
                            onClick={handleCreateProfile}
                            disabled={isLoading}
                            className="create-button-small"
                            title="Create Profile"
                          >
                            ➕ Create
                          </button>
                        </div>
                      </div>
                      
                      <div className="card-content">
                        <div className="no-profile">
                          <div className="no-profile-icon">👤</div>
                          <h5>Manage Your Profile</h5>
                          <p>Create a profile to personalize your account with your name, email, and avatar.</p>
                          <button 
                            onClick={handleCreateProfile}
                            disabled={isLoading}
                            className="create-button-large"
                          >
                            ➕ Create Your Profile
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="logout-section">
                  <button 
                    onClick={handleLogout}
                    disabled={isLoading}
                    className="logout-button"
                  >
                    {isLoading ? 'Logging out...' : '🚪 Logout'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {!isConnected && (
        <div className="not-connected">
          <div className="not-connected-icon">🔗</div>
          <h3>Connect Your Wallet</h3>
          <p>Please connect your wallet to continue with authentication</p>
        </div>
      )}

      {/* Enhanced Profile Form Modal */}
      {showProfileForm && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowProfileForm(false)}>
          <div className="modal-content">
            <div className="modal-header">
              <h3>{userData?.profile ? '✏️ Edit Profile' : '➕ Create Profile'}</h3>
              <button 
                onClick={() => setShowProfileForm(false)}
                className="close-button"
                title="Close"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label htmlFor="name">
                  👤 Display Name
                  <span className="optional">Optional</span>
                </label>
                <input
                  type="text"
                  id="name"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  placeholder="Enter your display name"
                  maxLength={50}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">
                  📧 Email Address
                  <span className="optional">Optional</span>
                </label>
                <input
                  type="email"
                  id="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  placeholder="Enter your email address"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="avatar">
                  🖼️ Avatar Image URL
                  <span className="optional">Optional</span>
                </label>
                <input
                  type="url"
                  id="avatar"
                  value={profileForm.avatar}
                  onChange={(e) => setProfileForm({ ...profileForm, avatar: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
                {profileForm.avatar && (
                  <div className="avatar-preview">
                    <img 
                      src={profileForm.avatar} 
                      alt="Avatar Preview"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
              
              <div className="form-note">
                <p><strong>Note:</strong> You can fill in any combination of fields. All fields are optional.</p>
              </div>
              
              <div className="form-actions">
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="save-button"
                >
                  {isLoading ? '💾 Saving...' : '💾 Save Profile'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowProfileForm(false)}
                  disabled={isLoading}
                  className="cancel-button"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletAuth; 