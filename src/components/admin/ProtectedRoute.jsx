import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        className="flex items-center justify-center min-h-screen bg-surface"
        role="status"
        aria-live="polite"
      >
        <div className="flex flex-col items-center gap-4">
          <span className="w-10 h-10 rounded-full border-2 border-primary/40 border-t-primary animate-spin" />
          <span className="text-sm text-ink-muted">অ্যাডমিন যাচাই করা হচ্ছে...</span>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
