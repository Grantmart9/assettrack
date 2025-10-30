import { getSupabaseClient } from "../supabase/client";
import { Database } from "../supabase/database.types";

// Type for User
export type User = Database["public"]["Tables"]["user"]["Row"];

// Type for User insert
export type UserInsert = Database["public"]["Tables"]["user"]["Insert"];

// Type for User update
export type UserUpdate = Database["public"]["Tables"]["user"]["Update"];

const supabase = getSupabaseClient();

export class UserService {
  async getCurrentUser() {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      return { data: null, error };
    }
    return { data: data.session?.user || null, error: null };
  }

  async getUsers() {
    const { data, error } = await supabase.from("User").select("*");
    return { data, error };
  }

  async createUser(user: UserInsert) {
    console.log("🔍 DEBUG: Creating user in database:", user);
    const { data, error } = await supabase
      .from("User")
      .insert(user as any)
      .select()
      .single();

    console.log("🔍 DEBUG: User creation response:", { data, error });

    if (error) {
      console.error("🔍 DEBUG: User creation error details:", {
        code: error.code,
        details: error.details,
        hint: error.hint,
        message: error.message,
      });
    }

    return { data, error };
  }

  async updateUser(id: string, updates: UserUpdate) {
    // TODO: Fix Supabase type issues - temporarily disabled
    console.log("User update temporarily disabled due to type issues:", {
      id,
      updates,
    });
    return {
      data: null,
      error: { message: "User update temporarily disabled" },
    };

    // Original implementation (commented out due to type issues):
    // const { data, error } = await supabase
    //   .from("User")
    //   .update(updates)
    //   .eq("id", id)
    //   .select()
    //   .single();
    // return { data, error };
  }

  async deleteUser(id: string) {
    const { error } = await supabase.from("User").delete().eq("id", id);
    return { error };
  }

  async signUp(
    email: string,
    password: string,
    name: string,
    companyId: string
  ) {
    // First create the user in Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          companyId: companyId,
        },
      },
    });

    if (error) {
      return { data: null, error };
    }

    // If user is created successfully, also create a record in the users table
    if (data.user) {
      const userData: UserInsert = {
        id: data.user.id,
        email: data.user.email || "",
        name: name,
        companyId: companyId,
        role: "Admin", // Default role for new users
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const { error: insertError } = await this.createUser(userData);
      if (insertError) {
        return { data: null, error: insertError };
      }
    }

    return { data, error: null };
  }

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  }

  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  }
}

const userService = new UserService();
export default userService;
