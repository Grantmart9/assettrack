"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { getSupabaseClient } from "./client";
import { auditLogService } from "@/lib/services/auditLogService";

type AuthContextType = {
  user: any | null;
  session: any | null;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, options?: any) => Promise<any>;
  signOut: () => Promise<any>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Check active session
    const checkSession = async () => {
      try {
        console.log("🔍 Checking session...");
        const supabase = getSupabaseClient();

        // Add timeout to prevent hanging
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Session check timeout")), 10000)
        );

        const {
          data: { session },
        } = (await Promise.race([sessionPromise, timeoutPromise])) as any;
        console.log("✅ Session check complete:", {
          hasSession: !!session,
          hasUser: !!session?.user,
        });

        if (mounted) {
          setSession(session);
          setUser(session?.user || null);
          setLoading(false);
        }
      } catch (error) {
        console.error("❌ Error checking session:", error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    checkSession();

    // Fallback timeout to prevent infinite loading
    const fallbackTimeout = setTimeout(() => {
      if (mounted) {
        console.log("⏰ Fallback timeout reached, setting loading to false");
        setLoading(false);
      }
    }, 15000); // 15 second fallback

    // Listen for auth changes
    const supabase = getSupabaseClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      console.log("🔄 Auth state change:", {
        event,
        hasSession: !!session,
        hasUser: !!session?.user,
      });
      if (mounted) {
        setSession(session);
        setUser(session?.user || null);
        setLoading(false);
      }

      // Log authentication events (non-blocking)
      if (event === "SIGNED_IN" && session?.user) {
        // Use setTimeout to make this non-blocking
        setTimeout(async () => {
          try {
            console.log("🔍 Attempting to log user login...");
            await auditLogService.logUserLogin(
              session.user.id,
              `User signed in: ${session.user.email}`
            );
            console.log("✅ Successfully logged user login");
          } catch (error) {
            console.error("❌ Failed to log user login:", error);
          }
        }, 100);
      }
    });

    return () => {
      mounted = false;
      clearTimeout(fallbackTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const supabase = getSupabaseClient();
    const result = await supabase.auth.signInWithPassword({ email, password });

    // Log failed login attempts (non-blocking)
    if (result.error && result.error.message) {
      setTimeout(async () => {
        try {
          console.log("🔍 Attempting to log login error...");
          await auditLogService.logError(
            null,
            "LOGIN",
            `Failed login attempt for ${email}: ${result.error.message}`
          );
          console.log("✅ Successfully logged login error");
        } catch (error) {
          console.error("❌ Failed to log login error:", error);
        }
      }, 100);
    }

    return result;
  };

  const signUp = async (email: string, password: string, options?: any) => {
    const supabase = getSupabaseClient();
    const result = await supabase.auth.signUp({ email, password, options });

    // Log user registration (non-blocking)
    if (result.data?.user && !result.error) {
      setTimeout(async () => {
        try {
          console.log("🔍 Attempting to log user registration...");
          const now = new Date().toISOString();
          await auditLogService.create({
            action: "USER_REGISTERED",
            userId: result.data.user.id,
            details: `New user registered: ${email}`,
            timestamp: now,
            updatedAt: now,
          });
          console.log("✅ Successfully logged user registration");
        } catch (error) {
          console.error("❌ Failed to log user registration:", error);
        }
      }, 100);
    } else if (result.error) {
      setTimeout(async () => {
        try {
          console.log("🔍 Attempting to log registration error...");
          await auditLogService.logError(
            null,
            "REGISTRATION",
            `Failed registration attempt for ${email}: ${result.error.message}`
          );
          console.log("✅ Successfully logged registration error");
        } catch (error) {
          console.error("❌ Failed to log registration error:", error);
        }
      }, 100);
    }

    return result;
  };

  const signOut = async () => {
    // Log the logout before actually signing out (non-blocking)
    if (user?.id) {
      setTimeout(async () => {
        try {
          console.log("🔍 Attempting to log user logout...");
          await auditLogService.logUserLogout(
            user.id,
            `User signed out: ${user.email}`
          );
          console.log("✅ Successfully logged user logout");
        } catch (error) {
          console.error("❌ Failed to log user logout:", error);
        }
      }, 100);
    }

    const supabase = getSupabaseClient();
    return supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    signIn,
    signUp,
    signOut,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
