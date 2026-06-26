  "use client";

  import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";

  export type UserRole = "buyer" | "grower" | "ngo_verifier";

  export interface UserProfile {
    id: string;
    email: string;
    full_name: string;
    role: UserRole;
    organization_name?: string;
    avatar_url?: string;
    carbon_balance: number;
    fiat_balance: number;
    created_at: string;
  }

  interface AuthContextType {
    user: UserProfile | null;
    loading: boolean;
    dbMissing: boolean;
    signIn: (email: string, password: string) => Promise<{ error?: string }>;
    signUp: (email: string, password: string, fullName: string, role: UserRole) => Promise<{ error?: string }>;
    signOut: () => Promise<void>;
    updateRole: (role: UserRole) => Promise<void>;
    reloadBalance: () => Promise<void>;
    isBuyer: boolean;
    isGrower: boolean;
    isNgoVerifier: boolean;
    allUsers: UserProfile[];
  }

  const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    dbMissing: false,
    signIn: async () => ({}),
    signUp: async () => ({}),
    signOut: async () => {},
    updateRole: async () => {},
    reloadBalance: async () => {},
    isBuyer: false,
    isGrower: false,
    isNgoVerifier: false,
    allUsers: [],
  });

  async function trySupabaseSignUp(
    email: string,
    password: string,
    fullName: string,
    role: UserRole
  ) {
    const { supabase } = await import("@/lib/supabase");

    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
        },
      },
    });
  }
  async function trySupabaseSignIn(
    email: string,
    password: string
  ) {
    const { supabase } = await import("@/lib/supabase");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { data, error };
  }
  // ─── Auth Provider ────────────────────────────────────────────────────────────
  export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [dbMissing, setDbMissing] = useState(false);
    
    const fetchProfile = async (uid: string) => {
      const { supabase } = await import("@/lib/supabase");
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", uid)
          .single();
        if (error) {
          if (error.code === "PGRST205") {
            setDbMissing(true);
          }
          throw error;
        }
        if (data) return data;
      } catch (e) {
        console.warn("Could not fetch profile:", e);
      }
      return null;
    };

    const reloadBalance = useCallback(async () => {
      if (!user) return;
      const profile = await fetchProfile(user.id);
      if (profile) {
        setUser(prev => prev ? {
          ...prev,
          carbon_balance: profile.carbon_balance || 0,
          fiat_balance: profile.fiat_balance || 0,
          organization_name: profile.organization_name || "",
          full_name: profile.full_name || prev.full_name
        } : null);
      }
    }, [user]);

    useEffect(() => {
      let subscription: any;

      const checkDb = async () => {
        const { supabase } = await import("@/lib/supabase");
        try {
          // First check if the profiles table is queryable (meaning DB is already initialized)
          const { error } = await supabase.from("profiles").select("id").limit(1);
          
          if (error && error.code === "PGRST205") {
            console.log("Database schema missing. Attempting runtime auto-initialization...");
            setDbMissing(true);
            
            // Auto-run the database migrations at runtime
            const res = await fetch("/api/db-init");
            const resData = await res.json();
            
            if (resData.success) {
              const { error: retryError } = await supabase.from("profiles").select("id").limit(1);
              if (!retryError) {
                setDbMissing(false);
                console.log("Database schema initialized successfully!");
              }
            }
          } else {
            setDbMissing(false);
          }
        } catch (e) {
          console.warn("DB check failed", e);
        }
      };

      const getCurrentUser = async () => {
        const { supabase } = await import("@/lib/supabase");

        await checkDb();

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          const meta = session.user.user_metadata || {};
          const profile = await fetchProfile(session.user.id);

          setUser({
            id: session.user.id,
            email: session.user.email || "",
            full_name: meta.full_name || profile?.full_name || "",
            role: meta.role || profile?.role || "grower",
            organization_name: profile?.organization_name || "",
            avatar_url: profile?.avatar_url || "",
            carbon_balance: profile?.carbon_balance || 0,
            fiat_balance: profile?.fiat_balance || 0,
            created_at: session.user.created_at,
          });
        }

        setLoading(false);

        const authListener = supabase.auth.onAuthStateChange(async (_event, session) => {
          if (session?.user) {
            const meta = session.user.user_metadata || {};
            const profile = await fetchProfile(session.user.id);

            setUser({
              id: session.user.id,
              email: session.user.email || "",
              full_name: meta.full_name || profile?.full_name || "",
              role: meta.role || profile?.role || "grower",
              organization_name: profile?.organization_name || "",
              avatar_url: profile?.avatar_url || "",
              carbon_balance: profile?.carbon_balance || 0,
              fiat_balance: profile?.fiat_balance || 0,
              created_at: session.user.created_at,
            });
          } else {
            setUser(null);
          }
        });

        subscription = authListener.data.subscription;
      };

      getCurrentUser();

      return () => {
        subscription?.unsubscribe();
      };
    }, []); // ✅ useEffect ends here



  const signIn = useCallback(
    async (
      email: string,
      password: string
    ): Promise<{ error?: string }> => {

      const { data, error } = await trySupabaseSignIn(email, password);

      if (error) {
        return { error: error.message };
      }

      if (!data.user) {
        return { error: "Invalid email or password." };
      }

      const meta = data.user.user_metadata || {};
      const profile = await fetchProfile(data.user.id);

      setUser({
        id: data.user.id,
        email: data.user.email || "",
        full_name: meta.full_name || profile?.full_name || "",
        role: meta.role || profile?.role || "grower",
        organization_name: profile?.organization_name || "",
        avatar_url: profile?.avatar_url || "",
        carbon_balance: profile?.carbon_balance || 0,
        fiat_balance: profile?.fiat_balance || 0,
        created_at: data.user.created_at,
      });

      return {};
    },
    []
  );
  const signUp = useCallback(
  async (
    email: string,
    password: string,
    fullName: string,
    role: UserRole
  ): Promise<{ error?: string }> => {

    const { data, error } = await trySupabaseSignUp(
      email,
      password,
      fullName,
      role
    );

    if (error) {
      return { error: error.message };
    }

    if (!data.user) {
      return { error: "Unable to create account." };
    }

    // Fetch profile, retrying up to 5 times with a tiny 100ms delay only if it is not immediately found (to be resilient)
    let profile = null;
    for (let attempt = 0; attempt < 5; attempt++) {
      profile = await fetchProfile(data.user.id);
      if (profile) break;
      await new Promise((r) => setTimeout(r, 100));
    }

    setUser({
      id: data.user.id,
      email: data.user.email || email,
      full_name: fullName,
      role,
      organization_name: profile?.organization_name || "",
      avatar_url: profile?.avatar_url || "",
      carbon_balance: profile?.carbon_balance || 0,
      fiat_balance: profile?.fiat_balance || 0,
      created_at: data.user.created_at,
    });

    return {};
  },
  []
);

  const updateRole = useCallback(async (role: UserRole) => {
    if (!user) return;

    setUser({
      ...user,
      role,
    });
  }, [user]);

  const signOut = useCallback(async () => {
    const { supabase } = await import("@/lib/supabase");

    await supabase.auth.signOut();

    setUser(null);
  }, []);

    return (
      <AuthContext.Provider
        value={{
          user,
          loading,
          dbMissing,
          signIn,
          signUp,
          signOut,
          updateRole,
          reloadBalance,
          isBuyer: user?.role === "buyer",
          isGrower: user?.role === "grower",
          isNgoVerifier: user?.role === "ngo_verifier",
          allUsers: [],
        }}
      >
        {children}
      </AuthContext.Provider>
    );
  }

  export const useAuth = () => useContext(AuthContext);
