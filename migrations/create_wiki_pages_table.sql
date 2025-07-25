-- Create wiki_pages table for storing internal wiki content
-- This table stores wiki pages with hierarchical structure and Markdown content

-- Check if the table already exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'wiki_pages') THEN
    CREATE TABLE wiki_pages (
      id VARCHAR(50) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      slug VARCHAR(255) NOT NULL UNIQUE,
      content TEXT DEFAULT '',
      parent_id VARCHAR(50) REFERENCES wiki_pages(id) ON DELETE CASCADE,
      sort_order INTEGER DEFAULT 0,
      is_folder BOOLEAN DEFAULT FALSE,
      created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
      updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Add comments to the table and columns
    COMMENT ON TABLE wiki_pages IS 'Stores wiki pages with hierarchical structure and Markdown content';
    COMMENT ON COLUMN wiki_pages.id IS 'Unique identifier for the wiki page (e.g., WIKI-00001)';
    COMMENT ON COLUMN wiki_pages.title IS 'Display title of the wiki page';
    COMMENT ON COLUMN wiki_pages.slug IS 'URL-friendly slug for the page';
    COMMENT ON COLUMN wiki_pages.content IS 'Markdown content of the page';
    COMMENT ON COLUMN wiki_pages.parent_id IS 'Parent page ID for hierarchical structure';
    COMMENT ON COLUMN wiki_pages.sort_order IS 'Order of pages within the same parent';
    COMMENT ON COLUMN wiki_pages.is_folder IS 'Whether this is a folder (container) or a page';
    COMMENT ON COLUMN wiki_pages.created_by IS 'User who created the page';
    COMMENT ON COLUMN wiki_pages.updated_by IS 'User who last updated the page';

    -- Create indexes for better performance
    CREATE INDEX idx_wiki_pages_parent_id ON wiki_pages(parent_id);
    CREATE INDEX idx_wiki_pages_slug ON wiki_pages(slug);
    CREATE INDEX idx_wiki_pages_sort_order ON wiki_pages(parent_id, sort_order);
    CREATE INDEX idx_wiki_pages_created_by ON wiki_pages(created_by);

    -- Enable Row Level Security
    ALTER TABLE wiki_pages ENABLE ROW LEVEL SECURITY;

    -- Create policy to allow all operations (can be restricted later)
    CREATE POLICY "Allow all" ON wiki_pages FOR ALL USING (true);

    -- Insert sample wiki structure
    INSERT INTO wiki_pages (id, title, slug, content, parent_id, sort_order, is_folder, created_by, updated_by) VALUES
      ('WIKI-00001', 'Getting Started', 'getting-started', '# Getting Started with ReleaseTrack Pro

Welcome to the ReleaseTrack Pro internal wiki! This is your central hub for documentation, processes, and knowledge sharing.

## What is this wiki for?

This wiki serves as a centralized location for:

- **Process Documentation**: Step-by-step guides for common tasks
- **Best Practices**: Recommended approaches and standards
- **Troubleshooting**: Solutions to common problems
- **Team Knowledge**: Shared insights and learnings

## How to use this wiki

### Creating Pages
1. Click the "+" button next to any folder to create a new page
2. Use the dual-pane editor to write in Markdown
3. See your changes in real-time in the preview pane
4. Save your work when ready

### Organizing Content
- Create folders to organize related pages
- Use descriptive titles for easy navigation
- Keep content up-to-date and relevant

## Markdown Support

This wiki supports full Markdown syntax including:

- **Headers** using `#`, `##`, `###`
- **Bold** and *italic* text
- `Code blocks` and syntax highlighting
- Lists, tables, and links
- And much more!

Happy documenting! 📚', NULL, 1, FALSE, NULL, NULL),

      ('WIKI-00002', 'Release Process', 'release-process-folder', '', NULL, 2, TRUE, NULL, NULL),
      
      ('WIKI-00003', 'Monthly Release Checklist', 'monthly-release-checklist', '# Monthly Release Checklist

This checklist ensures all steps are completed for a successful monthly release.

## Pre-Release (1 week before)

- [ ] **Code Freeze**: All development work completed
- [ ] **Testing**: QA testing completed and signed off
- [ ] **Documentation**: Release notes prepared
- [ ] **Stakeholder Communication**: Release announcement sent

## Release Day

- [ ] **Backup**: Production backup completed
- [ ] **Deployment**: Changes deployed to production
- [ ] **Smoke Testing**: Basic functionality verified
- [ ] **Monitoring**: System monitoring active

## Post-Release (24 hours after)

- [ ] **Verification**: All features working as expected
- [ ] **Performance**: System performance within normal ranges
- [ ] **User Feedback**: No critical issues reported
- [ ] **Documentation**: Wiki updated with any changes

## Emergency Rollback Plan

If issues are discovered:

1. **Assess Impact**: Determine severity of the issue
2. **Communication**: Notify stakeholders immediately
3. **Rollback**: Execute rollback procedure if necessary
4. **Root Cause**: Investigate and document the issue

## Contacts

- **Release Manager**: [Name]
- **Technical Lead**: [Name]
- **QA Lead**: [Name]', 'WIKI-00002', 1, FALSE, NULL, NULL),

      ('WIKI-00004', 'Troubleshooting', 'troubleshooting-folder', '', NULL, 3, TRUE, NULL, NULL),
      
      ('WIKI-00005', 'Common Issues', 'common-issues', '# Common Issues and Solutions

This page contains solutions to frequently encountered problems.

## Database Connection Issues

### Symptom
Application shows "Failed to connect to database" error.

### Solution
1. Check Supabase connection settings in `.env` file
2. Verify API keys are correct and not expired
3. Check network connectivity
4. Review Supabase dashboard for service status

## Email Notifications Not Working

### Symptom
Users not receiving email notifications for ticket updates.

### Solution
1. Check email service configuration
2. Verify user notification preferences
3. Check spam/junk folders
4. Review email service logs

## Performance Issues

### Symptom
Application loading slowly or timing out.

### Solution
1. Check database query performance
2. Review browser network tab for slow requests
3. Clear browser cache and cookies
4. Check server resource usage

## Authentication Problems

### Symptom
Users unable to log in or getting authentication errors.

### Solution
1. Check Google OAuth configuration
2. Verify redirect URLs are correct
3. Clear browser cookies for the domain
4. Check user permissions in Supabase

## Need More Help?

If you encounter an issue not listed here:

1. Check the application logs
2. Search this wiki for related topics
3. Contact the development team
4. Document the solution once resolved', 'WIKI-00004', 1, FALSE, NULL, NULL);

    -- Create trigger for updated_at timestamp
    CREATE TRIGGER update_wiki_pages_modtime
    BEFORE UPDATE ON wiki_pages
    FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

    RAISE NOTICE 'wiki_pages table created successfully with sample data';
  ELSE
    RAISE NOTICE 'wiki_pages table already exists';
  END IF;
END
$$;
