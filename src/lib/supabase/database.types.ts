export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string;
          name: string;
          slug: string;
          logo: string | null;
          theme: string | null;
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          logo?: string | null;
          theme?: string | null;
          createdAt?: string;
          updatedAt?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          logo?: string | null;
          theme?: string | null;
          createdAt?: string;
          updatedAt?: string;
        };
      };
      user: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          avatar: string | null;
          role: string;
          companyId: string;
          pages: string[] | null;
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id?: string;
          email: string;
          name?: string | null;
          avatar?: string | null;
          role?: string;
          companyId: string;
          pages?: string[] | null;
          createdAt?: string;
          updatedAt?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          avatar?: string | null;
          role?: string;
          companyId?: string;
          pages?: string[] | null;
          createdAt?: string;
          updatedAt?: string;
        };
      };
      Asset: {
        Row: {
          id: string;
          name: string;
          category: string;
          serial: string | null;
          purchaseDate: string | null;
          inspectionDate: string | null;
          photos: string[];
          documents: string[];
          condition: string | null;
          status: string;
          companyId: string;
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id?: string;
          name: string;
          category: string;
          serial?: string | null;
          purchaseDate?: string | null;
          inspectionDate?: string | null;
          photos?: string[];
          documents?: string[];
          condition?: string | null;
          status?: string;
          companyId: string;
          createdAt?: string;
          updatedAt?: string;
        };
        Update: {
          id?: string;
          name?: string;
          category?: string;
          serial?: string | null;
          purchaseDate?: string | null;
          inspectionDate?: string | null;
          photos?: string[];
          documents?: string[];
          condition?: string | null;
          status?: string;
          companyId?: string;
          createdAt?: string;
          updatedAt?: string;
        };
      };
      AssetTag: {
        Row: {
          id: string;
          type: string;
          identifier: string;
          assetId: string;
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id?: string;
          type: string;
          identifier: string;
          assetId: string;
          createdAt?: string;
          updatedAt?: string;
        };
        Update: {
          id?: string;
          type?: string;
          identifier?: string;
          assetId?: string;
          createdAt?: string;
          updatedAt?: string;
        };
      };
      Assignment: {
        Row: {
          id: string;
          assetId: string;
          assignedTo: string;
          site: string | null;
          vehicle: string | null;
          outAt: string;
          dueAt: string | null;
          inAt: string | null;
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id?: string;
          assetId: string;
          assignedTo: string;
          site?: string | null;
          vehicle?: string | null;
          outAt?: string;
          dueAt?: string | null;
          inAt?: string | null;
          createdAt?: string;
          updatedAt?: string;
        };
        Update: {
          id?: string;
          assetId?: string;
          assignedTo?: string;
          site?: string | null;
          vehicle?: string | null;
          outAt?: string;
          dueAt?: string | null;
          inAt?: string | null;
          createdAt?: string;
          updatedAt?: string;
        };
      };
      Inspection: {
        Row: {
          id: string;
          assetId: string;
          checklist: string;
          result: string;
          signedBy: string | null;
          nextDue: string | null;
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id?: string;
          assetId: string;
          checklist: string;
          result: string;
          signedBy?: string | null;
          nextDue?: string | null;
          createdAt?: string;
          updatedAt?: string;
        };
        Update: {
          id?: string;
          assetId?: string;
          checklist?: string;
          result?: string;
          signedBy?: string | null;
          nextDue?: string | null;
          createdAt?: string;
          updatedAt?: string;
        };
      };
      LocationEvent: {
        Row: {
          id: string;
          assetId: string;
          method: string;
          latitude: number | null;
          longitude: number | null;
          timestamp: string;
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id?: string;
          assetId: string;
          method: string;
          latitude?: number | null;
          longitude?: number | null;
          timestamp?: string;
          createdAt?: string;
          updatedAt?: string;
        };
        Update: {
          id?: string;
          assetId?: string;
          method?: string;
          latitude?: number | null;
          longitude?: number | null;
          timestamp?: string;
          createdAt?: string;
          updatedAt?: string;
        };
      };
      JobSite: {
        Row: {
          id: string;
          name: string;
          address: string | null;
          companyId: string;
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id?: string;
          name: string;
          address?: string | null;
          companyId: string;
          createdAt?: string;
          updatedAt?: string;
        };
        Update: {
          id?: string;
          name?: string;
          address?: string | null;
          companyId?: string;
          createdAt?: string;
          updatedAt?: string;
        };
      };
      Vehicle: {
        Row: {
          id: string;
          name: string;
          plate: string | null;
          companyId: string;
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id?: string;
          name: string;
          plate?: string | null;
          companyId: string;
          createdAt?: string;
          updatedAt?: string;
        };
        Update: {
          id?: string;
          name?: string;
          plate?: string | null;
          companyId?: string;
          createdAt?: string;
          updatedAt?: string;
        };
      };
      AuditLog: {
        Row: {
          id: string;
          action: string;
          userId: string | null;
          assetId: string | null;
          details: string | null;
          timestamp: string;
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id?: string;
          action: string;
          userId?: string | null;
          assetId?: string | null;
          details?: string | null;
          timestamp?: string;
          createdAt?: string;
          updatedAt?: string;
        };
        Update: {
          id?: string;
          action?: string;
          userId?: string | null;
          assetId?: string | null;
          details?: string | null;
          timestamp?: string;
          createdAt?: string;
          updatedAt?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
