import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Legacy AuthPortal — redirects to new login page
export default function AuthPortal() {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate("/login", { replace: true });
  }, []);

  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <p className="text-[var(--text-secondary)] text-sm">Redirecting to login...</p>
    </div>
  );
}
