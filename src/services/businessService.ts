import { supabase } from "@/integrations/supabase/client";
import type { Business, Keyword, Snapshot } from "@/types";

export const businessService = {
  async getBusinessesByUser(userId: string) {
    const { data, error } = await supabase
      .from("businesses")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching businesses:", error);
      throw error;
    }

    return data as Business[];
  },

  async createBusiness(business: Omit<Business, "id" | "created_at" | "updated_at">) {
    const { data, error } = await supabase
      .from("businesses")
      .insert([business])
      .select()
      .single();

    if (error) {
      console.error("Error creating business:", error);
      throw error;
    }

    return data as Business;
  },

  async updateBusiness(id: string, updates: Partial<Business>) {
    const { data, error } = await supabase
      .from("businesses")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating business:", error);
      throw error;
    }

    return data as Business;
  },

  async getKeywordsByBusiness(businessId: string) {
    const { data, error } = await supabase
      .from("keywords")
      .select("*")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching keywords:", error);
      throw error;
    }

    return data as Keyword[];
  },

  async createKeyword(keyword: Omit<Keyword, "id" | "created_at" | "updated_at">) {
    const { data, error } = await supabase
      .from("keywords")
      .insert([keyword])
      .select()
      .single();

    if (error) {
      console.error("Error creating keyword:", error);
      throw error;
    }

    return data as Keyword;
  },

  async deleteKeyword(id: string) {
    const { error } = await supabase
      .from("keywords")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting keyword:", error);
      throw error;
    }
  },

  async getSnapshotsByKeyword(keywordId: string, limit = 10) {
    const { data, error } = await supabase
      .from("snapshots")
      .select("*")
      .eq("keyword_id", keywordId)
      .order("timestamp", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching snapshots:", error);
      throw error;
    }

    return data as Snapshot[];
  },

  async createSnapshot(snapshot: Omit<Snapshot, "id" | "created_at">) {
    const { data, error } = await supabase
      .from("snapshots")
      .insert([snapshot])
      .select()
      .single();

    if (error) {
      console.error("Error creating snapshot:", error);
      throw error;
    }

    return data as Snapshot;
  }
};