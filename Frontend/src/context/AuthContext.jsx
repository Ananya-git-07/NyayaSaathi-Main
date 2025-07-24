import React, { createContext, useState, useEffect, useCallback, useContext } from 'react'; // <-- Add useContext
import apiClient from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';
import Spinner from '../components/Spinner';

const AuthContext = createContext(null);

// --- THE FIX IS HERE (PART 1) ---
// We create and export the custom hook directly from this file.
export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const logout = useCallback(async () => {
        try { await apiClient.post('/auth/logout'); }
        catch (error) { console.error("Logout failed:", error); }
        finally { setUser(null); setIsAuthenticated(false); navigate('/login', { replace: true }); }
    }, [navigate]);
    
    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const response = await apiClient.get('/auth/current-user');
                if (response.data?.success) {
                    setUser(response.data.data);
                    setIsAuthenticated(true);
                }
            } catch (error) {
                setUser(null);
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        };
        checkAuthStatus();
    }, []);
    
    const login = async (email, password) => {
        const response = await apiClient.post('/auth/login', { email, password });
        if (response.data?.success) {
            setUser(response.data.data.user);
            setIsAuthenticated(true);
            const targetPath = response.data.data.user.role === 'admin' ? '/admin' : '/dashboard';
            navigate(targetPath, { replace: true });
        }
        return response.data;
    };
    
    const register = async (userData) => {
        const response = await apiClient.post('/auth/register', userData);
        if (response.data?.success) {
            // After successful registration, immediately log them in
            await login(userData.email, userData.password);
        }
        return response.data;
    };

    if (isLoading) {
        return ( <div className="flex h-screen w-full items-center justify-center bg-slate-900"><Spinner /></div> );
    }

    const value = { user, isAuthenticated, isLoading, login, logout, register };

    return ( <AuthContext.Provider value={value}>{children}</AuthContext.Provider> );
};

// We don't need a default export anymore, as we use named exports for everything.
// But it doesn't hurt to keep it for any other components that might still reference it.
export default AuthContext;