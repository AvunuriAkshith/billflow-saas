import API from '../services/api'

const plans = [
  {
    name: 'Free',
    price: '₹0',
    color:
      'from-gray-500 to-gray-700',
    features: [
      'Basic Dashboard',
      'Limited Access',
      'Community Support',
    ],
  },

  {
    name: 'Pro',
    price: '₹499/month',
    color:
      'from-blue-500 to-blue-700',
    features: [
      'Premium Dashboard',
      'Invoice Generation',
      'Priority Support',
    ],
  },

  {
    name: 'Enterprise',
    price: '₹1999/month',
    color:
      'from-purple-500 to-purple-700',
    features: [
      'Unlimited Access',
      'Advanced Analytics',
      'Dedicated Support',
    ],
  },
]

const Plans = () => {

  const handlePayment = async (
    amount,
    planName
  ) => {
        if (amount === 0) {

  const user = JSON.parse(
  localStorage.getItem('user')
)

await API.post(
  '/payment/verify-payment',
  {
    razorpay_order_id: 'FREE_PLAN',
    razorpay_payment_id: 'FREE_PLAN',
    razorpay_signature: 'FREE_PLAN',
    email: user.email,
    plan: planName,
  }
)

alert('Free Plan Activated')

  return
}
    try {

      const response = await API.post(
        '/payment/create-order',
        { amount }
      )

      const order = response.data.order

      const options = {

        key: 'YOUR_RAZORPAY_KEY_ID',

        amount: order.amount,

        currency: order.currency,

        name: 'BillFlow',

        description:
          `${planName} Subscription`,

        order_id: order.id,

        handler: async function (
          response
        ) {

          try {

            const user = JSON.parse(
              localStorage.getItem('user')
            )

            await API.post(
              '/payment/verify-payment',
              {
                razorpay_order_id:
                  response.razorpay_order_id,

                razorpay_payment_id:
                  response.razorpay_payment_id,

                razorpay_signature:
                  response.razorpay_signature,

                email: user.email,

                plan: planName,
              }
            )

            alert(
              'Payment Successful & Verified'
            )

          } catch (error) {

            console.log(error)

            alert(
              'Verification Failed'
            )
          }
        },

        theme: {
          color: '#2563eb',
        },
      }

      const razorpay =
        new window.Razorpay(options)

      razorpay.open()

    } catch (error) {

      console.log(error)

      alert('Payment Failed')
    }
  }

  return (

    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-16 px-6 transition">

      {/* Header */}

      <div className="text-center">

        <h1 className="text-6xl font-bold text-blue-600">
          Subscription Plans
        </h1>

        <p className="text-gray-500 dark:text-gray-300 mt-4 text-lg">
          Flexible pricing built for
          startups and businesses
        </p>

      </div>

      {/* Pricing Cards */}

      <div className="grid md:grid-cols-3 gap-10 mt-20 max-w-7xl mx-auto">

        {plans.map((plan, index) => (

          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden hover:scale-105 transition duration-300"
          >

            {/* Top Gradient */}

            <div
              className={`bg-gradient-to-r ${plan.color} p-8 text-white`}
            >

              <h2 className="text-4xl font-bold">
                {plan.name}
              </h2>

              <p className="text-5xl font-bold mt-6">
                {plan.price}
              </p>

            </div>

            {/* Features */}

            <div className="p-8">

              <ul className="space-y-5">

                {plan.features.map(
                  (feature, idx) => (

                    <li
                      key={idx}
                      className="flex items-center gap-3 text-gray-700 dark:text-gray-200 text-lg"
                    >

                      <span className="text-green-500 text-xl">
                        ✓
                      </span>

                      {feature}

                    </li>

                  )
                )}

              </ul>

              {/* Button */}

              <button
                onClick={() =>
                  handlePayment(
                    plan.name === 'Pro'
                      ? 499
                      : plan.name ===
                        'Enterprise'
                      ? 1999
                      : 0,
                    plan.name
                  )
                }
                className={`w-full mt-10 bg-gradient-to-r ${plan.color} text-white py-4 rounded-2xl text-lg font-semibold hover:opacity-90 transition`}
              >
                Choose Plan
              </button>

            </div>

          </div>

        ))}

      </div>

      {/* Bottom Section */}

      <div className="mt-24 text-center">

        <h2 className="text-4xl font-bold text-gray-800 dark:text-white">
          Why Choose BillFlow?
        </h2>

        <p className="text-gray-500 dark:text-gray-300 mt-6 max-w-3xl mx-auto text-lg">
          BillFlow helps businesses manage
          subscriptions, invoices, analytics,
          and payments with a modern SaaS
          experience powered by Razorpay.
        </p>

      </div>

    </div>
  )
}

export default Plans