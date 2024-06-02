import React from 'react';
import { Redirect } from 'react-router-dom';
import useAuth from './useAuth';

const withAdmin = (Component: React.FC) => (props: any) => {
    const { isAuthenticated, isAdmin, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!isAuthenticated || !isAdmin) {
        return <Redirect to="/home" />;
    }

    return <Component {...props} />;
};

export default withAdmin;
