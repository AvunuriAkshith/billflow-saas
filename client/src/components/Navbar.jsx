import { Link } from 'react-router-dom'

const Navbar = () => {
  return (
    <nav className="bg-white shadow-md px-8 py-4 flex items-center justify-between">
      <Link
        to="/"
        className="text-2xl font-bold text-blue-600"
      >
        BillFlow
      </Link>

      <div className="flex items-center gap-6">
        <Link
          to="/login"
          className="text-gray-700 hover:text-blue-600"
        >
          Login
        </Link>

        <Link
          to="/register"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Get Started
        </Link>
      </div>
    </nav>
  )
}

export default Navbar