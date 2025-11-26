import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from '@/app/store';
import { loadStoredToken, fetchCurrentUser } from '@/features/auth/authSlice';
import { App } from './App';
import './style.css';
import 'leaflet/dist/leaflet.css';

store.dispatch(loadStoredToken());
store.dispatch(fetchCurrentUser());

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
);
