import React from 'react';
import { Redirect, useLocation } from 'react-router-dom';
import useAuth from './useAuth';
import { UserRoles } from '../enums/UserRoles';

const withAdmin = (Component: React.FC) => (props: any) => {
    const { isAuthenticated, role, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!isAuthenticated || !role) {
        return <Redirect to="/home" />;
    }

    if (role === UserRoles.Customer) {
        return <Redirect to="/home" />;
    }

    const salesForbiddenPaths = ['/admin/users'];
    if (role === UserRoles.Sales && salesForbiddenPaths.some(p => location.pathname.startsWith(p))) {
        return <Redirect to="/home" />;
    }

    return <Component {...props} />;
};

export default withAdmin;
