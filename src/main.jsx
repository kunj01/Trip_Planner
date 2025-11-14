import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import { BrowserRouter as Router } from "react-router-dom"
import { MainContextProvider } from "./context/MainContext"
import { AuthProvider } from "./context/AuthContext"

// Prevent hover flashing during clicks and suppress CORS errors from browser extensions
if (typeof window !== 'undefined') {
  // Handle touch devices - disable hover effects on touch-only devices
  if (window.matchMedia('(hover: none)').matches) {
    // On touch devices, add class to prevent sticky hover states
    document.body.classList.add('no-hover-touch');
  }

  // Suppress CORS errors from browser extensions (like Sentry from temp-mail extensions)
  // Handle unhandled promise rejections from browser extensions
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason;
    const errorMessage = error?.message || error?.toString() || '';
    const errorStack = error?.stack || '';
    
    // Suppress CORS errors from browser extensions (temp-mail, Sentry, etc.)
    if (
      errorMessage.includes('sentry-internal') ||
      errorMessage.includes('temp-mail.io') ||
      errorMessage.includes('temp-mail') ||
      (errorMessage.includes('CORS') && (errorMessage.includes('sentry') || errorMessage.includes('temp-mail'))) ||
      errorStack.includes('sentry-internal') ||
      errorStack.includes('temp-mail.io') ||
      errorStack.includes('content-script.js')
    ) {
      event.preventDefault(); // Prevent the error from being logged
      return;
    }
  });

  // Suppress console errors from browser extensions
  const originalError = console.error;
  console.error = function(...args) {
    const message = args.join(' ');
    // Filter out Sentry and temp-mail related errors
    if (
      message.includes('sentry-internal') ||
      message.includes('temp-mail.io') ||
      message.includes('temp-mail') ||
      (message.includes('CORS') && (message.includes('sentry') || message.includes('temp-mail'))) ||
      message.includes('content-script.js')
    ) {
      // Silently ignore these errors
      return;
    }
    originalError.apply(console, args);
  };
}

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <AuthProvider>
        <MainContextProvider>
          <App />
        </MainContextProvider>
      </AuthProvider>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
)
