import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import API from '../services/api'

const ResetPassword = () => {

  const navigate = useNavigate()

  const [searchParams] =
    useSearchParams()

  const token =
    searchParams.get('token')

  const [password, setPassword] =
    useState('')

  const [confirmPassword, setConfirmPassword] =
    useState('')

  const [loading, setLoading] =
    useState(false)

  const [message, setMessage] =
    useState('')

  const [error, setError] =
    useState('')

  const handleSubmit = async (e) => {

    e.preventDefault()

    setMessage('')
    setError('')

    if (!token) {

      setError(
        'Invalid or missing reset token.'
      )

      return
    }

    if (password.length < 6) {

      setError(
        'Password must be at least 6 characters.'
      )

      return
    }

    if (password !== confirmPassword) {

      setError(
        'Passwords do not match.'
      )

      return
    }

    setLoading(true)

    try {

      const response = await API.post(
        '/auth/reset-password',
        {
          token,
          new_password: password
        }
      )

      setMessage(
        response.data.message ||
        'Password reset successfully.'
      )

      setPassword('')
      setConfirmPassword('')

      setTimeout(() => {

        navigate('/login')

      }, 2000)

    } catch (error) {

      console.error(
        'Reset password error:',
        error
      )

      setError(
        error.response?.data?.detail ||
        'Unable to reset password.'
      )

    } finally {

      setLoading(false)

    }
  }

  return (

    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-purple-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 flex items-center justify-center px-6">

      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-10 w-full max-w-md">

        <div className="text-center">

          <div className="w-16 h-16 mx-auto bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center text-3xl">
            🔑
          </div>

          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mt-6">
            Reset Password
          </h1>

          <p className="text-gray-500 dark:text-gray-300 mt-3">
            Create a new password for your account.
          </p>

        </div>

        {error && (

          <div className="mt-6 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl">
            {error}
          </div>

        )}

        {message && (

          <div className="mt-6 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 px-4 py-3 rounded-xl">
            {message}
          </div>

        )}

        <form
          onSubmit={handleSubmit}
          className="mt-8"
        >

          <div className="mb-6">

            <label className="block text-gray-700 dark:text-gray-200 font-medium mb-2">
              New Password
            </label>

            <input
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-purple-500 text-black dark:text-white"
              required
            />

          </div>

          <div className="mb-6">

            <label className="block text-gray-700 dark:text-gray-200 font-medium mb-2">
              Confirm Password
            </label>

            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-purple-500 text-black dark:text-white"
              required
            />

          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-700 text-white py-4 rounded-2xl font-semibold hover:opacity-90 transition disabled:opacity-50"
          >

            {loading
              ? 'Resetting Password...'
              : 'Reset Password'}

          </button>

        </form>

        <div className="text-center mt-8">

          <Link
            to="/login"
            className="text-blue-600 hover:underline font-medium"
          >
            ← Back to Login
          </Link>

        </div>

      </div>

    </div>
  )
}

export default ResetPassword