import { supabase } from './supabase';

class SupabaseDataService {
  // Release Management
  async getReleases() {
    try {
      const { data, error } = await supabase
        .from('releases')
        .select('*');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching releases:', error);
      throw error;
    }
  }

  async getReleaseById(id) {
    try {
      const { data, error } = await supabase
        .from('releases')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error fetching release with id ${id}:`, error);
      throw error;
    }
  }

  async createRelease(releaseData) {
    try {
      const { data, error } = await supabase
        .from('releases')
        .insert(releaseData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating release:', error);
      throw error;
    }
  }

  async updateRelease(id, releaseData) {
    try {
      const { data, error } = await supabase
        .from('releases')
        .update(releaseData)
        .eq('id', id)
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
      const { error } = await supabase
        .from('releases')
        .delete()
        .eq('id', id);
      
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
      const { data, error } = await supabase
        .from('tickets')
        .select('*');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching tickets:', error);
      throw error;
    }
  }

  async getTicketById(id) {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error fetching ticket with id ${id}:`, error);
      throw error;
    }
  }

  async getTicketsByReleaseId(releaseId) {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('releaseId', releaseId);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`Error fetching tickets for release ${releaseId}:`, error);
      throw error;
    }
  }

  async createTicket(ticketData) {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .insert(ticketData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating ticket:', error);
      throw error;
    }
  }

  async updateTicket(id, ticketData) {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .update(ticketData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error updating ticket ${id}:`, error);
      throw error;
    }
  }

  async deleteTicket(id) {
    try {
      const { error } = await supabase
        .from('tickets')
        .delete()
        .eq('id', id);
      
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
      const { data, error } = await supabase
        .from('metadata')
        .select('*');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching metadata items:', error);
      throw error;
    }
  }

  async getMetadataItemById(id) {
    try {
      const { data, error } = await supabase
        .from('metadata')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error fetching metadata item with id ${id}:`, error);
      throw error;
    }
  }

  async getMetadataByReleaseId(releaseId) {
    try {
      const { data, error } = await supabase
        .from('metadata')
        .select('*')
        .eq('releaseId', releaseId);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`Error fetching metadata for release ${releaseId}:`, error);
      throw error;
    }
  }

  async createMetadataItem(metadataData) {
    try {
      const { data, error } = await supabase
        .from('metadata')
        .insert(metadataData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating metadata item:', error);
      throw error;
    }
  }

  async updateMetadataItem(id, metadataData) {
    try {
      const { data, error } = await supabase
        .from('metadata')
        .update(metadataData)
        .eq('id', id)
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
      const { error } = await supabase
        .from('metadata')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Error deleting metadata item ${id}:`, error);
      throw error;
    }
  }

  // Release Strategy
  async getReleaseStrategies() {
    try {
      const { data, error } = await supabase
        .from('releaseStrategies')
        .select('*');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching release strategies:', error);
      throw error;
    }
  }

  async getReleaseStrategyById(id) {
    try {
      const { data, error } = await supabase
        .from('releaseStrategies')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error fetching release strategy with id ${id}:`, error);
      throw error;
    }
  }

  // Reports
  async generateReleaseReport(filters = {}) {
    try {
      let query = supabase
        .from('releases')
        .select(`
          *,
          tickets:tickets(*),
          metadata:metadata(*)
        `);
      
      // Apply filters if provided
      if (filters.startDate) {
        query = query.gte('target', filters.startDate);
      }
      
      if (filters.endDate) {
        query = query.lte('target', filters.endDate);
      }
      
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error generating release report:', error);
      throw error;
    }
  }
}

const supabaseDataService = new SupabaseDataService();
export default supabaseDataService;
