# File Attachment Setup Guide

This guide will walk you through setting up file attachments for your ReleaseTrack Pro application using Supabase Storage.

## Prerequisites

- Supabase project with database access
- ReleaseTrack Pro application running
- Admin access to Supabase dashboard

## Step 1: Configure Supabase Storage Bucket

### 1.1 Create Storage Bucket (via Supabase Dashboard)

1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **Create a new bucket**
4. Configure the bucket:
   - **Name**: `ticket-attachments`
   - **Public**: `false` (private bucket for security)
   - **File size limit**: `52428800` (50MB)
   - **Allowed MIME types**:
     - `image/jpeg`
     - `image/png`
     - `image/gif`
     - `image/webp`
     - `application/pdf`
     - `text/plain`
     - `application/msword`
     - `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
     - `application/vnd.ms-excel`
     - `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

### 1.2 Configure Row Level Security (RLS) Policies

**IMPORTANT**: This step is required to fix the "row-level security policy" error.

#### Method 1: Via Supabase Dashboard (Recommended)

1. **Go to your Supabase Dashboard**
2. **Navigate to Storage** (in the left sidebar)
3. **Click on your `ticket-attachments` bucket**
4. **Go to the "Configuration" tab**
5. **Scroll down to "Policies" section**
6. **Click "New Policy"** and create each of the following:

**Policy 1: Upload Policy**

```sql
CREATE POLICY "Allow authenticated users to upload ticket attachments"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'ticket-attachments');
```

**Policy 2: View Policy**

```sql
CREATE POLICY "Allow authenticated users to view ticket attachments"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'ticket-attachments');
```

**Policy 3: Delete Policy**

```sql
CREATE POLICY "Allow authenticated users to delete ticket attachments"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'ticket-attachments');
```

#### Method 2: Via SQL Editor (Alternative)

If you can't find the policies section in the Storage dashboard:

1. **Go to SQL Editor** in your Supabase dashboard
2. **Run this script** to create all policies:

```sql
-- Create all three storage policies for ticket-attachments
CREATE POLICY "Allow authenticated users to upload ticket attachments"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'ticket-attachments');

CREATE POLICY "Allow authenticated users to view ticket attachments"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'ticket-attachments');

CREATE POLICY "Allow authenticated users to delete ticket attachments"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'ticket-attachments');
```

#### Method 3: Verify Bucket Exists First

If you're getting errors, first verify the bucket exists:

```sql
-- Check if the bucket exists
SELECT * FROM storage.buckets WHERE id = 'ticket-attachments';

-- If it doesn't exist, create it
INSERT INTO storage.buckets (id, name, public)
VALUES ('ticket-attachments', 'ticket-attachments', false);
```

#### Verify Policies Were Created

After creating the policies, run this to verify they exist:

```sql
-- Verify policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'objects' AND schemaname = 'storage';
```

## Step 2: Database Schema (Already Created)

The following table has been created in your database:

```sql
CREATE TABLE ticket_attachments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id VARCHAR(50) NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INTEGER NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  original_size INTEGER,
  compressed BOOLEAN DEFAULT false,
  uploaded_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## Step 3: Features Implemented

### File Compression

- **Images**: Automatically compressed to max 1920x1080 resolution at 80% quality
- **Compression threshold**: Files larger than 500KB (images) or 1MB (other files)
- **Supported formats**: JPEG, PNG, GIF, WebP for images
- **Compression ratio**: Displayed to users showing space saved

### File Type Validation

- **Images**: JPEG, PNG, GIF, WebP
- **Documents**: PDF, TXT, DOC, DOCX, XLS, XLSX, CSV
- **Size limits**:
  - Images: 5MB max
  - Documents: 10MB max
  - Other files: 5MB max

### Security Features

- **Authentication required**: Only authenticated users can upload/view/delete
- **File type validation**: Only allowed MIME types accepted
- **Size validation**: Files exceeding limits are rejected
- **Private storage**: Files are not publicly accessible
- **Signed URLs**: Temporary URLs for viewing/downloading (1 hour expiration)

### User Interface

- **Drag & drop upload**: Modern file upload interface
- **Progress indicators**: Real-time upload progress
- **File previews**: Image preview modal
- **Compression feedback**: Shows compression ratio and space saved
- **Error handling**: Clear error messages for failed uploads

## Step 4: Usage

### Uploading Files

1. Open any ticket in the application
2. Scroll to the **Attachments** section
3. Drag files onto the upload area or click to browse
4. Files will be automatically compressed and uploaded
5. View upload progress and completion status

### Viewing Files

1. In the ticket's attachment list, click the eye icon (for images) or download icon
2. Images will open in a preview modal
3. Other files will be downloaded directly

### Deleting Files

1. Users can only delete their own attachments
2. Click the trash icon next to any attachment you uploaded
3. Confirm deletion in the popup dialog

## Step 5: Monitoring and Maintenance

### Storage Usage

- Monitor your Supabase storage usage in the dashboard
- Free tier includes 1GB of storage
- File compression helps optimize storage usage

### Performance

- Files are compressed before upload to reduce transfer time
- Signed URLs provide secure, temporary access
- Automatic cleanup when tickets are deleted (CASCADE)

### Troubleshooting

#### Common Issues:

1. **Upload fails**: Check file type and size limits
2. **Can't view files**: Verify RLS policies are correctly configured
3. **Storage full**: Monitor usage and consider upgrading plan
4. **Slow uploads**: Large files may take time; compression helps

#### Error Messages:

- "File type not supported": Only allowed MIME types can be uploaded
- "File size exceeds limit": Check individual file size limits
- "Upload failed: new row violates row-level security policy": RLS policies not configured (see Step 1.2)
- "Upload failed": Network issue or storage problem

#### Specific Fix for RLS Error:

If you see "new row violates row-level security policy":

1. **First, try Method 1** (Supabase Dashboard > Storage > bucket > Configuration > Policies)
2. **If that doesn't work, use Method 2** (SQL Editor with the provided script)
3. **If still failing, use Method 3** to verify the bucket exists first
4. **Run the verification query** to confirm policies were created
5. **Try uploading again**

#### Additional Troubleshooting:

- **"must be owner of table objects"**: Use Method 1 (Dashboard) instead of SQL Editor
- **Can't find Storage Policies section**: Try Method 2 (SQL Editor)
- **Bucket doesn't exist**: Use Method 3 to create the bucket first
- **Policies not working**: Verify with the verification query and check for typos in bucket name

## Step 6: Configuration Options

You can modify the following settings in the code:

### File Size Limits (FileCompressionService.js)

```javascript
this.maxSizes = {
  image: 5 * 1024 * 1024, // 5MB for images
  document: 10 * 1024 * 1024, // 10MB for documents
  other: 5 * 1024 * 1024, // 5MB for other files
};
```

### Image Compression Settings (FileCompressionService.js)

```javascript
this.imageConfig = {
  maxWidth: 1920,
  maxHeight: 1080,
  compressFormat: "JPEG",
  quality: 80, // 0-100
  rotation: 0,
  outputType: "file",
};
```

### Supported File Types (FileCompressionService.js)

Add or remove MIME types from the `supportedTypes` object.

## Security Considerations

1. **File scanning**: Consider adding virus scanning for production use
2. **Content validation**: Files are validated by MIME type, but consider additional content validation
3. **Access control**: Current implementation allows all authenticated users to view all attachments
4. **Audit trail**: All uploads are logged with user ID and timestamp
5. **Storage limits**: Monitor usage to prevent abuse

## Next Steps

1. Test the attachment functionality with various file types
2. Monitor storage usage and performance
3. Consider implementing additional security measures for production
4. Set up automated backups for attachment data
5. Configure alerts for storage usage thresholds

The attachment system is now ready for use! Users can upload, view, and manage file attachments on tickets with automatic compression and security features.
