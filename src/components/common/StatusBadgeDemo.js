import React from 'react';
import { getStatusClass, STATUS_COLORS } from '../../utils/statusUtils';

/**
 * Demo component to showcase all status badges with their colors
 * This can be used for testing and documentation purposes
 */
const StatusBadgeDemo = () => {
  const statuses = Object.keys(STATUS_COLORS);

  return (
    <div style={{ padding: '20px', backgroundColor: '#f8f9fa' }}>
      <h3>Status Badge Color Reference</h3>
      <p>This shows all available status badges with their assigned colors:</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '10px', marginTop: '20px' }}>
        {statuses.map((status) => (
          <div key={status} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className={`status-badge ${getStatusClass(status)}`}>
              {status}
            </span>
            <span style={{ fontSize: '0.875rem', color: '#6c757d' }}>
              ({STATUS_COLORS[status]})
            </span>
          </div>
        ))}
      </div>
      
      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #dee2e6' }}>
        <h5>Color Mapping:</h5>
        <ul style={{ fontSize: '0.875rem', color: '#495057' }}>
          <li><strong>Light Grey:</strong> Backlog</li>
          <li><strong>Red:</strong> Cancelled, Blocked - User, Blocked - Dev</li>
          <li><strong>Yellow:</strong> Requirements Gathering, In Technical Design</li>
          <li><strong>Blue:</strong> In Development</li>
          <li><strong>Light Purple:</strong> In Testing - Dev, In Testing - UAT</li>
          <li><strong>Green:</strong> Ready For Release, Released</li>
        </ul>
      </div>
    </div>
  );
};

export default StatusBadgeDemo;
