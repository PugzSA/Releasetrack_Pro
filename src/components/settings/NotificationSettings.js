import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useApp } from '../../context/AppContext';

const NotificationSettings = () => {
  const { supabase } = useApp();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // Notification preferences
  const [preferences, setPreferences] = useState({
    emailNotificationsEnabled: true,
    notifyOnStatusChange: true,
    notifyOnAssigneeChange: true,
    notifyOnComments: true,
    notifyOnMentions: true,
    dailyDigest: false
  });
  
  // Fetch current user and their notification preferences
  useEffect(() => {
    const fetchUserAndPreferences = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get current user
        const { data: userData, error: userError } = await supabase.auth.getUser();
        
        // Check if we have an authenticated user
        if (userError) {
          console.error('Auth error:', userError);
          // For development purposes, create a mock user if no authenticated user exists
          const mockUser = {
            id: '00000000-0000-0000-0000-000000000000',
            email: 'dev@example.com',
            user_metadata: {
              full_name: 'Development User'
            }
          };
          setCurrentUser(mockUser);
          console.log('Using mock user for development:', mockUser);
        } else if (userData?.user) {
          setCurrentUser(userData.user);
          
          // Check if user_preferences table exists
          try {
            // Fetch user preferences from the database
            const { data: prefsData, error: prefsError } = await supabase
              .from('user_preferences')
              .select('*')
              .eq('user_id', userData.user.id)
              .single();
              
            if (prefsError) {
              // If it's not a "no rows returned" error, it might be a table issue
              if (prefsError.code !== 'PGRST116') {
                console.error('Error fetching preferences:', prefsError);
                
                // Check if the table exists
                if (prefsError.code === '42P01') { // Table doesn't exist error
                  throw new Error('The user_preferences table does not exist. The system may need initialization.');
                } else {
                  throw prefsError;
                }
              }
            }
            
            // If preferences exist, use them
            if (prefsData) {
              setPreferences({
                emailNotificationsEnabled: prefsData.email_notifications_enabled ?? true,
                notifyOnStatusChange: prefsData.notify_on_status_change ?? true,
                notifyOnAssigneeChange: prefsData.notify_on_assignee_change ?? true,
                notifyOnComments: prefsData.notify_on_comments ?? true,
                notifyOnMentions: prefsData.notify_on_mentions ?? true,
                dailyDigest: prefsData.daily_digest ?? false
              });
            } else {
              // No preferences found for this user, create default preferences
              console.log('Creating default preferences for user:', userData.user.id);
              
              const defaultPrefs = {
                user_id: userData.user.id,
                email_notifications_enabled: true,
                notify_on_status_change: true,
                notify_on_assignee_change: true,
                notify_on_comments: true,
                notify_on_mentions: true,
                daily_digest: false
              };
              
              // Insert default preferences
              const { error: insertError } = await supabase
                .from('user_preferences')
                .insert(defaultPrefs);
                
              if (insertError) {
                console.error('Error creating default preferences:', insertError);
                throw new Error(`Failed to create default preferences: ${insertError.message}`);
              } else {
                console.log('Default preferences created successfully');
                // Set the default preferences in state
                setPreferences({
                  emailNotificationsEnabled: true,
                  notifyOnStatusChange: true,
                  notifyOnAssigneeChange: true,
                  notifyOnComments: true,
                  notifyOnMentions: true,
                  dailyDigest: false
                });
              }
            }
          } catch (tableError) {
            console.error('Table error:', tableError);
            setError(`Failed to load notification preferences: ${tableError.message}`);
          }
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load notification preferences. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserAndPreferences();
  }, [supabase]);
  
  // Handle preference changes
  const handlePreferenceChange = (e) => {
    const { name, checked } = e.target;
    setPreferences(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  // Save preferences
  const handleSave = async () => {
    if (!currentUser) return;
    
    try {
      setSaving(true);
      setError(null);
      
      // Convert preferences to database format
      const prefsData = {
        user_id: currentUser.id,
        email_notifications_enabled: preferences.emailNotificationsEnabled,
        notify_on_status_change: preferences.notifyOnStatusChange,
        notify_on_assignee_change: preferences.notifyOnAssigneeChange,
        notify_on_comments: preferences.notifyOnComments,
        notify_on_mentions: preferences.notifyOnMentions,
        daily_digest: preferences.dailyDigest,
        updated_at: new Date().toISOString()
      };
      
      // Upsert preferences (insert if not exists, update if exists)
      const { error: saveError } = await supabase
        .from('user_preferences')
        .upsert(prefsData, { onConflict: 'user_id' });
        
      if (saveError) throw saveError;
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving preferences:', err);
      setError('Failed to save notification preferences. Please try again.');
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
    <Card className="mb-4">
      <Card.Header as="h5">
        <i className="bi bi-bell me-2"></i>
        Email Notification Settings
      </Card.Header>
      <Card.Body>
        {error && (
          <Alert variant="danger" className="mb-4">
            {error}
            <div className="mt-2">
              <Button 
                variant="outline-danger" 
                size="sm"
                onClick={async () => {
                  try {
                    setLoading(true);
                    setError(null);
                    
                    // Import the setup function

                    
                    // Try to initialize the tables

                    
                    if (result.success) {
                      // If successful, try to fetch preferences again
                      if (currentUser) {
                        const { data: prefsData } = await supabase
                          .from('user_preferences')
                          .select('*')
                          .eq('user_id', currentUser.id)
                          .single();
                          
                        if (prefsData) {
                          setPreferences({
                            emailNotificationsEnabled: prefsData.email_notifications_enabled ?? true,
                            notifyOnStatusChange: prefsData.notify_on_status_change ?? true,
                            notifyOnAssigneeChange: prefsData.notify_on_assignee_change ?? true,
                            notifyOnComments: prefsData.notify_on_comments ?? true,
                            notifyOnMentions: prefsData.notify_on_mentions ?? true,
                            dailyDigest: prefsData.daily_digest ?? false
                          });
                        }
                      }
                      
                      setSuccess(true);
                      setTimeout(() => setSuccess(false), 3000);
                    } else {
                      setError(`Initialization failed: ${result.error?.message || 'Unknown error'}`);
                    }
                  } catch (err) {
                    console.error('Error during initialization:', err);
                    setError(`Failed to initialize notification tables: ${err.message}`);
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                <i className="bi bi-arrow-clockwise me-1"></i>
                Initialize Notification System
              </Button>
            </div>
          </Alert>
        )}
        
        {success && (
          <Alert variant="success" className="mb-4">
            Your notification preferences have been saved successfully.
          </Alert>
        )}
        
        <Form>
          <Form.Group className="mb-4">
            <Form.Check 
              type="switch"
              id="emailNotificationsEnabled"
              name="emailNotificationsEnabled"
              label="Enable email notifications"
              checked={preferences.emailNotificationsEnabled}
              onChange={handlePreferenceChange}
              className="mb-2"
            />
            <Form.Text className="text-muted">
              Master switch for all email notifications. Turn this off to stop receiving any emails from the system.
            </Form.Text>
          </Form.Group>
          
          <fieldset disabled={!preferences.emailNotificationsEnabled}>
            <h6 className="mb-3">Notify me when:</h6>
            
            <Form.Group className="mb-3">
              <Form.Check 
                type="checkbox"
                id="notifyOnStatusChange"
                name="notifyOnStatusChange"
                label="A ticket status changes"
                checked={preferences.notifyOnStatusChange}
                onChange={handlePreferenceChange}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Check 
                type="checkbox"
                id="notifyOnAssigneeChange"
                name="notifyOnAssigneeChange"
                label="A ticket is assigned or reassigned"
                checked={preferences.notifyOnAssigneeChange}
                onChange={handlePreferenceChange}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Check 
                type="checkbox"
                id="notifyOnComments"
                name="notifyOnComments"
                label="Someone comments on a ticket I'm involved with"
                checked={preferences.notifyOnComments}
                onChange={handlePreferenceChange}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Check 
                type="checkbox"
                id="notifyOnMentions"
                name="notifyOnMentions"
                label="I'm mentioned in a comment (@username)"
                checked={preferences.notifyOnMentions}
                onChange={handlePreferenceChange}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Check 
                type="checkbox"
                id="dailyDigest"
                name="dailyDigest"
                label="Send me a daily digest of ticket updates"
                checked={preferences.dailyDigest}
                onChange={handlePreferenceChange}
              />
            </Form.Group>
          </fieldset>
          
          <div className="d-flex justify-content-end mt-4">
            <Button 
              variant="primary" 
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Saving...
                </>
              ) : (
                'Save Preferences'
              )}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default NotificationSettings;
