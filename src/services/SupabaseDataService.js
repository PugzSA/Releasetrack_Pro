import { supabase } from "./supabase";
import emailService from "./EmailService";

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
      // Generate a unique release ID if not provided
      if (!releaseData.id) {
        // Get the highest existing release number
        const { data: existingReleases, error: fetchError } = await supabase
          .from("releases")
          .select("id")
          .like("id", "RELEASE-%")
          .order("id", { ascending: false })
          .limit(1);

        if (fetchError) throw fetchError;

        let nextNumber = 1;
        if (existingReleases && existingReleases.length > 0) {
          const lastId = existingReleases[0].id;
          const lastNumber = parseInt(lastId.replace("RELEASE-", ""));
          nextNumber = lastNumber + 1;
        }

        // Format the ID (e.g., RELEASE-1, RELEASE-2, etc.)
        releaseData.id = `RELEASE-${nextNumber}`;
      }

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
      // Generate a unique ticket ID if not provided
      if (!ticketData.id) {
        // Get the highest existing ticket number
        const { data: existingTickets, error: fetchError } = await supabase
          .from("tickets")
          .select("id")
          .like("id", "SUP-%")
          .order("id", { ascending: false })
          .limit(1);

        if (fetchError) throw fetchError;

        let nextNumber = 1;
        if (existingTickets && existingTickets.length > 0) {
          const lastId = existingTickets[0].id;
          const lastNumber = parseInt(lastId.replace("SUP-", ""));
          nextNumber = lastNumber + 1;
        }

        // Format the ID with leading zeros (e.g., SUP-00001)
        ticketData.id = `SUP-${nextNumber.toString().padStart(5, "0")}`;
      }

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

      // Get the original ticket data before updating
      const { data: originalTicket, error: fetchError } = await supabase
        .from("tickets")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError) {
        console.error("Error fetching original ticket:", fetchError);
        throw fetchError;
      }

      // Handle closed_date logic
      const closedStatuses = ["Released", "Cancelled"];
      const updatedTicketData = { ...ticketData };

      // If status is changing to a closed status, set closed_date
      if (
        ticketData.status &&
        closedStatuses.includes(ticketData.status) &&
        originalTicket.status !== ticketData.status &&
        !closedStatuses.includes(originalTicket.status)
      ) {
        updatedTicketData.closed_date = new Date().toISOString();
        console.log(
          `Setting closed_date for ticket ${id} due to status change to ${ticketData.status}`
        );
      }

      // If status is changing from a closed status to an open status, clear closed_date
      if (
        ticketData.status &&
        !closedStatuses.includes(ticketData.status) &&
        closedStatuses.includes(originalTicket.status)
      ) {
        updatedTicketData.closed_date = null;
        console.log(
          `Clearing closed_date for ticket ${id} due to status change from ${originalTicket.status} to ${ticketData.status}`
        );
      }

      // Update the ticket
      const { data, error } = await supabase
        .from("tickets")
        .update(updatedTicketData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Supabase update error:", error);
        throw error;
      }

      console.log("Ticket updated successfully:", data);

      // Check for changes that require email notifications
      await this.handleTicketUpdateNotifications(originalTicket, data);

      return data;
    } catch (error) {
      console.error(`Error updating ticket ${id}:`, error);
      throw error;
    }
  }

  /**
   * Handle email notifications for ticket updates
   * @param {Object} originalTicket - The original ticket data before update
   * @param {Object} updatedTicket - The updated ticket data after update
   */
  async handleTicketUpdateNotifications(originalTicket, updatedTicket) {
    try {
      // Initialize email service with supabase
      emailService.setSupabase(supabase);

      // Get current user from auth session
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Get all users for recipient lookup
      const { data: users, error: usersError } = await supabase
        .from("users")
        .select("*");

      if (usersError) {
        console.error("Error fetching users for notifications:", usersError);
        return;
      }

      // Find the current user in the users table by email
      const currentUserRecord = user
        ? users.find((u) => u.email === user.email)
        : null;

      // Check for status change
      if (originalTicket.status !== updatedTicket.status) {
        console.log(
          `📧 Status changed: ${originalTicket.status} → ${updatedTicket.status}`
        );
        await this.sendStatusChangeNotification(
          originalTicket,
          updatedTicket,
          currentUserRecord,
          users
        );
      }

      // Check for assignee change
      if (originalTicket.assignee_id !== updatedTicket.assignee_id) {
        console.log(
          `📧 Assignee changed: ${originalTicket.assignee_id} → ${updatedTicket.assignee_id}`
        );
        await this.sendAssigneeChangeNotification(
          originalTicket,
          updatedTicket,
          currentUserRecord,
          users
        );
      }
    } catch (error) {
      console.error("Error handling ticket update notifications:", error);
      // Don't throw error - notifications shouldn't break ticket updates
    }
  }

  /**
   * Send status change notification email
   */
  async sendStatusChangeNotification(
    originalTicket,
    updatedTicket,
    currentUser,
    users
  ) {
    try {
      // Build recipients list (assignee and requester)
      const recipients = [];

      // Add assignee if exists
      if (updatedTicket.assignee_id) {
        const assignee = users.find((u) => u.id === updatedTicket.assignee_id);
        if (assignee) {
          recipients.push({
            id: assignee.id,
            email: assignee.email,
            name: `${assignee.firstName} ${assignee.lastName}`,
          });
        }
      }

      // Add requester if exists and different from assignee
      if (
        updatedTicket.requester_id &&
        updatedTicket.requester_id !== updatedTicket.assignee_id
      ) {
        const requester = users.find(
          (u) => u.id === updatedTicket.requester_id
        );
        if (requester) {
          recipients.push({
            id: requester.id,
            email: requester.email,
            name: `${requester.firstName} ${requester.lastName}`,
          });
        }
      }

      if (recipients.length === 0) {
        console.log("No recipients found for status change notification");
        return;
      }

      console.log(
        `📧 Sending status change email to: ${recipients
          .map((r) => r.email)
          .join(", ")}`
      );

      // Ensure the ticket object has the assignee name for the email template
      const ticketWithAssigneeName = { ...updatedTicket };
      if (updatedTicket.assignee_id) {
        const assignee = users.find((u) => u.id === updatedTicket.assignee_id);
        if (assignee) {
          ticketWithAssigneeName.assignee = `${assignee.firstName} ${assignee.lastName}`;
        }
      } else {
        ticketWithAssigneeName.assignee = "Unassigned";
      }

      // Send the email
      const result = await emailService.sendTicketStatusChangeEmail({
        ticket: ticketWithAssigneeName,
        previousStatus: originalTicket.status,
        user: {
          id: currentUser?.id,
          email: currentUser?.email,
          name: currentUser
            ? `${currentUser.firstName} ${currentUser.lastName}`
            : "Unknown User",
        },
        recipients,
      });

      console.log("Status change email result:", result);
    } catch (error) {
      console.error("Error sending status change notification:", error);
    }
  }

  /**
   * Send assignee change notification email
   */
  async sendAssigneeChangeNotification(
    originalTicket,
    updatedTicket,
    currentUser,
    users
  ) {
    try {
      // Build recipients list (old assignee, new assignee, and requester)
      const recipients = [];

      // Add old assignee if exists
      if (originalTicket.assignee_id) {
        const oldAssignee = users.find(
          (u) => u.id === originalTicket.assignee_id
        );
        if (oldAssignee) {
          recipients.push({
            id: oldAssignee.id,
            email: oldAssignee.email,
            name: `${oldAssignee.firstName} ${oldAssignee.lastName}`,
          });
        }
      }

      // Add new assignee if exists and different from old assignee
      if (
        updatedTicket.assignee_id &&
        updatedTicket.assignee_id !== originalTicket.assignee_id
      ) {
        const newAssignee = users.find(
          (u) => u.id === updatedTicket.assignee_id
        );
        if (newAssignee) {
          recipients.push({
            id: newAssignee.id,
            email: newAssignee.email,
            name: `${newAssignee.firstName} ${newAssignee.lastName}`,
          });
        }
      }

      // Add requester if exists and not already in recipients
      if (updatedTicket.requester_id) {
        const requester = users.find(
          (u) => u.id === updatedTicket.requester_id
        );
        if (requester && !recipients.find((r) => r.id === requester.id)) {
          recipients.push({
            id: requester.id,
            email: requester.email,
            name: `${requester.firstName} ${requester.lastName}`,
          });
        }
      }

      if (recipients.length === 0) {
        console.log("No recipients found for assignee change notification");
        return;
      }

      console.log(
        `📧 Sending assignee change email to: ${recipients
          .map((r) => r.email)
          .join(", ")}`
      );

      // Get previous assignee name
      const previousAssignee = originalTicket.assignee_id
        ? users.find((u) => u.id === originalTicket.assignee_id)?.firstName +
          " " +
          users.find((u) => u.id === originalTicket.assignee_id)?.lastName
        : "Unassigned";

      // Ensure the ticket object has the new assignee name for the email template
      const ticketWithAssigneeName = { ...updatedTicket };
      if (updatedTicket.assignee_id) {
        const newAssignee = users.find(
          (u) => u.id === updatedTicket.assignee_id
        );
        if (newAssignee) {
          ticketWithAssigneeName.assignee = `${newAssignee.firstName} ${newAssignee.lastName}`;
        }
      } else {
        ticketWithAssigneeName.assignee = "Unassigned";
      }

      // Send the email
      const result = await emailService.sendAssigneeChangeEmail({
        ticket: ticketWithAssigneeName,
        previousAssignee,
        user: {
          id: currentUser?.id,
          email: currentUser?.email,
          name: currentUser
            ? `${currentUser.firstName} ${currentUser.lastName}`
            : "Unknown User",
        },
        recipients,
      });

      console.log("Assignee change email result:", result);
    } catch (error) {
      console.error("Error sending assignee change notification:", error);
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
      // Generate a unique metadata ID if not provided
      if (!metadataData.id) {
        // Get the highest existing metadata number
        const { data: existingMetadata, error: fetchError } = await supabase
          .from("metadata")
          .select("id")
          .like("id", "META-%")
          .order("id", { ascending: false })
          .limit(1);

        if (fetchError) throw fetchError;

        let nextNumber = 1;
        if (existingMetadata && existingMetadata.length > 0) {
          const lastId = existingMetadata[0].id;
          const lastNumber = parseInt(lastId.replace("META-", ""));
          nextNumber = lastNumber + 1;
        }

        // Format the ID with leading zeros (e.g., META-00001)
        metadataData.id = `META-${nextNumber.toString().padStart(5, "0")}`;
      }

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

  async getMetadataByTicketId(ticketId) {
    try {
      const { data, error } = await supabase
        .from("metadata")
        .select("*")
        .eq("ticket_id", ticketId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`Error fetching metadata for ticket ${ticketId}:`, error);
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

  // Comments Management
  async getCommentsByTicketId(ticketId) {
    try {
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("ticket_id", ticketId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching comments:", error);
      throw error;
    }
  }

  async createComment(commentData) {
    try {
      const { data, error } = await supabase
        .from("comments")
        .insert([commentData])
        .select("*")
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating comment:", error);
      throw error;
    }
  }

  async updateComment(commentId, commentData) {
    try {
      const { data, error } = await supabase
        .from("comments")
        .update(commentData)
        .eq("id", commentId)
        .select("*")
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error updating comment:", error);
      throw error;
    }
  }

  async deleteComment(commentId) {
    try {
      const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error deleting comment:", error);
      throw error;
    }
  }
}

const service = new SupabaseDataService();
export default service;
