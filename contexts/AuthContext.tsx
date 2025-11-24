import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole, PERMISSIONS } from '../types';

interface AuthContextType {
  user: User | null;
  login: (role: UserRole, password?: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (role: UserRole, password?: string): Promise<boolean> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    if (role === UserRole.ADMIN) {
      // Simple password check simulation
      if (password === 'admin123') {
        setUser({
          id: 'admin-01',
          name: 'Command Officer',
          role: UserRole.ADMIN,
          department: 'Central Dispatch'
        });
        return true;
      }
      return false;
    } else {
      // Citizen login (Anonymous/Guest)
      setUser({
        id: `citizen-${Math.floor(Math.random() * 1000)}`,
        name: 'Concerned Citizen',
        role: UserRole.CITIZEN
      });
      return true;
    }
  };

  const logout = () => {
    setUser(null);
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    const userPermissions = PERMISSIONS[user.role] || [];
    return userPermissions.includes(permission);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, hasPermission, isAuthenticated: !!user }}>
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