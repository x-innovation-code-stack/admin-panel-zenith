
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from '../lib/axios';
import { AuthContextType, User, LoginCredentials, RegisterData } from '../types/auth';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      fetchCurrentUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchCurrentUser = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/auth/me');
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user', error);
      localStorage.removeItem('auth_token');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const response = await axios.post('/auth/login', credentials);
      localStorage.setItem('auth_token', response.data.token);
      setUser(response.data.user);
      toast({
        title: 'Welcome back!',
        description: `You're now logged in as ${response.data.user.name}`,
      });
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed', error);
      toast({
        title: 'Login failed',
        description: 'Please check your credentials and try again',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    try {
      const response = await axios.post('/auth/register', data);
      localStorage.setItem('auth_token', response.data.token);
      setUser(response.data.user);
      toast({
        title: 'Registration successful!',
        description: 'Your account has been created.',
      });
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration failed', error);
      toast({
        title: 'Registration failed',
        description: 'Please check your information and try again',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await axios.post('/auth/logout');
      localStorage.removeItem('auth_token');
      setUser(null);
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out.',
      });
      navigate('/login');
    } catch (error) {
      console.error('Logout failed', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
