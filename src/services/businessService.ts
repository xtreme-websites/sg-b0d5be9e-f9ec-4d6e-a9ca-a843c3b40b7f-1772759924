import { supabase } from "@/integrations/supabase/client";
import type { Business, Keyword, Snapshot, GridPoint } from "@/types";

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
      .order("created_at", { ascending: false }) // Changed from timestamp to created_at
      .limit(limit);

    if (error) {
      console.error("Error fetching snapshots:", error);
      throw error;
    }

    // Explicitly cast the data to match Snapshot interface
    // The 'points' field from DB is Json, we cast it to GridPoint[]
    return (data || []).map(item => ({
      ...item,
      points: item.points as unknown as GridPoint[]
    })) as Snapshot[];
  },

  async createSnapshot(snapshot: Omit<Snapshot, "id" | "created_at">) {
    // Need to handle the points array specifically for insertion
    const dbSnapshot = {
      keyword_id: snapshot.keyword_id,
      avg_rank: snapshot.avg_rank,
      visibility_score: snapshot.visibility_score,
      points: snapshot.points as unknown as any // Cast to any for Supabase Json insert
    };

    const { data, error } = await supabase
      .from("snapshots")
      .insert([dbSnapshot])
      .select()
      .single();

    if (error) {
      console.error("Error creating snapshot:", error);
      throw error;
    }

    return {
      ...data,
      points: data.points as unknown as GridPoint[]
    } as Snapshot;
  }
};