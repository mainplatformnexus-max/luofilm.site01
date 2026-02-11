import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { auth, database, googleProvider } from "@/lib/firebase";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  User as FirebaseUser,
} from "firebase/auth";
import { ref, set, get, onValue, remove, update } from "firebase/database";

export interface User {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
  avatar?: string;
  createdAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  plan: "normal" | "agent";
  duration: "1day" | "1week" | "1month";
  status: "active" | "expired" | "cancelled";
  startDate: string;
  endDate: string;
}

interface AuthContextType {
  user: User | null;
  subscription: Subscription | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  hasNormalAccess: boolean;
  hasAgentAccess: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  subscribe: (plan: "normal" | "agent", duration: "1day" | "1week" | "1month") => void;
  allUsers: User[];
  allSubscriptions: Subscription[];
  updateUser: (userId: string, updates: Partial<User>) => void;
  deleteUser: (userId: string) => void;
  updateSubscription: (subId: string, updates: Partial<Subscription>) => void;
  adminSubscribeForUser: (userId: string, plan: "normal" | "agent", duration: "1day" | "1week" | "1month") => Promise<void>;
  cancelSubscription: (subId: string) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAIL = "mainplatform.nexus@gmail.com";

function getDurationMs(duration: "1day" | "1week" | "1month"): number {
  switch (duration) {
    case "1day": return 24 * 60 * 60 * 1000;
    case "1week": return 7 * 24 * 60 * 60 * 1000;
    case "1month": return 30 * 24 * 60 * 60 * 1000;
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allSubscriptions, setAllSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // Fetch user data from database
        const userRef = ref(database, `users/${firebaseUser.uid}`);
        const snapshot = await get(userRef);
        
        if (snapshot.exists()) {
          const userData = snapshot.val();
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email || "",
            name: userData.name || firebaseUser.email?.split("@")[0] || "",
            role: firebaseUser.email === ADMIN_EMAIL ? "admin" : "user",
            avatar: userData.avatar,
            createdAt: userData.createdAt,
          });
        } else {
          // Create user entry if doesn't exist
          const newUser = {
            id: firebaseUser.uid,
            email: firebaseUser.email || "",
            name: firebaseUser.email?.split("@")[0] || "",
            role: firebaseUser.email === ADMIN_EMAIL ? "admin" : "user",
            createdAt: new Date().toISOString(),
          };
          await set(userRef, newUser);
          setUser(newUser as User);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Listen to all users (admin only)
  useEffect(() => {
    if (user?.role !== "admin") return;

    const usersRef = ref(database, "users");
    const unsubscribe = onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        const usersData = snapshot.val();
        const usersList = Object.keys(usersData).map((key) => ({
          ...usersData[key],
          id: key,
        }));
        setAllUsers(usersList);
      } else {
        setAllUsers([]);
      }
    });

    return () => unsubscribe();
  }, [user?.role]);

  // Listen to all subscriptions
  useEffect(() => {
    const subsRef = ref(database, "subscriptions");
    const unsubscribe = onValue(subsRef, (snapshot) => {
      if (snapshot.exists()) {
        const subsData = snapshot.val();
        const subsList = Object.keys(subsData).map((key) => ({
          ...subsData[key],
          id: key,
        }));
        
        // Check for expired subscriptions and update
        const now = new Date();
        subsList.forEach((sub) => {
          if (sub.status === "active" && new Date(sub.endDate) < now) {
            update(ref(database, `subscriptions/${sub.id}`), { status: "expired" });
          }
        });
        
        setAllSubscriptions(subsList);
      } else {
        setAllSubscriptions([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const subscription = allSubscriptions.find(
    (s) => s.userId === user?.id && s.status === "active" && new Date(s.endDate) > new Date()
  ) ?? null;

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      
      // Check if user exists in database, if not create
      const userRef = ref(database, `users/${firebaseUser.uid}`);
      const snapshot = await get(userRef);
      
      if (!snapshot.exists()) {
        await set(userRef, {
          email: firebaseUser.email || "",
          name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "",
          role: firebaseUser.email === ADMIN_EMAIL ? "admin" : "user",
          avatar: firebaseUser.photoURL || "",
          createdAt: new Date().toISOString(),
        });
      }
      
      return true;
    } catch (error) {
      console.error("Google login error:", error);
      return false;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Save user data to database
      const userRef = ref(database, `users/${firebaseUser.uid}`);
      await set(userRef, {
        email,
        name,
        role: email === ADMIN_EMAIL ? "admin" : "user",
        createdAt: new Date().toISOString(),
      });
      
      return true;
    } catch (error) {
      console.error("Registration error:", error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const subscribe = async (plan: "normal" | "agent", duration: "1day" | "1week" | "1month") => {
    if (!user) return;
    
    const now = new Date();
    const subId = `sub-${Date.now()}`;
    const newSub: Subscription = {
      id: subId,
      userId: user.id,
      plan,
      duration,
      status: "active",
      startDate: now.toISOString(),
      endDate: new Date(now.getTime() + getDurationMs(duration)).toISOString(),
    };
    
    await set(ref(database, `subscriptions/${subId}`), newSub);
  };

  const updateUser = async (userId: string, updates: Partial<User>) => {
    await update(ref(database, `users/${userId}`), updates);
  };

  const deleteUser = async (userId: string) => {
    await remove(ref(database, `users/${userId}`));
    // Also remove user's subscriptions
    const userSubs = allSubscriptions.filter((s) => s.userId === userId);
    for (const sub of userSubs) {
      await remove(ref(database, `subscriptions/${sub.id}`));
    }
  };

  const updateSubscription = async (subId: string, updates: Partial<Subscription>) => {
    await update(ref(database, `subscriptions/${subId}`), updates);
  };

  const adminSubscribeForUser = async (userId: string, plan: "normal" | "agent", duration: "1day" | "1week" | "1month") => {
    const now = new Date();
    const subId = `sub-admin-${Date.now()}`;
    const newSub: Subscription = {
      id: subId,
      userId,
      plan,
      duration,
      status: "active",
      startDate: now.toISOString(),
      endDate: new Date(now.getTime() + getDurationMs(duration)).toISOString(),
    };
    await set(ref(database, `subscriptions/${subId}`), newSub);
  };

  const cancelSubscription = async (subId: string) => {
    await update(ref(database, `subscriptions/${subId}`), { status: "cancelled" });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        subscription,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
        hasNormalAccess: (user?.role === "admin") || (!!subscription && (subscription.plan === "normal" || subscription.plan === "agent")),
        hasAgentAccess: (user?.role === "admin") || (!!subscription && subscription.plan === "agent"),
        login,
        loginWithGoogle,
        register,
        logout,
        subscribe,
        allUsers,
        allSubscriptions,
        updateUser,
        deleteUser,
        updateSubscription,
        adminSubscribeForUser,
        cancelSubscription,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
