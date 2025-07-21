import React, { useState, useRef } from 'react';
import { Upload, X, File, Image, FileText, Sheet, AlertCircle, CheckCircle } from 'lucide-react';
import AttachmentService from '../../services/AttachmentService';
import FileCompressionService from '../../services/FileCompressionService';
import './FileUpload.css';

const FileUpload = ({ ticketId, uploadedBy, onUploadComplete, onUploadError, disabled = false }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState([]);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e) => {
    if (disabled) return;
    
    const files = Array.from(e.target.files);
    handleFiles(files);
    
    // Reset input
    e.target.value = '';
  };

  const handleFiles = async (files) => {
    const validFiles = files.filter(file => {
      if (!FileCompressionService.isFileTypeSupported(file.type)) {
        onUploadError(`File type ${file.type} is not supported`);
        return false;
      }
      
      if (!FileCompressionService.validateFileSize(file)) {
        const maxSize = FileCompressionService.formatFileSize(
          FileCompressionService.maxSizes[FileCompressionService.getFileCategory(file.type)]
        );
        onUploadError(`File ${file.name} exceeds the maximum size limit of ${maxSize}`);
        return false;
      }
      
      return true;
    });

    if (validFiles.length === 0) return;

    // Add files to uploading state
    const uploadingFileObjects = validFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      progress: 0,
      status: 'uploading', // uploading, success, error
      error: null
    }));

    setUploadingFiles(prev => [...prev, ...uploadingFileObjects]);

    // Upload files one by one
    for (const uploadingFile of uploadingFileObjects) {
      try {
        // Update progress to show compression is happening
        updateFileProgress(uploadingFile.id, 10, 'compressing');
        
        const result = await AttachmentService.uploadAttachment(
          uploadingFile.file,
          ticketId,
          uploadedBy,
          (progress) => {
            updateFileProgress(uploadingFile.id, 10 + (progress * 0.9), 'uploading');
          }
        );

        updateFileProgress(uploadingFile.id, 100, 'success');
        
        // Call success callback
        if (onUploadComplete) {
          onUploadComplete(result);
        }

        // Remove from uploading list after a delay
        setTimeout(() => {
          setUploadingFiles(prev => prev.filter(f => f.id !== uploadingFile.id));
        }, 2000);

      } catch (error) {
        updateFileProgress(uploadingFile.id, 0, 'error', error.message);
        
        if (onUploadError) {
          onUploadError(`Failed to upload ${uploadingFile.file.name}: ${error.message}`);
        }

        // Remove from uploading list after a delay
        setTimeout(() => {
          setUploadingFiles(prev => prev.filter(f => f.id !== uploadingFile.id));
        }, 5000);
      }
    }
  };

  const updateFileProgress = (fileId, progress, status, error = null) => {
    setUploadingFiles(prev => prev.map(file => 
      file.id === fileId 
        ? { ...file, progress, status, error }
        : file
    ));
  };

  const removeUploadingFile = (fileId) => {
    setUploadingFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const getFileIcon = (mimeType) => {
    if (AttachmentService.isImage(mimeType)) {
      return <Image size={16} />;
    } else if (mimeType === 'application/pdf') {
      return <FileText size={16} />;
    } else if (mimeType.includes('word') || mimeType.includes('document')) {
      return <FileText size={16} />;
    } else if (mimeType.includes('excel') || mimeType.includes('sheet') || mimeType === 'text/csv') {
      return <Sheet size={16} />;
    }
    return <File size={16} />;
  };

  return (
    <div className="file-upload-container">
      {/* Drop Zone */}
      <div
        className={`file-upload-dropzone ${isDragOver ? 'drag-over' : ''} ${disabled ? 'disabled' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <div className="file-upload-content">
          <Upload size={24} className="file-upload-icon" />
          <div className="file-upload-text">
            <span className="file-upload-primary">
              {disabled ? 'Upload disabled' : 'Drop files here or click to browse'}
            </span>
            <span className="file-upload-secondary">
              Supports images, PDFs, and documents up to 10MB
            </span>
          </div>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.txt,.doc,.docx,.xls,.xlsx,.csv"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          disabled={disabled}
        />
      </div>

      {/* Uploading Files */}
      {uploadingFiles.length > 0 && (
        <div className="uploading-files">
          <h6 className="uploading-files-title">Uploading Files</h6>
          {uploadingFiles.map(uploadingFile => (
            <div key={uploadingFile.id} className="uploading-file-item">
              <div className="uploading-file-info">
                <div className="uploading-file-icon">
                  {getFileIcon(uploadingFile.file.type)}
                </div>
                <div className="uploading-file-details">
                  <div className="uploading-file-name">{uploadingFile.file.name}</div>
                  <div className="uploading-file-size">
                    {FileCompressionService.formatFileSize(uploadingFile.file.size)}
                  </div>
                </div>
                <div className="uploading-file-status">
                  {uploadingFile.status === 'success' && (
                    <CheckCircle size={16} className="text-success" />
                  )}
                  {uploadingFile.status === 'error' && (
                    <AlertCircle size={16} className="text-danger" />
                  )}
                  {uploadingFile.status !== 'success' && uploadingFile.status !== 'error' && (
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => removeUploadingFile(uploadingFile.id)}
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>
              
              {uploadingFile.status === 'uploading' || uploadingFile.status === 'compressing' ? (
                <div className="uploading-file-progress">
                  <div className="progress">
                    <div
                      className="progress-bar"
                      role="progressbar"
                      style={{ width: `${uploadingFile.progress}%` }}
                      aria-valuenow={uploadingFile.progress}
                      aria-valuemin="0"
                      aria-valuemax="100"
                    />
                  </div>
                  <div className="uploading-file-progress-text">
                    {uploadingFile.status === 'compressing' ? 'Compressing...' : `${Math.round(uploadingFile.progress)}%`}
                  </div>
                </div>
              ) : uploadingFile.status === 'error' ? (
                <div className="uploading-file-error">
                  {uploadingFile.error}
                </div>
              ) : uploadingFile.status === 'success' ? (
                <div className="uploading-file-success">
                  Upload completed successfully
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
