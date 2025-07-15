import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Spinner, Button, Form } from 'react-bootstrap';
import { useAppContext } from '../../context/AppContext';

/**
 * Component to display email notification logs
 */
const NotificationLogs = () => {
  const { supabase } = useAppContext();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState({});
  const [filter, setFilter] = useState('all');
  
  // Fetch notification logs
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Check if we have an authenticated user
        const { data: userData, error: userError } = await supabase.auth.getUser();
        
        // For development purposes, use a mock user if no authenticated user exists
        if (userError) {
          console.log('No authenticated user found, using mock user for development');
        }
        
        try {
          // Get logs from the database
          const { data, error } = await supabase
            .from('email_notification_logs')
            .select('*')
            .order('sent_at', { ascending: false })
            .limit(50);
          
          // Check for table existence errors
          if (error) {
            if (error.code === '42P01') { // Table doesn't exist error
              throw new Error('The email_notification_logs table does not exist. The system may need initialization.');
            } else {
              throw error;
            }
          }
          
          setLogs(data || []);
          
          // Fetch users to display names
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id, firstName, lastName, email');
            
          if (userError) throw userError;
          
          // Create a map of user IDs to user data
          const userMap = {};
          if (userData) {
            userData.forEach(user => {
              userMap[user.id] = user;
            });
          }
          
          setUsers(userMap);
        } catch (dbError) {
          console.error('Database error:', dbError);
          setError(`Failed to load notification logs: ${dbError.message}`);
        }
      } catch (err) {
        console.error('Error fetching notification logs:', err);
        setError('Failed to load notification logs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchLogs();
  }, [supabase]);
  
  // Format timestamp
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString();
  };
  
  // Get user name from ID
  const getUserName = (userId) => {
    if (!userId) return 'System';
    const user = users[userId];
    return user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
  };
  
  // Get type badge variant
  const getTypeVariant = (type) => {
    switch (type) {
      case 'status_change':
        return 'primary';
      case 'assignee_change':
        return 'success';
      case 'comment':
        return 'info';
      case 'mention':
        return 'warning';
      default:
        return 'secondary';
    }
  };
  
  // Format notification type for display
  const formatType = (type) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  // Filter logs by type
  const filteredLogs = filter === 'all' 
    ? logs 
    : logs.filter(log => log.type === filter);
  
  return (
    <Card className="mb-4">
      <Card.Header as="h5">
        <i className="bi bi-envelope-paper me-2"></i>
        Email Notification Logs
      </Card.Header>
      <Card.Body>
        {error && (
          <div className="alert alert-danger" role="alert">
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
                      // If successful, try to fetch logs again
                      const { data, error } = await supabase
                        .from('email_notification_logs')
                        .select('*')
                        .order('sent_at', { ascending: false })
                        .limit(50);
                        
                      if (error) throw error;
                      
                      setLogs(data || []);
                      
                      // Also fetch users to display names
                      const { data: userData, error: userError } = await supabase
                        .from('users')
                        .select('id, firstName, lastName, email');
                        
                      if (userError) throw userError;
                      
                      // Create a map of user IDs to user data
                      const userMap = {};
                      if (userData) {
                        userData.forEach(user => {
                          userMap[user.id] = user;
                        });
                      }
                      
                      setUsers(userMap);
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
          </div>
        )}
        
        <div className="d-flex justify-content-between align-items-center mb-3">
          <Form.Group className="d-flex align-items-center">
            <Form.Label className="me-2 mb-0">Filter by type:</Form.Label>
            <Form.Select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{ width: '200px' }}
            >
              <option value="all">All notifications</option>
              <option value="status_change">Status Change</option>
              <option value="assignee_change">Assignee Change</option>
              <option value="comment">Comment</option>
              <option value="mention">Mention</option>
            </Form.Select>
          </Form.Group>
          
          <Button 
            variant="outline-secondary" 
            size="sm"
            onClick={() => {
              setLoading(true);
              setTimeout(() => {
                // Refetch logs
                const fetchLogs = async () => {
                  try {
                    const { data, error } = await supabase
                      .from('email_notification_logs')
                      .select('*')
                      .order('sent_at', { ascending: false })
                      .limit(50);
                      
                    if (error) throw error;
                    setLogs(data || []);
                  } catch (err) {
                    console.error('Error refreshing logs:', err);
                  } finally {
                    setLoading(false);
                  }
                };
                
                fetchLogs();
              }, 300);
            }}
          >
            <i className="bi bi-arrow-clockwise me-1"></i>
            Refresh
          </Button>
        </div>
        
        {loading ? (
          <div className="text-center p-5">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        ) : filteredLogs.length > 0 ? (
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Type</th>
                <th>Ticket</th>
                <th>Sent By</th>
                <th>Recipients</th>
                <th>Sent At</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map(log => (
                <tr key={log.id}>
                  <td>
                    <Badge bg={getTypeVariant(log.type)}>
                      {formatType(log.type)}
                    </Badge>
                  </td>
                  <td>
                    <a href={`/tickets/${log.ticket_id}`}>
                      #{log.ticket_id}
                    </a>
                  </td>
                  <td>{getUserName(log.sender_id)}</td>
                  <td>
                    {log.recipients && log.recipients.length > 0 ? (
                      <span>{log.recipients.length} recipient(s)</span>
                    ) : (
                      <span className="text-muted">None</span>
                    )}
                  </td>
                  <td>{formatDate(log.sent_at)}</td>
                  <td>
                    {log.metadata && log.type === 'status_change' && (
                      <span>
                        {log.metadata.previousStatus} → {log.metadata.newStatus}
                      </span>
                    )}
                    {log.metadata && log.type === 'assignee_change' && (
                      <span>
                        Reassigned
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          logs.length === 0 && !loading && !error && (
          <div className="text-center py-5">
            <div className="mb-3">
              <i className="bi bi-envelope-open text-muted" style={{ fontSize: '3rem' }}></i>
            </div>
            <p className="text-muted">No notification logs found.</p>
            <p className="text-muted small">Email notification logs will appear here after emails are sent.</p>
            <Button 
              variant="outline-primary" 
              size="sm"
              onClick={async () => {
                try {
                  setLoading(true);
                  
                  // Import the EmailService to create a test notification
                  const { default: EmailService } = await import('../../services/EmailService');
                  const emailService = new EmailService();
                  emailService.setSupabase(supabase);
                  
                  // Create a test notification
                  const testTicket = {
                    id: 'TEST-1',
                    title: 'Test Notification',
                    status: 'Open',
                    priority: 'Medium',
                    description: 'This is a test notification',
                    url: '#'
                  };
                  
                  // Get current user
                  const { data: userData } = await supabase.auth.getUser();
                  const currentUser = userData?.user;
                  
                  if (currentUser) {
                    await emailService.sendTicketNotification({
                      ticket: testTicket,
                      subject: 'Test Notification',
                      message: 'This is a test notification to verify the email logging system.',
                      recipients: [{ id: currentUser.id, email: currentUser.email }],
                      notificationType: 'test',
                      user: currentUser
                    });
                    
                    // Refresh logs
                    const { data } = await supabase
                      .from('email_notification_logs')
                      .select('*')
                      .order('sent_at', { ascending: false })
                      .limit(50);
                      
                    setLogs(data || []);
                  }
                } catch (err) {
                  console.error('Error creating test notification:', err);
                  setError(`Failed to create test notification: ${err.message}`);
                } finally {
                  setLoading(false);
                }
              }}
            >
              <i className="bi bi-envelope me-1"></i>
              Create Test Notification
            </Button>
          </div>
        ))}
      </Card.Body>
    </Card>
  );
};

export default NotificationLogs;
