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

async function setupWiki() {
  console.log('🚀 Setting up wiki functionality...');
  
  try {
    // Check if wiki_pages table exists
    console.log('📝 Checking wiki_pages table...');
    
    const { data: tableExists, error: checkError } = await supabase
      .from('wiki_pages')
      .select('id')
      .limit(1);
      
    if (checkError && checkError.code === '42P01') {
      console.error('❌ wiki_pages table does not exist. Please run the migration manually in Supabase SQL Editor.');
      console.log('\n📋 Copy and paste this SQL in your Supabase SQL Editor:');
      console.log('---------------------------------------------------');
      
      const fs = require('fs');
      const path = require('path');
      const migrationPath = path.join(__dirname, 'migrations', 'create_wiki_pages_table.sql');
      
      try {
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
        console.log(migrationSQL);
      } catch (readError) {
        console.log('-- Create wiki_pages table for storing internal wiki content');
        console.log('-- Please check the migrations/create_wiki_pages_table.sql file');
      }
      
      console.log('---------------------------------------------------\n');
      return;
    }

    if (checkError) {
      console.error('❌ Error checking wiki_pages table:', checkError.message);
      return;
    }

    console.log('✅ wiki_pages table exists!');

    // Check if sample data exists
    console.log('📄 Checking for existing wiki pages...');
    
    const { data: existingPages, error: selectError } = await supabase
      .from('wiki_pages')
      .select('id, title')
      .limit(5);

    if (selectError) {
      console.error('❌ Error checking existing pages:', selectError.message);
      return;
    }

    if (existingPages && existingPages.length > 0) {
      console.log(`ℹ️  Found ${existingPages.length} existing wiki pages:`);
      existingPages.forEach(page => {
        console.log(`   - ${page.title} (${page.id})`);
      });
      console.log('✅ Wiki is ready to use!');
    } else {
      console.log('📄 No existing pages found. The wiki is ready for you to create your first page!');
    }
    
    console.log('\n🎉 Wiki setup complete!');
    console.log('\n📋 Next steps:');
    console.log('1. Start your application: npm start');
    console.log('2. Navigate to the Wiki section in the sidebar');
    console.log('3. Create your first wiki page or folder');
    console.log('4. Start documenting your processes and knowledge!');
    
    console.log('\n💡 Wiki Features:');
    console.log('• Dual-pane Markdown editor with live preview');
    console.log('• Hierarchical folder structure');
    console.log('• Full Markdown support with syntax highlighting');
    console.log('• Professional, modern interface');
    console.log('• Search and organize your documentation');
    
  } catch (error) {
    console.error('❌ Error setting up wiki:', error.message);
    console.log('\n📋 Manual setup may be required. Please run the SQL migration in your Supabase SQL Editor.');
  }
}

// Run the setup
setupWiki();
