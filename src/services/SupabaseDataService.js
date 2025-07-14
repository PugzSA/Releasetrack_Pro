import { supabase } from './supabase';

class SupabaseDataService {
  // Release Management
  async getReleases() {
    try {
      // First, get all releases
      const { data: releases, error } = await supabase
        .from('releases')
        .select('*');
      
      if (error) throw error;
      
      // If no releases, return empty array
      if (!releases || releases.length === 0) return [];
      
      // Get all tickets
      const { data: tickets, error: ticketsError } = await supabase
        .from('tickets')
        .select('*');
      
      if (ticketsError) throw ticketsError;
      
      // Map tickets to their respective releases
      const releasesWithTickets = releases.map(release => {
        const relatedTickets = tickets ? tickets.filter(ticket => 
          ticket.release_id === release.id
        ) : [];
        
        return {
          ...release,
          tickets: relatedTickets
        };
      });
      
      return releasesWithTickets;
    } catch (error) {
      console.error('Error fetching releases with tickets:', error);
      throw error;
    }
  }

  async getReleaseById(id) {
    try {
      // Get the release
      const { data: release, error } = await supabase
        .from('releases')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      if (!release) return null;
      
      // Get related tickets for this release
      const { data: tickets, error: ticketsError } = await supabase
        .from('tickets')
        .select('*')
        .eq('release_id', id);
      
      if (ticketsError) throw ticketsError;
      
      // Add tickets to the release object
      return {
        ...release,
        tickets: tickets || []
      };
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
        .eq('release_id', releaseId);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`Error fetching metadata for release ${releaseId}:`, error);
      throw error;
    }
  }

  async getMetadataByTicketId(ticketId) {
    try {
      const { data, error } = await supabase
        .from('metadata')
        .select('*')
        .eq('ticket_id', ticketId);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`Error fetching metadata for ticket ${ticketId}:`, error);
      throw error;
    }
  }

  async createMetadataItem(metadataData) {
    try {
      // Create a clean copy of the data to avoid mutation issues
      const cleanData = { ...metadataData };
      
      // Log the data being sent to the database
      console.log('Creating metadata item with data:', JSON.stringify(cleanData, null, 2));
      
      // Handle all potentially numeric fields to ensure proper types
      // This prevents 'invalid input syntax for type bigint' errors
      
      // Handle ticket_id field
      if (cleanData.ticket_id === undefined || cleanData.ticket_id === '' || cleanData.ticket_id === 'null') {
        cleanData.ticket_id = null;
        console.log('Setting empty ticket_id to null');
      }
      
      // Handle release_id field
      if (cleanData.release_id === undefined || cleanData.release_id === '' || cleanData.release_id === 'null') {
        cleanData.release_id = null;
        console.log('Setting empty release_id to null');
      } else if (cleanData.release_id && typeof cleanData.release_id === 'string') {
        // Try to convert string to number if it's numeric
        const numericReleaseId = parseInt(cleanData.release_id, 10);
        if (!isNaN(numericReleaseId)) {
          cleanData.release_id = numericReleaseId;
          console.log('Converted release_id string to number:', numericReleaseId);
        }
      }
      
      // Handle type field - ensure it's a string
      if (cleanData.type === undefined) {
        cleanData.type = 'apex class';
        console.log('Setting undefined type to default: apex class');
      }
      
      // Handle action field - ensure it's a string
      if (cleanData.action === undefined) {
        cleanData.action = 'create';
        console.log('Setting undefined action to default: create');
      }
      
      console.log('Final data being sent to database:', JSON.stringify(cleanData, null, 2));
      
      const { data, error } = await supabase
        .from('metadata')
        .insert(cleanData)
        .select()
        .single();
      
      if (error) {
        console.error('Supabase error creating metadata item:', error);
        throw error;
      }
      
      console.log('Successfully created metadata item:', data);
      return data;
    } catch (error) {
      console.error('Error creating metadata item:', error);
      throw error;
    }
  }

  async updateMetadataItem(id, metadataData) {
    try {
      // Create a clean copy of the data to avoid mutation issues
      const cleanData = { ...metadataData };
      
      // Log the data being sent to the database
      console.log(`Updating metadata item ${id} with data:`, JSON.stringify(cleanData, null, 2));
      
      // Handle all potentially numeric fields to ensure proper types
      // This prevents 'invalid input syntax for type bigint' errors
      
      // Handle ticket_id field
      if (cleanData.ticket_id === undefined || cleanData.ticket_id === '' || cleanData.ticket_id === 'null') {
        cleanData.ticket_id = null;
        console.log('Setting empty ticket_id to null');
      }
      
      // Handle release_id field
      if (cleanData.release_id === undefined || cleanData.release_id === '' || cleanData.release_id === 'null') {
        cleanData.release_id = null;
        console.log('Setting empty release_id to null');
      } else if (cleanData.release_id && typeof cleanData.release_id === 'string') {
        // Try to convert string to number if it's numeric
        const numericReleaseId = parseInt(cleanData.release_id, 10);
        if (!isNaN(numericReleaseId)) {
          cleanData.release_id = numericReleaseId;
          console.log('Converted release_id string to number:', numericReleaseId);
        }
      }
      
      // Handle type field - ensure it's a string
      if (cleanData.type === undefined) {
        cleanData.type = 'apex class';
        console.log('Setting undefined type to default: apex class');
      }
      
      // Handle action field - ensure it's a string
      if (cleanData.action === undefined) {
        cleanData.action = 'create';
        console.log('Setting undefined action to default: create');
      }
      
      console.log('Final data being sent to database:', JSON.stringify(cleanData, null, 2));
      
      const { data, error } = await supabase
        .from('metadata')
        .update(cleanData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Supabase error updating metadata item:', error);
        throw error;
      }
      
      console.log('Successfully updated metadata item:', data);
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

  // Saved Filters Management
  async getSavedFilters(filter_type) {
    try {
      let query = supabase
        .from('saved_filters')
        .select('*');
      
      // If filter_type is provided, filter by it
      if (filter_type) {
        query = query.eq('filter_type', filter_type);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching saved filters:', error);
      throw error;
    }
  }

  async getSavedFilterById(id) {
    try {
      const { data, error } = await supabase
        .from('saved_filters')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error fetching saved filter with id ${id}:`, error);
      throw error;
    }
  }

  async createSavedFilter(filterData) {
    try {
      const { data, error } = await supabase
        .from('saved_filters')
        .insert({
          ...filterData,
          filter_type: filterData.filter_type || 'metadata',
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating saved filter:', error);
      throw error;
    }
  }

  async updateSavedFilter(id, filterData) {
    try {
      const { data, error } = await supabase
        .from('saved_filters')
        .update({
          ...filterData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error updating saved filter ${id}:`, error);
      throw error;
    }
  }

  async deleteSavedFilter(id) {
    try {
      const { error } = await supabase
        .from('saved_filters')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Error deleting saved filter ${id}:`, error);
      throw error;
    }
  }
}

const supabaseDataService = new SupabaseDataService();
export default supabaseDataService;
