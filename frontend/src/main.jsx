import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { ToastProvider } from './components/Toast.jsx'
import { ErrorBoundary } from './components/ErrorBoundary.jsx'
import { ScriptProvider } from './context/ScriptContext.jsx'
import './style.css'

ReactDOM.createRoot(document.getElementById('app')).render(
    <React.StrictMode>
        <ErrorBoundary>
            <ScriptProvider>
                <ToastProvider>
                    <App />
                </ToastProvider>
            </ScriptProvider>
        </ErrorBoundary>
    </React.StrictMode>,
)

