import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Card, Button, Alert } from 'react-bootstrap';

const SupabaseTest = () => {
  const [connectionStatus, setConnectionStatus] = useState('Testing...');
  const [releases, setReleases] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Test the connection on component mount
  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Test if we can connect and fetch data
      const { data, error } = await supabase
        .from('releases')
        .select('*')
        .limit(5);
      
      if (error) throw error;
      
      setReleases(data || []);
      setConnectionStatus('Connected successfully!');
      setLoading(false);
    } catch (err) {
      console.error('Supabase connection error:', err);
      setConnectionStatus('Connection failed');
      setError(err.message || 'Failed to connect to Supabase');
      setLoading(false);
    }
  };

  return (
    <Card className="mt-4">
      <Card.Header>Supabase Connection Test</Card.Header>
      <Card.Body>
        <Card.Title>
          Status: {' '}
          {loading ? (
            <span className="text-secondary">Testing...</span>
          ) : error ? (
            <span className="text-danger">Failed</span>
          ) : (
            <span className="text-success">Connected</span>
          )}
        </Card.Title>
        
        {error && (
          <Alert variant="danger">
            <strong>Error:</strong> {error}
            <hr />
            <p className="mb-0">
              Make sure your Supabase URL and anon key are correct in the .env file.
              Also verify that you've created the necessary tables in your Supabase project.
            </p>
          </Alert>
        )}

        {!error && releases.length > 0 && (
          <>
            <Alert variant="success">
              Successfully connected to Supabase and retrieved {releases.length} releases!
            </Alert>
            <h5>Sample Data:</h5>
            <ul>
              {releases.map(release => (
                <li key={release.id}>
                  {release.name} - {release.status}
                </li>
              ))}
            </ul>
          </>
        )}

        {!error && releases.length === 0 && !loading && (
          <Alert variant="warning">
            Connected to Supabase, but no releases found. Make sure you've added data to your tables.
          </Alert>
        )}
        
        <Button 
          variant="primary" 
          onClick={testConnection} 
          disabled={loading}
        >
          {loading ? 'Testing...' : 'Test Connection Again'}
        </Button>
      </Card.Body>
      <Card.Footer className="text-muted">
        <small>
          URL: {process.env.REACT_APP_SUPABASE_URL ? 
            `${process.env.REACT_APP_SUPABASE_URL.substring(0, 15)}...` : 
            'Not set'
          }
        </small>
      </Card.Footer>
    </Card>
  );
};

export default SupabaseTest;
