import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Trash2, 
  Eye, 
  File, 
  Image, 
  FileText, 
  Sheet,
  Calendar,
  User,
  Zap
} from 'lucide-react';
import AttachmentService from '../../services/AttachmentService';
import FileCompressionService from '../../services/FileCompressionService';
import './AttachmentList.css';

const AttachmentList = ({ ticketId, onAttachmentDeleted, showToast, currentUserId }) => {
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingIds, setDeletingIds] = useState(new Set());
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewAttachment, setPreviewAttachment] = useState(null);

  useEffect(() => {
    loadAttachments();
  }, [ticketId]);

  const loadAttachments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await AttachmentService.getTicketAttachments(ticketId);
      setAttachments(data);
    } catch (err) {
      setError(err.message);
      console.error('Error loading attachments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (attachment) => {
    try {
      await AttachmentService.downloadAttachment(attachment.file_path, attachment.file_name);
      if (showToast) {
        showToast('File downloaded successfully', 'success');
      }
    } catch (error) {
      console.error('Error downloading attachment:', error);
      if (showToast) {
        showToast(`Failed to download file: ${error.message}`, 'error');
      }
    }
  };

  const handlePreview = async (attachment) => {
    if (!AttachmentService.isImage(attachment.mime_type)) {
      // For non-images, just download
      handleDownload(attachment);
      return;
    }

    try {
      const url = await AttachmentService.getAttachmentUrl(attachment.file_path);
      setPreviewUrl(url);
      setPreviewAttachment(attachment);
    } catch (error) {
      console.error('Error creating preview URL:', error);
      if (showToast) {
        showToast(`Failed to preview file: ${error.message}`, 'error');
      }
    }
  };

  const handleDelete = async (attachmentId) => {
    if (!window.confirm('Are you sure you want to delete this attachment?')) {
      return;
    }

    try {
      setDeletingIds(prev => new Set([...prev, attachmentId]));
      await AttachmentService.deleteAttachment(attachmentId);
      
      // Remove from local state
      setAttachments(prev => prev.filter(att => att.id !== attachmentId));
      
      if (showToast) {
        showToast('Attachment deleted successfully', 'success');
      }
      
      if (onAttachmentDeleted) {
        onAttachmentDeleted(attachmentId);
      }
    } catch (error) {
      console.error('Error deleting attachment:', error);
      if (showToast) {
        showToast(`Failed to delete attachment: ${error.message}`, 'error');
      }
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(attachmentId);
        return newSet;
      });
    }
  };

  const getFileIcon = (mimeType) => {
    const iconProps = { size: 16, className: 'attachment-file-icon' };
    
    if (AttachmentService.isImage(mimeType)) {
      return <Image {...iconProps} />;
    } else if (mimeType === 'application/pdf') {
      return <FileText {...iconProps} />;
    } else if (mimeType.includes('word') || mimeType.includes('document')) {
      return <FileText {...iconProps} />;
    } else if (mimeType.includes('excel') || mimeType.includes('sheet') || mimeType === 'text/csv') {
      return <Sheet {...iconProps} />;
    }
    return <File {...iconProps} />;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canDeleteAttachment = (attachment) => {
    // Users can delete their own attachments
    return attachment.uploaded_by === currentUserId;
  };

  if (loading) {
    return (
      <div className="attachment-list-loading">
        <div className="spinner-border spinner-border-sm" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <span className="ms-2">Loading attachments...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="attachment-list-error">
        <div className="alert alert-danger" role="alert">
          Failed to load attachments: {error}
        </div>
      </div>
    );
  }

  if (attachments.length === 0) {
    return (
      <div className="attachment-list-empty">
        <File size={24} className="text-muted" />
        <span className="text-muted">No attachments</span>
      </div>
    );
  }

  return (
    <div className="attachment-list">
      <div className="attachment-list-header">
        <h6 className="attachment-list-title">
          Attachments ({attachments.length})
        </h6>
      </div>
      
      <div className="attachment-items">
        {attachments.map(attachment => (
          <div key={attachment.id} className="attachment-item">
            <div className="attachment-item-main">
              <div className="attachment-item-icon">
                {getFileIcon(attachment.mime_type)}
              </div>
              
              <div className="attachment-item-details">
                <div className="attachment-item-name" title={attachment.file_name}>
                  {attachment.file_name}
                </div>
                <div className="attachment-item-meta">
                  <span className="attachment-item-size">
                    {FileCompressionService.formatFileSize(attachment.file_size)}
                  </span>
                  {attachment.compressed && attachment.original_size && (
                    <span className="attachment-item-compression">
                      <Zap size={12} />
                      {FileCompressionService.getCompressionRatio(attachment.original_size, attachment.file_size)}% saved
                    </span>
                  )}
                  <span className="attachment-item-date">
                    <Calendar size={12} />
                    {formatDate(attachment.created_at)}
                  </span>
                  {attachment.uploaded_by_user && (
                    <span className="attachment-item-user">
                      <User size={12} />
                      {attachment.uploaded_by_user.firstName} {attachment.uploaded_by_user.lastName}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="attachment-item-actions">
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={() => handlePreview(attachment)}
                title={AttachmentService.isImage(attachment.mime_type) ? "Preview" : "Download"}
              >
                {AttachmentService.isImage(attachment.mime_type) ? <Eye size={14} /> : <Download size={14} />}
              </button>
              
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => handleDownload(attachment)}
                title="Download"
              >
                <Download size={14} />
              </button>
              
              {canDeleteAttachment(attachment) && (
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => handleDelete(attachment.id)}
                  disabled={deletingIds.has(attachment.id)}
                  title="Delete"
                >
                  {deletingIds.has(attachment.id) ? (
                    <div className="spinner-border spinner-border-sm" role="status">
                      <span className="visually-hidden">Deleting...</span>
                    </div>
                  ) : (
                    <Trash2 size={14} />
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Image Preview Modal */}
      {previewUrl && previewAttachment && (
        <div className="attachment-preview-modal" onClick={() => { setPreviewUrl(null); setPreviewAttachment(null); }}>
          <div className="attachment-preview-content" onClick={e => e.stopPropagation()}>
            <div className="attachment-preview-header">
              <h5>{previewAttachment.file_name}</h5>
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => { setPreviewUrl(null); setPreviewAttachment(null); }}
              >
                ×
              </button>
            </div>
            <div className="attachment-preview-body">
              <img src={previewUrl} alt={previewAttachment.file_name} className="attachment-preview-image" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttachmentList;
