import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import TestApp from './pages/TestApp';
import { TestUserDataProvider } from './contexts/TestUserDataContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <TestUserDataProvider>
      <TestApp />
    </TestUserDataProvider>
  </React.StrictMode>
);

