import { useNavigate } from 'react-router-dom'

import { useContext } from 'react'

import {
  ThemeContext
} from '../context/ThemeContext'

const Dashboard = () => {

  const navigate = useNavigate()

  const {
    darkMode,
    toggleTheme
  } = useContext(ThemeContext)

  const user = JSON.parse(
    localStorage.getItem('user')
  )

  const handleLogout = () => {

    localStorage.removeItem('token')

    localStorage.removeItem('user')

    navigate('/login')
  }

  return (

    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-10 transition">

      {/* Header */}

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-5xl font-bold text-blue-600">
            Welcome, {user?.name}
          </h1>

          <p className="text-gray-500 dark:text-gray-300 mt-2 text-lg">
            Manage your subscriptions and billing
          </p>

        </div>

        {/* Buttons */}

        <div className="flex gap-4">

          {user?.role === 'admin' && (

  <button
    onClick={() => navigate('/admin')}
    className="bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700"
  >
    Admin Dashboard
  </button>

)}

          <button
            onClick={toggleTheme}
            className="bg-black text-white px-6 py-3 rounded-2xl shadow-lg hover:scale-105 transition"
          >
            {darkMode
              ? 'Light Mode'
              : 'Dark Mode'}
          </button>

          <button
            onClick={handleLogout}
            className="bg-gradient-to-r from-red-500 to-red-700 text-white px-6 py-3 rounded-2xl shadow-lg hover:scale-105 transition"
          >
            Logout
          </button>

        </div>

      </div>

      {/* Analytics Cards */}

      <div className="grid md:grid-cols-3 gap-8 mt-10">

        <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white p-8 rounded-3xl shadow-2xl">

          <p className="text-lg opacity-80">
            Current User
          </p>

          <h2 className="text-4xl font-bold mt-4">
            {user?.name}
          </h2>

        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-700 text-white p-8 rounded-3xl shadow-2xl">

          <p className="text-lg opacity-80">
           Current Plan
          </p>

          <h2 className="text-4xl font-bold mt-4">

 {
  user?.subscriptionPlan || 'Free'
}

</h2>

        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-700 text-white p-8 rounded-3xl shadow-2xl">

          <p className="text-lg opacity-80">
            Role
          </p>

          <h2 className="text-4xl font-bold mt-4">
            {user?.role}
          </h2>

        </div>

      </div>

      {/* Main Section */}

      <div className="grid md:grid-cols-3 gap-8 mt-10">

        {/* Profile Card */}

        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8">

          <h2 className="text-2xl font-bold text-gray-700 dark:text-white">
            Account Information
          </h2>

          <div className="mt-6 space-y-4">

            <div>

              <p className="text-gray-500 dark:text-gray-300">
                Name
              </p>

              <h3 className="text-xl font-semibold text-black dark:text-white">
                {user?.name}
              </h3>

            </div>

            <div>

              <p className="text-gray-500 dark:text-gray-300">
                Email
              </p>

              <h3 className="text-xl font-semibold text-black dark:text-white break-all">
                {user?.email}
              </h3>

            </div>

            <div>

              <p className="text-gray-500 dark:text-gray-300">
                Account Type
              </p>

              <h3 className="text-xl font-semibold text-black dark:text-white">
                Premium User
              </h3>

            </div>

          </div>

        </div>

        {/* Quick Actions */}

        <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8">

          <h2 className="text-2xl font-bold text-gray-700 dark:text-white">
            Quick Actions
          </h2>

          <div className="grid md:grid-cols-2 gap-6 mt-8">

            <button
              onClick={() => navigate('/plans')}
              className="bg-gradient-to-r from-blue-500 to-blue-700 text-white p-8 rounded-3xl text-left shadow-lg hover:scale-105 transition"
            >

              <h3 className="text-2xl font-bold">
                Upgrade Plan
              </h3>

              <p className="mt-3 opacity-80">
                Explore subscription plans
              </p>

            </button>

            <button
              onClick={() =>
                navigate('/billing-history')
              }
              className="bg-gradient-to-r from-gray-700 to-gray-900 text-white p-8 rounded-3xl text-left shadow-lg hover:scale-105 transition"
            >

              <h3 className="text-2xl font-bold">
                Billing History
              </h3>

              <p className="mt-3 opacity-80">
                View invoices and payments
              </p>

            </button>

          </div>

          {/* Bottom Banner */}

          <div className="mt-10 bg-gradient-to-r from-indigo-500 to-blue-600 text-white p-8 rounded-3xl">

            <h2 className="text-3xl font-bold">
              BillFlow Premium
            </h2>

            <p className="mt-4 text-lg opacity-90">
              Manage subscriptions, invoices,
              analytics, and payments with a
              modern SaaS experience.
            </p>

          </div>

        </div>

      </div>

    </div>
  )
}

export default Dashboard