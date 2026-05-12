import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";

type ProtectedRouteProps = {
    children: ReactNode;
};

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { currentUser, loading } = useUser();

    if (loading) {
        return <p style={{ padding: "2rem" }}>Loading...</p>;
    }

    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}