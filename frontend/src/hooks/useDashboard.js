import { useState, useEffect } from 'react';
import { getStats } from '../services/api';

export const useDashboard = () => {
  const [stats, setStats] = useState({
    total_roots: 0,
    total_patterns: 0,
    avl_height: 0,
    hash_load_factor: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await getStats();
      setStats(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 2000); // Refresh every 2 seconds
    return () => clearInterval(interval);
  }, []);

  return { stats, loading, error, refetch: fetchStats };
};
