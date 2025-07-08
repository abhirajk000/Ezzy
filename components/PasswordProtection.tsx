'use client'

import { useState, useEffect, useCallback } from 'react'
import { Lock, Eye, EyeOff } from 'lucide-react'

interface PasswordProtectionProps {
  children: React.ReactNode
}

export default function PasswordProtection({ children }: PasswordProtectionProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [lastActivity, setLastActivity] = useState(Date.now())
  const [timeRemaining, setTimeRemaining] = useState(30 * 60) // 30 minutes in seconds

  // Auto-logout functionality
  const handleActivity = useCallback(() => {
    setLastActivity(Date.now())
    setTimeRemaining(30 * 60) // Reset to 30 minutes
  }, [])

  const handleLogout = useCallback(() => {
    setIsAuthenticated(false)
    localStorage.removeItem('ezzy-authenticated')
    setPassword('')
    setLastActivity(Date.now())
    setTimeRemaining(30 * 60)
  }, [])

  // Check if user is already authenticated on mount
  useEffect(() => {
    const authStatus = localStorage.getItem('ezzy-authenticated')
    const lastActivityTime = localStorage.getItem('ezzy-last-activity')
    
    if (authStatus === 'true' && lastActivityTime) {
      const timeSinceLastActivity = Date.now() - parseInt(lastActivityTime)
      const thirtyMinutes = 30 * 60 * 1000 // 30 minutes in milliseconds
      
      if (timeSinceLastActivity < thirtyMinutes) {
        setIsAuthenticated(true)
        setLastActivity(parseInt(lastActivityTime))
        setTimeRemaining(Math.max(0, Math.floor((thirtyMinutes - timeSinceLastActivity) / 1000)))
      } else {
        // Session expired
        localStorage.removeItem('ezzy-authenticated')
        localStorage.removeItem('ezzy-last-activity')
      }
    }
  }, [])

  // Activity tracking
  useEffect(() => {
    if (!isAuthenticated) return

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true)
    })

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true)
      })
    }
  }, [isAuthenticated, handleActivity])

  // Timer countdown and auto-logout
  useEffect(() => {
    if (!isAuthenticated) return

    const interval = setInterval(() => {
      const now = Date.now()
      const timeSinceLastActivity = now - lastActivity
      const thirtyMinutes = 30 * 60 * 1000 // 30 minutes in milliseconds
      
      if (timeSinceLastActivity >= thirtyMinutes) {
        handleLogout()
        return
      }
      
      const remaining = Math.max(0, Math.floor((thirtyMinutes - timeSinceLastActivity) / 1000))
      setTimeRemaining(remaining)
      
      // Update localStorage with current activity time
      localStorage.setItem('ezzy-last-activity', lastActivity.toString())
    }, 1000)

    return () => clearInterval(interval)
  }, [isAuthenticated, lastActivity, handleLogout])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Simple password check - you can change this password
    const correctPassword = 'ezzy123#' // Change this to your desired password

    // Simulate a small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500))

    if (password === correctPassword) {
      setIsAuthenticated(true)
      const now = Date.now()
      setLastActivity(now)
      setTimeRemaining(30 * 60)
      localStorage.setItem('ezzy-authenticated', 'true')
      localStorage.setItem('ezzy-last-activity', now.toString())
    } else {
      setError('Incorrect password. Please try again.')
      setPassword('')
    }
    setIsLoading(false)
  }

  // Format time remaining for display
  const formatTimeRemaining = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  if (isAuthenticated) {
    return (
      <div>
        {/* Logout button */}
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={handleLogout}
            className="bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white px-4 py-2 rounded-lg backdrop-blur-sm border border-slate-600/50 transition-all duration-300 text-sm font-medium shadow-lg"
          >
            Logout
          </button>
        </div>
        {children}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/30 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                <Lock className="w-6 h-6 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2 font-orbitron">
              Access Required
            </h1>
            <p className="text-slate-300 text-sm">
              Please enter the password to access Ezzy
            </p>
          </div>

          {/* Password Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full p-4 bg-slate-900/60 border border-slate-600/50 rounded-xl text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all duration-300 pr-12"
                disabled={isLoading}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                <p className="text-red-300 text-sm font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={!password.trim() || isLoading}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 disabled:cursor-not-allowed shadow-lg hover:shadow-indigo-500/25 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Access Ezzy</span>
                </>
              )}
            </button>
          </form>

          {/* Hint */}
          <div className="mt-6 text-center">
           
          </div>
        </div>
      </div>
    </div>
  )
}