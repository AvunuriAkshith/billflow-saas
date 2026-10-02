import { useEffect, useMemo, useState } from 'react'

import API from '../services/api'

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const PLAN_COLORS = {
  Free: '#64748b',
  Pro: '#2563eb',
  Enterprise: '#7c3aed',
}

const STATUS_COLORS = {
  Success: '#16a34a',
  Failed: '#dc2626',
  Other: '#f59e0b',
}

const currency = new Intl.NumberFormat('en-IN', {
  maximumFractionDigits: 2,
})

const number = new Intl.NumberFormat('en-IN')

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [range, setRange] = useState(30)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await API.get('/payment/admin/analytics')
      setAnalytics(response.data)
    } catch (err) {
      console.error('Admin analytics error:', err)
      setError(
        err?.response?.data?.detail ||
          'Unable to load admin analytics.'
      )
    } finally {
      setLoading(false)
    }
  }

  const planData = useMemo(() => {
    const distribution = analytics?.planDistribution || {}

    return Object.entries(distribution).map(([name, value]) => ({
      name,
      value: Number(value || 0),
    }))
  }, [analytics])

  const statusData = useMemo(() => {
    const distribution = analytics?.paymentStatusDistribution || {}

    return Object.entries(distribution).map(([name, value]) => ({
      name,
      value: Number(value || 0),
    }))
  }, [analytics])

  const revenueByPlanData = useMemo(() => {
    const revenue = analytics?.revenueByPlan || {}

    return Object.entries(revenue).map(([name, value]) => ({
      name,
      revenue: Number(value || 0),
    }))
  }, [analytics])

  const revenueTrend = useMemo(() => {
    const trend = analytics?.revenueTrend || []

    return trend.slice(-range)
  }, [analytics, range])

  const activeRate = useMemo(() => {
    const users = Number(analytics?.totalUsers || 0)
    const active = Number(analytics?.activeSubscriptions || 0)

    return users > 0 ? ((active / users) * 100).toFixed(1) : '0.0'
  }, [analytics])

  const formatPaymentDate = (value) => {
    if (!value) return '—'

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) return String(value)

    return date.toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  }

  const getStatusClass = (status) => {
    if (status === 'Success') {
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
    }

    if (status === 'Failed') {
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
    }

    return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-300">
            Loading admin analytics...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-950 p-6 md:p-10">
        <div className="max-w-3xl mx-auto mt-16 rounded-3xl bg-white dark:bg-gray-900 border border-red-200 dark:border-red-900/50 p-8 shadow-xl">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin Analytics
          </h1>
          <p className="mt-3 text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="mt-6 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 transition-colors">
      <div className="max-w-7xl mx-auto p-6 md:p-10">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
              BillFlow Admin
            </p>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mt-2">
              Analytics Overview
            </h1>

            <p className="text-gray-500 dark:text-gray-400 mt-3 max-w-2xl">
              Monitor users, subscriptions, payments, revenue, and recent billing activity from one dashboard.
            </p>
          </div>

          <button
            onClick={fetchAnalytics}
            className="self-start lg:self-auto rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-5 py-3 font-semibold text-gray-700 dark:text-gray-200 shadow-sm hover:shadow-md transition"
          >
            Refresh Data
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5 mt-8">
          <div className="rounded-3xl bg-gradient-to-br from-blue-600 to-blue-800 p-6 text-white shadow-xl">
            <p className="text-sm font-medium text-blue-100">Total Revenue</p>
            <h2 className="text-3xl md:text-4xl font-bold mt-3">
              ₹{currency.format(Number(analytics?.totalRevenue || 0))}
            </h2>
            <p className="text-sm text-blue-100 mt-2">
              Avg. payment ₹{currency.format(Number(analytics?.averagePayment || 0))}
            </p>
          </div>

          <div className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 shadow-lg">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Users</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mt-3">
              {number.format(Number(analytics?.totalUsers || 0))}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {activeRate}% currently active
            </p>
          </div>

          <div className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 shadow-lg">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Subscriptions</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mt-3">
              {number.format(Number(analytics?.activeSubscriptions || 0))}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {number.format(Number(analytics?.cancelledSubscriptions || 0))} scheduled to end
            </p>
          </div>

          <div className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 shadow-lg">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Payments</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mt-3">
              {number.format(Number(analytics?.totalPayments || 0))}
            </h2>
            <div className="flex gap-3 mt-2 text-sm">
              <span className="text-green-600 dark:text-green-400">
                {number.format(Number(analytics?.successfulPayments || 0))} success
              </span>
              <span className="text-red-600 dark:text-red-400">
                {number.format(Number(analytics?.failedPayments || 0))} failed
              </span>
            </div>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-5">
          <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-5 py-4">
            <p className="text-xs uppercase tracking-wide text-gray-400">Expired</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {number.format(Number(analytics?.expiredSubscriptions || 0))}
            </p>
          </div>

          <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-5 py-4">
            <p className="text-xs uppercase tracking-wide text-gray-400">Paused</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {number.format(Number(analytics?.pausedSubscriptions || 0))}
            </p>
          </div>

          <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-5 py-4">
            <p className="text-xs uppercase tracking-wide text-gray-400">Pro Revenue</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              ₹{currency.format(Number(analytics?.revenueByPlan?.Pro || 0))}
            </p>
          </div>

          <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-5 py-4">
            <p className="text-xs uppercase tracking-wide text-gray-400">Enterprise Revenue</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              ₹{currency.format(Number(analytics?.revenueByPlan?.Enterprise || 0))}
            </p>
          </div>
        </div>

        {/* Revenue Trend */}
        <div className="mt-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 md:p-7 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                Revenue Overview
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Successful payments over the last {range} days
              </p>
            </div>

            <div className="flex gap-2">
              {[7, 30].map((days) => (
                <button
                  key={days}
                  onClick={() => setRange(days)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                    range === days
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  {days}D
                </button>
              ))}
            </div>
          </div>

          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrend}>
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                <Tooltip
                  formatter={(value, name) => [
                    name === 'revenue'
                      ? `₹${currency.format(Number(value || 0))}`
                      : value,
                    name === 'revenue' ? 'Revenue' : 'Payments',
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#2563eb"
                  strokeWidth={3}
                  fill="url(#revenueFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribution Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mt-6">
          <div className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 md:p-7 shadow-lg">
            <div className="mb-4">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                Subscription Distribution
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Current users by plan
              </p>
            </div>

            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={planData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={75}
                    outerRadius={115}
                    paddingAngle={4}
                  >
                    {planData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={PLAN_COLORS[entry.name] || '#94a3b8'}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => number.format(Number(value || 0))} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {planData.map((item) => (
                <div key={item.name} className="rounded-2xl bg-gray-50 dark:bg-gray-800 p-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: PLAN_COLORS[item.name] || '#94a3b8' }}
                    />
                    <span className="text-xs text-gray-500 dark:text-gray-400">{item.name}</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                    {number.format(item.value)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 md:p-7 shadow-lg">
            <div className="mb-4">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                Payment Status
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Successful and failed payment activity
              </p>
            </div>

            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={75}
                    outerRadius={115}
                    paddingAngle={4}
                  >
                    {statusData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={STATUS_COLORS[entry.name] || '#94a3b8'}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => number.format(Number(value || 0))} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {statusData.map((item) => (
                <div key={item.name} className="rounded-2xl bg-gray-50 dark:bg-gray-800 p-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: STATUS_COLORS[item.name] || '#94a3b8' }}
                    />
                    <span className="text-xs text-gray-500 dark:text-gray-400">{item.name}</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                    {number.format(item.value)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Revenue by Plan */}
        <div className="mt-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 md:p-7 shadow-lg">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
            Revenue by Plan
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-6">
            Total successful-payment revenue attributed to each plan
          </p>

          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueByPlanData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                <Tooltip
                  formatter={(value) => [
                    `₹${currency.format(Number(value || 0))}`,
                    'Revenue',
                  ]}
                />
                <Bar dataKey="revenue" radius={[10, 10, 0, 0]}>
                  {revenueByPlanData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={PLAN_COLORS[entry.name] || '#64748b'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Payments */}
        <div className="mt-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-lg overflow-hidden">
          <div className="p-5 md:p-7 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
              Recent Payments
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Latest payment activity recorded by BillFlow
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800/70">
                <tr>
                  <th className="px-5 py-4 text-left font-semibold text-gray-600 dark:text-gray-300">Customer</th>
                  <th className="px-5 py-4 text-left font-semibold text-gray-600 dark:text-gray-300">Plan</th>
                  <th className="px-5 py-4 text-left font-semibold text-gray-600 dark:text-gray-300">Amount</th>
                  <th className="px-5 py-4 text-left font-semibold text-gray-600 dark:text-gray-300">Status</th>
                  <th className="px-5 py-4 text-left font-semibold text-gray-600 dark:text-gray-300">Date</th>
                  <th className="px-5 py-4 text-left font-semibold text-gray-600 dark:text-gray-300">Payment ID</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {(analytics?.recentPayments || []).length > 0 ? (
                  analytics.recentPayments.map((payment, index) => (
                    <tr key={`${payment.payment_id || 'payment'}-${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                      <td className="px-5 py-4 text-gray-800 dark:text-gray-200 whitespace-nowrap">
                        {payment.email || '—'}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="font-semibold text-gray-800 dark:text-gray-200">
                          {payment.plan || '—'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-800 dark:text-gray-200 whitespace-nowrap font-medium">
                        {payment.currency || 'INR'} {currency.format(Number(payment.amount || 0))}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusClass(payment.status)}`}>
                          {payment.status || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {formatPaymentDate(payment.payment_date)}
                      </td>
                      <td className="px-5 py-4 text-gray-500 dark:text-gray-400 whitespace-nowrap max-w-[220px] truncate">
                        {payment.payment_id || '—'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-5 py-12 text-center text-gray-500 dark:text-gray-400">
                      No payment activity available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
