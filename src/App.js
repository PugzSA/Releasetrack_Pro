import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Login from './components/auth/Login';
import MainApp from './MainApp';
import './App.css';

function App() {
  const { session } = useApp();

  return (
    <div className="App">
      {session ? <MainApp /> : <Login />}
    </div>
  );
}

const AppWrapper = () => (
  <AppProvider>
    <App />
  </AppProvider>
);

export default AppWrapper;
