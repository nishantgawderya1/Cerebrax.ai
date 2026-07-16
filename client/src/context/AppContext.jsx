import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const AppContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const { getToken, isSignedIn } = useAuth();
  // { plan, free_usage, limit, remaining } once loaded
  const [usage, setUsage] = useState(null);

  const fetchUsage = useCallback(async () => {
    try {
      if (!isSignedIn) return;
      const token = await getToken();
      if (!token) return;

      const { data } = await axios.get('/api/user/usage', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setUsage(data);
      }
    } catch (error) {
      // The usage meter is non-critical; fail quietly.
      console.error('Failed to fetch usage:', error);
    }
  }, [getToken, isSignedIn]);

  useEffect(() => {
    if (isSignedIn) fetchUsage();
  }, [isSignedIn, fetchUsage]);

  return (
    <AppContext.Provider value={{ usage, fetchUsage }}>
      {children}
    </AppContext.Provider>
  );
};
