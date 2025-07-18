import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import SupabaseDataService from "../services/SupabaseDataService";
const dataService = SupabaseDataService;
import { supabase } from "../services/supabase";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Data states
  const [releases, setReleases] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [metadataItems, setMetadataItems] = useState([]);
  const [savedFilters, setSavedFilters] = useState([]);
  const [users, setUsers] = useState([]);

  // Filter states
  const [filters, setFilters] = useState({
    tickets: {
      searchTerm: "",
      supportArea: "",
      type: "",
      priority: "",
      status: "",
      requester_id: "",
      assignee_id: "",
      release_id: "",
    },
    metadata: { searchTerm: "", status: "", type: "" },
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        releasesData,
        ticketsData,
        metadataData,
        allSavedFilters,
        usersData,
      ] = await Promise.all([
        dataService.getReleases(),
        dataService.getTickets(),
        dataService.getMetadataItems(),
        dataService.getSavedFilters(),
        dataService.getUsers(),
      ]);

      setReleases(releasesData || []);
      setTickets(ticketsData || []);
      setMetadataItems(metadataData || []);
      setSavedFilters(allSavedFilters || []);
      setUsers(usersData || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      if (session) {
        await fetchData();
      } else {
        setLoading(false);
      }
    };
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session) {
          fetchData();
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [fetchData]);

  const handleDataUpdate = async (operation, ...args) => {
    setLoading(true);
    try {
      const result = await dataService[operation](...args);
      await fetchData(); // Refetch all data
      return result;
    } catch (err) {
      console.error(`Error during ${operation}:`, err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const selectSavedFilter = (filterId, filterType) => {
    const selected = savedFilters.find((f) => f.id === filterId);
    if (selected) {
      setFilters((prev) => ({
        ...prev,
        [filterType]: selected.filter_criteria,
      }));
    }
  };

  const value = {
    session,
    user,
    loading,
    error,
    releases,
    tickets,
    metadataItems,
    savedFilters,
    filters,
    setFilters,
    users,
    supabase,

    // Auth & Data
    signInWithGoogle: dataService.signInWithGoogle,
    signOut: dataService.signOut,
    refreshData: fetchData,
    createRelease: (data) => handleDataUpdate("createRelease", data),
    updateRelease: (id, data) => handleDataUpdate("updateRelease", id, data),
    deleteRelease: (id) => handleDataUpdate("deleteRelease", id),
    createTicket: (data) => handleDataUpdate("createTicket", data),
    updateTicket: (id, data) => handleDataUpdate("updateTicket", id, data),
    deleteTicket: (id) => handleDataUpdate("deleteTicket", id),
    createMetadataItem: (data) => handleDataUpdate("createMetadataItem", data),
    updateMetadataItem: (id, data) =>
      handleDataUpdate("updateMetadataItem", id, data),
    deleteMetadataItem: (id) => handleDataUpdate("deleteMetadataItem", id),
    saveFilter: (filter) => handleDataUpdate("saveFilter", filter),
    deleteSavedFilter: (id) => handleDataUpdate("deleteSavedFilter", id),
    selectSavedFilter,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  return useContext(AppContext);
};
