import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import { createSiweMessage } from 'viem/siwe';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  authenticate: () => Promise<void>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = 'http://localhost:8080/api';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();

  // Check authentication status on mount and when address changes
  useEffect(() => {
    if (isConnected && address) {
      checkAuthStatus();
    } else {
      setIsAuthenticated(false);
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
        domain: 'localhost:8080',
        nonce: nonce,
        uri: 'http://localhost:8080',
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
      } else {
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error('Failed to check auth status:', err);
      setIsAuthenticated(false);
    }
  };

  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    error,
    authenticate,
    logout,
    checkAuthStatus,
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