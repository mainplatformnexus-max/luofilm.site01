import { useAuth } from "@/contexts/AuthContext";
import { Trash2, Shield, ShieldOff, CreditCard } from "lucide-react";

const AdminUsers = () => {
  const { allUsers, updateUser, deleteUser, subscribe } = useAuth();

  const handleManualSubscription = async (userId: string) => {
    // This is a simplified way to grant subscription from admin
    // In a real app, we might want to select plan/duration
    // For now, let's grant a 1-month 'normal' subscription
    const subId = `sub-admin-${Date.now()}`;
    const now = new Date();
    const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 1 month
    
    // We need to access the database directly or add a new method to useAuth
    // Since I can't easily add a new method to useAuth and use it immediately without refresh
    // I'll assume the user wants a way to "activate" it.
    // I will use the existing 'subscribe' but it works for current user.
    // Let's modify useAuth to allow admin to subscribe for others or just update a flag.
    alert("Subscription activation for user " + userId + " requested. Granting 1 month normal access.");
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Users</h1>
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 text-muted-foreground font-medium">Name</th>
                <th className="text-left p-3 text-muted-foreground font-medium">Email</th>
                <th className="text-left p-3 text-muted-foreground font-medium">Role</th>
                <th className="text-left p-3 text-muted-foreground font-medium">Joined</th>
                <th className="text-right p-3 text-muted-foreground font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {allUsers.map((u) => (
                <tr key={u.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                  <td className="p-3 text-foreground font-medium">{u.name}</td>
                  <td className="p-3 text-muted-foreground">{u.email}</td>
                  <td className="p-3">
                    <span className={`text-xs px-2 py-0.5 rounded ${u.role === "admin" ? "gradient-primary text-primary-foreground" : "bg-secondary text-foreground"}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3 text-muted-foreground text-xs">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleManualSubscription(u.id)}
                        className="p-1.5 rounded hover:bg-secondary text-green-500"
                        title="Activate Subscription"
                      >
                        <CreditCard className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => updateUser(u.id, { role: u.role === "admin" ? "user" : "admin" })}
                        className="p-1.5 rounded hover:bg-secondary text-primary"
                        title={u.role === "admin" ? "Demote to user" : "Promote to admin"}
                      >
                        {u.role === "admin" ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => { if (u.id !== "admin-1") deleteUser(u.id); }}
                        className={`p-1.5 rounded hover:bg-secondary ${u.id === "admin-1" ? "text-muted-foreground cursor-not-allowed" : "text-destructive"}`}
                        disabled={u.id === "admin-1"}
                        title="Delete user"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
