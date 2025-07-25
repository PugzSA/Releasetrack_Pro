-- ReleaseTrack Pro Supabase Schema

-- Note: JWT configuration should be done through the Supabase dashboard
-- Go to Authentication > Settings > JWT Settings instead of using SQL

-- Create tables with proper relationships

-- Releases table
CREATE TABLE IF NOT EXISTS releases (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  version VARCHAR(50),
  target DATE,
  status VARCHAR(50) NOT NULL,
  description TEXT,
  stakeholder_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tickets table
CREATE TABLE IF NOT EXISTS tickets (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50),
  priority VARCHAR(50),
  status VARCHAR(50) NOT NULL,
  assignee VARCHAR(100),
  release_id VARCHAR(50) REFERENCES releases(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Metadata table
CREATE TABLE IF NOT EXISTS metadata (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  component VARCHAR(100),
  status VARCHAR(50) NOT NULL,
  ticket_id VARCHAR(50) REFERENCES tickets(id) ON DELETE SET NULL,
  release_id VARCHAR(50) REFERENCES releases(id) ON DELETE SET NULL,
  last_modified TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Release Strategies table
CREATE TABLE IF NOT EXISTS release_strategies (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  steps JSONB,
  approvers JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data

-- Sample releases
INSERT INTO releases (id, name, version, target, status, description, stakeholder_summary)
VALUES
  ('RELEASE-1', 'February 2024 Release', 'v1.0', '2024-02-28', 'testing', 'Focus on automation workflow and integration improvements', 'Streamlining internal processes with automated workflows, reducing manual work by 40%'),
  ('RELEASE-2', 'January 2024 Release', 'v1.0', '2024-01-31', 'development', 'Monthly release including customer portal enhancements and bug fixes', 'This release will improve customer experience with new self-service capabilities and resolve 12 critical bugs reported by users');

-- Sample tickets
INSERT INTO tickets (id, title, description, type, priority, status, assignee, release_id)
VALUES
  ('SUP-00001', 'Email not sending', 'Automated emails are not being sent when cases are updated', 'Issue', 'High', 'Backlog', 'Jane Doe', 'RELEASE-1'),
  ('SUP-00002', 'Add custom field to Account', 'New compliance requirement needs a custom field on Account object', 'Enhancement', 'Medium', 'In Development', 'John Smith', 'RELEASE-1'),
  ('SUP-00003', 'Update validation rule', 'Current validation rule is too restrictive', 'Request', 'Low', 'Released', 'Alex Johnson', 'RELEASE-2');

-- Sample metadata
INSERT INTO metadata (name, type, component, status, ticket_id, release_id)
VALUES
  ('AccountPageLayout', 'Layout', 'Account', 'Modified', 'SUP-00002', 'RELEASE-1'),
  ('CaseEmailAlert', 'Workflow', 'Case', 'New', 'SUP-00001', 'RELEASE-1'),
  ('AccountValidationRule', 'ValidationRule', 'Account', 'Modified', 'SUP-00003', 'RELEASE-2');

-- Sample release strategies
INSERT INTO release_strategies (name, description, steps, approvers)
VALUES 
  ('Standard Release Process', 'Standard monthly release process', '["Development", "QA", "UAT", "Production"]', '["John Smith", "Jane Doe"]'),
  ('Hotfix Process', 'Emergency hotfix process for critical issues', '["Development", "QA", "Production"]', '["John Smith", "Alex Johnson"]');

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE release_strategies ENABLE ROW LEVEL SECURITY;

-- Create policies (default allow all for now, you can restrict later)
CREATE POLICY "Allow all" ON releases FOR ALL USING (true);
CREATE POLICY "Allow all" ON tickets FOR ALL USING (true);
CREATE POLICY "Allow all" ON metadata FOR ALL USING (true);
CREATE POLICY "Allow all" ON release_strategies FOR ALL USING (true);

-- Create functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_modified_column() 
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$ language 'plpgsql';

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_releases_modtime
BEFORE UPDATE ON releases
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_tickets_modtime
BEFORE UPDATE ON tickets
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_metadata_modtime
BEFORE UPDATE ON metadata
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_release_strategies_modtime
BEFORE UPDATE ON release_strategies
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
