import { Navigate, useLocation } from 'react-router-dom';

const AuthMiddleware = ({ children }) => {
    const location = useLocation();
    const isAuthenticated = localStorage.getItem('token');
    const publicPaths = ['/login', '/register'];

    // Allow access to public paths
    if (publicPaths.includes(location.pathname)) {
        return isAuthenticated ? <Navigate to="/dashboard" /> : children;
    }

    // Protect other routes
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location.pathname }} />;
    }

    return children;
};

export default AuthMiddleware;