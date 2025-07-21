import Resizer from 'react-image-file-resizer';

class FileCompressionService {
  constructor() {
    // Configuration for different file types
    this.imageConfig = {
      maxWidth: 1920,
      maxHeight: 1080,
      compressFormat: 'JPEG',
      quality: 80,
      rotation: 0,
      outputType: 'file',
      minWidth: 100,
      minHeight: 100,
    };

    // Maximum file sizes (in bytes)
    this.maxSizes = {
      image: 5 * 1024 * 1024, // 5MB for images
      document: 10 * 1024 * 1024, // 10MB for documents
      other: 5 * 1024 * 1024, // 5MB for other files
    };

    // Supported file types
    this.supportedTypes = {
      images: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
      documents: [
        'application/pdf',
        'text/plain',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv'
      ]
    };
  }

  /**
   * Compress a file based on its type
   * @param {File} file - The file to compress
   * @param {Object} options - Compression options
   * @returns {Promise<{file: File, originalSize: number, compressedSize: number, compressed: boolean}>}
   */
  async compressFile(file, options = {}) {
    try {
      const originalSize = file.size;
      
      // Validate file type
      if (!this.isFileTypeSupported(file.type)) {
        throw new Error(`Unsupported file type: ${file.type}`);
      }

      // Check if file needs compression
      if (!this.needsCompression(file)) {
        return {
          file,
          originalSize,
          compressedSize: originalSize,
          compressed: false
        };
      }

      let compressedFile;
      
      if (this.isImage(file.type)) {
        compressedFile = await this.compressImage(file, options);
      } else {
        // For non-image files, we can't compress them much, so return as-is
        // In a production environment, you might want to use other compression libraries
        compressedFile = file;
      }

      return {
        file: compressedFile,
        originalSize,
        compressedSize: compressedFile.size,
        compressed: compressedFile.size < originalSize
      };
    } catch (error) {
      console.error('Error compressing file:', error);
      throw new Error(`Failed to compress file: ${error.message}`);
    }
  }

  /**
   * Compress an image file
   * @param {File} file - The image file to compress
   * @param {Object} options - Compression options
   * @returns {Promise<File>}
   */
  compressImage(file, options = {}) {
    return new Promise((resolve, reject) => {
      const config = { ...this.imageConfig, ...options };
      
      Resizer.imageFileResizer(
        file,
        config.maxWidth,
        config.maxHeight,
        config.compressFormat,
        config.quality,
        config.rotation,
        (compressedFile) => {
          resolve(compressedFile);
        },
        config.outputType,
        config.minWidth,
        config.minHeight
      );
    });
  }

  /**
   * Check if a file type is supported
   * @param {string} mimeType - The MIME type of the file
   * @returns {boolean}
   */
  isFileTypeSupported(mimeType) {
    return [...this.supportedTypes.images, ...this.supportedTypes.documents].includes(mimeType);
  }

  /**
   * Check if a file is an image
   * @param {string} mimeType - The MIME type of the file
   * @returns {boolean}
   */
  isImage(mimeType) {
    return this.supportedTypes.images.includes(mimeType);
  }

  /**
   * Check if a file needs compression
   * @param {File} file - The file to check
   * @returns {boolean}
   */
  needsCompression(file) {
    const fileType = this.getFileCategory(file.type);
    const maxSize = this.maxSizes[fileType] || this.maxSizes.other;
    
    // Compress if file is larger than 1MB or if it's an image larger than 500KB
    if (this.isImage(file.type)) {
      return file.size > 500 * 1024; // 500KB threshold for images
    }
    
    return file.size > 1024 * 1024; // 1MB threshold for other files
  }

  /**
   * Get the category of a file based on its MIME type
   * @param {string} mimeType - The MIME type of the file
   * @returns {string}
   */
  getFileCategory(mimeType) {
    if (this.supportedTypes.images.includes(mimeType)) {
      return 'image';
    } else if (this.supportedTypes.documents.includes(mimeType)) {
      return 'document';
    }
    return 'other';
  }

  /**
   * Validate file size against limits
   * @param {File} file - The file to validate
   * @returns {boolean}
   */
  validateFileSize(file) {
    const fileType = this.getFileCategory(file.type);
    const maxSize = this.maxSizes[fileType] || this.maxSizes.other;
    return file.size <= maxSize;
  }

  /**
   * Get human-readable file size
   * @param {number} bytes - Size in bytes
   * @returns {string}
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get compression ratio as percentage
   * @param {number} originalSize - Original file size
   * @param {number} compressedSize - Compressed file size
   * @returns {number}
   */
  getCompressionRatio(originalSize, compressedSize) {
    if (originalSize === 0) return 0;
    return Math.round(((originalSize - compressedSize) / originalSize) * 100);
  }
}

export default new FileCompressionService();
