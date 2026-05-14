import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { NotificationProvider } from './contexts/NotificationContext';
import ToastViewport from './components/Common/Alert/ToastViewport';
import './App.css';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <NotificationProvider>
      <App />
      <ToastViewport />
    </NotificationProvider>
  </React.StrictMode>
);
