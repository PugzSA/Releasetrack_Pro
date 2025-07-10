# Supabase Setup for ReleaseTrack Pro

This guide will help you set up Supabase as the database backend for ReleaseTrack Pro.

## 1. Create a Supabase Account and Project

1. Go to [Supabase](https://supabase.com/) and sign up for an account
2. Create a new project:
   - Give it a name (e.g., "ReleaseTrack Pro")
   - Set a secure database password
   - Choose a region closest to your users
   - Click "Create new project"

## 2. Set Up Database Schema

1. In your Supabase project dashboard, navigate to the "SQL Editor" section
2. Create a new query
3. Copy and paste the contents of the `supabase-schema.sql` file from this project
4. Run the SQL script to create all necessary tables and sample data

## 3. Get Your API Keys

1. In your Supabase project dashboard, go to "Settings" > "API"
2. Copy the following values:
   - **URL**: The URL for your Supabase project
   - **anon public key**: The anonymous API key for client-side access

## 4. Configure Environment Variables

1. Update the `.env` file in your project root with your Supabase credentials:

```
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 5. Run the Application

1. Start the application using the existing batch script:

```
.\start-full-app.bat
```

## Database Structure

The Supabase database includes the following tables:

1. **releases**: Stores information about each release
2. **tickets**: Tracks tickets associated with releases
3. **metadata**: Manages metadata items related to releases and tickets
4. **release_strategies**: Defines different release strategies and processes

## Switching Between Mock Data and Supabase

The application is configured to use Supabase when environment variables are set, otherwise it falls back to mock data:

- **To use Supabase**: Make sure the `.env` file has valid Supabase credentials
- **To use mock data**: Remove or comment out the Supabase environment variables

## Supabase Dashboard Features

Once set up, you can use the Supabase dashboard to:

1. **Table Editor**: Directly view and edit data in your tables
2. **Authentication**: Set up user authentication if needed
3. **Storage**: Store files related to your releases or tickets
4. **Edge Functions**: Create serverless functions for complex operations
5. **SQL Editor**: Run custom queries against your database

## Troubleshooting

- **Connection Issues**: Ensure your Supabase URL and API key are correct
- **CORS Errors**: Check that your Supabase project allows requests from your development URL
- **Data Not Loading**: Verify that your tables were created correctly with the SQL script
- **Authentication Errors**: Make sure you're using the correct API key (anon key for client-side)

## Next Steps

1. **Add Authentication**: Implement user authentication using Supabase Auth
2. **Set Up Row-Level Security**: Configure more granular access controls
3. **Add Real-time Subscriptions**: Implement real-time updates using Supabase's real-time capabilities
