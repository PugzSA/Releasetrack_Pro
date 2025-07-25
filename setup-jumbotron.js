const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('Please make sure REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY are set in your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupJumbotron() {
  console.log('🚀 Setting up jumbotron functionality...');
  
  try {
    // 1. Create the jumbotron_messages table
    console.log('📝 Creating jumbotron_messages table...');
    
    const createTableSQL = `
      -- Create jumbotron_messages table for storing dashboard announcement messages
      CREATE TABLE IF NOT EXISTS jumbotron_messages (
        id SERIAL PRIMARY KEY,
        message TEXT NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        display_order INTEGER NOT NULL DEFAULT 0,
        background_color VARCHAR(7) DEFAULT '#007bff',
        text_color VARCHAR(7) DEFAULT '#ffffff',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create index on is_active and display_order for faster lookups
      CREATE INDEX IF NOT EXISTS idx_jumbotron_messages_active_order ON jumbotron_messages(is_active, display_order);

      -- Enable Row Level Security
      ALTER TABLE jumbotron_messages ENABLE ROW LEVEL SECURITY;

      -- Create policy to allow all operations (can be restricted later)
      DROP POLICY IF EXISTS "Allow all" ON jumbotron_messages;
      CREATE POLICY "Allow all" ON jumbotron_messages FOR ALL USING (true);
    `;

    const { error: tableError } = await supabase.rpc('exec_sql', { sql: createTableSQL });
    
    if (tableError) {
      // Try alternative approach - create table directly
      console.log('⚠️  RPC method failed, trying direct table creation...');
      
      // Check if table exists first
      const { data: tableExists, error: checkError } = await supabase
        .from('jumbotron_messages')
        .select('id')
        .limit(1);
        
      if (checkError && checkError.code === '42P01') {
        console.error('❌ Cannot create table automatically. Please run the migration manually in Supabase SQL Editor.');
        console.log('\n📋 Copy and paste this SQL in your Supabase SQL Editor:');
        console.log('---------------------------------------------------');
        console.log(createTableSQL);
        console.log('---------------------------------------------------\n');
        return;
      }
    }

    // 2. Insert sample messages if table is empty
    console.log('📄 Adding sample messages...');
    
    const { data: existingMessages, error: selectError } = await supabase
      .from('jumbotron_messages')
      .select('id')
      .limit(1);

    if (selectError) {
      console.error('❌ Error checking existing messages:', selectError.message);
      return;
    }

    if (!existingMessages || existingMessages.length === 0) {
      const sampleMessages = [
        {
          message: 'Welcome to ReleaseTrack Pro! Stay updated with the latest release information.',
          is_active: true,
          display_order: 1,
          background_color: '#007bff',
          text_color: '#ffffff'
        },
        {
          message: 'Scheduled maintenance window: Sunday 2AM-4AM EST. System may be temporarily unavailable.',
          is_active: true,
          display_order: 2,
          background_color: '#ffc107',
          text_color: '#000000'
        },
        {
          message: 'New feature release coming next week! Check the releases page for more details.',
          is_active: true,
          display_order: 3,
          background_color: '#28a745',
          text_color: '#ffffff'
        }
      ];

      const { error: insertError } = await supabase
        .from('jumbotron_messages')
        .insert(sampleMessages);

      if (insertError) {
        console.error('❌ Error inserting sample messages:', insertError.message);
        return;
      }

      console.log('✅ Sample messages added successfully!');
    } else {
      console.log('ℹ️  Messages already exist, skipping sample data insertion.');
    }

    // 3. Add the jumbotron visibility setting to system_settings
    console.log('⚙️  Adding jumbotron visibility setting...');
    
    const { error: settingError } = await supabase
      .from('system_settings')
      .upsert({
        setting_key: 'show_jumbotron',
        setting_value: false,
        description: 'Show announcement jumbotron on dashboard'
      }, { 
        onConflict: 'setting_key',
        ignoreDuplicates: true 
      });

    if (settingError) {
      console.error('❌ Error adding system setting:', settingError.message);
      return;
    }

    console.log('✅ System setting added successfully!');
    
    console.log('\n🎉 Jumbotron setup complete!');
    console.log('\n📋 Next steps:');
    console.log('1. Go to Settings → System Settings');
    console.log('2. Check "Show Dashboard Jumbotron" checkbox');
    console.log('3. Go to Settings → Jumbotron Messages to manage your announcements');
    console.log('4. Visit the Dashboard to see your jumbotron in action!');
    
  } catch (error) {
    console.error('❌ Error setting up jumbotron:', error.message);
    console.log('\n📋 Manual setup required. Please run this SQL in your Supabase SQL Editor:');
    console.log('---------------------------------------------------');
    console.log(`
-- Create jumbotron_messages table
CREATE TABLE IF NOT EXISTS jumbotron_messages (
  id SERIAL PRIMARY KEY,
  message TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  display_order INTEGER NOT NULL DEFAULT 0,
  background_color VARCHAR(7) DEFAULT '#007bff',
  text_color VARCHAR(7) DEFAULT '#ffffff',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_jumbotron_messages_active_order ON jumbotron_messages(is_active, display_order);

-- Enable RLS
ALTER TABLE jumbotron_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON jumbotron_messages FOR ALL USING (true);

-- Insert sample data
INSERT INTO jumbotron_messages (message, is_active, display_order, background_color, text_color) VALUES
  ('Welcome to ReleaseTrack Pro! Stay updated with the latest release information.', true, 1, '#007bff', '#ffffff'),
  ('Scheduled maintenance window: Sunday 2AM-4AM EST. System may be temporarily unavailable.', true, 2, '#ffc107', '#000000'),
  ('New feature release coming next week! Check the releases page for more details.', true, 3, '#28a745', '#ffffff');

-- Add system setting
INSERT INTO system_settings (setting_key, setting_value, description) 
VALUES ('show_jumbotron', false, 'Show announcement jumbotron on dashboard')
ON CONFLICT (setting_key) DO NOTHING;
    `);
    console.log('---------------------------------------------------');
  }
}

// Run the setup
setupJumbotron();
