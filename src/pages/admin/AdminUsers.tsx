import { useAuth } from "@/contexts/AuthContext";
import { Trash2, Shield, ShieldOff, CreditCard, ChevronDown } from "lucide-react";
import { useState } from "react";
import { normalPlans, agentPlans } from "@/data/subscriptions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const AdminUsers = () => {
  const { allUsers, updateUser, deleteUser, adminSubscribeForUser } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);

  const handleManualSubscription = async (userId: string, planType: "normal" | "agent", duration: "1day" | "1week" | "1month") => {
    try {
      setLoading(userId);
      await adminSubscribeForUser(userId, planType, duration);
      alert(`Subscription activated successfully for ${duration}!`);
    } catch (error) {
      console.error("Error activating subscription:", error);
      alert("Failed to activate subscription.");
    } finally {
      setLoading(null);
    }
  };

  const allAvailablePlans = [...normalPlans, ...agentPlans];

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
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            disabled={loading === u.id}
                            className="p-1.5 rounded hover:bg-secondary text-green-500 flex items-center gap-1"
                            title="Activate Subscription"
                          >
                            <CreditCard className="w-4 h-4" />
                            <ChevronDown className="w-3 h-3" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Select Plan</div>
                          {allAvailablePlans.map((plan) => (
                            <DropdownMenuItem 
                              key={plan.id}
                              onClick={() => handleManualSubscription(u.id, plan.plan, plan.duration)}
                            >
                              <div className="flex flex-col">
                                <span className="font-medium">{plan.label} ({plan.plan})</span>
                                <span className="text-[10px] text-muted-foreground">UGX {plan.price.toLocaleString()}</span>
                              </div>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>

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
