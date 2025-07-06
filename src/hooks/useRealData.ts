import { useState, useEffect } from 'react';
import { officersAPI, queriesAPI, creditsAPI, dashboardAPI } from '../services/api';
import { Officer, QueryRequest, CreditTransaction, DashboardStats } from '../types';

export const useRealData = () => {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [queries, setQueries] = useState<QueryRequest[]>([]);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load officers
  const loadOfficers = async () => {
    try {
      const response = await officersAPI.getAll();
      setOfficers(response.officers || []);
    } catch (err) {
      console.error('Failed to load officers:', err);
      setError('Failed to load officers');
    }
  };

  // Load queries
  const loadQueries = async () => {
    try {
      const response = await queriesAPI.getAll();
      setQueries(response.queries || []);
    } catch (err) {
      console.error('Failed to load queries:', err);
      setError('Failed to load queries');
    }
  };

  // Load credit transactions
  const loadTransactions = async () => {
    try {
      const response = await creditsAPI.getTransactions();
      setTransactions(response.transactions || []);
    } catch (err) {
      console.error('Failed to load transactions:', err);
      setError('Failed to load transactions');
    }
  };

  // Load dashboard stats
  const loadDashboardStats = async () => {
    try {
      const response = await dashboardAPI.getStats();
      setDashboardStats(response.stats);
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
      setError('Failed to load dashboard stats');
    }
  };

  // Initial data load
  useEffect(() => {
    const loadAllData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        await Promise.all([
          loadOfficers(),
          loadQueries(),
          loadTransactions(),
          loadDashboardStats()
        ]);
      } catch (err) {
        console.error('Failed to load data:', err);
        setError('Failed to load application data');
      } finally {
        setIsLoading(false);
      }
    };

    loadAllData();
  }, []);

  // Create officer
  const createOfficer = async (officerData: any) => {
    try {
      const response = await officersAPI.create(officerData);
      await loadOfficers(); // Reload officers list
      return response.officer;
    } catch (err) {
      throw err;
    }
  };

  // Update officer
  const updateOfficer = async (id: string, data: any) => {
    try {
      const response = await officersAPI.update(id, data);
      await loadOfficers(); // Reload officers list
      return response.officer;
    } catch (err) {
      throw err;
    }
  };

  // Delete officer
  const deleteOfficer = async (id: string) => {
    try {
      await officersAPI.delete(id);
      await loadOfficers(); // Reload officers list
    } catch (err) {
      throw err;
    }
  };

  // Update officer status
  const updateOfficerStatus = async (id: string, status: string) => {
    try {
      await officersAPI.updateStatus(id, status);
      await loadOfficers(); // Reload officers list
    } catch (err) {
      throw err;
    }
  };

  // Add credits
  const addCredits = async (creditData: any) => {
    try {
      const response = await creditsAPI.addCredits(creditData);
      await Promise.all([loadOfficers(), loadTransactions()]); // Reload both officers and transactions
      return response;
    } catch (err) {
      throw err;
    }
  };

  return {
    officers,
    queries,
    transactions,
    dashboardStats,
    isLoading,
    error,
    // Actions
    createOfficer,
    updateOfficer,
    deleteOfficer,
    updateOfficerStatus,
    addCredits,
    // Refresh functions
    refreshOfficers: loadOfficers,
    refreshQueries: loadQueries,
    refreshTransactions: loadTransactions,
    refreshDashboardStats: loadDashboardStats,
    setOfficers,
    setQueries,
    setTransactions
  };
};