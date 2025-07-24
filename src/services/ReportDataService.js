import { createClient } from "@supabase/supabase-js";
import {
  TICKET_STATUSES,
  TICKET_TYPES,
  TICKET_PRIORITIES,
} from "../constants/ticketFields";

class ReportDataService {
  constructor(supabase) {
    this.supabase = supabase;
  }

  /**
   * Get comprehensive ticket data with user and release lookups
   * Always fetches fresh data from the database - no caching
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Array>} Enhanced ticket data
   */
  async getTicketReportData(filters = {}) {
    try {
      // First, get tickets with basic filters
      let ticketQuery = this.supabase.from("tickets").select("*");

      // Apply filters
      if (filters.dateFrom) {
        ticketQuery = ticketQuery.gte("created_at", filters.dateFrom);
      }

      if (filters.dateTo) {
        ticketQuery = ticketQuery.lte("created_at", filters.dateTo);
      }

      // Only apply filters if not all options are selected
      const allStatusOptions = TICKET_STATUSES;
      const allTypeOptions = TICKET_TYPES;
      const allPriorityOptions = TICKET_PRIORITIES;

      if (
        filters.status &&
        filters.status.length > 0 &&
        filters.status.length < allStatusOptions.length
      ) {
        ticketQuery = ticketQuery.in("status", filters.status);
      }

      if (
        filters.type &&
        filters.type.length > 0 &&
        filters.type.length < allTypeOptions.length
      ) {
        ticketQuery = ticketQuery.in("type", filters.type);
      }

      if (
        filters.priority &&
        filters.priority.length > 0 &&
        filters.priority.length < allPriorityOptions.length
      ) {
        ticketQuery = ticketQuery.in("priority", filters.priority);
      }

      // For release filter, we'll handle it post-query to check if all releases are selected
      // This avoids complex database queries

      // Get tickets, users, and releases in parallel
      const [ticketsResult, usersResult, releasesResult] = await Promise.all([
        ticketQuery.order("created_at", { ascending: false }),
        this.supabase.from("users").select("*"),
        this.supabase.from("releases").select("*"),
      ]);

      if (ticketsResult.error) throw ticketsResult.error;
      if (usersResult.error) throw usersResult.error;
      if (releasesResult.error) throw releasesResult.error;

      let tickets = ticketsResult.data || [];
      const users = usersResult.data || [];
      const releases = releasesResult.data || [];

      // Apply release filter post-query to handle "select all" scenario
      if (filters.release_id && filters.release_id.length > 0) {
        const allReleaseIds = releases.map((r) => r.id);
        const allPossibleOptions = ["no-release", ...allReleaseIds];

        // Only apply filter if not all options are selected
        if (filters.release_id.length < allPossibleOptions.length) {
          const hasNoRelease = filters.release_id.includes("no-release");
          const releaseIds = filters.release_id.filter(
            (id) => id !== "no-release"
          );

          tickets = tickets.filter((ticket) => {
            if (hasNoRelease && !ticket.release_id) return true;
            if (releaseIds.length > 0 && releaseIds.includes(ticket.release_id))
              return true;
            return false;
          });
        }
      }

      // Create lookup maps for better performance
      const userMap = users.reduce((map, user) => {
        map[user.id] = user;
        // Also create a name-based lookup for backward compatibility
        const fullName = `${user.firstName} ${user.lastName}`;
        map[fullName] = user;
        return map;
      }, {});

      const releaseMap = releases.reduce((map, release) => {
        map[release.id] = release;
        return map;
      }, {});

      // Enhance the data with computed fields and lookups
      let enhancedTickets = tickets.map((ticket) => {
        // Try to find assignee by ID first, then by name
        let assigneeUser = null;
        if (ticket.assignee_id) {
          assigneeUser = userMap[ticket.assignee_id];
        } else if (ticket.assignee) {
          assigneeUser = userMap[ticket.assignee];
        }

        // Try to find requester by ID first, then by name
        let requesterUser = null;
        if (ticket.requester_id) {
          requesterUser = userMap[ticket.requester_id];
        } else if (ticket.requester) {
          requesterUser = userMap[ticket.requester];
        }

        const release = releaseMap[ticket.release_id];

        return {
          ...ticket,
          assignee_name: assigneeUser
            ? `${assigneeUser.firstName} ${assigneeUser.lastName}`
            : ticket.assignee || "Unassigned",
          requester_name: requesterUser
            ? `${requesterUser.firstName} ${requesterUser.lastName}`
            : ticket.requester || "Unknown",
          release_name: release?.name || "No Release",
          has_release: !!ticket.release_id,
          days_since_created: this.calculateDaysSince(ticket.created_at),
          days_since_updated: this.calculateDaysSince(ticket.updated_at),
        };
      });

      // Apply user-based filters after enhancement
      if (filters.assignee_id) {
        enhancedTickets = enhancedTickets.filter(
          (ticket) =>
            ticket.assignee_id == filters.assignee_id ||
            (ticket.assignee &&
              userMap[ticket.assignee]?.id == filters.assignee_id)
        );
      }

      if (filters.requester_id) {
        enhancedTickets = enhancedTickets.filter(
          (ticket) =>
            ticket.requester_id == filters.requester_id ||
            (ticket.requester &&
              userMap[ticket.requester]?.id == filters.requester_id)
        );
      }

      return enhancedTickets;
    } catch (error) {
      console.error("Error fetching ticket report data:", error);
      throw error;
    }
  }

  /**
   * Get aggregated statistics for charts
   * @param {Array} tickets - Ticket data
   * @returns {Object} Aggregated statistics
   */
  getTicketStatistics(tickets) {
    const stats = {
      total: tickets.length,
      byType: this.groupBy(tickets, "type"),
      byPriority: this.groupBy(tickets, "priority"),
      byStatus: this.groupBy(tickets, "status"),
      byAssignee: this.groupBy(tickets, "assignee_name"),
      byRequester: this.groupBy(tickets, "requester_name"),
      byRelease: this.groupBy(tickets, "release_name"),
      withRelease: tickets.filter((t) => t.has_release).length,
      withoutRelease: tickets.filter((t) => !t.has_release).length,
      avgDaysSinceCreated: this.calculateAverage(
        tickets.map((t) => t.days_since_created)
      ),
      avgDaysSinceUpdated: this.calculateAverage(
        tickets.map((t) => t.days_since_updated)
      ),
    };

    return stats;
  }

  /**
   * Get chart data formatted for NIVO components
   * @param {Array} tickets - Ticket data
   * @returns {Object} Chart data for different chart types
   */
  getChartData(tickets) {
    const stats = this.getTicketStatistics(tickets);

    return {
      typeDistribution: this.formatForPieChart(stats.byType, "Type"),
      priorityDistribution: this.formatForPieChart(
        stats.byPriority,
        "Priority"
      ),
      statusDistribution: this.formatForBarChart(
        stats.byStatus,
        "Status",
        "Count"
      ),
      assigneeWorkload: this.formatForBarChart(
        Object.fromEntries(
          Object.entries(stats.byAssignee)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10) // Top 10 assignees
        ),
        "Assignee",
        "Tickets"
      ),
      releaseDistribution: this.formatForBarChart(
        Object.fromEntries(
          Object.entries(stats.byRelease)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 8) // Top 8 releases
        ),
        "Release",
        "Tickets"
      ),
      timelineData: this.getTimelineData(tickets),
    };
  }

  /**
   * Format data for pie charts
   */
  formatForPieChart(data, label) {
    return Object.entries(data).map(([key, value]) => ({
      id: key,
      label: key,
      value: value,
    }));
  }

  /**
   * Format data for bar charts
   */
  formatForBarChart(data, indexKey, valueKey) {
    return Object.entries(data).map(([key, value]) => ({
      [indexKey]: key,
      [valueKey]: value,
    }));
  }

  /**
   * Get timeline data for line charts
   * Shows tickets created vs resolved over time
   */
  getTimelineData(tickets) {
    // Group tickets by creation date (by month)
    const monthlyData = {};

    tickets.forEach((ticket) => {
      // Track created tickets by month
      const createdDate = new Date(ticket.created_at);
      const createdMonthKey = `${createdDate.getFullYear()}-${String(
        createdDate.getMonth() + 1
      ).padStart(2, "0")}`;

      if (!monthlyData[createdMonthKey]) {
        monthlyData[createdMonthKey] = { created: 0, resolved: 0 };
      }

      monthlyData[createdMonthKey].created++;

      // Track resolved tickets by their resolution month (if they have updated_at and are Released)
      if (ticket.status === "Released" && ticket.updated_at) {
        const resolvedDate = new Date(ticket.updated_at);
        const resolvedMonthKey = `${resolvedDate.getFullYear()}-${String(
          resolvedDate.getMonth() + 1
        ).padStart(2, "0")}`;

        if (!monthlyData[resolvedMonthKey]) {
          monthlyData[resolvedMonthKey] = { created: 0, resolved: 0 };
        }

        monthlyData[resolvedMonthKey].resolved++;
      }
    });

    // Ensure we have at least 6 months of data for better visualization
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { created: 0, resolved: 0 };
      }
    }

    // Convert to NIVO line chart format
    const sortedMonths = Object.keys(monthlyData).sort();

    return [
      {
        id: "Created",
        data: sortedMonths.map((month) => ({
          x: month,
          y: monthlyData[month].created,
        })),
      },
      {
        id: "Resolved",
        data: sortedMonths.map((month) => ({
          x: month,
          y: monthlyData[month].resolved,
        })),
      },
    ];
  }

  /**
   * Update a ticket
   * @param {string} ticketId - Ticket ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated ticket data
   */
  async updateTicket(ticketId, updateData) {
    try {
      const { data, error } = await this.supabase
        .from("tickets")
        .update(updateData)
        .eq("id", ticketId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error updating ticket ${ticketId}:`, error);
      throw error;
    }
  }

  /**
   * Export data to CSV format
   * @param {Array} tickets - Ticket data
   * @returns {string} CSV content
   */
  exportToCSV(tickets) {
    if (!tickets || tickets.length === 0) {
      return "No data to export";
    }

    const headers = [
      "Ticket ID",
      "Title",
      "Type",
      "Priority",
      "Status",
      "Requester",
      "Assignee",
      "Release",
      "Support Area",
      "Created Date",
      "Updated Date",
      "Days Since Created",
      "Days Since Updated",
      "Description",
      "Solution Notes",
      "Test Notes",
    ];

    const csvRows = [
      headers.join(","),
      ...tickets.map((ticket) =>
        [
          `"${ticket.id || ""}"`,
          `"${(ticket.title || "").replace(/"/g, '""')}"`,
          `"${ticket.type || ""}"`,
          `"${ticket.priority || ""}"`,
          `"${ticket.status || ""}"`,
          `"${ticket.requester_name || ""}"`,
          `"${ticket.assignee_name || ""}"`,
          `"${ticket.release_name || ""}"`,
          `"${ticket.supportArea || ""}"`,
          `"${
            ticket.created_at
              ? new Date(ticket.created_at).toLocaleDateString()
              : ""
          }"`,
          `"${
            ticket.updated_at
              ? new Date(ticket.updated_at).toLocaleDateString()
              : ""
          }"`,
          `"${ticket.days_since_created || 0}"`,
          `"${ticket.days_since_updated || 0}"`,
          `"${(ticket.description || "")
            .replace(/"/g, '""')
            .substring(0, 200)}"`,
          `"${(ticket.solutionnotes || "")
            .replace(/"/g, '""')
            .substring(0, 200)}"`,
          `"${(ticket.testNotes || "").replace(/"/g, '""').substring(0, 200)}"`,
        ].join(",")
      ),
    ];

    return csvRows.join("\n");
  }

  /**
   * Helper methods
   */
  groupBy(array, key) {
    return array.reduce((groups, item) => {
      const value = item[key] || "Unknown";
      groups[value] = (groups[value] || 0) + 1;
      return groups;
    }, {});
  }

  calculateDaysSince(dateString) {
    if (!dateString) return 0;
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  calculateAverage(numbers) {
    if (!numbers || numbers.length === 0) return 0;
    const sum = numbers.reduce((a, b) => a + b, 0);
    return Math.round(sum / numbers.length);
  }

  /**
   * Download CSV file
   */
  downloadCSV(csvContent, filename = "ticket-report.csv") {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}

export default ReportDataService;
