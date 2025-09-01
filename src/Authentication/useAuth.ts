import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { UserRoles } from '../enums/UserRoles';

interface AuthState {
    isAuthenticated: boolean;
    role: UserRoles | null;
    loading: boolean;
}

const useAuth = (): AuthState => {
    const [authState, setAuthState] = useState<AuthState>({
        isAuthenticated: false,
        role: null,
        loading: true,
    });

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                const decoded_payload: any = jwtDecode(token);
                setAuthState({
                    isAuthenticated: true,
                    role: decoded_payload.role as UserRoles,
                    loading: false,
                });
            } catch (error) {
                console.error('Invalid token', error);
                setAuthState({
                    isAuthenticated: false,
                    role: null,
                    loading: false,
                });
            }
        } else {
            setAuthState({
                isAuthenticated: false,
                role: null,
                loading: false,
            });
        }
    }, []);

    return authState;
};

export default useAuth;
