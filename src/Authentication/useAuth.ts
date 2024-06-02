import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

interface AuthState {
    isAuthenticated: boolean;
    isAdmin: boolean;
    loading: boolean;
}

const useAuth = (): AuthState => {
    const [authState, setAuthState] = useState<AuthState>({
        isAuthenticated: false,
        isAdmin: false,
        loading: true,
    });

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                const decoded_payload: any = jwtDecode(token);
                setAuthState({
                    isAuthenticated: true,
                    isAdmin: decoded_payload.isAdmin,
                    loading: false,
                });
            } catch (error) {
                console.error('Invalid token', error);
                setAuthState({
                    isAuthenticated: false,
                    isAdmin: false,
                    loading: false,
                });
            }
        } else {
            setAuthState({
                isAuthenticated: false,
                isAdmin: false,
                loading: false,
            });
        }
    }, []);

    return authState;
};

export default useAuth;
