import { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
           // Verify with backend
           const response = await api.get('/auth/me'); // Using the now confirmed /me endpoint
           if (response.data && response.data.success) {
               setUser(response.data.data); // backend returns user object in data.data
           } else {
               localStorage.removeItem('token');
               localStorage.removeItem('user');
           }
        }
      } catch (error) {
        console.error("Auth check failed", error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      // Backend: new ApiResponse(statusCode, { token, user }, 'Auth successful')
      // Axios response.data = { statusCode, data: { token, user }, message, success }
      if (response.data.success) {
          const { token, user } = response.data.data;
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          setUser(user);
          return { success: true };
      } else {
          return { success: false, message: response.data.message };
      }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (userData) => {
    try {
        const response = await api.post('/auth/register', userData);
        if (response.data.success) {
            const { token, user } = response.data.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            setUser(user);
            return { success: true };
        } else {
             return { success: false, message: response.data.message };
        }
    } catch (error) {
         return { success: false, message: error.response?.data?.message || 'Registration failed' };
    }
  }

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
