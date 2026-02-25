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

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-gradient-to-br from-slate-800 via-teal-900 to-slate-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large Animated Circles */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-0 left-0 w-96 h-96 bg-teal-400 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.15, 0.1],
            x: [0, -80, 0],
            y: [0, -60, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-400 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.08, 0.12, 0.08],
            x: [0, 60, 0],
            y: [0, -40, 0],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute top-1/2 left-1/2 w-80 h-80 bg-emerald-400 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"
        />

        {/* Geometric Grid Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        {/* Diagonal Lines Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 10px,
              rgba(255, 255, 255, 0.1) 10px,
              rgba(255, 255, 255, 0.1) 20px
            )`
          }}></div>
        </div>

        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-teal-300 rounded-full opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.5, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut"
            }}
          />
        ))}

        {/* Abstract Shapes */}
        <motion.div
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 40,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-20 right-20 w-64 h-64 border-2 border-teal-400 border-opacity-20 rounded-full"
        />
        <motion.div
          animate={{
            rotate: [360, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 35,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-32 left-32 w-48 h-48 border-2 border-cyan-400 border-opacity-20 rounded-full"
        />
      </div>

      {/* Left Side - Logo and Title */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center px-12 relative z-10"
      >
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="mb-8"
          >
            <img
              src="/images/ValueMomentum_logo.png"
              alt="ValueMomentum Logo"
              className="h-20 w-auto object-contain mx-auto drop-shadow-2xl"
            />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight drop-shadow-lg"
          >
            Employee Offer
          </motion.h1>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-4xl md:text-5xl font-bold text-white mb-2 leading-tight drop-shadow-lg"
          >
            Management Portal
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-teal-200 text-lg mt-6 font-light"
          >
            Streamline your recruitment process
          </motion.p>
        </motion.div>
      </motion.div>

      {/* Right Side - Login Form */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-12 relative z-10"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full max-w-md"
        >
          {/* Transparent Login Container */}
          <div className="bg-white bg-opacity-10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 sm:p-10 border border-white border-opacity-20 relative overflow-hidden">
            {/* Shimmer Effect */}
            <div className="absolute inset-0 opacity-20">
              <motion.div
                animate={{
                  x: ['-100%', '200%'],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent w-1/2 h-full"
              />
            </div>

            {/* Mobile Logo - Only visible on small screens */}
            <div className="lg:hidden mb-8 text-center relative z-10">
              <img
                src="/images/ValueMomentum_logo.png"
                alt="ValueMomentum Logo"
                className="h-16 w-auto object-contain mx-auto mb-4 drop-shadow-lg"
              />
              <h2 className="text-2xl font-bold text-white drop-shadow-lg">Employee Offer Management Portal</h2>
            </div>

            {/* Login Heading */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-8 relative z-10"
            >
              <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-md">Welcome Back</h2>
              <p className="text-teal-100">Please login to your account</p>
            </motion.div>

            {/* Login Form */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              onSubmit={handleSubmit}
              className="space-y-6 relative z-10"
            >
              {/* Username/Email Field */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Username / Email
                </label>
                <div className="relative">
                  <FiUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-opacity-70 w-5 h-5 z-10" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder="Enter your username or email"
                    className="w-full pl-12 pr-4 py-3 bg-white bg-opacity-20 border-2 border-white border-opacity-30 rounded-xl text-white placeholder-white placeholder-opacity-60 focus:outline-none focus:border-white focus:bg-opacity-30 transition-all duration-300 backdrop-blur-sm"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Password
                </label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-opacity-70 w-5 h-5 z-10" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                    className="w-full pl-12 pr-4 py-3 bg-white bg-opacity-20 border-2 border-white border-opacity-30 rounded-xl text-white placeholder-white placeholder-opacity-60 focus:outline-none focus:border-white focus:bg-opacity-30 transition-all duration-300 backdrop-blur-sm"
                  />
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="flex justify-end">
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  href="#"
                  className="text-sm text-white text-opacity-90 hover:text-white font-medium transition-colors"
                >
                  Forgot Password?
                </motion.a>
              </div>

              {/* Login Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full bg-white text-teal-700 py-3 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-teal-700 border-t-transparent rounded-full animate-spin"></div>
                    <span>Logging in...</span>
                  </>
                ) : (
                  <span>LOGIN</span>
                )}
              </motion.button>
            </motion.form>

            {/* Test Credentials */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-8 pt-6 border-t border-white border-opacity-20 relative z-10"
            >
              <p className="text-xs text-white text-opacity-80 text-center mb-3">
                <strong>Test Credentials:</strong>
              </p>
              <div className="space-y-2">
                {[
                  { user: 'tag_user1', pass: 'password123' },
                  { user: 'tag_user2', pass: 'password123' },
                  { user: 'tag_user3', pass: 'password123' },
                ].map((cred, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ x: 5 }}
                    type="button"
                    onClick={() => {
                      setUsername(cred.user)
                      setPassword(cred.pass)
                    }}
                    className="w-full text-left text-xs text-white text-opacity-90 hover:text-white p-2 rounded-lg hover:bg-white hover:bg-opacity-10 transition-all"
                  >
                    {cred.user} / {cred.pass}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default Login
