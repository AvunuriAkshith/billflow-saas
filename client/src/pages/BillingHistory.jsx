import { useEffect, useState } from 'react'

import API from '../services/api'

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts'

const COLORS = [
  '#2563eb',
  '#16a34a',
  '#7c3aed',
]

const BillingHistory = () => {

  const [payments, setPayments] =
    useState([])

  const user = JSON.parse(
    localStorage.getItem('user')
  )

  useEffect(() => {

    fetchPayments()

  }, [])

  const fetchPayments = async () => {

    try {

      const response = await API.get(
        `/payment/billing-history/${user.email}`
      )

      setPayments(response.data.payments)

    } catch (error) {

      console.log(error)
    }
  }

  const totalPayments =
    payments.length

  const activePayments =
    payments.filter(
      (payment) =>
        payment.status === 'Success'
    ).length

  const chartData = [
    {
      name: 'Successful',
      value: activePayments,
    },

    {
      name: 'Total',
      value: totalPayments,
    },
  ]

  return (

    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-10 transition">

      {/* Header */}

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-5xl font-bold text-blue-600">
            Billing History
          </h1>

          <p className="text-gray-500 dark:text-gray-300 mt-2">
            View all your payment transactions
          </p>

        </div>

      </div>

      {/* Summary Cards */}

      <div className="grid md:grid-cols-3 gap-8 mt-10">

        <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white p-8 rounded-3xl shadow-xl">

          <p className="text-lg opacity-80">
            Total Transactions
          </p>

          <h2 className="text-5xl font-bold mt-4">
            {totalPayments}
          </h2>

        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-700 text-white p-8 rounded-3xl shadow-xl">

          <p className="text-lg opacity-80">
            Successful Payments
          </p>

          <h2 className="text-5xl font-bold mt-4">
            {activePayments}
          </h2>

        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-700 text-white p-8 rounded-3xl shadow-xl">

          <p className="text-lg opacity-80">
            Current Plan
          </p>

          <h2 className="text-4xl font-bold mt-4">
            {
              payments[0]?.plan ||
              'No Plan'
            }
          </h2>

        </div>

      </div>

      {/* Charts + Table */}

      <div className="grid md:grid-cols-3 gap-8 mt-10">

        {/* Chart */}

        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl">

          <h2 className="text-2xl font-bold text-gray-700 dark:text-white mb-6">
            Payment Overview
          </h2>

          <ResponsiveContainer
            width="100%"
            height={300}
          >

            <PieChart>

              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
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

        {/* Table */}

        <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden">

          <div className="p-6 border-b border-gray-200 dark:border-gray-700">

            <h2 className="text-2xl font-bold text-gray-700 dark:text-white">
              Transactions
            </h2>

          </div>

          <table className="w-full">

            <thead className="bg-blue-600 text-white">

              <tr>

                <th className="p-4 text-left">
                  Plan
                </th>

                <th className="p-4 text-left">
                  Payment ID
                </th>

                <th className="p-4 text-left">
                  Status
                </th>

                <th className="p-4 text-left">
                  Invoice
                </th>

              </tr>

            </thead>

            <tbody>

              {payments.map(
                (payment, index) => (

                  <tr
                    key={index}
                    className="border-b border-gray-200 dark:border-gray-700"
                  >

                    <td className="p-4 text-black dark:text-white">
                      {payment.plan}
                    </td>

                    <td className="p-4 text-black dark:text-white">
                      {payment.payment_id}
                    </td>

                    <td className="p-4">

                      <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold">
                        {payment.status}
                      </span>

                    </td>

                    <td className="p-4">

                      <a
                        href={`http://127.0.0.1:8000/api/payment/invoice/${payment.payment_id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                      >
                        Download
                      </a>

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  )
}

export default BillingHistory