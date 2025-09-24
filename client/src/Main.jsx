import React from 'react'
import ReactDOM from 'react-dom/client'
import './App.css'
import './index.css'           // ← Global styles
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
