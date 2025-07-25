import React, { useState, useEffect } from "react";
import { X, FileText, Folder, Plus } from "lucide-react";
import "./NewPageModal.css";

const NewPageModal = ({ isOpen, onClose, onCreatePage, parentPage, existingPages }) => {
  const [title, setTitle] = useState("");
  const [isFolder, setIsFolder] = useState(false);
  const [selectedParent, setSelectedParent] = useState(parentPage?.id || "");
  const [content, setContent] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setIsFolder(false);
      setSelectedParent(parentPage?.id || "");
      setContent("");
      setError("");
    }
  }, [isOpen, parentPage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError("Please enter a title");
      return;
    }

    // Check for duplicate titles at the same level
    const siblings = existingPages.filter(page => page.parent_id === (selectedParent || null));
    const titleExists = siblings.some(page => 
      page.title.toLowerCase() === title.trim().toLowerCase()
    );
    
    if (titleExists) {
      setError("A page with this title already exists at this level");
      return;
    }

    setIsCreating(true);
    setError("");

    try {
      // Calculate sort order (add to end)
      const maxSortOrder = siblings.reduce((max, page) => 
        Math.max(max, page.sort_order || 0), 0
      );

      await onCreatePage({
        title: title.trim(),
        content: isFolder ? "" : content,
        parent_id: selectedParent || null,
        is_folder: isFolder,
        sort_order: maxSortOrder + 1,
      });

      onClose();
    } catch (err) {
      setError("Failed to create page. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const getFolderOptions = () => {
    const folders = existingPages.filter(page => page.is_folder);
    return [
      { id: "", title: "Root Level" },
      ...folders.map(folder => ({ id: folder.id, title: folder.title }))
    ];
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="new-page-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <Plus size={20} className="me-2" />
            Create New {isFolder ? 'Folder' : 'Page'}
          </h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Type</label>
            <div className="type-selector">
              <label className="type-option">
                <input
                  type="radio"
                  name="type"
                  checked={!isFolder}
                  onChange={() => setIsFolder(false)}
                />
                <div className="type-card">
                  <FileText size={24} />
                  <span>Page</span>
                  <small>Create a new wiki page with content</small>
                </div>
              </label>
              <label className="type-option">
                <input
                  type="radio"
                  name="type"
                  checked={isFolder}
                  onChange={() => setIsFolder(true)}
                />
                <div className="type-card">
                  <Folder size={24} />
                  <span>Folder</span>
                  <small>Create a folder to organize pages</small>
                </div>
              </label>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="title" className="form-label">
              {isFolder ? 'Folder' : 'Page'} Title *
            </label>
            <input
              id="title"
              type="text"
              className="form-control"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={`Enter ${isFolder ? 'folder' : 'page'} title...`}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="parent" className="form-label">
              Parent Folder
            </label>
            <select
              id="parent"
              className="form-control"
              value={selectedParent}
              onChange={(e) => setSelectedParent(e.target.value)}
            >
              {getFolderOptions().map(option => (
                <option key={option.id} value={option.id}>
                  {option.title}
                </option>
              ))}
            </select>
          </div>

          {!isFolder && (
            <div className="form-group">
              <label htmlFor="content" className="form-label">
                Initial Content (Optional)
              </label>
              <textarea
                id="content"
                className="form-control content-textarea"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter initial content in Markdown format..."
                rows={6}
              />
              <small className="form-text">
                You can add or edit content after creating the page
              </small>
            </div>
          )}
        </form>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={onClose}
            disabled={isCreating}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={isCreating || !title.trim()}
          >
            {isCreating ? (
              <>Creating...</>
            ) : (
              <>
                <Plus size={16} className="me-1" />
                Create {isFolder ? 'Folder' : 'Page'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewPageModal;
