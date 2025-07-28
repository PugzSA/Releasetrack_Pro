import React, { useState, useEffect } from "react";
import { Download, BarChart3 } from "lucide-react";
import { useApp } from "../context/AppContext";
import ReportFilters from "./reports/ReportFilters";
import ReportCharts from "./reports/ReportCharts";
import ReportTable from "./reports/ReportTable";
import TicketModal from "./tickets/TicketModal";
import NotificationToast from "./common/NotificationToast";
import ReportDataService from "../services/ReportDataService";
import "./Reports.css";

const Reports = () => {
  const { supabase, updateTicket } = useApp();
  const [reportDataService] = useState(() => new ReportDataService(supabase));

  // State management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [users, setUsers] = useState([]);
  const [releases, setReleases] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Global toast state
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    variant: "success",
  });

  // Function to show toast notifications
  const showToast = (message, variant = "success") => {
    setNotification({
      show: true,
      message,
      variant,
    });
  };
  const [currentFilters, setCurrentFilters] = useState({
    reportType: "ticket_analysis",
    timePeriod: "all_time",
    status: [],
    type: [],
    priority: [],
    release_id: [],
    assignee_id: "",
    requester_id: "",
  });

  // Load initial data (users and releases only, no tickets)
  useEffect(() => {
    loadInitialData();
  }, []);

  const getDateRangeFromPeriod = (period) => {
    const now = new Date();
    let dateTo = now.toISOString().split("T")[0];
    let dateFrom;

    switch (period) {
      case "all_time":
        dateFrom = "";
        dateTo = "";
        break;
      case "last_7_days":
        const date7 = new Date(now);
        date7.setDate(date7.getDate() - 7);
        dateFrom = date7.toISOString().split("T")[0];
        break;
      case "last_30_days":
        const date30 = new Date(now);
        date30.setDate(date30.getDate() - 30);
        dateFrom = date30.toISOString().split("T")[0];
        break;
      case "last_90_days":
        const date90 = new Date(now);
        date90.setDate(date90.getDate() - 90);
        dateFrom = date90.toISOString().split("T")[0];
        break;
      case "last_6_months":
        const date6m = new Date(now);
        date6m.setMonth(date6m.getMonth() - 6);
        dateFrom = date6m.toISOString().split("T")[0];
        break;
      case "last_year":
        const date1y = new Date(now);
        date1y.setFullYear(date1y.getFullYear() - 1);
        dateFrom = date1y.toISOString().split("T")[0];
        break;
      default:
        dateFrom = "";
    }

    return { dateFrom, dateTo };
  };

  const loadInitialData = async () => {
    try {
      setLoading(true);

      // Load users and releases for filters only (no tickets)
      const [usersData, releasesData] = await Promise.all([
        supabase
          .from("users")
          .select("*")
          .order("lastName", { ascending: true }),
        supabase
          .from("releases")
          .select("*")
          .order("name", { ascending: true }),
      ]);

      if (usersData.error) throw usersData.error;
      if (releasesData.error) throw releasesData.error;

      setUsers(usersData.data || []);
      setReleases(releasesData.data || []);

      // Don't load any ticket data initially - wait for user to click Generate Report
    } catch (err) {
      console.error("Error loading initial data:", err);
      setError("Failed to load initial filter data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = async (filters) => {
    try {
      setLoading(true);
      setError(null);
      setCurrentFilters(filters);

      // Clear existing data to ensure fresh start
      setTickets([]);
      setChartData(null);

      // Fetch fresh ticket data with filters (always from database)
      const ticketData = await reportDataService.getTicketReportData(filters);
      setTickets(ticketData);

      // Generate chart data from fresh data
      const charts = reportDataService.getChartData(ticketData);
      setChartData(charts);

      // Show success toast
      showToast("Report generated successfully", "success");
    } catch (err) {
      console.error("Error applying filters:", err);
      setError("Failed to generate report. Please try again.");
      // Clear data on error
      setTickets([]);
      setChartData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    const defaultFilters = {
      reportType: "ticket_analysis",
      timePeriod: "all_time",
      status: [],
      type: [],
      priority: [],
      release_id: [],
      assignee_id: "",
      requester_id: "",
    };

    // Clear current data and reset to initial state
    setTickets([]);
    setChartData(null);
    setCurrentFilters(defaultFilters);
    setError(null);
  };

  const handleExportCSV = (ticketsToExport = tickets) => {
    try {
      const csvContent = reportDataService.exportToCSV(ticketsToExport);
      const timestamp = new Date().toISOString().split("T")[0];
      const filename = `ticket-report-${timestamp}.csv`;
      reportDataService.downloadCSV(csvContent, filename);

      // Show success toast
      showToast("CSV report exported successfully", "success");
    } catch (err) {
      console.error("Error exporting CSV:", err);
      setError("Failed to export CSV. Please try again.");
    }
  };

  const handleTicketClick = (ticket) => {
    setSelectedTicket(ticket);
  };

  const handleUpdateTicket = async (ticketId, updateData) => {
    try {
      // Use the proper context method (includes closed_date logic)
      const updatedTicket = await updateTicket(ticketId, updateData);

      // Update the ticket in the current tickets list
      setTickets((prevTickets) =>
        prevTickets.map((ticket) =>
          ticket.id === ticketId ? { ...ticket, ...updatedTicket } : ticket
        )
      );

      // Regenerate chart data with updated tickets
      const updatedTickets = tickets.map((ticket) =>
        ticket.id === ticketId ? { ...ticket, ...updatedTicket } : ticket
      );
      const charts = reportDataService.getChartData(updatedTickets);
      setChartData(charts);

      return updatedTicket;
    } catch (error) {
      console.error("Error updating ticket:", error);
      throw error;
    }
  };

  const handleRefreshData = async () => {
    // Refresh the reports data with current filters
    if (currentFilters) {
      await handleApplyFilters(currentFilters);
    }
  };

  return (
    <div className="reports-container">
      <div className="page-header">
        <div className="header-content">
          <div className="header-text">
            <h1>
              <BarChart3 size={28} className="me-2" />
              Reports & Analytics
            </h1>
          </div>
        </div>
      </div>

      {/* Report Filters */}
      <ReportFilters
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
        users={users}
        releases={releases}
        initialFilters={currentFilters}
      />

      {/* Error Display */}
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Generating report...</p>
        </div>
      )}

      {/* Report Content */}
      {!loading && chartData && (
        <>
          {/* Summary Statistics */}
          <div className="report-summary">
            <div className="summary-card">
              <h3>{tickets.length}</h3>
              <p>Total Tickets</p>
            </div>
            <div className="summary-card">
              <h3>{tickets.filter((t) => t.has_release).length}</h3>
              <p>With Release</p>
            </div>
            <div className="summary-card">
              <h3>{tickets.filter((t) => t.priority === "High").length}</h3>
              <p>High Priority</p>
            </div>
            <div className="summary-card">
              <h3>
                {
                  tickets.filter((t) =>
                    ["Released", "Closed"].includes(t.status)
                  ).length
                }
              </h3>
              <p>Resolved</p>
            </div>
          </div>

          {/* Charts */}
          <ReportCharts
            chartData={chartData}
            reportType={currentFilters.reportType}
          />

          {/* Data Table */}
          <ReportTable
            tickets={tickets}
            onExportCSV={handleExportCSV}
            onTicketClick={handleTicketClick}
          />
        </>
      )}

      {/* Initial State - No data loaded yet */}
      {!loading && !error && !chartData && (
        <div className="empty-state">
          <BarChart3 size={64} className="empty-icon" />
          <h3>Ready to Generate Report</h3>
          <p>
            Click "Generate Report" to fetch the latest data and create your
            analytics report.
          </p>
        </div>
      )}

      {/* Empty Results State - Data was loaded but no results */}
      {!loading && !error && chartData && tickets.length === 0 && (
        <div className="empty-state">
          <BarChart3 size={64} className="empty-icon" />
          <h3>No Data Available</h3>
          <p>
            No tickets match your current filter criteria. Try adjusting your
            filters or check back later.
          </p>
        </div>
      )}

      {/* Ticket Modal */}
      {selectedTicket && (
        <TicketModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          users={users}
          releases={releases}
          onUpdateTicket={handleUpdateTicket}
          onRefreshData={handleRefreshData}
          showToast={showToast}
        />
      )}

      {/* Global Toast Notification */}
      <NotificationToast
        show={notification.show}
        message={notification.message}
        variant={notification.variant}
        onClose={() => setNotification({ ...notification, show: false })}
      />
    </div>
  );
};

export default Reports;
