import AdminLogin from "./admin/AdminLogin";
import AdminDashboard from "./admin/AdminDashboard";
import { useAdmin } from "@/hooks/useAdmin";

const Admin = () => {
  const { isAdmin, logout } = useAdmin();

  if (isAdmin === null) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-black/10 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return <AdminLogin onSuccess={() => window.location.reload()} />;
  }

  return <AdminDashboard onLogout={async () => { await logout(); window.location.reload(); }} />;
};

export default Admin;
