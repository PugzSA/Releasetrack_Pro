import React, { useState, useEffect } from "react";
import { X, Move, Folder, FileText, Home } from "lucide-react";
import "./MovePageModal.css";

const MovePageModal = ({ isOpen, onClose, onMove, pageToMove, availableFolders }) => {
  const [selectedParent, setSelectedParent] = useState("");
  const [isMoving, setIsMoving] = useState(false);

  useEffect(() => {
    if (isOpen && pageToMove) {
      setSelectedParent(pageToMove.parent_id || "");
    }
  }, [isOpen, pageToMove]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Don't move if it's already in the selected location
    if (selectedParent === (pageToMove.parent_id || "")) {
      onClose();
      return;
    }

    setIsMoving(true);
    try {
      await onMove(selectedParent || null);
    } catch (error) {
      console.error("Error moving page:", error);
    } finally {
      setIsMoving(false);
    }
  };

  if (!isOpen || !pageToMove) return null;

  const folderOptions = [
    { id: "", title: "Root Level", icon: Home },
    ...availableFolders.map(folder => ({
      id: folder.id,
      title: folder.title,
      icon: Folder
    }))
  ];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="move-page-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <Move size={20} className="me-2" />
            Move Page
          </h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="page-info">
            <div className="page-icon">
              {pageToMove.is_folder ? (
                <Folder size={20} />
              ) : (
                <FileText size={20} />
              )}
            </div>
            <div className="page-details">
              <h3>{pageToMove.title}</h3>
              <p className="text-muted">
                {pageToMove.is_folder ? 'Folder' : 'Page'} • 
                Currently in: {pageToMove.parent_id ? 
                  availableFolders.find(f => f.id === pageToMove.parent_id)?.title || 'Unknown' : 
                  'Root Level'
                }
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="destination" className="form-label">
                Move to:
              </label>
              <div className="destination-options">
                {folderOptions.map(option => (
                  <label key={option.id} className="destination-option">
                    <input
                      type="radio"
                      name="destination"
                      value={option.id}
                      checked={selectedParent === option.id}
                      onChange={(e) => setSelectedParent(e.target.value)}
                    />
                    <div className="option-content">
                      <option.icon size={16} className="option-icon" />
                      <span className="option-title">{option.title}</span>
                      {selectedParent === option.id && (
                        <div className="option-check">✓</div>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </form>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={onClose}
            disabled={isMoving}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={isMoving || selectedParent === (pageToMove.parent_id || "")}
          >
            {isMoving ? (
              <>Moving...</>
            ) : (
              <>
                <Move size={16} className="me-1" />
                Move Here
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MovePageModal;
