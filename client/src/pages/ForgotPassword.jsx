import { useState } from 'react'
import { Link } from 'react-router-dom'
import API from '../services/api'

const ForgotPassword = () => {

  

  const [email, setEmail] = useState('')

  const [loading, setLoading] =
    useState(false)

  const [message, setMessage] =
    useState('')

  const [error, setError] =
    useState('')

 const handleSubmit = async (e) => {

  e.preventDefault()

  setLoading(true)

  setMessage('')
  setError('')

  try {

    const response = await API.post(
      '/auth/forgot-password',
      {
        email
      }
    )

    setMessage(
      response.data.message ||
      'If an account exists with this email, a password reset link has been sent.'
    )

    setEmail('')

  } catch (error) {

    console.error(
      'Forgot password error:',
      error
    )

    setError(
      error.response?.data?.detail ||
      'Unable to process password reset request.'
    )

  } finally {

    setLoading(false)

  }
}

  return (

    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-purple-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 flex items-center justify-center px-6">

      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-10 w-full max-w-md">

        <div className="text-center">

          <div className="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-3xl">
            🔐
          </div>

          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mt-6">
            Forgot Password?
          </h1>

          <p className="text-gray-500 dark:text-gray-300 mt-3">
            Enter your email address and we'll help you reset your password.
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

          <label className="block text-gray-700 dark:text-gray-200 font-medium mb-2">
            Email Address
          </label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-blue-500 text-black dark:text-white"
            required
          />

          <button
  type="submit"
  disabled={loading}
  className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-700 text-white py-4 rounded-2xl font-semibold hover:opacity-90 transition disabled:opacity-50"
>
  {loading
    ? 'Sending Reset Link...'
    : 'Continue'}
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

export default ForgotPassword