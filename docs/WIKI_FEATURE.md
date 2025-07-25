# Internal Wiki Feature Documentation

## Overview

ReleaseTrack Pro now includes a fully functional internal wiki system that allows teams to create, organize, and maintain documentation using Markdown. The wiki features a modern, professional interface with a dual-pane editor for real-time content preview.

## Features

### ✨ **Core Functionality**

- **Dual-Pane Markdown Editor**: Write Markdown on the left, see live preview on the right
- **Hierarchical Organization**: Create folders and organize pages in a tree structure
- **Full Markdown Support**: Including syntax highlighting, tables, lists, and more
- **Professional Interface**: Modern, clean design that matches the application's aesthetic
- **Real-time Preview**: See your changes instantly as you type
- **Database Storage**: All content stored securely in Supabase database

### 📝 **Editor Features**

- **Live Preview**: Real-time rendering of Markdown content
- **Syntax Highlighting**: Code blocks with proper syntax highlighting
- **Toolbar**: Quick access to common Markdown formatting
- **Auto-save Indicators**: Visual feedback for unsaved changes
- **Responsive Design**: Works on desktop and mobile devices

### 🗂️ **Organization Features**

- **Folder Structure**: Create folders to organize related pages
- **Drag-and-Drop**: Intuitive page reordering and organization
- **Context Menu**: Right-click to move pages between folders
- **Page Hierarchy**: Unlimited nesting levels for complex documentation
- **Visual Feedback**: Clear drag indicators and hover states

## Setup Instructions

### 1. Database Setup

Run the database migration to create the wiki tables:

```bash
# Option 1: Use the setup script
node setup-wiki.js

# Option 2: Manual setup in Supabase SQL Editor
# Copy and paste the content from migrations/create_wiki_pages_table.sql
```

### 2. Dependencies

The following packages are automatically installed:

- `react-markdown`: For rendering Markdown content
- `react-syntax-highlighter`: For code syntax highlighting
- `remark-gfm`: For GitHub Flavored Markdown support
- `rehype-raw`: For HTML support in Markdown

### 3. Access the Wiki

1. Start your application: `npm start`
2. Navigate to the **Wiki** section in the sidebar
3. Create your first page or folder
4. Start documenting!

## Usage Guide

### Creating Pages

1. **Click "New Page"** in the wiki header or sidebar
2. **Choose Type**: Select either "Page" (for content) or "Folder" (for organization)
3. **Enter Title**: Provide a descriptive title
4. **Select Parent**: Choose where to place the page in the hierarchy
5. **Add Content**: For pages, optionally add initial Markdown content
6. **Click "Create"**: Your page is ready!

### Editing Pages

1. **Select a Page**: Click on any page in the sidebar
2. **Click "Edit"**: Switch to edit mode
3. **Use the Editor**:
   - Left pane: Write Markdown
   - Right pane: See live preview
   - Toolbar: Quick formatting options
4. **Save Changes**: Click "Save" when finished

### Organizing Content

- **Create Folders**: Use folders to group related pages
- **Nested Structure**: Create folders within folders for complex organization
- **Logical Hierarchy**: Organize by topic, process, or team

### Reordering and Moving Pages

#### **Drag and Drop**

1. **Grab any page**: Click and hold on any page in the sidebar
2. **Drag to reorder**: Move pages up/down within the same level
3. **Drop on folders**: Drag pages onto folders to move them inside
4. **Visual feedback**: See blue highlights showing where pages will be placed

#### **Context Menu (Right-Click)**

1. **Right-click any page**: Opens a context menu with options
2. **Select "Move to..."**: Opens a modal to choose the destination folder
3. **Choose destination**: Select from available folders or root level
4. **Confirm move**: Click "Move Here" to complete the action

#### **Move Modal Features**

- **Current location**: Shows where the page currently lives
- **Folder options**: Lists all available destination folders
- **Root level option**: Move pages to the top level
- **Visual confirmation**: Clear indication of the selected destination

## Markdown Support

The wiki supports full Markdown syntax including:

### Basic Formatting

```markdown
# Headers (H1-H6)

**Bold text**
_Italic text_
`Inline code`
[Links](https://example.com)
```

### Lists

```markdown
- Unordered lists
- With multiple items

1. Ordered lists
2. With numbers
```

### Code Blocks

````markdown
```javascript
function example() {
  console.log("Syntax highlighting supported!");
}
```
````

````

### Tables
```markdown
| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Data 1   | Data 2   | Data 3   |
````

### Advanced Features

- Blockquotes
- Horizontal rules
- Task lists
- Strikethrough text
- And much more!

## File Structure

```
src/components/wiki/
├── Wiki.js                 # Main wiki component
├── Wiki.css               # Main wiki styles
├── WikiSidebar.js         # Sidebar with page tree
├── WikiSidebar.css        # Sidebar styles
├── WikiEditor.js          # Dual-pane Markdown editor
├── WikiEditor.css         # Editor styles
├── WikiViewer.js          # Page viewer component
├── WikiViewer.css         # Viewer styles
├── NewPageModal.js        # Modal for creating pages
└── NewPageModal.css       # Modal styles
```

## Database Schema

The wiki uses a single table `wiki_pages` with the following structure:

```sql
CREATE TABLE wiki_pages (
  id VARCHAR(50) PRIMARY KEY,           -- WIKI-00001, WIKI-00002, etc.
  title VARCHAR(255) NOT NULL,          -- Page title
  slug VARCHAR(255) NOT NULL UNIQUE,    -- URL-friendly slug
  content TEXT DEFAULT '',              -- Markdown content
  parent_id VARCHAR(50),                -- Parent page for hierarchy
  sort_order INTEGER DEFAULT 0,         -- Order within parent
  is_folder BOOLEAN DEFAULT FALSE,      -- Whether this is a folder
  created_by UUID,                      -- User who created the page
  updated_by UUID,                      -- User who last updated
  created_at TIMESTAMP WITH TIME ZONE,  -- Creation timestamp
  updated_at TIMESTAMP WITH TIME ZONE   -- Last update timestamp
);
```

## Best Practices

### Content Organization

1. **Use Folders**: Group related pages together
2. **Descriptive Titles**: Make page titles clear and searchable
3. **Consistent Structure**: Follow a standard format for similar content
4. **Regular Updates**: Keep content current and relevant

### Writing Guidelines

1. **Clear Headers**: Use proper heading hierarchy (H1, H2, H3)
2. **Concise Content**: Write clear, actionable content
3. **Code Examples**: Include practical examples where relevant
4. **Cross-References**: Link to related pages

### Maintenance

1. **Regular Reviews**: Periodically review and update content
2. **Remove Outdated**: Delete or archive obsolete information
3. **Team Collaboration**: Encourage team contributions
4. **Version Control**: The database maintains creation/update timestamps

## Troubleshooting

### Common Issues

**Wiki not loading**

- Check that the database migration has been run
- Verify Supabase connection settings
- Check browser console for errors

**Cannot create pages**

- Ensure user has proper permissions
- Check database connection
- Verify the wiki_pages table exists

**Markdown not rendering**

- Check for syntax errors in Markdown
- Ensure all required dependencies are installed
- Clear browser cache and reload

### Getting Help

1. Check the browser console for error messages
2. Verify database connectivity
3. Review the setup instructions
4. Contact the development team

## Future Enhancements

Planned features for future releases:

- **Search Functionality**: Full-text search across all pages
- **Page Templates**: Pre-defined templates for common page types
- **Version History**: Track changes and revert to previous versions
- **Export Options**: Export pages to PDF or other formats
- **Collaborative Editing**: Real-time collaborative editing
- **Page Comments**: Discussion threads on pages
- **Advanced Permissions**: Role-based access control

## Contributing

To contribute to the wiki feature:

1. Follow the existing code structure and patterns
2. Maintain consistent styling with the rest of the application
3. Add appropriate error handling and user feedback
4. Update documentation for any new features
5. Test thoroughly across different browsers and devices
