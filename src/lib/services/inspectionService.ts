import { getSupabaseClient } from '../supabase/client';
import { Database } from '../supabase/database.types';

// Type for Inspection
export type Inspection = Database['public']['Tables']['Inspection']['Row'];

// Type for Inspection insert
export type InspectionInsert = Database['public']['Tables']['Inspection']['Insert'];

// Type for Inspection update
export type InspectionUpdate = Database['public']['Tables']['Inspection']['Update'];

export class InspectionService {
  async createInspection(inspection: InspectionInsert) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('Inspection')
      .insert(inspection)
      .select()
      .single();
    return { data, error };
  }

  async getInspections() {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('Inspection')
      .select('*');
    return { data, error };
  }

  async getInspectionsByAsset(assetId: string) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('Inspection')
      .select('*')
      .eq('assetId', assetId);
    return { data, error };
  }

  async getUpcomingInspections() {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('Inspection')
      .select('*')
      .gt('nextDue', new Date().toISOString())
      .order('nextDue', { ascending: true });
    return { data, error };
  }

  async getOverdueInspections() {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('Inspection')
      .select('*')
      .lt('nextDue', new Date().toISOString())
      .order('nextDue', { ascending: true });
    return { data, error };
  }
}

const inspectionService = new InspectionService();
export default inspectionService;