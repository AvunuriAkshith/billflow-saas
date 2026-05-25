import { Routes, Route } from 'react-router-dom'
import { useState } from 'react'

import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import ProtectedRoute from './routes/ProtectedRoute'
import Plans from './pages/Plans'
import BillingHistory from './pages/BillingHistory'
import AdminDashboard from './pages/AdminDashboard'

function App() {

  const [darkMode, setDarkMode] = useState(false)

  return (

    <div
      className={
        darkMode
          ? 'dark bg-gray-900 text-white min-h-screen'
          : 'bg-gray-100 min-h-screen'
      }
    >

      <Routes>

        <Route
          path='/'
          element={<Home />}
        />

        <Route
          path='/login'
          element={<Login />}
        />

        <Route
          path='/register'
          element={<Register />}
        />

        <Route
          path='/dashboard'
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path='/plans'
          element={<Plans />}
        />

        <Route
          path='/billing-history'
          element={
            <ProtectedRoute>
              <BillingHistory />
            </ProtectedRoute>
          }
        />

        <Route
  path='/admin'
  element={
    <ProtectedRoute adminOnly={true}>
      <AdminDashboard />
    </ProtectedRoute>
  }
/>

      </Routes>

    </div>
  )
}

export default App