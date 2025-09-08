import { getSupabaseClient } from '../supabase/client';
import { Database } from '../supabase/database.types';

// Type for Company
export type Company = Database['public']['Tables']['companies']['Row'];

// Type for Company insert
export type CompanyInsert = Database['public']['Tables']['companies']['Insert'];

// Type for Company update
export type CompanyUpdate = Database['public']['Tables']['companies']['Update'];

export class CompanyService {
  async getCompanies() {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('companies')
      .select('*');
    return { data, error };
  }

  async createCompany(company: CompanyInsert) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('companies')
      .insert(company)
      .select()
      .single();
    return { data, error };
  }

  async updateCompany(id: string, updates: CompanyUpdate) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('companies')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  }

  async deleteCompany(id: string) {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('id', id);
    return { error };
  }
}

const companyService = new CompanyService();
export default companyService;