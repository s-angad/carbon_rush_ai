"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";

export type UserRole = "admin" | "user";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, fullName: string, role: UserRole) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  allUsers: UserProfile[];
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => ({}),
  signUp: async () => ({}),
  signOut: async () => {},
  isAdmin: false,
  allUsers: [],
});

// ─── Local Storage Helpers ─────────────────────────────────────────────────────
const USERS_KEY = "carbonrush_users";
const SESSION_KEY = "carbonrush_session";

interface StoredUser {
  id: string;
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
  created_at: string;
}

function getStoredUsers(): StoredUser[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) {
      // Seed with default admin and user accounts
      const defaults: StoredUser[] = [
        {
          id: "admin-001",
          email: "admin@carbonrush.ai",
          password: "admin123",
          full_name: "Admin",
          role: "admin",
          created_at: "2024-01-01T00:00:00Z",
        },
        {
          id: "user-001",
          email: "user@carbonrush.ai",
          password: "user123",
          full_name: "Demo User",
          role: "user",
          created_at: "2024-01-15T00:00:00Z",
        },
      ];
      localStorage.setItem(USERS_KEY, JSON.stringify(defaults));
      return defaults;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveStoredUsers(users: StoredUser[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getSession(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(SESSION_KEY);
}

function saveSession(userId: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SESSION_KEY, userId);
}

function clearSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
}

function generateId(): string {
  return "user-" + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// ─── Supabase Helper (optional, tries Supabase first) ─────────────────────────
async function trySupabaseSignUp(
  email: string,
  password: string,
  fullName: string,
  role: UserRole
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase } = await import("@/lib/supabase");
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role } },
    });
    if (error) return { success: false, error: error.message };
    if (data.user) return { success: true };
    return { success: false, error: "Unknown error" };
  } catch {
    return { success: false, error: "Supabase unavailable" };
  }
}

async function trySupabaseSignIn(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string; user?: { id: string; email: string; full_name: string; role: UserRole } }> {
  try {
    const { supabase } = await import("@/lib/supabase");
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: error.message };
    if (data.user) {
      const meta = data.user.user_metadata || {};
      return {
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email || email,
          full_name: meta.full_name || email.split("@")[0],
          role: meta.role || "user",
        },
      };
    }
    return { success: false, error: "Unknown error" };
  } catch {
    return { success: false, error: "Supabase unavailable" };
  }
}

// ─── Auth Provider ────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);

  // Load session on mount
  useEffect(() => {
    const sessionUserId = getSession();
    if (sessionUserId) {
      const users = getStoredUsers();
      const found = users.find((u) => u.id === sessionUserId);
      if (found) {
        setUser({
          id: found.id,
          email: found.email,
          full_name: found.full_name,
          role: found.role,
          created_at: found.created_at,
        });
      }
    }
    // Load all users for admin panel
    const users = getStoredUsers();
    setAllUsers(users.map((u) => ({ id: u.id, email: u.email, full_name: u.full_name, role: u.role, created_at: u.created_at })));
    setLoading(false);
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<{ error?: string }> => {
    // First try local storage
    const users = getStoredUsers();
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

    if (found) {
      const profile: UserProfile = {
        id: found.id,
        email: found.email,
        full_name: found.full_name,
        role: found.role,
        created_at: found.created_at,
      };
      setUser(profile);
      saveSession(found.id);

      // Also try Supabase in background (don't block)
      trySupabaseSignIn(email, password).catch(() => {});

      return {};
    }

    // Try Supabase as fallback
    const result = await trySupabaseSignIn(email, password);
    if (result.success && result.user) {
      // Save to local storage too
      const newUser: StoredUser = {
        id: result.user.id,
        email: result.user.email,
        password: password,
        full_name: result.user.full_name,
        role: result.user.role,
        created_at: new Date().toISOString(),
      };
      const updated = [...users, newUser];
      saveStoredUsers(updated);
      setAllUsers(updated.map((u) => ({ id: u.id, email: u.email, full_name: u.full_name, role: u.role, created_at: u.created_at })));

      const profile: UserProfile = {
        id: newUser.id,
        email: newUser.email,
        full_name: newUser.full_name,
        role: newUser.role,
        created_at: newUser.created_at,
      };
      setUser(profile);
      saveSession(newUser.id);
      return {};
    }

    return { error: "Invalid email or password. Please check your credentials or sign up first." };
  }, []);

  const signUp = useCallback(async (
    email: string,
    password: string,
    fullName: string,
    role: UserRole
  ): Promise<{ error?: string }> => {
    const users = getStoredUsers();

    // Check if email already exists
    if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return { error: "This email is already registered. Please sign in instead." };
    }

    if (password.length < 6) {
      return { error: "Password must be at least 6 characters." };
    }

    // Create user locally
    const newUser: StoredUser = {
      id: generateId(),
      email: email.toLowerCase(),
      password: password,
      full_name: fullName,
      role: role,
      created_at: new Date().toISOString(),
    };

    const updated = [...users, newUser];
    saveStoredUsers(updated);
    setAllUsers(updated.map((u) => ({ id: u.id, email: u.email, full_name: u.full_name, role: u.role, created_at: u.created_at })));

    // Set as current user
    const profile: UserProfile = {
      id: newUser.id,
      email: newUser.email,
      full_name: newUser.full_name,
      role: newUser.role,
      created_at: newUser.created_at,
    };
    setUser(profile);
    saveSession(newUser.id);

    // Also try Supabase in background (don't block)
    trySupabaseSignUp(email, password, fullName, role).catch(() => {});

    return {};
  }, []);

  const signOut = useCallback(async () => {
    setUser(null);
    clearSession();
    // Also try Supabase signout in background
    try {
      const { supabase } = await import("@/lib/supabase");
      supabase.auth.signOut().catch(() => {});
    } catch {}
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        isAdmin: user?.role === "admin",
        allUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
