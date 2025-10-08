//AI GENERATED
import React, { createContext, useState, useContext } from 'react';
// --- FIX #1: Import types with the 'import type' keyword ---
import type { ReactNode } from 'react';
import type { TUsers } from '../types/types'; // Use your specific type name

// Define the shape of the context's value
interface AuthContextType {
    user: TUsers | null; // --- FIX #2: Use your TUsers type ---
    login: (userData: TUsers) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

// Create the context with the defined type
const AuthContext = createContext<AuthContextType | null>(null);

// Define props for the provider component
interface AuthProviderProps {
    children: ReactNode;
}

// Create the Provider component
export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<TUsers | null>(null); // --- And here ---

    const login = (userData: TUsers) => { // --- And here ---
        setUser(userData);
    };

    const logout = () => {
        // Here you would also call your API's /logout endpoint
        setUser(null);
    };

    const value = { user, login, logout, isAuthenticated: !!user };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Create a custom hook for easy and typed access to the context
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};