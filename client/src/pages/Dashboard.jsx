  import { useNavigate } from 'react-router-dom'
  import { useContext, useEffect, useState } from 'react'

  import {
    ThemeContext
  } from '../context/ThemeContext'

  import API from '../services/api'
import NotificationCenter from '../components/NotificationCenter'


  const Dashboard = () => {

    const navigate = useNavigate()

    const {
      darkMode,
      toggleTheme
    } = useContext(ThemeContext)


    // ============================================================
    // USER
    // ============================================================

    const user = JSON.parse(
      localStorage.getItem('user')
    )


    // ============================================================
    // SUBSCRIPTION STATE
    // ============================================================

    const [subscription, setSubscription] = useState(null)

    const [loadingSubscription, setLoadingSubscription] =
      useState(true)

    const [cancelling, setCancelling] =
      useState(false)

    const [error, setError] =
      useState('')


    // ============================================================
    // FETCH SUBSCRIPTION
    // ============================================================

    const fetchSubscription = async () => {

      if (!user?.email) {
        setLoadingSubscription(false)
        return
      }

      try {

        setLoadingSubscription(true)

        setError('')

        const response = await API.get(
  `/payment/subscription/${encodeURIComponent(user.email)}`
)

console.log('Subscription API response:', response.data)

setSubscription(response.data)

      } catch (err) {

        console.error(
          'Subscription fetch error:',
          err
        )

        setError(
          'Unable to load subscription information.'
        )

      } finally {

        setLoadingSubscription(false)

      }
    }


    // ============================================================
    // LOAD SUBSCRIPTION
    // ============================================================

    useEffect(() => {
  if (user?.email) {
    fetchSubscription()
  }
}, [user?.email])


    // ============================================================
    // LOGOUT
    // ============================================================

    const handleLogout = () => {

      localStorage.removeItem('token')

      localStorage.removeItem('user')

      navigate('/login')
    }


    // ============================================================
    // CANCEL SUBSCRIPTION
    // ============================================================

    const handleCancelSubscription = async () => {

      if (!user?.email) {
        return
      }


      const confirmed = window.confirm(
        'Are you sure you want to cancel auto-renewal? Your subscription will remain active until the current billing period ends.'
      )


      if (!confirmed) {
        return
      }


      try {

        setCancelling(true)

        setError('')


        const response = await API.post(
          '/payment/subscription/cancel',
          {
            email: user.email
          }
        )


        // --------------------------------------------------------
        // Update subscription UI
        // --------------------------------------------------------

        setSubscription(prev => ({

          ...prev,

          status:
            response.data.subscriptionStatus,

          autoRenew:
            response.data.autoRenew

        }))


        // --------------------------------------------------------
        // Update localStorage user data
        // --------------------------------------------------------

        const updatedUser = {

          ...user,

          subscriptionStatus:
            response.data.subscriptionStatus

        }


        localStorage.setItem(
          'user',
          JSON.stringify(updatedUser)
        )


        alert(
          'Auto-renewal has been cancelled. Your subscription remains active until the current billing period ends.'
        )


      } catch (err) {

        console.error(
          'Cancel subscription error:',
          err
        )


        setError(
          err?.response?.data?.detail ||
          'Unable to cancel subscription.'
        )

      } finally {

        setCancelling(false)

      }
    }


    // ============================================================
    // DATE FORMATTER
    // ============================================================

    const formatDate = (date) => {

      if (!date) {
        return 'N/A'
      }


      return new Date(date).toLocaleDateString(
        'en-IN',
        {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }
      )
    }


    // ============================================================
    // DAYS REMAINING
    // ============================================================

    const getDaysRemaining = () => {

      if (!subscription?.subscriptionEnd) {
        return null
      }


      const endDate = new Date(
        subscription.subscriptionEnd
      )


      const today = new Date()


      const difference =
        endDate.getTime() -
        today.getTime()


      const days = Math.ceil(
        difference /
        (1000 * 60 * 60 * 24)
      )


      return Math.max(days, 0)
    }


    // ============================================================
    // STATUS
    // ============================================================

    const getStatusColor = () => {

      if (
        subscription?.status === 'Active'
      ) {

        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'

      }


      if (
        subscription?.status === 'Cancelled'
      ) {

        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'

      }


      if (
        subscription?.status === 'Expired'
      ) {

        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'

      }


      return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
    }


    // ============================================================
    // DAYS
    // ============================================================

    const daysRemaining =
      getDaysRemaining()


    // ============================================================
    // RENDER
    // ============================================================

    return (

      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6 md:p-10 transition">


        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">


          <div>

            <h1 className="text-4xl md:text-5xl font-bold text-blue-600">

              Welcome, {user?.name}

            </h1>


            <p className="text-gray-500 dark:text-gray-300 mt-2 text-lg">

              Manage your subscriptions and billing

            </p>

          </div>


          {/* BUTTONS */}

          <div className="flex flex-wrap gap-3 items-center">

            <NotificationCenter />



            {user?.role === 'admin' && (

              <button

                onClick={() =>
                  navigate('/admin')
                }

                className="bg-purple-600 text-white px-5 py-3 rounded-xl hover:bg-purple-700 transition"

              >

                Admin Dashboard

              </button>

            )}


            <button

              onClick={toggleTheme}

              className="bg-black text-white px-5 py-3 rounded-2xl shadow-lg hover:scale-105 transition"

            >

              {darkMode
                ? 'Light Mode'
                : 'Dark Mode'}

            </button>


            <button

              onClick={handleLogout}

              className="bg-gradient-to-r from-red-500 to-red-700 text-white px-5 py-3 rounded-2xl shadow-lg hover:scale-105 transition"

            >

              Logout

            </button>

          </div>

        </div>



        {/* ======================================================
            ERROR
        ====================================================== */}

        {error && (

          <div className="mt-6 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 px-6 py-4 rounded-2xl">

            {error}

          </div>

        )}



        {/* ======================================================
            ANALYTICS CARDS
        ====================================================== */}

        <div className="grid md:grid-cols-3 gap-8 mt-10">


          {/* CURRENT USER */}

          <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white p-8 rounded-3xl shadow-2xl">

            <p className="text-lg opacity-80">

              Current User

            </p>


            <h2 className="text-3xl md:text-4xl font-bold mt-4">

              {user?.name}

            </h2>

          </div>



          {/* CURRENT PLAN */}

          <div className="bg-gradient-to-r from-green-500 to-green-700 text-white p-8 rounded-3xl shadow-2xl">

            <p className="text-lg opacity-80">

              Current Plan

            </p>


            <h2 className="text-3xl md:text-4xl font-bold mt-4">

              {loadingSubscription
                ? 'Loading...'
                : subscription?.plan || 'Free'}

            </h2>

          </div>



          {/* ROLE */}

          <div className="bg-gradient-to-r from-purple-500 to-purple-700 text-white p-8 rounded-3xl shadow-2xl">

            <p className="text-lg opacity-80">

              Role

            </p>


            <h2 className="text-3xl md:text-4xl font-bold mt-4">

              {user?.role}

            </h2>

          </div>

        </div>



        {/* ======================================================
            SUBSCRIPTION CARD
        ====================================================== */}

        <div className="mt-10 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8">


          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">


            <div>

              <p className="text-gray-500 dark:text-gray-400">

                Subscription

              </p>


              <h2 className="text-3xl font-bold text-gray-800 dark:text-white mt-2">

                {loadingSubscription
                  ? 'Loading...'
                  : `${subscription?.plan || 'Free'} Plan`}

              </h2>

            </div>


            {!loadingSubscription && subscription && (

              <span
                className={`inline-flex w-fit px-4 py-2 rounded-full font-semibold ${getStatusColor()}`}
              >

                {subscription.status}

              </span>

            )}

          </div>



          {!loadingSubscription && subscription && (

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">


              {/* START DATE */}

              <div className="bg-gray-50 dark:bg-gray-700/50 p-5 rounded-2xl">

                <p className="text-gray-500 dark:text-gray-400">

                  Started

                </p>


                <p className="text-lg font-bold text-gray-800 dark:text-white mt-2">

                  {formatDate(
                    subscription.subscriptionStart
                  )}

                </p>

              </div>



              {/* END DATE */}

              <div className="bg-gray-50 dark:bg-gray-700/50 p-5 rounded-2xl">

                <p className="text-gray-500 dark:text-gray-400">

                  Expires

                </p>


                <p className="text-lg font-bold text-gray-800 dark:text-white mt-2">

                  {formatDate(
                    subscription.subscriptionEnd
                  )}

                </p>

              </div>



              {/* DAYS */}

              <div className="bg-gray-50 dark:bg-gray-700/50 p-5 rounded-2xl">

                <p className="text-gray-500 dark:text-gray-400">

                  Days Remaining

                </p>


                <p className="text-lg font-bold text-gray-800 dark:text-white mt-2">

                  {daysRemaining !== null
                    ? `${daysRemaining} days`
                    : 'N/A'}

                </p>

              </div>



              {/* AUTO RENEW */}

              <div className="bg-gray-50 dark:bg-gray-700/50 p-5 rounded-2xl">

                <p className="text-gray-500 dark:text-gray-400">

                  Auto Renewal

                </p>


                <p className="text-lg font-bold mt-2">

                  {subscription.autoRenew ? (

                    <span className="text-green-600 dark:text-green-400">

                      ON

                    </span>

                  ) : (

                    <span className="text-red-600 dark:text-red-400">

                      OFF

                    </span>

                  )}

                </p>

              </div>

            </div>

          )}



          {/* CANCEL */}

          {!loadingSubscription &&

            subscription?.status === 'Active' &&

            subscription?.autoRenew === true && (

              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4">


                <div>

                  <h3 className="font-semibold text-gray-800 dark:text-white">

                    Cancel automatic renewal

                  </h3>


                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">

                    Your current subscription will remain active until the expiry date.

                  </p>

                </div>


                <button

                  onClick={handleCancelSubscription}

                  disabled={cancelling}

                  className="bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"

                >

                  {cancelling
                    ? 'Cancelling...'
                    : 'Cancel Subscription'}

                </button>

              </div>

            )}



          {/* CANCELLED MESSAGE */}

          {!loadingSubscription &&

            subscription?.status === 'Cancelled' && (

              <div className="mt-8 p-5 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl">

                <p className="font-semibold text-yellow-800 dark:text-yellow-300">

                  Auto-renewal cancelled

                </p>


                <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">

                  Your subscription remains active until{' '}

                  {formatDate(
                    subscription.subscriptionEnd
                  )}

                  .

                </p>

              </div>

            )}



          {/* EXPIRED MESSAGE */}

          {!loadingSubscription &&

            subscription?.status === 'Expired' && (

              <div className="mt-8 p-5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl">

                <p className="font-semibold text-red-800 dark:text-red-300">

                  Subscription expired

                </p>


                <p className="text-sm text-red-700 dark:text-red-400 mt-1">

                  Your subscription has expired. Choose a plan to continue using premium features.

                </p>


                <button

                  onClick={() =>
                    navigate('/plans')
                  }

                  className="mt-4 bg-blue-600 text-white px-5 py-2 rounded-xl hover:bg-blue-700 transition"

                >

                  Choose a Plan

                </button>

              </div>

            )}

        </div>



        {/* ======================================================
            MAIN SECTION
        ====================================================== */}

        <div className="grid md:grid-cols-3 gap-8 mt-10">


          {/* PROFILE */}

          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8">

            <h2 className="text-2xl font-bold text-gray-700 dark:text-white">

              Account Information

            </h2>


            <div className="mt-6 space-y-5">


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

                  {user?.role === 'admin'
                    ? 'Administrator'
                    : 'Standard User'}

                </h3>

              </div>

            </div>

          </div>



          {/* QUICK ACTIONS */}

          <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8">

            <h2 className="text-2xl font-bold text-gray-700 dark:text-white">

              Quick Actions

            </h2>


            <div className="grid md:grid-cols-2 gap-6 mt-8">


              <button

                onClick={() =>
                  navigate('/plans')
                }

                className="bg-gradient-to-r from-blue-500 to-blue-700 text-white p-8 rounded-3xl text-left shadow-lg hover:scale-105 transition"

              >

                <h3 className="text-2xl font-bold">

                  Manage Plans

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



            {/* BANNER */}

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