import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { LibraryClient } from "./library-client";
import { CurrentUser, LoginDto } from "./dto/login.dto";

interface AuthContextValue {
    apiClient: LibraryClient;
    currentUser: CurrentUser | null;
    isLoggedIn: boolean;
    login: (data: LoginDto) => Promise<boolean>;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const apiClient = new LibraryClient();

const AuthContext = createContext<AuthContextValue>({
    apiClient,
    currentUser: null,
    isLoggedIn: false,
    login: async () => false,
    logout: () => undefined,
    refreshUser: async () => undefined,
});

export default function ApiProvider({ children }: { children: React.ReactNode }) {
    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(apiClient.isLoggedIn());

    const refreshUser = useCallback(async () => {
        if (!apiClient.isLoggedIn()) {
            setCurrentUser(null);
            setIsLoggedIn(false);
            return;
        }
        const response = await apiClient.getCurrentUser();
        if (response.success && response.data) {
            setCurrentUser(response.data);
            setIsLoggedIn(true);
        } else {
            apiClient.logout();
            setCurrentUser(null);
            setIsLoggedIn(false);
        }
    }, []);


    useEffect(() => {
        refreshUser();
    }, [refreshUser]);

    const login = useCallback(
        async (data: LoginDto) => {
            const response = await apiClient.login(data);
            if (!response.success) {
                return false;
            }
            await refreshUser();
            return true;
        },
        [refreshUser]
    );

    const logout = useCallback(() => {
        apiClient.logout();
        setCurrentUser(null);
        setIsLoggedIn(false);
    }, []);

    const value = useMemo<AuthContextValue>(
        () => ({ apiClient, currentUser, isLoggedIn, login, logout, refreshUser }),
        [currentUser, isLoggedIn, login, logout, refreshUser]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useApi(): LibraryClient {
    return useContext(AuthContext).apiClient;
}

export function useAuth(): AuthContextValue {
    return useContext(AuthContext);
}
