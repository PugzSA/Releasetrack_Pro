import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import WikiSidebar from "./WikiSidebar";
import WikiEditor from "./WikiEditor";
import WikiViewer from "./WikiViewer";
import NewPageModal from "./NewPageModal";
import NotificationToast from "../common/NotificationToast";
import { FileText, Plus, Edit3, Eye, Folder, FolderOpen } from "lucide-react";
import "./Wiki.css";

const Wiki = () => {
  const { supabase, user } = useApp();
  const [wikiPages, setWikiPages] = useState([]);
  const [selectedPage, setSelectedPage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showNewPageModal, setShowNewPageModal] = useState(false);
  const [newPageParent, setNewPageParent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "info",
  });

  // Fetch all wiki pages
  useEffect(() => {
    fetchWikiPages();
  }, [supabase]);

  const fetchWikiPages = async () => {
    if (!supabase) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("wiki_pages")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;

      setWikiPages(data || []);

      // Auto-select first page if none selected
      if (!selectedPage && data && data.length > 0) {
        const firstPage = data.find((page) => !page.is_folder);
        if (firstPage) {
          setSelectedPage(firstPage);
        }
      }
    } catch (err) {
      console.error("Error fetching wiki pages:", err);
      setError("Failed to load wiki pages");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  const handlePageSelect = (page) => {
    if (page.is_folder) return; // Don't select folders
    setSelectedPage(page);
    setIsEditing(false);
  };

  const handleNewPage = (parentId = null) => {
    setNewPageParent(parentId);
    setShowNewPageModal(true);
  };

  const handleCreatePage = async (pageData) => {
    try {
      // Generate unique page ID
      const { data: existingPages, error: fetchError } = await supabase
        .from("wiki_pages")
        .select("id")
        .like("id", "WIKI-%")
        .order("id", { ascending: false })
        .limit(1);

      if (fetchError) throw fetchError;

      let nextNumber = 1;
      if (existingPages && existingPages.length > 0) {
        const lastId = existingPages[0].id;
        const lastNumber = parseInt(lastId.replace("WIKI-", ""));
        nextNumber = lastNumber + 1;
      }

      const newPageId = `WIKI-${String(nextNumber).padStart(5, "0")}`;

      // Create slug from title
      const slug = pageData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      const newPage = {
        id: newPageId,
        title: pageData.title,
        slug: slug,
        content: pageData.content || "",
        parent_id: pageData.parent_id,
        is_folder: pageData.is_folder || false,
        sort_order: pageData.sort_order || 0,
        created_by: user?.id,
        updated_by: user?.id,
      };

      const { data, error } = await supabase
        .from("wiki_pages")
        .insert(newPage)
        .select()
        .single();

      if (error) throw error;

      await fetchWikiPages();
      setShowNewPageModal(false);

      if (!data.is_folder) {
        setSelectedPage(data);
      }

      showToast(`${data.is_folder ? "Folder" : "Page"} created successfully!`);
    } catch (err) {
      console.error("Error creating page:", err);
      showToast("Failed to create page", "error");
    }
  };

  const handleUpdatePage = async (pageId, updateData) => {
    try {
      const { data, error } = await supabase
        .from("wiki_pages")
        .update({
          ...updateData,
          updated_by: user?.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", pageId)
        .select()
        .single();

      if (error) throw error;

      await fetchWikiPages();
      setSelectedPage(data);
      setIsEditing(false);
      showToast("Page updated successfully!");
    } catch (err) {
      console.error("Error updating page:", err);
      showToast("Failed to update page", "error");
    }
  };

  const handleDeletePage = async (pageId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this page? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const { error } = await supabase
        .from("wiki_pages")
        .delete()
        .eq("id", pageId);

      if (error) throw error;

      await fetchWikiPages();

      // If deleted page was selected, clear selection
      if (selectedPage && selectedPage.id === pageId) {
        setSelectedPage(null);
        setIsEditing(false);
      }

      showToast("Page deleted successfully!");
    } catch (err) {
      console.error("Error deleting page:", err);
      showToast("Failed to delete page", "error");
    }
  };

  const handleMovePage = async (pageId, newParentId) => {
    try {
      const { error } = await supabase
        .from("wiki_pages")
        .update({
          parent_id: newParentId,
          updated_by: user?.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", pageId);

      if (error) throw error;

      await fetchWikiPages();
      showToast("Page moved successfully!");
    } catch (err) {
      console.error("Error moving page:", err);
      showToast("Failed to move page", "error");
    }
  };

  const handleReorderPages = async (pageId, parentId, newIndex) => {
    try {
      // Get all siblings at the same level
      const siblings = wikiPages.filter((p) => p.parent_id === parentId);

      // Remove the dragged page from its current position
      const filteredSiblings = siblings.filter((p) => p.id !== pageId);

      // Insert the dragged page at the new position
      filteredSiblings.splice(
        newIndex,
        0,
        siblings.find((p) => p.id === pageId)
      );

      // Update sort_order for all affected pages
      const updates = filteredSiblings.map((page, index) => ({
        id: page.id,
        sort_order: index,
        updated_by: user?.id,
        updated_at: new Date().toISOString(),
      }));

      // Batch update all pages
      for (const update of updates) {
        const { error } = await supabase
          .from("wiki_pages")
          .update(update)
          .eq("id", update.id);

        if (error) throw error;
      }

      await fetchWikiPages();
      showToast("Pages reordered successfully!");
    } catch (err) {
      console.error("Error reordering pages:", err);
      showToast("Failed to reorder pages", "error");
    }
  };

  if (loading) {
    return (
      <div className="wiki-container">
        <div className="loading-container">
          <div className="loader"></div>
          <p>Loading wiki...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="wiki-container">
        <div className="error-container">
          <FileText size={48} className="error-icon" />
          <h3>Error Loading Wiki</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={fetchWikiPages}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="wiki-container">
      <div className="wiki-header">
        <div className="wiki-title">
          <FileText size={24} className="me-2" />
          <h1>Internal Wiki</h1>
        </div>
        <div className="wiki-actions">
          <button
            className="btn btn-outline-primary me-2"
            onClick={() => handleNewPage()}
            title="Create new page"
          >
            <Plus size={16} className="me-1" />
            New Page
          </button>
          {selectedPage && !selectedPage.is_folder && (
            <button
              className={`btn ${
                isEditing ? "btn-outline-secondary" : "btn-outline-primary"
              }`}
              onClick={() => setIsEditing(!isEditing)}
              title={isEditing ? "View mode" : "Edit mode"}
            >
              {isEditing ? (
                <>
                  <Eye size={16} className="me-1" />
                  View
                </>
              ) : (
                <>
                  <Edit3 size={16} className="me-1" />
                  Edit
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="wiki-content">
        <WikiSidebar
          pages={wikiPages}
          selectedPage={selectedPage}
          onPageSelect={handlePageSelect}
          onNewPage={handleNewPage}
          onDeletePage={handleDeletePage}
          onMovePage={handleMovePage}
          onReorderPages={handleReorderPages}
        />

        <div className="wiki-main">
          {selectedPage ? (
            isEditing ? (
              <WikiEditor
                page={selectedPage}
                onSave={handleUpdatePage}
                onCancel={() => setIsEditing(false)}
              />
            ) : (
              <WikiViewer
                page={selectedPage}
                onEdit={() => setIsEditing(true)}
                onPageSelect={handlePageSelect}
              />
            )
          ) : (
            <div className="wiki-welcome">
              <FileText size={64} className="welcome-icon" />
              <h2>Welcome to the Internal Wiki</h2>
              <p>
                Select a page from the sidebar to get started, or create a new
                page.
              </p>
              <button
                className="btn btn-primary"
                onClick={() => handleNewPage()}
              >
                <Plus size={16} className="me-2" />
                Create Your First Page
              </button>
            </div>
          )}
        </div>
      </div>

      {/* New Page Modal */}
      {showNewPageModal && (
        <NewPageModal
          isOpen={showNewPageModal}
          onClose={() => setShowNewPageModal(false)}
          onCreatePage={handleCreatePage}
          parentPage={newPageParent}
          existingPages={wikiPages}
        />
      )}

      {/* Toast Notification */}
      <NotificationToast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ show: false, message: "", type: "info" })}
      />
    </div>
  );
};

export default Wiki;
