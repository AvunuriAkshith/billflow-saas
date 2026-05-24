import { useState } from 'react'

import {
  Link,
  useNavigate
} from 'react-router-dom'

import API from '../services/api'

const Login = () => {

  const navigate = useNavigate()

  const [formData, setFormData] =
    useState({
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
        '/auth/login',
        formData
      )

      localStorage.setItem(
        'token',
        response.data.access_token
      )

      localStorage.setItem(
        'user',
        JSON.stringify(
          response.data.user
        )
      )

      alert('Login Successful')

      navigate('/dashboard')

    } catch (error) {

      console.log(error)

      alert(
        error.response?.data?.detail ||
        'Login failed'
      )

    } finally {

      setLoading(false)
    }
  }
const handleForgotPassword = async () => {

  const email = prompt(
    'Enter your email'
  )

  const newPassword = prompt(
    'Enter new password'
  )

  if (!email || !newPassword) {
    return
  }

  try {

    const response = await API.post(
      '/auth/forgot-password',
      {
        email,
        new_password: newPassword,
      }
    )

    alert(response.data.message)

  } catch (error) {

    console.log(error)

    alert(
      error.response?.data?.detail ||
      'Password reset failed'
    )
  }
}
  return (

    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-purple-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 flex items-center justify-center px-6 transition">

      <div className="grid md:grid-cols-2 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden max-w-6xl w-full">

        {/* Left Side */}

        <div className="bg-gradient-to-br from-blue-600 to-purple-700 text-white p-12 flex flex-col justify-center">

          <h1 className="text-6xl font-bold leading-tight">
            Welcome Back
          </h1>

          <p className="mt-6 text-xl opacity-90 leading-relaxed">
            Login to manage your subscriptions,
            payments, invoices, and analytics
            with BillFlow.
          </p>

          <div className="mt-10 space-y-4">

            <div className="flex items-center gap-4">

              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">
                💳
              </div>

              <p className="text-lg">
                Secure Razorpay Payments
              </p>

            </div>

            <div className="flex items-center gap-4">

              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">
                📈
              </div>

              <p className="text-lg">
                SaaS Analytics Dashboard
              </p>

            </div>

            <div className="flex items-center gap-4">

              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">
                🧾
              </div>

              <p className="text-lg">
                Invoice & Billing Management
              </p>

            </div>

          </div>

        </div>

        {/* Right Side */}

        <div className="p-12">

          <div className="max-w-md mx-auto">

            <h2 className="text-4xl font-bold text-gray-800 dark:text-white">
              Login
            </h2>

            <p className="text-gray-500 dark:text-gray-300 mt-3">
              Enter your credentials to continue
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-10"
            >

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
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-purple-500 text-black dark:text-white transition"
                  required
                />

              </div>

              {/* Forgot Password */}

              <div className="flex justify-end mb-8">

                <button
  type="button"
  onClick={handleForgotPassword}
  className="text-blue-600 hover:underline"
>
  Forgot Password?
</button>

              </div>

              {/* Submit Button */}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-700 text-white py-4 rounded-2xl text-lg font-semibold hover:opacity-90 transition shadow-lg"
              >

                {loading
                  ? 'Logging in...'
                  : 'Login'}

              </button>

            </form>

            {/* Footer */}

            <p className="text-center text-gray-500 dark:text-gray-300 mt-10">

              Don’t have an account?{' '}

              <Link
                to="/register"
                className="text-blue-600 font-semibold hover:underline"
              >
                Create Account
              </Link>

            </p>

          </div>

        </div>

      </div>

    </div>
  )
}

export default Login
