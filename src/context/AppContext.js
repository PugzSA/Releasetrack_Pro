import React, { createContext, useState, useEffect, useContext } from 'react';
import dataService from '../services/DataService';
import supabaseDataService from '../services/SupabaseDataService';
import emailService from '../services/EmailService';
import { supabase } from '../services/supabase';
import { setupNotificationTables } from '../utils/setupNotificationTables';

// Use Supabase service if environment variables are set, otherwise fallback to mock data
const service = process.env.REACT_APP_SUPABASE_URL ? supabaseDataService : dataService;

// Create the context
const AppContext = createContext();

// Context provider component
export const AppProvider = ({ children }) => {
  const [releases, setReleases] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [metadataItems, setMetadataItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Initialize email service with Supabase and setup notification tables
  useEffect(() => {
    if (supabase) {
      emailService.setSupabase(supabase);
      
      // Setup notification tables if they don't exist
      const initNotificationTables = async () => {
        try {
          console.log('Initializing notification tables...');
          const result = await setupNotificationTables(supabase);
          
          if (result.success) {
            console.log('✅ Notification tables setup complete');
            
            // Verify tables by attempting to query them
            const { error: prefsError } = await supabase
              .from('user_preferences')
              .select('count(*)', { count: 'exact', head: true });
              
            const { error: logsError } = await supabase
              .from('email_notification_logs')
              .select('count(*)', { count: 'exact', head: true });
              
            if (prefsError) {
              console.warn('⚠️ Warning: user_preferences table may not be properly set up:', prefsError.message);
            } else {
              console.log('✅ user_preferences table verified');
            }
            
            if (logsError) {
              console.warn('⚠️ Warning: email_notification_logs table may not be properly set up:', logsError.message);
            } else {
              console.log('✅ email_notification_logs table verified');
            }
          } else {
            console.warn('⚠️ Notification tables setup failed:', result.error);
          }
        } catch (error) {
          console.error('❌ Error setting up notification tables:', error);
        }
      };
      
      initNotificationTables();
    }
  }, []);

  const [lastTicketNumber, setLastTicketNumber] = useState(3); // Start with 3 so next ticket will be SUP-00004

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch releases
        const releasesData = await service.getReleases();
        setReleases(releasesData);
        
        // Fetch tickets
        const ticketsData = await service.getTickets();
        setTickets(ticketsData);
        
        // Find the highest ticket number to ensure we continue the sequence
        if (ticketsData && ticketsData.length > 0) {
          const ticketNumbers = ticketsData
            .map(ticket => {
              // Extract the numeric part from ticket IDs like SUP-00001
              const match = ticket.id.match(/SUP-(\d+)/);
              return match ? parseInt(match[1], 10) : 0;
            })
            .filter(num => !isNaN(num));
          
          if (ticketNumbers.length > 0) {
            const highestNumber = Math.max(...ticketNumbers);
            setLastTicketNumber(highestNumber);
          }
        }
        
        // Fetch metadata items
        const metadataData = await service.getMetadataItems();
        setMetadataItems(metadataData);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Release CRUD operations
  const addRelease = async (releaseData) => {
    try {
      const newRelease = await service.createRelease(releaseData);
      setReleases([...releases, newRelease]);
      return newRelease;
    } catch (err) {
      setError('Failed to create release');
      throw err;
    }
  };

  const updateRelease = async (id, releaseData) => {
    try {
      const updatedRelease = await service.updateRelease(id, releaseData);
      setReleases(releases.map(release => 
        release.id === parseInt(id) ? updatedRelease : release
      ));
      return updatedRelease;
    } catch (err) {
      setError('Failed to update release');
      throw err;
    }
  };

  const deleteRelease = async (id) => {
    try {
      await service.deleteRelease(id);
      setReleases(releases.filter(release => release.id !== parseInt(id)));
      return true;
    } catch (err) {
      setError('Failed to delete release');
      throw err;
    }
  };

  // Ticket CRUD operations
  const addTicket = async (ticketData) => {
    try {
      // Generate the next ticket number
      const nextNumber = lastTicketNumber + 1;
      const paddedNumber = String(nextNumber).padStart(5, '0');
      const ticketId = `SUP-${paddedNumber}`;
      
      // Override any provided ID with our auto-generated one
      const ticketWithId = {
        ...ticketData,
        id: ticketId
      };
      
      const newTicket = await service.createTicket(ticketWithId);
      setTickets([...tickets, newTicket]);
      setLastTicketNumber(nextNumber); // Update the last ticket number
      return newTicket;
    } catch (err) {
      setError('Failed to create ticket');
      throw err;
    }
  };

  const updateTicket = async (id, updatedTicket) => {
    try {
      setLoading(true);
      
      // Get the current ticket to compare status and assignee
      const currentTicket = tickets.find(ticket => ticket.id === id);
      const statusChanged = currentTicket && currentTicket.status !== updatedTicket.status;
      const assigneeChanged = currentTicket && currentTicket.assignee !== updatedTicket.assignee;
      
      // Update the ticket in the database
      const updatedTicketData = await service.updateTicket(id, updatedTicket);
      
      // Update the tickets state
      setTickets(tickets.map(ticket => ticket.id === id ? updatedTicketData : ticket));
      
      // Get current user info for notification context
      let currentUser = null;
      if (supabase) {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        
        if (userError || !userData?.user) {
          console.log('No authenticated user found, using mock user for notification context');
          // Use a mock user for development
          currentUser = {
            id: '00000000-0000-0000-0000-000000000001',
            email: 'kyle.cockcroft@watchmakergenomics.com',
            user_metadata: {
              full_name: 'Kyle Cockcroft'
            }
          };
        } else {
          currentUser = userData.user;
        }
      }
      
      // If status or assignee changed, send email notification
      if ((statusChanged || assigneeChanged) && supabase) {
        try {
          // Get assignee and requester information
          const recipients = [];
          
          // Helper function to fetch user data by ID
          const fetchUserData = async (userId) => {
            if (!userId) return null;
            
            console.log(`🔍 Fetching user data for userId: ${userId}`);
            console.log(`🔍 Query: SELECT id, email, firstName, lastName FROM users WHERE id = ${userId}`);
            
            let data = null;
            let userData = null;
            
            try {
              // Log the full query details for debugging
              const queryStart = new Date();
              console.log(`🔍 Starting Supabase query at ${queryStart.toISOString()}`);
              console.log(`🔍 Table: users`);
              console.log(`🔍 Columns: id, email, firstName, lastName`);
              console.log(`🔍 Filter: id = ${userId} (type: ${typeof userId})`);
              
              // Try multiple approaches to find the user
              // First, try direct match with the ID as-is
              console.log(`🔍 First attempt: Trying exact ID match with: ${userId} (${typeof userId})`);
              let result = await supabase
                .from('users')
                .select('id, email, firstName, lastName')
                .eq('id', userId)
                .single();
              
              // If that fails and userId is a string that could be a number, try with parsed number
              if (!result.data && typeof userId === 'string') {
                const numId = parseInt(userId, 10);
                if (!isNaN(numId)) {
                  console.log(`🔍 Second attempt: Trying with parsed numeric ID: ${numId}`);
                  result = await supabase
                    .from('users')
                    .select('id, email, firstName, lastName')
                    .eq('id', numId)
                    .single();
                }
              }
              
              // If that still fails and userId is a number, try with string version
              if (!result.data && typeof userId === 'number') {
                const strId = userId.toString();
                console.log(`🔍 Third attempt: Trying with string ID: ${strId}`);
                result = await supabase
                  .from('users')
                  .select('id, email, firstName, lastName')
                  .eq('id', strId)
                  .single();
              }
              
              data = result.data;
              const error = result.error;
              
              const queryEnd = new Date();
              console.log(`🔍 Query completed in ${queryEnd - queryStart}ms`);
              
              if (error) {
                console.warn(`⚠️ Error fetching user data from Supabase:`, error.message);
                console.warn(`⚠️ Error details:`, error);
                
                // Let's try a broader query to see what users exist
                console.log(`🔍 Trying a broader query to see what users exist in the database...`);
                const { data: allUsers, error: listError } = await supabase
                  .from('users')
                  .select('*')  // Select all columns to see the full schema
                  .limit(5);
                
                if (listError) {
                  console.warn(`⚠️ Error listing users:`, listError.message);
                } else {
                  console.log(`🔍 Found ${allUsers?.length || 0} users in database:`);
                  if (allUsers && allUsers.length > 0) {
                    // Log the first user to see all available columns
                    console.log(`🔍 First user schema:`, Object.keys(allUsers[0]));
                    console.log(`🔍 First user data:`, allUsers[0]);
                    
                    // Check if there's a user with the ID we're looking for
                    const matchingUser = allUsers.find(u => {
                      // Try different formats of ID comparison
                      return u.id == userId || 
                             (typeof u.id === 'number' && u.id === parseInt(userId)) ||
                             (typeof u.id === 'string' && u.id === userId.toString());
                    });
                    
                    if (matchingUser) {
                      console.log(`🔍 Found matching user in results:`, matchingUser);
                      userData = matchingUser; // Use this user directly
                    } else {
                      console.log(`🔍 No matching user found in sample results`);
                    }
                  }
                }
              }
              
              console.log(`🔍 Query result:`, data ? 'Data found' : 'No data found');
              if (data) {
                console.log(`🔍 User data:`, JSON.stringify(data, null, 2));
              }
            } catch (err) {
              console.error(`❌ Unexpected error in fetchUserData:`, err);
            }
            
            if (data) {
              // Construct a proper user object with all needed fields
              // Note: The users table has firstName and lastName columns (camelCase)
              const fullName = `${data.firstName || ''} ${data.lastName || ''}`.trim();
              userData = {
                id: data.id,
                email: data.email,
                name: fullName,  // Construct name from firstName + lastName
                firstname: data.firstName,  // Map to our expected property names
                lastname: data.lastName
              };
              
              console.log(`✅ Found user in database:`, {
                id: userData.id,
                email: userData.email || 'MISSING EMAIL',
                name: fullName || 'MISSING NAME'
              });
              
              // Validate the email address
              if (!userData.email || !userData.email.includes('@')) {
                console.warn(`⚠️ User ${userData.id} has invalid or missing email: ${userData.email}`);
              }
              
              return userData;
            } else {
              console.log('⚠️ No user found in database, using mock user data for development');
              
              // Mock user data for development - map by both ID and name
              const mockUsers = {
                // By ID
                '1': { id: '1', email: 'bob@gmail.com', name: 'Bob Burger' },
                '2': { id: '2', email: 'kyle.cockcroft@watchmakergenomics.com', name: 'Kyle Cockcroft' },
                '3': { id: '3', email: 'ann.meyers@watchmakergenomics.com', name: 'Ann Meyers' },
                
                // By name
                'Kyle Cockcroft': { id: '2', email: 'kyle.cockcroft@watchmakergenomics.com', name: 'Kyle Cockcroft' },
                'Bob Burger': { id: '1', email: 'bob@gmail.com', name: 'Bob Burger' },
                'Ann Meyers': { id: '3', email: 'ann.meyers@watchmakergenomics.com', name: 'Ann Meyers' }
              };
              
              // Try to find the user in our mock data
              const mockUser = mockUsers[userId] || { 
                id: typeof userId === 'string' ? userId.replace(/[^a-zA-Z0-9]/g, '') : 'unknown', 
                email: `${typeof userId === 'string' ? userId.replace(/[^a-zA-Z0-9]/g, '') : 'unknown'}@example.com`, 
                name: typeof userId === 'string' ? userId : 'Unknown User' 
              };
              
              console.log(`🔁 Using mock user data:`, mockUser);
              return mockUser;
            }
          };
          
          // Get assignee data if available using assignee_id
          if (updatedTicket.assignee_id) {
            console.log(`🔍 Using assignee_id: ${updatedTicket.assignee_id} from ticket`);
            const assigneeData = await fetchUserData(updatedTicket.assignee_id);
            if (assigneeData?.email) {
              recipients.push({
                id: assigneeData.id,
                email: assigneeData.email,
                name: assigneeData.name // name is already constructed in fetchUserData
              });
              console.log(`✅ Added assignee to recipients: ${assigneeData.email}`);
            }
          } else if (updatedTicket.assignee) {
            // Fallback to legacy assignee field if assignee_id is not available
            console.log(`⚠️ No assignee_id found, falling back to assignee: ${updatedTicket.assignee}`);
            const assigneeData = await fetchUserData(updatedTicket.assignee);
            if (assigneeData?.email) {
              recipients.push({
                id: assigneeData.id,
                email: assigneeData.email,
                name: assigneeData.name // name is already constructed in fetchUserData
              });
              console.log(`✅ Added assignee to recipients: ${assigneeData.email}`);
            }
          }
          
          // Get requester data if available using requester_id
          if (updatedTicket.requester_id) {
            console.log(`🔍 Using requester_id: ${updatedTicket.requester_id} from ticket`);
            const requesterData = await fetchUserData(updatedTicket.requester_id);
            if (requesterData?.email) {
              recipients.push({
                id: requesterData.id,
                email: requesterData.email,
                name: requesterData.name // name is already constructed in fetchUserData
              });
              console.log(`✅ Added requester to recipients: ${requesterData.email}`);
            }
          } else if (updatedTicket.requester) {
            // Fallback to legacy requester field if requester_id is not available
            console.log(`⚠️ No requester_id found, falling back to requester: ${updatedTicket.requester}`);
            const requesterData = await fetchUserData(updatedTicket.requester);
            if (requesterData?.email) {
              recipients.push({
                id: requesterData.id,
                email: requesterData.email,
                name: requesterData.name // name is already constructed in fetchUserData
              });
              console.log(`✅ Added requester to recipients: ${requesterData.email}`);
            }
          }
          
          // If we have recipients, send the appropriate notifications
          if (recipients.length > 0) {
            // Send status change notification
            if (statusChanged) {
              await emailService.sendTicketStatusChangeEmail({
                ticket: updatedTicketData,
                previousStatus: currentTicket.status,
                user: currentUser,
                recipients
              });
            }
            
            // Send assignee change notification
            if (assigneeChanged) {
              // Get previous assignee name
              let previousAssigneeName = 'Unassigned';
              if (currentTicket.assignee) {
                const prevAssigneeData = await fetchUserData(currentTicket.assignee);
                previousAssigneeName = prevAssigneeData?.name || 'Unknown';
              }
              
              // Get new assignee name
              let newAssigneeName = 'Unassigned';
              if (updatedTicket.assignee) {
                const newAssigneeData = await fetchUserData(updatedTicket.assignee);
                newAssigneeName = newAssigneeData?.name || 'Unknown';
              }
              
              await emailService.sendAssigneeChangeEmail({
                ticket: updatedTicketData,
                previousAssignee: previousAssigneeName,
                user: currentUser,
                recipients
              });
            }
          }
        } catch (emailError) {
          console.error('Error sending email notification:', emailError);
          // Don't throw the error, as we still want the ticket update to succeed
        }
      }
      
      setLoading(false);
      return updatedTicketData;
    } catch (err) {
      setLoading(false);
      setError('Failed to update ticket');
      throw err;
    }
  };

  const deleteTicket = async (id) => {
    try {
      await service.deleteTicket(id);
      setTickets(tickets.filter(ticket => ticket.id !== id));
      return true;
    } catch (err) {
      setError('Failed to delete ticket');
      throw err;
    }
  };

  // Metadata CRUD operations
  const addMetadataItem = async (metadataData) => {
    try {
      const newMetadataItem = await service.createMetadataItem(metadataData);
      setMetadataItems([...metadataItems, newMetadataItem]);
      return newMetadataItem;
    } catch (err) {
      setError('Failed to create metadata item');
      throw err;
    }
  };

  const updateMetadataItem = async (id, metadataData) => {
    try {
      const updatedMetadataItem = await service.updateMetadataItem(id, metadataData);
      setMetadataItems(metadataItems.map(item => 
        item.id === parseInt(id) ? updatedMetadataItem : item
      ));
      return updatedMetadataItem;
    } catch (err) {
      setError('Failed to update metadata item');
      throw err;
    }
  };

  const deleteMetadataItem = async (id) => {
    try {
      await service.deleteMetadataItem(id);
      setMetadataItems(metadataItems.filter(item => item.id !== parseInt(id)));
      return true;
    } catch (err) {
      setError('Failed to delete metadata item');
      throw err;
    }
  };

  // Clear any error messages
  const clearError = () => {
    setError(null);
  };

  return (
    <AppContext.Provider
      value={{
        releases,
        tickets,
        metadataItems,
        loading,
        error,
        addRelease,
        updateRelease,
        deleteRelease,
        addTicket,
        updateTicket,
        deleteTicket,
        addMetadataItem,
        updateMetadataItem,
        deleteMetadataItem,
        clearError,
        supabase,
        emailService
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export default AppContext;
