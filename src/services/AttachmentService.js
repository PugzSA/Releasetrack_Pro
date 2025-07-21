import { supabase } from "./supabase";
import FileCompressionService from "./FileCompressionService";
import { v4 as uuidv4 } from "uuid";

class AttachmentService {
  constructor() {
    this.bucketName = "ticket-attachments";
  }

  /**
   * Upload a file attachment for a ticket
   * @param {File} file - The file to upload
   * @param {string} ticketId - The ticket ID to associate with
   * @param {number} uploadedBy - The user ID who is uploading
   * @param {Function} onProgress - Progress callback function
   * @returns {Promise<Object>} - The attachment record
   */
  async uploadAttachment(file, ticketId, uploadedBy, onProgress = null) {
    try {
      // Debug logging
      console.log("Upload attempt:", {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        ticketId,
        uploadedBy,
      });

      // Check authentication
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error("User not authenticated. Please log in and try again.");
      }
      console.log("Authenticated user:", user.email);

      // Validate file
      if (!FileCompressionService.isFileTypeSupported(file.type)) {
        throw new Error(`File type ${file.type} is not supported`);
      }

      if (!FileCompressionService.validateFileSize(file)) {
        const maxSize = FileCompressionService.formatFileSize(
          FileCompressionService.maxSizes[
            FileCompressionService.getFileCategory(file.type)
          ]
        );
        throw new Error(`File size exceeds the maximum limit of ${maxSize}`);
      }

      // Compress the file
      const compressionResult = await FileCompressionService.compressFile(file);
      const {
        file: compressedFile,
        originalSize,
        compressedSize,
        compressed,
      } = compressionResult;

      // Generate unique file path
      const fileExtension = this.getFileExtension(compressedFile.name);
      const uniqueFileName = `${ticketId}/${uuidv4()}${fileExtension}`;

      // Upload to Supabase Storage
      console.log("Attempting storage upload:", {
        bucket: this.bucketName,
        path: uniqueFileName,
        fileSize: compressedFile.size,
      });

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(this.bucketName)
        .upload(uniqueFileName, compressedFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Storage upload error:", uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      console.log("Storage upload successful:", uploadData);

      // Create attachment record in database
      const attachmentData = {
        ticket_id: ticketId,
        file_name: file.name,
        file_path: uploadData.path,
        file_size: compressedSize,
        file_type: this.getFileExtension(file.name).substring(1), // Remove the dot
        mime_type: compressedFile.type,
        original_size: originalSize,
        compressed: compressed,
        uploaded_by: uploadedBy,
      };

      const { data: attachmentRecord, error: dbError } = await supabase
        .from("ticket_attachments")
        .insert(attachmentData)
        .select()
        .single();

      if (dbError) {
        // If database insert fails, clean up the uploaded file
        await this.deleteFileFromStorage(uploadData.path);
        throw new Error(`Database error: ${dbError.message}`);
      }

      return {
        ...attachmentRecord,
        compressionRatio: FileCompressionService.getCompressionRatio(
          originalSize,
          compressedSize
        ),
      };
    } catch (error) {
      console.error("Error uploading attachment:", error);
      throw error;
    }
  }

  /**
   * Get all attachments for a ticket
   * @param {string} ticketId - The ticket ID
   * @returns {Promise<Array>} - Array of attachment records
   */
  async getTicketAttachments(ticketId) {
    try {
      const { data, error } = await supabase
        .from("ticket_attachments")
        .select(
          `
          *,
          uploaded_by_user:users!uploaded_by(id, firstName, lastName, email)
        `
        )
        .eq("ticket_id", ticketId)
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch attachments: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error("Error fetching ticket attachments:", error);
      throw error;
    }
  }

  /**
   * Download an attachment
   * @param {string} filePath - The file path in storage
   * @param {string} fileName - The original file name
   * @returns {Promise<void>}
   */
  async downloadAttachment(filePath, fileName) {
    try {
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .download(filePath);

      if (error) {
        throw new Error(`Download failed: ${error.message}`);
      }

      // Create download link
      const url = URL.createObjectURL(data);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading attachment:", error);
      throw error;
    }
  }

  /**
   * Get a signed URL for viewing an attachment
   * @param {string} filePath - The file path in storage
   * @param {number} expiresIn - Expiration time in seconds (default: 1 hour)
   * @returns {Promise<string>} - The signed URL
   */
  async getAttachmentUrl(filePath, expiresIn = 3600) {
    try {
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .createSignedUrl(filePath, expiresIn);

      if (error) {
        throw new Error(`Failed to create signed URL: ${error.message}`);
      }

      return data.signedUrl;
    } catch (error) {
      console.error("Error creating signed URL:", error);
      throw error;
    }
  }

  /**
   * Delete an attachment
   * @param {string} attachmentId - The attachment ID
   * @returns {Promise<void>}
   */
  async deleteAttachment(attachmentId) {
    try {
      // First, get the attachment record to get the file path
      const { data: attachment, error: fetchError } = await supabase
        .from("ticket_attachments")
        .select("file_path")
        .eq("id", attachmentId)
        .single();

      if (fetchError) {
        throw new Error(`Failed to fetch attachment: ${fetchError.message}`);
      }

      // Delete from storage
      await this.deleteFileFromStorage(attachment.file_path);

      // Delete from database
      const { error: deleteError } = await supabase
        .from("ticket_attachments")
        .delete()
        .eq("id", attachmentId);

      if (deleteError) {
        throw new Error(
          `Failed to delete attachment record: ${deleteError.message}`
        );
      }
    } catch (error) {
      console.error("Error deleting attachment:", error);
      throw error;
    }
  }

  /**
   * Delete a file from storage
   * @param {string} filePath - The file path in storage
   * @returns {Promise<void>}
   */
  async deleteFileFromStorage(filePath) {
    const { error } = await supabase.storage
      .from(this.bucketName)
      .remove([filePath]);

    if (error) {
      console.error("Error deleting file from storage:", error);
      // Don't throw here as this might be called during cleanup
    }
  }

  /**
   * Get file extension from filename
   * @param {string} filename - The filename
   * @returns {string} - The file extension including the dot
   */
  getFileExtension(filename) {
    return filename.slice(filename.lastIndexOf("."));
  }

  /**
   * Check if a file is an image
   * @param {string} mimeType - The MIME type
   * @returns {boolean}
   */
  isImage(mimeType) {
    return FileCompressionService.isImage(mimeType);
  }

  /**
   * Get file icon based on file type
   * @param {string} mimeType - The MIME type
   * @returns {string} - Icon name for Lucide React
   */
  getFileIcon(mimeType) {
    if (this.isImage(mimeType)) {
      return "Image";
    } else if (mimeType === "application/pdf") {
      return "FileText";
    } else if (mimeType.includes("word") || mimeType.includes("document")) {
      return "FileText";
    } else if (
      mimeType.includes("excel") ||
      mimeType.includes("sheet") ||
      mimeType === "text/csv"
    ) {
      return "Sheet";
    } else if (mimeType === "text/plain") {
      return "FileText";
    }
    return "File";
  }
}

export default new AttachmentService();
