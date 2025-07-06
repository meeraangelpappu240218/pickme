import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { officerAuthAPI } from '../services/api';

interface OfficerUser {
  id: string;
  name: string;
  mobile: string;
  email: string;
  telegram_id?: string;
  credits_remaining: number;
  total_credits: number;
  status: string;
}

interface OfficerAuthContextType {
  officer: OfficerUser | null;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const OfficerAuthContext = createContext<OfficerAuthContextType | undefined>(undefined);

export const useOfficerAuth = () => {
  const context = useContext(OfficerAuthContext);
  if (!context) {
    throw new Error('useOfficerAuth must be used within an OfficerAuthProvider');
  }
  return context;
};

interface OfficerAuthProviderProps {
  children: ReactNode;
}

export const OfficerAuthProvider: React.FC<OfficerAuthProviderProps> = ({ children }) => {
  const [officer, setOfficer] = useState<OfficerUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored officer auth token
    const token = localStorage.getItem('officer_auth_token');
    const storedOfficer = localStorage.getItem('officer_data');
    
    if (token && storedOfficer) {
      try {
        setOfficer(JSON.parse(storedOfficer));
      } catch (error) {
        localStorage.removeItem('officer_auth_token');
        localStorage.removeItem('officer_data');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (identifier: string, password: string) => {
    setIsLoading(true);
    
    try {
      const response = await officerAuthAPI.login({ identifier, password });
      
      setOfficer(response.officer);
      localStorage.setItem('officer_auth_token', 'mock-officer-jwt-token');
      localStorage.setItem('officer_data', JSON.stringify(response.officer));
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setOfficer(null);
    localStorage.removeItem('officer_auth_token');
    localStorage.removeItem('officer_data');
  };

  return (
    <OfficerAuthContext.Provider value={{ officer, login, logout, isLoading }}>
      {children}
    </OfficerAuthContext.Provider>
  );
};