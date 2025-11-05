import React from 'react'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

const Dashboard = () => {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center pt-12">
      <div className="w-full max-w-[500px] bg-white rounded-lg shadow-md p-8">
        <h2 className="text-3xl font-bold mb-4 text-center">Welcome, {user?.name || 'User'}!</h2>
        <div className="mb-8 text-center text-gray-600">Your email: <span className="font-semibold">{user?.email}</span></div>
        <div className="flex flex-col gap-4 mb-6">
          <Link
            to="/events"
            className="bg-blue-500 text-white py-2 px-4 rounded font-semibold text-center hover:bg-blue-700 transition"
          >
            Go to My Events
          </Link>
          <Link
            to="/swap"
            className="bg-green-500 text-white py-2 px-4 rounded font-semibold text-center hover:bg-green-600 transition"
          >
            Swap Slots
          </Link>
          <Link
            to="/profile"
            className="bg-gray-400 text-white py-2 px-4 rounded font-semibold text-center hover:bg-gray-500 transition"
          >
            Profile Settings
          </Link>
        </div>
        <button
          onClick={logout}
          className="w-full bg-red-500 text-white py-2 rounded font-semibold hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>
    </div>
  )
}

export default Dashboard
