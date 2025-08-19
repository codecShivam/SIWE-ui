import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import { createSiweMessage } from 'viem/siwe';

interface Profile {
  name?: string;
  email?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: string;
  walletAddress: string;
  createdAt: string;
  updatedAt: string;
}

interface UserData {
  user: User;
  profile: Profile | null;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  userData: UserData | null;
  authenticate: () => Promise<void>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  fetchUserData: () => Promise<void>;
  createOrUpdateProfile: (profileData: Partial<Profile>) => Promise<void>;
  deleteProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = 'https://siwe-siwe-auth.pkf1mn.easypanel.host/api';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();

  // Check authentication status on mount and when address changes
  useEffect(() => {
    if (isConnected && address) {
      checkAuthStatus();
    } else {
      setIsAuthenticated(false);
      setUserData(null);
    }
  }, [isConnected, address]);

  const getNonce = async (): Promise<string> => {
    const response = await fetch(`${API_BASE_URL}/auth/nonce`, {
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Failed to get nonce');
    }
    
    return response.text();
  };

  const authenticate = async (): Promise<void> => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Get nonce
      const nonce = await getNonce();

      // Step 2: Create SIWE message
      const message = createSiweMessage({
        address: address as `0x${string}`,
        chainId: 1, // mainnet
        domain: 'siwe-siwe-auth.pkf1mn.easypanel.host',
        nonce: nonce,
        uri: 'https://siwe-siwe-auth.pkf1mn.easypanel.host',
        version: '1',
      });

      // Step 3: Sign message
      const signature = await signMessageAsync({ message });

      // Step 4: Verify authentication
      const authResponse = await fetch(`${API_BASE_URL}/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message, signature }),
      });

      if (!authResponse.ok) {
        throw new Error('Authentication failed');
      }

      const result = await authResponse.json();
      
      if (result.success) {
        setIsAuthenticated(true);
        await fetchUserData();
      } else {
        throw new Error('Authentication verification failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      
      setIsAuthenticated(false);
      setUserData(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Logout failed');
    } finally {
      setIsLoading(false);
    }
  };

  const checkAuthStatus = async (): Promise<void> => {
    try {
      const statusResponse = await fetch(`${API_BASE_URL}/auth/status`, {
        credentials: 'include',
      });

      if (statusResponse.ok) {
        const { authenticated } = await statusResponse.json();
        setIsAuthenticated(authenticated);
        if (authenticated) {
          await fetchUserData();
        }
      } else {
        setIsAuthenticated(false);
        setUserData(null);
      }
    } catch (err) {
      console.error('Failed to check auth status:', err);
      setIsAuthenticated(false);
      setUserData(null);
    }
  };

  const fetchUserData = async (): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/a/profile`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      } else {
        console.error('Failed to fetch user data');
        setUserData(null);
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
      setUserData(null);
    }
  };

  const createOrUpdateProfile = async (profileData: Partial<Profile>): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/a/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(profileData),
      });

      if (response.ok) {
        await fetchUserData(); // Refresh user data
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Profile update failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProfile = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/a/profile`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        await fetchUserData(); // Refresh user data
      } else {
        throw new Error('Failed to delete profile');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Profile deletion failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    error,
    userData,
    authenticate,
    logout,
    checkAuthStatus,
    fetchUserData,
    createOrUpdateProfile,
    deleteProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 