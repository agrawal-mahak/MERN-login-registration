import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate()

  const handleLogout = () => {
    onLogout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">
          Logo
        </Link>
        <div className="space-x-4 flex items-center">
          {user ? (
            <>
              <Link to="/" className="hover:text-gray-300">Home</Link>
              <span className="text-gray-400">|</span>
              <span className="text-gray-300">Welcome, {user.username}</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/" className="hover:text-gray-300">Home</Link>
              <Link to="/login" className="hover:text-gray-300">Login</Link>
              <Link to="/register" className="hover:text-gray-300">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar