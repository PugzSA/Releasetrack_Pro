import React, { useState, useEffect } from "react";
import { Card, Form, Button, Alert, Spinner } from "react-bootstrap";
import { useApp } from "../../context/AppContext";

const SystemSettings = () => {
  const { supabase } = useApp();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // System settings state
  const [settings, setSettings] = useState({
    emailNotificationsEnabled: true,
    notifyOnStatusChange: true,
    notifyOnAssigneeChange: true,
    notifyOnComments: true,
    notifyOnMentions: true,
    dailyDigest: false,
    showSupabaseConnectionTest: false,
    showJumbotron: false,
  });

  // Fetch system settings from database
  useEffect(() => {
    const fetchSystemSettings = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all system settings
        const { data: settingsData, error: settingsError } = await supabase
          .from("system_settings")
          .select("setting_key, setting_value");

        if (settingsError) {
          throw settingsError;
        }

        // Convert array of settings to object
        const settingsObj = {};
        settingsData.forEach((setting) => {
          const key = setting.setting_key;
          const value = setting.setting_value;

          // Map database keys to component state keys
          switch (key) {
            case "email_notifications_enabled":
              settingsObj.emailNotificationsEnabled = value;
              break;
            case "notify_on_status_change":
              settingsObj.notifyOnStatusChange = value;
              break;
            case "notify_on_assignee_change":
              settingsObj.notifyOnAssigneeChange = value;
              break;
            case "notify_on_comments":
              settingsObj.notifyOnComments = value;
              break;
            case "notify_on_mentions":
              settingsObj.notifyOnMentions = value;
              break;
            case "daily_digest":
              settingsObj.dailyDigest = value;
              break;
            case "show_supabase_connection_test":
              settingsObj.showSupabaseConnectionTest = value;
              break;
            case "show_jumbotron":
              settingsObj.showJumbotron = value;
              break;
            default:
              break;
          }
        });

        setSettings((prevSettings) => ({
          ...prevSettings,
          ...settingsObj,
        }));
      } catch (err) {
        console.error("Error fetching system settings:", err);
        setError("Failed to load system settings. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchSystemSettings();
  }, [supabase]);

  // Handle setting changes
  const handleSettingChange = (e) => {
    const { name, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  // Save system settings
  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      // Prepare updates for each setting
      const updates = [
        {
          setting_key: "email_notifications_enabled",
          setting_value: settings.emailNotificationsEnabled,
        },
        {
          setting_key: "notify_on_status_change",
          setting_value: settings.notifyOnStatusChange,
        },
        {
          setting_key: "notify_on_assignee_change",
          setting_value: settings.notifyOnAssigneeChange,
        },
        {
          setting_key: "notify_on_comments",
          setting_value: settings.notifyOnComments,
        },
        {
          setting_key: "notify_on_mentions",
          setting_value: settings.notifyOnMentions,
        },
        { setting_key: "daily_digest", setting_value: settings.dailyDigest },
        {
          setting_key: "show_supabase_connection_test",
          setting_value: settings.showSupabaseConnectionTest,
        },
        {
          setting_key: "show_jumbotron",
          setting_value: settings.showJumbotron,
        },
      ];

      // Update each setting
      for (const update of updates) {
        // First try to update the existing record
        const { data: updateData, error: updateError } = await supabase
          .from("system_settings")
          .update({
            setting_value: update.setting_value,
            updated_at: new Date().toISOString(),
          })
          .eq("setting_key", update.setting_key)
          .select();

        // If no rows were updated, the setting doesn't exist, so insert it
        if (!updateError && (!updateData || updateData.length === 0)) {
          const { error: insertError } = await supabase
            .from("system_settings")
            .insert({
              setting_key: update.setting_key,
              setting_value: update.setting_value,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });

          if (insertError) {
            console.error(
              "Error inserting setting:",
              update.setting_key,
              insertError
            );
            throw insertError;
          }
        } else if (updateError) {
          console.error(
            "Error updating setting:",
            update.setting_key,
            updateError
          );
          throw updateError;
        }
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Error saving system settings:", err);
      setError("Failed to save system settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center p-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <Card style={{ position: "relative" }}>
      {/* Full-screen loading overlay */}
      {saving && (
        <div className="ticket-modal-loading-overlay">
          <div className="ticket-modal-loading-spinner">
            <div className="loader"></div>
            <p className="loading-text">Saving settings...</p>
          </div>
        </div>
      )}

      <Card.Header>
        <h5 className="mb-0">🔧 System Email Settings</h5>
        <small className="text-muted">
          Global settings that control email notifications for all users
        </small>
      </Card.Header>
      <Card.Body>
        {error && (
          <Alert variant="danger" className="mb-3">
            {error}
          </Alert>
        )}

        {success && (
          <Alert variant="success" className="mb-3">
            System settings saved successfully!
          </Alert>
        )}

        <Form>
          <Form.Group className="mb-4">
            <Form.Check
              type="checkbox"
              id="emailNotificationsEnabled"
              name="emailNotificationsEnabled"
              label={
                <div>
                  <strong>Enable Email Notifications</strong>
                  <div className="text-muted small">
                    Master switch - when disabled, no emails will be sent
                    system-wide
                  </div>
                </div>
              }
              checked={settings.emailNotificationsEnabled}
              onChange={handleSettingChange}
            />
          </Form.Group>

          <fieldset disabled={!settings.emailNotificationsEnabled}>
            <h6 className="mb-3">📧 Email Notification Types</h6>
            <p className="text-muted small mb-3">
              Control which types of events trigger email notifications for all
              users
            </p>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                id="notifyOnStatusChange"
                name="notifyOnStatusChange"
                label="Ticket status changes"
                checked={settings.notifyOnStatusChange}
                onChange={handleSettingChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                id="notifyOnAssigneeChange"
                name="notifyOnAssigneeChange"
                label="Ticket assignments or reassignments"
                checked={settings.notifyOnAssigneeChange}
                onChange={handleSettingChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                id="notifyOnComments"
                name="notifyOnComments"
                label="Comments on tickets"
                checked={settings.notifyOnComments}
                onChange={handleSettingChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                id="notifyOnMentions"
                name="notifyOnMentions"
                label="@mentions in comments"
                checked={settings.notifyOnMentions}
                onChange={handleSettingChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                id="dailyDigest"
                name="dailyDigest"
                label="Daily digest emails"
                checked={settings.dailyDigest}
                onChange={handleSettingChange}
              />
            </Form.Group>
          </fieldset>

          <fieldset className="mb-4">
            <legend className="h6 mb-3">General Settings</legend>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                id="showSupabaseConnectionTest"
                name="showSupabaseConnectionTest"
                label={
                  <div>
                    <strong>Show Supabase Connection Test</strong>
                    <div className="text-muted small">
                      Display the Supabase connection test section on the
                      dashboard
                    </div>
                  </div>
                }
                checked={settings.showSupabaseConnectionTest}
                onChange={handleSettingChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                id="showJumbotron"
                name="showJumbotron"
                label={
                  <div>
                    <strong>Show Dashboard Jumbotron</strong>
                    <div className="text-muted small">
                      Display the announcement jumbotron at the top of the
                      dashboard
                    </div>
                  </div>
                }
                checked={settings.showJumbotron}
                onChange={handleSettingChange}
              />
            </Form.Group>
          </fieldset>

          <div className="d-flex justify-content-end mt-4">
            <Button variant="primary" onClick={handleSave} disabled={saving}>
              Save System Settings
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default SystemSettings;
