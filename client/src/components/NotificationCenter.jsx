import { useEffect, useRef, useState } from 'react'

import API from '../services/api'


const notificationIcon = (type) => {
  switch (type) {
    case 'payment_success':
    case 'invoice_generated':
    case 'subscription_activated':
      return '✓'
    case 'payment_failed':
    case 'subscription_expiring':
      return '!'
    case 'subscription_cancelled':
    case 'subscription_expired':
      return '×'
    case 'password_reset':
      return '🔐'
    default:
      return '•'
  }
}


const iconClasses = (type) => {
  switch (type) {
    case 'payment_success':
    case 'invoice_generated':
    case 'subscription_activated':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    case 'payment_failed':
    case 'subscription_expiring':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'subscription_cancelled':
    case 'subscription_expired':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    default:
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
  }
}


const formatRelativeTime = (date) => {
  if (!date) {
    return ''
  }

  const created = new Date(date).getTime()
  const now = Date.now()
  const seconds = Math.max(0, Math.floor((now - created) / 1000))

  if (seconds < 60) {
    return `${seconds}s ago`
  }

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) {
    return `${minutes}m ago`
  }

  const hours = Math.floor(minutes / 60)
  if (hours < 24) {
    return `${hours}h ago`
  }

  const days = Math.floor(hours / 24)
  if (days < 30) {
    return `${days}d ago`
  }

  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short'
  })
}


const NotificationCenter = () => {
  const user = JSON.parse(localStorage.getItem('user') || 'null')

  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const containerRef = useRef(null)


  const fetchNotifications = async () => {
    if (!user?.email) {
      return
    }

    try {
      setLoading(true)

      const response = await API.get(
        `/notifications/${encodeURIComponent(user.email)}`
      )

      setNotifications(response.data.notifications || [])
      setUnreadCount(response.data.unreadCount || 0)
    } catch (error) {
      console.error('Notification fetch error:', error)
    } finally {
      setLoading(false)
    }
  }


  useEffect(() => {
    fetchNotifications()

    const interval = setInterval(
      fetchNotifications,
      30000
    )

    return () => clearInterval(interval)
  }, [user?.email])


  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [])


  const handleOpen = async () => {
    const nextOpen = !open
    setOpen(nextOpen)

    if (nextOpen) {
      await fetchNotifications()
    }
  }


  const markAsRead = async (notificationId) => {
    try {
      await API.post(
        `/notifications/${notificationId}/read`,
        {
          email: user.email
        }
      )

      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      )

      setUnreadCount(prev => Math.max(prev - 1, 0))
    } catch (error) {
      console.error('Mark notification read error:', error)
    }
  }


  const markAllAsRead = async () => {
    try {
      await API.post(
        `/notifications/${encodeURIComponent(user.email)}/read-all`
      )

      setNotifications(prev =>
        prev.map(notification => ({
          ...notification,
          read: true
        }))
      )

      setUnreadCount(0)
    } catch (error) {
      console.error('Mark all notifications read error:', error)
    }
  }


  const deleteNotification = async (notificationId) => {
    try {
      await API.delete(
        `/notifications/${notificationId}`,
        {
          data: {
            email: user.email
          }
        }
      )

      setNotifications(prev =>
        prev.filter(notification => notification.id !== notificationId)
      )
    } catch (error) {
      console.error('Delete notification error:', error)
    }
  }


  return (
    <div
      className="relative"
      ref={containerRef}
    >
      <button
        type="button"
        onClick={handleOpen}
        aria-label="Notifications"
        className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-100 shadow-lg hover:scale-105 transition"
      >
        <span className="text-xl">🔔</span>

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[22px] h-[22px] px-1 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center border-2 border-white dark:border-gray-900">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>


      {open && (
        <div className="absolute right-0 top-14 z-50 w-[360px] max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">

          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h3 className="font-bold text-gray-800 dark:text-white">
                Notifications
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {unreadCount} unread
              </p>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-sm text-blue-600 dark:text-blue-400 font-semibold hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>


          <div className="max-h-[420px] overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-10 text-center">
                <div className="text-4xl mb-3">🔔</div>
                <p className="font-semibold text-gray-700 dark:text-gray-200">
                  No notifications
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  You're all caught up.
                </p>
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`px-4 py-4 border-b border-gray-100 dark:border-gray-700/70 ${
                    notification.read
                      ? 'bg-white dark:bg-gray-800'
                      : 'bg-blue-50/70 dark:bg-blue-900/10'
                  }`}
                >
                  <div className="flex gap-3">
                    <div className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center font-bold ${iconClasses(notification.type)}`}>
                      {notificationIcon(notification.type)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-gray-800 dark:text-white text-sm">
                          {notification.title}
                        </h4>

                        {!notification.read && (
                          <span className="w-2 h-2 mt-1.5 rounded-full bg-blue-600 flex-shrink-0" />
                        )}
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 leading-5">
                        {notification.message}
                      </p>

                      <div className="flex items-center justify-between gap-3 mt-2">
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {formatRelativeTime(notification.createdAt)}
                        </span>

                        <div className="flex items-center gap-3">
                          {!notification.read && (
                            <button
                              type="button"
                              onClick={() => markAsRead(notification.id)}
                              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                            >
                              Mark read
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => deleteNotification(notification.id)}
                            className="text-xs text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      )}
    </div>
  )
}


export default NotificationCenter
