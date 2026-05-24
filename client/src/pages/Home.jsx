import Navbar from '../components/Navbar'

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <section className="flex flex-col items-center justify-center text-center px-6 py-24">
        <h1 className="text-6xl font-bold text-gray-800 max-w-4xl leading-tight">
          Manage Your SaaS Billing With Ease
        </h1>

        <p className="mt-6 text-lg text-gray-600 max-w-2xl">
          BillFlow helps businesses manage subscriptions,
          payments, invoices, and analytics with secure
          Razorpay integration.
        </p>

        <div className="mt-8 flex gap-4">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700">
            Start Free
          </button>

          <button className="border border-gray-400 px-6 py-3 rounded-xl hover:bg-gray-200">
            Learn More
          </button>
        </div>
      </section>
    </div>
  )
}

export default Home