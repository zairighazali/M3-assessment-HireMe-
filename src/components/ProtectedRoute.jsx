import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // 1️⃣ tunggu until Firebase detect auth
  if (loading) return <p>Loading...</p>;

  // 2️⃣ pastikan user ada dan email verified
  if (!user?.firebaseUser?.emailVerified) {
    return <Navigate to="/login" replace />;
  }

  // 3️⃣ kalau semua ok, render page
  return children;
}
