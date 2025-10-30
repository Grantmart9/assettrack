import { getSupabaseClient } from "../supabase/client";
import { Database } from "../supabase/database.types";

// Type for Company
export type Company = Database["public"]["Tables"]["companies"]["Row"];

// Type for Company insert
export type CompanyInsert = Database["public"]["Tables"]["companies"]["Insert"];

// Type for Company update
export type CompanyUpdate = Database["public"]["Tables"]["companies"]["Update"];

export class CompanyService {
  async getCompanies() {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from("Company").select("*");
    return { data, error };
  }

  async createCompany(company: CompanyInsert) {
    const supabase = getSupabaseClient();
    try {
      console.log("🔍 DEBUG: Attempting to create company:", company);
      console.log("🔍 DEBUG: Company types:", {
        id: typeof company.id,
        name: typeof company.name,
        slug: typeof company.slug,
        createdAt: typeof company.createdAt,
        updatedAt: typeof company.updatedAt,
      });
      console.log("🔍 DEBUG: Supabase client state:", {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        keyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length,
      });

      // Validate required fields
      if (!company.name || !company.slug) {
        console.error("🔍 DEBUG: Missing required fields - name or slug");
        return {
          data: null,
          error: { message: "Missing required fields: name and slug" },
        };
      }

      console.log("🔍 DEBUG: Calling supabase insert...");
      const { data, error } = await supabase
        .from("Company")
        .insert(company as any)
        .select()
        .single();

      console.log("🔍 DEBUG: Supabase insert response:", { data, error });

      if (error) {
        console.error("🔍 DEBUG: Supabase error details:", {
          code: error.code,
          details: error.details,
          hint: error.hint,
          message: error.message,
        });
      }

      return { data, error };
    } catch (err) {
      console.error("🔍 DEBUG: Exception in createCompany:", err);
      console.error(
        "🔍 DEBUG: Exception stack:",
        err instanceof Error ? err.stack : "No stack"
      );
      return {
        data: null,
        error: { message: "Error creating company. Please try again." },
      };
    }
  }

  async updateCompany(id: string, updates: CompanyUpdate) {
    // TODO: Fix Supabase type issues - temporarily disabled
    console.log("Company update temporarily disabled due to type issues:", {
      id,
      updates,
    });
    return {
      data: null,
      error: { message: "Company update temporarily disabled" },
    };

    // Original implementation (commented out due to type issues):
    // const supabase = getSupabaseClient();
    // const { data, error } = await supabase
    //   .from("companies")
    //   .update(updates)
    //   .eq("id", id)
    //   .select()
    //   .single();
    // return { data, error };
  }

  async deleteCompany(id: string) {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from("Company").delete().eq("id", id);
    return { error };
  }
}

const companyService = new CompanyService();
export default companyService;
