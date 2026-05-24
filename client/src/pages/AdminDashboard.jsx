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

  useEffect(() => {

    fetchAnalytics()

  }, [])

  const fetchAnalytics = async () => {

    try {

      const response = await API.get(
        '/payment/admin/analytics'
      )

      setAnalytics(response.data)

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

        <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white p-8 rounded-3xl shadow-xl">

          <p className="text-lg opacity-80">
            Total Revenue
          </p>

          <h2 className="text-5xl font-bold mt-4">
            ₹{analytics.total_revenue}
          </h2>

        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-700 text-white p-8 rounded-3xl shadow-xl">

          <p className="text-lg opacity-80">
            Total Users
          </p>

          <h2 className="text-5xl font-bold mt-4">
            {analytics.total_users}
          </h2>

        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-700 text-white p-8 rounded-3xl shadow-xl">

          <p className="text-lg opacity-80">
            Active Subscriptions
          </p>

          <h2 className="text-5xl font-bold mt-4">
            {
              analytics.active_subscriptions
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

      {/* Bottom Section */}

      <div className="grid md:grid-cols-2 gap-8 mt-10">

        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl">

          <h2 className="text-2xl font-bold text-gray-700 dark:text-white">
            Growth Status
          </h2>

          <p className="text-gray-500 dark:text-gray-300 mt-4">
            BillFlow is actively growing with
            increasing subscriptions and revenue.
          </p>

        </div>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl">

          <h2 className="text-2xl font-bold text-gray-700 dark:text-white">
            System Health
          </h2>

          <p className="text-green-600 font-semibold mt-4">
            ● All systems operational
          </p>

        </div>

      </div>

    </div>
  )
}

export default AdminDashboard