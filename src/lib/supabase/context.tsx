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
    // Check active session
    const checkSession = async () => {
      try {
        const supabase = getSupabaseClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user || null);
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const supabase = getSupabaseClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      setSession(session);
      setUser(session?.user || null);
      setLoading(false);

      // Log authentication events
      if (event === "SIGNED_IN" && session?.user) {
        try {
          console.log("🔍 Attempting to log user login...");
          await auditLogService.logUserLogin(
            session.user.id,
            `User signed in: ${session.user.email}`
          );
          console.log("✅ Successfully logged user login");
        } catch (error) {
          console.error("❌ Failed to log user login:", error);
          // Log detailed error information for debugging
          if (error instanceof Error) {
            console.error("Error message:", error.message);
            console.error("Error stack:", error.stack);
          }
        }
      } else if (event === "SIGNED_OUT") {
        // For sign out, we don't have the user ID anymore, so we'll handle this in the signOut function
        console.log("🔍 User signed out event detected");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const supabase = getSupabaseClient();
    const result = await supabase.auth.signInWithPassword({ email, password });

    // Log failed login attempts
    if (result.error && result.error.message) {
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
        // Don't let audit logging errors affect the login flow
        if (error instanceof Error) {
          console.error("Error message:", error.message);
        }
      }
    }

    return result;
  };

  const signUp = async (email: string, password: string, options?: any) => {
    const supabase = getSupabaseClient();
    const result = await supabase.auth.signUp({ email, password, options });

    // Log user registration
    if (result.data?.user && !result.error) {
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
        if (error instanceof Error) {
          console.error("Error message:", error.message);
        }
      }
    } else if (result.error) {
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
        if (error instanceof Error) {
          console.error("Error message:", error.message);
        }
      }
    }

    return result;
  };

  const signOut = async () => {
    // Log the logout before actually signing out
    if (user?.id) {
      try {
        console.log("🔍 Attempting to log user logout...");
        await auditLogService.logUserLogout(
          user.id,
          `User signed out: ${user.email}`
        );
        console.log("✅ Successfully logged user logout");
      } catch (error) {
        console.error("❌ Failed to log user logout:", error);
        if (error instanceof Error) {
          console.error("Error message:", error.message);
        }
      }
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
