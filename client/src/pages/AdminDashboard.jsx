import { useEffect, useState } from 'react'

import API from '../services/api'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

const COLORS = [
  '#2563eb',
  '#7c3aed',
  '#16a34a',
]

const AdminDashboard = () => {

  const [analytics, setAnalytics] =
    useState({})

  const [users, setUsers] =
    useState([])

  const [payments, setPayments] =
    useState([])

  const [selectedData, setSelectedData] =
    useState([])

  const [selectedTitle, setSelectedTitle] =
    useState('')

  useEffect(() => {

    fetchAnalytics()

  }, [])

  const fetchAnalytics = async () => {

    try {

      const response = await API.get(
        '/payment/admin/analytics'
      )

      setAnalytics(response.data)

      setUsers(
        response.data.users || []
      )

      setPayments(
        response.data.payments || []
      )

    } catch (error) {

      console.log(error)
    }
  }

  const chartData = [
    {
      name: 'Revenue',
      amount:
        analytics.total_revenue || 0,
    },

    {
      name: 'Users',
      amount:
        analytics.total_users || 0,
    },

    {
      name: 'Subscriptions',
      amount:
        analytics.active_subscriptions || 0,
    },
  ]

  return (

    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-10 transition">

      {/* Header */}

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-5xl font-bold text-blue-600">
            Admin Dashboard
          </h1>

          <p className="text-gray-500 dark:text-gray-300 mt-2">
            BillFlow platform analytics overview
          </p>

        </div>

      </div>

      {/* Analytics Cards */}

      <div className="grid md:grid-cols-3 gap-8 mt-10">

        {/* Revenue Card */}

        <div
            onClick={() => {

    setSelectedData(payments)

    setSelectedTitle(
      'Revenue Transactions'
    )

  }}
          className="cursor-pointer bg-gradient-to-r from-blue-500 to-blue-700 text-white p-8 rounded-3xl shadow-xl hover:scale-105 transition"
        >

          <p className="text-lg opacity-80">
            Total Revenue
          </p>

          <h2 className="text-5xl font-bold mt-4">
            ₹{analytics.total_revenue || 0}
          </h2>

        </div>

        {/* Users Card */}

        <div
            onClick={() => {

    setSelectedData(users)

    setSelectedTitle(
      'Registered Users'
    )

  }}
          className="cursor-pointer bg-gradient-to-r from-purple-500 to-purple-700 text-white p-8 rounded-3xl shadow-xl hover:scale-105 transition"
        >

          <p className="text-lg opacity-80">
            Total Users
          </p>

          <h2 className="text-5xl font-bold mt-4">
            {analytics.total_users || 0}
          </h2>

        </div>

        {/* Active Subscription Card */}

        <div
            onClick={() => {

    const activeUsers =
      users.filter(
        (user) =>
          user.subscriptionStatus ===
          'Active'
      )

    setSelectedData(activeUsers)

    setSelectedTitle(
      'Premium Users'
    )

  }}
          className="cursor-pointer bg-gradient-to-r from-green-500 to-green-700 text-white p-8 rounded-3xl shadow-xl hover:scale-105 transition"
        >

          <p className="text-lg opacity-80">
            Premium Users 
          </p>

          <h2 className="text-5xl font-bold mt-4">
            {
              analytics.active_subscriptions || 0
            }
          </h2>

        </div>

      </div>

      {/* Charts Section */}

      <div className="grid md:grid-cols-2 gap-8 mt-10">

        {/* Bar Chart */}

        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl">

          <h2 className="text-2xl font-bold text-gray-700 dark:text-white mb-6">
            Platform Analytics
          </h2>

          <ResponsiveContainer
            width="100%"
            height={350}
          >

            <BarChart data={chartData}>

              <XAxis dataKey="name" />

              <YAxis />

              <Tooltip />

              <Bar
                dataKey="amount"
                radius={[10, 10, 0, 0]}
              />

            </BarChart>

          </ResponsiveContainer>

        </div>

        {/* Pie Chart */}

        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl">

          <h2 className="text-2xl font-bold text-gray-700 dark:text-white mb-6">
            Revenue Distribution
          </h2>

          <ResponsiveContainer
            width="100%"
            height={350}
          >

            <PieChart>

              <Pie
                data={chartData}
                dataKey="amount"
                nameKey="name"
                outerRadius={120}
                label
              >

                {chartData.map(
                  (entry, index) => (

                    <Cell
                      key={index}
                      fill={
                        COLORS[index % COLORS.length]
                      }
                    />

                  )
                )}

              </Pie>

              <Tooltip />

            </PieChart>

          </ResponsiveContainer>

        </div>

      </div>

      {/* Detailed Information Section */}

      <div className="mt-10 bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8">

        <div className="flex items-center justify-between">

          <h2 className="text-3xl font-bold text-gray-700 dark:text-white">
            {selectedTitle || 'Detailed Information'}
          </h2>

          <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold">
            {selectedData.length} Records
          </span>

        </div>

        <div className="mt-8 space-y-4 max-h-[500px] overflow-y-auto">

          {selectedData.length > 0 ? (

            selectedData.map(
              (item, index) => (

                <div
                  key={index}
                  className="border border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:shadow-lg transition"
                >

                  {/* User Info */}

                  <div className="flex items-center justify-between">

                    <div>

                      <h3 className="text-xl font-bold text-black dark:text-white">
                        {item.name || 'Unknown User'}
                      </h3>

                      <p className="text-gray-500 mt-1">
                        {item.email}
                      </p>

                    </div>

                    <div>

                      <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold">
                        {
                          item.status ||
                          item.subscriptionStatus ||
                          'Active'
                        }
                      </span>

                    </div>

                  </div>

                  {/* Payment Details */}

                  {(item.plan ||
                    item.payment_id) && (

                    <div className="mt-4 grid md:grid-cols-2 gap-4">

                      <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-xl">

                        <p className="text-gray-500 text-sm">
                          Plan
                        </p>

                        <h4 className="text-lg font-bold text-black dark:text-white mt-1">
                          {item.plan || 'N/A'}
                        </h4>

                      </div>

                      <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-xl">

                        <p className="text-gray-500 text-sm">
                          Payment ID
                        </p>

                        <h4 className="text-lg font-bold text-black dark:text-white mt-1 break-all">
                          {item.payment_id || 'N/A'}
                        </h4>

                      </div>

                    </div>

                  )}

                </div>

              )
            )

          ) : (

            <div className="text-center py-20">

              <h3 className="text-2xl font-bold text-gray-500">
                No Data Selected
              </h3>

              <p className="text-gray-400 mt-3">
                Click any analytics card above to view details
              </p>

            </div>

          )}

        </div>

      </div>

      {/* Bottom Section */}

      <div className="grid md:grid-cols-2 gap-8 mt-10">

        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl">

          <h2 className="text-2xl font-bold text-gray-700 dark:text-white">
            Growth Status
          </h2>

          <p className="text-gray-500 dark:text-gray-300 mt-4 leading-8">
            BillFlow is actively growing with
            increasing subscriptions,
            successful payments,
            and strong platform engagement.
          </p>

        </div>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl">

          <h2 className="text-2xl font-bold text-gray-700 dark:text-white">
            System Health
          </h2>

          <div className="mt-6 space-y-4">

            <div className="flex items-center gap-3">

              <div className="w-4 h-4 rounded-full bg-green-500"></div>

              <p className="text-green-600 font-semibold">
                Database Connected
              </p>

            </div>

            <div className="flex items-center gap-3">

              <div className="w-4 h-4 rounded-full bg-green-500"></div>

              <p className="text-green-600 font-semibold">
                Payment Gateway Active
              </p>

            </div>

            <div className="flex items-center gap-3">

              <div className="w-4 h-4 rounded-full bg-green-500"></div>

              <p className="text-green-600 font-semibold">
                APIs Operational
              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  )
}

export default AdminDashboard