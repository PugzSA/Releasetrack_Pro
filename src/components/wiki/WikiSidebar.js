import React, { useState, useMemo } from "react";
import {
  FileText,
  Folder,
  FolderOpen,
  Plus,
  Trash2,
  ChevronRight,
  ChevronDown,
  Move,
  MoreVertical,
} from "lucide-react";
import MovePageModal from "./MovePageModal";
import "./WikiSidebar.css";

const WikiSidebar = ({
  pages,
  selectedPage,
  onPageSelect,
  onNewPage,
  onDeletePage,
  onMovePage,
  onReorderPages,
}) => {
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [draggedPage, setDraggedPage] = useState(null);
  const [dragOverPage, setDragOverPage] = useState(null);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [pageToMove, setPageToMove] = useState(null);
  const [contextMenu, setContextMenu] = useState({
    show: false,
    x: 0,
    y: 0,
    page: null,
  });

  // Build hierarchical structure
  const hierarchicalPages = useMemo(() => {
    const pageMap = new Map();
    const rootPages = [];

    // First pass: create map of all pages
    pages.forEach((page) => {
      pageMap.set(page.id, { ...page, children: [] });
    });

    // Second pass: build hierarchy
    pages.forEach((page) => {
      if (page.parent_id) {
        const parent = pageMap.get(page.parent_id);
        if (parent) {
          parent.children.push(pageMap.get(page.id));
        }
      } else {
        rootPages.push(pageMap.get(page.id));
      }
    });

    // Sort by sort_order
    const sortPages = (pages) => {
      return pages
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((page) => ({
          ...page,
          children: sortPages(page.children),
        }));
    };

    return sortPages(rootPages);
  }, [pages]);

  const toggleFolder = (folderId) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  // Drag and drop handlers
  const handleDragStart = (e, page) => {
    setDraggedPage(page);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", page.id);
  };

  const handleDragOver = (e, page) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverPage(page);
  };

  const handleDragLeave = () => {
    setDragOverPage(null);
  };

  const handleDrop = async (e, targetPage) => {
    e.preventDefault();
    setDragOverPage(null);

    if (!draggedPage || draggedPage.id === targetPage.id) {
      setDraggedPage(null);
      return;
    }

    // If dropping on a folder, move page into folder
    if (targetPage.is_folder) {
      await onMovePage(draggedPage.id, targetPage.id);
    } else {
      // If dropping on a page, reorder at same level
      const siblings = pages.filter(
        (p) => p.parent_id === targetPage.parent_id
      );
      const draggedIndex = siblings.findIndex((p) => p.id === draggedPage.id);
      const targetIndex = siblings.findIndex((p) => p.id === targetPage.id);

      if (
        draggedIndex !== -1 &&
        targetIndex !== -1 &&
        draggedIndex !== targetIndex
      ) {
        await onReorderPages(draggedPage.id, targetPage.parent_id, targetIndex);
      }
    }

    setDraggedPage(null);
  };

  // Context menu handlers
  const handleContextMenu = (e, page) => {
    e.preventDefault();
    setContextMenu({
      show: true,
      x: e.clientX,
      y: e.clientY,
      page: page,
    });
  };

  const handleMoveClick = (page) => {
    setPageToMove(page);
    setShowMoveModal(true);
    setContextMenu({ show: false, x: 0, y: 0, page: null });
  };

  const handleMoveConfirm = async (newParentId) => {
    if (pageToMove) {
      await onMovePage(pageToMove.id, newParentId);
      setShowMoveModal(false);
      setPageToMove(null);
    }
  };

  // Close context menu when clicking elsewhere
  React.useEffect(() => {
    const handleClickOutside = () => {
      setContextMenu({ show: false, x: 0, y: 0, page: null });
    };

    if (contextMenu.show) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [contextMenu.show]);

  const renderPageTree = (pages, level = 0) => {
    return pages.map((page) => (
      <div key={page.id} className="wiki-tree-item">
        <div
          className={`wiki-tree-node ${
            selectedPage?.id === page.id ? "selected" : ""
          } ${page.is_folder ? "folder" : "page"} ${
            dragOverPage?.id === page.id ? "drag-over" : ""
          } ${draggedPage?.id === page.id ? "dragging" : ""}`}
          style={{ paddingLeft: `${level * 20 + 12}px` }}
          draggable
          onDragStart={(e) => handleDragStart(e, page)}
          onDragOver={(e) => handleDragOver(e, page)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, page)}
          onContextMenu={(e) => handleContextMenu(e, page)}
        >
          {page.is_folder ? (
            <>
              <button
                className="folder-toggle"
                onClick={() => toggleFolder(page.id)}
                title={
                  expandedFolders.has(page.id)
                    ? "Collapse folder"
                    : "Expand folder"
                }
              >
                {expandedFolders.has(page.id) ? (
                  <ChevronDown size={14} />
                ) : (
                  <ChevronRight size={14} />
                )}
              </button>
              <div className="folder-icon">
                {expandedFolders.has(page.id) ? (
                  <FolderOpen size={16} />
                ) : (
                  <Folder size={16} />
                )}
              </div>
              <span className="page-title">{page.title}</span>
              <div className="page-actions">
                <button
                  className="action-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNewPage(page.id);
                  }}
                  title="Add page to folder"
                >
                  <Plus size={12} />
                </button>
                <button
                  className="action-btn delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeletePage(page.id);
                  }}
                  title="Delete folder"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="page-icon">
                <FileText size={16} />
              </div>
              <span
                className="page-title clickable"
                onClick={() => onPageSelect(page)}
              >
                {page.title}
              </span>
              <div className="page-actions">
                <button
                  className="action-btn delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeletePage(page.id);
                  }}
                  title="Delete page"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </>
          )}
        </div>

        {page.is_folder &&
          expandedFolders.has(page.id) &&
          page.children.length > 0 && (
            <div className="wiki-tree-children">
              {renderPageTree(page.children, level + 1)}
            </div>
          )}
      </div>
    ));
  };

  return (
    <div className="wiki-sidebar">
      <div className="wiki-sidebar-header">
        <h3>Pages</h3>
        <button
          className="btn btn-sm btn-outline-primary"
          onClick={() => onNewPage()}
          title="Create new page"
        >
          <Plus size={14} />
        </button>
      </div>

      <div className="wiki-sidebar-content">
        {hierarchicalPages.length > 0 ? (
          <div className="wiki-tree">{renderPageTree(hierarchicalPages)}</div>
        ) : (
          <div className="empty-state">
            <FileText size={32} className="empty-icon" />
            <p>No pages yet</p>
            <button
              className="btn btn-sm btn-primary"
              onClick={() => onNewPage()}
            >
              <Plus size={14} className="me-1" />
              Create First Page
            </button>
          </div>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu.show && (
        <div
          className="wiki-context-menu"
          style={{
            position: "fixed",
            top: contextMenu.y,
            left: contextMenu.x,
            zIndex: 1000,
          }}
        >
          <button
            className="context-menu-item"
            onClick={() => handleMoveClick(contextMenu.page)}
          >
            <Move size={14} className="me-2" />
            Move to...
          </button>
          <button
            className="context-menu-item delete"
            onClick={() => {
              onDeletePage(contextMenu.page.id);
              setContextMenu({ show: false, x: 0, y: 0, page: null });
            }}
          >
            <Trash2 size={14} className="me-2" />
            Delete
          </button>
        </div>
      )}

      {/* Move Page Modal */}
      {showMoveModal && pageToMove && (
        <MovePageModal
          isOpen={showMoveModal}
          onClose={() => {
            setShowMoveModal(false);
            setPageToMove(null);
          }}
          onMove={handleMoveConfirm}
          pageToMove={pageToMove}
          availableFolders={pages.filter(
            (p) => p.is_folder && p.id !== pageToMove.id
          )}
        />
      )}
    </div>
  );
};

export default WikiSidebar;
