import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Dashboard.css";
import SupabaseTest from "./SupabaseTest";
import UpcomingDeployments from "./dashboard/UpcomingDeployments";
import RecentTicketsTable from "./dashboard/RecentTicketsTable";
import Jumbotron from "./dashboard/Jumbotron";
import TicketModal from "./tickets/TicketModal";
import ReleaseModal from "./releases/ReleaseModal";
import NotificationToast from "./common/NotificationToast";
import { useApp } from "../context/AppContext";

const Dashboard = () => {
  const { supabase, users, releases, refreshData, updateRelease } = useApp();
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedRelease, setSelectedRelease] = useState(null);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    variant: "success",
  });
  const [showSupabaseTest, setShowSupabaseTest] = useState(false);
  const [showJumbotron, setShowJumbotron] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(true);

  // State for ticket metrics
  const [ticketMetrics, setTicketMetrics] = useState({
    thisMonth: {
      logged: 0,
      closed: 0,
      inTesting: 0,
    },
    allTime: {
      logged: 0,
      closed: 0,
    },
  });
  const [metricsLoading, setMetricsLoading] = useState(true);

  // Fetch system settings to determine if Supabase test and jumbotron should be shown
  useEffect(() => {
    const fetchSystemSettings = async () => {
      try {
        const { data: settingsData, error: settingsError } = await supabase
          .from("system_settings")
          .select("setting_key, setting_value")
          .in("setting_key", [
            "show_supabase_connection_test",
            "show_jumbotron",
          ]);

        if (settingsError) {
          console.error("Error fetching system settings:", settingsError);
          // Default to false if there's an error
          setShowSupabaseTest(false);
          setShowJumbotron(false);
        } else if (settingsData && settingsData.length > 0) {
          // Process each setting
          settingsData.forEach((setting) => {
            const settingValue = setting.setting_value;
            const shouldShow = settingValue === true || settingValue === "true";

            if (setting.setting_key === "show_supabase_connection_test") {
              setShowSupabaseTest(shouldShow);
            } else if (setting.setting_key === "show_jumbotron") {
              setShowJumbotron(shouldShow);
            }
          });
        } else {
          // Settings don't exist, create them with default values
          try {
            const defaultSettings = [
              {
                setting_key: "show_supabase_connection_test",
                setting_value: false,
                description: "Show Supabase connection test on dashboard",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
              {
                setting_key: "show_jumbotron",
                setting_value: false,
                description: "Show announcement jumbotron on dashboard",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
            ];

            const { error: insertError } = await supabase
              .from("system_settings")
              .insert(defaultSettings);

            if (insertError) {
              console.error("Error creating default settings:", insertError);
            }
          } catch (insertErr) {
            console.error("Error inserting default settings:", insertErr);
          }
          setShowSupabaseTest(false);
          setShowJumbotron(false);
        }
      } catch (err) {
        console.error("Error fetching system settings:", err);
        setShowSupabaseTest(false);
      } finally {
        setSettingsLoading(false);
      }
    };

    if (supabase) {
      fetchSystemSettings();
    }
  }, [supabase]);

  // Fetch ticket metrics
  useEffect(() => {
    const fetchTicketMetrics = async () => {
      if (!supabase) return;

      try {
        setMetricsLoading(true);

        // Get current month date range
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDayOfMonth = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          0
        );

        const firstDayStr = firstDayOfMonth.toISOString().split("T")[0];
        const lastDayStr = lastDayOfMonth.toISOString().split("T")[0];

        // Fetch all tickets for calculations
        const { data: allTickets, error: ticketsError } = await supabase
          .from("tickets")
          .select("*");

        if (ticketsError) {
          throw ticketsError;
        }

        const tickets = allTickets || [];

        // Calculate This Month metrics
        const thisMonthLogged = tickets.filter((ticket) => {
          const createdDate = new Date(ticket.created_at)
            .toISOString()
            .split("T")[0];
          return createdDate >= firstDayStr && createdDate <= lastDayStr;
        }).length;

        const thisMonthClosed = tickets.filter((ticket) => {
          const updatedDate = new Date(ticket.updated_at)
            .toISOString()
            .split("T")[0];
          const status = ticket.status;
          return (
            updatedDate >= firstDayStr &&
            updatedDate <= lastDayStr &&
            (status === "Released" || status === "Cancelled")
          );
        }).length;

        const thisMonthInTesting = tickets.filter((ticket) => {
          const status = ticket.status;
          return status === "In Testing - Dev" || status === "In Testing - UAT";
        }).length;

        // Calculate All Time metrics
        const allTimeLogged = tickets.length;

        const allTimeClosed = tickets.filter((ticket) => {
          const status = ticket.status;
          return status === "Released" || status === "Cancelled";
        }).length;

        setTicketMetrics({
          thisMonth: {
            logged: thisMonthLogged,
            closed: thisMonthClosed,
            inTesting: thisMonthInTesting,
          },
          allTime: {
            logged: allTimeLogged,
            closed: allTimeClosed,
          },
        });
      } catch (err) {
        console.error("Error fetching ticket metrics:", err);
      } finally {
        setMetricsLoading(false);
      }
    };

    if (supabase) {
      fetchTicketMetrics();
    }
  }, [supabase]);

  const showToast = (message, variant = "success") => {
    setNotification({
      show: true,
      message,
      variant,
    });
  };

  const handleTicketClick = (ticket) => {
    setSelectedTicket(ticket);
  };

  const handleReleaseClick = async (release) => {
    try {
      // Fetch complete release data including related tickets
      const { data: completeRelease, error: releaseError } = await supabase
        .from("releases")
        .select("*")
        .eq("id", release.id)
        .single();

      if (releaseError) {
        console.error("Error fetching release:", releaseError);
        showToast("Failed to load release details", "error");
        return;
      }

      // Fetch related tickets for this release
      const { data: tickets, error: ticketsError } = await supabase
        .from("tickets")
        .select("*")
        .eq("release_id", release.id);

      if (ticketsError) {
        console.error("Error fetching tickets:", ticketsError);
        showToast("Failed to load related tickets", "error");
        return;
      }

      // Create complete release object with tickets
      const releaseWithTickets = {
        ...completeRelease,
        tickets: tickets || [],
      };

      setSelectedRelease(releaseWithTickets);
    } catch (error) {
      console.error("Error loading release:", error);
      showToast("Failed to load release", "error");
    }
  };

  const handleUpdateRelease = async (releaseId, updateData) => {
    try {
      await updateRelease(releaseId, updateData);
      showToast("Release updated successfully!", "success");
      setSelectedRelease(null);
      refreshData();
    } catch (error) {
      console.error("Error updating release:", error);
      showToast("Failed to update release", "error");
      throw error;
    }
  };

  const handleUpdateTicket = async (ticketId, updateData) => {
    try {
      // Update the ticket in the database using the context method
      const updatedTicket = await supabase
        .from("tickets")
        .update(updateData)
        .eq("id", ticketId)
        .select()
        .single();

      if (updatedTicket.error) {
        throw updatedTicket.error;
      }

      // Refresh the data to update all components
      await refreshData();

      // Close the modal and show success message
      setSelectedTicket(null);
      showToast("Ticket updated successfully", "success");

      return updatedTicket.data;
    } catch (error) {
      console.error("Error updating ticket:", error);
      showToast("Failed to update ticket", "error");
      throw error;
    }
  };

  return (
    <div className="dashboard-container">
      {/* Jumbotron - Conditionally shown based on system setting */}
      {showJumbotron && <Jumbotron />}

      {/* This Month Section */}
      <div className="dashboard-section">
        <h3 className="section-title">This Month</h3>
        <div className="dashboard-stats">
          <div className="stat-card">
            <div
              className="stat-icon"
              style={{
                backgroundColor: "rgba(255, 152, 0, 0.1)",
                color: "#ff9800",
              }}
            >
              <i className="bi bi-ticket"></i>
            </div>
            <h2>{metricsLoading ? "..." : ticketMetrics.thisMonth.logged}</h2>
            <p>Tickets Logged</p>
            <span className="stat-subtitle">Created this month</span>
          </div>

          <div className="stat-card">
            <div
              className="stat-icon"
              style={{
                backgroundColor: "rgba(76, 175, 80, 0.1)",
                color: "#4caf50",
              }}
            >
              <i className="bi bi-ticket"></i>
            </div>
            <h2>{metricsLoading ? "..." : ticketMetrics.thisMonth.closed}</h2>
            <p>Tickets Closed</p>
            <span className="stat-subtitle">Released or cancelled</span>
          </div>

          <div className="stat-card">
            <div
              className="stat-icon"
              style={{
                backgroundColor: "rgba(25, 118, 210, 0.1)",
                color: "#1976d2",
              }}
            >
              <i className="bi bi-ticket"></i>
            </div>
            <h2>
              {metricsLoading ? "..." : ticketMetrics.thisMonth.inTesting}
            </h2>
            <p>Tickets In Testing</p>
            <span className="stat-subtitle">Dev or UAT testing</span>
          </div>
        </div>
      </div>

      {/* All Time Section */}
      <div className="dashboard-section">
        <h3 className="section-title">All Time</h3>
        <div className="dashboard-stats">
          <div className="stat-card">
            <div
              className="stat-icon"
              style={{
                backgroundColor: "rgba(255, 152, 0, 0.1)",
                color: "#ff9800",
              }}
            >
              <i className="bi bi-ticket"></i>
            </div>
            <h2>{metricsLoading ? "..." : ticketMetrics.allTime.logged}</h2>
            <p>Tickets Logged</p>
            <span className="stat-subtitle">Total tickets created</span>
          </div>

          <div className="stat-card">
            <div
              className="stat-icon"
              style={{
                backgroundColor: "rgba(76, 175, 80, 0.1)",
                color: "#4caf50",
              }}
            >
              <i className="bi bi-ticket"></i>
            </div>
            <h2>{metricsLoading ? "..." : ticketMetrics.allTime.closed}</h2>
            <p>Tickets Closed</p>
            <span className="stat-subtitle">Released or cancelled</span>
          </div>
        </div>
      </div>

      <div className="dashboard-sections">
        <div className="row">
          <div className="col-md-6">
            <UpcomingDeployments onReleaseClick={handleReleaseClick} />
          </div>
        </div>
      </div>

      <RecentTicketsTable onTicketClick={handleTicketClick} />

      {/* Supabase Connection Test - Conditionally shown based on system setting */}
      {showSupabaseTest && (
        <div className="row mt-4">
          <div className="col-12">
            <SupabaseTest />
          </div>
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
          onRefreshData={refreshData}
          showToast={showToast}
        />
      )}

      {/* Release Modal */}
      {selectedRelease && (
        <ReleaseModal
          release={selectedRelease}
          onClose={() => setSelectedRelease(null)}
          onUpdateRelease={handleUpdateRelease}
          onRefreshData={refreshData}
          showToast={showToast}
          onTicketClick={handleTicketClick}
        />
      )}

      {/* Notification Toast */}
      <NotificationToast
        show={notification.show}
        message={notification.message}
        variant={notification.variant}
        onClose={() => setNotification({ ...notification, show: false })}
      />
    </div>
  );
};

export default Dashboard;
