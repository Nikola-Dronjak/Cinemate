import React from 'react';
import { Redirect } from 'react-router-dom';
import useAuth from './useAuth';

const withAuth = (Component: React.FC) => (props: any) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Redirect to="/login" />;
    }

    return <Component {...props} />;
};

export default withAuth;
