import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import api from './api'
import Layout from './components/Layout'
import Profile from './pages/Profile'
import ReportForm from './pages/ReportForm'
import ReportList from './pages/ReportList'
import Audit from './pages/city/Audit'
import FilingAudit from './pages/province/FilingAudit'
import ReportAudit from './pages/province/ReportAudit'

function App() {
  const [username, setUsername] = useState('test_enterprise')
  const [password, setPassword] = useState('123456')
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState(null)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/api/auth/login', { username, password })
      const { token, user: userData } = res.data
      localStorage.setItem('token', token)
      setUser(userData)
    } catch (err) {
      setError(err.response?.data?.message || '登录失败')
    }
    setLoading(false)
  }

  if (user) {
    return (
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/profile" replace />} />
            <Route path="profile" element={<Profile />} />
            <Route path="report-form" element={<ReportForm />} />
            <Route path="report-list" element={<ReportList />} />
            <Route path="city/audit" element={<Audit />} />
            <Route path="province/filing-audit" element={<FilingAudit />} />
            <Route path="province/report-audit" element={<ReportAudit />} />
          </Route>
        </Routes>
      </Router>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20
    }}>
      <div style={{
        background: 'white',
        padding: 40,
        borderRadius: 12,
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: 400,
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: 30 }}>
          <div style={{
            fontSize: 48,
            marginBottom: 10,
            color: '#667eea'
          }}>
            📊
          </div>
          <h1 style={{
            margin: 0,
            color: '#333',
            fontSize: 24,
            fontWeight: 'bold'
          }}>
            企业就业失业数据采集系统
          </h1>
          <p style={{
            margin: '10px 0 0',
            color: '#666',
            fontSize: 14
          }}>
            请登录您的账号
          </p>
        </div>

        <div style={{ marginBottom: 20 }}>
          <input
            type="text"
            placeholder="用户名"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              marginBottom: 15,
              border: '1px solid #ddd',
              borderRadius: 6,
              fontSize: 16,
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ position: 'relative', marginBottom: 20 }}>
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 50px 12px 16px',
              border: '1px solid #ddd',
              borderRadius: 6,
              fontSize: 16,
              boxSizing: 'border-box'
            }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'transparent',
              border: '1px solid #ccc',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 14,
              color: '#666',
              padding: '4px 8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title={showPassword ? '隐藏密码' : '显示密码'}
          >
            {showPassword ? '🙈' : '👁'}
          </button>
        </div>

        {error && (
          <p style={{
            color: '#ff4d4f',
            margin: '0 0 20px',
            fontSize: 14,
            textAlign: 'left'
          }}>
            {error}
          </p>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            background: loading ? '#ccc' : '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            fontSize: 16,
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.3s'
          }}
          onMouseEnter={(e) => {
            if (!loading) e.target.style.background = '#5a67d8';
          }}
          onMouseLeave={(e) => {
            if (!loading) e.target.style.background = '#667eea';
          }}
        >
          {loading ? '登录中...' : '登录'}
        </button>
      </div>
    </div>
  )
}

export default App
