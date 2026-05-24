import { useState } from 'react'

import {
  Link,
  useNavigate
} from 'react-router-dom'

import API from '../services/api'

const Register = () => {

  const navigate = useNavigate()

  const [formData, setFormData] =
    useState({
      name: '',
      email: '',
      password: '',
    })

  const [loading, setLoading] =
    useState(false)

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]:
        e.target.value,
    })
  }

  const handleSubmit = async (e) => {

    e.preventDefault()

    setLoading(true)

    try {

      const response = await API.post(
        '/auth/register',
        formData
      )

      alert(response.data.message)

      navigate('/login')

    } catch (error) {

      console.log(error)

      alert(
        error.response?.data?.detail ||
        'Registration failed'
      )

    } finally {

      setLoading(false)
    }
  }

  return (

    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-white to-blue-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 flex items-center justify-center px-6 transition">

      <div className="grid md:grid-cols-2 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden max-w-6xl w-full">

        {/* Left Side */}

        <div className="bg-gradient-to-br from-purple-600 to-blue-700 text-white p-12 flex flex-col justify-center">

          <h1 className="text-6xl font-bold leading-tight">
            Join BillFlow
          </h1>

          <p className="mt-6 text-xl opacity-90 leading-relaxed">
            Create your account and start
            managing subscriptions, payments,
            invoices, and analytics effortlessly.
          </p>

          <div className="mt-10 space-y-4">

            <div className="flex items-center gap-4">

              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">
                🚀
              </div>

              <p className="text-lg">
                Fast SaaS Billing Platform
              </p>

            </div>

            <div className="flex items-center gap-4">

              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">
                🔒
              </div>

              <p className="text-lg">
                Secure JWT Authentication
              </p>

            </div>

            <div className="flex items-center gap-4">

              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">
                📊
              </div>

              <p className="text-lg">
                Analytics & Revenue Insights
              </p>

            </div>

          </div>

        </div>

        {/* Right Side */}

        <div className="p-12">

          <div className="max-w-md mx-auto">

            <h2 className="text-4xl font-bold text-gray-800 dark:text-white">
              Create Account
            </h2>

            <p className="text-gray-500 dark:text-gray-300 mt-3">
              Start your SaaS journey with BillFlow
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-10"
            >

              {/* Name */}

              <div className="mb-6">

                <label className="block text-gray-700 dark:text-gray-200 font-medium mb-2">
                  Full Name
                </label>

                <input
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-purple-500 text-black dark:text-white transition"
                  required
                />

              </div>

              {/* Email */}

              <div className="mb-6">

                <label className="block text-gray-700 dark:text-gray-200 font-medium mb-2">
                  Email Address
                </label>

                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-blue-500 text-black dark:text-white transition"
                  required
                />

              </div>

              {/* Password */}

              <div className="mb-6">

                <label className="block text-gray-700 dark:text-gray-200 font-medium mb-2">
                  Password
                </label>

                <input
                  type="password"
                  name="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-purple-500 text-black dark:text-white transition"
                  required
                />

              </div>

              {/* Terms */}

              <div className="flex items-center gap-3 mb-8">

                <input
                  type="checkbox"
                  required
                  className="w-5 h-5"
                />

                <p className="text-gray-500 dark:text-gray-300 text-sm">
                  I agree to the Terms &
                  Conditions
                </p>

              </div>

              {/* Submit Button */}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-700 text-white py-4 rounded-2xl text-lg font-semibold hover:opacity-90 transition shadow-lg"
              >

                {loading
                  ? 'Creating Account...'
                  : 'Create Account'}

              </button>

            </form>

            {/* Footer */}

            <p className="text-center text-gray-500 dark:text-gray-300 mt-10">

              Already have an account?{' '}

              <Link
                to="/login"
                className="text-blue-600 font-semibold hover:underline"
              >
                Login
              </Link>

            </p>

          </div>

        </div>

      </div>

    </div>
  )
}

export default Register