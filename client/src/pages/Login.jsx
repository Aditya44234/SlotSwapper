import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const Login = () => {
  const { login, loading, error, isAuthenticated } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  // If already logged in, redirect to dashboard
  if (isAuthenticated) {
    navigate('/dashboard')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    await login(email, password)
    if (!error) navigate('/dashboard')
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white rounded-lg shadow-lg p-8 w-[350px]">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            className="border px-3 py-2 rounded focus:outline-none focus:ring focus:ring-blue-400"
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            className="border px-3 py-2 rounded focus:outline-none focus:ring focus:ring-blue-400"
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-semibold transition"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
          {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
        </form>
        <div className="mt-4 text-center">
          <span className="text-gray-600">Don't have an account?</span>{' '}
          <a href="/register" className="text-blue-600 underline hover:text-blue-800">
            Register
          </a>
        </div>
      </div>
    </div>
  )
}

export default Login
