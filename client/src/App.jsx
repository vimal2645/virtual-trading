// client/src/App.jsx

import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import History from './pages/History'
import './App.css'

function App() {
  const token = localStorage.getItem('token')

  return (
    <Router>
      <div className="App">
        <nav style={{ padding: '1rem', background: '#f0f0f0', marginBottom: '2rem' }}>
          <h1>Virtual Trader</h1>
          {token && (
            <div>
              <a href="#/dashboard" style={{ marginRight: '1rem' }}>Dashboard</a>
              <a href="#/history" style={{ marginRight: '1rem' }}>History</a>
              <button onClick={() => {
                localStorage.removeItem('token')
                window.location.href = '#/login'
              }}>
                Logout
              </button>
            </div>
          )}
        </nav>

        <Routes>
          <Route path="/login" element={!token ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/history" element={token ? <History /> : <Navigate to="/login" />} />
          <Route path="*" element={<Navigate to={token ? "/dashboard" : "/login"} />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
