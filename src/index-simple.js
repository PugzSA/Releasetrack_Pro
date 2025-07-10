import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import SimplifiedApp from './simplified-app';
import 'bootstrap/dist/css/bootstrap.min.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <SimplifiedApp />
  </React.StrictMode>
);
