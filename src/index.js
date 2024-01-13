import React from 'react';
import ReactDOM from 'react-dom/client';
import './App.css';
import './theme.css';
import App from './App.tsx';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
serviceWorkerRegistration.unregister();
reportWebVitals();