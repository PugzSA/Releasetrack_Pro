import { supabase } from "./supabase";

class SupabaseDataService {
  // Auth
  async signInWithGoogle() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
      });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error signing in with Google:", error);
      throw error;
    }
  }

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  }

  onAuthStateChange(callback) {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        callback(session);
      }
    );
    return authListener;
  }

  // Ticket Management
  async getTickets() {
    try {
      const { data, error } = await supabase.from("tickets").select("*");
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching tickets:", error);
      throw error;
    }
  }

  // User & Metadata Lookups
  async getUsers() {
    try {
      const { data, error } = await supabase.from("users").select("*");
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  }

  // Release Management
  async getReleases() {
    try {
      const { data: releases, error } = await supabase
        .from("releases")
        .select("*");
      if (error) throw error;
      if (!releases || releases.length === 0) return [];

      const { data: tickets, error: ticketsError } = await supabase
        .from("tickets")
        .select("*");
      if (ticketsError) throw ticketsError;

      return releases.map((release) => ({
        ...release,
        tickets: tickets
          ? tickets.filter((ticket) => ticket.release_id === release.id)
          : [],
      }));
    } catch (error) {
      console.error("Error fetching releases with tickets:", error);
      throw error;
    }
  }

  async getReleaseById(id) {
    try {
      const { data: release, error } = await supabase
        .from("releases")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      if (!release) return null;

      const { data: tickets, error: ticketsError } = await supabase
        .from("tickets")
        .select("*")
        .eq("release_id", id);
      if (ticketsError) throw ticketsError;

      return { ...release, tickets: tickets || [] };
    } catch (error) {
      console.error(`Error fetching release with id ${id}:`, error);
      throw error;
    }
  }

  async createRelease(releaseData) {
    try {
      const { data, error } = await supabase
        .from("releases")
        .insert(releaseData)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating release:", error);
      throw error;
    }
  }

  async updateRelease(id, releaseData) {
    try {
      const { data, error } = await supabase
        .from("releases")
        .update(releaseData)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error updating release ${id}:`, error);
      throw error;
    }
  }

  async deleteRelease(id) {
    try {
      const { error } = await supabase.from("releases").delete().eq("id", id);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Error deleting release ${id}:`, error);
      throw error;
    }
  }

  // Ticket Management
  async getTickets() {
    try {
      const { data, error } = await supabase.from("tickets").select("*");
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching tickets:", error);
      throw error;
    }
  }

  async getTicketById(id) {
    try {
      const { data, error } = await supabase
        .from("tickets")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error fetching ticket with id ${id}:`, error);
      throw error;
    }
  }

  async createTicket(ticketData) {
    try {
      const { data, error } = await supabase
        .from("tickets")
        .insert(ticketData)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating ticket:", error);
      throw error;
    }
  }

  async updateTicket(id, ticketData) {
    try {
      console.log("Updating ticket with data:", { id, ticketData });

      const { data, error } = await supabase
        .from("tickets")
        .update(ticketData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Supabase update error:", error);
        throw error;
      }

      console.log("Ticket updated successfully:", data);
      return data;
    } catch (error) {
      console.error(`Error updating ticket ${id}:`, error);
      throw error;
    }
  }

  async deleteTicket(id) {
    try {
      const { error } = await supabase.from("tickets").delete().eq("id", id);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Error deleting ticket ${id}:`, error);
      throw error;
    }
  }

  // Metadata Management
  async getMetadataItems() {
    try {
      const { data, error } = await supabase.from("metadata").select("*");
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching metadata items:", error);
      throw error;
    }
  }

  async createMetadataItem(metadataData) {
    try {
      const { data, error } = await supabase
        .from("metadata")
        .insert(metadataData)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating metadata item:", error);
      throw error;
    }
  }

  async updateMetadataItem(id, metadataData) {
    try {
      const { data, error } = await supabase
        .from("metadata")
        .update(metadataData)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error updating metadata item ${id}:`, error);
      throw error;
    }
  }

  async deleteMetadataItem(id) {
    try {
      const { error } = await supabase.from("metadata").delete().eq("id", id);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Error deleting metadata item ${id}:`, error);
      throw error;
    }
  }

  async getMetadataItems() {
    try {
      const { data, error } = await supabase.from("metadata").select("*");
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching metadata items:", error);
      throw error;
    }
  }

  // Saved Filters
  async getSavedFilters(filterType) {
    try {
      let query = supabase.from("saved_filters").select("*");
      if (filterType) {
        query = query.eq("filter_type", filterType);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      const forType = filterType ? ` for ${filterType}` : "";
      console.error(`Error fetching saved filters${forType}:`, error);
      throw error;
    }
  }

  async saveFilter(filter) {
    try {
      const { data, error } = await supabase
        .from("saved_filters")
        .upsert(filter)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error saving filter:", error);
      throw error;
    }
  }

  async deleteSavedFilter(filterId) {
    try {
      const { error } = await supabase
        .from("saved_filters")
        .delete()
        .eq("id", filterId);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Error deleting filter ${filterId}:`, error);
      throw error;
    }
  }
}

const service = new SupabaseDataService();
export default service;
