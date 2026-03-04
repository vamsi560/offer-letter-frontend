import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'
import { FiUser, FiLock } from 'react-icons/fi'
import { authAPI } from '../services/api'

const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await authAPI.login(username, password)
      localStorage.setItem('token', response.access_token)
      localStorage.setItem('user', JSON.stringify(response.user))
      toast.success('Login successful!')
      navigate('/dashboard')
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const testUsers = [
    { user: 'tag_user1', pass: 'password123' },
    { user: 'tag_user2', pass: 'password123' },
    { user: 'tag_user3', pass: 'password123' },
  ]

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        <div className="hidden lg:flex flex-col justify-between p-10 bg-slate-900 text-slate-100">
          <div>
            <img
              src="/images/ValueMomentum_logo.png"
              alt="ValueMomentum Logo"
              className="h-16 w-auto object-contain mb-10"
            />
            <h1 className="text-3xl font-bold leading-tight mb-3">Offer Letter Portal</h1>
            <p className="text-slate-300 text-base">Secure access for Talent Acquisition workflows.</p>
          </div>
          <div className="text-sm text-slate-400">
            ValueMomentum Software Services Private Limited
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="p-6 sm:p-8"
        >
          <div className="lg:hidden mb-8 text-center">
            <img
              src="/images/ValueMomentum_logo.png"
              alt="ValueMomentum Logo"
              className="h-12 w-auto object-contain mx-auto mb-3"
            />
            <h1 className="text-xl font-semibold text-slate-900">Offer Letter Portal</h1>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">Sign in</h2>
          <p className="text-slate-500 mb-8">Use your portal credentials to continue.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Username</label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="Enter username"
                  className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter password"
                  className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-700 text-white py-2.5 rounded-lg font-semibold hover:bg-teal-800 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-xs text-slate-600 font-semibold mb-3">Test Credentials</p>
            <div className="space-y-2">
              {testUsers.map((cred, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setUsername(cred.user)
                    setPassword(cred.pass)
                  }}
                  className="w-full text-left text-xs px-3 py-2 rounded border border-slate-200 hover:bg-slate-50 text-slate-700"
                >
                  {cred.user} / {cred.pass}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Login
